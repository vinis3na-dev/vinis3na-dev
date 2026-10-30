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
 threeButton.textContent='INICIANDO VISUALIZAÇÃO 3D…';
 try{
  const T=await import('https://esm.sh/three@0.180.0');
  const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.2;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,40);
  camera.position.set(0,.15,8.4);
  const core=new T.Group();scene.add(core);
  const armor=new T.MeshPhysicalMaterial({color:0x111d2e,metalness:.88,roughness:.29,clearcoat:.75,clearcoatRoughness:.2});
  const steel=new T.MeshStandardMaterial({color:0x3d6282,metalness:.78,roughness:.27});
  const violet=new T.MeshPhysicalMaterial({color:0x493571,metalness:.74,roughness:.28,clearcoat:.6});
  const black=new T.MeshStandardMaterial({color:0x050b16,metalness:.53,roughness:.3});
  const cyan=new T.MeshStandardMaterial({color:0x51daed,emissive:0x10abdf,emissiveIntensity:1.8,metalness:.3,roughness:.21});
  const amber=new T.MeshStandardMaterial({color:0xa99eda,emissive:0x43336d,emissiveIntensity:.45,metalness:.62,roughness:.3});
  const white=new T.MeshBasicMaterial({color:0xe2f7ff});
  const add=(geo,mat,x=0,y=0,z=0,parent=core)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);parent.add(o);return o};
  // Slim shell, armor plating and an adult, focused optic visor.
  const head=add(new T.SphereGeometry(1,60,48),armor,0,.44,0);
  head.scale.set(1.04,1.06,.87);
  const visor=add(new T.SphereGeometry(.93,54,40),black,0,.38,.26);
  visor.scale.set(1,.72,.79);
  const brow=add(new T.TorusGeometry(.96,.035,8,100,Math.PI*1.18),steel,0,.56,.30);
  brow.rotation.z=-.18;
  for(const side of [-1,1]){
   const ear=add(new T.CylinderGeometry(.31,.31,.16,44),violet,side*1.04,.41,-.04);
   ear.rotation.z=Math.PI/2;
   const earRing=add(new T.TorusGeometry(.23,.045,9,48),cyan,side*1.14,.41,-.04);
   earRing.rotation.y=Math.PI/2;
   const eye=add(new T.SphereGeometry(.23,30,18),cyan,side*.36,.31,1.015);
   eye.scale.set(1.15,.48,.24);
   const iris=add(new T.SphereGeometry(.07,18,12),black,side*.36,.31,1.084);
   iris.scale.set(.9,1.2,.22);
   const glare=add(new T.SphereGeometry(.026,12,8),white,side*.36-.052,.348,1.097);
   const eyelid=add(new T.BoxGeometry(.52,.075,.10),armor,side*.36,.414,1.012);
   eyelid.rotation.z=side*.17;
   for(let i=0;i<6;i++){
    const rivet=add(new T.SphereGeometry(.022,8,6),i%3===0?cyan:steel,side*(.36+i*.095),.83-i*.06,.64-i*.12);
    rivet.scale.set(.85,.75,.75);
   }
  }
  // Layered halo, shoulder housing and mechanical joints.
  const crown=add(new T.TorusGeometry(1.06,.028,10,110),amber,0,.50,.05);
  crown.rotation.x=.28;
  const neck=add(new T.CylinderGeometry(.42,.56,.43,30),steel,0,-.62,.04);
  const chest=add(new T.SphereGeometry(.48,30,22),violet,0,-.77,.27);
  chest.scale.set(1.0,.7,.75);
  const coreGem=add(new T.IcosahedronGeometry(.10,1),cyan,0,-.75,.66);
  const arms=[];
  for(let i=0;i<8;i++){
   const angle=(i+.1)*Math.PI/4,dx=Math.cos(angle),dz=Math.sin(angle);
   const curve=new T.CatmullRomCurve3([
    new T.Vector3(dx*.28,-.78,dz*.25),
    new T.Vector3(dx*.66,-1.06,dz*.57),
    new T.Vector3(dx*1.32,-1.44,dz*1.07),
    new T.Vector3(dx*2.16,-1.21,dz*1.55),
    new T.Vector3(dx*2.47,-.56,dz*1.42),
    new T.Vector3(dx*2.22,-.15,dz*1.12)
   ]);
   const geo=new T.TubeGeometry(curve,64,.118,10,false);
   const mesh=add(geo,i%2?steel:violet);
   const pos=geo.getAttribute('position');
   arms.push({geo,pos,original:Float32Array.from(pos.array),angle:i*.93});
   for(let j=3;j<=17;j++){
    const t=j/20,p=curve.getPoint(t);
    const sucker=add(new T.SphereGeometry(.035,10,8),j%4===0?cyan:amber,p.x,p.y-.08,p.z+.067);
    sucker.scale.set(1,.7,.55);
   }
   const tip=curve.getPoint(1);
   add(new T.SphereGeometry(.076,14,10),i%2?cyan:steel,tip.x,tip.y,tip.z);
  }
  // A floating orbital platform and distant particles ground the model in space.
  const ring=add(new T.TorusGeometry(2.65,.025,9,140),cyan,0,-1.65,0,scene);
  ring.rotation.x=Math.PI/2.17;
  const ring2=add(new T.TorusGeometry(2.20,.015,8,120),violet,0,-1.64,0,scene);
  ring2.rotation.x=Math.PI/2;
  const particles=new T.BufferGeometry(),coords=[];
  for(let i=0;i<95;i++){
   coords.push((Math.random()-.5)*11,(Math.random()-.5)*7,-3-Math.random()*4);
  }
  particles.setAttribute('position',new T.Float32BufferAttribute(coords,3));
  const stars=new T.Points(particles,new T.PointsMaterial({color:0x99dfff,size:.026,transparent:true,opacity:.60}));
  scene.add(stars);
  scene.add(new T.HemisphereLight(0xc5dbf7,0x161229,2.8));
  const key=new T.PointLight(0x71dfff,105,25);key.position.set(-3,3,5);scene.add(key);
  const rim=new T.PointLight(0x9867df,140,25);rim.position.set(3,0,-2);scene.add(rim);
  const warm=new T.PointLight(0x7e87b7,48,16);warm.position.set(4,-3,4);scene.add(warm);
  let raf=0;
  const resize=()=>{
   const box=canvas.getBoundingClientRect();
   if(box.width<2||box.height<2)return;
   renderer.setSize(box.width,box.height,false);
   camera.aspect=box.width/box.height;camera.updateProjectionMatrix();
  };
  const ro=new ResizeObserver(resize);ro.observe(canvas);resize();
  function render(time){
   raf=requestAnimationFrame(render);
   if(!threeActive||document.hidden)return;
   if(!reduced){
    core.rotation.y=Math.sin(time*.00025)*.16+currentX*.0026;
    core.rotation.x=-.05-currentY*.0018;
    core.position.y=Math.sin(time*.00065)*.08;
    ring.rotation.z=time*.000045;
    ring2.rotation.z=-time*.00006;
    for(const arm of arms){
     const {pos,original,geo,angle}=arm;
     for(let i=0;i<pos.count;i++){
      const t=Math.floor(i/11)/64,base=i*3;
      const strength=Math.pow(t,1.7);
      pos.array[base]=original[base]+Math.cos(time*.00085+angle+t*5)*.10*strength;
      pos.array[base+1]=original[base+1]+Math.sin(time*.0011+angle+t*5)*.14*strength;
     }
     pos.needsUpdate=true;geo.computeVertexNormals();
    }
   }
   renderer.render(scene,camera);
  }
  raf=requestAnimationFrame(render);
  threeDispose=()=>{
   cancelAnimationFrame(raf);ro.disconnect();renderer.dispose();
   scene.traverse(o=>{if(o.geometry)o.geometry.dispose()});
   for(const m of [armor,steel,violet,black,cyan,amber,white])m.dispose();
   stars.material.dispose();
  };
  threeReady=true;return true;
 }catch(e){
  console.warn('Modelo WebGL indisponível; mantendo arte cinematográfica.',e);
  threeButton.textContent='3D INDISPONÍVEL';threeButton.disabled=true;
  return false;
 }finally{if(threeReady)threeButton.disabled=false;}
}
threeButton.addEventListener('click',async()=>{if(!threeActive){canvas.hidden=false;const ok=await startThree();if(!ok){canvas.hidden=true;return}threeActive=true;space.classList.add('three-active');threeButton.textContent='VOLTAR À ARTE CINEMATOGRÁFICA';threeButton.setAttribute('aria-pressed','true')}else{threeActive=false;space.classList.remove('three-active');canvas.hidden=true;threeButton.textContent='VISUALIZAR MODELO 3D ↗';threeButton.setAttribute('aria-pressed','false')}});
addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();threeDispose()},{once:true});
