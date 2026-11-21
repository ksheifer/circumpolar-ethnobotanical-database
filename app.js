'use strict';
// Read-only client. All published data come from data/*.json.
const LABELS = {
 en:{statistics:'Statistics',total:'Total',phytonymCount:'Phytonyms',home:'Search',searchPlaceholder:'across all records',resultCount:'Results',overview:'Overview',records:'Vegetation',catalog:'Languages',map:'Map',locations:'Locations',dialects:'Language varieties',contributors:'Contributors',sources:'Resources',about:'About',search:'Search',all:'All languages',language:'Language',russian_gloss:'Russian gloss',english_gloss:'English gloss',dialect:'Language variety',locality:'Locality',name:'Phytonym',ipa:'IPA',taxon:'Scientific name',family:'Taxonomic family',source:'Source',page:'Source page(s)',speaker:'Speaker',collector:'Collector',year:'Recording year',first:'First name',last:'Last name',patronymic:'Patronymic name',clan:'Clan',gender:'Gender',botanical:'Botanical classification',linguistics:'Linguistic information',ecology:'Ecological data',knowledge:'Indigenous Knowledge',evidence:'Documentation',folklore:'Folklore',description:'Description',cognate:'Cognate / etymology',names_other_varieties:'Names in other varieties',linguistic_comment:'Linguistic comment',conservation_invasiveness_status:'Conservation / invasiveness status',habitat:'Habitat',plant_community:'Plant community',phenology:'Phenology',toxicity:'Toxicity',medicinal_use:'Medicinal use',domestic_use:'Domestic use',spiritual_use:'Spiritual use',human_consumption:'Human consumption',animal_consumption:'Animal consumption',recordDate:'Recording date',source_use_categories:'Uses in source',source_one_generation_uses:'Uses reported for one generation',maritime_frequency_dots:'Maritime use-frequency dots',tundra_frequency_dots:'Tundra use-frequency dots',name_number:'Form (number)',saveExcel:'Save to Excel',nothing:'No records available.',places:'Places',published:'Published records',totalPages:'Total pages',publisher:'Publisher',title:'Title',authors:'Authors',type:'Type',editionYear:'Year',country:'Country',region:'Region',district:'District',count:'Records',notes:'Notes',taxa:'Taxa',languages:'Languages',locCount:'Localities',descriptionIntro:'Indigenous plant names, linguistic evidence, ethnobotanical knowledge, and geographic and bibliographic records.',aboutBody:'The database is a bilingual read-only research resource. Published data are maintained as JSON files in the repository.',noMap:'No coordinates available.',glossMap:'Lexical map',glossMapEntries:'Corresponding names',noGeolocations:'No attested or dialect-linked coordinates for these forms.',directPlace:'Source-linked locality',dialectPlace:'Variety reference locality',referencePlace:'Language community reference point',noExcel:'Excel export is unavailable. Please check the spreadsheet library connection.'},
 ru:{statistics:'Статистика',total:'Всего',phytonymCount:'Фитонимов',home:'Поиск',searchPlaceholder:'по всем записям',resultCount:'Результатов',overview:'Обзор',records:'Растительность',catalog:'Языки',map:'Карта',locations:'Населённые пункты',dialects:'Языковые варианты',contributors:'Информанты',sources:'Источники',about:'О проекте',search:'Поиск',all:'Все языки',language:'Язык',russian_gloss:'Русское толкование',english_gloss:'Английское толкование',dialect:'Языковой вариант',locality:'Населённый пункт',name:'Фитоним',ipa:'МФА',taxon:'Научное название',family:'Ботаническое семейство',source:'Источник',page:'Страницы источника',speaker:'Информант',collector:'Собиратель',year:'Год записи',first:'Имя',last:'Фамилия',patronymic:'Отчество',clan:'Род',gender:'Пол',botanical:'Ботаническая классификация',linguistics:'Лингвистические сведения',ecology:'Экологические данные',knowledge:'Знания коренных народов',evidence:'Сведения о фиксации',folklore:'Фольклор',description:'Описание',cognate:'Когнаты / этимология',names_other_varieties:'Названия в других вариантах',linguistic_comment:'Лингвистический комментарий',conservation_invasiveness_status:'Охранный / инвазивный статус',habitat:'Местообитание',plant_community:'Растительное сообщество',phenology:'Фенология',toxicity:'Токсичность',medicinal_use:'Лекарственное применение',domestic_use:'Бытовое применение',spiritual_use:'Духовное использование',human_consumption:'Употребление людьми',animal_consumption:'Употребление животными',recordDate:'Дата записи',source_use_categories:'Категории использования в источнике',source_one_generation_uses:'Использование, отмеченное для одного поколения',maritime_frequency_dots:'Частота упоминаний: приморские (точки)',tundra_frequency_dots:'Частота упоминаний: тундровые (точки)',name_number:'Форма (число)',saveExcel:'Сохранить в Excel',nothing:'Записей пока нет.',places:'Населённые пункты',published:'Опубликованные записи',totalPages:'Общее число страниц',publisher:'Издательство',title:'Название',authors:'Авторы',type:'Тип',editionYear:'Год',country:'Страна',region:'Регион',district:'Район',count:'Записей',notes:'Примечания',taxa:'Таксоны',languages:'Языки',locCount:'Населённые пункты',descriptionIntro:'Названия растений, лингвистические свидетельства, знания коренных народов, географические и библиографические данные.',aboutBody:'Двуязычная исследовательская база только для чтения. Данные публикуются в JSON-файлах репозитория.',noMap:'Нет точек с координатами.',glossMap:'Лексическая карта',glossMapEntries:'Соответствующие названия',noGeolocations:'У этих названий нет координат, связанных с фиксацией или диалектом.',directPlace:'Населённый пункт, указанный в записи',dialectPlace:'Ориентир языкового варианта',referencePlace:'Ориентир языкового сообщества',noExcel:'Экспорт Excel недоступен. Проверьте загрузку библиотеки таблиц.'}
};
const state={lang:'en',view:'home',returnView:'home',selectedLanguage:'',search:'',selectedProfile:'',data:null,profileMap:null,tableSort:{home:{key:'family',direction:'asc'},catalog:{key:'name',direction:'asc'}}};
const NAMES=['home','catalog','statistics','sources'];
// Real short routes: /search, /languages, /statistics, /resources.
// Each route has a static HTML entrypoint for GitHub Pages direct navigation.
const SECTION_PATHS={home:'search',catalog:'languages',statistics:'statistics',sources:'resources'};
const PATH_SECTIONS=Object.fromEntries(Object.entries(SECTION_PATHS).map(([view,path])=>[path,view]));
const SITE_ROOT=new URL('./',document.querySelector('script[src*="app.js"]').src);
function sectionFromURL(){
 const segment=window.location.pathname.replace(/\/+$/,'').split('/').pop();
 const route=PATH_SECTIONS[segment];
 // Old links remain usable after the upgrade.
 return route||PATH_SECTIONS[new URL(window.location.href).searchParams.get('section')]||'home';
}
function sectionURL(view,hash=''){
 const url=new URL(SECTION_PATHS[view],SITE_ROOT);
 if(hash)url.hash=hash;
 return url;
}
function navigateSection(view,{replace=false,hash=''}={}){
 if(!SECTION_PATHS[view])return;
 state.view=view;
 if(view==='catalog'&&!state.selectedLanguage)state.selectedLanguage=state.data?.phytonyms[0]?.language_id||'';
 const url=sectionURL(view,hash);
 if(url.href!==window.location.href)window.history[replace?'replaceState':'pushState']({section:SECTION_PATHS[view]},'',url);
 render();
 if(hash)scrollToHash();
}
function scrollToHash(){
 const anchor=decodeURIComponent(window.location.hash.slice(1));
 if(!anchor)return;
 const target=document.getElementById(anchor);
 if(target)target.scrollIntoView({block:'start'});
}

const tr=k=>LABELS[state.lang][k]||k;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const filled=v=>v!==null&&v!==undefined&&v!==''&&(!Array.isArray(v)||v.length>0)&&(!(typeof v==='object'&&!Array.isArray(v))||Object.values(v).some(Boolean));
const ID_FIELDS={languages:'language_id',dialects:'dialect_id',locations:'location_id',sources:'source_id',contributors:'contributor_id',taxa:'taxon_id'};
const by=(type,id)=>id==null?undefined:state.index?.[type]?.get(id);
const langName=id=>{const l=by('languages',id);return l?.['name_'+state.lang]||l?.name_en||id||''};
const locName=id=>{const l=by('locations',id);return l?.['name_'+state.lang]||''};
// Display the expanded dialect name when known; otherwise retain the source abbreviation.
// The abbreviation remains stored in dialects.json for source fidelity and searching.
const dialName=id=>{const d=by('dialects',id);return d?.['name_'+state.lang]?.trim()||d?.source_abbreviation?.trim()||''};
// Suppress umbrella Selkup varieties only when a more specific variety is recorded.
const normalizedDialectIds=a=>{
 const ids=[...new Set((a?.dialect_ids||[]).filter(Boolean))];
 return ids.filter(id=>!(id==='dia_group_southern_selkup'&&ids.some(other=>other.startsWith('dia_southern-selkup_')))
   &&!(id==='dia_group_northern_selkup'&&ids.some(other=>other.startsWith('dia_northern-selkup_'))));
};
const attDialectLabels=a=>normalizedDialectIds(a).map(dialName).filter(Boolean).join(', ');
const attDialectFull=a=>normalizedDialectIds(a).map(dialName).filter(Boolean).join('; ');
// Short references: [Author Year: Page], with volume only for explicitly multivolume books.
// Without a page (e.g., bibliographies), do not add a colon.
const romanNumeral=n=>{let x=Number(n);if(!Number.isInteger(x)||x<1||x>3999)return String(n);let result='';for(const [value,symbol] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]){while(x>=value){result+=symbol;x-=value;}}return result;};
const displayVolume=source=>source?.source_id?.startsWith('src_sakha_dictionary_vol_')?romanNumeral(source.volume):source?.volume;
const citationVolume=source=>source?.source_id?.startsWith('src_sakha_dictionary_vol_')||source?.source_id?.startsWith('src_jochelson_yukaghir_')?displayVolume(source):'';
const citeSource=(id,pages)=>{
 const s=by('sources',id);
 if(!s)return '';
 const parts=[s.citation_key||s.authors||s.editors||s.source_id,s.year,citationVolume(s)]
  .filter(v=>v!==null&&v!==undefined&&String(v).trim()!=='');
 const pageText=pages===null||pages===undefined?'':String(pages).trim();
 return '['+parts.join(' ')+(pageText?': '+pageText:'')+']';
};
const attestationOverview=p=>{
 const attestations=p.attestations||[];
 const unique=values=>[...new Set(values.filter(Boolean))].join('; ');
 return {
  citations:unique(attestations.map(a=>citeSource(a.source_id,a.source_pages))),
  localities:unique(attestations.map(a=>locName(a.location_id))),
  dialects:unique(normalizedDialectIds({dialect_ids:[p.dialect_id,...attestations.flatMap(a=>[a.dialect_id,...(a.dialect_ids||[])])]}).map(dialName))
 };
};
// English glosses are the only lexical key for cross-language comparison.
const normalizeGloss=s=>String(s||'').normalize('NFC').toLocaleLowerCase('en').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
const glossTokens=s=>{const base=normalizeGloss(s);return base?[...new Set([base,...base.split(/[;,/]/).map(part=>normalizeGloss(part)).filter(Boolean)])]:[];};
const glossMatches=(a,b)=>{const B=new Set(glossTokens(b));return glossTokens(a).some(token=>B.has(token));};
const relatedProfilesByGloss=profile=>!profile?.english_gloss?[]:state.data.phytonyms.filter(candidate=>candidate.english_gloss&&glossMatches(profile.english_gloss,candidate.english_gloss));
function locatableEntries(candidate){
 const entries=[];
 const emit=(locationId,kind)=>{
  const location=by('locations',locationId);
  if(!location||location.visibility==='confidential'||!Number.isFinite(location.latitude)||!Number.isFinite(location.longitude))return;
  const dialectIds=[candidate.dialect_id,...(candidate.attestations||[]).flatMap(a=>[a.dialect_id,...(a.dialect_ids||[])])].filter(Boolean);
  const dialect=[...new Set(normalizedDialectIds({dialect_ids:dialectIds}).map(dialName).filter(Boolean))].join('; ');
  const source=[...new Set((candidate.attestations||[]).map(a=>citeSource(a.source_id,a.source_pages)).filter(Boolean))].join('; ');
  entries.push({location_id:locationId,locality:locName(locationId),latitude:location.latitude,longitude:location.longitude,kind,
   phytonym_id:candidate.phytonym_id,name:candidate.name_native_language,english_gloss:candidate.english_gloss||'',language:langName(candidate.language_id),dialect,source});
 };
 const explicit=new Set((candidate.attestations||[]).map(a=>a.location_id).filter(Boolean));
 for(const id of explicit)emit(id,'attested');
 // A dialect's location_ids are geographic reference points, NOT evidence of individual word use.
 const dialectIds=[candidate.dialect_id,...(candidate.attestations||[]).flatMap(a=>[a.dialect_id,...(a.dialect_ids||[])])].filter(Boolean);
 const reference=new Set(dialectIds.flatMap(id=>by('dialects',id)?.location_ids||[]));
 for(const id of reference)if(!explicit.has(id))emit(id,'dialect');
 // When no verified locality or variety anchor exists, show the language community reference point.
 if(entries.length===0&&candidate.reference_location_id)emit(candidate.reference_location_id,'community');
 return entries;
}
const relatedGlossMapEntries=profile=>(profile?.english_gloss?relatedProfilesByGloss(profile):[profile]).flatMap(locatableEntries);
function pair(key,value){return filled(value)?`<tr><th scope="row">${esc(tr(key))}</th><td>${esc(Array.isArray(value)?value.join('; '):typeof value==='object'?Object.entries(value).filter(([,v])=>filled(v)).map(([k,v])=>`${k}: ${v}`).join('; '):value)}</td></tr>`:''}
function section(title,rows){return rows.some(Boolean)?`<section class="profile-section"><h3>${esc(tr(title))}</h3><table class="detail-table"><tbody>${rows.join('')}</tbody></table></section>`:''}
function sourcedDetailRows(profile,group){
 const values=profile[group]||{}, translated=profile[group+'_en']||{}, refs=profile.field_sources?.[group]||{};
 return Object.entries(values).filter(([,v])=>filled(v)).map(([key,value])=>{
  const shown=(state.lang==='en'&&filled(translated[key]))?translated[key]:value;
  const cites=(refs[key]||[]).map(a=>`<button type="button" class="plain-link source-evidence" data-source="${esc(a.source_id)}" data-source-language="${esc(profile.language_id)}">${esc(citeSource(a.source_id,a.source_pages))}</button>`).join('; ');
  return `<tr><th scope="row">${esc(tr(key))}</th><td>${esc(shown)}${cites?` <span class="evidence-citations">${cites}</span>`:''}</td></tr>`;
 });
}

const alphabeticalPhytonyms=(a,b)=>a.name_native_language.localeCompare(b.name_native_language,'ru',{sensitivity:'base'})||a.phytonym_id.localeCompare(b.phytonym_id);
const taxonomy=(a,b)=>{const ta=by('taxa',a.taxon_id)||{},tb=by('taxa',b.taxon_id)||{};return [ta.botanical_family||'\uffff',ta.scientific_name||'\uffff',a.name_native_language].join('\0').localeCompare([tb.botanical_family||'\uffff',tb.scientific_name||'\uffff',b.name_native_language].join('\0'),'ru')};
function profile(p){const tax=by('taxa',p.taxon_id)||{};
 const main=section('linguistics',[pair('name',p.name_native_language),pair('ipa',p.ipa),pair('language',langName(p.language_id)),pair('dialect',dialName(p.dialect_id)),...['names_other_varieties','cognate','russian_gloss','english_gloss','linguistic_comment'].map(k=>pair(k,p[k]))]);
 const bot=section('botanical',[pair('taxon',tax.scientific_name),pair('family',tax.botanical_family),pair('conservation_invasiveness_status',tax.conservation_invasiveness_status)]);
 const eco=section('ecology',sourcedDetailRows(p,'ecological_data'));
 const know=section('knowledge',sourcedDetailRows(p,'indigenous_knowledge'));
 const attest=(p.attestations||[]).filter(a=>Object.entries(a).some(([k,v])=>!['location_id','reference_location_id','attestation_id','id'].includes(k)&&filled(v))).map(a=>{const c=by('contributors',a.contributor_id)||{};return section('evidence',[pair('locality',locName(a.location_id)),pair('dialect',attDialectFull(a)||dialName(a.dialect_id)),a.source_id?`<tr><th scope="row">${esc(tr('source'))}</th><td><button class="plain-link" data-source="${esc(a.source_id)}" data-source-language="${esc(p.language_id)}">${esc(citeSource(a.source_id,a.source_pages))}</button></td></tr>`:'',pair('last',c.last_name),pair('first',c.first_name),pair('patronymic',c.patronymic_name),pair('clan',c.clan),pair('gender',c.gender),pair('collector',a.collector),pair('year',a.recording_year),pair('recordDate',a.record_date),pair('name_number',a.name_number),pair('source_use_categories',a.source_use_categories),pair('source_one_generation_uses',a.source_one_generation_uses),pair('maritime_frequency_dots',a.maritime_frequency_dots),pair('tundra_frequency_dots',a.tundra_frequency_dots),pair('folklore',a.folklore)])}).join('');
 const related=relatedProfilesByGloss(p);
 const entries=related.flatMap(locatableEntries);
 state.currentProfileEntries=entries;
 const ownEntries=locatableEntries(p);
 const ownPlaces=[...new Map(ownEntries.map(e=>[e.location_id,e])).values()];
 const ownPlaceLinks=ownPlaces.map(e=>`<button type="button" class="plain-link map-place-link" data-map-location="${esc(e.location_id)}">${esc(e.locality)}</button> <span class="muted">(${esc(tr(e.kind==='attested'?'directPlace':e.kind==='community'?'referencePlace':'dialectPlace'))})</span>`).join('; ');
 const forms=related.map(candidate=>{
  const dialects=[candidate.dialect_id,...(candidate.attestations||[]).flatMap(a=>[a.dialect_id,...(a.dialect_ids||[])])].filter(Boolean);
  const dialectNames=[...new Set(dialects.map(dialName).filter(Boolean))];
  return `<li><button type="button" class="plain-link related-name" data-profile="${esc(candidate.phytonym_id)}">${esc(candidate.name_native_language)}</button> — ${esc(langName(candidate.language_id))}${dialectNames.length?`; ${esc(dialectNames.join('; '))}`:''}</li>`;
 }).join('');
 const mapSection=(p.english_gloss||locatableEntries(p).length)?`<section class="profile-section"><h3>${esc(tr('glossMap'))}</h3>${ownPlaceLinks?`<p class="map-own-places"><strong>${esc(state.lang==='ru'?'Географические точки выбранного названия':'Locations for this phytonym')}:</strong> ${ownPlaceLinks}</p>`:''}<div id="profile-map" class="map profile-map" role="img" aria-label="${esc(tr('glossMap'))}"></div>${!entries.length?`<p class="muted">${esc(tr('noGeolocations'))}</p>`:''}<div class="profile-related"><h3>${esc(tr('glossMapEntries'))}: ${related.length}</h3><ul>${forms}</ul></div></section>`:'';

 return `<article class="profile" id="profile-${esc(p.phytonym_id)}"><h2>${esc(p.name_native_language)}</h2><p class="muted">${esc(langName(p.language_id))}${tax.scientific_name?' · '+esc(tax.scientific_name):''}</p>${main}${bot}${eco}${know}${attest}${mapSection}</article>`;
}
// Sort column values, not their rendered HTML. Missing values always follow filled cells.
const sortCellValue=(p,key)=>{
 const tax=by('taxa',p.taxon_id)||{};
 switch(key){
  case 'name':return p.name_native_language;
  case 'language':return langName(p.language_id);
  case 'taxon':return tax.scientific_name;
  case 'family':return tax.botanical_family;
  case 'russian_gloss':return p.russian_gloss;
  case 'english_gloss':return p.english_gloss;
  case 'dialect':return attestationOverview(p).dialects;
  case 'locality':return attestationOverview(p).localities;
  case 'source':return attestationOverview(p).citations;
  default:return '';
 }
};
function sortedPlants(plants,view){
 const config=state.tableSort[view],collator=new Intl.Collator(state.lang==='ru'?'ru':'en',{sensitivity:'base',numeric:true});
 if(!config)return [...plants];
 return [...plants].sort((a,b)=>{
  const aa=String(sortCellValue(a,config.key)??'').trim(),bb=String(sortCellValue(b,config.key)??'').trim();
  const missingA=!aa,missingB=!bb;
  if(missingA!==missingB)return missingA?1:-1;
  const comparison=collator.compare(aa,bb);
  return (config.direction==='desc'?-comparison:comparison)||alphabeticalPhytonyms(a,b);
 });
}
function table(headers,rows,view){
 const sort=state.tableSort[view];
 return `<div class="table-wrap"><table class="index sortable-table"><thead><tr>${headers.map(h=>{
  const active=sort?.key===h,dir=active?sort.direction:null;
  return `<th scope="col" ${dir?`aria-sort="${dir==='asc'?'ascending':'descending'}"`:''}><button type="button" class="sort-header" data-sort-view="${esc(view)}" data-sort-key="${esc(h)}" aria-label="${esc(tr(h))}: ${esc(state.lang==='ru'?'сортировать':'sort')}" title="${esc(state.lang==='ru'?'Сортировать по столбцу':'Sort by column')}">${esc(tr(h))}<span class="sort-indicator" aria-hidden="true">${active?(dir==='asc'?'▲':'▼'):'↕'}</span></button></th>`;
 }).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}
function languageSelect(id){return `<select id="${id}" aria-label="${esc(tr('language'))}"><option value="">${esc(tr('all'))}</option>${state.data.languages.map(l=>`<option value="${esc(l.language_id)}" ${state.selectedLanguage===l.language_id?'selected':''}>${esc(langName(l.language_id))}</option>`).join('')}</select>`}
function title(view){return `<h1>${esc(tr(view))}</h1>`}
function renderProfile(){const p=state.data.phytonyms.find(x=>x.phytonym_id===state.selectedProfile);return `<button type="button" id="backToResults" class="plain-link">← ${esc(tr(state.returnView))}</button>`+(p?profile(p):`<p>${esc(tr('nothing'))}</p>`)}
function phytonymRow(p,includeLanguage=false){
 const tax=by('taxa',p.taxon_id)||{},info=attestationOverview(p);
 return `<tr><td><button class="plain-link" data-profile="${esc(p.phytonym_id)}">${esc(p.name_native_language)}</button></td>${includeLanguage?`<td>${esc(langName(p.language_id))}</td>`:''}<td><i>${esc(tax.scientific_name||'—')}</i></td><td>${esc(tax.botanical_family||'—')}</td><td>${esc(p.russian_gloss||'—')}</td><td>${esc(p.english_gloss||'—')}</td><td>${esc(info.dialects||'—')}</td><td>${esc(info.localities||'—')}</td><td>${esc(info.citations||'—')}</td></tr>`;
}
const searchNormalize=s=>String(s??'').normalize('NFC').toLocaleLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ').trim();
function searchIndexText(p){
 const tax=by('taxa',p.taxon_id)||{};
 const language=by('languages',p.language_id)||{};
 const a=p.attestations||[];
 const dialects=[p.dialect_id,...a.flatMap(item=>[item.dialect_id,...(item.dialect_ids||[])])].filter(Boolean).map(id=>by('dialects',id)).filter(Boolean);
 const locations=a.map(item=>by('locations',item.location_id)).filter(Boolean);
 const sources=a.map(item=>by('sources',item.source_id)).filter(Boolean);
 const searchable=[p.name_native_language,p.names_other_varieties,p.ipa,p.source_lemma,p.source_transcription,p.russian_gloss,p.english_gloss,p.linguistic_comment,p.cognate,...Object.values(p.ecological_data||{}),...Object.values(p.indigenous_knowledge||{}),...Object.values(p.ecological_data_en||{}),...Object.values(p.indigenous_knowledge_en||{}),tax.scientific_name,tax.botanical_family,tax.description,language.name_en,language.name_ru,language.language_id,...dialects.flatMap(d=>[d.name_ru,d.name_en,d.source_abbreviation]),...locations.flatMap(l=>[l.name_ru,l.name_en,l.locality]),...sources.flatMap(src=>[src.citation_key,src.title,src.authors,src.year]),...a.map(item=>item.source_pages)];
 return searchNormalize(searchable.flatMap(value=>Array.isArray(value)?value:[value]).filter(value=>typeof value==='string'||typeof value==='number').join(' '));
}
function renderHome(){
 const tokens=searchNormalize(state.search).split(' ').filter(Boolean);
 const toolbar=`<div class="search-toolbar"><label for="globalSearch">${esc(tr('search'))}</label><input id="globalSearch" type="search" autocomplete="off" spellcheck="false" value="${esc(state.search)}" placeholder="${esc(tr('searchPlaceholder'))}"></div>`;
 // Nothing is published to the results area before the visitor enters a query.
 if(!tokens.length)return title('home')+toolbar;
 const plants=sortedPlants(state.data.phytonyms.filter(p=>tokens.every(token=>state.searchIndex.get(p.phytonym_id).includes(token))),'home');
 return title('home')+toolbar+`<p class="count" id="searchCount" aria-live="polite">${esc(tr('resultCount'))}: ${plants.length}</p>`+(plants.length?table(['name','language','taxon','family','russian_gloss','english_gloss','dialect','locality','source'],plants.map(p=>phytonymRow(p,true)),'home'):`<p class="empty">${esc(tr('nothing'))}</p>`);
}
function renderStatistics(){
 const counts=new Map(state.data.languages.map(lang=>[lang.language_id,0]));
 for(const record of state.data.phytonyms)counts.set(record.language_id,(counts.get(record.language_id)||0)+1);
 const languages=[...state.data.languages].sort((a,b)=>(a.west_east_order||0)-(b.west_east_order||0));
 const rows=languages.map(lang=>`<tr><td><a class="plain-link" href="${esc(sectionURL('catalog').pathname+'?language='+encodeURIComponent(lang.language_id))}" data-stat-language="${esc(lang.language_id)}">${esc(langName(lang.language_id))}</a></td><td class="numeric">${counts.get(lang.language_id)||0}</td></tr>`).join('');
 const total=state.data.phytonyms.length;
 return title('statistics')+`<div class="table-wrap"><table class="index statistics-table"><thead><tr><th scope="col">${esc(tr('language'))}</th><th scope="col" class="numeric">${esc(tr('phytonymCount'))}</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row">${esc(tr('total'))}</th><td class="numeric">${total}</td></tr></tfoot></table></div>`;
}
function renderCatalog(){
 const sel=state.selectedLanguage;
 const plants=sortedPlants(state.data.phytonyms.filter(p=>p.language_id===sel),'catalog');
 return title('catalog')+`<div class="toolbar">${languageSelect('languageFilter')}<span class="count">${plants.length}</span>${sel?`<button id="excel" type="button" ${plants.length?'':'disabled'}>${esc(tr('saveExcel'))}</button>`:''}</div>`+(plants.length?table(['name','taxon','family','russian_gloss','english_gloss','dialect','locality','source'],plants.map(p=>phytonymRow(p)),'catalog'):'');
}

// Resources use their own complete, consistently capitalized bilingual labels.
const SOURCE_FIELD_LABELS={
 en:{authors:'Authors',editors:'Editors',title:'Title',subtitle:'Subtitle',type:'Type',publisher:'Publisher',publication_place:'Publication place',editionYear:'Year',totalPages:'Total pages',journal:'Journal',volume:'Volume',issue:'Issue',page_range:'Page range',doi:'DOI',isbn:'ISBN',url:'URL',amnh_url:'AMNH',notes:'Notes'},
 ru:{authors:'Авторы',editors:'Редакторы',title:'Название',subtitle:'Подзаголовок',type:'Тип',publisher:'Издательство',publication_place:'Место издания',editionYear:'Год',totalPages:'Общее число страниц',journal:'Журнал',volume:'Том',issue:'Выпуск',page_range:'Диапазон страниц',doi:'DOI',isbn:'ISBN',url:'URL',amnh_url:'AMNH',notes:'Примечания'}
};
const SOURCE_TYPES={
 en:{dictionary:'Dictionary',book:'Book',journal_article:'Journal article',report:'Documentation'},
 ru:{dictionary:'Словарь',book:'Книга',journal_article:'Научная статья',report:'Документация'}
};
function sourceFieldRow(key,value,source){
 if(!filled(value))return '';
 const label=SOURCE_FIELD_LABELS[state.lang][key]||key.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
 const display=key==='type'?(SOURCE_TYPES[state.lang][value]||String(value).replaceAll('_',' ').replace(/^./,c=>c.toUpperCase())):value;
 if(key==='url'||key==='amnh_url'){
  const url=String(value).trim();
  if(!/^https:\/\/[^\s<>"']+$/i.test(url))return '';
  const linkText=source?.['url_label_'+state.lang]||url;
  return `<tr><th scope="row">${esc(label)}</th><td><a class="resource-url" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(linkText)}</a></td></tr>`;
 }
 return `<tr><th scope="row">${esc(label)}</th><td>${esc(display)}</td></tr>`;
}
function renderSources(){
 const groups=[...state.data.languages].sort((a,b)=>a.west_east_order-b.west_east_order).map(language=>({language,sources:state.data.sources.filter(source=>(source.language_ids||[]).includes(language.language_id)).sort((a,b)=>(Number(a.year)||0)-(Number(b.year)||0)||String(a.volume||'').localeCompare(String(b.volume||''),undefined,{numeric:true})||String(a.title||'').localeCompare(String(b.title||'')))}));
 const fields=source=>Object.entries({authors:source.authors,editors:source.editors,title:source.title,subtitle:source.source_id.startsWith('src_sakha_dictionary_vol_')?String(source.subtitle||'').replace(/(Том\s+)\d+/,(_,prefix)=>prefix+romanNumeral(source.volume)):source.subtitle,type:source.publication_type,publisher:source.publisher,publication_place:source.publication_place,editionYear:source.year,totalPages:source.total_pages,journal:source.journal,volume:displayVolume(source),issue:source.issue,page_range:source.page_range,doi:source.doi,isbn:source.isbn,url:source.url,amnh_url:source.amnh_url,notes:source.source_id==='src_afanasyev_voronkin_alekseev_1976'?(source['notes_'+state.lang]||source.notes):null}).map(([key,value])=>sourceFieldRow(key,value,source)).filter(Boolean).join('');
 const contents=`<nav class="resource-contents" aria-label="${esc(state.lang==='ru'?'Языки источников':'Resource languages')}">${groups.map(({language})=>`<a href="#${esc(language.language_id)}">${esc(langName(language.language_id))}</a>`).join('')}</nav>`;
 const sections=groups.map(({language,sources})=>`<section class="resource-group" id="${esc(language.language_id)}"><h2>${esc(langName(language.language_id))}</h2>${sources.length?sources.map(source=>`<article class="resource-entry" id="source-${esc(language.language_id)}-${esc(source.source_id)}"><div class="resource-citation">${esc(citeSource(source.source_id))}</div><table class="detail-table"><tbody>${fields(source)}</tbody></table></article>`).join(''):`<p class="resource-empty">${esc(state.lang==='ru'?'Источники пока не добавлены.':'No sources added yet.')}</p>`}</section>`).join('');
 return title('sources')+(groups.length?contents+sections:`<p>${esc(tr('nothing'))}</p>`);
}
let leafletFallbackRequested=false;
function ensureLeaflet(){
 if(window.L||leafletFallbackRequested)return;
 leafletFallbackRequested=true;
 const css=document.createElement('link');css.rel='stylesheet';css.href='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(css);
 const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
 script.onload=()=>{if(window.L&&state.data&&state.view==='profile')render();};
 script.onerror=()=>console.warn('Leaflet unavailable; geographic coordinate map remains visible.');
 document.head.appendChild(script);
}
function groupedMapEntries(entries){
 const grouped=new Map();
 for(const item of entries){const key=item.location_id;const bucket=grouped.get(key)||{...item,items:[]};bucket.items.push(item);grouped.set(key,bucket);}
 return [...grouped.values()];
}
// One pin per locality, with the attested lexical forms printed on the pin.
// Gloss matching is lexical only: it never creates inferred geographic attestations.
function distinctPinForms(group){
 return [...new Map(group.items.filter(i=>i.phytonym_id&&i.name).map(i=>[i.phytonym_id,i])).values()];
}
function pinCaption(group){
 const forms=distinctPinForms(group);
 if(!forms.length)return group.locality;
 const names=[...new Set(forms.map(i=>i.name))];
 const label=names.slice(0,2).join(' · ')+(names.length>2?' +'+(names.length-2):'');
 return group.items.some(item=>item.kind==='attested')?label:'≈ '+label;
}
function relatedGlossMarkup(item){
 if(!item.english_gloss)return '';
 const related=relatedProfilesByGloss(item).filter(p=>p.phytonym_id!==item.phytonym_id&&p.language_id!==state.data.phytonyms.find(q=>q.phytonym_id===item.phytonym_id)?.language_id);
 if(!related.length)return '';
 const snippets=related.slice(0,8).map(p=>`<button type="button" class="plain-link" data-profile="${esc(p.phytonym_id)}">${esc(p.name_native_language)}</button> <small>(${esc(langName(p.language_id))})</small>`);
 return `<div class="pin-gloss-related"><button type="button" class="plain-link map-compare-gloss" data-map-gloss="${esc(item.english_gloss)}">${esc(state.lang==='ru'?'Показать на карте по глоссе':'Map matches for')} <em>${esc(item.english_gloss)}</em></button><br><small>${esc(state.lang==='ru'?'Соответствия по английской глоссе':'Matches by English gloss')}:</small> ${snippets.join('; ')}${related.length>8?` <small>+${related.length-8}</small>`:''}</div>`;
}
function pinPopup(group){
 const forms=distinctPinForms(group);
 if(!forms.length)return `<strong>${esc(group.locality)}</strong><p>${esc(tr('referencePlace'))}; ${esc(state.lang==='ru'?'не место фиксации фитонима':'not an attestation site')}</p>`;
 const list=forms.slice(0,80).map(item=>`<li><button type="button" class="plain-link" data-profile="${esc(item.phytonym_id)}"><strong>${esc(item.name)}</strong></button> — ${esc(item.language)}${item.english_gloss?` · <em>${esc(item.english_gloss)}</em>`:''}${item.dialect?`; ${esc(item.dialect)}`:''}<div><small>${esc(tr(item.kind==='attested'?'directPlace':item.kind==='community'?'referencePlace':'dialectPlace'))}</small></div>${item.source?`<div><small>${esc(item.source)}</small></div>`:''}${relatedGlossMarkup(item)}</li>`).join('');
 return `<strong>${esc(group.locality)}</strong><ul class="map-popup-list">${list}</ul>${forms.length>80?`<small>+${forms.length-80}</small>`:''}`;
}
function fallbackCoordinateMap(target,groups,selectedIds){
 // SVG renders directly without network dependencies, so geographic pins never disappear on CDN failure.
 target.classList.add('coordinate-map');
 if(!groups.length){target.textContent=tr('noGeolocations');target.classList.add('map-unavailable');return;}
 const west=Math.min(...groups.map(x=>x.longitude)),east=Math.max(...groups.map(x=>x.longitude));
 const south=Math.min(...groups.map(x=>x.latitude)),north=Math.max(...groups.map(x=>x.latitude));
 const dx=Math.max(3,east-west),dy=Math.max(2,north-south),x0=west-(dx-(east-west))/2-dx*.12,y0=south-(dy-(north-south))/2-dy*.12;
 const xSpan=dx*1.24,ySpan=dy*1.24;
 const xp=x=>45+810*(x-x0)/xSpan,yp=y=>330-280*(y-y0)/ySpan;
 const grid=[0,1,2,3,4].map(i=>`<line x1="${45+i*202.5}" y1="40" x2="${45+i*202.5}" y2="330"/><line x1="45" y1="${40+i*72.5}" x2="855" y2="${40+i*72.5}"/>`).join('');
 const points=groups.map(g=>{
  const selected=selectedIds.has(g.location_id),x=xp(g.longitude),y=yp(g.latitude);
  const caption=pinCaption(g),short=caption.length>30?caption.slice(0,29)+'…':caption;
  const labelY=y<85?y+26:y-15;
  const lineWidth=Math.min(260,Math.max(70,short.length*7+14));
  const rectX=Math.max(7,Math.min(895-lineWidth,x-lineWidth/2));
  return `<g tabindex="0" role="button" data-coordinate-location="${esc(g.location_id)}" aria-label="${esc(caption)}: ${esc(g.locality)}"><path d="M ${x} ${y+10} l -9 -14 a 12 12 0 1 1 18 0 Z" fill="${selected?'#0a6ba8':'#996d2e'}" stroke="white" stroke-width="1.5"/><circle cx="${x}" cy="${y-5}" r="3.2" fill="white"/><rect x="${rectX}" y="${labelY-12}" width="${lineWidth}" height="19" rx="5" fill="white" stroke="#9eacb0"/><text x="${rectX+lineWidth/2}" y="${labelY+1}" text-anchor="middle" font-size="12" fill="#163d55">${esc(short)}</text><title>${esc(caption)} · ${esc(g.locality)}</title></g>`;
 }).join('');
 target.innerHTML=`<svg viewBox="0 0 900 375" role="img" aria-label="${esc(state.lang==='ru'?'Географические координаты':'Geographic coordinates')}" preserveAspectRatio="xMidYMid meet"><rect x="45" y="40" width="810" height="290" fill="#f4f7f7" stroke="#9aabb1"/><g stroke="#d6dfe3" stroke-width="1">${grid}</g>${points}<text x="45" y="25" font-size="13" fill="#555">${north.toFixed(2)}° N</text><text x="45" y="352" font-size="13" fill="#555">${south.toFixed(2)}° N</text><text x="855" y="365" font-size="13" text-anchor="end" fill="#555">${east.toFixed(2)}° E</text><text x="45" y="365" font-size="13" fill="#555">${west.toFixed(2)}° E</text></svg><p class="map-fallback-notice">${esc(state.lang==='ru'?'Координатная схема (подложка карты недоступна). Выберите точку для просмотра названия и слов.':'Coordinate plot (base map unavailable). Select a point to see its name and words.')}</p><div class="map-coordinate-details" aria-live="polite"></div>`;
 const show=(id)=>{const g=groups.find(x=>x.location_id===id);if(!g)return;target.querySelector('.map-coordinate-details').innerHTML=pinPopup(g)+'<p><small>'+g.latitude.toFixed(5)+', '+g.longitude.toFixed(5)+'</small></p>';};
 target.querySelectorAll('[data-coordinate-location]').forEach(el=>{el.addEventListener('click',()=>show(el.getAttribute('data-coordinate-location')));el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();show(el.getAttribute('data-coordinate-location'));}})});
 show(groups.find(g=>selectedIds.has(g.location_id))?.location_id||groups[0].location_id);
}
function leafletStylesReady(){
 if(!window.L)return false;
 const sample=document.createElement('div');
 sample.className='leaflet-pane';
 sample.style.cssText='visibility:hidden;pointer-events:none';
 document.body.appendChild(sample);
 const ready=getComputedStyle(sample).position==='absolute';
 sample.remove();
 return ready;
}
function drawMap(target,entries,selectedIds=new Set()){
 if(!target)return;
 const groups=groupedMapEntries(entries);
 if(!groups.length){target.textContent=tr('noGeolocations');target.classList.add('map-unavailable');return;}
 if(!window.L||!leafletStylesReady()){target.classList.add('coordinate-map');fallbackCoordinateMap(target,groups,selectedIds);if(!window.L)ensureLeaflet();return;}
 target.classList.remove('coordinate-map');
 const map=L.map(target);
 if(state.view==='profile')state.profileMap=map;
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'© OpenStreetMap contributors'}).addTo(map);
 const markers=[];
 for(const group of groups){
  const selected=selectedIds.has(group.location_id);
  const caption=pinCaption(group);
  const selectedClass=selected?' pin-tooltip-selected':'';
  const marker=L.marker([group.latitude,group.longitude],{icon:L.divIcon({className:'phytonym-pin-icon',html:'<span class="phytonym-pin-dot"></span>',iconSize:[22,32],iconAnchor:[11,30]})})
   .bindPopup(pinPopup(group),{maxWidth:360,maxHeight:340})
   .bindTooltip(esc(caption),{permanent:true,direction:'top',offset:[0,-21],className:'phytonym-pin-label'+selectedClass,opacity:1})
   .addTo(map);
  marker.on('click',()=>marker.openPopup());
  if(state.view==='profile')state.profileLocationMarkers.set(group.location_id,marker);
  markers.push(marker);
 }
 const focus=state.view==='profile'?[...selectedIds].map(id=>state.profileLocationMarkers.get(id)).filter(Boolean):[];
 map.fitBounds(L.featureGroup(focus.length?focus:markers).getBounds().pad(.2),{maxZoom:8});
 requestAnimationFrame(()=>map.invalidateSize());
}
function mountProfileMap(){
 const target=document.getElementById('profile-map'),p=state.data.phytonyms.find(item=>item.phytonym_id===state.selectedProfile);
 if(target&&p)drawMap(target,state.currentProfileEntries||relatedGlossMapEntries(p),new Set(locatableEntries(p).map(x=>x.location_id)));
}
function cleanExcel(x){let s=String(x??'');return /^[\s\uFEFF]*[=+\-@\t\r]/.test(s)?"'"+s:s}
function exportExcel(){const sel=state.selectedLanguage;if(!sel)return;if(!window.XLSX){alert(tr('noExcel'));return}const plants=sortedPlants(state.data.phytonyms.filter(p=>p.language_id===sel),'catalog');const rows=plants.map(p=>{const t=by('taxa',p.taxon_id)||{},info=attestationOverview(p);return {[tr('name')]:p.name_native_language,[tr('taxon')]:t.scientific_name||'',[tr('family')]:t.botanical_family||'',[tr('ipa')]:p.ipa||'',[tr('dialect')]:info.dialects,[tr('locality')]:info.localities,[tr('source')]:info.citations,[tr('russian_gloss')]:p.russian_gloss,[tr('english_gloss')]:p.english_gloss}}).map(o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,cleanExcel(v)])));const wb=XLSX.utils.book_new(),ws=XLSX.utils.json_to_sheet(rows);XLSX.utils.book_append_sheet(wb,ws,'Phytonyms');XLSX.writeFile(wb,`circumpolar-ethnobotanical-database_${sel}.xlsx`)}
function render(){
 document.documentElement.lang=state.lang;
 document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===state.lang)));
 document.getElementById('navigation').innerHTML=NAMES.map(view=>`<button type="button" data-view="${view}" class="${(state.view===view||(state.view==='profile'&&view===state.returnView))?'active':''}" ${(state.view===view||(state.view==='profile'&&view===state.returnView))?'aria-current="page"':''}>${esc(tr(view))}</button>`).join('');
 if(state.profileMap){state.profileMap.remove();state.profileMap=null;}
 state.profileLocationMarkers=new Map();
 document.getElementById('main').innerHTML=({profile:renderProfile,home:renderHome,catalog:renderCatalog,statistics:renderStatistics,sources:renderSources})[state.view]();
 if(state.view==='profile')mountProfileMap();
}
const DATA_RELEASE='20261121-tungusic-macrons-v6';
const fetchDataJSON=path=>fetch(new URL(path+'?v='+DATA_RELEASE,SITE_ROOT),{cache:'no-store'});
async function load(){state.view=sectionFromURL();const manifest=await fetchDataJSON('data/manifest.json').then(r=>{if(!r.ok)throw Error('manifest '+r.status);return r.json()});const paths=[...Object.values(manifest.collections),...manifest.phytonym_files];const vals=await Promise.all(paths.map(p=>fetchDataJSON('data/'+p).then(r=>{if(!r.ok)throw Error(p+' '+r.status);return r.json()})));state.data=Object.fromEntries(Object.keys(manifest.collections).map((k,i)=>[k,vals[i]]));state.data.phytonyms=vals.slice(Object.keys(manifest.collections).length).flat();const requiredLanguages=['enets','nganasan'];for(const languageId of requiredLanguages){if(!state.data.languages.some(l=>l.language_id===languageId)||!state.data.phytonyms.some(p=>p.language_id===languageId))throw Error('Missing published phytonym data for '+languageId+'; upload all files from the release, including data/manifest.json and data/phytonyms/');}const queryLang=new URL(window.location.href).searchParams.get('language');if(queryLang&&state.data.languages.some(l=>l.language_id===queryLang))state.selectedLanguage=queryLang;if(!state.selectedLanguage)state.selectedLanguage=state.data.phytonyms[0]?.language_id||'';state.index=Object.fromEntries(Object.entries(ID_FIELDS).map(([type,key])=>[type,new Map(state.data[type].map(item=>[item[key],item]))]));state.searchIndex=new Map(state.data.phytonyms.map(p=>[p.phytonym_id,searchIndexText(p)]));render();scrollToHash()}
document.addEventListener('click',e=>{const compare=e.target.closest('[data-map-gloss]');if(compare){const gloss=compare.dataset.mapGloss;const selected=state.data.phytonyms.find(p=>p.english_gloss&&glossMatches(gloss,p.english_gloss));if(selected){if(state.view!=='profile')state.returnView=state.view;state.selectedProfile=selected.phytonym_id;state.view='profile';render();document.getElementById('profile-map')?.scrollIntoView({block:'nearest'});}return;}const placeLink=e.target.closest('[data-map-location]');if(placeLink){const marker=state.profileLocationMarkers?.get(placeLink.dataset.mapLocation);if(marker&&state.profileMap){state.profileMap.setView(marker.getLatLng(),8);marker.openPopup();}return;}const sortButton=e.target.closest('[data-sort-view][data-sort-key]');if(sortButton){const view=sortButton.dataset.sortView,key=sortButton.dataset.sortKey,allowed=view==='home'?['name','language','taxon','family','russian_gloss','english_gloss','dialect','locality','source']:view==='catalog'?['name','taxon','family','russian_gloss','english_gloss','dialect','locality','source']:[];if(allowed.includes(key)){const current=state.tableSort[view];state.tableSort[view]={key,direction:current?.key===key&&current.direction==='asc'?'desc':'asc'};render();}return}const lang=e.target.closest('[data-lang]');if(lang){state.lang=lang.dataset.lang;render();return}const statLanguage=e.target.closest('[data-stat-language]');if(statLanguage){e.preventDefault();state.selectedLanguage=statLanguage.dataset.statLanguage;navigateSection('catalog');const url=sectionURL('catalog');url.searchParams.set('language',state.selectedLanguage);window.history.replaceState({section:'languages'},'',url);return}const view=e.target.closest('[data-view]');if(view){navigateSection(view.dataset.view);return}const profileLink=e.target.closest('[data-profile]');if(profileLink){state.selectedProfile=profileLink.dataset.profile;if(state.view!=='profile')state.returnView=state.view;state.view='profile';render();document.getElementById('main').scrollIntoView();return}if(e.target.closest('#backToResults')){navigateSection(state.returnView);return}const src=e.target.closest('[data-source]');if(src){const languageId=src.dataset.sourceLanguage||state.data.sources.find(s=>s.source_id===src.dataset.source)?.language_ids?.[0];navigateSection('sources',{hash:languageId});const target=document.getElementById('source-'+languageId+'-'+src.dataset.source);target?.scrollIntoView({block:'start'});return}if(e.target.closest('#excel'))exportExcel()});
window.addEventListener('popstate',()=>{if(!state.data)return;state.view=sectionFromURL();const q=new URL(window.location.href).searchParams.get('language');if(q&&state.data.languages.some(l=>l.language_id===q))state.selectedLanguage=q;render();scrollToHash();});
window.addEventListener('hashchange',()=>{if(state.data&&state.view==='sources')scrollToHash();});
document.addEventListener('change',e=>{if(e.target.id==='languageFilter'){state.selectedLanguage=e.target.value;const url=sectionURL('catalog');if(state.selectedLanguage)url.searchParams.set('language',state.selectedLanguage);window.history.replaceState({section:'languages'},'',url);render()}});
document.addEventListener('input',e=>{if(e.target.id==='globalSearch'){const pos=e.target.selectionStart;state.search=e.target.value;render();const input=document.getElementById('globalSearch');input.focus();input.setSelectionRange(pos,pos)}});
load().catch(e=>{document.getElementById('main').innerHTML=`<h1>Data loading error / Ошибка загрузки данных</h1><p class="error">${esc(e.message)}</p><p>Open the site via GitHub Pages or a local HTTP server.</p>`;console.error(e)});
