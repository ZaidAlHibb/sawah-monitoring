var $=function(i){return document.getElementById(i)},f=function(n,d){return n.toFixed(d).replace(".",",")};
/* Status bersama: disimpan di localStorage dan disinkronkan antar tab lewat event storage. */
var SAWAH=(function(){
  var K="sawah-state-v1",subs=[],S={ph:6.98,co:0.32,delay:false,gateClosed:false,pending:null,locked:false};
  function derive(){S.phOk=S.ph>=6&&S.ph<=9;S.coOk=S.co<5}
  function save(){try{localStorage.setItem(K,JSON.stringify({ph:S.ph,co:S.co,delay:S.delay,gateClosed:S.gateClosed,pending:S.pending,locked:S.locked}))}catch(e){}}
  function emit(){derive();subs.forEach(function(fn){fn(S)})}
  try{var raw=localStorage.getItem(K);if(raw)Object.assign(S,JSON.parse(raw))}catch(e){}
  derive();
  window.addEventListener("storage",function(e){
    if(e.key!==K||!e.newValue)return;
    try{Object.assign(S,JSON.parse(e.newValue));emit()}catch(x){}});
  function logic(){var want=!S.phOk;
    if(S.pending&&(S.pending.t!==want||!S.delay)){if(!S.delay&&S.pending.t===want)S.gateClosed=want;S.pending=null}
    if(!S.pending&&S.gateClosed!==want){if(S.delay)S.pending={t:want,at:Date.now()+25800};else S.gateClosed=want}}
  setInterval(function(){if(S.pending&&Date.now()>=S.pending.at){S.gateClosed=S.pending.t;S.pending=null;save();emit()}},100);
  /* sinkron global lewat /api/state (Vercel + Redis). Bila API tidak ada, tetap jalan lokal lewat localStorage. */
  var API="/api/state",lastSet=0,seq=0,pt=null;
  function adopt(d){if(!d||typeof d.ph!=="number")return;var off=Date.now()-d.now,pd=d.pending?{t:d.pending.t,at:d.pending.at+off}:null;
    var same=S.ph===d.ph&&S.co===d.co&&S.delay===d.delay&&S.gateClosed===d.gateClosed&&S.locked===!!d.locked&&((S.pending&&pd&&S.pending.t===pd.t&&Math.abs(S.pending.at-pd.at)<800)||(!S.pending&&!pd));
    if(same)return;S.ph=d.ph;S.co=d.co;S.delay=d.delay;S.gateClosed=d.gateClosed;S.locked=!!d.locked;S.pending=pd;save();emit()}
  function pull(){if(document.hidden||Date.now()-lastSet<1500)return;
    fetch(API,{cache:"no-store"}).then(function(r){return r.ok?r.json():null}).then(function(d){if(Date.now()-lastSet>=1500)adopt(d)}).catch(function(){})}
  function push(){if(pt)return;pt=setTimeout(function(){pt=null;var my=seq;
    fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ph:S.ph,co:S.co,delay:S.delay})})
      .then(function(r){return r.ok||r.status===423?r.json():null}).then(function(d){if(my===seq)adopt(d)}).catch(function(){})},200)}
  setInterval(pull,2000);document.addEventListener("visibilitychange",pull);pull();
  function setLock(v,pw){return fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lock:v,pw:pw})}).then(function(r){
      if(r.status===403)throw new Error("pw");if(r.ok)return r.json().then(adopt);throw new Error("net")})
    .catch(function(e){if(e.message==="pw"||pw!=="aal")throw new Error("pw");S.locked=v;save();emit()})}
  return{S:S,setLock:setLock,
    on:function(fn){subs.push(fn);fn(S)},
    set:function(p){if(S.locked)return;["ph","co","delay"].forEach(function(k){if(p[k]!==undefined)S[k]=p[k]});derive();logic();save();emit();lastSet=Date.now();seq++;push()}};
})();
