import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {TAU,add,lerp} from './model.js';

// Original formed components, in millimetres. Mesh tessellation is not a parts inventory.
export function addFormedDetail(api){
 const {root,body,head,jaw,voice,scissorRoot,legRigs,registry,M,part,group,cylinder,ring,rod,box}=api;
 const removed=new Set(['bellows convolution','dorsal shell panel','ventral skid','dorsal inspection plug','cranial cheek shell','eye turret','optical lens','horizontal iris','horn eye hood','optical module stalk','optical mounting shoe','mandible cover','limb fairing','link cheek plate','link spacer']);
 for(let i=registry.length-1;i>=0;i--)if(removed.has(registry[i].name)){registry[i].o.removeFromParent();registry.splice(i,1);}
 M.shell.color.set('#deded0');M.shell.metalness=.18;M.shell.roughness=.43;
 M.ivory.color.set('#b6c0b9');M.ivory.metalness=.32;M.ivory.roughness=.42;
 M.dark.color.set('#17282b');M.dark.metalness=.35;M.dark.roughness=.48;
 M.edge.color.set('#34494a');M.edge.metalness=.45;M.edge.roughness=.42;
 M.metal.color.set('#9ba8aa');M.metal.metalness=.72;M.metal.roughness=.32;
 M.amber.color.set('#db673d');M.copper.color.set('#ad714d');
 const glass=new T.MeshPhysicalMaterial({color:'#214340',metalness:.25,roughness:.12,clearcoat:1,transparent:true,opacity:.88,side:T.DoubleSide});
 const led=new T.MeshStandardMaterial({color:'#eb713f',emissive:'#d44b23',emissiveIntensity:.65,roughness:.4});
 const lids=[],eyes=[],fans=[],cables=[],guides=[],pistons=[];
 const profile=[new T.Vector2(0,0),new T.Vector2(3.8,0)];
 for(let i=1;i<32;i++)profile.push(new T.Vector2(i%4===2?4.2:i%4===0?3.4:3.8,i/32));
 profile.push(new T.Vector2(3.8,1),new T.Vector2(0,1));
 const membrane=part(voice,new T.LatheGeometry(profile,40),M.rubber,{name:'continuous accordion membrane',stage:2,offset:[0,0,-10]});
 function rounded(g,p,size,m,opt={}){return part(g,new RoundedBoxGeometry(...size,3,Math.min(...size)*.17),m,{...opt,p});}
 function formed(g,poly,zfn,thickness,m,opt={},holes=[]){
  const shape=new T.Shape(poly.map(p=>new T.Vector2(...p)));for(const h of holes){const hole=new T.Path();if(h.r)hole.absarc(h.x,h.y,h.r,0,TAU,true);else hole.setFromPoints(h.points.map(p=>new T.Vector2(...p)));shape.holes.push(hole);}
  const raw=new T.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelSize:Math.min(.3,thickness*.24),bevelThickness:Math.min(.25,thickness*.22),bevelSegments:3,curveSegments:16,steps:1});
  const source=raw.attributes.position,verts=[];
  function split(a,b,c,depth=0){const dist=(p,q)=>Math.hypot(...p.map((v,i)=>v-q[i])),mid=(p,q)=>p.map((v,i)=>(v+q[i])/2);if(depth<5&&Math.max(dist(a,b),dist(b,c),dist(c,a))>4.5){const ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);split(a,ab,ca,depth+1);split(ab,b,bc,depth+1);split(ca,bc,c,depth+1);split(ab,bc,ca,depth+1);}else for(const p of [a,b,c])verts.push(p[0],p[1],p[2]+zfn(p[0],p[1]));}
  for(let i=0;i<source.count;i+=3)split([source.getX(i),source.getY(i),source.getZ(i)],[source.getX(i+1),source.getY(i+1),source.getZ(i+1)],[source.getX(i+2),source.getY(i+2),source.getZ(i+2)]);raw.dispose();const soup=new T.BufferGeometry();soup.setAttribute('position',new T.Float32BufferAttribute(verts,3));const geo=mergeVertices(soup,1e-5);geo.computeVertexNormals();soup.dispose();return part(g,geo,m,opt);
 }
 function fastener(g,x,y,z,offset=[0,0,9],stage=0){cylinder(g,[x,y,z],.66,.35,M.dark,{name:'recessed socket screw',role:'fastener',stage,offset});const geo=new T.CylinderGeometry(.27,.27,.08,6);geo.rotateX(Math.PI/2);part(g,geo,M.metal,{name:'hex socket recess',role:'render',stage,offset,p:[x,y,z+.2]});ring(g,[x,y,z-.12],.82,.09,M.metal,{name:'countersink lip',role:'render',stage,offset});}
 function lid(name,parent,topic,pivot,side,poly,height,opt={},holes=[]){
  const g=group(name,topic,parent);g.position.fromArray(pivot);const local=poly.map(p=>[p[0]-pivot[0],p[1]-pivot[1]]),h=(x,y)=>height(x+pivot[0],y+pivot[1])-pivot[2];
  formed(g,local,h,1.1,M.shell,{name:'formed '+name,role:'cover',stage:0,offset:[side*11,0,17],...opt},holes.map(a=>({...a,x:a.x-pivot[0],y:a.y-pivot[1]})));
  // Recessed fasteners follow the same hinge and disassembly frame as the cover.
  for(const i of [0,2,Math.max(0,poly.length-2)]){const p=poly[i],c=poly.reduce((a,p)=>[a[0]+p[0]/poly.length,a[1]+p[1]/poly.length],[0,0]),x=p[0]*.88+c[0]*.12-pivot[0],y=p[1]*.88+c[1]*.12-pivot[1];fastener(g,x,y,h(x,y)+1.25,[side*11,0,22]);}
  const hinge=group(name+'-hinge',topic,parent);hinge.position.fromArray(pivot);for(const y of [-2,0,2]){const o=cylinder(hinge,[0,y,0],.85,1.7,y?M.metal:M.amber,{name:'cover hinge knuckle',stage:1,offset:[0,-8,0]});o.rotation.x=Math.PI/2;}
  lids.push({g,hinge,topic,side,name,pivot});return g;
 }
 const headHeight=(x,y)=>41.4-.010*x*x-.012*(y-3)**2;
 for(const side of [-1,1]){
  const mirror=pts=>pts.map(([x,y])=>[side*x,y]);
  lid('cheek service panel '+side,head,'hunt',[side*31,-2,26],side,mirror([[13,-8],[29,-5],[36,5],[35,20],[26,32],[13,33],[9,21],[10,5]]),headHeight,{},[{x:side*22,y:14,r:6.5}]);
  // The optical module has a prismatic barrel, flush flange, iris and a slotted horn brow.
  const pod=group('optical pod '+side,'hunt',head);pod.position.set(side*22,14,39);rounded(pod,[0,-.7,0],[10.5,12,8],M.edge,{name:'optical chassis',stage:1,offset:[side*8,0,10]});
  const yaw=group('optical yaw '+side,'hunt',pod);yaw.position.set(0,5,0);const gimbal=group('optical gimbal '+side,'hunt',yaw);eyes.push({pod,gimbal,yaw,side});
  cylinder(pod,[0,5,-3.3],1.8,2.4,M.dark,{name:'optical yaw servo stator',stage:2,offset:[0,0,-7]});cylinder(yaw,[0,0,-1.8],.7,3.2,M.metal,{name:'optical yaw spindle',stage:2,offset:[0,0,-7]});for(const x of [-4.4,4.4]){const o=cylinder(yaw,[x,0,0],1.8,1.2,x<0?M.dark:M.metal,{name:x<0?'optical pitch servo stator':'optical pitch bearing',stage:2,offset:[side*6,0,0]});o.rotation.y=Math.PI/2;}
  for(const [r,h,y,m,n] of [[4.5,.7,0,M.metal,'lens retaining ring'],[3.8,.8,.45,M.dark,'iris housing'],[3.25,.35,1,glass,'optical glass']]){const o=cylinder(gimbal,[0,y,0],r,h,m,{name:n,stage:2,offset:[0,10,0]});o.rotation.x=Math.PI/2;}
  rounded(gimbal,[0,1.25,0],[5.8,.2,.8],led,{name:'horizontal tracking aperture',role:'render',stage:2,offset:[0,10,0]});
  for(const x of [-3.5,3.5])for(const z of [-2.7,2.7]){const o=cylinder(gimbal,[x,1,z],.3,.3,M.dark,{name:'lens bezel screw',role:'fastener',stage:1,offset:[0,10,0]});o.rotation.x=Math.PI/2;}
  const brow=lid('horn brow '+side,head,'hunt',[side*22,9,40],side,mirror([[16,5],[22,0],[28,7],[29,18],[26,23],[18,23],[15,15]]),(x,y)=>44+.7*Math.max(0,10-y)-.12*(x-side*22)**2,{},[{x:side*22,y:17,r:2.2}]);
  rod(head,[side*22,9,39],[side*25,3,26],1.3,M.edge,{name:'optic bearing pedestal',stage:1,offset:[side*7,0,8]});
 }
 lid('cranial cartridge hatch',head,'hunt',[-12,3,39.6],-1,[[-12,-9],[12,-9],[13,9],[8,26],[0,33],[-8,26],[-13,9]],headHeight,{name:'central cranial keel'});
 for(const side of [-1,1]){formed(head,[[side*34,-2],[side*37,9],[side*32,24],[side*18,35],[0,38],[0,35],[side*17,32],[side*29,22],[side*34,8]],()=>23.4,1.4,M.edge,{name:'upper jaw perimeter frame',stage:3,offset:[side*5,0,-6]});
  for(let j=0;j<4;j++){const y=7+j*5,x=side*(34-(y-7)*.45);rounded(head,[x,y,27],[1.2,3.1,.5],M.dark,{name:'cheek ventilation inset',role:'render',stage:0,offset:[side*12,0,16]});}
 }
 formed(jaw,[[-30,0],[-34,12],[-26,30],[-12,38],[0,40],[12,38],[26,30],[34,12],[30,0],[26,2],[29,12],[22,27],[10,33],[0,35],[-10,33],[-22,27],[-29,12],[-26,2]],()=>-1,2,M.shell,{name:'formed mandible rim',role:'cover',stage:0,offset:[0,12,-12]});
 formed(jaw,[[-19,26],[-10,36],[0,39],[10,36],[19,26],[14,22],[-14,22]],(x,y)=>-3+.03*Math.abs(x),1.4,M.ivory,{name:'chin bumper skid',role:'cover',stage:0,offset:[0,12,-12]});
 rounded(jaw,[0,15,-1],[24,28,1.4],M.dark,{name:'capture cartridge mounting pan',stage:1,offset:[0,0,-9]});
 // The dorsal shell consists of transverse service panels rather than radial sphere slices.
 for(let j=0;j<3;j++)for(const side of [-1,1]){const y=-35+j*11,w=j===0?20:28;
  const poly=[[side*2,y],[side*(w-3),y-1],[side*w,y+3],[side*(w-1),y+9],[side*3,y+10]];
  const h=(x,Y)=>38.7-.012*x*x-.014*(Y+18)**2;
  lid('dorsal access '+j+' '+side,body,'body',[side*(w-1),y+4,25.5],side,poly,h,{},[{x:side*(w*.55),y:y+5,r:1.5}]);
 }
 formed(body,[[-4,-41],[4,-41],[5,-5],[-5,-5]],(x,y)=>40-.012*(y+20)**2,1.2,M.edge,{name:'dorsal spine bridge',stage:1,offset:[0,-8,14]});
 for(const y of [-31,-19,-7]){
  const pts=[];for(let i=0;i<=20;i++){const x=-25+i*2.5;pts.push(new T.Vector3(x,y,24+10*(1-(x/25)**2)));}part(body,new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.8,6,false),M.dark,{name:'formed internal arch',stage:3,offset:[0,0,-5]});
 }
 formed(body,[[-24,-34],[-20,-40],[20,-40],[25,-33],[27,-4],[21,6],[-21,6],[-27,-4]],()=>12.5,1.4,M.edge,{name:'ventral structural tray',role:'cover',stage:0,offset:[0,0,-16]});
 for(const side of [-1,1])for(let i=0;i<3;i++){
  const y=-30+i*10;rounded(body,[side*16,y,33],[7,7,2],M.dark,{name:'power distribution socket',stage:1,offset:[0,0,12]});for(let k=0;k<3;k++)rounded(body,[side*16+(k-1)*1.2,y,34.2],[.55,3,.5],M.copper,{name:'socket terminal',role:'render',stage:1,offset:[0,0,12]});
 }
 for(let i=0;i<7;i++)rounded(body,[-8+i*2.6,-21,33.5],[.8,17,2.2],M.metal,{name:'controller heat fin',stage:2,offset:[0,-12,8]});
 const fan=group('ventilation fan','body',body);fan.position.set(0,-5,33);
 formed(fan,Array.from({length:48},(_,i)=>[4.5*Math.cos(i/48*TAU),4.5*Math.sin(i/48*TAU)]),()=>0,1.1,M.edge,{name:'annular fan duct',stage:1,offset:[0,0,14]},[{x:0,y:0,r:3.8}]);
 const fanRotor=group('ventilation rotor','body',fan);fans.push(fanRotor);cylinder(fanRotor,[0,0,.6],1.1,1.2,M.metal,{name:'auxiliary BLDC rotor',stage:2,offset:[0,0,18]});for(let i=0;i<7;i++){const g=group('fan-blade-'+i,'body',fanRotor);g.rotation.z=i/7*TAU;formed(g,[[.8,0],[3,-.6],[3.5,.3],[1.3,1]],()=>.6,.3,M.dark,{name:'fan blade',role:'render',stage:2,offset:[0,0,18]});}
 ring(fan,[0,0,1.7],4,.16,M.metal,{name:'fan guard perimeter',stage:0,offset:[0,0,17]});
 for(const a of [0,TAU/3,TAU*2/3])rod(fan,[Math.cos(a)*1.1,Math.sin(a)*1.1,1.7],[Math.cos(a)*4,Math.sin(a)*4,1.7],.13,M.metal,{name:'fan guard spoke',role:'render',stage:0,offset:[0,0,17]});
 // Fixed supports and a guide rail make the moving screw nuts legible as a cartridge.
 for(const side of [-1,1]){
  formed(scissorRoot,[[side*10.8,-3],[side*13.5,-3],[side*13.5,3],[side*10.8,3]],()=>-2.1,3.5,M.edge,{name:'lead screw bearing block',stage:1,offset:[side*8,-7,0]});
  const bearing=ring(scissorRoot,[side*12.1,0,0],.95,.2,M.metal,{name:'lead screw end bearing',stage:2,offset:[side*9,0,0]});bearing.rotation.y=Math.PI/2;
  rod(scissorRoot,[-11,side*2,-2],[11,side*2,-2],.35,M.metal,{name:'capture transverse guide rail',stage:1,offset:[0,side*5,-5]});
 }
 // Under-chin access doors are attached to the fixed throat frame, below the jaw.
 for(const side of [-1,1]){
  lid('throat service door '+side,voice,'call',[side*8,5,-4.8],-side,[[side*8,-2],[side*.6,-2],[side*.6,13],[side*7,13]],()=>-4.8,{name:'vented throat access door'},[{x:side*4,y:8,r:1.2}]);
  rod(voice,[side*6.8,-1,0],[side*6.8,11,0],.38,M.metal,{name:'bellows linear guide',stage:1,offset:[side*7,0,-6]});
  rounded(voice,[side*6.8,-1,0],[2.2,2,3],M.edge,{name:'bellows guide end mount',stage:1,offset:[side*7,0,-6]});
  const shoe=rounded(voice,[side*6.8,6,0],[2,1.3,2.6],M.copper,{name:'bellows sliding guide shoe',stage:2,offset:[side*8,4,0]});pistons.push(shoe);
 }
 const wireMat=new T.MeshStandardMaterial({color:'#3a4643',roughness:.7});
 for(const rig of legRigs){
  for(let j=0;j<3;j++){const link=rig.links[j],L=j<2?(rig.hind?(j?30:31):20):(rig.hind?18.4:7.3),w=rig.hind?3:2.1;
   const poly=[[-w*.7,-2],[w*.7,-2],[w+1,3],[w,L*.35],[w*.65,L+2],[-w*.65,L+2],[-w,L*.35],[-w-1,3]];
   for(const z of [-1.7,1.7])formed(link,poly,()=>z,.85,M.edge,{name:'tapered clevis plate',stage:1,offset:[0,0,z*4]},[{x:0,y:0,r:.85},{x:0,y:L,r:.85},{points:[[-.6,L*.25],[.6,L*.25],[.6,L*.67],[-.6,L*.67]]}]);
   for(const y of [3,L-3])rounded(link,[0,y,0],[w*1.4,2,2.6],M.metal,{name:'clevis stand-off',stage:3,offset:[0,0,-6]});
   if(j<2){const capPoly=[[-w*.8,3],[w*.8,3],[w+1,6],[w*.7,L-3],[-w*.7,L-3],[-w-1,6]],holes=[];for(let k=0;k<3;k++)holes.push({points:[[-w*.55,7+k*2.7],[w*.55,7+k*2.7],[w*.55,8+k*2.7],[-w*.55,8+k*2.7]]});
    const cap=group(rig.id+'-fairing'+j,'jump',link);cap.position.set(0,0,2.5);formed(cap,capPoly,(x,y)=>.9*Math.sin(Math.PI*(y-3)/(L-6)),.8,M.shell,{name:'vented limb fairing',role:'cover',stage:0,offset:[rig.side*6,0,10]},holes);lids.push({g:cap,side:rig.side,topic:'jump',name:'limb cap',pivot:[0,0,2.5],local:true});
    for(const y of [4,L-4])fastener(cap,0,y,1.1,[rig.side*6,0,14]);
   }
  }
  const cable=part(root,new T.BufferGeometry(),wireMat,{name:rig.id+' motor harness',role:'structure',stage:2,offset:[rig.side*5,0,8]});cable.userData.topic='jump';registry.at(-1).topic='jump';cables.push({o:cable,rig});
 }
 // Deterministic cover hinges and optics remain children of their real mounting frames.
 function update(s,opts){const {open=0,openTopic='all',openChannels=null,layer,context=true,isolate='all'}=opts;
  const shouldOpen=t=>openTopic==='all'||openTopic===t||(openTopic==='call'&&t==='body');
  for(const lid of lids){const opening=openChannels?openChannels[lid.topic]||0:shouldOpen(lid.topic)?open:0;lid.g.rotation.y=lid.side*opening*(lid.local?.48:.95);}
  for(const shoe of pistons)shoe.position.y+=s.bellows.stroke;
  membrane.scale.y=6+s.bellows.stroke;
  for(const eye of eyes){eye.yaw.rotation.z=s.motion.eyeYaw;eye.gimbal.rotation.x=s.motion.eyePitch;}
  fans.forEach(f=>f.rotation.z=s.motion.fanAngle);
  for(const {o,rig} of cables){const a=add([rig.side*12,-5,28],s.translation),b=s.legs.find(l=>l.id===rig.id).points[0],pts=[a,add(a,[rig.side*6,-2,-2]),add(b,[-rig.side*5,0,2]),b];o.geometry.dispose();o.geometry=new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),14,.32,5,false);}
 }
 return {update,lids,eyes,fans,cables,pistons,membrane,metrics:{formedPanels:true,contextualHinges:lids.length,opticalModules:eyes.length}};
}
