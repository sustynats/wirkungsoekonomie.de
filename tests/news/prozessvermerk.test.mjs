import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { withoutProcessNotes, processNoteFindings, assertWithoutProcessNotes } from '../../scripts/news/editorial-markdown.mjs';
import { hasEditorialResidue, PROCESS_NOTE_PATTERN } from '../../scripts/news/reader-copy.mjs';
import { validatePersonalEdition, personalContentHash } from '../../scripts/news/personal-editorial.mjs';
import { assertFinalPersonalSection } from '../../scripts/news/editorial-approved-revisions.mjs';
import { editorialKnowledge } from '../../scripts/news/bridge/editorial-knowledge.mjs';

const wurzel = new URL('../../', import.meta.url);

// Der echte Fall: Natalie sah am 18.09.2026 diese an sie gerichtete Rueckfrage
// als Lesertext in "Meine Einordnung" einer veroeffentlichten Analyse.
const rueckfrage = '**Redaktionelle Rückfrage vor der abschließenden Natalie-Freigabe:** Eine persönliche Gewichtung ist in den vorliegenden author_notes nicht mitgeteilt. Bitte festlegen, ob die Einordnung vor allem den möglichen Schutz von Verbraucherinnen und Verbrauchern betonen soll.';

test('die an die Redaktion gerichtete Rueckfrage verschwindet vollstaendig', () => {
  assert.equal(withoutProcessNotes(rueckfrage), '');
  assert.ok(processNoteFindings(rueckfrage).length);
  assert.ok(hasEditorialResidue([rueckfrage]), 'auch der Riegel der Nachrichten-Analysen greift');
});

test('ein Vermerk als Etikett kostet das Etikett, nicht die Aussage', () => {
  const zeile = 'Vorschlag zur Bestätigung: Die Sendung ist dann stark, wenn sie konkrete politische Mechanismen sichtbar macht.';
  assert.equal(withoutProcessNotes(zeile), 'Die Sendung ist dann stark, wenn sie konkrete politische Mechanismen sichtbar macht.');
  const absatz = 'Der Befund ist belastbar. Vorschlag zur Bestätigung durch Natalie. Die Folgen bleiben offen.';
  assert.equal(withoutProcessNotes(absatz), 'Der Befund ist belastbar. Die Folgen bleiben offen.');
  // Ein Rest ohne eigene Aussage ist kein Lesertext.
  assert.equal(withoutProcessNotes('Vorschlag zur Bestätigung durch Natalie: 16.09.'), '');
});

test('Lesertext bleibt unangetastet', () => {
  for (const satz of ['Das Urteil verschiebt Verantwortung dorthin, wo Reichweite organisiert wird.',
    '## Meine Einordnung', 'Die Freigabe der Behörde lag am Montag vor.', 'Der Bundestag hat die Zustimmung erteilt.']) {
    assert.equal(withoutProcessNotes(satz), satz, satz);
    assert.equal(hasEditorialResidue([satz]), false, satz);
  }
});

// Der Filter allein hat schon einmal nicht gereicht: was er nicht trifft,
// erschien stumm. Jetzt weigert sich jede Veroeffentlichungsgrenze.
test('jede Veroeffentlichungsgrenze weigert sich bei einem Vermerk im Text', () => {
  assert.throws(() => assertWithoutProcessNotes(rueckfrage), /EDITORIAL_PROCESS_NOTE_IN_TEXT/);
  const ausgabe = JSON.parse(fs.readFileSync(new URL('tests/news/fixtures/approved-personal-edition.json', wurzel), 'utf8'));
  validatePersonalEdition(ausgabe);
  const kaputt = { ...ausgabe, body_markdown: `${ausgabe.body_markdown}\n\nBitte festlegen, ob der Schutz betont wird.` };
  kaputt.content_hash = personalContentHash({ ...kaputt, content_hash: undefined });
  assert.throws(() => validatePersonalEdition(kaputt), /EDITORIAL_PROCESS_NOTE_IN_TEXT/);
  assert.throws(() => assertFinalPersonalSection(`## Befund\n\nText.\n\n## Meine Einordnung\n\n${rueckfrage}`), /EDITORIAL_PROCESS_NOTE_IN_TEXT/);
});

// Diese Pruefung haette den Fall gefunden. Sie bleibt, damit er nicht zurueckkommt.
test('kein veroeffentlichter Beitrag im Bestand traegt einen Verfahrensvermerk', () => {
  const dateien = ['data/news/personal-editorials.json', 'data/news/editorial-analyses.json', 'data/news/editorial-revisions.json'];
  let geprueft = 0;
  for (const datei of dateien) {
    const pfad = new URL(datei, wurzel);
    if (!fs.existsSync(pfad)) continue;
    const inhalt = JSON.parse(fs.readFileSync(pfad, 'utf8'));
    for (const eintrag of inhalt.editions || inhalt.analyses || []) {
      geprueft += 1;
      // Nur Lesertext, nicht die JSON-Huelle: die Feldnamen selbst gehoeren zum
      // Datensatz und sind kein Vermerk im Beitrag.
      const lesertext = [eintrag.title, eintrag.subtitle, eintrag.teaser, eintrag.body_markdown,
        ...(eintrag.sections || []).flatMap((abschnitt) => [abschnitt.title, abschnitt.heading, ...(abschnitt.paragraphs || [])]),
        ...(eintrag.author_perspective?.paragraphs || []),
        ...Object.values(eintrag.patch?.author_perspective || {}).flat(),
        eintrag.analysis?.summary, eintrag.analysis?.detail_summary,
      ].filter((wert) => typeof wert === 'string').join('\n');
      const treffer = processNoteFindings(lesertext);
      assert.deepEqual(treffer, [], `${datei}: ${eintrag.slug || eintrag.analysis_id} traegt ${treffer.join(', ')}`);
    }
  }
  assert.ok(geprueft >= 40, `zu wenige Beitraege geprueft: ${geprueft}`);
});

// Natalie am 18.09.2026: "hier sollte meine Meinung wiedergeben werden, welche
// die KI aufgrund der Wirkungsoekonomie eigentlich kennen muesste."
test('die Anweisung verlangt die Ableitung aus der Methodik, keine Rueckfrage', () => {
  const wissen = editorialKnowledge(new URL('.', wurzel).pathname.replace(/\/$/, ''));
  assert.equal(/redaktionelle Rückfrage statt/i.test(wissen.instructions), false, 'die alte Regel ist weg');
  assert.match(wissen.instructions, /Meine Einordnung ist die Anwendung der wirkungsökonomischen Methodik/);
  assert.match(wissen.instructions, /Niemals eine Frage, eine Aufgabe oder eine Anrede an die Redaktion/);
  assert.match(wissen.instructions, /Verfahrensvermerk und darf im Text nicht vorkommen/);
  // Der alte Stand bleibt einlesbar, damit bezahlte Antworten nicht verfallen.
  assert.ok(wissen.compatibleHashes.includes('22864ef24d6d292048c36b7197788a783ea9e46d13e0e1cee43f3ee0d47402b7'));
  for (const datei of ['scripts/news/auftrag-einreichen.mjs', 'scripts/news/sendungs-kandidaten.mjs', 'scripts/news/redaktions-kandidaten.mjs']) {
    const quelle = fs.readFileSync(new URL(datei, wurzel), 'utf8');
    const auftragszeilen = quelle.split('\n').filter((zeile) => /`Auftrag:|Letzte redaktionelle Hauptsektion/.test(zeile));
    for (const zeile of auftragszeilen) {
      assert.equal(PROCESS_NOTE_PATTERN.test(zeile), false, `${datei} verlangt noch einen Vorbehalt: ${zeile.slice(0, 90)}`);
    }
  }
});
