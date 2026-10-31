import {chromium} from 'playwright';import fs from 'node:fs';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const round=process.argv[2]||'1',out=`teardown-out/qa/three-knife-round-${round}`;fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=d3d11','--ignore-gpu-blocklist']});
try{const page=await browser.newPage({viewport:{width:1600,height:900}});const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url())});
await page.goto(pathToFileURL(process.cwd()+'/teardown-out/dist/strandbeest-live.html').href);await page.waitForFunction(()=>window.LIVE);await page.waitForTimeout(500);await page.screenshot({path:out+'/strandbeest.png'});
await page.goto(pathToFileURL(process.cwd()+'/teardown-out/dist/ant-live.html').href+'?capture');await page.waitForFunction(()=>window.ANT?.ready);await page.evaluate(()=>ANT.set({paused:true,phase:90,jaw:7.5/18,labels:false,view:'hero'}));await page.waitForTimeout(400);
let layouts=[];
for(const [w,h] of [[1600,900],[1440,1000]]){await page.setViewportSize({width:w,height:h});await page.waitForTimeout(250);layouts.push(await page.evaluate(()=>({width:innerWidth,height:innerHeight,bottom:document.querySelector('.bottom-console').getBoundingClientRect().top,panels:[...document.querySelectorAll('.left-column .panel,.right-column .panel,.status-strip')].map(p=>({name:p.getAttribute('aria-label'),bottom:p.getBoundingClientRect().bottom,scroll:p.scrollHeight,height:p.clientHeight}))})));await page.screenshot({path:`${out}/paper-${w}x${h}.png`});}
await page.setViewportSize({width:1600,height:900});
for(const mode of ['assembled','cutaway','exploded']){await page.evaluate(mode=>ANT.set({view:'hero',mode:mode==='cutaway'?'cutaway':'assembled',exploded:mode==='exploded'}),mode);await page.waitForTimeout(1400);await page.screenshot({path:out+'/'+mode+'.png'});fs.copyFileSync(out+'/'+mode+'.png','teardown-out/qa/'+mode+'.png');}
await page.evaluate(()=>ANT.set({exploded:false,mode:'assembled'}));await page.waitForTimeout(1200);
for(const view of ['hero','top','front','side','quad']){await page.locator(`[data-view=${view}]`).click();await page.waitForTimeout(200);await page.locator('#viewport').screenshot({path:out+'/ref-'+view+'.png'});}
const state=await page.evaluate(()=>({gap:ANT.current.gap,contacts:ANT.current.legs.map(l=>({id:l.id,stance:l.stance,angles:l.angles})),body:ANT.ant.root.children.map(g=>({id:g.name,position:g.position.toArray()}))}));
assert.deepEqual(errors,[]);assert.deepEqual(external,[]);for(const l of layouts)for(const p of l.panels){assert(p.bottom<l.bottom-3,`${l.width} ${p.name} overlaps ${p.bottom} / ${l.bottom}`);assert(p.scroll<=p.height+2,`${p.name} overflow`)}
fs.writeFileSync(out+'/report.json',JSON.stringify({layouts,errors,external,state},null,2));console.log('Round '+round+' captures and rail checks passed');
}finally{await browser.close()}
