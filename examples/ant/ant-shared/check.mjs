import assert from 'node:assert/strict';
import {D,LEGS,LIMITS,frame,forward} from './model.js';
let maxError=0,maxSlip=0,minClearance=Infinity,clamped=0;const ranges=LIMITS.map(()=>[Infinity,-Infinity]);
for(let p=0;p<=360;p+=.25){
 const s=frame(p,.5);
 for(const l of s.legs){
  assert(l.points.flat().every(Number.isFinite));
  [9,28,34,12].forEach((len,i)=>assert(Math.abs(Math.hypot(...l.points[i+1].map((v,k)=>v-l.points[i][k]))-len)<1e-9));
  l.angles.forEach((v,i)=>{assert(v>=LIMITS[i][0]&&v<=LIMITS[i][1]);ranges[i][0]=Math.min(ranges[i][0],v);ranges[i][1]=Math.max(ranges[i][1],v)});
  maxError=Math.max(maxError,l.error);clamped+=+l.clamped;
  const next=frame(p+.001).legs.find(a=>a.id===l.id);
  if(l.stance&&next.stance)maxSlip=Math.max(maxSlip,Math.abs(next.points[4][1]+32*(p+.001)/360-l.points[4][1]-s.travel));
  minClearance=Math.min(minClearance,...l.points.map(a=>a[2]));
 }
}
assert(maxError<1e-9);assert(maxSlip<1e-9);assert.equal(clamped,0);assert(minClearance>=-1e-9);
for(const l of LEGS)for(let j=0;j<3;j++)for(const endpoint of LIMITS[j]){const a=[0,0,45];a[j]=endpoint;assert(forward(l,a).flat().every(Number.isFinite));}
const periodic=Math.max(...frame(0).legs.flatMap((l,i)=>l.points.flatMap((p,j)=>p.map((v,k)=>Math.abs(v-frame(360).legs[i].points[j][k])))));
assert(periodic<1e-10);assert.equal(frame(0,0).gap,0);assert.equal(frame(0,1).gap,18);
// Dense non-adjacent leg centerline clearance (sample each physical link).
for(let p=0;p<360;p+=2){const ls=frame(p).legs;for(let a=0;a<6;a++)for(let b=a+1;b<6;b++)for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let u=0;u<=1;u+=.25)for(let v=0;v<=1;v+=.25){const pa=ls[a].points[i].map((x,k)=>x+(ls[a].points[i+1][k]-x)*u),pb=ls[b].points[j].map((x,k)=>x+(ls[b].points[j+1][k]-x)*v);assert(Math.hypot(...pa.map((x,k)=>x-pb[k]))>5,'leg collision');}}
console.log(JSON.stringify({samples:1441,maxError_mm:maxError,maxStanceSlip_mm:maxSlip,minGroundClearance_mm:minClearance,clamped,ranges_deg:ranges,periodicError_mm:periodic,endpointChecks:36,linkLengths_mm:[9,28,34,12],jawGap_mm:[0,18],collisionCheck:'180 phases, sampled leg centerlines >5 mm'},null,2));
