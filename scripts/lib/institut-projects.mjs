import fs from 'node:fs';
import {escapeHtml as e} from './explainer-components.mjs';
export const instituteProjects = JSON.parse(fs.readFileSync('content/institut/projects.json','utf8'));
export const projectLabels = Object.fromEntries(instituteProjects.projects.map(p=>[p.slug,p.shortTitle]));
export const statusLabels = {erledigt:'Erledigt',in_arbeit:'In Arbeit',bereit:'Bereit',backlog:'Geplant',review:'In Prüfung'};
export const dateLabel = value => value.split('-').reverse().join('.');
export function renderInstituteProjects({base='/',id='institutsprojekte'}={}) {
  return `<section class="section section-soft" id="${e(id)}" aria-labelledby="${e(id)}-title"><p class="hero-kicker">Im Wirkungsinstitut entsteht</p><h2 id="${e(id)}-title">Von der Idee zur öffentlichen Anwendung</h2><p>Parlament, Wirkungsticker und Umfragen sind Projekte des Wirkungsinstituts. Hier wird sichtbar, was bereits live ist, welche Arbeiten dahinterstehen und was als Nächstes ansteht. Verantwortlich: Natalie Weber.</p><div class="card-grid three">${instituteProjects.projects.map(p=>`<article class="card"><p class="card-kicker">${e(p.publicStatus)}</p><h3 class="card-title">${e(projectLabels[p.slug])}</h3><p>${e(p.goal)}</p><p class="meta-line">${p.tasks.filter(t=>t.status==='erledigt').length} von ${p.tasks.length} nachgetragenen Aufgaben erledigt · Stand ${dateLabel(p.recordedAt)}</p><p><a class="text-link" href="${base}institut/projekte/${p.slug}/">Projektweg und Aufgaben ansehen</a></p><p><a href="${e(p.liveUrl)}">Öffentliche Anwendung öffnen</a></p></article>`).join('')}</div><p><a href="${base}institut/projekte/">Alle Projektakten, Konzepte und Arbeitsaufträge</a> · <a href="https://institut.wirkungsoekonomie.de/aktuelle-arbeiten">Aktuelle Arbeiten im Institut</a></p></section>`;
}
