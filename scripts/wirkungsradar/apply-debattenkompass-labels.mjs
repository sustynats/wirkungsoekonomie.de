import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET = path.join(ROOT, "wirkungsradar");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && full.endsWith(".html") ? [full] : [];
  });
}

function normalize(html) {
  return html
    .replace(/(<title>[^<]*?)\s+\|\s+Wirkungsradar Narrative(\s*\|\s*Wirkungsökonomie)?(<\/title>)/g, "$1 | Mythen & Narrative$2$3")
    .replace(/(<title>[^<]*?)\s+\|\s+Wirkungsradar Themen(\s*\|\s*Wirkungsökonomie)?(<\/title>)/g, "$1 | Themencluster$2$3")
    .replace(/(<title>[^<]*?)\s+\|\s+Wirkungsradar Detail(\s*\|\s*Wirkungsökonomie)?(<\/title>)/g, "$1 | Debattenkarte Detail$2$3")
    .replace(/(<title>[^<]*?)\s+\|\s+Wirkungsradar(\s*\|\s*Wirkungsökonomie)?(<\/title>)/g, "$1 | Debatten-Kompass$2$3")
    .replace(/(<h[1-6][^>]*>[^<]*?)\s+\|\s+Wirkungsradar Narrative(<\/h[1-6]>)/g, "$1$2")
    .replace(/(<h[1-6][^>]*>[^<]*?)\s+\|\s+Wirkungsradar(<\/h[1-6]>)/g, "$1$2")
    .replace(/(<h[1-6][^>]*>[^<]*?)\s+-\s+Wirkungsradar Narrative(<\/h[1-6]>)/g, "$1$2")
    .replace(/(<h[1-6][^>]*>[^<]*?)\s+-\s+Wirkungsradar(<\/h[1-6]>)/g, "$1$2")
    .replace(/Wirkungsradar Narrative/g, "Mythen & Narrative")
    .replace(/Wirkungsradar-Narrative/g, "Mythen & Narrative")
    .replace(/Wirkungsradar Themencluster/g, "Themencluster")
    .replace(/Wirkungsradar-Themencluster/g, "Themencluster")
    .replace(/Wirkungsradar-Themenseite/g, "Themenseite")
    .replace(/Wirkungsradar Detailanalysen/g, "Debatten-Kompass Detailanalysen")
    .replace(/Wirkungsradar Detail/g, "Debattenkarte Detail")
    .replace(/Psychologie im Wirkungsradar/g, "Psychologie im Debatten-Kompass")
    .replace(/im Wirkungsradar: warum/g, "im Debatten-Kompass: warum")
    .replace(/im Wirkungsradar und/g, "im Debatten-Kompass und")
    .replace(/Was der Wirkungsradar nicht ist/g, "Was der Debatten-Kompass nicht ist")
    .replace(/Was der Wirkungsradar sichtbar macht/g, "Was der Debatten-Kompass sichtbar macht")
    .replace(/Wirkungsradar Glossar/g, "Debatten-Kompass Glossar")
    .replace(/Zum Wirkungsradar-Glossar/g, "Zum Debatten-Kompass-Glossar")
    .replace(/Wirkungsradar-Live/g, "Debatten-Kompass")
    .replace(/Wirkungsradar Live/g, "Debatten-Kompass")
    .replace(/Wirkungsradar-Livekarten/g, "Debattenkarten")
    .replace(/Wirkungsradar-Live-Karten/g, "Debattenkarten")
    .replace(/Wirkungsradar-Livekarte/g, "Debattenkarte")
    .replace(/Wirkungsradar-Dossier/g, "Debatten-Kompass-Karte")
    .replace(/Wirkungsradar-Karte/g, "Debattenkarte")
    .replace(/Live-Karten/g, "Debattenkarten")
    .replace(/Live-Karte/g, "Debattenkarte")
    .replace(/Livekarte/g, "Debattenkarte")
    .replace(/Live-Pakete/g, "Debattenkarten")
    .replace(/Live-Paket/g, "Debattenkarte")
    .replace(/Live-Seiten/g, "Debattenkarten")
    .replace(/Live-Seite/g, "Debattenkarte")
    .replace(/Live-Modus/g, "Debattenkarte")
    .replace(/Live-Inventar/g, "Debattenkarten-Inventar")
    .replace(/Host-Cockpit(?: · [^<]*)?/g, "Schnellantwort")
    .replace(/Host-Playbook/g, "Antwort-Playbooks")
    .replace(/host playbook/g, "antwort playbooks")
    .replace(/Gute R(?:ü|ue)ckfrage/g, "Die bessere Frage")
    .replace(/(<a href="(?:\.\.\/)+">)Wirkungsradar(<\/a>)/g, "$1Debatten-Kompass$2")
    .replace(/<a([^>]+href="[^"]*wirkungsradar\/"[^>]*)>Wirkungsradar<\/a>/g, "<a$1>Debatten-Kompass</a>")
    .replace(/<a([^>]+href="[^"]*wirkungsradar\/[^"]*"[^>]*)>Wirkungsradar<\/a>/g, "<a$1>Debatten-Kompass</a>")
    .replace(/\/ <a href="([^"]*)">Wirkungsradar<\/a>/g, '/ <a href="$1">Debatten-Kompass</a>')
    .replace(/Wirkungsradar öffnen/g, "Debatten-Kompass öffnen")
    .replace(/Wirkungsradar: Faktenkern/g, "Debatten-Kompass: Faktenkern")
    .replace(/<p class="card-kicker">Wirkungsradar<\/p>/g, '<p class="card-kicker">Debatten-Kompass</p>')
    .replace(/<p class="hero-kicker">Wirkungsradar<\/p>/g, '<p class="hero-kicker">Debatten-Kompass</p>')
    .replace(/aria-label="Wirkungsradar Navigation"/g, 'aria-label="Debatten-Kompass Navigation"')
    .replace(/<a href="([^"]*?)host-playbook\/">Antwort-Playbooks<\/a>/g, '<a href="$1antwort-playbooks/">Antwort-Playbooks</a>')
    .replace(/<a href="([^"]*?)live\/">Debattenkarten<\/a>/g, '<a href="$1debattenkarten/">Debattenkarten</a>')
    .replace(/<h1 class="hero-title">Wirkungsradar<\/h1>/g, '<h1 class="hero-title">Debatten-Kompass</h1>')
    .replace(/<h1 class="hero-title">Wirkungsradar Status<\/h1>/g, '<h1 class="hero-title">Debatten-Kompass Status</h1>')
    .replace(/<p class="hero-kicker">Wirkungsradar Detail<\/p>/g, '<p class="hero-kicker">Debattenkarte Detail</p>');
}

let changed = 0;
for (const file of walk(TARGET)) {
  const before = fs.readFileSync(file, "utf8");
  const after = normalize(before);
  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
  }
}

console.log(`Debatten-Kompass label normalizer updated ${changed} HTML files.`);
