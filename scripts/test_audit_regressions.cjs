'use strict';
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm'), assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const doc={documentElement:{},getElementById(id){return {id,innerHTML:'',classList:{add(){}},scrollIntoView(){}}},querySelectorAll(){return []},addEventListener(){}};
const ctx=vm.createContext({document:doc,window:{},console,Map,Set,fetch:()=>new Promise(()=>{})});
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),ctx);
const load=(p)=>JSON.parse(fs.readFileSync(path.join(root,'data',p),'utf8'));
const manifest=load('manifest.json');
const tables=Object.fromEntries(Object.entries(manifest.collections).map(([key,filename])=>[key,load(filename)]));
tables.phytonyms=manifest.phytonym_files.flatMap(load);
ctx.DATA=tables;
vm.runInContext('state.data=DATA; state.index=Object.fromEntries(Object.entries(ID_FIELDS).map(([type,key])=>[type,new Map(state.data[type].map(item=>[item[key],item]))])); state.lang="en"',ctx,{filename:'bootstrap'});

const run=expr=>vm.runInContext(expr,ctx);
const counts=run('Object.fromEntries(state.data.languages.map(l=>[l.language_id,state.data.phytonyms.filter(p=>p.language_id===l.language_id).length]))');
assert.equal(counts.enets,3);assert.equal(counts.nganasan,2);assert.equal(counts['forest-yukaghir'],24);assert.equal(counts['tundra-yukaghir'],8);
for(const [lang,target] of [['forest-yukaghir','Нелемное'],['tundra-yukaghir','Андрюшкино']]){
 const res=run(`state.data.phytonyms.filter(p=>p.language_id==='${lang}').map(p=>locatableEntries(p))`);
 assert.equal(res.length,counts[lang]);
 assert.ok(res.every(entries=>entries.some(e=>e.kind==='community'&&tables.locations.find(l=>l.location_id===e.location_id)?.name_ru===target)),lang+' mapping');
}
for(const lang of ['enets','nganasan']){
 const html=run(`state.selectedLanguage='${lang}'; renderCatalog()`);
 assert.equal((html.match(/data-profile=/g)||[]).length,counts[lang]);
}
const enetsForest=run('state.selectedLanguage="enets";state.selectedVariety="enets-forest";renderCatalog()');
assert.equal((enetsForest.match(/data-profile=/g)||[]).length,2);
const enetsTundra=run('state.selectedVariety="enets-tundra";renderCatalog()');
assert.equal((enetsTundra.match(/data-profile=/g)||[]).length,1);
const ch=run('state.data.phytonyms.find(p=>p.language_id==="chukchi")');
assert.match(run('profile(state.data.phytonyms.find(p=>p.language_id==="chukchi"))'), /data-source-language="chukchi"/);
assert.match(run('state.lang="ru";renderSources()'), /https:\/\/sibjournal\.philology\.nsc\.ru\/sites\/default\/files\/2026-09\/12_85\.pdf/);
assert.doesNotMatch(fs.readFileSync(path.join(root,'index.html'),'utf8'), /leaflet\.css[^]*leaflet\.css/);
// Volumes belong in short citations only for Sleptsov and Jochelson multivolume books.
assert.equal(run('citeSource("src_laptander_2024_nenets_lichen","19")'),'[Laptander et al. 2024: 19]');
assert.equal(run('citeSource("src_janhunen_2025_samoyedic","168")'),'[Janhunen 2025: 168]');
assert.equal(run('citeSource("src_kurilova_2026_wadul","2261")'),'[Kurilova 2026: 2261]');
assert.equal(run('citeSource("src_sakha_dictionary_vol_01","42")'),'[Sleptsov 2004 I: 42]');
assert.equal(run('citeSource("src_jochelson_yukaghir_1926_part_iii","418")'),'[Jochelson 1926 III: 418]');
assert.equal(run('citeSource("src_jochelson_yukaghir_1910_part_i","11")'),'[Jochelson 1910 I: 11]');
for(const source of tables.sources){
 if(source.publication_type==='journal_article')assert.doesNotMatch(run(`citeSource(${JSON.stringify(source.source_id)},'1')`), /\s(?:10|19|45|61)\s*:/);
}
assert.equal(tables.sources.find(s=>s.source_id==='src_rakin_1989').authors,'Ракин Анатолий Николаевич');
assert.equal(tables.sources.find(s=>s.source_id==='src_adaev_2023_nenets_food').authors,'Адаев Владимир Николаевич');
const num=tables.phytonyms.length;assert.equal(num,981);
console.log('PASS audit regression: 981 records, ENETS / NGANASAN / Yukaghir counts, mapping, bilingual resources, variant filter, source navigation');
