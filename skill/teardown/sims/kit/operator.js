// Shared live clock. Handoff never changes phase, intent or camera.
export function createOperator({phase=0,speed=.35,idleSeconds=25,onResume=()=>{},now=()=>performance.now()}={}){
  let last=now(),lastInput=last,tourStart=last,tour=true,paused=false;
  return {
    get phase(){return phase},set phase(v){if(!Number.isFinite(v))throw new Error('invalid phase');phase=v},
    get speed(){return speed},set speed(v){if(!Number.isFinite(v)||v<0)throw new Error('invalid speed');speed=v},
    get paused(){return paused},set paused(v){paused=!!v},get tour(){return tour},
    handoff(){lastInput=now();tour=false;},
    resume(){tour=true;tourStart=now();lastInput=tourStart;paused=false;onResume();},
    tick({active=true}={}){const n=now(),dt=Math.max(0,Math.min((n-last)/1000,.1));last=n;
      if(active&&!tour&&(n-lastInput)/1000>=idleSeconds)this.resume();
      if(!paused)phase+=dt*speed*360;
      return {dt,phase,tour,paused,tourTime:(n-tourStart)/1000};},
    bind(target=window){const listener=e=>{if(e.target?.closest?.('[data-resume-tour]'))return;this.handoff();};
      for(const type of ['pointerdown','wheel','keydown','input'])target.addEventListener(type,listener,{capture:true,passive:true});
      return ()=>{for(const type of ['pointerdown','wheel','keydown','input'])target.removeEventListener(type,listener,{capture:true});};}
  };
}
