/*
 * KRAKEN V3 — procedural PBR micro-surface treatment for the existing GLB.
 * Creates deterministic, small, locally generated maps. No external texture
 * service, no asset tracking, no mutation of the character's skin/animation.
 */
export function enhanceKrakenMaterials(T, model) {
  const size=320, textures=[], replacements=new Map();
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const rand=(x,y,seed)=> {
    const v=Math.sin((x+seed)*127.1+(y-seed)*311.7)*43758.5453;
    return v-Math.floor(v);
  };
  function surface(variant) {
    const normal=document.createElement('canvas'),orm=document.createElement('canvas');
    normal.width=orm.width=normal.height=orm.height=size;
    const nctx=normal.getContext('2d',{willReadFrequently:false});
    const octx=orm.getContext('2d',{willReadFrequently:false});
    if(!nctx||!octx)throw Error('Canvas 2D unavailable for PBR surface');
    const ni=nctx.createImageData(size,size),oi=octx.createImageData(size,size);
    for(let y=0;y<size;y++){
      for(let x=0;x<size;x++){
        const idx=(y*size+x)*4;
        const noise=rand(x,y,29)-.5;
        const grain=rand(x>>2,y>>2,47)-.5;
        const brush=Math.sin(y*.87+Math.sin(x*.07)*1.1)*.5;
        const etched=Math.abs(Math.sin(x*.18+Math.sin(y*.13)*.75));
        const machined=variant==='machined';
        const ceramic=variant==='ceramic';
        const intensity=ceramic?.20:machined?.50:.35;
        const nx=clamp(127+noise*28*intensity+brush*8,99,155);
        const ny=clamp(127+grain*34*intensity+(etched-.5)*9,99,155);
        ni.data[idx]=nx;ni.data[idx+1]=ny;ni.data[idx+2]=253;ni.data[idx+3]=255;
        const rough=ceramic?.30:machined?.20:.27;
        const roughness=clamp(rough+noise*.09+grain*.06+(machined?brush*.025:0),.12,.48);
        oi.data[idx]=255;
        oi.data[idx+1]=Math.round(roughness*255);
        oi.data[idx+2]=Math.round((ceramic?.70:machined?.96:.86)*255);
        oi.data[idx+3]=255;
      }
    }
    nctx.putImageData(ni,0,0);octx.putImageData(oi,0,0);
    const create=canvas=>{
      const texture=new T.CanvasTexture(canvas);
      texture.wrapS=T.RepeatWrapping;texture.wrapT=T.RepeatWrapping;
      texture.colorSpace=T.NoColorSpace;
      texture.generateMipmaps=true;
      texture.minFilter=T.LinearMipmapLinearFilter;
      texture.anisotropy=2;
      textures.push(texture);
      return texture;
    };
    return {normal:create(normal),orm:create(orm)};
  }
  const sets={
    machined:surface('machined'),
    armor:surface('armor'),
    ceramic:surface('ceramic')
  };
  let mapped=0,uvGenerated=0,metals=0,skinned=0;
  // The original GLB has no TEXCOORD_0. Supply per-vertex UV without touching
  // skinIndices, skinWeights, bind poses or animation channel targets.
  const seen=new Set();
  model.traverse(obj=>{
    if(!obj.isMesh||!obj.geometry)return;
    const geo=obj.geometry;
    if(seen.has(geo))return;
    seen.add(geo);
    const p=geo.getAttribute('position');
    if(!p||geo.getAttribute('uv'))return;
    const uv=new Float32Array(p.count*2);
    if(obj.isSkinnedMesh && p.count===610){
      for(let i=0;i<p.count;i++){
        uv[i*2]=(i%10)/9;
        uv[i*2+1]=Math.floor(i/10)/60;
      }
    }else{
      geo.computeBoundingBox();
      const box=geo.boundingBox;
      const height=Math.max(1e-3,box.max.y-box.min.y);
      for(let i=0;i<p.count;i++){
        const x=p.getX(i),z=p.getZ(i),y=p.getY(i);
        uv[i*2]=(Math.atan2(x,z)+Math.PI)/(Math.PI*2);
        uv[i*2+1]=(y-box.min.y)/height;
      }
    }
    geo.setAttribute('uv',new T.BufferAttribute(uv,2));
    uvGenerated++;
  });
  function upgraded(original){
    if(!original||!original.isMeshStandardMaterial)return original;
    if(replacements.has(original))return replacements.get(original);
    const m=new T.MeshPhysicalMaterial().copy(original);
    m.name=(original.name||'KRAKEN surface')+' / micro-finish';
    const label=(original.name||'').toLowerCase();
    const emissive=/optic|signal|plasma|slit|conduit/.test(label);
    if(!emissive){
      const ceramic=/ceramic/.test(label);
      const machined=/rhodium|fastening|edge/.test(label);
      const pack=sets[ceramic?'ceramic':machined?'machined':'armor'];
      m.normalMap=pack.normal;
      m.normalScale.set(.19,.19);
      m.roughnessMap=pack.orm;
      m.metalnessMap=pack.orm;
      m.roughness=1;
      m.metalness=1;
      m.envMapIntensity=machined?1.65:1.25;
      m.clearcoat=ceramic?.76:.62;
      m.clearcoatRoughness=ceramic?.21:.16;
      m.color.multiplyScalar(machined?1.08:1.16);
      metals++;
    }else{
      m.envMapIntensity=.55;
      m.clearcoat=/glass/.test(label)?.95:.34;
      m.clearcoatRoughness=.16;
    }
    m.needsUpdate=true;
    replacements.set(original,m);
    mapped++;
    return m;
  }
  model.traverse(obj=>{
    if(!obj.isMesh||!obj.material)return;
    if(obj.isSkinnedMesh)skinned++;
    obj.material=Array.isArray(obj.material)
      ? obj.material.map(upgraded)
      : upgraded(obj.material);
  });
  const dispose=()=>{
    for(const tex of textures)tex.dispose();
    for(const material of replacements.values())if(material?.dispose)material.dispose();
  };
  return {dispose,stats:{uvGenerated,mappedMaterials:mapped,metalMaterials:metals,skinnedMeshes:skinned,textures:textures.length}};
}
