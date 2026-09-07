# Leseführung der Wirkungsakten

Stand: 4. September 2026. Eigenes Folge-Release nach der Aktenkonsolidierung.

Die eigentliche Nachricht steht als erster ausführlicher Textblock unter Titel, Symbolbild und Abschnittsnavigation. Ein kompakter Nachrichtenstand bleibt davor sichtbar; vorläufige und widersprüchliche Quellenlagen werden nicht erst am Ende offengelegt. Korrekturhinweise bleiben ebenfalls oben.

Reihenfolge: „Worum geht es?“ → „Was ist wie belegt?“ → Faktencheck → Konsolidierungshinweise und „Auf einen Blick“ → wirkungsökonomische Einordnung → Folgen, systemische Bedeutung und offene Fragen. Quellen und Versionsverlauf bleiben unverändert erreichbar. Der Belegstand hat einen eigenen Sprunglink; Altdaten ohne Nachrichtenstatus erhalten keinen leeren Abschnitt und keinen toten Link.

Dies ist eine reine Darstellungsänderung. Nachrichtentexte, Belege, Versionsstände und Veröffentlichungsdaten werden nicht verändert; daraus entsteht keine neue Push-Mitteilung. Die separate öffentliche Release-Revision und aktualisierte Cache-Version machen den neuen Seitenaufbau in der WebApp verfügbar.

Nachtrag: Nummerierte SDG-Verweise im Referenzrahmen tragen ihre ausgeschriebenen Zielnamen aus dem bestehenden Website-Katalog `assets/data/sdg-reference.json`. Auch Kurzlisten wie „SDG 7, 9 und 13“ werden verständlich ausgeschrieben. Einschränkungen, andere Referenzrahmen, Unterzielnummern und SDG+ bleiben erhalten. Die Formatierung erfolgt ausschließlich bei der Seitenerzeugung, auch für bestehende Akten; keine Neubewertung, keine zusätzliche KI-Anfrage und kein neuer Nachrichten-Push.

Die Übersicht bietet je Nachrichtenkarte „Merken“ und „Teilen“ nebeneinander. Der gemeinsame Merkspeicher wird bei Seitenrückkehr, Änderungen in anderen Tabs und beim erneuten Aktivieren der WebApp abgefragt. Gemerkte Nachrichten zeigen „★ Gemerkt“; erneutes Betätigen entfernt die Markierung. Übersicht und beide Detailseiten-Positionen verwenden dieselbe URL-Identität und bestehende Merkliste. Teilen übergibt die konkrete Artikeladresse, nie die Übersichtsseite. Ohne native Teilen-Funktion wird diese Adresse kopiert oder zur manuellen Übernahme angezeigt.

Abnahme: 166 News-Tests einschließlich Reihenfolge, Warnhinweisen, unveränderten Daten und Legacy-Fallback. Browserprüfung mit 390 und 1365 Pixeln, funktionierender Belegstand-Navigation, ohne horizontalen Seitenüberlauf und ohne festgestellte JavaScript-Fehler. Kein Test auf einem physischen iPhone.

## Lesertexte statt Redaktionsanweisungen (6. September 2026)

Die gemeinsamen Vorlagen für Meldungen und WÖk-Analysen zeigen konkrete Befunde, Belege, Attribution und Wissensgrenzen. Allgemeine Arbeitsregeln wie „Wahrheit zuerst“ werden angewendet, nicht als Redaktionshinweis in jeden Artikel geschrieben. Methodik bleibt über die vorhandenen Methodikseiten erreichbar. Interne Begriffe wie „Claim Ledger“ erscheinen nicht als Lesertext; die zugehörigen Aussagen und Belege bleiben einsehbar.

`reader-copy.mjs` prüft eng gefasste Redaktionsreste in öffentlichen Textfeldern sowie im erzeugten HTML. Die bestehenden Qualitätsgates von Kurz- und Langanalysen weisen solche Ausgaben zur Korrektur zurück. Triggergründe, Prüfprobleme und andere interne Felder werden davon getrennt behandelt; Texte werden nicht still abgeschnitten oder verändert. Eine Meldung über ein technisches Unternehmen oder einen redaktionellen Vorgang ist dadurch nicht pauschal ausgeschlossen. Die Erkennung ist eine zusätzliche Sicherung, kein Beweis, dass jeder denkbare Redaktionsrest automatisch erkannt wird.

`news:validate` prüft weiterhin die tatsächliche Reihenfolge von Sachverhalt und Wissensgrenze statt das frühere Schlagwort zu verlangen. Bestandsseiten werden aus unveränderten Daten neu gebaut: keine Neubewertung, keine neuen Veröffentlichungstermine, keine bezahlte Neuanalyse, keine neue Nachrichten-Pushmeldung. Die öffentliche Release-Revision aktualisiert die WebApp-Darstellung.

Geprüft: 442 News-Tests, sämtliche 104 aktiven Wirkungsakten und 13 veröffentlichten WÖk-Analysen im Ausgangsbestand, News-Build/Validierung und Quellenintegrität (214 Quellenzuordnungen). Browser: Seelze-Meldung mit erhaltenem Korrekturhinweis und Mediencheck, Breiten 320/390 Pixel ohne Überlauf; EU-Haushaltsanalyse bei 1365 Pixeln mit aufklappbaren Belegen und funktionierendem Methodiklink. Keine Browserfehler festgestellt; kein physischer iPhone-Test.

## MPD: Relevanz und Richtung getrennt sichtbar (7. September 2026)

Die gemeinsame Wirkungskarte von Übersicht und Detailseite zeigt unter jedem Relevanzbalken einen eigenen Richtungsbefund. „Positiv · Potenzial“, „Negativ · Risiko“, „Gemischt · Chancen / Risiken“ und „Richtung offen“ sind über Text, unterscheidbare SVG-Zeichen und kontrastreiche Farben erkennbar. Die bestehenden MPD-Farben und Balkenhöhen bleiben unverändert. Eine kurze Legende erklärt: Die Richtung ist eine analytische Einschätzung, kein Nachweis bereits eingetretener Wirkung. Gemischte Pfade werden nicht miteinander verrechnet.

Für Altdaten wird ausschließlich der vorhandene Befund aus `analysis.visuals.tendency` wiederverwendet. Im geprüften Ausgangsbestand betrifft das 71 von 106 aktiven veröffentlichten Einzelakten. Ohne gespeicherten Befund bleibt die Richtung ausdrücklich offen; insbesondere werden weder Relevanz, Schlagworte noch einzelne Wirkpfade als Ersatzbewertung benutzt. Keine historische KI-Neuanalyse, keine neue Bildgenerierung und keine Änderung der Artikeltexte, Quellen, Versionen oder Publikationsdaten. Die neue Darstellungsrevision wird über den bestehenden Feed-/WebApp-Mechanismus verbreitet.

Neue Basiseinordnungen führen das kurze Enum unmittelbar in `human.tendency`, `planet.tendency` und `democracy.tendency`, auch wenn optionale Diagramme wegen des Eingabelimits entfallen. Es entsteht kein separater KI-Aufruf. Ein expliziter neuer Befund, einschließlich „offen“, hat Vorrang vor älteren Visualisierungsdaten. Ungültige Werte werden in der Darstellung offen behandelt; fehlende optionale Grafikdaten werden nicht zu einer neuen Publikationssperre. Die fachlichen Qualitäts- und Quellengates bleiben bestehen.

Regressionstests prüfen alle vier Zustände, alte und neue Daten, unveränderten Bestand, die Publishing-Normalisierung, Übersicht/Detail, fehlerhafte Werte und vollständige Quellenpakete am bestehenden Eingabelimit.

Die Artefakt-Abnahme deckte außerdem einen Verweis auf einen nie veröffentlichten, später zusammengeführten Discovery-Kandidaten auf. Der Konsolidierungsblock verlinkt nun nur tatsächlich erzeugte öffentliche Seiten, einschließlich archivierter Veröffentlichungen. Zusammenführungsdaten und Quellen bleiben unangetastet; unveröffentlichte Kandidaten werden weder als historische Veröffentlichung dargestellt noch nachträglich publiziert.

Abnahme: 517 News-/Betriebsmonitor-Tests bestanden; News-Build, News-Validierung, Syntax-/Typecheck und vollständiger Publikationsartefakt-Build einschließlich Link-, Datenschutz- und Größenprüfung bestanden. Sprach-Lint: dieselben 25 bereits vorhandenen Fundstellen, keine neue. Chromium bei 320, 390 und 1440 Pixeln: Übersicht, Symbolbild und Wirkungskarte, Navigation zur Detailseite und beide MPD-Blöcke ohne horizontalen Überlauf oder JavaScript-Fehler. A11y-Prüfung der Wirkungskarten ohne erkannte Verstöße; automatische Kontrastbestimmung wegen der Hintergrundebenen teilweise unvollständig, deshalb zusätzlich visuell geprüft. Die opaken Richtungskennzeichnungen besitzen auf dunklem Grund Textkontraste über 8:1. Kein physischer iPhone-Test.
