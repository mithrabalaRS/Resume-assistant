
'use strict';
const $ = id => document.getElementById(id);
const uid = () => Math.random().toString(36).slice(2,8);
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

let S = {
  fullName:'', jobTitle:'', email:'', phone:'', address:'', website:'', linkedin:'', github:'', summary:'',
  skills:[], experience:[], education:[], projects:[], certifications:[], achievements:[],
  resumeTemplate:'classic', portfolioTemplate:'hero', darkMode:false, rZoom:85, pZoom:70
};

function save(){ try{ localStorage.setItem('rf_v2', JSON.stringify(S)); }catch(e){} }
function load(){ try{ const r = localStorage.getItem('rf_v2'); if(r) Object.assign(S, JSON.parse(r)); }catch(e){} }

function toast(msg, type=''){
  const t=$('toast'); t.textContent=msg;
  t.className='toast show'+(type?' '+type:'');
  clearTimeout(t._t); t._t=setTimeout(()=>{ t.className='toast'; }, 2600);
}

function spawnParticles(){
  const c = $('particles'); if(!c) return;
  for(let i=0;i<18;i++){
    const p = document.createElement('div'); p.className='particle';
    const sz = 2+Math.random()*4;
    p.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;animation-duration:${8+Math.random()*14}s;animation-delay:${Math.random()*12}s`;
    c.appendChild(p);
  }
}

function goTo(id){
  document.querySelectorAll('.screen').forEach(s=>{
    s.classList.remove('active','slide-out-left','slide-in-right');
  });
  const next = $(id);
  next.classList.add('active');
}

function applyDark(){
  document.body.classList.toggle('dark', S.darkMode);
  document.querySelectorAll('.icon-sun').forEach(e=>{ e.style.display=S.darkMode?'none':''; });
  document.querySelectorAll('.icon-moon').forEach(e=>{ e.style.display=S.darkMode?'':'none'; });
  document.querySelectorAll('.theme-label').forEach(e=>{ e.textContent=S.darkMode?'Light':'Dark'; });
}

const RESUME_TPLS = [
  {id:'classic',name:'Classic',bg:'#0A1628',c1:'#C9A84C',c2:'#EDF2FA'},
  {id:'modern', name:'Modern', bg:'#1E3A5F',c1:'#fff',   c2:'#C9A84C'},
  {id:'bold',   name:'Bold',   bg:'linear-gradient(135deg,#0A1628,#1E3A5F)',c1:'#C9A84C',c2:'#fff'},
  {id:'minimal',name:'Minimal',bg:'#F4F7FB',c1:'#0A1628',c2:'#A0AEC0'},
];
const PORTFOLIO_TPLS = [
  {id:'hero',   name:'Hero Dark',   bg:'#0D1117',c1:'#C9A84C',c2:'#1E3A5F'},
  {id:'cards',  name:'Light Cards', bg:'#F7F9FC',c1:'#1E3A5F',c2:'#C9A84C'},
  {id:'grad',   name:'Gradient',    bg:'linear-gradient(135deg,#f8f4ff,#edf5ff)',c1:'#7C3AED',c2:'#0A1628'},
];

function buildTPL(tpls, activeId, onClick){
  const grid = document.createElement('div'); grid.className='tp-grid';
  tpls.forEach(t=>{
    const card=document.createElement('div'); card.className='tp-card'+(t.id===activeId?' active':'');
    card.innerHTML=`<div class="tp-thumb"><div style="width:100%;height:100%;background:${t.bg};border-radius:3px;padding:5px 6px;display:flex;flex-direction:column;gap:3px"><div style="height:7px;background:${t.c1};border-radius:2px;width:55%"></div><div style="height:3px;background:${t.c2};border-radius:1px;width:38%"></div><div style="height:2px;background:${t.c1};opacity:.35;border-radius:1px;width:78%"></div><div style="height:2px;background:${t.c1};opacity:.35;border-radius:1px;width:62%"></div></div></div><div class="tp-name">${t.name}</div>`;
    card.addEventListener('click',()=>{ onClick(t.id); grid.querySelectorAll('.tp-card').forEach(c=>c.classList.remove('active')); card.classList.add('active'); });
    grid.appendChild(card);
  });
  return grid;
}

function bindField(id, key, renderFn){
  const el=$(id); if(!el)return;
  el.addEventListener('input',()=>{ S[key]=el.value; save(); renderFn(); });
}
function syncField(id, key){ const e=$(id); if(e) e.value=S[key]||''; }

function skillSection(inputId, addId, tagsId, renderFn){
  const inp=$(inputId);
  function add(raw){ raw.split(',').map(s=>s.trim()).filter(Boolean).forEach(s=>{ if(s&&!S.skills.includes(s)) S.skills.push(s); }); save(); renderTagsFor(tagsId,renderFn); renderFn(); }
  $(addId).addEventListener('click',()=>{ if(inp.value.trim()){ add(inp.value); inp.value=''; inp.focus(); } });
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); if(inp.value.trim()){ add(inp.value); inp.value=''; } } });
  renderTagsFor(tagsId, renderFn);
}
function renderTagsFor(tagsId, renderFn){
  const w=$(tagsId); if(!w)return; w.innerHTML='';
  S.skills.forEach(sk=>{ const t=document.createElement('span'); t.className='skill-tag'; t.textContent=sk; t.addEventListener('click',()=>{ S.skills=S.skills.filter(x=>x!==sk); save(); renderTagsFor(tagsId,renderFn); renderFn(); }); w.appendChild(t); });
}

function upField(sec,id,field,val){ const e=S[sec].find(x=>x.id===id); if(e){ e[field]=val; save(); } }

function entryCard(fields, onRemove, onChange){
  const c=document.createElement('div'); c.className='entry-card';
  const rem=document.createElement('button'); rem.className='entry-remove'; rem.textContent='×';
  rem.addEventListener('click', onRemove); c.appendChild(rem);
  const g=document.createElement('div'); g.className='field-grid';
  fields.forEach(f=>{
    const wrap=document.createElement('div'); wrap.className='field'+(f.full?' full':'');
    const lbl=document.createElement('label'); lbl.textContent=f.label; wrap.appendChild(lbl);
    const inp=f.area?document.createElement('textarea'):document.createElement('input');
    if(!f.area) inp.type=f.type||'text'; inp.placeholder=f.placeholder||''; inp.value=f.value||'';
    if(f.area) inp.rows=2;
    inp.setAttribute('data-f', f.key);
    inp.addEventListener('input',()=>onChange(f.key, inp.value));
    wrap.appendChild(inp); g.appendChild(wrap);
  });
  c.appendChild(g); return c;
}

function addExp(containerId, renderFn, data={}){
  const id=data.id||uid();
  const e={id,company:'',title:'',location:'',startDate:'',endDate:'',description:'',...data};
  if(!data.id) S.experience.push(e);
  const card=entryCard([
    {key:'company',label:'Company',placeholder:'Acme Corp',full:true,value:e.company},
    {key:'title',label:'Job Title',placeholder:'Software Engineer',value:e.title},
    {key:'location',label:'Location',placeholder:'SF, CA',value:e.location},
    {key:'startDate',label:'Start',placeholder:'Jan 2022',value:e.startDate},
    {key:'endDate',label:'End',placeholder:'Present',value:e.endDate},
    {key:'description',label:'Description',placeholder:'• Key achievements...',area:true,full:true,value:e.description},
  ], ()=>{ S.experience=S.experience.filter(x=>x.id!==id); card.remove(); save(); renderFn(); },
  (field,val)=>{ upField('experience',id,field,val); renderFn(); });
  $(containerId).appendChild(card);
}
function addEdu(containerId, renderFn, data={}){
  const id=data.id||uid();
  const e={id,school:'',degree:'',field:'',startYear:'',endYear:'',gpa:'',...data};
  if(!data.id) S.education.push(e);
  const card=entryCard([
    {key:'school',label:'School',placeholder:'MIT',full:true,value:e.school},
    {key:'degree',label:'Degree',placeholder:'B.S.',value:e.degree},
    {key:'field',label:'Field',placeholder:'Computer Science',value:e.field},
    {key:'startYear',label:'Start Year',placeholder:'2018',value:e.startYear},
    {key:'endYear',label:'End Year',placeholder:'2022',value:e.endYear},
    {key:'gpa',label:'GPA',placeholder:'3.8/4.0',value:e.gpa},
  ], ()=>{ S.education=S.education.filter(x=>x.id!==id); card.remove(); save(); renderFn(); },
  (field,val)=>{ upField('education',id,field,val); renderFn(); });
  $(containerId).appendChild(card);
}
function addProj(containerId, renderFn, data={}){
  const id=data.id||uid();
  const e={id,name:'',role:'',url:'',startDate:'',endDate:'',description:'',...data};
  if(!data.id) S.projects.push(e);
  const card=entryCard([
    {key:'name',label:'Project Name',placeholder:'My App',full:true,value:e.name},
    {key:'role',label:'Your Role',placeholder:'Lead Dev',value:e.role},
    {key:'url',label:'URL',placeholder:'https://github.com/...',type:'url',value:e.url},
    {key:'startDate',label:'Start',placeholder:'Mar 2023',value:e.startDate},
    {key:'endDate',label:'End',placeholder:'Present',value:e.endDate},
    {key:'description',label:'Description',placeholder:'What you built...',area:true,full:true,value:e.description},
  ], ()=>{ S.projects=S.projects.filter(x=>x.id!==id); card.remove(); save(); renderFn(); },
  (field,val)=>{ upField('projects',id,field,val); renderFn(); });
  $(containerId).appendChild(card);
}
function addCert(containerId, renderFn, data={}){
  const id=data.id||uid();
  const e={id,name:'',issuer:'',issueDate:'',expiryDate:'',credentialId:'',url:'',...data};
  if(!data.id) S.certifications.push(e);
  const c=document.createElement('div'); c.className='entry-card';
  c.innerHTML=`<button class="entry-remove">×</button><div class="cert-badge-label">🏅 Certification</div><div class="field-grid">
    <div class="field full"><label>Certificate Name</label><input type="text" data-f="name" placeholder="AWS Certified..." value="${esc(e.name)}"/></div>
    <div class="field"><label>Issuing Org</label><input type="text" data-f="issuer" placeholder="Amazon Web Services" value="${esc(e.issuer)}"/></div>
    <div class="field"><label>Credential ID</label><input type="text" data-f="credentialId" placeholder="ABC-123" value="${esc(e.credentialId)}"/></div>
    <div class="field"><label>Issue Date</label><input type="text" data-f="issueDate" placeholder="Mar 2023" value="${esc(e.issueDate)}"/></div>
    <div class="field"><label>Expiry Date</label><input type="text" data-f="expiryDate" placeholder="Mar 2026" value="${esc(e.expiryDate)}"/></div>
    <div class="field full"><label>URL</label><input type="url" data-f="url" placeholder="https://verify..." value="${esc(e.url)}"/></div>
  </div>`;
  c.querySelector('.entry-remove').addEventListener('click',()=>{ S.certifications=S.certifications.filter(x=>x.id!==id); c.remove(); save(); renderFn(); });
  c.querySelectorAll('[data-f]').forEach(i=>i.addEventListener('input',()=>{ upField('certifications',id,i.dataset.f,i.value); renderFn(); }));
  $(containerId).appendChild(c);
}
function addAch(containerId, renderFn, data={}){
  const id=data.id||uid();
  const e={id,title:'',description:'',date:'',issuer:'',...data};
  if(!data.id) S.achievements.push(e);
  const card=entryCard([
    {key:'title',label:'Achievement Title',placeholder:'1st Place — Hackathon 2023',full:true,value:e.title},
    {key:'issuer',label:'Issued by',placeholder:'Google, MIT, Forbes...',value:e.issuer},
    {key:'date',label:'Date',placeholder:'Nov 2023',value:e.date},
    {key:'description',label:'Description',placeholder:'Brief context...',area:true,full:true,value:e.description},
  ], ()=>{ S.achievements=S.achievements.filter(x=>x.id!==id); card.remove(); save(); renderFn(); },
  (field,val)=>{ upField('achievements',id,field,val); renderFn(); });
  $(containerId).appendChild(card);
}


function ci(icon,val,href=''){
  if(!val)return '';
  const d=val.replace(/^https?:\/\/(www\.)?/i,'');
  return `<span class="rci">${icon} ${href?`<a href="${esc(href)}" target="_blank">${esc(d)}</a>`:esc(val)}</span>`;
}
function expBlock(cls){
  return S.experience.map(e=>`<div class="${cls} re"><div class="reh"><div class="ret">${esc(e.title)||'<em style="opacity:.4">Title</em>'}</div>${e.startDate||e.endDate?`<div class="red">${esc(e.startDate)}${e.startDate&&e.endDate?' – ':''}${esc(e.endDate)}</div>`:''}</div><div class="res">${esc(e.company)}${e.company&&e.location?' · ':''}${esc(e.location)}</div>${e.description?`<div class="redc">${esc(e.description).replace(/\n/g,'<br>')}</div>`:''}</div>`).join('');
}
function eduBlock(cls=''){
  return S.education.map(e=>`<div class="${cls}"><div class="reh"><div class="ret">${esc(e.school)}</div>${e.startYear||e.endYear?`<div class="red">${esc(e.startYear)}${e.startYear&&e.endYear?' – ':''}${esc(e.endYear)}</div>`:''}</div><div class="res">${[e.degree,e.field].filter(Boolean).map(esc).join(', ')}${e.gpa?' · GPA '+esc(e.gpa):''}</div></div>`).join('');
}
function projBlock(cls){
  return S.projects.map(p=>`<div class="${cls} re"><div class="reh"><div class="ret">${esc(p.name)}${p.role?` <span style="font-weight:400;color:#6B7A99">· ${esc(p.role)}</span>`:''}</div>${p.startDate||p.endDate?`<div class="red">${esc(p.startDate)}${p.startDate&&p.endDate?' – ':''}${esc(p.endDate)}</div>`:''}</div>${p.url?`<div class="rlink"><a href="${esc(p.url)}" target="_blank">${esc(p.url.replace(/^https?:\/\//,''))}</a></div>`:''}${p.description?`<div class="redc">${esc(p.description).replace(/\n/g,'<br>')}</div>`:''}</div>`).join('');
}
function certGrid(p,sfx){
  return `<div class="rcg">${S.certifications.map(c=>`<div class="${p} rcc"><div class="rcn">${esc(c.name)}</div><div class="${sfx?'rci2':'rci2'}">${esc(c.issuer)}</div><div class="rcm">${c.issueDate?'Issued: '+esc(c.issueDate):''}${c.issueDate&&c.expiryDate?' · ':''}${c.expiryDate?'Exp: '+esc(c.expiryDate):''}${c.credentialId?'<br>ID: '+esc(c.credentialId):''}</div></div>`).join('')}</div>`;
}
function achBlock(p){
  return S.achievements.map(a=>`<div class="${p} ra"><div class="rast">★</div><div><div class="rat">${esc(a.title)}${a.issuer?` <span style="font-weight:400;color:#6B7A99;font-size:.74rem">· ${esc(a.issuer)}</span>`:''}</div>${a.description?`<div class="radc">${esc(a.description)}</div>`:''}${a.date?`<div class="radt">${esc(a.date)}</div>`:''}</div></div>`).join('');
}

function renderClassic(){
  const p='tpl-classic';
  return `<div class="resume-paper ${p}">
    <div class="rh"><div class="rname">${esc(S.fullName)||'Your Name'}</div>${S.jobTitle?`<div class="rjobtitle">${esc(S.jobTitle)}</div>`:''}<div class="rcontact">${ci('✉',S.email,'mailto:'+S.email)}${ci('📞',S.phone)}${ci('📍',S.address)}${ci('🔗',S.linkedin,S.linkedin)}${ci('💻',S.github,S.github)}${ci('🌐',S.website,S.website)}</div></div>
    ${S.summary?`<div class="rsec"><div class="rst">Summary</div><div class="rtxt">${esc(S.summary)}</div></div>`:''}
    ${S.skills.length?`<div class="rsec"><div class="rst">Skills</div><div class="rskw">${S.skills.map(s=>`<span class="rskb">${esc(s)}</span>`).join('')}</div></div>`:''}
    ${S.experience.length?`<div class="rsec"><div class="rst">Experience</div>${expBlock(p)}</div>`:''}
    ${S.education.length?`<div class="rsec"><div class="rst">Education</div>${eduBlock(p+' re')}</div>`:''}
    ${S.projects.length?`<div class="rsec"><div class="rst">Projects</div>${projBlock(p)}</div>`:''}
    ${S.certifications.length?`<div class="rsec"><div class="rst">Certifications</div>${certGrid(p,'rci2')}</div>`:''}
    ${S.achievements.length?`<div class="rsec"><div class="rst">Achievements</div>${achBlock(p)}</div>`:''}
  </div>`;
}
function renderModern(){
  const p='tpl-modern';
  const edu=S.education.map(e=>`<div style="margin-bottom:9px"><div style="font-size:.78rem;font-weight:700;color:#fff">${esc(e.school)}</div><div style="font-size:.7rem;color:rgba(255,255,255,.65)">${[e.degree,e.field].filter(Boolean).map(esc).join(', ')}</div><div style="font-size:.65rem;color:rgba(255,255,255,.38);margin-top:1px">${esc(e.startYear)}${e.startYear&&e.endYear?' – ':''}${esc(e.endYear)}</div></div>`).join('');
  const certs=S.certifications.map(c=>`<div class="rcert-item"><div class="rcert-name">${esc(c.name)}</div><div class="rcert-iss">${esc(c.issuer)}</div><div class="rcert-meta">${c.issueDate?esc(c.issueDate):''}${c.expiryDate?' – '+esc(c.expiryDate):''}</div></div>`).join('');
  const achs=S.achievements.map(a=>`<div class="ra-item"><div class="ra-bullet">★</div><div><div class="rat">${esc(a.title)}</div><div class="radc">${esc(a.description)}</div></div></div>`).join('');
  return `<div class="resume-paper ${p}">
    <div class="rm-left">
      <div><div class="rm-name">${esc(S.fullName)||'Your Name'}</div><div class="rm-role">${esc(S.jobTitle)}</div></div>
      <div class="rm-divider"></div>
      <div><div class="rm-sec-title">Contact</div>${S.email?`<div class="rm-contact-item">✉ <a href="mailto:${esc(S.email)}">${esc(S.email)}</a></div>`:''}${S.phone?`<div class="rm-contact-item">📞 ${esc(S.phone)}</div>`:''}${S.address?`<div class="rm-contact-item">📍 ${esc(S.address)}</div>`:''}${S.linkedin?`<div class="rm-contact-item">🔗 <a href="${esc(S.linkedin)}" target="_blank">${esc(S.linkedin.replace(/^https?:\/\/(www\.)?/i,''))}</a></div>`:''}${S.github?`<div class="rm-contact-item">💻 <a href="${esc(S.github)}" target="_blank">${esc(S.github.replace(/^https?:\/\/(www\.)?/i,''))}</a></div>`:''}</div>
      ${S.skills.length?`<div class="rm-divider"></div><div><div class="rm-sec-title">Skills</div><div class="rm-skills-wrap">${S.skills.map(s=>`<span class="rm-skill">${esc(s)}</span>`).join('')}</div></div>`:''}
      ${S.education.length?`<div class="rm-divider"></div><div><div class="rm-sec-title">Education</div>${edu}</div>`:''}
      ${S.certifications.length?`<div class="rm-divider"></div><div><div class="rm-sec-title">Certs</div><div class="rcert-row">${certs}</div></div>`:''}
    </div>
    <div class="rm-right">
      <div><div class="rname-big">${esc(S.fullName)||'Your Name'}</div></div>
      ${S.summary?`<div><div class="rm-right-title">Summary</div><div class="rtxt">${esc(S.summary)}</div></div>`:''}
      ${S.experience.length?`<div style="margin-top:13px"><div class="rm-right-title">Experience</div>${expBlock(p)}</div>`:''}
      ${S.projects.length?`<div style="margin-top:13px"><div class="rm-right-title">Projects</div>${projBlock(p)}</div>`:''}
      ${S.achievements.length?`<div style="margin-top:13px"><div class="rm-right-title">Achievements</div>${achs}</div>`:''}
    </div>
  </div>`;
}
function renderBold(){
  const p='tpl-bold';
  const edu=S.education.map(e=>`<div class="rb-edu-item"><div class="rb-edu-school">${esc(e.school)}</div><div class="rb-edu-deg">${[e.degree,e.field].filter(Boolean).map(esc).join(', ')}</div><div class="rb-edu-yr">${esc(e.startYear)}${e.startYear&&e.endYear?' – ':''}${esc(e.endYear)}</div></div>`).join('');
  const certs=S.certifications.map(c=>`<div class="rcert-item"><div class="rcert-name">${esc(c.name)}</div><div class="rcert-iss">${esc(c.issuer)}</div><div class="rcert-meta">${c.issueDate?'Issued: '+esc(c.issueDate):''}${c.expiryDate?' · Exp: '+esc(c.expiryDate):''}</div></div>`).join('');
  const achs=S.achievements.map(a=>`<div class="ra-item"><div class="ra-dot"></div><div><div class="rat">${esc(a.title)}</div><div class="radc">${esc(a.description)}</div><div class="radt">${esc(a.date)}</div></div></div>`).join('');
  return `<div class="resume-paper ${p}">
    <div class="rb-header"><div class="rb-name">${esc(S.fullName)||'Your Name'}</div>${S.jobTitle?`<div class="rb-role">${esc(S.jobTitle)}</div>`:''}<div class="rb-contact">${[S.email&&`<span>✉ ${esc(S.email)}</span>`,S.phone&&`<span>📞 ${esc(S.phone)}</span>`,S.address&&`<span>📍 ${esc(S.address)}</span>`,S.linkedin&&`<span>🔗 ${esc(S.linkedin.replace(/^https?:\/\/(www\.)?/i,''))}</span>`,S.github&&`<span>💻 ${esc(S.github.replace(/^https?:\/\/(www\.)?/i,''))}</span>`].filter(Boolean).join('')}</div></div>
    <div class="rb-body"><div class="rb-two-col">
      <div>${S.summary?`<div class="rsec"><div class="rst">Summary</div><div class="rtxt">${esc(S.summary)}</div></div>`:''}${S.experience.length?`<div class="rsec"><div class="rst">Experience</div>${expBlock(p)}</div>`:''}${S.projects.length?`<div class="rsec"><div class="rst">Projects</div>${projBlock(p)}</div>`:''}
      </div>
      <div>${S.skills.length?`<div class="rsec"><div class="rst">Skills</div><div>${S.skills.map(s=>`<span class="rskb">${esc(s)}</span>`).join('')}</div></div>`:''}${S.education.length?`<div class="rsec"><div class="rst">Education</div><div class="rb-edu">${edu}</div></div>`:''}${S.certifications.length?`<div class="rsec"><div class="rst">Certifications</div><div class="rcert-row">${certs}</div></div>`:''}${S.achievements.length?`<div class="rsec"><div class="rst">Achievements</div>${achs}</div>`:''}
      </div>
    </div></div>
  </div>`;
}
function renderMinimal(){
  const p='tpl-minimal';
  return `<div class="resume-paper ${p}">
    <div class="rh"><div class="rname">${esc(S.fullName)||'Your Name'}</div>${S.jobTitle?`<div class="rjobtitle">${esc(S.jobTitle)}</div>`:''}<div class="rcontact">${[S.email&&`✉ ${esc(S.email)}`,S.phone&&`📞 ${esc(S.phone)}`,S.address&&`📍 ${esc(S.address)}`,S.website&&esc(S.website.replace(/^https?:\/\/(www\.)?/i,''))].filter(Boolean).join(' · ')}</div></div>
    ${S.summary?`<div class="rsec"><div class="rst">About</div><div class="rtxt">${esc(S.summary)}</div></div>`:''}
    ${S.skills.length?`<div class="rsec"><div class="rst">Skills</div><div>${S.skills.map(s=>`<span class="rskb">${esc(s)}</span>`).join('')}</div></div>`:''}
    ${S.experience.length?`<div class="rsec"><div class="rst">Experience</div>${expBlock(p)}</div>`:''}
    ${S.education.length?`<div class="rsec"><div class="rst">Education</div>${eduBlock(p+' re')}</div>`:''}
    ${S.projects.length?`<div class="rsec"><div class="rst">Projects</div>${projBlock(p)}</div>`:''}
    ${S.certifications.length?`<div class="rsec"><div class="rst">Certifications</div><div class="rcg">${S.certifications.map(c=>`<div class="rcc"><div class="rcn">${esc(c.name)}</div><div class="rci2">${esc(c.issuer)}</div><div class="rcm">${c.issueDate?'Issued: '+esc(c.issueDate):''}</div></div>`).join('')}</div></div>`:''}
    ${S.achievements.length?`<div class="rsec"><div class="rst">Achievements</div>${S.achievements.map(a=>`<div class="ra"><div style="color:#C9A84C">★</div><div><div class="ra-n">${esc(a.title)}</div><div class="ra-dc">${esc(a.description)}</div><div class="ra-dt">${esc(a.date)}</div></div></div>`).join('')}</div>`:''}
  </div>`;
}

function renderResume(){
  const c=$('resumePreviewContainer'); if(!c)return;
  let h='';
  if(S.resumeTemplate==='classic') h=renderClassic();
  else if(S.resumeTemplate==='modern') h=renderModern();
  else if(S.resumeTemplate==='bold') h=renderBold();
  else h=renderMinimal();
  c.innerHTML=h;
  const paper=c.firstElementChild; if(paper){ paper.style.transform=`scale(${S.rZoom/100})`; }
}

function pfNav(logoColor='#fff', linkColor='rgba(255,255,255,.55)', hoverColor='#C9A84C'){
  const pages=['Home','About','Projects','Experience','Skills','Contact'];
  return `<nav><div class="pnav-logo" style="color:${logoColor}">${esc(S.fullName)||'Portfolio'}</div><div class="pnav-links">${pages.map(p=>`<a href="#" style="color:${linkColor}">${p}</a>`).join('')}</div></nav>`;
}

function buildHeroDarkPages(){
  const yearNow=new Date().getFullYear();
  const pages=[];
  
  pages.push(`<div class="pf-page pf-hero-dark">
    <div class="page-hero">
      ${pfNav()}
      <div class="hero-body">
        <div class="hero-greeting">Hello, I'm</div>
        <div class="hero-name">${esc(S.fullName)||'Your Name'}</div>
        <div class="hero-role">${esc(S.jobTitle)||'Professional Title'}</div>
        ${S.skills.length?`<div class="hero-skills">${S.skills.slice(0,7).map(s=>`<span class="h-sk">${esc(s)}</span>`).join('')}</div>`:''}
        <div class="hero-cta">${S.email?`<button class="btn-hero-primary">Contact Me</button>`:''}<button class="btn-hero-ghost">View Work</button></div>
        <div class="hero-scroll"><div class="hero-scroll-line"></div>Scroll</div>
      </div>
    </div>
  </div>`);

  if(S.summary) pages.push(`<div class="pf-page pf-hero-dark">
    <div class="page-about">
      <div class="psec-label">Who I Am</div>
      <div class="psec-title">About Me</div>
      <div class="psec-text">${esc(S.summary)}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:20px">${[S.email&&`<span style="font-size:.78rem;color:rgba(255,255,255,.5)">✉ ${esc(S.email)}</span>`,S.phone&&`<span style="font-size:.78rem;color:rgba(255,255,255,.5)">📞 ${esc(S.phone)}</span>`,S.address&&`<span style="font-size:.78rem;color:rgba(255,255,255,.5)">📍 ${esc(S.address)}</span>`].filter(Boolean).join('')}</div>
    </div>
  </div>`);

  if(S.projects.length) pages.push(`<div class="pf-page pf-hero-dark">
    <div class="page-projects">
      <div class="psec-label">What I've Built</div>
      <div class="psec-title">Projects</div>
      <div class="proj-grid">${S.projects.map((p,i)=>`<div class="proj-card"><div class="proj-num">${String(i+1).padStart(2,'0')}</div><div class="proj-name">${esc(p.name)}</div>${p.role?`<div class="proj-role">${esc(p.role)}</div>`:''}<div class="proj-desc">${esc(p.description)}</div>${p.url?`<a class="proj-link" href="${esc(p.url)}" target="_blank">View Project ↗</a>`:''}</div>`).join('')}</div>
    </div>
  </div>`);
  
  if(S.experience.length) pages.push(`<div class="pf-page pf-hero-dark">
    <div class="page-experience">
      <div class="psec-label">Where I've Worked</div>
      <div class="psec-title">Experience</div>
      <div class="exp-timeline">${S.experience.map(e=>`<div class="exp-item"><div class="exp-title">${esc(e.title)}</div><div class="exp-co">${esc(e.company)}${e.company&&e.location?' · ':''}${esc(e.location)}</div><div class="exp-date">${esc(e.startDate)}${e.startDate&&e.endDate?' – ':''}${esc(e.endDate)}</div>${e.description?`<div class="exp-desc">${esc(e.description).replace(/\n/g,'<br>')}</div>`:''}</div>`).join('')}</div>
    </div>
  </div>`);
  pages.push(`<div class="pf-page pf-hero-dark">
    ${S.skills.length?`<div class="page-skills"><div class="psec-label">What I Know</div><div class="psec-title">Skills</div><div class="skill-chips">${S.skills.map(s=>`<div class="skill-chip">${esc(s)}</div>`).join('')}</div></div>`:''}
    ${S.certifications.length?`<div class="page-certs"><div class="psec-label">Credentials</div><div class="psec-title">Certifications</div><div class="cert-grid">${S.certifications.map(c=>`<div class="cert-card"><div class="cert-name">${esc(c.name)}</div><div class="cert-iss">${esc(c.issuer)}</div><div class="cert-meta">${c.issueDate?'Issued: '+esc(c.issueDate):''}${c.expiryDate?' · Exp: '+esc(c.expiryDate):''}</div></div>`).join('')}</div></div>`:''}
    ${S.achievements.length?`<div class="page-achievements"><div class="psec-label">Highlights</div><div class="psec-title">Achievements</div><div class="ach-grid">${S.achievements.map(a=>`<div class="ach-card"><div class="ach-star">★</div><div><div class="ach-title">${esc(a.title)}${a.issuer?` <small style="opacity:.5">· ${esc(a.issuer)}</small>`:''}</div><div class="ach-desc">${esc(a.description)}</div><div class="ach-date">${esc(a.date)}</div></div></div>`).join('')}</div></div>`:''}
  </div>`);
  pages.push(`<div class="pf-page pf-hero-dark">
    <div class="page-contact">
      <div class="psec-label">Get In Touch</div>
      <div class="psec-title" style="color:#fff">Let's work together.</div>
      ${S.email?`<div class="contact-email">${esc(S.email)}</div>`:''}
      <div class="contact-links">${[S.linkedin&&`<a class="contact-link" href="${esc(S.linkedin)}" target="_blank">🔗 LinkedIn</a>`,S.github&&`<a class="contact-link" href="${esc(S.github)}" target="_blank">💻 GitHub</a>`,S.website&&`<a class="contact-link" href="${esc(S.website)}" target="_blank">🌐 Website</a>`].filter(Boolean).join('')}</div>
    </div>
    <div class="page-footer"><div class="footer-copy">© ${yearNow} ${esc(S.fullName)||'Portfolio'}</div><div class="footer-brand">Built with ResumeForge</div></div>
  </div>`);
  return pages;
}

function buildLightCardsPages(){
  const yearNow=new Date().getFullYear();
  const pages=[];
  pages.push(`<div class="pf-page pf-light-cards">
    <div class="page-hero">
      <nav><div class="pnav-logo">${esc(S.fullName)||'Portfolio'}</div><div class="pnav-links">${['About','Projects','Experience','Contact'].map(p=>`<a href="#">${p}</a>`).join('')}</div></nav>
      <div class="hero-body">
        <div class="hero-tag">Available for work</div>
        <div class="hero-name">${esc(S.fullName)||'Your Name'}</div>
        <div class="hero-role">${esc(S.jobTitle)||'Professional Title'}</div>
        ${S.skills.length?`<div class="hero-skills">${S.skills.slice(0,8).map(s=>`<span class="h-sk">${esc(s)}</span>`).join('')}</div>`:''}
        <div class="hero-contact">${[S.email&&`<a class="hc-pill" href="mailto:${esc(S.email)}">✉ ${esc(S.email)}</a>`,S.phone&&`<span class="hc-pill">📞 ${esc(S.phone)}</span>`,S.address&&`<span class="hc-pill">📍 ${esc(S.address)}</span>`,S.linkedin&&`<a class="hc-pill" href="${esc(S.linkedin)}" target="_blank">🔗 LinkedIn</a>`,S.github&&`<a class="hc-pill" href="${esc(S.github)}" target="_blank">💻 GitHub</a>`].filter(Boolean).join('')}</div>
      </div>
    </div>
  </div>`);
  if(S.summary) pages.push(`<div class="pf-page pf-light-cards"><div class="page-section"><div class="lc-label">About</div><div class="lc-title">Who I Am</div><div class="lc-about">${esc(S.summary)}</div></div></div>`);
  if(S.projects.length) pages.push(`<div class="pf-page pf-light-cards"><div class="page-section alt"><div class="lc-label">Work</div><div class="lc-title">Projects</div><div class="lc-cards">${S.projects.map(p=>`<div class="lc-card"><div class="lc-card-label">Project</div><div class="lc-proj-name">${esc(p.name)}</div>${p.role?`<div class="lc-proj-role">${esc(p.role)}</div>`:''}<div class="lc-proj-desc">${esc(p.description)}</div>${p.url?`<div class="lc-proj-link"><a href="${esc(p.url)}" target="_blank">View Project →</a></div>`:''}</div>`).join('')}</div></div></div>`);
  if(S.experience.length) pages.push(`<div class="pf-page pf-light-cards"><div class="page-section"><div class="lc-label">Career</div><div class="lc-title">Experience</div><div class="lc-exp">${S.experience.map(e=>`<div class="lc-exp-item"><div class="lc-exp-title">${esc(e.title)}</div><div class="lc-exp-co">${esc(e.company)}${e.company&&e.location?' · ':''}${esc(e.location)}</div><div class="lc-exp-date">${esc(e.startDate)}${e.startDate&&e.endDate?' – ':''}${esc(e.endDate)}</div>${e.description?`<div class="lc-exp-desc">${esc(e.description).replace(/\n/g,'<br>')}</div>`:''}</div>`).join('')}</div></div></div>`);
  pages.push(`<div class="pf-page pf-light-cards">
    ${S.skills.length?`<div class="page-section alt"><div class="lc-label">Expertise</div><div class="lc-title">Skills</div><div class="lc-skills">${S.skills.map(s=>`<span class="lc-sk">${esc(s)}</span>`).join('')}</div></div>`:''}
    ${S.certifications.length?`<div class="page-section"><div class="lc-label">Credentials</div><div class="lc-title">Certifications</div><div class="lc-cert-grid">${S.certifications.map(c=>`<div class="lc-cert"><div class="lc-cert-name">${esc(c.name)}</div><div class="lc-cert-iss">${esc(c.issuer)}</div><div class="lc-cert-meta">${c.issueDate?'Issued: '+esc(c.issueDate):''}${c.expiryDate?' · Exp: '+esc(c.expiryDate):''}</div></div>`).join('')}</div></div>`:''}
    ${S.achievements.length?`<div class="page-section alt"><div class="lc-label">Highlights</div><div class="lc-title">Achievements</div><div class="lc-ach">${S.achievements.map(a=>`<div class="lc-ach-item"><div class="lc-ach-star">★</div><div><div class="lc-ach-t">${esc(a.title)}</div><div class="lc-ach-d">${esc(a.description)}</div></div></div>`).join('')}</div></div>`:''}
    <div class="page-footer"><div class="footer-copy">© ${yearNow} ${esc(S.fullName)||'Portfolio'}</div><div class="footer-brand">Built with ResumeForge</div></div>
  </div>`);
  return pages;
}

function buildGradientPages(){
  const yearNow=new Date().getFullYear();
  const pages=[];
  pages.push(`<div class="pf-page pf-gradient">
    <div class="page-hero">
      <nav><div class="pnav-logo">${esc(S.fullName)||'Portfolio'}</div><div class="pnav-links">${['About','Projects','Experience','Contact'].map(p=>`<a href="#">${p}</a>`).join('')}</div></nav>
      <div class="hero-body">
        <div class="hero-greeting">Hi there 👋</div>
        <div class="hero-name">${esc(S.fullName)||'Your Name'}</div>
        <div class="hero-role">${esc(S.jobTitle)||'Professional Title'}</div>
        ${S.skills.length?`<div class="hero-skills">${S.skills.slice(0,8).map(s=>`<span class="h-sk">${esc(s)}</span>`).join('')}</div>`:''}
        <div class="hero-contact">${[S.email&&`<a class="hc-pill" href="mailto:${esc(S.email)}">✉ ${esc(S.email)}</a>`,S.phone&&`<span class="hc-pill">📞 ${esc(S.phone)}</span>`,S.address&&`<span class="hc-pill">📍 ${esc(S.address)}</span>`,S.website&&`<a class="hc-pill" href="${esc(S.website)}" target="_blank">🌐 Website</a>`,S.linkedin&&`<a class="hc-pill" href="${esc(S.linkedin)}" target="_blank">🔗 LinkedIn</a>`,S.github&&`<a class="hc-pill" href="${esc(S.github)}" target="_blank">💻 GitHub</a>`].filter(Boolean).join('')}</div>
      </div>
    </div>
  </div>`);
  if(S.summary) pages.push(`<div class="pf-page pf-gradient"><div class="page-section"><div class="gr-label">About</div><div class="gr-title">Who I Am</div><div class="gr-about">${esc(S.summary)}</div></div></div>`);
  if(S.projects.length) pages.push(`<div class="pf-page pf-gradient"><div class="page-section"><div class="gr-label">Work</div><div class="gr-title">Projects</div><div class="gr-proj-grid">${S.projects.map(p=>`<div class="gr-proj"><div class="gr-proj-name">${esc(p.name)}</div>${p.role?`<div class="gr-proj-role">${esc(p.role)}</div>`:''}<div class="gr-proj-desc">${esc(p.description)}</div>${p.url?`<div class="gr-proj-link"><a href="${esc(p.url)}" target="_blank">View ↗</a></div>`:''}</div>`).join('')}</div></div></div>`);
  if(S.experience.length) pages.push(`<div class="pf-page pf-gradient"><div class="page-section"><div class="gr-label">Career</div><div class="gr-title">Experience</div><div class="gr-exp">${S.experience.map(e=>`<div class="gr-exp-item"><div class="gr-exp-h"><div class="gr-exp-title">${esc(e.title)}</div><div class="gr-exp-date">${esc(e.startDate)}${e.startDate&&e.endDate?' – ':''}${esc(e.endDate)}</div></div><div class="gr-exp-co">${esc(e.company)}${e.company&&e.location?' · ':''}${esc(e.location)}</div>${e.description?`<div class="gr-exp-desc">${esc(e.description).replace(/\n/g,'<br>')}</div>`:''}</div>`).join('')}</div></div></div>`);
  pages.push(`<div class="pf-page pf-gradient">
    ${S.skills.length?`<div class="page-section"><div class="gr-label">Expertise</div><div class="gr-title">Skills</div><div class="gr-skills">${S.skills.map(s=>`<div class="gr-sk">${esc(s)}</div>`).join('')}</div></div>`:''}
    ${S.certifications.length?`<div class="page-section"><div class="gr-label">Credentials</div><div class="gr-title">Certifications</div><div class="gr-cert-grid">${S.certifications.map(c=>`<div class="gr-cert"><div class="gr-cert-name">${esc(c.name)}</div><div class="gr-cert-iss">${esc(c.issuer)}</div><div class="gr-cert-meta">${c.issueDate?'Issued: '+esc(c.issueDate):''}${c.expiryDate?' · Exp: '+esc(c.expiryDate):''}</div></div>`).join('')}</div></div>`:''}
    ${S.achievements.length?`<div class="page-section"><div class="gr-label">Wins</div><div class="gr-title">Achievements</div><div class="gr-ach">${S.achievements.map(a=>`<div class="gr-ach-item"><div class="gr-ach-dot"></div><div><div class="gr-ach-t">${esc(a.title)}</div><div class="gr-ach-d">${esc(a.description)}</div></div></div>`).join('')}</div></div>`:''}
    <div class="page-footer"><div class="footer-copy">© ${yearNow} ${esc(S.fullName)||'Portfolio'}</div><div class="footer-brand">Built with ResumeForge</div></div>
  </div>`);
  return pages;
}

function getPortfolioPages(){
  if(S.portfolioTemplate==='hero') return buildHeroDarkPages();
  if(S.portfolioTemplate==='cards') return buildLightCardsPages();
  return buildGradientPages();
}

function renderPortfolioPreview(){
  const c=$('portfolioPreviewContainer'); if(!c)return;
  const pages=getPortfolioPages();
  c.innerHTML=pages.join('');
  c.style.transform=`scale(${S.pZoom/100})`;
  c.style.transformOrigin='top center';
  c.style.width='860px';
}

function buildFullscreenPortfolio(){
  const pages=getPortfolioPages();
  const wrap=$('pfPagesWrap'); wrap.innerHTML='';
  pages.forEach((html,i)=>{
    const div=document.createElement('div'); div.className='pf-full-page'; div.id='pfpage-'+i;
    div.innerHTML=html; wrap.appendChild(div);
  });
  
  const tabsWrap=$('pfPreviewTabs'); tabsWrap.innerHTML='';
  const labels=['Home','About','Projects','Experience','Skills','Achievements','Contact'].slice(0,pages.length);
  pages.forEach((_,i)=>{
    const btn=document.createElement('button'); btn.className='pf-tab'+(i===0?' active':'');
    btn.textContent=labels[i]||`Page ${i+1}`;
    btn.addEventListener('click',()=>{
      tabsWrap.querySelectorAll('.pf-tab').forEach(t=>t.classList.remove('active')); btn.classList.add('active');
      $('pfpage-'+i)?.scrollIntoView({behavior:'smooth'});
    });
    tabsWrap.appendChild(btn);
  });
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const id=entry.target.id; const idx=parseInt(id.replace('pfpage-',''));
        if(!isNaN(idx)){ tabsWrap.querySelectorAll('.pf-tab').forEach((t,i)=>t.classList.toggle('active',i===idx)); }
      }
    });
  },{threshold:.3});
  wrap.querySelectorAll('.pf-full-page').forEach(p=>observer.observe(p));
}

function exportPdf(){
  if(!S.fullName){ toast('⚠ Add your name first.','error'); return; }
  const saved=S.rZoom; const el=$('resumePreviewContainer').firstElementChild;
  if(el) el.style.transform='scale(1)';
  window.print();
  setTimeout(()=>{ if(el) el.style.transform=`scale(${saved/100})`; },600);
  toast('✓ Print dialog opened → Save as PDF','success');
}
function exportWord(){
  if(!S.fullName){ toast('⚠ Add your name first.','error'); return; }
  const contact=[S.email,S.phone,S.address].filter(Boolean).join(' | ');
  const sec=(t,c)=>`<h2 style="font-size:11pt;font-weight:bold;color:#1E3A5F;border-bottom:1pt solid #C9A84C;padding-bottom:3pt;margin:14pt 0 6pt;text-transform:uppercase;letter-spacing:1pt">${t}</h2>${c}`;
  const row=(t,s,d,dc,url)=>`<p style="margin-bottom:8pt"><b>${esc(t)}</b>${d?`<span style="float:right;color:#6B7A99;font-size:9pt">${esc(d)}</span>`:''}${s?`<br/><span style="color:#4A5568;font-size:9.5pt">${esc(s)}</span>`:''}${dc?`<br/><span style="font-size:9.5pt;line-height:1.5">${esc(dc).replace(/\n/g,'<br/>')}</span>`:''}${url?`<br/><a href="${esc(url)}">${esc(url.replace(/^https?:\/\//,''))}</a>`:''}</p>`;
  let body=`<h1 style="font-size:22pt;font-weight:bold;color:#0A1628">${esc(S.fullName)}</h1>${S.jobTitle?`<p style="font-size:11pt;color:#C9A84C;font-weight:bold">${esc(S.jobTitle)}</p>`:''}<p style="font-size:9.5pt;color:#4A5568">${esc(contact)}</p><hr style="border:0;border-top:1.5pt solid #E2E8F0;margin:8pt 0"/>`;
  if(S.summary) body+=sec('Summary',`<p style="font-size:10pt;line-height:1.6">${esc(S.summary)}</p>`);
  if(S.skills.length) body+=sec('Skills',`<p>${S.skills.map(s=>`<span style="background:#EDF2FA;border:1pt solid #C5D0E6;padding:1pt 5pt;margin:0 2pt">${esc(s)}</span>`).join(' ')}</p>`);
  if(S.experience.length) body+=sec('Experience',S.experience.map(e=>row(e.title,`${e.company}${e.company&&e.location?' · ':''}${e.location}`,`${e.startDate}${e.startDate&&e.endDate?' – ':''}${e.endDate}`,e.description)).join(''));
  if(S.education.length) body+=sec('Education',S.education.map(e=>row(e.school,[e.degree,e.field].filter(Boolean).join(', ')+(e.gpa?' · GPA '+e.gpa:''),`${e.startYear}${e.startYear&&e.endYear?' – ':''}${e.endYear}`)).join(''));
  if(S.projects.length) body+=sec('Projects',S.projects.map(p=>row(`${p.name}${p.role?' · '+p.role:''}`,p.url||'',`${p.startDate}${p.startDate&&p.endDate?' – ':''}${p.endDate}`,p.description,p.url)).join(''));
  if(S.certifications.length) body+=sec('Certifications',S.certifications.map(c=>row(c.name,c.issuer+(c.credentialId?' · ID: '+c.credentialId:''),`${c.issueDate}${c.issueDate&&c.expiryDate?' – ':''}${c.expiryDate}`,'',c.url)).join(''));
  if(S.achievements.length) body+=sec('Achievements',S.achievements.map(a=>row(`★ ${a.title}${a.issuer?' · '+a.issuer:''}`,a.date,'',a.description)).join(''));
  const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"/><style>body{font-family:Calibri,sans-serif;font-size:10.5pt;color:#1A2540}p{margin:0 0 4pt}</style></head><body style="margin:2cm 2.2cm">${body}</body></html>`;
  const blob=new Blob([html],{type:'application/msword'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=`${(S.fullName||'Resume').replace(/\s+/g,'_')}_Resume.doc`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  toast('✓ Word file downloaded!','success');
}
function exportPortfolioHtml(){
  if(!S.fullName){ toast('⚠ Add your name first.','error'); return; }
  const pages=getPortfolioPages();
  const pfClass = S.portfolioTemplate==='hero'?'pf-hero-dark':S.portfolioTemplate==='cards'?'pf-light-cards':'pf-gradient';
  const styles = Array.from(document.styleSheets).map(ss=>{ try{ return Array.from(ss.cssRules).map(r=>r.cssText).join('\n'); }catch(e){ return ''; } }).join('\n');
  const html=`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(S.fullName)} — Portfolio</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;700;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet"/><style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',system-ui,sans-serif;overflow-x:hidden}.pf-full-page{min-height:100vh}${styles}</style></head><body>${pages.map((p,i)=>`<div class="pf-full-page" id="page-${i}">${p}</div>`).join('')}</body></html>`;
  const blob=new Blob([html],{type:'text/html'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download=`${(S.fullName||'Portfolio').replace(/\s+/g,'_')}_Portfolio.html`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  toast('✓ Portfolio HTML downloaded!','success');
}


function applyRZoom(){ const e=$('resumePreviewContainer')?.firstElementChild; if(e)e.style.transform=`scale(${S.rZoom/100})`; $('r-zoomLevel').textContent=S.rZoom+'%'; }
function applyPZoom(){ const c=$('portfolioPreviewContainer'); if(c){c.style.transform=`scale(${S.pZoom/100})`;c.style.transformOrigin='top center';} $('p-zoomLevel').textContent=S.pZoom+'%'; }

function init(){
  load(); spawnParticles(); applyDark();

  $('goResume').addEventListener('click',()=>goTo('screen-resume'));
  $('goPortfolio').addEventListener('click',()=>goTo('screen-portfolio'));
  $('darkToggleHome').addEventListener('click',()=>{ S.darkMode=!S.darkMode; applyDark(); save(); });

  $('backFromResume').addEventListener('click',()=>goTo('screen-home'));
  $('backFromPortfolio').addEventListener('click',()=>goTo('screen-home'));
  $('backFromPfPreview').addEventListener('click',()=>goTo('screen-portfolio'));

  ['darkToggleResume','darkTogglePortfolio'].forEach(id=>{ $(id)&&$(id).addEventListener('click',()=>{ S.darkMode=!S.darkMode; applyDark(); save(); }); });

  const rGrid=$('resumeTplGrid'); if(rGrid){ rGrid.replaceWith(buildTPL(RESUME_TPLS, S.resumeTemplate, id=>{ S.resumeTemplate=id; save(); renderResume(); })); }

  const pGrid=$('portfolioTplGrid'); if(pGrid){ pGrid.replaceWith(buildTPL(PORTFOLIO_TPLS, S.portfolioTemplate, id=>{ S.portfolioTemplate=id; save(); renderPortfolioPreview(); })); }

  const rFields=['fullName','jobTitle','email','phone','address','website','linkedin','github','summary'];
  rFields.forEach(k=>{ syncField('r-'+k,k); bindField('r-'+k,k,renderResume); });

  rFields.forEach(k=>{ syncField('p-'+k,k); const el=$('p-'+k); if(el) el.addEventListener('input',()=>{ S[k]=el.value; save(); renderPortfolioPreview(); }); });

  skillSection('r-skillInput','r-addSkillBtn','r-skillTags',renderResume);
  skillSection('p-skillInput','p-addSkillBtn','p-skillTags',renderPortfolioPreview);

  $('r-addExpBtn').addEventListener('click',()=>addExp('r-experienceEntries',renderResume));
  $('r-addEduBtn').addEventListener('click',()=>addEdu('r-educationEntries',renderResume));
  $('r-addProjBtn').addEventListener('click',()=>addProj('r-projectEntries',renderResume));
  $('r-addCertBtn').addEventListener('click',()=>addCert('r-certEntries',renderResume));
  $('r-addAchBtn').addEventListener('click',()=>addAch('r-achEntries',renderResume));

  $('p-addProjBtn').addEventListener('click',()=>addProj('p-projectEntries',renderPortfolioPreview));
  $('p-addExpBtn').addEventListener('click',()=>addExp('p-experienceEntries',renderPortfolioPreview));
  $('p-addCertBtn').addEventListener('click',()=>addCert('p-certEntries',renderPortfolioPreview));
  $('p-addAchBtn').addEventListener('click',()=>addAch('p-achEntries',renderPortfolioPreview));

  S.experience.forEach(e=>{ addExp('r-experienceEntries',renderResume,e); addExp('p-experienceEntries',renderPortfolioPreview,e); });
  S.education.forEach(e=>addEdu('r-educationEntries',renderResume,e));
  S.projects.forEach(p=>{ addProj('r-projectEntries',renderResume,p); addProj('p-projectEntries',renderPortfolioPreview,p); });
  S.certifications.forEach(c=>{ addCert('r-certEntries',renderResume,c); addCert('p-certEntries',renderPortfolioPreview,c); });
  S.achievements.forEach(a=>{ addAch('r-achEntries',renderResume,a); addAch('p-achEntries',renderPortfolioPreview,a); });


  $('r-zoomIn').addEventListener('click',()=>{ if(S.rZoom<150){S.rZoom+=5;applyRZoom();} });
  $('r-zoomOut').addEventListener('click',()=>{ if(S.rZoom>40){S.rZoom-=5;applyRZoom();} });
  $('p-zoomIn').addEventListener('click',()=>{ if(S.pZoom<130){S.pZoom+=5;applyPZoom();} });
  $('p-zoomOut').addEventListener('click',()=>{ if(S.pZoom>30){S.pZoom-=5;applyPZoom();} });

  $('clearResumeBtn').addEventListener('click',()=>{
    if(!confirm('Clear all resume data?'))return;
    const keep={resumeTemplate:S.resumeTemplate,portfolioTemplate:S.portfolioTemplate,darkMode:S.darkMode,rZoom:S.rZoom,pZoom:S.pZoom};
    Object.assign(S,{fullName:'',jobTitle:'',email:'',phone:'',address:'',website:'',linkedin:'',github:'',summary:'',skills:[],experience:[],education:[],projects:[],certifications:[],achievements:[],...keep});
    localStorage.removeItem('rf_v2');
    rFields.forEach(k=>{ const e=$('r-'+k); if(e) e.value=''; });
    renderTagsFor('r-skillTags',renderResume); renderTagsFor('p-skillTags',renderPortfolioPreview);
    ['r-experienceEntries','r-educationEntries','r-projectEntries','r-certEntries','r-achEntries','p-projectEntries','p-experienceEntries','p-certEntries','p-achEntries'].forEach(id=>{ const e=$(id); if(e) e.innerHTML=''; });
    renderResume(); toast('Cleared.','error');
  });


  const rem=$('resumeExportMenu');
  $('resumeExportBtn').addEventListener('click',e=>{ e.stopPropagation(); rem.classList.toggle('open'); });
  document.addEventListener('click',()=>rem?.classList.remove('open'));
  $('expPdfBtn').addEventListener('click',()=>{ rem.classList.remove('open'); exportPdf(); });
  $('expWordBtn').addEventListener('click',()=>{ rem.classList.remove('open'); exportWord(); });

  $('previewPortfolioBtn').addEventListener('click',()=>{ buildFullscreenPortfolio(); goTo('screen-pfpreview'); });
  $('downloadPortfolioBtn').addEventListener('click',()=>exportPortfolioHtml());
  $('pfDownloadBtn').addEventListener('click',()=>exportPortfolioHtml());

  renderResume();
  renderPortfolioPreview();
}

document.addEventListener('DOMContentLoaded', init);