import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {CHROMIUM,DEPS,FFMPEG,FFPROBE,PYTHON,playwright} from '../paths.mjs';
const args=process.argv.slice(2),index=args.indexOf('--mode'),mode=index<0?'page':args[index+1];
if(!['page','film','sound'].includes(mode))throw new Error('mode must be page, film or sound');
const checks=[];
function probe(name,exe,argv=['--version']){const r=spawnSync(exe,argv,{encoding:'utf8',timeout:15000,windowsHide:true});const detail=r.error?(r.error.code==='EACCES'||r.error.code==='EPERM'?'permission-denied':r.error.code==='ENOENT'?'not-found':r.error.message):(r.stdout||r.stderr).trim().split('\n')[0];checks.push({name,executable:exe,pass:!r.error&&r.status===0,detail});}
checks.push({name:'node>=20',pass:Number(process.versions.node.split('.')[0])>=20,detail:process.version});
checks.push({name:'npm dependencies',pass:['three','esbuild','playwright'].every(n=>fs.existsSync(`${DEPS}/${n}/package.json`)),detail:DEPS});
let chromium=CHROMIUM;
if(!chromium){try{chromium=playwright().chromium.executablePath();}catch{}}
if(!chromium||!fs.existsSync(chromium))chromium=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/usr/bin/chromium'].find(p=>fs.existsSync(p));
checks.push({name:'browser binary',pass:!!chromium&&fs.existsSync(chromium),detail:chromium||'Set CHROMIUM or install Playwright Chromium'});
if(['film','sound'].includes(mode)){probe('ffmpeg',FFMPEG,['-version']);probe('ffprobe',FFPROBE,['-version']);}
if(mode==='sound')probe('python',PYTHON,['--version']);
const report={mode,pass:checks.every(c=>c.pass),checks,overrides:{CHROMIUM:chromium},notVerified:['browser launch/WebGL','live iGPU/mobile performance',...(mode==='sound'?['sound synthesis and final loudness']:[])]};
console.log(JSON.stringify(report,null,2));if(!report.pass)process.exitCode=1;
