'use strict';
// Public view. Admin changes are protected by a separate GitHub-backed Worker.
const LABELS = {
 en:{profile_phytonym:'Phytonym',profile_language:'Language',profile_variety:'Language variety',phytonym_other_varieties:'Phytonym in other varieties',phytonym_morphology:'Phytonym morphology',related_forms:'Related forms',statistics:'Statistics',total:'Total',phytonymCount:'Phytonyms',home:'Search',searchPlaceholder:'across all records',resultCount:'Results',overview:'Overview',records:'Vegetation',catalog:'Languages',map:'Map',locations:'Locations',dialects:'Language varieties',contributors:'Contributors',sources:'Resources',about:'About',search:'Search',all:'All languages',language:'Language',russian_gloss:'Russian gloss',english_gloss:'English gloss',dialect:'Language variety',locality:'Locality',name:'Phytonym',ipa:'IPA',taxon:'Scientific name',family:'Taxonomic family',source:'Source',page:'Source page(s)',speaker:'Speaker',collector:'Collector',year:'Recording year',first:'First name',last:'Last name',patronymic:'Patronymic name',clan:'Clan',gender:'Gender',botanical:'Botanical classification',linguistics:'Linguistic information',ecology:'Ecological data',knowledge:'Indigenous Knowledge',evidence:'Documentation',folklore:'Folklore',description:'Description',cognate:'Cognate',names_other_varieties:'Names in other varieties',linguistic_comment:'Linguistic comment',pan_arctic_species:'Pan-Arctic species',endangered_species:'Endangered species',conservation_invasiveness_status:'Conservation / invasiveness status',habitat:'Habitat',plant_community:'Plant community',phenology:'Phenology',toxicity:'Toxicity',medicinal_use:'Medicinal use',domestic_use:'Domestic use',spiritual_use:'Spiritual use',human_consumption:'Human consumption',animal_consumption:'Animal consumption',recordDate:'Recording date',source_use_categories:'Uses in source',source_one_generation_uses:'Uses reported for one generation',maritime_frequency_dots:'Maritime use-frequency dots',tundra_frequency_dots:'Tundra use-frequency dots',name_number:'Form (number)',saveExcel:'Save to Excel',nothing:'No records available.',places:'Places',published:'Published records',totalPages:'Total pages',publisher:'Publisher',title:'Title',authors:'Authors',type:'Type',editionYear:'Year',country:'Country',region:'Region',district:'District',count:'Records',taxa:'Taxa',languages:'Languages',locCount:'Localities',descriptionIntro:'Indigenous plant names, linguistic evidence, ethnobotanical knowledge, and geographic and bibliographic records.',aboutBody:'The database is a bilingual read-only research resource. Published data are maintained as JSON files in the repository.',noMap:'No coordinates available.',glossMap:'Lexical map',glossMapEntries:'Corresponding names',noGeolocations:'No attested or dialect-linked coordinates for these forms.',directPlace:'Source-linked locality',dialectPlace:'Variety reference locality',referencePlace:'Language community reference point',noExcel:'Excel export is unavailable. Please check the spreadsheet library connection.'},
 ru:{profile_phytonym:'Фитоним',profile_language:'Язык',profile_variety:'Языковой вариант',phytonym_other_varieties:'Фитоним в других вариантах языка',phytonym_morphology:'Морфология фитонима',related_forms:'Родственные формы',statistics:'Статистика',total:'Всего',phytonymCount:'Фитонимов',home:'Поиск',searchPlaceholder:'по всем записям',resultCount:'Результатов',overview:'Обзор',records:'Растительность',catalog:'Языки',map:'Карта',locations:'Населённые пункты',dialects:'Языковые варианты',contributors:'Информанты',sources:'Источники',about:'О проекте',search:'Поиск',all:'Все языки',language:'Язык',russian_gloss:'Русское толкование',english_gloss:'Английское толкование',dialect:'Языковой вариант',locality:'Населённый пункт',name:'Фитоним',ipa:'МФА',taxon:'Научное название',family:'Ботаническое семейство',source:'Источник',page:'Страницы источника',speaker:'Информант',collector:'Собиратель',year:'Год записи',first:'Имя',last:'Фамилия',patronymic:'Отчество',clan:'Род',gender:'Пол',botanical:'Ботаническая классификация',linguistics:'Лингвистические сведения',ecology:'Экологические данные',knowledge:'Знания коренных народов',evidence:'Сведения о фиксации',folklore:'Фольклор',description:'Описание',cognate:'Когнаты',names_other_varieties:'Названия в других вариантах',linguistic_comment:'Лингвистический комментарий',pan_arctic_species:'Панарктический вид',endangered_species:'Краснокнижный вид',conservation_invasiveness_status:'Охранный / инвазивный статус',habitat:'Местообитание',plant_community:'Растительное сообщество',phenology:'Фенология',toxicity:'Токсичность',medicinal_use:'Лекарственное применение',domestic_use:'Бытовое применение',spiritual_use:'Духовное использование',human_consumption:'Употребление людьми',animal_consumption:'Употребление животными',recordDate:'Дата записи',source_use_categories:'Категории использования в источнике',source_one_generation_uses:'Использование, отмеченное для одного поколения',maritime_frequency_dots:'Частота упоминаний: приморские (точки)',tundra_frequency_dots:'Частота упоминаний: тундровые (точки)',name_number:'Форма (число)',saveExcel:'Сохранить в Excel',nothing:'Записей пока нет.',places:'Населённые пункты',published:'Опубликованные записи',totalPages:'Общее число страниц',publisher:'Издательство',title:'Название',authors:'Авторы',type:'Тип',editionYear:'Год',country:'Страна',region:'Регион',district:'Район',count:'Записей',taxa:'Таксоны',languages:'Языки',locCount:'Населённые пункты',descriptionIntro:'Названия растений, лингвистические свидетельства, знания коренных народов, географические и библиографические данные.',aboutBody:'Двуязычная исследовательская база только для чтения. Данные публикуются в JSON-файлах репозитория.',noMap:'Нет точек с координатами.',glossMap:'Лексическая карта',glossMapEntries:'Соответствующие названия',noGeolocations:'У этих названий нет координат, связанных с фиксацией или диалектом.',directPlace:'Населённый пункт, указанный в записи',dialectPlace:'Ориентир языкового варианта',referencePlace:'Ориентир языкового сообщества',noExcel:'Экспорт Excel недоступен. Проверьте загрузку библиотеки таблиц.'}
};
const state={lang:'en',view:'home',returnView:'home',selectedLanguage:'',search:'',selectedProfile:'',data:null,profileMap:null,tableSort:{home:{key:'family',direction:'asc'},catalog:{key:'name',direction:'asc'}}};
const NAMES=['home','catalog','statistics','sources'];
// Real short routes: /search, /languages, /statistics, /resources.
// Each route has a static HTML entrypoint for GitHub Pages direct navigation.
const SECTION_PATHS={home:'search',catalog:'languages',statistics:'statistics',sources:'resources'};
const PATH_SECTIONS=Object.fromEntries(Object.entries(SECTION_PATHS).map(([view,path])=>[path,view]));
PATH_SECTIONS.phytonyms='profile';
const SITE_ROOT=new URL('./',document.querySelector('script[src*="app.js"]').src);
function sectionFromURL(){
 const segment=window.location.pathname.replace(/\/+$/,'').split('/').pop();
 const route=PATH_SECTIONS[segment];
 // Old links remain usable after the upgrade.
 return route||PATH_SECTIONS[new URL(window.location.href).searchParams.get('section')]||'home';
}
function profileURL(id){const url=new URL('phytonyms/',SITE_ROOT);url.searchParams.set('id',id);return url;}
function sourceURL(languageId,sourceId){return sectionURL('sources','source-'+languageId+'-'+sourceId);}
function currentSectionURL(view){const u=sectionURL(view);if(view==='home'&&state.search)u.searchParams.set('q',state.search);if(view==='catalog'&&state.selectedLanguage)u.searchParams.set('language',state.selectedLanguage);return u;}
function openProfile(id,{replace=false,hash=''}={}){const p=state.data?.phytonyms.find(p=>p.phytonym_id===id);if(!p)return false;if(state.view!=='profile')state.returnView=state.view;state.selectedProfile=id;state.view='profile';const url=profileURL(id);if(hash)url.hash=hash;window.history[replace?'replaceState':'pushState']({profile:id},'',url);render();if(hash)scrollToHash();else window.scrollTo(0,0);return true;}
function restoreRoute(){const params=new URL(window.location.href).searchParams;state.view=sectionFromURL();if(state.view==='profile'){const id=params.get('id');state.selectedProfile=id&&state.data.phytonyms.some(p=>p.phytonym_id===id)?id:'';state.returnView='home';}if(state.view==='home')state.search=params.get('q')||'';if(state.view==='catalog'){const lang=params.get('language');if(lang&&state.data.languages.some(l=>l.language_id===lang))state.selectedLanguage=lang;}}
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
 if(view==='catalog'&&state.selectedLanguage)url.searchParams.set('language',state.selectedLanguage);
 if(view==='home'&&state.search)url.searchParams.set('q',state.search);
 if(url.href!==window.location.href)window.history[replace?'replaceState':'pushState']({section:SECTION_PATHS[view]},'',url);
 render();
 if(hash)scrollToHash();
}
function scrollToHash(){
 const anchor=decodeURIComponent(window.location.hash.slice(1));
 if(!anchor)return;
 const target=document.getElementById(anchor);
 if(target){target.scrollIntoView({block:'start'});requestAnimationFrame(updateResourcesTopButton);}
}

function updateResourcesTopButton(){
 const button=document.getElementById('resources-back-to-top');
 if(!button)return;
 const show=state.view==='sources'&&window.scrollY>220;
 button.hidden=!show;
 button.textContent=state.lang==='ru'?'↑ Наверх':'↑ Back to top';
 button.setAttribute('aria-label',state.lang==='ru'?'Вернуться наверх страницы':'Back to top of page');
}
window.addEventListener('scroll',updateResourcesTopButton,{passive:true});
document.addEventListener('click',event=>{
 if(!event.target.closest('#resources-back-to-top'))return;
 window.scrollTo({top:0,behavior:'smooth'});
});
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
// Render the complete shared profile schema, including fields with no recorded value.
function pair(key,value){return profileField(key,value);}
function profileField(key,value){const shown=filled(value)?(Array.isArray(value)?value.join('; '):typeof value==='object'?Object.entries(value).filter(([,v])=>filled(v)).map(([k,v])=>`${k}: ${v}`).join('; '):String(value)):'—';return `<tr><th scope="row">${esc(tr(key))}</th><td>${esc(shown)}</td></tr>`;}
function section(title,rows){return `<section class="profile-section"><h3>${esc(tr(title))}</h3><table class="detail-table"><tbody>${rows.join('')}</tbody></table></section>`;}
const ECOLOGY_FIELDS=['habitat','plant_community','phenology','description','toxicity'];
const KNOWLEDGE_FIELDS=['medicinal_use','domestic_use','spiritual_use','human_consumption','animal_consumption'];
function sourcedDetailRows(profile,group){
 const values=profile[group]||{}, translated=profile[group+'_en']||{}, refs=profile.field_sources?.[group]||{};
 const standard=group==='ecological_data'?ECOLOGY_FIELDS:KNOWLEDGE_FIELDS;
 // Keep any additional documented fields, but do not let them change the shared order.
 const keys=[...standard,...Object.keys(values).filter(key=>!standard.includes(key))];
 return keys.map(key=>{
  const value=values[key];
  const shown=state.lang==='en'&&filled(translated[key])?translated[key]:value;
  const printable=filled(shown)?(Array.isArray(shown)?shown.join('; '):typeof shown==='object'?Object.entries(shown).filter(([,v])=>filled(v)).map(([k,v])=>`${k}: ${v}`).join('; '):String(shown)):'—';
  const cites=(refs[key]||[]).map(a=>`<a class="plain-link source-evidence" href="${esc(sourceURL(profile.language_id,a.source_id).href)}" data-source="${esc(a.source_id)}" data-source-language="${esc(profile.language_id)}">${esc(citeSource(a.source_id,a.source_pages))}</a>`).join('; ');
  return `<tr><th scope="row">${esc(tr(key))}</th><td>${esc(printable)}${cites?` <span class="evidence-citations">${cites}</span>`:''}</td></tr>`;
 });
}

const alphabeticalPhytonyms=(a,b)=>a.name_native_language.localeCompare(b.name_native_language,'ru',{sensitivity:'base'})||a.phytonym_id.localeCompare(b.phytonym_id);
const taxonomy=(a,b)=>{const ta=by('taxa',a.taxon_id)||{},tb=by('taxa',b.taxon_id)||{};return [ta.botanical_family||'\uffff',ta.scientific_name||'\uffff',a.name_native_language].join('\0').localeCompare([tb.botanical_family||'\uffff',tb.scientific_name||'\uffff',b.name_native_language].join('\0'),'ru')};
function profile(p){const tax=by('taxa',p.taxon_id)||{};
 const varietyNames=[...new Set([p.dialect_id,...(p.attestations||[]).flatMap(a=>[a.dialect_id,...(a.dialect_ids||[])])].filter(Boolean).map(dialName).filter(Boolean))].join('; ');
 const main=section('linguistics',[profileField('profile_phytonym',p.name_native_language),profileField('profile_language',langName(p.language_id)),profileField('profile_variety',varietyNames),profileField('phytonym_other_varieties',p.names_other_varieties),profileField('phytonym_morphology',p.phytonym_morphology),profileField('related_forms',p.cognate),profileField('russian_gloss',p.russian_gloss),profileField('english_gloss',p.english_gloss)]);
 const botanicalStatus=value=>value===true?(state.lang==='ru'?'Да':'Yes'):value===false?(state.lang==='ru'?'Нет':'No'):'—';
 const bot=section('botanical',[pair('taxon',tax.scientific_name),pair('family',tax.botanical_family),profileField('pan_arctic_species',botanicalStatus(p.pan_arctic_species)),profileField('endangered_species',botanicalStatus(p.endangered_species)),pair('conservation_invasiveness_status',tax.conservation_invasiveness_status)]);
 const eco=section('ecology',sourcedDetailRows(p,'ecological_data'));
 const know=section('knowledge',sourcedDetailRows(p,'indigenous_knowledge'));
 const attestations=p.attestations||[];
 // Field-level references belong beside the fact they support, not in a second Documentation block.
 const fieldReferenceKeys=new Set(Object.values(p.field_sources||{}).flatMap(group=>Object.values(group||{}).flatMap(refs=>(refs||[]).map(ref=>`${ref.source_id}\u0000${ref.source_pages||''}`))));
 const attestationSources=[...new Map(attestations.filter(a=>a.source_id).filter(a=>!fieldReferenceKeys.has(`${a.source_id}\u0000${a.source_pages||''}`)).map(a=>[`${a.source_id}\u0000${a.source_pages||''}`,a])).values()];
 const sourceLinks=attestationSources.map(a=>`<a class="plain-link" href="${esc(sourceURL(p.language_id,a.source_id).href)}" data-source="${esc(a.source_id)}" data-source-language="${esc(p.language_id)}">${esc(citeSource(a.source_id,a.source_pages))}</a>`).join('; ');
 const uniqueAttValues=(getter)=>[...new Set(attestations.map(getter).filter(filled))].join('; ');
 const attest=section('evidence',[
  pair('locality',uniqueAttValues(a=>locName(a.location_id))),
  `<tr><th scope="row">${esc(tr('source'))}</th><td>${sourceLinks||'—'}</td></tr>`,
  pair('dialect',uniqueAttValues(a=>attDialectFull(a)||dialName(a.dialect_id))),
  ...['last','first','patronymic','clan','gender'].map(key=>pair(key,uniqueAttValues(a=>(by('contributors',a.contributor_id)||{})[key==='last'?'last_name':key==='first'?'first_name':key==='patronymic'?'patronymic_name':key]))),
  ...['collector','recording_year','record_date','name_number','source_use_categories','source_one_generation_uses','maritime_frequency_dots','tundra_frequency_dots','folklore'].map((key)=>pair(key==='recording_year'?'year':key==='record_date'?'recordDate':key,uniqueAttValues(a=>a[key])))
 ]);
 const related=relatedProfilesByGloss(p).length?relatedProfilesByGloss(p):[p];
 const entries=related.flatMap(locatableEntries);
 state.currentProfileEntries=entries;
 const ownEntries=locatableEntries(p);
 // Map labels contain ONLY lexical forms. Language and variety belong in this list.
 const forms=[...related].sort((a,b)=>langName(a.language_id).localeCompare(langName(b.language_id),'en')||a.name_native_language.localeCompare(b.name_native_language,'ru')).map(candidate=>{
  const dialectIds=[candidate.dialect_id,...(candidate.attestations||[]).flatMap(att=>[att.dialect_id,...(att.dialect_ids||[])])].filter(Boolean);
  const dialectNames=[...new Set(normalizedDialectIds({dialect_ids:dialectIds}).map(dialName).filter(Boolean))];
  const languageAndVariety=langName(candidate.language_id)+(dialectNames.length?` (${dialectNames.join('; ')})`:'');
  const citations=[...new Set((candidate.attestations||[]).filter(att=>att.source_id).map(att=>citeSource(att.source_id,att.source_pages)).filter(Boolean))];
  return `<li><a class="plain-link related-name" href="${esc(profileURL(candidate.phytonym_id).href)}" data-profile="${esc(candidate.phytonym_id)}">${esc(candidate.name_native_language)}</a> — ${esc(languageAndVariety)}${citations.length?` <small class="muted">${esc(citations.join('; '))}</small>`:''}</li>`;
 }).join('');
 const mapSection=`<section class="profile-section"><h3>${esc(tr('glossMap'))}</h3>${entries.length?`<div id="profile-map" class="map profile-map" role="img" aria-label="${esc(tr('glossMap'))}"></div>`:'<p class="muted">—</p>'}<div class="lexical-correspondences"><h4>${esc(tr('glossMapEntries'))} (${related.length})${p.english_gloss?` · <em>${esc(p.english_gloss)}</em>`:''}</h4><ul>${forms||'<li>—</li>'}</ul></div></section>`;

 const editorButton=`<button type="button" class="profile-edit-pencil" data-edit-profile="${esc(p.phytonym_id)}" aria-label="${state.lang==='ru'?'Редактировать профиль':'Edit profile'}" title="${state.lang==='ru'?'Редактировать профиль':'Edit profile'}"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4z"/></svg></button>`;
 return `<article class="profile" id="profile-${esc(p.phytonym_id)}"><div class="profile-heading-edit"><h2>${esc(p.name_native_language)}</h2>${editorButton}</div>${main}${bot}${eco}${know}${attest}${mapSection}</article>`;
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
function languageSelect(id){return `<select id="${id}" aria-label="${esc(tr('language'))}">${state.data.languages.map(l=>`<option value="${esc(l.language_id)}" ${state.selectedLanguage===l.language_id?'selected':''}>${esc(langName(l.language_id))}</option>`).join('')}</select>`}
function title(view){return `<h1>${esc(tr(view))}</h1>`}
function renderProfile(){const p=state.data.phytonyms.find(x=>x.phytonym_id===state.selectedProfile);return `<a id="backToResults" href="${esc(currentSectionURL(state.returnView).href)}" class="plain-link">← ${esc(tr(state.returnView))}</a>`+(p?profile(p):`<p>${esc(tr('nothing'))}</p>`)}
function phytonymRow(p,includeLanguage=false){
 const tax=by('taxa',p.taxon_id)||{},info=attestationOverview(p);
 return `<tr><td><a class="plain-link" href="${esc(profileURL(p.phytonym_id).href)}" data-profile="${esc(p.phytonym_id)}">${esc(p.name_native_language)}</a></td>${includeLanguage?`<td>${esc(langName(p.language_id))}</td>`:''}<td><i>${esc(tax.scientific_name||'—')}</i></td><td>${esc(tax.botanical_family||'—')}</td><td>${esc(p.russian_gloss||'—')}</td><td>${esc(p.english_gloss||'—')}</td><td>${esc(info.dialects||'—')}</td><td>${esc(info.localities||'—')}</td><td>${esc(info.citations||'—')}</td></tr>`;
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
 if(!tokens.length)return toolbar;
 const plants=sortedPlants(state.data.phytonyms.filter(p=>tokens.every(token=>state.searchIndex.get(p.phytonym_id).includes(token))),'home');
 return toolbar+`<p class="count" id="searchCount" aria-live="polite">${esc(tr('resultCount'))}: ${plants.length}</p>`+(plants.length?table(['name','language','taxon','family','russian_gloss','english_gloss','dialect','locality','source'],plants.map(p=>phytonymRow(p,true)),'home'):`<p class="empty">${esc(tr('nothing'))}</p>`);
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
 en:{authors:'Authors',editors:'Editors',title:'Title',subtitle:'Subtitle',type:'Type',publisher:'Publisher',publication_place:'Publication place',editionYear:'Year',totalPages:'Total pages',journal:'Journal',volume:'Volume',issue:'Issue',page_range:'Page range',doi:'DOI',isbn:'ISBN',url:'URL'},
 ru:{authors:'Авторы',editors:'Редакторы',title:'Название',subtitle:'Подзаголовок',type:'Тип',publisher:'Издательство',publication_place:'Место издания',editionYear:'Год',totalPages:'Общее число страниц',journal:'Журнал',volume:'Том',issue:'Выпуск',page_range:'Диапазон страниц',doi:'DOI',isbn:'ISBN',url:'URL'}
};
const SOURCE_TYPES={
 en:{dictionary:'Dictionary',book:'Book',journal_article:'Journal article',report:'Documentation'},
 ru:{dictionary:'Словарь',book:'Книга',journal_article:'Научная статья',report:'Документация'}
};
function sourceFieldRow(key,value,source){
 if(!filled(value))return '';
 const label=SOURCE_FIELD_LABELS[state.lang][key]||key.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());
 const display=key==='type'?(SOURCE_TYPES[state.lang][value]||String(value).replaceAll('_',' ').replace(/^./,c=>c.toUpperCase())):value;
 if(key==='url'){
  const url=String(value).trim();
  if(!/^https:\/\/[^\s<>"']+$/i.test(url))return '';
  const linkText=source?.['url_label_'+state.lang]||url;
  return `<tr><th scope="row">${esc(label)}</th><td><a class="resource-url" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(linkText)}</a></td></tr>`;
 }
 return `<tr><th scope="row">${esc(label)}</th><td>${esc(display)}</td></tr>`;
}
function renderSources(){
 const groups=[...state.data.languages].sort((a,b)=>a.west_east_order-b.west_east_order).map(language=>({language,sources:state.data.sources.filter(source=>(source.language_ids||[]).includes(language.language_id)).sort((a,b)=>(Number(a.year)||0)-(Number(b.year)||0)||String(a.volume||'').localeCompare(String(b.volume||''),undefined,{numeric:true})||String(a.title||'').localeCompare(String(b.title||'')))}));
 const fields=source=>Object.entries({authors:source.authors,editors:source.editors,title:source.title,subtitle:source.source_id.startsWith('src_sakha_dictionary_vol_')?String(source.subtitle||'').replace(/(Том\s+)\d+/,(_,prefix)=>prefix+romanNumeral(source.volume)):source.subtitle,type:source.publication_type,publisher:source.publisher,publication_place:source.publication_place,editionYear:source.year,totalPages:source.total_pages,journal:source.journal,volume:displayVolume(source),issue:source.issue,page_range:source.page_range,doi:source.doi,isbn:source.isbn,url:source.url}).map(([key,value])=>sourceFieldRow(key,value,source)).filter(Boolean).join('');
 const contents=`<nav class="resource-contents" aria-label="${esc(state.lang==='ru'?'Языки источников':'Resource languages')}">${groups.map(({language})=>`<a href="${esc(sectionURL('sources',language.language_id).href)}" data-resource-language="${esc(language.language_id)}">${esc(langName(language.language_id))}</a>`).join('')}</nav>`;
 const sections=groups.map(({language,sources})=>`<section class="resource-group" id="${esc(language.language_id)}"><h2>${esc(langName(language.language_id))}</h2>${sources.length?sources.map(source=>`<article class="resource-entry" id="source-${esc(language.language_id)}-${esc(source.source_id)}"><div class="resource-citation">${esc(citeSource(source.source_id))}</div><table class="detail-table"><tbody>${fields(source)}</tbody></table></article>`).join(''):`<p class="resource-empty">${esc(state.lang==='ru'?'Источники пока не добавлены.':'No sources added yet.')}</p>`}</section>`).join('');
 return title('sources')+(groups.length?contents+sections:`<p>${esc(tr('nothing'))}</p>`);
}
// Load a real tiled map. Never replace it with a coordinate grid.
let leafletLoading=false;
let leafletFailed=false;
function ensureLeaflet(){
 if(leafletLoading||leafletFailed)return;
 leafletLoading=true;
 const hosts=['https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/','https://unpkg.com/leaflet@1.9.4/dist/'];
 function tryHost(index){
  if(index>=hosts.length){leafletFailed=true;const el=document.getElementById('profile-map');if(el)el.innerHTML='<p class="map-load-error">Map unavailable. Check the connection and reload.</p>';return;}
  const base=hosts[index],css=document.createElement('link');css.rel='stylesheet';css.href=base+'leaflet.css';
  css.onload=()=>{
   function ready(){if(window.L&&leafletStylesReady()&&state.data&&state.view==='profile')mountProfileMap();else if(!leafletStylesReady())tryHost(index+1);}
   if(window.L){ready();return;}
   const js=document.createElement('script');js.src=base+'leaflet.js';js.onload=ready;js.onerror=()=>tryHost(index+1);document.head.appendChild(js);
  };
  css.onerror=()=>tryHost(index+1);document.head.appendChild(css);
 }
 tryHost(0);
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
 const names=[...new Set(distinctPinForms(group).map(item=>item.name).filter(Boolean))];
 // Never append language, dialect, locality, gloss, or source to a map label.
 return `<span class="pin-word-list">${names.map(name=>`<span class="pin-word">${esc(name)}</span>`).join('')}</span>`;
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
 if(!window.L||!leafletStylesReady()){target.innerHTML='<p class="map-load-error">Loading map…</p>';ensureLeaflet();return;}
 target.replaceChildren();
 const map=L.map(target);
 if(state.view==='profile')state.profileMap=map;
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'© OpenStreetMap contributors'}).addTo(map);
 const markers=[];
 for(const group of groups){
  const selected=selectedIds.has(group.location_id);
  const caption=pinCaption(group);
  const selectedClass=selected?' pin-tooltip-selected':'';
  const marker=L.marker([group.latitude,group.longitude],{icon:L.divIcon({className:'phytonym-pin-icon',html:'<span class="phytonym-pin-dot"></span>',iconSize:[22,32],iconAnchor:[11,30]})})
   .bindTooltip(caption,{permanent:true,direction:'top',offset:[0,-21],className:'phytonym-pin-label'+selectedClass,opacity:1,interactive:false})
   .addTo(map);
  if(state.view==='profile')state.profileLocationMarkers.set(group.location_id,marker);
  markers.push(marker);
 }
 const focus=state.view==='profile'?[...selectedIds].map(id=>state.profileLocationMarkers.get(id)).filter(Boolean):[];
 map.fitBounds(L.featureGroup(markers).getBounds().pad(.22),{maxZoom:7});
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
 document.getElementById('navigation').innerHTML=NAMES.map(view=>`<a href="${esc(sectionURL(view).href)}" data-view="${view}" class="${(state.view===view||(state.view==='profile'&&view===state.returnView))?'active':''}" ${(state.view===view||(state.view==='profile'&&view===state.returnView))?'aria-current="page"':''}>${esc(tr(view))}</a>`).join('');
 if(state.profileMap){state.profileMap.remove();state.profileMap=null;}
 state.profileLocationMarkers=new Map();
 document.getElementById('main').innerHTML=({profile:renderProfile,home:renderHome,catalog:renderCatalog,statistics:renderStatistics,sources:renderSources})[state.view]();
 if(state.view==='profile')mountProfileMap();
 updateResourcesTopButton();
}
// Inline profile editing: the restricted editor is displayed in a same-page dialog.
function closeProfileEditor(){const dlg=document.getElementById('profile-edit-dialog');if(!dlg)return;const frame=dlg.querySelector('iframe');try{if(frame.contentWindow.__cedbDirty&&!confirm(state.lang==='ru'?'Отменить несохранённые изменения?':'Discard unsaved changes?'))return;}catch{}dlg.close();frame.src='about:blank';}
function openProfileEditor(p){let dlg=document.getElementById('profile-edit-dialog');if(!dlg){dlg=document.createElement('dialog');dlg.id='profile-edit-dialog';dlg.className='profile-edit-dialog auth-compact';dlg.innerHTML='<div class="profile-edit-shell"><div class="profile-edit-top"><strong class="profile-edit-label"></strong><button type="button" class="profile-edit-close" aria-label="Close editor / Закрыть редактор">×</button></div><iframe title="Content editor / Редактор профиля" loading="eager"></iframe></div>';document.body.appendChild(dlg);dlg.querySelector('.profile-edit-close').addEventListener('click',closeProfileEditor);dlg.addEventListener('click',event=>{if(event.target===dlg)closeProfileEditor();});dlg.addEventListener('close',()=>{dlg.querySelector('iframe').src='about:blank';});}dlg.classList.add('auth-compact');dlg.querySelector('.profile-edit-label').textContent=p.name_native_language;const url=new URL('admin/',SITE_ROOT);url.searchParams.set('language',p.language_id);url.searchParams.set('id',p.phytonym_id);url.searchParams.set('embedded','1');dlg.querySelector('iframe').src=url.href;dlg.showModal();}
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='cedb-editor-auth-state')return;const dlg=document.getElementById('profile-edit-dialog');if(!dlg||!dlg.open||event.source!==dlg.querySelector('iframe')?.contentWindow)return;dlg.classList.toggle('auth-compact',!event.data.signedIn);});
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='cedb-profile-deleted')return;const d=event.data.deleted;if(!d||!state.data)return;const before=state.data.phytonyms.length;state.data.phytonyms=state.data.phytonyms.filter(p=>!(p.phytonym_id===d.phytonym_id&&p.language_id===d.language_id));if(state.data.phytonyms.length===before)return;state.searchIndex.delete(d.phytonym_id);if(state.selectedProfile===d.phytonym_id){state.selectedProfile='';state.view=state.returnView==='profile'?'home':state.returnView;window.history.replaceState({section:state.view},'',currentSectionURL(state.view));}const dlg=document.getElementById('profile-edit-dialog');if(dlg?.open){dlg.close();dlg.querySelector('iframe').src='about:blank';}render();});
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='cedb-profile-saved')return;const p=event.data.profile;if(!p||!state.data||!state.data.phytonyms.some(v=>v.phytonym_id===p.phytonym_id&&v.language_id===p.language_id))return;const current=state.data.phytonyms.find(v=>v.phytonym_id===p.phytonym_id);Object.assign(current,p);state.searchIndex.set(p.phytonym_id,searchIndexText(p));if(state.view==='profile'&&state.selectedProfile===p.phytonym_id){render();} });
const DATA_RELEASE='20261125-deep-links-v1';
const fetchDataJSON=path=>fetch(new URL(path+'?v='+DATA_RELEASE,SITE_ROOT),{cache:'no-store'});
async function load(){state.view=sectionFromURL();const manifest=await fetchDataJSON('data/manifest.json').then(r=>{if(!r.ok)throw Error('manifest '+r.status);return r.json()});const paths=[...Object.values(manifest.collections),...manifest.phytonym_files];const vals=await Promise.all(paths.map(p=>fetchDataJSON('data/'+p).then(r=>{if(!r.ok)throw Error(p+' '+r.status);return r.json()})));state.data=Object.fromEntries(Object.keys(manifest.collections).map((k,i)=>[k,vals[i]]));state.data.phytonyms=vals.slice(Object.keys(manifest.collections).length).flat();const requiredLanguages=['enets','nganasan'];for(const languageId of requiredLanguages){if(!state.data.languages.some(l=>l.language_id===languageId)||!state.data.phytonyms.some(p=>p.language_id===languageId))throw Error('Missing published phytonym data for '+languageId+'; upload all files from the release, including data/manifest.json and data/phytonyms/');}const queryLang=new URL(window.location.href).searchParams.get('language');if(queryLang&&state.data.languages.some(l=>l.language_id===queryLang))state.selectedLanguage=queryLang;if(!state.selectedLanguage)state.selectedLanguage=state.data.phytonyms[0]?.language_id||'';state.index=Object.fromEntries(Object.entries(ID_FIELDS).map(([type,key])=>[type,new Map(state.data[type].map(item=>[item[key],item]))]));state.searchIndex=new Map(state.data.phytonyms.map(p=>[p.phytonym_id,searchIndexText(p)]));restoreRoute();render();scrollToHash()}
document.addEventListener('click',e=>{if(e.defaultPrevented)return;if(e.target.closest('a')&&(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0))return;const editButton=e.target.closest('[data-edit-profile]');if(editButton){const p=state.data?.phytonyms.find(v=>v.phytonym_id===editButton.dataset.editProfile);if(p)openProfileEditor(p);return;}const compare=e.target.closest('[data-map-gloss]');if(compare){const gloss=compare.dataset.mapGloss;const selected=state.data.phytonyms.find(p=>p.english_gloss&&glossMatches(gloss,p.english_gloss));if(selected)openProfile(selected.phytonym_id,{hash:'profile-map'});return;}const placeLink=e.target.closest('[data-map-location]');if(placeLink){const marker=state.profileLocationMarkers?.get(placeLink.dataset.mapLocation);if(marker&&state.profileMap){state.profileMap.setView(marker.getLatLng(),8);}return;}const sortButton=e.target.closest('[data-sort-view][data-sort-key]');if(sortButton){const view=sortButton.dataset.sortView,key=sortButton.dataset.sortKey,allowed=view==='home'?['name','language','taxon','family','russian_gloss','english_gloss','dialect','locality','source']:view==='catalog'?['name','taxon','family','russian_gloss','english_gloss','dialect','locality','source']:[];if(allowed.includes(key)){const current=state.tableSort[view];state.tableSort[view]={key,direction:current?.key===key&&current.direction==='asc'?'desc':'asc'};render();}return}const lang=e.target.closest('[data-lang]');if(lang){state.lang=lang.dataset.lang;render();return}const statLanguage=e.target.closest('[data-stat-language]');if(statLanguage){e.preventDefault();state.selectedLanguage=statLanguage.dataset.statLanguage;navigateSection('catalog');return}const resourceLanguage=e.target.closest('[data-resource-language]');if(resourceLanguage){e.preventDefault();navigateSection('sources',{hash:resourceLanguage.dataset.resourceLanguage});return}const view=e.target.closest('[data-view]');if(view){e.preventDefault();navigateSection(view.dataset.view);return}const profileLink=e.target.closest('[data-profile]');if(profileLink){e.preventDefault();openProfile(profileLink.dataset.profile);return}if(e.target.closest('#backToResults')){e.preventDefault();navigateSection(state.returnView);return}const src=e.target.closest('[data-source]');if(src){e.preventDefault();const languageId=src.dataset.sourceLanguage||state.data.sources.find(s=>s.source_id===src.dataset.source)?.language_ids?.[0];navigateSection('sources',{hash:'source-'+languageId+'-'+src.dataset.source});return}if(e.target.closest('#excel'))exportExcel()});
window.addEventListener('popstate',()=>{if(!state.data)return;restoreRoute();render();scrollToHash();});
window.addEventListener('hashchange',()=>{if(state.data&&state.view==='sources')scrollToHash();});
document.addEventListener('change',e=>{if(e.target.id==='languageFilter'){state.selectedLanguage=e.target.value;window.history.pushState({section:'languages'},'',currentSectionURL('catalog'));render()}});
document.addEventListener('input',e=>{if(e.target.id==='globalSearch'){const pos=e.target.selectionStart;state.search=e.target.value;window.history.replaceState({section:'search'},'',currentSectionURL('home'));render();const input=document.getElementById('globalSearch');input.focus();input.setSelectionRange(pos,pos)}});
load().catch(e=>{document.getElementById('main').innerHTML=`<h1>Data loading error / Ошибка загрузки данных</h1><p class="error">${esc(e.message)}</p><p>Open the site via GitHub Pages or a local HTTP server.</p>`;console.error(e)});
