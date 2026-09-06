import fs from 'node:fs';
import path from 'node:path';

// Standalone apps share this document shell; content stays outside the generator.
const root = process.cwd();
const substitutions = {
  TITLE: 'Speedtest | Internet-Verbindung prüfen',
  DESCRIPTION: 'Download, Upload und Ping messen. Mit ungefährem Verbindungsort und Internet-Provider.',
  STYLESHEET: '/assets/css/speedtest.css?v=20260906',
  SCRIPT: '/assets/js/speedtest.js?v=20260906',
  CONTENT: fs.readFileSync(path.join(root, 'content/apps/speedtest.html'), 'utf8'),
};
const template = fs.readFileSync(path.join(root, 'templates/standalone-app.html'), 'utf8');
const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
  if (!(key in substitutions)) throw new Error(`Unknown standalone template field: ${key}`);
  return substitutions[key];
});
fs.mkdirSync(path.join(root, 'speedtest'), { recursive: true });
fs.writeFileSync(path.join(root, 'speedtest/index.html'), html);
console.log('Built /speedtest/ (unlisted, noindex).');
