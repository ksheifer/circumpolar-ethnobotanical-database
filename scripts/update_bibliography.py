#!/usr/bin/env python3
"""Normalize author display for Resources without changing attested names."""
import json
from pathlib import Path
p=Path(__file__).resolve().parents[1]/'data'/'sources.json'
sources=json.loads(p.read_text(encoding='utf-8'))
updates={
 'src_sadovnikova_2024':{'editors':'Нестерова Елена Васильевна (отв. ред.)'},
 'src_myreeva_2001':{'authors':'Мыреева Анна Николаевна'},
 'src_rakin_1989':{'authors':'Ракин Анатолий Николаевич'},
 'src_kuzmina_trees_shrubs_2016':{'authors':'Кузьмина Ангелина Афанасьевна'},
 'src_adaev_2023_nenets_food':{'authors':'Адаев Владимир Николаевич'},
 'src_aksyonova_et_al_2019_dolgan_ru':{'authors':'Аксёнова Е. Е.; Барболина А. А.; Кудрякова Н. С.; Жаркова Н. Н.; Фудзисиро С.; Петров А. А.','editors':'Петров А. А. (научный редактор)'},
 'src_afanasyev_voronkin_alekseev_1976':{'authors':'Афанасьев П. С.; Воронкин М. С.; Алексеев М. П.'},
 'src_makarov_biology_1974':{'authors':'Макаров А. А.','editors':'Афанасьев П. С.'},
 'src_belichenko_kolosova_jernigan_pupynina_2021':{'authors':'Belichenko Olga; Kolosova Valeria; Jernigan Kevin; Pupynina Maria'},
 'src_kurilova_2026_wadul':{'authors':'Kurilova Ladina G.'},
 'src_jochelson_yukaghir_1910_part_i':{'authors':'Jochelson Waldemar'},
 'src_jochelson_yukaghir_1924_part_ii':{'authors':'Jochelson Waldemar'},
 'src_jochelson_yukaghir_1926_part_iii':{'authors':'Jochelson Waldemar'},
 'src_laptander_2024_nenets_lichen':{'authors':'Laptander Roza; Stammler Florian; Forbes Bruce C.; Stark Sari'},
 'src_siegl_2013_forest_enets':{'authors':'Siegl Florian'},
 'src_janhunen_2025_samoyedic':{'authors':'Janhunen Juha'},
 'src_wratil_2018_samoyedic':{'authors':'Wratil Melani'},
 'src_degtyarenko_2026_enets':{'authors':'Degtyarenko Ksenia A.; Shurmanova Anna A.; Yuferova Sophia I.; Mikhailova Sofia A.; Garth Alexandra A.'},
}
for s in sources:
    s.update(updates.get(s['source_id'],{}))
p.write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Updated bibliographic authors/editors for',len(updates),'sources')
