# #253 State sustainability architecture URL/file audit

- Sitemap routes: **2052**
- Sitemap routes without directly resolved source HTML: **0**
- Extra tracked source HTML not in sitemap: **14202**
- Routes with non-default #253 action: **1428**
- Routes with Wirkungsblindheit/novelty/absence claim signals: **75**

Contract fields on every matrix item: `source_path`, `public_url`, `historical_publication`, `relevance`, `classification`, `required_action`, `source_refs`, `status`.

## Routes requiring explicit #253 action

| Route | File | Classification | Signals |
|---|---|---|---|
| https://wirkungsoekonomie.de/ | `index.html` | CORRECT_OVERCLAIM, ADD_STATE_SUSTAINABILITY_ARCHITECTURE, ADD_SOURCE_LINKS | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/verstehen.html | `verstehen.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | dns, alternativen |
| https://wirkungsoekonomie.de/wirkungsoekonomie.html | `wirkungsoekonomie.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | dns |
| https://wirkungsoekonomie.de/modell.html | `modell.html` | CORRECT_OVERCLAIM, ADD_DNS_REFERENCE, ADD_GGO_GFA_REFERENCE | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/kompass.html | `kompass.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | nachhaltigkeitspruefung |
| https://wirkungsoekonomie.de/fuer/politik.html | `fuer/politik.html` | REWRITE_REQUIRED, ADD_GGO_GFA_REFERENCE, ADD_ENAP_REFERENCE, ADD_DNS_REFERENCE | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/evidenz/ | `evidenz/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/methodik/ | `methodik/index.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/methodik/datenbasis.html | `methodik/datenbasis.html` | ADD_DNS_REFERENCE, ADD_GGO_GFA_REFERENCE, ADD_ENAP_REFERENCE, ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/methodik/daten-standards-regularien.html | `methodik/daten-standards-regularien.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/methodik/externe-quellen.html | `methodik/externe-quellen.html` | ADD_DNS_REFERENCE, ADD_GGO_GFA_REFERENCE, ADD_ENAP_REFERENCE, ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
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
| https://wirkungsoekonomie.de/begriffe/wirkungsschule/ | `begriffe/wirkungsschule/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungspaedagogik/ | `begriffe/wirkungspaedagogik/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/social-taxonomy/ | `begriffe/social-taxonomy/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/verstehen/woek-auf-einer-seite/ | `verstehen/woek-auf-einer-seite/index.html` | ADD_STATE_SUSTAINABILITY_ARCHITECTURE | wirkungsblind, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/ | `begriffe/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/demokratische-gegenwirkung/ | `begriffe/demokratische-gegenwirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/bibliothek/wirkungsdilemmata-kooperation-sdgplus-gesamtstudie/ | `bibliothek/wirkungsdilemmata-kooperation-sdgplus-gesamtstudie/index.html` | REVIEW_REQUIRED | wirkungsblind, folgenabschaetzung, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/value-based-pricing/ | `begriffe/value-based-pricing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsbasiertes-value-pricing/ | `begriffe/wirkungsbasiertes-value-pricing/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/bibliothek/wirkungssteuer-wstg-3-0/ | `bibliothek/wirkungssteuer-wstg-3-0/index.html` | REVIEW_REQUIRED | alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungssteuer/ | `begriffe/wirkungssteuer/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, evaluation |
| https://wirkungsoekonomie.de/begriffe/wirkungssteuergesetz/ | `begriffe/wirkungssteuergesetz/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind |
| https://wirkungsoekonomie.de/begriffe/wstg/ | `begriffe/wstg/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
| https://wirkungsoekonomie.de/begriffe/wirkungsnachweiskonto/ | `begriffe/wirkungsnachweiskonto/index.html` | ADD_GLOSSARY_CROSSLINKS | evaluation |
| https://wirkungsoekonomie.de/begriffe/produkt-id/ | `begriffe/produkt-id/index.html` | ADD_GLOSSARY_CROSSLINKS | — |
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
| https://wirkungsoekonomie.de/blog/nachhaltigkeit-ist-keine-parteifarbe.html | `blog/nachhaltigkeit-ist-keine-parteifarbe.html` | NO_CHANGE_REQUIRED, CURRENT_REFERENCE | folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, alternativen, evaluation, novelty_or_absence |
| https://wirkungsoekonomie.de/blog/enap-woek-benchmark-fuenf-bundesvorhaben.html | `blog/enap-woek-benchmark-fuenf-bundesvorhaben.html` | BENCHMARK_REFERENCE, ADD_BENCHMARK_COMPARISON | folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, alternativen, evaluation, novelty_or_absence |
| https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/ | `bibliothek/woek-begriffsleitfaden-fuehrend/index.html` | REVIEW_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence |
| https://wirkungsoekonomie.de/bibliothek/woek-master-items-register/ | `bibliothek/woek-master-items-register/index.html` | REVIEW_REQUIRED | nachhaltigkeitspruefung, enap, egfa, dns |
| https://wirkungsoekonomie.de/begriffe/deutsche-nachhaltigkeitsstrategie/ | `begriffe/deutsche-nachhaltigkeitsstrategie/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, dns |
| https://wirkungsoekonomie.de/begriffe/gemeinsame-geschaeftsordnung-der-bundesministerien/ | `begriffe/gemeinsame-geschaeftsordnung-der-bundesministerien/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/gesetzesfolgenabschaetzung/ | `begriffe/gesetzesfolgenabschaetzung/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| https://wirkungsoekonomie.de/begriffe/nachhaltigkeitspruefung-des-bundes/ | `begriffe/nachhaltigkeitspruefung-des-bundes/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, evaluation |
| https://wirkungsoekonomie.de/begriffe/elektronische-nachhaltigkeitspruefung/ | `begriffe/elektronische-nachhaltigkeitspruefung/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns |
| https://wirkungsoekonomie.de/begriffe/e-gesetzgebung/ | `begriffe/e-gesetzgebung/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa |
| https://wirkungsoekonomie.de/begriffe/dns-indikator/ | `begriffe/dns-indikator/index.html` | ADD_GLOSSARY_CROSSLINKS | dns |
| https://wirkungsoekonomie.de/begriffe/zielbezug-und-wirkung/ | `begriffe/zielbezug-und-wirkung/index.html` | ADD_GLOSSARY_CROSSLINKS | dns |
| https://wirkungsoekonomie.de/begriffe/ex-ante-folgenpruefung-und-reality-check/ | `begriffe/ex-ante-folgenpruefung-und-reality-check/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, evaluation |
| https://wirkungsoekonomie.de/begriffe/staatliche-nachhaltigkeitsarchitektur/ | `begriffe/staatliche-nachhaltigkeitsarchitektur/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, evaluation |
| https://wirkungsoekonomie.de/begriffe/parlamentarischer-beirat-fuer-nachhaltige-entwicklung-und-zukunftsfragen/ | `begriffe/parlamentarischer-beirat-fuer-nachhaltige-entwicklung-und-zukunftsfragen/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, dns |
| https://wirkungsoekonomie.de/begriffe/state-gfa-enap-benchmark/ | `begriffe/state-gfa-enap-benchmark/index.html` | ADD_GLOSSARY_CROSSLINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, dns |
| https://wirkungsoekonomie.de/begriffe/wirkungsblindheit/ | `begriffe/wirkungsblindheit/index.html` | ADD_GLOSSARY_CROSSLINKS | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, evaluation |
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
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-81aa4ab8c674/ | `quellenarchiv/wok-g-81aa4ab8c674/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-81d56234c08e/ | `quellenarchiv/wok-g-81d56234c08e/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-82b11ab68ffe/ | `quellenarchiv/wok-g-82b11ab68ffe/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-83ab5daaeb99/ | `quellenarchiv/wok-g-83ab5daaeb99/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-84c9d39f9a82/ | `quellenarchiv/wok-g-84c9d39f9a82/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-85d1fbad7df1/ | `quellenarchiv/wok-g-85d1fbad7df1/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-887e7a9e914a/ | `quellenarchiv/wok-g-887e7a9e914a/index.html` | ADD_SOURCE_LINKS | — |
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
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-b9137fe575cb/ | `quellenarchiv/wok-g-b9137fe575cb/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-b967325f627b/ | `quellenarchiv/wok-g-b967325f627b/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-b9b5fa7066c0/ | `quellenarchiv/wok-g-b9b5fa7066c0/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-ba850cda3c33/ | `quellenarchiv/wok-g-ba850cda3c33/index.html` | ADD_SOURCE_LINKS | — |
| https://wirkungsoekonomie.de/quellenarchiv/wok-g-bc5a1a6cbc40/ | `quellenarchiv/wok-g-bc5a1a6cbc40/index.html` | ADD_SOURCE_LINKS | — |
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
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9048/ | `quellenarchiv/wok-q-9048/index.html` | ADD_SOURCE_LINKS | enap |
| https://wirkungsoekonomie.de/quellenarchiv/wok-q-9049/ | `quellenarchiv/wok-q-9049/index.html` | ADD_SOURCE_LINKS | — |

## Claim-signal review

Signals are review candidates, not automatic errors.

- `index.html` — wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation — Qualify Wirkungsblindheit; add 'Deutschland hat bereits / WÖk ergänzt' architecture block and primary-source links.
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
- `begriffe/index.html` — wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `bibliothek/wirkungsdilemmata-kooperation-sdgplus-gesamtstudie/index.html` — wirkungsblind, folgenabschaetzung, alternativen, evaluation — Review published artefacts; add visible current-method note/erratum when materially required; never silently rewrite historical files.
- `begriffe/wirkungssteuer/index.html` — wirkungsblind, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `begriffe/wirkungssteuergesetz/index.html` — wirkungsblind — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `wirkungsfelder/produkte-konsum/wirkungsumsatzsteuer-produktwirkungssteuer/index.html` — wirkungsblind, alternativen, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/produkte-konsum/lieferketten-importlogik-wirkungsvorsteuer/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `werkzeuge/impact-controlling/methodenpapiere/woek-ids-indikatorenarchitektur/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/gesundheit-pflege/dossiers/index.html` — evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `wirkungsfelder/finanzsystem-kapital/steuer-abgabenarchitektur-kapital/index.html` — wirkungsblind, evaluation — No material #253 change identified by path rule; semantic scan still applies.
- `blog/wie-wirksam-ist-das-sondervermoegen-wirklich.html` — wirkungsblind, alternativen, evaluation, novelty_or_absence — No material #253 change identified by path rule; semantic scan still applies.
- `blog/nachhaltigkeit-ist-keine-parteifarbe.html` — folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, alternativen, evaluation, novelty_or_absence — Preserve as current source-bound reference; crosslink from relevant current pages.
- `blog/enap-woek-benchmark-fuenf-bundesvorhaben.html` — folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, alternativen, evaluation, novelty_or_absence — Use as canonical five-case calibration corpus; recheck GGO §§43/44 claims and keep public-GFA vs public-eNAP provenance explicit.
- `bibliothek/woek-begriffsleitfaden-fuehrend/index.html` — wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence — Review published artefacts; add visible current-method note/erratum when materially required; never silently rewrite historical files.
- `begriffe/wirkungsblindheit/index.html` — wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, evaluation — Crosslink canonical DNS/GFA/sustainability assessment/eNAP/eGFA/DNS-indicator and target-vs-impact terms; do not relabel established terms as WÖk inventions.
- `quellenarchiv/index.html` — wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation — Add official primary sources with function/version/status; separate public GFA documentation from public eNAP-export provenance.
- `quellenarchiv/wok-q-0465/index.html` — novelty_or_absence — Add official primary sources with function/version/status; separate public GFA documentation from public eNAP-export provenance.
- `quellenarchiv/wok-q-0843/index.html` — wirkungsblind — Add official primary sources with function/version/status; separate public GFA documentation from public eNAP-export provenance.

## Recursive non-HTML publication/support surfaces

- Tracked support text files inventoried: **757**
- Combined matrix items (routes + extra HTML + support): **17011**
- Every matrix item exposes the #253 contract fields: source_path, public_url, historical_publication, relevance, classification, required_action, source_refs and status.
- Includes llms.txt, sitemap/search metadata, structured-data registries, glossary/source archive, library/journal/reference inputs and generators/workflows.

| File | Role | Classification | Signals |
|---|---|---|---|
| `.github/workflows/deploy.yml` | github_pages_deployment_workflow | NO_CHANGE_REQUIRED | — |
| `assets/data/blog-index.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, dns, evaluation |
| `assets/data/document-library.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | folgenabschaetzung, evaluation |
| `assets/data/document-registry 2.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, evaluation |
| `assets/data/glossar-bestand-definitionsmaster.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `assets/data/glossary-lookup.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence |
| `assets/data/glossary-model.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation, novelty_or_absence |
| `assets/data/glossary-reference-index.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, alternativen, evaluation |
| `assets/data/glossary-relations.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, alternativen, evaluation |
| `assets/data/journal-pdf-manifest.json` | journal_source_or_manifest | NO_CHANGE_REQUIRED | enap |
| `assets/data/library-source-details.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | evaluation |
| `assets/data/library-version-registry.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | evaluation |
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
| `content/assistant/approved-corpus.json` | support_text | ADD_SOURCE_LINKS | enap |
| `content/audits/nwi-acronym-disambiguation.json` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung |
| `content/audits/state-sustainability-architecture-audit-contract.md` | support_text | ADD_SOURCE_LINKS | enap, egfa, dns, alternativen, evaluation |
| `content/dashboards/dashboardModels.json` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/documents/documents.json` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, evaluation |
| `content/glossar/glossary-registry.ts` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/glossary/imports/begriffsleitfaden-v1.5.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | evaluation |
| `content/glossary/imports/curated-crosslinks.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | wirkungsblind, alternativen |
| `content/glossary/imports/formalisierte-leistungsbegriffe.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | evaluation |
| `content/glossary/imports/gesamtstudie-wirkungsdilemmata-kooperation-sdgplus-crosslinks.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/gesamtstudie-wirkungsdilemmata-kooperation-sdgplus-term-definitions.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | alternativen |
| `content/glossary/imports/impact-controlling-rechenlogiken.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | novelty_or_absence |
| `content/glossary/imports/iooi-wirkungsarchitektur.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | alternativen, evaluation |
| `content/glossary/imports/legacy-detail-definitions.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | alternativen |
| `content/glossary/imports/maga-diskursformeln.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/nwi-disambiguation.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/phineo-wirkungslogik.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
| `content/glossary/imports/psychologie-und-kommunikation-definitionen.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | alternativen |
| `content/glossary/imports/recht-wirtschaft-innovation-klima.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | wirkungsblind |
| `content/glossary/imports/rechtsgrundlagen-primarquellen.json` | glossary_source_or_generator | ADD_GLOSSARY_CROSSLINKS, ADD_SOURCE_LINKS | — |
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
| `content/kompass/compass-answer-templates.json` | support_text | NO_CHANGE_REQUIRED | wirkungsblind, alternativen |
| `content/methodik/data-sources.json` | support_text | NO_CHANGE_REQUIRED | alternativen |
| `content/methods/woems-canvas.json` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, alternativen, evaluation |
| `content/methods/woems-methoden.json` | support_text | ADD_SOURCE_LINKS | folgenabschaetzung, alternativen, evaluation |
| `content/podcast/wie-misst-man-etwas-das-man-nicht-sieht.txt` | support_text | CORRECT_OVERCLAIM | novelty_or_absence |
| `content/podcast/wirkung-ist-nicht-absicht.txt` | support_text | NO_CHANGE_REQUIRED | evaluation |
| `content/podcast/zwei-aepfel-ein-preis.txt` | support_text | NO_CHANGE_REQUIRED | wirkungsblind, alternativen |
| `content/quellenarchiv/glossary-source-records.json` | source_archive_source_or_generator | NO_CHANGE_REQUIRED | evaluation |
| `content/quellenarchiv/legal-source-records.json` | source_archive_source_or_generator | ADD_DNS_REFERENCE, ADD_GGO_GFA_REFERENCE, ADD_ENAP_REFERENCE, ADD_SOURCE_LINKS | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen |
| `content/quellenarchiv/publication-supplements/gesamtstudie-wirkungsdilemmata-kooperation-sdgplus.json` | source_archive_source_or_generator | NO_CHANGE_REQUIRED | alternativen |
| `content/quellenarchiv/publication-supplements/wirkungsbasiertes-value-pricing-v1.2.json` | source_archive_source_or_generator | NO_CHANGE_REQUIRED | evaluation |
| `content/quellenarchiv/sources.json` | source_archive_source_or_generator | CORRECT_OVERCLAIM | wirkungsblind, folgenabschaetzung, dns, alternativen, evaluation, novelty_or_absence |
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
| `llms.txt` | machine_readable_reference | ADD_STATE_SUSTAINABILITY_ARCHITECTURE, ADD_SOURCE_LINKS | nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `package.json` | support_text | NO_CHANGE_REQUIRED | — |
| `public/data/en-asset-text-inventory.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | evaluation |
| `public/data/en-document-translation-manifest.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, evaluation, novelty_or_absence |
| `public/data/glossary-detail-quality-audit.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, alternativen, evaluation |
| `public/data/glossary-extract.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind |
| `public/data/glossary-reference-index.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, alternativen, evaluation |
| `public/data/glossary-term-links.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, alternativen, evaluation |
| `public/data/glossary-version-history.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, enap, egfa, dns, alternativen, evaluation |
| `public/data/public-pdf-downloads.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | evaluation |
| `public/data/relationship-manifest.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, alternativen, evaluation |
| `public/data/tool-examples.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | evaluation |
| `public/data/tool-landscape-2-0.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | novelty_or_absence |
| `public/data/woek-search-meta.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | — |
| `public/data/woems-canvas.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | folgenabschaetzung, alternativen, evaluation |
| `public/data/woems-methoden.json` | structured_data_or_manifest | NO_CHANGE_REQUIRED | folgenabschaetzung, evaluation |
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
| `scripts/import/import-verbrenner-risikomanagement-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/import/import-wahlomat-methodenkritik-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/import/import-wahlomat-sachsen-anhalt-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/import/import-wirkungsfinanzpolitik-journal.py` | journal_source_or_manifest | NO_CHANGE_REQUIRED | wirkungsblind, alternativen, evaluation |
| `scripts/import/import-wissensgesellschaft-wirkungsgesellschaft.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/journal/publish-lohnkosten-besser-werden.mjs` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/journal/publish-wirkstoff-narrative.mjs` | journal_source_or_manifest | NO_CHANGE_REQUIRED | alternativen |
| `scripts/lib/method-version-indexability.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind, enap, dns |
| `scripts/methods/import-woems-source.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | folgenabschaetzung |
| `scripts/natalie/build-natalie-pages.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/podcast/build-podcast-pages.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind |
| `scripts/portal/apply-political-implementation-standard.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, evaluation |
| `scripts/portal/build-business-enterprise.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-detail-concept-corrections.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-education-effect-school.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-finance-capital.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-go3-sdg-reference-v1.py` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | dns, evaluation |
| `scripts/portal/build-health-care.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-housing-city.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/portal/build-impact-controlling.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
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
| `scripts/quality/apply-stage13-usability-a11y-seo.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind |
| `scripts/quality/check-state-sustainability-architecture.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, evaluation |
| `scripts/quellenarchiv/check-quellenarchiv-quality.mjs` | source_archive_source_or_generator | NO_CHANGE_REQUIRED | novelty_or_absence |
| `scripts/reference/enhance-reference-ux.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind, evaluation |
| `scripts/register/build-masterregister-v1.5.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | nachhaltigkeitspruefung, enap, egfa, dns, evaluation |
| `scripts/site/apply-2-0-final-consolidation.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | wirkungsblind |
| `scripts/site/apply-website-architecture-v21.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen |
| `scripts/site/build-institut-teaser.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
| `scripts/site/build-iooi-wirkungsarchitektur.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | alternativen, evaluation |
| `scripts/site/build-parlament-info.mjs` | site_generator_or_quality_tool | NO_CHANGE_REQUIRED | evaluation |
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
| `sitemap.xml` | sitemap | NO_CHANGE_REQUIRED | wirkungsblind, enap, dns, evaluation |
| `tools/apply_state_sustainability_architecture.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `tools/apply_state_sustainability_precision.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `tools/apply_state_sustainability_public_precision.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, nachhaltigkeitspruefung, enap, dns |
| `tools/apply_state_sustainability_sources.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen |
| `tools/apply_state_sustainability_wiwi_generator.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `tools/audit_state_sustainability_architecture.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind, enap, egfa, dns, alternativen, evaluation, novelty_or_absence |
| `tools/audit_state_sustainability_architecture_fast.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind, alternativen, evaluation |
| `tools/audit_state_sustainability_support_files.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | enap, egfa, dns |
| `tools/build_woek_document_inventory.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind |
| `tools/check_state_sustainability_architecture.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, nachhaltigkeitspruefung, enap, egfa, dns, alternativen, evaluation |
| `tools/finalize_state_sustainability_matrix.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | wirkungsblind, folgenabschaetzung, enap, egfa, dns, alternativen, novelty_or_absence |
| `tools/generate_fuer_pages.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | folgenabschaetzung, evaluation, novelty_or_absence |
| `tools/generate_sprint1_visuals.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | evaluation |
| `tools/generate_visual_phase_assets.py` | quality_or_projection_tool | NO_CHANGE_REQUIRED | evaluation |

## Review/action closure

- Combined reviewed items: **17012**
- Open semantic/action reviews after deterministic projection: **0**
- Broad novelty/Wirkungsblindheit hits were dispositioned by a second-pass contextual state-absence review; isolated words are not treated as absence claims.
- `AGENTS.md` is explicitly inventoried as a corrected current guardrail.
