/**
 * KRAKEN V3 / cinematic orbital docking stage.
 * Three.js objects only. Deterministic, GPU-light scene accents; no external files.
 * Character rigging, animation and source GLB are untouched.
 */
export function createOrbitalStage(T,scene){
  const platform=new T.Group();
  platform.name='KRAKEN / orbital docking stage';
  scene.add(platform);
  const geometries=[],materials=[],textures=[];
  const material=(props)=>{const m=new T.MeshPhysicalMaterial(props);materials.push(m);return m};
  const basic=(props)=>{const m=new T.MeshBasicMaterial(props);materials.push(m);return m};
  const add=(geo,mat,parent=platform)=>{geometries.push(geo);const mesh=new T.Mesh(geo,mat);parent.add(mesh);return mesh};
  const titanium=material({color:0x111f30,metalness:.85,roughness:.35,clearcoat:.65,clearcoatRoughness:.23});
  const rail=material({color:0x244e70,emissive:0x081b2a,emissiveIntensity:.31,metalness:.79,roughness:.26});
  const aqua=basic({color:0x72e2ff,transparent:true,opacity:.53,blending:T.AdditiveBlending,depthWrite:false});
  const violet=basic({color:0x986df3,transparent:true,opacity:.32,blending:T.AdditiveBlending,depthWrite:false});
  const stageY=-2.15;
  const deck=add(new T.CylinderGeometry(2.57,2.66,.11,96,1,false),titanium);
  deck.position.y=stageY-.055;
  const inner=add(new T.CylinderGeometry(2.16,2.16,.012,90),rail);
  inner.position.y=stageY+.011;
  const rails=[];
  for(const [radius,thickness,color] of [[2.58,.025,rail],[2.26,.013,aqua],[1.82,.010,violet]]){
    const o=add(new T.TorusGeometry(radius,thickness,8,160),color);
    o.rotation.x=Math.PI/2;o.position.y=stageY+.055;rails.push(o);
  }
  const markerGeo=new T.BoxGeometry(.16,.021,.038);geometries.push(markerGeo);
  const inst=new T.InstancedMesh(markerGeo,rail,32);inst.instanceMatrix.setUsage(T.StaticDrawUsage);
  const unit=new T.Object3D();
  for(let i=0;i<32;i++){
    const a=i*Math.PI/16;
    unit.position.set(Math.cos(a)*2.43,stageY+.074,Math.sin(a)*2.43);
    unit.rotation.set(0,-a,0);unit.updateMatrix();inst.setMatrixAt(i,unit.matrix);
  }
  inst.instanceMatrix.needsUpdate=true;platform.add(inst);
  const cnv=document.createElement('canvas');cnv.width=cnv.height=256;
  const context=cnv.getContext('2d');
  if(context){
    const gradient=context.createRadialGradient(128,128,10,128,128,127);
    gradient.addColorStop(0,'rgba(85,188,246,.45)');
    gradient.addColorStop(.34,'rgba(71,116,219,.19)');
    gradient.addColorStop(.70,'rgba(53,47,113,.07)');
    gradient.addColorStop(1,'rgba(11,20,43,0)');
    context.fillStyle=gradient;context.fillRect(0,0,256,256);
  }
  const shadowMap=new T.CanvasTexture(cnv);textures.push(shadowMap);
  const shadowMat=basic({map:shadowMap,transparent:true,opacity:.78,depthWrite:false,side:T.DoubleSide});
  const pool=add(new T.PlaneGeometry(5.0,5.0),shadowMat);
  pool.rotation.x=-Math.PI/2;pool.position.y=stageY+.09;
  const shaftMat=basic({color:0x599bcf,transparent:true,opacity:.027,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
  const shaftGeo=new T.CylinderGeometry(.08,.79,4.3,24,1,true);geometries.push(shaftGeo);
  const shafts=[];
  for(const x of [-2.0,2.0]){
    const cone=new T.Mesh(shaftGeo,shaftMat);
    cone.position.set(x,.38,-1.6);cone.rotation.z=x<0?.20:-.20;platform.add(cone);shafts.push(cone);
  }
  const floorLight=new T.PointLight(0x4e8cdd,17,7,2);
  floorLight.position.set(0,stageY+.50,1.7);platform.add(floorLight);
  const rimLight=new T.PointLight(0xb477db,19,9,2);
  rimLight.position.set(2.9,.9,-1.7);platform.add(rimLight);
  function update(time,reduced){
    if(reduced){rails[1].rotation.z=0;rails[2].rotation.z=0;shadowMat.opacity=.70;return}
    const seconds=time*.001;
    rails[1].rotation.z=Math.sin(seconds*.15)*.085;
    rails[2].rotation.z=-Math.sin(seconds*.12)*.12;
    shadowMat.opacity=.69+.08*Math.sin(seconds*.72);
  }
  function dispose(){
    scene.remove(platform);
    for(const g of new Set(geometries))g.dispose();
    for(const m of new Set(materials))m.dispose();
    for(const t of new Set(textures))t.dispose();
  }
  return {update,dispose,stats:{dockingRails:rails.length,dockMarkers:inst.count,lightShafts:shafts.length,contactPool:true}};
}