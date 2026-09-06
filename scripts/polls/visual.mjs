import fs from 'node:fs';
import path from 'node:path';

export function loadExperience(root, slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const file = path.join(root, 'content/polls/experiences', `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (data.energyData) {
    if (!/^[a-z0-9-]+\.json$/.test(data.energyData)) throw new Error('Visual poll: invalid energy data path');
    const energy = JSON.parse(fs.readFileSync(path.join(path.dirname(file), data.energyData), 'utf8'));
    for (const scenario of data.scenarios) scenario.energy = energy[scenario.id];
  }
  return validateExperience(data);
}
export function validateExperience(data) {
  const fail = message => { throw new Error(`Visual poll: ${message}`); };
  const ownImage = value => typeof value === 'string' && /^\/assets\/img\/polls\/[a-z0-9/.-]+\.(webp|png|jpg)$/.test(value) && !value.includes('..');
  if (!data || !ownImage(data.baseline) || !Array.isArray(data.domains) || !Array.isArray(data.scenarios)) fail('invalid structure');
  if (data.scenarios.length < 2 || data.scenarios.length > 7 || !data.domains.length) fail('invalid counts');
  for (const list of [data.domains, data.scenarios]) if (new Set(list.map(x => x.id)).size !== list.length) fail('duplicate IDs');
  for (const d of data.domains) {
    if (!/^[a-z]+$/.test(d.id) || ![d.x,d.y].every(v => Number.isFinite(v) && v >= 0 && v <= 100) || !(d.zoom >= 1 && d.zoom <= 4)) fail('invalid area');
    for (const k of ['title','question','mechanism','check']) if (typeof d[k] !== 'string' || !d[k]) fail(`missing ${k}`);
  }
  for (const s of data.scenarios) {
    if (data.energyData && (!s.energy || ['renewables','fossil','nuclear','balancing'].some(k => typeof s.energy[k] !== 'string' || !s.energy[k].trim()))) fail('missing energy supply explanation');
    if (!/^[a-z]+$/.test(s.id) || !ownImage(s.image) || !/^https:\/\//.test(s.source) || /utm_|chatgpt/i.test(s.source)) fail('invalid scenario source');
    if (Object.keys(s.topics || {}).sort().join() !== data.domains.map(d => d.id).sort().join()) fail('unequal topic coverage');
    for (const t of Object.values(s.topics)) if (!t.programme || !t.scene || !Array.isArray(t.pages) || !t.pages.length || !t.pages.every(p => Number.isInteger(p) && p > 0)) fail('missing evidence');
  }
  return data;
}
export function visualPanel(data, {esc, safeJson}) {
  return `<section class="visual-poll" id="stadtvergleich" aria-labelledby="visual-title" data-search-type="Interaktiver Stadtvergleich">
<p class="poll-kicker">Erkunden · Vergleichen · Entscheiden</p><h2 id="visual-title">${esc(data.title)}</h2>
<p class="poll-notice">${esc(data.horizon)}. Gleicher Ort, gleiche Perspektive. <strong>Illustrationen, keine berechnete Zukunftsprognose.</strong></p>
<div class="vp-controls"><label>Szenario ansehen<select id="vp-scenario">${data.scenarios.map(s=>`<option value="${s.id}">${esc(s.label)}</option>`).join('')}</select></label><label>Bereich vergrößern<select id="vp-area"><option value="">Gesamtansicht</option>${data.domains.map(d=>`<option value="${d.id}">${esc(d.title)}</option>`).join('')}</select></label></div>
<div class="vp-view-buttons" role="group" aria-label="Vergleichsansicht"><button type="button" data-vp-view="before" aria-pressed="true">Ausgangsbild</button><button type="button" data-vp-view="after" aria-pressed="false">Szenario</button><button type="button" data-vp-view="wipe" aria-pressed="false">Vorher / nachher</button><button type="button" data-vp-view="pair" aria-pressed="false">Nebeneinander</button></div>
<div class="vp-controls vp-pair-choice" hidden><label>Links vergleichen mit<select id="vp-compare"><option value="">Ausgangsbild</option>${data.scenarios.map(s=>`<option value="${s.id}">${esc(s.label)}</option>`).join('')}</select></label></div>
<div class="vp-stage" data-view="before" id="vp-stage">
<figure class="vp-pane vp-left"><div class="vp-viewport"><div class="vp-transform"><img id="vp-before" src="${esc(data.baseline)}" alt="${esc(data.baselineAlt)}" width="1672" height="941" fetchpriority="high"></div></div><figcaption id="vp-left-caption">Gemeinsamer Ausgangszustand</figcaption></figure>
<figure class="vp-pane vp-right"><div class="vp-viewport"><div class="vp-transform"><img id="vp-after" src="${esc(data.scenarios[0].image)}" alt="${esc(data.scenarios[0].alt)}" width="1672" height="941" decoding="async"></div><div class="vp-hotspots" hidden>${data.domains.map((d,i)=>`<button type="button" data-vp-area="${d.id}" style="left:${d.x}%;top:${d.y}%" aria-label="${esc(d.title)}: vergrößern und Details öffnen"><span aria-hidden="true">${i+1}</span></button>`).join('')}</div></div><figcaption id="vp-right-caption">Szenario A · illustrative Umsetzung</figcaption></figure>
</div>
<p id="vp-legend" class="poll-notice" hidden>Links: Ausgangsbild · Rechts: Szenario A</p>
<label class="vp-wipe-control" hidden>Vorher-nachher-Trennlinie verschieben<input id="vp-wipe" type="range" min="0" max="100" value="50" aria-valuetext="50 Prozent Ausgangsbild, 50 Prozent Szenario"></label>
<p id="vp-image-status" class="poll-notice" role="status" aria-live="polite"></p>
<div class="poll-actions"><button id="vp-hotspot-toggle" type="button" class="btn btn-secondary" aria-expanded="false">Details entdecken</button><button id="vp-reset" type="button" class="btn btn-secondary">Gesamtansicht</button><a id="vp-image-link" class="btn btn-secondary" href="${esc(data.baseline)}" target="_blank" rel="noopener">Bild groß öffnen</a><a class="btn btn-primary" href="#poll-ui">Zur Abstimmung</a></div>
<p class="poll-notice">Zoom: Wähle einen Bereich oder tippe auf eine nummerierte Markierung. Der Ausschnitt bleibt beim Szenariowechsel gleich. Auf dem Smartphone kannst Du zusätzlich die normale Browser-Vergrößerung nutzen.</p>
${data.energyData ? `<section class="vp-energy" aria-labelledby="vp-energy-title"><h3 id="vp-energy-title">Woher kommt die Energie?</h3><p>Die Modellstadt ist <strong>keine Energieinsel</strong>. In jedem Szenario gehört das überregionale Stromnetz dazu. Nicht jede Anlage steht im Bildausschnitt; die Illustrationen zeigen weder einen vollständigen Kraftwerkspark noch einen berechneten Strommix.</p><div id="vp-energy-content"><p>Im Ausgangsbild ist links im Umland ein Umspannwerk zu sehen. Es verteilt Strom aus dem Verbundnetz und erzeugt selbst keinen. Wähle „Szenario“, um Erzeugung, Reserven und Kernenergieoptionen der jeweiligen Programmrichtung zu vergleichen.</p></div><p class="poll-notice">Die folgenden Angaben beschreiben Programmziele, keine bereits eingetretene Wirkung. Ein nicht gezeichnetes Kraftwerk bedeutet nicht „kein Kraftwerk“. Speicher liefern zuvor eingespeicherte Energie; sie sind keine zusätzliche Primärenergiequelle. Auch ein wolkenloses Bild beweist keine emissionsfreie Versorgung.</p></section>` : ''}
<section class="vp-written" aria-labelledby="vp-written-title"><h3 id="vp-written-title">Was würde sich ändern?</h3><p>Die wichtigsten Programmpunkte, unsere bildliche Übersetzung und die offenen Wirkungsfragen. Zunächst ohne Parteinamen.</p><div id="vp-topics">${data.domains.map(d=>`<details id="vp-topic-${d.id}"><summary>${esc(d.title)}</summary><p><strong>Programmrichtung:</strong> ${esc(data.scenarios[0].topics[d.id].programme)}</p><p><strong>Illustrative Übersetzung:</strong> ${esc(data.scenarios[0].topics[d.id].scene)}</p><p>${esc(d.check)}</p></details>`).join('')}</div></section>
<details id="vp-method"><summary>Wie belastbar ist dieser Vergleich?</summary>
<p>Dies ist eine redaktionelle, qualitative Szenario-Umfrage zu sieben ausgewählten bundesweiten Wahlprogrammen von 2025, kein vollständiger Wahlprogrammvergleich, kein Parteienranking und keine Wahlempfehlung. CDU/CSU, SPD, Bündnis 90/Die Grünen, AfD, Die Linke, BSW und FDP werden mit denselben fünf Themen betrachtet. Andere Parteien und wichtige Themen wie Außenpolitik, Steuerverteilung, Migration und institutionelle Demokratie sind nicht vollständig abgebildet. Aus einer bevorzugten Illustration lässt sich deshalb keine belastbare Parteipräferenz ableiten.</p>
<p>Die Stadt ist fiktiv. Wir halten Ort, Landschaft, Perspektive und Wetter konstant und übersetzen ausgewählte Vorhaben in mögliche bauliche Veränderungen bis zum gemeinsamen illustrativen Horizont 2035. Das ist kein Programmversprechen für dieses Jahr. Es gibt weder eine kalibrierte Mikrosimulation noch eine einheitlich durchgerechnete Finanzierung. Anzahl, Größe, Lage und Gestaltung der Gebäude und Energieanlagen sind zeichnerische Entscheidungen, keine gemessenen oder prognostizierten Mengen. Die generierten Illustrationen können kleine unbeabsichtigte Detailabweichungen enthalten.</p>
<p>Vorausgesetzt werden für die jeweils gezeigten Maßnahmen ausreichende Mehrheiten, rechtliche Zulässigkeit, Finanzierung, Grundstücke, Personal, Netze und örtliche Umsetzung. Koalitionskompromisse sowie Entscheidungen von EU, Ländern, Kommunen und Privaten können die Entwicklung verändern. Insbesondere stellt eine nicht gezeigte Anlage keinen Beleg für ein Verbot oder fehlende Unterstützung dar. Unveränderte Flächen sind kein belastbares Gegenfaktum für die reale Entwicklung ohne diese Politik.</p>
<p>Wirkung bedeutet tatsächliche Zustandsveränderung. Hier beschreiben wir Wirkungspotenziale und Wirkungsrisiken. Positive Netto-Wirkung ließe sich erst mit Referenzzustand, Mechanismus, Evidenz, Verteilung, Nebenfolgen und belastbarer Zurechnung bewerten. Bei einer solchen Bewertung gelten Nichtkompensation harter Schutzgrenzen und Reverse Merit Order: schwere Schäden dürfen nicht durch schöne Gebäude oder Vorteile an anderer Stelle verrechnet werden. DNS und SDGs können Referenzen liefern, ersetzen aber keinen Kausalitätsnachweis.</p>
<p>Die Buchstaben sind keine sichere Verblindung: Programmpunkte können eine Partei erkennbar machen. Du kannst die Zuordnung und Primärquellen jederzeit bewusst öffnen. Nach Deiner Abstimmung wird sie angezeigt. Die Umfrage erhebt eine Präferenz unter diesen Illustrationen, keinen repräsentativen politischen Befund.</p></details>
<div class="poll-actions"><button id="vp-reveal" type="button" class="btn btn-secondary" aria-expanded="false" aria-controls="vp-sources">Parteien und Quellen bewusst anzeigen</button></div>
<section id="vp-sources" hidden aria-label="Parteizuordnung und Primärquellen"></section>
<noscript><p>Für Zoom und interaktiven Bildwechsel benötigst Du JavaScript. Die Ausgangsillustration und die Zusammenfassung des ersten Szenarios bleiben lesbar.</p><details><summary>Alle Szenarien und Primärquellen ohne JavaScript</summary>${data.scenarios.map(s=>`<h3>${esc(s.label)}: ${esc(s.party)}</h3><a href="${esc(s.image)}">Szenariobild öffnen</a>${data.domains.map(d=>`<h4>${esc(d.title)}</h4><p>${esc(s.topics[d.id].programme)} ${esc(s.topics[d.id].scene)}</p>`).join('')}<p><a href="${esc(s.source)}" rel="noreferrer">${esc(s.sourceTitle)}</a></p>`).join('')}</details></noscript>
<script type="application/json" id="vp-data">${safeJson(data)}</script></section>`;
}
