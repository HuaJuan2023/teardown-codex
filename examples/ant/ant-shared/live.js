// Ant live operator. Teardown / MIT architecture: one solved frame owns geometry,
// telemetry, history and projector targets. Browser input owns only intent.
import * as T from 'three';
import {frame,clamp,LEGS} from './model.js';
import {createAnt} from './geometry.js';
import {createStage} from './stage.js';
import {createConsole} from './console.js';

export const TOUR=[
 {start:0,end:5,label:'ASSEMBLED / TRIPOD WALK',view:'hero',mode:'assembled',exploded:false,isolate:'all',point:'speed'},
 {start:5,end:10,label:'OPEN SHELL / CONTROL BUS',view:'hero',mode:'cutaway',exploded:false,isolate:'all',point:'cutaway'},
 {start:10,end:15,label:'CENTERLINE SECTION',view:'hero',mode:'section',exploded:false,isolate:'all',point:'section'},
 {start:15,end:21,label:'EXPLODED / ACTUATORS',view:'hero',mode:'assembled',exploded:true,isolate:'all',point:'explode'},
 {start:21,end:25,label:'R1 / JOINT SOLUTION',view:'side',mode:'assembled',exploded:false,isolate:'RF',point:'isolate'}
];
const IDLE_SECONDS=25;
const EXPLODE_RESPONSE=7;
const DEFAULT={phase:0,speed:.35,amplitude:1,jaw:.3,paused:false,exploded:false,mode:'assembled',isolate:'all',tour:true,labels:true,blur:false,turntable:false,view:'hero',hidden:[],runtime:0,energy:0};
const wrap=x=>((x%360)+360)%360;
const smooth=(value,target,dt,response)=>value+(target-value)*(1-Math.exp(-dt*response));

// Low-cost temporal motion visualization: six samples of the same solved gait.
// These are translucent plate-edge silhouettes, never a second independent gait.
function createMotionTrails(scene){
 const group=new T.Group();group.visible=false;scene.add(group);
 const count=5,lines=[];
 for(let age=0;age<count;age++){
  const material=new T.LineBasicMaterial({color:'#d16b42',transparent:true,opacity:.14*(1-age/count),depthWrite:false});
  for(let leg=0;leg<6;leg++){
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(15),3));
   const line=new T.Line(geometry,material);group.add(line);lines.push({age,leg,line});
  }
 }
 return {
  group,
  update(s,options){
   group.visible=options.blur&&!options.paused&&s.hz>0&&options.isolate==='all'&&!options.exploded;
   if(!group.visible)return;
   const frames=Array.from({length:count},(_,age)=>frame(s.phase-(age+1)*s.hz*360*.022,s.jaw,{...options,runtime:s.runtime,energy:s.energy}));
   for(const {age,leg,line} of lines){const attr=line.geometry.attributes.position;const points=frames[age].legs[leg].points;points.forEach((p,i)=>attr.setXYZ(i,...p));attr.needsUpdate=true;line.geometry.computeBoundingSphere();}
  }
 };
}

export async function runLive(){
 document.title='ANT-06 / Plate-and-frame hexapod';
 const ui=createConsole(document.getElementById('app'));
 const st=createStage(ui.host),ant=createAnt(st.scene),trails=createMotionTrails(st.scene),c=ui.controls;
 const state={...DEFAULT,hidden:[]};
 let last=performance.now(),lastInput=last,tourStart=last,tourBeat=-1,ex=0;
 let frameCount=0,wallTime=0,slowWindows=0,perfTime=0,perfFrames=0;
 let lastConsole=0,tourCompleted=0,previousSnapshot=null;
 const captured=location.search.includes('capture');
 const stats={frames:0,meanFrameMs:0,qualityDrops:0,compileMs:0};

 // The visitor owns the exact current pose on takeover. In particular no phase,
 // jaw, explode amount, view or camera offset is reset by a pointerdown.
 function handoff(){
  lastInput=performance.now();
  if(state.tour){state.tour=false;ui.pointer(null,0);}
 }
 for(const event of ['pointerdown','wheel','keydown'])addEventListener(event,handoff,{capture:true,passive:true});
 // Touch scrolling counts as activity even if the viewport is below the fold.
 addEventListener('touchmove',handoff,{passive:true});
 addEventListener('input',()=>lastInput=performance.now(),{passive:true});

 function setView(name){
  state.view=name;st.view(name,state.exploded);
  // Multi-view uses four true orthographic cameras and scissor rectangles.
  // Orbit is disabled while that mode is active; choosing a view restores it.
  state.turntable=false;
 }
 function setMode(mode){state.mode=mode;c.mode.value=mode;}
 function setExploded(value){
  state.exploded=value;
  // Camera distance changes only for explicit view commands, avoiding a jump
  // on interruption. Fit the larger assembly when the button is activated.
  if(state.view!=='quad')st.view(state.view,value);
 }
 function isolate(id){state.isolate=id;c.isolate.value=id;}
 function pause(value){state.paused=value;}
 function step(delta){pause(true);state.phase+=delta;}
 function restartTour(){
  state.tour=true;tourStart=performance.now();tourBeat=-1;state.paused=false;
  state.hidden=[];state.labels=true;state.turntable=false;
 }
 function finishTour(now){
  state.tour=false;state.tourLabel='TOUR COMPLETE';tourCompleted++;
  state.isolate='all';state.exploded=false;state.mode='assembled';
  setView('hero');lastInput=now;ui.pointer(null,0);
 }

 c.phase.oninput=()=>{state.phase=+c.phase.value;pause(true);};
 c.speed.oninput=()=>state.speed=+c.speed.value;
 c.amplitude.oninput=()=>state.amplitude=+c.amplitude.value;
 c.jaw.oninput=()=>state.jaw=+c.jaw.value;
 c.pause.onclick=()=>pause(!state.paused);
 c.explode.onclick=()=>setExploded(!state.exploded);
 c.cutaway.onclick=()=>setMode(state.mode==='cutaway'?'assembled':'cutaway');
 c.section.onclick=()=>setMode(state.mode==='section'?'assembled':'section');
 c.mode.onchange=()=>setMode(c.mode.value);
 c.isolate.onchange=()=>isolate(c.isolate.value);
 c.tour.onclick=restartTour;
 c['label-toggle'].onclick=()=>state.labels=!state.labels;
 c.blur.onclick=()=>state.blur=!state.blur;
 c.turntable.onclick=()=>{if(state.view==='quad')setView('hero');state.turntable=!state.turntable;};
 c['step-back'].onclick=()=>step(-15);c['step-next'].onclick=()=>step(15);
 document.querySelectorAll('[data-view]').forEach(button=>button.onclick=()=>setView(button.dataset.view));
 document.querySelectorAll('[data-leg]').forEach(button=>button.onclick=()=>isolate(state.isolate===button.dataset.leg?'all':button.dataset.leg));
 document.querySelectorAll('[data-assembly]').forEach(button=>button.onclick=()=>{
  const id=button.dataset.assembly;
  if(id==='optics'||id==='mandibles'){
   state.hidden=state.hidden.includes(id)?state.hidden.filter(x=>x!==id):[...state.hidden,id];
  }else{isolate(state.isolate===id?'all':id);if(id==='all')state.hidden=[];}
 });

 addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||event.target.matches('input,select,textarea'))return;
  const key=event.key.toLowerCase();
  if(event.code==='Space'){event.preventDefault();pause(!state.paused);}
  else if(key==='e')setExploded(!state.exploded);
  else if(key==='l')state.labels=!state.labels;
  else if(key==='c')setMode(state.mode==='cutaway'?'assembled':'cutaway');
  else if(key==='s')setMode(state.mode==='section'?'assembled':'section');
  else if(key==='t')restartTour();
  else if(key==='i')isolate(state.isolate==='RF'?'all':'RF');
  else if(key==='arrowright'){event.preventDefault();step(15);}
  else if(key==='arrowleft'){event.preventDefault();step(-15);}
  else if('1234'.includes(key))setView(['hero','top','front','side'][+key-1]);
  else if(key==='5')setView('quad');
 });

 function applyTour(now){
  const elapsed=(now-tourStart)/1000;
  if(elapsed>=25){finishTour(now);return;}
  const index=TOUR.findIndex(beat=>elapsed>=beat.start&&elapsed<beat.end);
  const beat=TOUR[Math.max(0,index)];
  if(index!==tourBeat){
   tourBeat=index;
   state.mode=beat.mode;state.exploded=beat.exploded;state.isolate=beat.isolate;
   setView(beat.view);state.tourLabel=beat.label;
  }
  // An independent jaw input demonstrates the paired gears without altering
  // any leg joint or gait phase. A visitor grabbing its slider keeps this value.
  state.jaw=.5-.45*Math.cos(elapsed*Math.PI/3);
  ui.pointer(c[beat.point],(elapsed-beat.start)/(beat.end-beat.start));
 }

 function visibility(){
  // Eye/lens meshes are explicitly named below at construction time; the jaw
  // groups are the head's two groups whose origins sit on the gear centers.
  const head=ant.groups.head;
  for(const object of head.children){
   if(object.userData.component==='optics')object.visible=!state.hidden.includes('optics');
   if(object.userData.component==='mandibles')object.visible=!state.hidden.includes('mandibles');
  }
 }
 function solve(){return frame(state.phase,state.jaw,{speed:state.speed,amplitude:state.amplitude,paused:state.paused,runtime:state.runtime,energy:state.energy});}
 function paint(s,now,force=false){
  ant.update(s,{explode:ex,mode:state.mode,isolate:state.isolate,hidden:state.hidden});
  visibility();trails.update(s,state);
  st.grid.position.y=-((s.travel%20)+20)%20;
  if(state.turntable){const target=st.orbit.target,dx=st.camera.position.x-target.x,dy=st.camera.position.y-target.y;const a=.0025;st.camera.position.x=target.x+dx*Math.cos(a)-dy*Math.sin(a);st.camera.position.y=target.y+dx*Math.sin(a)+dy*Math.cos(a);}
  st.orbit.update();st.render();
  // Slow tiers redraw the dense DOM at 24 Hz while camera and pose stay smooth.
  if(force||now-lastConsole>(st.tier?42:25)){
   ui.update(s,{...state,anchors:ant.anchors},st);if(force)ui.fit();lastConsole=now;
  }
  window.ANT.current=s;window.ANT.explode=ex;
 }
 function monitor(dt){
  perfTime+=dt;perfFrames++;frameCount++;wallTime+=dt;
  if(perfTime>=.6&&perfFrames>5){
   const mean=perfTime/perfFrames;
   slowWindows=mean>.033?slowWindows+1:Math.max(0,slowWindows-1);
   stats.meanFrameMs=mean*1000;stats.frames=frameCount;
   if(slowWindows>=2&&st.tier<2){st.quality();stats.qualityDrops++;slowWindows=0;}
   perfTime=0;perfFrames=0;
  }
 }
 function draw(now){
  const dt=Math.min(Math.max((now-last)/1000,0),.065);last=now;
  state.runtime+=dt;
  if(!state.tour&&(now-lastInput)/1000>IDLE_SECONDS&&!captured)restartTour();
  if(state.tour)applyTour(now);
  if(!state.paused)state.phase+=dt*state.speed*360;
  ex=smooth(ex,+state.exploded,dt,EXPLODE_RESPONSE);
  const s=solve();state.energy+=s.power*dt/3600;
  paint(s,now);monitor(dt);previousSnapshot=s;
  requestAnimationFrame(draw);
 }

 // Compile before exposing ready so file:// automation never captures a blank
 // canvas or a partially compiled set of servo materials.
 ant.update(solve());
 const compileStart=performance.now();await st.renderer.compileAsync(st.scene,st.camera);
 stats.compileMs=performance.now()-compileStart;
 await document.fonts.ready;ui.fit();
 addEventListener('resize',()=>requestAnimationFrame(()=>ui.fit()));
 window.ANT={
  ready:true,state,current:solve(),stage:st,ant,stats,ui,trails,
  set(values){
   handoff();Object.assign(state,values);
   state.speed=clamp(state.speed,0,1.5);state.amplitude=clamp(state.amplitude,0,1);state.jaw=clamp(state.jaw,0,1);
   if(values.view)setView(values.view);
   if(values.exploded!==undefined&&state.view!=='quad')st.view(state.view,state.exploded);
   c.mode.value=state.mode;c.isolate.value=state.isolate;c.jaw.value=state.jaw;
  },
  // Explicit snapshot for tests; live integration resumes on the next RAF.
  snapshot(){return {frame:previousSnapshot??solve(),view:state.view,mode:state.mode,explode:ex,quality:st.tier,tourCompleted,stats:{...stats}};},
  restartTour,handoff,setView,
  get elapsed(){return wallTime;}
 };
 last=performance.now();tourStart=last;lastInput=last;
 paint(solve(),last,true);requestAnimationFrame(draw);
}
