# Debatten-Kompass Migration

Status: umgesetzt fuer Patch 48.

## Leitentscheidung

Der oeffentliche Produktname lautet **Debatten-Kompass**. Die **Wirkungsradar-Methode** bleibt als Methodikbegriff erhalten. Die Route `/wirkungsradar/` bleibt aus Gruenden der Auffindbarkeit und Rueckwaertskompatibilitaet bestehen.

## Oeffentliche Begriffe

| Alt | Neu |
| --- | --- |
| Wirkungsradar als Produktname | Debatten-Kompass |
| Wirkungsradar als Methode | Wirkungsradar-Methode |
| Live-Karten | Debattenkarten |
| Host-Cockpit | Schnellantwort |
| Host-Playbook | Antwort-Playbooks |
| Gute Rueckfrage | Die bessere Frage |

## Routen

| Route | Oeffentlicher Titel | Status |
| --- | --- | --- |
| `/wirkungsradar/` | Debatten-Kompass | Hauptseite bleibt kompatibel |
| `/wirkungsradar/debattenkarten/` | Debattenkarten | neue oeffentliche Sammelseite |
| `/wirkungsradar/live/` | Debattenkarten | Legacy-Route bleibt erreichbar |
| `/wirkungsradar/antwort-playbooks/` | Antwort-Playbooks | neue oeffentliche Playbook-Route |
| `/wirkungsradar/host-playbook/` | Antwort-Playbooks | Legacy-Route bleibt erreichbar |
| `/wirkungsradar/methode/` | Wirkungsradar-Methode | Methodikseite |
| `/wirkungsradar/narrative/` | Mythen & Narrative | Narrative bleiben vertieft |
| `/wirkungsradar/quellen/` | Quellen | Quellenhub bleibt erhalten |

## Template-Regel

Debattenkarten zeigen oben die direkt nutzbare Antwort:

1. Schnellantwort: Was wurde behauptet?
2. Kurzantwort - 10 Sekunden
3. Direkt nutzbare Antworten
4. Faktenlage, Folgencheck, System, Frame, Psychologie, Loesung und Quellen

Theorie, Methode und Quellen kommen nach den Antworten. Dadurch bleibt der Debatten-Kompass fuer Hosts und Leser:innen zuerst nutzbar und danach vertiefbar.

## Validierung

Die oeffentlichen HTML-Seiten werden nach der Generierung normalisiert und durch das Wirkungsradar-Gate geprueft. Das Gate erwartet fuer P0-Karten den Status `checked_v4_debattenkompass` und prueft, dass alte oeffentliche Labels wie `Live-Karten`, `Wirkungsradar-Live` und `Host-Cockpit` im oeffentlichen Output nicht sichtbar bleiben.
