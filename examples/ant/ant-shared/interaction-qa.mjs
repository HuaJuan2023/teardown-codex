import {chromium} from 'playwright';import fs from 'node:fs';import {pathToFileURL} from 'node:url';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto(pathToFileURL(process.cwd()+'/teardown-out/dist/ant-live.html').href);await page.waitForFunction(()=>window.ANT?.ready);
await page.evaluate(()=>ANT.set({paused:true,phase:0,jaw:0}));await page.waitForTimeout(150);
const start=await page.evaluate(()=>({p:ANT.stage.camera.position.toArray(),d:ANT.stage.camera.position.distanceTo(ANT.stage.orbit.target)}));
await page.mouse.move(500,400);await page.mouse.down();await page.mouse.move(620,460,{steps:10});await page.mouse.up();await page.waitForTimeout(500);
const orbit=await page.evaluate(()=>ANT.stage.camera.position.toArray());await page.mouse.wheel(0,-300);await page.waitForTimeout(500);const zoom=await page.evaluate(()=>ANT.stage.camera.position.distanceTo(ANT.stage.orbit.target));
if(JSON.stringify(start.p)===JSON.stringify(orbit)||Math.abs(start.d-zoom)<1)throw Error('Orbit/zoom failed');
await page.locator('#speed').fill('0');await page.locator('#pause').click();await page.waitForTimeout(100);const p0=await page.evaluate(()=>ANT.state.phase);await page.waitForTimeout(150);const p1=await page.evaluate(()=>ANT.state.phase);if(p0!==p1)throw Error('Zero speed');
await page.locator('#pause').click();const jaw=[];for(const v of ['0','1']){await page.locator('#jaw').fill(v);await page.waitForTimeout(100);jaw.push(await page.evaluate(()=>{const gs=ANT.ant.groups.head.children.filter(x=>x.userData.component==='mandibles');const tips=gs.map(g=>g.children.find(x=>x.geometry?.type==='BoxGeometry'&&x.geometry.parameters.width===2.5).getWorldPosition(g.position.clone()));return Math.abs(tips[1].x-tips[0].x)-2.5;}));}
if(Math.abs(jaw[0])>1e-8||Math.abs(jaw[1]-18)>1e-8)throw Error('Geometric jaw aperture');
await page.locator('#viewport').click({position:{x:400,y:300}});await page.waitForTimeout(25300);const idle=await page.evaluate(()=>ANT.state.tour);if(!idle)throw Error('Idle tour did not return');
const report={orbitDrag:true,wheelZoom:true,zeroSpeed:true,geometricJawAperture_mm:jaw,idleTourReturn_25s:idle};fs.writeFileSync('teardown-out/qa/interaction-report.json',JSON.stringify(report,null,2));console.log(report);await browser.close();
