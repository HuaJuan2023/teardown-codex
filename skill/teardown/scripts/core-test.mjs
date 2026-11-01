import assert from 'node:assert/strict';
import {reviewTimes,validateTimeline} from '../sims/kit/timeline.js';
import {createOperator} from '../sims/kit/operator.js';
import {validateMorphology} from './validate-morphology.mjs';
import {validateMachine} from './validate-machine.mjs';
const tl={duration:10,fps:30,events:[{id:'start',at:0,rpm:7200,angle:90},{id:'open',at:3,duration:2,length:21}]};
assert.deepEqual(reviewTimes(tl),[0,.3,3.3]);assert.throws(()=>validateTimeline({...tl,events:[{at:-1}]}));assert.throws(()=>validateTimeline({...tl,events:[{id:'a',at:0},{id:'a',at:1}]}));
assert.deepEqual(reviewTimes({duration:10,beats:[0,3]}),[0,.3,3.3]);
let now=0,resumes=0;const op=createOperator({now:()=>now,speed:.5,onResume:()=>resumes++});now=100;op.tick();assert.equal(op.phase,18);op.handoff();const p=op.phase;assert.equal(op.phase,p);op.paused=true;now=200;op.tick();assert.equal(op.phase,p);now=25300;op.tick();assert(op.tour);assert.equal(resumes,1);
const base={units:'mm',reference:'drawing',assumptions:['teaching model'],actuators:[{id:'a',input:'angle'}],joints:[{id:'j',axis:[0,0,1],parent:'frame',child:'arm',drive:{type:'actuator',id:'a'}}],readouts:[{id:'angle',unit:'deg',source:'derived'}]};assert(validateMachine(base).pass);assert(!validateMachine({...base,joints:[{...base.joints[0],drive:undefined}]}).pass);
console.log('PASS: explicit timestamps, metadata exclusion, invalid events, operator handoff/idle resume, actuator coverage.');

const morphology={taxon:'mantid inspired',stage:'adult',designScope:'concept',units:'mm',references:[{id:'r',url:'https://example.org/specimen',supports:'outline'}],landmarks:{a:[0,0,0],b:[0,10,0],c:[0,30,0]},ratios:[{id:'length',numerator:['a','b'],denominator:['a','c'],range:[.2,.4],basis:'design estimate',referenceId:'r'}],features:[{id:'head',views:['front'],referenceId:'r'}]};
assert(validateMorphology(morphology).pass);assert(!validateMorphology(null).pass);assert(!validateMorphology({...morphology,landmarks:{}}).pass);assert(!validateMorphology({...morphology,ratios:[{...morphology.ratios[0],range:[.5,.6]}]}).pass);assert(!validateMorphology({...morphology,references:[]}).pass);
console.log('PASS: morphology reference/landmark requirements and out-of-range ratios; these do not prove biological resemblance.');
