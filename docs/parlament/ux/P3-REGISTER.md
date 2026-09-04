# P3 · Gemeinsames Wirkungsakten-Register

Frischer, sauberer Ausgangspunkt nach P2: `5ee3732a84fa5dbda88367354a52429596f3fd44`.

## Abdeckung und Aussagen

`lib/register.ts` vereinigt ausschließlich bereits veröffentlichte Quellobjekte. Die Identitäten und kanonischen Detail-URLs bleiben getrennt. Keine Fachquelle, Bewertung oder Evidenz wird geändert. Die sechs alten Listenpfade behalten ihre 308-Weiterleitung; der bisherige `bestand`-Parameter begrenzt denselben gemeinsamen Bestand.

Der aktuelle Satz enthält 136 eigenständige Akten: alle 134 Objekte der bisherigen Listen plus die zwei bereits öffentlich suchbaren Koalitionsdossiers Baden-Württemberg und Rheinland-Pfalz. Diese Zahlen sind Prüfergebnisse, keine Konstanten der Oberfläche. Der Registerumfang ist nicht mit einer vollständigen fachlichen Analyse aller Landeswahlprogramme gleichzusetzen.

Die sechs Facetten Ebene, Organ, Wirkungsfeld, Richtung, Evidenz und Reifegrad werden mit UND verknüpft und in der URL gespeichert. Dazu kommt eine Titelsuche/Befundsuche. Institutionen bezeichnen den veröffentlichten Sammlungskontext, nicht kausale Verantwortung. MPD-Felder übernehmen nur explizit vorhandene Zuordnungen; keine Schlüsselwortableitung. Fehlende Evidenzgrade bleiben `null`, nicht Stufe null. Fachliche Vollständigkeit wird nicht in beobachtete oder zugerechnete Wirkung umgedeutet.

Die Richtungsverteilung zählt Akten absolut, ohne Mittelwerte oder Ranglisten. Gegenläufige Pfade tragen die geteilte Marke. „Offen / nicht aggregierbar“ besitzt immer eine eigene sichtbare Zahl, auch bei einem leeren Filterergebnis. Ungültige geteilte Filter werden nicht still zu einer breiteren Abfrage.

## Textbestands-Diff und Erreichbarkeit

`p3-text-inventory.json`: 57 Textobjekte gegenüber dem P2-Merge, null fehlend. Der kumulative Vor-Umbau-Vergleich bleibt zusätzlich verbindlich.

| Bisheriger Listenbestand | Vollständiger bisheriger Kontext weiterhin erreichbar |
|---|---|
| Wirkungsfälle | `/wirkungsakten/bestand?bestand=wirkungsfaelle` |
| Entscheidungen / Fachakten | `/wirkungsakten/bestand?bestand=entscheidungen` |
| Fachanalysen | `/wirkungsakten/bestand?bestand=fachanalysen` |
| Regierungs-Wirkungsanalysen einschließlich Missionen | `/wirkungsakten/bestand?bestand=regierung` |
| EU-Wirkungsfälle | `/wirkungsakten/bestand?bestand=eu` |

Die bisherigen Komponenten werden dort unverändert gerendert. Die neue Registerseite verlinkt den Kontext ausdrücklich; seine fünf Ansichten sind untereinander verknüpft. `noindex,follow` verhindert konkurrierende Suchtreffer, nicht den Zugang. Alle vollständigen Fachakten behalten ihre kanonischen Detail-URLs. Die Suchseite verlinkt das gemeinsame Register einschließlich EU-Fällen; ihre bestehenden Suchfunktionen bleiben erhalten.

Zusätzlicher lokaler DOM-Vergleich gegen den unveränderten P2-Produktionsbuild: 1.347 Passagen aus Wirkungsfällen, 147 aus Entscheidungen, 26 aus Fachanalysen, 1.271 aus Regierung und 278 aus EU (insgesamt 3.069 einschließlich wiederholter Beschriftungen) sind im jeweiligen neuen Kontext vollständig enthalten; null fehlend. Verglichen wurden normalisierte `textContent`-Werte von Absätzen, Listeneinträgen, Beschreibungen und Überschriften innerhalb von `main`, nicht durch CSS transformierte Großschreibung.

## Nachweise

- Deterministische Vollmengenprüfung: `scripts/quality/check-register.ts`, einschließlich Identitäten, kanonischen URLs, bisherigen Sammlungen und aller paarweisen Facettenkombinationen.
- 289 Tests, Typecheck und Lint lokal bestanden.
- Vollständiger lokaler Produktionsbuild mit den bisherigen Source-vs-View-, B07-, Länder- und Golden-State-Gates bestanden.
- Browsergate prüft sämtliche öffentlichen Sitemap-/Navigationsrouten, alle alten 308-Regeln, alle Registerzeilen und deren Wortbudget, sechs Facetten, absolute Verteilung, URL-Reload, Zurück/Vorwärts und Fokus. Die fünf vollständigen Kontextansichten werden ebenfalls geöffnet.
- 375/1440-Pixel-Preview und WCAG-A/AA-Prüfung in derselben exact-head-GitHub-Aktion wie P1/P2; deren Bericht und `commit.txt` sind der Mergebeleg. Kein Merge bei Rot.

## Betrieb

Keine Vercel-Anfrage, kein Build-Slot, kein Deployment. Die Vorschau ist ein commitgebundenes GitHub-Prüfartefakt. Die kontoweite rote Release-Kostensperre bleibt erhalten.
