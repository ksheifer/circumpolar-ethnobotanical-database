// Regression test: load the same app.js as the site and inspect generated UI.
// Does not need a browser or network connectivity.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const events = {};
const elements = new Map();
function el(id) { if(!elements.has(id)) elements.set(id,{id,innerHTML:'',value:'',dataset:{},classList:{add(){}},focus(){},setSelectionRange(){},scrollIntoView(){}}); return elements.get(id); }
const document = {
 documentElement:{lang:'en'},
 getElementById:el,
 querySelectorAll(){return []},
 addEventListener(name,callback){events[name]=callback},
};
const fetchMock = async url => {
 const target = path.resolve(root, url.split('?')[0]);
 if(!target.startsWith(path.resolve(root,'data')+path.sep)) throw Error('bad fetch '+url);
 return {ok:true,json:async()=>JSON.parse(fs.readFileSync(target,'utf8'))};
};
const context=vm.createContext({document,fetch:fetchMock,window:{},console, alert(){throw Error('Unexpected alert')}, Map, Set});
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context,{filename:'app.js'});
const wait = () => new Promise(resolve=>setTimeout(resolve,20));
(async()=>{
 await wait();
 assert.match(el('navigation').innerHTML,/Languages/);
 assert.match(el('main').innerHTML,/id="globalSearch"/);
 assert.doesNotMatch(el('main').innerHTML,/data-profile=/);
 events.click({target:{closest(sel){return sel==='[data-view]'?{dataset:{view:'catalog'}}:null}}});
 for(const [language,expected] of [['komi',110],['forest-yukaghir',24],['tundra-yukaghir',8],['tundra-nenets',73],['enets',3],['nganasan',2]]) {
  events.change({target:{id:'languageFilter',value:language}});
  const html=el('main').innerHTML;
  const count=(html.match(/data-profile=/g)||[]).length;
  assert.equal(count, expected,`${language}: only ${count} rows rendered; expected ${expected}`);
  assert.match(html,/\[[^\]]+\d{4}(?: \S+)?: \d+\]/,`${language}: citations not visible`);
  console.log('PASS catalog',language,count);
 }
 events.change({target:{id:'languageFilter',value:'komi'}});
 assert.match(el('main').innerHTML,/id="varietyFilter"/);
 assert.match(el('main').innerHTML,/data-variety=/);
 events.click({target:{closest(sel){return sel==='[data-view]'?{dataset:{view:'statistics'}}:null}}});
 for(const [language,count] of [['Komi',110],['Forest Yukaghir',24],['Tundra Yukaghir',8],['Tundra Nenets',73],['Enets',3],['Nganasan',2]]){
   assert.ok(el('main').innerHTML.includes(language), `missing ${language} in Statistics`);
   assert.match(el('main').innerHTML,new RegExp(`${language}<\\/td><td class="numeric">${count}<\\/td>`));
 }
 // Search across all loaded languages, including both Yukaghir datasets.
 events.click({target:{closest(sel){return sel==='[data-view]'?{dataset:{view:'home'}}:null}}});
 for(const language of ['komi','forest-yukaghir','tundra-yukaghir','tundra-nenets','enets','nganasan']) {
   const first=JSON.parse(fs.readFileSync(path.join(root,'data','phytonyms',language+'.json'),'utf8'))[0];
   const query=first.name_native_language;
   events.input({target:{id:'globalSearch',value:query,selectionStart:query.length}});
   assert.match(el('main').innerHTML,/data-profile=/,`${language}: ${query} not searchable`);
   console.log('PASS search',language,query);
 }
 // New historical Yukaghir use data must render with page-specific links.
 events.input({target:{id:'globalSearch',value:"tobo'ko-čalje",selectionStart:14}});
 assert.match(el('main').innerHTML,/data-profile=/,'historical Yukaghir form not searchable');
 const targetId='phy_forest_yukaghir_jochelson1926_001';
 events.click({target:{closest(sel){return sel==='[data-profile]'?{dataset:{profile:targetId}}:null}}});
 assert.match(el('main').innerHTML,/source-evidence/,'source links missing from traditional use fields');
 assert.match(el('main').innerHTML,/Jochelson 1926/,'Jochelson citation missing from profile');
 assert.match(el('main').innerHTML,/418/,'Jochelson printed page not shown');
 console.log('PASS ethnobotanical fields and individual source citations');
 console.log('PASS statistics, citations, Komi varieties');
})().catch(error=>{console.error(error);process.exitCode=1});
