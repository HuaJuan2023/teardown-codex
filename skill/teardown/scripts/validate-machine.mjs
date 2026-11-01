import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
export function validateMachine(m){
  const errors=[],ids=new Set(),drives=new Set((m.actuators||[]).map(x=>x.id));
  if(!['mm','m'].includes(m.units))errors.push('units must be mm or m');
  const actuatorIds=new Set();
  for(const a of m.actuators||[]){
    if(!a.id||!a.input)errors.push('each actuator needs id and input');
    if(actuatorIds.has(a.id))errors.push('duplicate actuator: '+a.id);
    actuatorIds.add(a.id);
    if(a.travel_deg!==undefined&&(!Number.isFinite(a.travel_deg)||a.travel_deg<=0))errors.push(a.id+': invalid travel');
  }
  const joints=m.joints||[];
  for(const j of joints){
    if(!j.id||ids.has(j.id))errors.push(`duplicate/missing joint id: ${j.id}`);ids.add(j.id);
    if(!Array.isArray(j.axis)||j.axis.length!==3||j.axis.some(x=>!Number.isFinite(x))||Math.abs(Math.hypot(...j.axis)-1)>1e-6)errors.push(`${j.id}: axis must be unit length`);
    if(!j.parent||!j.child)errors.push(`${j.id}: missing parent/child`);
    if(!j.drive)errors.push(`${j.id}: moving joint has no drive`);
    else if(j.drive.type==='actuator'&&!drives.has(j.drive.id))errors.push(`${j.id}: missing actuator ${j.drive.id}`);
    else if(j.drive.type==='coupling'&&!j.drive.equation)errors.push(`${j.id}: coupling needs equation`);
    else if(!['actuator','coupling','fixed'].includes(j.drive.type))errors.push(`${j.id}: unsupported drive`);
  }
  for(const r of m.readouts||[]){
    if(!['derived','command','estimate','measured'].includes(r.source)||!r.unit)errors.push(`${r.id}: readout needs source category and unit`);
    if(r.source==='measured'&&!r.sensor&&!r.dataSource)errors.push(r.id+': measured readout needs sensor or dataSource');
    if(r.source==='estimate'&&(!r.equation||!r.assumptions))errors.push(r.id+': estimate needs equation and assumptions');
  }
  if(!m.reference||!m.assumptions?.length)errors.push('reference and design assumptions are required');
  return {pass:errors.length===0,joints:joints.length,actuators:drives.size,errors};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const file=process.argv[2];if(!file)throw new Error('usage: node scripts/validate-machine.mjs machine.json');
  const report=validateMachine(JSON.parse(fs.readFileSync(file,'utf8')));console.log(JSON.stringify(report,null,2));if(!report.pass)process.exitCode=1;
}
