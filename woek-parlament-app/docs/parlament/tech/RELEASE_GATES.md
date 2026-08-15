# Datenschutz- und Veröffentlichungs-Gate

Dieses Gate ist vor jeder öffentlichen Veröffentlichung verbindlich. Es schützt
Nutzende, Abonnent:innen und das Institut vor unbemerkten Änderungen an
Datenflüssen oder öffentlichen Inhalten.

## Änderungen mit Datenschutzbezug

Folgende Änderungen lösen immer eine dokumentierte Datenschutzprüfung aus:

- neue oder geänderte Formulare, Newsletter, Benachrichtigungen oder Cookies;
- Browser-Speicher, geräteübergreifende Übergaben oder Nutzerpräferenzen;
- APIs, Datenbanken, Import- und Exportwege;
- Reichweitenmessung, Fehleranalyse, externe Einbindungen oder neue Infrastruktur;
- neue Empfängergruppen, Speicherfristen oder automatisierte Entscheidungen.

Vor dem Release wird entschieden und dokumentiert:

1. Zweck, Datenminimierung, Rechtsgrundlage und Speicherfrist;
2. ob Datenschutzerklärung, Einwilligungstext, Cookie-Hinweis oder Impressum anzupassen sind;
3. welche Infrastruktur Daten technisch verarbeitet und ob die erforderlichen Vereinbarungen vorliegen;
4. ob Betroffenenrechte, Abmeldung, Löschung und Sicherheitsmaßnahmen funktionieren;
5. ob Tracking unterbleibt oder transparent beschrieben und rechtmäßig gestaltet ist.

Die aktuelle Prüfung steht in `data/privacy-release-register.json`. Nach einer
wesentlichen Änderung werden diese Datei, die öffentliche Datenschutzerklärung
und die Einwilligungsversion gemeinsam aktualisiert.

## Freigabe öffentlicher Inhalte

Jede Veröffentlichung erfüllt zusätzlich den übergreifenden
[`PUBLICATION_STANDARD.md`](../../../../docs/PUBLICATION_STANDARD.md):
unabhängige Aufbereitung, verständliche Kernaussage, fachlich korrekte
Trennung der Ebenen sowie überprüfbare Quellen und Unsicherheiten.

Vor Deployment laufen die automatischen Sicherheitsprüfungen. Zusätzlich wird
geprüft, dass öffentliche Seiten, Downloads, Metadaten, Feeds und API-Antworten
keine lokalen Pfade, Zugangsdaten, interne Arbeitsstände, redaktionellen
Hinweise oder nicht für die Öffentlichkeit bestimmten Texte enthalten.

Öffentliche Dokumente nennen als Herausgeber das Institut für
Wirkungsökonomie. Rechtlich erforderliche Angaben, etwa zur verantwortlichen
Stelle in Datenschutzinformationen, bleiben davon unberührt.

## Quellenlinks

Beleg-, Dokument- und weiterführende Fachquellen führen zuerst auf die
interne Quellendetailseite. Sie zeigt mindestens Herausgeber, Fassung,
zeitliche Einordnung, Prüfrolle und die veröffentlichte Verwendung. Der Link
zur Originalquelle befindet sich ausschließlich dort und ist als externer
Ausgang gekennzeichnet.

Direkt nach außen führen nur funktionsnotwendige Navigation, rechtlich
erforderliche Angaben und die bewusst gewählte Originalquelle auf ihrer
Detailseite. Neue Quellen dürfen nicht als bloße externe URL in eine
öffentliche Seite, einen Feed oder eine API-Antwort aufgenommen werden.

## Wirkungsraum

Merkliste und Präferenzen liegen ohne Anmeldung lokal im Browser. Beim
bewussten Wechsel vom Wirkungsportal in „Mein Wirkungsraum“ werden nur die vom
Nutzer gewählten öffentlichen Links über den URL-Fragmentteil übergeben. Dieser
Teil wird nicht an den Webserver übertragen und nach dem lokalen Import entfernt.

## Parlamentarische Ebenen

Für Bund, Länder und Europa gilt derselbe Veröffentlichungs- und
Quellenstandard. Die Architektur und die Freigabereihenfolge sind in
[`MULTI_LEVEL_ARCHITECTURE.md`](MULTI_LEVEL_ARCHITECTURE.md) festgelegt.
Eine neue Ebene wird erst öffentlich navigierbar, wenn ihre amtlichen Quellen,
Fassungen und mindestens der transparente Prüfstand vorliegen.

## Normative Referenzkacheln

Eine neue oder geänderte normative Kachel darf nur mit einem Eintrag aus dem
versionierten Referenzregister, einer fallbezogenen Quellenreferenz und einer
Wirkpfadreferenz veröffentlicht werden. SDG+, Staatsziele, Grundrechte und
Schutzaufträge bleiben getrennte Ebenen. Die vollständige Regel steht in
[`NORMATIVE_REFERENCE_TILES.md`](NORMATIVE_REFERENCE_TILES.md).
