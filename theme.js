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

// Small holiday accessories drawn on top of the logo (horns, hats...). Works for any logo image, in the header, splash and admin.
const R=(a,b)=>a, ACC={
halloween:'<path d="M26 56C14 52 8 38 12 22c4 10 10 16 20 18z" fill="#c1272d" stroke="#240606" stroke-width="3" stroke-linejoin="round"/><path d="M74 56c12-4 18-18 14-34-4 10-10 16-20 18z" fill="#c1272d" stroke="#240606" stroke-width="3" stroke-linejoin="round"/><path d="M15 28c2 6 5 9 9 11" stroke="#ff6b5e" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M85 28c-2 6-5 9-9 11" stroke="#ff6b5e" stroke-width="2.5" fill="none" stroke-linecap="round"/>',
christmas:'<path d="M18 56C22 26 40 8 70 10c-6 8-6 16-4 46z" fill="#d62d2d" stroke="#5a0b0b" stroke-width="2.5" stroke-linejoin="round"/><rect x="12" y="48" width="70" height="12" rx="6" fill="#fff" stroke="#cfd5df" stroke-width="2"/><circle cx="72" cy="10" r="8" fill="#fff" stroke="#cfd5df" stroke-width="2"/>',
newyear:'<path d="M50 4 76 56H24z" fill="#f4b344" stroke="#6b4a10" stroke-width="2.5" stroke-linejoin="round"/><path d="M38 32h24M31 45h38" stroke="#fff" stroke-width="4"/><circle cx="50" cy="5" r="6" fill="#e0536b"/>',
valentine:'<path d="M50 56C16 34 28 6 50 22 72 6 84 34 50 56z" fill="#e0536b" stroke="#6e1226" stroke-width="2.5" stroke-linejoin="round"/><path d="M34 22c4-4 9-3 11 1" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>',
summer:'<circle cx="50" cy="40" r="15" fill="#ffd23f" stroke="#b8860b" stroke-width="2.5"/><g stroke="#ffd23f" stroke-width="4" stroke-linecap="round"><path d="M50 12v8M50 60v0M22 40h8M70 40h8M30 20l6 6M70 20l-6 6"/></g>',
independence:'<g fill="#fcd116" stroke="#8a6d00" stroke-width="2" stroke-linejoin="round"><path id="st" d="M20 52l4-12-10-8h12l4-12 4 12h12l-10 8 4 12-10-7z"/><path d="M80 52l4-12-10-8h12l4-12 4 12h12l-10 8 4 12-10-7z" transform="translate(-14 0)"/></g><path d="M20 56h60" stroke="#ce1126" stroke-width="5" stroke-linecap="round"/><path d="M20 61h60" stroke="#0038a8" stroke-width="3" stroke-linecap="round"/>',
anniversary:'<path d="M50 6 92 26 50 46 8 26z" fill="#1b1b1f" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/><path d="M28 38v14c10 8 34 8 44 0V38L50 48z" fill="#2b2b33" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/><path d="M86 28v22" stroke="#f4b344" stroke-width="3"/><circle cx="86" cy="52" r="4" fill="#f4b344"/>',
custom:'<path d="M50 4l9 22 23 2-17 15 6 23-21-13-21 13 6-23L18 28l23-2z" fill="#f4b344" stroke="#6b4a10" stroke-width="2.5" stroke-linejoin="round" transform="translate(0 -2) scale(1 .9)"/>'};
let CURT=null,obs=null;
function unwrap(){document.querySelectorAll(".mt-acc").forEach(e=>e.remove());document.querySelectorAll(".mt-lw").forEach(w=>{const i=w.querySelector("img");if(i)w.replaceWith(i);else w.remove()})}
function decorate(){if(!CURT)return;const svg=ACC[CURT.id]||(CURT.custom?ACC.custom:null);if(!svg)return;
  document.querySelectorAll("img.logo,#sLogo,.lg img").forEach(i=>{if(i.closest(".mt-lw")||i.closest("#seasonal")||!i.parentNode)return;
    const w=document.createElement("span");w.className="mt-lw"+(i.id=="sLogo"?" big":"");i.replaceWith(w);w.appendChild(i);
    const a=document.createElement("span");a.className="mt-acc";a.setAttribute("aria-hidden","true");a.innerHTML=`<svg viewBox="0 0 100 64" preserveAspectRatio="xMidYMax meet">${svg}</svg>`;w.appendChild(a)})}
function accessories(t){CURT=t;if(obs)obs.disconnect();unwrap();if(!t)return;decorate();
  obs=new MutationObserver(()=>{obs.disconnect();decorate();obs.observe(document.body,{childList:true,subtree:true})});obs.observe(document.body,{childList:true,subtree:true})}
if(!document.getElementById("mt-acc-css")){const c=document.createElement("style");c.id="mt-acc-css";
  c.textContent=".mt-lw{position:relative;display:inline-block;line-height:0;vertical-align:middle}.mt-acc{position:absolute;left:50%;bottom:84%;width:72%;max-width:170px;transform:translateX(-50%);pointer-events:none;z-index:2;filter:drop-shadow(0 2px 3px #0006)}.mt-acc svg{display:block;width:100%;height:auto;overflow:visible}.mt-lw.big{display:block;margin:0 auto;width:fit-content}.mt-lw.big .mt-acc{animation:mtf 4s 1s ease-in-out infinite}@keyframes mtf{50%{transform:translateX(-50%) translateY(-8px)}}.lg .mt-lw{margin:0 auto 14px}.lg .mt-lw img{margin:0!important}";
  document.head.appendChild(c)}
function resolve(S,force){const f=force??S.themeForce;if(f==="default")return null;const a=all(S);
  if(f)return a.find(t=>t.id===f)||null;return a.find(t=>live(t,today()))||null}
function apply(t,logo){const r=document.documentElement.style,c=t||D;
  r.setProperty("--main",c.main||D.main);r.setProperty("--slate",c.slate||D.slate);r.setProperty("--hi",c.hi||D.hi);r.setProperty("--text",c.text||D.text);r.setProperty("--acc",c.acc||c.hi||D.acc);
  r.setProperty("--bgimg",t&&t.bg?`url("${t.bg}")`:"none");
  document.querySelectorAll("#seasonal,.mt-deco").forEach(e=>e.remove());accessories(t);if(!t){matchLogo(logo);return}
  const b=document.createElement("div");b.id="seasonal";if(t.banner)b.style.backgroundImage=`linear-gradient(90deg,var(--main),transparent 60%),url("${t.banner}")`;
  b.innerHTML=`<img src="${logo}" alt="" onerror="this.remove()"><span>${(t.msg||t.name||"").replace(/</g,"&lt;")}</span>`;
  document.body.prepend(b);
  if(true||t.anim===false||matchMedia("(prefers-reduced-motion:reduce)").matches)return;
  const g=document.createElement("div");g.className="mt-deco";g.setAttribute("aria-hidden","true");
  if(t.lights)g.innerHTML='<div class="lights">'+"<i></i>".repeat(24)+"</div>";
  const d=t.deco&&t.deco.length?t.deco:["✦"];
  for(let i=0;i<14;i++){const s=document.createElement("span");s.textContent=d[i%d.length];
    s.style.cssText=`left:${(i*7.3+3)%98}%;font-size:${12+i%4*5}px;animation-duration:${12+i%5*3}s;animation-delay:-${i*1.7}s`;g.appendChild(s)}
  document.body.appendChild(g)}
// Match the page colours to the logo photo's own background (sampled from its corners), so the logo blends in instead of standing out.
function matchLogo(src){if(!src)return;const K="mt-logo-bg:"+src,r=document.documentElement.style;
  const paint=m=>{const hex=a=>"#"+a.map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,"0")).join(""),L=(m[0]*299+m[1]*587+m[2]*114)/1000,dark=L<140,slate=m.map(v=>dark?v+22:v-22);
    r.setProperty("--main",hex(m));r.setProperty("--slate",hex(slate));r.setProperty("--text",dark?"#f5f1e8":"#14110f");
    r.setProperty("--mute",dark?"#a9b0be":"#555b66");r.setProperty("--line",dark?"#ffffff24":"#00000024");r.style&&0;document.documentElement.style.colorScheme=dark?"dark":"light"};
  try{const c=JSON.parse(localStorage.getItem(K)||"null");if(c)paint(c)}catch(e){} // instant on repeat visits, no colour flash
  const im=new Image();im.crossOrigin="anonymous";
  im.onload=()=>{try{const w=im.naturalWidth,h=im.naturalHeight;if(!w||!h)return;const c=document.createElement("canvas");c.width=w;c.height=h;
    const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(im,0,0);const e=Math.max(1,Math.round(Math.min(w,h)*.02)),pts=[[e,e],[w-1-e,e],[e,h-1-e],[w-1-e,h-1-e],[w>>1,e],[w>>1,h-1-e],[e,h>>1],[w-1-e,h>>1]];
    const px=pts.map(([a,b])=>x.getImageData(a,b,1,1).data).filter(d=>d[3]>200);if(px.length<4)return; // transparent logo: nothing to match
    const med=i=>px.map(d=>d[i]).sort((a,b)=>a-b)[px.length>>1],m=[med(0),med(1),med(2)];
    if(px.filter(d=>Math.abs(d[0]-m[0])+Math.abs(d[1]-m[1])+Math.abs(d[2]-m[2])>90).length>px.length/3)return;
    paint(m);try{localStorage.setItem(K,JSON.stringify(m))}catch(e){}}catch(e){}};
  im.src=src}
window.MT={matchLogo,PRESETS:P,DEFAULT:D,all,resolve,apply,live,today};
})();
