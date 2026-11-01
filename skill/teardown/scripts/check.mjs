// Dependency-free packaging and numeric checks; does not prove visual correctness.
import assert from 'node:assert/strict';
import {validateTimeline} from '../sims/kit/timeline.js';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const walk = dir => fs.readdirSync(dir, {withFileTypes: true}).flatMap(e =>
  e.name === 'node_modules' || e.name === '__pycache__' ? [] : e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const files = walk(root);
const md = read('SKILL.md');
assert(md.startsWith('---\n'), 'SKILL.md must use UTF-8 without BOM and YAML frontmatter');
const front = md.split('---')[1];
assert.match(front, /\nname: teardown\n/);
const desc = front.match(/\ndescription: ([^\n]+)/)?.[1];
assert(desc && desc.length <= 1024 && !/[<>]/.test(desc));
assert.deepEqual(front.trim().split('\n').map(l => l.split(':')[0]).sort(), ['description', 'name']);
for (const f of files.filter(f => f.endsWith('.md'))) {
  const content = fs.readFileSync(f, 'utf8');
  for (const m of content.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^[a-z]+:/i.test(m[1]) || m[1].startsWith('#')) continue;
    assert(fs.existsSync(path.resolve(path.dirname(f), m[1].split('#')[0])), `broken reference ${f}: ${m[1]}`);
  }
}
let imports = 0, syntax = 0;
for (const f of files.filter(f => /\.(m?js)$/.test(f))) {
  execFileSync(process.execPath, ['--check', f], {stdio: 'pipe'});
  syntax++;
  const source = fs.readFileSync(f, 'utf8');
  for (const m of source.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) {
    assert(fs.existsSync(path.resolve(path.dirname(f), m[1])), `missing import ${f}: ${m[1]}`);
    imports++;
  }
  assert(!source.includes('.' + 'claude'), `Claude path in ${f}`);
}
for (const f of files.filter(f => f.endsWith('.py'))) {
  const source = fs.readFileSync(f, 'utf8');
  assert(!source.includes('.' + 'claude'), `Claude path in ${f}`);
  const timeline = source.match(/^TIMELINE = "([^"]+)"/m)?.[1];
  if (timeline) assert(fs.existsSync(path.resolve(path.dirname(f), timeline)));
}
const examples=['v8','cessna','strandbeest'];
const present=examples.filter(n=>fs.existsSync(path.join(root,'sims',n+'-shared')));
console.log(`PASS: frontmatter/references, ${syntax} JS syntax checks, ${imports} relative imports.`);
if(present.length===0){
 console.log('SKIP: upstream example timelines and numerical machine tests; this distribution intentionally omits all three upstream examples.');
}else{
 assert.equal(present.length,examples.length,'Incomplete upstream example set');
for (const name of ['v8', 'cessna', 'strandbeest']) {
  const film = read(`sims/${name}-shared/film.js`);
  const tl=JSON.parse(read(`sims/${name}-film/timeline.json`));
  const events=validateTimeline(tl);
  assert(events.length>0);
  assert(film.includes(`../${name}-film/timeline.json`), 'film must import shared timeline');
  assert(film.includes('timeline.duration'));
}
// Pure model modules have no imports: loading a data URL avoids requiring npm.
const model = async p => import('data:text/javascript;base64,' + Buffer.from(read(p)).toString('base64'));
const v8 = await model('sims/v8-shared/kin.js');
const j = await model('sims/strandbeest-shared/jansen.js');
const flight = await model('sims/cessna-shared/flight.js');
let maxRod = 0, maxLink = 0;
for (let degree = 0; degree <= 720; degree++) {
  for (let c = 0; c < 8; c++) {
    const p = v8.piston(c, degree);
    const rodError = Math.abs(Math.hypot(p.pin[0] - p.P[0], p.pin[1] - p.P[1]) - v8.E.rod);
    maxRod = Math.max(maxRod, rodError);
    assert(rodError < 1e-9);
    assert(Math.abs(p.s - v8.piston(c, degree + 360).s) < 1e-9);
    assert(p.s >= v8.S_BDC - 1e-9 && p.s <= v8.S_TDC + 1e-9);
  }
  for (const lift of [v8.liftIn(degree), v8.liftEx(degree)]) assert(lift >= 0 && lift <= 1);
  for (const solve of [j.solveLeg, j.solveMirror]) {
    const p = solve(degree * Math.PI / 180);
    for (const q of Object.values(p)) assert(q.every(Number.isFinite));
    for (const [a, b, length] of j.LINKS) {
      const err = Math.abs(Math.hypot(p[a][0] - p[b][0], p[a][1] - p[b][1]) - j.HOLY[length]);
      maxLink = Math.max(maxLink, err);
      assert(err < 1e-9);
    }
  }
}
assert.equal(v8.STROKE, 89);
assert.deepEqual(Object.values(v8.FIRE).sort((a,b)=>a-b), [0,90,180,270,360,450,540,630]);
for (const seq of Object.values(flight.SEQ)) {
  for (let i = 0; i <= 1000; i++) {
    const t = seq.dur * i / 1000;
    const stroke = seq.stroke(t);
    assert(Number.isFinite(stroke) && stroke >= 0 && stroke <= 1);
    assert(Number.isFinite(seq.height(t)) && seq.height(t) >= 0);
  }
}
assert.equal(flight.SEQ.takeoff.stroke(0), 0);
assert.equal(flight.SEQ.takeoff.stroke(5), 1);
assert.equal(flight.SEQ.landing.stroke(0), 1);
assert.equal(flight.SEQ.landing.stroke(7), 0);
const roundedRackError = Math.abs(Math.PI * 64 - 201);
assert(roundedRackError < 0.062);
console.log(`PASS: frontmatter/references, ${syntax} JS syntax checks, ${imports} relative imports, 3 review timelines.`);
console.log(`PASS: 721 angles x 8 pistons and 2 leg solvers; max rod error ${maxRod} mm, max link error ${maxLink} units.`);
console.log(`PASS: flight endpoints and 2002 stroke samples; rack rounding discrepancy ${roundedRackError.toFixed(6)} mm.`);
}
console.log('NOT CHECKED: Python execution, npm build, WebGL images, input behavior, GPU performance or audio/video rendering.');
