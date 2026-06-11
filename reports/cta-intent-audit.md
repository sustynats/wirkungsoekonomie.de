# CTA-Intent-Audit

Stand: 2026-06-05

Ziel: Button-Text und Zielseite müssen dieselbe Nutzerabsicht bedienen. Dieser Audit fokussiert auf sichtbare Haupt-CTAs und den konkret gemeldeten Bruch auf der Blog-Seite.

| Text | Fundstelle | Zielseite vorher | Erwartete Nutzerabsicht | Tatsächliche Zielabsicht | Korrektur |
| --- | --- | --- | --- | --- | --- |
| Updates erhalten | `blog.html` Hero | `mitmachen.html` | Neue Inhalte, Benachrichtigungen, Journal, RSS, Changelog | Beteiligung, Community, Pilotierung, Mitwirkung | Behoben: Ziel ist jetzt `updates/`. |
| Updates erhalten | `blog.html` Ausblick | `mitmachen.html` | Neue Inhalte, Veröffentlichungen, künftige Analysen | Beteiligung, Community, Pilotierung, Mitwirkung | Behoben: Ziel ist jetzt `updates/`. |
| Mitmachen | Hauptnavigation und Footer | `mitmachen.html` | Beteiligung, Kontakt, Community, Mitwirkung | Beteiligung, Kontakt, Community, Mitwirkung | Kein Mismatch. |
| Kontakt und Mitmachen | Footer | `mitmachen.html` | Kontakt oder Beteiligung | Kontakt oder Beteiligung | Kein Mismatch. |
| Zur Akademie-App / Lernpfad ansehen | `akademie.html` | `https://akademie.wirkungsoekonomie.de/` | Lernen, Akademie-App öffnen | Lernen, Akademie-App öffnen | Kein Mismatch. |
| Narrativ einreichen | Debatten-Kompass-Module | `https://akademie.wirkungsoekonomie.de/narrativ-einreichen/` | Aussage/Narrativ redaktionell einreichen | Narrativ-Einreichstrecke der Akademie | Kein Mismatch, sofern Akademie-Formular bestätigt. |
| WÖk-Kompass öffnen | Footer | `kompass.html` | Kompass öffnen | Kompass öffnen | Kein Mismatch. |

Empfehlung für den 2.0-Umbau:

- Die neue Seite `/updates/` sollte später datengetrieben aus Journal, Debatten-Kompass, Glossar, Bibliothek und Akademie gespeist werden.
- RSS und Newsletter erst verlinken, wenn technische Infrastruktur, Datenschutz und redaktioneller Betrieb wirklich vorhanden sind.
- Bei künftigen CTAs gilt: Ein Verb oder Buttonversprechen darf nur auf eine Seite führen, die diese Absicht unmittelbar erfüllt.
