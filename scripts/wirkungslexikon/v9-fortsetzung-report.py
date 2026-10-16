from pathlib import Path
import json,hashlib,subprocess,datetime,collections
ROOT=Path(__file__).resolve().parents[2];B=ROOT/'outputs/wirkungslexikon/v9';OUT=ROOT/'outputs/wirkungslexikon/v9-fortsetzung-berichte';OUT.mkdir(exist_ok=True)
S=json.loads((B/'store.json').read_text());I=json.loads((B/'review/index.json').read_text());T=I['tables'];source=Path(I['source']);checks=json.loads((B/'review/SOURCE_ACCESS_CHECKS.json').read_text());fragments=json.loads((B/'TESTNACHWEISE/FORTSETZUNG_ORIGINALFRAGMENTE.json').read_text());received=json.loads((B/'review/RECEIVED_MANIFEST.json').read_text())
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip();stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
def write(name,text):(OUT/name).write_text(text.strip()+'\n')
status='Stand: '+stamp+'\n\nGeschütztes lokales Staging. 0 echte Einzel-/Zusatzfreigaben, 0 neue Produktivveröffentlichungen, beide Artikel gesperrt.\n\n'
def report(name,title,body):write(name,'# '+title+'\n\n'+status+body)
def table(headers,rows):return '| '+' | '.join(headers)+' |\n| '+' | '.join('---' for _ in headers)+' |\n'+'\n'.join('| '+' | '.join(str(v).replace('|',' / ').replace('\n',' ') for v in row)+' |' for row in rows)+'\n'
original=json.loads((Path(S['source'])/'01_DATEN/V3_ORIGINAL_MASTER_UNVERAENDERT.json').read_text());bySlug={e['slug']:e for e in original['entries']};qa={x['slug']:x for x in T['KARTEN_QA_180']['rows']};rest={x['slug']:x for x in T['RESTLISTE_OFFENE_QUELLEN']['rows']};historical=lambda e:'20 Recherchekandidaten' if e['slug'].startswith('offen-') else '27 IFR-Karten' if 'Policy Paper' in e['korpus'] else 'afd-remigration' if e['slug']=='afd-remigration' else 'keine der historischen 48'
hist=[e for e in original['entries'] if historical(e)!='keine der historischen 48'];assert len(hist)==48 and len({e['id'] for e in hist})==48
newquestions=[]
for slug,e in bySlug.items():
 r=rest.get(slug);questions=['Persönliche Quellen- und Fachprüfung sowie exakte Versionsfreigabe fehlen.']
 if r:questions+=[r['V8_Detail'],r['konkrete_naechste_aktion']]
 if historical(e)!='keine der historischen 48':questions+=['Historischen Sperrgrund einzeln und quellengebunden klären.']
 if slug=='offen-umvolkung':questions+=['Geliefertes Fragment nutzt doppelte, archivierte Quelle einfache innere Anführungszeichen; genaue Zitierform prüfen.']
 if slug=='afd-remigration':questions+=['Zusatzhypothese pending. Konkrete spätere Maßnahme, Norm, Zuständigkeit und Betroffenenkreis fehlen; IFR und Bundespartei getrennt halten.']
 newquestions.append([e['id'],slug,e['begriff'],e['akteur'],historical(e),r['V8_Grund'] if r else 'kein Fall der 63er-Restliste','; '.join(questions),'ENTWURF_GESPERRT','NEIN','01_QA/KARTEN_QA_180.csv; 01_QA/RESTLISTE_OFFENE_QUELLEN.csv'])
csvs={'OFFENE_FACHFRAGEN_NACH_ID.csv':[['id','slug','lemma','akteur_laut_ungeprueftem_draft','historische_sperrgruppe','v8_pruefachse','konkrete_prueffragen','redaktioneller_status','menschlich_freigegeben','herkunft']]+newquestions,'NORMALISIERUNG_OFFENE_BELEGFRAGEN.csv':[['ereignis_id','referenz_id','fehlender_beleg','quellenrolle','status','menschliche_freigabe']],'POLICY_LINKS_QA.csv':[['analysis_id','karten_slug','massnahme','zustand','zustandigkeit','fehlender_nachweis','status'],['review-20261016-remigration-vorwirkung','afd-remigration','Keine konkrete Norm benannt; mögliche Ausweitung von Rückführungsregeln oder Verwaltungsverfahren','unknown','Bundes-/Landeskompetenz je konkreter Maßnahme zu prüfen','Originalvorlage, Datum, Norm, Personenkreis, Zuständigkeit und gesonderter Attributionsnachweis','ENTWURF_GESPERRT']]}
(OUT/'CSV_MATRIZEN.json').write_text(json.dumps(csvs,ensure_ascii=False,indent=2))
report('ABSCHLUSSBERICHT_V9_FORTSETZUNG.md','Aktualisierte V9-Übergabe: technischer Abschluss',f'''Umgesetzt im vorhandenen Repository und Claude-Design. Branch `codex/wirkungslexikon-v9-fortsetzung-20261016`; Code-Commit `{commit}`. Keine neue Hosting-Plattform, keine Hostingkosten.

- 180 Karten, 20 Familien und 21 Dossiers bleiben getrennte Bestände. Alle 221 bisherigen Inhaltsrevisionen byteinhaltlich unverändert.
- Neun Prüftabellen, 180 journalistische Funktionen und 137 Vorschläge für 67 Karten in geschützter Redaktion: aktueller Wert, gelieferter Vorher-Wert, Vorschlag, Begründung und Quellen.
- Ergänzte Einführungs-, Journalismus-, Wissenschafts- und Methodiktexte einschließlich Normalisierung, sprachlicher Zustandsänderung, neuer Ausgangslage und möglicher Entscheidungs-Vorwirkung.
- Optionaler Remigration-Entwurf: betroffene Gruppen, Bedingungen, Gegenwirkungen, getrennte Akteursziele und Quellenrollen; Maßnahmenstatus unknown und Attribution nicht nachgewiesen.
- Normalisierungsregister unverändert leer. Keine erfundenen Stationen. Chronologische Rubrik setzt inhaltsgebundene Quellen- und Fachreviews voraus; keine kausalen Verbindungspfeile.
- 21 Beobachtungsfelder mit eigener Vorgangs-/Reaktionsrolle; keine automatische Einzelwortwirkung.

## Tatsächlich geprüft

16 bestehende Freigabetests, 16 neue Schema-/Revisions-/Rollen-/Negativtests, vollständiger Golden State für 221 Bestandsobjekte, 8 bestehende und 6 neue Browser-Prüfgruppen. Positiver HTTP- und Browser-Speicherweg in anschließend gelöschter Testkopie; echter Store unverändert. Mobilbreiten emuliert, kein physischer Smartphone-/Screenreadertest. Automatisches axe: 0 Verstöße, 0 horizontale Überläufe. 540 aktuelle Entwurfsbilder; Links und deren Nachweise im Testverzeichnis.

## Quellenstand und Grenzen

27/27 IFR-Fragmente auf den angegebenen PDF-Seiten gefunden. 19/20 Kandidatenfragmente im gewählten Textvergleich gefunden; bei `offen-umvolkung` abweichende Anführungszeichen, bei gesondertem typografischem Vergleich wiederauffindbar. Alle 20 benötigen menschliche Kontextprüfung. HTTP-Status, Textsuche und maschinelle QA sind keine Freigaben. Zwei übergeordnete Manifest-Hashes weichen ab; innere Manifeste und Master sind bestätigt. Bibliografische Korrekturfrage zu PMID 32844338 separat dokumentiert.

## Weiter erforderlich

Individuelle Quellen-/Fachreviews für zu veröffentlichende Fassungen, reales offizielles Freigabekonto, daran gebundener Produktionsadapter und eine gesonderte Releaseentscheidung. Keine Übernahme der alten Blankozustimmung. Manueller Screenreader-/Bedienungstest und vollständige Produktionsprüfung folgen vor einem tatsächlichen Release. Journal und LinkedIn anschließend separat prüfen und freigeben.

**Status:** vorbereitet: ja; technisch integriert: ja; Staging automatisiert getestet: ja; Quellenzugriff/Textlokatoren geprüft: teilweise und dokumentiert; menschlich fachlich abgenommen: nein; freigegeben: nein; live: nein.
''')
report('REPO_UND_DESIGN_AUDIT.md','Repository und Design: Delta-Audit',f'''Arbeitscheckout: `{ROOT}`. Unveränderte Grundlage `de2e9ff6e44f1acb34f0cee5b4ba7dafa1189b53`; aktueller Commit `{commit}`. Getrennte Arbeitskopie schützt fremde Änderungen im Hauptcheckout. Keine globale Bereinigung, keine Übernahme fremder Änderungen.

Vorhandene Generatoren `build.mjs`, `v9-build.mjs`, Templates und Claude-Klassen `.wl-*` weiterverwendet. Claude-CSS unverändert. Globale Erschließung bleibt Footer und ergänzende Teaser in vier Zielgruppenportalen; keine neue Hauptnavigation und keine Einordnung als konstituierender Bestandteil der Wirkungsökonomie.

Neue private Ebene: `v9-review.mjs`, Import, JSON-Schemata, Prüfobjekt-API und generische Vergleichsansicht. Die 221 Karten-/Familien-/Dossier-Snapshots und V3/V8-Originale bleiben erhalten. Backup vor Import: `backups/v9-before-continuation-20261016/store.json`. Generierter Teilaufbau aus einem während der Entwicklung fehlgeschlagenen Build separat archiviert; abschließender Neuaufbau erfolgreich. Schutz gegen Überschreiben nicht dem Generator zugeordneter Dateien verschärft.

Vorschau ausschließlich Loopback mit Basic-Zugriff, noindex und private/no-store. Keine neuen Cloudressourcen oder Vercel-Builds. Das bestehende Produktionshosting wurde nicht verändert. Frühere vollständige Site-Navigationsnachweise werden als historische Baseline beigelegt; sie ersetzen keinen neuen Production-Abnahmelauf.
''')
report('QUELLEN_QA_180.md','Quellenprüfung: 180 Karten',table(['ID / Slug','Historische Gruppe','V8-Restfall','Aktueller Status'],[[e['id'],historical(e),rest[e['slug']]['V8_Grund'] if e['slug'] in rest else 'nicht in 63er-Restliste','menschlicher Review offen'] for e in original['entries']])+f'''\n63 eindeutige V8-Fälle = 15 Wortlaut- und 48 Metadatenfälle ohne Überschneidung innerhalb dieser Liste. Historische 48 Sperrkarten sind eine andere, teilweise überlappende Menge. Keine Entsperrung.

30 gemeinsame Quellenregistervorlagen verbessern Prüfbarkeit, ersetzen keine individuelle Fundstelle. Alle gelieferten Metadaten und Quellenrollen bleiben als Vorschläge erhalten. Der frühere breitere 665-Zeilen-Bericht wird als historischer Zusatz mitgeliefert; er zählt Einzelquellen einschließlich Mechanismenforschung, nicht 665 Karten.

Original-V3-SHA: `{S['v3Sha256']}`. URL-Zugriffskontrolle: {len(checks['rows'])} Links, {dict(collections.Counter(x.get('status') for x in checks['rows']))}. Status 200 kann eine Prüf-/Cookie-Seite sein; 203/403 sind keine inhaltliche Verifikation. Vollständige Antworten und Prüfsummen in `review/SOURCE_ACCESS_CHECKS.json` und `review/sources/`.
''')
report('PROGRAMM_QA_21.md','21 eigenständige Programmdossiers',table(['Dossier-ID','Original-/Versionsprüfung','Publikation'],[[x['id'],x['HTML_vs_PDF_Version'],'gesperrt'] for x in T['SACHSEN_ANHALT_21_PROGRAMMDOSSIER_QA']['rows']])+'''\nLandesverband Sachsen-Anhalt 2026, eigenständige Datenart. Nicht das Bundespositionspapier von Januar 2024, nicht IFR, keine Karten 181-201. Das Sicherheits-/Migrationslemma ist eine Zusammenfassung. HTML-/PDF-Fassungen und abweichende Seitenumfänge nicht gleichsetzen. Neue Verknüpfungen zu Kultur-, Rundfunk- oder Wissenschaftsentscheidungen wurden ohne konkrete Primärregel nicht angelegt.''')
report('NARRATIV_LINK_QA_180.md','Narrativfamilien und Zuordnungen',table(['Karten-Slug','Vorgeschlagene Familien','Fachprüfung'],[[x['slug'],x['familien_vorschlag'],x['menschlicher_review']] for x in T['NARRATIVZUORDNUNGEN_QA_180']['rows']])+'''\n20 Familien unverändert. Keine neue Bestätigung durch die Übernahme von CSV-Dateien. Gleichartige Wörter und Themen beweisen weder gemeinsame Urheberschaft noch gemeinsame Strategie.''')
report('NORMALISIERUNG_QUELLENROLLEN_QA.md','Normalisierung: Quellenrollen', '''Leeres Arbeitsregister mit 0 Ereignissen unverändert importiert. Quellenrollen, Verwendungsrolle und Zitatart sind getrennte Enums. Parteiäußerung, eigene Medienrahmung und Faktencheck bleiben bei identischer Formulierung drei verschiedene Rollen. Faktencheck erzeugt keinen Verstärkungs- oder Einstellungsnachweis. Zehn gleichlautende Posts erzeugen weder Bot-, Staats- noch Koordinationszuordnung.

Kommunikationsoutput, bedingte Normalisierungshypothese, erhobene Normbeobachtung, semantischer Vergleich und Attribution sind getrennte Felder. Für sprachliche Zustandsänderungen sind Erhebungsdesign, Korpus, Zeitraum, veränderte Textmengen und Kontexte eigenständig nötig. Aus einer belegten Sprachänderung folgen neue Potenziale, keine automatisch gemessenen gesellschaftlichen Folgewirkungen.''')
report('NORMALISIERUNG_SCHEMA_TESTS.md','Normalisierung: Schema und Daten', '''Originalschema bytegleich lokal übernommen. Aktive Validierung prüft die tatsächlich verwendeten Schlüssel einschließlich required, Typ, enum, const, lokale $ref, Muster, Datum, zusätzliche Felder und vorhandene Referenzen. Unbekannte Validierungsoperatoren scheitern geschlossen. Kein universeller JSON-Schema-2020-12-Validator und kein Remote-Schemaladen.

Unbekannte Karten, zusätzliche Bot-Flags, javascript-URLs, Freigabestatus und bestätigte Reviewmarker aus Editoraufrufen werden abgewiesen. Neue Station im isolierten HTTP-/Browser-Test gespeichert und aus API zurückgelesen; Quelle bleibt unverified, public_release false. Echte Daten unverändert.''')
report('NORMALISIERUNG_UI_TESTS.md','Normalisierung: Darstellung', '''Die ergänzten Texte sind in bestehende Einführungs-, Journalismus-, Wissenschafts- und Methodikseiten integriert. Leeres Register erzeugt keine Timeline. Optionaler Renderer zeigt chronologische, einzeln geprüfte Stationen mit Rolle und Fundstelle; keine Kausalpfeile. Er verlangt zwei exakt an die Revision gebundene Reviewmarker. Die reale Signatur-/Kontozuordnung bleibt vor Aktivierung ausstehend.

Mobil-/Desktop-Browser und axe geprüft. Redaktion bietet Entwurfsformular, Quellenrollen und leeren Ereignisbestand. Synthetische Testereignisse wurden ausschließlich in gelöschten Fixtures verwendet.''')
report('ENTSCHEIDUNGSVORWIRKUNG_SCHEMA_QA.md','Entscheidungs-Vorwirkung: Schema', '''Ein Zusatzobjekt `review-20261016-remigration-vorwirkung`, Referenz auf den bestehenden V3-Slug `afd-remigration`. Originalschema und Rohvorschlag unverändert aufbewahrt. Redaktion kann private Revisionen speichern, keine menschliche Quellenprüfung oder Abschlussfreigabe selbst eintragen. Quellen-IDs werden aufgelöst; Maßnahmen außerhalb unknown verlangen Quelle, Datum und Zuständigkeit.

Die vorgeschlagene Zielmaßnahme ist noch nicht konkretisiert. Schemaerfüllung ist deshalb kein fachlicher Abschluss. Quelle, aktueller Text-Hash, Rollen, Gegenhypothesen und Freigabe bleiben eigenständige Prüfungen.''')
report('REMIGRATION_QUELLENROLLEN_REVIEW.md','Remigration: getrennte Quellenrollen', '''[IFR](https://www.remigration-institute.com/) beschreibt eigene Kampagnen-, Briefing- und Begriffsziele. Das ist eine interessengebundene strategische Selbstbeschreibung, keine unabhängige Wirksamkeitsstudie. [AfD-Bundespositionspapier](https://www.afd.de/remigration/) vom 29.01.2024 hat einen eigenen Urheber und eine eigene Definition. Es darf nicht mit IFR/Sellner verschmolzen werden. Die im Papier behauptete Rechtskonformität ist keine externe juristische Bestätigung.

Der [Tagesschau-Bericht](https://www.tagesschau.de/inland/innenpolitik/afd-treffen-sellner-100.html) betrifft eine konkrete Veranstaltung und parteiinternen Widerspruch, keine automatisch beschlossene Bundesparteiprogrammatik. Sachsen-Anhalt bleibt eigener Landesprogrammkontext.

[Soral und Kollegen](https://pubmed.ncbi.nlm.nih.gov/37843924/) untersuchen Desensibilisierung in einem ECG-Experiment mit N=56; Onlinepublikation 2023, Heftausgabe 2024. Daraus folgt keine konkrete Kausalität deutscher Politikprogramme. Quellensichtung dokumentiert; menschlicher Claim-/Kontextreview ausstehend.''')
report('BETROFFENENPERSPEKTIVEN_QA.md','Betroffenenperspektiven', '''Der private Remigration-Entwurf nennt von Rückkehr-/Abschiebungspolitik betroffene Menschen, journalistische Vermittler sowie Öffentlichkeit und Entscheidungsträger. Die konkrete Reichweite einer Maßnahme ist nicht festgelegt; daher keine erfundene Betroffenenzahl, kein erfundener Rechtsstatus, keine Empathie- oder Akzeptanzpunktzahl.

Moralische Distanz, Entsolidarisierung, Euphemisierung, Desensibilisierung und eng begründete Entmenschlichung sind unterschiedliche Konstrukte. Die UI benennt Bedingungen und Gegenwirkungen. Konkrete individuelle Lebenslagen, Schutzrechte, Zuständigkeit und Gegenpositionen sind bei einer tatsächlich benannten Maßnahme menschlich nachzurecherchieren.''')
report('POLICY_LINKS_QA.md','Politische Maßnahmen: Verknüpfungsprüfung', '''Aktueller Befund: unknown, kein konkreter Normbeleg, kein Datum und noch zu prüfende Bundes-/Landeszuständigkeit. Die private Hypothese belegt keine beschlossene oder umgesetzte Maßnahme. Keine automatische Erweiterung auf Kulturförderung, Rundfunkstaatsvertrag oder Wissenschaftspolitik. Status unknown ist weder 0 noch gescheitert noch neutral.

Die einzige offene Referenz steht in POLICY_LINKS_QA.csv. Ohne konkrete Vorlage/Norm, Originalquelle, Datum, Kompetenz und Personenkreis bleibt die fachliche Verknüpfung offen.''')
gate='''Echte individuelle Freigaben: 0. Offizielles Redaktionskonto weiterhin nicht identitätsgebunden angeschlossen. Keine automatisch eingetragenen reviewed_by-Werte. 48 historische Sperren, 63 V8-Prüffälle und 137 Vorschläge bleiben unabhängig erhalten. Nach Inhaltsänderungen neuer Draft mit neuem Hash; veraltete Revision ergibt 409. Öffentliche Ausleitung bleibt komplett gesperrt.

Quellenreview, Fachreview, Abschlussfreigabe, Veröffentlichung und Liveprüfung sind getrennte Entscheidungen. Die vorhandene Signaturkernlogik wird nur in isolierten Fixtures geprüft. Die neuen Zusatzschemas erzwingen public_release=false; kein allgemeiner Produktionsadapter für freigegebene V9-Gesamtversionen ist angeschlossen. Dies ist eine tatsächliche offene technische Integration, keine nur redaktionelle Restfrage.'''
for n,title in [('HITL_FREIGABEUEBERSICHT.md','Freigabeübersicht'),('HITL_GATE_TESTS.md','Freigabetests'),('HITL_FREIGABEGATES.md','Freigabegates der Entscheidungs-Vorwirkung'),('HITL_NORMALISIERUNG_FREIGABEPROTOKOLL.md','Normalisierung: Freigabeprotokoll')]:report(n,title,gate)
tests='''16 bestehende und 16 neue Unit-/Gate-Prüfungen bestanden. Golden State: 180 Karten, 20 Familien, 21 Dossiers; sämtliche bisherigen Kartendatenfelder erhalten und im privaten strukturierten Prüfstand sichtbar. 137 Vorschläge auf zugehörigen Karten und Redaktionsübersicht vorhanden. Öffentliche V9-Daten: 0. Keine unfreigegebenen Zusatzobjekte in API-/Such-/Sitemap-/Metadaten-/Export-Artefakten der Public-Negativsimulation.

8 bestehende und 6 neue Browser-Prüfgruppen bestanden; neue Breiten 360,390,768,1024,1440, Basis zusätzlich 820,1280. axe WCAG 2.2 AA: 0 Verstöße, Überläufe: 0, JS-Seitenfehler: 0. Kein manueller VoiceOver-/NVDA-Test und keine vollständige WCAG-Zertifizierung.

Positiver API- und Browser-Speicherweg mit Hashwechsel, Audit und 409-Konfliktschutz in anschließender gelöschter Datenkopie. Neue API ohne Anmeldung401, unerlaubte Freigabe400, fremde Herkunft403. Staging private/no-store/noindex. Keine Kennwörter im Lieferpaket. 540 Entwurfsbilder, pro Karte drei Formate, Prüfsummen und Maße kontrolliert.

Hostingkostengate PASS; 0 neue Vercel-Builds und keine neuen Hostingressourcen. Staging ausschließlich Loopback. Keine Behauptung eines tatsächlichen V9-Produktionsabnahmelaufs. Historische Gesamtsite-Navigation bleibt als entsprechend datierte Baseline beigelegt.'''
for n,title in [('TECHNISCHE_QA_UND_SICHERHEIT.md','Technische Qualität und Sicherheit'),('UI_WIRKUNGSPOTENZIAL_TESTS.md','Wirkungspotenzial in den Ansichten'),('STAGING_TESTS_ENTSCHEIDUNGSVORWIRKUNG.md','Staging-Prüfungen der Entscheidungs-Vorwirkung')]:report(n,title,tests)
report('MIGRATION_DIFF.md','Migration und Vorher-/Nachher-Schutz', '''V3-Original und bestehende 221 Draft-Snapshots unverändert. 137 Vorschläge für 67 Karten bleiben außerhalb dieser Snapshots. Der aktuelle Wert des Zielpfads, das gelieferte Vorher und der Vorschlag werden getrennt gezeigt; eine fehlende Zusatzschicht ist als nicht erfasst erkennbar. 0 Vorschläge angewendet, 0 Freigaben geschrieben.

Ein separater Entscheidungsentwurf, 0 Normalisierungsereignisse. Zwei Top-Level-Dokumente stimmen nicht mit alten Manifestangaben überein; tatsächliche Empfangs-Hashes separat vollständig gesichert. Originalarchive nicht korrigiert oder neu gepackt. Alle neuen Berichte liegen versioniert neben der bisherigen V9-Lieferung.''')
report('PAKET_INTEGRITAET_UND_KORREKTURFRAGEN.md','Paketintegrität und konkrete Korrekturfragen',table(['Datei','Erwarteter Hash','Empfangener Hash'],[[x['path'],x['expected'],x['actual']] for x in received['upstreamManifestIssues']])+'''\nDas unveränderte verschachtelte Original-V9-Archiv stimmt mit dem früheren Archiv überein. Manifest der redaktionellen Fortsetzung und Normalisierung bestätigt. Im übergeordneten Manifest sind zwei Startdokumente abweichend; neue Entscheidungsdateien sind dort nicht vollständig abgedeckt. Ein eigenes Empfangsmanifest erfasst alle gelieferten Dateien. Keine Manifestabweichung still korrigiert und keine dadurch vorgetäuschte Freigabe.

Bibliografie: Der Normalisierungsnachtrag nennt für PMID 32844338 Swire-Thompson et al. Die [verlinkte Originalpublikation](https://pubmed.ncbi.nlm.nih.gov/32844338/) nennt Ecker, Lewandowsky und Chadwick (2020). Das ist eine konkrete Korrekturfrage vor Publikation; Rohdatei unverändert. Die Gegenrede-Studie von 2025 führt [Gennaro als Erstautorin](https://pubmed.ncbi.nlm.nih.gov/40593002/); die Übergabe nennt Hangartner et al. als Kurzverweis. Autorenangabe präzisieren.

ENISA-Downloadlink von 2025 liefert404; Ersatzquelle vor Übernahme versionsbezogen prüfen. Bei offen-umvolkung sind die inneren Anführungszeichen im gelieferten Fragment und archivierten Text verschieden. Textnachweis nach separater Typografie-Normalisierung vorhanden, aber keine ungeprüfte wörtliche Zitierfreigabe.''')
report('DEPLOYMENT_CHECKLIST.md','Nächste Schritte vor Veröffentlichung', '''- [x] V3-Identität, Originalhash und getrennte Mengen prüfen.
- [x] Vorschläge, Quellenrollen und neue Methodik geschützt integrieren.
- [x] Automatisierte Staging-, Browser-, Schema-, API- und Ausleitungstests.
- [ ] Manifestabweichung und bibliografische Korrekturen redaktionell bestätigen.
- [ ] Originalwortlaut, Fundstelle, Akteur, Kontext, Kategorien, Potenziale und Gegenpositionen für gewählte Fassungen persönlich prüfen.
- [ ] Offizielles Freigabekonto identitätsgebunden anbinden; V9-Produktionsadapter einschließlich Zusatzobjekten, Rechteprüfung und Gesamtversionsfreigabe fertigstellen.
- [ ] Manueller Screenreader-/Bedienungstest sowie vollständiger Release-/Rollbacklauf.
- [ ] Natalie erteilt konkrete Releasefreigabe und gesonderten Produktionsauftrag.
- [ ] Erst danach Deployment und tatsächliche Live-URLs, Suche, Navigation, Quellen, Cache, Sitemaps und Sperren prüfen.
- [ ] Journal und LinkedIn nach Livegang separat Fakten-/Linkprüfung und persönliche Freigabe; kein automatischer Folgejob.''')
write('STAGING_URL.txt','Geschütztes lokales Staging, keine externe oder öffentliche URL:\nhttp://127.0.0.1:8799/wirkungslexikon/\nhttp://127.0.0.1:8799/wirkungslexikon/redaktion/pruefungen/\nhttp://127.0.0.1:8799/wirkungslexikon/afd-remigration/#entscheidungs-vorwirkung\n\nAnmeldung lokal im vorhandenen access.json, nicht im Lieferpaket. Auf anderen Rechnern und auf einem physischen Smartphone ist 127.0.0.1 nicht dieser Mac.\n')
report('RUNBOOK_V9_FORTSETZUNG.md','Staging weiterführen',f'''Geprüfter Arbeitscheckout: `{ROOT}`. Start: `WL_VERSION=9 WL_PORT=8799 node scripts/wirkungslexikon/serve.mjs`. Mit vorhandenem Gesamtsite-Artefakt zusätzlich WL_HOST_ARTIFACT auf dessen lokalen Pfad setzen. Kein öffentliches Binding; Zugangsdaten ausschließlich lokal, Dateimodus0600.

Neue Entwürfe auf `/wirkungslexikon/redaktion/pruefungen/` bearbeiten. Karten selbst weiter unter `/redaktion/`. Änderungen sind keine Freigaben. Nach fachlichen Inhaltsänderungen Staging bauen und passende Tests erneut ausführen. Socialbilder erst nach dem Seitenbuild seriell erzeugen. Keine ausgefüllten privaten Identitäts-/Trustdateien kopieren.

Wiederherstellung auf demselben Mac: Code-Commit und private Datenkopie nutzen. Auf anderem Rechner Eingangsarchiv sicher entpacken, verschachteltes Original-V9-Archiv separat entpacken und zunächst mit v9-import.mjs importieren. Danach v9-fortsetzung-import.mjs auf das neue Gesamtpaket anwenden. Bereits bearbeitete Snapshots und Ereignisse erhalten. Bei Übernahme eines bestehenden Stores seine reinen lokalen Herkunftspfade und die Review-Indexpfade bewusst an die neuen Archivorte anpassen; Inhaltsrevisionen und Auditkette nicht umschreiben. Zugangsdaten frisch lokal erzeugen.

Produktionsbetrieb ist noch nicht angebunden. Offizielles Konto und Freigabe-/Releaseadapter zuerst vervollständigen; keine Umgehung durch historische V3-Veröffentlichungsregeln. Beide Artikel bleiben unveröffentlichte Originalvorlagen.''')
report('SCREENSHOTS_INDEX.md','Bildnachweise', '\n'.join('- '+str(p.relative_to(B)) for p in sorted((B/'SCREENSHOTS').rglob('*.png')))+'\n\nNeue Fortsetzungsbilder zeigen reale emulierte 390-/1440-Pixel-Browseransichten; Entwurfsbilder sind keine Live-Belege.')
write('README.md',f'''# V9-Fortsetzung: geschützte technische Umsetzung

Aktueller Abschluss: [ABSCHLUSSBERICHT_V9_FORTSETZUNG.md](ABSCHLUSSBERICHT_V9_FORTSETZUNG.md).

180 Karten, 20 Familien, 21 Dossiers; zusätzlich 137 offene Vorschläge für 67 Karten, 1 privater Entscheidungsentwurf und 0 Verwendungsereignisse. Alle 48 historischen Sperren erhalten. Keine Live-Schaltung und keine Artikelveröffentlichung.

Code-Commit: `{commit}`. Getestete lokale Vorschau und Login-Grenze in STAGING_URL.txt. Prüfnachweise, Originalmaterial, Code, Daten und Bilder im Paket. Zugangsdaten und Schlüssel ausgeschlossen.

Die frühere Lieferung unter Umsetzung_V9 bleibt als historischer Stand bestehen; dieses Unterpaket ist der neue technische Arbeitsstand. Nächste Freigabevoraussetzungen stehen in DEPLOYMENT_CHECKLIST.md.
''')
(OUT/'FREIGABE_IST_STATUS.json').write_text(json.dumps({'at':stamp,'commit':commit,'prepared':True,'technicallyIntegrated':True,'stagingTestsPassed':True,'humanApproved':False,'releaseApproved':False,'live':False,'articlePublished':False,'baseObjects':{'cards':180,'families':20,'dossiers':21},'patchProposals':137,'acceptedPatches':0,'normalizationEvents':0,'decisionDrafts':1,'upstreamManifestMismatches':len(received['upstreamManifestIssues'])},ensure_ascii=False,indent=2))
print(json.dumps({'reports':len(list(OUT.glob('*.md'))),'csvMatrices':{k:len(v)-1 for k,v in csvs.items()},'commit':commit}))
