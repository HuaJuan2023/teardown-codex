import {runLive} from '../ant-shared/live.js';
runLive().catch(e=>{document.getElementById('app').textContent='Unable to initialize WebGL: '+e.message;throw e;});
