import fs from 'node:fs';

// Mechanical extraction only: no Fach, DNS, Recommendation or semantic role inference.
const repo = process.env.GITHUB_REPOSITORY || 'sustynats/wirkungsoekonomie.de';
const [owner, name] = repo.split('/');
const token = process.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN missing');

const headers = {
  authorization: `Bearer ${token}`,
  accept: 'application/vnd.github+json',
  'x-github-api-version': '2022-11-28'
};

const all = [];
for (let page = 1; ; page++) {
  const url = `https://api.github.com/repos/${owner}/${name}/issues/234/comments?per_page=100&page=${page}`;
  const r = await fetch(url, {headers});
  if (!r.ok) throw new Error(`issue comments fetch ${r.status}`);
  const batch = await r.json();
  all.push(...batch);
  if (batch.length < 100) break;
}

const isGruene = body => /(?:GR[ÜU]NE|ST-GRUENE|ST_GRUENE)/i.test(body || '');
const filtered = all
  .filter(c => isGruene(c.body))
  .map(c => ({
    id: c.id,
    html_url: c.html_url,
    created_at: c.created_at,
    updated_at: c.updated_at,
    body: c.body
  }))
  .sort((a,b) => a.id - b.id);

const payload = {
  manifest_id: 'ST-GRUENE-ISSUE234-SOURCE-CORPUS-C01',
  source_issue: 234,
  extraction_rule: 'mechanical exact comment filter only; body matches GRÜNE/GRUENE/ST-GRUENE/ST_GRUENE; no semantic inference',
  total_issue_comments: all.length,
  matching_comments: filtered.length,
  comments: filtered
};

fs.mkdirSync('content/audits/sachsen-anhalt', {recursive: true});
fs.writeFileSync('content/audits/sachsen-anhalt/gruene-issue234-source-corpus-c01.json', JSON.stringify(payload, null, 2) + '\n');
console.log(`GRUENE_COMMENT_CORPUS=${filtered.length}/${all.length}`);
console.log(`FIRST_ID=${filtered.at(0)?.id ?? 'NONE'}`);
console.log(`LAST_ID=${filtered.at(-1)?.id ?? 'NONE'}`);
