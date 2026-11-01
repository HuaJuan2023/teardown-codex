import {frame as biologicalFrame,solveLimb,sub,add,mul,unit,cross,dot,length,lerp,clamp,smooth,TAU} from './bio-model.js';
export {clamp,TAU,sub,add,mul,unit,cross,dot,length,lerp};
export const DURATIONS={walk:3,rest:4,jump:2.4,call:2,hunt:2.4};
export const PHASES={walk:[['交替支撑',.12],['抬足前送',.38],['对侧接替',.67],['稳态复位',.94]],rest:[['待机',0]],jump:[['压簧',.23],['释放',.33],['收腿',.56],['落地',.81]],call:[['风箱收缩',.2],['风箱展开',.46],['回位',.88]],hunt:[['开颌',.25],['剪叉伸出',.44],['夹持回收',.68],['复位',.97]]};
export const GEAR={sun:12,planet:18,ring:48,ratio:5,module:.16};
export function transmission(output){const {ratio,sun,planet}=GEAR,input=ratio*output;return {output,input,carrier:output,planetSpin:output-(sun/planet)*(input-output)};}
export function localAxes(a,b,c){let normal=unit(cross(sub(b,a),sub(c,b)));if(length(normal)<.5)normal=[1,0,0];const y=unit(sub(b,a)),x=unit(cross(y,normal));return {x,y,z:normal};}
export function frame(options={}){
 const s=biologicalFrame({...options,mode:options.mode==='walk'?'rest':options.mode});s.mode=options.mode||'rest';
 const clock=options.motionTime??s.p*DURATIONS[s.mode],offset=options.rootOffset||[0,0,0],walk=s.mode==='walk',bodyBob=s.mode==='jump'?0:.35*Math.sin(TAU*clock*.42);
 s.translation=add(s.translation,add(offset,[0,walk?14*s.p:0,bodyBob]));
 s.motion={clock,eyeYaw:.11*Math.sin(clock*1.35),eyePitch:.06*Math.sin(clock*.82),fanAngle:clock*TAU*1.6,bodyBob};
 for(const leg of s.legs){for(let i=0;i<leg.points.length;i++)leg.points[i]=add(leg.points[i],offset);for(const d of leg.digits){d.base=add(d.base,offset);d.tip=add(d.tip,offset);}leg.points[0][2]+=bodyBob;if(walk){leg.points[0][1]+=14*s.p;const phase=s.p+(leg.hind===(leg.side<0)?0:.5),cycle=Math.floor(phase),u=phase-cycle,travel=14*(cycle-(leg.hind===(leg.side<0)?0:.5)+(u>.62?smooth((u-.62)/.38):0)),lift=u>.62?7*Math.sin(Math.PI*(u-.62)/.38):0,delta=[0,travel,lift];if(options.settleWalk){const start=leg.hind===(leg.side<0)?.06:.54,q=clamp((s.p-start)/.36);delta[1]=14*smooth(q);delta[2]=7*Math.sin(Math.PI*q);}for(let i=2;i<leg.points.length;i++)leg.points[i]=add(leg.points[i],delta);for(const d of leg.digits){d.base=add(d.base,delta);d.tip=add(d.tip,delta);}leg.contact=options.settleWalk?(s.p<=(leg.hind===(leg.side<0)?.06:.54)||s.p>=(leg.hind===(leg.side<0)?.42:.90)):u<=.62;}}
 if(s.mode==='rest'||walk)s.jaw=.012+.008*(1+Math.sin(clock*1.1));s.stage=walk?'交替抬足 / 仿生潜行':options.mode==='hunt'?'剪叉伸缩 / 原创机器人机构':options.mode==='call'?'风箱驱动 / 簧片发声':s.stage;
 s.drives=[];for(const leg of s.legs){const [a,oldB,c]=leg.points,h=unit([c[0]-a[0],c[1]-a[1],0]),n=unit(cross(h,[0,0,1]));
  // A vertical yaw plane and two revolute joints form a closed, three-axis leg.
  const solved=solveLimb(a,c,...leg.lengths,add(a,add(mul(h,24),[0,0,20])));leg.points[1]=solved.points[1];leg.residual=solved.residual;
  const b=leg.points[1],v=unit(sub(b,a)),v2=unit(sub(c,b)),yaw=Math.atan2(-h[0],h[1]),pitch=Math.atan2(v[2],dot(v,h)),bend=Math.atan2(dot(cross(v,v2),n),dot(v,v2));leg.axis=n;leg.horizontal=h;leg.drives=[transmission(yaw),transmission(pitch),transmission(bend)];s.drives.push(...leg.drives.map((d,i)=>({...d,id:leg.id+'-'+['yaw','hip','knee'][i]})));}
 const p=s.p,deploy=options.mode==='hunt'?smooth((p-.27)/.16)*(1-smooth((p-.53)/.29)):0,step=4+15*deploy,w=Math.sqrt(20**2-step**2)/2;
 s.scissor={deploy,step,w,linkLength:20,stages:4,reach:4*step,lead:2,turns:(Math.sqrt(384)/2-w)/2,grip:options.mode==='hunt'&&p>.45&&p<.85?1:0};
 const angle=options.mode==='call'?Math.PI+TAU*s.p:Math.PI+.32*Math.sin(TAU*s.p),crankY=6-(Math.sqrt(96)-2),pin=[10,crankY+2*Math.cos(angle),2*Math.sin(angle)],sliderY=crankY+2*Math.cos(angle)+Math.sqrt(96-4*Math.sin(angle)**2);
 s.jawDrive=transmission(s.jaw);s.bellows={stroke:sliderY-6,angle,voice:options.mode==='call'?Math.abs(Math.sin(angle))*.8:0,pin,slider:[0,sliderY,0],rodLength:14};
 s.spring={stroke:5.4*s.jump.load,k:.8,energy:.5*.8*(5.4*s.jump.load)**2};
 return s;
}
export function explosion(stage,amount){return clamp((amount-stage*.22)/.34);}
