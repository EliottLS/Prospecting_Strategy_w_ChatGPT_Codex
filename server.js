import http from 'node:http';
import {readFile} from 'node:fs/promises';
const files={'/':'index.html','/app.js':'app.js','/agent.js':'agent.js','/style.css':'style.css','/data.js':'data.js','/strategy.js':'strategy.js','/salesforce.svg':'salesforce.svg'};
http.createServer(async(req,res)=>{const file=files[new URL(req.url,'http://localhost').pathname];if(!file){res.writeHead(404);return res.end('Not found');}try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':'text/html');res.end(await readFile(new URL(file,import.meta.url)));}catch{res.writeHead(500);res.end('Unable to load app');}}).listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Signal running on port '+(process.env.PORT||3000)));
