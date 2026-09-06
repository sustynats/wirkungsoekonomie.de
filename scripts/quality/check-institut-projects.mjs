import fs from 'node:fs';
import path from 'node:path';

const root = process.argv.includes('--artifact') ? '_site' : '.';
const data = JSON.parse(fs.readFileSync('content/institut/projects.json', 'utf8'));
// Der Institutsdiskurs führt Fachprojekte; private Betriebsaufträge dürfen
// weder über die Datenquelle noch über einen separat eingefügten Teaser zurückkehren.
const operational = /oracle|vercel|hosting|kostengate|serverumzug|produktivserver|externe sicherung/i;
if (operational.test(JSON.stringify(data))) throw new Error('Private operational content in public institute project data.');
const overview = fs.readFileSync(path.join(root, 'institut/projekte/index.html'), 'utf8');
if (/oracle-always-free|Umzug des Instituts/.test(overview)) throw new Error('Private operational project linked in institute overview.');
const text = value => value.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
let documents = 0, tasks = 0;
for (const project of data.projects) {
  const file = path.join(root, 'institut/projekte', project.slug, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  for (const doc of project.documents) {
    const id = `dokument-${doc.kind}`;
    const block = html.match(new RegExp(`<details\\b[^>]*\\bid="${id}"[^>]*>([\\s\\S]*?)<\\/details>`))?.[1];
    if (!block || text(block.match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/)?.[1] || '') !== doc.title) {
      throw new Error(`${file}: missing or damaged document summary ${id}`);
    }
    // A publication sanitizer once removed the entire chronicle while leaving
    // the page, links and task cards intact. Verify substantive prose lines
    // independently of the renderer's paragraph and list boundaries.
    for (const line of doc.body.split(/\n/)) {
      if (line.length < 120 || line.includes('https://') || /^#/.test(line)) continue;
      const expected = text(line.replace(/^[-*]\s+/, '').replace(/\*\*/g, ''));
      if (!text(block).includes(expected)) throw new Error(`${file}: document prose lost in ${id}: ${expected.slice(0,80)}`);
    }
    documents++;
  }
  for (const task of project.tasks) {
    const block = html.match(new RegExp(`<details\\b[^>]*\\bid="${task.code.toLowerCase()}"[^>]*>([\\s\\S]*?)<\\/details>`))?.[1];
    if (!block || !text(block).includes(task.title) || !text(block).includes(task.owner) || !text(block).includes(task.acceptance)) {
      throw new Error(`${file}: incomplete task ${task.code}`);
    }
    tasks++;
  }
}
console.log(`Institute publication integrity passed: ${documents} complete documents and ${tasks} assigned tasks (${root}).`);
