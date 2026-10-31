// All model lengths in mm; public angles in degrees. z-up, +y forward, +x right.
export const D={coxa:9,femur:28,tibia:34,tarsus:12,span:140,length:135,height:58,servo:[22.8,12.2,28.5],pin:2,screw:[2,6],shell:0.8};
export const LIMITS=[[-35,35],[-20,65],[-10,90]];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// Angled 12 mm toe, matching the drawings; length remains exact.
const TOE_OUT=6,TOE_DOWN=Math.sqrt(D.tarsus**2-TOE_OUT**2);
const R=Math.PI/180, deg=v=>v/R;
export const LEGS=['LF','LM','LH','RF','RM','RH'].map((id,i)=>({id,side:i<3?-1:1,row:i%3,hip:[i<3?-15:15,27-(i%3)*27,38],offset:[0,180,0,180,0,180][i]}));
export function forward(leg,angles){
 const [yaw,a,b]=angles.map(v=>v*R),[x,y,z]=leg.hip;
 const point=(rad,down)=>[x+leg.side*rad*Math.cos(yaw),y+rad*Math.sin(yaw),z-down];
 const p1=point(D.coxa,0), p2=point(D.coxa+D.femur*Math.cos(a),D.femur*Math.sin(a));
 const p3=point(D.coxa+D.femur*Math.cos(a)+D.tibia*Math.cos(a+b),D.femur*Math.sin(a)+D.tibia*Math.sin(a+b));
 return [[x,y,z],p1,p2,p3,[p3[0]+leg.side*TOE_OUT*Math.cos(yaw),p3[1]+TOE_OUT*Math.sin(yaw),p3[2]-TOE_DOWN]];
}
export function solve(leg,target){
 const dx=(target[0]-leg.hip[0])*leg.side,dy=target[1]-leg.hip[1];
 const r=Math.hypot(dx,dy)-D.coxa-TOE_OUT,down=leg.hip[2]-target[2]-TOE_DOWN;
 const cos=(r*r+down*down-D.femur**2-D.tibia**2)/(2*D.femur*D.tibia);
 const b=Math.acos(clamp(cos,-1,1));
 const raw=[deg(Math.atan2(dy,dx)),deg(Math.atan2(down,r)-Math.atan2(D.tibia*Math.sin(b),D.femur+D.tibia*Math.cos(b))),deg(b)];
 const angles=raw.map((v,i)=>clamp(v,...LIMITS[i]));
 const points=forward(leg,angles);
 return {angles,raw,points,clamped:angles.some((v,i)=>Math.abs(v-raw[i])>1e-8),error:Math.hypot(...points[4].map((v,i)=>v-target[i]))};
}
export function frame(phase=0,jaw=0,options={}){
 const amplitude=clamp(options.amplitude??1,0,1),hz=options.paused?0:(options.speed??.35),runtime=options.runtime??0;
 const legs=LEGS.map(leg=>{
  const u=((phase+leg.offset)%360+360)%360/360,stance=u<.5;
  const t=stance?u*2:(u-.5)*2;
  const fore=amplitude*(stance?8-16*t:-8+16*(-t+6*t*t-4*t*t*t));
  const lift=stance?0:5*amplitude*Math.sin(Math.PI*t)**2;
  const target=[leg.side*69,leg.hip[1]+(1-leg.row)*20+fore,lift];
  const solved=solve(leg,target),load=stance?(.32*9.81/3)*(1+.12*Math.cos(u*2*Math.PI)):0;
  const kneeTorque=load*Math.abs(solved.points[4][0]-solved.points[2][0])*.001;
  const effort=clamp(kneeTorque/.18+.08+hz*.09*Math.abs(Math.cos(u*2*Math.PI)),0,1);
  return {...leg,...solved,target,stance,u,load,kneeTorque,effort,current:.045+effort*.32+(!stance?hz*.06:0),lift};
 });
 const gap=18*clamp(jaw,0,1),jawAngle=deg(Math.asin((gap/2+1.25-5)/14));
 const current=legs.reduce((a,l)=>a+l.current,0)+.085+.08*jaw;
 const energy=options.energy??runtime*current*5/3600;
 const battery=clamp(100*(1-energy/3.7),0,100),cellV=3.4+.8*battery/100-current*.035;
 const power=current*5,temperature=24+power*3.6*(1-Math.exp(-runtime/80));
 const phaseDeg=((phase%360)+360)%360,support=legs.filter(l=>l.stance).map(l=>l.points[4]);
 const com=[0,0,42],body={pitch:0,roll:0,yaw:0,height:42};
 const subsystems={optic:jaw>.8?'TRACKING':'LOCKED',neck:'LOCKED',drive:hz>0?'WALKING':'HOLDING',left:legs.slice(0,3).some(l=>l.clamped)?'LIMIT':'OPERATIONAL',right:legs.slice(3).some(l=>l.clamped)?'LIMIT':'OPERATIONAL',bay:battery<20?'LOW CELL':'ONLINE'};
 return {phase,phaseDeg,jaw,gap,jawAngle,legs,travel:32*amplitude*phase/360,amplitude,hz,runtime,energy,battery,cellV,current,power,temperature,body,com,support,subsystems,speed:32*amplitude*hz,contacts:support.length,tripod:legs[0].stance?'A':'B',maxError:Math.max(...legs.map(l=>l.error)),maxTorque:Math.max(...legs.map(l=>l.kneeTorque)),stride:32*amplitude,lift:5*amplitude,cycles:phase/360,servoCount:6,mass:.32};
}

