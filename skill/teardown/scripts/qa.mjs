import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {CHROMIUM,CHROMIUM_ARGS,playwright} from '../paths.mjs';
import {reviewTimes} from '../sims/kit/timeline.js';
const argv=process.argv.slice(2),opt=(k,d)=>{const i=argv.indexOf('--'+k);return i<0?d:argv[i+1]};
const live=opt('live'),film=opt('film'),tlFile=opt('timeline'),adapterFile=opt('adapter'),out=path.resolve(opt('out','teardown-out/qa'));
if(!live||!film||!tlFile)throw new Error('usage: qa.mjs --live file.html --film file.html --timeline file.json [--adapter qa-adapter.mjs] [--out dir]');
fs.mkdirSync(out,{recursive:true});const tl=JSON.parse(fs.readFileSync(tlFile,'utf8')),adapter=adapterFile?await import(pathToFileURL(path.resolve(adapterFile))):{};
const report={createdAt:new Date().toISOString(),pass:false,checks:{},errors:[],artifacts:[],notVerified:['physical iGPU/mobile hardware','complete solid collision','load/thermal/flight dynamics']};
const executablePath=CHROMIUM||['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p=>fs.existsSync(p));
const browser=await playwright().chromium.launch({executablePath,args:CHROMIUM_ARGS});
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});page.on('pageerror',e=>report.errors.push(e.message));
 const screenshot=async(name,fullPage=false)=>{const file=path.join(out,name+'.png');await page.screenshot({path:file,fullPage});report.artifacts.push(file);};
 await page.goto(pathToFileURL(path.resolve(live)).href);await page.waitForFunction(()=>window.TEARDOWN?.ready||window.SIM_SHOWN,null,{timeout:60000});
 if(adapter.modelCheck)report.checks.model=await adapter.modelCheck();if(adapter.liveCheck)report.checks.controls=await adapter.liveCheck(page,{screenshot});await screenshot('desktop');
 report.gpu=await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown';});
 report.frameTimes=await page.evaluate(()=>new Promise(resolve=>{let last=performance.now();const a=[];const tick=t=>{a.push(t-last);last=t;if(a.length<120)requestAnimationFrame(tick);else{a.shift();a.sort((x,y)=>x-y);resolve({samples:a.length,p50_ms:a[Math.floor(a.length*.5)],p95_ms:a[Math.floor(a.length*.95)]});}};requestAnimationFrame(tick);}));
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);await screenshot('mobile',true);report.checks.mobileNoOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);assert(report.checks.mobileNoOverflow,'mobile horizontal overflow');
 await page.setViewportSize({width:1600,height:900});await page.goto(pathToFileURL(path.resolve(film)).href+'?capture');await page.waitForFunction(()=>window.SIM?.ready,null,{timeout:60000});await page.evaluate(()=>document.fonts.ready);
 for(const t of reviewTimes(tl)){await page.evaluate(t=>window.SIM.render(t),t);await screenshot('beat-'+t.toFixed(2));}
 const seek=Math.min(8,tl.duration*.6);await page.evaluate(t=>window.SIM.render(t),seek);const stateA=await page.evaluate(()=>window.TEARDOWN?.snapshot?.()||null),imageA=await page.screenshot();await page.evaluate(t=>window.SIM.render(t),Math.min(2,tl.duration*.2));await page.evaluate(t=>window.SIM.render(t),seek);
 if(stateA!==null){assert.deepEqual(await page.evaluate(()=>window.TEARDOWN?.snapshot?.()||null),stateA,'mechanical state depends on seek order');report.checks.seekState=true;}else{report.checks.seekState=null;report.notVerified.push('semantic seek state: TEARDOWN.snapshot absent');}const imageB=await page.screenshot();report.checks.pixelExact=imageA.equals(imageB);
 report.checks.pixelDiff=await page.evaluate(async ([a,b])=>{const read=async b64=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return ctx.getImageData(0,0,c.width,c.height).data;};const A=await read(a),B=await read(b);let changed=0,significant=0,max=0;for(let i=0;i<A.length;i+=4){let d=0;for(let k=0;k<3;k++)d=Math.max(d,Math.abs(A[i+k]-B[i+k]));if(d)changed++;if(d>8)significant++;max=Math.max(max,d);}return {pixels:A.length/4,changed,significant,maxChannelDelta:max};},[imageA.toString('base64'),imageB.toString('base64')]);
 assert(report.checks.pixelDiff.significant<=report.checks.pixelDiff.pixels*.0001,'seek causes visible frame drift');assert.equal(report.errors.length,0,'page exceptions');report.pass=true;
}catch(e){report.failure=e.stack;process.exitCode=1;}finally{await browser.close();fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
