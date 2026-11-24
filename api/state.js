/* Status global simulasi sawah. Disimpan di Upstash Redis (REST), logika pintu dihitung di server
   supaya semua perangkat melihat hasil dan waktu tunda yang sama. */
var URL_=(process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL||"").trim().replace(/\/+$/,""),
    TOK=(process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN||"").trim(),KEY="sawah-state-v1",DELAY=25800;
var DEF={ph:6.98,co:0.32,delay:false,gateClosed:false,pending:null,locked:false};
function redis(cmd){return fetch(URL_,{method:"POST",headers:{Authorization:"Bearer "+TOK},body:JSON.stringify(cmd)}).then(function(r){return r.text().then(function(t){var j;try{j=JSON.parse(t)}catch(e){throw new Error("Balasan Redis bukan JSON (HTTP "+r.status+"): "+t.slice(0,80))}if(j.error)throw new Error("Redis: "+j.error);return j})})}
function logic(S,now){var want=!(S.ph>=6&&S.ph<=9);
  if(S.pending&&(S.pending.t!==want||!S.delay)){if(!S.delay&&S.pending.t===want)S.gateClosed=want;S.pending=null}
  if(!S.pending&&S.gateClosed!==want){if(S.delay)S.pending={t:want,at:now+DELAY};else S.gateClosed=want}}
function settle(S,now){if(S.pending&&now>=S.pending.at){S.gateClosed=S.pending.t;S.pending=null;return true}return false}
function num(v,a,b){v=parseFloat(v);return isFinite(v)?Math.min(b,Math.max(a,v)):null}
module.exports=async function(req,res){
  res.setHeader("Content-Type","application/json");
  if(!URL_||!TOK){res.statusCode=503;return res.end(JSON.stringify({error:"Redis belum terhubung"}))}
  if(/^rediss?:/i.test(URL_)){res.statusCode=500;return res.end(JSON.stringify({error:"URL salah",detail:"Pakai REST URL yang diawali https://, bukan redis://"}))}
  if(!/^https?:\/\//i.test(URL_))URL_="https://"+URL_;
  try{
    var r=await redis(["GET",KEY]),S=Object.assign({},DEF,r.result?JSON.parse(r.result):{}),now=Date.now(),dirty=false;
    if(req.method==="POST"){
      var b=typeof req.body==="string"?JSON.parse(req.body||"{}"):(req.body||{}),x;
      if(typeof b.lock==="boolean"){
        if(b.pw!==(process.env.LOCK_PW||"aal")){res.statusCode=403;return res.end(JSON.stringify({error:"Kata sandi salah"}))}
        S.locked=b.lock;dirty=true;
      }else if(S.locked){res.statusCode=423;return res.end(JSON.stringify(Object.assign({now:now},S)))}
      else{
        if((x=num(b.ph,0,14))!==null)S.ph=x;if((x=num(b.co,0,100000))!==null)S.co=x;if(typeof b.delay==="boolean")S.delay=b.delay;
        logic(S,now);dirty=true;
      }
    }else if(settle(S,now))dirty=true;
    if(dirty)await redis(["SET",KEY,JSON.stringify(S)]);
    res.setHeader("Cache-Control",req.method==="POST"?"no-store":"public, s-maxage=1, stale-while-revalidate=1");
    res.end(JSON.stringify(Object.assign({now:now},S)));
  }catch(e){res.statusCode=500;res.end(JSON.stringify({error:"gagal",detail:String(e&&e.message||e).slice(0,200)}))}
};
