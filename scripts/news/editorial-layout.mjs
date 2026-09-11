import {escape} from './editorial-markdown.mjs';

// Presentation only: render the approved words unchanged, with the author's
// existing format portrait. No image generation or editorial rewriting.
export function authorPerspectiveHeader({heading = '<h2>Meine Einordnung</h2>', portrait = '/assets/img/people/natalie-weber-woek-analyse.jpg', portraitAlt = 'Natalie Weber'} = {}) {
  return `<header class="news-author-perspective__header" aria-label="Persönliche Einordnung der Autorin"><img class="news-author-perspective__portrait" src="${escape(portrait)}" alt="${escape(portraitAlt)}" width="96" height="128" loading="lazy" decoding="async"><div><p class="news-author-perspective__byline">Natalie Weber · Meinung &amp; Analyse</p>${heading}</div></header>`;
}

export function renderEditorialSection(section, portraitOptions = {}) {
  const personal = section.title === 'Meine Einordnung';
  let html = section.html;
  if (personal) html = html.replace(/^<h2>[^]*?<\/h2>/, heading => authorPerspectiveHeader({...portraitOptions, heading}));
  return `<section class="news-editorial-article__section${personal ? ' news-author-perspective' : ''}" id="${escape(section.id)}"${personal ? ' aria-label="Persönliche Einordnung der Autorin"' : ''}>${html}</section>`;
}
