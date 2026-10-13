"""Record complete, checksum-bound source regions for the current method editions."""
from pathlib import Path
import json,re,html
import pymupdf
ROOT=Path(__file__).resolve().parents[3]
sources=json.loads((ROOT/'content/grundlagen/method-publication-sources-20261010.json').read_text())
config=[]
def p(text):return '<p>'+html.escape(text)+'</p>'
for source in sources:
    doc=pymupdf.open(ROOT/source['source']);regions=[]
    def add(page,rect,after,reason,font=9.5):
        area=pymupdf.Rect(rect);before=doc[page-1].get_text('text',clip=area)
        if not before.strip():raise RuntimeError('Empty guarded source region')
        pix=doc[page-1].get_pixmap(alpha=False)
        background=[round(c/255,5)for c in pix.pixel(int(rect[2]-3),int(rect[1]+2))]
        regions.append({'page':page,'rect':rect,'beforeText':before,'afterHtml':after,'reason':reason,'fontPt':font,'background':background})
    def table(page,rect,changes,font=9):
        pg=doc[page-1];area=pymupdf.Rect(rect);words=pg.get_text('words',clip=area)
        tables=[t for t in pg.find_tables().tables if t.col_count==2 and t.bbox[1]>=rect[1]-1 and t.bbox[3]<=rect[3]+1]
        if len(tables)!=1:raise RuntimeError('Ambiguous original glossary table')
        rows=[]
        for row in tables[0].rows:
            cells=[]
            for bounds in row.cells:
                if bounds is None:raise RuntimeError('Merged glossary cell requires separate review')
                cell=pymupdf.Rect(bounds)
                selected=[w for w in words if cell.contains(pymupdf.Point((w[0]+w[2])/2,(w[1]+w[3])/2))]
                selected.sort(key=lambda w:(round(w[1]/3),w[0]))
                cells.append(' '.join(w[4] for w in selected))
            if not all(cells):raise RuntimeError('Incomplete original glossary row')
            label,definition=cells;rows.append([label,changes.get(label,definition)])
        missing=set(changes)-{r[0] for r in rows}
        if missing:raise RuntimeError('Unknown original glossary term: '+str(missing))
        after='<table><colgroup><col style="width:29%"><col style="width:71%"></colgroup>'
        for i,row in enumerate(rows):
            tag='th' if i==0 else 'td';after+='<tr>'+''.join('<'+tag+'>'+html.escape(t)+'</'+tag+'>' for t in row)+'</tr>'
        after+='</table>'
        add(page,rect,after,'Vollständiges Originalglossar; alle Begriffe und Vergleichsdimensionen erhalten.',font)
        regions[-1]['rows']=rows;regions[-1]['background']=[1,1,1]
    if source['id']=='woemm':
        add(1,[180,253,435,276],p('Konsistenzfassung 10. Oktober 2026 · Grundlage Juli 2026'),'Bestehende Standzeile; tatsächliche Text- und Tabellenkorrekturen nachvollziehbar kennzeichnen.',8.8)
        add(2,[314,281,556,298],p('10. Juli 2026; fachliche Korrektur 10. Oktober 2026'),'Dokumentsteckbrief: Originalstand und überarbeitete aktuelle Fassung unterscheiden.',8.1)
        add(2,[314,351,556,370],p('Agenda 2030/SDGs; DNS bei deutschen öffentlichen Fällen; SDG+ ist WÖk-eigen.'),'Objektspezifische Referenzrahmen auch im Dokumentsteckbrief konsistent ausweisen.',7.1)
        add(2,[56.8,621,561,691],p('Das WÖMM ordnet das Management nach tatsächlichen Zustandsveränderungen. Ihre Bewertung verlangt Wirkmechanismus, Evidenz und den relevanten Referenz- und Schutzrahmen: global Agenda 2030/SDGs, in deutschen öffentlichen Fällen zusätzlich DNS; SDG+ ist die WÖk-eigene Erweiterung. Zielbezug allein belegt keine Wirkung. Ziel ist positive Netto-Wirkung unter nicht kompensierbaren Grenzen. Wirtschaftliche Tragfähigkeit bleibt notwendig; Gewinn wird zum Feedback, nicht zum letzten Maßstab.'),'Zielbezug von Zustandsveränderung, Kausalität und Schutzrahmen unterscheiden.')
        add(12,[56.8,620,561,679],p('Wirkungsbewertung folgt begründeten Zustandsveränderungen, Wirkmechanismen, Evidenz und Referenz- und Schutzräumen. Global gelten Agenda 2030/SDGs; bei deutschen öffentlichen Fällen zusätzlich die DNS. SDG+ ist eine WÖk-eigene Erweiterung, etwa für Demokratie, Medien, Rechtsstaatlichkeit und digitale Selbstbestimmung. Ziel- oder Indikatorbezug ist kein Kausalitätsbeweis. Zielgröße ist positive Netto-Wirkung für Mensch, Planet und Demokratie.'),'Begründete Bewertung und objektspezifische staatliche Referenzarchitektur.')
        add(12,[56.8,412,561,437],p('Anschlussquellen: Weber: Die neue Ordnung des Wohlstands, Kapitel 42-47 · ISO 37000:2021 · ISO 9001:2026 (ISO-Fassung; Übergang objektspezifisch prüfen) · The Open Group: TOGAF · Business Architecture Guild: BIZBOK'),'Aktuellen ISO-Stand am Gebrauchspunkt nach offizieller Quelle präzisieren; https://www.iso.org/standard/9001',8)
        add(95,[56.8,103.5,414,116],p('ISO 9001:2026 (16.09.2026); ISO 9001:2015/Amd 1:2024: Vorgänger.'),'Offizieller Publikationsstatus ersetzt die überholte Ankündigung; bestehender Quellenlink bleibt erhalten.',7.7)
        add(80,[56.8,525,561,582],p('KPI zeigen Leistung, Output, Effizienz oder wirtschaftliche Zielerreichung. KII sind Wirkungsindikatoren; beobachtete Zustandsveränderungen, modelliertes Potenzial und Risiko bleiben gekennzeichnet. Beide werden benötigt, dürfen aber nicht verwechselt werden. Schulungsteilnahmen sind Output; dauerhaft weniger Sicherheitsereignisse können Wirkung sein. Verkaufte Solarmodule sind Marktleistung; vermiedene Emissionen brauchen Vergleichsfall, Material-, Netz- und Reboundprüfung.'),'KII und Output sind kein automatischer Wirkungs- oder Kausalitätsnachweis.')
        add(80,[56.8,616,561,687],p('Der WÖk-Netto-Wirkungs-Index (NWI) ist ein nichtmonetärer, regelgebundener Index und vom Nationalen Wohlfahrtsindex zu unterscheiden. Schutzgrenzen, Nichtkompensation, Reverse Merit Order, Verteilung und Unsicherheit bleiben sichtbar. T-SROI ist ein monetäres EUR/EUR-Verhältnis: Barwert zurechenbarer direkter und separat belegter transformativer Nettonutzen geteilt durch den Barwert der Ressourcen. Transformationswirkung wird mit eigenem Wirkpfad belegt; freie Multiplikatoren und die Kompensation harter Grenzverletzungen sind ausgeschlossen.'),'Nichtmonetären Index, monetäres Verhältnis und Systemveränderung trennen.')
        table(93,[56.8,195,561,735],{
          'KII':'Key Impact Indicator; Indikator tatsächlicher oder erwarteter Wirkung. Beobachtung, Potenzial und Risiko getrennt kennzeichnen; der Indikator allein beweist keine Kausalität.',
          'NWI':'WÖk-Netto-Wirkungs-Index: nichtmonetärer, regelgebundener Index unter Mindestbedingungen, Nichtkompensation und Reverse Merit Order; kein Nationaler Wohlfahrtsindex.',
          'T-SROI':'Monetäres EUR/EUR-Verhältnis der Barwerte kausal zurechenbarer direkter und separat belegter transformativer Nettonutzen zu Ressourcen; Rechenstandard v1.1, eigener Wirkpfad und Schutz-Gate.',
          'Wirkungsrückkopplung':'Mechanismus, durch den Bewertung tatsächlicher Wirkung nach geltenden Regeln Preise, Budgets, Kapital, Prozesse oder Entscheidungen verändert. Berichterstattung allein ist keine Rückkopplung.'
        })
        refs=doc[93].get_text('text',clip=pymupdf.Rect(62,113,561,267)).replace('\uf0b7','•')
        refs=refs.replace('Version 1.0, Stand 21. Mai 2026.','Version 1.8, Stand 1. Oktober 2026 (aktuelle Begriffsgrundlage).')
        refs=refs.replace('Whitepaper T-SROI - der neue Standard für Impact-Controlling in der Wirkungsökonomie.','Whitepaper T-SROI (historische Fassung). Für Rechnungen gilt der T-SROI-Rechenstandard v1.1 (2026).')
        add(94,[62,113,561,272],''.join(p('• '+re.sub(r'\s+',' ',part).strip())for part in refs.split('•')if part.strip()),'Aktuelle Begriffs- und Rechenquellen am Gebrauchspunkt; historische Arbeiten als solche erhalten.',9)
    else:
        add(1,[151,508,461,531],'<p style="text-align:center">Referenzfassung 2.0 · Konsistenzkorrektur 10.10.2026 · Grundlage Juli 2026</p>','Bestehende Standzeile transparent aktualisieren.',8.1)
        add(13,[60,313,556,359],p('Wirkung bedeutet tatsächliche Zustandsveränderung und ist neutral und relational. Positive oder negative Bewertung verlangt Wirkmechanismus, Evidenz sowie Referenz- und Schutzräume: global Agenda 2030/SDGs, bei deutschen öffentlichen Fällen zusätzlich DNS; SDG+ ist WÖk-eigen. Zielbezug allein beweist weder Wirkung noch Kausalität. Zielgröße bleibt positive Netto-Wirkung für Mensch, Planet und Demokratie. [INT-02]'),'Fehlerhafte Gleichsetzung von Zielbeitrag und positiver Wirkung korrigieren.',9)
        add(98,[52.5,102,562,141],p('Der WÖk-NWI ist ein nichtmonetärer, regelgebundener Index aus bewerteten Zustandsveränderungen. Er ist weder der Nationale Wohlfahrtsindex noch der monetäre IOI. Verteilung, Zeit, Unsicherheit, Nichtkompensation und Reverse Merit Order begrenzen die Verdichtung.'),'NWI-Typ, Referenz und Schutzbedingungen präzisieren.')
        add(98,[52.5,414,562,504],''.join(p(t) for t in [
          '1. Bewertungsobjekt, Systemgrenze und Zeitraum festlegen.',
          '2. Belegte positive und negative Zustandsveränderungen aus Scorecards übernehmen.',
          '3. Verteilung, Dauer und Unsicherheit offenlegen; Reichweite ist kein Wirkungsnachweis.',
          '4. Nichtkompensierbare Felder und den Engpass nach Reverse Merit Order separat prüfen.',
          '5. NWI regelgebunden bestimmen; fehlende Daten bleiben offen, keine erfundene Null oder Datenqualitätsmultiplikation.',
          '6. Interpretation, Sensitivität und Entscheidungsgrenzen dokumentieren.'
        ]),'Keine neue Formel erfinden; fehlende Daten, Reichweite und Datenqualität fachlich korrekt behandeln.',8.5)
        add(99,[52.5,89,562,104],p('Nichtmonetärer WÖk-NWI mit Unsicherheitsband; Schutzgrenzen, Verteilung, Datenlücken und Reverse Merit Order separat.'),'Indexdarstellung und separate Schutzprüfung.',9)
        add(100,[76.5,89,520,105],p('Monetäres Verhältnis EUR/EUR · Bewerten · Rechenstandard v1.1 · WÖK-Q-1024'),'T-SROI darf nicht als dimensionslose Transformationskennzahl bezeichnet werden.',8.5)
        add(101,[52.5,89,562,116],p('Barwerte direkter und separat belegter transformativer Nettonutzen sowie Ressourcen in EUR derselben Preisbasis; Ergebnis EUR/EUR. Wirkungsprofil, Risiken, Schutz-Gate und Unsicherheit bleiben separat sichtbar.'),'Freie Transformationsmultiplikatoren durch tatsächliche Rechengrößen ersetzen.',9)
        add(101,[52.5,138,562,216],''.join(p(t) for t in [
          '• Empfänger, Systemgrenzen, Vergleichsfall und Referenzrahmen sind eindeutig.',
          '• Befunde, Annahmen und Bewertungen bleiben unterscheidbar; direkte und transformative Nutzen werden nicht doppelt gezählt.',
          '• Zurechnung, Deadweight und Verdrängung korrigieren beanspruchten Nutzen, nicht den Schaden.',
          '• Transformative Nutzen brauchen eigene Wirkpfade und Preisnachweise; freie Multiplikatoren sind ausgeschlossen.',
          '• Grenzverletzung oder fehlende Pflichtdaten: blockiert oder nicht bewertbar; kein positiver öffentlicher Wert.',
          '• Ergebnis, konservative Untergrenze und Sensitivität führen zu einer dokumentierten Entscheidung oder Lernfrage.'
        ]),'Nutzen, Schaden, Attribution, Gate und Unsicherheit konsistent mit v1.1.',8.4)
        add(101,[52.5,238,562,290],''.join(p(t) for t in [
          '• Versionierte Entscheidungsgrundlage, keine endgültige Wahrheit.',
          '• Betroffene, negative Wirkungen und Machtasymmetrien verschwinden nicht durch Workshopkonsens.',
          '• Große Visionen sind kein Beleg für transformativen Nutzen; Schäden bleiben vollständig sichtbar.',
          '• Monetarisierung nicht erzwingen; Schutzgrenzen sind nicht kompensierbar.'
        ]),'Keine unbelegten Faktoren; methodische Reichweite und Nichtkompensation erhalten.',8.5)
        add(101,[52.5,313,562,340],p('INT-08 (aktueller T-SROI-Rechenstandard v1.1), INT-01 sowie EXT-IMP-07/08/10 als Anschlussquellen. Historische T-SROI-Texte werden nicht als aktuelle Rechenvorschrift verwendet. Schutz-, Begriffs- und Rückkopplungsregeln bleiben verbindlich.'),'Tatsächliche maßgebliche Quelle am Gebrauchspunkt.',8.5)
        add(375,[302.5,374,384,395],p('Nichtmonetärer Index'),'Typ D08 im bestehenden Methodenvergleich.',7.2)
        add(375,[300,394,384,435],p('Monetäres EUR/EUR'),'Typ D09 im bestehenden Methodenvergleich.',7.2)
        add(381,[52.5,440.8,562,452],p('EXT-MGT-13  ISO 9001:2026: Quality management systems - Requirements. ISO 9001:2015/Amd 1:2024: Vorgängerfassung.'),'Aktueller ISO-Stand; historische Quelle ausdrücklich erhalten; https://www.iso.org/standard/9001',7)
        add(384,[52.5,375.2,562,386],p('EXT-QA-02 ISO 9001:2026: Quality management systems - Requirements. ISO 9001:2015/Amd 1:2024: Vorgängerfassung.'),'Auch die zweite ISO-Quellenstelle auf denselben geprüften Stand bringen.',7)
        table(380,[52.0,46,566,736],{
          'KII':'Key Impact Indicator; Indikator tatsächlicher oder erwarteter Wirkung. Beobachtung, Potenzial und Risiko getrennt kennzeichnen; kein Kausalitätsbeweis durch den Indikator allein.',
          'NWI':'WÖk-Netto-Wirkungs-Index: nichtmonetärer, regelgebundener Index unter Schutzgrenzen und Reverse Merit Order; kein Nationaler Wohlfahrtsindex.',
          'SDG+':'WÖk-eigene Erweiterung der Referenz- und Schutzräume, etwa Demokratie, Medien, Rechtsstaatlichkeit, Vertrauen, Zusammenhalt und digitale Selbstbestimmung; kein offizielles UN-System.',
          'T-SROI':'Monetäres EUR/EUR-Verhältnis: Barwert zurechenbarer direkter und separat belegter transformativer Nettonutzen / Barwert der Ressourcen; Rechenstandard v1.1, eigener Wirkpfad, Schutz-Gate.',
          'Wirkungsordnung':'Direkte, indirekte und systemische bzw. strukturverändernde Folgen; Zeitverzögerung wird zusätzlich ausgewiesen und beweist für sich keine höhere Wirkungsordnung.',
          'WÖk-ID':'Identifikation eines MasterItems. MasterItem → bewertbarer Wirkungszustand → messbarer Indikator → Beobachtung → Analyse; konkrete Verwendung und Quelle bleiben getrennt nachvollziehbar.'
        })
        refs=doc[380].get_text('text',clip=pymupdf.Rect(52.5,68,562,221))
        refs=refs.replace('Version 1.0, 21. Mai 2026.','Version 1.8, 1. Oktober 2026 (aktuelle Begriffsgrundlage).')
        refs=refs.replace('WÖk Master Items final v1.2 - WÖk-IDs, Indikatorfamilien, Benchmarks und Scorelogiken.','WÖk Master Items final v1.5 - 621 MasterItems; konkrete Zustands- und Indikatorzuordnung separat prüfen.')
        refs=refs.replace('INT-08  Weber, Natalie (2025): T-SROI - Der neue Standard für Impact-Controlling in der Wirkungsökonomie.','INT-08  Weber, Natalie (2026): T-SROI-Rechenstandard v1.1 (maßgebliche Rechenvorschrift). T-SROI-Arbeit von 2025: historische Grundlage.')
        refs=refs.replace('Interne Referenzfassung, Juli 2026.','Historische Referenzfassung, Juli 2026.').replace('Das Wirkungsökonomische Managementmodell (WÖMM) 1.0. Managementlehre der Wirkungsökonomie, Juli 2026.','Das Wirkungsökonomische Managementmodell (WÖMM) 1.0: historische Vorgängerfassung. Aktuell: WÖMM 2.0, Konsistenzkorrektur 10.10.2026.')
        refs=re.sub(r'\s+',' ',refs).strip()
        formatted=''.join('<p style="margin:0">'+html.escape(part.strip())+'</p>'for part in re.split(r'(?=INT-\d{2}\s)',refs)if part.strip())
        add(381,[52.5,68,562,222],formatted,'Aktuelle Quellen und historische Bezugsarbeiten auseinanderhalten; alle INT-01 bis INT-13 erhalten.',7.2)
    link_corrections=[{'page':95,'beforeUri':'https://www.iso.org/standard/62085.html','afterUri':'https://www.iso.org/standard/9001'}]if source['id']=='woemm'else []
    config.append({**source,'linkCorrections':link_corrections,'output':f'source-assets/generated/methods-20261010/{source["id"]}-2.0-konsistenz-2026-10-10.pdf','regions':regions})
(ROOT/'content/grundlagen/method-corrections-20261010.json').write_text(json.dumps(config,ensure_ascii=False,indent=2)+'\n')
print([(x['id'],len(x['regions'])) for x in config])
