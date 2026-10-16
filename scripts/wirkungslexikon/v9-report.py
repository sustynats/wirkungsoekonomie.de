from pathlib import Path
import json,hashlib,subprocess,shutil,datetime
R=Path(__file__).resolve().parents[2];B=R/'outputs/wirkungslexikon/v9';read=lambda p:json.loads((B/p).read_text());store=read('store.json');S=Path(store['source']);v8=json.loads((S/'01_DATEN/MASTER_V8_REDAKTIONSUEBERGABE_180.json').read_text());entries=v8['entries'];qa=read('QUELLEN_QA_180.json');urls=read('QUELLEN_ERREICHBARKEIT.json');programme=read('PROGRAMM_QA_21.json');golden=read('TESTNACHWEISE/GOLDEN_STATE.json');ui=read('TESTNACHWEISE/UI_WIRKUNGSPOTENZIAL_TESTS.json');hitl=read('TESTNACHWEISE/HITL_GATE_TESTS.json')
write=lambda n,t:(B/n).write_text(t.strip()+'\n')
original_audit=Path('/Users/hagen/Documents/New project/outputs/wirkungslexikon/v9/REPO_UND_DESIGN_AUDIT.md');shutil.copy2(original_audit,B/original_audit.name)
write('QUELLEN_QA_180.md',f'''# Quellen-QA:180 Karten

Unveränderte V3-Herkunft: `{store['v3Sha256']}`. V8-Anreicherung: `{store['v8Sha256']}`. Alle 180 IDs, Slugs und historischen Prüffelder erhalten. Import als private Inhaltsrevisionen, keine Freigaben.

Das mitgelieferte V8-Audit weist 48 Karten mit Quellenmetadatenlücken und 15 ohne eindeutig erfassten Originalwortlaut aus. Es nennt 89 ungenaue Fundstellen,84 fehlende Urheber und84 fehlende Datums-/Abrufangaben auf Quellenebene. Diese überlappenden Größen werden nicht addiert.

Die zusätzliche technische Prüfung umfasst auch wissenschaftliche Mechanismenliteratur. Die CSV `RESTLISTE_OFFENE_QUELLEN.csv` enthält665 Aufgabenzeilen über180 Karten, darunter15 Wortlautaufgaben. Mehrere Karten teilen Literatur;665 Zeilen sind keine665 Karten. Fehlende bibliografische Metadaten sind getrennt von einem fehlenden empirischen Einzelwort-Wirkungsnachweis. Letzterer ist keine Pflicht für eine begründete Potenzialhypothese.

Technischer URL-Test:84 unterschiedliche URLs;{sum(x.get('status')==200 for x in urls)} HTTP200,{sum(x.get('status')==203 for x in urls)} HTTP203,{sum(x.get('status')==403 for x in urls)} HTTP403,{sum(x.get('status')==404 for x in urls)} HTTP404.203 und403 sind eingeschränkte technische Abrufe, keine Behauptung, die Quelle sei nicht vorhanden. TLS-Prüfungen wurden bei Bedarf mit dem macOS-Systemvertrauensspeicher wiederholt, ohne Zertifikatsprüfung abzuschalten. Details und Zeitpunkt je URL: `QUELLEN_ERREICHBARKEIT.json`.

IFR:49-seitiges Original-PDF unverändert. Alle27 vorgeschlagenen Ausdrücke mit normalisierter Textsuche gefunden; tatsächliche Trefferseiten und vorgeschlagene Fundstellen in `IFR_ORIGINALABGLEICH_27_TECHNISCH.json`. Normalisierte Treffer ersetzen weder wörtliche Zitatkontrolle noch vollständige Kontextprüfung. AfD: eigenständiges zweiseitiges Original-Positionspapier von2024 aus der im Paket angegebenen URL archiviert; kein Gleichsetzen mit IFR. Alle48 historischen Sperren bleiben bestehen.

Konkreter zusätzlicher Fehler: Der ENISA-Link im Methodiktext mit Verzeichnis `2025-11` liefert404. Verifizierbarer redaktioneller Ersatzvorschlag: https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025 und dortige Fassung. Quelle nicht still im Originaltext ersetzt. Vorschlag und übrige Einschränkungen in `QUELLEN_URL_RESTLISTE.json`.

Keine abgeschlossene wissenschaftliche Vollquellenprüfung behauptet. Kausalität, Wortgeschichte, juristische Aussagen und Zuordnungen benötigen dokumentierten menschlichen Review.
''')
write('PROGRAMM_QA_21.md',f'''# Programm-QA:21 eigenständige Dossiers

Datenart `programm_narrativ_dossier`; AfD-Landesverband Sachsen-Anhalt2026. Kein AfD-Bundesprogramm, kein IFR-Papier, kein zusätzlicher Kartenimport. Kartenbestand bleibt180.

Die Website https://afd-regierungsprogramm.de/ wurde tatsächlich abgerufen und als HTML-Snapshot mit SHA-256 archiviert. Laut dortigem Text Beschluss am11.04.2026. Originalfassung, Herkunft und konkreter Kontext sind vor menschlicher Freigabe zu bestätigen. Aktueller HTML-Hash: `{programme['website'].get('sha256')}`. Abfragezeit: {programme['website'].get('checkedAt')}.

20 von21 Kurzlemmata sind wortgleich im extrahierten Webtext auffindbar. `sa26-migration-kriminalitaet` verwendet „Sicherheit durch Begrenzung der Migration“ als Kurzlemma, das nicht wortgleich gefunden wurde. Als redaktionelles Lemma führen, kein exaktes Zitat daraus erzeugen. Kontexttreffer sind keine Freigaben. Der HTML-Snapshot enthält keinen PDF-Downloadlink. Eine abweichende finale PDF-Fassung wurde in diesem Durchlauf nicht belastbar zugeordnet; Fassungsgleichheit bleibt offen.

Alle21 verwandten V3-Verweise sind gültig. Alle Dossiers sind geschützt sichtbar und durchsuchbar, null öffentlich freigegeben. Keine Vollanalyse aller Programmpunkte behauptet. Programmeigene Tatsachenbehauptungen sind keine bestätigten Sachverhalte. Auslassungen werden als Schlussarten dargestellt und nicht automatisch als Absicht behandelt. Einzelbefunde: `PROGRAMM_QA_21.json`.
''')
write('PROGRAMM_QA.md',(B/'PROGRAMM_QA_21.md').read_text())
linkqa=[{'id':e['id'],'slug':e['slug'],'narrativ_ids':e['narrativeinordnung_v7']['narrativ_ids'],'humanConfirmed':False,'status':'KI-Vorschlag; gesonderter menschlicher Linkreview erforderlich','programmeThematicLinks':e['narrativeinordnung_v7'].get('programm_2026_themenverwandt',[]),'automaticActorAttribution':False} for e in entries]
write('NARRATIV_LINK_QA_180.json',json.dumps(linkqa,ensure_ascii=False,indent=2))
write('NARRATIV_LINK_QA_180.md','''# Narrativ-Link-QA

180 Karten geprüft; alle vorgeschlagenen Familien-IDs existieren unter den20 eindeutigen Familien. Alle V3-IDs und Slugs erhalten. Die Dateien mit Suffix19 und20 im Paket sind bytegleich; aktiv wird ausschließlich die Datei20 verwendet.

Alle180 Annotationen bleiben unbestätigte KI-Vorschläge. Getrennte Familienseiten und Mehrfachfilter sind geschützt nutzbar. Öffentliche Filter verwenden ausschließlich unabhängig bestätigte Verknüpfungen. Signierte Linkattestierungen müssen Familie und konkrete Kartenrevision benennen. Eine Inhaltsänderung invalidiert diese Bindung. Themenverwandtschaft zu einem Programm-Dossier begründet weder Herkunft noch institutionelle Gleichsetzung. Familien und Dossiers sind getrennte Objekte mit eigener Prüffassung. Einzelstatus: `NARRATIV_LINK_QA_180.json`.
''')
write('HITL_GATE_TESTS.md',f'''# Human-in-the-Loop: technische Gates

{len(hitl['results'])} automatisierte Tests bestanden. Testausführung: `node scripts/wirkungslexikon/v9-test.mjs`. Echtdatenfreigaben angelegt:0.

Statusfolge: Arbeitsentwurf → Quellenprüfung offen → menschlicher Quellenreview → Fachreview → eingefrorene Revision → persönliche Freigabe → eigene Veröffentlichung → versionierte Korrektur/Rücknahme. Inhaltssnapshots sind SHA-256-adressiert; Ereignisse enthalten Subjekt,Rolle,Datum,Revision und verketteten Vorgängerhash. Entwurfsänderungen erhalten die alte publizierte Fassung und erzeugen einen neuen Entwurf.

Berechtigungen: technischer Importer darf Vorschläge importieren; lokaler Editor darf Entwürfe speichern; source_reviewer bestätigt Wortlaut,Kontext,Akteur,Locator,Datum,Fassung; reviewer bestätigt Kategorien,Potenzial,Gegeninterpretation,Attribution; publisher braucht beide revisionstreuen Prüfungen und Natalie-Identität. Entscheidungsbelege benötigen eine Signatur der zuvor vertrauenswürdig konfigurierten Identitätsinstanz. Die Tests verwenden ausschließlich flüchtige synthetische Schlüssel und Testkonten im temporären Ordner, danach gelöscht.

**Offen:** Das vorhandene offizielle Natalie-Redaktionskonto ist noch nicht identifiziert/angebunden. Die vorhandene Parlaments-API arbeitet mit technischem gemeinsamem Token und belegt keine persönliche Identität. Keine neue Natalie-Identität und keine echte reviewed_by-Angabe erfunden. Im laufenden Staging sind nur Editor-Rechte aktiviert; Freigabe-POST endet403. Der V9-Produktionsadapter bleibt gesperrt und muss mit der realen Kontozuordnung abschließend integriert und getestet werden. Es gibt keinen aktuell nutzbaren Freigabeknopf, der diese Voraussetzung umgeht.

Das normale Website-Installationsskript meldet bei deaktivierter Lexikonpolicy „Lexikon bleibt unveröffentlicht“. Bei V9 darf der alte Artefaktweg auch nach Änderung eines Schalters keine V9-Veröffentlichung durchführen. Artikel behalten ein separates Gate.
''')
write('UI_WIRKUNGSPOTENZIAL_TESTS.md',f'''# UI-Prüfung V9

{len(ui['results'])} Browser-Prüfgruppen bestanden. Sieben Breiten:360,390,768,820,1024,1280,1440. axe-Prüfung wcag2a/aa,wcag21a/aa,wcag22aa für geprüfte Seitentypen auf390/1440:0 Verstöße. Kein horizontales Überlaufen,keine JavaScript-Seitenfehler. Suche zeigt kartenspezifisches Wirkungspotenzial; Datum-,Evidenzrollen- und Narrativfilter laden; getrennte Dossiersuche; mobiler Filter mit Escape/Fokusrückgabe; Redaktion lädt Karten und Dossiers. Vier Für-wen-Teaser im geschützten Website-Kontext erreichbar.

Golden-State-Prüfung:180 Karten,20 Familien,21 Dossiers vollständig übernommen. Alle Kartenfelder zusätzlich im geschützten strukturierten Prüfstand mit Feldpfad vorhanden. `unrendered_content_paths=[]` im Feldabgleich; alle221 Objekte ausdrücklich öffentlich gesperrt. Freigegebene V9-Inhalte:0; daraus wird keine öffentliche Auslieferung behauptet.

Ohne Anmeldung401 für HTML,JSON,Assets,Dossiers,API. Bekannte Karten- und Dossier-URLs in öffentlicher Negativprobe404. Keine V9-Karte in öffentlichem Runtime-JSON,Suchindex,Sitemap,Feed oder OG-Bild. Tatsächlich beobachtete Wirkungen werden optional dargestellt; bei leerem Feld nur dokumentierte Verwendung/Evidenzstatus im Detail. Kein Score und keine behauptete Einzelwortkausalität.

Die vorhandenen Claude-Komponenten,Farben und responsive Gestaltung wurden weiterverwendet. Vollständige V9-Webtexte einschließlich HITL sind eingebunden. Geplante Artikelpfade einschließlich Fallstudien-Arbeitsansicht existieren geschützt; Livecheck ausdrücklich ausstehend.

Manuelle VoiceOver-/NVDA-Prüfung und umfassende WCAG2.2-AA-Abnahme sind noch offen; axe allein ist keine Zertifizierung. Rohdaten: `TESTNACHWEISE/UI_WIRKUNGSPOTENZIAL_TESTS.json` und `GOLDEN_STATE.json`.
''')
write('STAGING_URL.txt','''Geschützte lokale Staging-Fassung (auf diesem Mac):
http://127.0.0.1:8799/wirkungslexikon/
http://127.0.0.1:8799/wirkungslexikon/redaktion/
http://127.0.0.1:8799/wirkungslexikon/narrative/
http://127.0.0.1:8799/wirkungslexikon/programm-dossiers/
http://127.0.0.1:8799/wirkungslexikon/journalisten/
http://127.0.0.1:8799/wirkungslexikon/wissenschaft/
http://127.0.0.1:8799/wirkungslexikon/methodik/
Negativprobe hinter derselben Anmeldung:
http://127.0.0.1:8799/public/wirkungslexikon/

Bindung ausschließlich127.0.0.1; keine von außen erreichbare Cloud-Staging-URL eingerichtet. Basic-Zugang,private/no-store,noindex auf sämtlichen Antworten. Passwort nur lokal in outputs/wirkungslexikon/release-repo/outputs/wirkungslexikon/v9/access.json (0600), absichtlich nicht in Dropbox oder Git kopiert. Dieses lokale Editor-Konto ist kein offizielles Natalie-Freigabekonto.
''')
write('SCREENSHOTS_INDEX.md','# Browser-Screenshots\n\n'+ '\n'.join(f'- [ {p.stem} ](SCREENSHOTS/{p.name}) · tatsächliche Browseraufnahme' for p in sorted((B/'SCREENSHOTS').glob('*.png'))))
checks=[('A1','begründet_offen','AfD- und IFR-Shifttexte sind im V8-Patch getrennt; eigenständiges AfD-Papier archiviert. Menschlicher Wortlaut-/Kontextreview und Freigabe fehlen.'),('A2','begründet_offen','Bestätigungsfeld und sichere öffentliche Darstellung vorhanden; null Evidenzstufen menschlich bestätigt. Kein automatisch übernommenes B–F-Mapping.'),('A3','behoben','Allgemeiner experimenteller Mechanismus im V8-Entwurf nicht mehr als beobachtete Einzelwortwirkung gespeichert; Feld null.'),('A4','behoben','afd-woke in quellen[] der V8-Karte vorhanden; Rückfall auf das globale Register technisch nicht mehr notwendig.'),('A5','behoben','Keine wortgleichen Funktion/Potenzial- oder Funktion/Mechanismus-Felder mehr. Fachliche Qualität der neuen Formulierungen bleibt im Review.'),('A6','begründet_offen','Alle vorgeschlagenen Paare ausgefüllt; Befüllung allein belegt keine Wortgeschichte. Strenge Rasterbedingung verhindert Scheinpräzision.'),('B1','begründet_offen','180 unterschiedliche Wirkstoff-,Langzeit- und Gegenwirkungstexte; vielfach erkennbares Formulierungsmuster. Individuelle inhaltliche Qualität menschlich prüfen.'),('B2','begründet_offen','Übernommene Vorher/Nachher-Vorschläge vollständig erhalten; historische und analytische Vergleichsrahmen je Karte prüfen.'),('B3','begründet_offen','48 gemeldete Metadatenlückenkarten,15 Wortlautfragen und bibliografische Einzellücken in Restlisten; keine Platzhalter als Lösung eingesetzt.'),('B4','behoben','Lemma,Originalwortlaut und Zitierstatus getrennt sichtbar. Exakte Zitatdarstellung ohne individuelle menschliche Bestätigung gesperrt.'),('B5','behoben','lemma_kurz für180 Karten importiert und im Prüfstand sichtbar; Originaltitel/Permalinks erhalten.'),('B6','begründet_offen','16 vorgeschlagene standardisierte Mechanismen und45 Akteursnamen übernommen. Keine automatische Zusammenführung institutionell verschiedener Akteure.'),('B7','begründet_offen','V7-Themenverknüpfungen separat; abgeleitete Verwandtschaft bleibt als Navigation erkennbar. Redaktionelle Bestätigung je Link fehlt.'),('B8','behoben','Content-Hashes,immutable Snapshots,Ereignisjournal und Entwurfsrevisionen implementiert. Historische Versionsfelder nicht rückwirkend umgeschrieben.'),('C1','behoben','Keine Pilot-/Prototyp-Positionierung; einheitliche Sie-Texte.'),('C2','behoben','V9-Intro als vollständiger redaktioneller Basistext eingebunden.'),('C3','nicht_betroffen','Historische V2-Mechanismendatei wird nicht als alternativer Kartenbestand importiert.'),('C4','begründet_offen','Beide Artikel unverändert als gesperrte Vorlagen inklusive Titelbild vorhanden; Livecheck und getrennte Artikelfreigabe fehlen.')]
write('FINALREPORT_PRUEFPUNKTE.md','# Abgleich Claude-/Codex-Prüfpunkte\n\n„Behoben“ bezeichnet den genannten technischen oder strukturellen Defekt in der privaten V9-Revision, keine menschliche Inhaltsfreigabe.\n\n| Punkt | Status | Nachweis/Grenze |\n|---|---|---|\n'+'\n'.join(f'| {a} | {b} | {c} |' for a,b,c in checks)+'\n\nCodex-Sperrgruppen:20 Recherchekandidaten,27 IFR-Karten,afd-remigration bleiben als48 eindeutige historische Fälle gesperrt. Alle180 V9-Inhaltsrevisionen benötigen darüber hinaus neue Review-/Freigabebelege. V8-Korrekturbezeichnungen wie „fachlich geklärt“ werden nicht als eigene menschliche Freigabe übernommen.\n\nMedienfälle NIUS/Apollo/COMPACT liegen geschützt als getrennte Quellensammlung vor. Keine neuen V3-Karten,keine Medien-/Partei-/Instituts-Gleichsetzung,keine Schädigungsabsicht aus Reichweite oder Wiederholung abgeleitet. Rechtlicher COMPACT-Kontext bleibt ein eigener Reviewpunkt; Primärentscheidung als Referenz in QUELLEN_URL_RESTLISTE.json.\n')
write('MIGRATION_DIFF.md',f'''# Migrationsdiff V3→V9

V3-Master unverändert;180/180 IDs und Slugs unverändert; historische Prüfstatus180/180 erhalten. Alle180 Karten haben V8-Anreicherungen in getrennten,hashadressierten privaten Snapshots. Vollständiges Before/After mit Original- und Zielhash: `REDAKTIONELLE_PATCHES_VORHER_NACHHER.json`. Die48 ursprünglichen Vorschläge werden zusätzlich unverändert in `PATCHES_48_UNVERAENDERT.json` aufbewahrt. Keine Überschreibung des V3-Masters.

20 Familien und21 Dossiers getrennt; Kartenzahl180,Objektzahl221. V8-Top-Level-Version lautet im gelieferten Datensatz weiterhin7.0-redaktioneller-arbeitsstand; dies wird als Herkunft erhalten und nicht als tatsächliche neue Freigabeversion interpretiert. Aktive technische Revision: V9 mit Inhaltshashes.

Die frühere V3-Veröffentlichungsvorbereitung ist historisch reproduzierbar, nicht auf V9 übertragen. PR1072 ist wieder Entwurf. Keine Produktionsänderung und kein Vercel-/Oracle-Hostingaufbau.

Footer-Regression repariert: Erkennung des gemeinsamen Site-Footers unterscheidet ihn von App-Footern; wiederholte Integration erzeugt keine doppelten Lexikonlinks. Renderer-Hilfsseite wird nicht öffentlich exportiert. Im lokalen vollständigen historischen Testartefakt:18.560 Routen erreichbar,0 fehlende Footer,0 defekte Skip-Links,eine deutsche Footer-Variante. Das ist eine lokale Integrationsregression mit historischem V3-Inhaltsfixture, kein V9-Produktionsnachweis. Der erste Vergleich gegen den anders umfangreichen späteren CI-Stand war wegen gesunkener3-Klick-Abdeckung rot; der anschließende Vergleich derselben lokalen Ausgangsfassung besteht,ohne Gate-Abschwächung. Vollständiger V9-Produktionsbuild und CI nach späterer konkreter Freigabe erneut notwendig.

Bildtest: Ein paralleler Neuaufbau verursachte eine temporär fehlende Vorlage. Rendering und Generator werden nun per Sperrdatei serialisiert; kompletter Bildtest danach erneut ausgeführt. Keine Aussage über vollständige Bildfreigabe aus einem Teiltest.
''')
write('NARRATIV_UMSETZUNGSBERICHT.md',(B/'NARRATIV_LINK_QA_180.md').read_text())
write('DEPLOYMENT_CHECKLIST.md','''# Deployment-Checkliste V9

- [x] V3-Originalhash und180 IDs/Slugs erhalten.
- [x] V8-Patches getrennt,keine neue Inhaltsfreigabe.
- [x]20 Familien und21 separate Dossiers importiert.
- [x] Geschützte lokale Laufzeit,HTML/Daten/Assets/API gegen unautorisierten Zugriff getestet.
- [x] Quellenstatus,Restlisten,Golden-State,Browser/Axe,Navigation und Screenshots dokumentiert.
- [x] Artikel als unveröffentlichte Word-/Markdown-Vorlagen abgelegt; lokale Linkziele vorbereitet.
- [ ] Vorhandenes offizielles Natalie-Redaktionskonto identifizieren und vertrauenswürdig anbinden.
- [ ] Quellen-/Kontextprüfung,fachlicher Review,konkrete Narrativlink-Prüfung abschließen.
- [ ] Festgelegten Releaseumfang mit Inhalts- und Artefakthash durch Natalie Weber genehmigen lassen.
- [ ] V9-Produktionsadapter mit echter Identität und Signaturentscheidung abschließend integrieren/testen; Legacy-Publikationspfad bleibt gesperrt.
- [ ] Manuelle VoiceOver-/NVDA- und vollständige WCAG2.2-AA-Abnahme.
- [ ] Vollständigen Website-Release aus exakt diesem Commit/Artefakt lokal und in CI erneut prüfen; aktuelle Produktion backup-first sichern.
- [ ] Erst nach Freigabe Produktivdeployment auf vorhandenen GitHub-Pages-Weg; keine neue Vercel-/Oracle-Infrastruktur.
- [ ] Danach echte Live-URLs,Suchpfade,Footer/Portale und alle Artikel-Links prüfen.
- [ ] Erst danach erneute eigenständige Freigabe von Journalartikel und LinkedIn-Vorlage einholen. Keine automatische Veröffentlichung.
''')
write('QUELLEN_URL_RESTLISTE.json',json.dumps({'restrictedOrBroken':[u for u in urls if u.get('status')!=200],'proposedReplacements':[{'old':'https://www.enisa.europa.eu/sites/default/files/2025-11/ENISA%20Threat%20Landscape%202025_0.pdf','candidate':'https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025','status':'reviewable_proposal_not_applied'}],'primaryLegalContext':[{'url':'https://www.bverwg.de/240625U6A4.24.0','role':'Primärentscheidung; genaue Reichweite,Tenor und tragende Gründe im fachlichen Review prüfen; kein Medienwirkungsbeweis'}]},ensure_ascii=False,indent=2))
shutil.copy2(S/'02_QUELLENPRUEFUNG_48/PRUEFSTATUS_48.csv',B/'RESTSPERREN_MIT_GRUND.csv')
write('RUNBOOK_V9.md','''# V9 lokal fortführen

Arbeitscheckout: `outputs/wirkungslexikon/release-repo`. Keine Bereinigung fremder Änderungen im Hauptcheckout.

```sh
node scripts/wirkungslexikon/v9-import.mjs /absoluter/pfad/zum/entpackten/V9-Paket
node scripts/wirkungslexikon/v9-build.mjs
node scripts/wirkungslexikon/v9-build.mjs --public
node scripts/wirkungslexikon/v9-test.mjs
node scripts/wirkungslexikon/v9-golden-test.mjs
WL_VERSION=9 WL_PORT=8799 WL_HOST_ARTIFACT=/absoluter/pfad/zum/lokalen/website-testartefakt node scripts/wirkungslexikon/serve.mjs
node scripts/wirkungslexikon/v9-browser-test.mjs
```

Import nur bei neuem leerem Store; bestehende Arbeit wird nicht überschrieben. `--public` erstellt ohne reale Freigaben ausschließlich eine lokale Negativprobe mit0 Karten,keinen Release. Hauptpolicy ist nicht freigegeben. Der Server bindet nur an Loopback; alle Vorschau- und Fallback-Seiten bleiben geschützt. Globaler Fallback nutzt ausschließlich das vorhandene öffentliche Website-Testartefakt,keine lokalen Privatdaten.

Bildtest seriell nach dem Build,mit vorhandenem Playwright: `render-social.mjs --out outputs/wirkungslexikon/v9/preview`. Währenddessen kein Build; Sperrdatei verhindert diese Überschneidung. Bildrenderer auf temporärem Loopback-Port verlangt einen flüchtigen nicht ausgegebenen Token. Entwurfsbilder sind als Entwurf gekennzeichnet. Bei einem abgebrochenen Prozess Sperrdatei nur entfernen,nachdem der Prozess nachweislich beendet ist.

Identitätskonfiguration ist absichtlich deaktiviert. `identity-trust.example.json` enthält keine echten Kontoangaben oder privaten Schlüssel. Keine Kontozuordnung aus Anzeigenamen,technischem Token oder Chat-Blankozustimmung erfinden. Das Beispiel darf keine Freigaben vortäuschen. Die signierten Kernfunktionen sind isoliert getestet; tatsächliche Kontointegration bleibt der letzte technische Anschluss nach Identifizierung.

Originalpaket,Snapshots,Diffs,Artikel und Berichte nur privat behandeln. Keine dieser Dateien pauschal zu GitHub hinzufügen oder als öffentliche Release-Assets laden. Das ältere48er-Prüfpaket in Dropbox bleibt unverändert.
''')
write('README.md','''# Umsetzung V9 – prüfbarer Staging-Stand

180 ursprüngliche Wirkungskarten,20 Narrativfamilien,21 eigenständige Programm-Dossiers technisch übernommen. Vollständige Webtexte und redaktionelle Prüffelder in der geschützten lokalen Laufzeit. Keine V9-Veröffentlichung,keine neue Kartenfreigabe,keine Artikelveröffentlichung.

Start: `STAGING_URL.txt`. Fortschreibung: `RUNBOOK_V9.md`. Quellen und Restarbeiten: `QUELLEN_QA_180.md`,`PROGRAMM_QA_21.md`,`NARRATIV_LINK_QA_180.md`,`RESTLISTE_OFFENE_QUELLEN.csv`,`FINALREPORT_PRUEFPUNKTE.md`. Tatsächliche Testergebnisse: `TESTNACHWEISE/`. Screenshots: `SCREENSHOTS_INDEX.md`. Freigabevoraussetzungen: `DEPLOYMENT_CHECKLIST.md`,`HITL_GATE_TESTS.md`. Prüfsummen/Commit: `RELEASE_KANDIDAT_SHA256.json`.

Noch offen: offizielle Kontoanbindung,inhaltliche menschliche Reviews und versionsgebundene Freigabe; danach Abschluss des V9-Produktionsadapters,vollständiger Release-CI,manuelle Screenreader-Abnahme und Livecheck. Der aktuelle Stand ist ein überprüfbarer technischer Staging-Kandidat,kein abgeschlossen freigegebener Website-Release.

Die allgemeinen früheren Freigaben wurden gemäß neuem V9-Auftrag nicht auf den neuen Inhaltsstand übertragen. Alle48 historischen Sperren bleiben erhalten; sämtliche180 neuen V9-Revisionen und21 Dossiers benötigen aktuelle Freigabebelege. Das frühereDropbox-Prüfpaket wurde nicht verändert. Keine Zugangsdaten oder Signaturschlüssel im Übergabepaket.
''')
print('V9 reports generated')
