import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export function createStage(host){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true});host.appendChild(renderer.domElement);
 renderer.setClearColor('#e5ddce',0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.localClippingEnabled=true;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
 const scene=new T.Scene();scene.background=null;
 const camera=new T.PerspectiveCamera(32,1,.1,2000);camera.up.set(0,0,1);
 const orbit=new OrbitControls(camera,renderer.domElement);orbit.target.set(0,0,20);orbit.enableDamping=true;orbit.maxPolarAngle=Math.PI*.49;orbit.minDistance=115;orbit.maxDistance=650;
 scene.add(new T.HemisphereLight('#fffbed','#a4a591',2.3));
 const sun=new T.DirectionalLight('#fff6df',2.7);sun.position.set(-85,100,180);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-180,right:180,top:180,bottom:-180,near:1,far:500});sun.shadow.bias=-.0003;sun.shadow.normalBias=.1;sun.shadow.radius=4;scene.add(sun);
 const fill=new T.DirectionalLight('#eee1c7',1.6);fill.position.set(100,-60,90);scene.add(fill);
 const floor=new T.Mesh(new T.PlaneGeometry(2000,2000),new T.ShadowMaterial({color:'#796b51',opacity:.20}));floor.position.z=-.85;floor.receiveShadow=true;scene.add(floor);
 const grid=new T.GridHelper(700,35,'#c1c3ad','#d8d6c4');grid.rotation.x=Math.PI/2;grid.position.z=-.8;grid.material.transparent=true;grid.material.opacity=.09;scene.add(grid);
 const bar=new T.Mesh(new T.BoxGeometry(50,.8,.25),new T.MeshBasicMaterial({color:'#8e9785'}));bar.position.set(0,-94,-.6);scene.add(bar);
 for(const x of [-25,25]){const tick=new T.Mesh(new T.BoxGeometry(.7,4,.25),bar.material);tick.position.set(x,-94,-.6);scene.add(tick);}
 let tier=matchMedia('(max-width:700px)').matches?1:0,currentView='hero';
 const tiers=[{pr:1.7,shadow:2048},{pr:1.2,shadow:1024},{pr:1,shadow:512}];
 const views={hero:[184,206,166],top:[0,.01,310],front:[0,310,42],side:[310,0,42]};
 const orthos=['hero','top','front','side'].map(name=>{const c=new T.OrthographicCamera(-100,100,90,-90,.1,1500);c.up.set(0,0,1);c.position.set(...views[name]);c.lookAt(0,0,28);return c;});
 function resize(){const {width:w,height:h}=host.getBoundingClientRect();camera.aspect=w/h;camera.zoom=currentView==='top'?Math.min(1,camera.aspect/1.2):1.16*Math.min(1,camera.aspect/1.77);camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,tiers[tier].pr));renderer.setSize(w,h);orthos.forEach(c=>{c.left=-95*w/h;c.right=95*w/h;c.top=95;c.bottom=-95;c.updateProjectionMatrix();});}
 function quality(){if(tier<2){tier++;sun.shadow.mapSize.setScalar(tiers[tier].shadow);sun.shadow.map?.dispose();sun.shadow.map=null;resize();}return tier;}
 function view(name,exploded=false){currentView=name;camera.zoom=name==='top'?Math.min(1,camera.aspect/1.2):1.16*Math.min(1,camera.aspect/1.77);camera.updateProjectionMatrix();orbit.enabled=name!=='quad';if(name==='quad')return;camera.position.set(...views[name]);if(exploded)camera.position.multiplyScalar(1.27);orbit.target.set(0,0,20);orbit.update();}
 function render(){
  if(currentView!=='quad'){renderer.setScissorTest(false);renderer.render(scene,camera);return;}
  const size=new T.Vector2();renderer.getSize(size);const w=size.x/2,h=size.y/2;
  renderer.setScissorTest(true);orthos.forEach((c,i)=>{const x=(i%2)*w,y=(i<2?1:0)*h;renderer.setViewport(x,y,w,h);renderer.setScissor(x,y,w,h);renderer.render(scene,c);});renderer.setScissorTest(false);renderer.setViewport(0,0,size.x,size.y);
 }
 view('hero');addEventListener('resize',resize);resize();
 return {renderer,scene,camera,orbit,grid,view,resize,quality,render,get tier(){return tier;},get currentView(){return currentView;},orthos};
}
