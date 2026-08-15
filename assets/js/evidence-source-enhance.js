(function () {
  const checked = "22.05.2026";
  const fallback = {
    link: "../content/sources/evidence-source-registry.json",
    label: "Quellenregister",
    not: "keine eigenständige WÖk-Bewertung und keine finale Scorecard",
  };
  const sources = [
    { match: "Donella Meadows", link: "https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/", label: "Donella Meadows Project", not: "keine WÖk-Bewertungsformel und keine politische Rückkopplungsarchitektur" },
    { match: "Europäische Union · CSRD", link: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32022L2464", label: "EUR-Lex CSRD", not: "keine positive Netto-Wirkung und keine WÖk-Zertifizierung" },
    { match: "EFRAG · ESRS", link: "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32023R2772", label: "EUR-Lex ESRS", not: "keine WÖk-Scorecard und keine Rückkopplungsentscheidung" },
    { match: "EU-Taxonomie", link: "https://eur-lex.europa.eu/eli/reg/2020/852/oj/deu", label: "EUR-Lex EU-Taxonomie", not: "keine vollständige Netto-Wirkung für Mensch, Planet und Demokratie" },
    { match: "Vereinte Nationen · Agenda 2030", link: "https://sdgs.un.org/2030agenda", label: "UN Agenda 2030", not: "SDG+ ist WÖk-Erweiterung und keine offizielle UN-Kategorie" },
    { match: "Rockström", link: "https://www.stockholmresilience.org/research/planetary-boundaries.html", label: "Stockholm Resilience Centre", not: "keine soziale oder demokratische Gesamtbewertung" },
    { match: "Kate Raworth", link: "https://www.kateraworth.com/doughnut/", label: "Doughnut Economics", not: "keine konkrete Steuer- und Rückkopplungsarchitektur der WÖk" },
    { match: "Reuters Institute", link: "https://reutersinstitute.politics.ox.ac.uk/digital-news-report", label: "Reuters Institute Digital News Report", not: "keine Einzelfallanalyse politischer Frames" },
    { match: "OECD", link: "https://www.oecd.org/governance/trust-in-government/", label: "OECD Trust", not: "keine Bewertung einzelner Parteien oder Aussagen" },
    { match: "Eurostat", link: "https://ec.europa.eu/eurostat", label: "Eurostat", not: "keine produkt- oder organisationsspezifische Lieferkettenwirkung" },
    { match: "UBA", link: "https://www.umweltbundesamt.de/daten", label: "Umweltbundesamt Daten", not: "keine vollständige soziale oder demokratische Bewertung" },
    { match: "Open Food Facts", link: "https://world.openfoodfacts.org/", label: "Open Food Facts", not: "keine geprüfte vollständige Lieferkettenwirkung" },
    { match: "Norbert Wiener", link: "https://mitpress.mit.edu/9780262730099/cybernetics/", label: "MIT Press", not: "keine normative Wirkungsbewertung und keine SDG-Logik" },
    { match: "Stafford Beer", link: "https://www.worldcat.org/search?q=Stafford+Beer+Brain+of+the+Firm", label: "Bibliografischer Nachweis", not: "kein SDG-Referenzrahmen und keine WÖk-Bewertung" },
    { match: "Adam Smith", link: "https://oll.libertyfund.org/title/smith-an-inquiry-into-the-nature-and-causes-of-the-wealth-of-nations-cannan-ed-in-2-vols", label: "Online Library of Liberty", not: "keine Lösung moderner externer Wirkungen" },
    { match: "Schumpeter", link: "https://www.worldcat.org/search?q=Joseph+Schumpeter+Capitalism+Socialism+and+Democracy", label: "Bibliografischer Nachweis", not: "keine Schutzregel für kritische Schäden" },
    { match: "Drucker", link: "https://www.worldcat.org/search?q=Peter+Drucker+Management+Tasks+Responsibilities+Practices", label: "Bibliografischer Nachweis", not: "keine wirkungsökonomische Bewertungsmethodik" },
    { match: "Habermas", link: "https://www.suhrkamp.de/buch/juergen-habermas-strukturwandel-der-oeffentlichkeit-t-9783518284898", label: "Suhrkamp", not: "keine digitale Plattformlogik und keine WÖk-Sprachanalyse" },
    { match: "Natalie Weber", link: "../buch.html", label: "Buchseite", not: "konkrete Zahlen bleiben Modellstand, sofern nicht gesondert freigegeben" },
  ];

  function resolveSource(card) {
    const title = card.querySelector("h3")?.textContent || "";
    return sources.find((source) => title.includes(source.match)) || fallback;
  }

  document.querySelectorAll("article.source-card").forEach((card) => {
    const source = resolveSource(card);
    const hasLink = Boolean(card.querySelector("a")) || card.textContent.includes("Abruf");
    if (!hasLink) {
      const paragraph = document.createElement("p");
      paragraph.className = "source-card-meta";
      paragraph.innerHTML = `<strong>Link / Abruf:</strong> <a href="${source.link}">${source.label}</a> · Abruf: ${checked}`;
      card.append(paragraph);
    }
    if (!card.textContent.includes("Was nicht")) {
      const paragraph = document.createElement("p");
      paragraph.className = "source-card-meta";
      paragraph.innerHTML = `<strong>Was nicht gestützt wird:</strong> ${source.not}`;
      card.append(paragraph);
    }
  });
})();
