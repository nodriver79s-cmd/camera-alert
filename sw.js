const C='camalert-v16',F=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>{if(r.ok)return c.put(u,r);}).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// 인터넷이 있으면 새 버전 먼저(4초 안에 응답 없으면 저장본), 없으면 저장본.
// 구형 크롬(68 등)은 navigate 요청을 그대로 다시 쓰면 오류가 나서 주소로 새 요청을 만든다.
function fresh(req){return new Promise(res=>{let done=false;const back=()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html')).then(r=>res(r));
 const t=setTimeout(()=>{if(!done){done=true;back();}},4000);
 let q;try{q=new Request(req.url,{cache:'no-store',credentials:'same-origin'});}catch(e){q=req.url;}
 fetch(q).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(req.url.split('?')[0],cp));}if(!done){done=true;clearTimeout(t);res(r);}})
 .catch(()=>{if(!done){done=true;clearTimeout(t);back();}});});}
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET')return;const u=new URL(q.url);
 if(q.mode==='navigate'||/\.(html|webmanifest)$/.test(u.pathname)||u.pathname.endsWith('/')){e.respondWith(fresh(q));return;}
 e.respondWith(caches.match(q,{ignoreSearch:true}).then(r=>r||fetch(q).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(q,cp));return res;})));});
