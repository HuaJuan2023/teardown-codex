// Procedural plate-and-frame hexapod. All coordinates mm, z up.
// Teardown skill patterns / MIT; no fetched assets. Envelopes from user specification.
import * as T from 'three';
import {D,LEGS} from './model.js';
export function createAnt(scene){
 const root=new T.Group();scene.add(root);
 const material=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.86,metalness:.12,...extra});
 const M={frame:material('#68675c'),shell:material('#aaa593',{side:T.DoubleSide,metalness:.2}),edge:material('#c0baa8'),dark:material('#69675e'),servo:material('#7b8f91',{metalness:.08,transparent:true,opacity:.27,depthWrite:false}),accent:material('#d4592e'),brass:material('#bb9860'),pcb:material('#345d53'),wire:material('#9b4934'),rubber:material('#35403c',{metalness:0,roughness:1}),glass:material('#223d3b',{metalness:.55,roughness:.23})};
 const groups={},shells=[],legs=[],jaws=[];
 const group=id=>{const g=new T.Group();g.name=id;root.add(g);groups[id]=g;return g;};
 const mesh=(g,geo,m,p=[0,0,0])=>{const o=new T.Mesh(geo,m);o.position.set(...p);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};
 const box=(g,d,p,m=M.frame)=>mesh(g,new T.BoxGeometry(...d),m,p);
 const shape=pts=>{const s=new T.Shape();pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;};
 function plate(g,pts,depth,p,m=M.frame,holes=[]){const s=shape(pts);for(const poly of holes)s.holes.push(new T.Path(shape(poly).getPoints()));return mesh(g,new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:12}),m,p);}
 const rect=(x,y,w,h)=>[[x-w/2,y-h/2],[x+w/2,y-h/2],[x+w/2,y+h/2],[x-w/2,y+h/2]];
 function disk(g,r,h,p,m=M.edge){const geo=new T.CylinderGeometry(r,r,h,24);geo.rotateX(Math.PI/2);return mesh(g,geo,m,p);}
 function screw(g,p){disk(g,1.7,1,p,M.edge);box(g,[1.8,.35,.15],[p[0],p[1],p[2]+.55],M.dark);disk(g,1,6,[p[0],p[1],p[2]-3],M.edge);}
 function wire(g,points,m=M.wire,r=.38){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),18,r,5,false),m);}
 function beam(g,a,b,w=3,depth=2,m=M.frame){const o=box(g,[w,1,depth],[0,0,0],m);pose(o,a,b);return o;}
 function pose(o,a,b){const va=new T.Vector3(...a),vb=new T.Vector3(...b);o.position.copy(va).add(vb).multiplyScalar(.5);o.scale.y=va.distanceTo(vb);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());}
 // Skeletonized thorax. Four true through-windows, upper rails, six servo saddles.
 const thorax=group('thorax');
 const outline=[[-17,-17],[-12,-20],[12,-20],[17,-17],[17,17],[12,20],[-12,20],[-17,17]];
 const holes=[rect(-8,-11,9,14),rect(8,-11,9,14),rect(-8,11,9,14),rect(8,11,9,14)];
 plate(thorax,outline,1.8,[0,0,33],M.frame,holes);
 const lid=plate(thorax,outline,1.4,[0,0,52],M.edge,[rect(0,0,20,27)]);shells.push(lid);
 // Windowed box frame: side webs are real pierced sheet, gears visible through them.
 for(const x of [-22,20.4]){
  const web=plate(thorax,[[-17,0],[17,0],[17,17],[-17,17]],1.6,[x,0,35],M.frame,[rect(0,8,27,10)]);
  web.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(0,0,1),new T.Vector3(1,0,0)));
 }
 for(const x of [-14,14])for(const y of [-19,19]){disk(thorax,2,16,[x,y,43],M.brass);screw(thorax,[x,y,54]);}
 for(const y of [-27,27]){plate(thorax,[[-17,-4],[17,-4],[20,0],[17,4],[-17,4],[-20,0]],2,[0,y,35],M.frame,[rect(0,0,16,3)]);}
 // Thin independent pocket mouths; no long side slab competing with the thorax.
 for(const side of [-1,1])for(const y of [-27,0,27]){
  const cheek=plate(thorax,[[-11,0],[11,0],[11,19],[-11,19]],.8,[side*22,y,32],M.frame,[rect(0,9.5,20,16)]);
  cheek.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(0,0,1),new T.Vector3(1,0,0)));
 }
 // Removable top ring and compact accent strip preserve a readable open chassis.
 disk(thorax,1.2,.5,[-14,0,54],M.accent);
 for(const y of [-10,10]){disk(thorax,6,2,[0,y,47],M.brass);for(let i=0;i<16;i++){const a=i*Math.PI/8;const t=box(thorax,[1.4,1.4,2],[6*Math.sin(a),y+6*Math.cos(a),47],M.edge);t.rotation.z=a;}screw(thorax,[0,y,49]);}
 const pcb=box(thorax,[16,30,1.2],[0,0,41],M.pcb);
 for(const x of [-7,7])for(let y=-10;y<=10;y+=4){box(thorax,[3,2,1.8],[x,y,42.4],M.dark);box(thorax,[.8,2.5,.6],[x+2,y,42],M.brass);}
 box(thorax,[7,9,1.5],[0,0,42.5],M.dark);
 for(const y of [-24,24]){box(thorax,[12,3,3],[0,y,39],M.dark);for(let x=-4;x<=4;x+=2)box(thorax,[.6,3.3,.5],[x,y,41],M.brass);}
 // Abdomen: arched battery bay, a separate baseplate, rib bands and power lead.
 const abdomen=group('abdomen');abdomen.position.y=0;
 const abdBase=plate(abdomen,[[-8,-22],[-17,-10],[-17,9],[-10,21],[10,21],[17,9],[17,-10],[8,-22]],1.8,[0,-43,34],M.frame,[rect(0,0,17,22)]);
 const abdShellGroup=new T.Group();abdShellGroup.position.set(0,-43,0);abdomen.add(abdShellGroup);
 // Barrel canopy follows a transverse arch; the open front reveals the base/battery.
 const vs=[],tr=(a,b,c)=>vs.push(...a,...b,...c);
 for(let j=0;j<12;j++)for(let k=0;k<6;k++){
  const pt=(u,v,inset=0)=>{const a=Math.PI*u/12;const y=-22+44*v/6;const taper=1-.33*Math.pow(Math.abs(y)/22,2);const rise=1-.22*Math.pow(Math.abs(y)/22,2);return [(18-inset)*Math.cos(a)*taper,y,36+(18-inset)*Math.sin(a)*rise];};
  for(const inset of [0,.8]){const a=pt(j,k,inset),b=pt(j+1,k,inset),c=pt(j,k+1,inset),d=pt(j+1,k+1,inset);tr(a,b,c);tr(b,d,c);}
 }
 // Closed rear cheek, with an open underside/front over the battery base.
 for(let j=0;j<12;j++){
  const p=(u,inside=0)=>[(18-inside)*Math.cos(Math.PI*u/12)*.76,-22,36+(18-inside)*Math.sin(Math.PI*u/12)*.8];
  tr(p(j),p(j+1),[0,-22,36]);
  tr(p(j, .8),[0,-21.2,36],p(j+1,.8));
 }
 const ag=new T.BufferGeometry();ag.setAttribute('position',new T.Float32BufferAttribute(vs,3));ag.computeVertexNormals();const canopy=mesh(abdShellGroup,ag,M.shell);shells.push(canopy);
 canopy.add(new T.LineSegments(new T.EdgesGeometry(ag,30),new T.LineBasicMaterial({color:'#778174'})));
 box(abdomen,[23,25,7],[0,-44,39.5],M.edge);disk(abdomen,1,.5,[0,-44,43.5],M.frame);
 for(const y of [-54,-35]){box(abdomen,[25,1,1.2],[0,y,44],M.dark);for(const x of [-12,12])screw(abdomen,[x,y,36]);}
 wire(abdomen,[[8,-33,41],[8,-25,43],[4,-22,40]]);
 beam(thorax,[0,-27,39],[0,-34,39],7,5,M.edge);
 // Head is a folded shell over a laser-cut optical deck. Neck is a clevis, not a ball.
 const head=group('head');
 plate(head,[[-10,30],[-15,38],[-14,53],[-8,60],[8,60],[14,53],[15,38],[10,30]],1.8,[0,0,40],M.frame,[rect(0,43,13,12)]);
 const hgroup=new T.Group();hgroup.position.y=45;head.add(hgroup);
 // Sloping removable sheet hood, with an actual crown inspection hole.
 const hood=plate(hgroup,[[-14,-15],[14,-15],[14,12],[9,15],[-9,15],[-14,12]],.8,[0,0,0],M.shell,[rect(0,-1,11,12)]);
 const hv=hood.geometry.attributes.position;
 for(let i=0;i<hv.count;i++)hv.setZ(i,57.2-(hv.getY(i)+15)*.34+hv.getZ(i));
 hood.geometry.computeVertexNormals();shells.push(hood);
 for(const x of [-14,12.4]){
  const cheek=plate(hgroup,[[-15,0],[-15,15],[-7,14],[9,8],[15,3],[12,0]],.8,[x,0,42],M.shell,[[[-12,3],[-12,11],[-6,10],[7,5],[8,3]]]);
  cheek.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(0,0,1),new T.Vector3(1,0,0)));shells.push(cheek);
 }
 for(const x of [-11,11])wire(head,[[x,52,51],[x*1.5,59,57],[x*2,65,52]],M.dark,.55);
 for(const side of [-1,1]){const eye=disk(head,4,2,[side*13,44,47],M.dark);const lens=disk(head,2.7,.7,[side*14.3,44,47],M.glass);eye.rotation.y=lens.rotation.y=Math.PI/2;eye.userData.component='optics';lens.userData.component='optics';}
 box(head,[6,8,4],[0,31,42],M.edge);for(const x of [-4,4])box(head,[2,8,8],[x,30,42],M.frame);
 for(const x of [-10,10]){screw(head,[x,36,43]);wire(head,[[x,42,45],[x*1.4,32,48],[x*1.5,19,48]],M.dark,.65);}
 // Two equal module-1 10-tooth spur gears. Tip positions preserve aperture math.
 for(const side of [-1,1]){
  const g=new T.Group();g.position.set(side*5,54.5,43);g.userData.component='mandibles';head.add(g);
  disk(g,4.45,2,[0,0,0],M.brass);
  for(let i=0;i<10;i++){const a=i*Math.PI/5;const tooth=box(g,[1.4,1.5,2],[4.8*Math.sin(a),4.8*Math.cos(a),0],M.brass);tooth.rotation.z=-a;}
  plate(g,[[-2,1],[2,1],[side*3+2,5],[side*3+2,9],[1.25,14],[-1.25,14],[side*3-2,9],[side*3-2,5]],2.5,[0,0,.7],M.frame);
  const grip=box(g,[2.5,3,3],[0,14,0],M.frame);disk(g,1,6,[0,0,0],M.edge);screw(g,[0,0,2]);jaws.push({g,side,grip});
 }
 function servo(g){
  // Nominal 9g case modeled in local axes, then laid horizontally into a hip tray.
  // An illustrative right-angle coupling connects the case to the Z-axis coxa horn.
  const s=new T.Group();g.add(s);
  const caseGroup=new T.Group();s.add(caseGroup);
  // The characteristic translucent blue SG90 case reveals its DC motor and
  // reduction stack. Solid internals break up the otherwise furniture-like box.
  disk(caseGroup,4.4,13,[0,-8,-16],M.edge);
  disk(caseGroup,3.1,1,[0,-8,-23],M.dark);
  disk(caseGroup,1,7,[0,-8,-6],M.brass);
  for(const [y,z,r] of [[-8,-7,3.8],[-3,-5.5,3.6],[0,-3.5,4.5]]){
   disk(caseGroup,r,1.1,[0,y,z],M.brass);
   for(let t=0;t<12;t++){const a=t*Math.PI/6;const tooth=box(caseGroup,[.8,.8,.9],[r*Math.sin(a),y+r*Math.cos(a),z],M.edge);tooth.rotation.z=-a;}
  }
  box(caseGroup,[1,8,10],[4.5,1,-17],M.pcb);
  wire(caseGroup,[[0,-8,-22],[3,-12,-22],[5,-10,-16]],M.accent,.3);
  box(caseGroup,[12.2,22.8,20],[0,-4,-14.3],M.servo);
  box(caseGroup,[12.2,22.8,1.4],[0,-4,-24.3],M.servo);
  box(caseGroup,[12.2,16,4],[0,-1,-2],M.servo);
  disk(caseGroup,5.8,4,[0,0,-1.5],M.servo);
  disk(caseGroup,2.3,3,[0,0,2],M.edge); // -25..+3.5 = 28.5 mm case/output depth
  for(const y of [-18,10]){box(caseGroup,[12.2,4,2],[0,y,-4],M.servo);for(const x of [-4,4])screw(caseGroup,[x,y,-2.5]);}
  for(const x of [-6.25,6.25])for(const y of [-11,-6,-1,4])box(caseGroup,[.6,1,19],[x,y,-14],M.edge);
  box(caseGroup,[.4,9,6],[6.6,-4,-14],M.edge); // manufacturer's silver label
  for(const y of [-6,-3,0])box(caseGroup,[.5,1,.5],[6.9,y,-12],M.dark);
  disk(caseGroup,.7,.3,[0,0,3.4],M.accent);
  const horn=new T.Group();s.add(horn);s.userData.horn=horn;s.userData.caseGroup=caseGroup;
  // Gear tower couples the horizontal cassette to the vertical coxa output.
  disk(s,4.8,5,[0,0,-2],M.frame);disk(s,3.2,1,[0,0,.7],M.brass);
  disk(horn,4.2,1.5,[0,0,1.5],M.edge);box(horn,[3,14,1.2],[0,0,2.3],M.edge);screw(horn,[0,0,3]);
  for(let i=0;i<3;i++)wire(caseGroup,[[i-1,-15,-14],[i-1,-21,-12],[i-1,-20,-3],[i-1,-12,2]],i===1?M.accent:i===2?M.brass:M.dark,.3);
  return s;
 }
 function link(g,len,width,thickness,accent=false){
  const l=new T.Group();g.add(l);
  const pts=len===12?[[-width*.5,0],[-width*.5,4],[0,len],[width*.5,4],[width*.5,0]]:[[-width*.35,0],[-width*.5,1],[-width*.5,4],[-width*.40,len-2],[-width*.25,len],[width*.25,len],[width*.40,len-2],[width*.5,4],[width*.5,1],[width*.35,0]];
  const holes=len>15?[rect(0,len*.5,width*.24,len*.48)]:[];
  for(const z of [-thickness/2,thickness/2-.85])plate(l,pts,.85,[0,0,z],M.frame,holes);
  for(const y of (len===12?[2]:[2,len-2]))box(l,[width*.6,2,thickness],[0,y,0],M.edge);
  const seam=box(l,[.7,len*.35,.4],[0,len*.5,thickness/2+.1],M.edge);
  return l;
 }
 for(const spec of LEGS){const g=group(spec.id),links=[link(g,9,6,4.2),link(g,28,6,4.2),link(g,34,4.8,3.8),link(g,12,2,3)];
  const joints=Array.from({length:4},(_,i)=>{const q=new T.Group();g.add(q);disk(q,i===0?3.3:i===3?1:2.7,i===0?3:4,[0,0,0],M.edge);disk(q,i===0?1.8:i===3?1:1.5,4.5,[0,0,0],M.accent);disk(q,1,5.8,[0,0,0],M.dark);
   if(i===1||i===2)for(const z of [-2.5,2.5]){disk(q,2.8,.9,[0,0,z],M.edge);disk(q,1,.95,[0,0,z],M.dark);}
   return q;});
  const drive=servo(g);
  // Six side-slot cassettes, retained by folded rails.
  for(const x of [-6.8,6.8])box(drive,[.8,20,1.2],[x,0,-7],M.frame);
  const toeGeo=new T.ExtrudeGeometry(shape([[-1,-2],[1,-.5],[1,.5],[-1,2]]),{depth:1.5,bevelEnabled:false});toeGeo.translate(0,0,-.75);
  const pad=mesh(g,toeGeo,M.rubber);legs.push({id:spec.id,g,links,joints,drive,pad});
 }
 const anchors={},clip=new T.Plane(new T.Vector3(-1,0,0),0);let oldMode='';
 function update(s,{explode=0,mode='assembled',isolate='all',hidden=[]}={}){
  const e=explode;
  head.position.set(0,e*24,e*12);abdomen.position.set(0,-e*22,e*13);lid.position.z=52+e*23;hgroup.position.z=e*20;abdShellGroup.position.z=e*19;
  if(oldMode!==mode){M.shell.clippingPlanes=mode==='section'?[clip]:null;M.shell.transparent=mode==='cutaway';M.shell.opacity=mode==='cutaway'?.1:1;M.shell.depthWrite=mode!=='cutaway';M.shell.needsUpdate=true;for(const sh of shells)sh.children.forEach(l=>l.visible=mode!=='cutaway');oldMode=mode;}
  for(const {g,side,grip} of jaws){g.rotation.z=-side*s.jawAngle*Math.PI/180;grip.rotation.z=-g.rotation.z;}
  for(const l of legs){const p=s.legs.find(a=>a.id===l.id);l.g.position.set(p.side*e*22,(1-p.row)*e*7,e*2);
   const normal=new T.Vector3(-Math.sin(p.angles[0]*Math.PI/180),p.side*Math.cos(p.angles[0]*Math.PI/180),0);
   l.links.forEach((o,i)=>{const a=new T.Vector3(...p.points[i]),b=new T.Vector3(...p.points[i+1]),axis=b.clone().sub(a).normalize();const z=normal.clone(),x=axis.clone().cross(z).normalize();o.position.copy(a);o.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(x,axis,z));});
   l.joints.forEach((o,i)=>{o.position.set(...p.points[i]);if(i>0)o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),normal);});
   l.drive.position.set(...p.hip);
   l.drive.userData.caseGroup.rotation.set(Math.PI/2,0,0);
   l.drive.userData.caseGroup.position.set(p.side*e*5,-14.3,4-e*12);l.drive.userData.horn.rotation.z=p.side===1?p.angles[0]*Math.PI/180-Math.PI/2:Math.PI/2-p.angles[0]*Math.PI/180;l.pad.position.set(...p.points[4]);l.pad.position.z+=.75;
  }
  for(const [id,g] of Object.entries(groups))g.visible=(isolate==='all'||isolate===id)&&!hidden.includes(id);
  root.updateMatrixWorld(true);
  const wp=(g,p)=>g.localToWorld(new T.Vector3(...p));
  anchors.head=wp(head,[0,42,56]);anchors.gear=wp(head,[5,54.5,45]);anchors.optics=wp(head,[11,50,55]);anchors.neck=wp(head,[0,31,43]);anchors.abdomen=wp(abdomen,[0,-45,50]);anchors.thorax=wp(thorax,[0,0,53+e*23]);anchors.com=wp(thorax,s.com);
  const active=s.legs.find(a=>a.id===(isolate.length===2?isolate:'RF'));
  anchors.leg=wp(groups[active.id],active.points[2]);anchors.coxa=wp(groups[active.id],active.points[1]);anchors.servo=wp(groups.RF,[20,27,42]);anchors.pcb=wp(thorax,[0,0,43]);
 }
 return {root,groups,anchors,update,shells,legs,materials:M};
}
