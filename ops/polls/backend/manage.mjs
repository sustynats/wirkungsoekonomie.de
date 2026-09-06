import { readFileSync } from 'node:fs';
import { PollStore } from './store.mjs';
const store = new PollStore({ path: process.env.POLLS_DATABASE_PATH || './data/polls/polls.sqlite', pepper: process.env.POLLS_TOKEN_PEPPER });
const [command, target] = process.argv.slice(2);
try {
  if (command === 'migrate') console.log('Poll schema version 3 ready (explicit consent and self-service withdrawal).');
  else if (command === 'seed') {
    const input = JSON.parse(readFileSync(new URL('./first-poll.json', import.meta.url), 'utf8'));
    const existing = store.db.prepare('SELECT id FROM polls WHERE slug=?').get(input.slug);
    console.log(existing ? 'First poll already exists; kept unchanged.' : `First poll created: ${store.create(input).slug}`);
  } else if (command === 'backup' && target) { store.backup(target); console.log('Consistent SQLite backup created.'); }
  else if (command === 'check') {
    const result = store.db.prepare('PRAGMA integrity_check').all();
    if (result.length !== 1 || result[0].integrity_check !== 'ok') throw new Error('Integrity check failed.');
    if (store.db.prepare('PRAGMA foreign_key_check').all().length) throw new Error('Foreign key check failed.');
    console.log('Database integrity and foreign keys OK.');
  } else throw new Error('Usage: node --env-file=.env polls/manage.mjs migrate|seed|check|backup [new-backup-path]');
} finally { store.close(); }
