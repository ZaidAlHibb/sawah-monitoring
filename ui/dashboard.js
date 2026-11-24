var hp=[],hc=[],ev=[],prev=null,cur="home",tab="today";
for(var i=0;i<60;i++){hp.push(SAWAH.S.ph);hc.push(SAWAH.S.co)}
var wide=window.matchMedia("(min-width:1120px)");
var h=new Date().getHours();
$("gr").textContent="Selamat "+(h<11?"Pagi":h<15?"Siang":h<18?"Sore":"Malam")+",";

/* navigasi bawah (4 tab, 3 layar) */
var NAV=[["home","Beranda","i-home"],["sensor","Sensor","i-sensor"],["care","Aktivitas","i-list"],["sistem","Sistem","i-gear"]];
document.querySelectorAll(".bar").forEach(function(b){b.innerHTML=NAV.map(function(n){return '<button type="button" data-go="'+n[0]+'"><svg class="ic" aria-hidden="true"><use href="#'+n[2]+'"/></svg>'+n[1]+'</button>'}).join("")});
function key(s){return s==="care"?(tab==="sistem"?"sistem":"care"):s}
function nav(){document.querySelectorAll(".bar").forEach(function(bar){
  var k=key(wide.matches?bar.closest(".screen").dataset.own:cur);
  bar.querySelectorAll("button").forEach(function(b){if(b.dataset.go===k)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")})})}
function setTab(t){tab=t;
  document.querySelectorAll("[data-tab]").forEach(function(b){b.setAttribute("aria-selected",b.dataset.tab===t)});
  ["today","alert","sistem"].forEach(function(k){$("p-"+k).hidden=k!==t});
  $("guide").hidden=t==="sistem";nav()}
function go(n){
  if(n==="sistem"){cur="care";setTab("sistem")}
  else{cur=n;if(n==="care"&&tab==="sistem")setTab("today")}
  document.querySelector(".app").dataset.screen=cur;nav();charts();
  if(!wide.matches)window.scrollTo(0,0)}
document.addEventListener("click",function(e){
  var g=e.target.closest("[data-go]"),t=e.target.closest("[data-tab]");
  if(e.target.closest("[data-alert]")){go("care");setTab("alert")}
  else if(g)go(g.dataset.go);else if(t)setTab(t.dataset.tab)});
$("bad").onclick=function(){SAWAH.set({ph:4.1,co:307.11})};
$("good").onclick=function(){SAWAH.set({ph:6.98,co:0.32})};
["Sensor pH V2 + MQ7","ESP32 sensor node","NRF24L01 2,4 GHz","ESP32 gateway","Internet (TCP/IP)","Blynk cloud","HP dan laptop"].forEach(function(n,i,a){$("chain").insertAdjacentHTML("beforeend",'<span style="animation-delay:'+(i*0.45)+'s">'+n+'</span>'+(i<a.length-1?"<i>›</i>":""))});

/* gauge dan grafik */
function gsvg(id,mx){var d="M10 60A45 45 0 0 1 100 60";return '<svg viewBox="0 0 110 70" role="img" aria-label="Pengukur '+(id==="gp"?"pH":"CO")+'"><path class="gb" pathLength="100" d="'+d+'"/><path id="'+id+'v" class="gv" pathLength="100" stroke-dasharray="0 100" d="'+d+'"/><text id="'+id+'t" x="55" y="55" text-anchor="middle" class="gt"></text><text x="10" y="69" class="gl">0</text><text x="100" y="69" text-anchor="end" class="gl">'+mx+'</text></svg>'}
$("g1").innerHTML=gsvg("gp",14);$("g2").innerHTML=gsvg("gc",1000);
function gauge(id,v,mx,bad){var p=$(id+"v");p.setAttribute("stroke-dasharray",Math.min(100,v/mx*100)+" 100");p.style.stroke=bad?"var(--bad)":"";$(id+"t").textContent=f(v,2)}
function chart(id,data,mn,mx,lines){
  var cv=$(id),d=window.devicePixelRatio||1,w=cv.clientWidth,hh=cv.clientHeight;if(!w)return;
  if(cv.width!==Math.round(w*d)){cv.width=Math.round(w*d);cv.height=Math.round(hh*d)}
  var c=cv.getContext("2d"),cs=getComputedStyle(document.documentElement),Y=function(v){return hh-8-(v-mn)/(mx-mn)*(hh-16)};
  c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,hh);
  c.lineWidth=1;c.strokeStyle=cs.getPropertyValue("--bad");c.setLineDash([4,3]);
  lines.forEach(function(l){c.beginPath();c.moveTo(0,Y(l));c.lineTo(w,Y(l));c.stroke()});
  c.setLineDash([]);c.lineWidth=2.2;c.lineJoin="round";c.strokeStyle=cs.getPropertyValue("--g2");c.beginPath();
  data.forEach(function(v,i){var x=i/(data.length-1)*w;if(i)c.lineTo(x,Y(v));else c.moveTo(x,Y(v))});c.stroke();
  c.fillStyle=cs.getPropertyValue("--mut");c.font="11px sans-serif";c.fillText(f(mx,0),2,10);c.fillText(f(mn,0),2,hh-2)}
function charts(){chart("c1",hp,4,14,[6,9]);chart("c2",hc,0,Math.max(10,Math.max.apply(null,hc)*1.15),[5])}

/* tampilan mengikuti status bersama */
function chip(id,ok,a,b){var e=$(id);e.textContent=ok?a:b;e.className="chip"+(ok?"":" bad")}
function row(id,ok){$("k-"+id).className="ckc"+(ok?"":" bad")}
function stamp(){var d=new Date(),z=function(n){return("0"+n).slice(-2)};return z(d.getHours())+":"+z(d.getMinutes())+":"+z(d.getSeconds())}
function log(x){ev.unshift({t:stamp(),x:x});if(ev.length>30)ev.pop();drawEv()}
function drawEv(){$("evl").innerHTML=ev.length?ev.map(function(e){return '<li class="rc glass"><span class="ico"><svg class="ic"><use href="#i-bell"/></svg></span><span class="grow"><b>'+e.x+'</b><small class="sub">'+e.t+'</small></span></li>'}).join(""):'<li class="mut">Belum ada peringatan. Coba simulasi limbah pabrik.</li>'}
function attn(){var S=SAWAH.S,p=S.pending,t,s;
  if(p){t=p.t?"Pintu akan menutup":"Pintu akan terbuka";s="Motor stepper bekerja dalam "+f(Math.max(0,(p.at-Date.now())/1000),1)+" detik"}
  else if(S.gateClosed){t="Pintu irigasi tertutup";s="Air tercemar dialihkan ke kali besar"}
  else if(!S.coOk){t="Pencemaran udara terdeteksi";s="CO "+f(S.co,2)+" ppm, di atas 5 ppm"}
  else{t="Semua normal";s="Tidak ada tindakan yang diperlukan"}
  $("at-t").textContent=t;$("at-s").textContent=s;
  $("pend").textContent=p?"Motor stepper bekerja dalam "+f(Math.max(0,(p.at-Date.now())/1000),1)+" detik.":""}
SAWAH.on(function(S){
  $("bad").disabled=$("good").disabled=!!S.locked;
  var ok=S.phOk&&S.coOk,gt=S.gateClosed?"Tertutup":"Terbuka";
  gauge("gp",S.ph,14,!S.phOk);gauge("gc",S.co,1000,!S.coOk);
  chip("c-all",ok,"Aman","Tercemar");chip("c-all2",ok,"Aman","Tercemar");chip("c-ph",S.phOk,"Aman","Tercemar");chip("c-co",S.coOk,"Aman","Tercemar");
  $("c-gt").textContent=gt;$("c-gt").className="chip"+(S.gateClosed?" warn":"");
  $("h-ph").textContent=f(S.ph,2);$("h-co").textContent=f(S.co,2)+" ppm";$("h-gt").textContent=gt;
  $("s-ph").textContent=f(S.ph,2);$("s-co").textContent=f(S.co,2);$("s-gt").textContent=gt;
  $("rs-ph").textContent="pH "+f(S.ph,2)+" · "+(S.phOk?"Aman":"Di luar 6 sampai 9");
  $("rs-co").textContent=f(S.co,2)+" ppm · "+(S.coOk?"Aman":"Di atas 5 ppm");
  $("rs-gt").textContent=gt+(S.gateClosed?" · air dialihkan":"");
  row("ph",S.phOk);row("co",S.coOk);row("gt",!S.gateClosed);
  if(prev){
    if(prev.phOk!==S.phOk)log(S.phOk?"pH kembali normal ("+f(S.ph,2)+")":"pH "+f(S.ph,2)+": limbah cair terdeteksi");
    if(prev.coOk!==S.coOk)log(S.coOk?"CO kembali normal":"CO "+f(S.co,2)+" ppm: pencemaran udara");
    if(prev.gateClosed!==S.gateClosed)log(S.gateClosed?"Pintu irigasi menutup, air dialihkan ke kali besar":"Pintu irigasi terbuka kembali")}
  prev={phOk:S.phOk,coOk:S.coOk,gateClosed:S.gateClosed};
  attn();charts()});
drawEv();setTab("today");nav();
setInterval(function(){var S=SAWAH.S;
  hp.push(Math.min(14,Math.max(4,S.ph+(Math.random()-0.5)*0.04)));hc.push(Math.max(0,S.co*(1+(Math.random()-0.5)*0.03)+Math.random()*0.02));
  if(hp.length>60){hp.shift();hc.shift()}charts()},1000);
setInterval(attn,200);
window.addEventListener("resize",function(){nav();charts()});
