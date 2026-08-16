# AGENTS.md – Wirkungsportal Parlament

Diese Datei konkretisiert die Root-Governance fuer das Parlamentsportal. Sie darf die uebergeordneten Regeln nicht abschwaechen.

## Autoritative Quellen

- Fachliche Source-of-Truth sind der freigegebene Release, seine Fall-Reviews, Supplements, Vollstaendigkeitsmanifeste und der fuehrende Begriffsleitfaden.
- `data/public-*.json` ist eine oeffentliche Projektion, keine zweite fachliche Wahrheit.
- Generatoren muessen vorhandene Source-Werte strukturerhaltend uebernehmen. Unbekannte Shapes fuehren zum Fehler.

## Zwei Publikationsebenen

- Jede Entscheidung hat eine verstaendliche, gestufte Webansicht und eine kanonische vollstaendige Fachakte.
- Akkordeons, Inhaltsverzeichnisse, Suche, Diagramme und Kacheln strukturieren Inhalte; sie kuerzen oder loeschen keine Fachanalyse.
- Jede Vollakte ist sichtbar verlinkt, direkt adressierbar und besitzt institutionelle Metadaten des Instituts fuer Wirkungsoekonomie.

## Feldmapping und Fallbacks

- Nicht-leere Source-Werte haben Vorrang vor UI-Fallbacks.
- Fallbacks duerfen nur bei `null`, `undefined` oder fachlich leerem Wert greifen.
- `impact_domains`, `non_compensable_boundaries`, Vote-Layer, Gegenargumente, Querverbindungen, Berechnungsanforderungen, Gegenfakten, Risiken, Datenluecken, normative Zuordnungen und freigegebene Provenienz duerfen in der Vollakte nicht verloren gehen.
- Leere optionale Felder werden unterdrueckt; wiederholte Platzhalter erzeugen keinen Informationswert.

## Abstimmungen und Personen

- Gepruefte amtliche Gesamt- und Fraktionsergebnisse werden als Sachverhalt wiedergegeben.
- Fraktionsverhalten wird niemals als Individualverhalten rekonstruiert.
- Personenprofile zeigen nur amtlich belegte und maschinell gepruefte Individualdaten. Es gibt keine Personengesamtnote und keinen Social Credit.

## Direction und Evidenz

- Zulaessige fachliche Richtungen werden strikt unterschieden: `POSITIVE_POTENTIAL`, `NEGATIVE_RISK`, `NEUTRAL`, `AMBIVALENT` und `OPEN` beziehungsweise `EVIDENCE_OPEN`.
- Evidenzgrad, Unsicherheit oder das Vorhandensein einer Risikoliste veraendern die Richtung nicht automatisch.
- Fachliche Richtungswerte duerfen nur aus einer freigegebenen Patchliste geaendert werden. Technische Audits erzeugen Reviewlisten, aber keine heuristischen Umschreibungen.

## Release-Gates

- Fuer jede Fallakte gilt: `missing_paths = 0` und `fallback_overwrites = 0`.
- Tests pruefen alle 28 Entscheidungsseiten, alle 28 Vollakten, die 12 Vote-Layer, konkrete Schutzgrenzen, Bund-/Laender-Programme, GEG-Vollquelle und Fachanalyse-Quellen.
- Nach Deployment folgt ein Crawl gegen die reale Produktionsdomain. HTTP 200 allein ist kein Nachweis; sichtbarer Inhalt, CSP-/Konsolenfehler, Navigation, responsive Darstellung und fachliche Sentinel-Werte werden geprueft.
- Erst ein bestandener Produktions-Crawl schliesst den Release ab.
