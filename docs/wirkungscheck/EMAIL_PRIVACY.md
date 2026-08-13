# E-Mail-Datenschutz und Tracking-Ausschluss

Stand: 13. August 2026

## Zweckbindung

Versanddaten dienen ausschließlich dazu, offizielle Mandatsadressen einmalig bzw. in festgelegten
Wellen zum Wahlkreis-Wirkungscheck einzuladen, technische Unzustellbarkeit zu behandeln,
Erinnerungen zu unterdrücken und auf Rückfragen zu antworten. Die endgültige Rechtsgrundlage,
Betreiberangabe, Löschfristen und Datenschutzhinweise werden vor Livegang rechtlich geprüft und
öffentlich dokumentiert.

## Verbotene Verarbeitung

Nicht erhoben oder gespeichert werden:

- Mail-Öffnungen, Remote-Image-Aufrufe oder ähnliche Pixelereignisse;
- individuelle Linkklicks, Redirect-Protokolle oder UTM-Personalisierung;
- Profilbildung nach Fraktion, Aussage, Social-Media-Verhalten oder vermutetem Interesse;
- Umfrageantworten, Reportinhalte oder Empfehlungen in der Versanddatenbank;
- eine technische Zuordnung von `survey_response` zu `invitation_recipient`.

Aggregierte Betriebszahlen sind zulässig: Anzahl versendet, technische Fehler, Soft-/Hard-Bounces,
Suppressions und eingelöste Zugangstoken. Sie werden nicht als Maß für politische Zustimmung
verstanden.

## Zugriff und Löschung

- CiviCRM-Zugriff ist rollenbasiert und personenbezogen; geteilte Admin-Zugänge sind untersagt.
- Die Versanddatenbank ist administrativ und technisch vom Survey- und Report-System getrennt.
- Hard Bounces, ausdrückliche Widersprüche und „keine Erinnerungen“ bleiben nur so lange erhalten,
  wie dies zur zuverlässigen Unterdrückung weiterer Sendungen erforderlich und rechtlich zulässig
  ist.
- Roh-Token werden nicht gespeichert. Zeitlich begrenzte Reportzustelladressen werden nach
  Zustellung und Ablauf der kurzen Frist gelöscht.
- Backups sind verschlüsselt außerhalb des Servers aufzubewahren, streng zugriffsbegrenzt und nach
  dem Löschkonzept zu rotieren.

## Transparenz in der Mail

Jede Einladung enthält kurz und leicht verständlich: Anlass der Ansprache, Dauer, persönlichen
Nutzen, Parteiunabhängigkeit, Datenumgang, Methodik, Kontaktadresse und den Link „Keine weiteren
Erinnerungen“. Die eigentliche Datenschutzinformation ist klar verlinkt, nicht hinter einem
Login verborgen.
