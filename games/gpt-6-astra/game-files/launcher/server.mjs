import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFile} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const id=createHash('sha256').update(root).digest('hex').slice(0,20);
const firstPort=Number(process.env.ASTRA_PORT||42800);
if(!Number.isInteger(firstPort)||firstPort<1024||firstPort>65515)throw Error('ASTRA_PORT must be a port from 1024 to 65515.');
let port=firstPort;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.glb':'model/gltf-binary','.bin':'application/octet-stream','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2'};
const gameNames=['elden-ring','subnautica','fortnite'];
const requestedGame=process.argv[process.argv.indexOf('--game')+1];
const startPath=process.argv.includes('--game')&&gameNames.includes(requestedGame)?requestedGame+'/':'';
function allowed(rel){
 if(['index.html','README.md','START HERE.txt'].includes(rel))return true;
 if(/^launcher\/(hub\.(css|js)|previews\/[a-z-]+\.png)$/.test(rel))return true;
 const [game,section,...rest]=rel.split('/');
 if(!gameNames.includes(game))return false;
 if(['src','vendor','assets'].includes(section))return rest.length>0&&!rest.some(part=>part.startsWith('.'));
 return rest.length===0&&(/^[A-Z_]+\.md$/.test(section)||['index.html','style.css','styles.css'].includes(section));
}
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Cache-Control','no-store');
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
 try{
  const url=new URL(req.url,'http://127.0.0.1');
  if(url.pathname==='/__astra_pack'){
   res.writeHead(200,{'Content-Type':'application/json'});res.end(req.method==='HEAD'?'':JSON.stringify({app:'astra-game-pack',id,games:gameNames}));return;
  }
  let pathname=decodeURIComponent(url.pathname);
  if(pathname.includes('\\')||pathname.includes('\0'))throw Error('Invalid path');
  if(gameNames.some(game=>pathname==='/'+game)){res.writeHead(302,{'Location':pathname+'/'});res.end();return;}
  if(pathname.endsWith('/'))pathname+='index.html';
  const rel=pathname.replace(/^\//,'');
  const file=path.resolve(root,rel);
  if(!file.startsWith(root+path.sep)||!allowed(rel))throw Error('Not found');
  const real=await fs.realpath(file),realRoot=await fs.realpath(root);
  if(!real.startsWith(realRoot+path.sep)||!(await fs.stat(real)).isFile())throw Error('Not found');
  const data=await fs.readFile(real);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':data.length});
  res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('File not found. Extract the entire game package and keep its folders together.');}
});
function announce(reused=false){
 const url=`http://127.0.0.1:${port}/${startPath}`;
 console.log(`GPT 6 Astra game library ${reused?'is already running':'is ready'}: ${url}`);
 if(!reused)console.log('Keep this window open while playing. Close it or press Ctrl+C when finished.');
 if(process.argv.includes('--open')&&!process.env.ASTRA_NO_OPEN){
  if(process.platform==='win32')execFile('cmd.exe',['/d','/s','/c','start','""',url],{windowsHide:true},error=>{if(error)console.log('Open the address above in your browser.');});
  else execFile(process.platform==='darwin'?'/usr/bin/open':'xdg-open',[url],{windowsHide:true},error=>{if(error)console.log('Open the address above in your browser.');});
 }
}
server.on('error',async error=>{
 if(error.code!=='EADDRINUSE'){console.error('The game server could not start: '+error.message);process.exitCode=1;return;}
 try{
  const response=await fetch(`http://127.0.0.1:${port}/__astra_pack`,{signal:AbortSignal.timeout(1000)});
  const info=await response.json();
  if(info.app==='astra-game-pack'&&info.id===id){announce(true);return;}
 }catch{}
 if(port<firstPort+20){port++;server.listen(port,'127.0.0.1');}
 else{console.error('The game ports are occupied. Close an earlier launcher window and try again.');process.exitCode=1;}
});
server.on('listening',()=>announce());
server.listen(port,'127.0.0.1');
