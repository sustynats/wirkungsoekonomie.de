import fs from 'node:fs';
import {ImpactProcess, ExampleCards, ComparisonTable, FeedbackLoop, escapeHtml} from '../lib/explainer-components.mjs';
import {writeContentPage} from '../lib/content-page.mjs';
import {editionLink} from '../lib/publication-editions.mjs';
import {renderWindowNote} from '../lib/wirkungsfenster.mjs';

const data = JSON.parse(fs.readFileSync('content/site/methodik.json', 'utf8'));
let body = fs.readFileSync('content/site/methodik.inc', 'utf8');
const replacements = {TITLE: escapeHtml(data.title), PROCESS: ImpactProcess(data.process), EXAMPLES: ExampleCards(data.examples), INTEGRATION: ComparisonTable(data.integration), FEEDBACK: FeedbackLoop(data.feedback), PDF_DOWNLOAD:editionLink('woek-methodik-integration-2026-09-05.pdf','Diese Erklärung als PDF')};
for (const [key,value] of Object.entries(replacements)) body = body.replaceAll(`{{${key}}}`, value);
if (/\{\{/.test(body)) throw new Error('Unresolved methodik content placeholder');
// Keep the newer web addendum in partial builds, without changing the dated PDF source.
const windowAnchor = '<section class="section" id="weiterlesen"';
if (!body.includes(windowAnchor)) throw new Error('Missing Methodik addendum anchor');
body = body.replace(windowAnchor, `<!-- wirkungsfenster-methodik:start -->${renderWindowNote('methodik')}<!-- wirkungsfenster-methodik:end -->\n${windowAnchor}`);
body = body.replace('Leitfaden v1.7</a>', 'Leitfaden v1.8</a>');
writeContentPage({file:'methodik/index.html', title:data.title, description:data.description, section:'Methodik', type:'Methodenerklärung', body});
console.log('Methodik rebuilt from content/site/methodik.json + methodik.inc.');
