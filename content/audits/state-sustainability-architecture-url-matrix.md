# #253 State sustainability architecture URL/file audit

- Sitemap routes: **4405**
- Sitemap routes without directly resolved source HTML: **0**
- Extra tracked source HTML not in sitemap: **12212**
- Routes with non-default #253 action: **3590**
- Routes with Wirkungsblindheit/novelty/absence claim signals: **253**

Contract fields on every matrix item: `source_path`, `public_url`, `historical_publication`, `relevance`, `classification`, `required_action`, `source_refs`, `status`.

## Routes requiring explicit #253 action

| Route | File | Classification | Signals |
|---|---|---|---|
| https://wirkungsoekonomie.de/ | `index.html` | CORRECT_OVERCLAIM, ADD_STATE_SUSTAINABILITY_ARCHITECTURE, ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/verstehen.html | `verstehen.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | dns, alternativen |
| https://wirkungsoekonomie.de/wirkungsoekonomie.html | `wirkungsoekonomie.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | dns |
| https://wirkungsoekonomie.de/modell.html | `modell.html` | CORRECT_OVERCLAIM, ADD_DNS_REFERENCE, ADD_GGO_GFA_REFERENCE | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/kompass.html | `kompass.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | nachhaltigkeitspruefung |
| https://wirkungsoekonomie.de/fuer/politik.html | `fuer/politik.html` | REWRITE_REQUIRED, ADD_GGO_GFA_REFERENCE, ADD_ENAP_REFERENCE, ADD_DNS_REFERENCE | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/evidenz/ | `evidenz/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/methodik/ | `methodik/index.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/methodik/datenbasis.html | `methodik/datenbasis.html` | ADD_DNS_REFERENCE, ADD_GGO_GFA_REFERENCE, ADD_ENAP_REFERENCE, ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/methodik/daten-standards-regularien.html | `methodik/daten-standards-regularien.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/methodik/externe-quellen.html | `methodik/externe-quellen.html` | ADD_DNS_REFERENCE, ADD_GGO_GFA_REFERENCE, ADD_ENAP_REFERENCE, ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/verstehen/ausgangslage/ | `verstehen/ausgangslage/index.html` | CORRECT_OVERCLAIM | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/ | `verstehen/sdgs-sdgplus/index.html` | ADD_DNS_REFERENCE | folgenabschaetzung, dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-1-keine-armut/ | `verstehen/sdgs-sdgplus/sdg-1-keine-armut/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-2-kein-hunger/ | `verstehen/sdgs-sdgplus/sdg-2-kein-hunger/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-3-gesundheit-wohlergehen/ | `verstehen/sdgs-sdgplus/sdg-3-gesundheit-wohlergehen/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-4-hochwertige-bildung/ | `verstehen/sdgs-sdgplus/sdg-4-hochwertige-bildung/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-5-geschlechtergleichstellung/ | `verstehen/sdgs-sdgplus/sdg-5-geschlechtergleichstellung/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-7-bezahlbare-saubere-energie/ | `verstehen/sdgs-sdgplus/sdg-7-bezahlbare-saubere-energie/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-9-industrie-innovation-infrastruktur/ | `verstehen/sdgs-sdgplus/sdg-9-industrie-innovation-infrastruktur/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-10-weniger-ungleichheiten/ | `verstehen/sdgs-sdgplus/sdg-10-weniger-ungleichheiten/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-12-nachhaltiger-konsum-produktion/ | `verstehen/sdgs-sdgplus/sdg-12-nachhaltiger-konsum-produktion/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-13-klimaschutz/ | `verstehen/sdgs-sdgplus/sdg-13-klimaschutz/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-14-leben-unter-wasser/ | `verstehen/sdgs-sdgplus/sdg-14-leben-unter-wasser/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-15-leben-an-land/ | `verstehen/sdgs-sdgplus/sdg-15-leben-an-land/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-16-frieden-gerechtigkeit-starke-institutionen/ | `verstehen/sdgs-sdgplus/sdg-16-frieden-gerechtigkeit-starke-institutionen/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-17-partnerschaften/ | `verstehen/sdgs-sdgplus/sdg-17-partnerschaften/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-6-sauberes-wasser-sanitaereinrichtungen/ | `verstehen/sdgs-sdgplus/sdg-6-sauberes-wasser-sanitaereinrichtungen/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum/ | `verstehen/sdgs-sdgplus/sdg-8-menschenwuerdige-arbeit-wirtschaftswachstum/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdg-11-nachhaltige-staedte-gemeinden/ | `verstehen/sdgs-sdgplus/sdg-11-nachhaltige-staedte-gemeinden/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/geschichte/ | `verstehen/sdgs-sdgplus/geschichte/index.html` | ADD_DNS_REFERENCE | — |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/detailkonzepte/sdgs-und-agenda-2030-als-globaler-referenzrahmen/ | `verstehen/sdgs-sdgplus/detailkonzepte/sdgs-und-agenda-2030-als-globaler-referenzrahmen/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/dossiers/sdgs-und-agenda-2030-als-globaler-referenzrahmen/ | `verstehen/sdgs-sdgplus/dossiers/sdgs-und-agenda-2030-als-globaler-referenzrahmen/index.html` | ADD_DNS_REFERENCE | folgenabschaetzung, dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/detailkonzepte/sdg-als-erweiterung-der-wirkungsoekonomie/ | `verstehen/sdgs-sdgplus/detailkonzepte/sdg-als-erweiterung-der-wirkungsoekonomie/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/dossiers/sdg-als-erweiterung-der-wirkungsoekonomie/ | `verstehen/sdgs-sdgplus/dossiers/sdg-als-erweiterung-der-wirkungsoekonomie/index.html` | ADD_DNS_REFERENCE | folgenabschaetzung, dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/detailkonzepte/sdg-unterziele-global-europa-und-deutschland/ | `verstehen/sdgs-sdgplus/detailkonzepte/sdg-unterziele-global-europa-und-deutschland/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/dossiers/sdg-unterziele-global-europa-und-deutschland/ | `verstehen/sdgs-sdgplus/dossiers/sdg-unterziele-global-europa-und-deutschland/index.html` | ADD_DNS_REFERENCE | folgenabschaetzung, dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/agenda-2030/ | `verstehen/sdgs-sdgplus/agenda-2030/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/sdgplus/ | `verstehen/sdgs-sdgplus/sdgplus/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/ | `verstehen/sdgs-sdgplus/unterziele/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-1/ | `verstehen/sdgs-sdgplus/unterziele/sdg-1/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-2/ | `verstehen/sdgs-sdgplus/unterziele/sdg-2/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-3/ | `verstehen/sdgs-sdgplus/unterziele/sdg-3/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-4/ | `verstehen/sdgs-sdgplus/unterziele/sdg-4/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-5/ | `verstehen/sdgs-sdgplus/unterziele/sdg-5/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-6/ | `verstehen/sdgs-sdgplus/unterziele/sdg-6/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-7/ | `verstehen/sdgs-sdgplus/unterziele/sdg-7/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-8/ | `verstehen/sdgs-sdgplus/unterziele/sdg-8/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-9/ | `verstehen/sdgs-sdgplus/unterziele/sdg-9/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-10/ | `verstehen/sdgs-sdgplus/unterziele/sdg-10/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-11/ | `verstehen/sdgs-sdgplus/unterziele/sdg-11/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-12/ | `verstehen/sdgs-sdgplus/unterziele/sdg-12/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-13/ | `verstehen/sdgs-sdgplus/unterziele/sdg-13/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-14/ | `verstehen/sdgs-sdgplus/unterziele/sdg-14/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-15/ | `verstehen/sdgs-sdgplus/unterziele/sdg-15/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-16/ | `verstehen/sdgs-sdgplus/unterziele/sdg-16/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/unterziele/sdg-17/ | `verstehen/sdgs-sdgplus/unterziele/sdg-17/index.html` | ADD_DNS_REFERENCE | dns, evaluation |
| https://wirkungsoekonomie.de/verstehen/sdgs-sdgplus/risikomanagement-finanzmarkt/ | `verstehen/sdgs-sdgplus/risikomanagement-finanzmarkt/index.html` | ADD_DNS_REFERENCE | evaluation |
| https://wirkungsoekonomie.de/verstehen/woek-auf-einer-seite/ | `verstehen/woek-auf-einer-seite/index.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | wirkungsblind, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/bibliothek/wirkungsdilemmata-kooperation-sdgplus-gesamtstudie/ | `bibliothek/wirkungsdilemmata-kooperation-sdgplus-gesamtstudie/index.html` | REVIEW_REQUIRED | wirkungsblind, folgenabschaetzung, alternativen, evaluation |
| https://wirkungsoekonomie.de/bibliothek/wirkungssteuer-wstg-3-0/ | `bibliothek/wirkungssteuer-wstg-3-0/index.html` | REVIEW_REQUIRED | alternativen, evaluation |
| https://wirkungsoekonomie.de/blog/nachhaltigkeit-ist-keine-parteifarbe.html | `blog/nachhaltigkeit-ist-keine-parteifarbe.html` | NO_CHANGE_REQUIRED, CURRENT_REFERENCE | folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, alternativen, evaluation, novelty_or_absence |
| https://wirkungsoekonomie.de/blog/enap-woek-benchmark-fuenf-bundesvorhaben.html | `blog/enap-woek-benchmark-fuenf-bundesvorhaben.html` | BENCHMARK_REFERENCE, ADD_BENCHMARK_COMPARISON | folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, alternativen, evaluation, novelty_or_absence |
| https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/ | `bibliothek/woek-begriffsleitfaden-fuehrend/index.html` | REVIEW_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence |
| https://wirkungsoekonomie.de/bibliothek/woek-master-items-register/ | `bibliothek/woek-master-items-register/index.html` | REVIEW_REQUIRED | — |
| https://wirkungsoekonomie.de/wirkungswissenschaften/ | `wirkungswissenschaften/index.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/wirkungsfelder/staat-recht-demokratie/ | `wirkungsfelder/staat-recht-demokratie/index.html` | CORRECT_OVERCLAIM, ADD_STATE_SUSTAINABILITY_ARCHITECTURE | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/wirkungsfelder/staat-recht-demokratie/wirkung-als-rechtsprinzip-wstg/ | `wirkungsfelder/staat-recht-demokratie/wirkung-als-rechtsprinzip-wstg/index.html` | ADD_GGO_GFA_REFERENCE | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/wirkungsfelder/staat-recht-demokratie/wirkungshaushalt/ | `wirkungsfelder/staat-recht-demokratie/wirkungshaushalt/index.html` | ADDENDUM_REQUIRED | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/wirkungsfelder/staat-recht-demokratie/wirkungsrat-governance/ | `wirkungsfelder/staat-recht-demokratie/wirkungsrat-governance/index.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/wirkungsfelder/staat-recht-demokratie/staat-als-wirkungsarchitektur-resilienzstaat/ | `wirkungsfelder/staat-recht-demokratie/staat-als-wirkungsarchitektur-resilienzstaat/index.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/ | `werkstatt/dossiers/staat-recht-demokratie/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/ | `werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/wirkung-als-rechtsprinzip/ | `werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/wirkung-als-rechtsprinzip/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/wirkung-als-rechtsprinzip/ | `werkstatt/dossiers/staat-recht-demokratie/wirkung-als-rechtsprinzip/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/wirkungssteuergesetz-wstg/ | `werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/wirkungssteuergesetz-wstg/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/wirkungssteuergesetz-wstg/ | `werkstatt/dossiers/staat-recht-demokratie/wirkungssteuergesetz-wstg/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/wirkungsumsatzsteuer-rechtsrahmen/ | `werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/wirkungsumsatzsteuer-rechtsrahmen/index.html` | REVIEW_REQUIRED | evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/wirkungsumsatzsteuer-rechtsrahmen/ | `werkstatt/dossiers/staat-recht-demokratie/wirkungsumsatzsteuer-rechtsrahmen/index.html` | REVIEW_REQUIRED | evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/wirkungseinkommensteuer-westg/ | `werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/wirkungseinkommensteuer-westg/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/wirkungseinkommensteuer-westg/ | `werkstatt/dossiers/staat-recht-demokratie/wirkungseinkommensteuer-westg/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/wirkungshaushalt/ | `werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/wirkungshaushalt/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/wirkungshaushalt/ | `werkstatt/dossiers/staat-recht-demokratie/wirkungshaushalt/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/wirkungsrat/ | `werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/wirkungsrat/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/wirkungsrat/ | `werkstatt/dossiers/staat-recht-demokratie/wirkungsrat/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/verwaltung-rechtsschutz-korrektur/ | `werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/verwaltung-rechtsschutz-korrektur/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/verwaltung-rechtsschutz-korrektur/ | `werkstatt/dossiers/staat-recht-demokratie/verwaltung-rechtsschutz-korrektur/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/politische-wirkungspruefung/ | `werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/politische-wirkungspruefung/index.html` | REVIEW_REQUIRED | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/politische-wirkungspruefung/ | `werkstatt/dossiers/staat-recht-demokratie/politische-wirkungspruefung/index.html` | REWRITE_OR_ADDENDUM_REQUIRED, ADD_GGO_GFA_REFERENCE, ADD_ENAP_REFERENCE | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/lobbyismus-machtkonzentration/ | `werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/lobbyismus-machtkonzentration/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/lobbyismus-machtkonzentration/ | `werkstatt/dossiers/staat-recht-demokratie/lobbyismus-machtkonzentration/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/buergerbeteiligung-wirkungsdemokratie/ | `werkstatt/dossiers/staat-recht-demokratie/detailkonzepte/buergerbeteiligung-wirkungsdemokratie/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/werkstatt/dossiers/staat-recht-demokratie/buergerbeteiligung-wirkungsdemokratie/ | `werkstatt/dossiers/staat-recht-demokratie/buergerbeteiligung-wirkungsdemokratie/index.html` | REVIEW_REQUIRED | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/referenz/aktualisierung/ | `referenz/aktualisierung/index.html` | REVIEW_REQUIRED, ADD_DNS_REFERENCE | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/ | `begriffe/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/7-bundeshaushaltsordnung/ | `begriffe/7-bundeshaushaltsordnung/index.html` | ADD_GLOSSARY_CROSSLINKS | nachhaltigkeitspruefung, enap, dns |
| https://wirkungsoekonomie.de/begriffe/fuenftes-p-planet/ | `begriffe/fuenftes-p-planet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sechster-kondratieff/ | `begriffe/sechster-kondratieff/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/abfallhierarchie/ | `begriffe/abfallhierarchie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/abregelung/ | `begriffe/abregelung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ac-laden/ | `begriffe/ac-laden/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ad-hoc-laden/ | `begriffe/ad-hoc-laden/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/adam-smith/ | `begriffe/adam-smith/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/adoe/ | `begriffe/adoe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/adoptions-und-verhaltensaenderungsplan/ | `begriffe/adoptions-und-verhaltensaenderungsplan/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/adverse-selection/ | `begriffe/adverse-selection/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/advocacy-organisation/ | `begriffe/advocacy-organisation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/afd-ideologie/ | `begriffe/afd-ideologie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/affekt/ | `begriffe/affekt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/affektheuristik/ | `begriffe/affektheuristik/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/agenda-2030/ | `begriffe/agenda-2030/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/agenda-setting/ | `begriffe/agenda-setting/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/agentische-delegations-und-orchestrierungsarchitektur/ | `begriffe/agentische-delegations-und-orchestrierungsarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ai-act/ | `begriffe/ai-act/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/akkumulation/ | `begriffe/akkumulation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/akkumulator/ | `begriffe/akkumulator/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/aktivitaet/ | `begriffe/aktivitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/alan-watts-daoismus/ | `begriffe/alan-watts-daoismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/alarm-frame/ | `begriffe/alarm-frame/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/algorithmische-fairness/ | `begriffe/algorithmische-fairness/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/algorithmische-verstaerkung/ | `begriffe/algorithmische-verstaerkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/allgemeines-gleichgewicht/ | `begriffe/allgemeines-gleichgewicht/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/allmende/ | `begriffe/allmende/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/allmendedilemma/ | `begriffe/allmendedilemma/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/allmendeproblem/ | `begriffe/allmendeproblem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/allokation/ | `begriffe/allokation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/alltag-2035/ | `begriffe/alltag-2035/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/alltagsladen/ | `begriffe/alltagsladen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/alltagsrassismus/ | `begriffe/alltagsrassismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/amartya-sen/ | `begriffe/amartya-sen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/amathia/ | `begriffe/amathia/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/ambiguitaetsintoleranz/ | `begriffe/ambiguitaetsintoleranz/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/america-first/ | `begriffe/america-first/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/anaerobe-vergaerung/ | `begriffe/anaerobe-vergaerung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/anarchokapitalismus/ | `begriffe/anarchokapitalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/angstappell/ | `begriffe/angstappell/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/ankereffekt/ | `begriffe/ankereffekt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/anlagenpass/ | `begriffe/anlagenpass/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/annahmen-und-unsicherheitslandkarte/ | `begriffe/annahmen-und-unsicherheitslandkarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/anpassungsfaehigkeit/ | `begriffe/anpassungsfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/anpassungskapazitaet/ | `begriffe/anpassungskapazitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/anschlussfaehigkeit/ | `begriffe/anschlussfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/anschlusskosten/ | `begriffe/anschlusskosten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/anschlussleistung/ | `begriffe/anschlussleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/anti-slapp-richtlinie/ | `begriffe/anti-slapp-richtlinie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/anticommons/ | `begriffe/anticommons/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/antidiskriminierung/ | `begriffe/antidiskriminierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/antikollisionssystem/ | `begriffe/antikollisionssystem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/antisemitismus/ | `begriffe/antisemitismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/antiziganismus/ | `begriffe/antiziganismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/anwendungskontext/ | `begriffe/anwendungskontext/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/arbeiten-arendt/ | `begriffe/arbeiten-arendt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/arbeitsanreiz/ | `begriffe/arbeitsanreiz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/arbeitspreis/ | `begriffe/arbeitspreis/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/arbitrageur/ | `begriffe/arbitrageur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/archetyp/ | `begriffe/archetyp/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/archetypen/ | `begriffe/archetypen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/architekturprinzipien-und-entscheidungsprotokolle/ | `begriffe/architekturprinzipien-und-entscheidungsprotokolle/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/art-2-euv-werte-der-europaeischen-union/ | `begriffe/art-2-euv-werte-der-europaeischen-union/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/art-3-euv-nachhaltige-entwicklung-europas/ | `begriffe/art-3-euv-nachhaltige-entwicklung-europas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/art-11-aeuv-umweltintegrationsprinzip/ | `begriffe/art-11-aeuv-umweltintegrationsprinzip/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/art-20a-gg/ | `begriffe/art-20a-gg/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/art-37-eu-grundrechtecharta-umweltschutz/ | `begriffe/art-37-eu-grundrechtecharta-umweltschutz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/art-191-aeuv-vorsorge-praeventions-und-verursacherprinzip/ | `begriffe/art-191-aeuv-vorsorge-praeventions-und-verursacherprinzip/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/artikel-20a-grundgesetz/ | `begriffe/artikel-20a-grundgesetz/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/assurance/ | `begriffe/assurance/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/assurance-game/ | `begriffe/assurance-game/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/astroturfing/ | `begriffe/astroturfing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/atlas-network/ | `begriffe/atlas-network/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/attraktor/ | `begriffe/attraktor/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/attributionsfehler/ | `begriffe/attributionsfehler/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/attributionsforschung/ | `begriffe/attributionsforschung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/audit/ | `begriffe/audit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/aufmerksamkeit/ | `begriffe/aufmerksamkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/aufmerksamkeitsoekonomie/ | `begriffe/aufmerksamkeitsoekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/aufschubnarrativ/ | `begriffe/aufschubnarrativ/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/aufstocker/ | `begriffe/aufstocker/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/aufwaertswettbewerb/ | `begriffe/aufwaertswettbewerb/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/ausland-statt-inland-narrativ/ | `begriffe/ausland-statt-inland-narrativ/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ausloeser/ | `begriffe/ausloeser/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/aeussere-loops/ | `begriffe/aeussere-loops/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/austeritaet/ | `begriffe/austeritaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/autokratie/ | `begriffe/autokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/autokratisierung/ | `begriffe/autokratisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/automatisierung/ | `begriffe/automatisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/automatisierungsdividende/ | `begriffe/automatisierungsdividende/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/automatisierungsrendite/ | `begriffe/automatisierungsrendite/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/autonome-systeme/ | `begriffe/autonome-systeme/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/autopoiesis/ | `begriffe/autopoiesis/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/autoritaeres-wirkungspotenzial/ | `begriffe/autoritaeres-wirkungspotenzial/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/autoritarismus/ | `begriffe/autoritarismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/autoritaetsbias/ | `begriffe/autoritaetsbias/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/backend-ladeinfrastruktur/ | `begriffe/backend-ladeinfrastruktur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/backfire-effekt/ | `begriffe/backfire-effekt/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/backup-kapazitaet/ | `begriffe/backup-kapazitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/banalitaet-des-boesen/ | `begriffe/banalitaet-des-boesen/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/bandluecke/ | `begriffe/bandluecke/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bandwagon-effekt/ | `begriffe/bandwagon-effekt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/barrier-bow-tie-und-kontrollwirksamkeitskarte/ | `begriffe/barrier-bow-tie-und-kontrollwirksamkeitskarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/baseline/ | `begriffe/baseline/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/baseline-verschiebung/ | `begriffe/baseline-verschiebung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/basisinnovation/ | `begriffe/basisinnovation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/batterie/ | `begriffe/batterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/batteriealterung/ | `begriffe/batteriealterung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/batterielebenszyklus/ | `begriffe/batterielebenszyklus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/batteriemanagementsystem/ | `begriffe/batteriemanagementsystem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/batteriemodul/ | `begriffe/batteriemodul/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/batteriepack/ | `begriffe/batteriepack/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/batteriepass/ | `begriffe/batteriepass/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/batterierecycling/ | `begriffe/batterierecycling/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/batterierohstoffe/ | `begriffe/batterierohstoffe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/batteriespeicher/ | `begriffe/batteriespeicher/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/batteriezelle/ | `begriffe/batteriezelle/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/baukostenzuschuss/ | `begriffe/baukostenzuschuss/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bedeutung-als-gebrauch/ | `begriffe/bedeutung-als-gebrauch/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bedingte-kooperation/ | `begriffe/bedingte-kooperation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bedingungsloses-grundeinkommen/ | `begriffe/bedingungsloses-grundeinkommen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bedrohungsverarbeitung/ | `begriffe/bedrohungsverarbeitung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/befaehigung-capabilities/ | `begriffe/befaehigung-capabilities/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/befaehigungs-und-qualifizierungsplan/ | `begriffe/befaehigungs-und-qualifizierungsplan/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/begrenzte-rationalitaet/ | `begriffe/begrenzte-rationalitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/behoerde/ | `begriffe/behoerde/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/beitragsanalyse/ | `begriffe/beitragsanalyse/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/beitragsbasis/ | `begriffe/beitragsbasis/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/beitragsluecke/ | `begriffe/beitragsluecke/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/belohnungslernen/ | `begriffe/belohnungslernen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/benchmark/ | `begriffe/benchmark/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/benchmarks/ | `begriffe/benchmarks/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/benefit-impact-owner-und-uebergabe-in-den-regelbetrieb/ | `begriffe/benefit-impact-owner-und-uebergabe-in-den-regelbetrieb/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/beobachterabhaengigkeit/ | `begriffe/beobachterabhaengigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/beobachtung-zweiter-ordnung/ | `begriffe/beobachtung-zweiter-ordnung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/berichtsdaten/ | `begriffe/berichtsdaten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/beschaffung-als-wirkungshebel/ | `begriffe/beschaffung-als-wirkungshebel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/beschwerdemechanismus-access-to-remedy/ | `begriffe/beschwerdemechanismus-access-to-remedy/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bestands-und-flussmodell/ | `begriffe/bestands-und-flussmodell/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bestandsimmobilie/ | `begriffe/bestandsimmobilie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bestaetigungsfehler/ | `begriffe/bestaetigungsfehler/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/beteiligungs-und-repraesentationsdesign/ | `begriffe/beteiligungs-und-repraesentationsdesign/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/betriebsemissionen/ | `begriffe/betriebsemissionen/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/betroffenenperspektive/ | `begriffe/betroffenenperspektive/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bewegungs-ngo/ | `begriffe/bewegungs-ngo/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bidirektionales-laden/ | `begriffe/bidirektionales-laden/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bilanzgrenze/ | `begriffe/bilanzgrenze/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bilanzraum/ | `begriffe/bilanzraum/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/biochemische-rohstoffgewinnung/ | `begriffe/biochemische-rohstoffgewinnung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/biodiversitaet/ | `begriffe/biodiversitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/biodiversitaetsrisiko/ | `begriffe/biodiversitaetsrisiko/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/biodiversity-net-gain-no-net-loss/ | `begriffe/biodiversity-net-gain-no-net-loss/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bioenergie/ | `begriffe/bioenergie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/biogas/ | `begriffe/biogas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/biologischer-kreislauf/ | `begriffe/biologischer-kreislauf/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/biologischer-naehrstoff/ | `begriffe/biologischer-naehrstoff/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/biomasse/ | `begriffe/biomasse/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/bip/ | `begriffe/bip/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/black-mass/ | `begriffe/black-mass/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/blauer-wasserstoff/ | `begriffe/blauer-wasserstoff/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/blei-saeure-batterie/ | `begriffe/blei-saeure-batterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/blindleistung/ | `begriffe/blindleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/blindschulden/ | `begriffe/blindschulden/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/bne/ | `begriffe/bne/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/both-sidesism/ | `begriffe/both-sidesism/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bozo-explosion/ | `begriffe/bozo-explosion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bozo-implosion/ | `begriffe/bozo-implosion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/brennstoffkette/ | `begriffe/brennstoffkette/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/brutblanket/ | `begriffe/brutblanket/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bruttokreditaufnahme/ | `begriffe/bruttokreditaufnahme/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bullshit-asymmetrie-brandolinis-gesetz/ | `begriffe/bullshit-asymmetrie-brandolinis-gesetz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bundesregierung/ | `begriffe/bundesregierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/buergerbeteiligung/ | `begriffe/buergerbeteiligung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/buergerenergie/ | `begriffe/buergerenergie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/buergerenergiegesellschaft/ | `begriffe/buergerenergiegesellschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/buergerinitiative/ | `begriffe/buergerinitiative/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/buergerrat/ | `begriffe/buergerrat/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/business-ecosystem/ | `begriffe/business-ecosystem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/business-impact-analysis-fuer-kritische-wirkungsservices/ | `begriffe/business-impact-analysis-fuer-kritische-wirkungsservices/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/business-model/ | `begriffe/business-model/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/business-model-canvas/ | `begriffe/business-model-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/business-value/ | `begriffe/business-value/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/business-architecture-systemkarte/ | `begriffe/business-architecture-systemkarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/bystander-effekt/ | `begriffe/bystander-effekt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/c-rate/ | `begriffe/c-rate/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/cancel-culture/ | `begriffe/cancel-culture/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/cancel-dynamiken/ | `begriffe/cancel-dynamiken/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/canvas-mindeststandard/ | `begriffe/canvas-mindeststandard/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/capability-abhaengigkeitsnetz/ | `begriffe/capability-abhaengigkeitsnetz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/capability-gap-und-investitionspriorisierung/ | `begriffe/capability-gap-und-investitionspriorisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/capability-reifegrad-und-heatmap/ | `begriffe/capability-reifegrad-und-heatmap/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/capability-to-impact-matrix/ | `begriffe/capability-to-impact-matrix/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/capex/ | `begriffe/capex/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/capex-plan/ | `begriffe/capex-plan/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/capture/ | `begriffe/capture/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/capture-price/ | `begriffe/capture-price/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/carbon-budget/ | `begriffe/carbon-budget/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/carbon-credits/ | `begriffe/carbon-credits/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/carbonfaserverstaerkter-kunststoff/ | `begriffe/carbonfaserverstaerkter-kunststoff/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/care-feministische-oekonomie/ | `begriffe/care-feministische-oekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/care-oekonomie/ | `begriffe/care-oekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/cbam-co2-grenzausgleichssystem/ | `begriffe/cbam-co2-grenzausgleichssystem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/cbam/ | `begriffe/cbam/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/cbam-und-grenzausgleich/ | `begriffe/cbam-und-grenzausgleich/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/ccs-ladestecker/ | `begriffe/ccs-ladestecker/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/chademo/ | `begriffe/chademo/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/change-story-und-kommunikationsarchitektur/ | `begriffe/change-story-und-kommunikationsarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/change-impact-und-betroffenheitsanalyse/ | `begriffe/change-impact-und-betroffenheitsanalyse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/change-netzwerk-und-multiplikatorenmodell/ | `begriffe/change-netzwerk-und-multiplikatorenmodell/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/checks-and-balances/ | `begriffe/checks-and-balances/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/cherry-picking/ | `begriffe/cherry-picking/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/chicago-school/ | `begriffe/chicago-school/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/chicken-game/ | `begriffe/chicken-game/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/circular-regenerative-economy/ | `begriffe/circular-regenerative-economy/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/circular-economy-butterfly-model/ | `begriffe/circular-economy-butterfly-model/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zirkularitaetsindikator/ | `begriffe/zirkularitaetsindikator/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/civic-literacy/ | `begriffe/civic-literacy/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/clean-industrial-deal/ | `begriffe/clean-industrial-deal/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/climate-neutral-claim/ | `begriffe/climate-neutral-claim/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/co2-preis/ | `begriffe/co2-preis/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/co2e/ | `begriffe/co2e/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/coase-theorem/ | `begriffe/coase-theorem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/cognitive-ease/ | `begriffe/cognitive-ease/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/commons/ | `begriffe/commons/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/commons-gemeingueter/ | `begriffe/commons-gemeingueter/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/conflict-minerals-regulation/ | `begriffe/conflict-minerals-regulation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/contracts-for-difference/ | `begriffe/contracts-for-difference/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/cooling-off-regel/ | `begriffe/cooling-off-regel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/corporate-capture/ | `begriffe/corporate-capture/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/counterfactual/ | `begriffe/counterfactual/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/cradle-to-cradle/ | `begriffe/cradle-to-cradle/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/cradle-to-gate/ | `begriffe/cradle-to-gate/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/cradle-to-grave/ | `begriffe/cradle-to-grave/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/creator-als-oeffentliche-akteure/ | `begriffe/creator-als-oeffentliche-akteure/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/crrem/ | `begriffe/crrem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/csddd/ | `begriffe/csddd/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/csddd-corporate-sustainability-due-diligence-directive/ | `begriffe/csddd-corporate-sustainability-due-diligence-directive/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/cso/ | `begriffe/cso/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/csrd/ | `begriffe/csrd/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/cyberresilienz/ | `begriffe/cyberresilienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/d-und-o/ | `begriffe/d-und-o/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/daempfungsfaehigkeit/ | `begriffe/daempfungsfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dao/ | `begriffe/dao/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/daoismus/ | `begriffe/daoismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dark-money/ | `begriffe/dark-money/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/daseinsvorsorge/ | `begriffe/daseinsvorsorge/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/data-lineage-und-evidenzherkunftskarte/ | `begriffe/data-lineage-und-evidenzherkunftskarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/daten-und-fruehwarnkooperation/ | `begriffe/daten-und-fruehwarnkooperation/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/datenluecke/ | `begriffe/datenluecke/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/datenprodukt-canvas/ | `begriffe/datenprodukt-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/datenqualitaet/ | `begriffe/datenqualitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/datenqualitaets-und-evidenzmatrix/ | `begriffe/datenqualitaets-und-evidenzmatrix/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/datenschutz/ | `begriffe/datenschutz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/datenstandard/ | `begriffe/datenstandard/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dc-laden/ | `begriffe/dc-laden/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/deal/ | `begriffe/deal/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/debiasing/ | `begriffe/debiasing/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/deep-state/ | `begriffe/deep-state/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/deformation-professionnelle/ | `begriffe/deformation-professionnelle/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/degradation-batterie/ | `begriffe/degradation-batterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/degrowth-postwachstum/ | `begriffe/degrowth-postwachstum/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dehumanisierung/ | `begriffe/dehumanisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/deindustrialisierungsnarrativ/ | `begriffe/deindustrialisierungsnarrativ/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dekohaerenz/ | `begriffe/dekohaerenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/deliberation/ | `begriffe/deliberation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/deliberative-demokratie/ | `begriffe/deliberative-demokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demand-response/ | `begriffe/demand-response/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratie/ | `begriffe/demokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratie-umdeutung/ | `begriffe/demokratie-umdeutung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratiefeindlichkeit/ | `begriffe/demokratiefeindlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratiekompetenz/ | `begriffe/demokratiekompetenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratieprinzip/ | `begriffe/demokratieprinzip/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratiequalitaet/ | `begriffe/demokratiequalitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratieskepsis/ | `begriffe/demokratieskepsis/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratische-erosion/ | `begriffe/demokratische-erosion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratische-gegenwirkung/ | `begriffe/demokratische-gegenwirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratische-korrekturfaehigkeit/ | `begriffe/demokratische-korrekturfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratische-oeffentlichkeit/ | `begriffe/demokratische-oeffentlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratische-resilienz/ | `begriffe/demokratische-resilienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratische-resilienz-gegen-extremismus/ | `begriffe/demokratische-resilienz-gegen-extremismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratische-rueckkopplung/ | `begriffe/demokratische-rueckkopplung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratische-staatsschuld/ | `begriffe/demokratische-staatsschuld/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratische-wirkungsarchitektur/ | `begriffe/demokratische-wirkungsarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratischer-sozialismus/ | `begriffe/demokratischer-sozialismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/demokratisches-mandat/ | `begriffe/demokratisches-mandat/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/depotladen/ | `begriffe/depotladen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/derailing-themenverschiebung/ | `begriffe/derailing-themenverschiebung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/deregulierung/ | `begriffe/deregulierung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/design-for-disassembly/ | `begriffe/design-for-disassembly/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/design-thinking/ | `begriffe/design-thinking/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/desinformation/ | `begriffe/desinformation/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/destruktive-vertrauensbindung/ | `begriffe/destruktive-vertrauensbindung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/destruktives-narrativ/ | `begriffe/destruktives-narrativ/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/deutsche-nachhaltigkeitsstrategie/ | `begriffe/deutsche-nachhaltigkeitsstrategie/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, dns |
| https://wirkungsoekonomie.de/begriffe/dezentralisierung/ | `begriffe/dezentralisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dezentralisierung-von-macht/ | `begriffe/dezentralisierung-von-macht/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/diffusion/ | `begriffe/diffusion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/digital-ki-plattform-standards/ | `begriffe/digital-ki-plattform-standards/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/digitale-selbstbestimmung/ | `begriffe/digitale-selbstbestimmung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/digitaler-produktpass/ | `begriffe/digitaler-produktpass/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/digitalisierung/ | `begriffe/digitalisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/digitalisierung-als-infrastruktur-der-wirkungsoekonomie/ | `begriffe/digitalisierung-als-infrastruktur-der-wirkungsoekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/diktatur/ | `begriffe/diktatur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/direkte-demokratie/ | `begriffe/direkte-demokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/direkte-elektrifizierung/ | `begriffe/direkte-elektrifizierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/direktrecycling-batterie/ | `begriffe/direktrecycling-batterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/direktstrom/ | `begriffe/direktstrom/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/discovery-delivery-wirkungslernloop/ | `begriffe/discovery-delivery-wirkungslernloop/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/diskriminierungsverbot/ | `begriffe/diskriminierungsverbot/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/diskursfaehigkeit/ | `begriffe/diskursfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/diskurskultur/ | `begriffe/diskurskultur/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/diskursqualitaet/ | `begriffe/diskursqualitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/diskursraum/ | `begriffe/diskursraum/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dissonanzrationalisierung/ | `begriffe/dissonanzrationalisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/dissonanzreduktion/ | `begriffe/dissonanzreduktion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dns-indikator/ | `begriffe/dns-indikator/index.html` | ADD_GLOSSARY_CROSSLINKS | dns |
| https://wirkungsoekonomie.de/begriffe/dnsh-do-no-significant-harm/ | `begriffe/dnsh-do-no-significant-harm/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dog-whistle/ | `begriffe/dog-whistle/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dominanzlogik/ | `begriffe/dominanzlogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/donella-meadows/ | `begriffe/donella-meadows/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/donor-dependency/ | `begriffe/donor-dependency/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/donut-oekonomie/ | `begriffe/donut-oekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/doppelte-wesentlichkeit/ | `begriffe/doppelte-wesentlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dora/ | `begriffe/dora/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dosis/ | `begriffe/dosis/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dosis-wirkungs-beziehung/ | `begriffe/dosis-wirkungs-beziehung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/downcycling/ | `begriffe/downcycling/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/drehtuer-effekt/ | `begriffe/drehtuer-effekt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dsa/ | `begriffe/dsa/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dsa-digital-services-act/ | `begriffe/dsa-digital-services-act/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dsgvo/ | `begriffe/dsgvo/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dunkelflaute/ | `begriffe/dunkelflaute/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dunning-kruger-effekt/ | `begriffe/dunning-kruger-effekt/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/dynamischer-stromtarif/ | `begriffe/dynamischer-stromtarif/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/dynamisches-lastmanagement/ | `begriffe/dynamisches-lastmanagement/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/e-fuel/ | `begriffe/e-fuel/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/e-gesetzgebung/ | `begriffe/e-gesetzgebung/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa |
| https://wirkungsoekonomie.de/begriffe/eba/ | `begriffe/eba/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eba-leitlinien-esg-risiken/ | `begriffe/eba-leitlinien-esg-risiken/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ecg-gwoe/ | `begriffe/ecg-gwoe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/echokammer/ | `begriffe/echokammer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eeg/ | `begriffe/eeg/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/effektivitaet/ | `begriffe/effektivitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/effektivitaet-vs-effizienz/ | `begriffe/effektivitaet-vs-effizienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/effizienz/ | `begriffe/effizienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/efrag/ | `begriffe/efrag/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/efuels/ | `begriffe/efuels/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/ehrenamt/ | `begriffe/ehrenamt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ehrliche-preise/ | `begriffe/ehrliche-preise/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/eichrecht-ladeinfrastruktur/ | `begriffe/eichrecht-ladeinfrastruktur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eigengruppen-homogenitaetsverzerrung/ | `begriffe/eigengruppen-homogenitaetsverzerrung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eigentum-mit-wirkungspflicht/ | `begriffe/eigentum-mit-wirkungspflicht/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eigentum-verpflichtet/ | `begriffe/eigentum-verpflichtet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eigentumsangst/ | `begriffe/eigentumsangst/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eigentumsrechte/ | `begriffe/eigentumsrechte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eigentumsverantwortung/ | `begriffe/eigentumsverantwortung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eigenversorgung/ | `begriffe/eigenversorgung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/einparteienstaat/ | `begriffe/einparteienstaat/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/einspeisemanagement/ | `begriffe/einspeisemanagement/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/einspeiseverguetung/ | `begriffe/einspeiseverguetung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eiopa/ | `begriffe/eiopa/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/elektorale-autokratie/ | `begriffe/elektorale-autokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/elektrolyse/ | `begriffe/elektrolyse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/elektromobilitaet/ | `begriffe/elektromobilitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/elektromobilitaetsdienstleister/ | `begriffe/elektromobilitaetsdienstleister/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/elektronische-nachhaltigkeitspruefung/ | `begriffe/elektronische-nachhaltigkeitspruefung/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns |
| https://wirkungsoekonomie.de/begriffe/elinor-ostrom/ | `begriffe/elinor-ostrom/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/emergenz/ | `begriffe/emergenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/emergenz-des-klassischen/ | `begriffe/emergenz-des-klassischen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/emissionsfaktor/ | `begriffe/emissionsfaktor/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/emissionshandel/ | `begriffe/emissionshandel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/emotionale-arbeit/ | `begriffe/emotionale-arbeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/emotionsregulation/ | `begriffe/emotionsregulation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/empoerungsbewirtschaftung/ | `begriffe/empoerungsbewirtschaftung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/empowering-consumers-green-transition/ | `begriffe/empowering-consumers-green-transition/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/end-to-end-prozessarchitektur/ | `begriffe/end-to-end-prozessarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/endenergie/ | `begriffe/endenergie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/endlager/ | `begriffe/endlager/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/endogenes-geld/ | `begriffe/endogenes-geld/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/enemy-of-the-people/ | `begriffe/enemy-of-the-people/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energetische-sanierung/ | `begriffe/energetische-sanierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energie/ | `begriffe/energie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energiearmut/ | `begriffe/energiearmut/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/energieautonomie/ | `begriffe/energieautonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energiedichte/ | `begriffe/energiedichte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energieeffizienz/ | `begriffe/energieeffizienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energiefluss/ | `begriffe/energiefluss/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energieflussstrom/ | `begriffe/energieflussstrom/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energiegemeinschaft/ | `begriffe/energiegemeinschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energiegenossenschaft/ | `begriffe/energiegenossenschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energieinfrastruktur/ | `begriffe/energieinfrastruktur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energiemanagementsystem/ | `begriffe/energiemanagementsystem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energiesicherheit/ | `begriffe/energiesicherheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energietraeger/ | `begriffe/energietraeger/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energietraegerstrom/ | `begriffe/energietraegerstrom/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energieumwandlung/ | `begriffe/energieumwandlung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energiewende/ | `begriffe/energiewende/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energiewirtschaft/ | `begriffe/energiewirtschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energiewirtschaftsgesetz/ | `begriffe/energiewirtschaftsgesetz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energy-sharing/ | `begriffe/energy-sharing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/energy-only-markt/ | `begriffe/energy-only-markt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/engpass-und-reverse-merit-analyse/ | `begriffe/engpass-und-reverse-merit-analyse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/engpass-verschwendungs-und-externalitaetenanalyse/ | `begriffe/engpass-verschwendungs-und-externalitaetenanalyse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/engpasslogik/ | `begriffe/engpasslogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/enterprise-risk-management-nach-wirkung/ | `begriffe/enterprise-risk-management-nach-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/entfremdung/ | `begriffe/entfremdung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/entmenschlichender-kampfbegriff/ | `begriffe/entmenschlichender-kampfbegriff/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/entmenschlichung/ | `begriffe/entmenschlichung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/entropie/ | `begriffe/entropie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/entscheidungsklassen-und-reversibilitaetscheck/ | `begriffe/entscheidungsklassen-und-reversibilitaetscheck/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/entscheidungskontext-und-komplexitaetscheck/ | `begriffe/entscheidungskontext-und-komplexitaetscheck/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/entscheidungslog-pre-mortem-und-evidenzupdate/ | `begriffe/entscheidungslog-pre-mortem-und-evidenzupdate/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/entwicklungskredit/ | `begriffe/entwicklungskredit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/environmental-product-declaration/ | `begriffe/environmental-product-declaration/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/epbd/ | `begriffe/epbd/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/epd/ | `begriffe/epd/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/epistemische-gemeinschaft/ | `begriffe/epistemische-gemeinschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/erfindung/ | `begriffe/erfindung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/erinnerungskultur/ | `begriffe/erinnerungskultur/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/erlernte-hilflosigkeit/ | `begriffe/erlernte-hilflosigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/erm/ | `begriffe/erm/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ermoeglichende-taetigkeit/ | `begriffe/ermoeglichende-taetigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ernaehrungssouveraenitaet/ | `begriffe/ernaehrungssouveraenitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/erneuerbare-energien/ | `begriffe/erneuerbare-energien/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ernst-von-glasersfeld/ | `begriffe/ernst-von-glasersfeld/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/erweiterte-herstellerverantwortung/ | `begriffe/erweiterte-herstellerverantwortung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/erwerbsarbeitslogik/ | `begriffe/erwerbsarbeitslogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/erwerbsbiografie/ | `begriffe/erwerbsbiografie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/erwuenschte-wirkung/ | `begriffe/erwuenschte-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/esap/ | `begriffe/esap/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/esef/ | `begriffe/esef/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/esg/ | `begriffe/esg/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/esg-beratung/ | `begriffe/esg-beratung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/esg-rating/ | `begriffe/esg-rating/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/esma/ | `begriffe/esma/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/espr/ | `begriffe/espr/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/esrs/ | `begriffe/esrs/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/esrs-themenstandards/ | `begriffe/esrs-themenstandards/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ets/ | `begriffe/ets/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eu/ | `begriffe/eu/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eu-climate-law/ | `begriffe/eu-climate-law/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eu-ecolabel/ | `begriffe/eu-ecolabel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eu-green-bond-standard/ | `begriffe/eu-green-bond-standard/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eu-nachhaltigkeitsverfassungsrahmen/ | `begriffe/eu-nachhaltigkeitsverfassungsrahmen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eu-taxonomie/ | `begriffe/eu-taxonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eu-taxonomie-immobilien/ | `begriffe/eu-taxonomie-immobilien/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/eudr/ | `begriffe/eudr/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/europa-als-wirkungsraum/ | `begriffe/europa-als-wirkungsraum/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/europaeisches-klimagesetz/ | `begriffe/europaeisches-klimagesetz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/european-green-deal/ | `begriffe/european-green-deal/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/european-media-freedom-act/ | `begriffe/european-media-freedom-act/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/evaluation-und-reversibilitaet/ | `begriffe/evaluation-und-reversibilitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/evaluations-und-lernfragen-design/ | `begriffe/evaluations-und-lernfragen-design/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/evidenz-und-annahmenregister/ | `begriffe/evidenz-und-annahmenregister/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/evolutionstheorie/ | `begriffe/evolutionstheorie/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/evolutorischer-unternehmer/ | `begriffe/evolutorischer-unternehmer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ex-ante-folgenpruefung-und-reality-check/ | `begriffe/ex-ante-folgenpruefung-und-reality-check/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/begriffe/exergie/ | `begriffe/exergie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/expertinnenlobbyismus/ | `begriffe/expertinnenlobbyismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/exposition/ | `begriffe/exposition/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/externalisierung/ | `begriffe/externalisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/externalisierungsluecke/ | `begriffe/externalisierungsluecke/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/externalitaet/ | `begriffe/externalitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/externalitaeten/ | `begriffe/externalitaeten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/externalitaeten-und-kostenverlagerungskarte/ | `begriffe/externalitaeten-und-kostenverlagerungskarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/extraktiver-kapitalismus/ | `begriffe/extraktiver-kapitalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/extrem/ | `begriffe/extrem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/extremismus/ | `begriffe/extremismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fach-zukunft/ | `begriffe/fach-zukunft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fake-news/ | `begriffe/fake-news/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fakten/ | `begriffe/fakten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/faktenargumentation/ | `begriffe/faktenargumentation/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/faktencheck/ | `begriffe/faktencheck/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/faktenreaktanz/ | `begriffe/faktenreaktanz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/false-balance/ | `begriffe/false-balance/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/false-consensus-effect/ | `begriffe/false-consensus-effect/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/false-equivalence/ | `begriffe/false-equivalence/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/false-urgency-kuenstliche-dringlichkeit/ | `begriffe/false-urgency-kuenstliche-dringlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/faschismus/ | `begriffe/faschismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/faschistoid/ | `begriffe/faschistoid/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/faserverbundwerkstoff/ | `begriffe/faserverbundwerkstoff/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fehlbarkeit-der-wirkungsoekonomie/ | `begriffe/fehlbarkeit-der-wirkungsoekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/feindbild/ | `begriffe/feindbild/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/feindbildlogik/ | `begriffe/feindbildlogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/feminisierung-von-armut/ | `begriffe/feminisierung-von-armut/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/feminismus/ | `begriffe/feminismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/feministische-oekonomie/ | `begriffe/feministische-oekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/feministische-transformation/ | `begriffe/feministische-transformation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/feministische-wirtschaftspolitik/ | `begriffe/feministische-wirtschaftspolitik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fernwirktechnik/ | `begriffe/fernwirktechnik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/feststoffbatterie/ | `begriffe/feststoffbatterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/filterblase/ | `begriffe/filterblase/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/finalscore/ | `begriffe/finalscore/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/financial-materiality/ | `begriffe/financial-materiality/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/finanzmarktkapitalismus/ | `begriffe/finanzmarktkapitalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/finanzschuld/ | `begriffe/finanzschuld/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/firehose-of-falsehood/ | `begriffe/firehose-of-falsehood/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fiskalischer-wirkungsgrad/ | `begriffe/fiskalischer-wirkungsgrad/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fit-for-55/ | `begriffe/fit-for-55/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fledermausabschaltung/ | `begriffe/fledermausabschaltung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/flexibilitaet-energiesystem/ | `begriffe/flexibilitaet-energiesystem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/flexibilitaetsmarkt/ | `begriffe/flexibilitaetsmarkt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/flood-the-zone/ | `begriffe/flood-the-zone/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/folgekosten/ | `begriffe/folgekosten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/folgekostenvermeidung/ | `begriffe/folgekostenvermeidung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/folgencheck/ | `begriffe/folgencheck/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/folgenfreiheit/ | `begriffe/folgenfreiheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/folgewirkung/ | `begriffe/folgewirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/forced-labour-regulation/ | `begriffe/forced-labour-regulation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/foerdercontrolling/ | `begriffe/foerdercontrolling/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/foerderlogik/ | `begriffe/foerderlogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fossile-alternative/ | `begriffe/fossile-alternative/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/fossile-systemkosten/ | `begriffe/fossile-systemkosten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fossiles-kraftwerk/ | `begriffe/fossiles-kraftwerk/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/frame/ | `begriffe/frame/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/framing/ | `begriffe/framing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/framekontrolle/ | `begriffe/framekontrolle/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/framing-sprache-tonalitaet/ | `begriffe/framing-sprache-tonalitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/frankfurter-schule/ | `begriffe/frankfurter-schule/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fraunhofersche-linien/ | `begriffe/fraunhofersche-linien/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/frederic-vester/ | `begriffe/frederic-vester/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fredmund-malik/ | `begriffe/fredmund-malik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/freie-und-faire-wahlen/ | `begriffe/freie-und-faire-wahlen/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/freiheit-markt-planwirtschaftsvorwurf/ | `begriffe/freiheit-markt-planwirtschaftsvorwurf/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, alternativen |
| https://wirkungsoekonomie.de/begriffe/freiwilligendilemma/ | `begriffe/freiwilligendilemma/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fremdenfeindlichkeit/ | `begriffe/fremdenfeindlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/frequenzhaltung/ | `begriffe/frequenzhaltung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/frequenzillusion/ | `begriffe/frequenzillusion/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/friedlicher-machtwechsel/ | `begriffe/friedlicher-machtwechsel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/friedrich-hayek/ | `begriffe/friedrich-hayek/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/fuehrerkult/ | `begriffe/fuehrerkult/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fuehrerprinzip/ | `begriffe/fuehrerprinzip/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/functional-finance/ | `begriffe/functional-finance/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fundamentaler-attributionsfehler/ | `begriffe/fundamentaler-attributionsfehler/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/funktionale-wirkungsfinanzpolitik/ | `begriffe/funktionale-wirkungsfinanzpolitik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/fusion/ | `begriffe/fusion/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/garantie/ | `begriffe/garantie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gaskraftwerk/ | `begriffe/gaskraftwerk/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gebaeudestandards/ | `begriffe/gebaeudestandards/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gebaeudeenergiegesetz/ | `begriffe/gebaeudeenergiegesetz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gebaeudeenergieperformance/ | `begriffe/gebaeudeenergieperformance/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gebrauchsgueter/ | `begriffe/gebrauchsgueter/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gebrauchswert/ | `begriffe/gebrauchswert/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gedaechtniskonsolidierung/ | `begriffe/gedaechtniskonsolidierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gedankenlosigkeit/ | `begriffe/gedankenlosigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/gefangenendilemma/ | `begriffe/gefangenendilemma/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gegenframe/ | `begriffe/gegenframe/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/geld/ | `begriffe/geld/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/gemeineigentum/ | `begriffe/gemeineigentum/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gemeinsame-geschaeftsordnung-der-bundesministerien/ | `begriffe/gemeinsame-geschaeftsordnung-der-bundesministerien/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/gemeinsame-zukunftssicherung/ | `begriffe/gemeinsame-zukunftssicherung/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/gemeinwohl/ | `begriffe/gemeinwohl/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gemeinwohloekonomie/ | `begriffe/gemeinwohloekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gender-budgeting/ | `begriffe/gender-budgeting/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gender-care-gap/ | `begriffe/gender-care-gap/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gender-data-gap/ | `begriffe/gender-data-gap/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gender-mainstreaming/ | `begriffe/gender-mainstreaming/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/begriffe/gender-pay-gap/ | `begriffe/gender-pay-gap/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gender-pension-gap/ | `begriffe/gender-pension-gap/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/generationenbilanz/ | `begriffe/generationenbilanz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/generationengerechtigkeit/ | `begriffe/generationengerechtigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/genossenschaft/ | `begriffe/genossenschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/genossenschaftsblindheit/ | `begriffe/genossenschaftsblindheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/geothermie/ | `begriffe/geothermie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/geplante-obsoleszenz/ | `begriffe/geplante-obsoleszenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/geschaeftsmodellpruefung/ | `begriffe/geschaeftsmodellpruefung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/geschlossene-autokratie/ | `begriffe/geschlossene-autokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gesellschaft/ | `begriffe/gesellschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gesellschaftliche-stabilitaet/ | `begriffe/gesellschaftliche-stabilitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gesetz/ | `begriffe/gesetz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gesetzesfolgenabschaetzung/ | `begriffe/gesetzesfolgenabschaetzung/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/gesicherte-leistung/ | `begriffe/gesicherte-leistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gesichtswahrende-korrektur/ | `begriffe/gesichtswahrende-korrektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gestehungskosten/ | `begriffe/gestehungskosten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gestrandeter-kredit/ | `begriffe/gestrandeter-kredit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gesundheit/ | `begriffe/gesundheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gesundheitsdividende/ | `begriffe/gesundheitsdividende/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gesundheitsgerechtigkeit/ | `begriffe/gesundheitsgerechtigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gesundheitskasse/ | `begriffe/gesundheitskasse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gesundheitskompetenz/ | `begriffe/gesundheitskompetenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gesundheitssystem/ | `begriffe/gesundheitssystem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gesundheitswirkung/ | `begriffe/gesundheitswirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gewaltenteilung/ | `begriffe/gewaltenteilung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gewaltenteilungsabbau/ | `begriffe/gewaltenteilungsabbau/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gewerbespeicher/ | `begriffe/gewerbespeicher/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gewinn-als-test/ | `begriffe/gewinn-als-test/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/gewoehnung/ | `begriffe/gewoehnung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ghg-protocol/ | `begriffe/ghg-protocol/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gish-galopp/ | `begriffe/gish-galopp/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/glaeserne-decke/ | `begriffe/glaeserne-decke/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/glaeserne-klippe/ | `begriffe/glaeserne-klippe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/glasfaserverstaerkter-kunststoff/ | `begriffe/glasfaserverstaerkter-kunststoff/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gleichbehandlung/ | `begriffe/gleichbehandlung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gleichberechtigung/ | `begriffe/gleichberechtigung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gleichheit/ | `begriffe/gleichheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gleichstellung/ | `begriffe/gleichstellung/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/gleichstellungsfolgenabschaetzung/ | `begriffe/gleichstellungsfolgenabschaetzung/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/gleichwertigkeit/ | `begriffe/gleichwertigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gleichzeitigkeit-ladeinfrastruktur/ | `begriffe/gleichzeitigkeit-ladeinfrastruktur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/global-warming-potential/ | `begriffe/global-warming-potential/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/globale-makro-wirkungsrisiken/ | `begriffe/globale-makro-wirkungsrisiken/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/globale-oeffentliche-gueter/ | `begriffe/globale-oeffentliche-gueter/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/globale-ordnung-2050/ | `begriffe/globale-ordnung-2050/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/globale-resilienz/ | `begriffe/globale-resilienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/globale-wirkungsordnung/ | `begriffe/globale-wirkungsordnung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/glossar-backlink-audit/ | `begriffe/glossar-backlink-audit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/glossar-publizierungsprozess/ | `begriffe/glossar-publizierungsprozess/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/goldene-wirkungsregel/ | `begriffe/goldene-wirkungsregel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gongo/ | `begriffe/gongo/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/grassroots-bewegung/ | `begriffe/grassroots-bewegung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/grauer-wasserstoff/ | `begriffe/grauer-wasserstoff/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/green-claims-directive/ | `begriffe/green-claims-directive/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/green-deal-industrial-plan/ | `begriffe/green-deal-industrial-plan/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/greenwashing/ | `begriffe/greenwashing/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/gregory-bateson/ | `begriffe/gregory-bateson/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/grenzkosten/ | `begriffe/grenzkosten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/grenzkraftwerk/ | `begriffe/grenzkraftwerk/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/grenznutzen/ | `begriffe/grenznutzen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gri/ | `begriffe/gri/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/grunddividende/ | `begriffe/grunddividende/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/grundgesetz/ | `begriffe/grundgesetz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/grundlast/ | `begriffe/grundlast/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/grundrechte/ | `begriffe/grundrechte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gruener-kapitalismus/ | `begriffe/gruener-kapitalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gruener-wasserstoff/ | `begriffe/gruener-wasserstoff/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gruenstrom/ | `begriffe/gruenstrom/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gruppenbezogene-menschenfeindlichkeit/ | `begriffe/gruppenbezogene-menschenfeindlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/gruppendenken/ | `begriffe/gruppendenken/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/gsbp/ | `begriffe/gsbp/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/habitatfragmentierung/ | `begriffe/habitatfragmentierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/habitatverlust/ | `begriffe/habitatverlust/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/halbleiter/ | `begriffe/halbleiter/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/halo-effekt/ | `begriffe/halo-effekt/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/haltung/ | `begriffe/haltung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/handeln-arendt/ | `begriffe/handeln-arendt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/handlung/ | `begriffe/handlung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/handlungsdruck/ | `begriffe/handlungsdruck/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/handlungsfaehigkeit/ | `begriffe/handlungsfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/handlungsfenster/ | `begriffe/handlungsfenster/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/handlungsmoeglichkeiten/ | `begriffe/handlungsmoeglichkeiten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/handlungspfad/ | `begriffe/handlungspfad/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/handlungsspielraum/ | `begriffe/handlungsspielraum/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hannah-arendt/ | `begriffe/hannah-arendt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hans-jonas/ | `begriffe/hans-jonas/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/hans-ulrich/ | `begriffe/hans-ulrich/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hard-to-abate-sektoren/ | `begriffe/hard-to-abate-sektoren/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/haushaltsblindleistung/ | `begriffe/haushaltsblindleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/haushaltsneutralitaet/ | `begriffe/haushaltsneutralitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/haushaltsverlustleistung/ | `begriffe/haushaltsverlustleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/haushaltswashing/ | `begriffe/haushaltswashing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/haushaltswirkleistung/ | `begriffe/haushaltswirkleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hazardous-substances/ | `begriffe/hazardous-substances/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/health-co-benefits/ | `begriffe/health-co-benefits/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/health-impact-assessment/ | `begriffe/health-impact-assessment/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/hebelpunkt/ | `begriffe/hebelpunkt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hebelwirkung/ | `begriffe/hebelwirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/heimat/ | `begriffe/heimat/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/heimspeicher/ | `begriffe/heimspeicher/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/heinz-von-foerster/ | `begriffe/heinz-von-foerster/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/heizhammer/ | `begriffe/heizhammer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/heizkostenrisiko/ | `begriffe/heizkostenrisiko/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/heritage-foundation/ | `begriffe/heritage-foundation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/herkunftsframe/ | `begriffe/herkunftsframe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/herkunftsnachweis/ | `begriffe/herkunftsnachweis/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/herkunftsnachweis-hkn/ | `begriffe/herkunftsnachweis-hkn/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/herkunftstransparenz/ | `begriffe/herkunftstransparenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/herstellen-arendt/ | `begriffe/herstellen-arendt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hfcs-hydrofluorocarbons/ | `begriffe/hfcs-hydrofluorocarbons/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hitzeschutz-hitzeaktionsplan/ | `begriffe/hitzeschutz-hitzeaktionsplan/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/hitzestress/ | `begriffe/hitzestress/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hoax/ | `begriffe/hoax/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hochspannung/ | `begriffe/hochspannung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hoechstspannung/ | `begriffe/hoechstspannung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hochwasserrisiko/ | `begriffe/hochwasserrisiko/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/homo-oeconomicus/ | `begriffe/homo-oeconomicus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/horizon-scanning-und-schwache-signale-radar/ | `begriffe/horizon-scanning-und-schwache-signale-radar/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/host-wirkungsscore/ | `begriffe/host-wirkungsscore/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/host-wirkung/ | `begriffe/host-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/hostile-media-effect/ | `begriffe/hostile-media-effect/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/hotspot-analyse/ | `begriffe/hotspot-analyse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hpc-charger/ | `begriffe/hpc-charger/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/human-rights-due-diligence/ | `begriffe/human-rights-due-diligence/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/human-rights-impact-assessment/ | `begriffe/human-rights-impact-assessment/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/maturana-varela/ | `begriffe/maturana-varela/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/humusaufbau/ | `begriffe/humusaufbau/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hunger-hungerbekaempfung/ | `begriffe/hunger-hungerbekaempfung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hybride-kriegsfuehrung/ | `begriffe/hybride-kriegsfuehrung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hybridregime/ | `begriffe/hybridregime/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hydrologischer-kreislauf/ | `begriffe/hydrologischer-kreislauf/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/hydrometallurgie/ | `begriffe/hydrometallurgie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/identitaetsschutz/ | `begriffe/identitaetsschutz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/identitaetsschutz-kognition/ | `begriffe/identitaetsschutz-kognition/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/idgs/ | `begriffe/idgs/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/iea/ | `begriffe/iea/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/illiberale-demokratie/ | `begriffe/illiberale-demokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ilo/ | `begriffe/ilo/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ilo-kernarbeitsnormen/ | `begriffe/ilo-kernarbeitsnormen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/immanuel-kant/ | `begriffe/immanuel-kant/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/immobilien/ | `begriffe/immobilien/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/impact/ | `begriffe/impact/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/impact-benefits-realization/ | `begriffe/impact-benefits-realization/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/impact-fit/ | `begriffe/impact-fit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/impact-investing/ | `begriffe/impact-investing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/impact-materiality/ | `begriffe/impact-materiality/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/impact-strategie/ | `begriffe/impact-strategie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/impact-value/ | `begriffe/impact-value/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/impact-and-benefits-realization-map/ | `begriffe/impact-and-benefits-realization-map/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/impact-controlling/ | `begriffe/impact-controlling/index.html` | ADD_GLOSSARY_CROSSLINKS | novelty_or_absence |
| https://wirkungsoekonomie.de/begriffe/impact-management/ | `begriffe/impact-management/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/impact-marketing/ | `begriffe/impact-marketing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/impact-of-investment/ | `begriffe/impact-of-investment/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/impact-washing/ | `begriffe/impact-washing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ingroup-outgroup-dynamik/ | `begriffe/ingroup-outgroup-dynamik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/industrielle-dekonstruktion/ | `begriffe/industrielle-dekonstruktion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/industriestrom/ | `begriffe/industriestrom/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/inertia/ | `begriffe/inertia/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/inflationsgrenze/ | `begriffe/inflationsgrenze/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/informationsasymmetrie/ | `begriffe/informationsasymmetrie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/informationsintegritaet/ | `begriffe/informationsintegritaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/informationssouveraenitaet/ | `begriffe/informationssouveraenitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/informationsueberlastung/ | `begriffe/informationsueberlastung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/informelles-wissen/ | `begriffe/informelles-wissen/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/infraschall/ | `begriffe/infraschall/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/infrastrukturelle-staatsschuld/ | `begriffe/infrastrukturelle-staatsschuld/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/initiativenauftrag-und-wirkungsvertrag/ | `begriffe/initiativenauftrag-und-wirkungsvertrag/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/innere-loops/ | `begriffe/innere-loops/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/innovation/ | `begriffe/innovation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/innovativer-unternehmer/ | `begriffe/innovativer-unternehmer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/input/ | `begriffe/input/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/insetting/ | `begriffe/insetting/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/inside-out-outside-in/ | `begriffe/inside-out-outside-in/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/institutionelle-vertrauenswuerdigkeit/ | `begriffe/institutionelle-vertrauenswuerdigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/institutioneller-rassismus/ | `begriffe/institutioneller-rassismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/institutionendelegitimierung/ | `begriffe/institutionendelegitimierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/institutionenkritik/ | `begriffe/institutionenkritik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/institutionenoekonomik/ | `begriffe/institutionenoekonomik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/integration-als-infrastruktur/ | `begriffe/integration-als-infrastruktur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/integrierte-assurance/ | `begriffe/integrierte-assurance/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/integrierte-assurance-map-und-three-lines/ | `begriffe/integrierte-assurance-map-und-three-lines/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/interdependenz/ | `begriffe/interdependenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/interdependenz-und-abhaengigkeitsmatrix/ | `begriffe/interdependenz-und-abhaengigkeitsmatrix/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/interdisziplinaritaet/ | `begriffe/interdisziplinaritaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/interessenkonflikt/ | `begriffe/interessenkonflikt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/interessenvertretung/ | `begriffe/interessenvertretung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/intergenerationelles-dilemma/ | `begriffe/intergenerationelles-dilemma/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/intermittent-reinforcement/ | `begriffe/intermittent-reinforcement/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/internationale-krisenvorsorge/ | `begriffe/internationale-krisenvorsorge/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/internationale-zusammenarbeit/ | `begriffe/internationale-zusammenarbeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/intersektionalitaet/ | `begriffe/intersektionalitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/intertemporale-freiheit/ | `begriffe/intertemporale-freiheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/intertemporale-freiheitssicherung/ | `begriffe/intertemporale-freiheitssicherung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/invention/ | `begriffe/invention/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/investitionsschuld/ | `begriffe/investitionsschuld/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/iooi/ | `begriffe/iooi/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/ipbes/ | `begriffe/ipbes/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ipcc/ | `begriffe/ipcc/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/iro/ | `begriffe/iro/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/iso/ | `begriffe/iso/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/iso-14040-14044/ | `begriffe/iso-14040-14044/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/issb-ifrs-s1-s2/ | `begriffe/issb-ifrs-s1-s2/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/jobs-to-be-done/ | `begriffe/jobs-to-be-done/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/jochen-roepke/ | `begriffe/jochen-roepke/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/john-dewey/ | `begriffe/john-dewey/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/john-maynard-keynes/ | `begriffe/john-maynard-keynes/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/joseph-schumpeter/ | `begriffe/joseph-schumpeter/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/just-transition-mechanism/ | `begriffe/just-transition-mechanism/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kannibalisierungseffekt/ | `begriffe/kannibalisierungseffekt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kapazitaets-ressourcen-und-kritischer-pfad-plan/ | `begriffe/kapazitaets-ressourcen-und-kritischer-pfad-plan/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kapazitaetsmarkt/ | `begriffe/kapazitaetsmarkt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kapazitaetsreserve/ | `begriffe/kapazitaetsreserve/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kapital/ | `begriffe/kapital/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/kapital-als-machtverhaeltnis/ | `begriffe/kapital-als-machtverhaeltnis/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kapital-als-werkzeug/ | `begriffe/kapital-als-werkzeug/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kapitalakkumulation/ | `begriffe/kapitalakkumulation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kapitalfluss/ | `begriffe/kapitalfluss/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kapitalismus/ | `begriffe/kapitalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kapitalrendite/ | `begriffe/kapitalrendite/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kapitalwirkung/ | `begriffe/kapitalwirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/kapitalzugang/ | `begriffe/kapitalzugang/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/karl-marx/ | `begriffe/karl-marx/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/karl-polanyi/ | `begriffe/karl-polanyi/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kaskadennutzung/ | `begriffe/kaskadennutzung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/katechon/ | `begriffe/katechon/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kausalitaet-und-zurechnung/ | `begriffe/kausalitaet-und-zurechnung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kausalschleifen-und-rueckkopplungsdiagramm/ | `begriffe/kausalschleifen-und-rueckkopplungsdiagramm/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kernenergie/ | `begriffe/kernenergie/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/kernkraft-neubau/ | `begriffe/kernkraft-neubau/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/key-impact-controls-und-kontrollbibliothek/ | `begriffe/key-impact-controls-und-kontrollbibliothek/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/key-impact-indicator/ | `begriffe/key-impact-indicator/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/keynesianismus/ | `begriffe/keynesianismus/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/ki-und-arbeit/ | `begriffe/ki-und-arbeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ki-agenten-incident-abschalt-und-rueckbauplan/ | `begriffe/ki-agenten-incident-abschalt-und-rueckbauplan/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ki-governance/ | `begriffe/ki-governance/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/ki-lebenszyklus-modellrisiko-und-human-oversight-canvas/ | `begriffe/ki-lebenszyklus-modellrisiko-und-human-oversight-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ki-system-wirkungsfolgenabschaetzung/ | `begriffe/ki-system-wirkungsfolgenabschaetzung/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/kii/ | `begriffe/kii/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/kii-design-key-impact-indicators/ | `begriffe/kii-design-key-impact-indicators/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kinderarbeit-zwangsarbeit/ | `begriffe/kinderarbeit-zwangsarbeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kipppunkt/ | `begriffe/kipppunkt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kipppunkt-systemschwelle/ | `begriffe/kipppunkt-systemschwelle/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kipppunkte/ | `begriffe/kipppunkte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/klassischer-liberalismus/ | `begriffe/klassischer-liberalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kleptokratie/ | `begriffe/kleptokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/klimastandards/ | `begriffe/klimastandards/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/klimaanpassung/ | `begriffe/klimaanpassung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/klimaanpassungsmanagerin/ | `begriffe/klimaanpassungsmanagerin/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/klimabeschluss-des-bundesverfassungsgerichts/ | `begriffe/klimabeschluss-des-bundesverfassungsgerichts/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/klimafolgeschaeden/ | `begriffe/klimafolgeschaeden/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/klimagerechtigkeit/ | `begriffe/klimagerechtigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/klimaneutralitaet/ | `begriffe/klimaneutralitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/klimarisiko/ | `begriffe/klimarisiko/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/klimaschutz/ | `begriffe/klimaschutz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/klimawandel/ | `begriffe/klimawandel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/knallzeugen-effekt-blitzlichterinnerung/ | `begriffe/knallzeugen-effekt-blitzlichterinnerung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/knappheit/ | `begriffe/knappheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kognitive-belastung/ | `begriffe/kognitive-belastung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kognitive-dissonanz/ | `begriffe/kognitive-dissonanz/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/kognitive-last-und-teaminteraktionskarte/ | `begriffe/kognitive-last-und-teaminteraktionskarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kohaerenz/ | `begriffe/kohaerenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kohlekraftwerk/ | `begriffe/kohlekraftwerk/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kommunale-energie/ | `begriffe/kommunale-energie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kommunale-integrationskapazitaet/ | `begriffe/kommunale-integrationskapazitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kommunale-waermeplanung/ | `begriffe/kommunale-waermeplanung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kommunaler-wirkungsindex/ | `begriffe/kommunaler-wirkungsindex/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kommunikation-wirklichkeitskonstruktion/ | `begriffe/kommunikation-wirklichkeitskonstruktion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kommunikative-souveraenitaet/ | `begriffe/kommunikative-souveraenitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/kommunismus/ | `begriffe/kommunismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kommunistischer-staat/ | `begriffe/kommunistischer-staat/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/komplementaritaet/ | `begriffe/komplementaritaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/komplexitaetsmanagement/ | `begriffe/komplexitaetsmanagement/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/komponentenrueckgewinnung/ | `begriffe/komponentenrueckgewinnung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kompostierung/ | `begriffe/kompostierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kondratieff-zyklus/ | `begriffe/kondratieff-zyklus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/konsequenzfaehigkeit/ | `begriffe/konsequenzfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/konservativ/ | `begriffe/konservativ/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/konservative-annahme/ | `begriffe/konservative-annahme/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/konstruktives-narrativ/ | `begriffe/konstruktives-narrativ/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/konstruktivismus/ | `begriffe/konstruktivismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/konsumbilanz/ | `begriffe/konsumbilanz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/konsumentensouveraenitaet/ | `begriffe/konsumentensouveraenitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/kontakthypothese/ | `begriffe/kontakthypothese/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kontaktschuld/ | `begriffe/kontaktschuld/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kontinuierliche-wirkungsverbesserung/ | `begriffe/kontinuierliche-wirkungsverbesserung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kontinuitaets-recovery-und-wirkungsresilienzplan/ | `begriffe/kontinuitaets-recovery-und-wirkungsresilienzplan/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kontraindikation/ | `begriffe/kontraindikation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kontribution/ | `begriffe/kontribution/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/kontrollbeduerfnis/ | `begriffe/kontrollbeduerfnis/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/konzessionsabgabe/ | `begriffe/konzessionsabgabe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kooperationsfaehigkeit/ | `begriffe/kooperationsfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/kooperationslogik/ | `begriffe/kooperationslogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kooperative-wehrhaftigkeit/ | `begriffe/kooperative-wehrhaftigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/koordinationsdilemma/ | `begriffe/koordinationsdilemma/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/koerperliche-selbstbestimmung/ | `begriffe/koerperliche-selbstbestimmung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kosten-des-nicht-handelns/ | `begriffe/kosten-des-nicht-handelns/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kosten-des-nichthandelns/ | `begriffe/kosten-des-nichthandelns/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kpi/ | `begriffe/kpi/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kraft-waerme-kopplung/ | `begriffe/kraft-waerme-kopplung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kraftwerks-nettoleistung/ | `begriffe/kraftwerks-nettoleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/krankheitssystem/ | `begriffe/krankheitssystem/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/kreative-rekonstruktion/ | `begriffe/kreative-rekonstruktion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kreislaufblindheit/ | `begriffe/kreislaufblindheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kreislauffaehigkeit/ | `begriffe/kreislauffaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kreislaufgrad/ | `begriffe/kreislaufgrad/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kreislaufinnovation/ | `begriffe/kreislaufinnovation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kreislaufwirkung/ | `begriffe/kreislaufwirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kreislaufwirtschaft/ | `begriffe/kreislaufwirtschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/krisensimulation-red-teaming-und-tabletop-exercise/ | `begriffe/krisensimulation-red-teaming-und-tabletop-exercise/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kritische-energieinfrastruktur/ | `begriffe/kritische-energieinfrastruktur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kritische-rohstoffe/ | `begriffe/kritische-rohstoffe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kultur-als-resonanzsystem/ | `begriffe/kultur-als-resonanzsystem/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/kultur-verhaltens-und-anreizlandkarte/ | `begriffe/kultur-verhaltens-und-anreizlandkarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kulturelle-anschlussfaehigkeit/ | `begriffe/kulturelle-anschlussfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/kundenanlage/ | `begriffe/kundenanlage/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kundennutzen/ | `begriffe/kundennutzen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kuenstliche-intelligenz/ | `begriffe/kuenstliche-intelligenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kurzzeitspeicher/ | `begriffe/kurzzeitspeicher/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kybernetik/ | `begriffe/kybernetik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/kybernetik-zweiter-ordnung/ | `begriffe/kybernetik-zweiter-ordnung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/label-siegel/ | `begriffe/label-siegel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/labelwashing/ | `begriffe/labelwashing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/laecherlichkeitsframe/ | `begriffe/laecherlichkeitsframe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ladeangst/ | `begriffe/ladeangst/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ladeeinrichtung/ | `begriffe/ladeeinrichtung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ladefenster/ | `begriffe/ladefenster/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ladehub/ | `begriffe/ladehub/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ladeinfrastruktur/ | `begriffe/ladeinfrastruktur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ladeleistung/ | `begriffe/ladeleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ladepark/ | `begriffe/ladepark/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ladepark-mittelspannungsanschluss/ | `begriffe/ladepark-mittelspannungsanschluss/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ladepunkt/ | `begriffe/ladepunkt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ladepunktbetreiber/ | `begriffe/ladepunktbetreiber/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ladesaeule/ | `begriffe/ladesaeule/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/laffer-kurve/ | `begriffe/laffer-kurve/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/langfristige-produkt-und-wirkungsverantwortungskarte/ | `begriffe/langfristige-produkt-und-wirkungsverantwortungskarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/langzeitspeicher/ | `begriffe/langzeitspeicher/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/laozi/ | `begriffe/laozi/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lastgang/ | `begriffe/lastgang/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lastmanagement/ | `begriffe/lastmanagement/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/latitude/ | `begriffe/latitude/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/law-and-order/ | `begriffe/law-and-order/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lca/ | `begriffe/lca/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lebensform/ | `begriffe/lebensform/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lebenswirkung/ | `begriffe/lebenswirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lebenszyklus-emissionen/ | `begriffe/lebenszyklus-emissionen/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/lebenszyklusanalyse/ | `begriffe/lebenszyklusanalyse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lebenszyklusinventar/ | `begriffe/lebenszyklusinventar/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lebenszykluswirkungsabschaetzung/ | `begriffe/lebenszykluswirkungsabschaetzung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/legalitaet/ | `begriffe/legalitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/legislative-footprint/ | `begriffe/legislative-footprint/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/legitimer-lobbyismus/ | `begriffe/legitimer-lobbyismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/legitimitaet/ | `begriffe/legitimitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/leistung/ | `begriffe/leistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/leistungsdichte/ | `begriffe/leistungsdichte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/leistungsfaktor/ | `begriffe/leistungsfaktor/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/leistungspreis/ | `begriffe/leistungspreis/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lern-und-rueckkopplungsarchitektur/ | `begriffe/lern-und-rueckkopplungsarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lernebenen/ | `begriffe/lernebenen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lernende-organisation/ | `begriffe/lernende-organisation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lernende-systeme/ | `begriffe/lernende-systeme/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lernender-unternehmer/ | `begriffe/lernender-unternehmer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lfp-batterie/ | `begriffe/lfp-batterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/liability-risk/ | `begriffe/liability-risk/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/liberale-demokratie/ | `begriffe/liberale-demokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/liberalismus/ | `begriffe/liberalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/libertarismus/ | `begriffe/libertarismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lieferantenbewertung/ | `begriffe/lieferantenbewertung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lieferketten-wirkungs-canvas/ | `begriffe/lieferketten-wirkungs-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/lieferkettenbelasteter-kredit/ | `begriffe/lieferkettenbelasteter-kredit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lieferkettendaten/ | `begriffe/lieferkettendaten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lieferkettenrisiko/ | `begriffe/lieferkettenrisiko/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lieferkettenwirkung/ | `begriffe/lieferkettenwirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/limited-assurance/ | `begriffe/limited-assurance/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lineare-wirtschaft/ | `begriffe/lineare-wirtschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/linker-faschismus/ | `begriffe/linker-faschismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/links-politisch/ | `begriffe/links-politisch/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/linksextremismus/ | `begriffe/linksextremismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lithium-ionen-batterie/ | `begriffe/lithium-ionen-batterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lithium-titanat-batterie/ | `begriffe/lithium-titanat-batterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/living-wage/ | `begriffe/living-wage/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lksg/ | `begriffe/lksg/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lobbyismus/ | `begriffe/lobbyismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lobbyregister/ | `begriffe/lobbyregister/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lock-in-pfadabhaengigkeit/ | `begriffe/lock-in-pfadabhaengigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/lock-in-effekt/ | `begriffe/lock-in-effekt/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/lohnabstand/ | `begriffe/lohnabstand/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lohnstueckkosten/ | `begriffe/lohnstueckkosten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/lokale-energie-als-wirkungsinfrastruktur/ | `begriffe/lokale-energie-als-wirkungsinfrastruktur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ludwig-erhard/ | `begriffe/ludwig-erhard/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ludwig-wittgenstein/ | `begriffe/ludwig-wittgenstein/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/macht-und-gewalt/ | `begriffe/macht-und-gewalt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/macht-abhaengigkeits-und-entscheidungsraumanalyse/ | `begriffe/macht-abhaengigkeits-und-entscheidungsraumanalyse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/macht-widerstands-und-konfliktkarte/ | `begriffe/macht-widerstands-und-konfliktkarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/machtbegrenzung/ | `begriffe/machtbegrenzung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/machtdezentralisierung/ | `begriffe/machtdezentralisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/machtkonzentration/ | `begriffe/machtkonzentration/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/maga/ | `begriffe/maga/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/maja-goepel/ | `begriffe/maja-goepel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/majoritarismus/ | `begriffe/majoritarismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/management/ | `begriffe/management/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/managementsysteme/ | `begriffe/managementsysteme/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/manufactured-consensus/ | `begriffe/manufactured-consensus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/marktgleichgewicht/ | `begriffe/marktgleichgewicht/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/marktmacht/ | `begriffe/marktmacht/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/marktpraemie/ | `begriffe/marktpraemie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/marktversagen/ | `begriffe/marktversagen/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/marktwert/ | `begriffe/marktwert/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/marktwirtschaft/ | `begriffe/marktwirtschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/martha-nussbaum/ | `begriffe/martha-nussbaum/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/maschinenleistung/ | `begriffe/maschinenleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/maschinenleistungsrueckkopplung/ | `begriffe/maschinenleistungsrueckkopplung/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/maschinenwertschoepfungsbeitrag/ | `begriffe/maschinenwertschoepfungsbeitrag/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/massstabskrise/ | `begriffe/massstabskrise/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/material-footprint/ | `begriffe/material-footprint/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/materialgesundheit/ | `begriffe/materialgesundheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/materialpass/ | `begriffe/materialpass/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/medienfreiheit/ | `begriffe/medienfreiheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mediengleichschaltung/ | `begriffe/mediengleichschaltung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/medienqualitaet/ | `begriffe/medienqualitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/medienvertrauen/ | `begriffe/medienvertrauen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/megawatt-charging-system/ | `begriffe/megawatt-charging-system/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/megawattladen/ | `begriffe/megawattladen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mehrfachszenario-konstruktion/ | `begriffe/mehrfachszenario-konstruktion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mehrheitsprinzip/ | `begriffe/mehrheitsprinzip/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mehrwert/ | `begriffe/mehrwert/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/meinungsfreiheit/ | `begriffe/meinungsfreiheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mensch-planet-demokratie/ | `begriffe/mensch-planet-demokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/menschenrechte-in-der-lieferkette/ | `begriffe/menschenrechte-in-der-lieferkette/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/menschenwuerde/ | `begriffe/menschenwuerde/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mental-load/ | `begriffe/mental-load/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mentales-modell/ | `begriffe/mentales-modell/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/merit-order/ | `begriffe/merit-order/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/messbarkeit-ohne-reduktionismus/ | `begriffe/messbarkeit-ohne-reduktionismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/messgrenzen-und-unsicherheit/ | `begriffe/messgrenzen-und-unsicherheit/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, evaluation |
| https://wirkungsoekonomie.de/begriffe/messproblem/ | `begriffe/messproblem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/messstellenbetrieb/ | `begriffe/messstellenbetrieb/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/messung-in-der-quantenmechanik/ | `begriffe/messung-in-der-quantenmechanik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/messwandler/ | `begriffe/messwandler/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/messwandlerschrank/ | `begriffe/messwandlerschrank/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/meta-kognitive-intervention/ | `begriffe/meta-kognitive-intervention/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/metakommunikation/ | `begriffe/metakommunikation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mieterstrom/ | `begriffe/mieterstrom/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/militaerdiktatur/ | `begriffe/militaerdiktatur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/minarchismus/ | `begriffe/minarchismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/minderheitenschutz/ | `begriffe/minderheitenschutz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mindestschutz-minimum-safeguards/ | `begriffe/mindestschutz-minimum-safeguards/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/minutenreserve/ | `begriffe/minutenreserve/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/misalignment-year/ | `begriffe/misalignment-year/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mitte/ | `begriffe/mitte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mittelspannung/ | `begriffe/mittelspannung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mittelspannungsschaltanlage/ | `begriffe/mittelspannungsschaltanlage/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mmt/ | `begriffe/mmt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/mobilitaetsarmut/ | `begriffe/mobilitaetsarmut/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/modellannahme/ | `begriffe/modellannahme/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/modellblindheit/ | `begriffe/modellblindheit/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/modellgrenze/ | `begriffe/modellgrenze/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/moderation-und-community-dynamik/ | `begriffe/moderation-und-community-dynamik/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/moderationsstandards/ | `begriffe/moderationsstandards/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/moderner-patriotismus/ | `begriffe/moderner-patriotismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/modularitaet/ | `begriffe/modularitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/molekuel-hierarchie/ | `begriffe/molekuel-hierarchie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/momentanreserve/ | `begriffe/momentanreserve/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/monetaere-souveraenitaet/ | `begriffe/monetaere-souveraenitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/monetarismus/ | `begriffe/monetarismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/monopol/ | `begriffe/monopol/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/moral-hazard/ | `begriffe/moral-hazard/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/moral-licensing/ | `begriffe/moral-licensing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/moralische-entkopplung/ | `begriffe/moralische-entkopplung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/moralische-panik/ | `begriffe/moralische-panik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/motiviertes-denken/ | `begriffe/motiviertes-denken/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/motte-and-bailey/ | `begriffe/motte-and-bailey/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/moving-the-goalposts/ | `begriffe/moving-the-goalposts/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/msci-esg-ratings/ | `begriffe/msci-esg-ratings/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/muslimfeindlichkeit/ | `begriffe/muslimfeindlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nace/ | `begriffe/nace/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nachbarschaftsstrom/ | `begriffe/nachbarschaftsstrom/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nachhaltigkeit/ | `begriffe/nachhaltigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nachhaltigkeitslabel/ | `begriffe/nachhaltigkeitslabel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nachhaltigkeitsmanagement/ | `begriffe/nachhaltigkeitsmanagement/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nachhaltigkeitspruefung-des-bundes/ | `begriffe/nachhaltigkeitspruefung-des-bundes/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, evaluation |
| https://wirkungsoekonomie.de/begriffe/nachtwaechterstaat/ | `begriffe/nachtwaechterstaat/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nahbereichsbias/ | `begriffe/nahbereichsbias/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/narrativ/ | `begriffe/narrativ/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/natalitaet/ | `begriffe/natalitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nationaler-wohlfahrtsindex/ | `begriffe/nationaler-wohlfahrtsindex/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nationalismus/ | `begriffe/nationalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/natrium-ionen-batterie/ | `begriffe/natrium-ionen-batterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/natur-labels/ | `begriffe/natur-labels/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/naturbasierte-loesungen/ | `begriffe/naturbasierte-loesungen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nature-positive/ | `begriffe/nature-positive/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nature-related-risks/ | `begriffe/nature-related-risks/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/natuerliches-monopol/ | `begriffe/natuerliches-monopol/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nca-batterie/ | `begriffe/nca-batterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nebenwirkung/ | `begriffe/nebenwirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nebenwirkungs-wechselwirkungs-und-rebound-analyse/ | `begriffe/nebenwirkungs-wechselwirkungs-und-rebound-analyse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/negative-externalitaet/ | `begriffe/negative-externalitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/negative-freiheit/ | `begriffe/negative-freiheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/negative-wirkung/ | `begriffe/negative-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/negativitaetsbias/ | `begriffe/negativitaetsbias/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/neoklassik/ | `begriffe/neoklassik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/neoklassische-foerderlogik/ | `begriffe/neoklassische-foerderlogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/neoliberalismus/ | `begriffe/neoliberalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/net-zero/ | `begriffe/net-zero/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netto-wirkung/ | `begriffe/netto-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/nettokreditaufnahme/ | `begriffe/nettokreditaufnahme/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzanschluss/ | `begriffe/netzanschluss/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzanschlussbegehren/ | `begriffe/netzanschlussbegehren/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzanschlussleistung/ | `begriffe/netzanschlussleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzanschlusspunkt/ | `begriffe/netzanschlusspunkt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzausbau/ | `begriffe/netzausbau/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzdienlichkeit/ | `begriffe/netzdienlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzebene/ | `begriffe/netzebene/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzengpass/ | `begriffe/netzengpass/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzentgelt/ | `begriffe/netzentgelt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzentgeltsystematik/ | `begriffe/netzentgeltsystematik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzreserve/ | `begriffe/netzreserve/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzspeicher/ | `begriffe/netzspeicher/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzverlust/ | `begriffe/netzverlust/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzvertraeglichkeitspruefung/ | `begriffe/netzvertraeglichkeitspruefung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/netzwerkeffekt/ | `begriffe/netzwerkeffekt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/neue-ordnung-des-wohlstands/ | `begriffe/neue-ordnung-des-wohlstands/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, evaluation |
| https://wirkungsoekonomie.de/begriffe/neuigkeitsbias/ | `begriffe/neuigkeitsbias/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/neukombination/ | `begriffe/neukombination/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/neuroplastizitaet/ | `begriffe/neuroplastizitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/neuropsychologische-wirkmechanismen/ | `begriffe/neuropsychologische-wirkmechanismen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/neutrale-wirkung/ | `begriffe/neutrale-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nfrd/ | `begriffe/nfrd/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ngo/ | `begriffe/ngo/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ngo-capture/ | `begriffe/ngo-capture/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ngo-wirkungspruefung/ | `begriffe/ngo-wirkungspruefung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nicht-dualitaet/ | `begriffe/nicht-dualitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nicht-finanzielle-staatsschulden/ | `begriffe/nicht-finanzielle-staatsschulden/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nichtkompensationsprinzip/ | `begriffe/nichtkompensationsprinzip/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nichtlinearitaet/ | `begriffe/nichtlinearitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nichtlokalitaet/ | `begriffe/nichtlokalitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nichttriviale-maschine/ | `begriffe/nichttriviale-maschine/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nichttriviale-systeme/ | `begriffe/nichttriviale-systeme/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nichttriviales-system/ | `begriffe/nichttriviales-system/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/nie-eingezahlt-narrativ/ | `begriffe/nie-eingezahlt-narrativ/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/niederspannung/ | `begriffe/niederspannung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/niederspannungshauptverteilung/ | `begriffe/niederspannungshauptverteilung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/niklas-luhmann/ | `begriffe/niklas-luhmann/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nikolai-kondratieff/ | `begriffe/nikolai-kondratieff/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nirvana-fehlschluss/ | `begriffe/nirvana-fehlschluss/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nmc-batterie/ | `begriffe/nmc-batterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/no-regret-anwendung/ | `begriffe/no-regret-anwendung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/no-regret-massnahme/ | `begriffe/no-regret-massnahme/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nocebo-effekt/ | `begriffe/nocebo-effekt/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/non-aggression-principle/ | `begriffe/non-aggression-principle/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/normalisierung/ | `begriffe/normalisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/normalisierungseffekt/ | `begriffe/normalisierungseffekt/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/normalladen/ | `begriffe/normalladen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/normative-konformitaet/ | `begriffe/normative-konformitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/normative-wirkungsarchitektur/ | `begriffe/normative-wirkungsarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/normativer-massstab/ | `begriffe/normativer-massstab/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/normativer-wert/ | `begriffe/normativer-wert/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/normatives-management/ | `begriffe/normatives-management/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nostalgie-effekt/ | `begriffe/nostalgie-effekt/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/zero-waste/ | `begriffe/zero-waste/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nullsummenfehler/ | `begriffe/nullsummenfehler/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nutzenergie/ | `begriffe/nutzenergie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nutzenmaximierung/ | `begriffe/nutzenmaximierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nutzer-stakeholder-und-betroffenenreise/ | `begriffe/nutzer-stakeholder-und-betroffenenreise/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nutzungsdauerverlaengerung/ | `begriffe/nutzungsdauerverlaengerung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oberschwingungen/ | `begriffe/oberschwingungen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/objektspezifische-staatliche-pruefarchitektur/ | `begriffe/objektspezifische-staatliche-pruefarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, evaluation |
| https://wirkungsoekonomie.de/begriffe/state-assessment-benchmark/ | `begriffe/state-assessment-benchmark/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, evaluation |
| https://wirkungsoekonomie.de/begriffe/ocpp/ | `begriffe/ocpp/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oecd/ | `begriffe/oecd/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oecd-leitsaetze/ | `begriffe/oecd-leitsaetze/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oef-organisation-environmental-footprint/ | `begriffe/oef-organisation-environmental-footprint/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oeffentliche-beschaffung/ | `begriffe/oeffentliche-beschaffung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/oeffentliche-finanzen-schulden-wirkung/ | `begriffe/oeffentliche-finanzen-schulden-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/oeffentliche-gueter/ | `begriffe/oeffentliche-gueter/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oeffentliche-netto-wirkung/ | `begriffe/oeffentliche-netto-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oeffentliche-statistik/ | `begriffe/oeffentliche-statistik/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/begriffe/oeffentliche-wahrheit/ | `begriffe/oeffentliche-wahrheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oeffentliche-wirkung/ | `begriffe/oeffentliche-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oeffentlicher-raum-arendt/ | `begriffe/oeffentlicher-raum-arendt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oeffentlicher-t-sroi/ | `begriffe/oeffentlicher-t-sroi/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oeffentlichkeit/ | `begriffe/oeffentlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oeffentlichkeit-als-wirkungsraum/ | `begriffe/oeffentlichkeit-als-wirkungsraum/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/offsetting-kompensation/ | `begriffe/offsetting-kompensation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/offshore-netzumlage/ | `begriffe/offshore-netzumlage/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/offshore-windenergie/ | `begriffe/offshore-windenergie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oekofeminismus/ | `begriffe/oekofeminismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oekologische-oekonomie/ | `begriffe/oekologische-oekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oekologische-staatsschuld/ | `begriffe/oekologische-staatsschuld/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oekosoziale-marktwirtschaft/ | `begriffe/oekosoziale-marktwirtschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oekosystem/ | `begriffe/oekosystem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oekosystem-und-plattformorchestrierungsarchitektur/ | `begriffe/oekosystem-und-plattformorchestrierungsarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oekosystemleistungen-oekosystemfunktionen/ | `begriffe/oekosystemleistungen-oekosystemfunktionen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oligarchie/ | `begriffe/oligarchie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oligopol/ | `begriffe/oligopol/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oelkraftwerk/ | `begriffe/oelkraftwerk/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/on-board-charger/ | `begriffe/on-board-charger/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/one-health/ | `begriffe/one-health/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/onshore-windenergie/ | `begriffe/onshore-windenergie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/open-science/ | `begriffe/open-science/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, evaluation |
| https://wirkungsoekonomie.de/begriffe/operatives-management/ | `begriffe/operatives-management/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/opex/ | `begriffe/opex/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/opferumkehr/ | `begriffe/opferumkehr/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/opportunitaetskosten/ | `begriffe/opportunitaetskosten/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/opposition/ | `begriffe/opposition/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/oppositionsunterdrueckung/ | `begriffe/oppositionsunterdrueckung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ordoliberalismus/ | `begriffe/ordoliberalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/organisation-environmental-footprint/ | `begriffe/organisation-environmental-footprint/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/organisationswirkungs-canvas/ | `begriffe/organisationswirkungs-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/orientierung/ | `begriffe/orientierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/oesterreichische-schule/ | `begriffe/oesterreichische-schule/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/outcome/ | `begriffe/outcome/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/outcome-und-empfaengerlandkarte/ | `begriffe/outcome-und-empfaengerlandkarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/outcome-stream-map/ | `begriffe/outcome-stream-map/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/outgroup-homogenitaet/ | `begriffe/outgroup-homogenitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/output/ | `begriffe/output/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/overton-fenster/ | `begriffe/overton-fenster/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pai/ | `begriffe/pai/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/paltering/ | `begriffe/paltering/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/panarchy/ | `begriffe/panarchy/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pareto-effizienz/ | `begriffe/pareto-effizienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/parlament/ | `begriffe/parlament/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/parlamentarische-demokratie/ | `begriffe/parlamentarische-demokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/parlamentarischer-beirat-fuer-nachhaltige-entwicklung-und-zukunftsfragen/ | `begriffe/parlamentarischer-beirat-fuer-nachhaltige-entwicklung-und-zukunftsfragen/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, dns |
| https://wirkungsoekonomie.de/begriffe/parteistaat/ | `begriffe/parteistaat/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/partizipation/ | `begriffe/partizipation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/partizipative-demokratie/ | `begriffe/partizipative-demokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/patriarchale-dividende/ | `begriffe/patriarchale-dividende/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/patriarchale-milieus/ | `begriffe/patriarchale-milieus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/patriarchat/ | `begriffe/patriarchat/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/patriot-not-a-patriot/ | `begriffe/patriot-not-a-patriot/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/paul-watzlawick/ | `begriffe/paul-watzlawick/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pcf-product-carbon-footprint/ | `begriffe/pcf-product-carbon-footprint/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pcr-product-category-rules/ | `begriffe/pcr-product-category-rules/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/peer-influence/ | `begriffe/peer-influence/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pef-product-environmental-footprint/ | `begriffe/pef-product-environmental-footprint/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/perowskit-solarzelle/ | `begriffe/perowskit-solarzelle/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/persona/ | `begriffe/persona/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/personalisierte-macht/ | `begriffe/personalisierte-macht/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/personenbewertung/ | `begriffe/personenbewertung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pessimismus-bias/ | `begriffe/pessimismus-bias/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/peter-drucker/ | `begriffe/peter-drucker/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pfadabhaengigkeit/ | `begriffe/pfadabhaengigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pflege-als-wirkleistung/ | `begriffe/pflege-als-wirkleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/phineo-wirkungslogik/ | `begriffe/phineo-wirkungslogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/photoelektrischer-effekt/ | `begriffe/photoelektrischer-effekt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/photovoltaik/ | `begriffe/photovoltaik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/physical-climate-risk/ | `begriffe/physical-climate-risk/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/physikalischer-wirkungsgrad/ | `begriffe/physikalischer-wirkungsgrad/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pigou-steuer/ | `begriffe/pigou-steuer/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/pilotprojekte/ | `begriffe/pilotprojekte/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/placebo-effekt/ | `begriffe/placebo-effekt/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/planet/ | `begriffe/planet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/planetare-grenzen/ | `begriffe/planetare-grenzen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/planetary-health/ | `begriffe/planetary-health/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/planwirtschaft/ | `begriffe/planwirtschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/platform-on-sustainable-finance/ | `begriffe/platform-on-sustainable-finance/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/plattform-und-netzwerkeffekt-canvas/ | `begriffe/plattform-und-netzwerkeffekt-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/plattform-als-wirkungsinfrastruktur-canvas/ | `begriffe/plattform-als-wirkungsinfrastruktur-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/plattformarbeit/ | `begriffe/plattformarbeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/plattformkapitalismus/ | `begriffe/plattformkapitalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/plattformlogik-und-algorithmen/ | `begriffe/plattformlogik-und-algorithmen/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/plattformregulierung/ | `begriffe/plattformregulierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/plug-and-charge/ | `begriffe/plug-and-charge/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pluralismus/ | `begriffe/pluralismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pluralismusfeindlichkeit/ | `begriffe/pluralismusfeindlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pluralistische-ignoranz/ | `begriffe/pluralistische-ignoranz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pluralitaet/ | `begriffe/pluralitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/plutokratie/ | `begriffe/plutokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/polarisierung/ | `begriffe/polarisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/policy-entrepreneurship/ | `begriffe/policy-entrepreneurship/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/policy-laundering/ | `begriffe/policy-laundering/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/policy-netzwerk/ | `begriffe/policy-netzwerk/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/politische-bildung/ | `begriffe/politische-bildung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/politische-uebergangspfade/ | `begriffe/politische-uebergangspfade/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/politischer-liberalismus/ | `begriffe/politischer-liberalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/politischer-vorraum/ | `begriffe/politischer-vorraum/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/politisches-system/ | `begriffe/politisches-system/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/populismus/ | `begriffe/populismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/portfolio-wirkung/ | `begriffe/portfolio-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/positive-externalitaet/ | `begriffe/positive-externalitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/positive-freiheit/ | `begriffe/positive-freiheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/positive-netto-wirkung/ | `begriffe/positive-netto-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/positive-wirkung/ | `begriffe/positive-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/power-purchase-agreement/ | `begriffe/power-purchase-agreement/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/spannungsqualitaet/ | `begriffe/spannungsqualitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/power-to-x/ | `begriffe/power-to-x/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/praediktive-verarbeitung/ | `begriffe/praediktive-verarbeitung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/praeferenzen/ | `begriffe/praeferenzen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/praevention/ | `begriffe/praevention/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/praevention-als-wirkleistung/ | `begriffe/praevention-als-wirkleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/praeventionsdividende/ | `begriffe/praeventionsdividende/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/praeventionsoekonomie/ | `begriffe/praeventionsoekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/praeventionsschulden/ | `begriffe/praeventionsschulden/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/precariousness/ | `begriffe/precariousness/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/preis-anreiz-und-rueckkopplungs-canvas/ | `begriffe/preis-anreiz-und-rueckkopplungs-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/preisvollstaendigkeit/ | `begriffe/preisvollstaendigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pressefreiheit/ | `begriffe/pressefreiheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/primaerenergie/ | `begriffe/primaerenergie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/primaerregelung/ | `begriffe/primaerregelung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/priming/ | `begriffe/priming/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/principal-agent-problem/ | `begriffe/principal-agent-problem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/privathaushaltsmythos/ | `begriffe/privathaushaltsmythos/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/privatisierung/ | `begriffe/privatisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/privatkredit-frame/ | `begriffe/privatkredit-frame/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/privatwirtschaftliche-planwirtschaft/ | `begriffe/privatwirtschaftliche-planwirtschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/problem-und-wirkungsbaum/ | `begriffe/problem-und-wirkungsbaum/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/problem-wirkungs-system-markt-fit/ | `begriffe/problem-wirkungs-system-markt-fit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/process-mining-und-realitaetsreview/ | `begriffe/process-mining-und-realitaetsreview/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/product-carbon-footprint/ | `begriffe/product-carbon-footprint/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/product-environmental-footprint/ | `begriffe/product-environmental-footprint/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/product-as-a-service/ | `begriffe/product-as-a-service/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/product-market-fit/ | `begriffe/product-market-fit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/produkt-labels/ | `begriffe/produkt-labels/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/produkt-id/ | `begriffe/produkt-id/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/produkt-markt-wirkungs-fit/ | `begriffe/produkt-markt-wirkungs-fit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/produktdaten/ | `begriffe/produktdaten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/produktfinanzierungs-und-outcome-portfolio/ | `begriffe/produktfinanzierungs-und-outcome-portfolio/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/produktivitaetsgewinne/ | `begriffe/produktivitaetsgewinne/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/produktivitaetssteuer/ | `begriffe/produktivitaetssteuer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/produktlebenszyklus-wirkungs-canvas/ | `begriffe/produktlebenszyklus-wirkungs-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/produktscorecard/ | `begriffe/produktscorecard/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/produktwirkung/ | `begriffe/produktwirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/programmarchitektur-und-abhaengigkeitskarte/ | `begriffe/programmarchitektur-und-abhaengigkeitskarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/programmatik-praxis-luecke/ | `begriffe/programmatik-praxis-luecke/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/progressiv/ | `begriffe/progressiv/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/project-2025/ | `begriffe/project-2025/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/projektions-bias/ | `begriffe/projektions-bias/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/propaganda/ | `begriffe/propaganda/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/prosumer/ | `begriffe/prosumer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/prozess-und-systemintegration/ | `begriffe/prozess-und-systemintegration/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/prozess-kii-und-wirkungskontrollpunkte/ | `begriffe/prozess-kii-und-wirkungskontrollpunkte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/prozessdenken/ | `begriffe/prozessdenken/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/psychologische-sicherheit/ | `begriffe/psychologische-sicherheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/psychologische-sicherheit-und-wirkungswiderspruch/ | `begriffe/psychologische-sicherheit-und-wirkungswiderspruch/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/psychologischer-wirkungscheck/ | `begriffe/psychologischer-wirkungscheck/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/psychologisches-stoeckchen/ | `begriffe/psychologisches-stoeckchen/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/ptl-kraftstoff/ | `begriffe/ptl-kraftstoff/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/public-affairs/ | `begriffe/public-affairs/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/public-purpose/ | `begriffe/public-purpose/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/public-purpose-finance/ | `begriffe/public-purpose-finance/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pufferspeicher-ladepark/ | `begriffe/pufferspeicher-ladepark/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/pumpspeicher/ | `begriffe/pumpspeicher/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/purpose-washing/ | `begriffe/purpose-washing/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/pyrometallurgie/ | `begriffe/pyrometallurgie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/qualifikationsverlust/ | `begriffe/qualifikationsverlust/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/qualitaetssicherung/ | `begriffe/qualitaetssicherung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quango/ | `begriffe/quango/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quantenbatterie/ | `begriffe/quantenbatterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quantencomputer/ | `begriffe/quantencomputer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quantenfeldtheorie/ | `begriffe/quantenfeldtheorie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quanteninformation/ | `begriffe/quanteninformation/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/quantenmaterialien/ | `begriffe/quantenmaterialien/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quantenmechanik/ | `begriffe/quantenmechanik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quantenmetapher/ | `begriffe/quantenmetapher/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quantenmystik/ | `begriffe/quantenmystik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quantenphysik/ | `begriffe/quantenphysik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quantenpunkt/ | `begriffe/quantenpunkt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quantensimulation/ | `begriffe/quantensimulation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quantensolarzelle/ | `begriffe/quantensolarzelle/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quantentechnologie/ | `begriffe/quantentechnologie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quantisierung/ | `begriffe/quantisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quartiersenergie/ | `begriffe/quartiersenergie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quartierswirkung/ | `begriffe/quartierswirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/qubit/ | `begriffe/qubit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/queere-migrantinnen/ | `begriffe/queere-migrantinnen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/queerfeindlichkeit/ | `begriffe/queerfeindlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quellenklarheit/ | `begriffe/quellenklarheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/quote-mining-dekontextualisierung/ | `begriffe/quote-mining-dekontextualisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/radical-left/ | `begriffe/radical-left/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/radikal/ | `begriffe/radikal/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rage-bait/ | `begriffe/rage-bait/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rassismus/ | `begriffe/rassismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rationalitaet/ | `begriffe/rationalitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/raubtierkapitalismus/ | `begriffe/raubtierkapitalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reach/ | `begriffe/reach/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reaktanz/ | `begriffe/reaktanz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reaktionaer/ | `begriffe/reaktionaer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reale-freiheit/ | `begriffe/reale-freiheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/realressourcengrenze/ | `begriffe/realressourcengrenze/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reasonable-assurance/ | `begriffe/reasonable-assurance/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rebound-effekt/ | `begriffe/rebound-effekt/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/rechenschaft/ | `begriffe/rechenschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/recht-auf-reparatur/ | `begriffe/recht-auf-reparatur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rechte-kuenftiger-generationen/ | `begriffe/rechte-kuenftiger-generationen/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/rechts-politisch/ | `begriffe/rechts-politisch/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rechtsextremismus/ | `begriffe/rechtsextremismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rechtsprechung-als-korrekturinstanz/ | `begriffe/rechtsprechung-als-korrekturinstanz/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/rechtsschutz/ | `begriffe/rechtsschutz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rechtsschutz-gegen-wirkungsentscheidungen/ | `begriffe/rechtsschutz-gegen-wirkungsentscheidungen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rechtsstaatlichkeit/ | `begriffe/rechtsstaatlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rechtsstaatsabbau/ | `begriffe/rechtsstaatsabbau/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rechtsstaatsprinzip/ | `begriffe/rechtsstaatsprinzip/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/recycling/ | `begriffe/recycling/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/recyclingeffizienz/ | `begriffe/recyclingeffizienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/recyclingquote/ | `begriffe/recyclingquote/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/red-herring/ | `begriffe/red-herring/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/redispatch/ | `begriffe/redispatch/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/redispatch-2-0/ | `begriffe/redispatch-2-0/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/redox-flow-batterie/ | `begriffe/redox-flow-batterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/referenzrahmen/ | `begriffe/referenzrahmen/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/referenzrahmen-und-standardmapping/ | `begriffe/referenzrahmen-und-standardmapping/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/refinanzierung/ | `begriffe/refinanzierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/refinanzierungsresilienz/ | `begriffe/refinanzierungsresilienz/index.html` | ADD_GLOSSARY_CROSSLINKS | novelty_or_absence |
| https://wirkungsoekonomie.de/begriffe/reform/ | `begriffe/reform/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reframing/ | `begriffe/reframing/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/refurbishment/ | `begriffe/refurbishment/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/regelbasierte-ordnung/ | `begriffe/regelbasierte-ordnung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/regelenergie/ | `begriffe/regelenergie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/regelenergiemarkt/ | `begriffe/regelenergiemarkt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/regeneration/ | `begriffe/regeneration/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/regenerative-energiequellen/ | `begriffe/regenerative-energiequellen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/regenerative-landwirtschaft/ | `begriffe/regenerative-landwirtschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/regeneratives-wachstum/ | `begriffe/regeneratives-wachstum/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/regierung/ | `begriffe/regierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/regierungsform/ | `begriffe/regierungsform/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/regierungskritik/ | `begriffe/regierungskritik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/regime/ | `begriffe/regime/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/regulatory-capture/ | `begriffe/regulatory-capture/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/regulierungsversagen/ | `begriffe/regulierungsversagen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reichweite/ | `begriffe/reichweite/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rekombination/ | `begriffe/rekombination/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rekursion/ | `begriffe/rekursion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/religioeser-fundamentalismus/ | `begriffe/religioeser-fundamentalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/remanufacturing/ | `begriffe/remanufacturing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/renaturierung/ | `begriffe/renaturierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rent-seeking/ | `begriffe/rent-seeking/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/rentenfinanzierung/ | `begriffe/rentenfinanzierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reparatur/ | `begriffe/reparatur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reparaturfaehigkeit/ | `begriffe/reparaturfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reparaturschulden/ | `begriffe/reparaturschulden/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/reparaturwohlstand/ | `begriffe/reparaturwohlstand/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reparierbarkeit/ | `begriffe/reparierbarkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reparierbarkeit-recht-auf-reparatur/ | `begriffe/reparierbarkeit-recht-auf-reparatur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reporting/ | `begriffe/reporting/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/repowering/ | `begriffe/repowering/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/repraesentation/ | `begriffe/repraesentation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/repraesentationsanspruch/ | `begriffe/repraesentationsanspruch/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/repraesentative-demokratie/ | `begriffe/repraesentative-demokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reproduktive-arbeit/ | `begriffe/reproduktive-arbeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reproduktive-gerechtigkeit/ | `begriffe/reproduktive-gerechtigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reproduktive-rechte/ | `begriffe/reproduktive-rechte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reservekraftwerk/ | `begriffe/reservekraftwerk/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/residual-emissions/ | `begriffe/residual-emissions/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/residuallast/ | `begriffe/residuallast/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/resignifikation/ | `begriffe/resignifikation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/resilienz/ | `begriffe/resilienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/resilienzarchitektur/ | `begriffe/resilienzarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/resilienzmanagement/ | `begriffe/resilienzmanagement/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/resistance/ | `begriffe/resistance/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/resonanz/ | `begriffe/resonanz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/resonanzarchitektur/ | `begriffe/resonanzarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/resonanzprofil/ | `begriffe/resonanzprofil/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/resonanzraum/ | `begriffe/resonanzraum/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/resonanzrisiko/ | `begriffe/resonanzrisiko/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/responsible-marketing/ | `begriffe/responsible-marketing/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/responsivitaet/ | `begriffe/responsivitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ressourcenallokation/ | `begriffe/ressourcenallokation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reststrom/ | `begriffe/reststrom/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reueaversion/ | `begriffe/reueaversion/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/reverse-logistics/ | `begriffe/reverse-logistics/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reverse-merit-order/ | `begriffe/reverse-merit-order/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/reziprozitaet/ | `begriffe/reziprozitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rezyklatanteil/ | `begriffe/rezyklatanteil/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rezyklatquote-batterie/ | `begriffe/rezyklatquote-batterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rigged-election/ | `begriffe/rigged-election/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rino/ | `begriffe/rino/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/risiko-und-resilienzregister/ | `begriffe/risiko-und-resilienzregister/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/risikomanagement/ | `begriffe/risikomanagement/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/risikoregister/ | `begriffe/risikoregister/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rlm-messung/ | `begriffe/rlm-messung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rmo/ | `begriffe/rmo/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/roaming-ladeinfrastruktur/ | `begriffe/roaming-ladeinfrastruktur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/roboteroekonomie/ | `begriffe/roboteroekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/robotersteuer/ | `begriffe/robotersteuer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/robotik/ | `begriffe/robotik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/robuste-optionen-und-adaptive-wirkungspfade/ | `begriffe/robuste-optionen-und-adaptive-wirkungspfade/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/robustheit/ | `begriffe/robustheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rohstoffkritikalitaet/ | `begriffe/rohstoffkritikalitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/roi/ | `begriffe/roi/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rote-linien/ | `begriffe/rote-linien/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rotorblatt-recycling/ | `begriffe/rotorblatt-recycling/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/routineunternehmer/ | `begriffe/routineunternehmer/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/rueckbau-windenergieanlagen/ | `begriffe/rueckbau-windenergieanlagen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rueckbaupflicht/ | `begriffe/rueckbaupflicht/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rueckbaustandard/ | `begriffe/rueckbaustandard/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rueckbauverpflichtung/ | `begriffe/rueckbauverpflichtung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rueckkopplung/ | `begriffe/rueckkopplung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/rueckkopplungsfaehigkeit/ | `begriffe/rueckkopplungsfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/ruecknahmefaehigkeit/ | `begriffe/ruecknahmefaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ruecknahmesystem/ | `begriffe/ruecknahmesystem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rueckschaufehler/ | `begriffe/rueckschaufehler/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/rueckstellfaehigkeit/ | `begriffe/rueckstellfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rueckverstromung/ | `begriffe/rueckverstromung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/rueckkopplungspreis/ | `begriffe/rueckkopplungspreis/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/sachleistung/ | `begriffe/sachleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/salienz/ | `begriffe/salienz/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/salienzsteuerung/ | `begriffe/salienzsteuerung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sanierungsfahrplan/ | `begriffe/sanierungsfahrplan/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sbti/ | `begriffe/sbti/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/scheindemokratie/ | `begriffe/scheindemokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/scheinentlastung/ | `begriffe/scheinentlastung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/scheinkapital/ | `begriffe/scheinkapital/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/scheinkausalitaet-false-cause/ | `begriffe/scheinkausalitaet-false-cause/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/scheinleistung/ | `begriffe/scheinleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, evaluation |
| https://wirkungsoekonomie.de/begriffe/scheinwahrheit/ | `begriffe/scheinwahrheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/scheinwohlstand/ | `begriffe/scheinwohlstand/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schnellladen/ | `begriffe/schnellladen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schnellladepark/ | `begriffe/schnellladepark/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schoepferische-rekonstruktion/ | `begriffe/schoepferische-rekonstruktion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schoepferische-zerstoerung/ | `begriffe/schoepferische-zerstoerung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schulden-nichtkompensation/ | `begriffe/schulden-nichtkompensation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schuldenbremse/ | `begriffe/schuldenbremse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schuldenmythos/ | `begriffe/schuldenmythos/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schumpeter-joseph-a/ | `begriffe/schumpeter-joseph-a/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schumpetersche-innovation/ | `begriffe/schumpetersche-innovation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schutz-natuerlicher-lebensgrundlagen/ | `begriffe/schutz-natuerlicher-lebensgrundlagen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schutzarchitektur/ | `begriffe/schutzarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schutzpflicht/ | `begriffe/schutzpflicht/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schutztechnik/ | `begriffe/schutztechnik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schwarze-null/ | `begriffe/schwarze-null/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schwarzstartfaehigkeit/ | `begriffe/schwarzstartfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schweigespirale/ | `begriffe/schweigespirale/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/schwellenwert/ | `begriffe/schwellenwert/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/scope-1/ | `begriffe/scope-1/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/scope-1-2-3/ | `begriffe/scope-1-2-3/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/scope-2/ | `begriffe/scope-2/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/scope-3/ | `begriffe/scope-3/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/scope-3-datenqualitaet/ | `begriffe/scope-3-datenqualitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/scorecard/ | `begriffe/scorecard/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/sdg-plus/ | `begriffe/sdg-plus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sdg-sdgplus-referenzrahmen/ | `begriffe/sdg-sdgplus-referenzrahmen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sdg-washing/ | `begriffe/sdg-washing/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/sdgs/ | `begriffe/sdgs/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sdgs-und-verschwoerungsnarrative/ | `begriffe/sdgs-und-verschwoerungsnarrative/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/sealioning/ | `begriffe/sealioning/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/second-life-batterie/ | `begriffe/second-life-batterie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sektorkopplung/ | `begriffe/sektorkopplung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sekundaerregelung/ | `begriffe/sekundaerregelung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sekundaerrohstoff/ | `begriffe/sekundaerrohstoff/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/selbstorganisation/ | `begriffe/selbstorganisation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/selbstreferenz/ | `begriffe/selbstreferenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/selbstverantwortung/ | `begriffe/selbstverantwortung/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/selbstwirksamkeit/ | `begriffe/selbstwirksamkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/selektive-evidenz/ | `begriffe/selektive-evidenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/self-ownership/ | `begriffe/self-ownership/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/self-serving-bias/ | `begriffe/self-serving-bias/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/senkenallmende/ | `begriffe/senkenallmende/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sensemaking/ | `begriffe/sensemaking/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sensibilisierung/ | `begriffe/sensibilisierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/service-blueprint-mit-wirkungsempfaengern/ | `begriffe/service-blueprint-mit-wirkungsempfaengern/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/service-ngo/ | `begriffe/service-ngo/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sexarbeit/ | `begriffe/sexarbeit/index.html` | ADD_GLOSSARY_CROSSLINKS | novelty_or_absence |
| https://wirkungsoekonomie.de/begriffe/sfdr/ | `begriffe/sfdr/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/shaolin/ | `begriffe/shaolin/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/shareholder-value/ | `begriffe/shareholder-value/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/sicherheits-t-sroi/ | `begriffe/sicherheits-t-sroi/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sicherheitspolitische-staatsschuld/ | `begriffe/sicherheitspolitische-staatsschuld/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sicherheitsresilienz/ | `begriffe/sicherheitsresilienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sichtbare-rechnung/ | `begriffe/sichtbare-rechnung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/skandinavisches-modell/ | `begriffe/skandinavisches-modell/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/skills-workforce-und-rollenarchitektur/ | `begriffe/skills-workforce-und-rollenarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/slippery-slope-dammbruchargument/ | `begriffe/slippery-slope-dammbruchargument/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/small-modular-reactor/ | `begriffe/small-modular-reactor/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/smart-charging/ | `begriffe/smart-charging/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/smart-grid/ | `begriffe/smart-grid/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/smart-meter/ | `begriffe/smart-meter/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/smart-meter-gateway/ | `begriffe/smart-meter-gateway/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/social-credit/ | `begriffe/social-credit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/social-solidarity-economy/ | `begriffe/social-solidarity-economy/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/social-taxonomy/ | `begriffe/social-taxonomy/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/solarthermie/ | `begriffe/solarthermie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/solidaritaet/ | `begriffe/solidaritaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sorgearbeit/ | `begriffe/sorgearbeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/souveraenes-stranding-risiko/ | `begriffe/souveraenes-stranding-risiko/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/sozialstandards/ | `begriffe/sozialstandards/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sozialabgaben/ | `begriffe/sozialabgaben/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/soziale-ansteckung/ | `begriffe/soziale-ansteckung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/soziale-bewaehrtheit/ | `begriffe/soziale-bewaehrtheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/soziale-fragmentierung/ | `begriffe/soziale-fragmentierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/soziale-infrastruktur/ | `begriffe/soziale-infrastruktur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/soziale-marktwirtschaft/ | `begriffe/soziale-marktwirtschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/soziale-reproduktion/ | `begriffe/soziale-reproduktion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/soziale-sanktionierung/ | `begriffe/soziale-sanktionierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/soziale-staatsschuld/ | `begriffe/soziale-staatsschuld/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/soziales-dilemma/ | `begriffe/soziales-dilemma/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sozialfinanzierung/ | `begriffe/sozialfinanzierung/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/sozialisation/ | `begriffe/sozialisation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sozialisierung-vergesellschaftung/ | `begriffe/sozialisierung-vergesellschaftung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sozialismus/ | `begriffe/sozialismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sozialliberalismus/ | `begriffe/sozialliberalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sozialstaats-suendenbock/ | `begriffe/sozialstaats-suendenbock/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sozialstaatsprinzip/ | `begriffe/sozialstaatsprinzip/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sozialtourismus-frame/ | `begriffe/sozialtourismus-frame/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/spannungshaltung/ | `begriffe/spannungshaltung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/speicher-energie/ | `begriffe/speicher-energie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/spekulationslogik/ | `begriffe/spekulationslogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/spiegeln/ | `begriffe/spiegeln/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/spitzenlast/ | `begriffe/spitzenlast/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sponsor-und-fuehrungskoalitionsarchitektur/ | `begriffe/sponsor-und-fuehrungskoalitionsarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sprachlicher-trigger/ | `begriffe/sprachlicher-trigger/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sprachspiel/ | `begriffe/sprachspiel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sroi/ | `begriffe/sroi/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/st-galler-management-modell/ | `begriffe/st-galler-management-modell/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/st-galler-managementlehre/ | `begriffe/st-galler-managementlehre/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/st-galler-managementmodell/ | `begriffe/st-galler-managementmodell/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/staat/ | `begriffe/staat/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/staat-2035/ | `begriffe/staat-2035/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/begriffe/staatliche-nachhaltigkeitsarchitektur/ | `begriffe/staatliche-nachhaltigkeitsarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, evaluation |
| https://wirkungsoekonomie.de/begriffe/state-gfa-enap-benchmark/ | `begriffe/state-gfa-enap-benchmark/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, dns |
| https://wirkungsoekonomie.de/begriffe/staatsdelegitimierung/ | `begriffe/staatsdelegitimierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/staatsfinanzielle-wirkungsblindheit/ | `begriffe/staatsfinanzielle-wirkungsblindheit/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/staatsform/ | `begriffe/staatsform/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/staatsgebiet/ | `begriffe/staatsgebiet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/staatsgewalt/ | `begriffe/staatsgewalt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/staatskapitalismus/ | `begriffe/staatskapitalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/staatspropaganda/ | `begriffe/staatspropaganda/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/staatssozialismus/ | `begriffe/staatssozialismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/staatsversagen/ | `begriffe/staatsversagen/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/staatsvolk/ | `begriffe/staatsvolk/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/staatsziel-umweltschutz/ | `begriffe/staatsziel-umweltschutz/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/staatsziele-und-verfassungsauftraege/ | `begriffe/staatsziele-und-verfassungsauftraege/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stabilitaet/ | `begriffe/stabilitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stabilitaetslandschaft/ | `begriffe/stabilitaetslandschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stadtwerke/ | `begriffe/stadtwerke/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stafford-beer/ | `begriffe/stafford-beer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stakeholder-ansatz/ | `begriffe/stakeholder-ansatz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stakeholder-kapitalismus/ | `begriffe/stakeholder-kapitalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/standardlastprofil/ | `begriffe/standardlastprofil/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/standardmodell-der-teilchenphysik/ | `begriffe/standardmodell-der-teilchenphysik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/standortscorecard/ | `begriffe/standortscorecard/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/standortwirkung/ | `begriffe/standortwirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/state-capture/ | `begriffe/state-capture/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/state-of-charge/ | `begriffe/state-of-charge/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/state-of-health/ | `begriffe/state-of-health/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stationaerer-batteriespeicher/ | `begriffe/stationaerer-batteriespeicher/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/status-threat/ | `begriffe/status-threat/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/status-quo-bias/ | `begriffe/status-quo-bias/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, alternativen |
| https://wirkungsoekonomie.de/begriffe/steuergeld-frame/ | `begriffe/steuergeld-frame/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/steuerkritik/ | `begriffe/steuerkritik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/steuerungsdaten/ | `begriffe/steuerungsdaten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/steward-ownership/ | `begriffe/steward-ownership/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stiftung/ | `begriffe/stiftung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stranded-assets/ | `begriffe/stranded-assets/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stranded-sovereign/ | `begriffe/stranded-sovereign/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/strandinggefaehrdeter-kredit/ | `begriffe/strandinggefaehrdeter-kredit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/strategie-und-wirkungsstresstest/ | `begriffe/strategie-und-wirkungsstresstest/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/strategische-reserve/ | `begriffe/strategische-reserve/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/strategisches-management/ | `begriffe/strategisches-management/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/streisand-effekt/ | `begriffe/streisand-effekt/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/streitfaehigkeit/ | `begriffe/streitfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stressreaktion/ | `begriffe/stressreaktion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/strohmann/ | `begriffe/strohmann/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stromgestehungskosten/ | `begriffe/stromgestehungskosten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/strommarkt/ | `begriffe/strommarkt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/strommarktdesign/ | `begriffe/strommarktdesign/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/strommix/ | `begriffe/strommix/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stromnetz/ | `begriffe/stromnetz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stromnev/ | `begriffe/stromnev/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/strompreisbestandteile/ | `begriffe/strompreisbestandteile/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/stromsteuer/ | `begriffe/stromsteuer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/strukturdeterminiertheit/ | `begriffe/strukturdeterminiertheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/strukturelle-kopplung/ | `begriffe/strukturelle-kopplung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/struktureller-rassismus/ | `begriffe/struktureller-rassismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/strukturelles-driften/ | `begriffe/strukturelles-driften/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/studienfinanzierung/ | `begriffe/studienfinanzierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/subsidiaritaet/ | `begriffe/subsidiaritaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/suffizienz/ | `begriffe/suffizienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/suendenbockmechanismus/ | `begriffe/suendenbockmechanismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/superkondensator/ | `begriffe/superkondensator/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/superposition/ | `begriffe/superposition/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/supply-chain-resilienz/ | `begriffe/supply-chain-resilienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/supply-side-economics/ | `begriffe/supply-side-economics/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/supraleitung/ | `begriffe/supraleitung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sustainability-benchmarking/ | `begriffe/sustainability-benchmarking/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sustainable-finance/ | `begriffe/sustainable-finance/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sustainable-value/ | `begriffe/sustainable-value/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sustainalytics/ | `begriffe/sustainalytics/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/symbolausgabe/ | `begriffe/symbolausgabe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sympathie-verzerrung/ | `begriffe/sympathie-verzerrung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemdienstleistungen/ | `begriffe/systemdienstleistungen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemgrenze/ | `begriffe/systemgrenze/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemgrenzen-und-reichweiten-canvas/ | `begriffe/systemgrenzen-und-reichweiten-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemhebel/ | `begriffe/systemhebel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemhebel-analyse/ | `begriffe/systemhebel-analyse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemisch-positives-summenspiel/ | `begriffe/systemisch-positives-summenspiel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemische-kohaerenz/ | `begriffe/systemische-kohaerenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemische-kooperation/ | `begriffe/systemische-kooperation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemische-risikointelligenz/ | `begriffe/systemische-risikointelligenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemischer-wert/ | `begriffe/systemischer-wert/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemkosten/ | `begriffe/systemkosten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemlandkarte/ | `begriffe/systemlandkarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemorientiertes-management/ | `begriffe/systemorientiertes-management/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemqualitaet/ | `begriffe/systemqualitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemresilienz/ | `begriffe/systemresilienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemtheorie/ | `begriffe/systemtheorie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/systemverzerrender-lobbyismus/ | `begriffe/systemverzerrender-lobbyismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/t-sroi/ | `begriffe/t-sroi/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tab-mittelspannung/ | `begriffe/tab-mittelspannung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tacit-knowledge/ | `begriffe/tacit-knowledge/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tandem-solarzelle/ | `begriffe/tandem-solarzelle/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tank-to-wheel/ | `begriffe/tank-to-wheel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tankstellenlogik/ | `begriffe/tankstellenlogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tar-mittelspannung/ | `begriffe/tar-mittelspannung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/target-gain/ | `begriffe/target-gain/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tauschwert/ | `begriffe/tauschwert/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/taxonomy-kpis/ | `begriffe/taxonomy-kpis/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/taxonomiefaehigkeit/ | `begriffe/taxonomiefaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/taxonomiekonformitaet/ | `begriffe/taxonomiekonformitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/taxonomy-compass/ | `begriffe/taxonomy-compass/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/taxonomy-navigator/ | `begriffe/taxonomy-navigator/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tcfd/ | `begriffe/tcfd/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/trump-derangement-syndrome/ | `begriffe/trump-derangement-syndrome/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/technische-anschlussregel/ | `begriffe/technische-anschlussregel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/technische-bewertungskriterien/ | `begriffe/technische-bewertungskriterien/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/technischer-kreislauf/ | `begriffe/technischer-kreislauf/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/technischer-naehrstoff/ | `begriffe/technischer-naehrstoff/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/technokratie-ueberwachung-social-credit/ | `begriffe/technokratie-ueberwachung-social-credit/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/technologieabhaengigkeits-lock-in-und-souveraenitaetskarte/ | `begriffe/technologieabhaengigkeits-lock-in-und-souveraenitaetskarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/technologieoffenheit/ | `begriffe/technologieoffenheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/technologiereifegrad/ | `begriffe/technologiereifegrad/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/sharing/ | `begriffe/sharing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/teilgabe/ | `begriffe/teilgabe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/teilhabe/ | `begriffe/teilhabe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/territorialbilanz/ | `begriffe/territorialbilanz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/drain-the-swamp/ | `begriffe/drain-the-swamp/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/theokratie/ | `begriffe/theokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/theory-of-change/ | `begriffe/theory-of-change/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/thermal-runaway/ | `begriffe/thermal-runaway/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/thermischer-strompfad/ | `begriffe/thermischer-strompfad/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/thermisches-kraftwerk/ | `begriffe/thermisches-kraftwerk/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/thg/ | `begriffe/thg/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/thg-emissions-scopes/ | `begriffe/thg-emissions-scopes/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/thinktank/ | `begriffe/thinktank/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/thinktank-netzwerk/ | `begriffe/thinktank-netzwerk/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/thomas-piketty/ | `begriffe/thomas-piketty/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/thought-terminating-cliches/ | `begriffe/thought-terminating-cliches/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tiere/ | `begriffe/tiere/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tierschutz-und-tierwohl/ | `begriffe/tierschutz-und-tierwohl/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tipping-point/ | `begriffe/tipping-point/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tnfd/ | `begriffe/tnfd/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tone-policing/ | `begriffe/tone-policing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/totalitarismus/ | `begriffe/totalitarismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/totalitarismus-arendt/ | `begriffe/totalitarismus-arendt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/totalverweigerer-frame/ | `begriffe/totalverweigerer-frame/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/trafostation/ | `begriffe/trafostation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transaktionskosten/ | `begriffe/transaktionskosten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transferentzugsrate/ | `begriffe/transferentzugsrate/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transformation/ | `begriffe/transformation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transformation-office-design-und-delivery-review/ | `begriffe/transformation-office-design-und-delivery-review/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transformationsbacklog-und-portfolio-kanban/ | `begriffe/transformationsbacklog-und-portfolio-kanban/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transformationsbonus/ | `begriffe/transformationsbonus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transformationscluster/ | `begriffe/transformationscluster/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transformationsfaehigkeit/ | `begriffe/transformationsfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transformationspfad/ | `begriffe/transformationspfad/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/transformationsportfolio/ | `begriffe/transformationsportfolio/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transformationsschulden/ | `begriffe/transformationsschulden/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transformationswelle/ | `begriffe/transformationswelle/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transformationswirkung/ | `begriffe/transformationswirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transformationswirkungs-logik/ | `begriffe/transformationswirkungs-logik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transformator/ | `begriffe/transformator/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transition-finance/ | `begriffe/transition-finance/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transition-plan/ | `begriffe/transition-plan/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transition-risk/ | `begriffe/transition-risk/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transmutation/ | `begriffe/transmutation/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/transparenz/ | `begriffe/transparenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/transparenzregister-lobbyismus/ | `begriffe/transparenzregister-lobbyismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/treibhausgasemissionen/ | `begriffe/treibhausgasemissionen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/trend-diskontinuitaets-und-wild-card-analyse/ | `begriffe/trend-diskontinuitaets-und-wild-card-analyse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/trickle-down-oekonomie/ | `begriffe/trickle-down-oekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tritium/ | `begriffe/tritium/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/trittbrettfahren/ | `begriffe/trittbrettfahren/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/trittbrettfahrerproblem/ | `begriffe/trittbrettfahrerproblem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/triviale-maschine/ | `begriffe/triviale-maschine/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/trustblock/ | `begriffe/trustblock/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/tu-quoque/ | `begriffe/tu-quoque/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/typ-2-stecker/ | `begriffe/typ-2-stecker/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/uebergabestation/ | `begriffe/uebergabestation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/uebergangstaetigkeit/ | `begriffe/uebergangstaetigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/uebertragungsnetz/ | `begriffe/uebertragungsnetz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ueberwachungskapitalismus/ | `begriffe/ueberwachungskapitalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ukraine-facility/ | `begriffe/ukraine-facility/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ukraine-hilfe/ | `begriffe/ukraine-hilfe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/umsetzungs-und-uebergangsschutzplan/ | `begriffe/umsetzungs-und-uebergangsschutzplan/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/umsetzungspfad/ | `begriffe/umsetzungspfad/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/umspannstation/ | `begriffe/umspannstation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/umspannwerk/ | `begriffe/umspannwerk/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/umwandlungskette/ | `begriffe/umwandlungskette/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/umweltgerechtigkeit/ | `begriffe/umweltgerechtigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/un/ | `begriffe/un/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/un-guiding-principles/ | `begriffe/un-guiding-principles/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unabhaengige-methoden-modell-und-wirkungspruefung/ | `begriffe/unabhaengige-methoden-modell-und-wirkungspruefung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unbezahlte-arbeit/ | `begriffe/unbezahlte-arbeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unesco/ | `begriffe/unesco/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unschaerferelation/ | `begriffe/unschaerferelation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unsichtbare-arbeit/ | `begriffe/unsichtbare-arbeit/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/unsichtbare-rechnung/ | `begriffe/unsichtbare-rechnung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/unterlassen/ | `begriffe/unterlassen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unterlassungskosten/ | `begriffe/unterlassungskosten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unterlassungsschuld/ | `begriffe/unterlassungsschuld/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unternehmen-2035/ | `begriffe/unternehmen-2035/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unternehmen-als-wirkungssystem/ | `begriffe/unternehmen-als-wirkungssystem/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/impact-governance-frameworks/ | `begriffe/impact-governance-frameworks/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unternehmerfunktion/ | `begriffe/unternehmerfunktion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unternehmerische-kompetenz/ | `begriffe/unternehmerische-kompetenz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unternehmerisches-lernen/ | `begriffe/unternehmerisches-lernen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unternehmertypen-jochen-roepke/ | `begriffe/unternehmertypen-jochen-roepke/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/unvollstaendiger-preis/ | `begriffe/unvollstaendiger-preis/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/upcycling/ | `begriffe/upcycling/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/urban-mining/ | `begriffe/urban-mining/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/urban-mining-batterien/ | `begriffe/urban-mining-batterien/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/ursachen-incident-und-lernanalyse/ | `begriffe/ursachen-incident-und-lernanalyse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/urteilskraft/ | `begriffe/urteilskraft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/value-proposition/ | `begriffe/value-proposition/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/value-proposition-canvas/ | `begriffe/value-proposition-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/value-based-pricing/ | `begriffe/value-based-pricing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/varietaet/ | `begriffe/varietaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vehicle-to-grid/ | `begriffe/vehicle-to-grid/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vehicle-to-home/ | `begriffe/vehicle-to-home/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vehicle-to-load/ | `begriffe/vehicle-to-load/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verantwortung-fuer-kommende-generationen/ | `begriffe/verantwortung-fuer-kommende-generationen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verantwortungsdiffusion/ | `begriffe/verantwortungsdiffusion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verantwortungsverkuerzung/ | `begriffe/verantwortungsverkuerzung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/verbrauchsgueter/ | `begriffe/verbrauchsgueter/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verbrenner-lock-in/ | `begriffe/verbrenner-lock-in/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verbrenneraus/ | `begriffe/verbrenneraus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verfahrensgerechtigkeit/ | `begriffe/verfahrensgerechtigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verfassung/ | `begriffe/verfassung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verfassungsgerichtsbarkeit/ | `begriffe/verfassungsgerichtsbarkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verfassungsmaessige-wirkungsarchitektur/ | `begriffe/verfassungsmaessige-wirkungsarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verfassungsorgan/ | `begriffe/verfassungsorgan/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verfassungspatriotismus/ | `begriffe/verfassungspatriotismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verfuegbarkeitsheuristik/ | `begriffe/verfuegbarkeitsheuristik/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/verfuegbarkeitskaskade/ | `begriffe/verfuegbarkeitskaskade/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verhaeltnismaessigkeit/ | `begriffe/verhaeltnismaessigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verhaeltnismaessigkeit-in-der-wirkungsoekonomie/ | `begriffe/verhaeltnismaessigkeit-in-der-wirkungsoekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verhaeltnismaessigkeit-nach-wirkung/ | `begriffe/verhaeltnismaessigkeit-nach-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/verlustaversion/ | `begriffe/verlustaversion/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/verlustleistung/ | `begriffe/verlustleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verlustschulden/ | `begriffe/verlustschulden/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/vermeidene-schaeden-folgekosten/ | `begriffe/vermeidene-schaeden-folgekosten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verschraenkung/ | `begriffe/verschraenkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verschwoerungserzaehlung/ | `begriffe/verschwoerungserzaehlung/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/versicherbarkeit/ | `begriffe/versicherbarkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/versionierung-statt-dogma/ | `begriffe/versionierung-statt-dogma/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/versorgungssicherheit/ | `begriffe/versorgungssicherheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verstaerkungslernen/ | `begriffe/verstaerkungslernen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verteidigungsfaehigkeit/ | `begriffe/verteidigungsfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verteilnetz/ | `begriffe/verteilnetz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vertragsfreiheit/ | `begriffe/vertragsfreiheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vertrauen/ | `begriffe/vertrauen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vertrauensallmende/ | `begriffe/vertrauensallmende/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vertrauensverschiebung/ | `begriffe/vertrauensverschiebung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vertrautheitseffekt/ | `begriffe/vertrautheitseffekt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/verwaltung/ | `begriffe/verwaltung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/viabilitaet/ | `begriffe/viabilitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/viable-system-model/ | `begriffe/viable-system-model/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vita-activa/ | `begriffe/vita-activa/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vlop/ | `begriffe/vlop/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/volkssouveraenitaet/ | `begriffe/volkssouveraenitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vollstaendige-information/ | `begriffe/vollstaendige-information/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vorgriffswohlstand/ | `begriffe/vorgriffswohlstand/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vorsorgeprinzip/ | `begriffe/vorsorgeprinzip/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vsme/ | `begriffe/vsme/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vulnerabilitaet/ | `begriffe/vulnerabilitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/vv-bho-wirtschaftlichkeitsuntersuchung-und-erfolgskontrolle/ | `begriffe/vv-bho-wirtschaftlichkeitsuntersuchung-und-erfolgskontrolle/index.html` | ADD_GLOSSARY_CROSSLINKS | nachhaltigkeitspruefung, enap, evaluation |
| https://wirkungsoekonomie.de/begriffe/w-bip/ | `begriffe/w-bip/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wahlintegritaet/ | `begriffe/wahlintegritaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wahlmanipulation/ | `begriffe/wahlmanipulation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wahrhaftigkeit/ | `begriffe/wahrhaftigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wahrheit/ | `begriffe/wahrheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wahrheitsillusionseffekt/ | `begriffe/wahrheitsillusionseffekt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wahrnehmung/ | `begriffe/wahrnehmung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wahrscheinlichkeit/ | `begriffe/wahrscheinlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wallbox/ | `begriffe/wallbox/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/walter-eucken/ | `begriffe/walter-eucken/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wandlermessung/ | `begriffe/wandlermessung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/waok/ | `begriffe/waok/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/warenfetisch/ | `begriffe/warenfetisch/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/waerme-t-sroi/ | `begriffe/waerme-t-sroi/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/waermepumpe/ | `begriffe/waermepumpe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/waermespeicher/ | `begriffe/waermespeicher/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/waermewende/ | `begriffe/waermewende/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/warmmietenneutralitaet/ | `begriffe/warmmietenneutralitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wartung/ | `begriffe/wartung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wasserkraft/ | `begriffe/wasserkraft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wasserstoff/ | `begriffe/wasserstoff/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/wasserstoff-hierarchie/ | `begriffe/wasserstoff-hierarchie/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/wasserstoff-kernnetz/ | `begriffe/wasserstoff-kernnetz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wasserstoffspeicher/ | `begriffe/wasserstoffspeicher/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wasserstress/ | `begriffe/wasserstress/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/watchdog-organisation/ | `begriffe/watchdog-organisation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/watzlawick-paul/ | `begriffe/watzlawick-paul/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wechselwirkung/ | `begriffe/wechselwirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wehrhafte-demokratie/ | `begriffe/wehrhafte-demokratie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/weiterbildung/ | `begriffe/weiterbildung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/weiterverteilung/ | `begriffe/weiterverteilung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/well-to-tank/ | `begriffe/well-to-tank/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/well-to-wheel/ | `begriffe/well-to-wheel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wellbeing-economy/ | `begriffe/wellbeing-economy/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/welle-teilchen-dualismus/ | `begriffe/welle-teilchen-dualismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/weltfaehig/ | `begriffe/weltfaehig/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/weltlosigkeit/ | `begriffe/weltlosigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wert/ | `begriffe/wert/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/werte/ | `begriffe/werte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wertebruecke/ | `begriffe/wertebruecke/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/wertekonflikt/ | `begriffe/wertekonflikt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/werterhalt/ | `begriffe/werterhalt/index.html` | ADD_GLOSSARY_CROSSLINKS | novelty_or_absence |
| https://wirkungsoekonomie.de/begriffe/wertewandel/ | `begriffe/wertewandel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wertschoepfung/ | `begriffe/wertschoepfung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wesentlicher-beitrag/ | `begriffe/wesentlicher-beitrag/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wettbewerb-als-suchverfahren/ | `begriffe/wettbewerb-als-suchverfahren/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/whataboutism/ | `begriffe/whataboutism/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/who/ | `begriffe/who/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/widerstand-gegen-neue-massstaebe/ | `begriffe/widerstand-gegen-neue-massstaebe/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, evaluation |
| https://wirkungsoekonomie.de/begriffe/wiedergeburtsnarrativ/ | `begriffe/wiedergeburtsnarrativ/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wiederverwendung/ | `begriffe/wiederverwendung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/windenergie/ | `begriffe/windenergie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/windenergieanlage-lebenszyklus/ | `begriffe/windenergieanlage-lebenszyklus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/windrad-recycling/ | `begriffe/windrad-recycling/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkleistung/ | `begriffe/wirkleistung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirklichkeitsbindung/ | `begriffe/wirklichkeitsbindung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirklichkeitsfaehigkeit/ | `begriffe/wirklichkeitsfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, alternativen |
| https://wirkungsoekonomie.de/begriffe/wirklichkeitskonstruktion/ | `begriffe/wirklichkeitskonstruktion/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkmechanismus/ | `begriffe/wirkmechanismus/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/wirkmechanismus-canvas/ | `begriffe/wirkmechanismus-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirksame-arbeit/ | `begriffe/wirksame-arbeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirksames-management/ | `begriffe/wirksames-management/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirksamkeit/ | `begriffe/wirksamkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkschulden/ | `begriffe/wirkschulden/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkstoff/ | `begriffe/wirkstoff/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkung/ | `begriffe/wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkung-als-rechtsprinzip/ | `begriffe/wirkung-als-rechtsprinzip/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/wirkung-dritter-ordnung/ | `begriffe/wirkung-dritter-ordnung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkung-erster-ordnung/ | `begriffe/wirkung-erster-ordnung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkung-statt-kapital/ | `begriffe/wirkung-statt-kapital/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkung-zweiter-ordnung/ | `begriffe/wirkung-zweiter-ordnung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkung-im-preisschild/ | `begriffe/wirkung-im-preisschild/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungs-bip/ | `begriffe/wirkungs-bip/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungs-bonus-malus-logik/ | `begriffe/wirkungs-bonus-malus-logik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungs-capability/ | `begriffe/wirkungs-capability/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungs-capability-map/ | `begriffe/wirkungs-capability-map/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungs-excellence-selbstbewertung/ | `begriffe/wirkungs-excellence-selbstbewertung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungs-konversion-von-altkapital/ | `begriffe/wirkungs-konversion-von-altkapital/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungs-mvp/ | `begriffe/wirkungs-mvp/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungs-product-operating-model/ | `begriffe/wirkungs-product-operating-model/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungs-product-operating-model-canvas/ | `begriffe/wirkungs-product-operating-model-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungs-systemstresstest/ | `begriffe/wirkungs-systemstresstest/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsabwehr/ | `begriffe/wirkungsabwehr/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsanalyse/ | `begriffe/wirkungsanalyse/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsanalyse-von-sprache/ | `begriffe/wirkungsanalyse-von-sprache/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsarchitektur/ | `begriffe/wirkungsarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsassurance/ | `begriffe/wirkungsassurance/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsassurance-audit-und-methodenpruefung/ | `begriffe/wirkungsassurance-audit-und-methodenpruefung/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsaudit/ | `begriffe/wirkungsaudit/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsausgabe/ | `begriffe/wirkungsausgabe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsbasierter-handel/ | `begriffe/wirkungsbasierter-handel/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsbasiertes-value-pricing/ | `begriffe/wirkungsbasiertes-value-pricing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsbedingte-stranded-assets/ | `begriffe/wirkungsbedingte-stranded-assets/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsbelasteter-kredit/ | `begriffe/wirkungsbelasteter-kredit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsbewertung/ | `begriffe/wirkungsbewertung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsbilanz-und-leistungszerlegung/ | `begriffe/wirkungsbilanz-und-leistungszerlegung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsbiografie/ | `begriffe/wirkungsbiografie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsblindheit/ | `begriffe/wirkungsblindheit/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsbonus/ | `begriffe/wirkungsbonus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsbudget/ | `begriffe/wirkungsbudget/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsbudgetierung/ | `begriffe/wirkungsbudgetierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungscontrolling/ | `begriffe/wirkungscontrolling/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsdashboard-und-managementcockpit/ | `begriffe/wirkungsdashboard-und-managementcockpit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsdaten/ | `begriffe/wirkungsdaten/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsdaten-governance-und-data-ownership/ | `begriffe/wirkungsdaten-governance-und-data-ownership/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsdaten-inventur-und-datenflusskarte/ | `begriffe/wirkungsdaten-inventur-und-datenflusskarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsdatenraum/ | `begriffe/wirkungsdatenraum/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsdatenraeume/ | `begriffe/wirkungsdatenraeume/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsdefizit/ | `begriffe/wirkungsdefizit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsdesign-doppelschleife/ | `begriffe/wirkungsdesign-doppelschleife/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsdilemma/ | `begriffe/wirkungsdilemma/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsdisziplin/ | `begriffe/wirkungsdisziplin/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsdividende/ | `begriffe/wirkungsdividende/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsebene-1/ | `begriffe/wirkungsebene-1/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsebene-2/ | `begriffe/wirkungsebene-2/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsebene-3/ | `begriffe/wirkungsebene-3/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungseffizienz/ | `begriffe/wirkungseffizienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungseinkommen/ | `begriffe/wirkungseinkommen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungseinkommensteuer/ | `begriffe/wirkungseinkommensteuer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsempfaenger/ | `begriffe/wirkungsempfaenger/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsempfaenger-und-stakeholder-landkarte/ | `begriffe/wirkungsempfaenger-und-stakeholder-landkarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsentscheidungsmemo/ | `begriffe/wirkungsentscheidungsmemo/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsethik/ | `begriffe/wirkungsethik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsexperiment/ | `begriffe/wirkungsexperiment/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsfeld/ | `begriffe/wirkungsfeld/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsfinanzierung/ | `begriffe/wirkungsfinanzierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsfinanzpolitik/ | `begriffe/wirkungsfinanzpolitik/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsfolgenabschaetzung/ | `begriffe/wirkungsfolgenabschaetzung/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/wirkungsfonds/ | `begriffe/wirkungsfonds/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsforschung/ | `begriffe/wirkungsforschung/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsfreiheit/ | `begriffe/wirkungsfreiheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsfruehwarn-und-eskalationssystem/ | `begriffe/wirkungsfruehwarn-und-eskalationssystem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsfuehrungsrad/ | `begriffe/wirkungsfuehrungsrad/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsgesellschaft/ | `begriffe/wirkungsgesellschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsgovernance/ | `begriffe/wirkungsgovernance/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsgovernance-canvas/ | `begriffe/wirkungsgovernance-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsgrad/ | `begriffe/wirkungsgrad/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsgrenze/ | `begriffe/wirkungsgrenze/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsgrenzen-und-rechtepruefung/ | `begriffe/wirkungsgrenzen-und-rechtepruefung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsgutschrift/ | `begriffe/wirkungsgutschrift/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, alternativen |
| https://wirkungsoekonomie.de/begriffe/wirkungshaushalt/ | `begriffe/wirkungshaushalt/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungshaushalt-ausland/ | `begriffe/wirkungshaushalt-ausland/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungshebel/ | `begriffe/wirkungshebel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungshypothesen-register/ | `begriffe/wirkungshypothesen-register/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsindikator/ | `begriffe/wirkungsindikator/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsinnovation/ | `begriffe/wirkungsinnovation/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsinstitut/ | `begriffe/wirkungsinstitut/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsintegration/ | `begriffe/wirkungsintegration/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsintegritaet/ | `begriffe/wirkungsintegritaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsinvestition-des-staates/ | `begriffe/wirkungsinvestition-des-staates/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungskapazitaet-des-staates/ | `begriffe/wirkungskapazitaet-des-staates/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungskapital/ | `begriffe/wirkungskapital/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungskapital-und-investitionsgate/ | `begriffe/wirkungskapital-und-investitionsgate/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungskette/ | `begriffe/wirkungskette/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsklasse/ | `begriffe/wirkungsklasse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungskommunikation/ | `begriffe/wirkungskommunikation/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungskompass/ | `begriffe/wirkungskompass/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungskompass-ausrichtung/ | `begriffe/wirkungskompass-ausrichtung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungskompetenz/ | `begriffe/wirkungskompetenz/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungskompetenz-matrix/ | `begriffe/wirkungskompetenz-matrix/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungskonversionskredit/ | `begriffe/wirkungskonversionskredit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungskredit/ | `begriffe/wirkungskredit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungslenkung/ | `begriffe/wirkungslenkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsluecke/ | `begriffe/wirkungsluecke/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsmanagement/ | `begriffe/wirkungsmanagement/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsmarkt/ | `begriffe/wirkungsmarkt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsmodell-canvas/ | `begriffe/wirkungsmodell-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsmonitoring/ | `begriffe/wirkungsmonitoring/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsnachweis/ | `begriffe/wirkungsnachweis/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsnachweiskonto/ | `begriffe/wirkungsnachweiskonto/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsnetz/ | `begriffe/wirkungsnetz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsoffenheit/ | `begriffe/wirkungsoffenheit/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, alternativen |
| https://wirkungsoekonomie.de/begriffe/wirkungsoekonomin-ph-woek/ | `begriffe/wirkungsoekonomin-ph-woek/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsoekonomie/ | `begriffe/wirkungsoekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsoekonomie-im-alltag/ | `begriffe/wirkungsoekonomie-im-alltag/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/wirkungsoekonomische-erfolgslogik/ | `begriffe/wirkungsoekonomische-erfolgslogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsoekonomische-kaufkraftlogik/ | `begriffe/wirkungsoekonomische-kaufkraftlogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsoekonomische-managementarchitektur/ | `begriffe/wirkungsoekonomische-managementarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsoekonomische-theory-of-change/ | `begriffe/wirkungsoekonomische-theory-of-change/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsoekonomischer-change-case/ | `begriffe/wirkungsoekonomischer-change-case/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsoekonomischer-wirkungsgrad/ | `begriffe/wirkungsoekonomischer-wirkungsgrad/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsoekonomisches-managementmodell/ | `begriffe/wirkungsoekonomisches-managementmodell/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsoekonomisches-methodensystem/ | `begriffe/wirkungsoekonomisches-methodensystem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsoptionen-und-ideenportfolio/ | `begriffe/wirkungsoptionen-und-ideenportfolio/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsordnungen-landkarte/ | `begriffe/wirkungsordnungen-landkarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsorientierte-forschung-und-innovation/ | `begriffe/wirkungsorientierte-forschung-und-innovation/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsorientierte-schuldenregel/ | `begriffe/wirkungsorientierte-schuldenregel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsorientierte-schuldentragfaehigkeit/ | `begriffe/wirkungsorientierte-schuldentragfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsorientierte-subventionspruefung/ | `begriffe/wirkungsorientierte-subventionspruefung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsorientierte-teamtopologie/ | `begriffe/wirkungsorientierte-teamtopologie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsorientierte-unternehmensfuehrung/ | `begriffe/wirkungsorientierte-unternehmensfuehrung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsorientiertes-hosting/ | `begriffe/wirkungsorientiertes-hosting/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsorientiertes-operating-model/ | `begriffe/wirkungsorientiertes-operating-model/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungspaedagogik/ | `begriffe/wirkungspaedagogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungspartnerschaft/ | `begriffe/wirkungspartnerschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkpfad/ | `begriffe/wirkpfad/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungspflicht-des-eigentums/ | `begriffe/wirkungspflicht-des-eigentums/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungspilot-design/ | `begriffe/wirkungspilot-design/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungspionier/ | `begriffe/wirkungspionier/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsportfolio/ | `begriffe/wirkungsportfolio/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungspotenzial/ | `begriffe/wirkungspotenzial/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungspotenzialmanagement/ | `begriffe/wirkungspotenzialmanagement/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungspraxis/ | `begriffe/wirkungspraxis/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsproblem-canvas/ | `begriffe/wirkungsproblem-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsproblem-loesungs-fit/ | `begriffe/wirkungsproblem-loesungs-fit/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/wirkungsprofil/ | `begriffe/wirkungsprofil/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsprofil-im-radardiagramm/ | `begriffe/wirkungsprofil-im-radardiagramm/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsprototyp-canvas/ | `begriffe/wirkungsprototyp-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungspruefung/ | `begriffe/wirkungspruefung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, folgenabschaetzung, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungspruefung-oeffentlicher-mittel/ | `begriffe/wirkungspruefung-oeffentlicher-mittel/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungspunkte/ | `begriffe/wirkungspunkte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsqualitaet-der-schulden/ | `begriffe/wirkungsqualitaet-der-schulden/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsradar/ | `begriffe/wirkungsradar/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsrat/ | `begriffe/wirkungsrat/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsraum/ | `begriffe/wirkungsraum/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsrealisierungsarchitektur/ | `begriffe/wirkungsrealisierungsarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsrecht/ | `begriffe/wirkungsrecht/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsregister/ | `begriffe/wirkungsregister/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsrelevanz-statt-rechtsform/ | `begriffe/wirkungsrelevanz-statt-rechtsform/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsrelevanz-und-materialitaetsanalyse/ | `begriffe/wirkungsrelevanz-und-materialitaetsanalyse/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsrendite/ | `begriffe/wirkungsrendite/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsrendite-oeffentlicher-ausgaben/ | `begriffe/wirkungsrendite-oeffentlicher-ausgaben/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsrente/ | `begriffe/wirkungsrente/index.html` | ADD_GLOSSARY_CROSSLINKS | novelty_or_absence |
| https://wirkungsoekonomie.de/begriffe/wirkungsresilienz/ | `begriffe/wirkungsresilienz/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsresilienz-pfade/ | `begriffe/wirkungsresilienz-pfade/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsreview-und-lernende-retrospektive/ | `begriffe/wirkungsreview-und-lernende-retrospektive/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsrisiko/ | `begriffe/wirkungsrisiko/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungsrisiko-matrix/ | `begriffe/wirkungsrisiko-matrix/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsrisikomanagement/ | `begriffe/wirkungsrisikomanagement/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsrisikoposition/ | `begriffe/wirkungsrisikoposition/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsrollen-und-verantwortungsmatrix/ | `begriffe/wirkungsrollen-und-verantwortungsmatrix/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsrueckkopplung/ | `begriffe/wirkungsrueckkopplung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsschule/ | `begriffe/wirkungsschule/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsscorecard-und-finalscore/ | `begriffe/wirkungsscorecard-und-finalscore/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungssimulation/ | `begriffe/wirkungssimulation/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungsskalierungs-diffusions-und-exit-canvas/ | `begriffe/wirkungsskalierungs-diffusions-und-exit-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsspielraum/ | `begriffe/wirkungsspielraum/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsstaat/ | `begriffe/wirkungsstaat/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/begriffe/wirkungssteuer/ | `begriffe/wirkungssteuer/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungssteuergesetz/ | `begriffe/wirkungssteuergesetz/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungssteuerkonto/ | `begriffe/wirkungssteuerkonto/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsstrategie-canvas/ | `begriffe/wirkungsstrategie-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungssystem-landkarte/ | `begriffe/wirkungssystem-landkarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsszenarien-und-zukunftsbilder/ | `begriffe/wirkungsszenarien-und-zukunftsbilder/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungstraeger/ | `begriffe/wirkungstraeger/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungstragung/ | `begriffe/wirkungstragung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungstransformations-bereitschaft/ | `begriffe/wirkungstransformations-bereitschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungstransformations-portfolio/ | `begriffe/wirkungstransformations-portfolio/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungstransformations-roadmap/ | `begriffe/wirkungstransformations-roadmap/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungstransparenzbericht/ | `begriffe/wirkungstransparenzbericht/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungstreppe/ | `begriffe/wirkungstreppe/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsumsatzsteuer/ | `begriffe/wirkungsumsatzsteuer/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsverantwortung/ | `begriffe/wirkungsverantwortung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsvermietung/ | `begriffe/wirkungsvermietung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsversprechen-canvas/ | `begriffe/wirkungsversprechen-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungswahrheit/ | `begriffe/wirkungswahrheit/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wirkungswashing/ | `begriffe/wirkungswashing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungswert/ | `begriffe/wirkungswert/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungswertschoepfung/ | `begriffe/wirkungswertschoepfung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungswertstrom/ | `begriffe/wirkungswertstrom/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungswertstrom-karte/ | `begriffe/wirkungswertstrom-karte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungswissenschaften/ | `begriffe/wirkungswissenschaften/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, evaluation, novelty_or_absence |
| https://wirkungsoekonomie.de/begriffe/wirkungszielbild/ | `begriffe/wirkungszielbild/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsziele-und-impact-okr/ | `begriffe/wirkungsziele-und-impact-okr/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungszurechnung/ | `begriffe/wirkungszurechnung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungszustandskarte/ | `begriffe/wirkungszustandskarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirtschaftliche-tragfaehigkeit/ | `begriffe/wirtschaftliche-tragfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirtschaftsliberalismus/ | `begriffe/wirtschaftsliberalismus/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wissenschaft-als-wirkungsinfrastruktur/ | `begriffe/wissenschaft-als-wirkungsinfrastruktur/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, alternativen |
| https://wirkungsoekonomie.de/begriffe/wissenschaftliche-politikberatung/ | `begriffe/wissenschaftliche-politikberatung/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, folgenabschaetzung, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/wissenschaftsfeindlichkeit/ | `begriffe/wissenschaftsfeindlichkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wissensfluss-kritisches-wissen-und-communities-canvas/ | `begriffe/wissensfluss-kritisches-wissen-und-communities-canvas/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wissensgesellschaft/ | `begriffe/wissensgesellschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wissensrat/ | `begriffe/wissensrat/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/witch-hunt/ | `begriffe/witch-hunt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wix-vi/ | `begriffe/wix-vi/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wkg/ | `begriffe/wkg/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wohlfahrtsoekonomie/ | `begriffe/wohlfahrtsoekonomie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wohlfahrtsoekonomik/ | `begriffe/wohlfahrtsoekonomik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wohlfahrtsstaat/ | `begriffe/wohlfahrtsstaat/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wohlstand/ | `begriffe/wohlstand/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wohlstand-als-systemzustand/ | `begriffe/wohlstand-als-systemzustand/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wohnwirkung/ | `begriffe/wohnwirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woek/ | `begriffe/woek/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woek-id/ | `begriffe/woek-id/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/nwi/ | `begriffe/nwi/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woek-ids/ | `begriffe/woek-ids/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woek-indikatorenarchitektur/ | `begriffe/woek-indikatorenarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsrad/ | `begriffe/wirkungsrad/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woemm-betriebssystem/ | `begriffe/woemm-betriebssystem/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woemm-managementfunktion/ | `begriffe/woemm-managementfunktion/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woems-auftragsklaerung/ | `begriffe/woems-auftragsklaerung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woems-methodenkarte/ | `begriffe/woems-methodenkarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woems-methodenkreislauf/ | `begriffe/woems-methodenkreislauf/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woems-methodenregister/ | `begriffe/woems-methodenregister/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woems-moderation/ | `begriffe/woems-moderation/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woems-realisierungs-und-betriebsmethoden/ | `begriffe/woems-realisierungs-und-betriebsmethoden/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woems-reifegrad-und-faehigkeitsassessment/ | `begriffe/woems-reifegrad-und-faehigkeitsassessment/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/woems-workshop-journey/ | `begriffe/woems-workshop-journey/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wr/ | `begriffe/wr/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wstg/ | `begriffe/wstg/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wu-wei/ | `begriffe/wu-wei/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wu-wei-wirksames-nicht-erzwingen/ | `begriffe/wu-wei-wirksames-nicht-erzwingen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wustg/ | `begriffe/wustg/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/xbrl/ | `begriffe/xbrl/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/xenophobie/ | `begriffe/xenophobie/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/youth-jugendbeteiligung/ | `begriffe/youth-jugendbeteiligung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zeit-verzoegerungs-und-generationenkarte/ | `begriffe/zeit-verzoegerungs-und-generationenkarte/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zeitfensterblindheit/ | `begriffe/zeitfensterblindheit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zeitwirkung/ | `begriffe/zeitwirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zementverwertung-rotorblaetter/ | `begriffe/zementverwertung-rotorblaetter/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen |
| https://wirkungsoekonomie.de/begriffe/zen/ | `begriffe/zen/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zentralverwaltungswirtschaft/ | `begriffe/zentralverwaltungswirtschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zero-sum-bias/ | `begriffe/zero-sum-bias/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zertifizierung/ | `begriffe/zertifizierung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zielarchitektur-und-uebergangszustaende/ | `begriffe/zielarchitektur-und-uebergangszustaende/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zielbezug-und-wirkung/ | `begriffe/zielbezug-und-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | dns |
| https://wirkungsoekonomie.de/begriffe/zielkonflikt/ | `begriffe/zielkonflikt/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zielkonflikte/ | `begriffe/zielkonflikte/index.html` | ADD_GLOSSARY_CROSSLINKS | alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/zielzustand/ | `begriffe/zielzustand/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zinslast/ | `begriffe/zinslast/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zinslast-ohne-gegenwert/ | `begriffe/zinslast-ohne-gegenwert/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zirkulaeres-geschaeftsmodell/ | `begriffe/zirkulaeres-geschaeftsmodell/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zirkularitaet/ | `begriffe/zirkularitaet/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zivilgesellschaft/ | `begriffe/zivilgesellschaft/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zivilgesellschaftsrepression/ | `begriffe/zivilgesellschaftsrepression/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zugangsgerechtigkeit/ | `begriffe/zugangsgerechtigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zugehoerigkeit/ | `begriffe/zugehoerigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zukunftsbild/ | `begriffe/zukunftsbild/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zukunftsdisziplin/ | `begriffe/zukunftsdisziplin/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zukunftsfaehigkeit/ | `begriffe/zukunftsfaehigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zukunftskosten/ | `begriffe/zukunftskosten/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zukunftsschulden/ | `begriffe/zukunftsschulden/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zurechnung-ohne-scheingenauigkeit/ | `begriffe/zurechnung-ohne-scheingenauigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zuschuss/ | `begriffe/zuschuss/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/zyklenfestigkeit/ | `begriffe/zyklenfestigkeit/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/ | `quellenarchiv/index.html` | ADD_SOURCE_LINKS | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-e-0001/ | `quellenarchiv/wok-e-0001/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-e-0002/ | `quellenarchiv/wok-e-0002/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-e-0003/ | `quellenarchiv/wok-e-0003/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-e-0004/ | `quellenarchiv/wok-e-0004/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-e-0005/ | `quellenarchiv/wok-e-0005/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-e-0006/ | `quellenarchiv/wok-e-0006/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-e-0007/ | `quellenarchiv/wok-e-0007/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-e-0008/ | `quellenarchiv/wok-e-0008/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-026e83ae84f6/ | `quellenarchiv/wok-g-026e83ae84f6/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-02a49572ebd6/ | `quellenarchiv/wok-g-02a49572ebd6/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-03e4284eee59/ | `quellenarchiv/wok-g-03e4284eee59/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-049374af1982/ | `quellenarchiv/wok-g-049374af1982/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-051c8932cfa5/ | `quellenarchiv/wok-g-051c8932cfa5/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-0544ef102fd3/ | `quellenarchiv/wok-g-0544ef102fd3/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-075062cf54cf/ | `quellenarchiv/wok-g-075062cf54cf/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-0886b0469d21/ | `quellenarchiv/wok-g-0886b0469d21/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-0a0fa821e794/ | `quellenarchiv/wok-g-0a0fa821e794/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-0ab304938a99/ | `quellenarchiv/wok-g-0ab304938a99/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-1145a0dc7305/ | `quellenarchiv/wok-g-1145a0dc7305/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-13c5894aecee/ | `quellenarchiv/wok-g-13c5894aecee/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-141ca0195f6e/ | `quellenarchiv/wok-g-141ca0195f6e/index.html` | ADD_SOURCE_LINKS | evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-1629e4313caa/ | `quellenarchiv/wok-g-1629e4313caa/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-175bd2f5046d/ | `quellenarchiv/wok-g-175bd2f5046d/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-189ebddd8bb0/ | `quellenarchiv/wok-g-189ebddd8bb0/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-1bd7a0d7733b/ | `quellenarchiv/wok-g-1bd7a0d7733b/index.html` | ADD_SOURCE_LINKS | evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-1ca95602d44c/ | `quellenarchiv/wok-g-1ca95602d44c/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-1d3e8037135f/ | `quellenarchiv/wok-g-1d3e8037135f/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-1e0128063893/ | `quellenarchiv/wok-g-1e0128063893/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-1f12bae8727c/ | `quellenarchiv/wok-g-1f12bae8727c/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-1f1c800a9abb/ | `quellenarchiv/wok-g-1f1c800a9abb/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-1f830447d62a/ | `quellenarchiv/wok-g-1f830447d62a/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-2086d6042d9e/ | `quellenarchiv/wok-g-2086d6042d9e/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-21ec89a9b9c0/ | `quellenarchiv/wok-g-21ec89a9b9c0/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-2258599ec6ff/ | `quellenarchiv/wok-g-2258599ec6ff/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-22f51fd0fe30/ | `quellenarchiv/wok-g-22f51fd0fe30/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-234a4fd31400/ | `quellenarchiv/wok-g-234a4fd31400/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-23d83fbb5b2b/ | `quellenarchiv/wok-g-23d83fbb5b2b/index.html` | ADD_SOURCE_LINKS | evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-247e4652f872/ | `quellenarchiv/wok-g-247e4652f872/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-2522675ecc39/ | `quellenarchiv/wok-g-2522675ecc39/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-2531b08385d9/ | `quellenarchiv/wok-g-2531b08385d9/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-2624e05439ab/ | `quellenarchiv/wok-g-2624e05439ab/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-26a9a47a0d5e/ | `quellenarchiv/wok-g-26a9a47a0d5e/index.html` | ADD_SOURCE_LINKS | evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-26bc531e0328/ | `quellenarchiv/wok-g-26bc531e0328/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-27d9a3466aa6/ | `quellenarchiv/wok-g-27d9a3466aa6/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-2819704f1478/ | `quellenarchiv/wok-g-2819704f1478/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-2853dd58190f/ | `quellenarchiv/wok-g-2853dd58190f/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-2904309e5431/ | `quellenarchiv/wok-g-2904309e5431/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-2907c862c38c/ | `quellenarchiv/wok-g-2907c862c38c/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-2c454a5225c7/ | `quellenarchiv/wok-g-2c454a5225c7/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-2e0e9070a926/ | `quellenarchiv/wok-g-2e0e9070a926/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-2e1669f619cd/ | `quellenarchiv/wok-g-2e1669f619cd/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-3058367e6f81/ | `quellenarchiv/wok-g-3058367e6f81/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-333439f9e599/ | `quellenarchiv/wok-g-333439f9e599/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-3458ef28a2ae/ | `quellenarchiv/wok-g-3458ef28a2ae/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-35ad338226fe/ | `quellenarchiv/wok-g-35ad338226fe/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-361ca96e7b6d/ | `quellenarchiv/wok-g-361ca96e7b6d/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-364889f5c512/ | `quellenarchiv/wok-g-364889f5c512/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-36b521545d79/ | `quellenarchiv/wok-g-36b521545d79/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-36db64726761/ | `quellenarchiv/wok-g-36db64726761/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-382439d7503c/ | `quellenarchiv/wok-g-382439d7503c/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-3887ca8ada60/ | `quellenarchiv/wok-g-3887ca8ada60/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-39cf66f616cc/ | `quellenarchiv/wok-g-39cf66f616cc/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-3a1733538450/ | `quellenarchiv/wok-g-3a1733538450/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-3aee66661e29/ | `quellenarchiv/wok-g-3aee66661e29/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-3b34cd84f295/ | `quellenarchiv/wok-g-3b34cd84f295/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-3bd9237fbc24/ | `quellenarchiv/wok-g-3bd9237fbc24/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-3d2b14285fe7/ | `quellenarchiv/wok-g-3d2b14285fe7/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-3d3b1ec0ae13/ | `quellenarchiv/wok-g-3d3b1ec0ae13/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-3dde245df3e2/ | `quellenarchiv/wok-g-3dde245df3e2/index.html` | ADD_SOURCE_LINKS | evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-3eb44d5214ab/ | `quellenarchiv/wok-g-3eb44d5214ab/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-3f257eb932ff/ | `quellenarchiv/wok-g-3f257eb932ff/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-3fc589495c5c/ | `quellenarchiv/wok-g-3fc589495c5c/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-4024e3277613/ | `quellenarchiv/wok-g-4024e3277613/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-4069fd954727/ | `quellenarchiv/wok-g-4069fd954727/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-40a9d42ab436/ | `quellenarchiv/wok-g-40a9d42ab436/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-4118041f814f/ | `quellenarchiv/wok-g-4118041f814f/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-4307e603e6e2/ | `quellenarchiv/wok-g-4307e603e6e2/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-43523d98b2b1/ | `quellenarchiv/wok-g-43523d98b2b1/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-4353ff78466d/ | `quellenarchiv/wok-g-4353ff78466d/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-439d3a4ac306/ | `quellenarchiv/wok-g-439d3a4ac306/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-44e1e000be8e/ | `quellenarchiv/wok-g-44e1e000be8e/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-44e6d7be72c3/ | `quellenarchiv/wok-g-44e6d7be72c3/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-454c59e9080f/ | `quellenarchiv/wok-g-454c59e9080f/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-4b5a2f410c4e/ | `quellenarchiv/wok-g-4b5a2f410c4e/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-4c6155b522f0/ | `quellenarchiv/wok-g-4c6155b522f0/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-4efdf522687e/ | `quellenarchiv/wok-g-4efdf522687e/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-54bbcad5ba91/ | `quellenarchiv/wok-g-54bbcad5ba91/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-57666aff0faa/ | `quellenarchiv/wok-g-57666aff0faa/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-5797c44fb69d/ | `quellenarchiv/wok-g-5797c44fb69d/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-58f617ae8ee4/ | `quellenarchiv/wok-g-58f617ae8ee4/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-59a5f127fca8/ | `quellenarchiv/wok-g-59a5f127fca8/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-5a91bfdcebb4/ | `quellenarchiv/wok-g-5a91bfdcebb4/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-5ae09458064a/ | `quellenarchiv/wok-g-5ae09458064a/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-5cdb1d463d15/ | `quellenarchiv/wok-g-5cdb1d463d15/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-5dad38014a73/ | `quellenarchiv/wok-g-5dad38014a73/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-5f3db7ef4c8a/ | `quellenarchiv/wok-g-5f3db7ef4c8a/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-5f9a4a116888/ | `quellenarchiv/wok-g-5f9a4a116888/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-606d14b40514/ | `quellenarchiv/wok-g-606d14b40514/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-619308e9bb71/ | `quellenarchiv/wok-g-619308e9bb71/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-61e066969eaa/ | `quellenarchiv/wok-g-61e066969eaa/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-640752bfc4ce/ | `quellenarchiv/wok-g-640752bfc4ce/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-641d0bbd96eb/ | `quellenarchiv/wok-g-641d0bbd96eb/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-657357a7ff08/ | `quellenarchiv/wok-g-657357a7ff08/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-659eef7580f7/ | `quellenarchiv/wok-g-659eef7580f7/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-66ca4d2324be/ | `quellenarchiv/wok-g-66ca4d2324be/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-67538bc81f92/ | `quellenarchiv/wok-g-67538bc81f92/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-6cd2f5b87810/ | `quellenarchiv/wok-g-6cd2f5b87810/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-6d116c3f805e/ | `quellenarchiv/wok-g-6d116c3f805e/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-6e118186568b/ | `quellenarchiv/wok-g-6e118186568b/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-6e227c92afb7/ | `quellenarchiv/wok-g-6e227c92afb7/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-7048e2c9eb8f/ | `quellenarchiv/wok-g-7048e2c9eb8f/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-71052ba46bdc/ | `quellenarchiv/wok-g-71052ba46bdc/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-713d480f4bb4/ | `quellenarchiv/wok-g-713d480f4bb4/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-7144c6926887/ | `quellenarchiv/wok-g-7144c6926887/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-716fa1e45532/ | `quellenarchiv/wok-g-716fa1e45532/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-72d37d5c96d7/ | `quellenarchiv/wok-g-72d37d5c96d7/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-75575fe99680/ | `quellenarchiv/wok-g-75575fe99680/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-7617a00cf1b3/ | `quellenarchiv/wok-g-7617a00cf1b3/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-76b71f16d4d4/ | `quellenarchiv/wok-g-76b71f16d4d4/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-7745e10a13a7/ | `quellenarchiv/wok-g-7745e10a13a7/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-78cc21e2c8f8/ | `quellenarchiv/wok-g-78cc21e2c8f8/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-791982da7a87/ | `quellenarchiv/wok-g-791982da7a87/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-79a626b42677/ | `quellenarchiv/wok-g-79a626b42677/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-79f5060fc8ac/ | `quellenarchiv/wok-g-79f5060fc8ac/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-7b0addb1508f/ | `quellenarchiv/wok-g-7b0addb1508f/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-7be4676ca8cc/ | `quellenarchiv/wok-g-7be4676ca8cc/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-7bf0bab67230/ | `quellenarchiv/wok-g-7bf0bab67230/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-7e60a5d430be/ | `quellenarchiv/wok-g-7e60a5d430be/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-7f14cc87cbda/ | `quellenarchiv/wok-g-7f14cc87cbda/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-812ae525d45f/ | `quellenarchiv/wok-g-812ae525d45f/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-81833f73c49f/ | `quellenarchiv/wok-g-81833f73c49f/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-818bd6024580/ | `quellenarchiv/wok-g-818bd6024580/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-81aa4ab8c674/ | `quellenarchiv/wok-g-81aa4ab8c674/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-81d56234c08e/ | `quellenarchiv/wok-g-81d56234c08e/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-82b11ab68ffe/ | `quellenarchiv/wok-g-82b11ab68ffe/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-83ab5daaeb99/ | `quellenarchiv/wok-g-83ab5daaeb99/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-84c9d39f9a82/ | `quellenarchiv/wok-g-84c9d39f9a82/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-85d1fbad7df1/ | `quellenarchiv/wok-g-85d1fbad7df1/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-887e7a9e914a/ | `quellenarchiv/wok-g-887e7a9e914a/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-890b498f39c7/ | `quellenarchiv/wok-g-890b498f39c7/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-89b3c3f83428/ | `quellenarchiv/wok-g-89b3c3f83428/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-8a07a278036d/ | `quellenarchiv/wok-g-8a07a278036d/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-8ac839c96530/ | `quellenarchiv/wok-g-8ac839c96530/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-8b751c68ed14/ | `quellenarchiv/wok-g-8b751c68ed14/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-8bdec7032e87/ | `quellenarchiv/wok-g-8bdec7032e87/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-8bf7792a96fb/ | `quellenarchiv/wok-g-8bf7792a96fb/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-8bfd061603e2/ | `quellenarchiv/wok-g-8bfd061603e2/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-8d11e4e31e8b/ | `quellenarchiv/wok-g-8d11e4e31e8b/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-8dae9bbba36e/ | `quellenarchiv/wok-g-8dae9bbba36e/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-8dcc7555befe/ | `quellenarchiv/wok-g-8dcc7555befe/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-8f581bb5b86f/ | `quellenarchiv/wok-g-8f581bb5b86f/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-923b1da68d91/ | `quellenarchiv/wok-g-923b1da68d91/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-93f8f8775f74/ | `quellenarchiv/wok-g-93f8f8775f74/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-9427cdb37b08/ | `quellenarchiv/wok-g-9427cdb37b08/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-96c0eb2be86e/ | `quellenarchiv/wok-g-96c0eb2be86e/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-9a833629c34b/ | `quellenarchiv/wok-g-9a833629c34b/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-9ae4c6ab1ae7/ | `quellenarchiv/wok-g-9ae4c6ab1ae7/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-9e760d664adc/ | `quellenarchiv/wok-g-9e760d664adc/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-9ec91d729c50/ | `quellenarchiv/wok-g-9ec91d729c50/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-a00085a218b8/ | `quellenarchiv/wok-g-a00085a218b8/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-a0a68525ca4d/ | `quellenarchiv/wok-g-a0a68525ca4d/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-a15a5b4ce30c/ | `quellenarchiv/wok-g-a15a5b4ce30c/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-a16efceb0269/ | `quellenarchiv/wok-g-a16efceb0269/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-a3a32e9befee/ | `quellenarchiv/wok-g-a3a32e9befee/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-a6022df177a7/ | `quellenarchiv/wok-g-a6022df177a7/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-a6824fbf616e/ | `quellenarchiv/wok-g-a6824fbf616e/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-a68f63ded0ce/ | `quellenarchiv/wok-g-a68f63ded0ce/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-b0395ff10ce2/ | `quellenarchiv/wok-g-b0395ff10ce2/index.html` | ADD_SOURCE_LINKS | evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-b2df54f90552/ | `quellenarchiv/wok-g-b2df54f90552/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-b675e208c6af/ | `quellenarchiv/wok-g-b675e208c6af/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-b78818a9ca21/ | `quellenarchiv/wok-g-b78818a9ca21/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-b9137fe575cb/ | `quellenarchiv/wok-g-b9137fe575cb/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-b967325f627b/ | `quellenarchiv/wok-g-b967325f627b/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-b9b5fa7066c0/ | `quellenarchiv/wok-g-b9b5fa7066c0/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-ba850cda3c33/ | `quellenarchiv/wok-g-ba850cda3c33/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-bc5a1a6cbc40/ | `quellenarchiv/wok-g-bc5a1a6cbc40/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-bc5e5938a6c3/ | `quellenarchiv/wok-g-bc5e5938a6c3/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-c00c72cf81c3/ | `quellenarchiv/wok-g-c00c72cf81c3/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-c0c3ccf7d336/ | `quellenarchiv/wok-g-c0c3ccf7d336/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-c393755f28a3/ | `quellenarchiv/wok-g-c393755f28a3/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-c6de6c5d5169/ | `quellenarchiv/wok-g-c6de6c5d5169/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-c7af4660fa2b/ | `quellenarchiv/wok-g-c7af4660fa2b/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-c7bce5e240d5/ | `quellenarchiv/wok-g-c7bce5e240d5/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-c7d8c7c5af2f/ | `quellenarchiv/wok-g-c7d8c7c5af2f/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-ca3788346d5d/ | `quellenarchiv/wok-g-ca3788346d5d/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-cd49121103b3/ | `quellenarchiv/wok-g-cd49121103b3/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-ce24d565a656/ | `quellenarchiv/wok-g-ce24d565a656/index.html` | ADD_SOURCE_LINKS | evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-cf6a97804020/ | `quellenarchiv/wok-g-cf6a97804020/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-d32cc24c3313/ | `quellenarchiv/wok-g-d32cc24c3313/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-d42bcc113c45/ | `quellenarchiv/wok-g-d42bcc113c45/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-d645d849ca86/ | `quellenarchiv/wok-g-d645d849ca86/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-dcda33fcccf0/ | `quellenarchiv/wok-g-dcda33fcccf0/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-dd7fdd3fea41/ | `quellenarchiv/wok-g-dd7fdd3fea41/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-ded9edf9a96f/ | `quellenarchiv/wok-g-ded9edf9a96f/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-dfe583cb9e1d/ | `quellenarchiv/wok-g-dfe583cb9e1d/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-e0fb1cbb43a2/ | `quellenarchiv/wok-g-e0fb1cbb43a2/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-e428e8e4efd7/ | `quellenarchiv/wok-g-e428e8e4efd7/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-e4e9972286bf/ | `quellenarchiv/wok-g-e4e9972286bf/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-e6b92f5c167c/ | `quellenarchiv/wok-g-e6b92f5c167c/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-e6ede1ac4941/ | `quellenarchiv/wok-g-e6ede1ac4941/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-e8cfb8158795/ | `quellenarchiv/wok-g-e8cfb8158795/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-efae345eebe0/ | `quellenarchiv/wok-g-efae345eebe0/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-efcb5ffa7741/ | `quellenarchiv/wok-g-efcb5ffa7741/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-f01b91a13ff9/ | `quellenarchiv/wok-g-f01b91a13ff9/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-f0c9937cf43c/ | `quellenarchiv/wok-g-f0c9937cf43c/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-f25439efcf81/ | `quellenarchiv/wok-g-f25439efcf81/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-f28d45801a4c/ | `quellenarchiv/wok-g-f28d45801a4c/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-f29e30f1df9a/ | `quellenarchiv/wok-g-f29e30f1df9a/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-f3f9c13582c1/ | `quellenarchiv/wok-g-f3f9c13582c1/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-f4a0ebf7cc0b/ | `quellenarchiv/wok-g-f4a0ebf7cc0b/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-f5e9e97927e0/ | `quellenarchiv/wok-g-f5e9e97927e0/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-f6330ff24b7b/ | `quellenarchiv/wok-g-f6330ff24b7b/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-f729b706dc45/ | `quellenarchiv/wok-g-f729b706dc45/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-f7c038c9df36/ | `quellenarchiv/wok-g-f7c038c9df36/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-f7ce04f35f47/ | `quellenarchiv/wok-g-f7ce04f35f47/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-f7cf6184321a/ | `quellenarchiv/wok-g-f7cf6184321a/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-fabd35fe4d15/ | `quellenarchiv/wok-g-fabd35fe4d15/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-fca24f17b771/ | `quellenarchiv/wok-g-fca24f17b771/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-ff0addb7bbc2/ | `quellenarchiv/wok-g-ff0addb7bbc2/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0001/ | `quellenarchiv/wok-q-0001/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0002/ | `quellenarchiv/wok-q-0002/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0003/ | `quellenarchiv/wok-q-0003/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0004/ | `quellenarchiv/wok-q-0004/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0005/ | `quellenarchiv/wok-q-0005/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0006/ | `quellenarchiv/wok-q-0006/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0007/ | `quellenarchiv/wok-q-0007/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0008/ | `quellenarchiv/wok-q-0008/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0009/ | `quellenarchiv/wok-q-0009/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0010/ | `quellenarchiv/wok-q-0010/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0011/ | `quellenarchiv/wok-q-0011/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0012/ | `quellenarchiv/wok-q-0012/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0013/ | `quellenarchiv/wok-q-0013/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0014/ | `quellenarchiv/wok-q-0014/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0015/ | `quellenarchiv/wok-q-0015/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0016/ | `quellenarchiv/wok-q-0016/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0017/ | `quellenarchiv/wok-q-0017/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0018/ | `quellenarchiv/wok-q-0018/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0019/ | `quellenarchiv/wok-q-0019/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0020/ | `quellenarchiv/wok-q-0020/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0021/ | `quellenarchiv/wok-q-0021/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0022/ | `quellenarchiv/wok-q-0022/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0023/ | `quellenarchiv/wok-q-0023/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0024/ | `quellenarchiv/wok-q-0024/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0025/ | `quellenarchiv/wok-q-0025/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0026/ | `quellenarchiv/wok-q-0026/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0027/ | `quellenarchiv/wok-q-0027/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0028/ | `quellenarchiv/wok-q-0028/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0029/ | `quellenarchiv/wok-q-0029/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0030/ | `quellenarchiv/wok-q-0030/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0031/ | `quellenarchiv/wok-q-0031/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0032/ | `quellenarchiv/wok-q-0032/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0033/ | `quellenarchiv/wok-q-0033/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0034/ | `quellenarchiv/wok-q-0034/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0035/ | `quellenarchiv/wok-q-0035/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0036/ | `quellenarchiv/wok-q-0036/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0037/ | `quellenarchiv/wok-q-0037/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0038/ | `quellenarchiv/wok-q-0038/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0039/ | `quellenarchiv/wok-q-0039/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0040/ | `quellenarchiv/wok-q-0040/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0041/ | `quellenarchiv/wok-q-0041/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0042/ | `quellenarchiv/wok-q-0042/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0043/ | `quellenarchiv/wok-q-0043/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0044/ | `quellenarchiv/wok-q-0044/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0045/ | `quellenarchiv/wok-q-0045/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0046/ | `quellenarchiv/wok-q-0046/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0047/ | `quellenarchiv/wok-q-0047/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0048/ | `quellenarchiv/wok-q-0048/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0049/ | `quellenarchiv/wok-q-0049/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0050/ | `quellenarchiv/wok-q-0050/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0051/ | `quellenarchiv/wok-q-0051/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0052/ | `quellenarchiv/wok-q-0052/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0053/ | `quellenarchiv/wok-q-0053/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0054/ | `quellenarchiv/wok-q-0054/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0055/ | `quellenarchiv/wok-q-0055/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0056/ | `quellenarchiv/wok-q-0056/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0057/ | `quellenarchiv/wok-q-0057/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0058/ | `quellenarchiv/wok-q-0058/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0059/ | `quellenarchiv/wok-q-0059/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0060/ | `quellenarchiv/wok-q-0060/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0061/ | `quellenarchiv/wok-q-0061/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0062/ | `quellenarchiv/wok-q-0062/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0063/ | `quellenarchiv/wok-q-0063/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0064/ | `quellenarchiv/wok-q-0064/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0065/ | `quellenarchiv/wok-q-0065/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0066/ | `quellenarchiv/wok-q-0066/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0067/ | `quellenarchiv/wok-q-0067/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0068/ | `quellenarchiv/wok-q-0068/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0069/ | `quellenarchiv/wok-q-0069/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0070/ | `quellenarchiv/wok-q-0070/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0071/ | `quellenarchiv/wok-q-0071/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0072/ | `quellenarchiv/wok-q-0072/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0073/ | `quellenarchiv/wok-q-0073/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0074/ | `quellenarchiv/wok-q-0074/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0075/ | `quellenarchiv/wok-q-0075/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0076/ | `quellenarchiv/wok-q-0076/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0077/ | `quellenarchiv/wok-q-0077/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0078/ | `quellenarchiv/wok-q-0078/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0079/ | `quellenarchiv/wok-q-0079/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0080/ | `quellenarchiv/wok-q-0080/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0081/ | `quellenarchiv/wok-q-0081/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0082/ | `quellenarchiv/wok-q-0082/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0083/ | `quellenarchiv/wok-q-0083/index.html` | ADD_SOURCE_LINKS | evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0084/ | `quellenarchiv/wok-q-0084/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0085/ | `quellenarchiv/wok-q-0085/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0086/ | `quellenarchiv/wok-q-0086/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0087/ | `quellenarchiv/wok-q-0087/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0088/ | `quellenarchiv/wok-q-0088/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0089/ | `quellenarchiv/wok-q-0089/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0090/ | `quellenarchiv/wok-q-0090/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0091/ | `quellenarchiv/wok-q-0091/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0092/ | `quellenarchiv/wok-q-0092/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0093/ | `quellenarchiv/wok-q-0093/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0094/ | `quellenarchiv/wok-q-0094/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0095/ | `quellenarchiv/wok-q-0095/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0096/ | `quellenarchiv/wok-q-0096/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0097/ | `quellenarchiv/wok-q-0097/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0098/ | `quellenarchiv/wok-q-0098/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0099/ | `quellenarchiv/wok-q-0099/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0100/ | `quellenarchiv/wok-q-0100/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0101/ | `quellenarchiv/wok-q-0101/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0102/ | `quellenarchiv/wok-q-0102/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0103/ | `quellenarchiv/wok-q-0103/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0104/ | `quellenarchiv/wok-q-0104/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0105/ | `quellenarchiv/wok-q-0105/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0106/ | `quellenarchiv/wok-q-0106/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0107/ | `quellenarchiv/wok-q-0107/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0108/ | `quellenarchiv/wok-q-0108/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0109/ | `quellenarchiv/wok-q-0109/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0110/ | `quellenarchiv/wok-q-0110/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0111/ | `quellenarchiv/wok-q-0111/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0112/ | `quellenarchiv/wok-q-0112/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0113/ | `quellenarchiv/wok-q-0113/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0114/ | `quellenarchiv/wok-q-0114/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0115/ | `quellenarchiv/wok-q-0115/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0116/ | `quellenarchiv/wok-q-0116/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0117/ | `quellenarchiv/wok-q-0117/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0118/ | `quellenarchiv/wok-q-0118/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0119/ | `quellenarchiv/wok-q-0119/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0120/ | `quellenarchiv/wok-q-0120/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0121/ | `quellenarchiv/wok-q-0121/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0122/ | `quellenarchiv/wok-q-0122/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0123/ | `quellenarchiv/wok-q-0123/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0124/ | `quellenarchiv/wok-q-0124/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0125/ | `quellenarchiv/wok-q-0125/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0126/ | `quellenarchiv/wok-q-0126/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0127/ | `quellenarchiv/wok-q-0127/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0128/ | `quellenarchiv/wok-q-0128/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0129/ | `quellenarchiv/wok-q-0129/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0130/ | `quellenarchiv/wok-q-0130/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0131/ | `quellenarchiv/wok-q-0131/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0132/ | `quellenarchiv/wok-q-0132/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0133/ | `quellenarchiv/wok-q-0133/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0134/ | `quellenarchiv/wok-q-0134/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0135/ | `quellenarchiv/wok-q-0135/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0136/ | `quellenarchiv/wok-q-0136/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0137/ | `quellenarchiv/wok-q-0137/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0138/ | `quellenarchiv/wok-q-0138/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0139/ | `quellenarchiv/wok-q-0139/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0140/ | `quellenarchiv/wok-q-0140/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0141/ | `quellenarchiv/wok-q-0141/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0142/ | `quellenarchiv/wok-q-0142/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0143/ | `quellenarchiv/wok-q-0143/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0144/ | `quellenarchiv/wok-q-0144/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0145/ | `quellenarchiv/wok-q-0145/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0146/ | `quellenarchiv/wok-q-0146/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0147/ | `quellenarchiv/wok-q-0147/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0148/ | `quellenarchiv/wok-q-0148/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0149/ | `quellenarchiv/wok-q-0149/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0150/ | `quellenarchiv/wok-q-0150/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0151/ | `quellenarchiv/wok-q-0151/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0152/ | `quellenarchiv/wok-q-0152/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0153/ | `quellenarchiv/wok-q-0153/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0154/ | `quellenarchiv/wok-q-0154/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0155/ | `quellenarchiv/wok-q-0155/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0156/ | `quellenarchiv/wok-q-0156/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0157/ | `quellenarchiv/wok-q-0157/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0158/ | `quellenarchiv/wok-q-0158/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0159/ | `quellenarchiv/wok-q-0159/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0160/ | `quellenarchiv/wok-q-0160/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0161/ | `quellenarchiv/wok-q-0161/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0162/ | `quellenarchiv/wok-q-0162/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0163/ | `quellenarchiv/wok-q-0163/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0164/ | `quellenarchiv/wok-q-0164/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0165/ | `quellenarchiv/wok-q-0165/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0166/ | `quellenarchiv/wok-q-0166/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0167/ | `quellenarchiv/wok-q-0167/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0168/ | `quellenarchiv/wok-q-0168/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0169/ | `quellenarchiv/wok-q-0169/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0170/ | `quellenarchiv/wok-q-0170/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0171/ | `quellenarchiv/wok-q-0171/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0172/ | `quellenarchiv/wok-q-0172/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0173/ | `quellenarchiv/wok-q-0173/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0174/ | `quellenarchiv/wok-q-0174/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0175/ | `quellenarchiv/wok-q-0175/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0176/ | `quellenarchiv/wok-q-0176/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0177/ | `quellenarchiv/wok-q-0177/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0178/ | `quellenarchiv/wok-q-0178/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0179/ | `quellenarchiv/wok-q-0179/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0180/ | `quellenarchiv/wok-q-0180/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0181/ | `quellenarchiv/wok-q-0181/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0182/ | `quellenarchiv/wok-q-0182/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0183/ | `quellenarchiv/wok-q-0183/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0184/ | `quellenarchiv/wok-q-0184/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0185/ | `quellenarchiv/wok-q-0185/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0186/ | `quellenarchiv/wok-q-0186/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0187/ | `quellenarchiv/wok-q-0187/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0188/ | `quellenarchiv/wok-q-0188/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0189/ | `quellenarchiv/wok-q-0189/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0190/ | `quellenarchiv/wok-q-0190/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0191/ | `quellenarchiv/wok-q-0191/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0192/ | `quellenarchiv/wok-q-0192/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0193/ | `quellenarchiv/wok-q-0193/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0194/ | `quellenarchiv/wok-q-0194/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0195/ | `quellenarchiv/wok-q-0195/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0196/ | `quellenarchiv/wok-q-0196/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0197/ | `quellenarchiv/wok-q-0197/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0198/ | `quellenarchiv/wok-q-0198/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0199/ | `quellenarchiv/wok-q-0199/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0200/ | `quellenarchiv/wok-q-0200/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0201/ | `quellenarchiv/wok-q-0201/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0202/ | `quellenarchiv/wok-q-0202/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0203/ | `quellenarchiv/wok-q-0203/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0204/ | `quellenarchiv/wok-q-0204/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0205/ | `quellenarchiv/wok-q-0205/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0206/ | `quellenarchiv/wok-q-0206/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0207/ | `quellenarchiv/wok-q-0207/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0208/ | `quellenarchiv/wok-q-0208/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0209/ | `quellenarchiv/wok-q-0209/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0210/ | `quellenarchiv/wok-q-0210/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0211/ | `quellenarchiv/wok-q-0211/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0212/ | `quellenarchiv/wok-q-0212/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0213/ | `quellenarchiv/wok-q-0213/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0214/ | `quellenarchiv/wok-q-0214/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0215/ | `quellenarchiv/wok-q-0215/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0216/ | `quellenarchiv/wok-q-0216/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0217/ | `quellenarchiv/wok-q-0217/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0218/ | `quellenarchiv/wok-q-0218/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0219/ | `quellenarchiv/wok-q-0219/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0220/ | `quellenarchiv/wok-q-0220/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0221/ | `quellenarchiv/wok-q-0221/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0222/ | `quellenarchiv/wok-q-0222/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0223/ | `quellenarchiv/wok-q-0223/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0224/ | `quellenarchiv/wok-q-0224/index.html` | ADD_SOURCE_LINKS | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0225/ | `quellenarchiv/wok-q-0225/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0226/ | `quellenarchiv/wok-q-0226/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0227/ | `quellenarchiv/wok-q-0227/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0228/ | `quellenarchiv/wok-q-0228/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0229/ | `quellenarchiv/wok-q-0229/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0230/ | `quellenarchiv/wok-q-0230/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0231/ | `quellenarchiv/wok-q-0231/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0232/ | `quellenarchiv/wok-q-0232/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0233/ | `quellenarchiv/wok-q-0233/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0234/ | `quellenarchiv/wok-q-0234/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0235/ | `quellenarchiv/wok-q-0235/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0236/ | `quellenarchiv/wok-q-0236/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0237/ | `quellenarchiv/wok-q-0237/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0238/ | `quellenarchiv/wok-q-0238/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0239/ | `quellenarchiv/wok-q-0239/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0240/ | `quellenarchiv/wok-q-0240/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0241/ | `quellenarchiv/wok-q-0241/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0242/ | `quellenarchiv/wok-q-0242/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0243/ | `quellenarchiv/wok-q-0243/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0244/ | `quellenarchiv/wok-q-0244/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0245/ | `quellenarchiv/wok-q-0245/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0246/ | `quellenarchiv/wok-q-0246/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0247/ | `quellenarchiv/wok-q-0247/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0248/ | `quellenarchiv/wok-q-0248/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0249/ | `quellenarchiv/wok-q-0249/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0250/ | `quellenarchiv/wok-q-0250/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0251/ | `quellenarchiv/wok-q-0251/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0252/ | `quellenarchiv/wok-q-0252/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0253/ | `quellenarchiv/wok-q-0253/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0254/ | `quellenarchiv/wok-q-0254/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0255/ | `quellenarchiv/wok-q-0255/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0256/ | `quellenarchiv/wok-q-0256/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0257/ | `quellenarchiv/wok-q-0257/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0258/ | `quellenarchiv/wok-q-0258/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0259/ | `quellenarchiv/wok-q-0259/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0260/ | `quellenarchiv/wok-q-0260/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0261/ | `quellenarchiv/wok-q-0261/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0262/ | `quellenarchiv/wok-q-0262/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0263/ | `quellenarchiv/wok-q-0263/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0264/ | `quellenarchiv/wok-q-0264/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0265/ | `quellenarchiv/wok-q-0265/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0266/ | `quellenarchiv/wok-q-0266/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0267/ | `quellenarchiv/wok-q-0267/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0268/ | `quellenarchiv/wok-q-0268/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0269/ | `quellenarchiv/wok-q-0269/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0270/ | `quellenarchiv/wok-q-0270/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0271/ | `quellenarchiv/wok-q-0271/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0272/ | `quellenarchiv/wok-q-0272/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0273/ | `quellenarchiv/wok-q-0273/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0274/ | `quellenarchiv/wok-q-0274/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0275/ | `quellenarchiv/wok-q-0275/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0276/ | `quellenarchiv/wok-q-0276/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0277/ | `quellenarchiv/wok-q-0277/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0278/ | `quellenarchiv/wok-q-0278/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0279/ | `quellenarchiv/wok-q-0279/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0280/ | `quellenarchiv/wok-q-0280/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0281/ | `quellenarchiv/wok-q-0281/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0282/ | `quellenarchiv/wok-q-0282/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0283/ | `quellenarchiv/wok-q-0283/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0284/ | `quellenarchiv/wok-q-0284/index.html` | ADD_SOURCE_LINKS | dns |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0285/ | `quellenarchiv/wok-q-0285/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0286/ | `quellenarchiv/wok-q-0286/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0287/ | `quellenarchiv/wok-q-0287/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0288/ | `quellenarchiv/wok-q-0288/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0289/ | `quellenarchiv/wok-q-0289/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0290/ | `quellenarchiv/wok-q-0290/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0291/ | `quellenarchiv/wok-q-0291/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0292/ | `quellenarchiv/wok-q-0292/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0293/ | `quellenarchiv/wok-q-0293/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0294/ | `quellenarchiv/wok-q-0294/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0295/ | `quellenarchiv/wok-q-0295/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0296/ | `quellenarchiv/wok-q-0296/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0297/ | `quellenarchiv/wok-q-0297/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0298/ | `quellenarchiv/wok-q-0298/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0299/ | `quellenarchiv/wok-q-0299/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0300/ | `quellenarchiv/wok-q-0300/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0301/ | `quellenarchiv/wok-q-0301/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0302/ | `quellenarchiv/wok-q-0302/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0303/ | `quellenarchiv/wok-q-0303/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0304/ | `quellenarchiv/wok-q-0304/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0305/ | `quellenarchiv/wok-q-0305/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0306/ | `quellenarchiv/wok-q-0306/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0307/ | `quellenarchiv/wok-q-0307/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0308/ | `quellenarchiv/wok-q-0308/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0309/ | `quellenarchiv/wok-q-0309/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0310/ | `quellenarchiv/wok-q-0310/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0311/ | `quellenarchiv/wok-q-0311/index.html` | ADD_SOURCE_LINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0312/ | `quellenarchiv/wok-q-0312/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0313/ | `quellenarchiv/wok-q-0313/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0314/ | `quellenarchiv/wok-q-0314/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0315/ | `quellenarchiv/wok-q-0315/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0316/ | `quellenarchiv/wok-q-0316/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0317/ | `quellenarchiv/wok-q-0317/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0318/ | `quellenarchiv/wok-q-0318/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0319/ | `quellenarchiv/wok-q-0319/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0320/ | `quellenarchiv/wok-q-0320/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0321/ | `quellenarchiv/wok-q-0321/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0322/ | `quellenarchiv/wok-q-0322/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0323/ | `quellenarchiv/wok-q-0323/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0324/ | `quellenarchiv/wok-q-0324/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0325/ | `quellenarchiv/wok-q-0325/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0326/ | `quellenarchiv/wok-q-0326/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0327/ | `quellenarchiv/wok-q-0327/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0328/ | `quellenarchiv/wok-q-0328/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0329/ | `quellenarchiv/wok-q-0329/index.html` | ADD_SOURCE_LINKS | evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0330/ | `quellenarchiv/wok-q-0330/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0331/ | `quellenarchiv/wok-q-0331/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0332/ | `quellenarchiv/wok-q-0332/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0333/ | `quellenarchiv/wok-q-0333/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0334/ | `quellenarchiv/wok-q-0334/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0335/ | `quellenarchiv/wok-q-0335/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0336/ | `quellenarchiv/wok-q-0336/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0337/ | `quellenarchiv/wok-q-0337/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0338/ | `quellenarchiv/wok-q-0338/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0339/ | `quellenarchiv/wok-q-0339/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0340/ | `quellenarchiv/wok-q-0340/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0341/ | `quellenarchiv/wok-q-0341/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0342/ | `quellenarchiv/wok-q-0342/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0343/ | `quellenarchiv/wok-q-0343/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0344/ | `quellenarchiv/wok-q-0344/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0345/ | `quellenarchiv/wok-q-0345/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0346/ | `quellenarchiv/wok-q-0346/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0347/ | `quellenarchiv/wok-q-0347/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0348/ | `quellenarchiv/wok-q-0348/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0349/ | `quellenarchiv/wok-q-0349/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0350/ | `quellenarchiv/wok-q-0350/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0351/ | `quellenarchiv/wok-q-0351/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0352/ | `quellenarchiv/wok-q-0352/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0353/ | `quellenarchiv/wok-q-0353/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0354/ | `quellenarchiv/wok-q-0354/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0355/ | `quellenarchiv/wok-q-0355/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0356/ | `quellenarchiv/wok-q-0356/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0357/ | `quellenarchiv/wok-q-0357/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0358/ | `quellenarchiv/wok-q-0358/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0359/ | `quellenarchiv/wok-q-0359/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0360/ | `quellenarchiv/wok-q-0360/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0361/ | `quellenarchiv/wok-q-0361/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0362/ | `quellenarchiv/wok-q-0362/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0363/ | `quellenarchiv/wok-q-0363/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0364/ | `quellenarchiv/wok-q-0364/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0365/ | `quellenarchiv/wok-q-0365/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0366/ | `quellenarchiv/wok-q-0366/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0367/ | `quellenarchiv/wok-q-0367/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0368/ | `quellenarchiv/wok-q-0368/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0369/ | `quellenarchiv/wok-q-0369/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0370/ | `quellenarchiv/wok-q-0370/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0371/ | `quellenarchiv/wok-q-0371/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0372/ | `quellenarchiv/wok-q-0372/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0373/ | `quellenarchiv/wok-q-0373/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0374/ | `quellenarchiv/wok-q-0374/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0375/ | `quellenarchiv/wok-q-0375/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0376/ | `quellenarchiv/wok-q-0376/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0377/ | `quellenarchiv/wok-q-0377/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0378/ | `quellenarchiv/wok-q-0378/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0379/ | `quellenarchiv/wok-q-0379/index.html` | ADD_SOURCE_LINKS | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0380/ | `quellenarchiv/wok-q-0380/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0381/ | `quellenarchiv/wok-q-0381/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0382/ | `quellenarchiv/wok-q-0382/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0383/ | `quellenarchiv/wok-q-0383/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0384/ | `quellenarchiv/wok-q-0384/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0385/ | `quellenarchiv/wok-q-0385/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0386/ | `quellenarchiv/wok-q-0386/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0387/ | `quellenarchiv/wok-q-0387/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0388/ | `quellenarchiv/wok-q-0388/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0389/ | `quellenarchiv/wok-q-0389/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0390/ | `quellenarchiv/wok-q-0390/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0391/ | `quellenarchiv/wok-q-0391/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0392/ | `quellenarchiv/wok-q-0392/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0393/ | `quellenarchiv/wok-q-0393/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0394/ | `quellenarchiv/wok-q-0394/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0395/ | `quellenarchiv/wok-q-0395/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0396/ | `quellenarchiv/wok-q-0396/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0397/ | `quellenarchiv/wok-q-0397/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0398/ | `quellenarchiv/wok-q-0398/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0399/ | `quellenarchiv/wok-q-0399/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0400/ | `quellenarchiv/wok-q-0400/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0401/ | `quellenarchiv/wok-q-0401/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0402/ | `quellenarchiv/wok-q-0402/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0403/ | `quellenarchiv/wok-q-0403/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0404/ | `quellenarchiv/wok-q-0404/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0405/ | `quellenarchiv/wok-q-0405/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0406/ | `quellenarchiv/wok-q-0406/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0407/ | `quellenarchiv/wok-q-0407/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0408/ | `quellenarchiv/wok-q-0408/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0409/ | `quellenarchiv/wok-q-0409/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0410/ | `quellenarchiv/wok-q-0410/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0411/ | `quellenarchiv/wok-q-0411/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0412/ | `quellenarchiv/wok-q-0412/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0413/ | `quellenarchiv/wok-q-0413/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0414/ | `quellenarchiv/wok-q-0414/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0415/ | `quellenarchiv/wok-q-0415/index.html` | ADD_SOURCE_LINKS | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0416/ | `quellenarchiv/wok-q-0416/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0417/ | `quellenarchiv/wok-q-0417/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0418/ | `quellenarchiv/wok-q-0418/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0419/ | `quellenarchiv/wok-q-0419/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0420/ | `quellenarchiv/wok-q-0420/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0421/ | `quellenarchiv/wok-q-0421/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0422/ | `quellenarchiv/wok-q-0422/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0423/ | `quellenarchiv/wok-q-0423/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0424/ | `quellenarchiv/wok-q-0424/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0425/ | `quellenarchiv/wok-q-0425/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0426/ | `quellenarchiv/wok-q-0426/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0427/ | `quellenarchiv/wok-q-0427/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0428/ | `quellenarchiv/wok-q-0428/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0429/ | `quellenarchiv/wok-q-0429/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0430/ | `quellenarchiv/wok-q-0430/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0431/ | `quellenarchiv/wok-q-0431/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0432/ | `quellenarchiv/wok-q-0432/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0433/ | `quellenarchiv/wok-q-0433/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0434/ | `quellenarchiv/wok-q-0434/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0435/ | `quellenarchiv/wok-q-0435/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0436/ | `quellenarchiv/wok-q-0436/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0437/ | `quellenarchiv/wok-q-0437/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0438/ | `quellenarchiv/wok-q-0438/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0439/ | `quellenarchiv/wok-q-0439/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0440/ | `quellenarchiv/wok-q-0440/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0441/ | `quellenarchiv/wok-q-0441/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0442/ | `quellenarchiv/wok-q-0442/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0443/ | `quellenarchiv/wok-q-0443/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0444/ | `quellenarchiv/wok-q-0444/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0445/ | `quellenarchiv/wok-q-0445/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0446/ | `quellenarchiv/wok-q-0446/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0447/ | `quellenarchiv/wok-q-0447/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0448/ | `quellenarchiv/wok-q-0448/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0449/ | `quellenarchiv/wok-q-0449/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0450/ | `quellenarchiv/wok-q-0450/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0451/ | `quellenarchiv/wok-q-0451/index.html` | ADD_SOURCE_LINKS | evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0452/ | `quellenarchiv/wok-q-0452/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0453/ | `quellenarchiv/wok-q-0453/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0454/ | `quellenarchiv/wok-q-0454/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0455/ | `quellenarchiv/wok-q-0455/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0456/ | `quellenarchiv/wok-q-0456/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0457/ | `quellenarchiv/wok-q-0457/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0458/ | `quellenarchiv/wok-q-0458/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0459/ | `quellenarchiv/wok-q-0459/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0460/ | `quellenarchiv/wok-q-0460/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0461/ | `quellenarchiv/wok-q-0461/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0462/ | `quellenarchiv/wok-q-0462/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0463/ | `quellenarchiv/wok-q-0463/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0464/ | `quellenarchiv/wok-q-0464/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0465/ | `quellenarchiv/wok-q-0465/index.html` | ADD_SOURCE_LINKS | novelty_or_absence |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0466/ | `quellenarchiv/wok-q-0466/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0467/ | `quellenarchiv/wok-q-0467/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0468/ | `quellenarchiv/wok-q-0468/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0469/ | `quellenarchiv/wok-q-0469/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0470/ | `quellenarchiv/wok-q-0470/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0471/ | `quellenarchiv/wok-q-0471/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0472/ | `quellenarchiv/wok-q-0472/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0473/ | `quellenarchiv/wok-q-0473/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0474/ | `quellenarchiv/wok-q-0474/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0475/ | `quellenarchiv/wok-q-0475/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0476/ | `quellenarchiv/wok-q-0476/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0477/ | `quellenarchiv/wok-q-0477/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0478/ | `quellenarchiv/wok-q-0478/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0479/ | `quellenarchiv/wok-q-0479/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0480/ | `quellenarchiv/wok-q-0480/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0481/ | `quellenarchiv/wok-q-0481/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0482/ | `quellenarchiv/wok-q-0482/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0483/ | `quellenarchiv/wok-q-0483/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0484/ | `quellenarchiv/wok-q-0484/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0485/ | `quellenarchiv/wok-q-0485/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0486/ | `quellenarchiv/wok-q-0486/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0487/ | `quellenarchiv/wok-q-0487/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0488/ | `quellenarchiv/wok-q-0488/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0489/ | `quellenarchiv/wok-q-0489/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0490/ | `quellenarchiv/wok-q-0490/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0491/ | `quellenarchiv/wok-q-0491/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0492/ | `quellenarchiv/wok-q-0492/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0493/ | `quellenarchiv/wok-q-0493/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0494/ | `quellenarchiv/wok-q-0494/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0495/ | `quellenarchiv/wok-q-0495/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0496/ | `quellenarchiv/wok-q-0496/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0497/ | `quellenarchiv/wok-q-0497/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0498/ | `quellenarchiv/wok-q-0498/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0499/ | `quellenarchiv/wok-q-0499/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0500/ | `quellenarchiv/wok-q-0500/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0501/ | `quellenarchiv/wok-q-0501/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0502/ | `quellenarchiv/wok-q-0502/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0503/ | `quellenarchiv/wok-q-0503/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0504/ | `quellenarchiv/wok-q-0504/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0505/ | `quellenarchiv/wok-q-0505/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0506/ | `quellenarchiv/wok-q-0506/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0507/ | `quellenarchiv/wok-q-0507/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0508/ | `quellenarchiv/wok-q-0508/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0509/ | `quellenarchiv/wok-q-0509/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0510/ | `quellenarchiv/wok-q-0510/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0511/ | `quellenarchiv/wok-q-0511/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0512/ | `quellenarchiv/wok-q-0512/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0513/ | `quellenarchiv/wok-q-0513/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0514/ | `quellenarchiv/wok-q-0514/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0515/ | `quellenarchiv/wok-q-0515/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0516/ | `quellenarchiv/wok-q-0516/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0517/ | `quellenarchiv/wok-q-0517/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0518/ | `quellenarchiv/wok-q-0518/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0519/ | `quellenarchiv/wok-q-0519/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0520/ | `quellenarchiv/wok-q-0520/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0521/ | `quellenarchiv/wok-q-0521/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0522/ | `quellenarchiv/wok-q-0522/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0523/ | `quellenarchiv/wok-q-0523/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0524/ | `quellenarchiv/wok-q-0524/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0525/ | `quellenarchiv/wok-q-0525/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0526/ | `quellenarchiv/wok-q-0526/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0527/ | `quellenarchiv/wok-q-0527/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0528/ | `quellenarchiv/wok-q-0528/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0529/ | `quellenarchiv/wok-q-0529/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0530/ | `quellenarchiv/wok-q-0530/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0531/ | `quellenarchiv/wok-q-0531/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0532/ | `quellenarchiv/wok-q-0532/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0533/ | `quellenarchiv/wok-q-0533/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0534/ | `quellenarchiv/wok-q-0534/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0535/ | `quellenarchiv/wok-q-0535/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0536/ | `quellenarchiv/wok-q-0536/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0537/ | `quellenarchiv/wok-q-0537/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0538/ | `quellenarchiv/wok-q-0538/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0539/ | `quellenarchiv/wok-q-0539/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0540/ | `quellenarchiv/wok-q-0540/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0541/ | `quellenarchiv/wok-q-0541/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0542/ | `quellenarchiv/wok-q-0542/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0543/ | `quellenarchiv/wok-q-0543/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0544/ | `quellenarchiv/wok-q-0544/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0545/ | `quellenarchiv/wok-q-0545/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0546/ | `quellenarchiv/wok-q-0546/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0547/ | `quellenarchiv/wok-q-0547/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0548/ | `quellenarchiv/wok-q-0548/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0549/ | `quellenarchiv/wok-q-0549/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0550/ | `quellenarchiv/wok-q-0550/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0551/ | `quellenarchiv/wok-q-0551/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0552/ | `quellenarchiv/wok-q-0552/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0553/ | `quellenarchiv/wok-q-0553/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0554/ | `quellenarchiv/wok-q-0554/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0555/ | `quellenarchiv/wok-q-0555/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0556/ | `quellenarchiv/wok-q-0556/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0557/ | `quellenarchiv/wok-q-0557/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0558/ | `quellenarchiv/wok-q-0558/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0559/ | `quellenarchiv/wok-q-0559/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0560/ | `quellenarchiv/wok-q-0560/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0561/ | `quellenarchiv/wok-q-0561/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0562/ | `quellenarchiv/wok-q-0562/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0563/ | `quellenarchiv/wok-q-0563/index.html` | ADD_SOURCE_LINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0564/ | `quellenarchiv/wok-q-0564/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0565/ | `quellenarchiv/wok-q-0565/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0566/ | `quellenarchiv/wok-q-0566/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0567/ | `quellenarchiv/wok-q-0567/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0568/ | `quellenarchiv/wok-q-0568/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0569/ | `quellenarchiv/wok-q-0569/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0570/ | `quellenarchiv/wok-q-0570/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0571/ | `quellenarchiv/wok-q-0571/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0572/ | `quellenarchiv/wok-q-0572/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0573/ | `quellenarchiv/wok-q-0573/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0574/ | `quellenarchiv/wok-q-0574/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0575/ | `quellenarchiv/wok-q-0575/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0576/ | `quellenarchiv/wok-q-0576/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0577/ | `quellenarchiv/wok-q-0577/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0578/ | `quellenarchiv/wok-q-0578/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0579/ | `quellenarchiv/wok-q-0579/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0580/ | `quellenarchiv/wok-q-0580/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0581/ | `quellenarchiv/wok-q-0581/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0582/ | `quellenarchiv/wok-q-0582/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0583/ | `quellenarchiv/wok-q-0583/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0584/ | `quellenarchiv/wok-q-0584/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0585/ | `quellenarchiv/wok-q-0585/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0586/ | `quellenarchiv/wok-q-0586/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0587/ | `quellenarchiv/wok-q-0587/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0588/ | `quellenarchiv/wok-q-0588/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0589/ | `quellenarchiv/wok-q-0589/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0590/ | `quellenarchiv/wok-q-0590/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0591/ | `quellenarchiv/wok-q-0591/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0592/ | `quellenarchiv/wok-q-0592/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0593/ | `quellenarchiv/wok-q-0593/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0594/ | `quellenarchiv/wok-q-0594/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0595/ | `quellenarchiv/wok-q-0595/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0596/ | `quellenarchiv/wok-q-0596/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0597/ | `quellenarchiv/wok-q-0597/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0598/ | `quellenarchiv/wok-q-0598/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0599/ | `quellenarchiv/wok-q-0599/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0600/ | `quellenarchiv/wok-q-0600/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0601/ | `quellenarchiv/wok-q-0601/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0602/ | `quellenarchiv/wok-q-0602/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0603/ | `quellenarchiv/wok-q-0603/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0604/ | `quellenarchiv/wok-q-0604/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0605/ | `quellenarchiv/wok-q-0605/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0606/ | `quellenarchiv/wok-q-0606/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0607/ | `quellenarchiv/wok-q-0607/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0608/ | `quellenarchiv/wok-q-0608/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0609/ | `quellenarchiv/wok-q-0609/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0610/ | `quellenarchiv/wok-q-0610/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0611/ | `quellenarchiv/wok-q-0611/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0612/ | `quellenarchiv/wok-q-0612/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0613/ | `quellenarchiv/wok-q-0613/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0614/ | `quellenarchiv/wok-q-0614/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0615/ | `quellenarchiv/wok-q-0615/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0616/ | `quellenarchiv/wok-q-0616/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0617/ | `quellenarchiv/wok-q-0617/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0618/ | `quellenarchiv/wok-q-0618/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0619/ | `quellenarchiv/wok-q-0619/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0620/ | `quellenarchiv/wok-q-0620/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0621/ | `quellenarchiv/wok-q-0621/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0622/ | `quellenarchiv/wok-q-0622/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0623/ | `quellenarchiv/wok-q-0623/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0624/ | `quellenarchiv/wok-q-0624/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0625/ | `quellenarchiv/wok-q-0625/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0626/ | `quellenarchiv/wok-q-0626/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0627/ | `quellenarchiv/wok-q-0627/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0628/ | `quellenarchiv/wok-q-0628/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0629/ | `quellenarchiv/wok-q-0629/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0630/ | `quellenarchiv/wok-q-0630/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0631/ | `quellenarchiv/wok-q-0631/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0632/ | `quellenarchiv/wok-q-0632/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0633/ | `quellenarchiv/wok-q-0633/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0634/ | `quellenarchiv/wok-q-0634/index.html` | ADD_SOURCE_LINKS | evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0635/ | `quellenarchiv/wok-q-0635/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0636/ | `quellenarchiv/wok-q-0636/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0637/ | `quellenarchiv/wok-q-0637/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0638/ | `quellenarchiv/wok-q-0638/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0639/ | `quellenarchiv/wok-q-0639/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0640/ | `quellenarchiv/wok-q-0640/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0641/ | `quellenarchiv/wok-q-0641/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0642/ | `quellenarchiv/wok-q-0642/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0643/ | `quellenarchiv/wok-q-0643/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0644/ | `quellenarchiv/wok-q-0644/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0645/ | `quellenarchiv/wok-q-0645/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0646/ | `quellenarchiv/wok-q-0646/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0647/ | `quellenarchiv/wok-q-0647/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0648/ | `quellenarchiv/wok-q-0648/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0649/ | `quellenarchiv/wok-q-0649/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0650/ | `quellenarchiv/wok-q-0650/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0651/ | `quellenarchiv/wok-q-0651/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0652/ | `quellenarchiv/wok-q-0652/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0653/ | `quellenarchiv/wok-q-0653/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0654/ | `quellenarchiv/wok-q-0654/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0655/ | `quellenarchiv/wok-q-0655/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0656/ | `quellenarchiv/wok-q-0656/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0657/ | `quellenarchiv/wok-q-0657/index.html` | ADD_SOURCE_LINKS | evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0658/ | `quellenarchiv/wok-q-0658/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0659/ | `quellenarchiv/wok-q-0659/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0660/ | `quellenarchiv/wok-q-0660/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0661/ | `quellenarchiv/wok-q-0661/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0662/ | `quellenarchiv/wok-q-0662/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0663/ | `quellenarchiv/wok-q-0663/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0664/ | `quellenarchiv/wok-q-0664/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0665/ | `quellenarchiv/wok-q-0665/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0666/ | `quellenarchiv/wok-q-0666/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0667/ | `quellenarchiv/wok-q-0667/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0668/ | `quellenarchiv/wok-q-0668/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0669/ | `quellenarchiv/wok-q-0669/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0670/ | `quellenarchiv/wok-q-0670/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0671/ | `quellenarchiv/wok-q-0671/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0672/ | `quellenarchiv/wok-q-0672/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0673/ | `quellenarchiv/wok-q-0673/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0674/ | `quellenarchiv/wok-q-0674/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0675/ | `quellenarchiv/wok-q-0675/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0676/ | `quellenarchiv/wok-q-0676/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0677/ | `quellenarchiv/wok-q-0677/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0678/ | `quellenarchiv/wok-q-0678/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0679/ | `quellenarchiv/wok-q-0679/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0680/ | `quellenarchiv/wok-q-0680/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0681/ | `quellenarchiv/wok-q-0681/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0682/ | `quellenarchiv/wok-q-0682/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0683/ | `quellenarchiv/wok-q-0683/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0684/ | `quellenarchiv/wok-q-0684/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0685/ | `quellenarchiv/wok-q-0685/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0686/ | `quellenarchiv/wok-q-0686/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0687/ | `quellenarchiv/wok-q-0687/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0688/ | `quellenarchiv/wok-q-0688/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0689/ | `quellenarchiv/wok-q-0689/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0690/ | `quellenarchiv/wok-q-0690/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0691/ | `quellenarchiv/wok-q-0691/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0692/ | `quellenarchiv/wok-q-0692/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0693/ | `quellenarchiv/wok-q-0693/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0694/ | `quellenarchiv/wok-q-0694/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0695/ | `quellenarchiv/wok-q-0695/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0696/ | `quellenarchiv/wok-q-0696/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0697/ | `quellenarchiv/wok-q-0697/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0698/ | `quellenarchiv/wok-q-0698/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0699/ | `quellenarchiv/wok-q-0699/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0700/ | `quellenarchiv/wok-q-0700/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0701/ | `quellenarchiv/wok-q-0701/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0702/ | `quellenarchiv/wok-q-0702/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0703/ | `quellenarchiv/wok-q-0703/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0704/ | `quellenarchiv/wok-q-0704/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0705/ | `quellenarchiv/wok-q-0705/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0706/ | `quellenarchiv/wok-q-0706/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0707/ | `quellenarchiv/wok-q-0707/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0708/ | `quellenarchiv/wok-q-0708/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0709/ | `quellenarchiv/wok-q-0709/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0710/ | `quellenarchiv/wok-q-0710/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0711/ | `quellenarchiv/wok-q-0711/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0712/ | `quellenarchiv/wok-q-0712/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0713/ | `quellenarchiv/wok-q-0713/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0714/ | `quellenarchiv/wok-q-0714/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0715/ | `quellenarchiv/wok-q-0715/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0716/ | `quellenarchiv/wok-q-0716/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0717/ | `quellenarchiv/wok-q-0717/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0718/ | `quellenarchiv/wok-q-0718/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0719/ | `quellenarchiv/wok-q-0719/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0720/ | `quellenarchiv/wok-q-0720/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0721/ | `quellenarchiv/wok-q-0721/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0722/ | `quellenarchiv/wok-q-0722/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0723/ | `quellenarchiv/wok-q-0723/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0724/ | `quellenarchiv/wok-q-0724/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0725/ | `quellenarchiv/wok-q-0725/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0726/ | `quellenarchiv/wok-q-0726/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0727/ | `quellenarchiv/wok-q-0727/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0728/ | `quellenarchiv/wok-q-0728/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0729/ | `quellenarchiv/wok-q-0729/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0730/ | `quellenarchiv/wok-q-0730/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0731/ | `quellenarchiv/wok-q-0731/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0732/ | `quellenarchiv/wok-q-0732/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0733/ | `quellenarchiv/wok-q-0733/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0734/ | `quellenarchiv/wok-q-0734/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0735/ | `quellenarchiv/wok-q-0735/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0736/ | `quellenarchiv/wok-q-0736/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0737/ | `quellenarchiv/wok-q-0737/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0738/ | `quellenarchiv/wok-q-0738/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0739/ | `quellenarchiv/wok-q-0739/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0740/ | `quellenarchiv/wok-q-0740/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0741/ | `quellenarchiv/wok-q-0741/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0742/ | `quellenarchiv/wok-q-0742/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0743/ | `quellenarchiv/wok-q-0743/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0744/ | `quellenarchiv/wok-q-0744/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0745/ | `quellenarchiv/wok-q-0745/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0746/ | `quellenarchiv/wok-q-0746/index.html` | ADD_SOURCE_LINKS | folgenabschaetzung |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0747/ | `quellenarchiv/wok-q-0747/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0748/ | `quellenarchiv/wok-q-0748/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0749/ | `quellenarchiv/wok-q-0749/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0750/ | `quellenarchiv/wok-q-0750/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0751/ | `quellenarchiv/wok-q-0751/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0752/ | `quellenarchiv/wok-q-0752/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0753/ | `quellenarchiv/wok-q-0753/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0754/ | `quellenarchiv/wok-q-0754/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0755/ | `quellenarchiv/wok-q-0755/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0756/ | `quellenarchiv/wok-q-0756/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0757/ | `quellenarchiv/wok-q-0757/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0758/ | `quellenarchiv/wok-q-0758/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0759/ | `quellenarchiv/wok-q-0759/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0760/ | `quellenarchiv/wok-q-0760/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0761/ | `quellenarchiv/wok-q-0761/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0762/ | `quellenarchiv/wok-q-0762/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0763/ | `quellenarchiv/wok-q-0763/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0764/ | `quellenarchiv/wok-q-0764/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0765/ | `quellenarchiv/wok-q-0765/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0766/ | `quellenarchiv/wok-q-0766/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0767/ | `quellenarchiv/wok-q-0767/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0768/ | `quellenarchiv/wok-q-0768/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0769/ | `quellenarchiv/wok-q-0769/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0770/ | `quellenarchiv/wok-q-0770/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0771/ | `quellenarchiv/wok-q-0771/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0772/ | `quellenarchiv/wok-q-0772/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0773/ | `quellenarchiv/wok-q-0773/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0774/ | `quellenarchiv/wok-q-0774/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0775/ | `quellenarchiv/wok-q-0775/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0776/ | `quellenarchiv/wok-q-0776/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0777/ | `quellenarchiv/wok-q-0777/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0778/ | `quellenarchiv/wok-q-0778/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0779/ | `quellenarchiv/wok-q-0779/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0780/ | `quellenarchiv/wok-q-0780/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0781/ | `quellenarchiv/wok-q-0781/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0782/ | `quellenarchiv/wok-q-0782/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0783/ | `quellenarchiv/wok-q-0783/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0784/ | `quellenarchiv/wok-q-0784/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0785/ | `quellenarchiv/wok-q-0785/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0786/ | `quellenarchiv/wok-q-0786/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0787/ | `quellenarchiv/wok-q-0787/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0788/ | `quellenarchiv/wok-q-0788/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0789/ | `quellenarchiv/wok-q-0789/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0790/ | `quellenarchiv/wok-q-0790/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0791/ | `quellenarchiv/wok-q-0791/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0792/ | `quellenarchiv/wok-q-0792/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0793/ | `quellenarchiv/wok-q-0793/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0794/ | `quellenarchiv/wok-q-0794/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0795/ | `quellenarchiv/wok-q-0795/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0796/ | `quellenarchiv/wok-q-0796/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0797/ | `quellenarchiv/wok-q-0797/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0798/ | `quellenarchiv/wok-q-0798/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0799/ | `quellenarchiv/wok-q-0799/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0800/ | `quellenarchiv/wok-q-0800/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0801/ | `quellenarchiv/wok-q-0801/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0802/ | `quellenarchiv/wok-q-0802/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0803/ | `quellenarchiv/wok-q-0803/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0804/ | `quellenarchiv/wok-q-0804/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0805/ | `quellenarchiv/wok-q-0805/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0806/ | `quellenarchiv/wok-q-0806/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0807/ | `quellenarchiv/wok-q-0807/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0808/ | `quellenarchiv/wok-q-0808/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0809/ | `quellenarchiv/wok-q-0809/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0810/ | `quellenarchiv/wok-q-0810/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0811/ | `quellenarchiv/wok-q-0811/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0812/ | `quellenarchiv/wok-q-0812/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0813/ | `quellenarchiv/wok-q-0813/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0814/ | `quellenarchiv/wok-q-0814/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0815/ | `quellenarchiv/wok-q-0815/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0816/ | `quellenarchiv/wok-q-0816/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0817/ | `quellenarchiv/wok-q-0817/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0818/ | `quellenarchiv/wok-q-0818/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0819/ | `quellenarchiv/wok-q-0819/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0820/ | `quellenarchiv/wok-q-0820/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0821/ | `quellenarchiv/wok-q-0821/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0822/ | `quellenarchiv/wok-q-0822/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0823/ | `quellenarchiv/wok-q-0823/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0824/ | `quellenarchiv/wok-q-0824/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0825/ | `quellenarchiv/wok-q-0825/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0826/ | `quellenarchiv/wok-q-0826/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0827/ | `quellenarchiv/wok-q-0827/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0828/ | `quellenarchiv/wok-q-0828/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0829/ | `quellenarchiv/wok-q-0829/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0830/ | `quellenarchiv/wok-q-0830/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0831/ | `quellenarchiv/wok-q-0831/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0832/ | `quellenarchiv/wok-q-0832/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0833/ | `quellenarchiv/wok-q-0833/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0834/ | `quellenarchiv/wok-q-0834/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0835/ | `quellenarchiv/wok-q-0835/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0836/ | `quellenarchiv/wok-q-0836/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0837/ | `quellenarchiv/wok-q-0837/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0838/ | `quellenarchiv/wok-q-0838/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0839/ | `quellenarchiv/wok-q-0839/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0840/ | `quellenarchiv/wok-q-0840/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0841/ | `quellenarchiv/wok-q-0841/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0842/ | `quellenarchiv/wok-q-0842/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0843/ | `quellenarchiv/wok-q-0843/index.html` | ADD_SOURCE_LINKS | wirkungsblind |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0844/ | `quellenarchiv/wok-q-0844/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0845/ | `quellenarchiv/wok-q-0845/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0846/ | `quellenarchiv/wok-q-0846/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0847/ | `quellenarchiv/wok-q-0847/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0848/ | `quellenarchiv/wok-q-0848/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0849/ | `quellenarchiv/wok-q-0849/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0850/ | `quellenarchiv/wok-q-0850/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0851/ | `quellenarchiv/wok-q-0851/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0852/ | `quellenarchiv/wok-q-0852/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0853/ | `quellenarchiv/wok-q-0853/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0854/ | `quellenarchiv/wok-q-0854/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0855/ | `quellenarchiv/wok-q-0855/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0856/ | `quellenarchiv/wok-q-0856/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0857/ | `quellenarchiv/wok-q-0857/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0858/ | `quellenarchiv/wok-q-0858/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0859/ | `quellenarchiv/wok-q-0859/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0860/ | `quellenarchiv/wok-q-0860/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0861/ | `quellenarchiv/wok-q-0861/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0862/ | `quellenarchiv/wok-q-0862/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0863/ | `quellenarchiv/wok-q-0863/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0864/ | `quellenarchiv/wok-q-0864/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0865/ | `quellenarchiv/wok-q-0865/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0866/ | `quellenarchiv/wok-q-0866/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0867/ | `quellenarchiv/wok-q-0867/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0868/ | `quellenarchiv/wok-q-0868/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0869/ | `quellenarchiv/wok-q-0869/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0870/ | `quellenarchiv/wok-q-0870/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0871/ | `quellenarchiv/wok-q-0871/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0872/ | `quellenarchiv/wok-q-0872/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0873/ | `quellenarchiv/wok-q-0873/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0874/ | `quellenarchiv/wok-q-0874/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0875/ | `quellenarchiv/wok-q-0875/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0876/ | `quellenarchiv/wok-q-0876/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0877/ | `quellenarchiv/wok-q-0877/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0878/ | `quellenarchiv/wok-q-0878/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0879/ | `quellenarchiv/wok-q-0879/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0880/ | `quellenarchiv/wok-q-0880/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0881/ | `quellenarchiv/wok-q-0881/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0882/ | `quellenarchiv/wok-q-0882/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0883/ | `quellenarchiv/wok-q-0883/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0884/ | `quellenarchiv/wok-q-0884/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0885/ | `quellenarchiv/wok-q-0885/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0886/ | `quellenarchiv/wok-q-0886/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0887/ | `quellenarchiv/wok-q-0887/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0888/ | `quellenarchiv/wok-q-0888/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0889/ | `quellenarchiv/wok-q-0889/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0890/ | `quellenarchiv/wok-q-0890/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0891/ | `quellenarchiv/wok-q-0891/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0892/ | `quellenarchiv/wok-q-0892/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0893/ | `quellenarchiv/wok-q-0893/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0894/ | `quellenarchiv/wok-q-0894/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0895/ | `quellenarchiv/wok-q-0895/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0896/ | `quellenarchiv/wok-q-0896/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0897/ | `quellenarchiv/wok-q-0897/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0898/ | `quellenarchiv/wok-q-0898/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0899/ | `quellenarchiv/wok-q-0899/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0900/ | `quellenarchiv/wok-q-0900/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0901/ | `quellenarchiv/wok-q-0901/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0902/ | `quellenarchiv/wok-q-0902/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0903/ | `quellenarchiv/wok-q-0903/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0904/ | `quellenarchiv/wok-q-0904/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0905/ | `quellenarchiv/wok-q-0905/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0906/ | `quellenarchiv/wok-q-0906/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0907/ | `quellenarchiv/wok-q-0907/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0908/ | `quellenarchiv/wok-q-0908/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0909/ | `quellenarchiv/wok-q-0909/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0910/ | `quellenarchiv/wok-q-0910/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0911/ | `quellenarchiv/wok-q-0911/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0912/ | `quellenarchiv/wok-q-0912/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0913/ | `quellenarchiv/wok-q-0913/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0914/ | `quellenarchiv/wok-q-0914/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0915/ | `quellenarchiv/wok-q-0915/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0916/ | `quellenarchiv/wok-q-0916/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0917/ | `quellenarchiv/wok-q-0917/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0918/ | `quellenarchiv/wok-q-0918/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0919/ | `quellenarchiv/wok-q-0919/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0920/ | `quellenarchiv/wok-q-0920/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0921/ | `quellenarchiv/wok-q-0921/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0922/ | `quellenarchiv/wok-q-0922/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0923/ | `quellenarchiv/wok-q-0923/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0924/ | `quellenarchiv/wok-q-0924/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0925/ | `quellenarchiv/wok-q-0925/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0926/ | `quellenarchiv/wok-q-0926/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0927/ | `quellenarchiv/wok-q-0927/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0928/ | `quellenarchiv/wok-q-0928/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0929/ | `quellenarchiv/wok-q-0929/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0930/ | `quellenarchiv/wok-q-0930/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0931/ | `quellenarchiv/wok-q-0931/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0932/ | `quellenarchiv/wok-q-0932/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0933/ | `quellenarchiv/wok-q-0933/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0934/ | `quellenarchiv/wok-q-0934/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0935/ | `quellenarchiv/wok-q-0935/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0936/ | `quellenarchiv/wok-q-0936/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0937/ | `quellenarchiv/wok-q-0937/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0938/ | `quellenarchiv/wok-q-0938/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0939/ | `quellenarchiv/wok-q-0939/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0940/ | `quellenarchiv/wok-q-0940/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0941/ | `quellenarchiv/wok-q-0941/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0942/ | `quellenarchiv/wok-q-0942/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0943/ | `quellenarchiv/wok-q-0943/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0944/ | `quellenarchiv/wok-q-0944/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0945/ | `quellenarchiv/wok-q-0945/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0946/ | `quellenarchiv/wok-q-0946/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0947/ | `quellenarchiv/wok-q-0947/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0948/ | `quellenarchiv/wok-q-0948/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0949/ | `quellenarchiv/wok-q-0949/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0950/ | `quellenarchiv/wok-q-0950/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0951/ | `quellenarchiv/wok-q-0951/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0952/ | `quellenarchiv/wok-q-0952/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0953/ | `quellenarchiv/wok-q-0953/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0954/ | `quellenarchiv/wok-q-0954/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0955/ | `quellenarchiv/wok-q-0955/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0956/ | `quellenarchiv/wok-q-0956/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0957/ | `quellenarchiv/wok-q-0957/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0958/ | `quellenarchiv/wok-q-0958/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0959/ | `quellenarchiv/wok-q-0959/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0960/ | `quellenarchiv/wok-q-0960/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0961/ | `quellenarchiv/wok-q-0961/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0962/ | `quellenarchiv/wok-q-0962/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0963/ | `quellenarchiv/wok-q-0963/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0964/ | `quellenarchiv/wok-q-0964/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0965/ | `quellenarchiv/wok-q-0965/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0966/ | `quellenarchiv/wok-q-0966/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0967/ | `quellenarchiv/wok-q-0967/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0968/ | `quellenarchiv/wok-q-0968/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0969/ | `quellenarchiv/wok-q-0969/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0970/ | `quellenarchiv/wok-q-0970/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0971/ | `quellenarchiv/wok-q-0971/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0972/ | `quellenarchiv/wok-q-0972/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0973/ | `quellenarchiv/wok-q-0973/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0974/ | `quellenarchiv/wok-q-0974/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0975/ | `quellenarchiv/wok-q-0975/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0976/ | `quellenarchiv/wok-q-0976/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0977/ | `quellenarchiv/wok-q-0977/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0978/ | `quellenarchiv/wok-q-0978/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0979/ | `quellenarchiv/wok-q-0979/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0980/ | `quellenarchiv/wok-q-0980/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0981/ | `quellenarchiv/wok-q-0981/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0982/ | `quellenarchiv/wok-q-0982/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0983/ | `quellenarchiv/wok-q-0983/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0984/ | `quellenarchiv/wok-q-0984/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0985/ | `quellenarchiv/wok-q-0985/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0986/ | `quellenarchiv/wok-q-0986/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0987/ | `quellenarchiv/wok-q-0987/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0988/ | `quellenarchiv/wok-q-0988/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0989/ | `quellenarchiv/wok-q-0989/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0990/ | `quellenarchiv/wok-q-0990/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0991/ | `quellenarchiv/wok-q-0991/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0992/ | `quellenarchiv/wok-q-0992/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0993/ | `quellenarchiv/wok-q-0993/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0994/ | `quellenarchiv/wok-q-0994/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0995/ | `quellenarchiv/wok-q-0995/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0996/ | `quellenarchiv/wok-q-0996/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0997/ | `quellenarchiv/wok-q-0997/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0998/ | `quellenarchiv/wok-q-0998/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-0999/ | `quellenarchiv/wok-q-0999/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1000/ | `quellenarchiv/wok-q-1000/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1001/ | `quellenarchiv/wok-q-1001/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1002/ | `quellenarchiv/wok-q-1002/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1003/ | `quellenarchiv/wok-q-1003/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1004/ | `quellenarchiv/wok-q-1004/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1005/ | `quellenarchiv/wok-q-1005/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1006/ | `quellenarchiv/wok-q-1006/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1007/ | `quellenarchiv/wok-q-1007/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1008/ | `quellenarchiv/wok-q-1008/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1009/ | `quellenarchiv/wok-q-1009/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1010/ | `quellenarchiv/wok-q-1010/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1011/ | `quellenarchiv/wok-q-1011/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1012/ | `quellenarchiv/wok-q-1012/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1013/ | `quellenarchiv/wok-q-1013/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1014/ | `quellenarchiv/wok-q-1014/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1015/ | `quellenarchiv/wok-q-1015/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1016/ | `quellenarchiv/wok-q-1016/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1017/ | `quellenarchiv/wok-q-1017/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1018/ | `quellenarchiv/wok-q-1018/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1019/ | `quellenarchiv/wok-q-1019/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1020/ | `quellenarchiv/wok-q-1020/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1021/ | `quellenarchiv/wok-q-1021/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1022/ | `quellenarchiv/wok-q-1022/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1023/ | `quellenarchiv/wok-q-1023/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1024/ | `quellenarchiv/wok-q-1024/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1025/ | `quellenarchiv/wok-q-1025/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1026/ | `quellenarchiv/wok-q-1026/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1027/ | `quellenarchiv/wok-q-1027/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1028/ | `quellenarchiv/wok-q-1028/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1029/ | `quellenarchiv/wok-q-1029/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1030/ | `quellenarchiv/wok-q-1030/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1031/ | `quellenarchiv/wok-q-1031/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1032/ | `quellenarchiv/wok-q-1032/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1033/ | `quellenarchiv/wok-q-1033/index.html` | ADD_SOURCE_LINKS | alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1034/ | `quellenarchiv/wok-q-1034/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1035/ | `quellenarchiv/wok-q-1035/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1036/ | `quellenarchiv/wok-q-1036/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1037/ | `quellenarchiv/wok-q-1037/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1038/ | `quellenarchiv/wok-q-1038/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1039/ | `quellenarchiv/wok-q-1039/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1040/ | `quellenarchiv/wok-q-1040/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1041/ | `quellenarchiv/wok-q-1041/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1042/ | `quellenarchiv/wok-q-1042/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1043/ | `quellenarchiv/wok-q-1043/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1044/ | `quellenarchiv/wok-q-1044/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1045/ | `quellenarchiv/wok-q-1045/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1046/ | `quellenarchiv/wok-q-1046/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1047/ | `quellenarchiv/wok-q-1047/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1048/ | `quellenarchiv/wok-q-1048/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1049/ | `quellenarchiv/wok-q-1049/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1050/ | `quellenarchiv/wok-q-1050/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1051/ | `quellenarchiv/wok-q-1051/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1052/ | `quellenarchiv/wok-q-1052/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1053/ | `quellenarchiv/wok-q-1053/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1054/ | `quellenarchiv/wok-q-1054/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1055/ | `quellenarchiv/wok-q-1055/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1056/ | `quellenarchiv/wok-q-1056/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1057/ | `quellenarchiv/wok-q-1057/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1058/ | `quellenarchiv/wok-q-1058/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1059/ | `quellenarchiv/wok-q-1059/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1060/ | `quellenarchiv/wok-q-1060/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1061/ | `quellenarchiv/wok-q-1061/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1062/ | `quellenarchiv/wok-q-1062/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1063/ | `quellenarchiv/wok-q-1063/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1068/ | `quellenarchiv/wok-q-1068/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1073/ | `quellenarchiv/wok-q-1073/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1075/ | `quellenarchiv/wok-q-1075/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1076/ | `quellenarchiv/wok-q-1076/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1077/ | `quellenarchiv/wok-q-1077/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1078/ | `quellenarchiv/wok-q-1078/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1079/ | `quellenarchiv/wok-q-1079/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1080/ | `quellenarchiv/wok-q-1080/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1081/ | `quellenarchiv/wok-q-1081/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1082/ | `quellenarchiv/wok-q-1082/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1083/ | `quellenarchiv/wok-q-1083/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1084/ | `quellenarchiv/wok-q-1084/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1085/ | `quellenarchiv/wok-q-1085/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1086/ | `quellenarchiv/wok-q-1086/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1087/ | `quellenarchiv/wok-q-1087/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1088/ | `quellenarchiv/wok-q-1088/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1089/ | `quellenarchiv/wok-q-1089/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1090/ | `quellenarchiv/wok-q-1090/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1091/ | `quellenarchiv/wok-q-1091/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1092/ | `quellenarchiv/wok-q-1092/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1093/ | `quellenarchiv/wok-q-1093/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1094/ | `quellenarchiv/wok-q-1094/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1095/ | `quellenarchiv/wok-q-1095/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1096/ | `quellenarchiv/wok-q-1096/index.html` | ADD_SOURCE_LINKS | evaluation |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1097/ | `quellenarchiv/wok-q-1097/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1100/ | `quellenarchiv/wok-q-1100/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1101/ | `quellenarchiv/wok-q-1101/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1102/ | `quellenarchiv/wok-q-1102/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1103/ | `quellenarchiv/wok-q-1103/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1104/ | `quellenarchiv/wok-q-1104/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1105/ | `quellenarchiv/wok-q-1105/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1106/ | `quellenarchiv/wok-q-1106/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1107/ | `quellenarchiv/wok-q-1107/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1108/ | `quellenarchiv/wok-q-1108/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1109/ | `quellenarchiv/wok-q-1109/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-1110/ | `quellenarchiv/wok-q-1110/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9029/ | `quellenarchiv/wok-q-9029/index.html` | ADD_SOURCE_LINKS | folgenabschaetzung, dns, alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9030/ | `quellenarchiv/wok-q-9030/index.html` | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, dns |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9031/ | `quellenarchiv/wok-q-9031/index.html` | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, dns |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9032/ | `quellenarchiv/wok-q-9032/index.html` | ADD_SOURCE_LINKS | dns |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9033/ | `quellenarchiv/wok-q-9033/index.html` | ADD_SOURCE_LINKS | dns |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9034/ | `quellenarchiv/wok-q-9034/index.html` | ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9035/ | `quellenarchiv/wok-q-9035/index.html` | ADD_SOURCE_LINKS | dns |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9036/ | `quellenarchiv/wok-q-9036/index.html` | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, dns |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9037/ | `quellenarchiv/wok-q-9037/index.html` | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, dns |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9045/ | `quellenarchiv/wok-q-9045/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9046/ | `quellenarchiv/wok-q-9046/index.html` | ADD_SOURCE_LINKS | enap, dns, alternativen |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9047/ | `quellenarchiv/wok-q-9047/index.html` | ADD_SOURCE_LINKS | enap, dns |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9048/ | `quellenarchiv/wok-q-9048/index.html` | ADD_SOURCE_LINKS | enap, dns |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9049/ | `quellenarchiv/wok-q-9049/index.html` | ADD_SOURCE_LINKS | dns |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9050/ | `quellenarchiv/wok-q-9050/index.html` | ADD_SOURCE_LINKS | dns, evaluation |

## Claim-signal review

Signals are review candidates, not automatic errors.

- `modell.html` — wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation — Add German DNS operationalisation and existing GGO/GFA/eNAP architecture; define Wirkungsblindheit as incomplete causal/decision feedback.
- `fuer/akademie.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `fuer/gesundheit.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `fuer/rente.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `buch.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `blog/wirkungsoekonomie-kein-parteiprogramm.html` — dns, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `blog/wirkungsoekonomie-lernendes-kreislaufsystem.html` — wirkungsblind — No material #253 change identified by path rule; semantic scan still applies.
- `blog/leistung-ohne-wirkung.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `werkzeuge/index.html` — evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/arbeit-einkommen/arbeit-einkommen-wirkung/index.html` — evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/arbeit-einkommen/automatisierung-maschinenleistung/index.html` — evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/arbeit-einkommen/sozialabgaben-entkoppeln/index.html` — evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/arbeit-einkommen/wirkungseinkommen/index.html` — evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/arbeit-einkommen/wirkungseinkommensteuer/index.html` — folgenabschaetzung, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/arbeit-einkommen/care-bildung-ehrenamt/index.html` — evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/arbeit-einkommen/unternehmen-roboter-mitbestimmung/index.html` — evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/arbeit-einkommen/uebergangsarbeitsmarkt-weiterbildung/index.html` — evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/medien-oeffentlichkeit/konzept/index.html` — evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/wirtschaft-unternehmen/unternehmen-als-wirkungssysteme/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/wirtschaft-unternehmen/wirkungsorientierte-unternehmensfuehrung/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/wirtschaft-unternehmen/wirkungscontrolling/index.html` — alternativen, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/wirtschaft-unternehmen/marketing-vertrieb-fuenftes-p-planet/index.html` — wirkungsblind, alternativen, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/migration-vielfalt/vielfalt-als-resilienzfaktor/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/digitalisierung-ki-wirkungsdatenraeume/digitale-produktpaesse/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/digitalisierung-ki-wirkungsdatenraeume/wirkungsdatenraeume/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/digitalisierung-ki-wirkungsdatenraeume/ki-governance/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/digitalisierung-ki-wirkungsdatenraeume/algorithmische-fairness/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/digitalisierung-ki-wirkungsdatenraeume/digitale-souveraenitaet/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/digitalisierung-ki-wirkungsdatenraeume/cyberresilienz/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/digitalisierung-ki-wirkungsdatenraeume/plattformlogik/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/digitalisierung-ki-wirkungsdatenraeume/wirkungsscanner/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/digitalisierung-ki-wirkungsdatenraeume/interoperabilitaet-register/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/digitalisierung-ki-wirkungsdatenraeume/audit-assurance-datenqualitaet/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/kritik-missverstaendnisse-schutzarchitektur/widerstand-neue-massstaebe/index.html` — wirkungsblind, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `portale/kritik-missverstaendnisse-schutzarchitektur/sdgs-verschwoerungsnarrativ/index.html` — wirkungsblind, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `portale/kritik-missverstaendnisse-schutzarchitektur/technokratie-social-credit/index.html` — wirkungsblind, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `portale/kritik-missverstaendnisse-schutzarchitektur/wirkungssimulation-manipulation/index.html` — wirkungsblind, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `portale/kritik-missverstaendnisse-schutzarchitektur/freiheit-markt-planwirtschaft/index.html` — wirkungsblind, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `portale/kritik-missverstaendnisse-schutzarchitektur/fehlbarkeit-korrektur/index.html` — wirkungsblind, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `portale/kritik-missverstaendnisse-schutzarchitektur/datenmacht-datenschutz/index.html` — wirkungsblind, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `portale/kritik-missverstaendnisse-schutzarchitektur/kommunikation-framing-akzeptanz/index.html` — wirkungsblind, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `portale/kritik-missverstaendnisse-schutzarchitektur/missbrauchsschutz-rechtsschutz-governance/index.html` — wirkungsblind, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `portale/kritik-missverstaendnisse-schutzarchitektur/kritikwerkstatt-beteiligung/index.html` — wirkungsblind, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `portale/zukunftsbilder-wirkungswohlstand/alltag-2035/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/zukunftsbilder-wirkungswohlstand/unternehmen-2035/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/zukunftsbilder-wirkungswohlstand/staat-2035/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/zukunftsbilder-wirkungswohlstand/globale-ordnung-2050/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/zukunftsbilder-wirkungswohlstand/wirkungswohlstand/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/zukunftsbilder-wirkungswohlstand/buergerinnen-co-autorinnen/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/zukunftsbilder-wirkungswohlstand/wirkungspraxis/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/zukunftsbilder-wirkungswohlstand/zukunftskommunikation/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/zukunftsbilder-wirkungswohlstand/wirkungs-bip-verlustleistung/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/zukunftsbilder-wirkungswohlstand/schlussbild/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `portale/zukunftsbilder-wirkungswohlstand/gesamtdossier/index.html` — evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/medien-oeffentlichkeit/wirkungsraeume-gestalten-hosting/index.html` — wirkungsblind, folgenabschaetzung, alternativen, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `verstehen/woek-auf-einer-seite/index.html` — wirkungsblind, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation — Add a short fair Anschlussdefinition without overloading the entry page.
- `erleben/index.html` — folgenabschaetzung, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `bibliothek/wirkungsdilemmata-kooperation-sdgplus-gesamtstudie/index.html` — wirkungsblind, folgenabschaetzung, alternativen, evaluation — Review published artefacts; add visible current-method note/erratum when materially required; never silently rewrite historical files.
- `blog/wie-wirksam-ist-das-sondervermoegen-wirklich.html` — wirkungsblind, alternativen, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `blog/nachhaltigkeit-ist-keine-parteifarbe.html` — folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, alternativen, evaluation, novelty_or_absence — Preserve as current source-bound reference; crosslink from relevant current pages.
- `blog/enap-woek-benchmark-fuenf-bundesvorhaben.html` — folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, alternativen, evaluation, novelty_or_absence — Use as canonical five-case calibration corpus; recheck GGO §§43/44 claims and keep public-GFA vs public-eNAP provenance explicit.
- `bibliothek/woek-begriffsleitfaden-fuehrend/index.html` — wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence — Review published artefacts; add visible current-method note/erratum when materially required; never silently rewrite historical files.
- `wirkungsfelder/produkte-konsum/wirkungsumsatzsteuer-produktwirkungssteuer/index.html` — wirkungsblind, alternativen, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/produkte-konsum/lieferketten-importlogik-wirkungsvorsteuer/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `werkzeuge/impact-controlling/index.html` — folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `werkzeuge/impact-controlling/methodenpapiere/woek-ids-indikatorenarchitektur/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/gesundheit-pflege/dossiers/index.html` — evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/finanzsystem-kapital/steuer-abgabenarchitektur-kapital/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `blog/demokratie-braucht-mehr-als-gute-sachpolitik.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `begriffe/index.html` — wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/affektheuristik/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/algorithmische-fairness/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/amathia/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/ambiguitaetsintoleranz/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/angstappell/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/archetyp/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/autoritaetsbias/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/backfire-effekt/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/banalitaet-des-boesen/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/benchmark/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/bestaetigungsfehler/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/blindleistung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/cbam-und-grenzausgleich/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/chicago-school/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/cognitive-ease/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/creator-als-oeffentliche-akteure/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/datenqualitaet/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/deformation-professionnelle/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/deregulierung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/desinformation/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/diskurskultur/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/dissonanzrationalisierung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/dunning-kruger-effekt/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/ehrliche-preise/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/enterprise-risk-management-nach-wirkung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/entfremdung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/erinnerungskultur/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/europa-als-wirkungsraum/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/evolutionstheorie/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/externalisierung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/faktenargumentation/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/finalscore/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/folgewirkung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/framing-sprache-tonalitaet/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/fraunhofersche-linien/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/freiheit-markt-planwirtschaftsvorwurf/index.html` — wirkungsblind, alternativen — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/frequenzillusion/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/friedrich-hayek/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/fundamentaler-attributionsfehler/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/gedankenlosigkeit/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/geld/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/gender-mainstreaming/index.html` — wirkungsblind, folgenabschaetzung, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/geschaeftsmodellpruefung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/gewinn-als-test/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/greenwashing/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/halo-effekt/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/haushaltsblindleistung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/host-wirkung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/hostile-media-effect/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/impact-controlling/index.html` — novelty_or_absence — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/informelles-wissen/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/kapital/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/kapitalwirkung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/keynesianismus/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/ki-governance/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/kii/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/knallzeugen-effekt-blitzlichterinnerung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/kognitive-dissonanz/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/krankheitssystem/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/kultur-als-resonanzsystem/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/kulturelle-anschlussfaehigkeit/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/liberalismus/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/lineare-wirtschaft/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/marktversagen/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/massstabskrise/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/messgrenzen-und-unsicherheit/index.html` — wirkungsblind, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/modellblindheit/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/moderation-und-community-dynamik/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/motiviertes-denken/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/negativitaetsbias/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/netto-wirkung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/neue-ordnung-des-wohlstands/index.html` — wirkungsblind, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/nocebo-effekt/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/normalisierungseffekt/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/nostalgie-effekt/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/oeffentliche-beschaffung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/oeffentliche-statistik/index.html` — wirkungsblind, folgenabschaetzung, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/open-science/index.html` — wirkungsblind, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/pessimismus-bias/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/placebo-effekt/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/plattformlogik-und-algorithmen/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/portfolio-wirkung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/positive-netto-wirkung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/projektions-bias/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/purpose-washing/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/rebound-effekt/index.html` — wirkungsblind, folgenabschaetzung — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/rechtsprechung-als-korrekturinstanz/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/refinanzierungsresilienz/index.html` — novelty_or_absence — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/reframing/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/rent-seeking/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/resonanzraum/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/responsible-marketing/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/reueaversion/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/routineunternehmer/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/rueckkopplung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/rueckschaufehler/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/salienz/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/scheinleistung/index.html` — wirkungsblind, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/scope-3/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/scope-3-datenqualitaet/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/sdg-washing/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/sdgs-und-verschwoerungsnarrative/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/self-serving-bias/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/sexarbeit/index.html` — novelty_or_absence — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/shareholder-value/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/souveraenes-stranding-risiko/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/staat-2035/index.html` — wirkungsblind, folgenabschaetzung, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/staatsfinanzielle-wirkungsblindheit/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/status-quo-bias/index.html` — wirkungsblind, alternativen — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/stranded-sovereign/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/streisand-effekt/index.html` — wirkungsblind, folgenabschaetzung — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/transformationspfad/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/unsichtbare-arbeit/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/unsichtbare-rechnung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/unternehmen-als-wirkungssystem/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/verantwortungsverkuerzung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/verfuegbarkeitsheuristik/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/verhaeltnismaessigkeit-nach-wirkung/index.html` — wirkungsblind, alternativen, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/verlustaversion/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/versicherbarkeit/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/werterhalt/index.html` — novelty_or_absence — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/widerstand-gegen-neue-massstaebe/index.html` — wirkungsblind, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirklichkeitsfaehigkeit/index.html` — wirkungsblind, alternativen — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirklichkeitskonstruktion/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkung-im-preisschild/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungs-bip/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungs-konversion-von-altkapital/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsabwehr/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsarchitektur/index.html` — wirkungsblind, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsassurance/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsaudit/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsbasierter-handel/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsbewertung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsblindheit/index.html` — wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsbudget/index.html` — wirkungsblind, alternativen, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungscontrolling/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsdaten/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsdatenraum/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsgovernance/index.html` — wirkungsblind, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsgrenze/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsgutschrift/index.html` — wirkungsblind, alternativen — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungshaushalt/index.html` — wirkungsblind, alternativen, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsindikator/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsinnovation/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungskommunikation/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungskompetenz/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsoffenheit/index.html` — wirkungsblind, alternativen — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsorientierte-forschung-und-innovation/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsorientierte-unternehmensfuehrung/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungspotenzial/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungspruefung/index.html` — wirkungsblind, folgenabschaetzung, alternativen, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsrat/index.html` — wirkungsblind, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsrecht/index.html` — wirkungsblind, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsregister/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsrendite/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsrente/index.html` — novelty_or_absence — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungsrisiko/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungssimulation/index.html` — wirkungsblind, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungssteuer/index.html` — wirkungsblind, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungssteuergesetz/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungstraeger/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungstransparenzbericht/index.html` — wirkungsblind, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungswahrheit/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungswissenschaften/index.html` — folgenabschaetzung, evaluation, novelty_or_absence — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wissenschaft-als-wirkungsinfrastruktur/index.html` — wirkungsblind, alternativen — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wissenschaftliche-politikberatung/index.html` — wirkungsblind, folgenabschaetzung, alternativen, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wissensrat/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `quellenarchiv/index.html` — wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation — Add official primary sources with function/version/status; separate public GFA documentation from public eNAP-export provenance.
- `quellenarchiv/wok-q-0465/index.html` — novelty_or_absence — Add official primary sources with function/version/status; separate public GFA documentation from public eNAP-export provenance.
- `quellenarchiv/wok-q-0843/index.html` — wirkungsblind — Add official primary sources with function/version/status; separate public GFA documentation from public eNAP-export provenance.
- `wirkungsticker/index.html` — evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsticker/ukraine-krieg-selenskyj-us-vermittler-kommen-am-sonntag-nach-kiew-831caf/index.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsticker/ukraine-krieg-us-gesandte-werden-nach-gesprachen-im-kreml-in-kiew-erwartet-8964e4/index.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsticker/gesprache-uber-ein-friedensabkommen-us-gesandte-in-moskau-mit-putin-zusammengekommen-ab4527/index.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsticker/witkoff-und-kushner-erstmals-in-kiew-erwartet-614acf/index.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsticker/inflationsrate-im-august-2026-voraussichtlich-2-9-322ccb/index.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsticker/verhandlungen-ukraine-krieg-putin-beginnt-gesprache-mit-us-unterhandlern-fc37e6/index.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsticker/putin-drei-tage-angriffspause-wahrend-ukraine-verhandlungen-d87e2d/index.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsticker/krieg-in-der-ukraine-trump-schickt-mal-wieder-seinen-schwiegersohn-6d9511/index.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsticker/us-gesandte-kushner-und-witkoff-zu-gesprachen-uber-ukraine-krieg-in-moskau-815007/index.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsticker/ukraine-krieg-us-unterhandler-in-moskau-treffen-mit-putin-geplant-587a06/index.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsticker/analyse/dreitagige-angriffspause-auf-kyjiw-was-die-neue-vermittlungsphase-wirklich-verande-cf42f2/index.html` — novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.

## Recursive non-HTML publication/support surfaces

- Tracked support text files inventoried: **1159**
- Combined matrix items (routes + extra HTML + support): **17776**
- Every matrix item exposes the #253 contract fields: source_path, public_url, historical_publication, relevance, classification, required_action, source_refs and status.
- Includes llms.txt, sitemap/search metadata, structured-data registries, glossary/source archive, library/journal/reference inputs and generators/workflows.

| File | Role | Classification | Signals |
|---|---|---|---|
| `.github/workflows/deploy.yml` | github_pages_deployment_workflow | NO_CHANGE_REQUIRED | — |
| `.github/workflows/parliament-minimal-deployment-artifact.yml` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `assets/data/blog-index.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, evaluation |
| `assets/data/document-library.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | folgenabschaetzung, enap, dns, evaluation |
| `assets/data/document-registry 2.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, evaluation |
| `assets/data/glossar-bestand-definitionsmaster.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `assets/data/glossary-lookup.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence |
| `assets/data/glossary-model.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence |
| `assets/data/glossary-reference-index.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `assets/data/glossary-relations.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, alternativen, evaluation |
| `assets/data/journal-pdf-manifest.json` | journal_source_or_manifest | NO_CHANGE_REQUIRED | enap |
| `assets/data/library-source-details.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | evaluation |
| `assets/data/library-version-registry.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | enap, evaluation |
| `assets/data/podcast-index.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind |
| `assets/data/public-pdf-downloads.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | evaluation |
| `assets/data/public-release-assets.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | evaluation |
| `assets/data/publication-abstracts.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | evaluation |
| `assets/data/sdg-reference.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | folgenabschaetzung, dns |
| `assets/data/stranded-assets-parameter.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `assets/data/wirkungsradar-attention-traps.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `assets/data/wirkungsradar-backlog.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `assets/data/wirkungsradar-distribution-packs.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `assets/data/wirkungsradar-glossary.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, alternativen |
| `assets/data/wirkungsradar-link-map.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `assets/data/wirkungsradar-resonance-cards.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `assets/data/wirkungsradar-source-packs.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `assets/data/wirkungsradar-source-registry.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | alternativen, novelty_or_absence |
| `assets/data/woek-id-register.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen |
| `assets/search/search-associations.json` | search_index_or_generator | ADD_SOURCE_LINKS | wirkungsblind, folgenabschaetzung |
| `assets/search/search-curated-entrypoints.json` | search_index_or_generator | NO_CHANGE_REQUIRED | wirkungsblind |
| `assets/search/search-dictionary.json` | search_index_or_generator | NO_CHANGE_REQUIRED | wirkungsblind, alternativen |
| `assets/search/search-index.json` | search_index_or_generator | NO_CHANGE_REQUIRED | — |
| `content/academy/academy-v4-main-domain-projection.json` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, dns, evaluation |
| `content/academy/woek-g-curriculum-v4.json` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/assistant/approved-corpus.json` | support_text | ADD_SOURCE_LINKS | enap |
| `content/audits/nwi-acronym-disambiguation.json` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung |
| `content/audits/sachsen-anhalt/afd-final-union-manifest-a43.json` | support_text | ADD_SOURCE_LINKS | dns |
| `content/audits/sachsen-anhalt/bsw-final-union-relation-overlay-r20.json` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/audits/sachsen-anhalt/bsw-final-union-source-leaf-addendum-r20.json` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/audits/sachsen-anhalt/bsw-source-unit-manifest-reconciliation-r10.json` | support_text | ADD_SOURCE_LINKS | dns |
| `content/audits/sachsen-anhalt/bsw-source-unit-union-r14.json` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/audits/sachsen-anhalt/linke-final-union-manifest-c26.json` | support_text | ADD_SOURCE_LINKS | dns |
| `content/audits/state-sustainability-architecture-audit-contract.md` | support_text | ADD_SOURCE_LINKS | enap, egfa, dns, alternativen, evaluation |
| `content/dashboards/dashboardModels.json` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/documents/documents.json` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, enap, dns, evaluation |
| `content/glossar/glossary-registry.ts` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/glossary/imports/begriffsleitfaden-v1.5.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | evaluation |
| `content/glossary/imports/curated-crosslinks.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | wirkungsblind, alternativen |
| `content/glossary/imports/formalisierte-leistungsbegriffe.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | evaluation |
| `content/glossary/imports/gesamtstudie-wirkungsdilemmata-kooperation-sdgplus-crosslinks.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/gesamtstudie-wirkungsdilemmata-kooperation-sdgplus-term-definitions.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | alternativen |
| `content/glossary/imports/impact-controlling-rechenlogiken.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | novelty_or_absence |
| `content/glossary/imports/iooi-wirkungsarchitektur.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | alternativen, evaluation |
| `content/glossary/imports/katechon.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/klimaanpassungsmanagement.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/legacy-detail-definitions.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | alternativen |
| `content/glossary/imports/maga-diskursformeln.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/nwi-disambiguation.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/phineo-wirkungslogik.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/psychologie-und-kommunikation-definitionen.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | alternativen |
| `content/glossary/imports/recht-wirtschaft-innovation-klima.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | wirkungsblind |
| `content/glossary/imports/rechtsgrundlagen-primarquellen.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/resignifikation.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/site-review-2026-09-05.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/staatliche-nachhaltigkeitsarchitektur.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/glossary/imports/terminologie-leitplanken.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | evaluation |
| `content/glossary/imports/terminologische-korrekturen.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/value-pricing-und-wirkungsbasiertes-value-pricing.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/website-2-0-glossar-nachtraege.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | wirkungsblind, folgenabschaetzung, evaluation |
| `content/glossary/imports/wirkungsabwehr-dissonanzrationalisierung.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | wirkungsblind |
| `content/glossary/imports/wirkungsfinanzpolitik-begriffe-v0-1.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | wirkungsblind, evaluation, novelty_or_absence |
| `content/glossary/imports/wirkungsfinanzpolitik-term-definitions.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | wirkungsblind |
| `content/glossary/imports/wirkungsgrad-differenzierung.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/wirkungssteuer-wstg-v3.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | evaluation |
| `content/glossary/imports/woems-woemm-2.0.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | folgenabschaetzung, alternativen, evaluation |
| `content/glossary/terms.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | wirkungsblind, folgenabschaetzung, alternativen, evaluation |
| `content/institut/projects.json` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, evaluation |
| `content/kompass/compass-answer-templates.json` | support_text | NO_CHANGE_REQUIRED | wirkungsblind, alternativen |
| `content/methodik/data-sources.json` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/methods/woems-canvas.json` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, alternativen, evaluation |
| `content/methods/woems-methoden.json` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, alternativen, evaluation |
| `content/news/media-registry.json` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/news/reviews/sachsen-anhalt-kandidatur-2026-09-05.json` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/news/reviews/seelze-media-2026-09-06.json` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/podcast/wie-misst-man-etwas-das-man-nicht-sieht.txt` | support_text | CORRECT_OVERCLAIM | novelty_or_absence |
| `content/podcast/wirkung-ist-nicht-absicht.txt` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/podcast/zwei-aepfel-ein-preis.txt` | support_text | NO_CHANGE_REQUIRED | wirkungsblind, alternativen |
| `content/quellenarchiv/glossary-source-records.json` | source_archive_source_or_generator | NO_CHANGE_REQUIRED | evaluation |
| `content/quellenarchiv/legal-source-records.json` | source_archive_source_or_generator | ADD_DNS_REFERENCE, ADD_GGO_GFA_REFERENCE, ADD_ENAP_REFERENCE, ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/quellenarchiv/publication-supplements/gesamtstudie-wirkungsdilemmata-kooperation-sdgplus.json` | source_archive_source_or_generator | NO_CHANGE_REQUIRED | alternativen |
| `content/quellenarchiv/publication-supplements/wirkungsbasiertes-value-pricing-v1.2.json` | source_archive_source_or_generator | NO_CHANGE_REQUIRED | evaluation |
| `content/quellenarchiv/sources.json` | source_archive_source_or_generator | CORRECT_OVERCLAIM | wirkungsblind, folgenabschaetzung, dns, alternativen, evaluation, novelty_or_absence |
| `content/site/fragment-aliases.json` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/site/home-explainer.json` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/site/impact-controlling-course.json` | support_text | CORRECT_OVERCLAIM | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence |
| `content/site/methodik.json` | support_text | ADD_SOURCE_LINKS | enap, egfa, dns, alternativen, evaluation |
| `content/site/reference-update.json` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/sources/alternative-models-revival-monitor.json` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/sources/bibliography.json` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/sources/evidence-source-registry.json` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/sources/external-source-registry.json` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/sources/external-source-registry.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/sources/source-categories.yml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/sources/source-to-woek-mapping.json` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-d1.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-d2.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-d3.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-schuetzen-buerger-db-v2.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-schuetzen-buerger-db-v3.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-schuetzen-buerger-db-v4.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-schuetzen-buerger-db-v5.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-schuetzen-buerger-db-v6.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-schuetzen-buerger-db-v8.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-schuetzen-buerger-db-v9.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-schuetzen-medien-moderation-dm-v11.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-schuetzen-medien-moderation-dm-v3.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-schuetzen-medien-moderation-dm-v6.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/demokratie-schuetzen-medien-moderation-dm-v8.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/multiplikatoren-mv2.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/multiplikatoren-mv3.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/multiplikatoren-mv4.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/multiplikatoren-mv5.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/multiplikatoren-mv6.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/multiplikatoren-mv7.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/PUBLIC_MASTER_MANIFEST.json` | support_text | ADD_SOURCE_LINKS | enap, egfa, dns, evaluation |
| `content/studienskripte/v4/angebote/demokratie-buerger/db-v4-01-rechte-regeln-korrekturfaehigkeit.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/angebote/demokratie-buerger/db-v4-02-wirkungsraeume-schutzgueter-vertrauen.md` | support_text | ADD_SOURCE_LINKS | dns, alternativen |
| `content/studienskripte/v4/angebote/demokratie-buerger/db-v4-04-narrative-deutungsrahmen.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/angebote/demokratie-buerger/db-v4-05-framing-wiederholung-korrektur.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/angebote/demokratie-buerger/db-v4-06-emotion-reaktanz-identitaet.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/angebote/demokratie-buerger/db-v4-07-plattformen-desinformation-synthetische-medien.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/demokratie-buerger/db-v4-08-antworten-grenzen-sicherheit.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/demokratie-buerger/db-v4-09-gespraeche-unter-konflikt.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/demokratie-buerger/db-v4-10-zivilcourage-teilhabe.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/demokratie-buerger/db-v4-11-persoenlicher-resilienz-reality-check-plan.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/demokratie-medien/dm-v4-01-grundlage-wirkung-demokratie-referenzen.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/demokratie-medien/dm-v4-02-oeffentlichkeit-demokratische-infrastruktur.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/angebote/demokratie-medien/dm-v4-03-reichweite-wiederholung-verteilung.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/demokratie-medien/dm-v4-04-moderation-live-druck.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/angebote/demokratie-medien/dm-v4-05-kommunikationsmuster-ohne-personenrating.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/angebote/demokratie-medien/dm-v4-06-frames-reframes-optionen.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/angebote/demokratie-medien/dm-v4-07-hart-fragen-verifizieren-verstaerkung.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/angebote/demokratie-medien/dm-v4-08-bild-ton-schnitt-ki-provenienz.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/demokratie-medien/dm-v4-09-wuerde-minderheitenschutz-grenzen.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/angebote/demokratie-medien/dm-v4-10-quellenklarheit-versionierung-korrektur.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/demokratie-medien/dm-v4-11-krisenkommunikation-desinformation-hybride-lagen.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/demokratie-medien/dm-v4-12-redaktionsprotokoll-reality-check.md` | support_text | CORRECT_OVERCLAIM | alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/v4/angebote/grundlagen/g-v4-01-wirkung-statt-nur-aktivitaet.md` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/grundlagen/g-v4-02-problem-ziel-wirkpfad.md` | support_text | CORRECT_OVERCLAIM | alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/v4/angebote/grundlagen/g-v4-03-referenzrahmen.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/grundlagen/g-v4-04-evidenz-indikatoren-zurechnung.md` | support_text | ADD_SOURCE_LINKS | dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/grundlagen/g-v4-05-nettowirkung-schutzgrenzen.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/angebote/grundlagen/g-v4-06-optionen-steuerung-instrumente.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/grundlagen/g-v4-07-reality-check-grenzen.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/multiplikatoren/mult-v4-01-woek-in-20-sekunden-ohne-strohmann.md` | support_text | CORRECT_OVERCLAIM | folgenabschaetzung, nachhaltigkeitspruefung, dns, evaluation, novelty_or_absence |
| `content/studienskripte/v4/angebote/multiplikatoren/mult-v4-02-wirkungsvokabular-sicher-erklaeren.md` | support_text | ADD_SOURCE_LINKS | dns, evaluation |
| `content/studienskripte/v4/angebote/multiplikatoren/mult-v4-03-vom-problem-zur-entscheidung.md` | support_text | ADD_SOURCE_LINKS | dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/multiplikatoren/mult-v4-04-didaktik-20-sekunden-2-minuten-tiefe.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/multiplikatoren/mult-v4-05-ehrliche-wirkungskommunikation.md` | support_text | ADD_SOURCE_LINKS | dns, evaluation |
| `content/studienskripte/v4/angebote/multiplikatoren/mult-v4-06-medien-narrative-demokratische-resilienz.md` | support_text | ADD_SOURCE_LINKS | dns, evaluation |
| `content/studienskripte/v4/angebote/multiplikatoren/mult-v4-07-rolle-ethik-autorisierung.md` | support_text | ADD_SOURCE_LINKS | dns, evaluation |
| `content/studienskripte/v4/angebote/multiplikatoren/mult-v4-08-integrierte-fallarbeit-und-pruefung.md` | support_text | ADD_SOURCE_LINKS | dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/wirkungscontrolling/01-vom-kpi-zur-wirkungsbeobachtung.md` | support_text | CORRECT_OVERCLAIM | alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/v4/angebote/wirkungscontrolling/02-datenwelten-und-quellenfunktionen.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/wirkungscontrolling/03-masterregister-wirkindikatorenregister-provenienz.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/wirkungscontrolling/04-scorecards-als-wirkungsprofile.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/wirkungscontrolling/05-nichtkompensation-schutzgrenzen-rmo.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/wirkungscontrolling/06-monitoring-gegenfaktum-attribution-reality-check.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/angebote/wirkungscontrolling/07-nettowirkung-transformation-investitionseffizienz.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/wirkungscontrolling/08-controlling-in-capex-opex-portfolio-einkauf.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/wirkungscontrolling/09-audit-assurance-und-gaming-schutz.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/wirkungscontrolling/10-integrierter-abschlussfall-und-lernschleife.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/wirkungsmanagement/wm-v4-01-systemkontext.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/wirkungsmanagement/wm-v4-02-problem-baseline-empfaenger.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/angebote/wirkungsmanagement/wm-v4-03-ziele-referenzen.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/wirkungsmanagement/wm-v4-04-wirkpfade-kausalannahmen.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/angebote/wirkungsmanagement/wm-v4-05-materialitaet-potenziale-risiken.md` | support_text | CORRECT_OVERCLAIM | evaluation, novelty_or_absence |
| `content/studienskripte/v4/angebote/wirkungsmanagement/wm-v4-06-schutzgrenzen-nichtkompensation.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/angebote/wirkungsmanagement/wm-v4-07-optionen-delivery-coherence.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/angebote/wirkungsmanagement/wm-v4-08-strategie-entscheidungsarchitektur.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/angebote/wirkungsmanagement/wm-v4-09-wirkungskommunikation.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/angebote/wirkungsmanagement/wm-v4-10-reality-check-90-tage.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v01-die-massstabskrise.md` | support_text | CORRECT_OVERCLAIM | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, evaluation, novelty_or_absence |
| `content/studienskripte/v4/grundstudium/base/v02-wirkung-statt-kapital.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v03-anschluss-und-steuerungsarchitektur.md` | support_text | CORRECT_OVERCLAIM | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/v4/grundstudium/base/v04-erfolgsgroessen-unvollstaendig.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v05-wirkleistung-scheinleistung-blindleistung-verlustleistung.md` | support_text | CORRECT_OVERCLAIM | alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/v4/grundstudium/base/v06-zukunftsfaehigkeit-risiko-resilienz.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v07-mensch-als-wirkungsdimension.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v08-planet-als-wirkungsdimension.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v09-demokratie-als-wirkungsdimension.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v10-wirkung-ist-nicht-absicht.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v100-praxisprojekt-indikatoren-datenquellen-ids.md` | support_text | ADD_SOURCE_LINKS | dns, evaluation |
| `content/studienskripte/v4/grundstudium/base/v101-praxisprojekt-scorecard-und-optionsvergleich.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v102-praxisprojekt-risiko-resilienz-transformation.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v103-praxisprojekt-unsicherheit-kritik.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v104-praxisprojekt-soziale-tragfaehigkeit-missbrauchsschutz.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v105-praxisprojekt-iteration-umsetzungsplan.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v106-praxisprojekt-wirkungsdossier-schreiben.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v107-praxisprojekt-praesentation-verteidigung.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v108-transferplan-persoenliche-wirkungskompetenz.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, evaluation |
| `content/studienskripte/v4/grundstudium/base/v11-positive-negative-ambivalente-wirkung.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v13-problem-review.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v14-goal-review.md` | support_text | ADD_SOURCE_LINKS | dns, alternativen |
| `content/studienskripte/v4/grundstudium/base/v15-wirkpfad-evidenz-attribution.md` | support_text | ADD_SOURCE_LINKS | dns, evaluation |
| `content/studienskripte/v4/grundstudium/base/v16-maerkte-produkte-lieferketten-wirkungsraeume.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v17-medien-sprache-oeffentlichkeit-wirkungsraeume.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v18-zeit-generationen-unsichtbare-betroffene.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v19-wirkstoff-analogie-mechanismus-potenzial.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v20-gesellschaftliche-resonanzfaktoren.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v21-produkte-technologien-institutionen-als-ausloeser.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v22-wirkungssprache-und-quellenklarheit.md` | support_text | CORRECT_OVERCLAIM | nachhaltigkeitspruefung, enap, dns, alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/v4/grundstudium/base/v23-unsicherheit-ambivalenz-transparente-bewertung.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v24-deeskalierende-demokratiestaerkende-kommunikation.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v25-agenda2030-und-sdgs.md` | support_text | ADD_SOURCE_LINKS | dns, alternativen |
| `content/studienskripte/v4/grundstudium/base/v27-referenzebenen-recht-schutzgrenzen.md` | support_text | ADD_SOURCE_LINKS | dns, alternativen |
| `content/studienskripte/v4/grundstudium/base/v28-datenwelten-reporting-staat-indikatoren.md` | support_text | ADD_SOURCE_LINKS | enap, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v29-masterregister-wirkindikatorenregister.md` | support_text | CORRECT_OVERCLAIM | dns, novelty_or_absence |
| `content/studienskripte/v4/grundstudium/base/v30-datenqualitaet-provenienz-unsicherheit.md` | support_text | ADD_SOURCE_LINKS | dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v31-aggregation-und-nettowirkung.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v32-scorecards-bewertungsprofile.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v33-nwi-vs-t-sroi.md` | support_text | ADD_SOURCE_LINKS | dns, evaluation |
| `content/studienskripte/v4/grundstudium/base/v34-reverse-merit-order.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v35-nichtkompensation.md` | support_text | CORRECT_OVERCLAIM | alternativen, novelty_or_absence |
| `content/studienskripte/v4/grundstudium/base/v37-externalitaeten-und-versteckte-folgekosten.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v38-preis-als-wirkungssignal.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v39-verbraucherinformation-soziale-abfederung.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v40-wirkungssteuergesetz-als-policy-modell.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v41-wirkungssteuer-rate-design.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v42-lieferketten-importwirkung-und-grenzausgleich.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung |
| `content/studienskripte/v4/grundstudium/base/v43-oeffentliche-haushalte-wirkungsorientiert-lesen.md` | support_text | ADD_SOURCE_LINKS | wirkungsblind, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v44-oeffentliche-beschaffung-transformationshebel.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v45-wirkungsberichte-evaluation-reality-check.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v47-t-sroi-investitionscontrolling.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v49-wirkungswohlstand.md` | support_text | CORRECT_OVERCLAIM | dns, novelty_or_absence |
| `content/studienskripte/v4/grundstudium/base/v52-wirkungseinkommen-policy-modell.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v53-wirkungsrente-generationengerechte-sicherung.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v55-wirkungsfinanzpolitik-policy-architektur.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v57-wirkungsindikatoren-volkswirtschaften.md` | support_text | ADD_SOURCE_LINKS | dns, evaluation |
| `content/studienskripte/v4/grundstudium/base/v58-wachstum-suffizienz-wohlstand.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v59-verteilungsgerechtigkeit-soziale-tragfaehigkeit.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v60-messgrenzen-und-monetarisierung.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v61-resilienz-grundbegriffe.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v63-kipppunkte-schwellen-irreversible-schaeden.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v65-lieferkettenresilienz-abhaengigkeitsrisiken.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v66-versorgungssicherheit-als-wirkungswert.md` | support_text | CORRECT_OVERCLAIM | alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/v4/grundstudium/base/v67-resilienz-in-scorecards.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v68-praeventionswert-und-krisen-bip.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v69-stresstests-fruehwarnung-wirkungsradar.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v70-oeffentlichkeit-als-infrastruktur.md` | support_text | CORRECT_OVERCLAIM | novelty_or_absence |
| `content/studienskripte/v4/grundstudium/base/v71-angriffe-auf-rueckkopplung.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v72-civic-shield-resilienzdesign.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v73-produkte-als-wirkungstraeger.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v75-digitale-produktpaesse-wirkung-am-regal.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v76-unternehmen-als-wirkungssysteme.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v77-beschaffung-lieferantenbewertung.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v78-wirkungscontrolling-erm-boni.md` | support_text | CORRECT_OVERCLAIM | evaluation, novelty_or_absence |
| `content/studienskripte/v4/grundstudium/base/v79-gesundheit-pflege-praevention-wirkungsraeume.md` | support_text | CORRECT_OVERCLAIM | evaluation, novelty_or_absence |
| `content/studienskripte/v4/grundstudium/base/v81-wohnen-landwirtschaft-regionale-wertschoepfung.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v82-politische-programme-wirkungspotenziale.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v83-medien-plattform-scorecards.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v84-wirkung-im-alltag-ohne-moralische-ueberforderung.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v85-institutionen-und-woek-governance-vorschlaege.md` | support_text | ADD_SOURCE_LINKS | enap, dns, evaluation |
| `content/studienskripte/v4/grundstudium/base/v87-lobbyismus-gaming-und-manipulationsschutz.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v88-wirkungsdatenraeume-register.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v89-datenschutz-cyberresilienz-digitale-souveraenitaet.md` | support_text | CORRECT_OVERCLAIM | alternativen, novelty_or_absence |
| `content/studienskripte/v4/grundstudium/base/v90-ki-gestuetzte-wirkungsmodelle-grenzen.md` | support_text | ADD_SOURCE_LINKS | enap, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v91-importwirkung-grenzausgleich-cbam.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v92-globale-fairness-statt-wirkungsimperialismus.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v94-lange-wellen-kondratieff-hypothese.md` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/studienskripte/v4/grundstudium/base/v95-piloten-sandboxes-lernregulierung.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/v4/grundstudium/base/v96-wirkungsarchitektur-entwerfen.md` | support_text | ADD_SOURCE_LINKS | dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v97-praxisprojekt-wirkungsfeld-und-gegenstand.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v98-praxisprojekt-problem-review-baseline.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/base/v99-praxisprojekt-wirkungsfrage-wirkpfad.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, dns, alternativen |
| `content/studienskripte/v4/grundstudium/gov-01-von-brundtland-zu-rio.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/gov-02-agenda21-zur-deutschen-nachhaltigkeitsstrategie-2002.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/gov-03-agenda2030-zur-dns-2025.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/gov-04-dns-als-managementsystem.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/gov-05-institutionen-und-verantwortlichkeiten.md` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/gov-06-dns-indikatoren-und-monitoring.md` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/gov-07-ggo-gesetzesfolgen.md` | support_text | CORRECT_OVERCLAIM | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/v4/grundstudium/gov-08-nachhaltigkeitspruefung-und-enap.md` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/gov-09-egfa-und-e-gesetzgebung.md` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/gov-10-parlamentarische-nachhaltigkeitspruefung.md` | support_text | CORRECT_OVERCLAIM | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/v4/grundstudium/gov-11-aktionsplan-nachhaltigkeit-2026.md` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/v4/grundstudium/gov-12-enap-woek-benchmarklabor.md` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `content/studienskripte/wirkungscontrolling-wc-v1.md` | support_text | CORRECT_OVERCLAIM | evaluation, novelty_or_absence |
| `content/studienskripte/wirkungscontrolling-wc-v10.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/wirkungscontrolling-wc-v2.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/wirkungscontrolling-wc-v3.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/wirkungscontrolling-wc-v4.md` | support_text | CORRECT_OVERCLAIM | alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/wirkungscontrolling-wc-v5.md` | support_text | NO_CHANGE_REQUIRED | wirkungsblind, evaluation |
| `content/studienskripte/wirkungscontrolling-wc-v6.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/wirkungscontrolling-wc-v7.md` | support_text | CORRECT_OVERCLAIM | evaluation, novelty_or_absence |
| `content/studienskripte/wirkungscontrolling-wc-v8.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/wirkungscontrolling-wc-v9.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/wirkungsmanagement-v1.md` | support_text | CORRECT_OVERCLAIM | folgenabschaetzung, alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/wirkungsmanagement-v10.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/wirkungsmanagement-v2.md` | support_text | CORRECT_OVERCLAIM | alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/wirkungsmanagement-v3.md` | support_text | CORRECT_OVERCLAIM | evaluation, novelty_or_absence |
| `content/studienskripte/wirkungsmanagement-v4.md` | support_text | CORRECT_OVERCLAIM | evaluation, novelty_or_absence |
| `content/studienskripte/wirkungsmanagement-v5.md` | support_text | CORRECT_OVERCLAIM | folgenabschaetzung, evaluation, novelty_or_absence |
| `content/studienskripte/wirkungsmanagement-v6.md` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, evaluation |
| `content/studienskripte/wirkungsmanagement-v7.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/wirkungsmanagement-v8.md` | support_text | CORRECT_OVERCLAIM | alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/wirkungsmanagement-v9.md` | support_text | NO_CHANGE_REQUIRED | wirkungsblind, alternativen, evaluation |
| `content/studienskripte/woek-g-v01.md` | support_text | CORRECT_OVERCLAIM | evaluation, novelty_or_absence |
| `content/studienskripte/woek-g-v02.md` | support_text | CORRECT_OVERCLAIM | evaluation, novelty_or_absence |
| `content/studienskripte/woek-g-v03.md` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, alternativen, evaluation |
| `content/studienskripte/woek-g-v04.md` | support_text | CORRECT_OVERCLAIM | alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/woek-g-v05.md` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, alternativen, evaluation |
| `content/studienskripte/woek-g-v06.md` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, alternativen, evaluation |
| `content/studienskripte/woek-g-v07.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v08.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v09.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v10.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v11.md` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, alternativen, evaluation |
| `content/studienskripte/woek-g-v12.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v13.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v14.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v15.md` | support_text | CORRECT_OVERCLAIM | folgenabschaetzung, evaluation, novelty_or_absence |
| `content/studienskripte/woek-g-v16.md` | support_text | CORRECT_OVERCLAIM | alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/woek-g-v17.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v18.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v19.md` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, alternativen, evaluation |
| `content/studienskripte/woek-g-v20.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v21.md` | support_text | CORRECT_OVERCLAIM | alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/woek-g-v22.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v23.md` | support_text | CORRECT_OVERCLAIM | folgenabschaetzung, alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/woek-g-v24.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v25.md` | support_text | ADD_SOURCE_LINKS | dns, evaluation |
| `content/studienskripte/woek-g-v26.md` | support_text | ADD_SOURCE_LINKS | dns, alternativen, evaluation |
| `content/studienskripte/woek-g-v27.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/woek-g-v28.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/woek-g-v29.md` | support_text | CORRECT_OVERCLAIM | evaluation, novelty_or_absence |
| `content/studienskripte/woek-g-v30.md` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/studienskripte/woek-g-v31.md` | support_text | CORRECT_OVERCLAIM | wirkungsblind, alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/woek-g-v32.md` | support_text | CORRECT_OVERCLAIM | alternativen, evaluation, novelty_or_absence |
| `content/studienskripte/woek-g-v33.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v34.md` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/studienskripte/woek-g-v35.md` | support_text | NO_CHANGE_REQUIRED | wirkungsblind, evaluation |
| `content/studienskripte/woek-g-v36.md` | support_text | CORRECT_OVERCLAIM | alternativen, evaluation, novelty_or_absence |
| `content/taxonomy/site-map.json` | support_text | CORRECT_OVERCLAIM | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence |
| `content/visuals/visual-source-registry.json` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/visuals/woek_visual_assets_manifest.json` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/wirkungsradar/climate-energy.yml` | support_text | NO_CHANGE_REQUIRED | wirkungsblind, alternativen |
| `content/wirkungsradar/debattenkarten-master.json` | support_text | CORRECT_OVERCLAIM | wirkungsblind, folgenabschaetzung, alternativen, evaluation, novelty_or_absence |
| `content/wirkungsradar/imports/wirkungsabwehr-dissonanzrationalisierung.json` | support_text | NO_CHANGE_REQUIRED | wirkungsblind |
| `content/wirkungsradar/link-map.ts` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/narratives.yml` | support_text | CORRECT_OVERCLAIM | wirkungsblind, alternativen, novelty_or_absence |
| `content/wirkungsradar/psychology/debiasing-playbook-v1.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/psychology/manipulation-patterns-v1.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/psychology/psychology-effects-v1.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/arbeit-lohnt-sich-nicht-mehr.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/climate-energy-v1.yaml` | support_text | CORRECT_OVERCLAIM | alternativen, novelty_or_absence |
| `content/wirkungsradar/source-packs/co2-preis-oder-fossile-systemkosten.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/deep-dive-climate-energy-v1.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/deutschland-nur-zwei-prozent.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/e-autos-schlimmer-als-verbrenner.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/e-fuels-retten-den-verbrenner.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/e-fuels-transport-v1.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/fusion-loest-das-energieproblem.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/kernenergie-wieder-in-deutschland.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/migration-kostet-nur.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/radwege-in-peru.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/schulden-machen-oder-sparen.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/ukraine-unterstuetzung-steuergeld.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/wasserstoff-fuer-alles.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/wind-energy-nature-v1.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/source-packs/windraeder-voegel-wald-beton-rueckbau.yaml` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/wirkungsradar/sources/source-registry.ts` | support_text | CORRECT_OVERCLAIM | alternativen, novelty_or_absence |
| `content/wirkungsradar/wirkungschecks.yml` | support_text | NO_CHANGE_REQUIRED | wirkungsblind |
| `content/wirkungswahl-kompass/real-content.json` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/wirkungswissenschaften/dossier.md` | support_text | CORRECT_OVERCLAIM | wirkungsblind, folgenabschaetzung, alternativen, evaluation, novelty_or_absence |
| `content/wirkungswissenschaften/journal.md` | journal_source_or_manifest | CORRECT_OVERCLAIM | wirkungsblind, folgenabschaetzung, alternativen, evaluation, novelty_or_absence |
| `content/wissen/wissenskarten.json` | support_text | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `content/wissen/wissensseite-template.md` | support_text | NO_CHANGE_REQUIRED | wirkungsblind |
| `content/woek-register/changelog.json` | support_text | ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns |
| `content/woek-register/sources.json` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen |
| `llms.txt` | machine_readable_reference | ADD_STATE_SUSTAINABILITY_ARCHITECTURE, ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, evaluation |
| `package.json` | support_text | NO_CHANGE_REQUIRED | — |
| `public/data/en-asset-text-inventory.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | evaluation |
| `public/data/en-document-translation-manifest.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, evaluation, novelty_or_absence |
| `public/data/glossary-detail-quality-audit.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, alternativen, evaluation |
| `public/data/glossary-extract.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind |
| `public/data/glossary-reference-index.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `public/data/glossary-term-links.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `public/data/glossary-version-history.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, enap, egfa, dns, alternativen, evaluation |
| `public/data/public-pdf-downloads.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | evaluation |
| `public/data/relationship-manifest.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, alternativen, evaluation |
| `public/data/site-updates.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | folgenabschaetzung, enap, dns |
| `public/data/tool-examples.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | evaluation |
| `public/data/tool-landscape-2-0.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | novelty_or_absence |
| `public/data/woek-g-curriculum.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `public/data/woek-search-meta.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | — |
| `public/data/woems-canvas.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | folgenabschaetzung, alternativen, evaluation |
| `public/data/woems-methoden.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | folgenabschaetzung, evaluation |
| `scripts/academy/build-v4-main-domain.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/api/build-core-api-manifest.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/audit-documents-for-publication.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, enap, dns, evaluation |
| `scripts/audit-tool-dashboards.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/content/apply-maiwald-principle.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind |
| `scripts/feeds/build-rss-feeds.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/glossary/build-glossary-pages.mjs` | glossary_source_or_generator | NO_CHANGE_REQUIRED | wirkungsblind, alternativen, evaluation, novelty_or_absence |
| `scripts/glossary/build-glossary-registry.mjs` | glossary_source_or_generator | NO_CHANGE_REQUIRED | wirkungsblind |
| `scripts/glossary/check-glossary-publication-quality.mjs` | glossary_source_or_generator | NO_CHANGE_REQUIRED | novelty_or_absence |
| `scripts/glossary/check-legal-source-coverage.mjs` | glossary_source_or_generator | NO_CHANGE_REQUIRED | wirkungsblind, enap, egfa, dns |
| `scripts/import/build-public-impact-room-dossier.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind |
| `scripts/import/import-2026-08-20-journal-batch.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, alternativen |
| `scripts/import/import-das-bessere-spiel-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/import/import-kollaps-systemresilienz-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/import/import-politik-folgen-wirkungsportal-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | folgenabschaetzung, alternativen |
| `scripts/import/import-sondervermoegen-svik-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/import/import-stille-neubewertung-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/import/import-stranded-germany-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/import/import-tv-duell-wirkungsoekonomische-systemanalyse.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, nachhaltigkeitspruefung, enap, alternativen |
| `scripts/import/import-verbrenner-risikomanagement-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/import/import-wahlomat-methodenkritik-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/import/import-wahlomat-sachsen-anhalt-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/import/import-wirkungsfinanzpolitik-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, alternativen, evaluation |
| `scripts/import/import-wissensgesellschaft-wirkungsgesellschaft.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/journal/publish-lohnkosten-besser-werden.mjs` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/journal/publish-wirkstoff-narrative.mjs` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/lib/impact-course.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/lib/method-version-indexability.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind, enap, dns |
| `scripts/methods/import-woems-source.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | folgenabschaetzung |
| `scripts/natalie/build-natalie-pages.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/news/backfill-source-summaries.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | novelty_or_absence |
| `scripts/news/build.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `scripts/news/editorial-analysis.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | enap, dns |
| `scripts/news/lib.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | dns, evaluation |
| `scripts/news/media-impact.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/news/newsroom.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/news/run.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/news/source-pages.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/news/title-image/image-file.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | dns |
| `scripts/news/visuals.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/podcast/build-podcast-pages.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind |
| `scripts/polls/visual.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | dns |
| `scripts/portal/apply-political-implementation-standard.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, evaluation |
| `scripts/portal/build-business-enterprise.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-detail-concept-corrections.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-education-effect-school.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-finance-capital.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-go3-sdg-reference-v1.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | dns, evaluation |
| `scripts/portal/build-health-care.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-housing-city.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-impact-controlling.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, enap, dns, evaluation, novelty_or_absence |
| `scripts/portal/build-media-public-sphere.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `scripts/portal/build-pension-social-security.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-portal-architecture.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen, evaluation, novelty_or_absence |
| `scripts/portal/build-product-taxation.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-rang17-digitalization.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-rang18-science.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-rang19-international-order.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-rang20-transformation.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-rang21-critique-protection.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-rang22-future-prosperity.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-rang23-academy-library.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-science-innovation-digitalization.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-sdg-reference.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, dns, evaluation |
| `scripts/portal/build-state-law-democracy.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `scripts/portal/build-work-income-automation.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/publications/build-begriffsleitfaden-v1.6.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | nachhaltigkeitspruefung, dns, evaluation |
| `scripts/publications/build-begriffsleitfaden-v1.7.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | nachhaltigkeitspruefung, enap, dns, evaluation |
| `scripts/publications/build-learning-editions.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/publications/build-site-review-pdfs.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | enap |
| `scripts/quality/apply-stage13-usability-a11y-seo.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind |
| `scripts/quality/check-state-sustainability-architecture.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, evaluation |
| `scripts/quellenarchiv/check-quellenarchiv-quality.mjs` | source_archive_source_or_generator | NO_CHANGE_REQUIRED | novelty_or_absence |
| `scripts/reference/enhance-reference-ux.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind, evaluation |
| `scripts/register/build-masterregister-v1.5.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | nachhaltigkeitspruefung, enap, egfa, dns, evaluation |
| `scripts/site/apply-2-0-final-consolidation.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind |
| `scripts/site/apply-website-architecture-v21.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/site/build-home-explainer.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `scripts/site/build-institut-teaser.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/site/build-iooi-wirkungsarchitektur.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `scripts/site/build-parlament-info.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/site/build-reference-update.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | enap |
| `scripts/site/build-so-wirkt-wirkungsoekonomie.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind |
| `scripts/sources/check-evidence-source-archive-links.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/studienskripte/apply-v33-rechenstandard.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/studienskripte/deepen-sprint2.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/studienskripte/generate-rohfassungen.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/tools/build-woek-id-register-public-explorer.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | nachhaltigkeitspruefung, enap, egfa, dns |
| `scripts/wirkungsradar/apply-debate-compass-unified-template.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/wirkungsradar/apply-debate-compass-use-order.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/wirkungsradar/apply-master-debattenkarten.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `scripts/wirkungsradar/audit-debattenkompass-quality.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/wirkungsradar/build-climate-energy-cluster.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind, alternativen, novelty_or_absence |
| `scripts/wirkungsradar/build-debt-investment-cluster.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation, novelty_or_absence |
| `scripts/wirkungsradar/build-democracy-public-sphere-cluster.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind, alternativen, novelty_or_absence |
| `scripts/wirkungsradar/build-narrative-library.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind, alternativen, novelty_or_absence |
| `scripts/wirkungsradar/build-open-radar-packages.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/wirkungsradar/build-psychology-library.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/wirkungsradar/build-resonance-compass.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen, novelty_or_absence |
| `scripts/wirkungsradar/build-sprint3-ux.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/wirkungsradar/build-sprint4-trust.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen, novelty_or_absence |
| `scripts/wirkungsradar/build-tax-money-global-responsibility-cluster.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `scripts/wirkungsradar/import-corona-debattenkarte.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/wirkungswissenschaften/build-wirkungswissenschaften-hub.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `scripts/wirkungswissenschaften/build-wiwi-publications.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `sitemap.xml` | sitemap | NO_CHANGE_REQUIRED | wirkungsblind, enap, dns, alternativen, evaluation, novelty_or_absence |
| `tools/apply_state_sustainability_architecture.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `tools/apply_state_sustainability_precision.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `tools/apply_state_sustainability_public_precision.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, nachhaltigkeitspruefung, enap, dns |
| `tools/apply_state_sustainability_sources.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen |
| `tools/apply_state_sustainability_wiwi_generator.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `tools/audit_state_sustainability_architecture.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind, enap, egfa, dns, alternativen, evaluation, novelty_or_absence |
| `tools/audit_state_sustainability_architecture_fast.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind, alternativen, evaluation |
| `tools/audit_state_sustainability_support_files.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | enap, egfa, dns |
| `tools/build-berlin-bsw-p64-p66-handoff.mjs` | quality_or_projection_tool | NO_CHANGE_REQUIRED | evaluation |
| `tools/build_issue_284_root_rescue_archive.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | dns |
| `tools/build_nested_institut_rescue_archive.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | dns |
| `tools/build_woek_document_inventory.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind |
| `tools/check_state_sustainability_architecture.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `tools/finalize_st_cdu_convergence.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | dns |
| `tools/finalize_state_sustainability_matrix.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, enap, egfa, dns, alternativen, novelty_or_absence |
| `tools/generate_fuer_pages.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, evaluation, novelty_or_absence |
| `tools/generate_sprint1_visuals.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | evaluation |
| `tools/generate_visual_phase_assets.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | evaluation |
| `tools/manifest_vercel_build_output.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | evaluation |
| `tools/validate_afd_final_union_a43.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | dns |
| `tools/validate_berlin_current_source_register.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | dns |
| `tools/validate_linke_final_union_c26.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | dns |
| `tools/validate_mv_current_source_register.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | dns |
| `tools/validate_parliament_github_golden_state.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | dns |
| `tools/validate_parliament_issue_241_residual.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | dns |
| `tools/validate_spd_final_active_leaf_c01i.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | dns |
| `tools/validate_st_six_party_terminal_release.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | dns, alternativen |
| `tools/validate_state_official_source_adapters.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | dns |

## Review/action closure

- Combined reviewed items: **17777**
- Open semantic/action reviews after deterministic projection: **0**
- Broad novelty/Wirkungsblindheit hits were dispositioned by a second-pass contextual state-absence review; isolated words are not treated as absence claims.
- `AGENTS.md` is explicitly inventoried as a corrected current guardrail.
