// Copy a complete working example before replacing its mechanical model.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const args=process.argv.slice(2),opt=k=>args[args.indexOf('--'+k)+1];
const from=args.includes('--from')?opt('from'):null,name=args.includes('--name')?opt('name'):null;
const dir=path.resolve(args.includes('--dir')?opt('dir'):'.');
if(!['v8','cessna','strandbeest'].includes(from)||!name||! /^[a-z][a-z0-9-]*$/.test(name))throw new Error('usage: scaffold.mjs --from v8|cessna|strandbeest --name my-machine [--dir workspace]');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const entries=['shared','live','film'];
for(const suffix of entries)if(!fs.existsSync(path.join(root,'sims',from+'-'+suffix)))throw new Error('This distribution omits upstream templates. Use a complete runtime with '+from+'-{shared,live,film}, or build a custom entry directly.');
for(const suffix of entries)if(fs.existsSync(path.join(dir,name+'-'+suffix)))throw new Error('destination already exists: '+name+'-'+suffix);
for(const suffix of entries){
 const target=path.join(dir,name+'-'+suffix);
 fs.cpSync(path.join(root,'sims',from+'-'+suffix),target,{recursive:true});
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const file of walk(target).filter(p=>/\.(js|json|py)$/.test(p)))fs.writeFileSync(file,fs.readFileSync(file,'utf8').replaceAll('../'+from+'-','../'+name+'-').replaceAll('../kit/','teardown-kit/'));
}
fs.copyFileSync(path.join(root,'LICENSE'),path.join(dir,name+'-LICENSE'));
console.log('Created '+entries.map(s=>path.join(dir,name+'-'+s)).join(', '));
console.log('This is the original example under new entry names. Replace model/reference/labels, then validate; it is not yet a model of the new machine.');
