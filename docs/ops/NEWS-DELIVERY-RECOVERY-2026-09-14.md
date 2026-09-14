# Nachrichten-Auslieferung ohne Mac

Der bestehende Betriebsmonitor läuft alle 15 Minuten in GitHub Actions und
zusätzlich nach fehlgeschlagenem Import oder Deployment. Oracle behält seine
eigenen Dienstprüfungen und Timer. Keine neue Infrastruktur und keine neue
kostenpflichtige Modellanfrage.

## Erfolg bedeutet sichtbare Veröffentlichung

Die erste erfolgreiche Feed-Abfrage legt eine Basis an. Danach zählt der Monitor
erstmals beobachtete Nachrichten-URLs, getrennt von Analysen und späten
Nachlieferungen. Das Beobachtungsfenster wird angegeben; es ist keine Behauptung
über den exakten Zeitpunkt zwischen zwei Abfragen. Eine unveränderte oder
korrigierte URL zählt nicht als neuer Artikel. Ausfälle sind unbekannte Werte,
nicht null Veröffentlichungen. Eine Importbestätigung ist kein Live-Nachweis.

Der Vergleich zwischen Redaktionsbestand und Feed verwendet denselben
Ereigniszeitpunkt wie der öffentliche Feed. Ein späteres Import- oder
MPD-Bearbeitungsdatum erzeugt keine künstliche Veröffentlichungslücke.
Das ersetzt keine inhaltliche Versionsprüfung auf der Detailseite.

## Begrenzte automatische Wiederaufnahme

- Bereits geprüfte und im Hauptbranch enthaltene Meldungen fehlen nach der
  Karenzzeit im Live-Feed: normalen Deployment-Workflow starten.
- Frisch bestätigte Bridge-Ausgaben warten über zehn Minuten und kein Import
  läuft oder wartet: den bestehenden Import-Workflow anstoßen.
- Vor dem Start Hauptbranch und aktive Läufe erneut lesen. Ein veränderter
  Hauptbranch oder aktiver Lauf verwirft den veralteten Wiederaufnahmeplan.
- Die Absicht wird vor dem GitHub-Aufruf dauerhaft im bestehenden Monitorzustand
  gespeichert. Ein ungewisser Aufruf wird nicht blind wiederholt.
- Höchstens ein Versuch je Workflow und Commit, mindestens 30 Minuten Abstand
  und höchstens vier Versuche in 24 Stunden. Normale Timer bleiben unabhängig.
- Ein gestarteter Versuch ist keine behobene Störung. Fehlgeschlagene Prüfungen
  bleiben sichtbar, bis ein nachfolgender Lauf erfolgreich abgeschlossen wurde;
  der Feed wird zusätzlich geprüft.

Die Wiederaufnahme verwendet vollständige bestehende Release-Prüfungen und
Sperren. Sie verändert keine Artikel, Claims, Autorinnenfreigaben, Budgets oder
bezahlten Versuche. Der Import wird nur im Bridge-Modus angestoßen.

## Grenzen und Rücknahme

Unbekannte Codefehler und fachlich ungültige Ergebnisse erfordern weiterhin eine
konkrete Korrektur. Eine automatische Codex-Cloud-Beauftragung ist durch diese
Änderung nicht eingerichtet. Die lokale Codex-Automation ist kein Ersatz für
die serverseitigen Prüfungen.

Die Wiederaufnahme bleibt im bestehenden Monitor-Workflow serialisiert, ebenso
der Zugriff auf den älteren Oracle-Bridge-Dienst. GitHub-Verzögerungen sind keine
garantierte Echtzeitüberwachung. Die Funktion kann durch Rücknahme dieses Commits
entfernt werden, ohne Queue, persönliche Aufträge oder Nachrichten zu löschen.

Validierung: Live-Erkennung, unveränderte und wiederkehrende URLs, Nachlieferung,
Feed-Ausfall, Importbestätigung ohne Live-Nachweis, Datumsvergleich, aktive
Workflows, Hauptbranch-Wechsel, persistierte Versuche, ungewisse Antworten,
Versuchslimits und Fortbestand der Release-Prüfungen.
