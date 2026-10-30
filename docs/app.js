'use strict';
const $=(s)=>document.querySelector(s), $$=(s)=>[...document.querySelectorAll(s)];
const media=matchMedia('(prefers-reduced-motion: reduce)');let reduced=media.matches;
const menu=$('#menuToggle'),nav=$('#siteNav');
menu.addEventListener('click',()=>{const opened=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(opened));menu.setAttribute('aria-label',opened?'Fechar menu':'Abrir menu');menu.textContent=opened?'✕':'☰';});
$$('.site-header nav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.textContent='☰';}));
const progress=$('#scrollLine');let scrollPending=false;
function progressUpdate(){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=max?`${Math.min(100,scrollY/max*100)}%`:'0%';scrollPending=false;}
addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(progressUpdate)}},{passive:true});progressUpdate();
const filters=$$('.filter'),cards=$$('.project');
filters.forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.filter;filters.forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});cards.forEach(card=>card.hidden=category!=='todos'&&!card.dataset.category.split(' ').includes(category));}));
const rooms={
 kraken:{name:'KRAKEN Code',kind:'// DESENVOLVIMENTO ASSISTIDO',desc:'Ambiente desktop para apoiar processos de programação e integrar ferramentas de inteligência artificial.',image:'assets/project-kraken-code.webp',stack:['Electron','React','TypeScript'],roadmap:['Verificar integração de provedores de IA','Consolidar validações e empacotamento Windows','Melhorar a experiência de uso'],url:'https://github.com/vinis3na-dev/kraken-code',private:true},
 cerebri:{name:'Cerebri Digital',kind:'// SISTEMAS NEURAIS',desc:'Pesquisa experimental em redes neurais, memória, planejamento, aprendizado e coordenação de agentes.',image:'assets/neural-atmosphere.webp',stack:['Python','SNN','Agentes'],roadmap:['Documentar experimentos reproduzíveis','Ampliar cenários de avaliação','Explorar visualização neural'],url:null},
 renegade:{name:'Renegade Wars',kind:'// SIMULAÇÃO ESPACIAL',desc:'Conceito de universo espacial 3D procedural em C#, com renderização e sistemas próprios.',image:'assets/project-renegade-wars.webp',stack:['C#','.NET','3D'],roadmap:['Evoluir o renderer','Criar cenas demonstráveis','Validar desempenho'],url:null},
 afterfall:{name:'Afterfall',kind:'// SOBREVIVÊNCIA & NPCs',desc:'Experimentos de jogo em Godot, combinando mundo persistente, sobrevivência e personagens autônomos.',image:'assets/project-afterfall.webp',stack:['Godot','GDScript','Simulação'],roadmap:['Corrigir regressões de compilação','Validar saves e interações','Executar testes dos sistemas de NPC'],url:'https://github.com/vinis3na-dev/AFTERFALL',private:true},
 obras:{name:'Obra-Pronta',kind:'// SISTEMAS OPERACIONAIS',desc:'Aplicação de gestão de obras, estoques, requisições e processos operacionais.',image:'assets/project-obra-pronta.webp',stack:['Web','Gestão','Backend'],roadmap:['Validar processos de estoque','Revisar integração e segurança','Documentar instalação'],url:null}
};
let activeRoom='kraken';const labButtons=$$('.lab-tab'),labBackground=$('#labBackground'),labLink=$('#labLink'),status=$('#commandStatus');
let audioOn=false,audioCtx=null;
function feedback(){if(!audioOn)return;try{const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)throw Error('AudioContext unavailable');audioCtx??=new AudioCtx();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type='sine';o.frequency.setValueAtTime(330,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(435,audioCtx.currentTime+.12);g.gain.setValueAtTime(.011,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+.2);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.21);}catch{audioOn=false;$('#soundToggle').textContent='SOM: INDISPONÍVEL';}}
function showRoom(id,scroll=false){const room=rooms[id];if(!room)return;activeRoom=id;labButtons.forEach(b=>{const selected=b.dataset.room===id;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
// Crossfade the full-size art; update data separately and avoid fake live telemetry.
const image=new Image();image.src=room.image;const apply=()=>{labBackground.style.backgroundImage=`url("${room.image}")`;labBackground.style.opacity='1';labBackground.style.transform='scale(1.04)';};if(!reduced){labBackground.style.opacity='.45';labBackground.style.transform='scale(1.09)';if(image.complete)apply();else{image.onload=apply;image.onerror=apply;}}else apply();
$('#labKind').textContent=room.kind;$('#labName').textContent=room.name;$('#labDescription').textContent=room.desc;$('#labStatus').textContent='SYSTEM 0'+(Object.keys(rooms).indexOf(id)+1);const facts=$('#labFacts');facts.replaceChildren(...room.stack.map(s=>{const el=document.createElement('span');el.textContent=s;return el;}));labLink.hidden=!room.url;if(room.url)labLink.href=room.url;$('#labPrivacy').hidden=!room.private;status.textContent=`SALA SELECIONADA: ${room.name.toUpperCase()}`;feedback();if(scroll)$('#laboratorio').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});}
labButtons.forEach(b=>b.addEventListener('click',()=>showRoom(b.dataset.room)));
$$('[data-open-room]').forEach(b=>b.addEventListener('click',()=>showRoom(b.dataset.openRoom,true)));showRoom(activeRoom);
const dialog=$('#detailDialog');$('#labDetails').addEventListener('click',()=>{const r=rooms[activeRoom];$('#detailTitle').textContent=r.name;$('#detailText').textContent=r.desc;$('#detailStack').replaceChildren(...r.stack.map(x=>{const span=document.createElement('span');span.textContent=x;return span}));$('#detailRoadmap').replaceChildren(...r.roadmap.map(x=>{const li=document.createElement('li');li.textContent=x;return li}));dialog.showModal();});$('#closeDialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
$('#soundToggle').addEventListener('click',()=>{audioOn=!audioOn;$('#soundToggle').setAttribute('aria-pressed',String(audioOn));$('#soundToggle').textContent='SOM: '+(audioOn?'LIGADO':'DESLIGADO');feedback()});
const motionToggle=$('#motionToggle');function motionLabel(){motionToggle.textContent='MOVIMENTO: '+(reduced?'REDUZIDO':'LIGADO');motionToggle.setAttribute('aria-pressed',String(reduced))};motionLabel();motionToggle.addEventListener('click',()=>{reduced=!reduced;document.body.classList.toggle('reduce-motion',reduced);motionLabel()});media.addEventListener?.('change',e=>{reduced=e.matches;document.body.classList.toggle('reduce-motion',reduced);motionLabel()});
// Render-loop only when needed. Smoothing and pointer parallax use small values, never fake telemetry.
const hero=$('.hero'),space=$('.hero-space');let targetX=0,targetY=0,currentX=0,currentY=0,frame=0,visible=true;
hero.addEventListener('pointermove',e=>{if(reduced)return;const r=hero.getBoundingClientRect();targetX=((e.clientX-r.left)/r.width-.5)*42;targetY=((e.clientY-r.top)/r.height-.5)*35;});hero.addEventListener('pointerleave',()=>{targetX=0;targetY=0});
const observer=new IntersectionObserver(e=>{visible=e[0]?.isIntersecting??true},{threshold:.01});observer.observe(hero);
function smooth(){frame=requestAnimationFrame(smooth);if(reduced||!visible||document.hidden)return;currentX+=(targetX-currentX)*.06;currentY+=(targetY-currentY)*.06;space.style.setProperty('--mx',currentX.toFixed(2)+'px');space.style.setProperty('--my',currentY.toFixed(2)+'px')};frame=requestAnimationFrame(smooth);
// V3 optional Three.js: render a real procedural metallic Kraken when user chooses 3D.
// Photographic illustration remains the default visual so CDN/WebGL failures cannot degrade the site.
let threeReady=false,threeActive=false,threeDispose=()=>{};const canvas=$('#threeCanvas'),threeButton=$('#threeToggle');
async function startThree(){
 if(threeReady)return true;
 threeButton.disabled=true;
 threeButton.textContent='CARREGANDO KRAKEN CINEMATOGRÁFICO…';
 try{
  const {createKrakenStage}=await import('./kraken-v3-immersive.js');
  const stage=await createKrakenStage({
    canvas,
    isActive:()=>threeActive,
    isReduced:()=>reduced,
    pointer:()=>({x:currentX,y:currentY})
  });
  threeDispose=stage.dispose;
  threeReady=true;
  return true;
 }catch(e){
  console.warn('Visualização 3D indisponível; mantendo arte cinematográfica.',e);
  threeButton.textContent='3D INDISPONÍVEL';
  threeButton.disabled=true;
  return false;
 }finally{
  if(threeReady)threeButton.disabled=false;
 }
}
threeButton.addEventListener('click',async()=>{if(!threeActive){canvas.hidden=false;const ok=await startThree();if(!ok){canvas.hidden=true;return}threeActive=true;space.classList.add('three-active');hero.classList.add('three-view');threeButton.textContent='VOLTAR À ARTE CINEMATOGRÁFICA';threeButton.setAttribute('aria-pressed','true')}else{threeActive=false;space.classList.remove('three-active');hero.classList.remove('three-view');canvas.hidden=true;threeButton.textContent='VISUALIZAR MODELO 3D ↗';threeButton.setAttribute('aria-pressed','false')}});
addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();threeDispose()},{once:true});
