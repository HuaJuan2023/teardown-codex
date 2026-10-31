// Engineering-paper console, adapted from Teardown's Strandbeest / Cessna / V8
// panel hierarchy, projected leaders and phase charts. MIT attribution in dist.
// Every moving mark below consumes the same model frame used by geometry.update.
import {D,LIMITS,LEGS} from './model.js';
export const ASSEMBLIES=[['head','HEAD'],['optics','OPTICS / EYES'],['LF','LEG L1'],['LM','LEG L2'],['LH','LEG L3'],['RF','LEG R1'],['RM','LEG R2'],['RH','LEG R3'],['thorax','THORAX'],['abdomen','ABDOMEN'],['mandibles','MANDIBLES']];
export const CALLOUTS=[
 {key:'head',name:'HEAD SHELL',sub:'FOLDED PLATE / 0.8 mm',lane:0,owner:'head'},
 {key:'gear',name:'DRIVE GEAR',sub:'10T : 10T / 1:1',lane:1,owner:'head'},
 {key:'thorax',name:'THORAX FRAME',sub:'TWIN DECK / OPEN WEB',lane:2,owner:'thorax'},
 {key:'leg',name:'FEMUR / KNEE',sub:'28 + 34 mm / PIN 2',lane:3,owner:'leg'},
 {key:'abdomen',name:'POWER BAY',sub:'CELL + BASEPLATE',lane:4,owner:'abdomen'},
 {key:'servo',name:'SERVO 9g',sub:'CASE / TABS / HORN',lane:5,owner:'RF'},
 {key:'coxa',name:'COXA ACTUATOR',sub:'9 mm / YAW AXIS',lane:6,owner:'leg'},
 {key:'pcb',name:'CONTROLLER DECK',sub:'SCHEMATIC PCB',lane:7,owner:'thorax'},
 {key:'neck',name:'NECK CLEVIS',sub:'LOCKED / M2 FASTENERS',lane:8,owner:'head'},
 {key:'optics',name:'OPTIC HEAD',sub:'PAIRED SENSOR DECK',lane:9,owner:'head'}
];
const C={ink:'#313d37',accent:'#cb532d',line:'#c9c8b7',mute:'#899084',blue:'#587e8d',green:'#657c59'};
const svg=(id,view,cls='chart')=>`<svg id="${id}" class="${cls}" viewBox="${view}" preserveAspectRatio="${id==='contact-chart'?'none':'xMidYMid meet'}" aria-hidden="true"></svg>`;
const readout=(name,id,unit='',cls='')=>`<div class="metric ${cls}"><span>${name}</span><b id="${id}">—</b><em>${unit}</em></div>`;
const panel=(n,name,body,cls='')=>`<section class="panel ${cls}" aria-label="${name}"><h2><span>${n}</span>${name}<i></i></h2>${body}</section>`;
const range=(id,title,min,max,step,val,output)=>`<label class="slider-label" for="${id}">${title}<output id="${output}"></output></label><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${title}">`;
const fmt=(v,n=1)=>Number.isFinite(v)?v.toFixed(n):'—';
const path=points=>points.map(([x,y],i)=>`${i?'L':'M'}${fmt(x,2)},${fmt(y,2)}`).join(' ');
const line=(x1,y1,x2,y2,color=C.line,width=1,dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const text=(x,y,value,color=C.mute,size=8,anchor='start')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}">${value}</text>`;
const circle=(x,y,r,color=C.accent)=>`<circle cx="${fmt(x,2)}" cy="${fmt(y,2)}" r="${r}" fill="${color}"/>`;
const curve=(points,color=C.accent,width=1.5,dash='')=>`<path d="${path(points)}" fill="none" stroke="${color}" stroke-width="${width}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;

export function createConsole(app){
 app.innerHTML=`
 <header class="masthead"><div class="logo">ANT<span>06</span></div><div class="identity"><div class="eyebrow">MORPHOLOGY LAB / MECHANISM STUDIES</div><h1>Ant hexapod <span>/</span> <small>Plate + frame</small></h1><p>PHASE-DRIVEN TRIPOD GAIT · INDEPENDENT MANDIBLES</p></div><div class="edition">DRAWING No. 06<br><strong>135 / 140 / 58</strong><br>mm · DESIGN ENVELOPE</div></header>
 <div id="viewport" aria-label="Interactive ant model"></div>
 <div class="scene-caption"><span id="scene-title">ASSEMBLED / THREE QUARTER</span><span>DRAG ORBIT · WHEEL ZOOM</span></div>
 <div class="scene-meta"><b id="scene-mode">ANT-06</b><span id="scene-detail">TRIPOD A / CONTACT SOLUTION</span></div>
 <svg id="leaders" aria-hidden="true"></svg><div id="labels"></div><div id="tour-cursor" aria-hidden="true"><span></span></div>
 <div class="left-column">
 ${panel('01','GAIT / PHASE',`
 <div class="phase-hero"><b id="phaseval"></b><span>PHASE<br>DEGREES</span><div id="tripod-chip" class="chip">TRIPOD A</div></div>

 ${range('speed','Cycle rate',0,1.5,.05,.35,'speedval')}
 ${range('amplitude','Stride amplitude',0,1,.01,1,'ampval')}
 <div class="mini-grid">${readout('STRIDE','stride','mm')}${readout('FOOT LIFT','lift','mm')}</div>
 `)}
 ${panel('02','SIX FEET / CONTACT',`
 <div class="table-key"><span>LEG / CONTACT</span><span>TRIPOD</span><span>STATE</span></div>
 <div id="servo-rows">${LEGS.map((l,i)=>`<button class="servo-row" data-leg="${l.id}" title="Inspect leg ${l.id}"><span><i id="contact-${l.id}"></i>${i<3?'L':'R'}${i%3+1}</span><span>${l.offset===0?'A':'B'}</span><b id="stance-${l.id}"></b></button>`).join('')}</div>
 <div class="contact-chips" id="contacts"></div>
 <div class="panel-note">A: L1 / L3 / R2 &nbsp; B: R1 / R3 / L2</div>
`)}
 ${panel('03','SINGLE LEG / JOINT SOLUTION',`<div class="diagnostic-desk"> <div class="linkage-head"><b id="leg-title">R1 / SOLVED LINKAGE</b><span>mm</span></div>
 ${svg('linkage','0 0 240 104')}
 <div id="angles" class="angle-grid"></div>
 <div class="limit-line">J1 ±35° &nbsp; J2 −20…65° &nbsp; J3 −10…90°</div><div class="log-readout"><div id="log-line"></div><div id="error-line"></div><div id="travel-line"></div></div></div>`)}
 </div>
 <div class="right-column">
 <section class="status-strip"><div><b>ANT-06</b><span id="runtime">00:00</span></div><strong id="status">ASSEMBLED</strong><div><span id="operator">OP / AUTO TOUR</span><span id="quality">Q0</span></div></section>
 ${panel('04','ASSEMBLIES',`
 <div class="assembly-grid">${ASSEMBLIES.map(([id,label])=>`<button data-assembly="${id}" aria-pressed="false">${label}</button>`).join('')}<button data-assembly="all" class="all">COMPLETE / RESET</button></div>
 <label class="compact-select">ISOLATE<select id="isolate" aria-label="Isolate assembly"><option value="all">Complete robot</option><option value="head">Head + mandibles</option><option value="thorax">Thorax + electronics</option><option value="abdomen">Abdomen</option>${LEGS.map(l=>`<option value="${l.id}">${l.id}</option>`).join('')}</select></label>`)}
 ${panel('05','DISPLAY / INSPECTION',`
 <div class="display-grid"><button id="label-toggle">LABELS</button><button id="explode">EXPLODED</button><button id="cutaway">CUTAWAY</button><button id="section">SECTION</button><button id="blur">MOTION TRAIL</button><button id="turntable">TURNTABLE</button></div>
 <label class="compact-select">SHELL<select id="mode" aria-label="Display mode"><option value="assembled">Assembled</option><option value="cutaway">Clear shell / cutaway</option><option value="section">Centerline section</option></select></label>
 <div class="views">${['hero','top','front','side'].map((v,i)=>`<button data-view="${v}">${i+1} ${v.toUpperCase()}</button>`).join('')}<button data-view="quad">⊞ FOUR</button></div>`)}

 </div>
 <div class="bottom-console">
 ${panel('06','GAIT LOG / CYCLE TRANSPORT',`
 <div class="transport"><button id="pause">PAUSE</button><button id="step-back" title="Step backward 15 degrees">−15°</button><button id="step-next" title="Step forward 15 degrees">+15°</button><button id="tour">RESUME TOUR</button><span id="tourstate"></span><b id="cycle-count"></b></div>
 <div class="timeline-labels"><span>PLANT A / LIFT B</span><span>TRANSFER / 180°</span><span>PLANT B / LIFT A</span><span>360°</span></div>
 <input id="phase" type="range" min="0" max="360" step=".1" value="0" aria-label="Gait phase">
 <div class="bottom-charts">${svg('contact-chart','0 0 720 64')}<div class="jaw-control">${range('jaw','Mandible opening',0,1,.01,.3,'jawval')}${svg('jaw-schema','0 0 210 42')}<span>1:1 SPUR PAIR · INDEPENDENT AXIS</span></div></div></div>`)}
 </div>
 <footer><span>6 LEGS / 2 MANDIBLES / <b id="servo-count"></b> × 9g</span><span>MORPHOLOGY LAB · TEARDOWN / THREE.JS · MIT</span><span>LINKS 9 / 28 / 34 / 12 mm</span></footer>`;
 const $=id=>document.getElementById(id);
 const controls=Object.fromEntries(['phase','speed','amplitude','jaw','pause','tour','mode','explode','isolate','cutaway','section','blur','turntable','step-back','step-next','label-toggle'].map(k=>[k,$(k)]));
 // Cache nodes; no layout work is required to update power or servo instruments.
 const K=Object.fromEntries([...app.querySelectorAll('[id]')].map(el=>[el.id,el]));
 const set=(id,value)=>{if(K[id]&&K[id].textContent!==String(value))K[id].textContent=value;};
 const on=(el,value)=>{el.classList.toggle('active',!!value);el.setAttribute('aria-pressed',String(!!value));};
 function linkage(s,opts){
  const id=LEGS.some(l=>l.id===opts.isolate)?opts.isolate:'RF',leg=s.legs.find(l=>l.id===id);
  const x=p=>18+Math.hypot(p[0]-leg.hip[0],p[1]-leg.hip[1])*2.55;
  const y=p=>91-p[2]*1.7;
  let h=line(0,92,240,92,C.line,1);
  for(let i=0;i<28;i++)h+=line(i*9,93,i*9-4,98,C.line,.6);
  leg.points.slice(0,-1).forEach((p,i)=>{const b=leg.points[i+1];h+=line(x(p),y(p),x(b),y(b),i===1?C.accent:C.ink,i===1?5:3);h+=circle(x(p),y(p),3,C.ink)+circle(x(p),y(p),1.3,'#f5f2e8');});
  const foot=leg.points[4];h+=circle(x(foot),y(foot),2.5,C.accent);
  h+=text(5,12,`${id} / ${leg.stance?'STANCE':'SWING'}`,C.ink,8)+text(235,12,`${fmt(leg.lift)} mm`,C.accent,8,'end');
  K.linkage.innerHTML=h;set('leg-title',`${id} / SOLVED LINKAGE`);
  K.angles.innerHTML=leg.angles.map((a,i)=>`<div><span>J${i+1}</span><b>${fmt(a)}°</b><i style="--value:${(a-LIMITS[i][0])/(LIMITS[i][1]-LIMITS[i][0])*100}%"></i></div>`).join('');
 }
 function contactChart(s){
  // Phase-domain chart: the cursor and every contact mark use solved leg u.
  const W=720,left=30,width=W-left-8;let h='';
  for(let i=0;i<5;i++){const x=left+width*i/4;h+=line(x,0,x,63,C.line,.6)+text(x,7,`${i*90}°`,C.mute,6);}
  s.legs.forEach((l,i)=>{const y=13+i*8;h+=text(0,y+5,`${i<3?'L':'R'}${i%3+1}`,C.ink,7);h+=line(left,y+3,W-8,y+3,C.line,5);
   {const a=((360-l.offset)%360+360)%360;h+=`<rect x="${left+width*a/360}" y="${y}" width="${width/2}" height="6" fill="${i===3?C.accent:C.ink}"/>`;}
  });
  const x=left+width*s.phaseDeg/360;h+=line(x,9,x,63,C.accent,1.5);K['contact-chart'].innerHTML=h;
 }
 function jawSchema(s){
  const a=s.jawAngle*Math.PI/180;let h='';
  for(const side of [-1,1]){const x=105+side*11;h+=`<circle cx="${x}" cy="15" r="10" fill="none" stroke="${C.line}" stroke-width="1.5"/>`;
   const end=[x+side*Math.sin(a)*29,15+Math.cos(a)*22];h+=line(x,15,...end,C.ink,3)+circle(...end,2,C.accent);h+=circle(x,15,2,C.accent);
  }
  h+=text(12,26,'JAW',C.mute,8)+text(199,26,`${fmt(s.gap)} mm`,C.accent,9,'end');K['jaw-schema'].innerHTML=h;
 }
 function labels(s,opts,stage){
  if(!opts.labels||opts.view==='quad'){K.leaders.innerHTML='';K.labels.innerHTML='';return;}
  const rect=K.viewport.getBoundingClientRect();const W=innerWidth,H=innerHeight;
  K.leaders.setAttribute('viewBox',`0 0 ${W} ${H}`);
  let lines='',html='';const dense=opts.exploded||opts.mode!=='assembled';
  const specs=CALLOUTS.filter((c,i)=>dense||i<6);
  const rows=[.10,.10,.30,.85,.89,.53,.70,.32,.50,.70];
  for(const c of specs){
   const legOwner=LEGS.some(l=>l.id===opts.isolate);
   if(opts.isolate!=='all'&&c.owner!==opts.isolate&&!(c.owner==='leg'&&legOwner))continue;
   if(opts.hidden?.includes(c.owner))continue;
   const v=opts.anchors[c.key]?.clone().project(stage.camera);if(!v||v.z>1||v.z< -1)continue;
   const ax=rect.left+(v.x*.5+.5)*rect.width,ay=rect.top+(-v.y*.5+.5)*rect.height;
   const right=c.lane%2===1,lx=rect.left+(right?rect.width-148:20),ly=rect.top+rows[c.lane]*rect.height;
   const end=right?lx:lx+126;
   lines+=`<path d="M${fmt(ax)},${fmt(ay)} L${fmt(end)},${fmt(ly+24)} H${fmt(lx+126)}"/><circle cx="${fmt(ax)}" cy="${fmt(ay)}" r="2.6"/>`;
   html+=`<div class="callout" style="left:${lx}px;top:${ly}px"><b>${c.name}</b><span>${c.sub}</span></div>`;
  }
  K.leaders.innerHTML=lines;K.labels.innerHTML=html;
 }
 function update(s,opts,stage){
  set('phaseval',`${fmt(s.phaseDeg,1)}°`);set('speedval',`${fmt(s.hz,2)} Hz`);set('ampval',`${fmt(s.amplitude*100,0)}%`);
  set('stride',fmt(s.stride));set('lift',fmt(s.lift));set('tripod-chip',`TRIPOD ${s.tripod}`);
  set('runtime',`${String(Math.floor(s.runtime/60)).padStart(2,'0')}:${String(Math.floor(s.runtime%60)).padStart(2,'0')}`);
  set('status',opts.exploded?'THORAX OPEN':opts.mode==='assembled'?'ASSEMBLED':opts.mode==='section'?'SECTION / X = 0':'SHELL TRANSPARENT');
  set('operator',opts.tour?'OP / AUTO TOUR':'OP / MANUAL');set('quality',`Q${stage.tier}`);
  set('scene-title',`${opts.exploded?'EXPLODED':opts.mode.toUpperCase()} / ${opts.view.toUpperCase()}`);
  set('scene-detail',`TRIPOD ${s.tripod} / ${s.contacts} CONTACTS / ${fmt(s.hz,2)} Hz`);
  set('scene-mode',opts.isolate==='all'?'ANT-06':`ISOLATE / ${opts.isolate}`);
  for(const l of s.legs){
   K[`contact-${l.id}`].classList.toggle('down',l.stance);
   set(`stance-${l.id}`,l.stance?'PLANTED':'SWING');
   K[`contact-${l.id}`].closest('button').classList.toggle('active',opts.isolate===l.id);
  }
  K.contacts.innerHTML=s.legs.map(l=>`<span class="${l.stance?'contact':''}">${l.id}</span>`).join('');
  set('cycle-count',`${fmt(s.cycles,2)} CYC`);set('jawval',`${fmt(s.gap)} mm`);set('servo-count',s.servoCount);
  set('log-line',`${opts.paused?'HOLD':'WALK'} / TRIPOD ${s.tripod} / ${s.contacts} FEET DOWN`);
  set('error-line',`IK RESIDUAL ${s.maxError.toExponential(1)} mm`);set('travel-line',`STRIDE ${fmt(s.stride)} mm / LIFT ${fmt(s.lift)} mm`);
  set('tourstate',opts.tour?`AUTO / ${opts.tourLabel??'ASSEMBLED'}`:'MANUAL / IDLE RETURN 25s');
  controls.phase.value=s.phaseDeg;controls.jaw.value=s.jaw;controls.speed.value=opts.speed;controls.amplitude.value=s.amplitude;controls.mode.value=opts.mode;controls.isolate.value=opts.isolate;
  set('pause',opts.paused?'PLAY':'PAUSE');on(controls.explode,opts.exploded);on(controls.cutaway,opts.mode==='cutaway');on(controls.section,opts.mode==='section');on(controls.blur,opts.blur);on(controls.turntable,opts.turntable);on(controls['label-toggle'],opts.labels);
  app.querySelectorAll('[data-assembly]').forEach(el=>on(el,el.dataset.assembly===opts.isolate||opts.hidden?.includes(el.dataset.assembly)));app.querySelectorAll('[data-view]').forEach(el=>on(el,el.dataset.view===opts.view));
  linkage(s,opts);contactChart(s);jawSchema(s);labels(s,opts,stage);
 }
 function pointer(target,progress){
  const cursor=K['tour-cursor'];const el=typeof target==='string'?K[target]:target;
  if(!el){cursor.style.opacity='0';return;}
  const r=el.getBoundingClientRect();cursor.style.opacity='.85';cursor.style.left=`${r.left+r.width*.7}px`;cursor.style.top=`${r.top+r.height*.5}px`;cursor.style.setProperty('--pulse',1+Math.sin(progress*Math.PI)*.15);
 }
 function fit(){
  const mobile=innerWidth<=850;
  for(const rail of app.querySelectorAll('.left-column,.right-column')){
   rail.style.transform='';rail.style.width='';
   if(mobile)continue;
   const r=rail.getBoundingClientRect(),base=r.width;
   const children=[...rail.children];
   const needed=children.at(-1).getBoundingClientRect().bottom-r.top;
   const available=K.viewport.getBoundingClientRect().bottom-r.top;
   const scale=Math.min(1,(available-5)/needed);
   if(scale<1){rail.style.width=base/scale+'px';rail.style.transform='scale('+scale+')';rail.style.transformOrigin=rail.classList.contains('right-column')?'top right':'top left';}
  }
 }
 return {host:K.viewport,controls,update,pointer,fit,root:app,callouts:CALLOUTS};
}
