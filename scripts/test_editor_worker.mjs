// Run: node --experimental-default-type=module scripts/test_editor_worker.mjs
import assert from 'node:assert/strict';
import worker from '../worker/index.js';
const p={phytonym_id:'phy_test_1',language_id:'evenki',name_native_language:'old',russian_gloss:'старое',english_gloss:'old',attestations:[]};
const q={phytonym_id:'phy_test_2',language_id:'evenki',name_native_language:'other',attestations:[]};
let rows=[p,q],sha='a'.repeat(40);
const enc=t=>Buffer.from(t).toString('base64');
const env={SESSIONS:{async get(k){return k==='session:'+'b'.repeat(64)?{login:'ksheifer',token:'secret'}:null;},async delete(){},async put(){}},GITHUB_CLIENT_ID:'x',GITHUB_CLIENT_SECRET:'x',GITHUB_OWNER:'ksheifer',GITHUB_REPO:'circumpolar-ethnobotanical-database',ADMIN_GITHUB_LOGIN:'ksheifer',EDITOR_ORIGIN:'https://ksheifer.github.io',API_BASE_URL:'https://worker.example'};
const orig=globalThis.fetch;
globalThis.fetch=async(url,opts)=>{const u=new URL(url);if(!u.pathname.includes('/contents/data/phytonyms/evenki.json'))return new Response('{}',{status:404});if(opts.method==='GET')return Response.json({type:'file',sha,content:enc(JSON.stringify(rows))});if(opts.method==='PUT'){const body=JSON.parse(opts.body);assert.equal(body.sha,sha);rows=JSON.parse(Buffer.from(body.content,'base64').toString('utf8'));sha='c'.repeat(40);return Response.json({content:{sha},commit:{html_url:'https://github.com/example/commit/test'}});}return Response.json({}, {status:404});};
const token='b'.repeat(64);
const request=(body,method='POST')=>worker.fetch(new Request('https://worker.example/api/profile',{method,headers:{Origin:'https://ksheifer.github.io',Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)}),env);
let r=await request({language:'evenki',id:'phy_test_1',expectedSha:'a'.repeat(40),changes:{russian_gloss:'новое'}});assert.equal(r.status,200);assert.equal(rows[0].russian_gloss,'новое');assert.equal(rows[1].name_native_language,'other');
r=await request({language:'evenki',id:'phy_test_1',expectedSha:'a'.repeat(40),changes:{russian_gloss:'wrong'}});assert.equal(r.status,409);
r=await request({language:'evenki',id:'phy_test_1',expectedSha:sha,changes:{language_id:'wrong'}});assert.equal(r.status,400);
r=await worker.fetch(new Request('https://worker.example/api/profile?language=evenki&id=phy_test_1',{headers:{Origin:'https://ksheifer.github.io'}}),env);assert.equal(r.status,401);
r=await worker.fetch(new Request('https://worker.example/api/profile?language=evenki&id=phy_test_1',{headers:{Origin:'https://malicious.example',Authorization:'Bearer '+token}}),env);assert.equal(r.status,403);
console.log('PASS: one-profile save, version conflict, whitelist, authentication, origin validation.');
globalThis.fetch=orig;
