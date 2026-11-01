import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {playwright,CHROMIUM_ARGS} from '../../../skill/teardown/paths.mjs';
const out='teardown-out/qa-r3';fs.mkdirSync(out,{recursive:true});
const browser=await playwright().chromium.launch({executablePath:process.env.CHROMIUM||undefined,args:CHROMIUM_ARGS});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900}});
 await page.goto(pathToFileURL(path.resolve('teardown-out/dist/mecha-frog-film.html')).href+'?capture');
 await page.waitForFunction(()=>window.SIM?.ready);
 const report=await page.evaluate(()=>{
  const m=MECHA.model;let maxHingeStep=0,maxShoeError=0,maxMembraneError=0;
  for(const t of [3,7,9,12,15,19,22,24,30]){
   SIM.render(t-1e-5);const before=m.detail.lids.map(l=>l.g.rotation.y);
   SIM.render(t+1e-5);m.detail.lids.forEach((l,i)=>maxHingeStep=Math.max(maxHingeStep,Math.abs(l.g.rotation.y-before[i])));
  }
  for(let i=0;i<=100;i++){
   MECHA.set({mode:'call',progress:i/100,layer:'section',open:1,openTopic:'call',context:true,explodeAmount:0});
   for(const shoe of m.detail.pistons)maxShoeError=Math.max(maxShoeError,Math.abs(shoe.position.y-6-MECHA.current.bellows.stroke));
   const membrane=m.detail.membrane;membrane.geometry.computeBoundingBox();
   const plate=m.registry.filter(p=>p.name==='bellows end plate').at(-1);
   maxMembraneError=Math.max(maxMembraneError,Math.abs(membrane.position.y+membrane.geometry.boundingBox.max.y*membrane.scale.y-plate.o.position.y));
  }
  const duct=m.registry.find(p=>p.name==='annular fan duct').o.geometry.attributes.position;
  let minDuctRadius=Infinity;for(let i=0;i<duct.count;i++)minDuctRadius=Math.min(minDuctRadius,Math.hypot(duct.getX(i),duct.getY(i)));
  SIM.render(13.5);
  return {maxHingeStep,maxShoeError,maxMembraneError,minDuctRadius,lensVisible:!document.querySelector('.inspection-lens').hidden,channels:MECHA.state.openChannels};
 });
 assert(report.maxHingeStep<1e-4,'cover discontinuity');
 assert(report.maxShoeError<1e-10&&report.maxMembraneError<1e-10);
 assert(report.minDuctRadius>3.4&&report.lensVisible);
 await page.screenshot({path:out+'/throat-inspection.png'});
 const first=await page.screenshot();await page.evaluate(()=>SIM.render(2));await page.evaluate(()=>SIM.render(13.5));
 assert(first.equals(await page.screenshot()),'inspection inset depends on seek order');
 await page.locator('[data-layer="exterior"]').click();assert.equal(await page.evaluate(()=>MECHA.state.openChannels),null);
 fs.writeFileSync(out+'/mechanisms.json',JSON.stringify({pass:true,...report},null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}

