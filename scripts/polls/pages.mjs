import fs from 'node:fs';
import path from 'node:path';

export const SITE='https://wirkungsoekonomie.de';
export const DEFAULT_IMAGE='/assets/img/brand/app-icon-512.png';
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const safeJson=value=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
const disclaimer='Diese Online-Umfrage ist nicht repräsentativ. Das Ergebnis bildet die abgegebenen Stimmen der Teilnehmenden ab.';
export function shell(root,{title,description,route,body,image=DEFAULT_IMAGE,admin=false,poll=null,script='polls.mjs'}){
  const nav=JSON.parse(fs.readFileSync(path.join(root,'assets/data/navigation.json'),'utf8'));
  const link=item=>`<a href="${esc(/^(https?:|mailto:)/.test(item.href)?item.href:`/${item.href}`)}">${esc(item.label)}</a>`;
  const header=fs.readFileSync(path.join(root,'templates/header.html'),'utf8').replaceAll('{{BASE}}','/');
  const footer=fs.readFileSync(path.join(root,'templates/footer.html'),'utf8').replaceAll('{{BASE}}','/').replace('{{FOOTER_NAV}}',nav.footerGroups.map(g=>`<div class="footer-nav-group"><h3>${esc(g.title)}</h3><div class="footer-nav-links">${g.items.map(link).join('\n')}</div></div>`).join('\n')).replace('{{FOOTER_LEGAL_NAV}}',nav.footerLegal.map(link).join('\n'));
  const canonical=`${SITE}${route}`,preview=new URL(image||DEFAULT_IMAGE,SITE).href;
  return `<!doctype html>
<html lang="de"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | Wirkungsökonomie</title>
<meta name="description" content="${esc(description)}">
<meta name="search_title" content="${esc(title)}"><meta name="search_description" content="${esc(description)}"><meta name="search_section" content="Umfragen"><meta name="search_type" content="Umfrage">
${admin?'<meta name="robots" content="noindex,nofollow">':''}
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website"><meta property="og:locale" content="de_DE"><meta property="og:site_name" content="Wirkungsökonomie">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${esc(preview)}"><meta property="og:image:alt" content="${esc(poll?.image?`Titelbild zur Umfrage: ${title}`:'Wirkungsökonomie – Mensch, Planet und Demokratie')}">
<meta name="twitter:card" content="${image===DEFAULT_IMAGE?'summary':'summary_large_image'}"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(preview)}">
${poll?`<meta name="woek-poll-id" content="${esc(poll.id)}"><meta name="woek-poll-revision" content="${poll.revision}">`:''}
<link rel="icon" href="/assets/img/brand/signet.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/style.css"><link rel="stylesheet" href="/assets/css/polls.css">
<script type="application/ld+json">${safeJson({'@context':'https://schema.org','@type':'WebPage',name:title,description,url:canonical,inLanguage:'de',...(poll?{datePublished:poll.published_at,dateModified:poll.updated_at}:{}),isPartOf:{'@id':`${SITE}/#website`}})}</script>
</head><body class="poll-page">
<a class="sr-only" href="#poll-main">Zum Inhalt</a>
${header}
<main id="poll-main" class="poll-shell${admin?' poll-admin':''}" data-poll-api="https://130.162.217.58.sslip.io" ${poll?`data-poll-slug="${esc(poll.slug)}" data-poll-id="${esc(poll.id)}"`:''}>
<nav class="breadcrumb" aria-label="Brotkrumen"><a href="/">Start</a> / ${route==='/umfragen/'?'Umfragen':`<a href="/umfragen/">Umfragen</a> / ${admin?'Verwaltung':'Abstimmen'}`}</nav>
${body}
</main>${footer}
<script defer src="/assets/js/main.js"></script><script type="module" src="/assets/js/${script}"></script>
</body></html>\n`;
}
export function pollPage(root,poll){
  const description=(poll.social_description||poll.intro||poll.question).slice(0,300);
  return shell(root,{title:poll.title,description,route:`/umfragen/${poll.slug}/`,poll,image:poll.image||DEFAULT_IMAGE,body:`
<p class="poll-kicker">Deine Perspektive zählt · Online-Umfrage</p>
<h1 id="poll-title">${esc(poll.title)}</h1><p id="poll-intro" class="poll-intro">${esc(poll.intro)}</p>
<p class="poll-notice">Veröffentlicht am <time datetime="${esc(poll.published_at)}">${new Date(poll.published_at).toLocaleDateString('de-DE',{timeZone:'Europe/Berlin'})}</time>${poll.ends_at?` · Ende: <time datetime="${esc(poll.ends_at)}">${new Date(poll.ends_at).toLocaleString('de-DE',{timeZone:'Europe/Berlin'})} (Berlin)</time>`:''}</p>
${poll.image?`<img class="poll-hero-image" src="${esc(poll.image)}" alt="Titelbild zur Umfrage: ${esc(poll.title)}">`:''}
<section id="poll-ui" class="poll-card" aria-label="Abstimmung"><h2>${esc(poll.question)}</h2><ul>${poll.options.map(o=>`<li>${esc(o.label)}</li>`).join('')}</ul><p role="status">Abstimmung wird geladen …</p><noscript>Zum Abstimmen und Anzeigen der aktuellen Ergebnisse benötigst Du JavaScript.</noscript></section>
<p class="poll-notice">${disclaimer}</p>
<details id="datenschutz"><summary>Datenschutz und Mehrfachabstimmungen</summary><p>Du brauchst kein Konto und gibst weder Namen noch E-Mail-Adresse an. Beim Abstimmen speichert Dein Browser eine zufällige Kennung für diese Umfrage, höchstens ein Jahr lang. Auf unserem eigenen Server speichern wir die gewählte Antwort, den Zeitpunkt und eine nur für diese Umfrage gültige, verschlüsselt abgeleitete Kennung bis zur Löschung der Stimmen oder Umfrage.</p><p>Zum Schutz vor massenhaften Anfragen verarbeiten wir die IP-Adresse vorübergehend zu einem mit einem geheimen Schlüssel abgeleiteten Prüfwert. Im Umfragesystem speichern wir keine Klartext-IP und kein Geräteprofil. Diese technischen Prüfwerte laufen spätestens nach einer Stunde ab und werden spätestens fünf Minuten danach automatisch gelöscht. Sie werden getrennt von den Stimmen gespeichert und nicht gesichert.</p><p>Das verhindert einfache Mehrfachabstimmungen, ist aber keine Garantie gegen Manipulation: Andere Browser oder gelöschte Browserdaten können den Schutz umgehen. Die Umfrage ist keine Wahlplattform und nicht repräsentativ. <a href="/datenschutz.html">Allgemeine Datenschutzhinweise</a> · <a href="/impressum.html">Verantwortliche und Kontakt</a></p></details>
<section id="poll-share" class="poll-share" aria-label="Umfrage teilen"></section>`});
}
export function indexPage(root,polls){
  const publicPolls=polls.filter(p=>!['archived','draft'].includes(p.effective_status||p.status));
  const labels={active:'Aktiv',scheduled:'Geplant',paused:'Pausiert',ended:'Beendet'};
  return shell(root,{title:'Umfragen',description:'Deine Perspektive zur Wirkungsökonomie: aktuelle Online-Umfragen, einfach und ohne Registrierung.',route:'/umfragen/',body:`
<p class="poll-kicker">Mitdenken. Rückmeldung geben.</p><h1>Deine Perspektive zählt.</h1><p class="poll-intro">Was hilft Dir? Was überzeugt Dich? Was können wir besser machen? Hier findest Du unsere öffentlichen Umfragen. Wähle eine Antwort – ohne Anmeldung.</p>
<section aria-label="Öffentliche Umfragen">${publicPolls.length?publicPolls.map(p=>`<article class="poll-card"><p class="poll-kicker">${labels[p.effective_status||p.status]||''}</p><h2><a href="/umfragen/${esc(p.slug)}/">${esc(p.title)}</a></h2><p>${esc(p.intro)}</p><a class="btn btn-primary" href="/umfragen/${esc(p.slug)}/">Umfrage öffnen</a></article>`).join('\n'):'<p>Zurzeit ist keine öffentliche Umfrage verfügbar.</p>'}</section>
<p class="poll-notice">${disclaimer}</p><p><a href="/admin/umfragen/">Umfragen verwalten</a> · <a href="/wirkungsticker/">Zum Wirkungsticker</a></p>`});
}
export function retiredPage(root,slug){return shell(root,{title:'Umfrage nicht mehr verfügbar',description:'Diese Umfrage ist nicht mehr verfügbar.',route:`/umfragen/${slug}/`,admin:true,body:'<h1>Diese Umfrage ist nicht mehr verfügbar.</h1><p>Die Umfrage wurde von der Redaktion entfernt. Es können keine weiteren Stimmen abgegeben werden.</p><a class="btn btn-primary" href="/umfragen/">Zu den aktuellen Umfragen</a>'});}
const input=(name,label,{type='text',max=180,required=false,help=''}={})=>`<label>${esc(label)}${help?`<small>${esc(help)}</small>`:''}<input name="${name}" type="${type}"${max?` maxlength="${max}"`:''}${required?' required':''}></label>`;
export function adminPage(root){return shell(root,{title:'Umfragen verwalten',description:'Geschützte Verwaltung der WÖk-Umfragen.',route:'/admin/umfragen/',admin:true,script:'polls-admin.mjs',body:`
<h1>Umfragen verwalten</h1><p>Entwürfe vorbereiten, veröffentlichen und Rückmeldungen auswerten.</p>
<p id="poll-admin-message" class="poll-status" role="status" aria-live="polite">Anmeldung wird geprüft …</p>
<div id="poll-login-panel" class="poll-actions"><button id="poll-admin-login" class="btn btn-primary" type="button">Mit bestehendem Discord-Konto anmelden</button><button id="poll-admin-retry" class="btn btn-secondary" type="button">Anmeldung erneut prüfen</button></div>
<div id="poll-admin" hidden>
<div class="poll-actions"><button id="poll-new" class="btn btn-primary" type="button">Neue Umfrage</button></div>
<label for="poll-status-filter">Status filtern</label><select id="poll-status-filter"><option value="">Alle Umfragen</option value="draft">Entwürfe</option><option value="scheduled">Geplante</option><option value="active">Aktive</option><option value="paused">Pausierte</option><option value="ended">Beendete</option><option value="archived">Archivierte</option></select>
<p id="poll-admin-count"></p><ul id="poll-admin-list" class="poll-admin-list"></ul>
<section id="poll-editor" class="poll-card" hidden><h2 id="poll-editor-title">Umfrage bearbeiten</h2>
<form id="poll-editor-form">
${input('title','Titel',{required:true})}${input('slug','Slug / Link-Endung',{max:100,required:true,help:'Kleinbuchstaben, Ziffern und Bindestriche. Nach der Veröffentlichung bleibt die URL erhalten.'})}
<label>Einleitung<textarea name="intro" rows="4" maxlength="2500"></textarea></label>
${input('social_description','Beschreibung für Linkvorschau (optional)',{max:300,help:'Ohne eigene Beschreibung wird die Einleitung verwendet.'})}
${input('question','Frage',{max:500,required:true})}
<h3>Antwortoptionen</h3><p id="poll-options-note" class="poll-notice"></p><div id="poll-option-editor"></div><button id="poll-add-option" class="btn btn-secondary" type="button">Antwort hinzufügen</button>
<div class="poll-fields">
<label>Status<select name="status"><option value="draft">Entwurf</option><option value="scheduled">Geplant</option><option value="active">Aktiv</option><option value="paused">Pausiert</option><option value="ended">Beendet</option><option value="archived">Archiviert</option></select></label>
<label>Ergebnisse zeigen<select name="results_visibility"><option value="after_vote">Nach eigener Abstimmung (Standard)</option><option value="always">Sofort</option><option value="after_end">Erst nach Ende</option></select></label>
${input('starts_at','Startdatum',{type:'datetime-local',max:0,help:'Deine lokale Zeitzone. Leer bedeutet: beim Veröffentlichen starten.'})}
${input('ends_at','Enddatum (optional)',{type:'datetime-local',max:0})}
</div>
${input('image','Titelbild (optional)',{max:1500,help:'Pfad eines eigenen Website-Bildes oder WÖk-GitHub-Release-Link. Ohne Bild wird für die Linkvorschau das WÖk-Signet genutzt.'})}
<div class="poll-fields">${input('cta_text','CTA-Text nach der Abstimmung',{max:100})}${input('cta_url','CTA-Link',{max:1500,help:'Zum Beispiel /wirkungsticker/'})}</div>
${input('further_url','Weiterführender Link (optional)',{max:1500})}${input('feedback_note','Hinweis nach der Abstimmung (optional)',{max:400})}
<label class="poll-checkbox"><input name="feedback_enabled" type="checkbox"> Optionales internes Feedback nach der Abstimmung erlauben</label><p class="poll-notice">Keine öffentliche Kommentarspalte. Maximal ein Kommentar je anonymer Stimme, 1.500 Zeichen.</p>
<div class="poll-actions"><button id="poll-save" class="btn btn-primary" type="submit">Speichern</button><button id="poll-preview" class="btn btn-secondary" type="button">Vorschau öffnen</button></div>
</form><div id="poll-lifecycle" class="poll-actions"></div><div id="poll-publication"></div>
<section id="poll-admin-results" aria-label="Auswertung"></section>
<section id="poll-admin-feedback" aria-label="Internes Feedback"></section>
<section id="poll-preview-panel" hidden><div class="poll-actions"><button id="poll-preview-close" class="btn btn-secondary" type="button">Vorschau schließen</button></div><h2 id="poll-preview-title"></h2><p id="poll-preview-intro"></p><div id="poll-preview-ui" class="poll-card"></div></section>
</section></div><noscript>Für die geschützte Umfrageverwaltung benötigst Du JavaScript.</noscript>`});}
