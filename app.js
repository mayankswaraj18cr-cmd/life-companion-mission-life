"use strict";
// Assumptions (editable): grid EF 0.82 kgCO2/kWh, LPG 2.98 kg/kg, petrol 2.31 kg/L, meat ~2.5 kg/meal
const EF={kwh:.82,lpg:14.2*2.98,pet:2.31,meat:2.5*4.33},INDIA_AVG=170;
const TASKS=[["Switch off standby devices",.8],["Run washing machine off-peak",1.2],["Set AC to 24–26°C",2.0],["Use LED/BEE 5-star appliance",1.0],["Walk/cycle/transit instead of petrol trip",2.3]];
const S=(()=>{try{return JSON.parse(localStorage.getItem("life"))||{}}catch(e){return{}}})();
S.hist=S.hist||[];S.done=S.done||{};S.pts=S.pts||0;S.saved=S.saved||0;
const save=()=>{try{localStorage.setItem("life",JSON.stringify(S))}catch(e){}};
const $=id=>document.getElementById(id);
function go(i){for(let k=0;k<4;k++){$("t"+k).classList.toggle("hide",k!=i);document.querySelectorAll("nav button")[k].classList.toggle("a",k==i)}if(i==2)board()}
function calc(){const v={kwh:+$("kwh").value*EF.kwh,lpg:+$("lpg").value*EF.lpg,pet:+$("pet").value*EF.pet,meat:+$("meat").value*EF.meat};
const t=Object.values(v).reduce((a,b)=>a+b,0);S.hist.push(Math.round(t));S.hist=S.hist.slice(-12);S.top=Object.entries(v).sort((a,b)=>b[1]-a[1])[0][0];save();show()}
function show(){const t=S.hist.at(-1);if(!t)return;$("fp").textContent=t+" kg CO₂e";
const n={kwh:"electricity",lpg:"cooking fuel",pet:"petrol",meat:"diet"}[S.top];
$("fpd").textContent=(t>INDIA_AVG*1.5?"Above":"Near/below")+" a rough household benchmark. Biggest source: "+n+".";draw()}
function draw(){const c=$("ch"),x=c.getContext("2d");x.clearRect(0,0,600,150);const h=S.hist;if(h.length<1)return;
const mx=Math.max(...h)*1.1,w=600/Math.max(h.length,2);x.strokeStyle="#1f8a4c";x.lineWidth=3;x.beginPath();
h.forEach((v,i)=>{const X=w*i+w/2,Y=140-v/mx*130;i?x.lineTo(X,Y):x.moveTo(X,Y)});x.stroke();
h.forEach((v,i)=>{x.fillStyle="#1f8a4c";x.beginPath();x.arc(w*i+w/2,140-v/mx*130,4,0,7);x.fill()})}
function nudge(){const h=+$("hr").value;let m;
if(h>=18&&h<22)m="Peak grid hours (6–10 pm). Delay washing machine, geyser and iron until after 10 pm.";
else if(h>=10&&h<16)m="Solar-rich midday. Good time for pumps and heavy loads; if you have rooftop solar, use it now.";
else m="Off-peak. Schedule dishwasher/EV charging now. Switch off idle devices.";$("nudge").textContent=m}
function tasks(){$("tasks").innerHTML=TASKS.map((t,i)=>`<div class="row"><span>${t[0]}<br><span class="m">${t[1]} kg CO₂ saved</span></span><button class="${S.done[i]===today()?"s":""}" onclick="done(${i})">${S.done[i]===today()?"Done ✓":"Mark done"}</button></div>`).join("")}
const today=()=>new Date().toISOString().slice(0,10);
function done(i){if(S.done[i]===today())return;S.done[i]=today();S.pts+=10;S.saved=+(S.saved+TASKS[i][1]).toFixed(1);save();tasks();board()}
function board(){$("pts").textContent=S.pts;$("saved").textContent=S.saved;$("gb").style.width=Math.min(100,(S.saved+1240)/50)+"%";
const L=[["Ahmedabad Green Club",620],["Surat Solar Society",540],["Vadodara Youth",410],["You",S.pts]].sort((a,b)=>b[1]-a[1]);
$("lb").innerHTML=L.map((r,i)=>`<div class="row"><span>${i+1}. ${r[0]}${r[0]=="You"?' <span class="tag">you</span>':""}</span><b>${r[1]}</b></div>`).join("")}
function solar(){const a=+$("roof").value,kw=Math.floor(a/10*10)/10,yld=1500,gen=kw*yld,tar=+$("tar").value,use=+$("bill").value/tar*12;
const sz=Math.min(kw,Math.max(1,use/yld)),cost=sz*55000,sub=Math.min(sz,2)*30000+(sz>2?Math.min(sz-2,1)*18000:0),net=cost-sub,sv=Math.min(sz*yld,use)*tar;
$("sol").innerHTML=`Roof fits ≈ ${kw.toFixed(1)} kW. Recommended: <b>${sz.toFixed(1)} kW</b><br>Output ≈ ${Math.round(sz*yld)} kWh/yr · Saves ≈ ₹${Math.round(sv)}/yr<br>Est. cost ₹${Math.round(cost)} − subsidy ₹${Math.round(sub)} = ₹${Math.round(net)}<br>Payback ≈ ${(net/sv).toFixed(1)} yrs · CO₂ avoided ≈ ${Math.round(sz*yld*EF.kwh)} kg/yr<br><i>Assumptions: 1500 kWh/kW/yr, ₹55k/kW, PM Surya Ghar-style subsidy; verify current rates.</i>`}
nudge();tasks();show();board();
