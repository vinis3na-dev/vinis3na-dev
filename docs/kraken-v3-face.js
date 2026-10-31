/*
 * KRAKEN V3: angular cybernetic faceplate for the cinematic skinned GLB.
 * Replaces only the rigid optical glass panel at runtime. The original
 * skeleton, tentacle animations and GLB binary remain unchanged.
 */
export function installKrakenFace(T,model){
  const group=new T.Group();
  group.name='KRAKEN V3 / sculpted optical mask';
  group.position.z=0;
  model.add(group);
  const geometry=[],materials=[],hidden=[];
  const material=(params)=>{
    const m=new T.MeshPhysicalMaterial(params);
    materials.push(m);return m;
  };
  const titanium=material({
    color:0x243c55,metalness:.86,roughness:.27,clearcoat:.78,
    clearcoatRoughness:.13,envMapIntensity:1.4
  });
  const glass=material({
    color:0x081523,metalness:.48,roughness:.13,clearcoat:1,
    clearcoatRoughness:.045,envMapIntensity:1.55
  });
  const rim=material({
    color:0x7e9caf,metalness:.88,roughness:.21,clearcoat:.65,
    envMapIntensity:1.6
  });
  const cyan=material({
    color:0x6cd5eb,emissive:0x1699ca,emissiveIntensity:1.35,
    metalness:.3,roughness:.23
  });
  const lavender=material({
    color:0x847aaf,emissive:0x362755,emissiveIntensity:.47,
    metalness:.65,roughness:.29
  });
  const add=(geo,mat,z=0)=>{
    geometry.push(geo);
    const mesh=new T.Mesh(geo,mat);
    mesh.position.z=z;
    group.add(mesh);
    return mesh;
  };
  // Sculpted 8-sided rounded silhouette, unlike the original flat rectangle.
  const outer=new T.Shape();
  outer.moveTo(-.66,-.10);
  outer.quadraticCurveTo(-.82,-.075,-.86,.12);
  outer.lineTo(-.84,.58);
  outer.quadraticCurveTo(-.81,.82,-.57,.91);
  outer.lineTo(.57,.91);
  outer.quadraticCurveTo(.81,.82,.84,.58);
  outer.lineTo(.86,.12);
  outer.quadraticCurveTo(.82,-.075,.66,-.10);
  outer.closePath();
  const glassShape=new T.Shape();
  glassShape.moveTo(-.58,-.025);
  glassShape.quadraticCurveTo(-.70,.0,-.72,.15);
  glassShape.lineTo(-.70,.55);
  glassShape.quadraticCurveTo(-.68,.68,-.50,.75);
  glassShape.lineTo(.50,.75);
  glassShape.quadraticCurveTo(.68,.68,.70,.55);
  glassShape.lineTo(.72,.15);
  glassShape.quadraticCurveTo(.70,.0,.58,-.025);
  glassShape.closePath();
  // Position the alloy frame and polished optical glass above the old panel.
  group.position.z=1.115;
  const shell=add(new T.ExtrudeGeometry(outer,{
    depth:.065,steps:1,bevelEnabled:true,bevelThickness:.055,
    bevelSize:.045,bevelSegments:4,curveSegments:12
  }),titanium);
  const lens=add(new T.ExtrudeGeometry(glassShape,{
    depth:.015,steps:1,bevelEnabled:true,bevelThickness:.024,
    bevelSize:.012,bevelSegments:3,curveSegments:12
  }),glass,.107);
  // Two thin slit apertures, converging toward the central bridge.
  const slit=(side)=>{
    const s=new T.Shape();
    s.moveTo(side*.10,.423);
    s.lineTo(side*.62,.465);
    s.quadraticCurveTo(side*.67,.474,side*.64,.445);
    s.lineTo(side*.17,.394);
    s.closePath();
    return s;
  };
  for(const side of [-1,1]){
    add(new T.ExtrudeGeometry(slit(side),{
      depth:.008,steps:1,bevelEnabled:true,
      bevelSize:.004,bevelThickness:.003,bevelSegments:2
    }),cyan,.16);
    // Fine recessed contour, without exaggerated cartoon eye rings.
    const curve=new T.CatmullRomCurve3([
      new T.Vector3(side*.08,.57,.17),
      new T.Vector3(side*.34,.59,.17),
      new T.Vector3(side*.64,.55,.17)
    ]);
    add(new T.TubeGeometry(curve,30,.007,6,false),rim);
    const vent=add(new T.BoxGeometry(.09,.016,.022),lavender,.173);
    vent.position.x=side*.68;vent.position.y=.20;
    vent.rotation.z=side*.10;
  }
  // Central rangefinder and lower jaw are clearly mechanical.
  const bridge=add(new T.BoxGeometry(.075,.35,.039),titanium,.184);
  bridge.position.y=.37;
  const sensor=add(new T.BoxGeometry(.025,.075,.022),cyan,.211);
  sensor.position.y=.33;
  for(const side of [-1,1]){
    const jaw=new T.CatmullRomCurve3([
      new T.Vector3(side*.15,.07,.18),
      new T.Vector3(side*.36,.035,.18),
      new T.Vector3(side*.55,.105,.17)
    ]);
    add(new T.TubeGeometry(jaw,25,.008,7,false),lavender);
  }
  // Hide the old rectangular visor by GLB geometry and material semantics.
  // The original file does not reliably name it "Recessed optic glass".
  // Exclude every mesh from our new mask and all skinned tentacles.
  model.updateMatrixWorld(true);
  const candidates=[];
  model.traverse(obj=>{
    if(!obj.isMesh||obj.parent===group||obj.isSkinnedMesh)return;
    const box=new T.Box3().setFromObject(obj);
    if(box.isEmpty())return;
    const size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3());
    const names=[obj.name,...(Array.isArray(obj.material)?obj.material:[obj.material]).map(m=>m?.name||'')].join(' ').toLowerCase();
    const named=/(visor|optic|optical|screen|display|lens|faceplate|glass)/.test(names);
    const central=Math.abs(center.x)<1.25 && center.y>-.55 && center.y<1.35 && center.z>.35;
    const flat=size.x>.35 && size.x<2.35 && size.y>.11 && size.y<1.55 && size.z<.72;
    if(central && flat)candidates.push({obj,center,size,named});
  });
  let oldVisors=candidates.filter(c=>c.named);
  // Fallback for unnamed glass meshes: take the flattest, central, forward
  // screen-like panel, rather than hiding the helmet or tentacle geometry.
  if(!oldVisors.length){
    oldVisors=candidates
      .filter(c=>c.size.x>.75 && c.size.y>.29 && c.size.z<.42)
      .sort((a,b)=>(b.center.z-b.size.z*.25)-(a.center.z-a.size.z*.25))
      .slice(0,1);
  }
  for(const c of oldVisors){
    c.obj.visible=false;
    hidden.push(c.obj);
  }
  const stats={
    installed:group.children.length>=10,
    legacyVisorsHidden:hidden.length,
    hiddenMeshNames:hidden.map(o=>o.name||'(unnamed)'),
    candidateCount:candidates.length,
    bevelGeometry:2,
    opticalSlits:2
  };
  return {
    stats,
    dispose(){
      for(const obj of hidden)obj.visible=true;
      model.remove(group);
      for(const g of geometry)g.dispose();
      for(const m of materials)m.dispose();
    }
  };
}
