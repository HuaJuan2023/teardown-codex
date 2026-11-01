import * as THREE from 'three';
// Fit a selected assembly in its real viewport. Caller supplies intentional view direction.
export function fitAssembly(camera,controls,objects,{direction,padding=1.35,minimum=20}={}){
  const box=new THREE.Box3();for(const object of objects){object.updateWorldMatrix(true,true);box.union(new THREE.Box3().setFromObject(object));}
  if(box.isEmpty())throw new Error('cannot focus an empty assembly');
  const center=box.getCenter(new THREE.Vector3()),dir=direction?new THREE.Vector3(...direction).normalize():camera.position.clone().sub(controls.target).normalize();
  const forward=dir.clone().negate(),right=new THREE.Vector3().crossVectors(forward,camera.up).normalize(),up=new THREE.Vector3().crossVectors(right,forward).normalize();
  const halfV=THREE.MathUtils.degToRad(camera.fov/2),tanV=Math.tan(halfV)/camera.zoom,tanH=tanV*camera.aspect;
  let distance=minimum;
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
    const v=new THREE.Vector3(x,y,z).sub(center),depth=v.dot(dir);
    distance=Math.max(distance,depth+padding*Math.abs(v.dot(right))/tanH,depth+padding*Math.abs(v.dot(up))/tanV);
  }
  controls.target.copy(center);camera.position.copy(center).addScaledVector(dir,distance);controls.update();
  return {box,center,distance};
}
