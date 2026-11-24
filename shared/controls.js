function mountControls(el){
  el.innerHTML='<h2>Atur nilai sensor</h2>'+
  '<p>Set point: pH 6 sampai 9 dan CO di bawah 5 ppm. Nilai tersinkron dengan halaman lain yang terbuka di browser yang sama.</p>'+
  '<label for="ph">pH air irigasi: <span id="phv"></span></label><input id="ph" type="range" min="4" max="14" step="0.01">'+
  '<label for="co">Gas CO: <span id="cov"></span> ppm</label><input id="co" type="range" min="0" max="1000" step="1" aria-describedby="coh">'+
  '<small id="coh">Skala slider CO tidak linear supaya nilai sekitar 5 ppm mudah diatur.</small>'+
  '<div class="row"><button id="aman" type="button">Kondisi aman</button><button id="limbah" type="button">Limbah pabrik (pH 4,1, CO 307,11)</button><button id="gas" type="button">Hanya gas CO</button></div>'+
  '<label class="ck"><input type="checkbox" id="dl"> Tunda 25,8 detik seperti hasil uji jurnal</label>'+
  '<div class="msg"><span id="msg" aria-live="polite"></span> <span id="cd"></span></div><small id="raw"></small>';
  var phE=$("ph"),coE=$("co"),dl=$("dl");
  phE.oninput=function(){SAWAH.set({ph:parseFloat(phE.value)})};
  coE.oninput=function(){SAWAH.set({co:Math.pow(parseFloat(coE.value),2)/1000})};
  dl.onchange=function(){SAWAH.set({delay:dl.checked})};
  $("aman").onclick=function(){SAWAH.set({ph:6.98,co:0.32})};
  $("limbah").onclick=function(){SAWAH.set({ph:4.1,co:307.11})};
  $("gas").onclick=function(){SAWAH.set({ph:6.98,co:307.11})};
  SAWAH.on(function(S){
    if(document.activeElement!==phE)phE.value=S.ph;
    if(document.activeElement!==coE)coE.value=Math.sqrt(S.co*1000);
    [phE,coE,dl,$("aman"),$("limbah"),$("gas")].forEach(function(e){e.disabled=!!S.locked});dl.checked=S.delay;$("phv").textContent=f(S.ph,2);$("cov").textContent=f(S.co,2);
    var m=[];if(!S.phOk)m.push("pH di luar 6 sampai 9: terdeteksi limbah cair, pintu air harus menutup dan air dialihkan ke kali besar.");
    if(!S.coOk)m.push("CO di atas 5 ppm: terdeteksi pencemaran udara.");if(!m.length)m.push("Air dan udara dalam batas aman, pintu irigasi terbuka.");
    if(S.locked)m.unshift("Simulasi terkunci, nilai tidak bisa diubah.");$("msg").textContent=m.join(" ");
    var V=(28.193-S.ph)/4.8192,r=Math.pow(Math.max(S.co,0.01)/98.93,-1/1.534);
    $("raw").textContent="Pembacaan mentah: tegangan sensor pH "+f(V,2)+" V (pH = 28,193 − 4,8192 × V). Rs/Ro MQ7 "+f(r,2)+" (CO = 98,93 × (Rs/Ro)^−1,534)."});
  setInterval(function(){var p=SAWAH.S.pending;$("cd").textContent=p?"Motor stepper bekerja dalam "+f(Math.max(0,(p.at-Date.now())/1000),1)+" detik.":""},100);
}
