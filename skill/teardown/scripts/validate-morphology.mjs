import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
export function validateMorphology(m){
 const errors=[],ratios=[];
 if(!m||typeof m!=='object')return {pass:false,errors:['morphology must be an object'],ratios};
 if(!['mm','m','normalized'].includes(m.units))errors.push('units must be mm, m or normalized');
 if(!m?.taxon||!m?.stage||!m?.designScope)errors.push('taxon, stage and designScope required');
 const refs=new Set((m.references||[]).map(r=>r.id));
 if(refs.size!==(m.references||[]).length)errors.push('reference ids must be unique');
 if(!refs.size)errors.push('at least one reference required');
 for(const r of m.references||[])if(!r.id||(!r.url&&!r.path)||!r.supports)errors.push('reference needs id/url/supports');
 const points=m.landmarks||{};
 if(Object.keys(points).length<2)errors.push('at least two landmarks required');
 for(const [name,p] of Object.entries(points))if(!Array.isArray(p)||p.length!==3||p.some(v=>!Number.isFinite(v)))errors.push('invalid landmark: '+name);
 const distance=pair=>Array.isArray(pair)&&pair.length===2&&pair.every(k=>points[k]?.length===3)?Math.hypot(...points[pair[0]].map((v,i)=>v-points[pair[1]][i])):NaN;
 for(const r of m.ratios||[]){const a=distance(r.numerator),b=distance(r.denominator),v=a/b;
  if(!r.basis||!refs.has(r.referenceId))errors.push(r.id+': missing basis/reference');
  if(!Array.isArray(r.range)||r.range.length!==2||r.range.some(v=>!Number.isFinite(v))||r.range[0]>r.range[1]||!Number.isFinite(v)||v<r.range[0]||v>r.range[1])errors.push(r.id+': ratio outside declared design range');
  ratios.push({id:r.id,value:v,range:r.range,basis:r.basis});
 }
 if(!(m.features?.length>0))errors.push('recognition features required');
 for(const f of m.features||[])if(!f.id||!Array.isArray(f.views)||!f.views.length||!refs.has(f.referenceId))errors.push('feature requires id/views/referenceId');
 return {pass:errors.length===0,scope:'Declared design consistency only; biological resemblance requires reference and image review',ratios,errors};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const f=process.argv[2];if(!f)throw Error('usage: validate-morphology.mjs morphology.json');const r=validateMorphology(JSON.parse(fs.readFileSync(f,'utf8').replace(/^\uFEFF/,'')));console.log(JSON.stringify(r,null,2));if(!r.pass)process.exitCode=1;}
