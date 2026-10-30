/*
 * KRAKEN Command Center V3 — cinematic articulated creature.
 * Procedural 3D, independent module; no telemetry, no external 3D assets.
 * Only requested after the visitor enables the optional 3D mode.
 */
export async function createKrakenStage({canvas,isActive,isReduced,pointer}){
  const T=await import('https://esm.sh/three@0.180.0');
  const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance',premultipliedAlpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.2;
  const scene=new T.Scene();
  // Render real reflected studio light cards into a PMREM environment.
  // PBR metals otherwise appear unlit/flat without a panorama or HDR source.
  const studio=new T.Scene();
  studio.background=new T.Color(0x0b1020);
  const panel=(x,y,z,w,h,color,angle=0)=>{
    const g=new T.PlaneGeometry(w,h);
    const m=new T.MeshBasicMaterial({color,side:T.DoubleSide});
    const p=new T.Mesh(g,m);p.position.set(x,y,z);p.rotation.y=angle;
    studio.add(p);disposables.push(()=>{g.dispose();m.dispose()});
  };
  const camera=new T.PerspectiveCamera(32,1,.1,50);
  camera.position.set(0,.35,9.9);
  const root=new T.Group();root.rotation.y=-.10;scene.add(root);
  const meshList=[],matList=[],geometries=[],disposables=[];
  panel(-3,3,3,2,5,0x9bdcf8,-.65);
  panel(3,2,-1,2,6,0xb69bea,.55);
  panel(1,-3,4,4,1.2,0xe4dfff,-.2);
  panel(-2,0,-4,1,5,0x4565bd,0);
  const pmrem=new T.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envTarget=pmrem.fromScene(studio,.02);
  scene.environment=envTarget.texture;
  disposables.push(()=>{envTarget.dispose();pmrem.dispose()});
  function mat(p){const m=new T.MeshPhysicalMaterial(p);matList.push(m);return m}
  const graphite=mat({color:0x162538,metalness:.83,roughness:.29,clearcoat:.85,clearcoatRoughness:.17});
  const armor=mat({color:0x22384c,metalness:.88,roughness:.24,clearcoat:.70,clearcoatRoughness:.13});
  const silver=mat({color:0x476b81,metalness:.78,roughness:.24,clearcoat:.75});
  const black=mat({color:0x020a13,metalness:.25,roughness:.18,clearcoat:1});
  const ceramic=mat({color:0x303454,metalness:.67,roughness:.28,clearcoat:.8});
  const cyan=mat({color:0x5bcde5,emissive:0x139ac5,emissiveIntensity:1.45,metalness:.25,roughness:.25});
  const violet=mat({color:0x8167b5,emissive:0x3b237d,emissiveIntensity:.80,metalness:.46,roughness:.25});
  const boneMetal=mat({color:0x647f91,metalness:.75,roughness:.23,clearcoat:.55});
  const pearl=new T.MeshBasicMaterial({color:0xecfdff});matList.push(pearl);
  function mesh(g,m,parent=root){geometries.push(g);const o=new T.Mesh(g,m);parent.add(o);meshList.push(o);return o}
  function position(o,x,y,z){o.position.set(x,y,z);return o}
  const V=(x,y,z)=>new T.Vector3(x,y,z);
  function line(points,r,m,parent=root,segments=60){
    const curve=new T.CatmullRomCurve3(points);
    return mesh(new T.TubeGeometry(curve,segments,r,7,false),m,parent);
  }
  // Calibrated undershell and an angular crown that avoids the toy-sphere silhouette.
  const profile=[
    [0,-.55],[.54,-.54],[.78,-.37],[.94,-.10],[1.01,.24],
    [1.02,.57],[.94,.93],[.76,1.21],[.44,1.40],[.10,1.46],[0,1.46]
  ].map(v=>new T.Vector2(v[0],v[1]));
  const shell=mesh(new T.LatheGeometry(profile,96),graphite);
  shell.scale.z=.88;
  // Eight distinct panels, each with a seam, cast from independent sectors.
  for(let sector=0;sector<8;sector++){
    const a=sector*Math.PI/4;
    const panel=mesh(new T.LatheGeometry(profile.map(v=>new T.Vector2(v.x*1.015,v.y)),14,a+.030,Math.PI/4-.06),sector%2?armor:ceramic);
    panel.scale.z=.89; panel.position.y=.008;
    const rivets=[-.31,.17,.60,1.05];
    for(const y of rivets){
      const radius=y<0?.87:y<.5?1.025:y<1?.96:.68;
      const x=Math.sin(a+.38)*radius;
      const z=Math.cos(a+.38)*radius*.90;
      const r=position(mesh(new T.SphereGeometry(.020,8,6),sector%3===0?cyan:silver),x,y,z);
      r.scale.set(.9,1.0,.6);
    }
  }
  for(const y of [-.44,-.03,.62,1.11]){
    const ring=position(mesh(new T.TorusGeometry(y>1?.68:y>.4?1.015:y<-.3?.77:1.016,.017,7,120),silver),0,y,0);
    ring.rotation.x=Math.PI/2; ring.scale.y=.90;
  }
  // Recessed panoramic faceplate; two slender optic slits instead of large cartoon eyes.
  const face=position(mesh(new T.SphereGeometry(.85,58,38),black),0,.32,.27);
  face.scale.set(1.01,.57,.87);
  const eyeAssembly=new T.Group();root.add(eyeAssembly);
  for(const side of [-1,1]){
    const brow=position(mesh(new T.BoxGeometry(.58,.07,.11),graphite,eyeAssembly),side*.38,.49,1.014);
    brow.rotation.z=side*.16;
    // Narrow, angular optical aperture: deliberate instrument design, not a cartoon eye.
    const opticBack=position(mesh(new T.BoxGeometry(.45,.106,.052),black,eyeAssembly),side*.375,.375,1.016);
    opticBack.rotation.z=side*.15;
    const optic=position(mesh(new T.BoxGeometry(.36,.032,.020),cyan,eyeAssembly),side*.375,.375,1.064);
    optic.rotation.z=side*.15;
    const sensor=position(mesh(new T.BoxGeometry(.018,.044,.025),violet,eyeAssembly),side*.375,.375,1.082);
    sensor.rotation.z=side*.15;
    const slitGlint=position(mesh(new T.BoxGeometry(.065,.011,.014),pearl,eyeAssembly),side*.375-.11,.383,1.083);
    slitGlint.rotation.z=side*.15;
    const earpiece=position(mesh(new T.CylinderGeometry(.34,.34,.20,44),graphite),side*1.045,.45,-.06);
    earpiece.rotation.z=Math.PI/2;
    const earRing=position(mesh(new T.TorusGeometry(.255,.043,10,60),violet),side*1.17,.45,-.06);
    earRing.rotation.y=Math.PI/2;
    position(mesh(new T.TorusGeometry(.12,.025,8,32),cyan),side*1.18,.45,-.06).rotation.y=Math.PI/2;
  }
  // Central optical rangefinder and subdued visor seams.
  const rangefinder=position(mesh(new T.BoxGeometry(.09,.17,.057),steel,eyeAssembly),0,.20,1.031);
  const coreSensor=position(mesh(new T.BoxGeometry(.027,.065,.064),cyan,eyeAssembly),0,.20,1.073);
  // V-shaped engineered face contours and subtle panel etching.
  for(const side of [-1,1]){
    line([V(side*.12,.97,.69),V(side*.31,.82,.76),V(side*.54,.70,.73),V(side*.73,.61,.57)],.014,silver,root,36);
    line([V(side*.13,-.06,.79),V(side*.38,-.13,.74),V(side*.61,-.23,.58)],.011,armor,root,32);
    const antenna=position(mesh(new T.BoxGeometry(.035,.17,.07),violet),side*.68,1.19,.40);
    antenna.rotation.z=-side*.26;
  }
  // Engraved crest, segmented neck and a suspended reactor.
  position(mesh(new T.CylinderGeometry(.50,.66,.42,40),armor),0,-.62,0);
  const chest=position(mesh(new T.SphereGeometry(.51,40,30),ceramic),0,-.73,.16);
  chest.scale.set(1,.69,.75);
  position(mesh(new T.IcosahedronGeometry(.13,2),cyan),0,-.80,.61);
  for(let i=0;i<12;i++){
    const a=i*Math.PI*2/12;
    position(mesh(new T.BoxGeometry(.085,.18,.12),i%3===0?violet:silver),Math.cos(a)*.48,-.76,Math.sin(a)*.42);
  }
  // Skinning on the GPU, each appendage driven by a chain of 13 bones.
  // Each bone animates independently and carries its metallic armor bands.
  const arms=[];
  const count=8,sections=84,radial=12,boneCount=13;
  const ringGeometry=new T.TorusGeometry(1,.1,7,16);
  for(let index=0;index<count;index++){
    const angle=(index+.22)*Math.PI*2/count;
    const ux=Math.cos(angle),uz=Math.sin(angle);
    const spread=index%2===0?1:1.09;
    const points=[
      V(ux*.32,-.78,uz*.31),
      V(ux*.72,-1.18,uz*.68),
      V(ux*1.34,-1.54,uz*1.1),
      V(ux*2.03,-1.33,uz*1.36),
      V(ux*2.49,-.72,uz*1.21),
      V(ux*2.46,-.17,uz*.94),
      V(ux*2.18,.10,uz*.86)
    ].map(p=>p.multiplyScalar(spread));
    const curve=new T.CatmullRomCurve3(points);
    const centers=Array.from({length:sections+1},(_,i)=>curve.getPoint(i/sections));
    const g=new T.TubeGeometry(curve,sections,1,radial,false);
    const pos=g.getAttribute('position');
    const ids=[],weights=[];
    for(let i=0;i<=sections;i++){
      const t=i/sections,tip=Math.pow(t,.72);
      const radius=.18*(1-tip)+.045;
      const c=centers[i];
      const b=Math.min(boneCount-1,t*(boneCount-1)),lo=Math.floor(b),hi=Math.min(boneCount-1,lo+1),w=b-lo;
      for(let j=0;j<=radial;j++){
        const n=i*(radial+1)+j;
        const x=pos.getX(n),y=pos.getY(n),z=pos.getZ(n);
        pos.setXYZ(n,c.x+(x-c.x)*radius,c.y+(y-c.y)*radius,c.z+(z-c.z)*radius);
        ids.push(lo,hi,0,0);weights.push(1-w,w,0,0);
      }
    }
    pos.needsUpdate=true;g.computeVertexNormals();
    g.setAttribute('skinIndex',new T.Uint16BufferAttribute(ids,4));
    g.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
    const skinned=new T.SkinnedMesh(g,index%2?armor:ceramic);
    skinned.frustumCulled=false;root.add(skinned);geometries.push(g);
    const bones=[];
    for(let b=0;b<boneCount;b++){
      const o=new T.Bone();const p=curve.getPoint(b/(boneCount-1));
      o.position.copy(b? p.sub(curve.getPoint((b-1)/(boneCount-1))):p);
      if(b)bones[b-1].add(o);bones.push(o);
    }
    skinned.add(bones[0]);skinned.bind(new T.Skeleton(bones));
    // Architectural armouring and suckers are attached to individual bones.
    for(let b=1;b<boneCount;b++){
      const t=b/(boneCount-1),r=.18*(1-Math.pow(t,.72))+.045;
      const tangent=curve.getTangent(t).normalize(),joint=bones[b];
      const segment=mesh(new T.TorusGeometry(r*1.02,.014,7,20),b%3===0?cyan:boneMetal,joint);
      segment.quaternion.setFromUnitVectors(V(0,0,1),tangent);
      // One row of recessed suction assemblies on the inward side.
      if(b%2===0){
        const cup=mesh(new T.TorusGeometry(r*.28,.015,6,14),b%4===0?violet:silver,joint);
        cup.position.y=-r*.72;cup.position.z=r*.25;
        cup.rotation.x=.45;
      }
    }
    arms.push({bones,phase:index*.78});
  }
  // Soft additive optical glow, generated locally from a radial alpha mask.
  const flareCanvas=document.createElement('canvas');
  flareCanvas.width=flareCanvas.height=128;
  const ctx=flareCanvas.getContext('2d');
  if(ctx){
    const grad=ctx.createRadialGradient(64,64,1,64,64,62);
    grad.addColorStop(0,'rgba(255,255,255,.95)');
    grad.addColorStop(.13,'rgba(180,230,255,.52)');
    grad.addColorStop(.45,'rgba(100,185,255,.16)');
    grad.addColorStop(1,'rgba(0,40,100,0)');
    ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);
  }
  const flareTexture=new T.CanvasTexture(flareCanvas);
  disposables.push(()=>flareTexture.dispose());
  const flare=(x,y,z,s,color,opacity=.28,parent=root)=>{
    const material=new T.SpriteMaterial({map:flareTexture,color,transparent:true,opacity,blending:T.AdditiveBlending,depthWrite:false,depthTest:true});
    const sprite=new T.Sprite(material);sprite.position.set(x,y,z);sprite.scale.set(s,s,1);parent.add(sprite);matList.push(material);return sprite;
  };
  flare(-.375,.39,1.12,.38,0x5ac9ee,.18);
  flare(.375,.39,1.12,.38,0x5ac9ee,.18);
  flare(0,-.80,.77,.50,0x70daff,.25);
  // A restrained orbital apparatus, not a fantasy halo overlay.
  const platform=new T.Group();scene.add(platform);
  const floorRing=position(mesh(new T.TorusGeometry(2.78,.024,8,150),cyan,platform),0,-1.85,0);
  flare(-1.65,-1.78,0,.7,0x76cfe8,.12,platform);
  flare(1.65,-1.78,0,.7,0x977dec,.11,platform);
  floorRing.rotation.x=Math.PI/2.28;
  const innerRing=position(mesh(new T.TorusGeometry(2.27,.010,7,120),violet,platform),0,-1.84,0);
  innerRing.rotation.x=Math.PI/2;
  for(let i=0;i<24;i++){
    const a=i*Math.PI/12;
    const segment=position(mesh(new T.BoxGeometry(.18,.022,.042),i%3===0?cyan:silver,platform),Math.cos(a)*2.55,-1.83,Math.sin(a)*2.55);
    segment.rotation.y=-a;
  }
  // Stars: cinematic spatial depth without invented data.
  const starsGeo=new T.BufferGeometry(),starsPos=[];
  for(let i=0;i<165;i++){
    const u=Math.sin(i*127.13)*43758.5453,v=Math.sin(i*78.233)*9031.7,w=Math.sin(i*39.832)*35113.0;
    starsPos.push((u-Math.floor(u)-.5)*15,(v-Math.floor(v)-.5)*9,-4-(w-Math.floor(w))*5);
  }
  starsGeo.setAttribute('position',new T.Float32BufferAttribute(starsPos,3));
  geometries.push(starsGeo);
  const starsMaterial=new T.PointsMaterial({size:.027,color:0x9ed9e9,transparent:true,opacity:.63,depthWrite:false});
  matList.push(starsMaterial);
  scene.add(new T.Points(starsGeo,starsMaterial));
  const ambient=new T.HemisphereLight(0xd5e7f5,0x0a0d22,2.6);scene.add(ambient);
  const key=new T.PointLight(0x65c8f7,145,24,1.9);key.position.set(-3.1,3.6,4.8);scene.add(key);
  const rim=new T.PointLight(0x9871d7,125,20,1.8);rim.position.set(3.6,.7,-1.5);scene.add(rim);
  const fill=new T.PointLight(0x7d9bc5,45,20);fill.position.set(3,-3,4);scene.add(fill);
  let alive=true,frame=0,last=0;
  const resize=()=>{
    const rect=canvas.getBoundingClientRect();
    if(rect.width<2||rect.height<2)return;
    renderer.setSize(rect.width,rect.height,false);
    camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix();
  };
  const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
  const loop=(time)=>{
    if(!alive)return;
    frame=requestAnimationFrame(loop);
    if(!isActive()||document.hidden)return;
    // Honor reduced motion. 24fps cap for slow devices to keep desktop responsive.
    if(time-last<20)return;
    const dt=Math.min(.05,(time-last)/1000||0);last=time;
    if(!isReduced()){
      const p=pointer();
      root.rotation.y+=((-0.10+Math.sin(time*.00022)*.17+p.x*.003)-root.rotation.y)*Math.min(1,dt*2.6);
      root.rotation.x+=((-0.035-p.y*.0015)-root.rotation.x)*Math.min(1,dt*2.6);
      root.position.y=Math.sin(time*.00064)*.07;
      platform.rotation.y=time*.000032;
      for(const arm of arms){
        arm.bones.forEach((b,i)=>{
          if(i===0)return;
          const t=i/(boneCount-1),amp=.045+.055*t;
          b.rotation.z=Math.sin(time*.00125+arm.phase+t*4)*amp;
          b.rotation.x=Math.cos(time*.00095+arm.phase+t*5)*amp*.72;
          b.rotation.y=Math.sin(time*.00085+arm.phase+t*2)*amp*.5;
        });
      }
    }
    renderer.render(scene,camera);
  };
  frame=requestAnimationFrame(loop);
  let contextLost=false;
  const onLost=e=>{e.preventDefault();contextLost=true;alive=false;};
  canvas.addEventListener('webglcontextlost',onLost,{passive:false});
  const dispose=()=>{
    alive=false;cancelAnimationFrame(frame);observer.disconnect();
    canvas.removeEventListener('webglcontextlost',onLost);
    for(const g of new Set(geometries))g.dispose();
    ringGeometry.dispose();
    for(const m of new Set(matList))m.dispose();
    for(const disposeResource of disposables)disposeResource();
    renderer.dispose();
  };
  return {dispose,renderer,model:'KRAKEN V3 / articulated cinematic rig'};
}
