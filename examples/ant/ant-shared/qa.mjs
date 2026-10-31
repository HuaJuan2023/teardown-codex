import {chromium} from 'playwright';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
fs.mkdirSync('teardown-out/qa',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11','--ignore-gpu-blocklist','--enable-webgl']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];const requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
await page.goto(pathToFileURL(process.cwd()+'/teardown-out/dist/ant-live.html').href);
await page.waitForFunction(()=>window.ANT?.ready,{timeout:30000});
await page.evaluate(()=>ANT.set({phase:30,paused:true,jaw:.3}));await page.waitForTimeout(250);
await page.screenshot({path:'teardown-out/qa/assembled.png'});
await page.locator('#phase').fill('120');await page.waitForTimeout(150);
const moved=await page.evaluate(()=>ANT.current.legs[3].angles);
await page.locator('#jaw').fill('1');await page.waitForTimeout(150);
const jaw=await page.evaluate(()=>({gap:ANT.current.gap,rotation:ANT.ant.groups.head.children.filter(x=>x.userData.component==='mandibles').map(x=>x.rotation.z)}));
await page.locator('#mode').selectOption('section');await page.waitForTimeout(200);await page.screenshot({path:'teardown-out/qa/section.png'});
await page.locator('#mode').selectOption('cutaway');await page.waitForTimeout(200);await page.screenshot({path:'teardown-out/qa/cutaway.png'});
await page.locator('#mode').selectOption('assembled');await page.locator('#explode').click();await page.waitForTimeout(1300);await page.screenshot({path:'teardown-out/qa/exploded.png'});
const exploded=await page.evaluate(()=>({e:ANT.explode,head:ANT.ant.groups.head.position.toArray()}));
for(const id of ['head','thorax','abdomen','LF','LM','LH','RF','RM','RH','all']){await page.locator('#isolate').selectOption(id);await page.waitForTimeout(40);const visible=await page.evaluate(()=>Object.entries(ANT.ant.groups).filter(([k,g])=>g.visible).map(([k])=>k));if(id!=='all'&&(visible.length!==1||visible[0]!==id))throw Error('isolate '+id);}
for(const id of ['hero','top','front','side'])await page.locator(`[data-view=${id}]`).click();
await page.keyboard.press('Space');await page.waitForTimeout(100);const p0=await page.evaluate(()=>ANT.state.phase);await page.waitForTimeout(150);const p1=await page.evaluate(()=>ANT.state.phase);if(p1===p0)throw Error('Play did not advance');await page.keyboard.press('Space');
await page.locator('#tour').click();await page.waitForTimeout(100);const tour=await page.evaluate(()=>ANT.state.tour);await page.locator('#viewport').click({position:{x:200,y:300}});const handoff=await page.evaluate(()=>!ANT.state.tour);
await page.evaluate(()=>ANT.set({exploded:false,mode:'assembled',isolate:'all',paused:true}));await page.locator('[data-view=hero]').click();await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1200);await page.screenshot({path:'teardown-out/qa/mobile.png'});
const gpu=await page.evaluate(()=>{const gl=ANT.stage.renderer.getContext(),ex=gl.getExtension('WEBGL_debug_renderer_info');return ex?gl.getParameter(ex.UNMASKED_RENDERER_WEBGL):'unknown';});
const report={errors,externalRequests:requests.filter(x=>/^https?:/.test(x)),moved,jaw,exploded,tour,handoff,gpu};fs.writeFileSync('teardown-out/qa/browser-report.json',JSON.stringify(report,null,2));console.log(report);await browser.close();if(errors.length||report.externalRequests.length||jaw.gap!==18||!tour||!handoff)process.exitCode=1;

