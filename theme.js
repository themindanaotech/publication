// Seasonal theme engine. Reads themes from Supabase settings (S.themes, S.customThemes, S.themeForce). No schema change needed.
(()=>{
const D={main:"#080e19",slate:"#172235",hi:"#f4b344",text:"#f5f1e8",acc:"#f4b344"};
const P=[
{id:"halloween",name:"Halloween Edition",m:[10],main:"#14110f",slate:"#2a211b",hi:"#e8731a",acc:"#e8731a",text:"#f5ece2",deco:["🎃","🦇","🕸️"],msg:"Happy Halloween from The Mindanao Tech"},
{id:"christmas",name:"Christmas Edition",m:[11,12],main:"#0a1424",slate:"#12301f",hi:"#f0b84a",acc:"#c0392b",text:"#f7f3ea",deco:["❄","✦","🎄"],lights:1,msg:"Merry Christmas from The Mindanao Tech"},
{id:"newyear",name:"New Year Edition",m:[1],main:"#080e19",slate:"#1b2438",hi:"#f4b344",acc:"#cfd5df",text:"#f5f1e8",deco:["✦","★","🎆"],msg:"Happy New Year from The Mindanao Tech"},
{id:"valentine",name:"Valentine's Edition",m:[2],main:"#2b0b17",slate:"#45101f",hi:"#f2b45a",acc:"#e0536b",text:"#fbeee9",deco:["♥","♡"],msg:"Happy Valentine's Day from The Mindanao Tech"},
{id:"summer",name:"Summer Edition",m:[3,4,5],main:"#06304a",slate:"#0b4a6b",hi:"#ffd23f",acc:"#ff8a4c",text:"#fffaf0",deco:["☀","🌴","🌊"],msg:"Summer is here at The Mindanao Tech"},
{id:"independence",name:"Philippine Independence Day",m:[6],main:"#0a1f5c",slate:"#10307e",hi:"#fcd116",acc:"#ce1126",text:"#ffffff",deco:["★"],msg:"Mabuhay ang Pilipinas! Happy Independence Day"},
{id:"anniversary",name:"University Anniversary Edition",m:[],main:"#080e19",slate:"#172235",hi:"#f4b344",acc:"#ffffff",text:"#f5f1e8",deco:["★","✦"],msg:"Celebrating the University of Southern Mindanao"}];
const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const all=S=>[...P.map(p=>({...p,...(S.themes||{})[p.id]})),...(S.customThemes||[]).map(c=>({deco:["✦"],acc:c.hi,...c,custom:1}))];
const live=(t,n)=>t.on&&(t.start&&t.end?t.start<=n&&n<=t.end:!t.custom&&(t.m||[]).includes(+n.slice(5,7)));
function resolve(S,force){const f=force??S.themeForce;if(f==="default")return null;const a=all(S);
  if(f)return a.find(t=>t.id===f)||null;return a.find(t=>live(t,today()))||null}
function apply(t,logo){const r=document.documentElement.style,c=t||D;
  r.setProperty("--main",c.main||D.main);r.setProperty("--slate",c.slate||D.slate);r.setProperty("--hi",c.hi||D.hi);r.setProperty("--text",c.text||D.text);r.setProperty("--acc",c.acc||c.hi||D.acc);
  r.setProperty("--bgimg",t&&t.bg?`url("${t.bg}")`:"none");
  document.querySelectorAll("#seasonal,.mt-deco").forEach(e=>e.remove());if(!t)return;
  const b=document.createElement("div");b.id="seasonal";if(t.banner)b.style.backgroundImage=`linear-gradient(90deg,var(--main),transparent 60%),url("${t.banner}")`;
  b.innerHTML=`<img src="${logo}" alt="" onerror="this.remove()"><span>${(t.msg||t.name||"").replace(/</g,"&lt;")}</span>`;
  document.body.prepend(b);
  if(t.anim===false||matchMedia("(prefers-reduced-motion:reduce)").matches)return;
  const g=document.createElement("div");g.className="mt-deco";g.setAttribute("aria-hidden","true");
  if(t.lights)g.innerHTML='<div class="lights">'+"<i></i>".repeat(24)+"</div>";
  const d=t.deco&&t.deco.length?t.deco:["✦"];
  for(let i=0;i<14;i++){const s=document.createElement("span");s.textContent=d[i%d.length];
    s.style.cssText=`left:${(i*7.3+3)%98}%;font-size:${12+i%4*5}px;animation-duration:${12+i%5*3}s;animation-delay:-${i*1.7}s`;g.appendChild(s)}
  document.body.appendChild(g)}
window.MT={PRESETS:P,DEFAULT:D,all,resolve,apply,live,today};
})();
