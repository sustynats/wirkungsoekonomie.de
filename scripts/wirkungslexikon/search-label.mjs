export const potentialSnippetGuard='    if (String(entry.url || "").startsWith("/wirkungslexikon/") && String(entry.description || "").startsWith("Wirkungspotenzial:")) return entry.description;';
export function patchSearch(text){
 const needle='  function makeSnippet(entry, rawQuery) {';
 if(!text.includes(needle))throw Error('Globale Suchdarstellung geändert; Wirkungspotenzial-Label muss erneut geprüft werden');
 if(!text.includes(potentialSnippetGuard))text=text.replace(needle,needle+'\n'+potentialSnippetGuard);
 // Reuse the host's knowledge groups; otherwise matching lexicon pages compete
 // with every archive entry in the four-item catch-all group.
 const group='    { id: "wirkungslexikon", label: i18n("Wirkungslexikon", "Political language lexicon"), max: 4 },';
 const classify='    if (String(entry.url || "").startsWith("/wirkungslexikon/")) return "wirkungslexikon";';
 const badge='    if (groupId === "wirkungslexikon") return entry.type === "Wirkungskarte" ? "Wirkungskarte" : "Wirkungslexikon";';
 for(const [marker,anchor] of [[group,'  const SEARCH_GROUPS = ['],['    wirkungslexikon: 135,','  const GROUP_SCORE_BONUS = {'],[classify,'  function classifyEntry(entry) {'],[badge,'  function getDisplayBadge(entry, groupId) {']]){
  if(text.includes(marker))continue;if(!text.includes(anchor))throw Error('Globale Suchgruppen geändert; Lexikoneinbindung erneut prüfen');text=text.replace(anchor,anchor+'\n'+marker);
 }
 return text;
}
