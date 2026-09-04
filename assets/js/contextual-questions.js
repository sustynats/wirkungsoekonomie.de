// Redaktionelle Zuordnungen, keine KI-Abfrage und kein personenbezogenes Profiling.
// Vorrang: konkrete Seite -> vorhandene Fragen -> fachlich passende Vertiefung.
const q = (label, href, tag = 'Vertiefung') => ({ label, href, tag });

export const PAGE_QUESTIONS = {
  '/akademie.html': [
    q('Wie ist das Studium der Wirkungsökonomie aufgebaut?', '/akademie/studienstruktur.html', 'Studium'),
    q('Welche Prüfungen und Praxisleistungen gehören dazu?', '/akademie/pruefungen.html', 'Lernen'),
    q('Welche Weiterbildungen werden angeboten?', '/akademie/weiterbildung.html', 'Weiterbildung'),
  ],
  '/bibliothek/': [
    q('Welche Veröffentlichung eignet sich für den Einstieg?', '/buch/', 'Orientierung'),
    q('Wo finde ich Methoden und Werkzeuge?', '/tools/', 'Vertiefung'),
    {label:'Wie erkenne ich ältere Fassungen?', answer:'Achte auf den ausgewiesenen Stand und Kennzeichnungen wie „archiviert“ oder „ersetzt“. Prüfe bei älteren Veröffentlichungen, ob eine neuere Fassung verlinkt ist.', tag:'Versionen'},
  ],
  '/quellenarchiv/': [
    {label:'Wozu dienen die Detailseiten der Quellen?', answer:'Sie ordnen Quellen ein und bieten den Zugang zur jeweiligen Veröffentlichung. Prüfe dort Herkunft, Fassung und Bezug zur behandelten Frage.', tag:'Quellenarbeit'},
    q('Wo finde ich die eigenen Veröffentlichungen der Wirkungsökonomie?', '/bibliothek/', 'Abgrenzung'),
    q('Warum sind Quelle und Wirkungsnachweis nicht dasselbe?', '/fragen/#messbarkeit', 'Evidenz'),
  ],
  '/institut/': [
    q('Was entsteht im Wirkungsinstitut?', '/institut/#institut-output-title'),
    q('Wie unterscheiden sich Institut, Akademie und Plattform?', '/institut/#institut-einordnung-title', 'Orientierung'),
    q('Wie kann ich am Institut mitwirken?', '/institut/#institut-mitwirken-title', 'Mitmachen'),
  ],
  '/parlament/': [
    q('Was unterscheidet einen Beschluss von seiner tatsächlichen Wirkung?', '/parlament/#parlament-warum-title'),
    q('Wie werden Quellen, Unsicherheit und Verantwortung offengelegt?', '/parlament/#parlament-qualitaet-title', 'Nachvollziehbarkeit'),
    q('Warum gibt es kein Ranking von Menschen oder Parteien?', '/parlament/#parlament-kein-ranking-title', 'Schutzgrenzen'),
  ],
  '/buch/': [
    q('Wo kann ich das Buch lesen oder herunterladen?', '/buch.html#download', 'Lesen'),
    q('Welche Lesereihenfolge hilft beim Einstieg?', '/buch.html#lesepfad-title', 'Orientierung'),
    q('Wie darf ich das Buch nutzen und zitieren?', '/buch.html#nutzung-title', 'Nutzung'),
  ],
  '/news/': [
    {label:'Was finde ich in dieser Übersicht?', answer:'Hier stehen neue Veröffentlichungen, Inhalte und Funktionen der Wirkungsökonomie, einschließlich Neuerungen aus Akademie, Institut und Parlament.', tag:'Orientierung'},
    q('Wo finde ich aktuelle Nachrichten und ihre Einordnung?', '/wirkungsticker/', 'Wirkungsticker'),
    q('Wie kann ich über neue Inhalte informiert bleiben?', '/feeds/', 'Abonnieren'),
  ],
  '/umfragen/': [
    {label:'Brauche ich ein Konto, um abzustimmen?', answer:'Nein. Du wählst eine Antwort und stimmst ohne Namen oder E-Mail-Adresse ab. Eine zufällige Browserkennung hilft, einfache Mehrfachabstimmungen zu verhindern.', tag:'Teilnahme'},
    {label:'Was sagen die Ergebnisse aus?', answer:'Sie zeigen die abgegebenen Stimmen der Teilnehmenden. Eine offene Online-Umfrage ist keine repräsentative Stichprobe der Bevölkerung.', tag:'Einordnung'},
    {label:'Wann sehe ich die Ergebnisse?', answer:'Das hängt von der jeweiligen Umfrage ab. Der Abstimmungsbereich zeigt, ob die Ergebnisse sofort, nach Deiner eigenen Stimme oder erst nach Ende sichtbar sind.', tag:'Ergebnisse'},
  ],
  '/suche.html': [
    {label:'Wie finde ich einen bestimmten Inhalt?', answer:'Suche nach dem Titel oder einem markanten Fachbegriff. Mit den angebotenen Filtern kannst Du die Treffer weiter eingrenzen.', tag:'Suche'},
    q('Wo finde ich Definitionen von Fachbegriffen?', '/begriffe/', 'Glossar'),
    q('Wo stehen Quellen und Veröffentlichungen?', '/bibliothek/', 'Bibliothek'),
  ],
};

export const QUESTION_TOPICS = [
  {id:'wohlstand', terms:['wohlstandsverlust','wohlstand','folgekosten','externalisierung','externe kosten'], questions:[
    q('Was bedeutet Wohlstand jenseits von Geld und Umsatz?', '/begriffe/wohlstand/'),
    q('Wie werden Kosten auf andere Menschen oder kommende Generationen verlagert?', '/begriffe/externalisierung/'),
    q('Warum ist wirtschaftliche Aktivität noch keine positive Netto-Wirkung?', '/begriffe/positive-netto-wirkung/'),
  ]},
  {id:'energie', terms:['energiewende','atomkraft','kernkraft','strommarkt','windkraft','solarenergie'], questions:[
    q('Was umfasst die Energiewende als Systemveränderung?', '/begriffe/energiewende/'),
    q('Wie lässt sich die Resilienz eines Energiesystems einordnen?', '/begriffe/systemresilienz/'),
    q('Welche Folgekosten können außerhalb des Marktpreises liegen?', '/begriffe/externalisierung/'),
  ]},
  {id:'gesundheit', terms:['gesundheit','pflege','krankenhaus','praevention'], questions:[
    q('Was ist Gesundheitswirkung im Unterschied zur erbrachten Leistung?', '/begriffe/gesundheitswirkung/'),
    q('Wie werden Verbesserungen trotz unsicherer Daten untersucht?', '/fragen/#messbarkeit'),
    q('Welche Schutzgrenzen dürfen nicht verrechnet werden?', '/begriffe/nichtkompensationsprinzip/'),
  ]},
  {id:'wohnen', terms:['wohnraum','wohnwirkung','wohnungs','miete','stadtentwicklung'], questions:[
    q('Was macht die Wirkung von Wohnraum aus?', '/begriffe/wohnwirkung/'),
    q('Welche sozialen und ökologischen Kosten können verlagert werden?', '/begriffe/externalisierung/'),
  ]},
  {id:'lernen', terms:['bildung','schule','unterricht','wirkungskompetenz','curriculum','vorlesung'], questions:[
    q('Was umfasst Wirkungskompetenz?', '/begriffe/wirkungskompetenz/'),
    q('Wie ist der Lernweg in der Akademie aufgebaut?', '/akademie/studienstruktur.html'),
    q('Welche Prüfungen verbinden Wissen und Praxis?', '/akademie/pruefungen.html'),
  ]},
  {id:'kapital', terms:['kapital','investition','finanzierung','finanzmarkt'], questions:[
    q('Wie kann Kapital Wirkung entfalten?', '/begriffe/kapitalwirkung/'),
    q('Was unterscheidet Ertrag von positiver Netto-Wirkung?', '/begriffe/positive-netto-wirkung/'),
    q('Welche Rolle spielt T-SROI bei der Einordnung?', '/werkzeuge/t-sroi/'),
  ]},
  {id:'resignifikation', terms:['resignifikation','reframing','framing','parteiframe','deutungsrahmen'], questions:[
    q('Was unterscheidet Resignifikation von einer bloßen Wortwahl?', '/begriffe/resignifikation/'),
    q('Wie lässt sich ein problematischer Frame verändern?', '/begriffe/reframing/'),
    q('Warum ist kommunikatives Wirkungspotenzial noch kein Wirkungsnachweis?', '/begriffe/wirkungspotenzial/'),
  ]},
  {id:'katechon', terms:['katechon'], questions:[
    q('Was bedeutet Katechon und wie wird der Begriff politisch verwendet?', '/begriffe/katechon/'),
    q('Wie können politische Begriffe umgedeutet werden?', '/begriffe/resignifikation/'),
  ]},
  {id:'klimaanpassung', terms:['klimaanpass','klimakrise','klimawandel','hitzeschutz','hitze','wasserknapp','duerre','hochwasser'], questions:[
    q('Was umfasst Klimaanpassung?', '/begriffe/klimaanpassung/'),
    q('Welche Aufgaben haben Klimaanpassungsmanager:innen?', '/begriffe/klimaanpassungsmanagerin/'),
    q('Wann stärkt Anpassung die langfristige Wirkungsresilienz?', '/begriffe/wirkungsresilienz/'),
  ]},
  {id:'resilienz', terms:['resilienz','resilient','nachhaltigkeit','systemarchitektur'], questions:[
    q('Was unterscheidet Systemresilienz von Wirkungsresilienz?', '/begriffe/wirkungsresilienz/'),
    q('Warum ist nicht jede widerstandsfähige Struktur nachhaltig?', '/begriffe/systemresilienz/'),
    q('Wie wird Nachhaltigkeit im Referenzrahmen Mensch–Planet–Demokratie definiert?', '/begriffe/nachhaltigkeit/'),
  ]},
  {id:'pricing', terms:['value-based','value based','value-pricing','value pricing','kundennutzen','kundenwert'], questions:[
    q('Woran orientiert sich Value-based Pricing?', '/begriffe/value-based-pricing/'),
    q('Was unterscheidet Kundenwert von systemischem Wert?', '/begriffe/systemischer-wert/'),
    q('Warum dürfen Schäden nicht mit Nutzen verrechnet werden?', '/begriffe/nichtkompensationsprinzip/'),
  ]},
  {id:'wirkungspfad', terms:['wirkungspfad','wirkpfad','wirkstoff','wirkmechanismus'], questions:[
    q('Was kann Wirkung auslösen, bevor sich ein Zustand verändert?', '/begriffe/wirkstoff/'),
    q('Wie unterscheiden sich Wirkungspotenzial und tatsächliche Wirkung?', '/begriffe/wirkungspotenzial/'),
    q('Was trennt Faktencheck und Folgencheck?', '/fragen/#faktencheck-folgencheck', 'Abgrenzung'),
  ]},
  {id:'iooi', terms:['iooi','phineo','interventionslogik','outcome','output'], questions:[
    q('Welche Stufen unterscheidet das IOOI-Modell?', '/begriffe/iooi/'),
    q('Was unterscheidet Wirkungspotenzial von eingetretener Wirkung?', '/begriffe/wirkungspotenzial/'),
  ]},
  {id:'scorecards', terms:['scorecard','wirkungscontrolling'], questions:[
    q('Was dokumentieren Wirkungsscorecards?', '/werkzeuge/scorecards/'),
    q('Wie werden fehlende Daten behandelt?', '/fragen/#fehlende-daten', 'Evidenz'),
    q('Warum legt eine Scorecard keinen Steuersatz fest?', '/fragen/#tarifentscheidung', 'Governance'),
  ]},
  {id:'steuer', terms:['wirkungssteuer','wstg','steuertarif','produktbesteuerung','umsatzsteuer'], questions:[
    q('Wer entscheidet über einen Steuertarif?', '/fragen/#tarifentscheidung', 'Governance'),
    q('Wie funktioniert die modulare Wirkungssteuer?', '/wirkungssteuerung/wirkungssteuer/'),
    q('Welche Schäden dürfen nicht kompensiert werden?', '/begriffe/nichtkompensationsprinzip/', 'Schutzgrenzen'),
  ]},
  {id:'tsroi', terms:['t-sroi','tsroi','transformationsrendite'], questions:[
    q('Wie ist T-SROI zu verwenden?', '/werkzeuge/t-sroi/', 'Methode'),
    q('Was ist Netto-Wirkung?', '/begriffe/netto-wirkung/'),
    q('Wo endet die Verrechnung von Nutzen und Schäden?', '/begriffe/nichtkompensationsprinzip/', 'Schutzgrenzen'),
  ]},
  {id:'einkommen', terms:['wirkungseinkommen','wirkungsrente','wirkungsfonds','automatisierung'], questions:[
    q('Ist Wirkungseinkommen dasselbe wie ein Grundeinkommen?', '/fragen/#bge', 'Abgrenzung'),
    q('Woher kommen die finanziellen Mittel?', '/fragen/#geld', 'Finanzierung'),
    q('Wie wird Automatisierung im Modell eingeordnet?', '/fragen/#automatisierung'),
  ]},
  {id:'esg', terms:['esg','esrs','csrd','taxonomie','social taxonomy','sustainable finance'], questions:[
    q('Wie grenzt sich die Wirkungsökonomie von ESG ab?', '/fragen/#esg', 'Abgrenzung'),
    q('Was passiert, wenn belastbare Daten fehlen?', '/fragen/#fehlende-daten', 'Evidenz'),
    q('Wer entscheidet, was gute Wirkung ist?', '/faq/wer-entscheidet-was-gute-wirkung-ist/', 'Bewertung'),
  ]},
  {id:'staat', terms:['enap','gesetzesfolgen','nachhaltigkeitspruefung','dns','bundesvorhaben','sondervermoegen','parlament','wahl-o-mat','folgencheck'], questions:[
    q('Was unterscheidet Faktencheck und Folgencheck?', '/fragen/#faktencheck-folgencheck'),
    q('Was trennt politische Entscheidung, Umsetzung und Wirkung?', '/parlament/#parlament-ebenen-title'),
    q('Wie werden Quellen und Unsicherheiten im Parlamentsportal sichtbar?', '/parlament/#parlament-qualitaet-title'),
  ]},
  {id:'demokratie', terms:['demokratie','autoritaer','faschismus','tv-duell','propaganda'], questions:[
    q('Was schützt demokratische Resilienz?', '/begriffe/demokratische-resilienz/'),
    q('Wie verändert Resignifikation politische Bedeutungen?', '/begriffe/resignifikation/'),
    q('Wie unterscheidet das Parlamentsportal Entscheidungen von Personen?', '/parlament/#parlament-kein-ranking-title', 'Schutzgrenzen'),
  ]},
  {id:'referenzrahmen', terms:['sdg','agenda 2030','referenzrahmen','sdgplus','sdg-plus'], questions:[
    q('Welche Rolle spielen SDGs und SDG+ als Referenzrahmen?', '/begriffe/sdg-sdgplus-referenzrahmen/'),
    q('Warum ist ein Zielbezug noch keine eingetretene Wirkung?', '/begriffe/wirkungspotenzial/'),
    q('Wie wird die Bewertung guter Wirkung begründet?', '/faq/wer-entscheidet-was-gute-wirkung-ist/'),
  ]},
  {id:'nwi', terms:['nwi','netto-wirkungsindex'], questions:[
    q('Was bezeichnet NWI in der Wirkungsökonomie?', '/begriffe/nwi/'),
    q('Wie wird Netto-Wirkung eingeordnet?', '/begriffe/netto-wirkung/'),
  ]},
  {id:'daten', terms:['evidenz','attribution','zurechnung','gegenfaktum','counterfactual','messbarkeit'], questions:[
    q('Was ist ein Attributionsfehler?', '/begriffe/attributionsfehler/'),
    q('Wie wird Wirkung trotz Unsicherheit untersucht?', '/fragen/#messbarkeit'),
    q('Was geschieht bei fehlenden Daten?', '/fragen/#fehlende-daten'),
  ]},
];

export function normalizedPath(path) {
  return (`/${String(path || '').replace(/^\/+/, '')}`).replace(/\/index\.html$/, '/') || '/';
}
const normalizedText = text => String(text || '').toLowerCase().replaceAll('ä','ae').replaceAll('ö','oe').replaceAll('ü','ue').replaceAll('ß','ss');
export function questionHeading(path) {
  if (/^\/umfragen\/[^/]+\/?$/.test(path)) return 'Fragen zu dieser Umfrage';
  if (/^\/begriffe\/[^/]+\/?$/.test(path)) return 'Fragen zu diesem Begriff';
  if (/^\/(blog|journal)\/.+/.test(path)) return 'Fragen zu diesem Beitrag';
  if (/^\/wirkungsticker\/.+/.test(path)) return 'Fragen zu dieser Nachricht';
  if (/^\/(bibliothek|referenz|dokumente)\/.+/.test(path)) return 'Fragen zu dieser Veröffentlichung';
  if (/^\/(werkzeuge|tools|erleben|ausprobieren)\/.+/.test(path)) return 'Fragen zu diesem Werkzeug';
  return 'Fragen zu dieser Seite';
}
export function isSafeQuestionLink(href) {
  return typeof href === 'string' && (/^\/(?!\/)/.test(href) || /^#[^\s]+$/.test(href)) && !/[\\\u0000-\u0020]/.test(href);
}

export function selectContextualQuestions(context) {
  const path = normalizedPath(context.path);
  // The ticker has its own evidence, follow-up and related-news sections.
  // Its owner explicitly excluded generic question recommendations here.
  if (context.lang === 'en' || context.noindex || /^\/(admin|_debug|fragen|faq|wirkungsticker)(\/|$)/.test(path)) return [];
  const unique = items => {
    const labels = new Set(), targets = new Set();
    return items.filter(item => {
      if (!item || typeof item.label !== 'string' || item.label.length > 300 || (!item.answer && !isSafeQuestionLink(item.href))) return false;
      if (item.href && !isSafeQuestionLink(item.href)) return false;
      if (item.href && !item.href.includes('#') && normalizedPath(item.href) === path) return false;
      if (labels.has(item.label) || (item.href && targets.has(item.href))) return false;
      labels.add(item.label); if (item.href) targets.add(item.href); return true;
    }).slice(0,3);
  };
  if (Array.isArray(context.override)) return unique(context.override);
  if (/^\/umfragen\/[^/]+\/?$/.test(path)) {
    const visibility = context.poll?.visibility;
    const resultAnswer = visibility === 'always' ? 'Die Ergebnisse dieser Umfrage sind sofort sichtbar, auch ohne eigene Stimme.' : visibility === 'after_end' ? 'Die Ergebnisse dieser Umfrage werden erst nach ihrem Ende angezeigt.' : visibility === 'after_vote' ? 'Wähle eine Antwort und klicke auf „Abstimmen“. Danach siehst Du die Stimmenzahlen und Prozentwerte. Ein Kommentar ist dafür nicht erforderlich.' : 'Der Abstimmungsbereich zeigt Dir, ab wann die Ergebnisse dieser Umfrage sichtbar sind.';
    return unique([
      {label:'Wann kann ich die Ergebnisse sehen?', answer:resultAnswer, tag:'Ergebnisse'},
      context.poll?.feedback === true
        ? {label:'Ist mein Feedback öffentlich und muss ich kommentieren?', answer:'Nein. Feedback ist freiwillig, bleibt intern und wird mit Deiner anonymen Stimme verknüpft. Du kannst bis zu 1.500 Zeichen senden. Deine Abstimmung zählt auch ohne Kommentar.', tag:'Feedback'}
        : {label:'Brauche ich für die Abstimmung ein Konto?', answer:'Nein. Du musst weder Namen noch E-Mail-Adresse angeben. Eine zufällige Browserkennung hilft, einfache Mehrfachabstimmungen zu verhindern.', href:'#datenschutz', tag:'Teilnahme'},
      {label:'Ist das Ergebnis repräsentativ?', answer:'Nein. Es bildet die abgegebenen Stimmen der Teilnehmenden ab, nicht die Meinung der gesamten Bevölkerung oder der gesamten angesprochenen Zielgruppe.', tag:'Einordnung'},
    ]);
  }
  const exact = PAGE_QUESTIONS[path === '/buch.html' ? '/buch/' : path];
  if (exact) return unique(exact);
  const primary = normalizedText(`${path} ${context.title || ''}`);
  const secondary = normalizedText(context.headings || '');
  const contains=(text,term)=>term.length<=4?new RegExp(`(^|[^a-z0-9])${term}(?=$|[^a-z0-9])`).test(text):text.includes(term);
  const ranked = QUESTION_TOPICS.map((topic,index) => ({topic,index,score:topic.terms.reduce((sum,term) => sum + (contains(primary,term) ? 10 : contains(secondary,term) ? 1 : 0),0)}))
    .filter(match => match.score >= 10).sort((a,b) => b.score-a.score || a.index-b.index);
  // Only the strongest substantive topic; no broad full-body/footer keyword search.
  const topicQuestions = ranked[0]?.topic.questions || [];
  return unique([...(context.pageQuestions || []), ...(context.glossaryQuestions || []), ...topicQuestions]);
}

function textNode(doc, tag, text, className) {
  const node=doc.createElement(tag); node.textContent=text;
  if(className) node.className=className; return node;
}
export function mountContextualQuestions(doc, path) {
  const main=doc.querySelector('main');
  if(!main || main.querySelector('.related-questions-block')) return null;
  const noindex=/noindex/i.test(doc.querySelector('meta[name="robots"]')?.content || '') || !!doc.querySelector('meta[http-equiv="refresh" i]');
  if(noindex || doc.documentElement.lang==='en') return null;
  // Ignore headings in related cards, navigation, forms, menus and utility blocks.
  const headings=Array.from(main.querySelectorAll('h2,h3,summary')).filter(node=>!node.closest('nav,form,aside,[data-search-exclude],.related-questions-block,#poll-ui,#poll-share,.hero-actions,.card-grid,.related-content,.related-terms'));
  const title=main.querySelector('h1')?.textContent.trim() || doc.title;
  const anchor=node=>{if(!node.id){let n=1;while(doc.getElementById(`page-question-answer-${n}`))n++;node.id=`page-question-answer-${n}`;}return `#${encodeURIComponent(node.id)}`;};
  const pageQuestions=headings.filter(node=>/\?\s*$/.test(node.textContent.trim()) && node.textContent.trim().length>12 && node.textContent.trim()!==title).slice(0,3).map(node=>q(node.textContent.trim(),anchor(node),'Auf dieser Seite'));
  const glossaryQuestions=[];
  if(/^\/begriffe\/[^/]+\/?$/.test(normalizedPath(path))){
    const definition=doc.getElementById('term-summary-title');
    if(definition)glossaryQuestions.push(q(`Was bedeutet „${title}“?`,anchor(definition),'Definition'));
    const distinction=headings.find(node=>/^Abgrenzung$/i.test(node.textContent.trim()));
    if(distinction)glossaryQuestions.push(q(`Wovon ist „${title}“ abzugrenzen?`,anchor(distinction),'Abgrenzung'));
  }
  let override;
  const editorial=main.querySelector('script[type="application/json"][data-page-questions]');
  if(editorial){try{override=JSON.parse(editorial.textContent);}catch{return null;}}
  const questions=selectContextualQuestions({path,title,headings:headings.map(n=>n.textContent).join(' '),pageQuestions,glossaryQuestions,override,noindex,lang:doc.documentElement.lang,poll:{visibility:main.dataset.pollResultsVisibility,feedback:main.dataset.pollFeedbackEnabled==='true'}});
  if(!questions.length)return null;
  const section=doc.createElement('aside');section.className='section related-questions-block';section.dataset.contextualQuestions='page-aware-v1';section.dataset.searchExclude='';section.setAttribute('aria-labelledby','contextual-related-questions-title');
  const header=doc.createElement('div');header.className='related-question-header';
  const h2=textNode(doc,'h2',questionHeading(normalizedPath(path)));h2.id='contextual-related-questions-title';
  header.append(textNode(doc,'p','Weiterdenken','hero-kicker'),h2);
  const grid=doc.createElement('div');grid.className='related-question-grid';
  for(const item of questions){
    const card=doc.createElement('article');card.className='related-question-card';
    card.append(textNode(doc,'span',item.tag || 'Frage'),textNode(doc,'strong',item.label));
    if(item.answer)card.append(textNode(doc,'p',item.answer));
    if(item.href){
      const link=textNode(doc,'a',item.href.startsWith('#')?'Antwort auf dieser Seite lesen':'Antwort lesen','text-link');link.setAttribute('href',item.href);
      link.setAttribute('aria-label',`Antwort lesen: ${item.label}`);
      link.addEventListener('click',()=>{if(item.href.startsWith('#')){let target=doc.getElementById(decodeURIComponent(item.href.slice(1)));while(target){if(target.tagName==='DETAILS')target.open=true;target=target.parentElement;}}});
      card.append(link);
    }
    grid.append(card);
  }
  section.append(header,grid);main.append(section);return section;
}
