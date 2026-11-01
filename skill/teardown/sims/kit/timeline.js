// Explicit timestamps only. Parameters such as rpm, angle and dimensions are data.
export function validateTimeline(tl) {
  if(!tl||!Number.isFinite(tl.duration)||tl.duration<=0)throw new Error('timeline.duration must be positive seconds');
  if(tl.fps!==undefined&&(!Number.isFinite(tl.fps)||tl.fps<=0))throw new Error('timeline.fps must be positive');
  let events;
  if(Array.isArray(tl.events))events=tl.events;
  else if(Array.isArray(tl.beats))events=tl.beats.map((at,i)=>({id:`beat-${i}`,at}));
  else if(Object.keys(tl).every(k=>['duration','fps'].includes(k)))events=[];
  else throw new Error('Use events:[{id,at,...data}] or the legacy beats:[seconds] array; arbitrary numbers are not timestamps');
  const ids=new Set();let previous=-Infinity;
  for(const e of events){
    if(!e||!Number.isFinite(e.at)||e.at<0||e.at>=tl.duration)throw new Error('event.at must satisfy 0 <= at < duration');
    if(e.at<previous)throw new Error('timeline events must be ordered');previous=e.at;
    if(e.id!==undefined){if(typeof e.id!=='string'||!e.id||ids.has(e.id))throw new Error('event ids must be unique strings');ids.add(e.id);}
  }
  return events;
}
export const eventTimes=tl=>validateTimeline(tl).map(e=>e.at);
export function eventAt(tl,t){const events=validateTimeline(tl);return events.filter(e=>e.at<=t).at(-1)??events[0];}
export function reviewTimes(tl,offset=.3){
  const eps=1/(tl.fps||60);
  return [...new Set([0,...eventTimes(tl).map(t=>Math.max(0,Math.min(t+offset,tl.duration-eps)))])].sort((a,b)=>a-b);
}
