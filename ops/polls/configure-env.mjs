// One-time production setup; invoke only after backing up the existing .env.
import { readFileSync,writeFileSync,renameSync,chmodSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
const target='/opt/faktencheck-bot/.env';
if(process.cwd()!=='/opt/faktencheck-bot')throw new Error('Wrong backend directory.');
const previous=readFileSync(target,'utf8');
if(/^POLLS_/m.test(previous))throw new Error('Poll configuration already exists; inspect rather than overwrite.');
const values={
  POLLS_ENABLED:'true',
  POLLS_DATABASE_PATH:'/opt/faktencheck-bot/data/polls/polls.sqlite',
  POLLS_ABUSE_DATABASE_PATH:'/opt/faktencheck-bot/data/polls/abuse.sqlite',
  POLLS_BACKUP_DIRECTORY:'/opt/faktencheck-bot/backups/polls',
  POLLS_TOKEN_PEPPER:randomBytes(48).toString('base64url'),
  POLLS_ABUSE_PEPPER:randomBytes(48).toString('base64url'),
  POLLS_TRUST_LOCAL_PROXY:'true',
};
writeFileSync(`${target}.polls-next`,`${previous.trimEnd()}\n\n# Self-hosted surveys; private values generated on the Oracle host.\n${Object.entries(values).map(([key,value])=>`${key}=${value}`).join('\n')}\n`,{mode:0o600});
renameSync(`${target}.polls-next`,target);chmodSync(target,0o600);
console.log('Private poll environment added; existing configuration preserved.');
