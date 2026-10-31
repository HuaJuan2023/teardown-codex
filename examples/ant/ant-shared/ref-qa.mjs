// Reference-review stills at a fixed solved pose, without callouts covering the silhouette.
import {chromium} from 'playwright';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const out='teardown-out/qa';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:1600,height:1000}});
 await page.goto(pathToFileURL(process.cwd()+'/teardown-out/dist/ant-live.html').href);
 await page.waitForFunction(()=>window.ANT?.ready);
 await page.evaluate(()=>ANT.set({phase:90,paused:true,jaw:7.5/18,exploded:false,mode:'assembled',isolate:'all'}));
 await page.waitForFunction(()=>ANT.current.phase===90);
 await page.locator('#label-toggle').click();
 for(const view of ['hero','top','front','side','quad']){
  await page.locator(`[data-view="${view}"]`).click();await page.waitForTimeout(300);
  if(view==='top'){await page.evaluate(()=>{const {camera,orbit}=ANT.stage;camera.position.sub(orbit.target).multiplyScalar(1.3).add(orbit.target);orbit.update();});await page.waitForTimeout(150);}
  await page.locator('#viewport').screenshot({path:`${out}/ref-${view}.png`});
 }
 await page.locator('[data-view="hero"]').click();
 const report=await page.evaluate(()=>({phase:ANT.current.phase,links:ANT.current.legs.map(l=>({id:l.id,angles:l.angles,points:l.points})),servoTrays:ANT.ant.legs.map(l=>({id:l.id,casePosition:l.drive.userData.caseGroup.position.toArray(),caseRotation:l.drive.userData.caseGroup.rotation.toArray()}))}));
 fs.writeFileSync(`${out}/ref-geometry-report.json`,JSON.stringify(report,null,2));
 console.log('Reference hero/top/front/side/quad stills captured at phase 90, jaw 7.5 mm.');
}finally{await browser.close();}
