# P2 · Wirkungssignatur und kompakte Karten

Basis: `051412a4c23892b933998ec5f6dee92d966d50a4`, frischer sauberer Worktree nach Merge von P1 (#352).

## Umsetzung

- `ImpactSignature`: drei getrennte, einzeln beschriftete Achsen, kompakt und voll. Keine Gesamtnote und kein Partei-Eingang.
- Wirkungsrichtung übernimmt `directionKind` und `directionLabel` unverändert. Ambivalent: geteilte Rot/Grün-Marke und zwei Positionen, kein Mittelwert und keine braune Markenfarbe.
- Karten und Registerzeilen: Typ/Prüfrelevanz, Titel, ausdrücklich gekennzeichneter unveränderter Finding-Auszug (maximal 140 Zeichen), Signatur, Verfahren/Datum, Aktenlink.
- Vollständige Signatur im kanonischen Aktenkopf; alle bisherigen Fachkomponenten bleiben erhalten.
- Die vierstufigen Skalen können explizite Werte darstellen. **Es wird keine neue fachliche Einstufung berechnet.** Narrative Evidenz und vorhandenes HIGH/MEDIUM/LOW belegen keine Zuordnung zur angeforderten Vier-Stufen-Skala. Deshalb bleiben die Evidenz-Pips im aktuellen Parlamentsbestand unbewertet (`null`, nicht `0`). „Nicht eingestuft“ ist eine eigene sichtbare Angabe.
- `EX_ANTE_POTENTIAL_ONLY` wird exakt als Ex ante projiziert. Vollständigkeit einer Analyse, parlamentarischer Verfahrensstatus oder ein ausstehender Reality Check beweisen weder Umsetzung, beobachtete Zustandsänderung noch Zurechnung. Nicht ableitbare Reifestufen bleiben offen (§7).

## Textbestands-Diff / Umzug

Maschinenlesbarer Einzelbeleg: `p2-text-inventory.json` (250 Textobjekte gegen P1, 0 fehlend). Zusätzlich läuft der kumulative Diff gegen den unveränderten Vor-Umbau-Bestand in CI.

| Bisher auf der Karte | Vollständig erhalten unter `/entscheidungen/[slug]` |
|---|---|
| Kurzbewertung, Wirkungskern, Key Finding, Evidenz, Reality Check | Executive-Zusammenfassung, WorkingActExplainer und vollständige Fachakte; zugrunde liegende Datensätze unverändert |
| PublicMaturity mit Aussagegrenzen und Prüfebenen | vorhandener vollständiger PublicMaturity-Block; fachlich freigegebene Detail-Layer bleiben maßgeblich |
| Parlamentarischer Status | Status dieser Wirkungsakte |
| Stand der WÖk-Analyse | gleichnamige zusätzliche Zeile in der Statusliste; nicht mit Wirkungsreife verwechselt |
| Quellenstatus und Aktualisierung | vorhandene Quellenstatus-/Datumszeilen |
| Transparenzansicht öffnen | gleichnamiger Aktenlink zur vollständigen Fachakte |
| Merken | vorhandene Merkfunktion im Aktenkopf |

Die alten Tests zum Vorrang des Ergebnisses prüfen jetzt Signatur **vor Verfahrensmetadaten**, statt die bewusst abgeschaffte 400-Wort-Komponente auf einer Karte zu verlangen. Typ/Prüfrelevanz dürfen laut neuem Auftrag vor dem Titel stehen; sie werden nicht als Wirkungsurteil verwendet. Alle Source-vs-View-Feldprüfungen bleiben erhalten.

## Prüfungen

- 285 Tests, Typecheck, Lint: lokal PASS.
- Vollständiger Produktionsbuild einschließlich gerenderter B07- und Golden-State-Gates: lokal PASS.
- Palette: CIEDE2000, kleinster normaler Paarabstand 25,87; Bruttokontrast Gold/Weiß 2,41:1. **Keine Behauptung farbfehlsichtiger Unterscheidbarkeit.** Verbindliche Kompensation: sichtbares Symbol plus ausgeschriebenes Label, dunkle Textfarbe, Forced-Colors-Prüfung. Messwerkzeug `colorjs.io@0.7.1` ist ausschließlich Entwicklungsabhängigkeit. Methodik: https://colorjs.io/docs/color-difference und https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html.
- Browser 375/1440: 28/28 Karten, maximal 46 Wörter, drei benannte Achsen, null WCAG-A/AA-Verstöße in neuen Karten/Signaturen, Forced Colors PASS.
- Gesamter Browserbestand: 342 Routen, 33 Redirect-Regeln, Drawer/Tastatur/Escape/Fokus, Same-Page/Back/Forward, Reduced Motion PASS; keine Runtime-/5xx-Fehler.
- Exact-head-Prüfung und commitgebundene Preview werden im PR durch GitHub Actions erneut erzeugt. Merge erst nach Grün.

## Reproduzierbare Voraussetzung des Repository-Gates

Der erste Root-Website-Check scheiterte am bereits auf `main` veralteten Suchindex für `news/index.html` und den Content-Hashes von `index.html`. Nach Integration von `57c62f61f9ea7b918ecc97a1d49f994be666ca4b` wurden ausschließlich die beiden bestehenden Suchartefakte mit `SOURCE_DATE_EPOCH=1787270400 npm run build:search` neu erzeugt. Alle 30.541 URLs bleiben erhalten; elf News-Sucheinträge erhalten den tatsächlich veröffentlichten Seitenbestand. Keine Suchlogik, Nachricht oder Fachquelle wurde dabei editiert. Der Root-Check bleibt unverändert strikt.

Der anschließende vollständige Root-Build (Run 33861771933) zeigte einen zweiten reproduzierbaren Bestandsfehler: `build-full-knowledge-library.mjs` erzeugte die Bibliothek ohne die in den Kontextfragen verlinkten alten Abschnittsanker. Zeitgleich wurde die bereits geprüfte Korrektur aus PR #358 auf `main` integriert (`3f1d58a96dcbbb1268b46cf322d7651f19c81ad1`). P2 übernimmt diese durch Aktualisierung auf `9ef122a252b68eb8d70b3e678b59b73728542929`; der zwischenzeitliche zusätzliche Generatoransatz wurde vollständig zurückgenommen. Kein Bibliotheksgenerator und kein Kontextfragen-Test verbleibt als P2-Diff. Die vollständige Artefaktprüfung läuft erneut in CI, ohne Ausnahme oder abgeschwächte Linkprüfung.

## Freigabegrenze

Keine Fachquelle geändert. Keine Evidenzklasse oder eingetretene Wirkung erfunden. Kein Vercel-Aufruf, keine automatische Preview/Deployment-Aktivierung. Die kontoweite rote Release-Kostensperre bleibt unverändert; GitHub-Prüfungen sind keine Production-Veröffentlichung.
