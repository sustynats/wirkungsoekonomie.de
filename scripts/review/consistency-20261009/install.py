#!/usr/bin/env python3
"""Install narrow, idempotent source hooks for the 2026-10-09 review candidate.

Run after placing the accompanying files in the repository. Does not commit,
merge, publish or run a chargeable build. Requires explicit review of its diff.
"""
from pathlib import Path
import subprocess, json

def write_changed(p,s):
    p=Path(p)
    if p.read_text()!=s:p.write_text(s)

p=Path('scripts/review/live-reference-core.mjs');s=p.read_text()
imp='import { applyReferenceCorrections } from "./consistency-20261009/reference-core.mjs";\n'
if imp not in s:s=imp+s
needle='  let next = currentReference ? updateCurrentTSroiMethodLinks(updateRetiredTSroiSourceCitations(html)) : html;'
addition='\n  if (currentReference) next = applyReferenceCorrections(next, { withNotice: Boolean(chapterNumber) });'
if addition.strip() not in s:
    if s.count(needle)!=1:raise RuntimeError('Current reference correction entry point changed.')
    s=s.replace(needle,needle+addition,1)
write_changed(p,s)

p=Path('scripts/site/build-reference-update.mjs');s=p.read_text()
imp="import { applyCurrentScopeNotice } from '../review/consistency-20261009/reference-core.mjs';\n"
if imp not in s:s=imp+s
needle='// consistency-20261009: keep the dated current review after historical addenda.'
if needle not in s:
    s+='\n'+needle+"\n{ const f='referenz/aktualisierung/index.html'; fs.writeFileSync(f,applyCurrentScopeNotice(fs.readFileSync(f,'utf8'))); }\n"
write_changed(p,s)

p=Path('AGENTS.md');s=p.read_text()
heading='## Fachliche Kernreferenz und nachprüfbare Aussagen'
if heading not in s:
    s+='\n'+heading+'\n\n'
    s+='- Vor fachlichen WÖk-Aufgaben `content/grundlagen/WOEK_KERNREFERENZ.md` und danach die passende Originalquelle lesen. Diese Arbeitsreferenz ersetzt keine Originalquelle oder Freigabe.\n'
    s+='- Die WÖk ist ein Wirtschafts- und Gesellschaftsmodell: Medien, Demokratie, Wohnen, Gesundheit, Pflege und Bildung sind keine optionalen Nebenthemen. Den systematischen Prüfauftrag nicht als vollständige Kenntnis aller Wirkungen ausgeben.\n'
    s+='- Aktuelle Begriffsgrundlage: Projekt-Leitfaden v1.8 vom 1.10.2026. Fehlenden Import in Website oder PDFs ausdrücklich melden; keine Aktualität allein aus Dateiname oder Datum ableiten.\n'
    s+='- IOOI ist eine optionale externe Ergebniskette, keine WÖk-Gesamtarchitektur. SDG+ konkretisiert und ergänzt vorhandene UN-Bezüge pro Aspekt.\n'
    s+='- Rechenstandard, Formel, Implementierung, Beispiel und Ausgabe unabhängig abgleichen. Fehlende Daten sind nicht 0, ein unbekannter Zustand ist nicht neutral, ein bestandener Build ist kein empirischer Wirkungsnachweis.\n'
    s+='- Erst Situation und Mechanismus erklären, dann den Fachbegriff. Hypothetische Beispiele ausdrücklich kennzeichnen; keine frei gesetzten Eurobeträge als Produktsteuermechanik ausgeben.\n'
    s+='- Abschlussmeldungen trennen: lokal bearbeitet, getestet, fachlich geprüft, im Repository gespeichert und live veröffentlicht. Eine offene Aufgabe ist keine laufende Automation.\n'
write_changed(p,s)

# This interactive page is a hand-authored simulation, not a legal tariff.
p=Path('erleben/produktwirkung.html');s=p.read_text()
s=s.replace('Demo v1.0 mit Score -3 bis +3, Steuerklasse 0 bis 25 Prozent und Bonus/Malus pro Komponente.',
  'Historische Tarifsimulation v1.0: Modellskala -3 bis +3 und beispielhafte Sätze von 0 bis 25 Prozent. Keine geltenden Steuersätze und keine operative Anwendung des WStG-3.0-Entwurfs.')
s=s.replace('Global bestimmt das schwächste Feld den Steuersatz.',
  'Nur in dieser historischen Simulation wird das schwächste Feld einer Beispiel-Tarifstufe zugeordnet. Eine tatsächliche Steuerfolge braucht eine gesetzliche Tarifnorm.')
mark='woek-demo-status-20261009'
if mark not in s:
    note='<aside class="publication-current-note" id="'+mark+'"><p><strong>Historische Simulation, keine aktuelle Steuerfestsetzung.</strong> Der WStG-3.0-Entwurf trennt das Wirkungsprofil von der gesetzlich bestimmten steuerlichen Folge. Der Rechner unten zeigt die frühere Modellstaffel; seine Eurobeträge sind keine geprüften externen Kosten oder geltenden Tarife. Der gewünschte Mechanismus bleibt: Allgemeine Regeln verändern die wirtschaftlichen Anreize, nicht frei festgesetzte Einzelpreise. <a href="/wirkungssteuerung/wstg/">Steuerarchitektur und Rechtsstatus</a>.</p></aside>'
    import re
    s=re.sub(r'(<main\b[^>]*>)',lambda m:m[1]+'\n'+note+'\n',s,count=1)
write_changed(p,s)
subprocess.run(['python3','scripts/review/consistency-20261009/patch-calculations.py'],check=True)
subprocess.run(['node','scripts/review/consistency-20261009/reference-core.mjs'],check=True)
print('Installed source hooks, current reading corrections, model-status clarification and agent rule.')
