/*
 * KRAKEN V3 Cinematic GLB Studio
 * Loads an original skinned glTF binary with eight articulated tentacles and
 * an eight-second looping clip. Falls back to the existing hero artwork on
 * CDN/WebGL/network failure. No analytics and no prerecorded telemetry.
 */
export async function createKrakenStage({canvas,isActive,isReduced,pointer}){
 const [T,loaders]=await Promise.all([
   import('https://esm.sh/three@0.180.0'),
   import('https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js?bundle')
 ]);
 const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance',premultipliedAlpha:false});
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.4));
 renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.32;
 renderer.setClearColor(0x000000,0);
 const scene=new T.Scene(), camera=new T.PerspectiveCamera(34,1,.1,70);
 camera.position.set(0,-.10,9.3);camera.lookAt(0,-.19,0);
 let gltf=null,mixer=null,clip=null,disposed=false,frame=0,last=0,played=0;
 const lights=[
   new T.HemisphereLight(0xbde4ff,0x141222,2.1),
   new T.DirectionalLight(0x8adfff,3.3),
   new T.PointLight(0xac83f6,90,22),
   new T.PointLight(0x73a5d7,42,20)
 ];
 lights[1].position.set(-3,4,6);lights[2].position.set(4,0,-3);lights[3].position.set(2,-3,4);
 for(const light of lights)scene.add(light);
 const studio=new T.Scene();studio.background=new T.Color(0x101727);
 const panels=[],mats=[];
 function panel(w,h,x,y,z,color,rot=0){
   const geo=new T.PlaneGeometry(w,h),mat=new T.MeshBasicMaterial({color,side:T.DoubleSide});
   const p=new T.Mesh(geo,mat);p.position.set(x,y,z);p.rotation.y=rot;studio.add(p);
   panels.push(geo);mats.push(mat);
 }
 panel(2.5,5.0,-3,3,3,0x9bdcff,-.62);
 panel(2.7,5,3,1,-2,0xaf87e6,.5);
 panel(4,1,0,-3,4,0xe3eafa,-.2);
 const pmrem=new T.PMREMGenerator(renderer);
 const env=pmrem.fromScene(studio,.04);
 scene.environment=env.texture;
 let stars=null,starGeo=null,starMat=null;
 try{
   const loader=new loaders.GLTFLoader();
   gltf=await loader.loadAsync('./assets/kraken-cinematic-rig.glb');
   if(disposed)throw Error('3D viewer closed during load');
   const model=gltf.scene;
   scene.add(model);model.rotation.y=-.11;
   let skinned=0,bones=0,faces=0;
   model.traverse(obj=>{
      if(obj.isSkinnedMesh){
       skinned++;
       bones+=obj.skeleton?.bones?.length||0;
       const geo=obj.geometry;if(geo?.index)faces+=geo.index.count/3;
      }
   });
   if(skinned!==8||bones!==80||!gltf.animations?.length){
     throw Error('GLB failed rig integrity checks: '+skinned+' skinned meshes, '+bones+' bones');
   }
   mixer=new T.AnimationMixer(model);
   clip=gltf.animations[0];
   mixer.clipAction(clip).setLoop(T.LoopRepeat,Infinity).play();
   canvas.dataset.model='kraken-cinematic-rig.glb';
   canvas.dataset.skinCount=String(skinned);
   canvas.dataset.boneCount=String(bones);
   canvas.dataset.animationCount=String(gltf.animations.length);
   canvas.dataset.faces=String(faces);
   // Lightweight backdrop particles, separate from character geometry.
   const starPoints=[];
   for(let i=0;i<90;i++){
      const fx=Math.sin(i*127.1)*43758.5453,fy=Math.sin(i*73.1)*9031.7,fz=Math.sin(i*45.3)*1278.5;
      starPoints.push(((fx%1+1)%1-.5)*12,((fy%1+1)%1-.5)*8,-3-((fz%1+1)%1)*5);
   }
   starGeo=new T.BufferGeometry();starGeo.setAttribute('position',new T.Float32BufferAttribute(starPoints,3));
   starMat=new T.PointsMaterial({color:0x94d9ef,size:.021,transparent:true,opacity:.55,depthWrite:false});
   stars=new T.Points(starGeo,starMat);scene.add(stars);
 }catch(err){
   if(gltf)scene.remove(gltf.scene);
   starGeo?.dispose();starMat?.dispose();env.dispose();pmrem.dispose();
   for(const p of panels)p.dispose();for(const m of mats)m.dispose();renderer.dispose();
   throw err;
 }
 let prevWidth=0,prevHeight=0;
 function resize(){
   const box=canvas.getBoundingClientRect(),w=Math.round(box.width),h=Math.round(box.height);
   if(w<2||h<2||w===prevWidth&&h===prevHeight)return;
   prevWidth=w;prevHeight=h;
   renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 }
 const resizeObserver=new ResizeObserver(resize);
 resizeObserver.observe(canvas);resize();
 const tick=time=>{
   if(disposed)return;
   frame=requestAnimationFrame(tick);
   if(!isActive()||document.hidden)return;
   if(time-last<25)return;
   const delta=Math.min((time-last)/1000||.025,.08);last=time;
   if(!isReduced()){
     mixer.update(delta);played+=delta;
     const p=pointer();
     const target=-.11+Math.sin(time*.00022)*.15+p.x*.0025;
     gltf.scene.rotation.y+=(target-gltf.scene.rotation.y)*Math.min(1,delta*3.1);
     gltf.scene.rotation.x+=(-p.y*.001-gltf.scene.rotation.x)*Math.min(1,delta*3.1);
     gltf.scene.position.y=Math.sin(time*.00054)*.052;
   }
   renderer.render(scene,camera);
   canvas.dataset.animationElapsed=played.toFixed(3);
 };
 frame=requestAnimationFrame(tick);
 let lost=false;
 const onLost=e=>{e.preventDefault();lost=true;disposed=true;cancelAnimationFrame(frame)};
 canvas.addEventListener('webglcontextlost',onLost,{passive:false});
 return {
   model:'KRAKEN V3 / original skinned GLB',
   dispose(){
     if(disposed)return;disposed=true;cancelAnimationFrame(frame);
     resizeObserver.disconnect();canvas.removeEventListener('webglcontextlost',onLost);
     mixer?.stopAllAction();
     gltf?.scene.traverse(obj=>{if(obj.geometry)obj.geometry.dispose();const mm=obj.material;if(mm){for(const m of Array.isArray(mm)?mm:[mm])m.dispose()}});
     starGeo?.dispose();starMat?.dispose();env.dispose();pmrem.dispose();
     for(const p of panels)p.dispose();for(const m of mats)m.dispose();renderer.dispose();
   }
 };
}