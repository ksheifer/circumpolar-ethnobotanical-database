'use strict';
// Content only. Authorization and all writes are enforced by the separate Worker.
const base=new URL('../',document.querySelector('script[src*="admin/editor.js"]').src);
const api=(window.CEDB_EDITOR_API||'').replace(/\/$/,'');
const SKEY='cedb_editor_session';
const embedded=new URLSearchParams(location.search).get('embedded')==='1';
if(embedded)document.documentElement.classList.add('embedded-editor');
const refs={login:document.getElementById('login'),logout:document.getElementById('logout'),auth:document.getElementById('auth-state'),setup:document.getElementById('setup'),search:document.getElementById('profile-search'),select:document.getElementById('profile-select'),open:document.getElementById('open-profile'),message:document.getElementById('message'),area:document.getElementById('profile-editor'),fields:document.getElementById('editor-fields'),save:document.getElementById('save')};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const st={session:sessionStorage.getItem(SKEY)||'',login:null,rows:[],languages:[],dialects:[],locations:[],sources:[],profile:null,sha:'',dirty:false,busy:false};
const FIELDS={
 linguistic:[['name_native_language','Phytonym'],['dialect_id','Language variety'],['names_other_varieties','Phytonym in other varieties'],['phytonym_morphology','Phytonym morphology (suffixes)'],['cognate','Related forms'],['russian_gloss','Russian gloss'],['english_gloss','English gloss']],
 ecological_data:[['habitat','Habitat'],['plant_community','Plant community'],['phenology','Phenology'],['description','Description'],['toxicity','Toxicity']],
 indigenous_knowledge:[['medicinal_use','Medicinal use'],['domestic_use','Domestic use'],['spiritual_use','Spiritual use'],['human_consumption','Human consumption'],['animal_consumption','Animal consumption']],
 ecological_data_en:[['habitat','Habitat (English)'],['plant_community','Plant community (English)'],['phenology','Phenology (English)'],['description','Description (English)'],['toxicity','Toxicity (English)']],
 indigenous_knowledge_en:[['medicinal_use','Medicinal use (English)'],['domestic_use','Domestic use (English)'],['spiritual_use','Spiritual use (English)'],['human_consumption','Human consumption (English)'],['animal_consumption','Animal consumption (English)']]
};
function notice(s){refs.message.textContent=s;}
function setBusy(value){st.busy=value;refs.save.disabled=value||!st.profile;refs.open.disabled=value||!refs.select.value;refs.login.disabled=value;}
async function call(path,{method='GET',body}={}){if(!api)throw Error('Backend is not configured. See admin/SETUP.md.');const r=await fetch(api+path,{method,headers:{'Authorization':'Bearer '+st.session,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});const result=await r.json();if(!r.ok)throw Object.assign(new Error(result.error||`HTTP ${r.status}`),{status:r.status});return result;}
function authDisplay(){refs.auth.textContent=st.login?`Signed in as @${st.login}`:'Not signed in';refs.login.hidden=!!st.login;refs.logout.hidden=!st.login;refs.open.disabled=!st.login||!refs.select.value;}
async function authCheck(){if(!st.session){st.login=null;authDisplay();return;}try{const me=await call('/api/me');st.login=me.login;notice(`Connected to ${me.repo}.`);}catch(e){sessionStorage.removeItem(SKEY);st.session='';st.login=null;notice(e.message);}authDisplay();}
window.addEventListener('message',async event=>{if(!api||event.origin!==new URL(api).origin||event.data?.type!=='cedb-auth-success'||!event.data.session)return;st.session=event.data.session;sessionStorage.setItem(SKEY,st.session);await authCheck();if(embedded&&st.login){const q=new URLSearchParams(location.search);if(q.get('language')&&q.get('id'))await openProfile(q.get('language'),q.get('id'));}});
refs.login.addEventListener('click',()=>{if(!api){notice('Configure admin/config.js and deploy the backend first.');return;}const popup=window.open(api+'/auth/start','cedb-github-auth','popup,width=620,height=760');if(!popup)notice('Browser blocked the sign-in popup. Allow popups for this site.');});
refs.logout.addEventListener('click',async()=>{try{await call('/api/logout',{method:'POST'});}catch{}sessionStorage.removeItem(SKEY);st.session='';st.login=null;st.profile=null;refs.area.hidden=true;authDisplay();notice('Signed out.');});
function languageName(id){const l=st.languages.find(x=>x.language_id===id);return l?.name_en||id;}
function filtered(){const q=refs.search.value.normalize('NFC').toLocaleLowerCase().trim();return st.rows.filter(p=>!q||[p.name_native_language,p.russian_gloss,p.english_gloss,languageName(p.language_id)].join(' ').toLocaleLowerCase().includes(q)).slice(0,250);}
function refreshResults(){const selected=refs.select.value;refs.select.innerHTML=filtered().map(p=>`<option value="${esc(p.phytonym_id)}">${esc(p.name_native_language)} — ${esc(languageName(p.language_id))} — ${esc(p.english_gloss||'')}</option>`).join('');if([...refs.select.options].some(x=>x.value===selected))refs.select.value=selected;refs.open.disabled=!st.login||!refs.select.value;}
refs.search.addEventListener('input',refreshResults);refs.select.addEventListener('change',()=>{refs.open.disabled=!st.login||!refs.select.value;});refs.select.addEventListener('dblclick',()=>refs.open.click());
function selectedProfile(){return st.rows.find(p=>p.phytonym_id===refs.select.value);}
async function openProfile(language,id){if(st.dirty&&!confirm('Discard unsaved edits to the current profile?'))return;setBusy(true);notice('Loading the latest profile from GitHub…');try{const d=await call(`/api/profile?language=${encodeURIComponent(language)}&id=${encodeURIComponent(id)}`);st.profile=d.profile;st.sha=d.sha;st.dirty=false;window.__cedbDirty=false;drawProfile();refs.area.hidden=false;notice(`Loaded ${st.profile.phytonym_id} from GitHub.`);history.replaceState(null,'',`?language=${encodeURIComponent(language)}&id=${encodeURIComponent(id)}`);}catch(e){notice(e.message);}finally{setBusy(false);}}
refs.open.addEventListener('click',()=>{const p=selectedProfile();if(p)openProfile(p.language_id,p.phytonym_id);});
function input(name,value,kind='text',label=name){const field=kind==='textarea'?`<textarea id="f-${esc(name)}" data-field="${esc(name)}" rows="3">${esc(value)}</textarea>`:`<input id="f-${esc(name)}" data-field="${esc(name)}" type="text" value="${esc(value)}">`;return `<div class="editor-field"><label for="f-${esc(name)}">${esc(label)}</label>${field}</div>`;}
function singleSelect(name,label,value,options){return `<div class="editor-field"><label for="f-${esc(name)}">${esc(label)}</label><select id="f-${esc(name)}" data-field="${esc(name)}"><option value="">—</option>${options.map(x=>`<option value="${esc(x.id)}" ${x.id===value?'selected':''}>${esc(x.label)}</option>`).join('')}</select></div>`;}
function statusSelect(name,label,value){const selected=value===true?'true':value===false?'false':'';return `<div class="editor-field"><label for="f-${esc(name)}">${esc(label)}</label><select id="f-${esc(name)}" data-field="${esc(name)}"><option value="" ${selected===''?'selected':''}>Not specified</option><option value="true" ${selected==='true'?'selected':''}>Yes</option><option value="false" ${selected==='false'?'selected':''}>No</option></select></div>`;}
function multipleSelect(name,label,values,options){const selected=new Set(values||[]);return `<div class="editor-field"><label for="f-${esc(name)}">${esc(label)} <small>(Ctrl/Cmd to select multiple)</small></label><select multiple id="f-${esc(name)}" data-field="${esc(name)}">${options.map(x=>`<option value="${esc(x.id)}" ${selected.has(x.id)?'selected':''}>${esc(x.label)}</option>`).join('')}</select></div>`;}
function dialectOpts(){return st.dialects.filter(d=>d.language_id===st.profile.language_id).map(d=>({id:d.dialect_id,label:d.name_en||d.source_abbreviation||d.dialect_id})).sort((a,b)=>a.label.localeCompare(b.label));}
function locationOpts(){return st.locations.map(l=>({id:l.location_id,label:l.name_ru||l.locality||l.location_id})).sort((a,b)=>a.label.localeCompare(b.label,'ru'));}
function readField(key){return document.querySelector(`[data-field="${key}"]`)?.value||'';}
function drawProfile(){const p=st.profile;const d=dialectOpts(),locations=locationOpts();document.getElementById('profile-heading').textContent=p.name_native_language;document.getElementById('profile-subheading').textContent=`${languageName(p.language_id)} · ${p.phytonym_id}`;
 let html='<section class="editor-section"><h3>Linguistic information</h3>';
 html+=input('name_native_language',p.name_native_language,'text','Phytonym');
 html+=input('language_id',languageName(p.language_id),'text','Language (read only)').replace('data-field="language_id"','disabled');
 html+=singleSelect('dialect_id','Language variety (main record)',p.dialect_id||'',d);
 html+=input('names_other_varieties',(p.names_other_varieties||[]).join('\n'),'textarea','Phytonym in other varieties (one form per line)');
 html+=input('phytonym_morphology',p.phytonym_morphology||'','textarea','Phytonym morphology');
 html+=input('cognate',p.cognate||'','textarea','Related forms');
 html+=input('russian_gloss',p.russian_gloss||'','text','Russian gloss');html+=input('english_gloss',p.english_gloss||'','text','English gloss');html+='</section>';
 for(const [group,title] of [['ecological_data','Ecological Data'],['indigenous_knowledge','Indigenous Knowledge'],['ecological_data_en','Ecological Data — English translations'],['indigenous_knowledge_en','Indigenous Knowledge — English translations']]){
 html+=`<section class="editor-section"><h3>${title}</h3>`;
 for(const [key,label] of FIELDS[group])html+=input(group+'.'+key,p[group]?.[key]||'','textarea',label);
 html+='</section>';
 }
 html+='<section class="editor-section"><h3>Botanical classification</h3>';html+=statusSelect('pan_arctic_species','Pan-Arctic species',p.pan_arctic_species);html+=statusSelect('endangered_species','Endangered species (Red Data Book)',p.endangered_species);html+='</section>';
 html+='<section class="editor-section"><h3>Geographical reference</h3>';html+=singleSelect('reference_location_id','Reference locality',p.reference_location_id||'',locations);html+='</section>';
 html+='<section class="editor-section"><h3>Source attestations</h3><p class="muted">Edit existing attestation locations, varieties and printed source pages. Adding or deleting attestations is not included in this editor.</p>';
 for(const [index,a] of (p.attestations||[]).entries()){
 const source=st.sources.find(s=>s.source_id===a.source_id);const heading=source?.short_citation||source?.citation_short||a.source_id||a.attestation_id;
 html+=`<div class="editor-attestation"><h4>${esc(heading)} — ${esc(a.attestation_id)}</h4>`;
 html+=input(`att.${index}.source_pages`,a.source_pages||'','text','Printed source pages');
 html+=singleSelect(`att.${index}.location_id`,'Attested locality',a.location_id||'',locations);
 html+=multipleSelect(`att.${index}.dialect_ids`,'Attested varieties',a.dialect_ids||[],d);
 html+='</div>';
 }
 html+='</section>';refs.fields.innerHTML=html;
 refs.fields.querySelectorAll('input,textarea,select').forEach(el=>el.addEventListener('input',()=>{st.dirty=true;window.__cedbDirty=true;notice('Unsaved changes.');}));
}
function gather(){const p=st.profile;const changes={};for(const key of ['name_native_language','phytonym_morphology','cognate','russian_gloss','english_gloss']){const value=readField(key);if(value!==(p[key]||''))changes[key]=value;}
 const forms=readField('names_other_varieties').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(JSON.stringify(forms)!==JSON.stringify(p.names_other_varieties||[]))changes.names_other_varieties=forms;
 const dialect=readField('dialect_id')||null;if(dialect!==(p.dialect_id||null))changes.dialect_id=dialect;
 for(const key of ['pan_arctic_species','endangered_species']){const raw=readField(key);const value=raw==='true'?true:raw==='false'?false:null;if(value!==(p[key]??null))changes[key]=value;}
 const loc=readField('reference_location_id')||null;if(loc!==(p.reference_location_id||null))changes.reference_location_id=loc;
 for(const group of Object.keys(FIELDS).filter(x=>x!=='linguistic')){const updated={};for(const [field] of FIELDS[group]){const value=readField(group+'.'+field);if(value!==(p[group]?.[field]||''))updated[field]=value;}if(Object.keys(updated).length)changes[group]=updated;}
 const edits=[];for(const [index,a] of (p.attestations||[]).entries()){
 const edit={attestation_id:a.attestation_id};const pages=readField(`att.${index}.source_pages`);if(pages!==(a.source_pages||''))edit.source_pages=pages;
 const location=readField(`att.${index}.location_id`)||null;if(location!==(a.location_id||null))edit.location_id=location;
 const el=document.querySelector(`[data-field="att.${index}.dialect_ids"]`);const dialects=[...el.selectedOptions].map(x=>x.value);if(JSON.stringify(dialects)!==JSON.stringify(a.dialect_ids||[]))edit.dialect_ids=dialects;
 if(Object.keys(edit).length>1)edits.push(edit);
 }if(edits.length)changes.attestation_updates=edits;return changes;
}
document.getElementById('edit-form').addEventListener('submit',async e=>{e.preventDefault();if(!st.profile||st.busy)return;const changes=gather();if(!Object.keys(changes).length){notice('No changes to save.');return;}if(('name_native_language' in changes ? changes.name_native_language : st.profile.name_native_language).trim()==='') return notice('Phytonym name cannot be empty.');
 setBusy(true);notice('Checking and saving to GitHub…');try{const result=await call('/api/profile',{method:'POST',body:{language:st.profile.language_id,id:st.profile.phytonym_id,expectedSha:st.sha,changes}});st.profile=result.profile;st.sha=result.sha;st.dirty=false;window.__cedbDirty=false;drawProfile();refs.area.hidden=false;
 const local=st.rows.find(x=>x.phytonym_id===st.profile.phytonym_id);if(local)Object.assign(local,st.profile);refreshResults();
 if(embedded&&window.parent!==window)window.parent.postMessage({type:'cedb-profile-saved',profile:st.profile},location.origin);
 refs.message.textContent='Saved to GitHub. ';if(result.commit){const a=document.createElement('a');a.href=result.commit;a.target='_blank';a.rel='noopener noreferrer';a.textContent='View commit';refs.message.appendChild(a);}
 }catch(err){notice(err.message+(err.status===409?' Your changes remain in the editor; copy them before reloading.':''));}finally{setBusy(false);}});
document.getElementById('reload').addEventListener('click',()=>{const p=st.profile;if(p)openProfile(p.language_id,p.phytonym_id);});
document.getElementById('cancel-edit').addEventListener('click',()=>{if(st.dirty&&!confirm('Discard local changes?'))return;st.dirty=false;window.__cedbDirty=false;drawProfile();notice('Local changes discarded.');});
window.addEventListener('beforeunload',e=>{if(st.dirty){e.preventDefault();e.returnValue='';}});
(async function init(){if(!api){refs.setup.hidden=false;refs.setup.textContent='GitHub publishing is not yet configured. Deploy the Worker, then set its URL in admin/config.js. See admin/SETUP.md.';refs.login.disabled=true;}try{
 const manifest=await fetch(new URL('data/manifest.json',base)).then(r=>r.json());const [languages,dialects,locations,sources]=await Promise.all(['languages','dialects','locations','sources'].map(k=>fetch(new URL('data/'+manifest.collections[k],base)).then(r=>r.json())));
 Object.assign(st,{languages,dialects,locations,sources});const files=await Promise.all(manifest.phytonym_files.map(f=>fetch(new URL('data/'+f,base)).then(r=>r.json())));st.rows=files.flat();
 refreshResults();await authCheck();const params=new URLSearchParams(window.location.search);const id=params.get('id'),language=params.get('language');if(st.login&&id&&language)await openProfile(language,id);
 }catch(e){notice('Cannot load database: '+e.message);}})();
