#!/usr/bin/env python3
"""Prepare sourced, paragraph-bound current-reading corrections; keep originals.

The IDs are stable book paragraph anchors. Current pages are corrected in place
with an explicit revision note. Historical PDF/DOCX sources remain untouched.
"""
from pathlib import Path
import json, re, hashlib, shutil
ROOT=Path.cwd()
OUT=ROOT/'content/grundlagen/reference-corrections-20261009.json'
link='<a href="https://sdgs.un.org/2030agenda">Agenda 2030, Absatz 9</a>; <a href="https://sdgs.un.org/goals/goal16">SDG 16</a>.'
texts={
'woek-main-2026-k093-s001-p010':'Die Wirkungsökonomie nutzt die SDGs als globalen Referenzrahmen. Demokratie und Rechtsstaatlichkeit sind bereits in der Agenda 2030 angelegt; SDG 16 umfasst unter anderem Rechenschaft, Beteiligung und Informationszugang. SDG+ konkretisiert diese vorhandenen Bezüge und ergänzt WÖk-eigene Anforderungen etwa an Medienqualität, digitale Selbstbestimmung und Schutz vor Manipulation. Die vorhandene UN-Anforderung, ihre fallbezogene Operationalisierung und die zusätzliche WÖk-Festlegung werden getrennt ausgewiesen. Grundlagen: '+link,
'woek-main-2026-k102-s003-p005':'Die Wirkungsökonomie versteht die SDGs als Referenzrahmen, nicht als fertiges Steuerungsmodell. SDG+ konkretisiert und ergänzt vorhandene UN-Bezüge für demokratische, mediale, institutionelle, soziale und digitale Wirkungsbedingungen. Demokratie, Rechtsstaatlichkeit und Informationszugang werden nicht als zuvor fehlende UN-Themen ausgegeben. Grundlagen: '+link,
'woek-main-2026-k102-s007-p001':'SDG+ verbindet vorhandene UN-Zielbezüge mit einer ausdrücklich gekennzeichneten WÖk-Konkretisierung und zusätzlichen Anforderungen. Ein allgemeines Ziel ersetzt keine fallbezogene Messung, Bewertung oder Schutzprüfung.',
'woek-main-2026-k102-s007-p002':'Beispiel Medien: SDG 16.10 umfasst Informationszugang und Grundfreiheiten. Daraus folgt noch keine vollständige Bewertung der Quellenklarheit eines bestimmten Angebots, seiner Korrekturpraxis oder algorithmischer Verstärkung. Die WÖk prüft diese konkreten Bedingungen und ihre Wirkpfade. SDG+ ist keine offizielle UN-Kategorie und keine Behauptung, Demokratie oder Pressefreiheit seien im UN-Rahmen nicht enthalten.',
'woek-main-2026-k102-s007-p004':'Nichtkompensation schützt die Wirkungsökonomie vor dem Schönrechnen schwerer Schäden. SDG+ liefert dafür zusätzliche beziehungsweise konkretisierte Bewertungsbezüge, ist aber nicht selbst die gesamte Schutz- und Steuerungsarchitektur. Ziele, Evidenz, Bewertung, Rechte und Rückkopplung bleiben getrennte Aufgaben. Ein Vorteil in einem Feld macht eine Schutzverletzung in einem anderen Feld nicht zulässig.',
'woek-main-2026-k102-s010-p002':'Die Wirkungsökonomie nutzt die SDGs als globalen Referenzrahmen. SDG+ konkretisiert vorhandene Bezüge und ergänzt ausdrücklich ausgewiesene Anforderungen je Aspekt. Das umfassende Wirtschafts- und Gesellschaftsmodell verbindet diese Maßstäbe mit Daten, Wirkungsprüfung, Anreizen, Institutionen und Korrektur. Die Übereinstimmung mit einem Ziel belegt weder die Umsetzung noch die Wirkung einer konkreten Maßnahme.',
'woek-main-2026-k028-s017-p004':'Die Agenda 2030 nennt Demokratie und Rechtsstaatlichkeit ausdrücklich. SDG 16 enthält unter anderem Zugang zur Justiz, rechenschaftspflichtige Institutionen, partizipative Entscheidungen und Informationszugang. Für die Bewertung konkreter Medien- und Digitalsysteme prüft die WÖk zusätzlich Quellenklarheit, algorithmische Verstärkung, manipulative Gestaltung und Korrekturmöglichkeiten. Diese Konkretisierung ist von der Behauptung zu unterscheiden, die entsprechenden Schutzgüter fehlten vollständig im UN-Rahmen. Grundlagen: '+link,
'woek-main-2026-k028-s018-p002':'Die Wirkungsökonomie übernimmt die SDGs als globalen Referenzrahmen. SDG+ konkretisiert vorhandene demokratische, mediale, institutionelle, soziale und digitale Bezüge und ergänzt begründete WÖk-Anforderungen. Für jeden Aspekt werden UN-Anschluss, Operationalisierung und Zusatzanforderung getrennt benannt. So bleiben etwa Rechtsstaatlichkeit, Medienqualität, Diskursfähigkeit und digitale Selbstbestimmung überprüfbar, ohne vorhandene UN-Ziele als Neuerfindung darzustellen.',
'woek-main-2026-k028-s018-p004':'Die Wirkungsökonomie betrachtet die SDGs als zusammenhängenden Referenzrahmen. Mensch, Planet und Demokratie bilden die normative Orientierung des Modells. SDG+ präzisiert die für den konkreten Fall relevanten gesellschaftlichen Bedingungen. Welche Zustandsveränderung wirklich eingetreten ist, wer betroffen ist und welchen Beitrag eine Maßnahme geleistet hat, bleibt gesondert zu prüfen.',
'woek-main-2026-k028-s020-p002':'Die Wirkungsökonomie nutzt die SDGs als Referenzrahmen und konkretisiert beziehungsweise ergänzt sie mit SDG+. Demokratie, Rechtsstaatlichkeit und Informationszugang sind bereits im UN-Rahmen angelegt. Bei digitalen Öffentlichkeiten werden etwa Plattformanreize, algorithmische Verstärkung, Medienqualität, Selbstbestimmung und institutionelle Korrekturfähigkeit fallbezogen geprüft. Eine neue Themenbezeichnung ersetzt keinen Wirkungsnachweis.',
}
# The original 2025 bibliographies remain documentary sources; add a visible
# contemporary note instead of falsely making them sources for the 2026 change.
notice='Fachliche Präzisierung vom 9. Oktober 2026: Für SDG+ gilt die Unterscheidung von vorhandenem UN-Bezug, WÖk-Konkretisierung und eigener Zusatzanforderung gemäß Begriffsleitfaden v1.8, Abschnitt 4.2. Die nachfolgenden Quellenangaben dokumentieren auch historische Entwicklungsstände.'
entries=[]
for pid,new in texts.items():
    chapter=int(pid.split('-k')[1].split('-')[0]);files=list((ROOT/'referenz').glob(f'kapitel-{chapter:03d}-*/index.html'))
    if len(files)!=1: raise RuntimeError(f'Expected one current chapter {chapter}: {files}')
    s=files[0].read_text()
    pattern=rf'(<p\b[^>]*\bid="{re.escape(pid)}"[^>]*>)([\s\S]*?)(</p>)'
    matches=list(re.finditer(pattern,s))
    if len(matches)!=1: raise RuntimeError(f'Expected exactly one paragraph {pid}')
    old=matches[0].group(2)
    entries.append({'paragraphId':pid,'chapter':chapter,'oldHtml':old,'newHtml':new,'source':'Begriffsleitfaden v1.8, Abschnitt 4.2; UN Agenda 2030 Absatz 9 und SDG 16','originalSha256':hashlib.sha256(old.encode()).hexdigest()})
if not OUT.exists(): OUT.write_text(json.dumps({'date':'2026-10-09','status':'review-candidate','bibliographicNotice':notice,'entries':entries},ensure_ascii=False,indent=2)+'\n')
print('Prepared',len(entries),'explicit paragraph corrections in',len({x['chapter'] for x in entries}),'chapters.')
