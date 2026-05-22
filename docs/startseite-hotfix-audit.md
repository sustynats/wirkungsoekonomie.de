# Startseite Hotfix Audit

Stand: 2026-05-22  
Betroffene Seite: `/index.html`

## 1. Alter Hero

Der alte Hero begann mit:

> Kapital misst Bewegung. Wirkung zeigt Richtung.

Darunter standen direkt mehrere Modellgrafiken bzw. Diagramme:

- Hero-Visual `assets/visuals/hero/woek_start_hero_architecture.svg`
- `assets/visuals/explainers/woek_wirkung_einfach_flow.svg`
- `assets/visuals/model/woek_modell_auf_einen_blick_v2.svg`

Bewertung: für die Startseite zu theoretisch, zu diagrammlastig und nicht ausreichend selbsterklärend für Besucher:innen ohne Vorwissen.

## 2. Neuer Hero

Neuer Hero:

- Eyebrow: `Wirkung statt Kapital`
- H1: `Gewinn und Wachstum reichen nicht mehr.`
- Subheadline: erklärt, dass zentrale Kontrolle keine Lösung ist und die WÖk einen dritten Weg geht.
- Text: Markt, Eigentum, Wettbewerb, Innovation und Gewinn bleiben erhalten; positive Netto-Wirkung für Mensch, Planet und Demokratie wird zum Kompass.
- Kernsatz: `Schädliche Wirkung darf nicht länger billig bleiben. Positive Netto-Wirkung muss sich lohnen.`
- CTAs:
  - `In 5 Minuten verstehen`
  - `WÖk-Kompass öffnen`
  - `Für wen ist das relevant?`
  - sekundär: `Das Modell ansehen`

Im Hero wurden störende Inline-Textlinks entfernt. Der sekundäre Modell-Link nutzt eine ruhige Linkklasse ohne Standard-Unterstreichung.

## 3. Welche Diagramme wurden von der Startseite entfernt?

Aus dem oberen Startseitenbereich wurden entfernt:

- `assets/visuals/hero/woek_start_hero_architecture.svg`
- `assets/visuals/hero/woek_start_hero_architecture_mobile.svg`
- `assets/visuals/explainers/woek_wirkung_einfach_flow.svg`
- `assets/visuals/explainers/woek_wirkung_einfach_flow_mobile.svg`
- `assets/visuals/model/woek_modell_auf_einen_blick_v2.svg`
- `assets/visuals/model/woek_modell_auf_einen_blick_v2_mobile.svg`

Keine Datei wurde gelöscht. Die Grafiken wurden nur aus der Startseite entfernt.

## 4. Wohin wurden sie verschoben?

- `Wirkung einfach erklärt` ist bereits auf `/wirkungsoekonomie.html` eingebunden und gehört zusätzlich in den Bereich `/verstehen.html`.
- `Wirkungsökonomie auf einen Blick` ist bereits auf `/modell.html` im Abschnitt `Gesamtmodell` eingebunden.
- Wirkungskreislauf und Modellgrafiken bleiben auf `/modell.html` und können dort weiter vertieft werden.

## 5. Welche Grafiken bleiben auf der Startseite?

Im oberen Startseitenbereich bleibt keine große Modellgrafik. Die Startseite beginnt jetzt mit Text, Audio und einem einfachen Drei-Karten-Einstieg.

Weiter unten bleiben vorhandene redaktionelle Assets erhalten:

- Natalie-Weber-Porträt im Abschnitt `Über die Begründerin`
- Buchcover im Abschnitt `Das Grundlagenwerk`
- Blogbilder im Abschnitt `Blog`

## 6. Wurde "Kapital misst Bewegung" verschoben?

Ja. Die Formel ist nicht mehr Headline der Startseite und kommt in `index.html` nicht mehr vor.

Sie wurde in `/modell.html` als Merksatzbox ergänzt:

> Kapital misst Bewegung. Wirkung zeigt Richtung. Kapital zeigt, wo Geld fließt. Es zeigt aber nicht automatisch, ob Lebensgrundlagen, Vertrauen oder Teilhabe gestärkt werden.

## 7. Ist die Startseite ohne Vorwissen verständlich?

Verbessert. Die ersten zehn Sekunden beantworten jetzt:

- Gewinn und Wachstum reichen nicht, weil sie Schäden unsichtbar lassen können.
- Zentrale Kontrolle ist keine Lösung, weil sie Märkte, Lernen und Freiheit ersticken kann.
- Die WÖk erhält Markt, Eigentum, Wettbewerb, Innovation und Gewinn.
- Der Maßstab verschiebt sich zu positiver Netto-Wirkung für Mensch, Planet und Demokratie.
- Schädliche Wirkung soll nicht länger billig bleiben.

## 8. Mobile-Prüfung

Geprüft werden soll:

- Hero ohne Diagramm-Stack.
- Kein horizontales Scrollen durch Startgrafiken im oberen Bereich.
- CTA-Zeile bricht sauber um.
- Hero ist für Glossar-Auto-Markierung gesperrt, damit keine unruhigen Unterstreichungen im Hero entstehen.
- Kartenabschnitt `Warum wir einen neuen Kompass brauchen` ist mobil stapelbar.

Technische Prüfung im Hotfix durchgeführt:

- `git diff --check`: ohne Befund.
- lokaler HTTP-Server: `/index.html`, `/modell.html`, `/verstehen.html` liefern `200`.
- Chrome Headless Mobile-Screenshot bei 390 x 844 px: Hero ist textlich ruhig, kein Diagramm-Stack, keine Glossar-Unterstreichungen im Hero.
- Link-Checks lokal: `/index.html`, `/modell.html`, `/verstehen.html`.

## 9. Offene Punkte

- `/verstehen.html` sollte im nächsten redaktionellen Durchlauf die Grafik `Wirkung einfach erklärt` prominenter und ruhiger aufnehmen.
- Die Startseite kann später ein einziges ruhiges Einstiegsvisual erhalten, aber nicht als Modellposter und nicht vor der Problemgeschichte.
- Eine weitere Feinschärfung kann die Abschnitte `In 5 Minuten verstehen` und `Für wen?` noch stärker an die neuen `/fuer/`-Seiten anbinden.
