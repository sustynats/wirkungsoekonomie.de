# Discord-Community-Neustart

Stand: 10. Juli 2026

## Zielbild

Discord ist der einfache Community-Raum der Wirkungsökonomie:

- Austausch, Fragen, Feedback und Veröffentlichungen.
- Kein zweites Akademie-System.
- Kein Institutsportal.
- Keine Lernstands-, Prüfungs- oder Zertifikatsverwaltung.

Die Plattformen bleiben getrennt:

| Ort | Aufgabe |
| --- | --- |
| Website | öffentlich verstehen, lesen, nachschlagen |
| Akademie | lernen, Fortschritt speichern, prüfen, zertifizieren |
| Institut | Quellen, Review, Forschung, Mitwirkung |
| Discord | Community, Rückfragen, Updates, Austausch |

## Zugang

Akademie-Zugang kann über zwei Wege entstehen:

1. Community-Beitritt, z. B. Discord.
2. LinkedIn-Freischaltung.

Beide Wege müssen in der Akademie-Plattform landen. Lernfortschritt, Prüfungen, Zertifikate und Kohortenlogik laufen ausschließlich in der Akademie.

## Bestandsschutz

Bestehende Studierende dürfen nicht zurückfallen.

Vor jeder Löschung alter Discord-Akademie-Rollen müssen in der Akademie-Plattform fixiert sein:

- `has_akademie_zugang`
- `cohort_key`
- Plattformrollen wie `student`, `instructor`, `dozent`, `admin`
- vorhandener Legacy-Fortschritt
- Prüfungs- und Zertifikatsstatus

Während der Migration gilt: Wenn Discord und Plattform voneinander abweichen, gewinnt der zugangserhaltende Status. Kein negativer Entzug ohne manuelle Entscheidung.

## Zielstruktur Discord

Kanonische Datenquelle:

- `content/community/discord-server-structure.json`
- `content/community/discord-channel-copy.json`
- `content/community/community-access-model.json`

Empfohlene Kanäle:

- Start: `willkommen`, `regeln`, `ankuendigungen`, `bot-hilfe`, `hilfe-und-fragen`
- Veröffentlichungen: `journal`, `bibliothek`, `akademie-updates`, `institut-updates`
- Community: `vorstellen`, `allgemeiner-austausch`, `frag-die-woek`, `feedback`
- Themenräume: `wirkungsfelder`, `management-woemm-woems`, `mensch-und-wirkung`, `medien-und-sprache`
- Termine: `termine`, Voice `sprechstunde`
- Team: `team-intern`, `moderation-log`

## Bot-Idee

`#frag-die-woek` darf ein leichter Hilfskanal werden:

- Begriff kurz erklären.
- Auf Glossar, Bibliothek und Quellenarchiv verweisen.
- WÖMM/WÖMS grob einordnen.
- Wirkung, Wirkungspotenzial und Wirkungsrisiko unterscheiden.

Grenzen:

- keine finale WÖk-Bewertung
- keine Rechts-, Steuer-, Finanz-, Anlage-, Gesundheits- oder Therapieberatung
- keine Personenbewertung
- kein Social Credit
- keine Lernstands- oder Prüfungsänderung

## Reihenfolge

1. Akademie-App absichern: Plattformstatus vor Discord-Rollen auswerten.
2. Legacy-Studierende auditieren und in Supabase fixieren.
3. Discord-Kanaltexte aus `discord-channel-copy.json` setzen.
4. Kanäle auf Zielstruktur reduzieren.
5. Veröffentlichungsfeeds auf die vier Update-Kanäle bündeln.
6. Erst danach alte Discord-Akademie-Rollen entfernen oder entwerten.

