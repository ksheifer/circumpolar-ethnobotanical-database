'use strict';
// Read-only client. All published data come from data/*.json.
const LABELS = {
 en:{statistics:'Statistics',total:'Total',phytonymCount:'Phytonyms',home:'Search',searchPlaceholder:'across all records',resultCount:'Results',overview:'Overview',records:'Vegetation',catalog:'Languages',map:'Map',locations:'Locations',dialects:'Varieties',contributors:'Contributors',sources:'Resources',about:'About',search:'Search',all:'All languages',language:'Language',russian_gloss:'Russian gloss',english_gloss:'English gloss',dialect:'Variety',locality:'Locality',name:'Phytonym',ipa:'IPA',taxon:'Scientific name',family:'Taxonomic family',source:'Source',page:'Source page(s)',speaker:'Speaker',collector:'Collector',year:'Recording year',first:'First name',last:'Last name',patronymic:'Patronymic name',clan:'Clan',gender:'Gender',botanical:'Botanical classification',linguistics:'Linguistic information',ecology:'Ecological data',knowledge:'Indigenous Knowledge',evidence:'Documentation',folklore:'Folklore',description:'Description',cognate:'Cognate / etymology',names_other_varieties:'Names in other varieties',linguistic_comment:'Linguistic comment',conservation_invasiveness_status:'Conservation / invasiveness status',habitat:'Habitat',plant_community:'Plant community',phenology:'Phenology',toxicity:'Toxicity',medicinal_use:'Medicinal use',domestic_use:'Domestic use',spiritual_use:'Spiritual use',human_consumption:'Human consumption',animal_consumption:'Animal consumption',recordDate:'Recording date',source_use_categories:'Uses in source',source_one_generation_uses:'Uses reported for one generation',maritime_frequency_dots:'Maritime use-frequency dots',tundra_frequency_dots:'Tundra use-frequency dots',name_number:'Form (number)',saveExcel:'Save to Excel',nothing:'No records available.',places:'Places',published:'Published records',totalPages:'Total pages',publisher:'Publisher',title:'Title',authors:'Authors',type:'Type',editionYear:'Year',country:'Country',region:'Region',district:'District',count:'Records',notes:'Notes',taxa:'Taxa',languages:'Languages',locCount:'Localities',descriptionIntro:'Indigenous plant names, linguistic evidence, ethnobotanical knowledge, and geographic and bibliographic records.',aboutBody:'The database is a bilingual read-only research resource. Published data are maintained as JSON files in the repository.',noMap:'No coordinates available.',glossMap:'Lexical map',glossMapEntries:'Corresponding names',noGeolocations:'No attested or dialect-linked coordinates for these forms.',directPlace:'Source-linked locality',dialectPlace:'Variety reference locality',noExcel:'Excel export is unavailable. Please check the spreadsheet library connection.'},
 ru:{statistics:'Статистика',total:'Всего',phytonymCount:'Фитонимов',home:'Поиск',searchPlaceholder:'по всем записям',resultCount:'Результатов',overview:'Обзор',records:'Растительность',catalog:'Языки',map:'Карта',locations:'Населённые пункты',dialects:'Разновидности',contributors:'Информанты',sources:'Источники',about:'О проекте',search:'Поиск',all:'Все языки',language:'Язык',russian_gloss:'Русское толкование',english_gloss:'Английское толкование',dialect:'Разновидность',locality:'Населённый пункт',name:'Фитоним',ipa:'МФА',taxon:'Научное название',family:'Ботаническое семейство',source:'Источник',page:'Страницы источника',speaker:'Информант',collector:'Собиратель',year:'Год записи',first:'Имя',last:'Фамилия',patronymic:'Отчество',clan:'Род',gender:'Пол',botanical:'Ботаническая классификация',linguistics:'Лингвистические сведения',ecology:'Экологические данные',knowledge:'Знания коренных народов',evidence:'Сведения о фиксации',folklore:'Фольклор',description:'Описание',cognate:'Когнаты / этимология',names_other_varieties:'Названия в других вариантах',linguistic_comment:'Лингвистический комментарий',conservation_invasiveness_status:'Охранный / инвазивный статус',habitat:'Местообитание',plant_community:'Растительное сообщество',phenology:'Фенология',toxicity:'Токсичность',medicinal_use:'Лекарственное применение',domestic_use:'Бытовое применение',spiritual_use:'Духовное использование',human_consumption:'Употребление людьми',animal_consumption:'Употребление животными',recordDate:'Дата записи',source_use_categories:'Категории использования в источнике',source_one_generation_uses:'Использование, отмеченное для одного поколения',maritime_frequency_dots:'Частота упоминаний: приморские (точки)',tundra_frequency_dots:'Частота упоминаний: тундровые (точки)',name_number:'Форма (число)',saveExcel:'Сохранить в Excel',nothing:'Записей пока нет.',places:'Населённые пункты',published:'Опубликованные записи',totalPages:'Общее число страниц',publisher:'Издательство',title:'Название',authors:'Авторы',type:'Тип',editionYear:'Год',country:'Страна',region:'Регион',district:'Район',count:'Записей',notes:'Примечания',taxa:'Таксоны',languages:'Языки',locCount:'Населённые пункты',descriptionIntro:'Названия растений, лингвистические свидетельства, знания коренных народов, географические и библиографические данные.',aboutBody:'Двуязычная исследовательская база только для чтения. Данные публикуются в JSON-файлах репозитория.',noMap:'Нет точек с координатами.',glossMap:'Лексическая карта',glossMapEntries:'Соответствующие названия',noGeolocations:'У этих названий нет координат, связанных с фиксацией или диалектом.',directPlace:'Населённый пункт, указанный в записи',dialectPlace:'Ориентир разновидности',noExcel:'Экспорт Excel недоступен. Проверьте загрузку библиотеки таблиц.'}
};
const state={lang:'en',view:'home',returnView:'home',selectedLanguage:'',selectedVariety:'',search:'',selectedProfile:'',data:null,profileMap:null};
const NAMES=['home','catalog','statistics','sources'];
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
const attDialectLabels=a=>(a?.dialect_ids||[]).map(dialName).filter(Boolean).join(', ');
const attDialectFull=a=>(a?.dialect_ids||[]).map(dialName).filter(Boolean).join('; ');
// Short references: [Author Year: Page] or [Author Year Volume: Page].
// Without a page (e.g., bibliographies), do not add a colon.
const romanNumeral=n=>{let x=Number(n);if(!Number.isInteger(x)||x<1||x>3999)return String(n);let result='';for(const [value,symbol] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]){while(x>=value){result+=symbol;x-=value;}}return result;};
const displayVolume=source=>source?.source_id?.startsWith('src_sakha_dictionary_vol_')?romanNumeral(source.volume):source?.volume;
const citeSource=(id,pages)=>{
 const s=by('sources',id);
 if(!s)return '';
 const parts=[s.citation_key||s.authors||s.editors||s.source_id,s.year,displayVolume(s)]
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
  dialects:unique([dialName(p.dialect_id),...attestations.map(a=>attDialectLabels(a)||dialName(a.dialect_id))])
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
  const dialect=[...new Set(dialectIds.map(dialName).filter(Boolean))].join('; ');
  const source=[...new Set((candidate.attestations||[]).map(a=>citeSource(a.source_id,a.source_pages)).filter(Boolean))].join('; ');
  entries.push({location_id:locationId,locality:locName(locationId),latitude:location.latitude,longitude:location.longitude,kind,
   phytonym_id:candidate.phytonym_id,name:candidate.name_native_language,language:langName(candidate.language_id),dialect,source});
 };
 const explicit=new Set((candidate.attestations||[]).map(a=>a.location_id).filter(Boolean));
 for(const id of explicit)emit(id,'attested');
 // A dialect's location_ids are geographic reference points, NOT evidence of individual word use.
 const dialectIds=[candidate.dialect_id,...(candidate.attestations||[]).flatMap(a=>[a.dialect_id,...(a.dialect_ids||[])])].filter(Boolean);
 const reference=new Set(dialectIds.flatMap(id=>by('dialects',id)?.location_ids||[]));
 for(const id of reference)if(!explicit.has(id))emit(id,'dialect');
 return entries;
}
const relatedGlossMapEntries=profile=>relatedProfilesByGloss(profile).flatMap(locatableEntries);
function pair(key,value){return filled(value)?`<tr><th scope="row">${esc(tr(key))}</th><td>${esc(Array.isArray(value)?value.join('; '):typeof value==='object'?Object.entries(value).filter(([,v])=>filled(v)).map(([k,v])=>`${k}: ${v}`).join('; '):value)}</td></tr>`:''}
function section(title,rows){return rows.some(Boolean)?`<section class="profile-section"><h3>${esc(tr(title))}</h3><table class="detail-table"><tbody>${rows.join('')}</tbody></table></section>`:''}
const alphabeticalPhytonyms=(a,b)=>a.name_native_language.localeCompare(b.name_native_language,'ru',{sensitivity:'base'})||a.phytonym_id.localeCompare(b.phytonym_id);
const taxonomy=(a,b)=>{const ta=by('taxa',a.taxon_id)||{},tb=by('taxa',b.taxon_id)||{};return [ta.botanical_family||'\uffff',ta.scientific_name||'\uffff',a.name_native_language].join('\0').localeCompare([tb.botanical_family||'\uffff',tb.scientific_name||'\uffff',b.name_native_language].join('\0'),'ru')};
function profile(p){const tax=by('taxa',p.taxon_id)||{};
 const main=section('linguistics',[pair('name',p.name_native_language),pair('ipa',p.ipa),pair('language',langName(p.language_id)),pair('dialect',dialName(p.dialect_id)),...['names_other_varieties','cognate','russian_gloss','english_gloss','linguistic_comment'].map(k=>pair(k,p[k]))]);
 const bot=section('botanical',[pair('taxon',tax.scientific_name),pair('family',tax.botanical_family),pair('conservation_invasiveness_status',tax.conservation_invasiveness_status)]);
 const eco=section('ecology',Object.entries(p.ecological_data||{}).map(([k,v])=>pair(k,v)));
 const know=section('knowledge',Object.entries(p.indigenous_knowledge||{}).map(([k,v])=>pair(k,v)));
 const attest=(p.attestations||[]).map(a=>{const c=by('contributors',a.contributor_id)||{};return section('evidence',[pair('locality',locName(a.location_id)),pair('dialect',attDialectFull(a)||dialName(a.dialect_id)),a.source_id?`<tr><th scope="row">${esc(tr('source'))}</th><td><button class="plain-link" data-source="${esc(a.source_id)}">${esc(citeSource(a.source_id,a.source_pages))}</button></td></tr>`:'',pair('last',c.last_name),pair('first',c.first_name),pair('patronymic',c.patronymic_name),pair('clan',c.clan),pair('gender',c.gender),pair('collector',a.collector),pair('year',a.recording_year),pair('recordDate',a.record_date),pair('name_number',a.name_number),pair('source_use_categories',a.source_use_categories),pair('source_one_generation_uses',a.source_one_generation_uses),pair('maritime_frequency_dots',a.maritime_frequency_dots),pair('tundra_frequency_dots',a.tundra_frequency_dots),pair('folklore',a.folklore)])}).join('');
 const related=relatedProfilesByGloss(p);
 const entries=related.flatMap(locatableEntries);
 state.currentProfileEntries=entries;
 const locationsByProfile=new Map();
 for(const entry of entries){const group=locationsByProfile.get(entry.phytonym_id)||[];group.push(entry);locationsByProfile.set(entry.phytonym_id,group);}
 const forms=related.map(candidate=>{
  const ids=locationsByProfile.get(candidate.phytonym_id)||[];
  const places=[...new Set(ids.map(e=>e.locality))];
  const dialects=[candidate.dialect_id,...(candidate.attestations||[]).flatMap(a=>[a.dialect_id,...(a.dialect_ids||[])])].filter(Boolean);
  const dialectNames=[...new Set(dialects.map(dialName).filter(Boolean))];
  return `<li><button type="button" class="plain-link related-name" data-profile="${esc(candidate.phytonym_id)}">${esc(candidate.name_native_language)}</button> — ${esc(langName(candidate.language_id))}${dialectNames.length?`; ${esc(dialectNames.join('; '))}`:''}${places.length?`; ${esc(places.join('; '))}`:''}${!ids.length?` <span class="muted">(${esc(state.lang==='ru'?'без геопривязки':'not geolocated')})</span>`:''}</li>`;
 }).join('');
 const mapSection=p.english_gloss?`<section class="profile-section"><h3>${esc(tr('glossMap'))}</h3><div id="profile-map" class="map profile-map" role="img" aria-label="${esc(tr('glossMap'))}"></div>${!entries.length?`<p class="muted">${esc(tr('noGeolocations'))}</p>`:''}<div class="profile-related"><h3>${esc(tr('glossMapEntries'))}: ${related.length}</h3><ul>${forms}</ul></div></section>`:'';

 return `<article class="profile" id="profile-${esc(p.phytonym_id)}"><h2>${esc(p.name_native_language)}</h2><p class="muted">${esc(langName(p.language_id))}${tax.scientific_name?' · '+esc(tax.scientific_name):''}</p>${main}${bot}${eco}${know}${attest}${mapSection}</article>`;
}
function table(headers,rows){return `<div class="table-wrap"><table class="index"><thead><tr>${headers.map(h=>`<th>${esc(tr(h))}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`}
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
 const searchable=[p.name_native_language,p.names_other_varieties,p.ipa,p.source_lemma,p.russian_gloss,p.english_gloss,p.linguistic_comment,p.cognate,tax.scientific_name,tax.botanical_family,tax.description,language.name_en,language.name_ru,language.language_id,...dialects.flatMap(d=>[d.name_ru,d.name_en,d.source_abbreviation]),...locations.flatMap(l=>[l.name_ru,l.name_en,l.locality]),...sources.flatMap(src=>[src.citation_key,src.title,src.authors,src.year]),...a.map(item=>item.source_pages)];
 return searchNormalize(searchable.flatMap(value=>Array.isArray(value)?value:[value]).filter(value=>typeof value==='string'||typeof value==='number').join(' '));
}
function renderHome(){
 const tokens=searchNormalize(state.search).split(' ').filter(Boolean);
 const toolbar=`<div class="search-toolbar"><label for="globalSearch">${esc(tr('search'))}</label><input id="globalSearch" type="search" autocomplete="off" spellcheck="false" value="${esc(state.search)}" placeholder="${esc(tr('searchPlaceholder'))}"></div>`;
 // Nothing is published to the results area before the visitor enters a query.
 if(!tokens.length)return title('home')+toolbar;
 const plants=state.data.phytonyms.filter(p=>tokens.every(token=>state.searchIndex.get(p.phytonym_id).includes(token))).sort(taxonomy);
 return title('home')+toolbar+`<p class="count" id="searchCount" aria-live="polite">${esc(tr('resultCount'))}: ${plants.length}</p>`+(plants.length?table(['name','language','taxon','family','russian_gloss','english_gloss','dialect','locality','source'],plants.map(p=>phytonymRow(p,true))):`<p class="empty">${esc(tr('nothing'))}</p>`);
}
function renderStatistics(){
 const counts=new Map(state.data.languages.map(lang=>[lang.language_id,0]));
 for(const record of state.data.phytonyms)counts.set(record.language_id,(counts.get(record.language_id)||0)+1);
 const languages=[...state.data.languages].sort((a,b)=>(a.west_east_order||0)-(b.west_east_order||0));
 const rows=languages.map(lang=>`<tr><td>${esc(langName(lang.language_id))}</td><td class="numeric">${counts.get(lang.language_id)||0}</td></tr>`).join('');
 const total=state.data.phytonyms.length;
 return title('statistics')+`<div class="table-wrap"><table class="index statistics-table"><thead><tr><th scope="col">${esc(tr('language'))}</th><th scope="col" class="numeric">${esc(tr('phytonymCount'))}</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row">${esc(tr('total'))}</th><td class="numeric">${total}</td></tr></tfoot></table></div>`;
}
// Varieties are a second level of the Komi and Sámi language catalogues.
// A record belongs to a variety only when the publication explicitly links it.
const recordVarietyIds=p=>[...new Set([p.dialect_id,...(p.attestations||[]).flatMap(a=>[a.dialect_id,...(a.dialect_ids||[])])].filter(Boolean))];
function catalogVarieties(languageId){
 return state.data.dialects.filter(d=>d.language_id===languageId).sort((a,b)=>dialName(a.dialect_id).localeCompare(dialName(b.dialect_id),state.lang==='ru'?'ru':'en'));
}
function renderCatalog(){
 const sel=state.selectedLanguage;
 const varieties=['komi','sami'].includes(sel)?catalogVarieties(sel):[];
 const selected=varieties.some(v=>v.dialect_id===state.selectedVariety)?state.selectedVariety:'';
 const allPlants=state.data.phytonyms.filter(p=>p.language_id===sel);
 const plants=allPlants.filter(p=>!selected||recordVarietyIds(p).includes(selected)).sort(alphabeticalPhytonyms);
 const allLabel=state.lang==='ru'?'Все разновидности':'All varieties';
 const varietyList=varieties.length?`<section class="language-varieties"><h2>${esc(tr('dialects'))}</h2><div class="variety-picker"><label for="varietyFilter">${esc(tr('dialect'))}</label><select id="varietyFilter"><option value="">${esc(allLabel)}</option>${varieties.map(v=>`<option value="${esc(v.dialect_id)}" ${v.dialect_id===selected?'selected':''}>${esc(dialName(v.dialect_id))}</option>`).join('')}</select></div><ul>${varieties.map(v=>{const count=allPlants.filter(p=>recordVarietyIds(p).includes(v.dialect_id)).length;return `<li><button type="button" class="variety-link ${selected===v.dialect_id?'selected':''}" data-variety="${esc(v.dialect_id)}">${esc(dialName(v.dialect_id))}</button> <span class="muted">${count}</span></li>`}).join('')}</ul></section>`:'';
 return title('catalog')+`<div class="toolbar">${languageSelect('languageFilter')}<span class="count">${plants.length}</span>${sel?`<button id="excel" type="button" ${plants.length?'':'disabled'}>${esc(tr('saveExcel'))}</button>`:''}</div>`+varietyList+(plants.length?table(['name','taxon','family','russian_gloss','english_gloss','dialect','locality','source'],plants.map(p=>phytonymRow(p))):selected?`<p class="empty">${esc(tr('nothing'))}</p>`:'');
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
 const contents=`<nav class="resource-contents" aria-label="${esc(state.lang==='ru'?'Языки источников':'Resource languages')}">${groups.map(({language})=>`<a href="#resources-${esc(language.language_id)}">${esc(langName(language.language_id))}</a>`).join('')}</nav>`;
 const sections=groups.map(({language,sources})=>`<section class="resource-group" id="resources-${esc(language.language_id)}"><h2>${esc(langName(language.language_id))}</h2>${sources.length?sources.map(source=>`<article class="resource-entry" id="source-${esc(language.language_id)}-${esc(source.source_id)}"><div class="resource-citation">${esc(citeSource(source.source_id))}</div><table class="detail-table"><tbody>${fields(source)}</tbody></table></article>`).join(''):`<p class="resource-empty">${esc(state.lang==='ru'?'Источники пока не добавлены.':'No sources added yet.')}</p>`}</section>`).join('');
 return title('sources')+(groups.length?contents+sections:`<p>${esc(tr('nothing'))}</p>`);
}
function mountProfileMap(){
 const target=document.getElementById('profile-map');
 const profile=state.data.phytonyms.find(item=>item.phytonym_id===state.selectedProfile);
 if(!target||!profile)return;
 const entries=state.currentProfileEntries||relatedGlossMapEntries(profile);
 if(!entries.length){target.textContent=tr('noGeolocations');target.classList.add('map-unavailable');return;}
 if(!window.L){target.textContent=tr('noMap');target.classList.add('map-unavailable');return;}
 const grouped=new Map();
 for(const entry of entries){const key=entry.location_id;const bucket=grouped.get(key)||{...entry,items:[]};bucket.items.push(entry);grouped.set(key,bucket);}
 const map=L.map(target);state.profileMap=map;
 L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'© OpenStreetMap contributors'}).addTo(map);
 const markers=[];
 for(const group of grouped.values()){
  const forms=[...new Map(group.items.map(item=>[item.phytonym_id+':'+item.kind,item])).values()];
  const list=forms.map(item=>`<li><strong>${esc(item.name)}</strong> — ${esc(item.language)}${item.dialect?`; ${esc(item.dialect)}`:''}<br><small>${esc(tr(item.kind==='attested'?'directPlace':'dialectPlace'))}</small>${item.source?`<br><small>${esc(item.source)}</small>`:''}</li>`).join('');
  const certain=forms.some(item=>item.kind==='attested');
  const mark=L.circleMarker([group.latitude,group.longitude],{radius:6,color:certain?'#225a91':'#9b6c2d',weight:2,fillOpacity:certain?.85:0.15})
    .bindPopup(`<strong>${esc(group.locality)}</strong><ul class="map-popup-list">${list}</ul>`)
    .bindTooltip(esc(forms.map(x=>x.name).filter((v,i,a)=>a.indexOf(v)===i).slice(0,2).join(' · '))+(forms.length>2?' …':''),{direction:'top',permanent:grouped.size<=12,className:'phytonym-tooltip'}).addTo(map);
  markers.push(mark);
 }
 map.fitBounds(L.featureGroup(markers).getBounds().pad(.2),{maxZoom:8});
 requestAnimationFrame(()=>map.invalidateSize());
}
function cleanExcel(x){let s=String(x??'');return /^[\s\uFEFF]*[=+\-@\t\r]/.test(s)?"'"+s:s}
function exportExcel(){const sel=state.selectedLanguage;if(!sel)return;if(!window.XLSX){alert(tr('noExcel'));return}const plants=state.data.phytonyms.filter(p=>p.language_id===sel&&(!state.selectedVariety||recordVarietyIds(p).includes(state.selectedVariety))).sort(alphabeticalPhytonyms);const rows=plants.map(p=>{const t=by('taxa',p.taxon_id)||{},info=attestationOverview(p);return {[tr('name')]:p.name_native_language,[tr('taxon')]:t.scientific_name||'',[tr('family')]:t.botanical_family||'',[tr('ipa')]:p.ipa||'',[tr('dialect')]:info.dialects,[tr('locality')]:info.localities,[tr('source')]:info.citations,[tr('russian_gloss')]:p.russian_gloss,[tr('english_gloss')]:p.english_gloss}}).map(o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,cleanExcel(v)])));const wb=XLSX.utils.book_new(),ws=XLSX.utils.json_to_sheet(rows);XLSX.utils.book_append_sheet(wb,ws,'Phytonyms');XLSX.writeFile(wb,`circumpolar-ethnobotanical-database_${sel}${state.selectedVariety?'_'+state.selectedVariety.replace(/^dia_/,''): ''}.xlsx`)}
function render(){
 document.documentElement.lang=state.lang;
 document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===state.lang)));
 document.getElementById('navigation').innerHTML=NAMES.map(view=>`<button type="button" data-view="${view}" class="${(state.view===view||(state.view==='profile'&&view===state.returnView))?'active':''}" ${(state.view===view||(state.view==='profile'&&view===state.returnView))?'aria-current="page"':''}>${esc(tr(view))}</button>`).join('');
 if(state.profileMap){state.profileMap.remove();state.profileMap=null;}
 document.getElementById('main').innerHTML=({profile:renderProfile,home:renderHome,catalog:renderCatalog,statistics:renderStatistics,sources:renderSources})[state.view]();
 if(state.view==='profile')mountProfileMap();
}
async function load(){const manifest=await fetch('data/manifest.json').then(r=>{if(!r.ok)throw Error('manifest '+r.status);return r.json()});const paths=[...Object.values(manifest.collections),...manifest.phytonym_files];const vals=await Promise.all(paths.map(p=>fetch('data/'+p).then(r=>{if(!r.ok)throw Error(p+' '+r.status);return r.json()})));state.data=Object.fromEntries(Object.keys(manifest.collections).map((k,i)=>[k,vals[i]]));state.data.phytonyms=vals.slice(Object.keys(manifest.collections).length).flat();if(!state.selectedLanguage)state.selectedLanguage=state.data.phytonyms[0]?.language_id||'';state.index=Object.fromEntries(Object.entries(ID_FIELDS).map(([type,key])=>[type,new Map(state.data[type].map(item=>[item[key],item]))]));state.searchIndex=new Map(state.data.phytonyms.map(p=>[p.phytonym_id,searchIndexText(p)]));render()}
document.addEventListener('click',e=>{const lang=e.target.closest('[data-lang]');if(lang){state.lang=lang.dataset.lang;render();return}const view=e.target.closest('[data-view]');if(view){state.view=view.dataset.view;if(state.view==='catalog'&&!state.selectedLanguage)state.selectedLanguage=state.data.phytonyms[0]?.language_id||'';render();return}const profileLink=e.target.closest('[data-profile]');if(profileLink){state.selectedProfile=profileLink.dataset.profile;if(state.view!=='profile')state.returnView=state.view;state.view='profile';render();document.getElementById('main').scrollIntoView();return}if(e.target.closest('#backToResults')){state.view=state.returnView;render();return}const src=e.target.closest('[data-source]');if(src){state.view='sources';const languageId=src.dataset.sourceLanguage||state.data.sources.find(s=>s.source_id===src.dataset.source)?.language_ids?.[0];render();const target=document.getElementById('source-'+languageId+'-'+src.dataset.source);target?.scrollIntoView({block:'start'});return}const variety=e.target.closest('[data-variety]');if(variety){state.selectedVariety=variety.dataset.variety;render();return}if(e.target.closest('#excel'))exportExcel()});
document.addEventListener('change',e=>{if(e.target.id==='languageFilter'){state.selectedLanguage=e.target.value;state.selectedVariety='';render()}if(e.target.id==='varietyFilter'){state.selectedVariety=e.target.value;render()}});
document.addEventListener('input',e=>{if(e.target.id==='globalSearch'){const pos=e.target.selectionStart;state.search=e.target.value;render();const input=document.getElementById('globalSearch');input.focus();input.setSelectionRange(pos,pos)}});
load().catch(e=>{document.getElementById('main').innerHTML=`<h1>Data loading error / Ошибка загрузки данных</h1><p class="error">${esc(e.message)}</p><p>Open the site via GitHub Pages or a local HTTP server.</p>`;console.error(e)});
