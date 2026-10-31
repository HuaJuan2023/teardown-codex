import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const out='teardown-out/qa';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:1600,height:900}});
const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
await page.goto(pathToFileURL(process.cwd()+'/teardown-out/dist/strandbeest-live.html').href);
await page.waitForFunction(()=>window.LIVE);await page.waitForTimeout(1500);await page.screenshot({path:out+'/reference-strandbeest.png'});
await page.goto(pathToFileURL(process.cwd()+'/teardown-out/dist/ant-live.html').href);await page.waitForFunction(()=>window.ANT?.ready);
await page.evaluate(()=>ANT.set({tour:false,paused:true,phase:30}));await page.waitForTimeout(250);
const layouts=[];
for(const [width,height] of [[1600,900],[1440,1000],[1100,800]]){
 await page.setViewportSize({width,height});await page.waitForTimeout(250);
 const layout=await page.evaluate(()=>{
  const panels=[...document.querySelectorAll('.left-column .panel,.right-column .panel,.status-strip')];
  const bottom=document.querySelector('.bottom-console').getBoundingClientRect().top;
  return {width:innerWidth,height:innerHeight,ink:getComputedStyle(document.querySelector('#app')).color,panels:panels.map(p=>({name:p.getAttribute('aria-label')??'status',top:p.getBoundingClientRect().top,bottom:p.getBoundingClientRect().bottom,scroll:p.scrollHeight,height:p.clientHeight})),bottom};
 });
 layouts.push(layout);console.log(JSON.stringify(layout));assert.equal(layout.ink,'rgb(49, 61, 55)');
 for(const p of layout.panels){assert(p.bottom<=layout.bottom-3,`${width}: ${p.name} covered by desk ${p.bottom}>${layout.bottom}`);assert(p.scroll<=p.height+2,`${width}: ${p.name} content overflow`);}
 await page.screenshot({path:`${out}/desktop-${width}x${height}.png`});
}
await page.setViewportSize({width:1440,height:1000});
// Every assembly including the two visibility-only groups.
for(const id of ['head','thorax','abdomen','LF','LM','LH','RF','RM','RH']){
 await page.locator(`[data-assembly="${id}"]`).click();await page.waitForTimeout(60);
 assert.deepEqual(await page.evaluate(()=>Object.entries(ANT.ant.groups).filter(([,g])=>g.visible).map(([k])=>k)),[id]);
 await page.locator('[data-assembly="all"]').click();
}
for(const id of ['optics','mandibles']){
 await page.locator(`[data-assembly="${id}"]`).click();await page.waitForTimeout(80);
 assert(await page.evaluate(id=>ANT.ant.groups.head.children.filter(x=>x.userData.component===id).every(x=>!x.visible),id));
 await page.locator(`[data-assembly="${id}"]`).click();
}
await page.locator('#label-toggle').click();await page.waitForTimeout(80);assert.equal(await page.locator('.callout').count(),0);
await page.locator('#label-toggle').click();await page.waitForTimeout(80);assert.equal(await page.locator('.callout').count(),6);
for(const id of ['cutaway','section']){await page.locator('#'+id).click();await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>ANT.state.mode),id==='section'?'section':'cutaway');await page.locator('#'+id).click();}
await page.locator('[data-view="quad"]').click();await page.waitForTimeout(180);assert.equal(await page.evaluate(()=>ANT.stage.orthos.filter(c=>c.isOrthographicCamera).length),4);await page.screenshot({path:out+'/four-view.png'});
await page.locator('[data-view="hero"]').click();
await page.locator('#turntable').click();const before=await page.evaluate(()=>ANT.stage.camera.position.toArray());await page.waitForTimeout(300);assert.notDeepEqual(await page.evaluate(()=>ANT.stage.camera.position.toArray()),before);await page.locator('#turntable').click();
await page.locator('#blur').click();await page.locator('#pause').click();await page.waitForTimeout(180);assert(await page.evaluate(()=>ANT.trails.group.visible));await page.locator('#pause').click();await page.locator('#blur').click();
await page.locator('#step-next').click();const phase1=await page.evaluate(()=>ANT.state.phase);await page.locator('#step-back').click();assert.equal(await page.evaluate(()=>ANT.state.phase),phase1-15);
await page.locator('#amplitude').fill('0.5');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>ANT.current.stride),16);
const jawBefore=await page.evaluate(()=>ANT.current.legs.map(l=>l.angles));await page.locator('#jaw').fill('1');await page.waitForTimeout(100);assert.deepEqual(await page.evaluate(()=>ANT.current.legs.map(l=>l.angles)),jawBefore);
await page.evaluate(()=>ANT.set({phase:30,amplitude:1,jaw:.3,paused:true,exploded:false,mode:'assembled',isolate:'all',view:'hero'}));
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);
assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth));await page.screenshot({path:out+'/mobile-full.png',fullPage:true});
await page.locator('#jaw').scrollIntoViewIfNeeded();await page.locator('#jaw').fill('0.8');await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>ANT.current.gap),14.4);
await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>scrollTo(0,0));
// A complete tour terminates after 25 seconds and restores the assembled hero.
await page.locator('#tour').click();await page.waitForTimeout(25300);assert(await page.evaluate(()=>!ANT.state.tour&&ANT.state.isolate==='all'&&ANT.state.mode==='assembled'&&ANT.state.view==='hero'));
const stats=await page.evaluate(()=>ANT.snapshot().stats);
assert.deepEqual(errors,[]);assert.equal(requests.filter(x=>/^https?:/.test(x)).length,0);
const report={layouts,allAssemblyButtons:true,allDisplayButtons:true,fourOrthographicViews:true,labelsToggle:true,turntable:true,motionTrails:true,stepTransport:true,amplitude:true,jawIndependent:true,mobileControls:true,tourEndsAt25s:true,errors,externalRequests:[],stats};
fs.writeFileSync(out+'/alignment-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
