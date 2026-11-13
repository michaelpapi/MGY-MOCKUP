/* =====================================================================
   MGY WELCOME GATE  (welcome.js)
   Load it in <head> (no defer) so the shop never flashes before the gate.
   Display-only: nothing is registered. The "password" is cosmetic, NOT security.
   ===================================================================== */
(function(){
/* ---------------- EDIT ME ---------------- */
const CONFIG={
 launch:'2026-12-05T18:00:00+01:00',   // countdown target (Lagos time = +01:00). Past date => shows 00
 password:'misguided',                 // cosmetic only - anyone can read this in the page source
 instagram:'misguidedyutes',           // handle without @
 logo:'img/welcome/log1.webp',       // the crest in the middle (spins around and around)
 /* backdrop video. Put the file at this path. If it is missing/blocked, the photo flicker below is used instead. */
 video:'img/welcome/vid1.mp4',
 poster:'',                            // optional still image shown while the video loads, e.g. 'img/welcome/vid1.jpg'
 /* fallback backdrop (used only when there is no video): flickering photos, or several clips */
 images:['img/models/T1-P4.webp','img/models/T2-P5.webp','img/models/T3-P1.webp','img/models/T7-P3.webp','img/models/T9-P4.webp','img/models/CRO1-P2.webp','img/models/CRO2-P5.webp'],
 clips:[],                             // e.g. ['img/welcome/clip1.mp4','img/welcome/clip2.mp4']
 cutMs:1500,                           // how fast the backdrop flickers between shots
 tints:['#0a1a3a','#4a1a14','#101010','#16301f'], // navy, rust, black, forest
 rememberSession:true                  // true = gate shows once per browser session. Add ?welcome to the URL to force it.
};
/* ------------------------------------------ */

const root=document.documentElement,
 forced=/[?&]welcome\b/.test(location.search);
let seen=false;try{seen=CONFIG.rememberSession&&sessionStorage.getItem('mgyEntered')=='1'}catch(e){}
if(seen&&!forced)return;
root.classList.add('gated');                       // hides the shop immediately

const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const IG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>';

function build(){
 const el=document.createElement('div');el.id='welcome';el.dataset.s='gate';
 el.setAttribute('role','dialog');el.setAttribute('aria-label','Welcome to Misguided Yutes');
 el.innerHTML=`
  <div class="w-bg" id="wBg"></div><div class="w-tint" id="wTint"></div><div class="w-fx"></div>
  <a class="w-ig" href="https://instagram.com/${CONFIG.instagram}" target="_blank" rel="noopener">${IG}<span>@${CONFIG.instagram}</span></a>
  <div class="w-main">
   <div class="w-eyebrow">MISGUIDED YUTES · DROP 01</div>
   <div class="w-logo"><div class="w-spin"><img src="${CONFIG.logo}" alt="Misguided Yutes crest"><img src="${CONFIG.logo}" alt="" aria-hidden="true"></div></div>

   <div class="w-gate" id="wGate">
    <p class="w-h">Join email list for early access</p>
    <div class="w-count" id="wCount" aria-live="off"></div>
    <form class="w-form" id="wMail" novalidate>
     <input type="email" id="wEmail" placeholder="Your email" autocomplete="email" aria-label="Email address">
     <button>Subscribe</button>
    </form>
    <p class="w-msg" id="wMsg"></p>
    <button class="w-link" id="wPwBtn" type="button">Enter using<br>password</button>
    <form class="w-form w-pass" id="wPw" novalidate>
     <input type="password" id="wPass" placeholder="Password" autocomplete="off" aria-label="Password">
     <button>Enter</button>
    </form>
   </div>

   <div class="w-enter">
    <button class="w-go" id="wGo" type="button">[ Enter world ]</button>
    <p class="w-sub">Drop 01 is live.</p>
   </div>
  </div>`;
 document.body.appendChild(el);
 /* the shop behind the gate can't be tabbed into */
 [...document.body.children].forEach(c=>{if(c!==el&&c.tagName!='SCRIPT'&&c.tagName!='svg')c.inert=true});

 backdrop();countdown();
 const $=s=>el.querySelector(s);

 /* email: display only */
 $('#wMail').addEventListener('submit',e=>{e.preventDefault();
  const v=$('#wEmail').value.trim();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v))return bad($('#wMail'),'Enter a valid email.');
  try{const l=JSON.parse(localStorage.getItem('mgyList')||'[]');if(!l.includes(v)){l.push(v);localStorage.setItem('mgyList',JSON.stringify(l))}}catch(_){}
  $('#wMsg').textContent="You're on the list.";
  $('#wMail').style.opacity=.5;$('#wEmail').disabled=true;
  setTimeout(()=>toEnter(),1300)});

 /* password: display only */
 $('#wPwBtn').addEventListener('click',()=>{$('#wGate').classList.add('pw');$('#wPass').focus()});
 $('#wPw').addEventListener('submit',e=>{e.preventDefault();
  if($('#wPass').value.trim().toLowerCase()==CONFIG.password.toLowerCase()){$('#wMsg').textContent='Access granted.';setTimeout(toEnter,700)}
  else bad($('#wPw'),'Wrong password.')});

 $('#wGo').addEventListener('click',enter);

 function bad(f,m){$('#wMsg').textContent=m;f.classList.remove('bad');void f.offsetWidth;f.classList.add('bad')}
 function toEnter(){el.dataset.s='enter';cut(true)}
 function enter(){
  el.classList.add('out');
  try{sessionStorage.setItem('mgyEntered','1')}catch(e){}
  setTimeout(()=>{el.remove();root.classList.remove('gated');
   [...document.body.children].forEach(c=>{c.inert=false});
   window.scrollTo(0,0);clearInterval(timer);clearInterval(tick)},reduce?0:900)}
 /* expose for the cut() helper below */
 build.el=el;
}

/* ---------- flickering backdrop ---------- */
let slides=[],cur=-1,timer=null,tick=null;
function backdrop(){
 const bg=document.getElementById('wBg');
 if(CONFIG.video){
  const v=document.createElement('video');
  v.className='bgv';v.src=CONFIG.video;v.muted=true;v.defaultMuted=true;v.loop=true;v.autoplay=true;v.playsInline=true;v.preload='auto';
  v.setAttribute('muted','');v.setAttribute('playsinline','');
  if(CONFIG.poster)v.poster=CONFIG.poster;
  v.addEventListener('error',flicker);                 // file missing / unsupported -> photo flicker
  bg.appendChild(v);bg.classList.add('vid');
  const p=v.play();if(p&&p.catch)p.catch(()=>{});      // autoplay blocked (e.g. low-power mode) -> poster/first frame stays
  return}
 flicker();
 function flicker(){
  const old=bg.querySelector('video');if(old)old.remove();bg.classList.remove('vid');
  const src=CONFIG.clips.length?CONFIG.clips:CONFIG.images;
  slides=src.map(s=>{
   const v=/\.(mp4|webm)$/i.test(s),n=document.createElement(v?'video':'img');
   n.src=s;n.alt='';
   if(v){n.muted=true;n.loop=true;n.playsInline=true;n.autoplay=true;n.preload='auto'}
   bg.appendChild(n);return n});
  if(!slides.length)return;
  cut(false);
  if(!reduce&&slides.length>1){clearInterval(timer);timer=setInterval(()=>cut(true),CONFIG.cutMs)}
 }
}
function cut(glitch){
 if(!slides.length)return;   // video backdrop => nothing to cut between
 let n;do{n=Math.floor(Math.random()*slides.length)}while(slides.length>1&&n==cur);
 if(slides[cur])slides[cur].classList.remove('on');
 cur=n;slides[n].classList.add('on');
 if(slides[n].play)slides[n].play().catch(()=>{});
 const t=CONFIG.tints[Math.floor(Math.random()*CONFIG.tints.length)];
 document.getElementById('wTint').style.setProperty('--tint',t);document.getElementById('wTint').style.background=t;
 if(glitch&&!reduce){const b=document.getElementById('wBg');b.classList.remove('glitch');void b.offsetWidth;b.classList.add('glitch')}
}

/* ---------- countdown ---------- */
function countdown(){
 const box=document.getElementById('wCount'),end=new Date(CONFIG.launch).getTime(),p=n=>String(n).padStart(2,'0');
 function draw(){
  let s=Math.max(0,Math.floor((end-Date.now())/1000));if(isNaN(s))s=0;
  const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),x=s%60;
  box.innerHTML=[[d,'days'],[h,'hours'],[m,'minutes'],[x,'seconds']].map(a=>`<div><b>${p(a[0])}</b><span>${a[1]}</span></div>`).join('')}
 draw();tick=setInterval(draw,1000)}

if(document.body)build();else document.addEventListener('DOMContentLoaded',build);
})();