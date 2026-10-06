import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const directory=path.dirname(fileURLToPath(import.meta.url));
const url='http://127.0.0.1:5173';
async function ready(){try{const response=await fetch(url,{signal:AbortSignal.timeout(1000)});return response.ok&&(await response.text()).includes('id="ocean"');}catch{return false;}}
if(!await ready()){
  const server=spawn(process.execPath,[path.join(directory,'serve.mjs')],{cwd:directory,detached:true,stdio:'ignore',windowsHide:true});
  server.unref();
  for(let i=0;i<25&&!await ready();i++)await new Promise(resolve=>setTimeout(resolve,200));
}
if(!await ready()){console.error('로컬 페이지를 열 수 없습니다. 5173 포트를 확인해 주세요.');process.exitCode=1;}
else{spawn('cmd.exe',['/d','/s','/c','start "" "http://127.0.0.1:5173"'],{stdio:'ignore',windowsHide:true});}
