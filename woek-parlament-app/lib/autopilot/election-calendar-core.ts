const stateIds: Record<string, string> = {
  "Baden-Württemberg": "DE-BW", Bayern: "DE-BY", Berlin: "DE-BE", Brandenburg: "DE-BB",
  Bremen: "DE-HB", Hamburg: "DE-HH", Hessen: "DE-HE", "Mecklenburg-Vorpommern": "DE-MV",
  Niedersachsen: "DE-NI", "Nordrhein-Westfalen": "DE-NW", "Rheinland-Pfalz": "DE-RP", Saarland: "DE-SL",
  Sachsen: "DE-SN", "Sachsen-Anhalt": "DE-ST", "Schleswig-Holstein": "DE-SH", Thüringen: "DE-TH",
};

function textCells(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(?:td|th|tr|li|p|div|h\d)>/gi, "\n").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&")
    .split(/\n+/).map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean);
}

export function parseOfficialStateElectionDates(html: string) {
  const rows = textCells(html);
  const found: Array<{ jurisdiction_id: string; election_date: string; election_type: string }> = [];
  let year: string | null = null;
  for (let index = 0; index < rows.length; index += 1) {
    const yearMatch = rows[index].match(/^(20\d{2})$/);
    if (yearMatch) { year = yearMatch[1]; continue; }
    const date = rows[index].match(/^(\d{2})\.(\d{2})\.?$/);
    if (!date || !year) continue;
    const following = rows.slice(index + 1, index + 4);
    const state = following.find((value) => Object.hasOwn(stateIds, value));
    const electionType = following.join(" | ").match(/(Landtagswahl|Wahl zum Abgeordnetenhaus|Bürgerschaftswahl)/)?.[1];
    if (!state || !electionType) continue;
    found.push({ jurisdiction_id: stateIds[state], election_date: `${year}-${date[2]}-${date[1]}`, election_type: electionType });
  }
  return found;
}
