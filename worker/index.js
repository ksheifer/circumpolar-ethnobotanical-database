// Cloudflare Worker: GitHub App OAuth + narrowly scoped, per-profile JSON edits.
// Required: KV binding SESSIONS, vars listed in worker/wrangler.toml.example.
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const hex = n => [...crypto.getRandomValues(new Uint8Array(n))].map(x => x.toString(16).padStart(2,'0')).join('');
const toBase64 = s => btoa(Array.from(textEncoder.encode(s), b => String.fromCharCode(b)).join(''));
const fromBase64 = s => textDecoder.decode(Uint8Array.from(atob(s.replace(/\s/g, '')), c => c.charCodeAt(0)));
const json = (body, status=200, headers={}) => new Response(JSON.stringify(body), { status, headers: {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store',...headers}});
const fail = (message, status=400) => json({error:message},status);
const ALLOWED_SCALARS = new Set(['name_native_language','russian_gloss','english_gloss','phytonym_morphology','cognate']);
const NESTED = {ecological_data:['habitat','plant_community','phenology','description','toxicity'], indigenous_knowledge:['medicinal_use','domestic_use','spiritual_use','human_consumption','animal_consumption'], ecological_data_en:['habitat','plant_community','phenology','description','toxicity'], indigenous_knowledge_en:['medicinal_use','domestic_use','spiritual_use','human_consumption','animal_consumption']};
const LANGUAGE_ID = /^[a-z]{2,30}$/;
const ITEM_ID = /^[a-zA-Z0-9_-]{1,128}$/;
function appOrigin(env){return new URL(env.EDITOR_ORIGIN).origin;}
function cors(response, env){const h=new Headers(response.headers);h.set('Access-Control-Allow-Origin',appOrigin(env));h.set('Access-Control-Allow-Methods','GET,POST,OPTIONS');h.set('Access-Control-Allow-Headers','Authorization,Content-Type');h.set('Vary','Origin');h.set('Cache-Control','no-store');return new Response(response.body,{status:response.status,headers:h});}
function validSetup(env){return env.SESSIONS && env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET && env.GITHUB_OWNER && env.GITHUB_REPO && env.ADMIN_GITHUB_LOGIN && env.EDITOR_ORIGIN && env.API_BASE_URL;}
async function github(env, token, method, path, body){const res=await fetch('https://api.github.com'+path,{method,headers:{'Accept':'application/vnd.github+json','Authorization':`Bearer ${token}`,'User-Agent':'circumpolar-ethnobotanical-content-editor','X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});const payload=await res.json().catch(()=>({}));if(!res.ok)throw Object.assign(new Error(payload.message||`GitHub HTTP ${res.status}`),{status:res.status});return payload;}
function pathFor(env,lang){return `/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/data/phytonyms/${lang}.json`;}
async function collection(env,token,lang){const file=await github(env,token,'GET',pathFor(env,lang)+'?ref='+encodeURIComponent(env.GITHUB_BRANCH||'main'));if(file.type!=='file'||!file.sha||!file.content)throw Error('Invalid JSON file response');const rows=JSON.parse(fromBase64(file.content));if(!Array.isArray(rows))throw Error('Invalid phytonym collection');return {file,rows};}
async function allowedSession(req,env){const auth=req.headers.get('Authorization')||'';const match=/^Bearer ([a-f0-9]{64})$/.exec(auth);if(!match)return null;const session=await env.SESSIONS.get('session:'+match[1],'json');return session && session.login.toLowerCase()===env.ADMIN_GITHUB_LOGIN.toLowerCase()?session:null;}
async function api(req,env,url){const session=await allowedSession(req,env);if(!session)return fail('Not authenticated. Sign in with the permitted GitHub account.',401);
 if(url.pathname==='/api/me'&&req.method==='GET')return json({login:session.login,repo:`${env.GITHUB_OWNER}/${env.GITHUB_REPO}`});
 if(url.pathname==='/api/logout'&&req.method==='POST'){await env.SESSIONS.delete('session:'+req.headers.get('Authorization').slice(7));return json({ok:true});}
 if(url.pathname==='/api/profile'&&req.method==='GET'){
  const lang=url.searchParams.get('language')||'',id=url.searchParams.get('id')||'';
  if(!LANGUAGE_ID.test(lang)||!ITEM_ID.test(id))return fail('Invalid profile identifier');
  const {file,rows}=await collection(env,session.token,lang);
  const profile=rows.find(p=>p.phytonym_id===id && p.language_id===lang);
  return profile?json({profile,sha:file.sha}):fail('Profile not found',404);
 }
 if(url.pathname==='/api/profile/delete'&&req.method==='POST'){
  let input;try{input=await req.json();}catch{return fail('Invalid JSON');}
  const {language,id,expectedSha,confirmName}=input||{};
  if(!LANGUAGE_ID.test(language||'')||!ITEM_ID.test(id||'')||!(/^[a-f0-9]{40}$/.test(expectedSha||''))||typeof confirmName!=='string'||confirmName.length>2000)return fail('Invalid deletion request');
  const {file,rows}=await collection(env,session.token,language);
  if(file.sha!==expectedSha)return fail('The file changed in GitHub. Reload this profile before deleting; no records were removed.',409);
  const index=rows.findIndex(p=>p.phytonym_id===id&&p.language_id===language);
  if(index<0)return fail('Profile not found',404);
  const removed=rows[index];
  if(confirmName!==removed.name_native_language)return fail('The confirmation name does not match the current phytonym.',400);
  rows.splice(index,1);
  const committed=await github(env,session.token,'PUT',pathFor(env,language),{message:`Delete ${language} phytonym ${id}`,content:toBase64(JSON.stringify(rows,null,2)+'\n'),sha:file.sha,branch:env.GITHUB_BRANCH||'main'});
  return json({ok:true,deleted:{language_id:language,phytonym_id:id,name_native_language:removed.name_native_language},commit:committed.commit?.html_url||null,sha:committed.content?.sha||null});
 }
 if(url.pathname==='/api/profile'&&req.method==='POST'){
  let input;try{input=await req.json();}catch{return fail('Invalid JSON');}
  const {language,id,expectedSha,changes}=input||{};
  if(!LANGUAGE_ID.test(language||'')||!ITEM_ID.test(id||'')||!(/^[a-f0-9]{40}$/.test(expectedSha||''))||!changes||typeof changes!=='object'||Array.isArray(changes))return fail('Invalid request');
  const allowed=new Set([...ALLOWED_SCALARS,'names_other_varieties','dialect_id','reference_location_id','pan_arctic_species','endangered_species',...Object.keys(NESTED),'attestation_updates']);
  if(Object.keys(changes).some(k=>!allowed.has(k)))return fail('Structure editing is not permitted');
  const {file,rows}=await collection(env,session.token,language);
  if(file.sha!==expectedSha)return fail('The file changed in GitHub. Reload this profile before saving; other edits were not overwritten.',409);
  const index=rows.findIndex(p=>p.phytonym_id===id&&p.language_id===language);
  if(index<0)return fail('Profile not found',404);
  const p=rows[index];
  const asString=(v,k)=>{if(typeof v!=='string'||v.length>20000)throw Error('Invalid value for '+k);return v;};
  try{
   for(const [k,v] of Object.entries(changes)){
    if(ALLOWED_SCALARS.has(k))p[k]=asString(v,k);
    else if(k==='pan_arctic_species'||k==='endangered_species'){
     if(v!==null&&typeof v!=='boolean')throw Error('Invalid status for '+k);
     p[k]=v;
    }
    else if(k==='names_other_varieties'){
     if(!Array.isArray(v)||v.length>100||v.some(x=>typeof x!=='string'||x.length>500))throw Error('Invalid other-variety forms');
     p[k]=v;
    }else if(k==='dialect_id'||k==='reference_location_id'){
     if(v!==null&&(!ITEM_ID.test(v)))throw Error('Invalid reference for '+k);
     p[k]=v;
    }else if(NESTED[k]){
     if(!v||Array.isArray(v)||typeof v!=='object'||Object.keys(v).some(x=>!NESTED[k].includes(x)))throw Error('Invalid '+k);
     const old=p[k]&&typeof p[k]==='object'?p[k]:{};
     for(const [field,val] of Object.entries(v))old[field]=asString(val,field);
     p[k]=old;
    }else if(k==='attestation_updates'){
     if(!Array.isArray(v)||v.length>150)throw Error('Invalid attestation edits');
     const ids=new Set();
     for(const edit of v){
      if(!edit||typeof edit!=='object'||Object.keys(edit).some(x=>!['attestation_id','source_pages','location_id','dialect_ids'].includes(x)))throw Error('Attestation structure cannot be edited');
      if(!ITEM_ID.test(edit.attestation_id)||ids.has(edit.attestation_id))throw Error('Invalid attestation ID');ids.add(edit.attestation_id);
      const a=(p.attestations||[]).find(x=>x.attestation_id===edit.attestation_id);if(!a)throw Error('Unknown attestation');
      if('source_pages' in edit)a.source_pages=asString(edit.source_pages,'source_pages');
      if('location_id' in edit){if(edit.location_id!==null&&!ITEM_ID.test(edit.location_id))throw Error('Invalid locality');a.location_id=edit.location_id;}
      if('dialect_ids' in edit){if(!Array.isArray(edit.dialect_ids)||edit.dialect_ids.length>100||edit.dialect_ids.some(x=>!ITEM_ID.test(x)))throw Error('Invalid dialect IDs');a.dialect_ids=[...new Set(edit.dialect_ids)];}
     }
    }
   }
   if(!p.name_native_language.trim())throw Error('Phytonym must not be empty');
   // Validate references against current published registry before saving.
   const lookups={};for(const [collectionName,needs] of Object.entries({dialects:[p.dialect_id,...(p.attestations||[]).flatMap(a=>a.dialect_ids||[])],locations:[p.reference_location_id,...(p.attestations||[]).map(a=>a.location_id)]})){
    if(!needs.some(Boolean))continue;
    const entry=await github(env,session.token,'GET',`/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/data/${collectionName}.json?ref=${encodeURIComponent(env.GITHUB_BRANCH||'main')}`);
    const rows=JSON.parse(fromBase64(entry.content));const field=collectionName==='dialects'?'dialect_id':'location_id';const set=new Set(rows.map(x=>x[field]));if(needs.some(x=>x&&!set.has(x)))throw Error('Unknown '+collectionName+' ID');
    if(collectionName==='dialects'&&p.dialect_id&&rows.find(d=>d.dialect_id===p.dialect_id)?.language_id!==language)throw Error('Dialect does not belong to this language');
    if(collectionName==='dialects'&&(p.attestations||[]).some(a=>(a.dialect_ids||[]).some(d=>rows.find(x=>x.dialect_id===d)?.language_id!==language)))throw Error('Attestation dialect belongs to another language');
   }
  }catch(e){return fail(e.message);}
  const committed=await github(env,session.token,'PUT',pathFor(env,language),{message:`Edit ${language} phytonym ${id}`,content:toBase64(JSON.stringify(rows,null,2)+'\n'),sha:file.sha,branch:env.GITHUB_BRANCH||'main'});
  return json({ok:true,commit:committed.commit?.html_url||null,sha:committed.content?.sha||null,profile:p});
 }
 return fail('Not found',404);
}
async function oauthStart(env){const nonce=hex(24);await env.SESSIONS.put('oauth:'+nonce,'1',{expirationTtl:600});const u=new URL('https://github.com/login/oauth/authorize');u.searchParams.set('client_id',env.GITHUB_CLIENT_ID);u.searchParams.set('redirect_uri',env.API_BASE_URL.replace(/\/$/,'')+'/auth/callback');u.searchParams.set('state',nonce);return Response.redirect(u.toString(),302);}
async function oauthCallback(env,url){const state=url.searchParams.get('state')||'';const code=url.searchParams.get('code')||'';const valid=await env.SESSIONS.get('oauth:'+state);if(!valid||!code)return fail('Invalid or expired OAuth authorization',401);await env.SESSIONS.delete('oauth:'+state);
 const response=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json','User-Agent':'circumpolar-ethnobotanical-content-editor'},body:JSON.stringify({client_id:env.GITHUB_CLIENT_ID,client_secret:env.GITHUB_CLIENT_SECRET,code,redirect_uri:env.API_BASE_URL.replace(/\/$/,'')+'/auth/callback'})});
 const tokenPayload=await response.json();if(!tokenPayload.access_token) return fail('GitHub login failed',401);
 const user=await github(env,tokenPayload.access_token,'GET','/user');if(user.login?.toLowerCase()!==env.ADMIN_GITHUB_LOGIN.toLowerCase())return fail('This GitHub account is not an editor',403);
 const sessionId=hex(32);await env.SESSIONS.put('session:'+sessionId,JSON.stringify({login:user.login,token:tokenPayload.access_token}),{expirationTtl:8*3600});
 const target=JSON.stringify(appOrigin(env));const payload=JSON.stringify({type:'cedb-auth-success',session:sessionId,login:user.login});
 const html=`<!doctype html><meta charset="utf-8"><title>Content Editor authorization</title><p>Authorization complete. You may close this window.</p><script>if(window.opener){window.opener.postMessage(${payload},${target});window.close()}</script>`;
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'"}});
}
export default {async fetch(req,env){try{if(!validSetup(env))return fail('Editor backend not configured',503);const url=new URL(req.url);if(url.pathname==='/auth/start'&&req.method==='GET')return oauthStart(env);if(url.pathname==='/auth/callback'&&req.method==='GET')return oauthCallback(env,url);if(!url.pathname.startsWith('/api/'))return fail('Not found',404);
 const origin=req.headers.get('Origin');if(origin&&origin!==appOrigin(env))return fail('Origin not allowed',403);
 if(req.method==='OPTIONS')return cors(new Response(null,{status:204}),env);
 return cors(await api(req,env,url),env);
 }catch(e){const response=fail(e.message||'Unexpected error',e.status&&e.status>=400&&e.status<=599?e.status:500);return validSetup(env)&&new URL(req.url).pathname.startsWith('/api/')?cors(response,env):response;}}};
