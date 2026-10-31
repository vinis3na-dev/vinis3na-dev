/**
 * KRAKEN V3 / Cinematic Camera Director.
 * Real perspective shots through the existing Three.js camera, no fake pan
 * or prerecorded animation. Reduced-motion settings snap instantly.
 */
export function createCinematicCamera(T,camera,canvas) {
  const shots=Object.freeze({
    wide:{position:[0,-.10,9.3],look:[0,-.19,0],fov:34},
    portrait:{position:[1.0,.54,7.05],look:[0,.22,0],fov:30},
    detail:{position:[.46,.89,4.20],look:[0,.72,0],fov:31}
  });
  const targetPosition=new T.Vector3(...shots.wide.position);
  const targetLook=new T.Vector3(...shots.wide.look);
  const look=new T.Vector3(...shots.wide.look);
  let targetFov=shots.wide.fov;
  let current='wide',lastUpdate=0;
  let transitions=0;
  const snap=()=>{
    camera.position.copy(targetPosition);
    look.copy(targetLook);
    camera.fov=targetFov;
    camera.updateProjectionMatrix();
    camera.lookAt(look);
    canvas.dataset.cameraSettled='true';
    publish();
  };
  function publish(){
    canvas.dataset.cameraShot=current;
    canvas.dataset.cameraZ=camera.position.z.toFixed(3);
    canvas.dataset.cameraFov=camera.fov.toFixed(2);
    canvas.dataset.cameraTransitions=String(transitions);
  }
  function setCameraShot(name,reduced=false){
    const shot=shots[name];
    if(!shot)return false;
    current=name;transitions++;
    targetPosition.set(...shot.position);
    targetLook.set(...shot.look);
    targetFov=shot.fov;
    canvas.dataset.cameraSettled='false';
    if(reduced)snap();
    else publish();
    return true;
  }
  function update(time,delta,reduced=false){
    if(reduced){snap();return}
    const step=Math.min(Math.max(delta||0,0),.08);
    const k=1-Math.exp(-3.0*step);
    camera.position.lerp(targetPosition,k);
    look.lerp(targetLook,k);
    const nextFov=camera.fov+(targetFov-camera.fov)*k;
    if(Math.abs(camera.fov-nextFov)>.00001){
      camera.fov=nextFov;camera.updateProjectionMatrix();
    }
    // A small floating optical motion without changing the requested framing.
    const quiet=0.004*Math.sin(time*.00050);
    camera.lookAt(look.x,look.y+quiet,look.z);
    const settled=camera.position.distanceToSquared(targetPosition)<.0016
      && Math.abs(camera.fov-targetFov)<.12
      && look.distanceToSquared(targetLook)<.001;
    canvas.dataset.cameraSettled=String(settled);
    publish();
    lastUpdate=time;
  }
  snap();
  return {setCameraShot,update,dispose(){delete canvas.dataset.cameraSettled},shots:Object.keys(shots)};
}
