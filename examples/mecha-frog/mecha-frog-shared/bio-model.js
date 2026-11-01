// Original educational kinematics. Millimetres are design scale, not specimen measurements.
export const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const mix=(a,b,t)=>a+(b-a)*t,smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export const lerp=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
export const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),length=a=>Math.hypot(...a),unit=a=>mul(a,1/(length(a)||1)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function rotateX(p,a){return [p[0],p[1]*Math.cos(a)-p[2]*Math.sin(a),p[1]*Math.sin(a)+p[2]*Math.cos(a)];}
export const DURATIONS={rest:3,jump:1.8,call:1.2,hunt:.65};
export const PHASES={jump:[['蹲伏蓄能',.18],['伸展蹬地',.31],['腾空收腿',.54],['前肢缓冲',.79],['恢复蹲姿',.96]],call:[['肺部准备',.08],['喉部起振',.28],['声囊充盈',.46],['回流复位',.84]],hunt:[['锁定目标',.12],['下颌张开',.26],['前附着舌翻转',.335],['舌面接触',.42],['黏附回收',.64],['入口与复位',.94]]};
// Exact two-link solution in the plane of the target and an anatomical knee hint.
export function solveLimb(hip,target,L1,L2,hint){const v=sub(target,hip),d=length(v),axis=unit(v),reach=clamp(d,Math.abs(L1-L2)+1e-6,L1+L2-1e-6),a=(L1*L1-L2*L2+reach*reach)/(2*reach),h=Math.sqrt(Math.max(0,L1*L1-a*a)),q=sub(hint,hip),normal=unit(sub(q,mul(axis,dot(q,axis)))),knee=add(add(hip,mul(axis,a)),mul(normal,h));return {points:[hip,knee,target],reachable:Math.abs(reach-d)<1e-5,residual:Math.abs(reach-d),lengths:[L1,L2],angle:Math.acos(clamp((L1*L1+L2*L2-reach*reach)/(2*L1*L2),-1,1))};}
export function jumpState(p,power=1){p=clamp(p);power=clamp(power,.35,1);let y=0,z=0,stage='蹲伏蓄能',extension=0,air=0;
 if(p<.25){z=-2.2*smooth(p/.25);}
 else if(p<.36){const u=smooth((p-.25)/.11);y=18*u;z=mix(-2.2,16,u);extension=u;stage='伸展蹬地';}
 else if(p<.76){const t=(p-.36)/.4;y=18+64*power*t;z=16*(1-t)+4*35*power*t*(1-t);extension=1;air=t;stage='腾空收腿';}
 else{const u=(p-.76)/.24;y=18+64*power;z=-2*Math.sin(Math.PI*clamp(u/.75))*(u<.75?1:0);stage=u<.75?'落地缓冲':'恢复蹲姿';}
 const load=(p<.25?smooth(p/.25):p<.36?1-smooth((p-.25)/.11):0)*Math.sqrt(power);
 return {translation:[0,y,z],stage,extension,air,load,energy:load*load,flight:p>=.36&&p<.76,landY:18+64*power};}
export function callState(p){const u=clamp(p),inflate=Math.sin(Math.PI*smooth(clamp((u-.12)/.72)))**2,voice=inflate*(.7+.3*Math.sin(TAU*u*13)**2);return {inflate,voice,lungVolume:1-.38*inflate,sacVolume:.12+.38*inflate,flow:u<.48?1:u<.84?-1:0,stage:u<.12?'肺部准备':u<.48?'气流经喉 / 起振':u<.84?'声囊回流':'静息复位'};}
export function huntState(p,target=[0,88,12],translation=[0,0,0]){p=clamp(p);const open=smooth((p-.13)/.16)*(1-smooth((p-.78)/.18)),jaw=.53*open,root=add(add(rotateX([0,33,1],-jaw),[0,-4,22]),translation),rest=add(add(rotateX([0,10,1],-jaw),[0,-4,22]),translation),swallow=add(add(rotateX([0,13,2],-jaw),[0,-4,22]),translation),out=smooth((p-.30)/.06),back=smooth((p-.48)/.34),tip=p<.48?lerp(rest,target,out):lerp(target,swallow,back),contact=p>=.36&&p<=.82,extension=p<.48?out:1-back,stage=p<.13?'锁定目标':p<.3?'下颌张开':p<.36?'舌头前翻':p<.48?'舌面铺展 / 黏附':p<.82?'携猎物回收':'入口与复位';
 const c1=add(root,[0,-8*(1-extension)+9*extension,4+9*extension]),c2=lerp(root,tip,.72);c2[2]+=8*extension;
 return {jaw,root,tip,c1,c2,extension,contact,prey:p<.36?target:tip,preyVisible:p<.86,flatten:contact&&p<.48?smooth((p-.36)/.025):0,stage};}
export function bezier(a,b,c,d,t){const u=1-t;return a.map((v,i)=>u*u*u*v+3*u*u*t*b[i]+3*u*t*t*c[i]+t*t*t*d[i]);}
// Tissue coordinates are in world millimetres. Bundles are functional teaching groups,
// not individual muscles reconstructed from a Ceratophrys specimen.
export function tissueState(leg,load=0,compression=0){
 const [hip,knee,ankle,foot]=leg.points,side=leg.side;
 const referenceLengths={'hip-extensor':27,'knee-extensor':22,'thigh-stabilizer':23,'ankle-extensor':18.6,'shank-stabilizer':23.1,'foot-flexor':12,'forearm-support':16.6,'forearm-flexor':15.4};
 const bundle=(id,A,B,start,end,offset,radius,activation)=>{const a=add(lerp(A,B,start),offset),b=add(lerp(A,B,end),offset),rest=referenceLengths[id],now=length(sub(b,a));return {id,origin:A,insertion:B,a,b,radius:radius*Math.sqrt(rest/Math.max(now,1e-6)),activation,volumeProxy:rest*radius*radius};};
 const groups=leg.hind?[
  bundle('hip-extensor',add(hip,[-side*10,-7,2]),lerp(hip,knee,.9),.06,.91,[side*1.8,-1,2.5],3.5,.35+.65*load),
  bundle('knee-extensor',lerp(hip,knee,.18),lerp(knee,ankle,.13),.05,.95,[side*-2,1,1.4],2.65,.25+.55*load+.2*compression),
  bundle('thigh-stabilizer',add(hip,[-side*3,-4,-2]),lerp(hip,knee,.83),.10,.91,[side*1.2,1,-1.6],2.3,.2+.4*compression),
  bundle('ankle-extensor',knee,ankle,.08,.70-.18*load,[0,-1,1],2.65,.25+.75*load),
  bundle('shank-stabilizer',knee,ankle,.12,.89,[side*-1.5,1.2,-1],1.85,.3+.4*compression),
  bundle('foot-flexor',ankle,foot,.09,.71,[side*.6,0,.8],.95,.2+.4*load)
 ]:[bundle('forearm-support',hip,knee,.08,.91,[side*.7,0,.8],2.2,.2+.7*compression),bundle('forearm-flexor',knee,ankle,.09,.86,[side*.6,0,.7],1.55,.2+.6*compression)];
 const main=groups.find(g=>g.id==='ankle-extensor');
 const tendonPath=main?[main.b,add(ankle,[0,-1,1]),add(ankle,[side*.5,2,.2]),lerp(ankle,foot,.65)]:[groups.at(-1).b,ankle,foot];
 return {groups,tendonPath,compression};
}
export function frame({mode='rest',progress=0,power=.8,aim=0,distance=88}={}){const p=clamp(progress),jump=mode==='jump'?jumpState(p,power):{translation:[0,0,0],stage:'伏地静候',load:0,energy:0,extension:0,air:0,flight:false,landY:0},translation=jump.translation,call=mode==='call'?callState(p):{inflate:0,voice:0,lungVolume:1,sacVolume:.12,flow:0,stage:'静息'},target=[aim,distance,12],hunt=huntState(mode==='hunt'?p:0,target,translation),legs=[];
 for(const side of [-1,1])for(const hind of [true,false]){const id=(side<0?'L':'R')+(hind?'H':'F'),hip=add([side*(hind?22:27),hind?-21:8,hind?23:22],translation);let ankle;
  if(hind){ankle=[side*35,-27,6];if(mode==='jump'){if(p>=.36&&p<.76){const t=jump.air,local=lerp([side*35,-45,-10],[side*32,-20,8],smooth(t/.26)),landing=lerp(local,[side*35,-27,6],smooth((t-.55)/.45));ankle=add(landing,translation);}else if(p>=.76)ankle=[side*35,jump.landY-27,6];}}
  else{ankle=[side*35,32,3];if(mode==='jump'){if(p>.27&&p<.76){const lift=smooth((p-.27)/.09),t=jump.air,local=lerp([side*35,32-translation[1],3-translation[2]],[side*32,26,10],lift);ankle=add(lerp(local,[side*35,32,3],smooth((t-.65)/.35)),translation);}else if(p>=.76)ankle=[side*35,jump.landY+32,3];}}
  const hint=add([side*(hind?52:42),hind?-6:20,hind?13:10],translation),leg=solveLimb(hip,ankle,hind?31:20,hind?30:20,hint);leg.id=id;leg.side=side;leg.hind=hind;leg.contact=mode!=='jump'||(hind?(p<.36||p>=.76):(p<=.27||p>=.76));const foot=add(ankle,hind?[side*4,18,-3]:[side*2,7,-1]);leg.points.push(foot);const count=hind?5:4;leg.digits=Array.from({length:count},(_,j)=>{const spread=(j-(count-1)/2)*1.9;return {base:add(foot,[spread*.6,-2,.1]),tip:add(foot,[spread*1.7,4+(1-Math.abs(j-(count-1)/2)/count)*4,hind?-2.75:-1.75])};});legs.push(leg);}
 let speed=0;if(mode==='hunt'){const h=1e-5,a=huntState(clamp(p-h),target,translation),b=huntState(clamp(p+h),target,translation);speed=length(sub(b.tip,a.tip))/((clamp(p+h)-clamp(p-h))*DURATIONS.hunt||1)/1000;}
 const jaw=mode==='hunt'?hunt.jaw:mode==='call'?.003*call.voice:0,tongue=mode==='hunt'?hunt:huntState(0,target,translation);if(mode!=='hunt'){tongue.root=add(add(rotateX([0,33,1],-jaw),[0,-4,22]),translation);tongue.tip=add(add(rotateX([0,10,1],-jaw),[0,-4,22]),translation);tongue.c1=add(tongue.root,[0,-8,4]);tongue.c2=lerp(tongue.root,tongue.tip,.72);}
 const compression=mode==='jump'&&p>=.76?Math.sin(Math.PI*clamp((p-.76)/.18))**2:0,breath=mode==='rest'?Math.sin(TAU*p*2):mode==='call'?call.inflate*.7:0;
 for(const leg of legs)leg.tissue=tissueState(leg,jump.load,compression);
 return {mode,p,translation,jump,call,hunt,target,legs,speed,jaw,soft:{compression,breath},stage:mode==='jump'?jump.stage:mode==='call'?call.stage:mode==='hunt'?hunt.stage:'伏地静候',tongue};}
