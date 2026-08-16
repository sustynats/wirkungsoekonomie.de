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

- Zulaessige fachliche Richtungen werden strikt unterschieden: `POSITIVE_POTENTIAL`, `NEGATIVE_RISK`, `NEUTRAL`, `AMBIVALENT` und `OPEN`.
- `EVIDENCE_OPEN` ist ausschliesslich Evidenzstatus und in einem Richtungsfeld unzulaessig.
- Evidenzgrad, Unsicherheit oder das Vorhandensein einer Risikoliste veraendern die Richtung nicht automatisch.
- Fachliche Richtungswerte duerfen nur aus einer freigegebenen Patchliste geaendert werden. Technische Audits erzeugen Reviewlisten, aber keine heuristischen Umschreibungen.

## Semantische Darstellung

- Farbe, Icon, Pfeil und Hervorhebung folgen dem expliziten Richtungsstatus. Ein generisches Wirkungspotenzial ist richtungsneutral.
- Gruen und ein aufwaerts gerichteter Pfeil duerfen nur `POSITIVE_POTENTIAL` visualisieren.
- `OPEN`, `AMBIVALENT`, `MATERIAL` und geringe Evidenz erhalten keine positive visuelle Codierung.
- Bei trennbaren Potential- und Risikohypothesen werden eigene Pfade mit gemeinsamer Provenienz (`split_from`) erzeugt.

## Quellfragmente und Ex-ante-Status

- Unvollstaendige Primaertextfragmente bleiben `OPEN`; sie werden weder automatisch gerichtet noch als vollstaendige Forderung ausgegeben.
- Ex-ante bedeutet modelliertes Wirkungspotenzial oder Wirkungsrisiko, nicht beobachtete Wirkung und nicht Eintrittswahrscheinlichkeit.
- Programmtext, kommunikative Vorwirkung, rechtliche Kompetenz, Schutzgrenzen und spaetere Wirkung bleiben getrennte Achsen.

## Release-Gates

- Fuer jede Fallakte gilt: `missing_paths = 0` und `fallback_overwrites = 0`.
- Fuer jede Fallakte gilt zusaetzlich: Vollakte erreichbar, alle Mapping-Referenzen gueltig, `EVIDENCE_OPEN` in Richtungsfeldern = 0 und verlorene Source-Felder = 0.
- Tests pruefen alle 28 Entscheidungsseiten, alle 28 Vollakten, die 12 Vote-Layer, konkrete Schutzgrenzen, Bund-/Laender-Programme, GEG-Vollquelle und Fachanalyse-Quellen.
- Nach Deployment folgt ein Crawl gegen die reale Produktionsdomain. HTTP 200 allein ist kein Nachweis; sichtbarer Inhalt, CSP-/Konsolenfehler, Navigation, responsive Darstellung und fachliche Sentinel-Werte werden geprueft.
- Erst ein bestandener Produktions-Crawl schliesst den Release ab.

## Wirkungsprofile fuer Fraktionen und Abgeordnete

- Persoenliche Profile verwenden ausschliesslich amtliche Individualstimmen aus namentlichen Abstimmungen. Nicht namentliche Fraktionspositionen duerfen nie auf einzelne Personen uebertragen werden.
- Fraktionsprofile duerfen dokumentierte Fraktionsvoten und amtliche Roll-call-Aggregate verwenden. `MAJORITY_YES` und `MAJORITY_NO` bedeuten niemals Einstimmigkeit.
- Profile bewerten die unterstuetzten und abgelehnten Entscheidungsoptionen, nicht Menschen, Parteien oder Fraktionen. Scores und Rankings sind unzulaessig.
- Nein-Stimmen werden nicht in das Gegenteil des Wirkungsprofils einer Vorlage umgerechnet.
- Datenabdeckung, Evidenz, Richtung, Schutzgrenzen und der Abstimmungszeitpunkt bleiben sichtbar und bis zur amtlichen Quelle rueckverfolgbar.
