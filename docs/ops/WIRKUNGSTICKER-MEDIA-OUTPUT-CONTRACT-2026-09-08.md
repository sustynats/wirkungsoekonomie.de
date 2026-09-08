# Mediencheck: explizites Ausgabeobjekt und Strukturdiagnose

Stand: 8. September 2026.

## Befund

Die neue, noch unveröffentlichte Story `wt-6343ca92be9f7cb8` wurde am
8. September um 02:37 UTC wegen einer zu kurzen Medienerklärung gehalten.
Die regulären Wiederholungen um 02:52 und 03:37 UTC scheiterten mit
`MEDIA_IMPACT_REQUIRED`. Die vorherige Diagnose weist jeweils null Wörter
für die ursprüngliche Medienerklärung aus; sie unterscheidet aber nicht
zwischen fehlendem Feld, null und falschem Datentyp. Der ursprüngliche
Modelltext wird nicht nachträglich erfunden oder als bekannt vorausgesetzt.

Der Prüfer verlangt bei ausgelöstem Mediencheck bereits ein Objekt. Ein
ausdrücklich negatives Prüfergebnis (`relevant:false`) ist zulässig; ein
fehlendes Ergebnis ist es nicht. Der Prompt beschrieb bisher die mögliche
negative Entscheidung, machte den Unterschied zu null aber nicht explizit.
Das ist eine vermeidbare Unklarheit im Ausgabeauftrag, kein Beweis dafür,
dass allein diese Formulierung die bisherigen Modellausgaben verursacht hat.

## Änderung

- Im bestehenden Medienprompt ist für zur Veröffentlichung empfohlene
  Kandidaten mit relevantem Trigger ein Medienobjekt ausdrücklich Pflicht.
  Entweder vollständiger Befund oder begründetes `relevant:false`; niemals
  ein still ausgelassener Check. Die knappe redaktionelle Ablehnung bleibt
  unverändert möglich.
- Derselbe Regelumfang ist kompakter formuliert, damit auch große
  Quellenpakete innerhalb der vorhandenen 39.000-Zeichen-Grenze bleiben.
  Keine Quelle, Regel, Belegstelle oder Qualitätsprüfung wurde dafür entfernt.
- Die interne Fehlerdiagnose erfasst vor der Normalisierung nur den
  Datentyp (`missing`, `null`, `object`, `array` usw.) und gegebenenfalls
  den tatsächlich gelieferten booleschen Relevanzwert. Keine Rohtexte,
  beliebigen Modellfelder oder privaten Inhalte werden zusätzlich gespeichert.
- Historische Diagnosen ohne diesen Snapshot bleiben unbekannt. Sie werden
  nicht rückwirkend als fehlender oder negativer Check umgedeutet.

Unverändert bleiben Relevanztrigger, Evidenz-/Medien-/Self-Frame-Gates,
Wortgrenzen, Retry-Zähler, Cooldowns, Quellenrechte, Budgets und
Veröffentlichungsentscheidungen. Die Reparatur analysiert oder publiziert
selbst keine Nachricht. Sie wird über den normalen Nachrichtenworkflow
wirksam; keine manuelle zusätzliche kostenpflichtige Anfrage.

## Regressionen

Der neue Prompt-Vertragstest war vor der Änderung rot. Die Tests sichern:

- Pflichtobjekt in beiden Promptvarianten, mit und ohne optionale Visuals;
- fehlende/null-Ausgabe bleibt gesperrt;
- ein ausdrücklich negatives Prüfergebnis bleibt möglich;
- Typdiagnose vor/nach Normalisierung, strikte Boolesche Werte und keine
  Übernahme von Modelltexten in die neuen Diagnosefelder;
- rückwärtskompatible unbekannte historische Diagnose;
- große wachsende Quellenpakete samt Belegidentitäten innerhalb des Limits.

Alle 624 Nachrichten- und Betriebsmonitor-Tests, Typecheck, Ticker-Build,
Inhaltsvalidierung und beide Hosting-Kostengates sind bestanden. Es wurde
keine bezahlte Modellprobe ausgeführt. Ob die nächste
reguläre Wiederholung einen gültigen Befund liefert, bleibt bis zu deren
Abschluss offen; ein erfolgreicher Test ist kein Veröffentlichungsnachweis.
