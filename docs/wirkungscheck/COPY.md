# Wahlkreis-Wirkungscheck — Texte

Version 1.0 · Stand 2026-08-13 · Lane: Claude (Design/UX) · Umsetzung: Codex

Alle sichtbaren Texte. Schlüssel sind stabil und für eine spätere Lokalisierung
(`/en/`) vorbereitet. Platzhalter in geschweiften Klammern.

**Formale Regeln:** Siezen. Keine Gedankenstriche `–` oder `—` (Brand Guide §4).
Keine Ausrufezeichen. Keine Emojis. Datum `TT.MM.JJJJ`. Zahlen mit Punkt als
Tausendertrennzeichen. Prozent mit geschütztem Leerzeichen.

Fachlich nicht freigegebene Inhalte (Themenliste, Indikatoren, Regeltexte,
Betreiberangaben) sind mit **[ENTWURF]** markiert.

---

## 1. Global

| Schlüssel | Text |
|---|---|
| `app.name` | Wahlkreis-Wirkungscheck |
| `app.tagline` | Parteiunabhängiger Wirkungscheck für Mitglieder des Deutschen Bundestages |
| `app.operator` | **[ENTWURF]** Wirkungsinstitut · Think Tank der Wirkungsökonomie |
| `nav.trust` | Vertrauen & Datenschutz |
| `nav.method` | Methodik |
| `nav.skip` | Zum Inhalt springen |
| `action.back` | Zurück |
| `action.next` | Weiter |
| `action.skip` | Überspringen |
| `action.change` | Ändern |
| `action.close` | Schliessen |
| `action.copy` | Text kopieren |
| `action.copied` | Text kopiert |
| `action.reset` | Zurücksetzen |
| `action.retry` | Erneut versuchen |
| `action.openSource` | Quelle |
| `action.deleteLocal` | Alle lokalen Daten löschen |
| `meta.dataAs` | Datenstand {datum} |
| `meta.methodVersion` | Methodik-Version {version} |
| `meta.createdAt` | Erstellt am {datum} |
| `notice.noPersonRating` | Dieser Report bewertet keine Personen und keine Parteien. Er ordnet Wirkungszusammenhänge auf Basis Ihrer Angaben ein. |
| `notice.mockData` | Prototyp mit Beispieldaten. Alle Werte, Regeln und Quellen sind erfunden und dienen ausschliesslich der Gestaltung. |

---

## 2. Landing (S-01)

| Schlüssel | Text |
|---|---|
| `landing.eyebrow` | Parteiunabhängiges Wirkungsinstrument |
| `landing.h1` | Was soll Politik in Ihrem Wahlkreis tatsächlich verändern? |
| `landing.subline` | Beantworten Sie wenige kurze Fragen und erhalten Sie eine individuelle Wirkungsanalyse mit politischen Handlungsoptionen, geeigneten Wirkungsindikatoren und transparenter Herleitung. |
| `landing.cta.primary` | Wirkungscheck starten |
| `landing.cta.secondary` | So funktioniert die Methodik |
| `landing.cta.note` | Etwa 5 Minuten · 10 Fragen · Abbrechen jederzeit möglich |
| `landing.trustline` | Parteiunabhängig · Transparent hergeleitet · Datensparsam · Keine Personenbewertung · Quellen nachvollziehbar · Kein Konto nötig |

### Wiederaufnahme

| Schlüssel | Text |
|---|---|
| `landing.resume.title` | Sie haben eine begonnene Befragung |
| `landing.resume.body` | Zuletzt bearbeitet am {datum}. Ihre Antworten liegen in diesem Browser. |
| `landing.resume.continue` | Befragung fortsetzen |
| `landing.resume.restart` | Neu beginnen |
| `landing.saved.title` | Ihr Report vom {datum} ist gespeichert |
| `landing.saved.open` | Report öffnen |

### Was Sie erhalten

| Schlüssel | Text |
|---|---|
| `landing.value.title` | Was am Ende entsteht |
| `landing.value.1.title` | Eine Wirkungsanalyse |
| `landing.value.1.body` | Ihre Prioritäten, die dazu passenden Wahlkreisdaten und die Stelle, an der Wirkung derzeit begrenzt wird. |
| `landing.value.2.title` | Drei Handlungsoptionen |
| `landing.value.2.body` | Jeweils mit Handlungsebene, Wirkungshorizont, Belegbarkeit und vollständiger Herleitung. |
| `landing.value.3.title` | Ein Politik-Kit |
| `landing.value.3.body` | Eine mögliche Prüffrage, drei Wirkungsindikatoren, eine Frage für den Wahlkreisdialog und ein erster Schritt. Zum Kopieren. |

### Ablauf

| Schlüssel | Text |
|---|---|
| `landing.steps.title` | Der Ablauf |
| `landing.steps.1` | Wahlkreis wählen oder bundesweit arbeiten · etwa 15 Sekunden |
| `landing.steps.2` | Zehn kurze Fragen zu Prioritäten und Engpässen · etwa 4 Minuten |
| `landing.steps.3` | Angaben prüfen und korrigieren · etwa 20 Sekunden |
| `landing.steps.4` | Report lesen, Herleitung öffnen, als PDF sichern |

### Parteiunabhängigkeit

| Schlüssel | Text |
|---|---|
| `landing.neutral.title` | Warum dieses Werkzeug parteiunabhängig ist |
| `landing.neutral.body` | Der Wirkungscheck fragt nicht nach Fraktion, Partei oder Person. Er vergleicht keine Abgeordneten, erstellt keine Rangliste und gibt keine Wahlempfehlung. Die Auswertung folgt einem offengelegten Regelwerk, das für alle Teilnehmenden identisch ist. Dieselben Angaben führen immer zum selben Ergebnis. |
| `landing.neutral.link` | Regelwerk und Methodik ansehen |

### Datenschutz

| Schlüssel | Text |
|---|---|
| `landing.privacy.title` | Was mit Ihren Angaben geschieht |
| `landing.privacy.body` | Ihre Antworten bleiben zunächst ausschliesslich in Ihrem Browser. Es gibt kein Konto, keine Anmeldung und keine Übertragung im Hintergrund. Erst nachdem Sie Ihren Report gesehen haben, fragen wir, ob Sie zusätzlich zur Gesamtauswertung beitragen möchten. Sie können jederzeit alle lokalen Daten löschen. |
| `landing.privacy.link` | Vertrauen & Datenschutz öffnen |

---

## 3. Wahlkreis-Auswahl (S-04)

| Schlüssel | Text |
|---|---|
| `district.eyebrow` | Schritt 1 von 2 vor der Befragung |
| `district.h1` | Für welchen Wahlkreis möchten Sie den Wirkungscheck durchführen? |
| `district.intro` | Der Wahlkreis bestimmt, welche regionalen Daten in Ihren Report einfliessen. Die Angabe ist freiwillig. |
| `district.label` | Wahlkreis suchen |
| `district.hint` | Suche nach Wahlkreisname, Nummer, Ort oder Postleitzahl |
| `district.placeholder` | Zum Beispiel Mannheim, 275 oder 68159 |
| `district.examples` | Beispiele: |
| `district.minChars` | Bitte geben Sie mindestens zwei Zeichen ein. |
| `district.results` | {n} Treffer |
| `district.resultsOne` | 1 Treffer |
| `district.empty.title` | Kein Wahlkreis gefunden |
| `district.empty.body` | Prüfen Sie die Schreibweise, oder fahren Sie ohne Wahlkreisbezug fort. |
| `district.ambiguous` | Die Postleitzahl {plz} liegt in mehreren Wahlkreisen. |
| `district.selected` | Gewählter Wahlkreis |
| `district.alt.title` | Überwiegend landes- oder bundesweite Arbeit |
| `district.alt.body` | Dann entfällt der Wahlkreisbezug. Ihr Report nutzt Bundesdaten und bundesweite Wirkungshebel. |
| `district.privacy` | Die Wahlkreisangabe bleibt in Ihrem Browser. Sie wird nur übertragen, wenn Sie am Ende ausdrücklich zustimmen. |

---

## 4. Survey Intro (S-05)

| Schlüssel | Text |
|---|---|
| `intro.h1` | Zehn Fragen zu Wirkung statt zu Meinung |
| `intro.body` | Die folgenden Fragen betreffen Zustände, die sich verändern sollen, und die Stellen, an denen Veränderung derzeit hängt. Es gibt keine richtigen und keine falschen Antworten. |
| `intro.ask.title` | Was wir fragen |
| `intro.ask.items` | Ihre inhaltlichen Prioritäten · Welche Zustände sich verbessern sollen · Wo Sie den Engpass sehen · Auf welcher Ebene gehandelt werden müsste |
| `intro.noask.title` | Was wir nicht fragen |
| `intro.noask.items` | Ihren Namen · Ihre Fraktion oder Partei · Ihre Kontaktdaten · Ihr Abstimmungsverhalten |
| `intro.duration` | Etwa 4 Minuten. Sie können jede Antwort jederzeit ändern und die Befragung jederzeit abbrechen. |
| `intro.start` | Mit Frage 1 beginnen |

---

## 5. Fragen

### Frage 1 · Prioritäten

| Schlüssel | Text |
|---|---|
| `q1.eyebrow` | Wirkungsprioritäten |
| `q1.title` | Welche Themen sollen sich in Ihrem Wahlkreis am spürbarsten verbessern? |
| `q1.help` | Wählen Sie bis zu fünf Themen. Im nächsten Schritt bringen Sie bis zu drei davon in eine Reihenfolge. |
| `q1.selection` | Mehrfachauswahl, bis zu 5 · {n} von 5 gewählt |
| `q1.maxReached` | Höchstens fünf Themen. Entfernen Sie eine Auswahl, um eine andere zu treffen. |
| `q1.error` | Bitte wählen Sie mindestens ein Thema. |
| `q1.why` | Wirkung entsteht selten überall gleichzeitig. Die Themenauswahl bestimmt, welche Wirkungszusammenhänge geprüft werden, und mit welchen Daten Ihres Wahlkreises sie abgeglichen werden. Sie legt keine Rangfolge zwischen politischen Zielen fest. |

**[ENTWURF]** Themenliste, redaktionell nicht freigegeben. Nach Wirkungsfeldern
sortiert, bewusst breit und ohne Lagerzuschnitt:

| ID | Label | Hinweis | Wirkungsfeld |
|---|---|---|---|
| `wohnen` | Bezahlbarer Wohnraum | Mietbelastung, Neubau, Bestandssicherung | Mensch |
| `gesundheit` | Gesundheitsversorgung | Erreichbarkeit, Fachärzte, Pflege | Mensch |
| `bildung` | Bildung und Betreuung | Schulen, Kitas, Ausbildungsplätze | Mensch |
| `arbeit` | Arbeit und Fachkräfte | Fachkräftebedarf, Qualifizierung, Erwerbsbeteiligung | Mensch |
| `einkommen` | Einkommen und Lebenshaltung | Kaufkraft, Energiekosten, Existenzsicherung | Mensch |
| `sicherheit` | Innere Sicherheit | Kriminalität, Prävention, Sicherheitsgefühl | Mensch |
| `integration` | Zuwanderung und Integration | Verfahren, Arbeitsmarktzugang, Zusammenhalt | Mensch |
| `verkehr` | Verkehr und Erreichbarkeit | Nahverkehr, Strassen, Anbindung | Planet |
| `energie` | Energie und Netze | Anschlüsse, Versorgungssicherheit, Preise | Planet |
| `klimafolgen` | Klimafolgen und Vorsorge | Hitze, Hochwasser, Anpassung | Planet |
| `flaeche` | Fläche und Landwirtschaft | Flächennutzung, Betriebe, Naturhaushalt | Planet |
| `wirtschaft` | Wirtschaftsstruktur | Ansiedlung, Transformation, Betriebe | Planet |
| `digital` | Digitale Infrastruktur | Netzausbau, Verwaltungsdigitalisierung | Demokratie |
| `verwaltung` | Verwaltung und Verfahren | Genehmigungsdauer, Bürokratie, Personal | Demokratie |
| `vertrauen` | Vertrauen in Institutionen | Beteiligung, Transparenz, Erreichbarkeit | Demokratie |
| `medien` | Information und Desinformation | Medienqualität, Diskursfähigkeit | Demokratie |
| `kommunal` | Kommunale Handlungsfähigkeit | Haushalt, Personal, Aufgabenlast | Demokratie |

Die Zuordnung zu Mensch, Planet und Demokratie erscheint im UI als kleine Zeile,
nicht als Gruppierung, damit keine thematische Vorsortierung entsteht.

### Frage 2 · Priorisierung

| Schlüssel | Text |
|---|---|
| `q2.eyebrow` | Priorisierung |
| `q2.title` | Welche drei Themen haben für Ihre Arbeit den grössten Stellenwert? |
| `q2.help` | Die Reihenfolge steuert, welchen Wirkungszusammenhang wir zuerst prüfen. Sie ist keine Bewertung der übrigen Themen. |
| `q2.ranked` | Ihre Reihenfolge |
| `q2.pool` | Nicht priorisiert |
| `q2.add` | Aufnehmen |
| `q2.remove` | Entfernen |
| `q2.up` | Nach oben |
| `q2.down` | Nach unten |
| `q2.announce` | {label} ist jetzt Position {n} von {total}. |
| `q2.error` | Bitte nehmen Sie mindestens ein Thema in die Reihenfolge auf. |
| `q2.why` | Ressourcen, Zeit und politische Aufmerksamkeit sind begrenzt. Die Reihenfolge entscheidet, welcher Wirkungszusammenhang zuerst auf Engpässe geprüft wird, nicht welches Ziel wichtiger ist. |

### Frage 3 · Zustandsziel

| Schlüssel | Text |
|---|---|
| `q3.eyebrow` | Gewünschte Veränderung |
| `q3.title` | Welcher Zustand soll sich bei „{thema}" konkret verbessern? |
| `q3.help` | Gemeint ist der Zustand, nicht die Massnahme. |
| `q3.error` | Bitte wählen Sie einen Zustand. |
| `q3.why` | Massnahmen und eingesetzte Mittel zeigen noch nicht automatisch, ob sich ein Zustand tatsächlich verbessert hat. Deshalb unterscheiden wir zwischen Umsetzung und Wirkung. Ein Programm kann vollständig umgesetzt sein, ohne dass sich der Zustand verändert, den es verbessern sollte. |

**[ENTWURF]** Beispiel Zustandsziele zu `energie`:

| ID | Label | Hinweis |
|---|---|---|
| `z_anschluss` | Anschlusszeiten verkürzen | Wartezeit von Antrag bis Netzanschluss |
| `z_versorgung` | Versorgungssicherheit erhöhen | Ausfallzeiten und Reservekapazität |
| `z_preis` | Energiekosten senken | Belastung für Haushalte und Betriebe |
| `z_ausbau` | Erzeugung vor Ort ausbauen | Anteil regional erzeugter Energie |

### Frage 4 · Engpass

| Schlüssel | Text |
|---|---|
| `q4.eyebrow` | Engpass |
| `q4.title` | Woran hängt die Umsetzung aus Ihrer Sicht derzeit am meisten? |
| `q4.help` | Wählen Sie bis zu zwei. |
| `q4.error` | Bitte wählen Sie mindestens einen Engpass. |
| `q4.why` | In der Wirkungsökonomie begrenzt der schwächste zentrale Faktor das Gesamtergebnis. Zusätzliche Mittel an einer Stelle erhöhen die Wirkung nur unterproportional, solange an anderer Stelle etwas blockiert. Ihre Angabe bestimmt, an welcher Stelle die Handlungsoptionen ansetzen. |

Optionen: Finanzierung · Personal und Fachkräfte · Genehmigungs- und
Planungsverfahren · Fläche und Infrastruktur · Datenlage und Steuerungswissen ·
Koordination zwischen Bund, Land und Kommune · Akzeptanz und Vertrauen ·
Rechtsrahmen

### Frage 5 · Wirkungshorizont

| Schlüssel | Text |
|---|---|
| `q5.eyebrow` | Wirkungshorizont |
| `q5.title` | In welchem Zeitraum soll die Veränderung spürbar werden? |
| `q5.help` | Der Zeitraum beeinflusst, welche Handlungspfade überhaupt in Frage kommen. |
| `q5.opt.wahlperiode` | Innerhalb dieser Wahlperiode |
| `q5.opt.wahlperiode.hint` | Wirkung soll bis zum Ende der laufenden Legislatur sichtbar sein |
| `q5.opt.mittelfristig` | 5 bis 10 Jahre |
| `q5.opt.mittelfristig.hint` | Wirkung über eine Wahlperiode hinaus, planbar und überprüfbar |
| `q5.opt.generation` | Generationenaufgabe |
| `q5.opt.generation.hint` | Wirkung entsteht über Jahrzehnte, Zwischenschritte sind messbar |
| `q5.why` | Manche Wirkungen treten schnell ein und verpuffen, andere brauchen Jahre und halten. Der gewählte Horizont entscheidet, welche Handlungspfade sinnvoll vergleichbar sind, und welche Indikatoren überhaupt etwas anzeigen können. |

### Frage 6 · Handlungsebene

| Schlüssel | Text |
|---|---|
| `q6.eyebrow` | Handlungsebene |
| `q6.title` | Auf welcher Ebene müsste aus Ihrer Sicht gehandelt werden? |
| `q6.help` | Mehrfachauswahl möglich. |
| `q6.error` | Bitte wählen Sie mindestens eine Ebene. |
| `q6.why` | Dieselbe Zielsetzung führt je nach Ebene zu völlig unterschiedlichen Handlungspfaden. Ihre Angabe filtert Optionen heraus, die auf einer Ebene liegen, die Sie nicht adressieren möchten. |

Optionen: Europäische Union · Bund · Land · Kommune

### Frage 7 · Rahmenbedingungen

| Schlüssel | Text |
|---|---|
| `q7.eyebrow` | Rahmenbedingungen |
| `q7.title` | Wie wichtig sind Ihnen die folgenden Rahmenbedingungen? |
| `q7.help` | Diese Gewichte können Sie später im Report probeweise verschieben und sehen, ob sich das Ergebnis ändert. |
| `q7.scale` | sehr wichtig · wichtig · teils · weniger wichtig · nicht wichtig |
| `q7.error` | Noch offen: {labels} |
| `q7.rows` | Haushaltsverträglichkeit · Verwaltungsaufwand · Regionale Verteilungswirkung · Planungssicherheit für Betriebe · Kommunale Eigenverantwortung |
| `q7.why` | Handlungspfade unterscheiden sich nicht nur in der Wirkung, sondern in dem, was sie voraussetzen und was sie an anderer Stelle kosten. Ihre Gewichtung macht diese Abwägung explizit, statt sie im Regelwerk zu verstecken. |

### Frage 8 · Rote Linien

| Schlüssel | Text |
|---|---|
| `q8.eyebrow` | Rote Linien · optional |
| `q8.title` | Gibt es etwas, das sich dabei nicht verschlechtern darf? |
| `q8.help` | Optional. Mehrfachauswahl möglich. |
| `q8.why` | Positive Wirkung an einer Stelle kann negative Wirkung an anderer Stelle erzeugen. In der Wirkungsökonomie darf eine schwere negative Wirkung nicht durch positive Werte anderswo verdeckt werden. Ihre Angabe setzt Handlungspfade nach hinten, die das genannte Feld belasten würden. |

Optionen: Kommunale Haushalte · Bezahlbarkeit für Haushalte · Landwirtschaftliche
Flächen · Naturhaushalt und Artenvielfalt · Planungssicherheit für Betriebe ·
Gleichwertigkeit ländlicher Räume · Verwaltungsbelastung der Kommunen

### Frage 9 · Wahlkreiskontext (adaptiv)

| Schlüssel | Text |
|---|---|
| `q9.eyebrow` | Wahlkreiskontext |
| `q9.title` | Welcher dieser Befunde ist aus Ihrer Sicht der drängendste? |
| `q9.adaptiveNote` | Diese Frage erscheint, weil Sie den Wahlkreis {nr} {name} gewählt haben. |
| `q9.help` | Die Werte stammen aus amtlichen Quellen. Jeder Wert lässt sich über „Quelle" nachvollziehen. |
| `q9.gap` | Datenlücke |
| `q9.gapHint` | Für diesen Indikator liegen auf Wahlkreisebene keine Daten vor. Sie können ihn dennoch als drängend markieren. |
| `q9.why` | Der Report soll nicht nur Ihre Einschätzung wiedergeben, sondern sie mit der Datenlage vor Ort abgleichen. Wo beides auseinanderfällt, ist das ein eigenständiger Befund und erscheint im Report. |

### Frage 10 · Freitext

| Schlüssel | Text |
|---|---|
| `q10.eyebrow` | Ergänzung · optional |
| `q10.title` | Gibt es eine konkrete Situation in Ihrem Wahlkreis, die wir kennen sollten? |
| `q10.help` | Optional. Höchstens 600 Zeichen. |
| `q10.notice` | Bitte keine personenbezogenen Angaben Dritter. |
| `q10.disclaimer` | Ihr Hinweis wird nicht automatisch ausgewertet. Er erscheint in Ihrem Report und, falls Sie zustimmen, in der redaktionellen Auswertung. |
| `q10.counter` | {n} von 600 Zeichen |
| `q10.tooLong` | Der Text ist {n} Zeichen lang. Bitte kürzen Sie ihn auf 600 Zeichen. Ihr Text bleibt erhalten. |

---

## 6. Fortschritt und Navigation

| Schlüssel | Text |
|---|---|
| `progress.label` | Frage {n} von {total} · noch etwa {minuten} |
| `progress.min4` | 4 Minuten |
| `progress.min3` | 3 Minuten |
| `progress.min2` | 2 Minuten |
| `progress.min1` | 1 Minute |
| `progress.last` | letzter Schritt |
| `progress.segment` | Zu Frage {n}: {titel}. {status} |
| `progress.answered` | Beantwortet |
| `progress.current` | Aktuelle Frage |
| `progress.upcoming` | Noch nicht beantwortet |
| `progress.announce` | Frage {n} von {total} |
| `nav.blocked` | Bitte beantworten Sie diese Frage, um fortzufahren. |
| `nav.abort` | Befragung abbrechen |
| `nav.abortNote` | Ihre bisherigen Antworten bleiben in diesem Browser gespeichert. |

---

## 7. Antworten prüfen (S-09)

| Schlüssel | Text |
|---|---|
| `review.h1` | Ihre Angaben im Überblick |
| `review.intro` | Bitte prüfen Sie Ihre Angaben. Sie können jede Antwort ändern. |
| `review.notAnswered` | Nicht beantwortet · optional |
| `review.missing` | Diese Angabe wird für den Report benötigt. |
| `review.complete` | Ergänzen |
| `review.processNote` | Ihre Angaben werden lokal mit dem Regelwerk abgeglichen. Es findet keine Übertragung statt. |
| `review.submit` | Wirkungsreport erstellen |
| `review.blocked` | Bitte ergänzen Sie: {labels} |
| `review.changed` | Angabe geändert: {label} |

---

## 8. Ergebnis wird erstellt (S-10)

| Schlüssel | Text |
|---|---|
| `loading.h1` | Ihr Wirkungsreport wird erstellt |
| `loading.step1` | Ihre Angaben werden geprüft |
| `loading.step2` | Wahlkreisdaten werden geladen |
| `loading.step3` | Regelwerk wird angewendet |
| `loading.step4` | Herleitung wird erstellt |
| `loading.slow` | Das dauert länger als üblich. Ihre Angaben sind gespeichert. |
| `loading.cancel` | Abbrechen und zu den Angaben zurück |

---

## 9. Report (S-11)

### Kopf

| Schlüssel | Text |
|---|---|
| `report.eyebrow` | Ihr Wahlkreis-Wirkungsreport |
| `report.h1.district` | Wahlkreis {nr} · {name} |
| `report.h1.national` | Bundesweite Betrachtung |
| `report.meta` | Datenstand {datum} · Methodik-Version {version} · Erstellt am {erstellt} |

### Abschnitte

| Schlüssel | Text |
|---|---|
| `report.priorities.title` | Ihre genannten Prioritäten |
| `report.priorities.intro` | So haben Sie Ihre Schwerpunkte gesetzt. |
| `report.goals.title` | Ihre gewünschten Veränderungen |
| `report.goals.intro` | Diese Zustände sollen sich nach Ihren Angaben verbessern. |
| `report.context.title` | Relevanter Wahlkreiskontext |
| `report.context.titleNational` | Relevanter Bundeskontext |
| `report.context.intro` | Nur die Daten, die für Ihre Prioritäten verwendet wurden. Jeder Wert ist über „Quelle" nachvollziehbar. |
| `report.context.gap` | Für diesen Indikator liegen keine Daten auf der benötigten Ebene vor. {folge} |
| `report.levers.title` | Wirkungshebel |
| `report.levers.intro` | Wo Wirkung nach Ihren Angaben und der Datenlage derzeit begrenzt wird. |
| `report.levers.binding` | begrenzend |
| `report.levers.partial` | teilweise adressiert |
| `report.levers.covered` | ausreichend adressiert |
| `report.levers.conclusion` | Solange {faktor} begrenzt, erhöhen zusätzliche Mittel die Wirkung nur unterproportional. |
| `report.paths.title` | Handlungsoptionen |
| `report.paths.intro` | Die Buchstaben sind eine Lesereihenfolge, keine Rangfolge. Alle drei Pfade sind nach denselben Regeln hergeleitet. |
| `report.paths.none` | Zu dieser Kombination liegt derzeit kein hinterlegter Wirkungspfad vor. Geprüft wurden: {angaben}. Ihre Prioritäten, der Wahlkreiskontext und das Politik-Kit stehen Ihnen unverändert zur Verfügung. |
| `report.paths.single` | Zu Ihrer Kombination greift derzeit eine Regel. Weitere Pfade sind für diese Konstellation noch nicht hinterlegt. |
| `report.mpd.title` | Mensch · Planet · Demokratie |
| `report.mpd.intro` | Diese Übersicht ordnet mögliche Wirkungsrichtungen. Sie ist keine Bewertung Ihrer Person und keine Gesamtnote. |
| `report.mpd.empty` | Für diesen Wirkungsraum liegen zu Ihrem Schwerpunkt keine belastbaren Angaben vor. |
| `report.mpd.mensch` | Mensch |
| `report.mpd.planet` | Planet |
| `report.mpd.demokratie` | Demokratie |

### Empfehlungskarte

| Schlüssel | Text |
|---|---|
| `path.eyebrow` | Handlungspfad {letter} |
| `path.match` | Passt zu Ihrer Angabe: {angaben} |
| `path.explain` | Warum wird mir das vorgeschlagen? |
| `path.showPath` | Wirkungspfad ansehen |
| `path.alternatives` | Alternativen |
| `badge.level.eu` | Europäische Union |
| `badge.level.bund` | Bund |
| `badge.level.land` | Land |
| `badge.level.kommune` | Kommune |
| `badge.horizon.kurz` | 1 bis 2 Jahre |
| `badge.horizon.mittel` | 3 bis 5 Jahre |
| `badge.horizon.lang` | über 5 Jahre |

---

## 10. Belegbarkeit

| Schlüssel | Text |
|---|---|
| `evidence.hoch` | Belegbarkeit: hoch |
| `evidence.hoch.def` | Mehrere unabhängige Studien oder eine amtliche Zeitreihe stützen die Aussage. |
| `evidence.mittel` | Belegbarkeit: mittel |
| `evidence.mittel.def` | Belastbare Einzelstudien liegen vor. Die Übertragbarkeit auf Ihren Wahlkreis ist begrenzt. |
| `evidence.begrenzt` | Belegbarkeit: begrenzt |
| `evidence.begrenzt.def` | Die Aussage stützt sich auf Einzelfälle oder einen Analogieschluss. |
| `evidence.datenluecke` | Datenlücke |
| `evidence.datenluecke.def` | Für die benötigte Ebene liegen keine belastbaren Daten vor. |
| `evidence.annahme` | Modellannahme |
| `evidence.annahme.def` | Eine im Regelwerk gesetzte Annahme, keine Messung. Die Annahme lautet: {annahme} |
| `evidence.legend` | Was bedeuten diese Angaben? |

---

## 11. Herleitung (S-13)

| Schlüssel | Text |
|---|---|
| `explain.title` | Warum wird mir das vorgeschlagen? |
| `explain.subtitle` | Handlungspfad {letter} · Regel {ruleId} |
| `explain.s1` | Ihre Angaben |
| `explain.s2` | Wahlkreisdaten |
| `explain.s3` | Methodik |
| `explain.s4` | Daraus folgt |
| `explain.s5` | Was würde das verändern |
| `explain.s6` | Warum nicht Alternative B |
| `explain.rule` | Regel {ruleId} |
| `explain.ruleText` | Wenn {bedingungen}, dann {schluss}. |
| `explain.basis` | Grundlage: {basis} |
| `explain.noValue` | keine angegeben |
| `explain.gap` | Datenlücke. {folge} |
| `explain.noAlternative` | Für diese Konstellation ist derzeit keine Alternative hinterlegt. Das bedeutet nicht, dass es keine gibt. |
| `explain.twoRules` | Zwei unabhängige Regeln führen zu diesem Pfad: {ids}. Das stützt die Aussage zusätzlich. |
| `explain.notReleased` | Die Herleitung dieser Regel ist noch nicht freigegeben. |
| `explain.sensitivityActive` | Sie sehen die Was-wäre-wenn-Ansicht. Ihre ursprünglichen Angaben sind unverändert. |
| `explain.full` | Vollständige Herleitung öffnen |
| `explain.sources` | Quellen ansehen |
| `explain.editAnswer` | Diese Angabe ändern |

---

## 12. Wirkpfad (S-14)

| Schlüssel | Text |
|---|---|
| `impact.title` | Möglicher Wirkungspfad |
| `impact.view.flow` | Als Verlauf |
| `impact.view.list` | Als Liste |
| `impact.s1` | Politischer Hebel |
| `impact.s2` | Unmittelbare Veränderung |
| `impact.s3` | Folgewirkung |
| `impact.s4` | Systemwirkung |
| `impact.risks` | Risiken und Gegenwirkungen |
| `impact.risks.empty` | Zu diesem Pfad sind keine belastbaren Gegenwirkungen hinterlegt. |
| `impact.note` | Ein Wirkungspfad beschreibt einen plausiblen Weg, keine Garantie. Jede Station trägt ihre eigene Belegbarkeit. |

---

## 13. Quellen (S-15)

| Schlüssel | Text |
|---|---|
| `source.title` | Quelle |
| `source.institution` | Institution |
| `source.metric` | Kennzahl |
| `source.year` | Jahr |
| `source.level` | Geografische Ebene |
| `source.quality` | Datenqualität |
| `source.link` | Zur Quelle |
| `source.linkNote` | Öffnet eine externe Seite |
| `source.noLink` | Nicht online verfügbar |
| `source.areaNote` | Der Gebietsstand weicht vom aktuellen Wahlkreiszuschnitt ab. {hinweis} |
| `source.all` | Vollständiges Quellenverzeichnis |

---

## 14. Sensitivität (S-16)

| Schlüssel | Text |
|---|---|
| `sens.title` | Was würde sich ändern, wenn |
| `sens.intro` | Verschieben Sie probeweise Ihre Gewichtung. Ihre ursprünglichen Angaben bleiben unverändert. |
| `sens.max` | Höchstens drei Annahmen gleichzeitig, damit das Ergebnis nachvollziehbar bleibt. |
| `sens.chip.haushalt` | Haushaltsverträglichkeit stärker gewichten |
| `sens.chip.horizont` | Wirkungshorizont verlängern |
| `sens.chip.kommunal` | Kommunale Eigenverantwortung höher priorisieren |
| `sens.chip.verfahren` | Verfahrensbeschleunigung als gesetzt annehmen |
| `sens.chip.verteilung` | Regionale Verteilungswirkung stärker gewichten |
| `sens.result` | Ergebnis |
| `sens.changed` | Dann würde {pfad} an die erste Position rücken, weil {grund}. |
| `sens.unchanged` | An der Reihenfolge würde sich nichts ändern. {grund} |
| `sens.reset` | Auf meine Angaben zurücksetzen |
| `sens.resetDone` | Zurückgesetzt auf Ihre ursprünglichen Angaben. |

---

## 15. Politik-Kit (S-17)

| Schlüssel | Text |
|---|---|
| `kit.title` | Für Ihre politische Arbeit |
| `kit.intro` | Vier Bausteine aus Ihrem Report. Formulierungen sind Vorschläge und frei änderbar. |
| `kit.1.title` | Mögliche Prüffrage |
| `kit.1.hint` | Für Ausschuss, Anfrage oder Fachgespräch |
| `kit.2.title` | Drei Wirkungsindikatoren |
| `kit.2.hint` | Woran sich später überprüfen lässt, ob sich der Zustand verändert hat |
| `kit.3.title` | Frage für den Wahlkreisdialog |
| `kit.3.hint` | Für Bürgersprechstunde, Ortstermin oder Verbändegespräch |
| `kit.4.title` | Ein erster Schritt |
| `kit.4.hint` | Was sich ohne Gesetzesänderung beginnen lässt |
| `kit.copyFallback` | Kopieren ist in diesem Browser nicht verfügbar. Bitte markieren Sie den Text und kopieren Sie ihn mit Strg+C. |

---

## 16. Forschungs-Opt-in (S-18)

| Schlüssel | Text |
|---|---|
| `optin.title` | Beitrag zur Gesamtauswertung |
| `optin.question` | Möchten Sie mit Ihren Antworten zusätzlich zur Gesamtauswertung beitragen? |
| `optin.intro` | Ihr Report ist fertig und bleibt Ihnen in jedem Fall erhalten. Diese Frage betrifft nur die zusätzliche Nutzung Ihrer Angaben. |
| `optin.no` | Nur meinen Report nutzen |
| `optin.no.hint` | Ihre Angaben bleiben in Ihrem Browser. Nichts wird übertragen. |
| `optin.yes` | Zusätzlich zur Gesamtauswertung beitragen |
| `optin.yes.hint` | Ihre Angaben werden ohne Namen und ohne Kontaktdaten gespeichert und fliessen in aggregierte Auswertungen ein. |
| `optin.details` | Was genau wird übertragen? |
| `optin.confirmed.no` | Ihre Angaben bleiben in diesem Browser. Sie können das jederzeit ändern. |
| `optin.confirmed.yes` | Vielen Dank. Übertragen wurden: {felder}. Sie können den Beitrag jederzeit widerrufen. |
| `optin.revoke` | Beitrag widerrufen |
| `optin.failed` | Die Übertragung war nicht möglich. Ihre Angaben liegen weiterhin nur in diesem Browser. |

### Was übertragen wird

| Übertragen | Nicht übertragen |
|---|---|
| Gewählte Themen und Reihenfolge | Name, Fraktion, Kontaktdaten |
| Zustandsziel, Engpass, Horizont, Ebene | IP-Adresse in Verbindung mit den Antworten |
| Gewichtung der Rahmenbedingungen | Gerätekennung, Browserkennung |
| Wahlkreisnummer | Freitext, sofern nicht gesondert freigegeben |
| Methodik-Version und Zeitpunkt | Alles, was Sie nicht angegeben haben |

---

## 17. Veröffentlichung (S-19)

| Schlüssel | Text |
|---|---|
| `publish.title` | Ergebnis freiwillig veröffentlichen |
| `publish.intro` | Getrennt von der Gesamtauswertung können Sie Ihr Ergebnis öffentlich sichtbar machen. Das ist eine eigenständige Entscheidung. |
| `publish.preview` | So würde Ihr Beitrag öffentlich erscheinen |
| `publish.risk` | In Wahlkreisen mit wenigen Teilnehmenden kann eine Veröffentlichung Rückschlüsse auf einzelne Personen zulassen. Bitte berücksichtigen Sie das. |
| `publish.no` | Nicht veröffentlichen |
| `publish.yes` | Ergebnis veröffentlichen |
| `publish.confirmed` | Ihr Ergebnis erscheint ab {datum} unter {ort}. |
| `publish.revoke` | Veröffentlichung widerrufen |
| `publish.revoked` | Ihre Veröffentlichung wird innerhalb von {frist} entfernt. |

---

## 18. PDF (S-20)

| Schlüssel | Text |
|---|---|
| `pdf.title` | Report als PDF |
| `pdf.intro` | Das PDF enthält Ihren vollständigen Report einschliesslich aller Herleitungen und Quellen. |
| `pdf.create` | PDF erzeugen |
| `pdf.creating` | PDF wird erzeugt |
| `pdf.failed` | Das PDF konnte nicht erzeugt werden. Sie können den Report über die Druckfunktion Ihres Browsers sichern. |
| `pdf.print` | Über den Browser drucken |
| `pdf.footer` | Keine Personenbewertung. Keine Wahlempfehlung. |

---

## 19. Vertrauen & Datenschutz (S-03)

| Schlüssel | Text |
|---|---|
| `trust.title` | Vertrauen & Datenschutz |
| `trust.intro` | Die wichtigsten Angaben in Kurzform. Die vollständige Fassung finden Sie auf der Seite Vertrauen & Datenschutz. |
| `trust.1.title` | Zweck |
| `trust.1.summary` | Wofür dieses Werkzeug gebaut wurde |
| `trust.1.body` | Der Wahlkreis-Wirkungscheck unterstützt Mandatsträgerinnen und Mandatsträger dabei, politische Ziele auf Wirkung statt auf Massnahmen hin zu prüfen. Er ersetzt keine fachliche Beratung und keine parlamentarische Willensbildung. |
| `trust.2.title` | Betreiber |
| `trust.2.summary` | Wer verantwortlich ist |
| `trust.2.body` | **[ENTWURF]** Verantwortliche Stelle, Anschrift und Kontakt werden vor der Veröffentlichung eingetragen. |
| `trust.3.title` | Daten |
| `trust.3.summary` | Was gespeichert wird |
| `trust.3.body` | Ihre Antworten liegen ausschliesslich in Ihrem Browser unter dem Schlüssel `wc_state_v1`. Es gibt kein Konto und keine Anmeldung. Ohne Ihre ausdrückliche Zustimmung wird nichts übertragen. Es werden keine Cookies zu Analysezwecken gesetzt und keine Dienste Dritter eingebunden. Sie können alle lokalen Daten jederzeit vollständig löschen. |
| `trust.4.title` | Veröffentlichung |
| `trust.4.summary` | Was öffentlich werden kann |
| `trust.4.body` | Nichts wird veröffentlicht, solange Sie dem nicht in einem eigenen, getrennten Schritt zustimmen. Eine Zustimmung ist jederzeit widerrufbar. |
| `trust.5.title` | KI |
| `trust.5.summary` | Wo KI vorkommt und wo nicht |
| `trust.5.body` | **[ENTWURF]** Die Handlungsoptionen entstehen regelbasiert und deterministisch. Dieselben Angaben führen immer zum selben Ergebnis. Es werden keine Empfehlungen von einem Sprachmodell erzeugt. Sollte künftig ein KI-Anteil hinzukommen, wird er an der jeweiligen Aussage gekennzeichnet. |
| `trust.6.title` | Parteiunabhängigkeit |
| `trust.6.summary` | Unabhängigkeit und Finanzierung |
| `trust.6.body` | **[ENTWURF]** Das Werkzeug ist keiner Partei zugeordnet und wird nicht von Parteien finanziert. Es fragt weder nach Fraktion noch nach Partei, erstellt keine Rangliste und gibt keine Wahlempfehlung. Angaben zur Finanzierung und zur unabhängigen Zweitprüfung werden vor der Veröffentlichung ergänzt. |
| `trust.7.title` | Quellen |
| `trust.7.summary` | Welche Daten verwendet werden |
| `trust.7.body` | Alle Wahlkreisdaten stammen aus benannten Quellen mit Angabe von Institution, Kennzahl, Jahr, Ebene und Datenqualität. Datenlücken werden ausgewiesen und nicht überbrückt. |
| `trust.8.title` | Methodik |
| `trust.8.summary` | Wie das Ergebnis entsteht |
| `trust.8.body` | Ihre Angaben werden mit Wahlkreisdaten abgeglichen und auf ein offengelegtes Regelwerk angewendet. Jede Empfehlung nennt die Regel, auf der sie beruht. |
| `trust.9.title` | Kontakt |
| `trust.9.summary` | Auskunft, Widerspruch, Korrekturhinweis |
| `trust.9.body` | **[ENTWURF]** Kontaktweg wird vor der Veröffentlichung eingetragen. Hinweise auf fehlerhafte Daten oder Regeln sind ausdrücklich erwünscht. |
| `trust.delete.confirm` | Alle lokalen Daten löschen? |
| `trust.delete.body` | Gelöscht werden Ihre Antworten, Ihr Report und Ihre Einstellungen in diesem Browser. Das lässt sich nicht rückgängig machen. |
| `trust.delete.done` | Alle lokalen Daten wurden gelöscht. |

---

## 20. Fehler und Sonderzustände

| Schlüssel | Text |
|---|---|
| `error.generic.title` | Der Report konnte nicht erstellt werden |
| `error.generic.body` | Bei der Anwendung des Regelwerks ist ein Fehler aufgetreten. Ihre Angaben sind vollständig erhalten und wurden nicht übertragen. |
| `error.generic.action` | Erneut versuchen |
| `error.generic.alt` | Zurück zu den Angaben |
| `error.generic.code` | Fehlerkennung {code}. Bitte geben Sie diese Kennung an, wenn Sie uns schreiben. |
| `error.notfound.title` | Diese Seite gibt es nicht |
| `error.notfound.body` | Der Link führt ins Leere. Möglicherweise hat sich die Adresse geändert. |
| `offline.title` | Keine Verbindung |
| `offline.survey` | Keine Verbindung. Ihre Antworten bleiben in diesem Browser gespeichert. |
| `offline.result` | Der Report konnte nicht erstellt werden, weil keine Verbindung besteht. Ihre Angaben bleiben erhalten. |
| `offline.report` | Sie sind offline. Ihr Report bleibt lesbar. Externe Quellenlinks sind derzeit nicht abrufbar. |
| `offline.back` | Verbindung wiederhergestellt |
| `expired.title` | Ihre Sitzung ist nicht mehr lesbar |
| `expired.body` | Die gespeicherten Angaben stammen aus einer früheren Fassung des Werkzeugs und lassen sich nicht zuverlässig weiterverwenden. Es sind keine Daten an Dritte gelangt. |
| `expired.restart` | Neu beginnen |
| `expired.openReport` | Gespeicherten Report öffnen |
| `nojs.title` | Für die Befragung wird JavaScript benötigt |
| `nojs.body` | Die Befragung läuft vollständig in Ihrem Browser und benötigt dafür JavaScript. Methodik und Datenschutzangaben können Sie auch ohne JavaScript lesen. |

---

## 21. Sprachprüfung

Vor jeder Freigabe gegen diese Liste prüfen.

### Verboten

richtig · falsch · gute Politik · schlechte Politik · Sie sollten (ohne Bedingung) ·
wissenschaftlich bewiesen · optimal · ideal · beste Lösung · alternativlos ·
dringend · Handlungsdruck · Versagen · Skandal · endlich · längst überfällig ·
Sie sind zu {n} Prozent · Ihr Typ · Ihr Profil · Ihre Gesinnung · Ihre Haltung ·
Wahlempfehlung · Rangliste · Sieger · Gewinner · Verlierer

### Bevorzugt

erscheint · spricht dafür · möglicher Wirkpfad · prüfenswert ·
unter diesen Annahmen · auf Basis Ihrer Angaben · die Datenlage lässt offen ·
vorrangig · nachrangig · begrenzend · nach Ihren Angaben · aus Regel {id} folgt

### Formal

| Prüfpunkt | Regel |
|---|---|
| Anrede | Sie, durchgehend |
| Gedankenstriche | keine `–` und keine `—`, stattdessen Punkt, Komma, Doppelpunkt oder `·` |
| Ausrufezeichen | keine |
| Emojis | keine |
| Fragezeichen | nur in echten Fragen an die Nutzerin |
| Zahlen | Tausenderpunkt, Prozent mit geschütztem Leerzeichen |
| Datum | `TT.MM.JJJJ` |
| Fremdwörter | nur wenn kein deutsches Wort trägt, dann bei Erstnennung erklärt |
| Abkürzungen | bei Erstnennung ausgeschrieben |
| Genderschreibung | Doppelnennung oder neutrale Form, kein Gendersternchen im Fliesstext (Screenreader-Konsistenz) |
