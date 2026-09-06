<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@aa10de6b5a5c26badb3747fd3e4a97b540e327a7 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v75-digitale-produktpaesse-wirkung-am-regal.md curriculum=4.0 sanitized=true -->
# V75 · Digitale Produktpässe und Wirkung am Regal – Dateninfrastruktur statt Nachhaltigkeitssiegel

**lecture_id:** `WOEK-G-BASE-075`  
**display_code:** `V75`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED_VERSION_SENSITIVE`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 stellt den EU-Digital-Product-Passport als bestehende, produktspezifisch auszurollende Dateninfrastruktur unter der ESPR voran. DPP ist weder WÖk-Erfindung noch automatischer Nachhaltigkeitsscore. WÖk kann DPP-Daten für Produktprofile nutzen, muss Datenfunktion, Aktualität, Scope und fehlende Wirkungsdimensionen transparent halten.

## 20-Sekunden-Einstieg

Ein Digital Product Passport kann Produktdaten digital auffindbar machen – etwa zu Material, Reparierbarkeit oder anderen regulatorisch festgelegten Eigenschaften. Das ist enorm wertvoll für Wirkungstransparenz. Aber ein DPP sagt nicht automatisch: **„Dieses Produkt ist nachhaltig.“** Welche Daten enthalten sind, hängt von Produktgruppe und EU-Regeln ab. WÖk kann daraus eine verständliche „Wirkung am Regal“-Ansicht bauen – aber nur als zusätzliche Interpretation, nicht als Ersatz oder Umdeutung des DPP.

## Lernziele

Nach dieser Vorlesung kannst du:

1. DPP, Produktdaten, Label und WÖk-Produktprofil unterscheiden.
2. die ESPR als rechtlichen Rahmen des DPP grob einordnen.
3. DPP-Felder als Quellen/Inputs mit klarer Datenfunktion nutzen.
4. fehlende Daten/Dimensionen offen markieren.
5. Verbraucheransicht und Audit-/Beschaffungsansicht unterscheiden.
6. Datenschutz, Geschäftsgeheimnisse, Interoperabilität und Versionsfragen berücksichtigen.

## 1. DPP ist Infrastruktur

Der EU Digital Product Passport ist Teil der Ecodesign-for-Sustainable-Products-Architektur.

Er soll für betroffene Produktgruppen strukturierte, interoperable Produktinformationen zugänglich machen.

Welche Pflichtdaten gelten, wird produktgruppenspezifisch konkretisiert.

Darum ist diese Vorlesung `VERSION_SENSITIVE`.

## 2. Was DPP nicht ist

Nicht automatisch:

- Gesamt-Nachhaltigkeitsscore,
- WÖk-Scorecard,
- vollständige Lieferkettenwirkung,
- Steuerbemessung,
- Kausalitätsnachweis.

`DPP_DATA != IMPACT_JUDGMENT`.

## 3. Datenfunktionen

Ein DPP-Feld kann in WÖk sein:

- `SOURCE_FACT`,
- `BASELINE`,
- `PRODUCT_ATTRIBUTE`,
- `BOUNDARY_INPUT`,
- `LIFECYCLE_INPUT`,
- `REALITY_CHECK_INPUT`.

Beispiel Reparierbarkeit:

Produktmerkmal -> möglicher Mechanismus -> tatsächliche Reparaturen/Lebensdauer -> Ressourcenoutcome.

Das Merkmal allein ist noch kein Outcome.

## 4. „Wirkung am Regal“

Eine gute Verbraucheransicht könnte vorne zeigen:

- wenige materielle Produktfelder,
- klare Unsicherheit/Open Points,
- harte Sicherheits-/Rechtsgrenzen,
- Datenstand,
- Vergleichsbasis.

Details dahinter:

- Quellen,
- Lifecycle,
- Lieferkette,
- Methodik,
- Nachweise.

`20 Sekunden verstehen -> tiefer prüfen`.

## 5. Keine Informationsüberlastung

Ein DPP kann viele technische Felder enthalten.

Verbraucher:innen brauchen andere Darstellung als:

- Einkäufer:innen,
- Behörden,
- Reparaturbetriebe,
- Recycler,
- Forschende.

WÖk-Frontend darf deshalb filtern/erklären, aber die zugrunde liegende Quelle nicht verfälschen.

## 6. Fehlende Wirkungskomponenten

Wenn der DPP keine produktspezifischen Daten zu einem materiellen Feld enthält:

`DATA_GAP`.

Dann ggf. ergänzen aus:

- Unternehmensnachweis,
- LCA/PEF,
- Zertifikat/Audit,
- amtlicher Statistik,
- Fachliteratur.

Nicht aus Marken-/Herkunftsvermutung.

## 7. Version und Produktidentität

Produktmodelle ändern sich.

DPP/WÖk braucht:

- eindeutige Produkt-/Modell-ID,
- Version/Charge soweit relevant,
- Datenstand,
- aktualisierte Reparatur-/Sicherheitsinformationen.

Ein alter Score darf nicht still auf neues Modell übertragen werden.

## 8. Datenschutz und Geschäftsgeheimnisse

DPP ist nicht zwangsläufig vollständig öffentlich in allen Detailfeldern.

Zugriffsrechte können je Information/Akteur variieren.

WÖk muss:

- nur zulässige Daten nutzen,
- keine personenbezogenen Daten unnötig ziehen,
- Geschäftsgeheimnisse/Rechte beachten,
- Quellen-/Zugriffsklasse dokumentieren.

## 9. Beispiel Waschmaschine

DPP kann z. B. für künftige produktgruppenspezifische Regeln relevante Daten bereitstellen.

WÖk fragt zusätzlich:

- tatsächliche Lebensdauer,
- Reparaturquote,
- Energie/Wasser in Nutzung,
- Kosten/Zugang,
- Rücknahme/Recycling,
- Produktions-/Arbeitsdaten soweit verfügbar.

Ein „reparierbar“-Feld wird erst mit realer Nutzung zum Outcome.

## 10. Procurement

Für öffentliche/unternehmerische Beschaffung kann DPP maschinenlesbare Nachweise liefern.

WÖk kann daraus:

- Mindestkriterien,
- Vergleichsprofile,
- Lifecycle-/Risikoindikatoren

speisen.

Aber Vergabeentscheidung bleibt rechtlich/verfahrenstechnisch getrennt.

## 11. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| DPP | Digital Product Passport unter EU-Produktregulierung |
| ESPR | Ecodesign for Sustainable Products Regulation |
| Product Attribute | Produktmerkmal, noch nicht automatisch Outcome |
| Wirkung am Regal | WÖk-Darstellungsidee für verständliche Produktwirkung/-daten im Kaufkontext |
| Data Gap | materiell fehlende Information |
| Produktidentität | eindeutige Zuordnung von Daten zu Modell/Variante/Version |

## 12. Typische Fehlinterpretationen

### „DPP ist WÖk-Erfindung.“
Falsch.

### „DPP = Nachhaltigkeitsscore.“
Falsch.

### „Reparierbarkeit = tatsächliche Lebensdauer.“
Falsch.

### „Alle DPP-Daten sind für jede Person öffentlich.“
Nicht pauschal.

### „Ein DPP macht andere Quellen überflüssig.“
Falsch.

## 13. WÖk-Abgrenzung

DPP ist EU-Daten-/Produktregulierungsarchitektur. WÖk kann diese Daten semantisch mit MasterItems, StateVariables, Indikatoren und Produktwirkungsprofilen verbinden. Der Zusatz liegt in Wirkpfad/Referenz/Boundary/Reality Check – nicht im Pass selbst.

## 14. Quellen

- EU ESPR: https://environment.ec.europa.eu/topics/circular-economy/ecodesign-sustainable-products-regulation_en
- EU Digital Product Passport: https://single-market-economy.ec.europa.eu/single-market/goods/european-standards/harmonised-standards/digital-product-passport-dpp_en
- WÖk Methodik: https://wirkungsoekonomie.de/methodik/

## 15. Transferaufgabe

Entwirf eine Verbraucher- und eine Beschaffungsansicht für denselben hypothetischen DPP. Markiere je Feld: Quelle, Data Function, Outcome-Nähe, Zugriff, Version und Data Gap.

## 17. Prüfungsrelevanz

- DPP/ESPR,
- Daten vs. Urteil,
- Data Functions,
- UX-Zielgruppen,
- Gap/Version,
- Datenschutz/Zugriff,
- Procurement-Anbindung.

## 18. Sprechertext

Der Digital Product Passport ist für die Wirkungsökonomie spannend – gerade weil er **nicht** von der Wirkungsökonomie stammt.

Die EU baut damit eine Dateninfrastruktur für Produkte auf.

Das heißt aber nicht, dass im Pass irgendwann einfach „Nachhaltigkeit 8 von 10“ steht.

Welche Daten enthalten sind, hängt von der Produktgruppe ab.

WÖk kann diese Informationen nutzen: Material, Reparierbarkeit, Produktmerkmale.

Dann bauen wir den Wirkpfad weiter.

Reparierbar heißt noch nicht repariert. Repariert heißt noch nicht automatisch längere Lebensdauer. Und längere Lebensdauer muss im Gesamtsystem tatsächlich Ressourcen sparen.

Der Merksatz lautet:

**Der Produktpass liefert Bausteine. Die Wirkungsanalyse verbindet sie mit Mechanismus, Nutzung, Vergleich und Realität.**

## Fachlicher Stand und Addendum · 6. September 2026

Dieses Addendum ergänzt die Fassung vom August 2026 transparent. Frühere Versionsangaben dokumentieren deren Entstehung; für die aktuelle Einordnung gilt der [führende Begriffsleitfaden v1.7](https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/). Wirkung ist eine tatsächliche Zustandsveränderung. Zielbezug, Indikator, Reichweite und Beobachtung sind jeweils vom kausalen Nachweis zu unterscheiden. SDG+ ist eine WÖk-eigene Erweiterung; positive Netto-Wirkung bleibt an Nichtkompensation harter Schutzgrenzen gebunden.

### Aktualisierung zum Digitalen Produktpass · 6. September 2026

Der Digitale Produktpass wird nach der ESPR schrittweise nach Produktgruppen eingeführt. Rahmenverordnung, zentrale Registerinfrastruktur und konkrete Produktpflicht sind verschiedene Ebenen. Der Arbeitsplan ist noch keine unmittelbar für jedes Produkt geltende Passpflicht; maßgeblich sind der jeweilige delegierte Rechtsakt und gegebenenfalls besondere Produktvorschriften. Ein Produktpass macht Angaben zugänglich, er beweist für sich weder positive Netto-Wirkung noch Kausalität.

Quelle: [Europäische Kommission, DPP-Fragen und Antworten, insbesondere Einführung nach Produktgruppen](https://single-market-economy.ec.europa.eu/single-market/digital-product-passport/explore-our-faqs_en).
