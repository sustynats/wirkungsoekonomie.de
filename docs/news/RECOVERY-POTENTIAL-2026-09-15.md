# Wirkungspotenzial: konservative Wiederherstellung am 15.09.2026

## Auftrag und fachliche Grenze

Natalie meldete erneut leere Potenzialbalken trotz der vereinbarten Ex-ante-Bewertung. Fehlende Messdaten sind kein Grund, ein begründbares Wirkungspotenzial zu unterdrücken. Richtung, Tragweite, Eintrittswahrscheinlichkeit, Evidenz und zeitlicher Status bleiben getrennt. Keine erfundenen Zahlen oder Pflichtpfade: Ohne tragfähiges Modell bleibt eine neue Veröffentlichung in Recherche/HOLD. Historische Originalbewertungen werden nicht umgeschrieben.

## Gefundene Lücke und begrenzte Reparatur

Die inzwischen zurückgenommene Ausnahme für recherchierte Nullprofile war in manueller Veröffentlichung, Übernahme geprüfter Bestandsbewertungen und Abdeckungsprüfung noch nicht durchgängig ausgeschlossen. Aus dem vorbereiteten PR #771 wurden ausschließlich die folgenden fünf Quell-/Testdateien übernommen:

- scripts/news/reviewed-impact.mjs
- scripts/news/publish-reviewed.mjs
- scripts/news/impact-coverage.mjs
- tests/news/reviewed-impact.test.mjs
- tests/news/impact-coverage.test.mjs

Manuelle Freigaben und Übernahmen verlangen damit dieselben vollständigen modellierten MPD-Dimensionen und unabhängigen Gegenstands-/Vergleichsprüfungen wie der Worker. Ein recherchiertes historisches Nullprofil zählt nicht als vollständig bewertetes Potenzial und darf nicht durch eine neue Freigabe zum aktuellen vollständigen Profil erklärt werden.

## Herkunft und Erhaltungsregeln

Quelle der bereits geprüften Profile: PR #771, Commit 6048f1b5336458cae9501088180af01f93409772.
Vergleichsbasis: a985626602d3deebdd8ae7625bfcd53874b31a77.
Erhaltener aktueller main-Stand: 63540eb8a8fd62a5b8f392cf5ac4089efafcac3f.
Validierter Reparaturcommit: f9ba55940a82e5a9ebd3282bce391da76ec967ec.

Dreiwegeabgleich pro Story und Feld: Nur konfliktfreie Änderungen aus der geprüften Quelle wurden übernommen. Alle 1.775 Story-Identitäten, jüngeren Importänderungen, Veröffentlichungsdaten, URLs, vorhandenen Originalpotenziale und bisherigen Versions-/Wirkungsverläufe blieben erhalten. Keine neue fachliche Bewertung und keine Provider-/LLM-Aufrufe. Keine Übernahme der anderen Bridge-/RPC-Änderungen aus #771. Die temporäre Wiederherstellungsautomation wurde nach erfolgreichem Lauf aus dem endgültigen Änderungsumfang entfernt.

## Wiederhergestellte Profile

Zehn vorhandene unabhängig geprüfte Profile wurden wieder eingebunden, einschließlich Belegen und Prüfkennungen:

- wt-8d118596e0a5b188
- wt-aa6a91f8546c7299 (KI-Warnungen/AISI, Screenshot des Auftrags)
- wt-fb34b1d598b813c7
- wt-20282aa68ebd0fa9
- wt-9a5ca53dea779f2f
- wt-53ce09a75455bdf7
- wt-89f8097af783b7e6
- wt-b6a1d81a1c4e660b
- wt-eb36c70c560b9e5d
- wt-bbf462183939f712

Der bereits auf main korrigierte Syrien-Beitrag wurde nicht durch eine ältere Bewertung ersetzt.

## Bewusst zurückgehalten

- wt-e92f362208a8792e: Konflikt mit einer jüngeren pending_update-Bearbeitung.
- wt-a82ecd0000a14269: Änderung des geschützten original_potential_assessment.
- wt-e8ec5c7f64053fc8: Änderung des geschützten original_potential_assessment.

Diese drei Fälle brauchen eine gezielte getrennte Zusammenführung. Weder dieser Bericht noch die Reparatur behaupten, alle historischen unvollständigen Profile seien neu bewertet. PR #771 darf nicht nachträglich durch pauschale Übernahme seiner stories.json jüngere Daten oder diese Schutzentscheidungen überschreiben.

## Tatsächlich ausgeführte Prüfung

GitHub Actions Run 34904427943, Job 104177667185, erfolgreich am 14.09.2026, 22:34 UTC (15.09.2026, 00:34 Europe/Berlin).

- 1.371 Nachrichten-/Betriebstests bestanden, kein Fehler und kein übersprungener Test.
- 41 Umfragetests bestanden.
- Quellenbindung und vollständige modellierte Dimensionen für alle zehn wiederhergestellten Datensätze geprüft.
- Ticker, Umfrageseiten und Suchindex neu erzeugt; news:validate bestanden.
- Alle zehn erzeugten Artikelseiten enthalten wieder mindestens drei numerische Potenzialbalken.
- Der Build verändert die kanonischen Bewertungen nicht: stories.json SHA-256 6dfdc22f134a65582eb5368a7c09f8942d5c45eefd66e6e3941271d1a19acb3d.

Prüfartefakt: potential-recovery-34904427943, Artifact-ID 10372291243, enthält den maschinenlesbaren Wiederherstellungsbericht und das Testprotokoll (7 Tage Aufbewahrung).

Dies dokumentiert die erfolgreich getestete Reparatur. Die Veröffentlichung erfolgt getrennt über einen regulären Pull Request und die bestehende Pages-Pipeline; der Testlauf allein ist kein Nachweis einer Live-Veröffentlichung.
