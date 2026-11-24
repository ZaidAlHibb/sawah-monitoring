var stage=$("stage"),ren,scene,cam,gate,mq,srcW,tgt,clock,wDown=[],wDrain=[],labels=[],parts=[],showTags=true;
var th=-0.8,ph_=1.05,rad=13,gy=3.3,gOpen=3.3,gClosed=2.75,gateClosed=false,pending=null,phOk=true,coOk=true,baseMsg="";
var show={c:true,d:false};
function tag(t,x,y,z,k){k=k||"c";var d=document.createElement("div");d.className="tag "+k;d.textContent=t;stage.appendChild(d);labels.push({d:d,k:k,v:new THREE.Vector3(x,y,z)})}
try{
  ren=new THREE.WebGLRenderer({antialias:true,alpha:true});ren.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(42,1,0.1,100);
  tgt=new THREE.Vector3(0,2.3,0);clock=new THREE.Clock();stage.appendChild(ren.domElement);
  scene.add(new THREE.AmbientLight(0xffffff,0.75));var sun=new THREE.DirectionalLight(0xffffff,0.7);sun.position.set(6,12,8);scene.add(sun);scene.add(new THREE.HemisphereLight(0xdff3ff,0x6a8a6a,0.35));
  var cv=document.createElement("canvas");cv.width=cv.height=128;var cx2=cv.getContext("2d"),gr=cx2.createRadialGradient(64,64,6,64,64,64);gr.addColorStop(0,"rgba(20,50,35,.38)");gr.addColorStop(1,"rgba(20,50,35,0)");cx2.fillStyle=gr;cx2.fillRect(0,0,128,128);
  var sh=new THREE.Mesh(new THREE.PlaneGeometry(9,10),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=-0.02;scene.add(sh);
  var M=function(c,o){return new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}))};
  var box=function(w,h,d,c,x,y,z,o){var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,o));m.position.set(x,y,z);scene.add(m);return m};
  var cyl=function(r,h,c,x,y,z){var m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),M(c));m.position.set(x,y,z);scene.add(m);return m};
  var acr=function(w,h,d,x,y,z){var g=new THREE.BoxGeometry(w,h,d),m=new THREE.Mesh(g,M(0xbfd8e6,{transparent:true,opacity:0.2,depthWrite:false}));m.position.set(x,y,z);scene.add(m);var e=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:0x6f8c99}));e.position.copy(m.position);scene.add(e)};
  var wb=function(w,h,d,x,y,z,c,l){var m=box(w,h,d,c,x,y,z,{transparent:true,opacity:0.9,depthWrite:false});if(l)l.push(m);return m};
  /* bak dasar 35 x 50 x 10,5 cm (1 satuan = 10 cm), berisi air kali besar */
  acr(3.5,1.05,5,0,0.525,0);
  wb(3.3,0.4,4.8,0,0.22,0,0x2f86b0).material.opacity=0.45;
  wb(0.5,0.3,4.6,1.45,0.2,0,0x2f86b0,wDrain);
  srcW=wb(0.5,0.1,4.6,-1.45,1.0,0,0x1b3fa8);
  box(0.9,0.18,0.8,0x15191c,-0.3,0.12,-1.8);
  box(0.3,0.25,0.3,0x15191c,1.45,0.2,2.2);
  /* tiga petak sawah bertingkat */
  var ty=[1.45,1.8,2.15],cx=[-0.72,0.03,0.78];
  for(var s=0;s<3;s++){
    acr(0.75,0.35,4.5,cx[s],ty[s]-0.175,0);
    box(0.6,0.06,4.3,0x4a3426,cx[s],ty[s]+0.03,0);
    wb(0.6,0.03,4.3,cx[s],ty[s]+0.08,0,0x2f86b0,wDown);
    box(0.14,0.1,0.14,0x15191c,cx[s]-0.2,ty[s]+0.12,2.05);
    for(var k=0;k<12;k++)cyl(0.015,0.16,0x7fae4a,cx[s]+((k%3)-1)*0.15,ty[s]+0.14,-2+k*0.33);
    var h=ty[s]-0.35-1.05;if(h>0.02){cyl(0.07,h,0xf2f2f2,cx[s],1.05+h/2,-1.6);cyl(0.07,h,0xf2f2f2,cx[s],1.05+h/2,1.6)}
  }
  /* saluran irigasi di atas, kaki paralon, pipa naik dari pompa */
  acr(0.6,0.5,4.3,1.45,2.75,-0.15);
  wb(0.5,0.25,2.3,1.45,2.63,0.85,0x2f86b0);
  wb(0.5,0.25,1.85,1.45,2.63,-1.225,0x2f86b0,wDown);
  cyl(0.12,1.45,0xf2f2f2,1.45,1.775,-1.4);cyl(0.12,1.45,0xf2f2f2,1.45,1.775,1.2);
  cyl(0.05,2.4,0x9fb4be,1.45,1.5,2.2);
  /* pintu irigasi, drat, motor stepper, sensor */
  gate=box(0.56,0.7,0.06,0xcfe6f2,1.45,gOpen,-0.3,{transparent:true,opacity:0.75});
  cyl(0.035,1.9,0x9a9a9a,1.45,3.8,-0.3);
  cyl(0.07,1.7,0xf2f2f2,1.15,3.8,-0.3);cyl(0.07,1.7,0xf2f2f2,1.75,3.8,-0.3);
  box(1.0,0.07,0.3,0xcfe6f2,1.45,4.65,-0.3,{transparent:true,opacity:0.7});
  box(0.4,0.4,0.4,0x16191b,1.45,4.9,-0.3);
  mq=new THREE.Mesh(new THREE.SphereGeometry(0.1,16,16),M(0xffffff));mq.position.set(1.95,4.78,-0.3);scene.add(mq);
  cyl(0.04,1.1,0x222a2e,1.45,3.0,1.0);
  tag("Sensor pH",1.45,3.7,1.0);tag("Pintu irigasi",2.1,3.2,-0.3);tag("Motor stepper",0.8,5.15,-0.3);tag("Sensor MQ7",2.4,4.95,-0.3);
  tag("Petak sawah (rumput buatan)",0.03,2.6,0.9);tag("Sumber air dari bukit/pabrik",-1.45,1.4,-1.7);
  tag("Aliran ke kali besar",1.6,0.6,-3.2);tag("Panel ESP32 + driver",-0.3,0.5,-1.8);
  tag("35 cm",0,0.05,2.9,"d");tag("50 cm",-2.2,0.05,0,"d");tag("10,5 cm",2.1,0.5,2.6,"d");tag("5,5 cm",-1.45,1.25,2.7,"d");
  /* partikel air: dipompa naik, lalu ke sawah (pintu terbuka) atau ke kali besar (pintu tertutup) */
  var v3=function(x,y,z){return new THREE.Vector3(x,y,z)};
  var mk=function(a){var L=[],T=0;for(var i=1;i<a.length;i++){var d=a[i].distanceTo(a[i-1]);L.push(d);T+=d}return{p:a,L:L,T:T}};
  var UP=mk([v3(1.45,0.4,2.2),v3(1.45,2.66,2.2),v3(1.45,2.66,-0.3)]),
      DR=mk([v3(1.45,2.66,-0.3),v3(1.45,0.45,-0.3),v3(1.45,0.35,-3.4)]),
      FD=mk([v3(1.45,2.66,-0.3),v3(0.78,2.3,-0.3),v3(0.03,1.95,-0.3),v3(-0.72,1.6,-0.3),v3(-1.45,1.15,-0.3)]);
  var at=function(P,s,o){var i=0;while(i<P.L.length-1&&s>P.L[i]){s-=P.L[i];i++}return o.copy(P.p[i]).lerp(P.p[i+1],Math.min(s/P.L[i],1))};
  var sg=new THREE.SphereGeometry(0.06,8,8);
  for(var i=0;i<56;i++){var pm=new THREE.Mesh(sg,M(0x2f86b0));scene.add(pm);parts.push({m:pm,P:UP,s:Math.random()*UP.T})}
  var tt=0;
  window.stepParts=function(dt){tt+=dt;
    parts.forEach(function(p){p.s+=dt*1.5;
      if(p.s>=p.P.T){if(p.P===UP)p.P=gateClosed?DR:FD;else{p.P=UP;p.m.material.color.set(phOk?0x2f86b0:0x9a5b1d)}p.s=0}
      at(p.P,p.s,p.m.position);var rem=p.P.T-p.s;p.m.scale.setScalar(p.P===UP?1:Math.max(0.01,Math.min(1,rem/0.7)))});
    gy+=((gateClosed?gClosed:gOpen)-gy)*0.06;gate.position.y=gy;
    wDown.forEach(function(x){x.visible=!gateClosed});
    wDrain.forEach(function(x){x.material.opacity=gateClosed?0.95:0.45});
    srcW.material.color.set(phOk?0x1b3fa8:0x7a4a1a);
    mq.material.color.set(coOk?0xffffff:0xe0452b);mq.scale.setScalar(coOk?1:1+0.3*Math.sin(tt*6))};
}catch(e){ren=null;stage.textContent="Browser ini tidak mendukung WebGL, jadi model 3D tidak bisa ditampilkan."}
var G={th:-0.8,ph:1.05,rad:13,t:new THREE.Vector3(0,2.3,0)},HOME=new THREE.Vector3(0,2.3,0);
function size(){if(!ren)return;var w=stage.clientWidth,h=stage.clientHeight;ren.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix()}
if(window.ResizeObserver)new ResizeObserver(size).observe(stage);else window.addEventListener("resize",size);size();
var ptrs={};
stage.addEventListener("pointerdown",function(e){stage.setPointerCapture(e.pointerId);ptrs[e.pointerId]={x:e.clientX,y:e.clientY}});
stage.addEventListener("pointerup",function(e){delete ptrs[e.pointerId]});
stage.addEventListener("pointercancel",function(e){delete ptrs[e.pointerId]});
stage.addEventListener("pointermove",function(e){var p=ptrs[e.pointerId];if(!p)return;var ids=Object.keys(ptrs);
  if(ids.length===1){G.th-=(e.clientX-p.x)*0.008;G.ph=Math.min(1.5,Math.max(0.2,G.ph-(e.clientY-p.y)*0.008))}
  else{var o=ptrs[ids[0]==e.pointerId?ids[1]:ids[0]],d0=Math.hypot(p.x-o.x,p.y-o.y),d1=Math.hypot(e.clientX-o.x,e.clientY-o.y);G.rad=Math.min(30,Math.max(4,G.rad*d0/Math.max(d1,1)))}
  p.x=e.clientX;p.y=e.clientY});
stage.addEventListener("wheel",function(e){if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();G.rad=Math.min(30,Math.max(4,G.rad+e.deltaY*0.01))},{passive:false});
function frame(){
  if(!ren)return;
  window.stepParts(Math.min(clock.getDelta(),0.05));
  var k=0.12;th+=(G.th-th)*k;ph_+=(G.ph-ph_)*k;rad+=(G.rad-rad)*k;tgt.lerp(G.t,k);
  cam.position.set(tgt.x+rad*Math.sin(ph_)*Math.sin(th),tgt.y+rad*Math.cos(ph_),tgt.z+rad*Math.sin(ph_)*Math.cos(th));cam.lookAt(tgt);
  ren.render(scene,cam);
  var w=stage.clientWidth,h=stage.clientHeight;
  labels.forEach(function(l){var p=l.v.clone().project(cam);l.d.style.display=(p.z<1&&show[l.k])?"block":"none";
    l.d.style.transform="translate("+((p.x*0.5+0.5)*w-l.d.offsetWidth/2)+"px,"+((-p.y*0.5+0.5)*h-l.d.offsetHeight/2)+"px)"});
  requestAnimationFrame(frame)}
var VW={iso:[-0.8,1.05,13],depan:[0,1.3,13],atas:[-0.8,0.3,14]};
function view(n){var v=VW[n];G.th=v[0];G.ph=v[1];G.rad=v[2];G.t.copy(HOME);pickC(-1)}
document.querySelectorAll("[data-v]").forEach(function(b){b.onclick=function(){view(b.dataset.v);document.querySelectorAll("[data-v]").forEach(function(x){x.setAttribute("aria-pressed",x===b)})}});
$("zi").onclick=function(){G.rad=Math.max(4,G.rad-2)};$("zo").onclick=function(){G.rad=Math.min(30,G.rad+2)};$("rs").onclick=function(){view("iso");document.querySelectorAll("[data-v]").forEach(function(x){x.setAttribute("aria-pressed",x.dataset.v==="iso")})};
$("lb").onchange=function(){show.c=this.checked};$("dm").onchange=function(){show.d=this.checked};
/* daftar komponen: klik untuk memfokuskan kamera */
var COMP=[["Sensor pH","Mengukur keasaman air irigasi. Di luar pH 6 sampai 9 dianggap limbah cair.",[1.45,3.2,1],6.5],
["Sensor MQ7","Mengukur gas CO di udara. Di atas 5 ppm dianggap pencemaran udara; bola menyala merah.",[1.95,4.78,-0.3],5.5],
["Motor stepper","Menggerakkan drat pintu irigasi lewat driver ULN2003 yang dikendalikan ESP32.",[1.45,4.9,-0.3],5.5],
["Pintu irigasi","Turun menutup saat pH di luar 6 sampai 9, sehingga air dialihkan ke kali besar.",[1.45,3.0,-0.3],6.5],
["Petak sawah","Tiga petak bertingkat berisi rumput buatan, dialiri air dari saluran atas.",[0.03,1.9,0],8],
["Panel ESP32","Panel mikrokontroler ESP32 dan driver motor di dasar prototipe.",[-0.3,0.3,-1.8],6.5]];
var cl=$("comp");COMP.forEach(function(c,i){var li=document.createElement("li"),b=document.createElement("button");b.type="button";b.textContent=c[0];b.setAttribute("aria-pressed","false");b.onclick=function(){pickC(i)};li.appendChild(b);cl.appendChild(li)});
function pickC(i){cl.querySelectorAll("button").forEach(function(b,j){b.setAttribute("aria-pressed",j===i)});
  if(i<0){$("cdesc").textContent="Pilih komponen untuk memfokuskan kamera. Geser mendatar untuk memutar, Ctrl + scroll atau cubit dua jari untuk zoom.";return}
  var c=COMP[i];G.t.set(c[2][0],c[2][1],c[2][2]);G.rad=c[3];G.th=-0.7;G.ph=1.2;$("cdesc").textContent=c[1]}
SAWAH.on(function(S){gateClosed=S.gateClosed;phOk=S.phOk;coOk=S.coOk;
  var ok=S.phOk&&S.coOk,e=$("st");e.textContent=S.pending?"Pintu bergerak...":S.gateClosed?"Pintu tertutup, air dialihkan":ok?"Aman, pintu terbuka":"CO tinggi";e.className="chip"+(S.gateClosed?" warn":ok?"":" bad")});
frame();


/* kunci simulasi: switch + kata sandi */
(function(){var lk=$("lk"),fm=$("lkf"),pw=$("pw"),er=$("lke");
  SAWAH.on(function(S){lk.checked=!!S.locked;$("lkt").textContent=S.locked?"Terkunci":"Terbuka";$("lko").textContent=S.locked?"Buka kunci":"Kunci"});
  lk.addEventListener("click",function(e){e.preventDefault();fm.hidden=false;pw.value="";er.textContent="";pw.focus()});
  $("lkc").onclick=function(){fm.hidden=true};
  fm.onsubmit=function(e){e.preventDefault();
    SAWAH.setLock(!SAWAH.S.locked,pw.value).then(function(){fm.hidden=true;pw.value=""}).catch(function(){er.textContent="Kata sandi salah.";pw.select()})}})();
