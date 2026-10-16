# Wirkungslexikon und SDG+: kontextbezogene Referenzen

Stand: 16.10.2026. Auftrag Natalie Weber; fachliche Grundlage: führender Begriffsleitfaden v1.8 und WÖk-Kernreferenz. Die Referenzverknüpfung verändert keine freigegebene Kartenrevision und keinen Quellenstatus.

## Pflege

`content/wirkungslexikon/sdgplus-links.json` enthält die Ergänzungstexte und die tatsächlich vorhandenen Zielpfade. Sie ist eine Darstellungsebene, kein zusätzlicher Kartenbestand. 26 Blöcke betreffen 22 bestehende Seiten. Die sieben SDG+-Dimensionen liegen unter Ankern des zentralen Referenzrahmens; die alten Dimensionspfade leiten dorthin weiter.

`reference-links.mjs` rendert diese Angaben mit bestehenden Gestaltungsklassen. Marker erlauben eine idempotente Ergänzung. Die SDG- und Mediengeneratoren sowie der Lexikon- und Integrationsaufbau verwenden denselben Baustein. Ein fehlendes kanonisches Ziel oder ein beschädigter Marker stoppt den Aufbau. Der Integrationsnachweis entfernt die eigenen Einfügungen gedanklich wieder und verlangt den exakten vorherigen Inhalt.

Die Startseite verlinkt den ausführlichen Abschnitt zusätzlich mit „Grundlage: SDG+“ beim schnellen Einstieg. Der Begriffsbereich bleibt davor. Drei historische Dokumentseiten erhalten nur einen datierten Anwendungshinweis. Vier fachlich passende Karten zeigen ausdrücklich ergänzende Referenzhinweise; IDs, Slugs, Daten, Quellen und Freigaben bleiben erhalten.

Die globale Suche nutzt die vorhandenen Wissensgruppen mit einer Gruppe „Wirkungslexikon“. Nur die 22 betroffenen Seiten erhalten kontextbezogene Suchschlagwörter. Die Darstellung der Kartentreffer beginnt weiterhin mit „Wirkungspotenzial“.

## Prüfung und Veröffentlichung

- `WL_SITE=<vollständiger Site-Bestand> node --test scripts/wirkungslexikon/reference-links-test.mjs`
- `node scripts/wirkungslexikon/public-test.mjs --images`
- `node scripts/wirkungslexikon/reference-links-browser-test.mjs --base <Vorschau-URL>` mit vorhandener Playwright-Installation; optional `WL_AXE_PATH`.
- `node scripts/wirkungslexikon/integration-test.mjs --artifact <Site-Bestand> --base <Vorschau-URL>`; prüft auch alle 22 Referenzseiten und ihre Anker.
- `node scripts/wirkungslexikon/usability-test.mjs --base <Vorschau-URL>` prüft den schnellen Einstieg an sieben Breiten.

Die bestehende manuelle GitHub-Pages-Freigabe integriert ein unveränderliches, SHA-256-gebundenes GitHub-Release-Artefakt in die zuletzt aktive Website. Vor Deployment muss deren Identität noch mit dem gesicherten Ausgangsartefakt übereinstimmen. Keine Vercel-Nutzung und kein neuer Dienst.

Neue Quellen-, Methodik- und Narrativentwürfe bleiben privat. Diese Referenzen erteilen weder ihnen noch gesperrten Karten eine Freigabe. SDG+ bleibt eine WÖk-eigene Ergänzung; die UN-Agenda enthält demokratische und rechtsstaatliche Bezüge bereits. Zielbezug, Reichweite und Resonanz sind kein Wirkungs- oder Kausalitätsnachweis.

## Nachweise und Rückfall

Die privaten Berichte liegen unter `outputs/wirkungslexikon/sdgplus-berichte-20261016/`: websiteweites Suchinventar, gezielte Quelldateien, exakte Inhaltsdifferenzen, Link-/Anker- und Browserprüfungen, unveränderte Datenprüfsummen sowie konkrete Release- und Deploymentdaten. Automatisierte Barrierefreiheitsprüfungen ersetzen keine manuelle Screenreader-Abnahme.

Ein Rückfall muss das vollständige gesicherte Pages-Artefakt wiederherstellen. Nur das alte Lexikon-Komponentenarchiv einzuspielen würde die ergänzten Hinweise auf den SDG-/Medienseiten nicht entfernen. Alternativ die markierten Ergänzungen bewusst zurücknehmen, neu prüfen und über den gleichen manuellen Prozess veröffentlichen. Bereits vorhandene historische Texte dürfen dabei nicht verändert werden.
