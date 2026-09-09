# Ereignispriorität und Missed-News-Check

Implementierung vom 09.09.2026. Ausgangsdiagnose: [WIRKUNGSTICKER-RELEVANZ-DIAGNOSE.md](WIRKUNGSTICKER-RELEVANZ-DIAGNOSE.md).

## Änderung gegenüber dem bisherigen System

Die bestehende Pipeline bleibt erhalten. Rohdokumente werden weiterhin zugangssicher abgerufen, datiert, gehasht und vor einer bezahlten Prüfung zu Ereignissen zusammengeführt. Das neue Modul bewertet das gemeinsame Ereignis zusätzlich zum bisherigen Materialitätsfilter. Es entscheidet weder über Wahrheit noch über MPD-Richtung oder Publikationsfreigabe.

- Ereignisidentität: Bestehende Aktenzeichen-, Sachverhalts-, Orts- und Verfahrensschutzregeln bleiben erhalten. Für Plenarereignisse kommt Institution + Vorgang + Tag hinzu, unabhängig von Überschrift, Parteizustimmung oder Medium. Ein Kommentar, ein Rückblick oder ein anderer Tag ist nicht automatisch derselbe neue Vorgang.
- Relevanz: Gemeinsame Teilwerte für Tragweite, Breaking-Signal, Institution, Deutschlandbezug, Wirtschaft, Politik, Neuigkeit, Dynamik, mögliche Quellenursprünge, Evidenzhinweis und WÖk-Relevanz. Regeln erkennen zusammengesetzte Ereignismerkmale; keine Parteiboni und keine allgemeine Medienrangliste.
- TOP/HIGH/NORMAL/LOW: TOP wird vor dem weichen Themenausgleich und vor der Reserve für ältere Arbeit geschützt. Innerhalb einer Stufe bekommen unterrepräsentierte Kategorien einen moderaten Bonus. Es gibt keine starre Publikationsquote.
- Nachrichtenkern: Auch belegte parlamentarische Debatten und politisch folgenreiche Aussagen können Nachrichten sein; ein Beschluss ist nicht zwingend. Ein aktueller Kommentar allein erhält keinen neuen Nachrichtenbonus. Ein Gerichtsbericht über eine frühere Tat ist keine akute Sicherheitslage.
- Lifecycle im bestehenden `newsroom.events`: detected, breaking, developing, confirmed, major_update, resolved. Bestätigung folgt ausschließlich einem veröffentlichten, qualitätsgeprüften Faktenstatus; Schweigen oder viele Mediennamen erzeugen keine Bestätigung/Auflösung. Verlauf maximal zwölf Statuswechsel.

## Teilwerte sind keine wissenschaftlichen Wirkungswerte

Die Werte 0–100 sind nachvollziehbare **technische Prüfprioritäten**, keine Eintrittswahrscheinlichkeiten, kein Nachweis von Unabhängigkeit und keine numerische WÖk-Bilanz. Der gewichtete Ereigniswert verwendet Tragweite 55 %, Institution 10 %, Deutschlandbezug 8 %, Aktualität 8 %, WÖk-Materialität 9 %, Herkunftsbreite und Nachrichtenbeschleunigung je 5 %. Eine akute Sicherheitslage erhält acht Prioritätspunkte. Die bestehende begründete Materialitätspriorität bleibt als Untergrenze erhalten. Die Werte und Gründe stehen im Audit.

Viele URLs desselben Herausgebers, ausdrücklich bekannte Verlagsgruppen, gleiche Agenturherkunft oder lange identische Passagen zählen nicht als unabhängige Belege. `possible_independent_origins` ist ausdrücklich eine vorläufige Herkunftsschätzung. Ein einzelner amtlicher Hinweis kann hohe Prüfpriorität haben; ein unverifizierter Verdacht bleibt dennoch Verdacht.

## Zusätzliche Erkennung ohne zusätzlichen KI-Dienst

Innerhalb bereits freigegebener Herausgeber werden vier überprüfte öffentliche Zugänge verwendet:

1. Bundestag: [Aktuelle Themen und Plenarberichte](https://www.bundestag.de/static/appdata/includes/rss/aktuellethemen.rss), im [offiziellen RSS-Verzeichnis](https://www.bundestag.de/services/rss) aufgeführt.
2. SPIEGEL: [News-Sitemap](https://www.spiegel.de/sitemaps/news-de.xml), im Robots-Dokument deklariert. Nur Nachrichtenmetadaten, kein Paywallabruf.
3. ZDFheute: Politik- und Wirtschaftsindizes aus dem [Sitemap-Verzeichnis](https://www.zdfheute.de/sitemap-zdfheute.xml). `lastmod` dient höchstens zur Auswahl eines Prüflinks, niemals als Veröffentlichungsdatum.

Zehn Kategorien bilden die Suchmatrix. Aus dem gemeinsamen Metadatenpool werden konkrete Ereignisse und Abdeckungslücken priorisiert; nicht einfach die ersten Treffer des ersten Herausgebers. Höchstens **zwei Indexabrufe**, **zwei zusätzliche zulässige Metadatenprüfungen** und **zwölf Discovery-Kandidaten je Lauf**; je Endpunkt mindestens 60 Minuten Abstand. Mehrere Indizes teilen sich die Abrufreserve. Etags und Änderungszeiten werden weiterverwendet. Robots-, RSL-, Login-, Nutzungs- und Paywallregeln gelten unverändert.

Agenda-Hinweise werden getrennt gespeichert. Eine Terminmeldung belegt keine Produktvorstellung, ein erwartetes Produkt keine technischen Eigenschaften. Ein konkreter Veranstaltungstag wird nur aus einem ausgewiesenen Datum übernommen, nicht aus der Artikelzeit erraten.

## Nachkontrolle und Kostenbegrenzung

Der beobachtete Rohbestand wird unabhängig von der bisherigen Auswahl mit veröffentlichten/ausgewählten Ereignissen verglichen. Kategorien ohne Veröffentlichung seit sechs Stunden lösen nur dann einen redaktionellen Hinweis aus, wenn ein passendes größeres Ereignis bereits mindestens eine Stunde beobachtet wurde. Einzelne Parser-/Abruffehler, abrupte Eingangsabfälle, hohe Dublettenanteile und Herkunftskonzentration sind im Audit sichtbar. Ein leerer, unveränderter HTTP-304-Abruf ist kein Parserfehler.

Die Routinekontrolle berücksichtigt höchstens 600 aktuelle, freigegebene Dokumente aus 48 Stunden. Sie verwendet vorhandene Event-Zuordnungen und enge Identitätsanker, statt bei jedem Lauf den ganzen Nachrichtenbestand erneut paarweise zu vergleichen. Höchstens vier auffällige Ereignisse gelangen zur Nachprüfung in **dieselbe** bestehende Queue. Gleicher Evidenzhash und gleiche Regelversion führen nicht zu wiederholten bezahlten Nachprüfungen. Historische Daten deaktivierter Quellen bleiben erhalten, werden aber nicht darüber reaktiviert.

Es gibt keine neue KI-Lane, keine neue Such-API und kein erhöhtes Anbieter-, Stunden- oder Monatslimit. Unveränderte Texte werden vor KI dedupliziert. Ausführliche interne Score-Telemetrie bleibt aus bezahlten Prompts heraus. Alle Quellenidentitäten, Belegrollen und erforderlichen Qualitätsgates bleiben im Prüfprozess erhalten.

## Diagnose verwenden

```sh
npm run ticker:audit -- --date=2026-09-09
npm run ticker:audit -- --date=2026-09-09 --out=reports/event-discovery
```

CLI: ausschließlich lesend, null Modellaufrufe. Mit `--out` entstehen JSON und Markdown; ohne Option nur Konsolenausgabe. Berichte gehören in `reports`, nicht als interne Redaktionsanweisung auf Leserartikel. Detailwerte werden außerdem in den bestehenden Laufbericht und die Ereignisobjekte geschrieben. Der bestehende Discord-Monitor unterscheidet Abdeckungshinweise von Betriebsstörungen und vermeidet Meldungen auf Basis veralteter Coverage-Berichte.

## Wiederholung des Ausgangsstands mit neuen Regeln

Gleiche gespeicherte Quellen, Stand 09.09.2026, 17:14 MESZ; keine rückwirkende Publikationsbehauptung:

| Ereignis | Vorher | Neuer Prüfwert |
| --- | --- | --- |
| Generaldebatte | Aufgeteilt, teils lokale Abwertung, teils KI-Ablehnung wegen fehlendem Beschluss | Gemeinsamer beobachteter Cluster: 75 / TOP |
| Söders Aussage zum Verbotsverfahren | 10, vor KI verworfen | 49 / NORMAL, regulär prüfbar |
| Kodi-Filialschließungen (WDR) | 10, vor KI verworfen | 45 / NORMAL, regulär prüfbar |
| Erwartetes erstes Falt-iPhone (Wiwo) | 10, vor KI verworfen | 42 / NORMAL, Erwartung ausdrücklich nicht als Vorstellung |
| Google/Finnland (Wiwo) | 42, Evidenzvorbehalt der KI | 54 / HIGH; der Evidenzvorbehalt wird nicht überstimmt |
| USA–China-KI-Konflikt (DLF) | 10, vor KI verworfen | 45 / NORMAL; Vorwurf bleibt zugeschrieben |

Der begrenzte Tagesaudit mit bis zu 1.000 Dokumenten findet in diesem Snapshot 33 größere Ereigniskandidaten: sechs sind einer Veröffentlichung zugeordnet, 27 benötigen Prüfung oder haben begründete Vorbehalte. Diese 27 sind **nicht** 27 fertige, sicher fehlende Artikel. Die zwölf vorgegebenen Recherchefälle besitzen zusätzlich lokale Auswahltests; nicht eingelesene Fälle werden dadurch nicht nachträglich als entdeckt ausgegeben.

## Verbleibende Grenzen

- Dies ist eine begrenzte Suche in freigegebenen Indizes, keine vollständige Websuche und keine Garantie, jede große Nachricht zu erfassen. Quelle außerhalb des Bestands erfordert weiterhin zulässigen Zugang und Belegprüfung.
- Ereignisidentität ist konservativ und regelbasiert, keine allwissende semantische Zuordnung. Uneindeutige Meldungen bleiben getrennt; bestehende Schutzregeln gegen falsche Lageakten werden nicht abgeschaltet.
- Parser ohne belastbare Titel-/Publikationsmetadaten bleiben sichtbar zurückgestellt. Nutzungsfreigabe wird nicht aus technischer Erreichbarkeit erfunden.
- Die aktuelle Rohdatenbank speichert die zuletzt bekannte Quellenfassung. Historische Auswertungen sind deshalb keine vollständige Rekonstruktion sämtlicher früherer Quelltexte.
- Google/Finnland und andere berichtete Vorhaben benötigen weiterhin tragfähige Originalbelege. Hohe Priorität heilt keine Evidenzlücke.

## Erster Produktionslauf und gezielte Nachbesserung

Der erste Lauf auf Implementierungsstand `0bbfbfa1a0` endete am 09.09.2026 um 18:38 MESZ technisch erfolgreich ([Lauf 34376394248](https://github.com/sustynats/wirkungsoekonomie.de/actions/runs/34376394248)). Die beiden freigegebenen Indizes lieferten zwölf Kandidaten ohne Abruffehler, der Missed-News-Check stellte vier Ereignisse zur Nachprüfung. Im verbleibenden rollenden Stundenkontingent waren vier KI-Anfragen möglich: geschätzte Modellkosten 0,038422 USD, null neue Veröffentlichungen. Das ist **kein** Preis pro veröffentlichter Nachricht.

Die Generaldebatte wurde im tatsächlichen Auswahlprotokoll mit Bundestags-Primärquelle und zehn Quelldokumenten als **80 / TOP** ausgewählt. Trotzdem lehnte die KI sie erneut wegen fehlender Entscheidung/Mittelverschiebung ab. Das war keine Cache-Wiederverwendung. Der redaktionelle Prüfauftrag stellt deshalb nochmals ausdrücklich klar: Ein belegter, erstmals berichteter zentraler parlamentarischer Vorgang kann Informations- und Folgenrelevanz besitzen, ohne schon Beschluss oder messbare Wirkung zu sein. Nur aktuelle, unveröffentlichte Materialitätsablehnungen mit passendem Ereignissignal bekommen bei geänderter redaktioneller Regel eine einmalige Wiedervorlage. Echte Evidenzablehnungen und veröffentlichte Historie werden nicht pauschal erneut analysiert. Die normalen Kapazitäts- und Qualitätsgates bleiben verbindlich.

Der erste Ranking-Backfill hatte außerdem unveränderte veröffentlichte Quellen wieder zur Prüfung eingereiht. Künftige Ranking-Backfills schließen diese aus; bereits erzeugte, exakt unveränderte Wiederprüfungen werden lokal abgeschlossen. Hash **und** vollständiger Quellen-Prüffingerprint müssen übereinstimmen; veränderte Belege, Zusammenführungen und fällige Folgeprüfungen bleiben offen. Im Diagnosebericht werden alte Rohdatenfragmente nun vor der Zählung auf ihre gemeinsame Akte aufgelöst. Der dort gezeigte Auswahlwert stammt aus dem tatsächlichen Entscheidungsprotokoll statt aus einer kleineren Rohdaten-Teilmenge.

## Empfohlene nächste Verbesserungsstufen

1. Verbliebene Discovery-Lücken gezielt mit zulässigen amtlichen Sicherheits-, Standort- und Forschungszugängen schließen. Ein öffentlicher Index allein liefert noch keinen vollständigen journalistischen Beleg; keine pauschale Quellfreigabe oder erhöhte Abrufmenge.
2. Den gespeicherten Regressionstag um weitere reale Tage und Gegenbeispiele ergänzen: gleiche Orte/Personen bei verschiedenen Ereignissen, spätere Rückblicke, gemeinsame Agenturherkunft und korrekt zurückgestellte Meldungen. So werden übersehene **und** fälschlich hochgestufte Ereignisse messbar.
3. Zeit bis zur geprüften Erstveröffentlichung, Themenabdeckung und Kosten pro neuer Veröffentlichung gemeinsam auswerten. Ein günstiger Ablehnungslauf ist kein Beleg für günstige Veröffentlichungen; eine höhere Prüfquote allein ist noch keine bessere Versorgung.

## Verifikation und Veröffentlichung

Neue Regressionen prüfen zwölf Ereignistypen, 15→1-Clustering einschließlich eines vollständigen Runner-Durchlaufs, Herausgeber-/Agenturabhängigkeit, einquellige Breaking-Erkennung, Gerichtsrückblicke, Kommentarabgrenzung, TOP-Schutz, weichen Themenausgleich, begrenzte Indexsuche, Datumsschutz, Missed-News-Cooldown, Lifecycle, Audit ohne KI und getrennte Monitoringwarnungen. Bestehende Materialitäts-, Evidenz-, MPD-, Kosten-, Rechte- und Publikationstests bleiben verbindlich.

Build und Deployment verwenden vorhandene GitHub Actions/GitHub Pages. Kein Vercel-Build oder Hostingwechsel. Rückfall: Policy-Schalter `event_relevance.enabled` deaktiviert Indexsuche/Nachkontrolle/Queue-Ausgleich; vollständiger Rollback erfolgt per gezieltem Revert des Implementierungscommits unter Erhalt zwischenzeitlicher Nachrichten-Datencommits.
