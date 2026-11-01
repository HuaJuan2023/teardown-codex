import {clamp} from './model.js';
import timeline from '../mecha-frog-film/timeline.json';
export const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const mix=(a,b,t)=>a+(b-a)*t;
export function directedState(t){
 t=clamp(t,0,timeline.duration);const event=timeline.events.filter(e=>e.at<=t).at(-1),u=clamp((t-event.at)/(event.until-event.at)),v=ease(u),cam=event.camera;
 const open=mix(event.open?.[0]||0,event.open?.[1]||0,ease(Math.min(1,u*2.5)));
 // Per-subsystem channels retain the outgoing cover pose, then close it smoothly.
 const topics=['hunt','jump','body','call'];
 const values=(e,value)=>Object.fromEntries(topics.map(topic=>[topic,e&&(e.openTopic==='all'||e.openTopic===topic||(e.openTopic==='call'&&topic==='body'))?value:0]));
 const current=values(event,open),index=timeline.events.indexOf(event),previous=timeline.events[index-1],prior=values(previous,previous?.open?.[1]||0),handover=ease((t-event.at)/.85);
 const openChannels=Object.fromEntries(topics.map(topic=>[topic,prior[topic]*(1-handover)+current[topic]*handover]));
 return {openChannels,event,u,settleWalk:event.mode==='walk',mode:event.mode,progress:mix(event.from,event.to,u),motionTime:t,rootOffset:event.rootOffset||[0,0,0],layer:event.layer,isolate:event.isolate||'all',context:true,open,openTopic:event.openTopic||'all',explodeAmount:mix(event.explosion?.[0]||0,event.explosion?.[1]||0,ease(Math.min(1,u*1.45))),camera:{azimuth:mix(cam.azimuth[0],cam.azimuth[1],v),elevation:mix(cam.elevation[0],cam.elevation[1],v),half:mix(cam.half[0],cam.half[1],v),target:cam.target[0].map((x,i)=>mix(x,cam.target[1][i],v))},label:event.label};
}
