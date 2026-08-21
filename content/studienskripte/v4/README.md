# Akademie für Wirkungsökonomie · Curriculum v4.0 · kanonische Studienskript-Master

Status: `V4_STAGING_NOT_PUBLICLY_ACTIVE`  
Stand: 2026-08-21

## Zweck

Dieser Pfad ist die versionierte kanonische Master-Lane für öffentliche Lehrskripte der Curriculum-Version 4.0. Die bestehende v3.2-/V1-Ablage unter `content/studienskripte/*.md` bleibt bis zum v4-Cutover unverändert und historisch reproduzierbar.

Verbindliche Richtung:

`wirkungsoekonomie.de/content/studienskripte/v4/<lecture_id-or-slug>.md`
→ kanonischer öffentlicher Lehrskript-Master
→ hash-/source-geprüfter App-Spiegel in `sustynats/woek-akademie-app`
→ Reader / Web / PDF / weitere Projektionen.

Geschützte Prüfungsantworten, interne Scoringdetails und nichtöffentliche Bewertungsrubriken gehören nicht in diesen öffentlichen Pfad.

## Source-of-truth-Regeln

1. Keine v4-Vorlesung wird aus einem App-Spiegel allein als veröffentlicht behandelt.
2. `lecture_id` ist stabil und von der Anzeige-/Reihenfolgenummer getrennt.
3. Jede Vorlesung trägt mindestens Curriculum-Version, Source-Version/Stand, Reviewstatus und Änderungsgrund.
4. Historische v3.2-Inhalte werden nicht still überschrieben.
5. Vor Aktivierung muss `ACADEMY_SCRIPT_MASTER_MIRROR_PARITY` bestanden sein.
6. Amtliche/rechtliche/versionsempfindliche Aussagen werden vor Veröffentlichung frisch gegen Primärquellen geprüft.
7. Öffentliche Master enthalten keine Prüfungsgeheimnisse.

## Fachliche v4-Leitplanken

- bestehende staatliche Wirkungs-/Nachhaltigkeitsarchitekturen anerkennen;
- WÖk als additive Anschluss- und Rückkopplungsarchitektur beschreiben;
- Problem Review vor Goal Review;
- Wirkungspotenzial, Outcome, Wirkung und Attribution trennen;
- `Indicator != Impact`, `Output != Outcome`, `Observation != Attribution`, `Target Alignment != Causality`;
- harte Schutzgrenzen nicht kompensieren;
- Empfehlungen nicht automatisch aus Scores ableiten;
- `NO_ROBUST_RECOMMENDATION` ist zulässig;
- v4-Staatsstrang umfasst DNS, §§43–44 GGO/GFA, Nachhaltigkeitsprüfung, eNAP/eGFA/E-Gesetzgebung, Monitoring, parlamentarische Bewertung und den versionierten Aktionsplan-Nachhaltigkeit-Kontext.

## Cutover-Gate

Der Pfad darf erst als führender öffentlicher Akademie-Stand aktiviert werden, wenn mindestens erfüllt sind:

- `CURRICULUM_V4_SOURCE_AUDIT_COMPLETE`
- `ALL_LEGACY_LECTURES_REVIEWED`
- `STATE_SUSTAINABILITY_ARCHITECTURE_TAUGHT`
- `ACADEMY_SCRIPT_MASTER_MIRROR_PARITY`
- `ACADEMY_WEB_APP_CONTENT_PARITY`
- Prüfungs-/Praxisprojekt-Parität
- Suche/Navigation/Links/WCAG/Responsive PASS
- Production-Smoke PASS.
