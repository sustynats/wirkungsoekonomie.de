# MV SPD — geschützter P1–P54-Bestand: Quellenbindung vor Materialisierung

Frischer sauberer Main-Ausgangspunkt: `66685e46d0acd9339935babab29bbe2116713143`. Auftrag #241/5542571686. Dies ist **kein** Abschluss der P1–P54-Materialisierung und kein neues Fachreview. P55 (#368), Berlin SPD P1–P23 (#369), der eingefrorene Quellenledger und alle bisherigen Fachentscheidungen bleiben bytegleich.

## Was vollständig mechanisch geprüft wurde

Alle 509 Source Units und 456 ursprünglichen Atome auf physischen P1–P54 sind mit ID, Locator, Quellenpfad und verifiziertem Text-SHA im versionierten [Referenzinventar](audits/mv-spd-p1-p54-reference-inventory-2026-09-04.json) enthalten. Die vollständigen #240/#241-Snapshots umfassten 418 bzw. 496 Kommentare. 174 MV-bezogene Kandidatenkommentare sind gehasht und verlinkt. Es gibt keine Kürzung auf Stichproben.

Das ist eine vollständige **mechanische Referenzinventur**, keine Behauptung, sämtliche Vorgängerkommentare bereits semantisch gelesen oder ihre Fachentscheidungen materialisiert zu haben. Eine ID-/Hash-/Textfundstelle ist lediglich ein Kandidatenverweis; VOID-, historische und später ersetzte Kommentare können darin vorkommen. Das Inventar vergibt deshalb ausdrücklich keinen Terminal-Credit und setzt keine neuen Fachstatus.

Reproduktion aus vollständigen GitHub-API-Snapshots:

```sh
gh api --paginate --slurp repos/sustynats/wirkungsoekonomie.de/issues/240/comments > /tmp/mv-issue-240.json
gh api --paginate --slurp repos/sustynats/wirkungsoekonomie.de/issues/241/comments > /tmp/mv-issue-241.json
node tools/build_mv_spd_authority_reference_inventory.mjs --write /tmp/mv-issue-240.json /tmp/mv-issue-241.json
```

Die Snapshot-Hashes machen den historischen Suchstand prüfbar. Neuere GitHub-Kommentare erzeugen bewusst ein neues Inventar, keinen stillen Ersatz des alten Nachweises. Ohne Netzwerk prüft `node tools/build_mv_spd_authority_reference_inventory.mjs` weiterhin Descriptor, Vollständigkeit und alle eingefrorenen Quellobjekte.

## Drei bestätigte Quellenbindungs-Konflikte auf P53

P54 #240/5476819703 und sein P53-Vorgänger #240/5474946653 wurden vollständig gelesen. Der [P53-Handoff](audits/mv-spd-p53-handoff-5474946653.md) ist unverändert als historische Autorität gesichert; die festgestellten Fehler werden darin nicht still berichtigt.

Das Original-PDF wurde erneut direkt vom registrierten offiziellen Ursprung abgerufen: SHA-256 `b2ed331e3bd89b93379df2f9a6adc5d3d10ddf635b0688673bc20c61cdca09bc`, 1.072.223 Bytes, 95 Seiten. Die relevante vollständige Seite 53 wurde zusätzlich gerendert und visuell geprüft. PDF und eingefrorener Ledger stimmen überein; es liegt keine Quellenänderung vor.

| Objekt | Handoff | Tatsächliche eingefrorene Quelle |
| --- | --- | --- |
| SU00495-C02-b73986b3503e | „Kommunale Energieinfrastruktur ist dabei ein wichtiger Baustein, der Klima- und Daseinsvorsorge miteinander verbindet.“ | „Kommunale Energieinfrastruktur wird zunehmend zu einer strategischen Aufgabe, die Versorgungssicherheit, Klimaschutz und wirtschaftliche Entwicklung verbindet.“ SHA `800fbf3fffa1976f6bb3ace6110f4b1ea6ad2cfe960cf826ea8600fb82e62598`. |
| SU00496 | „Bezahlbares Wohnen und moderne Quartiere“ | „Gutes und bezahlbares Wohnen“, SHA `52c52569def77a0732ef84619b60d2e7d27ca5b0f292b10344fa739f2678545c`. |
| SU00499 | „Bezahlbares Wohnen und moderne Quartiere“ | „Wohnraum als Daseinsvorsorge in Stadt und Land“, SHA `6e12088d19a9035493faf599f712b3a9705fee4213dae3522a20c7464f3709c7`. |

`node tools/check_mv_spd_authority_source_binding.mjs` liefert sämtliche genauen Locator-/Parent-/Text-/Hash-Belege und reproduziert die Ablehnung des falsch gebundenen Kindes. Dessen eigener Hash ist korrekt, der Text kommt aber nicht im Parent vor. Ein passender Eigenhash allein ist ausdrücklich kein Source-Fidelity-Nachweis. Mutationstests verhindern die Annahme eines fremden Kindes oder eines geänderten Parents. Erfolgreiche Textgleichheit allein erzeugt umgekehrt keine Fachfreigabe.

Ein echter externer Bindungsdelta bzw. Verweis auf eine vorhandene Korrektur ist für **SU00495-C02** erforderlich. Der vorhandene Entscheid wird nicht eigenmächtig auf den anders formulierten Quellsatz übertragen. Die zwei Überschriften bleiben einfach im kanonischen Wortlaut erhalten; hierfür wird keine neue inhaltliche Fachprüfung verlangt. Keine Neufassung anderer gelieferter Fachentscheidungen.

## Früher geschützter Bestand: Referenzlücke, kein pauschaler neuer Fach-Backlog

Keine wörtliche Objekt-ID-Referenz wurde in den beiden vollständigen Issue-Snapshots für SU00001–SU00028, SU00033 und SU00034 gefunden. Das schließt Titel-/Kontextobjekte ein und bedeutet **nicht** 30 neue Wirkungsurteile. Besonders zu klären ist der bestehende objektgebundene Freigabeverweis für SU00010, SU00017–SU00022, SU00024, SU00025, SU00028 und SU00033. Ein Hash-/Texttreffer an einer anderen Stelle wird nicht automatisch zu einer freigegebenen Restatement- oder Parent/Child-Bindung.

Zusätzlich vollständig gelesen: Dropbox `/WOEK/WOEK-LAENDER-DAILY/FACHREVIEW/mecklenburg-vorpommern/INITIAL-PROGRAMME-IMPACT-REVIEW-2026-08-18.md` (Revision `6594d1674482e000a748b`) sowie der dortige Vollprogrammvertrag vom 26.08.2026 (Revision `659f3b0921ae1000a748b`). Der erste Text ist achtteiliger Materialitätsvorbestand; der zweite erklärt ausdrücklich, dass dieser kein Vollprogrammabschluss ist. Beide gezielt geprüften MV-Ordnerlisten und die MV-Suchläufe hatten `has_more=false`. Dies ist keine Behauptung eines vollständigen Audits der gesamten Dropbox.

Der generische Ledger wird nicht als Fachautorität verwendet. Beispiel: SU00018-A01 betrifft den Investitionsplan, sein verworfener generischer Altentscheid trägt jedoch `AGRICULTURE_FOOD_ANIMALS`. Dessen Wiederverwendung wäre kein verlustfreier Import einer autoritativen Einzelfachentscheidung.

## Terminalität und weitere Arbeit

- Technische Quellen-/Referenzinventur: vollständig, alle 965 Originalobjekte.
- Bestätigte P53-Abweichungen: 3, davon 1 echter externer Text/Fach-Bindungsblocker und 2 technisch unverändert zu erhaltende kanonische Überschriften.
- P1–P54-Fachmaterialisierung: **nicht vollständig**, keine neuen Terminal-Zähler.
- P56: **nicht autorisiert**. Kein Fortschritt aus Seitenarithmetik.
- Berlin P24: autoritativer Handoff vorhanden; gemeinsame Residual-/Golden-Schreibtransaktion bleibt gemäß Controller hinter MV serialisiert.
- Source-/Fach-/UI-/Release-Daten: unverändert.
- `NO_NEW_VERCEL_BUILD=true`, keine Reservierung/Preview/Build/Deployment/Promotion.

Externer Bindungsdelta ist bereits präzise in [#240/5543340788](https://github.com/sustynats/wirkungsoekonomie.de/issues/240#issuecomment-5543340788) und [#241/5543349415](https://github.com/sustynats/wirkungsoekonomie.de/issues/241#issuecomment-5543349415) angefordert. Vor jeder Fortsetzung neueste Kommentare lesen. Dieser Nachweis schließt den übergeordneten Fachauftrag nicht und versteckt keine noch ausstehende technische Arbeit.
