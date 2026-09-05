import fs from 'node:fs';
import {ImpactProcess, ExampleCards, ComparisonTable, FeedbackLoop, escapeHtml} from '../lib/explainer-components.mjs';
import {writeContentPage} from '../lib/content-page.mjs';
import {editionLink} from '../lib/publication-editions.mjs';

const data = JSON.parse(fs.readFileSync('content/site/methodik.json', 'utf8'));
let body = fs.readFileSync('content/site/methodik.inc', 'utf8');
const replacements = {TITLE: escapeHtml(data.title), PROCESS: ImpactProcess(data.process), EXAMPLES: ExampleCards(data.examples), INTEGRATION: ComparisonTable(data.integration), FEEDBACK: FeedbackLoop(data.feedback), PDF_DOWNLOAD:editionLink('woek-methodik-integration-2026-09-05.pdf','Diese Erklärung als PDF')};
for (const [key,value] of Object.entries(replacements)) body = body.replaceAll(`{{${key}}}`, value);
if (/\{\{/.test(body)) throw new Error('Unresolved methodik content placeholder');
writeContentPage({file:'methodik/index.html', title:data.title, description:data.description, section:'Methodik', type:'Methodenerklärung', body});
console.log('Methodik rebuilt from content/site/methodik.json + methodik.inc.');
