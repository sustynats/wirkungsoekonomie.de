# Wirkungsticker: Herunterziehen zum Aktualisieren

Stand: 6. September 2026

## Bedienung

In der Ticker-Web-App und der mobilen Website: Am oberen Seitenrand im
Nachrichtenbereich nach unten ziehen. Nach mindestens 88 CSS-Pixeln erscheint
„Zum Aktualisieren loslassen“. Erst das Loslassen löst die Aktualisierung aus.
Dies gilt für die Übersicht, Einzelmeldungen/Lageakten und WÖk-Analysen.
Der normale Aktualisieren-Button bleibt als Tastatur-/Tap-Alternative erhalten;
die Detailseiten verwenden denselben Handler. Keine App-Neuinstallation nötig.

Eine kurze Geste, eine seitliche Bewegung oder ein Scrollen, das erst während
der Geste den Seitenanfang erreicht, löst keine Aktualisierung aus. Mehrfinger-
und Zoomgesten, Bildschirmränder, Textauswahl, aktive Eingabefelder, sichtbare
Dialoge und verschachtelte Scrollflächen bleiben geschützt. Das vorhandene
horizontale Blättern bleibt unabhängig davon erhalten.

## Bestehende Aktualisierung wiederverwenden

`assets/js/news-pwa.js` verwaltet Geste, Button, Status und einen gemeinsamen
laufenden manuellen Request. Ein Live-Abruf des bestehenden JSON-Feeds prüft
die Erreichbarkeit. Anschließend wird dieselbe URL neu geladen - auch ohne
Karten auf einer Detailseite oder bei reinen Layout-/Bildänderungen. Es gibt
keinen zusätzlichen KI-Aufruf, keine neue API und kein zusätzliches Polling.
Auf Detailseiten werden keine globalen Nachrichten allein durch die manuelle
Aktualisierung als gelesen markiert.

Der Request wird nach zwölf Sekunden abgebrochen. Die Service-Worker-Prüfung
läuft nebenbei und darf das Aktualisieren nicht blockieren. Mehrfaches Ziehen
und gleichzeitige Button-Klicks erzeugen keine parallelen manuellen Requests.
Cache-/Worker- und öffentliche Asset-Versionen sind angehoben.

## Offline und Barrierefreiheit

Ein Feed-Aufruf mit `?check=…` darf im Service Worker nicht aus dem Offline-Cache
beantwortet werden; sonst erschiene ein alter Stand als Live-Ergebnis. Normale
Offline-Navigation und der gewöhnliche Feed behalten ihren Cache-Fallback.
Bei Offline-Status, Netzfehler, ungültigem Feed oder Timeout bleibt die bereits
geöffnete Seite stehen, meldet den Fehler und erlaubt einen neuen Versuch.
Es werden keine Notizen, Merkliste, Filter oder privaten Speicher gelöscht.

Der kompakte Status ist eine höfliche Live-Region, verdeckt nicht dauerhaft
Inhalte und beachtet den sicheren Bildschirmrand. Der Ladeindikator respektiert
`prefers-reduced-motion`. Die vertikale Browser-Refresh-Geste wird nur auf den
aktivierten Nachrichtenseiten unterdrückt; horizontales Overscroll bleibt
unverändert. Ältere Browser können die native Randgeste unterschiedlich behandeln;
der Button funktioniert unabhängig davon.

## Prüfung

- `node --test tests/news/pull-refresh.test.mjs`: vollständiger Client mit
  nachgebildetem DOM, Gestenabgrenzung, Single Flight, Button, Offline/Timeout,
  geschützter Eingabe, deaktiviertem Speicher und Service-Worker-Cachegrenze.
- Bestehende Reader-, Push- und übrige Nachrichtentests bleiben verbindlich.
- Browserprüfung: mobile Übersicht und Analyse, Statusanzeige, tatsächlicher
  Reload derselben URL, simulierte Netzstörung ohne Reload, normale Navigation.
- Physische iOS-/Android-Geräte sind durch die Browserprüfung nicht ersetzt.

Technischer Hintergrund: [MDN: overscroll-behavior-y](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior-y)
und [Event-Listener / passive](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).
