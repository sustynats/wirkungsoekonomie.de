export const potentialSnippetGuard='    if (String(entry.url || "").startsWith("/wirkungslexikon/") && String(entry.description || "").startsWith("Wirkungspotenzial:")) return entry.description;';
export function patchSearch(text){
 if(text.includes(potentialSnippetGuard))return text;
 const needle='  function makeSnippet(entry, rawQuery) {';
 if(!text.includes(needle))throw Error('Globale Suchdarstellung geändert; Wirkungspotenzial-Label muss erneut geprüft werden');
 return text.replace(needle,needle+'\n'+potentialSnippetGuard);
}
