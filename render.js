// Shared story renderer. index.html (the public site) and admin.html (the live preview) both use this,
// so a story always looks the same in the preview as it does for readers.
(()=>{
const EM=/(?![\u00a9\u00ae\u2122])[\p{Extended_Pictographic}\uFE0F\u200D]/gu;

// Same escaping the public site uses (emoji are not shown on the site).
const esc=s=>String(s??"").replace(EM,"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const hasEmoji=s=>{EM.lastIndex=0;const r=EM.test(String(s||""));EM.lastIndex=0;return r};

// Cleans pasted text: Windows/Mac line endings, non-breaking and invisible spaces, trailing spaces, extra blank lines.
const tidy=t=>String(t??"")
  .replace(/\r\n?|\u2028|\u2029/g,"\n")
  .replace(/[\u00a0\u2007\u202f]/g," ")
  .replace(/[\u200b\u2060\ufeff]/g,"")
  .replace(/[ \t]+$/gm,"")
  .replace(/\n{3,}/g,"\n\n")
  .trim();

// Article text -> paragraphs. A blank line starts a new paragraph; a single line break stays a line break.
const body=(text,link,e)=>{
  const E=e||esc,L=link||(h=>h);
  return tidy(text).split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean)
    .map(p=>`<p>${L(E(p)).replace(/\n/g,"<br>")}</p>`).join("");
};

const title=a=>String(a&&a.title||"").replace(/^\s*breaking news\s*[|:\-\u2013\u2014]\s*/i,"");
const names=a=>{const l=String(a||"").split(/[\p{Extended_Pictographic}\uFE0F\u200D]+\s*:?\s*/u).map(x=>x.trim()).filter(Boolean);return l.length?l:["Staff"]};
const fmt=d=>new Date(d).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
const mins=t=>Math.max(1,Math.round(tidy(t).split(/\s+/).length/200));
const words=t=>{const s=tidy(t);return s?s.split(/\s+/).length:0};

// Highlights team members' full names in a story (same behaviour as the site).
const linker=team=>{try{
  const ms=(Array.isArray(team)?team:[]).flatMap(g=>g.members||[]).filter(m=>m&&m.id&&m.name&&m.name.trim().length>1);
  if(!ms.length)return h=>h;
  const map={};ms.forEach(m=>{map[esc(m.name.trim()).toLowerCase()]=m.id});
  const keys=Object.keys(map).sort((a,b)=>b.length-a.length).map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
  const re=new RegExp("(?<![\\p{L}\\p{N}&#])("+keys.join("|")+")(?![\\p{L}\\p{N}])","giu");
  return h=>h.replace(re,t=>{const id=map[t.toLowerCase()];return id?`<a class="mn" href="#team-${id}">${t}</a>`:t})
}catch(e){return h=>h}};

const bg=a=>a.image?`background-image:url('${esc(a.image)}')`:`background-image:linear-gradient(135deg,var(--slate),var(--main))`;
const ph=(s)=>`<span style="opacity:.45">${s}</span>`;

// What a reader sees on the story page. o = {parent(cat), team}
const article=(a,o={})=>{
  const P=(o.parent?o.parent(a.category):a.category)||a.category||"News",gal=a.pics||[],link=linker(o.team);
  const nm=names(a.author),mem=(Array.isArray(o.team)?o.team:[]).flatMap(g=>g.members||[]).find(m=>m&&m.name&&m.name.trim().toLowerCase()==nm[0].toLowerCase());
  const by=nm.map(n=>`<a class="au" href="#a-${encodeURIComponent(n)}">${esc(n)}</a>`).join(", ");
  const t=title(a),txt=tidy(a.body);
  const noThumb=a.category=="Breaking News"&&!a.image;
  return `<article class="art"><nav class="crumb"><a href="#home">Home</a> / <a href="#${esc(P.toLowerCase())}">${esc(P)}</a>${P!=a.category&&a.category?` / <a href="#${esc(String(a.category).toLowerCase())}">${esc(a.category)}</a>`:""}</nav>`
  +`<h1>${t?esc(t):ph("Your headline appears here")}</h1>`
  +`<p style="color:var(--mute);font-size:18px">${a.excerpt?esc(a.excerpt):ph("Your short description appears here")}</p>`
  +`<div class="byl">${by}<span>&middot;</span>${fmt(a.created_at)}<span>&middot;</span>${mins(txt)} min read</div>`
  +`<div class="share"><span>SHARE</span><a href="#">Facebook</a><a href="#">X</a><button type="button">Copy link</button></div>`
  +(noThumb?"":`<div class="thumb"><i style="${bg(a)}"></i></div>`)
  +(gal.length?`<div class="gal${gal.length==1?" one":""}">${gal.map(u=>`<a href="${esc(u)}"><img src="${esc(u)}" alt=""></a>`).join("")}</div>`:"")
  +`<div class="body">${txt?body(txt,link):`<p>${ph("Your article text appears here.")}</p>`}</div>`
  +`<section class="abox">${mem&&mem.photo?`<i style="background-image:url('${esc(mem.photo)}')"></i>`:""}<div><span class="tag">Author</span><b>${by}</b>${mem&&mem.role?`<p>${esc(mem.role)}</p>`:""}<a class="more" href="#a-${encodeURIComponent(nm[0])}">More from ${esc(nm[0])}</a></div></section></article>`;
};

// What a reader sees on a homepage / section card.
const card=a=>{
  const nm=names(a.author),t=title(a);
  return `<a class="card" href="#">${a.category=="Breaking News"&&!a.image?"":`<div class="thumb"><i style="${bg(a)}"></i></div>`}<span class="tag" style="display:block;margin-top:12px">${esc(a.category||"")}</span><h3>${t?esc(t):ph("Your headline appears here")}</h3><p style="display:block">${a.excerpt?esc(a.excerpt):ph("Your short description appears here")}</p><div class="meta"><span>By ${esc(nm.join(", "))}</span><span>${fmt(a.created_at)}</span><span>${mins(a.body)} min read</span></div></a>`;
};

window.MTR={esc,hasEmoji,tidy,body,title,names,fmt,mins,words,linker,article,card};
})();
