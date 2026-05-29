import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "assets/data/term-registry.json");
const glossaryDir = path.join(root, "content/glossar");
const sourcesPath = path.join(glossaryDir, "glossar-quellen.md");
const backlinkAuditPath = path.join(glossaryDir, "glossar-backlink-audit.json");
const processPath = path.join(glossaryDir, "glossar-publizierungsprozess.md");

const today = "2026-05-29";

function slugify(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\([^)]*\)/g, "")
    .split("/")[0]
    .trim()
    .toLocaleLowerCase("de")
    .replace(/&/g, " und ")
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
}

const categoryTags = {
  "Psychologische Wirkmechanismen": ["Psychologie", "Medienwirkung", "Resonanzraum", "Wirkungspotenzial", "Wirkungsrisiko", "Demokratie"],
  "Systemtheorie, Kybernetik und Konstruktivismus": ["Systemtheorie", "Kybernetik", "Konstruktivismus", "Rückkopplung", "Resonanzraum", "Wirkungsarchitektur"],
  "Management, Wirksamkeit und Organisation": ["Management", "Organisation", "Wirksamkeit", "Wirkungssteuerung", "Transformation"],
  "Innovation, Evolution und Unternehmertum": ["Innovation", "Evolution", "Unternehmertum", "Transformation", "Wirkungsinnovation"],
  "Daoismus, Prozessdenken und Nicht-Erzwingen": ["Prozessdenken", "Selbstorganisation", "Resonanz", "Wirkungsarchitektur"],
  "Klima, Lebenszyklus und ökologische Wirkung": ["Klima", "Lebenszyklus", "Produktwirkung", "LCA", "Planet", "Wirkungsrisiko"],
  "Design, Geschäftsmodelle und Wertversprechen": ["Design", "Geschäftsmodell", "Innovation", "Wertversprechen", "Wirkungspotenzial"],
  "Physik, Energie und Wirkungsmetaphern": ["Energie", "Systemgrenze", "Metapher", "Wirkungsanalyse", "Wirkungssteuerung"],
  "Glossar-Publizierungsprozess": ["Glossar", "Publizierungsprozess", "Qualitätssicherung", "Quellen", "Backlinks"],
  "Vordenker:innen und Bezugslinien": ["Vordenker", "Bezugslinie", "Einordnung", "Abgrenzung", "Wirkungsökonomie"],
  "Werte, Normativität und Bewertung": ["Werte", "Normativität", "Bewertung", "Wirkungswert", "Mensch, Planet und Demokratie"],
  "Kapital, Markt und Eigentum": ["Kapital", "Markt", "Eigentum", "Externalisierung", "Wirkungsverantwortung"],
  "Sprache, Wirklichkeit und Kommunikation": ["Sprache", "Kommunikation", "Wahrheit", "Wirklichkeit", "Resonanzraum"],
  "Ethik, Würde und Verantwortung": ["Ethik", "Menschenwürde", "Verantwortung", "Nichtkompensation", "Rechtsstaatlichkeit"],
  "Management, Organisation und Wirksamkeit": ["Management", "Organisation", "Wirksamkeit", "Wirkungssteuerung", "Transformation"],
  "Transformation, Innovation und wirtschaftliche Entwicklung": ["Transformation", "Innovation", "Wohlstand", "Entwicklung", "Wirkungsinnovation"],
  "Wirtschaftssysteme, Kapitalmythen und Verteilungslogiken": ["Wirtschaftssystem", "Kapital", "Verteilung", "Macht", "Wirkungsprüfung"],
  "Feminismus, feministische Ökonomie und Care-Wirkung": ["Feminismus", "Care", "Gleichwertigkeit", "Teilhabe", "Gender Data", "Wirkungswert"],
  "Liberalismus, Libertarismus, Neoklassik und Marktbegriffe": ["Liberalismus", "Freiheit", "Libertarismus", "Neoklassik", "Markt", "Externalität", "Wirklichkeitsbindung"],
  "Akteure, Einfluss, Ideologien und demokratische Wirkungsräume": ["Akteure", "Einfluss", "Lobbyismus", "Thinktanks", "NGO", "Demokratie", "Grundgesetz"],
  "Faschismus, faschistoid und autoritäre Wirkungsrisiken": ["Faschismus", "faschistoid", "Autoritarismus", "Autokratie", "Totalitarismus", "demokratische Erosion", "Wirkungsrisiko"],
  "Hannah Arendt und politische Wirkungsbegriffe": ["Hannah Arendt", "Pluralität", "öffentlicher Raum", "Handeln", "Urteilskraft", "Totalitarismus"],
  "Staat, Regierung, Verwaltung und Gesellschaft": ["Staat", "Regierung", "Verwaltung", "Gesellschaft", "Verfassung", "Gewaltenteilung", "Institutionen"],
  "Autokratien, Regimeformen und demokratische Erosion": ["Autokratie", "Regimeform", "Diktatur", "Hybridregime", "Rechtsstaatsabbau", "Propaganda", "Machtkonzentration"],
  "Kreislaufwirtschaft, Circular Design und Materialkreisläufe": ["Kreislaufwirtschaft", "Circular Design", "Produktlebenszyklus", "Materialkreisläufe", "Planet"],
  "Neuropsychologische Wirkmechanismen": ["Neuropsychologie", "Wahrnehmung", "Aufmerksamkeit", "Emotion", "Resonanz"],
  "Quantenphysik, Quantenmaterialien und Zukunftstechnologien": ["Quantenphysik", "Zukunftstechnologie", "Materialien", "Photovoltaik", "Innovation"],
  "Energie, Strommarkt und Systemkosten": ["Energie", "Strommarkt", "Systemkosten", "Netze", "Flexibilität"],
  "Batterien, Ladeinfrastruktur, Netzanschluss und Energiespeicher": ["Batterien", "Speicher", "Ladeinfrastruktur", "Netzanschluss", "Elektromobilität", "Kreislaufwirtschaft"],
};

const conceptStatusMap = {
  core: "WÖk-Kernbegriff",
  precision: "WÖk-Präzisierungsbegriff",
  connection: "Anschlussbegriff",
  method: "Methodenbegriff",
  sourceLine: "Quellen-/Bezugslinienbegriff",
  thinker: "Vordenker-/Bezugslinienbegriff",
  system: "Wirtschaftssystem / Gesellschaftsmodell",
  backlog: "Backlog / Artikel-only",
};

const sourceGroups = {
  system: [
    ["internal_woek", "WÖk Glossar und Referenz", "https://wirkungsoekonomie.de/glossar.html"],
    ["primary", "Stafford Beer: Brain of the Firm", ""],
    ["primary", "Humberto Maturana / Francisco Varela: Autopoiesis and Cognition", ""],
    ["primary", "Heinz von Foerster: Understanding Understanding", ""],
    ["primary", "Donella Meadows: Leverage Points", "https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/"],
  ],
  management: [
    ["primary", "Peter Drucker: The Effective Executive", ""],
    ["institutional", "Drucker Institute", "https://drucker.institute/"],
    ["institutional", "St. Galler Management-Modell", "https://www.sgmm.ch/en/about-the-model/history/"],
    ["secondary", "Malik Management", "https://www.malik-management.com/"],
  ],
  innovation: [
    ["primary", "Joseph A. Schumpeter: Theorie der wirtschaftlichen Entwicklung", ""],
    ["primary", "Joseph A. Schumpeter: Capitalism, Socialism and Democracy", ""],
    ["primary", "Nikolai Kondratieff: The Long Waves in Economic Life", ""],
    ["secondary", "EconStor", "https://www.econstor.eu/"],
  ],
  dao: [
    ["secondary", "Alan Watts: Taoist Way / Taoismus-Vorträge", ""],
    ["article_context_only", "Daoismus als philosophische Bezugslinie der Wirkungsökonomie", ""],
  ],
  climate: [
    ["institutional", "IPCC AR6 Glossary", "https://www.ipcc.ch/report/ar6/syr/downloads/report/IPCC_AR6_SYR_Annex-I.pdf"],
    ["institutional", "IPCC WGII", "https://www.ipcc.ch/report/ar6/wg2/"],
    ["institutional", "EU JRC Life Cycle Assessment", "https://eplca.jrc.ec.europa.eu/lifecycleassessment.html"],
    ["institutional", "EU Product Environmental Footprint", "https://eplca.jrc.ec.europa.eu/EnvironmentalFootprint.html"],
    ["institutional", "ISO 14040", "https://www.iso.org/standard/37456.html"],
    ["institutional", "GHG Protocol Product Life Cycle Standard", "https://ghgprotocol.org/sites/default/files/standards/Product-Life-Cycle-Accounting-Reporting-Standard_041613.pdf"],
    ["institutional", "JEC Well-to-Wheels", "https://joint-research-centre.ec.europa.eu/welcome-jec-website/jec-activities/well-wheels-analyses_en"],
    ["institutional", "Cradle to Cradle Certified", "https://c2ccertified.org/the-standard"],
  ],
  design: [
    ["institutional", "IDEO Design Thinking", "https://designthinking.ideo.com/"],
    ["institutional", "Stanford d.school", "https://dschool.stanford.edu/"],
    ["institutional", "Strategyzer Business Model Canvas", "https://www.strategyzer.com/library/the-business-model-canvas"],
    ["institutional", "Strategyzer Value Proposition Canvas", "https://www.strategyzer.com/library/the-value-proposition-canvas"],
  ],
  capital: [
    ["primary", "Adam Smith: The Theory of Moral Sentiments", ""],
    ["primary", "Adam Smith: An Inquiry into the Nature and Causes of the Wealth of Nations", ""],
    ["primary", "Karl Marx: Das Kapital", ""],
    ["primary", "Karl Polanyi: The Great Transformation", ""],
    ["primary", "Friedrich Hayek: The Use of Knowledge in Society", ""],
    ["primary", "John Maynard Keynes: The General Theory", ""],
  ],
  ethics: [
    ["primary", "Immanuel Kant: Grundlegung zur Metaphysik der Sitten", ""],
    ["primary", "Immanuel Kant: Kritik der praktischen Vernunft", ""],
    ["primary", "Hannah Arendt: Vita activa / The Human Condition", ""],
    ["primary", "Amartya Sen: Development as Freedom", ""],
    ["primary", "Martha Nussbaum: Creating Capabilities", ""],
    ["institutional", "Grundgesetz Art. 1 und Art. 20a", "https://www.gesetze-im-internet.de/gg/"],
  ],
  communication: [
    ["primary", "Ludwig Wittgenstein: Philosophische Untersuchungen", ""],
    ["primary", "Paul Watzlawick / Janet Beavin / Don Jackson: Pragmatics of Human Communication", ""],
    ["primary", "Paul Watzlawick: Die erfundene Wirklichkeit", ""],
    ["primary", "Ernst von Glasersfeld: Radical Constructivism", ""],
    ["primary", "Humberto Maturana / Francisco Varela: Autopoiesis and Cognition", ""],
  ],
  systems2: [
    ["primary", "Heinz von Foerster: Understanding Understanding", ""],
    ["primary", "Stafford Beer: Brain of the Firm", ""],
    ["primary", "Gregory Bateson: Steps to an Ecology of Mind", ""],
    ["primary", "Niklas Luhmann: Soziale Systeme", ""],
    ["primary", "Frederic Vester: Die Kunst vernetzt zu denken", ""],
    ["primary", "Donella Meadows: Thinking in Systems", ""],
    ["primary", "Donella Meadows: Leverage Points", "https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/"],
  ],
  management2: [
    ["primary", "Peter Drucker: The Practice of Management", ""],
    ["primary", "Peter Drucker: Management: Tasks, Responsibilities, Practices", ""],
    ["primary", "Hans Ulrich: Die Unternehmung als produktives soziales System", ""],
    ["institutional", "St. Galler Management-Modell", "https://www.sgmm.ch/en/about-the-model/history/"],
    ["primary", "Fredmund Malik: Führen Leisten Leben", ""],
  ],
  transformation: [
    ["primary", "Maja Göpel: Unsere Welt neu denken", ""],
    ["primary", "Kate Raworth: Doughnut Economics", ""],
    ["primary", "Mariana Mazzucato: Mission Economy", ""],
    ["institutional", "Wellbeing Economy Alliance", "https://weall.org/"],
    ["institutional", "OECD Measuring Well-being and Progress", "https://www.oecd.org/wise/measuring-well-being-and-progress.htm"],
    ["institutional", "Stockholm Resilience Centre: Planetary Boundaries", "https://www.stockholmresilience.org/research/planetary-boundaries.html"],
  ],
  economicSystems: [
    ["primary", "Adam Smith: The Theory of Moral Sentiments", ""],
    ["primary", "Adam Smith: The Wealth of Nations", ""],
    ["primary", "Karl Marx: Das Kapital", ""],
    ["primary", "Karl Polanyi: The Great Transformation", ""],
    ["primary", "Friedrich Hayek: The Use of Knowledge in Society", ""],
    ["primary", "John Maynard Keynes: The General Theory", ""],
    ["academic", "Gøsta Esping-Andersen: The Three Worlds of Welfare Capitalism", ""],
    ["institutional", "Nordic Council: Nordic Welfare Model", "https://www.norden.org/en/information/nordic-welfare-model"],
    ["primary", "Maja Göpel: Unsere Welt neu denken", ""],
    ["primary", "Maja Göpel: Werte. Ein Kompass für die Zukunft", ""],
  ],
  feministEconomics: [
    ["primary", "Marilyn Waring: If Women Counted", ""],
    ["primary", "Nancy Fraser: Cannibal Capitalism / Crisis of Care", ""],
    ["primary", "Silvia Federici: Revolution at Point Zero", ""],
    ["primary", "Silvia Federici: Caliban and the Witch", ""],
    ["academic", "Diane Elson: Gender Budgeting / feminist economics", ""],
    ["primary", "Julie A. Nelson: Feminism, Objectivity and Economics", ""],
    ["primary", "Caroline Criado Perez: Invisible Women", ""],
    ["institutional", "ILO: Care Work and Care Jobs for the Future of Decent Work", "https://www.ilo.org/global/publications/books/WCMS_633135/lang--en/index.htm"],
    ["institutional", "UN Women: unpaid care work / gender equality", "https://www.unwomen.org/en"],
    ["institutional", "OECD: unpaid care work / gender data", "https://www.oecd.org/gender/"],
    ["institutional", "Destatis: Gender Pay Gap / Gender Care Gap / Gender Pension Gap", "https://www.destatis.de/"],
    ["institutional", "BMFSFJ: Gleichstellung, Gender Care Gap, Gender Pension Gap", "https://www.bmfsfj.de/"],
    ["primary", "Elinor Ostrom: Governing the Commons", ""],
    ["primary", "Kate Raworth: Doughnut Economics", ""],
    ["primary", "Amartya Sen / Martha Nussbaum: Capability Approach", ""],
  ],
  platformCapitalism: [
    ["primary", "Shoshana Zuboff: The Age of Surveillance Capitalism", ""],
    ["primary", "Nick Srnicek: Platform Capitalism", ""],
  ],
  trickleDown: [
    ["secondary", "Investopedia: Trickle-Down Economics", "https://www.investopedia.com/terms/t/trickledowntheory.asp"],
    ["institutional", "IMF: Inequality and Growth", "https://www.imf.org/external/pubs/ft/sdn/2014/sdn1402.pdf"],
    ["academic", "Hope / Limberg: The economic consequences of major tax cuts for the rich", "https://doi.org/10.1093/ser/mwab061"],
  ],
  liberalMarket: [
    ["primary", "John Locke: Two Treatises of Government", ""],
    ["primary", "John Stuart Mill: On Liberty", ""],
    ["primary", "Isaiah Berlin: Two Concepts of Liberty", ""],
    ["primary", "Amartya Sen: Development as Freedom", ""],
    ["primary", "Friedrich Hayek: The Road to Serfdom", ""],
    ["primary", "Friedrich Hayek: The Use of Knowledge in Society", ""],
    ["primary", "Robert Nozick: Anarchy, State, and Utopia", ""],
    ["primary", "Milton Friedman: Capitalism and Freedom", ""],
    ["primary", "Alfred Marshall: Principles of Economics", ""],
    ["primary", "William Stanley Jevons: Theory of Political Economy", ""],
    ["primary", "Léon Walras: Elements of Pure Economics", ""],
    ["primary", "Vilfredo Pareto: Manual of Political Economy", ""],
    ["primary", "Paul Samuelson: Foundations of Economic Analysis", ""],
    ["academic", "Kenneth Arrow / Gérard Debreu: general equilibrium", ""],
    ["primary", "Arthur Pigou: The Economics of Welfare", ""],
    ["primary", "Ronald Coase: The Problem of Social Cost", ""],
    ["academic", "George Akerlof: The Market for Lemons", ""],
    ["academic", "Joseph Stiglitz: Information asymmetry", ""],
    ["primary", "Walter Eucken: Grundlagen der Nationalökonomie / Ordnungspolitik", ""],
    ["primary", "Ludwig von Mises: Human Action", ""],
  ],
  actorsInfluence: [
    ["institutional", "OECD Recommendation on Transparency and Integrity in Lobbying and Influence", "https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0379"],
    ["institutional", "OECD Policy Brief Lobbying", "https://www.oecd.org/content/dam/oecd/en/about/programmes/grc/grc-see/integrity/Policy_Brief_Note_Lobbying.pdf"],
    ["institutional", "EU Transparency Register", "https://commission.europa.eu/about/service-standards-and-principles/transparency/transparency-register_en"],
    ["institutional", "European Parliamentary Research Service / Think Tank", "https://www.europarl.europa.eu/thinktank/"],
    ["institutional", "Mandate for Leadership / Project 2025", "https://www.mandateforleadership.org/"],
    ["institutional", "Atlas Network", "https://www.atlasnetwork.org/"],
    ["institutional", "United Nations: The UN and Civil Society", "https://www.un.org/en/get-involved/un-and-civil-society"],
    ["institutional", "UN ECOSOC NGO consultative status", "https://ecosoc.un.org/en/ngo"],
    ["institutional", "Grundgesetz für die Bundesrepublik Deutschland", "https://www.gesetze-im-internet.de/gg/"],
    ["institutional", "Bundesverfassungsgericht Klimabeschluss 2021", "https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2021/03/rs20210324_1bvr265618.html"],
    ["institutional", "Bundeszentrale für politische Bildung: Rassismus", "https://www.bpb.de/kurz-knapp/lexika/lexikon-in-einfacher-sprache/322448/rassismus/"],
    ["institutional", "Bundeszentrale für politische Bildung: Faschismus", "https://www.bpb.de/themen/rechtsextremismus/dossier-rechtsextremismus/500776/faschismus/"],
    ["institutional", "Bundeszentrale für politische Bildung: Rechtsextremismus / Rassismus / Faschismus", "https://www.bpb.de/themen/rechtsextremismus/"],
    ["institutional", "Bundeszentrale für politische Bildung: Konservatismus", "https://www.bpb.de/kurz-knapp/lexika/politiklexikon/17742/konservatismus/"],
    ["internal_woek", "Interne WÖk-Quelle: Politik als Wirkungsraum, Parteien und Programme, Lobbyismus und Machtkonzentration", ""],
  ],
  democraticRisk: [
    ["institutional", "Encyclopaedia Britannica: Fascism", "https://www.britannica.com/topic/fascism"],
    ["institutional", "Bundeszentrale für politische Bildung: Faschismus", "https://www.bpb.de/themen/rechtsextremismus/dossier-rechtsextremismus/500776/faschismus/"],
    ["primary", "Robert O. Paxton: The Anatomy of Fascism", ""],
    ["primary", "Roger Griffin: The Nature of Fascism", ""],
    ["primary", "Umberto Eco: Ur-Fascism", ""],
    ["institutional", "Duden: faschistoid", "https://www.duden.de/rechtschreibung/faschistoid"],
    ["institutional", "Bundeszentrale für politische Bildung: Autoritäre Politik, Autokratie, Totalitarismus", "https://www.bpb.de/"],
    ["institutional", "V-Dem: Regimes of the World", "https://v-dem.net/"],
    ["primary", "Hannah Arendt: Vita activa / The Human Condition", ""],
    ["primary", "Hannah Arendt: Elemente und Ursprünge totaler Herrschaft", ""],
    ["primary", "Hannah Arendt: Eichmann in Jerusalem", ""],
    ["primary", "Hannah Arendt: Macht und Gewalt", ""],
    ["academic", "Stanford Encyclopedia of Philosophy: Hannah Arendt", "https://plato.stanford.edu/entries/arendt/"],
    ["institutional", "Grundgesetz für die Bundesrepublik Deutschland", "https://www.gesetze-im-internet.de/gg/"],
    ["institutional", "Bundesregierung: Aufbau und Aufgaben der Bundesregierung", "https://www.bundesregierung.de/breg-de/bundesregierung"],
    ["institutional", "Bundeszentrale für politische Bildung: Staat, Regierung, Demokratie, Rechtsstaat", "https://www.bpb.de/"],
    ["institutional", "Bundesverfassungsgericht Klimabeschluss 2021", "https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2021/03/rs20210324_1bvr265618.html"],
    ["internal_woek", "Interne WÖk-Quellen: Folgencheck statt Faktencheck, Wirkung politischer Sprache, Demokratie als Wirkungsraum, Wirkungsarchitektur, Wirkungsrat, WStG / WUStG", ""],
  ],
  circular: [
    ["institutional", "Ellen MacArthur Foundation: Circular Economy Principles", "https://www.ellenmacarthurfoundation.org/circular-economy-principles"],
    ["institutional", "Ellen MacArthur Foundation: Butterfly Diagram", "https://www.ellenmacarthurfoundation.org/circular-economy-diagram"],
    ["institutional", "Ellen MacArthur Foundation: The technical cycle", "https://www.ellenmacarthurfoundation.org/articles/the-technical-cycle-of-the-butterfly-diagram"],
    ["primary", "Ellen MacArthur Foundation: Towards the Circular Economy, 2013", ""],
    ["institutional", "Cradle to Cradle Certified", "https://c2ccertified.org/the-standard"],
    ["primary", "McDonough / Braungart: Cradle to Cradle", ""],
    ["institutional", "EU Ecodesign / Digital Product Passport", "https://single-market-economy.ec.europa.eu/news/commission-launches-consultation-digital-product-passport-2025-04-09_en"],
    ["institutional", "EU JRC Life Cycle Assessment", "https://eplca.jrc.ec.europa.eu/lifecycleassessment.html"],
  ],
  neuro: [
    ["primary", "Leon Festinger: A Theory of Cognitive Dissonance", ""],
    ["primary", "Daniel Kahneman: Thinking, Fast and Slow", ""],
    ["academic", "Tversky / Kahneman: Judgment under Uncertainty", ""],
    ["academic", "Pennycook / Rand: The Psychology of Fake News", ""],
    ["academic", "Ecker et al.: Psychological drivers of misinformation belief and resistance to correction", ""],
    ["academic", "Zajonc: Mere Exposure Effect", ""],
    ["academic", "Hasher / Goldstein / Toppino: Frequency and the Conference of Referential Validity", ""],
    ["primary", "Andy Clark: predictive processing / embodied cognition", ""],
  ],
  quantum: [
    ["academic", "APS Reviews of Modern Physics: Colloquium Quantum Batteries", "https://link.aps.org/doi/10.1103/RevModPhys.96.031001"],
    ["academic", "ACS Energy Letters: Perovskite Quantum Dot Solar Cells", "https://pubs.acs.org/doi/abs/10.1021/acsenergylett.3c01983"],
    ["institutional", "CSIRO Quantum Battery Research", "https://research.csiro.au/quantumbattery/research/quantum-batteries/"],
  ],
  energy: [
    ["institutional", "Fraunhofer ISE: Levelized Cost of Electricity", "https://www.ise.fraunhofer.de/en/publications/studies/cost-of-electricity.html"],
    ["institutional", "Fraunhofer ISE LCOE Study 2024 PDF", "https://www.ise.fraunhofer.de/content/dam/ise/en/documents/publications/studies/EN2024_ISE_Study_Levelized_Cost_of_Electricity_Renewable_Energy_Technologies.pdf"],
    ["institutional", "Bundesnetzagentur: Netzentgelte", "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Netzentgelte/start.html"],
    ["institutional", "Bundesnetzagentur Glossar: Netzentgelt", "https://www.bundesnetzagentur.de/SharedDocs/A_Z_Glossar/N/Netzentgelt.html"],
    ["institutional", "Bundesnetzagentur: Redispatch", "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Versorgungssicherheit/Netzengpassmanagement/Engpassmanagement/Redispatch/start.html"],
    ["institutional", "SMARD: So funktioniert der Strommarkt", "https://www.smard.de/page/en/wiki-article/5884/5840/this-is-how-the-electricity-market-works"],
    ["institutional", "IEA Glossary", "https://www.iea.org/glossary"],
    ["institutional", "IEA: Electricity Market Design", "https://www.iea.org/reports/electricity-market-design"],
  ],
  batteryInfrastructure: [
    ["institutional", "Bundesnetzagentur: Öffentliche Ladeinfrastruktur", "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/E-Mobilitaet/start.html"],
    ["institutional", "NOW GmbH: Einfach laden am Depot", "https://www.now-gmbh.de/wp-content/uploads/2023/11/Einfach-laden-am-Depot_Leitfaden.pdf"],
    ["institutional", "VDE: Technischer Leitfaden Ladeinfrastruktur Elektromobilität", "https://www.vde.com/resource/blob/988408/87ed1f99814536d66c99797a4545ad5d/technischer-leitfaden-ladeinfrastruktur-elektromobilitaet---version-4-data.pdf"],
    ["institutional", "BDEW: Anwendungshilfe Netzanschluss von Ladesäulen in der Mittelspannung", "https://www.bdew.de/energie/vnb-anwendungshilfe-ii-netzanschluss-ladesaeulen-mittelspannung/"],
    ["institutional", "VDE FNN: Technische Anschlussregel Mittelspannung VDE-AR-N 4110", "https://www.vde.com/de/fnn/themen/tar/tar-mittelspannung-vde-ar-n-4110"],
    ["institutional", "SMARD: Netzebenen", "https://www.smard.de/page/home/wiki-article/446/214010/netzebenen"],
    ["institutional", "Regulation (EU) 2023/1542 on batteries and waste batteries", "https://eur-lex.europa.eu/eli/reg/2023/1542/oj/eng"],
    ["institutional", "European Commission: Batteries", "https://environment.ec.europa.eu/topics/waste-and-recycling/batteries_en"],
    ["institutional", "VDE Infopapier zur Batterieverordnung", "https://www.vde.com/resource/blob/2308300/0609b56a29220934a4276b673c76c176/download-infopapier-zur-batterieverordnung-data.pdf"],
    ["institutional", "Battery Pass Consortium", "https://thebatterypass.eu/"],
    ["institutional", "Umweltbundesamt: Rotorblattaufbereitung und Recycling", "https://www.umweltbundesamt.de/themen/abfall-ressourcen/produktverantwortung-in-der-abfallwirtschaft/windenergieanlagen/rotorblattaufbereitung-recycling-von"],
    ["institutional", "Umweltbundesamt: Entwicklung von Rückbau- und Recyclingstandards für Rotorblätter", "https://www.umweltbundesamt.de/publikationen/entwicklung-von-rueckbau-recyclingstandards-fuer"],
    ["institutional", "WindEurope: Circularity", "https://windeurope.org/about-wind/circularity/"],
    ["institutional", "WindEurope: Where do wind turbine blades go when they are decommissioned?", "https://windeurope.org/news/where-do-wind-turbine-blades-go-when-they-are-decommissioned/"],
  ],
  scope: [
    ["institutional", "GHG Protocol Corporate Standard", "https://ghgprotocol.org/corporate-standard"],
    ["institutional", "GHG Protocol Scope 3 Standard", "https://ghgprotocol.org/corporate-value-chain-scope-3-standard"],
    ["institutional", "ESRS E1 Climate Change", "https://www.efrag.org/en/sustainability-reporting/esrs"],
    ["institutional", "ISO 14064", "https://www.iso.org/standard/66453.html"],
    ["institutional", "ISO 14067", "https://www.iso.org/standard/71206.html"],
    ["internal_woek", "Interne WÖk-Master-Items zu Scope, PCF, LCA und Wirkungsdaten", ""],
  ],
};

function sources(...groups) {
  return groups.flatMap((group) => Array.isArray(group) ? sources(...group) : (sourceGroups[group] || []));
}

function official(sourceRows) {
  return unique(sourceRows.map(([, label, url]) => url ? `${label}|${url}` : label));
}

function sourceLinks(sourceRows) {
  return sourceRows.map(([source_type, title, url]) => ({ source_type, title, url, status: url ? "linked" : "bibliographic" }));
}

function term({
  id,
  title,
  category,
  concept = "connection",
  publicationStatus = "published",
  short,
  definition,
  woek,
  aliases = [],
  related = [],
  examples = [],
  statusNote = "",
  usage = "",
  sourceGroup = "system",
  reviewStatus = "approved",
  version = "1.0",
  theme = [],
  dimensions = [],
  wirklogik = [],
  applicationFields = [],
  sourceField = [],
  mythos = "",
  woekKlaerung = "",
  blindSpot = "",
  customStatus = "",
}) {
  const slug = id || slugify(title);
  const sourceRows = sources(sourceGroup);
  const conceptStatus = conceptStatusMap[concept] || conceptStatusMap.connection;
  return {
    id: slug,
    termId: slug,
    label: title,
    canonicalLabel: title,
    slug,
    aliases: unique([title, ...aliases]),
    synonyms: unique([title, ...aliases]),
    shortDefinition: short,
    short_definition: short,
    definition,
    longDefinition: definition,
    long_definition: definition,
    woekRelation: woek,
    woek_einordnung: woek,
    examples,
    relatedTerms: unique(related),
    related_terms: unique(related),
    officialSources: official(sourceRows),
    sourceLinks: sourceLinks(sourceRows),
    source_links: sourceLinks(sourceRows),
    internalLinks: [],
    internal_links: [],
    categories: [slugify(category)],
    tags: categoryTags[category] || [],
    category,
    conceptStatus,
    concept_status: conceptStatus,
    publicationStatus,
    publication_status: publicationStatus,
    status: {
      "WÖk-Kernbegriff": "woek-kernbegriff",
      "WÖk-Präzisierungsbegriff": "woek-praezisierungsbegriff",
      "Anschlussbegriff": "anschlussbegriff",
      "Methodenbegriff": "methodenbegriff",
      "Quellen-/Bezugslinienbegriff": "bezugsbegriff",
      "Vordenker-/Bezugslinienbegriff": "vordenker-bezugslinie",
      "Wirtschaftssystem / Gesellschaftsmodell": "wirtschaftssystem-gesellschaftsmodell",
      "Backlog / Artikel-only": "artikel-only",
    }[conceptStatus] || "anschlussbegriff",
    type: customStatus || conceptStatus,
    begriffstyp: customStatus || conceptStatus,
    theme: unique(theme),
    themes: unique(theme),
    dimensions: unique(dimensions),
    wirklogik: unique(wirklogik),
    applicationFields: unique(applicationFields),
    application_fields: unique(applicationFields),
    sourceField: unique(sourceField),
    source_field: unique(sourceField),
    mythos,
    woekKlaerung,
    woek_klaerung: woekKlaerung,
    blindSpot,
    blind_spot: blindSpot,
    version,
    lastReviewed: today,
    last_reviewed: today,
    lastUpdated: today,
    updatedAt: today,
    firstApprovedIn: today,
    reviewStatus,
    source: category,
    sourceDocument: "Glossar-Architektur Wirkmechanismen",
    sourceSection: category,
    hoverDefinition: short,
    statusNote,
    usageNote: usage || "Wirkung, Wirkungspotenzial, Wirkungsrisiko, Wirkmechanismus und eingetretene Wirkung sauber unterscheiden.",
    classicGlossary: publicationStatus === "published",
    showInCategoryGlossary: false,
    pageUrl: `/begriffe/${slug}/`,
    metaTitle: `${title} | Glossar der Wirkungsökonomie`,
    metaDescription: `${short} Wirkungsökonomisch eingeordnet als ${conceptStatus}.`,
    doNotConfuseWith: [],
    relatedDocuments: [],
    preferredUsage: usage,
    deprecatedUsage: [],
    glossaryOrderKey: title,
  };
}

const additions = [
  term({ id: "strukturdeterminiertheit", title: "Strukturdeterminiertheit", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Strukturdeterminiertheit beschreibt, dass ein System auf Impulse gemäß seiner eigenen Struktur, Geschichte und inneren Organisation reagiert.", definition: "Ein System nimmt Impulse nicht neutral auf. Es verarbeitet politische Aussagen, Fakten, Preise, Regeln, Produkte oder Wirkungsdaten nach seiner eigenen Logik.", woek: "Strukturdeterminiertheit erklärt, warum Wirkungsökonomie Resonanzräume, Anschlussfähigkeit, Rückkopplung und Folgencheck braucht.", related: ["strukturelle-kopplung", "autopoiesis", "nichttriviales-system", "resonanzraum", "anschlussfaehigkeit", "wirkungspfad"] }),
  term({ id: "triviale-maschine", title: "Triviale Maschine", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Eine triviale Maschine reagiert auf denselben Input immer mit demselben Output.", definition: "Der Begriff beschreibt ein lineares Modell von Steuerung: gleiche Eingabe, gleiche Ausgabe. Für einfache technische Abläufe kann das nützlich sein.", woek: "Viele Steuerungsmodelle behandeln Gesellschaft, Märkte oder Menschen zu sehr wie triviale Maschinen. Wirkungsökonomisch ist das unzureichend.", related: ["nichttriviale-maschine", "nichttriviales-system", "kybernetik", "rueckkopplung"] }),
  term({ id: "nichttriviale-maschine", title: "Nichttriviale Maschine", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Eine nichttriviale Maschine reagiert abhängig von innerem Zustand, Geschichte und früheren Ausgaben.", definition: "Bei nichttrivialen Maschinen hängt der Output nicht nur vom Input ab. Frühere Erfahrungen, Zustände und Rückkopplungen verändern die Reaktion.", woek: "Gesellschaft, Märkte, Organisationen, Medien und Demokratien müssen als nichttriviale Systeme gelesen werden.", related: ["triviale-maschine", "nichttriviales-system", "strukturdeterminiertheit", "rueckkopplung"] }),
  term({ id: "selbstreferenz", title: "Selbstreferenz", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Selbstreferenz beschreibt, dass ein System sich in seinen Operationen auf sich selbst bezieht.", definition: "Selbstreferenz stabilisiert eigene Unterscheidungen, Routinen und Kriterien. Systeme verarbeiten Umweltreize daher nicht einfach objektiv, sondern aus ihrer eigenen Operationslogik.", woek: "Relevant für Medien, Märkte, Politik, Organisationen und digitale Öffentlichkeiten, wenn externe Fakten an internen Logiken abprallen.", related: ["autopoiesis", "wirklichkeitskonstruktion", "beobachtung-zweiter-ordnung", "strukturdeterminiertheit"] }),
  term({ id: "beobachterabhaengigkeit", title: "Beobachterabhängigkeit", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Beobachterabhängigkeit beschreibt, dass Beobachtungen durch Perspektive, Auswahl, Sprache, Kriterien und Deutungsrahmen geprägt sind.", definition: "Beobachtungen sind nicht beliebig, aber sie sind nie völlig voraussetzungslos. Schon die Wahl von Indikatoren, Grenzen, Kategorien und Vergleichswerten prägt das Ergebnis.", woek: "Wichtig für Faktencheck, Folgencheck, Scorecards und Wirkungsbewertung: Zustandsveränderungen bleiben real, ihre Erfassung braucht transparente Kriterien.", related: ["beobachtung-zweiter-ordnung", "wirklichkeitskonstruktion", "scorecard", "folgencheck"] }),
  term({ id: "kybernetik", title: "Kybernetik", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Kybernetik ist die Wissenschaft von Steuerung, Regelung, Kommunikation und Rückkopplung in Systemen.", definition: "Kybernetik untersucht, wie Systeme Informationen aufnehmen, verarbeiten, steuern, lernen und stabilisieren.", woek: "Die Wirkungsökonomie nutzt kybernetische Grundideen, indem Wirkung nicht nur gemessen, sondern in Preise, Steuern, Kapital, Beschaffung, Förderung und Entscheidungen zurückgekoppelt wird.", related: ["rueckkopplung", "kybernetik-zweiter-ordnung", "wirkungsrueckkopplung", "wirkungsarchitektur"] }),
  term({ id: "kybernetik-zweiter-ordnung", title: "Kybernetik zweiter Ordnung", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Kybernetik zweiter Ordnung betrachtet Beobachter:innen und Steuernde als Teil des Systems.", definition: "Sie fragt nicht nur, wie ein System gesteuert wird, sondern wie Beobachtung und Steuerung selbst Wirkungen erzeugen.", woek: "Relevant für Wirkungsrat, Folgencheck, Governance und demokratische Kontrolle: Wer Wirkung misst, wirkt selbst.", related: ["kybernetik", "beobachtung-zweiter-ordnung", "wirkungsrat", "governance"] }),
  term({ id: "rekursion", title: "Rekursion", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Rekursion beschreibt, dass Strukturen oder Prozesse auf mehreren Ebenen wiederkehren.", definition: "Rekursive Systeme besitzen ähnliche Funktionen auf unterschiedlichen Ebenen, etwa Team, Organisation, Kommune, Land oder Lieferkette.", woek: "Relevant für föderale Wirkung, Unternehmen, Kommunen, Lieferketten und Wirkungsarchitektur.", related: ["viable-system-model", "wirkungsarchitektur", "rueckkopplung"] }),
  term({ id: "varietaet", title: "Varietät", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Varietät beschreibt die Vielfalt möglicher Zustände, Störungen oder Handlungsoptionen eines Systems.", definition: "Ein System mit hoher Varietät kann viele verschiedene Situationen verarbeiten. Zu geringe Varietät führt zu Überforderung oder blinder Vereinfachung.", woek: "Relevant für Resilienz, Governance und Viable System Model: Steuerung braucht genug Varietät, um Wirklichkeit verarbeiten zu können.", related: ["viable-system-model", "wirkungsresilienz", "komplexitaetsmanagement", "kybernetik"] }),
  term({ id: "viabilitaet", title: "Viabilität", category: "Systemtheorie, Kybernetik und Konstruktivismus", short: "Viabilität beschreibt die Überlebens- und Anpassungsfähigkeit eines Systems in einer veränderlichen Umwelt.", definition: "Ein viables System kann sich erhalten, lernen und an veränderte Umweltbedingungen anpassen.", woek: "Wirkungsökonomisch ist ein System nicht schon viabel, wenn es finanziell funktioniert. Es ist viabel, wenn es Mensch, Planet und Demokratie nicht zerstört.", related: ["viable-system-model", "wirkungsresilienz", "mensch-planet-demokratie"] }),
  term({ id: "viable-system-model", title: "Viable System Model", category: "Systemtheorie, Kybernetik und Konstruktivismus", concept: "method", short: "Das Viable System Model beschreibt Organisationen als rekursive, lebensfähige Systeme mit operativen, koordinierenden, steuernden, strategischen und normativen Funktionen.", definition: "Das von Stafford Beer entwickelte Modell hilft, Organisationen nicht als Organigramm, sondern als lernfähige, rekursive Steuerungsarchitektur zu verstehen.", woek: "Anschlussmodell für Wirkungsarchitektur, Organisationen, Verwaltung, Wirkungsrat und lernende Institutionen.", related: ["stafford-beer", "rekursion", "varietaet", "viabilitaet", "wirkungsarchitektur"] }),
  term({ id: "effektivitaet", title: "Effektivität", category: "Management, Wirksamkeit und Organisation", short: "Effektivität bedeutet, die richtigen Dinge zu tun.", definition: "Effektivität fragt zuerst nach Richtung und Ziel. Eine Maßnahme kann sehr effizient sein und trotzdem am falschen Ziel arbeiten.", woek: "In der Wirkungsökonomie ist eine Maßnahme effektiv, wenn sie tatsächliche positive Zustandsveränderungen für Mensch, Planet und Demokratie ermöglicht.", related: ["effizienz", "effektivitaet-vs-effizienz", "wirksamkeit", "positive-netto-wirkung"], sourceGroup: "management" }),
  term({ id: "effizienz", title: "Effizienz", category: "Management, Wirksamkeit und Organisation", short: "Effizienz bedeutet, Dinge mit möglichst geringem Ressourceneinsatz zu tun.", definition: "Effizienz beschreibt das Verhältnis von Ergebnis und Ressourceneinsatz. Sie sagt noch nicht, ob das Ergebnis sinnvoll oder schädlich ist.", woek: "Effizienz ist nicht automatisch positiv. Effizienz ohne richtige Zielrichtung kann destruktive Systeme beschleunigen.", related: ["effektivitaet", "effektivitaet-vs-effizienz", "wirkungsgrad", "verlustleistung"], sourceGroup: "management" }),
  term({ id: "effektivitaet-vs-effizienz", title: "Effektivität vs. Effizienz", category: "Management, Wirksamkeit und Organisation", short: "Effektivität fragt nach dem richtigen Ziel; Effizienz fragt nach dem sparsamen Weg dorthin.", definition: "Der Unterschied schützt vor der Verwechslung von Zielrichtigkeit und Ressourcensparsamkeit.", woek: "Wirkungsökonomisch gilt: Erst Effektivität, dann Effizienz. Ein falsches Ziel effizient zu erreichen, erzeugt Verlustleistung.", related: ["effektivitaet", "effizienz", "verlustleistung", "wirkung"] , sourceGroup: "management"}),
  term({ id: "wirksamkeit", title: "Wirksamkeit", category: "Management, Wirksamkeit und Organisation", concept: "precision", short: "Wirksamkeit beschreibt die Fähigkeit, eine beabsichtigte Wirkung tatsächlich hervorzubringen.", definition: "Wirksamkeit liegt näher an Wirkung als Effizienz, bleibt aber auf eine beabsichtigte Wirkung bezogen.", woek: "Eine Maßnahme kann wirksam sein und trotzdem normativ schädlich wirken. Daher braucht sie den Referenzrahmen Mensch, Planet und Demokratie.", related: ["wirkung", "effektivitaet", "positive-netto-wirkung", "wirkungsanalyse"], sourceGroup: "management" }),
  term({ id: "management", title: "Management", category: "Management, Wirksamkeit und Organisation", short: "Management ist die Gestaltung, Steuerung und Rückkopplung von Organisationen und Prozessen.", definition: "Management verbindet Ziele, Ressourcen, Menschen, Strukturen, Entscheidungen und Lernen.", woek: "In der WÖk wird Management als Wirkungssteuerung verstanden: nicht nur Ressourcen planen, sondern Zustandsveränderungen gestalten.", related: ["wirksames-management", "systemorientiertes-management", "wirkungsarchitektur"], sourceGroup: "management" }),
  term({ id: "wirksames-management", title: "Wirksames Management", category: "Management, Wirksamkeit und Organisation", short: "Wirksames Management richtet Organisationen auf tatsächliche Problemlösung und Zustandsverbesserung aus.", definition: "Der Begriff schließt an Managementlehre an und fragt, ob Organisationen ihre Zwecke real erreichen.", woek: "In der WÖk wird wirksames Management an positiver Netto-Wirkung gemessen, nicht nur an Zielerreichung, Gewinn oder Effizienz.", related: ["management", "wirksamkeit", "effektivitaet", "positive-netto-wirkung"], sourceGroup: "management" }),
  term({ id: "kundennutzen", title: "Kundennutzen", category: "Management, Wirksamkeit und Organisation", short: "Kundennutzen beschreibt den Nutzen, den ein Produkt oder eine Dienstleistung für Kund:innen erzeugt.", definition: "Kundennutzen ist wichtig für Geschäftsmodelle, aber er erfasst nur einen Teil der Wirkung eines Angebots.", woek: "Kundennutzen ist nicht automatisch Wirkung. Tabak, SUVs oder manipulative Plattformen können Kundennutzen stiften und zugleich negative Wirkung erzeugen.", related: ["business-value", "impact-value", "value-proposition", "wirkungsempfaenger"], sourceGroup: "management" }),
  term({ id: "business-value", title: "Business Value", category: "Management, Wirksamkeit und Organisation", short: "Business Value beschreibt den wirtschaftlichen Wertbeitrag einer Maßnahme, eines Produkts oder Geschäftsmodells für ein Unternehmen.", definition: "Business Value umfasst Umsatz, Marge, Kostensenkung, Wachstum, Risiko- oder Marktposition aus Unternehmenssicht.", woek: "Business Value ist nicht identisch mit Wirkungswert. Er muss mit Impact Value und positiver Netto-Wirkung abgeglichen werden.", related: ["impact-value", "kundennutzen", "business-model", "positive-netto-wirkung"], sourceGroup: "management" }),
  term({ id: "impact-value", title: "Impact Value / Wirkungswert", category: "Management, Wirksamkeit und Organisation", concept: "precision", short: "Impact Value beschreibt den Wert einer Aktivität aus Sicht ihrer Wirkung auf Mensch, Planet und Demokratie.", definition: "Impact Value erweitert die Frage nach wirtschaftlichem Wert um reale Zustandsveränderungen und vermiedene Schäden.", woek: "Der Wirkungswert macht sichtbar, was Business Value nicht zwingend zeigt: ob ein Angebot positive Netto-Wirkung erzeugt.", aliases: ["Wirkungswert", "Impact Value"], related: ["business-value", "positive-netto-wirkung", "t-sroi"], sourceGroup: "management" }),
  term({ id: "gewinn-als-test", title: "Gewinn als Test", category: "Management, Wirksamkeit und Organisation", concept: "sourceLine", short: "Gewinn kann anzeigen, dass eine Lösung am Markt tragfähig ist, ist aber kein Beweis positiver Wirkung.", definition: "Der Gedanke schließt an Drucker an: Gewinn kann als Test wirtschaftlicher Tragfähigkeit verstanden werden.", woek: "In wirkungsblinden Märkten kann Gewinn auch aus Externalisierung entstehen. Gewinn ist erst dann belastbar, wenn Preise Wirkung abbilden.", related: ["business-value", "wirkungsblindheit", "wirkungsrueckkopplung"], sourceGroup: "management" }),
  term({ id: "st-galler-management-modell", title: "St. Galler Management-Modell", category: "Management, Wirksamkeit und Organisation", concept: "sourceLine", short: "Das St. Galler Management-Modell ist ein systemtheoretisch geprägter Bezugsrahmen für Organisationen, Umfeld und Managementdimensionen.", definition: "Es betrachtet Organisationen in Umweltsphären, Anspruchsgruppen, Prozessen und Managementebenen.", woek: "Anschlussbegriff für systemorientiertes Management, Anspruchsgruppen und integrierte Unternehmensführung.", related: ["systemorientiertes-management", "normatives-management", "strategisches-management", "operatives-management"], sourceGroup: "management" }),
  term({ id: "systemorientiertes-management", title: "Systemorientiertes Management", category: "Management, Wirksamkeit und Organisation", short: "Systemorientiertes Management betrachtet Organisationen als offene, vernetzte Systeme in Wechselwirkung mit Umwelt, Anspruchsgruppen und Prozessen.", definition: "Es ersetzt isolierte Steuerung durch Denken in Beziehungen, Dynamiken und Rückkopplungen.", woek: "Grundlage für Wirkungsmanagement und Wirkungsarchitektur.", related: ["st-galler-management-modell", "management", "wirkungsarchitektur"], sourceGroup: "management" }),
  term({ id: "normatives-management", title: "Normatives Management", category: "Management, Wirksamkeit und Organisation", short: "Normatives Management bezieht sich auf Sinn, Werte, Zweck, Legitimität und langfristige Orientierung einer Organisation.", definition: "Es fragt, wofür eine Organisation steht und welche Rolle sie gesellschaftlich einnimmt.", woek: "In der WÖk entspricht dies der Frage: Auf welchen Wirkungsrahmen richtet sich eine Organisation aus?", related: ["strategisches-management", "operatives-management", "mensch-planet-demokratie"], sourceGroup: "management" }),
  term({ id: "strategisches-management", title: "Strategisches Management", category: "Management, Wirksamkeit und Organisation", short: "Strategisches Management legt fest, wie eine Organisation ihre langfristigen Ziele unter Unsicherheit erreicht.", definition: "Strategie verbindet Richtung, Ressourcen, Wettbewerb, Umfeld und Handlungspfade.", woek: "In der WÖk wird Strategie zum Wirkungspfad: Wie erzeugt eine Organisation positive Netto-Wirkung?", related: ["normatives-management", "operatives-management", "wirkungspfad"], sourceGroup: "management" }),
  term({ id: "operatives-management", title: "Operatives Management", category: "Management, Wirksamkeit und Organisation", short: "Operatives Management steuert die konkrete Umsetzung von Aufgaben, Prozessen und Ressourcen.", definition: "Es übersetzt strategische Ziele in Alltag, Abläufe, Zuständigkeiten und Entscheidungen.", woek: "Operatives Management braucht Wirkungsdaten, Scorecards und Rückkopplung.", related: ["strategisches-management", "scorecard", "wirkungsdaten"], sourceGroup: "management" }),
  term({ id: "komplexitaetsmanagement", title: "Komplexitätsmanagement", category: "Management, Wirksamkeit und Organisation", short: "Komplexitätsmanagement beschreibt den Umgang mit vielen vernetzten, dynamischen und unsicheren Einflussfaktoren.", definition: "Komplexität entsteht, wenn viele Elemente sich wechselseitig beeinflussen und Ergebnisse nicht linear vorhersehbar sind.", woek: "Komplexität wird nicht durch bloße Vereinfachung gelöst, sondern durch Rückkopplung, Varietät, Lernfähigkeit und Wirkungsarchitektur.", related: ["varietaet", "rueckkopplung", "wirkungsarchitektur", "nichttriviales-system"], sourceGroup: "management" }),
  term({ id: "innovation", title: "Innovation", category: "Innovation, Evolution und Unternehmertum", short: "Innovation ist die erfolgreiche Durchsetzung einer neuen Problemlösung in einem sozialen, wirtschaftlichen oder technischen System.", definition: "Innovation ist mehr als Erfindung oder Neuheit. Sie wird erst relevant, wenn eine neue Lösung Anwendung, Diffusion und Systemwirkung entfaltet.", woek: "Innovation ist in der WÖk nur dann Fortschritt, wenn sie positive Netto-Wirkung erzeugt. Neuheit allein reicht nicht.", related: ["erfindung", "diffusion", "wirkungsinnovation", "positive-netto-wirkung"], sourceGroup: "innovation" }),
  term({ id: "erfindung", title: "Erfindung", category: "Innovation, Evolution und Unternehmertum", short: "Eine Erfindung ist eine neue technische, organisatorische oder konzeptionelle Möglichkeit, die noch nicht notwendigerweise wirksam verbreitet ist.", definition: "Erfindungen schaffen Optionen. Ob daraus Innovation wird, entscheidet sich an Anwendung, Akzeptanz, Diffusion und Wirkung.", woek: "Erfindung wird erst durch Anwendung, Diffusion und Wirkung zur Innovation.", related: ["innovation", "diffusion", "wirkungspotenzial"], sourceGroup: "innovation" }),
  term({ id: "diffusion", title: "Diffusion", category: "Innovation, Evolution und Unternehmertum", short: "Diffusion beschreibt die Verbreitung einer Innovation in Märkten, Organisationen oder Gesellschaften.", definition: "Diffusion hängt von Nutzen, Anschlussfähigkeit, Kosten, Normen, Netzwerken, Vertrauen und Infrastruktur ab.", woek: "Diffusion entscheidet, ob ein Wirkungspotenzial systemische Wirkung entfaltet.", related: ["innovation", "anschlussfaehigkeit", "transformationswirkung"], sourceGroup: "innovation" }),
  term({ id: "rekombination", title: "Rekombination / neue Kombination", category: "Innovation, Evolution und Unternehmertum", short: "Rekombination beschreibt die neue Kombination bestehender Ressourcen, Technologien, Kompetenzen, Märkte oder Organisationsformen.", definition: "Der Begriff schließt an Schumpeters neue Kombinationen an. Fortschritt entsteht oft nicht durch völlig Neues, sondern durch neue Kombinationen.", woek: "Rekombination wird zur Wirkungsinnovation, wenn sie mehr positive Netto-Wirkung bei weniger Verlustleistung erzeugt.", aliases: ["Neue Kombination", "neue Kombinationen"], related: ["unternehmerfunktion", "innovation", "wirkungsinnovation", "verlustleistung"], sourceGroup: "innovation" }),
  term({ id: "unternehmerfunktion", title: "Unternehmerfunktion", category: "Innovation, Evolution und Unternehmertum", short: "Die Unternehmerfunktion besteht darin, neue Kombinationen zu erkennen, durchzusetzen und neue Entwicklungspfade zu eröffnen.", definition: "Die Unternehmerfunktion ist nicht an eine bestimmte Person gebunden. Sie beschreibt eine Entwicklungsleistung im wirtschaftlichen System.", woek: "In der WÖk wird sie zur Wirkungsfunktion: Neue Kombinationen müssen bessere Zustände für Mensch, Planet und Demokratie erzeugen.", related: ["rekombination", "innovativer-unternehmer", "lernender-unternehmer"], sourceGroup: "innovation" }),
  term({ id: "schoepferische-zerstoerung", title: "Schöpferische Zerstörung", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Schöpferische Zerstörung bezeichnet den Prozess, in dem Innovation alte Strukturen verdrängt und neue hervorbringt.", definition: "Bei Schumpeter ist schöpferische Zerstörung ein Kernmoment kapitalistischer Entwicklung.", woek: "Nicht jede schöpferische Zerstörung ist Fortschritt. Wenn neue Strukturen Mensch, Planet oder Demokratie schwächen, ist sie wirkungsökonomisch negativ.", related: ["kreative-rekonstruktion", "innovation", "positive-netto-wirkung"], sourceGroup: "innovation" }),
  term({ id: "kreative-rekonstruktion", title: "Kreative Rekonstruktion", category: "Innovation, Evolution und Unternehmertum", concept: "core", short: "Kreative Rekonstruktion überführt Altes durch Dekonstruktion, Reinigung und neue Kombination in höhere Wirkung.", definition: "Kreative Rekonstruktion ist die WÖk-Weiterentwicklung der schöpferischen Zerstörung. Sie fragt, was erhalten, repariert, rekombiniert oder regeneriert werden kann.", woek: "Wichtig für Kreislaufwirtschaft, Sanierung, Remanufacturing, Materialbanken, Re-Use und Wirkungstransformation.", related: ["schoepferische-zerstoerung", "wirkungsinnovation", "kreislaufwirtschaft", "verlustleistung"], sourceGroup: "innovation" }),
  term({ id: "wirkungsinnovation", title: "Wirkungsinnovation", category: "Innovation, Evolution und Unternehmertum", concept: "core", short: "Wirkungsinnovation ist eine Innovation, die reale Zustände verbessert, Verlustleistung senkt, Resilienz erhöht und Mensch, Planet oder Demokratie stärkt.", definition: "Sie verbindet Innovation mit positiver Netto-Wirkung und prüft, ob Neues tatsächlich bessere Zustände erzeugt.", woek: "Wirkungsinnovation ist kein Etikett für jede nachhaltige Neuheit, sondern eine geprüfte Transformationsleistung.", related: ["innovation", "positive-netto-wirkung", "transformationswirkung", "kreative-rekonstruktion"], sourceGroup: "innovation" }),
  term({ id: "basisinnovation", title: "Basisinnovation", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Basisinnovationen sind grundlegende Neuerungen, die langfristige technologische, wirtschaftliche oder gesellschaftliche Entwicklungspfade verändern.", definition: "Der Begriff wird häufig in Verbindung mit langen Wellen wirtschaftlicher Entwicklung verwendet.", woek: "Relevant, wenn Basisinnovationen Transformationswellen positiver Netto-Wirkung auslösen.", related: ["kondratieff-zyklus", "transformationswelle", "wirkungsinnovation"], sourceGroup: "innovation" }),
  term({ id: "kondratieff-zyklus", title: "Kondratieff-Zyklus", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Kondratieff-Zyklen sind langfristige wirtschaftliche Entwicklungswellen, die mit technologischen und strukturellen Veränderungen verbunden werden.", definition: "Der Begriff dient als historisches Deutungsmuster für lange Wellen, nicht als deterministische Vorhersage.", woek: "In der WÖk werden Kondratieff-Zyklen vorsichtig als Bündel aus Technologie, Infrastruktur, Kapital, Kompetenzen, Institutionen und Akzeptanz gelesen.", related: ["basisinnovation", "transformationswelle", "innovation"], sourceGroup: "innovation", statusNote: "Nicht deterministisch verwenden." }),
  term({ id: "transformationswelle", title: "Transformationswelle", category: "Innovation, Evolution und Unternehmertum", concept: "precision", short: "Eine Transformationswelle ist eine längerfristige Veränderungsbewegung, in der Innovationen, Infrastrukturen, Institutionen und Verhaltensmuster zusammenwirken.", definition: "Transformationswellen entstehen nicht durch einen einzelnen Auslöser, sondern durch gekoppelte Entwicklungen.", woek: "Die Wirkungsökonomie versteht die nächste Transformationswelle als Übergang von Kapitalsteuerung zu Wirkungssteuerung.", related: ["transformationswirkung", "basisinnovation", "wirkungsinnovation"], sourceGroup: "innovation" }),
  term({ id: "lernender-unternehmer", title: "Lernender Unternehmer", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Der lernende Unternehmer entwickelt Kompetenz, Wahrnehmung, Risiko- und Wirkungsfähigkeit weiter.", definition: "Der Begriff schließt an Jochen Röpke an und beschreibt Unternehmertum als Lern- und Entwicklungsfähigkeit.", woek: "In der WÖk wird der lernende Unternehmer zum Wirkungsakteur: Er lernt, Wirkungen zu lesen und neue Kombinationen für bessere Zustände zu schaffen.", related: ["unternehmerisches-lernen", "unternehmerfunktion", "wirkungsinnovation"], sourceGroup: "innovation", reviewStatus: "needs_source_check" }),
  term({ id: "routineunternehmer", title: "Routineunternehmer / Homo oeconomicus", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Der Routineunternehmer handelt innerhalb gegebener Marktlogiken, optimiert Ressourcen und reproduziert bestehende Muster.", definition: "Routine kann stabilisieren und effizient machen, aber auch bestehende Pfade verfestigen.", woek: "Wichtig als Gegenpol zum lernenden und wirkungsorientierten Unternehmer.", aliases: ["Homo oeconomicus"], related: ["lernender-unternehmer", "arbitrageur", "innovativer-unternehmer"], sourceGroup: "innovation", reviewStatus: "needs_source_check" }),
  term({ id: "arbitrageur", title: "Arbitrageur", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Der Arbitrageur nutzt Preis-, Informations- oder Marktunterschiede aus und trägt dadurch zur Angleichung von Differenzen bei.", definition: "Arbitrage kann Märkte effizienter machen, aber sie erzeugt nicht automatisch bessere Zustände.", woek: "Relevant ist, ob Arbitrage reale Zustände verbessert oder nur Wert aus Differenzen abschöpft.", related: ["routineunternehmer", "business-value", "impact-value"], sourceGroup: "innovation", reviewStatus: "needs_source_check" }),
  term({ id: "innovativer-unternehmer", title: "Innovativer Unternehmer", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Der innovative Unternehmer setzt neue Kombinationen durch und eröffnet neue Märkte, Produkte, Prozesse oder Organisationsformen.", definition: "Der Begriff beschreibt die Durchsetzungsfunktion von Innovation.", woek: "In der WÖk ist Innovation nur dann positiv, wenn sie positive Netto-Wirkung erzeugt.", related: ["unternehmerfunktion", "rekombination", "wirkungsinnovation"], sourceGroup: "innovation", reviewStatus: "needs_source_check" }),
  term({ id: "evolutorischer-unternehmer", title: "Evolutorischer Unternehmer", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Der evolutorische Unternehmer entwickelt die Fähigkeit des Systems zur Selbstentwicklung und Erneuerung.", definition: "Der Begriff markiert Unternehmertum als Beitrag zur Evolution von Kompetenzen, Märkten und Strukturen.", woek: "Relevant für Transformation, Wirkungsinnovation und Systemerneuerung.", related: ["unternehmerisches-lernen", "wirkungsinnovation", "transformationswelle"], sourceGroup: "innovation", reviewStatus: "needs_source_check" }),
  term({ id: "unternehmerisches-lernen", title: "Unternehmerisches Lernen", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", short: "Unternehmerisches Lernen beschreibt die Entwicklung von Wahrnehmung, Kompetenz, Risiko- und Innovationsfähigkeit.", definition: "Es umfasst nicht nur Wissenserwerb, sondern Veränderung von Routinen, Entscheidungen und Möglichkeiten.", woek: "In der WÖk wird es zur Fähigkeit, Wirkung zu lesen und bessere Wirkungspfade zu erzeugen.", related: ["lernender-unternehmer", "lernebenen", "wirkungskompetenz"], sourceGroup: "innovation", reviewStatus: "needs_source_check" }),
  term({ id: "lernebenen", title: "Lernebenen", category: "Innovation, Evolution und Unternehmertum", concept: "sourceLine", publicationStatus: "published", short: "Lernebenen unterscheiden unterschiedliche Tiefen des Lernens: Anpassung, Reflexion, Transformation und Entwicklung der eigenen Lernfähigkeit.", definition: "Als vorläufige Arbeitsstruktur unterscheidet die WÖk Anpassungslernen, Reflexionslernen, Transformationslernen und Selbstevolution. Die genaue Zuschreibung zu Röpke / Rassidakis bleibt quellenmäßig zu prüfen.", woek: "Hilfreich, um Wirkungskompetenz und unternehmerisches Lernen nicht nur als Wissen, sondern als Entwicklungsfähigkeit zu verstehen.", related: ["unternehmerisches-lernen", "lernender-unternehmer", "wirkungskompetenz"], sourceGroup: "innovation", reviewStatus: "needs_source_check", statusNote: "Die Viererstruktur ist als WÖk-Arbeitsstruktur markiert und nicht endgültig Röpke zugeschrieben." }),
  term({ id: "dao", title: "Dao / Tao", category: "Daoismus, Prozessdenken und Nicht-Erzwingen", concept: "sourceLine", short: "Dao bezeichnet im Daoismus den Weg oder Prozess, in dem sich Wirklichkeit entfaltet.", definition: "Der Begriff wird hier knapp als philosophische Bezugslinie für Prozessdenken und Eingebettetheit verwendet.", woek: "Nicht religiös ausbauen. Funktional relevant als Gegenbild zu Kontrolle gegen Systemlogiken.", aliases: ["Tao"], related: ["wu-wei", "prozessdenken", "selbstorganisation"], sourceGroup: "dao" }),
  term({ id: "wu-wei", title: "Wu Wei / Nicht-Erzwingen", category: "Daoismus, Prozessdenken und Nicht-Erzwingen", concept: "sourceLine", short: "Wu Wei bezeichnet ein Handeln ohne gewaltsames Erzwingen: Mitgehen mit Systemlogiken statt Kontrolle gegen sie.", definition: "Der Begriff beschreibt kein Nichtstun, sondern angemessenes, nicht übergriffiges Handeln im Prozess.", woek: "Relevant als Gegenbild zu technokratischer Steuerungsillusion. Die WÖk setzt auf Rückkopplung, Resonanz und Selbstorganisation.", aliases: ["Nicht-Erzwingen"], related: ["dao", "prozessdenken", "selbstorganisation", "rueckkopplung"], sourceGroup: "dao" }),
  term({ id: "nicht-dualitaet", title: "Nicht-Dualität", category: "Daoismus, Prozessdenken und Nicht-Erzwingen", concept: "sourceLine", short: "Nicht-Dualität beschreibt die Auflösung starrer Trennungen zwischen Subjekt und Objekt, Mensch und Natur, Innen und Außen.", definition: "Der Begriff wird vorsichtig als philosophischer Anschluss an Prozessdenken genutzt.", woek: "Relevant für die Einsicht, dass Mensch, Wirtschaft und Natur gekoppelte Wirkungsräume sind.", related: ["dao", "prozessdenken", "interdependenz", "wirkungsraum"], sourceGroup: "dao" }),
  term({ id: "prozessdenken", title: "Prozessdenken", category: "Daoismus, Prozessdenken und Nicht-Erzwingen", short: "Prozessdenken betrachtet Wirklichkeit nicht primär als Dinge, sondern als Beziehungen, Bewegungen und Veränderungen.", definition: "Es richtet Aufmerksamkeit auf Werden, Veränderung, Kopplung, Rhythmus und Rückwirkung.", woek: "Anschlussbegriff für Wirkung als Zustandsveränderung, strukturelles Driften, Rückkopplung und Wirkungsarchitektur.", related: ["wirkung", "strukturelles-driften", "rueckkopplung", "wirkungsarchitektur"], sourceGroup: "dao" }),
  term({ id: "klimawandel", title: "Klimawandel", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Klimawandel beschreibt langfristige Veränderungen des Klimasystems, insbesondere durch den menschengemachten Anstieg von Treibhausgasen.", definition: "Der Glossarbegriff ersetzt kein Klimawissenschaftslexikon. Er markiert Klimawandel als zentrales Wirkungsfeld ökologischer und sozialer Folgewirkungen.", woek: "Klimawandel ist ein Wirkungsfeld, in dem externalisierte Emissionen reale Zustandsveränderungen und Folgekosten erzeugen.", related: ["treibhausgasemissionen", "klimaschutz", "klimaanpassung", "klimafolgeschaeden"], sourceGroup: "climate" }),
  term({ id: "klimaschutz", title: "Klimaschutz / Mitigation", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Klimaschutz umfasst Maßnahmen zur Vermeidung, Reduktion oder Bindung von Treibhausgasemissionen.", definition: "Klimaschutz senkt Ursachen des Klimawandels, etwa durch weniger fossile Emissionen, Effizienz, erneuerbare Energien oder Senken.", woek: "Klimaschutz ist eine Wirkungsrichtung, die mit Produktwirkung, Preisen, Steuern, Kapital und Infrastruktur verbunden werden muss.", aliases: ["Mitigation"], related: ["treibhausgasemissionen", "co2e", "carbon-budget", "klimaanpassung"], sourceGroup: "climate" }),
  term({ id: "klimaanpassung", title: "Klimaanpassung / Adaptation", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Klimaanpassung umfasst Maßnahmen, die Systeme widerstandsfähiger gegenüber eingetretenen oder erwartbaren Klimafolgen machen.", definition: "Anpassung mindert Verwundbarkeit und Schäden, ersetzt aber nicht Klimaschutz.", woek: "Relevant für Resilienz, Infrastruktur, Gesundheit, Landwirtschaft, Wohnen, Kommunen und Versicherbarkeit.", aliases: ["Adaptation"], related: ["klimarisiko", "vulnerabilitaet", "anpassungskapazitaet", "wirkungsresilienz"], sourceGroup: "climate" }),
  term({ id: "klimafolgeschaeden", title: "Klimafolgeschäden / Loss and Damage", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Klimafolgeschäden sind Schäden und Verluste durch Klimawandelfolgen, die nicht oder nicht vollständig vermieden werden können.", definition: "Sie umfassen physische, soziale, ökologische und wirtschaftliche Folgen, etwa Ernteausfälle, Hitzeschäden, Infrastrukturverluste oder Gesundheitsbelastungen.", woek: "Klimafolgeschäden sind reale Folgewirkungen externalisierter Emissionen und zentrale Beispiele für Wirkung, die in heutigen Preisen nicht ausreichend sichtbar ist.", aliases: ["Loss and Damage"], related: ["folgewirkung", "klimarisiko", "treibhausgasemissionen", "externalisierung"], sourceGroup: "climate" }),
  term({ id: "klimarisiko", title: "Klimarisiko", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Klimarisiko beschreibt Risiken aus physischen Klimafolgen oder aus dem Übergang zu einer klimaneutralen Wirtschaft.", definition: "Dazu gehören physische Risiken, transitorische Risiken, Haftungsrisiken und Transformationsrisiken.", woek: "Klimarisiko verbindet ökologische Wirkung, Kapitalrisiko, Versicherung, Infrastruktur, Lieferketten und soziale Verwundbarkeit.", related: ["klimafolgeschaeden", "vulnerabilitaet", "exposition", "anpassungskapazitaet"], sourceGroup: "climate" }),
  term({ id: "vulnerabilitaet", title: "Vulnerabilität", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Vulnerabilität beschreibt die Verwundbarkeit von Menschen, Ökosystemen, Infrastrukturen oder Institutionen gegenüber Risiken und Schäden.", definition: "Sie hängt von Sensitivität, Exposition und Anpassungskapazität ab.", woek: "Vulnerabilität macht sichtbar, dass dieselbe Belastung unterschiedliche Wirkungen erzeugen kann.", related: ["exposition", "anpassungskapazitaet", "klimarisiko", "wirkungsresilienz"], sourceGroup: "climate" }),
  term({ id: "exposition", title: "Exposition", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Exposition beschreibt, ob und in welchem Ausmaß Menschen, Systeme oder Werte einem Risiko ausgesetzt sind.", definition: "Ein System kann verwundbar sein, aber ohne Exposition tritt ein bestimmtes Risiko nicht ein.", woek: "Wichtig für Klimarisiko, Gesundheit, Wohnen, Infrastruktur und Lieferketten.", related: ["vulnerabilitaet", "klimarisiko", "anpassungskapazitaet"], sourceGroup: "climate" }),
  term({ id: "anpassungskapazitaet", title: "Anpassungskapazität", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Anpassungskapazität beschreibt die Fähigkeit eines Systems, auf Veränderungen zu reagieren und Schäden zu begrenzen.", definition: "Sie hängt von Ressourcen, Wissen, Infrastruktur, Institutionen, Vertrauen und Handlungsoptionen ab.", woek: "Eine zentrale Brücke zwischen Klimaanpassung, Wirkungsresilienz und gesellschaftlicher Stabilität.", related: ["klimaanpassung", "vulnerabilitaet", "wirkungsresilienz", "vertrauen"], sourceGroup: "climate" }),
  term({ id: "treibhausgasemissionen", title: "Treibhausgasemissionen", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Treibhausgasemissionen sind Freisetzungen klimawirksamer Gase wie CO2, Methan oder Lachgas.", definition: "Sie tragen je nach Gas und Zeitraum unterschiedlich zur Erwärmung bei und werden häufig als CO2-Äquivalente berichtet.", woek: "Treibhausgasemissionen sind messbare ökologische Wirkungstreiber, aber nicht die gesamte Produkt- oder Unternehmenswirkung.", related: ["co2e", "global-warming-potential", "emissionsfaktor", "scope-1-2-3"], sourceGroup: "climate" }),
  term({ id: "co2e", title: "CO2e / CO2-Äquivalent", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "CO2e macht verschiedene Treibhausgase über ihr Erwärmungspotenzial vergleichbar.", definition: "CO2-Äquivalente übersetzen Klimawirkungen verschiedener Gase in eine gemeinsame Einheit.", woek: "Wichtig für Product Carbon Footprint, Scope-Bilanzen, LCA und Produktwirkungssteuer.", aliases: ["CO2-Äquivalent", "CO2e"], related: ["global-warming-potential", "treibhausgasemissionen", "product-carbon-footprint"], sourceGroup: "climate" }),
  term({ id: "global-warming-potential", title: "Global Warming Potential / GWP", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Global Warming Potential beschreibt das Erwärmungspotenzial eines Treibhausgases im Vergleich zu CO2 über einen festgelegten Zeitraum.", definition: "GWP wird genutzt, um unterschiedliche Treibhausgase in CO2-Äquivalente umzurechnen.", woek: "Methodische Grundlage für Klimabilanzierung, Product Carbon Footprint und Lebenszyklusanalyse.", aliases: ["GWP"], related: ["co2e", "treibhausgasemissionen", "product-carbon-footprint"], sourceGroup: "climate" }),
  term({ id: "emissionsfaktor", title: "Emissionsfaktor", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Ein Emissionsfaktor beschreibt, wie viele Emissionen pro Einheit Aktivität, Energie, Material oder Produkt entstehen.", definition: "Emissionsfaktoren übersetzen Aktivitätsdaten in Emissionswerte.", woek: "Sie sind zentrale Datenbausteine, aber ihre Qualität, Systemgrenze und Aktualität bestimmen die Aussagekraft.", related: ["treibhausgasemissionen", "product-carbon-footprint", "lebenszyklusanalyse", "datenqualitaet"], sourceGroup: "climate" }),
  term({ id: "carbon-budget", title: "Carbon Budget", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Ein Carbon Budget beschreibt die verbleibende Menge an Treibhausgasemissionen, die mit einem Temperaturziel vereinbar ist.", definition: "Carbon Budgets machen Klimagrenzen als mengenmäßige Restriktion sichtbar.", woek: "Relevant für Wirkungsgrenzen, Investitionen, Infrastruktur, Produktpolitik und Transformationspfade.", related: ["klimaschutz", "treibhausgasemissionen", "wirkungsgrenze"], sourceGroup: "climate" }),
  term({ id: "scope-1-2-3", title: "Scope 1, Scope 2, Scope 3", category: "Klima, Lebenszyklus und ökologische Wirkung", short: "Scope 1, 2 und 3 unterscheiden direkte Emissionen, energiebezogene indirekte Emissionen und weitere indirekte Emissionen entlang der Wertschöpfungskette.", definition: "Die Scope-Logik strukturiert Unternehmensbilanzierung von Treibhausgasemissionen.", woek: "Wichtig, weil viele Wirkungen nicht im eigenen Betrieb, sondern in Energiebezug, Lieferketten, Nutzung und Entsorgung entstehen.", related: ["treibhausgasemissionen", "product-carbon-footprint", "lieferkette", "systemgrenze"], sourceGroup: "climate" }),
  term({ id: "product-carbon-footprint", title: "Product Carbon Footprint / PCF", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Der Product Carbon Footprint beschreibt die Treibhausgasemissionen eines Produkts entlang einer definierten Systemgrenze.", definition: "Ein PCF kann je nach Methode unterschiedliche Lebenszyklusphasen umfassen, etwa Cradle-to-Gate oder Cradle-to-Grave.", woek: "Wichtig für Produktwirkung, Scorecards, Digitalen Produktpass und Produktwirkungssteuer. PCF ist aber nur Klimawirkung, nicht Gesamtwirkung.", aliases: ["PCF"], related: ["lebenszyklusanalyse", "co2e", "systemgrenze", "scorecard"], sourceGroup: "climate" }),
  term({ id: "lebenszyklusanalyse", title: "Lebenszyklusanalyse / LCA", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Lebenszyklusanalyse bewertet potenzielle Umweltwirkungen eines Produktsystems über seinen Lebensweg.", definition: "LCA betrachtet Eingaben, Ausgaben und Umweltwirkungen über definierte Lebenszyklusphasen und Systemgrenzen.", woek: "In der WÖk wird LCA mit Scorecards, WÖk-IDs, Digitalem Produktpass, Reverse Merit Order und Produktwirkungssteuer verknüpft.", aliases: ["LCA", "Life Cycle Assessment"], related: ["lebenszyklusinventar", "lebenszykluswirkungsabschaetzung", "systemgrenze", "product-carbon-footprint"], sourceGroup: "climate" }),
  term({ id: "lebenszyklusinventar", title: "Lebenszyklusinventar / LCI", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Das Lebenszyklusinventar erfasst Eingaben und Ausgaben eines Produktsystems innerhalb definierter Systemgrenzen.", definition: "LCI ist die Datengrundlage der Lebenszyklusanalyse.", woek: "Ohne belastbares Inventar bleiben Scorecards, PCF und Produktwirkungssteuer unsicher.", aliases: ["LCI"], related: ["lebenszyklusanalyse", "lebenszykluswirkungsabschaetzung", "datenqualitaet"], sourceGroup: "climate" }),
  term({ id: "lebenszykluswirkungsabschaetzung", title: "Lebenszykluswirkungsabschätzung / LCIA", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Lebenszykluswirkungsabschätzung übersetzt Inventardaten in potenzielle Umweltwirkungen.", definition: "LCIA ordnet Emissionen und Ressourcenflüsse Wirkungskategorien zu, etwa Klimawirkung, Versauerung oder Ressourcenverbrauch.", woek: "Sie ist Brücke zwischen Daten und Wirkungsbewertung, ersetzt aber keine vollständige WÖk-Scorecard.", aliases: ["LCIA"], related: ["lebenszyklusanalyse", "lebenszyklusinventar", "scorecard"], sourceGroup: "climate" }),
  term({ id: "cradle-to-gate", title: "Cradle-to-Gate", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Cradle-to-Gate betrachtet Umweltwirkungen von Rohstoffgewinnung bis zum Werkstor.", definition: "Nutzung und End-of-Life liegen bei dieser Systemgrenze außerhalb der Betrachtung.", woek: "Wichtig, um PCF- und LCA-Ergebnisse nicht mit vollständiger Produktwirkung zu verwechseln.", related: ["cradle-to-grave", "lebenszyklusanalyse", "systemgrenze"], sourceGroup: "climate" }),
  term({ id: "cradle-to-grave", title: "Cradle-to-Grave", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Cradle-to-Grave betrachtet Umweltwirkungen von Rohstoffgewinnung über Nutzung bis Entsorgung.", definition: "Diese Systemgrenze umfasst den gesamten Lebensweg bis zum Lebensende.", woek: "Wichtig für Produktwirkung, Rebound, Reparatur, Kreislaufwirtschaft und Entsorgung.", related: ["cradle-to-gate", "cradle-to-cradle", "lebenszyklusanalyse", "produktlebenszyklus"], sourceGroup: "climate" }),
  term({ id: "cradle-to-cradle", title: "Cradle to Cradle", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Cradle to Cradle beschreibt ein Design- und Zertifizierungsprinzip, bei dem Materialien in sicheren biologischen oder technischen Kreisläufen geführt werden.", definition: "Der Ansatz zielt darauf, Abfall als Designfehler zu vermeiden und Materialien für Kreisläufe zu gestalten.", woek: "Anschlussbegriff für Kreislaufwirtschaft, Produktwirkung, kreative Rekonstruktion und Reverse Merit Order.", aliases: ["C2C"], related: ["kreislaufwirtschaft", "cradle-to-grave", "kreative-rekonstruktion"], sourceGroup: "climate" }),
  term({ id: "environmental-product-declaration", title: "Environmental Product Declaration / EPD", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Eine Environmental Product Declaration ist eine standardisierte Umweltproduktdeklaration auf Basis von Lebenszyklusdaten.", definition: "EPDs machen Umweltinformationen für Produkte vergleichbarer, besonders im Bau- und Produktkontext.", woek: "EPDs können Datenquellen für Scorecards, Produktpässe und Produktwirkungssteuer sein.", aliases: ["EPD"], related: ["lebenszyklusanalyse", "product-environmental-footprint", "digitaler-produktpass"], sourceGroup: "climate" }),
  term({ id: "product-environmental-footprint", title: "Product Environmental Footprint / PEF", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Der Product Environmental Footprint ist ein EU-Ansatz zur Bewertung der Umweltleistung von Produkten über den Lebenszyklus.", definition: "PEF soll Produktumweltinformationen methodisch stärker vergleichbar machen.", woek: "Anschluss an Produktwirkung, Scorecards, Digitalen Produktpass und europäische Datenlogiken.", aliases: ["PEF"], related: ["organisation-environmental-footprint", "lebenszyklusanalyse", "scorecard"], sourceGroup: "climate" }),
  term({ id: "organisation-environmental-footprint", title: "Organisation Environmental Footprint / OEF", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Der Organisation Environmental Footprint ist ein EU-Ansatz zur Bewertung der Umweltleistung von Organisationen.", definition: "OEF ergänzt produktbezogene Ansätze um organisationsbezogene Umweltwirkung.", woek: "Anschluss an Unternehmenswirkung, Reporting, Wirkungsdaten und Scorecards.", aliases: ["OEF"], related: ["product-environmental-footprint", "wirkungsdaten", "scorecard"], sourceGroup: "climate" }),
  term({ id: "well-to-tank", title: "Well-to-Tank", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Well-to-Tank betrachtet Energie- und Emissionswirkungen von der Gewinnung oder Erzeugung eines Energieträgers bis zur Bereitstellung am Fahrzeug.", definition: "Der Begriff grenzt die Vorkette der Energiebereitstellung ab.", woek: "Wichtig für Mobilität, Energie, Fahrzeugvergleich und Klimawirkung.", aliases: ["WTT"], related: ["tank-to-wheel", "well-to-wheel", "systemgrenze"], sourceGroup: "climate" }),
  term({ id: "tank-to-wheel", title: "Tank-to-Wheel", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Tank-to-Wheel betrachtet Energie- und Emissionswirkungen während der Nutzung im Fahrzeug.", definition: "Der Begriff fokussiert die Nutzungsphase im Fahrzeug und blendet Vorketten aus.", woek: "Nur zusammen mit Well-to-Tank und Well-to-Wheel vollständig für Fahrzeug- und Energiewirkung einzuordnen.", aliases: ["TTW"], related: ["well-to-tank", "well-to-wheel", "systemgrenze"], sourceGroup: "climate" }),
  term({ id: "well-to-wheel", title: "Well-to-Wheel", category: "Klima, Lebenszyklus und ökologische Wirkung", concept: "method", short: "Well-to-Wheel verbindet Well-to-Tank und Tank-to-Wheel und betrachtet den Pfad von Energiebereitstellung bis Nutzung.", definition: "WTW ist eine wichtige Systemgrenze für Mobilitäts- und Energievergleiche.", woek: "Wichtig für Mobilität, Energie, Fahrzeugvergleich, Wirkungssteuer, Produktwirkung und Klimafolgen.", aliases: ["WTW"], related: ["well-to-tank", "tank-to-wheel", "product-carbon-footprint"], sourceGroup: "climate" }),
  term({ id: "design-thinking", title: "Design Thinking", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Design Thinking ist ein menschenzentrierter, iterativer Ansatz zur Lösung komplexer Probleme.", definition: "Design Thinking arbeitet häufig mit Verstehen, Beobachten, Ideenentwicklung, Modellentwicklung und Testen.", woek: "Anschlussfähig, aber nicht ausreichend. Die WÖk ergänzt Desirability, Feasibility und Viability um positive Netto-Wirkung.", related: ["persona", "value-proposition", "impact-fit", "minimum-viable-impact"], sourceGroup: "design" }),
  term({ id: "persona", title: "Persona", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Eine Persona ist ein modelliertes Nutzer:innenprofil, das Bedürfnisse, Verhalten, Ziele und Kontext einer Zielgruppe greifbar macht.", definition: "Personas helfen, Nutzer:innen nicht abstrakt zu behandeln. Sie bleiben Modelle und dürfen reale Vielfalt nicht ersetzen.", woek: "Personas verbessern Anschlussfähigkeit, dürfen Wirkungsempfänger aber nicht auf Kund:innen reduzieren. Auch Nicht-Kund:innen, zukünftige Generationen, Ökosysteme und Institutionen zählen.", related: ["design-thinking", "wirkungsempfaenger", "value-proposition"], sourceGroup: "design" }),
  term({ id: "jobs-to-be-done", title: "Jobs-to-be-Done", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Jobs-to-be-Done beschreibt, welche Aufgabe oder welches Ziel Nutzer:innen mit einem Produkt oder einer Dienstleistung erreichen wollen.", definition: "Der Ansatz fragt nach dem Fortschritt, den Nutzer:innen in einer Situation erreichen wollen.", woek: "Nützlich für Kundennutzen, aber Kundenziel ist nicht automatisch Wirkungsziel.", related: ["kundennutzen", "value-proposition", "impact-fit"], sourceGroup: "design" }),
  term({ id: "value-proposition", title: "Value Proposition", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Eine Value Proposition beschreibt, welchen Nutzen ein Angebot für eine Zielgruppe verspricht.", definition: "Sie verbindet Zielgruppe, Nutzenversprechen, Probleme und Differenzierung.", woek: "Ein Wertversprechen muss auch Wirkung auf Nicht-Kund:innen, Lieferketten, Umwelt und Demokratie berücksichtigen.", aliases: ["Wertversprechen"], related: ["value-proposition-canvas", "kundennutzen", "impact-fit"], sourceGroup: "design" }),
  term({ id: "value-proposition-canvas", title: "Value Proposition Canvas", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Das Value Proposition Canvas ist ein Werkzeug zur Abstimmung von Kund:innenprofil und Wertangebot.", definition: "Es strukturiert Jobs, Pains, Gains, Pain Relievers und Gain Creators.", woek: "WÖk-Erweiterung: Pain Relievers und Gain Creators müssen um Wirkungsrisiken, externe Kosten und Wirkungsempfänger erweitert werden.", related: ["value-proposition", "business-model-canvas", "impact-fit"], sourceGroup: "design" }),
  term({ id: "business-model-canvas", title: "Business Model Canvas", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Das Business Model Canvas ist ein strategisches Werkzeug zur Beschreibung, Gestaltung und Prüfung von Geschäftsmodellen.", definition: "Es ordnet zentrale Elemente wie Partner, Aktivitäten, Ressourcen, Wertangebot, Kunden, Kanäle, Kosten und Erlöse.", woek: "Die WÖk ergänzt ein Wirkungsmodell: Welche Wirkung entsteht entlang von Ressourcen, Partnern, Wertangebot, Kund:innen, Kosten, Erlösen und Lieferketten?", related: ["business-model", "value-proposition-canvas", "impact-fit"], sourceGroup: "design" }),
  term({ id: "business-model", title: "Business Model", category: "Design, Geschäftsmodelle und Wertversprechen", short: "Ein Business Model beschreibt, wie eine Organisation Wert schafft, vermittelt und wirtschaftlich trägt.", definition: "Geschäftsmodelle verbinden Kundennutzen, Ressourcen, Aktivitäten, Erlöse, Kosten, Partner und Märkte.", woek: "Ein Geschäftsmodell ist wirkungsökonomisch zu prüfen: Welche Zustände erzeugt, stabilisiert oder beschädigt es?", aliases: ["Geschäftsmodell"], related: ["business-model-canvas", "business-value", "impact-value"], sourceGroup: "design" }),
  term({ id: "product-market-fit", title: "Product-Market Fit", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "method", short: "Product-Market Fit beschreibt, dass ein Produkt eine tragfähige Nachfrage in einem Markt trifft.", definition: "Der Begriff zeigt, ob ein Angebot für Kund:innen und Markt attraktiv genug ist.", woek: "Product-Market Fit ist nicht gleich Impact Fit. Ein Produkt kann perfekt zum Markt passen und negative Wirkung erzeugen.", related: ["impact-fit", "kundennutzen", "business-value"], sourceGroup: "design" }),
  term({ id: "impact-fit", title: "Impact Fit", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "core", short: "Impact Fit beschreibt, ob ein Produkt, eine Dienstleistung oder ein Geschäftsmodell positive Netto-Wirkung im relevanten Wirkungsraum entfaltet.", definition: "Impact Fit ergänzt Product-Market Fit um die Frage, ob ein Angebot nicht nur Nachfrage erzeugt, sondern die richtigen Zustände verbessert.", woek: "WÖk-Prägungsbegriff für Geschäftsmodell- und Produktentwicklung nach Wirkung.", related: ["product-market-fit", "positive-netto-wirkung", "wirkungsraum", "wirkungsempfaenger"], sourceGroup: "design" }),
  term({ id: "minimum-viable-impact", title: "Minimum Viable Impact / MVI", category: "Design, Geschäftsmodelle und Wertversprechen", concept: "core", publicationStatus: "article_only", short: "Minimum Viable Impact bezeichnet die kleinste überprüfbare positive Wirkung, die ein Produkt, Projekt oder Geschäftsmodell vor Skalierung nachweisen muss.", definition: "Der Begriff bleibt vorerst im Backlog, bis er in WÖk-Artikeln und Methoden häufiger verwendet wird.", woek: "Als WÖk-Prägungsbegriff vorgemerkt, aber noch nicht allgemein publiziert.", aliases: ["MVI"], related: ["impact-fit", "minimum-viable-product", "positive-netto-wirkung"], sourceGroup: "design", reviewStatus: "article_context_only" }),
  term({ id: "wirkungsgrad", title: "Wirkungsgrad", category: "Physik, Energie und Wirkungsmetaphern", concept: "precision", short: "Der Wirkungsgrad beschreibt das Verhältnis von nutzbarer Leistung oder Wirkung zum eingesetzten Aufwand.", definition: "In Technik und Physik beschreibt der Wirkungsgrad Effizienz einer Umwandlung.", woek: "Übertragen gefragt: Wie viel positive Zustandsveränderung entsteht im Verhältnis zu Ressourcen, Zeit, Kapital oder Energie?", related: ["effizienz", "wirkleistung", "verlustleistung"] }),
  term({ id: "wirkleistung", title: "Wirkleistung", category: "Physik, Energie und Wirkungsmetaphern", concept: "precision", short: "Wirkleistung ist in der Elektrotechnik die nutzbare Leistung, die tatsächlich Arbeit verrichtet.", definition: "Als technischer Begriff bezeichnet sie den Anteil der Leistung, der reale Arbeit leistet.", woek: "Als Metapher: gesellschaftliche Leistung, die reale positive Zustandsveränderung erzeugt oder negative verhindert.", related: ["scheinleistung", "blindleistung", "verlustleistung", "wirkung"] }),
  term({ id: "scheinleistung", title: "Scheinleistung", category: "Physik, Energie und Wirkungsmetaphern", concept: "precision", short: "Scheinleistung ist in der Elektrotechnik die scheinbar vorhandene Gesamtleistung im System.", definition: "Als technischer Begriff verbindet sie Wirk- und Blindanteile.", woek: "Als WÖk-Metapher: Aktivität, Umsatz, Reichweite oder Aufwand, der nach Leistung aussieht, aber keine positive Wirkung erzeugen muss.", related: ["wirkleistung", "blindleistung", "verlustleistung", "wirkungsblindheit"] }),
  term({ id: "blindleistung", title: "Blindleistung", category: "Physik, Energie und Wirkungsmetaphern", concept: "precision", short: "Blindleistung pendelt im System, belastet es, verrichtet aber keine nutzbare Arbeit.", definition: "In der Elektrotechnik ist Blindleistung für bestimmte Systeme relevant, erzeugt aber keine nutzbare Arbeit.", woek: "Als Metapher: bürokratische, ökonomische oder mediale Aktivität, die Systeme belastet, aber keine positive Netto-Wirkung erzeugt.", related: ["scheinleistung", "wirkleistung", "verlustleistung"] }),
  term({ id: "verlustleistung", title: "Verlustleistung", category: "Physik, Energie und Wirkungsmetaphern", concept: "precision", short: "Verlustleistung beschreibt Leistung, die als Reibung, Wärme, Schaden oder unnötiger Aufwand verloren geht.", definition: "Technisch ist Verlustleistung nicht nutzbar. Übertragen beschreibt sie Ressourcenverbrauch ohne gewünschte Zustandsverbesserung.", woek: "Wichtig für Reparaturkosten, Klimafolgeschäden, Bürokratie, schlechte Produkte, destruktive Medienwirkung und falsche Anreize.", related: ["effizienz", "effektivitaet-vs-effizienz", "blindleistung", "klimafolgeschaeden"] }),
  term({ id: "systemgrenze", title: "Systemgrenze", category: "Physik, Energie und Wirkungsmetaphern", concept: "method", short: "Eine Systemgrenze legt fest, was in einer Analyse berücksichtigt wird und was außerhalb bleibt.", definition: "Systemgrenzen entscheiden, welche Eingaben, Ausgaben, Wirkungen, Akteure, Zeiten und Orte in einer Bewertung sichtbar werden.", woek: "Zentral für LCA, T-SROI, Scorecards, Wirkungsanalyse und Folgencheck.", related: ["bilanzraum", "lebenszyklusanalyse", "t-sroi", "scorecard"] }),
  term({ id: "bilanzraum", title: "Bilanzraum", category: "Physik, Energie und Wirkungsmetaphern", concept: "method", short: "Der Bilanzraum beschreibt den Bereich, innerhalb dessen Wirkungen, Eingaben und Ausgaben erfasst werden.", definition: "Er macht transparent, welche räumlichen, zeitlichen und sachlichen Grenzen eine Bilanz hat.", woek: "Wichtig für Wirkungsanalyse, Produktwirkung, Klimabilanzierung und öffentliche Haushalte.", related: ["systemgrenze", "wirkungshaushalt", "product-carbon-footprint"] }),
  term({ id: "entropie", title: "Entropie", category: "Physik, Energie und Wirkungsmetaphern", short: "Entropie beschreibt in der Physik ein Maß für Verteilung, Unordnung oder nicht mehr nutzbare Energie.", definition: "Der Begriff ist physikalisch präzise und darf metaphorisch nur vorsichtig verwendet werden.", woek: "Als begrenzte Metapher für Ordnungsverlust, Zerstreuung, Systemverschleiß oder steigende Reparaturkosten.", related: ["verlustleistung", "wirkungsresilienz", "systemgrenze"], statusNote: "Nicht als allgemeine Weltformel überdehnen." }),
  term({ id: "hebelpunkt", title: "Hebelpunkt", category: "Physik, Energie und Wirkungsmetaphern", short: "Ein Hebelpunkt ist ein Ort im System, an dem eine Veränderung besonders große Folgewirkungen erzeugen kann.", definition: "Der Begriff schließt an Donella Meadows an und hilft, nicht nur Symptome, sondern Systembedingungen zu verändern.", woek: "Wichtig für Wirkungslenkung, Wirkungsarchitektur und Transformationswirkung.", related: ["wirkungslenkung", "transformationswirkung", "rueckkopplung", "systemgrenze"] }),
  term({ id: "schwellenwert", title: "Schwellenwert", category: "Physik, Energie und Wirkungsmetaphern", short: "Ein Schwellenwert ist eine Grenze, ab der ein Zustand, Risiko oder Bewertungsfeld anders eingeordnet wird.", definition: "Schwellenwerte machen rote Linien, Kipppunkte, Mindestbedingungen oder Bewertungswechsel sichtbar.", woek: "Relevant für Reverse Merit Order, Wirkungsgrenzen, Klimarisiken und Scorecards.", related: ["kipppunkt", "wirkungsgrenze", "reverse-merit-order", "scorecard"] }),
  term({ id: "resonanz", title: "Resonanz", category: "Physik, Energie und Wirkungsmetaphern", concept: "precision", short: "Resonanz beschreibt die Verstärkung eines Impulses, wenn er auf ein aufnahmefähiges System trifft.", definition: "Physikalisch ist Resonanz an Schwingungen gebunden. Sozial wird der Begriff als Metapher für Aufnahme, Verstärkung oder Rückwirkung genutzt.", woek: "Grundlage für Resonanzräume, Medienwirkung, Narrative und Anschlussfähigkeit.", related: ["resonanzraum", "anschlussfaehigkeit", "salienz", "narrativ"] }),
  term({ id: "folgewirkung", title: "Folgewirkung", category: "WÖk-Begriff", concept: "core", short: "Folgewirkung ist eine indirekte, zeitversetzte oder aus erster Wirkung hervorgehende Wirkung.", definition: "Folgewirkungen entstehen, wenn eine erste Zustandsveränderung weitere Veränderungen auslöst, verstärkt oder verschiebt.", woek: "Der Begriff hilft, Wirkung nicht nur unmittelbar und linear zu denken, sondern in Wirkungspfaden und Rückkopplungen.", related: ["wirkung", "wirkungspfad", "rueckkopplung", "klimafolgeschaeden"] }),
  term({ id: "glossar-publizierungsprozess", title: "Glossar-Publizierungsprozess", category: "Glossar-Publizierungsprozess", concept: "method", short: "Der Glossar-Publizierungsprozess regelt, wie neue Begriffe geprüft, eingeordnet, verlinkt, belegt und veröffentlicht werden.", definition: "Er umfasst Artikel-Scan, Kandidatenprüfung, Quellenlogik, Statusvergabe, Related-Terms, Backlink-Audit, Suchindex, Sitemap und Linkprüfung.", woek: "Sichert, dass externe Anschlussbegriffe nicht vereinnahmt werden und WÖk-Kernbegriffe konsistent bleiben.", related: ["glossar-backlink-audit", "wirkung", "wirkungspotenzial", "wirkungsrisiko"] }),
  term({ id: "glossar-backlink-audit", title: "Glossar-Backlink-Audit", category: "Glossar-Publizierungsprozess", concept: "method", short: "Das Glossar-Backlink-Audit prüft, wo neue Begriffe im bestehenden Content vorkommen und welche internen Verknüpfungen sinnvoll sind.", definition: "Es verhindert Link-Wüsten und hilft, pro Seite nur fachlich zentrale Nennungen zu verknüpfen.", woek: "Macht den Übergang von Begriffspflege zu Website-Wirkung nachvollziehbar.", related: ["glossar-publizierungsprozess", "anschlussfaehigkeit", "resonanzraum"] }),
];

const CAT_THINKERS = "Vordenker:innen und Bezugslinien";
const CAT_VALUES = "Werte, Normativität und Bewertung";
const CAT_CAPITAL = "Kapital, Markt und Eigentum";
const CAT_LANGUAGE = "Sprache, Wirklichkeit und Kommunikation";
const CAT_ETHICS = "Ethik, Würde und Verantwortung";
const CAT_SYSTEMS = "Systemtheorie, Konstruktivismus und Kybernetik";
const CAT_MANAGEMENT2 = "Management, Organisation und Wirksamkeit";
const CAT_TRANSFORMATION = "Transformation, Innovation und wirtschaftliche Entwicklung";

function thinker({ id, title, short, idea, woek, correction, related = [], sourceGroup = "capital", aliases = [], reviewStatus = "approved" }) {
  return term({
    id,
    title,
    category: CAT_THINKERS,
    concept: "thinker",
    short,
    definition: `${idea} WÖk-Korrektur / Abgrenzung: ${correction}`,
    woek,
    aliases,
    related,
    sourceGroup,
    reviewStatus,
    usage: "Als Bezugslinie verwenden, nicht als Autoritätsbeweis oder biografischen Lexikoneintrag.",
  });
}

const controlledClusterAdditions = [
  term({
    id: "sechster-kondratieff",
    title: "6. Kondratieff",
    category: CAT_TRANSFORMATION,
    concept: "precision",
    short: "Der 6. Kondratieff beschreibt in der Wirkungsökonomie die Transformationswelle des 21. Jahrhunderts, in der Nachhaltigkeit, Resilienz, Gesundheit und Wirkung zur zentralen Entwicklungslogik werden.",
    definition: "Der 6. Kondratieff ist in der WÖk ein Deutungsmuster für eine langfristige wirtschaftliche und gesellschaftliche Transformationswelle. Die Leitlogik verschiebt sich von Kapital- und Ressourcenoptimierung zu Wirkung, Resilienz, Gesundheit, SDGs, SDG+, Kreislaufwirtschaft, digitalen Wirkungsdaten, demokratischer Stabilität und systemischer Zukunftsfähigkeit.",
    woek: "Die Wirkungsökonomie versteht den 6. Kondratieff als Übergang von der Effizienzlogik zur Wirkungslogik: Wie erzeugen wir mit vorhandenen Ressourcen die größte positive Netto-Wirkung für Mensch, Planet und Demokratie? Er beschreibt Wirkung maximieren und Impact-Intensität als makroökonomische Leitfrage, aber kein Prognosegesetz.",
    aliases: ["6. Kondratieff", "sechster Kondratieff", "sechste lange Welle", "sechste Kondratieff-Welle", "Sixth Kondratieff"],
    related: ["kondratieff-zyklus", "transformationswelle", "wirkungsinnovation", "wirkungskapital", "wirkungsoekonomie", "nachhaltigkeit", "resilienz", "gesundheit", "sdgs", "sdg-plus", "t-sroi", "kreislaufwirtschaft", "wirkungsarchitektur", "wirkungsresilienz", "positive-netto-wirkung"],
    sourceGroup: "innovation",
    statusNote: "Nicht deterministisch formulieren; Deutungsmodell, keine naturgesetzliche Vorhersage.",
  }),
  term({
    id: "thg-emissions-scopes",
    title: "THG-Emissions-Scopes",
    category: "Klima, Lebenszyklus und ökologische Wirkung",
    concept: "method",
    short: "THG-Emissions-Scopes unterscheiden Emissionen danach, ob sie direkt entstehen, aus eingekaufter Energie stammen oder entlang der Wertschöpfungskette auftreten.",
    definition: "Die Emissions-Scopes des GHG Protocols strukturieren betriebliche Treibhausgasemissionen in Scope 1, Scope 2 und Scope 3: direkte Emissionen aus eigenen oder kontrollierten Quellen, indirekte Emissionen aus eingekaufter Energie und weitere indirekte Emissionen entlang der vor- und nachgelagerten Wertschöpfungskette.",
    woek: "Die Scopes sind zentrale Anschlussbegriffe für Wirkungsdaten, Klimabilanzierung, Produktwirkung, Lieferkettenwirkung, Wirkungskapital und Produktwirkungssteuer.",
    aliases: ["Scope 1, 2 und 3", "Emissionsscopes", "GHG Scopes", "Greenhouse Gas Scopes"],
    related: ["scope-1", "scope-2", "scope-3", "treibhausgasemissionen", "co2e", "product-carbon-footprint", "lebenszyklusanalyse", "lieferkette", "scope-3-datenqualitaet", "woek-id", "csrd", "esrs-e1", "ghg-protocol", "klimawirkung"],
    sourceGroup: "scope",
  }),
  term({
    id: "scope-1",
    title: "Scope 1",
    category: "Klima, Lebenszyklus und ökologische Wirkung",
    concept: "method",
    short: "Scope 1 umfasst direkte Treibhausgasemissionen aus Quellen, die ein Unternehmen besitzt oder kontrolliert.",
    definition: "Scope-1-Emissionen entstehen direkt durch Tätigkeiten eines Unternehmens, etwa durch eigene Heizkessel, Öfen, Produktionsanlagen, Unternehmensfahrzeuge, Prozess-Emissionen oder Kältemittelverluste.",
    woek: "Scope 1 ist ein zentraler Indikator für direkte Klimawirkung und operative Verantwortung. Scope-1-Daten können in WÖk-IDs, Scorecards, Produktwirkungssteuer, Unternehmenswirkung und T-SROI einfließen, zeigen aber nicht die gesamte Klimawirkung.",
    aliases: ["Scope-1-Emissionen", "direkte Emissionen", "direkte THG-Emissionen"],
    examples: ["Dieselverbrauch eigener Lkw", "Erdgasverbrennung in eigenen Heizkesseln", "Prozess-Emissionen in Chemie oder Zement", "Kältemittelverluste aus eigenen Anlagen"],
    related: ["thg-emissions-scopes", "scope-2", "scope-3", "treibhausgasemissionen", "co2e", "emissionsfaktor", "klimawirkung", "product-carbon-footprint", "woek-id", "esrs-e1"],
    sourceGroup: "scope",
  }),
  term({
    id: "scope-2",
    title: "Scope 2",
    category: "Klima, Lebenszyklus und ökologische Wirkung",
    concept: "method",
    short: "Scope 2 umfasst indirekte Treibhausgasemissionen aus eingekaufter Energie, insbesondere Strom, Dampf, Wärme oder Kühlung.",
    definition: "Scope-2-Emissionen entstehen bei der Erzeugung von Energie, die ein Unternehmen einkauft und verbraucht. Sie können location-based nach durchschnittlichem Standortmix oder market-based nach vertraglich eingekaufter Energie beziehungsweise Herkunftsnachweisen ausgewiesen werden.",
    woek: "Scope 2 zeigt, wie stark ein Unternehmen über seinen Energiebezug auf Klimawirkung einwirkt. Es ist zentral für erneuerbaren Strom, Energieeffizienz, Gebäude, Rechenzentren, Produktionsstandorte und Energiebeschaffung.",
    aliases: ["Scope-2-Emissionen", "indirekte Energieemissionen", "Emissionen aus eingekaufter Energie"],
    examples: ["Stromverbrauch in Produktionshallen", "Stromverbrauch in Bürogebäuden", "eingekaufte Fernwärme", "eingekaufter Dampf", "eingekaufte Kühlung"],
    related: ["thg-emissions-scopes", "scope-1", "scope-3", "erneuerbarer-strom", "energieeffizienz", "strommix", "herkunftsnachweis-hkn", "product-carbon-footprint", "esrs-e1"],
    sourceGroup: "scope",
  }),
  term({
    id: "scope-3",
    title: "Scope 3",
    category: "Klima, Lebenszyklus und ökologische Wirkung",
    concept: "method",
    short: "Scope 3 umfasst weitere indirekte Treibhausgasemissionen entlang der vor- und nachgelagerten Wertschöpfungskette eines Unternehmens.",
    definition: "Scope-3-Emissionen entstehen durch Aktivitäten, die mit dem Unternehmen verbunden sind, aber nicht direkt von ihm kontrolliert werden und nicht unter Scope 2 fallen: eingekaufte Waren, Kapitalgüter, Transporte, Geschäftsreisen, Pendeln, Abfall, Nutzung verkaufter Produkte, Weiterverarbeitung, End-of-Life, Investitionen, Franchise- oder Leasingaktivitäten.",
    woek: "Scope 3 ist besonders wichtig, weil viele ökologische und soziale Wirkungen in Lieferketten, Produktnutzung und Entsorgung entstehen. Ohne Scope 3 bleibt Klimawirkung oft dort unsichtbar, wo sie tatsächlich entsteht.",
    aliases: ["Scope-3-Emissionen", "Wertschöpfungskettenemissionen", "Lieferkettenemissionen", "indirekte Wertschöpfungskettenemissionen"],
    examples: ["eingekaufte Rohstoffe und Vorprodukte", "Lieferantentransporte", "Geschäftsreisen", "Nutzung verkaufter Produkte", "End-of-Life-Behandlung verkaufter Produkte"],
    related: ["thg-emissions-scopes", "scope-1", "scope-2", "scope-3-datenqualitaet", "lieferkette", "digitaler-produktpass", "product-carbon-footprint", "lebenszyklusanalyse", "woek-id", "reverse-merit-order", "produktwirkungssteuer", "externalisierung", "greenwashing", "wirkungsblindheit"],
    sourceGroup: "scope",
  }),
  term({
    id: "scope-3-datenqualitaet",
    title: "Scope-3-Datenqualität",
    category: "Klima, Lebenszyklus und ökologische Wirkung",
    concept: "precision",
    short: "Scope-3-Datenqualität beschreibt, wie vollständig, belastbar, überprüfbar und differenziert indirekte Emissionsdaten entlang der Wertschöpfungskette sind.",
    definition: "Scope-3-Datenqualität bewertet Vollständigkeit, Primärdatenanteil, Lieferantenabdeckung, Kategorienabdeckung, Aktualität, Prüfbarkeit, Methodenkonsistenz und Transparenz über Unsicherheit.",
    woek: "Schlechte Scope-3-Daten sind selbst ein Wirkungsrisiko, weil sie Externalisierung unsichtbar halten. Fehlende Daten dürfen keinen Vorteil erzeugen.",
    aliases: ["Scope 3 Datenqualität", "Scope-3-Qualität", "Wertschöpfungsketten-Datenqualität", "Lieferketten-Datenqualität"],
    related: ["scope-3", "datenqualitaet", "wirkungsdaten", "lieferkette", "digitaler-produktpass", "woek-id", "product-carbon-footprint", "lebenszyklusanalyse", "wirkungsblindheit", "wirkungssimulation", "greenwashing"],
    sourceGroup: "scope",
  }),

  thinker({ id: "adam-smith", title: "Adam Smith", sourceGroup: "capital", short: "Adam Smith ist für die Wirkungsökonomie relevant, weil seine Markttheorie ursprünglich nicht ohne Moral, Sympathie, Gerechtigkeit und gesellschaftliche Ordnung gedacht war.", idea: "Smith zeigt Märkte als dezentrale Koordination, aber nicht als moral- und institutionsfreie Maschine. Arbeitsteilung, Sympathie und gesellschaftliche Ordnung gehören zur Einbettung des Marktes.", woek: "Die WÖk knüpft an Marktkoordination an und korrigiert die Verkürzung auf Gewinn, Eigeninteresse und unsichtbare Hand: Preise müssen Wirkungswahrheit tragen.", correction: "Smith wird nicht als Kronzeuge ungezügelter Kapitalsteuerung genutzt.", related: ["markt", "kapital", "wirkungswahrheit", "externalisierung", "gemeinwohl", "marktwert"] }),
  thinker({ id: "karl-marx", title: "Karl Marx", sourceGroup: "capital", short: "Karl Marx ist relevant, weil er Kapital als gesellschaftliches Macht- und Produktionsverhältnis analysiert.", idea: "Marx beschreibt Kapitalmacht, Mehrwert, Ausbeutung, Entfremdung, Warenform und Krisendynamik. Damit wird sichtbar, dass Wirtschaft nicht nur Tausch, sondern auch Machtordnung ist.", woek: "Die WÖk übernimmt die Kritik an Kapitalmacht und Externalisierung, operationalisiert aber Wirkungsverantwortung statt Eigentumsform allein.", correction: "Eigentumsform ersetzt keine Wirkungsprüfung; auch staatliches, genossenschaftliches oder gemeinnütziges Eigentum kann negative Wirkung erzeugen.", related: ["kapital", "kapital-als-machtverhaeltnis", "mehrwert", "entfremdung", "warenfetisch", "externalisierung", "wirkungsverantwortung"] }),
  thinker({ id: "immanuel-kant", title: "Immanuel Kant", sourceGroup: "ethics", short: "Immanuel Kant ist relevant, weil Wirkungsökonomie nicht rein utilitaristisch sein darf.", idea: "Kants Würdebezug, Autonomie und kategorischer Imperativ markieren Grenzen, die nicht durch Gesamtnutzen verrechnet werden dürfen.", woek: "Daraus folgt die Logik von Wirkungsgrenzen, Nichtkompensation und rechtsstaatlicher Begrenzung von Steuerung.", correction: "Die WÖk ist keine reine Pflichtethik; sie fragt zusätzlich nach tatsächlichen Zustandsveränderungen.", related: ["menschenwuerde", "wirkungsgrenze", "nichtkompensation", "rechtsstaatlichkeit", "wirkungsethik"] }),
  thinker({ id: "ludwig-wittgenstein", title: "Ludwig Wittgenstein", sourceGroup: "communication", short: "Ludwig Wittgenstein ist relevant, weil Bedeutung im Gebrauch, in Sprachspielen und Lebensformen entsteht.", idea: "Begriffe wie Freiheit, Leistung, Wert, Markt, Nachhaltigkeit oder Wirkung wirken nicht isoliert. Ihr Gebrauch ordnet Wirklichkeit und Handlungsräume.", woek: "Die WÖk braucht präzise Glossararbeit, weil unterschiedliche Sprachspiele unterschiedliche Wirkungspotenziale entfalten.", correction: "Bedeutung als Gebrauch ist kein Relativismus; Zustandsveränderungen bleiben real.", related: ["sprachspiel", "bedeutung-als-gebrauch", "lebensform", "wirklichkeitskonstruktion", "framing"] }),
  thinker({ id: "ernst-von-glasersfeld", title: "Ernst von Glasersfeld", sourceGroup: "communication", short: "Ernst von Glasersfeld ist relevant, weil Fakten nicht einfach übertragen, sondern konstruktiv verarbeitet werden.", idea: "Radikaler Konstruktivismus erklärt, dass Wissen anhand von Erfahrung, Modellen und Anschlussmöglichkeiten aufgebaut wird.", woek: "Fakten brauchen Resonanz, Anschlussfähigkeit, Kontext und Vertrauen, damit Wirkung aufgenommen werden kann.", correction: "Konstruktivismus bedeutet nicht Beliebigkeit: Wirkung bleibt real, Deutung ist konstruiert.", related: ["wirklichkeitskonstruktion", "viabilitaet", "anschlussfaehigkeit", "lernen", "wirkungsintegration"] }),
  thinker({ id: "paul-watzlawick", title: "Paul Watzlawick", sourceGroup: "communication", short: "Paul Watzlawick ist relevant für Kommunikation als Beziehung, Kontext, Rahmung und Wirkungspotenzial.", idea: "Kommunikation wirkt nicht nur durch Inhalt, sondern auch durch Beziehung, Ton, Wiederholung, Kontext und Metakommunikation.", woek: "Faktenkommunikation ist immer auch Wirkkommunikation und muss Wirkungspotenzial, Reframing und Resonanzraum beachten.", correction: "Nicht jede Kommunikation ist bereits Wirkung im engeren Sinn; sie erzeugt zunächst Potenzial, Deutung und Anschlussfähigkeit.", related: ["kommunikation", "metakommunikation", "reframing", "resonanzraum", "wirklichkeitskonstruktion"] }),
  thinker({ id: "maturana-varela", title: "Humberto Maturana und Francisco Varela", sourceGroup: "communication", short: "Maturana und Varela sind relevant, weil lebende und soziale Systeme nicht mechanisch steuerbar sind.", idea: "Autopoiesis, Strukturdeterminiertheit, strukturelle Kopplung und strukturelles Driften zeigen, dass Systeme Impulse nach eigener Struktur verarbeiten.", woek: "Wenn direkte Kontrolle unmöglich ist, braucht es Rückkopplung, Wirkungsdaten, Resonanzräume und lernende Anreizarchitektur.", correction: "Die WÖk übernimmt Nichtmechanik, bleibt aber demokratisch und steuerungsorientiert.", aliases: ["Humberto Maturana", "Francisco Varela"], related: ["autopoiesis", "strukturdeterminiertheit", "strukturelle-kopplung", "strukturelles-driften", "selbstorganisation"] }),
  thinker({ id: "heinz-von-foerster", title: "Heinz von Foerster", sourceGroup: "systems2", short: "Heinz von Foerster ist relevant, weil Gesellschaft nicht als triviale Maschine verstanden werden kann.", idea: "Nichttrivialität, Beobachtung zweiter Ordnung und Kybernetik zweiter Ordnung machen sichtbar, dass Beobachter:innen Teil des Systems sind.", woek: "Politik, Medien, Märkte und Menschen reagieren nicht linear; Wirkungssteuerung muss lernend, rückgekoppelt, transparent und fehlbar sein.", correction: "Nichttrivialität ist kein Grund, nicht zu steuern, sondern ein Grund, anders zu steuern.", aliases: ["von Foerster"], related: ["triviale-maschine", "nichttriviale-maschine", "beobachtung-zweiter-ordnung", "kybernetik-zweiter-ordnung", "verantwortung"] }),
  thinker({ id: "stafford-beer", title: "Stafford Beer", sourceGroup: "systems2", short: "Stafford Beer ist relevant für Organisationen als lebensfähige, rekursive Systeme.", idea: "Das Viable System Model verbindet operative Einheiten, Koordination, Kontrolle, Intelligenz und normative Identität.", woek: "Beers Systemlogik ist Anschlussmodell für Wirkungsarchitektur, Verwaltung, Unternehmen, Wirkungsrat und lernende Institutionen.", correction: "Kein Organisationsdogma, sondern Werkzeug für Wirkungsgovernance und Rückkopplung.", related: ["viable-system-model", "viabilitaet", "varietaet", "rekursion", "wirkungsarchitektur"] }),
  thinker({ id: "gregory-bateson", title: "Gregory Bateson", sourceGroup: "systems2", short: "Gregory Bateson ist relevant, weil Wirkung in Mustern, Kontexten und Beziehungen entsteht.", idea: "Bateson lenkt Aufmerksamkeit auf Kontext, Lernen, Metakommunikation und den Unterschied, der einen Unterschied macht.", woek: "Das passt zu Resonanzraum, Interdependenz, Wirkungsnetz und Kommunikation als Folgewirkungsraum.", correction: "Nicht als poetische Metapher verwenden, sondern als Hinweis auf Muster und Kontext.", related: ["interdependenz", "resonanzraum", "wirkungsnetz", "metakommunikation", "double-bind"] }),
  thinker({ id: "niklas-luhmann", title: "Niklas Luhmann", sourceGroup: "systems2", short: "Niklas Luhmann ist relevant, weil moderne Gesellschaften nicht zentral durchsteuerbar sind.", idea: "Wirtschaft, Recht, Politik, Wissenschaft und Medien folgen eigenen Codes und erzeugen Anschlusskommunikation.", woek: "Die WÖk muss Wirkungsrückkopplung systemübergreifend, aber nicht naiv zentralistisch denken.", correction: "Die WÖk bleibt normativ und steuerungsorientiert: Sie beschreibt nicht nur, sondern fragt nach Wirkung für Mensch, Planet und Demokratie.", related: ["soziale-systeme", "selbstreferenz", "beobachtung-zweiter-ordnung", "anschlussfaehigkeit", "rueckkopplung"] }),
  thinker({ id: "frederic-vester", title: "Frederic Vester", sourceGroup: "systems2", short: "Frederic Vester ist relevant für vernetztes Denken und nichtlineare Folgewirkungen.", idea: "Vester zeigt, dass Systemverhalten aus Wechselwirkungen, Rückkopplungen und indirekten Effekten entsteht.", woek: "Er unterstützt die WÖk-Logik, dass Einzelindikatoren nicht reichen und Wirkungsnetze nötig sind.", correction: "Vernetztes Denken ersetzt keine normative Bewertung.", related: ["vernetztes-denken", "interdependenz", "rueckkopplung", "folgewirkung", "hebelpunkt"] }),
  thinker({ id: "donella-meadows", title: "Donella Meadows", sourceGroup: "systems2", short: "Donella Meadows ist relevant, weil Zielgrößen und Paradigmen tiefe Hebel in Systemen sind.", idea: "Meadows unterscheidet Parameter, Rückkopplungen, Informationsflüsse, Regeln, Ziele und Paradigmen als Hebelpunkte.", woek: "Die WÖk setzt beim tiefen Hebel an: Kapital als Zielgröße wird durch Wirkung ersetzt.", correction: "Hebelpunkte sind Analysehilfen, keine automatische Steuerungsgarantie.", related: ["hebelpunkt", "systemgrenze", "rueckkopplung", "wirkungslenkung", "wirkungsarchitektur"] }),
  thinker({ id: "peter-drucker", title: "Peter Drucker", sourceGroup: "management2", short: "Peter Drucker ist relevant, weil Gewinn für ihn nicht der eigentliche Zweck, sondern ein Test wirtschaftlicher Tragfähigkeit ist.", idea: "Drucker betont Effektivität, Kundennutzen, Managementverantwortung und Ergebnisse.", woek: "Die WÖk ergänzt: Der Gewinntest ist nur belastbar, wenn Preise Wirkung abbilden.", correction: "In wirkungsblinden Märkten kann Gewinn auch erfolgreiche Externalisierung anzeigen.", related: ["effektivitaet", "effizienz", "kundennutzen", "gewinn-als-test", "management"] }),
  thinker({ id: "hans-ulrich", title: "Hans Ulrich", sourceGroup: "management2", short: "Hans Ulrich ist relevant für Unternehmen als offene, produktive soziale Systeme.", idea: "Sein systemorientiertes Management betrachtet Umweltbezug, Anspruchsgruppen, Ganzheitlichkeit und Wechselwirkungen.", woek: "Die WÖk erweitert diese Sicht um messbare Wirkung auf Mensch, Planet und Demokratie.", correction: "Ganzheitlichkeit bleibt ohne Wirkungsdaten und Rückkopplung zu allgemein.", related: ["systemorientiertes-management", "st-galler-management-modell", "anspruchsgruppen", "management"] }),
  thinker({ id: "fredmund-malik", title: "Fredmund Malik", sourceGroup: "management2", short: "Fredmund Malik ist relevant für Management in komplexen Systemen und wirksame Führung.", idea: "Malik betont Resultatorientierung, Selbstorganisation, Komplexitätsmanagement und systemorientierte Führung.", woek: "Die WÖk ergänzt: Resultate müssen als Wirkung gelesen werden, nicht nur als Zielerreichung oder Performance.", correction: "Wirksamkeit braucht Referenzrahmen Mensch, Planet und Demokratie.", related: ["wirksames-management", "komplexitaetsmanagement", "selbstorganisation", "wirksamkeit"] }),
  thinker({ id: "jochen-roepke", title: "Jochen Röpke", sourceGroup: "innovation", short: "Jochen Röpke ist relevant, weil Transformation unternehmerisches Lernen und Selbstveränderung verlangt.", idea: "Der lernende Unternehmer entwickelt Wahrnehmung, Kompetenz, Risiko- und Innovationsfähigkeit.", woek: "Der WÖk-Unternehmer wird zum Wirkungsakteur, der Wirkungen liest und bessere Wirkungspfade erzeugt.", correction: "Unternehmertypen und Lernebenen bleiben quellenprüfpflichtig, bevor sie endgültig Röpke zugeschrieben werden.", related: ["lernender-unternehmer", "unternehmerisches-lernen", "evolutorischer-unternehmer", "lernebenen"], reviewStatus: "needs_source_check" }),
  thinker({ id: "joseph-schumpeter", title: "Joseph A. Schumpeter", sourceGroup: "innovation", short: "Joseph A. Schumpeter ist relevant für Innovation als neue Kombination.", idea: "Schumpeter beschreibt Unternehmerfunktion, Innovation, wirtschaftliche Entwicklung und schöpferische Zerstörung.", woek: "Die WÖk korrigiert: Neuheit ist nicht automatisch Fortschritt; Fortschritt ist Innovation mit positiver Netto-Wirkung.", correction: "Schöpferische Zerstörung legitimiert keine Schäden an Mensch, Planet oder Demokratie.", aliases: ["Schumpeter"], related: ["innovation", "rekombination", "unternehmerfunktion", "schoepferische-zerstoerung", "wirkungsinnovation"] }),
  thinker({ id: "nikolai-kondratieff", title: "Nikolai Kondratieff", sourceGroup: "innovation", short: "Nikolai Kondratieff ist relevant als Bezugslinie langfristiger wirtschaftlicher Entwicklungswellen.", idea: "Lange Wellen dienen als Deutungsmuster für Bündel aus Technologie, Infrastruktur, Kapital, Kompetenzen, Institutionen und Akzeptanz.", woek: "Die WÖk nutzt Kondratieff vorsichtig, um Transformationswellen und den 6. Kondratieff einzuordnen.", correction: "Nicht deterministisch verwenden.", aliases: ["Kondratieff"], related: ["kondratieff-zyklus", "sechster-kondratieff", "basisinnovation", "transformationswelle"] }),
  thinker({ id: "maja-goepel", title: "Maja Göpel", sourceGroup: "transformation", short: "Maja Göpel ist relevant als Transformations- und Wohlstandsdenkerin.", idea: "Sie steht für Wohlstand neu denken, Systemgrenzen, planetare Grenzen, Zukunftsfähigkeit und Möglichkeitsräume.", woek: "Die WÖk nimmt diese Anschlusslinie auf und ergänzt eine operative Steuerungsarchitektur aus WÖk-IDs, Scorecards, DPP, T-SROI, Wirkungsrat, Preisen, Steuern, Kapital und Rückkopplung.", correction: "Maja Göpel ist Anschlusslinie im Transformationsdenken, keine direkte Grundlage der WÖk.", related: ["wohlstand", "systemgrenze", "planetare-grenzen", "zukunftsfaehigkeit", "wirkungsarchitektur"] }),
  thinker({ id: "amartya-sen", title: "Amartya Sen", sourceGroup: "ethics", short: "Amartya Sen ist relevant, weil Wohlstand nicht nur Einkommen, sondern reale Freiheit und Befähigung ist.", idea: "Development as Freedom verbindet Entwicklung mit tatsächlichen Handlungsmöglichkeiten.", woek: "Die WÖk ergänzt: Befähigungen müssen über Wirkung messbar, steuerbar und systemisch abgesichert werden.", correction: "Befähigung ersetzt keine Wirkungsarchitektur.", related: ["befaehigungen", "reale-freiheit", "wohlstand", "wirkungseinkommen"] }),
  thinker({ id: "martha-nussbaum", title: "Martha Nussbaum", sourceGroup: "ethics", short: "Martha Nussbaum ist relevant für Würde, zentrale Fähigkeiten und gutes Leben.", idea: "Der Capability Approach gibt einen normativen Rahmen für menschliche Entfaltung und soziale Gerechtigkeit.", woek: "Die WÖk übersetzt Befähigung in Wirkung, Scorecards und politische Steuerung.", correction: "Die Liste zentraler Fähigkeiten wird nicht eins zu eins als WÖk-Messsystem übernommen.", related: ["capability-approach", "menschenwuerde", "befaehigungen", "soziale-gerechtigkeit"] }),
  thinker({ id: "hannah-arendt", title: "Hannah Arendt", sourceGroup: "ethics", short: "Hannah Arendt ist relevant, weil menschliches Handeln nicht in Arbeit und Produktion aufgeht.", idea: "Vita activa unterscheidet Arbeiten, Herstellen und Handeln. Öffentlichkeit und politisches Handeln sind eigene Räume.", woek: "Die WÖk liest Öffentlichkeit, Demokratie und Weltbezug als Wirkungsräume, nicht als Nebenfolgen von Wirtschaft.", correction: "Arendt wird nicht auf Arbeitsmarkt- oder Produktivitätsfragen verkürzt.", related: ["oeffentlichkeit", "demokratie", "wirkungsraum", "politisches-handeln"] }),
  thinker({ id: "elinor-ostrom", title: "Elinor Ostrom", sourceGroup: "transformation", short: "Elinor Ostrom ist relevant für dezentrale, regelbasierte Selbstorganisation von Gemeingütern.", idea: "Commons, lokale Institutionen, Vertrauen und polyzentrische Governance zeigen Alternativen zu Markt oder Zentralstaat allein.", woek: "Die WÖk knüpft daran an, wenn Wirkung über Daten, Regeln, Rückkopplung und plural kontrollierte Institutionen gesteuert wird.", correction: "Commons ersetzen keine Wirkungsprüfung und keine demokratische Verantwortlichkeit.", related: ["commons", "gemeingueter", "selbstorganisation", "polyzentrische-governance", "vertrauen"] }),
  thinker({ id: "karl-polanyi", title: "Karl Polanyi", sourceGroup: "capital", short: "Karl Polanyi ist relevant, weil Märkte institutionell eingebettet sind.", idea: "The Great Transformation beschreibt Entbettung, Marktgesellschaft, fiktive Waren und Gegenbewegungen.", woek: "Wirkungssteuerung ist eine neue Einbettung von Märkten in Mensch, Planet und Demokratie.", correction: "Einbettung ist kein Rückzug aus Märkten, sondern bessere Wirkungswahrheit und Rückkopplung.", related: ["einbettung", "entbettung", "markt", "externalisierung", "wirkungssteuer"] }),
  thinker({ id: "friedrich-hayek", title: "Friedrich Hayek", sourceGroup: "capital", short: "Friedrich Hayek ist relevant, weil Märkte dezentrales Wissen verarbeiten.", idea: "Preissignale und Marktprozesse können verstreutes Wissen koordinieren.", woek: "Die WÖk korrigiert: Preise verarbeiten nur, was im Preis erscheint. Wenn Wirkung externalisiert bleibt, ist das Preissignal unwahr.", correction: "Hayek wird als Bezugslinie für Wissensteilung genutzt, nicht als Freibrief wirkungsblinder Märkte.", related: ["dezentrales-wissen", "preissignal", "markt", "wirkungswahrheit", "externalisierung"] }),
  thinker({ id: "john-maynard-keynes", title: "John Maynard Keynes", sourceGroup: "capital", short: "John Maynard Keynes ist relevant für makroökonomische Stabilisierung unter Unsicherheit.", idea: "Keynes zeigt, dass Nachfrage, Investitionen und staatliche Krisenintervention wirtschaftliche Stabilität beeinflussen.", woek: "Die WÖk ergänzt: Stabilisierung braucht Wirkungsrichtung. Staatsausgaben sind nicht automatisch positive Wirkung.", correction: "Nicht jede Nachfrage ist wohlfahrtssteigernd; Wirkung muss mitgeprüft werden.", related: ["makrooekonomische-stabilisierung", "unsicherheit", "wirkungshaushalt", "wirkungssteuer"] }),
  thinker({ id: "alan-watts-daoismus", title: "Alan Watts / Daoismus", sourceGroup: "dao", short: "Alan Watts und Daoismus sind als Erinnerung relevant, dass der Mensch nicht außerhalb der Welt steht, die er steuert.", idea: "Wu Wei, Prozessdenken, Nicht-Dualität und Verbundenheit dienen als Gegenbild zu Beherrschungsillusion.", woek: "Die WÖk nutzt diese Bezugslinie funktional: nicht gegen Steuerung, sondern für Rückkopplung, Selbstorganisation und Nicht-Erzwingen.", correction: "Keine spirituelle Theorie und keine Sammlung einzelner Zitate.", aliases: ["Alan Watts", "Daoismus"], related: ["dao", "wu-wei", "prozessdenken", "nicht-dualitaet", "selbstorganisation"] }),

  term({ id: "wert", title: "Wert", category: CAT_VALUES, concept: "precision", short: "Wert bezeichnet in der Wirkungsökonomie nicht nur Preis, Nutzen oder subjektive Bedeutung, sondern muss nach systemischem und normativem Bezug unterschieden werden.", definition: "Wert ist mehrdeutig. Die WÖk unterscheidet Marktwert, Gebrauchswert, Tauschwert, Business Value, Wirkungswert, systemischen Wert und normativen Wert.", woek: "Ohne Wertunterscheidung werden Preis, Nutzen, Moral und Wirkung vermischt.", related: ["werte", "marktwert", "gebrauchswert", "tauschwert", "wirkungswert", "systemischer-wert", "normativer-wert"], sourceGroup: "capital" }),
  term({ id: "werte", title: "Werte", category: CAT_VALUES, concept: "precision", short: "Werte sind normative Orientierungen, die anzeigen, was als wünschenswert, schützenswert oder handlungsleitend gilt.", definition: "Werte geben Richtung, aber sie ersetzen keine Prüfung tatsächlicher Zustandsveränderungen.", woek: "Werte ohne Wirkung können Symbolik bleiben. Wirkung ohne Werte kann gefährlich werden.", related: ["wert", "wertewandel", "wertekonflikt", "wirkungsethik"], sourceGroup: "ethics" }),
  term({ id: "normativer-wert", title: "Normativer Wert", category: CAT_VALUES, concept: "precision", short: "Normativer Wert fragt, ob eine Wirkung im Referenzrahmen von Mensch, Planet und Demokratie wünschenswert ist.", definition: "Normativer Wert bezieht sich auf Schutzgüter, Ziele, Würde, Rechte, planetare Grenzen und demokratische Voraussetzungen.", woek: "Er verhindert, dass Wirkung nur technisch oder monetär gelesen wird.", related: ["systemischer-wert", "wirkungswert", "wirkungsethik", "mensch-planet-demokratie"], sourceGroup: "ethics" }),
  term({ id: "systemischer-wert", title: "Systemischer Wert", category: CAT_VALUES, concept: "precision", short: "Systemischer Wert fragt, ob eine Wirkung die Funktionsfähigkeit, Stabilität oder Entwicklungsfähigkeit eines Systems stärkt.", definition: "Systemischer Wert betrifft Resilienz, Vertrauen, Lernfähigkeit, Regenerationsfähigkeit und Rückkopplungsfähigkeit.", woek: "Er ergänzt normativen Wert, ohne ihn zu ersetzen.", related: ["normativer-wert", "wirkungswert", "wirkungsresilienz", "systemische-kohaerenz"], sourceGroup: "systems2" }),
  term({ id: "wirkungswert", title: "Wirkungswert", category: CAT_VALUES, concept: "precision", short: "Wirkungswert beschreibt den Wert einer Handlung, eines Produkts, einer Organisation oder Entscheidung gemessen an ihrer tatsächlichen Wirkung auf Mensch, Planet und Demokratie.", definition: "Wirkungswert ist nicht Marktwert. Er entsteht aus realen Zustandsveränderungen und ihrer normativen und systemischen Bewertung.", woek: "Zentral für Scorecards, T-SROI, Wirkungssteuer und positive Netto-Wirkung.", aliases: ["Impact Value"], related: ["impact-value", "positive-netto-wirkung", "t-sroi", "scorecard", "wirkungswertschoepfung"], sourceGroup: "capital" }),
  term({ id: "marktwert", title: "Marktwert", category: CAT_VALUES, short: "Marktwert beschreibt den Preis oder monetären Wert, den ein Gut, Unternehmen oder Vermögenswert am Markt erzielt.", definition: "Marktwert entsteht aus Angebot, Nachfrage, Erwartungen, Knappheit, Macht und Informationslage.", woek: "Marktwert ist nicht Wirkungswert. Er kann steigen, obwohl negative Wirkungen externalisiert werden.", related: ["wert", "wirkungswert", "externalisierung", "kapitalrendite"], sourceGroup: "capital" }),
  term({ id: "gebrauchswert", title: "Gebrauchswert", category: CAT_VALUES, short: "Gebrauchswert beschreibt den Nutzen eines Gutes für konkrete Bedürfnisse oder Zwecke.", definition: "Ein Produkt kann für Nutzer:innen nützlich sein und trotzdem Schäden in Lieferkette, Umwelt oder Demokratie erzeugen.", woek: "Gebrauchswert ist nicht automatisch positive Wirkung.", related: ["wert", "kundennutzen", "wirkungswert", "produktwirkung"], sourceGroup: "capital" }),
  term({ id: "tauschwert", title: "Tauschwert", category: CAT_VALUES, short: "Tauschwert beschreibt den Wert eines Gutes im Austauschverhältnis zu anderen Gütern oder Geld.", definition: "Tauschwert ist kapital- und marktbezogen und kann von Gebrauchswert oder Wirkungswert abweichen.", woek: "Die WÖk ergänzt den Tauschwert um Wirkungswert und Wirkungswahrheit.", related: ["wert", "marktwert", "gebrauchswert", "wirkungswert"], sourceGroup: "capital" }),
  term({ id: "wertewandel", title: "Wertewandel", category: CAT_VALUES, short: "Wertewandel beschreibt die Veränderung gesellschaftlicher Leitwerte über Zeit.", definition: "Wertewandel beeinflusst Wirkungsbewertung, Akzeptanz, Konsum, Innovation und Vertrauen.", woek: "WÖk muss Wertewandel transparent verhandeln, nicht verstecken.", related: ["werte", "wertekonflikt", "vertrauen", "transformationswelle"], sourceGroup: "transformation" }),
  term({ id: "wertekonflikt", title: "Wertekonflikt", category: CAT_VALUES, short: "Ein Wertekonflikt entsteht, wenn unterschiedliche normative Ziele oder Schutzgüter miteinander in Spannung geraten.", definition: "Wertekonflikte erscheinen etwa zwischen Freiheit, Sicherheit, Klima, Teilhabe, Eigentum, Gesundheit oder Demokratie.", woek: "Sie müssen als Zielkonflikte und Wirkungsabwägungen sichtbar gemacht werden. Nichtkompensation schützt rote Linien.", related: ["werte", "wirkungsgrenze", "nichtkompensation", "wirkungsethik"], sourceGroup: "ethics" }),
  term({ id: "wertschoepfung", title: "Wertschöpfung", category: CAT_CAPITAL, short: "Wertschöpfung beschreibt die Erzeugung von wirtschaftlichem Wert durch Arbeit, Kapital, Wissen, Organisation oder Ressourcen.", definition: "Wertschöpfung misst wirtschaftliche Erzeugung, aber nicht automatisch Zustandsverbesserung.", woek: "Die WÖk unterscheidet Wertschöpfung, Wirkungswert und Verlustleistung.", related: ["wirkungswertschoepfung", "wirkungswert", "verlustleistung", "kapital"], sourceGroup: "capital" }),
  term({ id: "wirkungswertschoepfung", title: "Wirkungswertschöpfung", category: CAT_CAPITAL, concept: "precision", short: "Wirkungswertschöpfung entsteht, wenn wirtschaftliche Aktivität reale positive Zustandsveränderungen für Mensch, Planet und Demokratie erzeugt.", definition: "Sie verbindet wirtschaftliche Tätigkeit mit positiven Zuständen, statt Wert nur monetär zu lesen.", woek: "Zielgröße für Unternehmen, Kapital, Beschaffung, Steuer und Transformation.", related: ["wertschoepfung", "wirkungswert", "positive-netto-wirkung", "wirkungskapital"], sourceGroup: "capital" }),
  term({ id: "kapital", title: "Kapital", category: CAT_CAPITAL, concept: "precision", short: "Kapital ist gespeicherte Handlungsmöglichkeit in monetärer, materieller, sozialer, natürlicher oder institutioneller Form.", definition: "Kapital kann ermöglichen, beschleunigen und absichern. Problematisch wird es, wenn es vom Werkzeug zur Zielgröße wird.", woek: "Die WÖk ordnet Kapital der Wirkung unter.", related: ["kapital-als-werkzeug", "kapital-als-machtverhaeltnis", "kapitalwirkung", "kapitalrendite", "wirkungskapital"], sourceGroup: "capital" }),
  term({ id: "kapitalrendite", title: "Kapitalrendite", category: CAT_CAPITAL, short: "Kapitalrendite beschreibt den finanziellen Ertrag auf eingesetztes Kapital.", definition: "Rendite zeigt monetären Rückfluss, aber nicht, welche Zustandsveränderungen dadurch entstehen.", woek: "Kapitalrendite ist nicht Wirkungsrendite. Hohe Rendite kann durch positive Wirkung oder Externalisierung entstehen.", related: ["kapital", "kapitalwirkung", "externalisierung", "wirkungskapital"], sourceGroup: "capital" }),
  term({ id: "kapitalwirkung", title: "Kapitalwirkung", category: CAT_CAPITAL, concept: "precision", short: "Kapitalwirkung beschreibt, welche Zustandsveränderungen Kapital durch Investition, Eigentum, Kredit, Renditeerwartung oder Machtkonzentration erzeugt.", definition: "Kapital wirkt über Allokation, Eigentum, Zugang, Risiko, Zins, Renditeerwartung und institutionelle Macht.", woek: "Kapitalwirkung ist die zentrale Frage, wenn Kapital nicht Ziel, sondern Werkzeug sein soll.", related: ["kapital", "wirkungskapital", "kapitalrendite", "kapital-als-machtverhaeltnis"], sourceGroup: "capital" }),
  term({ id: "kapital-als-machtverhaeltnis", title: "Kapital als Machtverhältnis", category: CAT_CAPITAL, short: "Kapital als Machtverhältnis beschreibt, dass Kapital Zugänge, Abhängigkeiten, Entscheidungsrechte und Einflussmöglichkeiten strukturiert.", definition: "Der Begriff schließt an Marx, Polanyi und moderne Kapitalmarktkritik an.", woek: "Die WÖk ergänzt: Macht muss an Wirkung rückgekoppelt werden.", related: ["kapital", "kapitalwirkung", "externalisierung", "wirkungsverantwortung", "karl-marx"], sourceGroup: "capital" }),
  term({ id: "kapital-als-werkzeug", title: "Kapital als Werkzeug", category: CAT_CAPITAL, concept: "precision", short: "Kapital als Werkzeug bedeutet, dass Kapital Mittel zur Gestaltung von Wirkung ist, aber nicht selbst der Maßstab von Fortschritt.", definition: "Kapital kann Schulen, Forschung, Infrastruktur, Unternehmen und Transformation ermöglichen.", woek: "Kapital wird problematisch, wenn Kapitalvermehrung zum Kompass wird.", related: ["kapital", "kapitalwirkung", "wirkungskapital", "positive-netto-wirkung"], sourceGroup: "capital" }),
  term({ id: "akkumulation", title: "Akkumulation", category: CAT_CAPITAL, short: "Akkumulation beschreibt die Anhäufung von Kapital, Vermögen oder Macht über Zeit.", definition: "Akkumulation kann Investitionsfähigkeit erzeugen, aber auch Machtkonzentration und Abhängigkeit.", woek: "Wirkungsökonomisch zählt, ob angesammeltes Kapital Transformationsfähigkeit stärkt oder demokratische und soziale Risiken verschärft.", related: ["kapital", "kapital-als-machtverhaeltnis", "kapitalwirkung"], sourceGroup: "capital" }),
  term({ id: "externalisierung", title: "Externalisierung", category: CAT_CAPITAL, concept: "precision", short: "Externalisierung beschreibt die Verlagerung von Kosten, Risiken oder Schäden auf andere Menschen, Natur, Institutionen oder zukünftige Generationen.", definition: "Externalisierung macht Schäden für Verursacher:innen unsichtbar oder billiger, während andere die Folgen tragen.", woek: "Externalisierung ist ein zentraler Grundfehler kapitalzentrierter Steuerung. Die WÖk macht externalisierte Wirkung sichtbar und koppelt sie in Preise, Steuern, Kapital und Verantwortung zurück.", related: ["wirkungsblindheit", "wirkungswahrheit", "produktwirkungssteuer", "scope-3", "kapitalwirkung"], sourceGroup: "capital" }),
  term({ id: "entfremdung", title: "Entfremdung", category: CAT_CAPITAL, short: "Entfremdung beschreibt den Verlust von Bezug zu Arbeit, Produkt, Mitmenschen, Natur oder sich selbst.", definition: "Anschluss an Marx, erweitert auf wirkungsblinde Arbeit, sinnlose Bürokratie, Plattformlogik, Konsum und Entkopplung von realen Folgen.", woek: "Entfremdung wird als Wirkungszustand lesbar, wenn Menschen die Folgen ihrer Arbeit oder ihres Konsums nicht mehr erfahren.", related: ["karl-marx", "wirkungsblindheit", "warenfetisch", "sinnvolle-arbeit"], sourceGroup: "capital" }),
  term({ id: "warenfetisch", title: "Warenfetisch", category: CAT_CAPITAL, short: "Warenfetisch beschreibt, dass soziale und ökologische Herstellungsbedingungen hinter der scheinbar neutralen Ware verschwinden.", definition: "Die Ware erscheint als isoliertes Ding, während Arbeit, Lieferkette, Naturverbrauch und Machtverhältnisse verdeckt bleiben.", woek: "Zentral für Produktwirkungssteuer, Digitalen Produktpass und Lieferkettenwirkung: Die WÖk macht sichtbar, was im Warenpreis verborgen bleibt.", related: ["produktwirkungssteuer", "digitaler-produktpass", "lieferkette", "externalisierung", "karl-marx"], sourceGroup: "capital" }),
  term({ id: "mehrwert", title: "Mehrwert", category: CAT_CAPITAL, short: "Mehrwert bezeichnet bei Marx den Wert, der über den gezahlten Arbeitslohn hinaus im Produktionsprozess angeeignet wird.", definition: "Der Begriff ist eine marxsche Wertkategorie und keine vollständige Werttheorie der WÖk.", woek: "Die WÖk fragt umfassender: Welche Wirkung wird erzeugt, wer profitiert, wer trägt Folgekosten?", related: ["karl-marx", "kapital", "wirkungswert", "externalisierung"], sourceGroup: "capital" }),
  term({ id: "wirkungsethik", title: "Wirkungsethik", category: CAT_ETHICS, concept: "core", short: "Wirkungsethik bewertet Handlungen nach ihren tatsächlichen Folgen für Mensch, Planet und Demokratie, unter Beachtung nicht kompensierbarer Grenzen.", definition: "Wirkungsethik fragt nach realen Zustandsveränderungen, aber nicht als reine Nutzenaddition.", woek: "Menschenwürde, Rechtsstaatlichkeit, planetare Grenzen und Demokratie sind rote Linien.", related: ["wirkungsverantwortung", "nichtkompensation", "wirkungsgrenze", "positive-netto-wirkung"], sourceGroup: "ethics" }),
  term({ id: "wirkungsverantwortung", title: "Wirkungsverantwortung", category: CAT_ETHICS, concept: "core", short: "Wirkungsverantwortung bezeichnet die Verantwortung für direkte, indirekte, zeitversetzte und systemische Folgen des eigenen Handelns oder Unterlassens.", definition: "Sie umfasst Wirkungspfade, Folgewirkungen, Risiken, Nichtwissen, Datenqualität und Korrekturfähigkeit.", woek: "Zentral für Unternehmen, Politik, Kapital, Medien, Konsum und Institutionen.", related: ["wirkungsethik", "folgewirkung", "wirkungspfad", "kapitalwirkung", "folgencheck"], sourceGroup: "ethics" }),
  term({ id: "sprachspiel", title: "Sprachspiel", category: CAT_LANGUAGE, short: "Ein Sprachspiel ist ein sozialer Gebrauchszusammenhang, in dem Wörter Bedeutung erhalten.", definition: "Begriffe erhalten Bedeutung durch Regeln, Praktiken, Erwartungen und Lebensformen.", woek: "Wichtig für Freiheit, Leistung, Wert, Markt, Nachhaltigkeit, Vertrauen und Wirkung, weil gleiche Begriffe unterschiedliche Wirkungspotenziale entfalten.", related: ["bedeutung-als-gebrauch", "lebensform", "framing", "resonanzraum", "ludwig-wittgenstein"], sourceGroup: "communication" }),
  term({ id: "bedeutung-als-gebrauch", title: "Bedeutung als Gebrauch", category: CAT_LANGUAGE, short: "Bedeutung entsteht nicht nur durch Definition, sondern durch Gebrauch in sozialen Praktiken.", definition: "Ein Wort wirkt anders, je nachdem, wo, von wem, mit welchem Ziel und in welchem Sprachspiel es verwendet wird.", woek: "Wichtig für politische Sprache, Medienwirkung und Glossararbeit: Begriffe müssen definiert und in ihrer Wirkung beobachtet werden.", related: ["sprachspiel", "lebensform", "wirkungswahrheit", "folgencheck"], sourceGroup: "communication" }),
  term({ id: "lebensform", title: "Lebensform", category: CAT_LANGUAGE, short: "Lebensform beschreibt den sozialen, kulturellen und praktischen Kontext, in dem Sprache, Regeln und Bedeutungen eingebettet sind.", definition: "Lebensformen prägen, was plausibel, selbstverständlich, zumutbar oder fremd erscheint.", woek: "Relevant für Anschlussfähigkeit, Reaktanz, Resonanzräume und Transformation.", related: ["sprachspiel", "anschlussfaehigkeit", "resonanzraum", "wirklichkeitskonstruktion"], sourceGroup: "communication" }),
  term({ id: "wahrheit", title: "Wahrheit", category: CAT_LANGUAGE, concept: "precision", short: "Wahrheit bezeichnet die Übereinstimmung oder belastbare Nähe von Aussage und Wirklichkeit.", definition: "Wahrheit ist nicht nur individuelle Aussagekorrektheit, sondern Voraussetzung gemeinsamer Wirklichkeit, Rechtsstaatlichkeit und Wirkungsprüfung.", woek: "Die WÖk behandelt Wahrheit als demokratische Infrastruktur.", related: ["wahrhaftigkeit", "wirkungswahrheit", "fakten", "rechtsstaatlichkeit", "vertrauen"], sourceGroup: "communication" }),
  term({ id: "wahrhaftigkeit", title: "Wahrhaftigkeit", category: CAT_LANGUAGE, concept: "precision", short: "Wahrhaftigkeit beschreibt die kommunikative Haltung, Informationen nicht absichtlich zu verzerren, zu verschleiern oder manipulierend zu verwenden.", definition: "Wahrhaftigkeit betrifft Absicht, Sorgfalt, Kontext, Auslassung, Ton und Korrekturfähigkeit.", woek: "Sie ist Voraussetzung für Vertrauen, Medienqualität und demokratische Rückkopplung.", related: ["wahrheit", "vertrauen", "medienqualitaet", "wirkungswahrheit"], sourceGroup: "communication" }),
  term({ id: "scheinwahrheit", title: "Scheinwahrheit", category: CAT_LANGUAGE, concept: "precision", short: "Scheinwahrheit entsteht, wenn eine Aussage formal korrekt oder plausibel wirkt, aber wesentliche Wirkungszusammenhänge ausblendet.", definition: "Scheinwahrheit kann durch Kontextverlust, selektive Zahlen, irreführende Frames oder richtige Teilaussagen mit falscher Folgerung entstehen.", woek: "Sie ist ein Risiko für Faktencheck, Medienqualität und Wirkungswahrheit.", related: ["wirkungswahrheit", "faktencheck", "folgencheck", "framing", "wahrheit"], sourceGroup: "communication" }),
  term({ id: "fakten", title: "Fakten", category: CAT_LANGUAGE, short: "Fakten sind überprüfbare Sachverhalte oder Aussagen über Zustände und Ereignisse.", definition: "Fakten sind notwendig, aber sie wirken nicht automatisch. Sie werden gedeutet, gerahmt, angenommen oder abgewehrt.", woek: "Wirkung entsteht erst über Deutung, Resonanz, Vertrauen, Handlungsoptionen und Rückkopplung.", related: ["faktencheck", "folgencheck", "wahrheit", "faktenreaktanz", "vertrauen"], sourceGroup: "communication" }),
  term({ id: "metakommunikation", title: "Metakommunikation", category: CAT_LANGUAGE, short: "Metakommunikation ist Kommunikation über Kommunikation.", definition: "Sie macht sichtbar, wie etwas gesagt, verstanden, gerahmt oder als Beziehungssignal gelesen wird.", woek: "Wichtig, um Wirkmechanismen wie Frames, Reaktanz, Dissonanz oder Vertrauensverschiebung sichtbar zu machen.", related: ["paul-watzlawick", "meta-kognitive-intervention", "reframing", "folgencheck"], sourceGroup: "communication" }),

  term({ id: "platon", title: "Platon", category: CAT_THINKERS, concept: "thinker", publicationStatus: "article_only", short: "Platon bleibt vorerst Backlog, solange er nicht wiederkehrend im WÖk-Content genutzt wird.", definition: "Das Höhlengleichnis kann als Metapher für Wahrnehmung und Deutungsräume dienen; Philosophenherrschaft ist vor allem Abgrenzung gegen Expertokratie.", woek: "Keine große Philosophiegeschichte ohne operative WÖk-Funktion.", related: ["wirklichkeitskonstruktion", "beobachterabhaengigkeit"], sourceGroup: "ethics", reviewStatus: "article_context_only" }),
  term({ id: "hoehlengleichnis", title: "Höhlengleichnis", category: CAT_THINKERS, concept: "sourceLine", publicationStatus: "article_only", short: "Das Höhlengleichnis bleibt Artikel-only, sofern es nicht wiederkehrend als Metapher für Wahrnehmung und Deutungsräume genutzt wird.", definition: "Der Begriff wird nicht als eigenständiger WÖk-Glossarbegriff publiziert, solange keine aktive Verwendung besteht.", woek: "Backlog statt Philosophiegeschichte.", related: ["platon", "wirklichkeitskonstruktion"], sourceGroup: "ethics", reviewStatus: "article_context_only" }),
];

additions.push(...controlledClusterAdditions);

const CAT_ECON_SYSTEMS = "Wirtschaftssysteme, Kapitalmythen und Verteilungslogiken";
const CAT_CIRCULAR = "Kreislaufwirtschaft, Circular Design und Materialkreisläufe";
const CAT_NEURO = "Neuropsychologische Wirkmechanismen";
const CAT_QUANTUM = "Quantenphysik, Quantenmaterialien und Zukunftstechnologien";
const CAT_ENERGY = "Energie, Strommarkt und Systemkosten";
const CAT_BATTERY_INFRA = "Batterien, Ladeinfrastruktur, Netzanschluss und Energiespeicher";
const CAT_FEMINISM_CARE = "Feminismus, feministische Ökonomie und Care-Wirkung";
const CAT_LIBERAL_MARKET = "Liberalismus, Libertarismus, Neoklassik und Marktbegriffe";
const CAT_ACTORS_INFLUENCE = "Akteure, Einfluss, Ideologien und demokratische Wirkungsräume";
const CAT_FASCISM_RISKS = "Faschismus, faschistoid und autoritäre Wirkungsrisiken";
const CAT_ARENDT = "Hannah Arendt und politische Wirkungsbegriffe";
const CAT_STATE_GOV = "Staat, Regierung, Verwaltung und Gesellschaft";
const CAT_REGIME_FORMS = "Autokratien, Regimeformen und demokratische Erosion";

const econBase = {
  category: CAT_ECON_SYSTEMS,
  concept: "system",
  theme: ["Wirtschaftssysteme und Gesellschaftsmodelle", "Kapital, Markt und Macht"],
  dimensions: ["Mensch", "Planet", "Demokratie"],
  wirklogik: ["Wirkungssteuerung", "Wirkungsbewertung"],
  applicationFields: ["Politik", "Unternehmen", "Kapitalmärkte", "Staat und Verwaltung", "Demokratie"],
  sourceField: ["Ökonomie", "Politische Theorie", "Soziologie"],
  sourceGroup: "economicSystems",
};
const circularBase = {
  category: CAT_CIRCULAR,
  theme: ["Kreislaufwirtschaft und Circular Design", "Materialkreisläufe und Produktlebenszyklus", "Produktwirkung und Rückführung", "Produkte, Lieferketten und Scorecards", "Klima, Energie und Lebenszyklus"],
  dimensions: ["Planet", "Mensch", "Demokratie"],
  wirklogik: ["Wirkmechanismus", "Wirkungsbewertung", "Wirkungssteuerung"],
  applicationFields: ["Produkte", "Lieferkette", "Klima", "Unternehmen", "Konsum", "Design / Innovation"],
  sourceField: ["Design / Innovation", "Klimawissenschaft", "Management"],
  sourceGroup: "circular",
};
const neuroBase = {
  category: CAT_NEURO,
  theme: ["Neuropsychologie und Wahrnehmung", "Aufmerksamkeit, Emotion und Resonanz", "Psychologie und Resonanz", "Demokratie, Medien und Öffentlichkeit"],
  dimensions: ["Mensch", "Demokratie"],
  wirklogik: ["Wirkmechanismus", "Wirkungspotenzial", "Wirkungsrisiko"],
  applicationFields: ["Medien", "Politik", "Produkte", "Konsum", "Demokratie", "Technologie / KI"],
  sourceField: ["Psychologie", "Konstruktivismus"],
  sourceGroup: "neuro",
};
const quantumBase = {
  category: CAT_QUANTUM,
  theme: ["Quantenphysik und Zukunftstechnologien", "Technologie und Innovation", "Klima, Energie und Lebenszyklus"],
  dimensions: ["Planet", "Mensch"],
  wirklogik: ["Wirkungspotenzial", "Wirkmechanismus"],
  applicationFields: ["Technologie / KI", "Energie", "Produkte", "Design / Innovation"],
  sourceField: ["Klimawissenschaft", "Design / Innovation"],
  sourceGroup: "quantum",
};
const energyBase = {
  category: CAT_ENERGY,
  theme: [
    "Energiewirtschaft",
    "Energie und Strommarkt",
    "Erneuerbare Energien",
    "Fossile Energien",
    "Kernenergie",
    "Strommarktdesign",
    "Netze und Netzentgelte",
    "Speicher und Flexibilität",
    "Flexibilität und Speicher",
    "Ladeinfrastruktur",
    "Batterien und Speicher",
    "Energieinfrastruktur",
    "Kommunale Energie",
    "Energie und Demokratie",
    "Energiearmut",
    "Systemkosten und Gestehungskosten",
    "Energie und Kreislaufwirtschaft",
    "Energie und Digitalisierung",
    "Energieumwandlung und Wirkungsgrad",
    "Klima und Lebenszyklus",
    "Klima, Energie und Lebenszyklus",
    "Produkte, Lieferketten und Scorecards",
    "Kapital, Markt und Macht",
    "Recht, Staat und Institutionen",
    "Innovation und Transformation",
  ],
  dimensions: ["Planet", "Mensch", "Demokratie"],
  wirklogik: ["Wirkungsbewertung", "Wirkungssteuerung", "Wirkungsrückkopplung"],
  applicationFields: ["Energie", "Klima", "Staat und Verwaltung", "Kapitalmärkte", "Unternehmen", "Technologie / KI"],
  sourceField: ["Klimawissenschaft", "Ökonomie", "Recht"],
  sourceGroup: "energy",
};
const batteryInfrastructureBase = {
  category: CAT_BATTERY_INFRA,
  theme: [
    "Batterien und Speicher",
    "Ladeinfrastruktur",
    "Netzanschluss und Umspannung",
    "Elektromobilität",
    "Batterie-Recycling",
    "Second Life und Rückführung",
    "Windrad-Recycling und Rückbau",
    "Energieinfrastruktur",
    "Messung und Abrechnung",
    "Mittelspannung und Hochleistungsladen",
    "Energiewirtschaft",
    "Energie und Strommarkt",
    "Speicher und Flexibilität",
    "Kommunale Energie",
    "Energie und Demokratie",
    "Energiearmut",
    "Energie und Kreislaufwirtschaft",
    "Energie und Digitalisierung",
    "Kreislaufwirtschaft und Circular Design",
    "Klima und Lebenszyklus",
    "Klima, Energie und Lebenszyklus",
    "Produkte, Lieferketten und Scorecards",
    "Kapital, Markt und Macht",
    "Recht, Staat und Institutionen",
    "Innovation und Transformation",
  ],
  dimensions: ["Planet", "Mensch", "Demokratie"],
  wirklogik: ["Wirkungsbewertung", "Wirkungsrisiko", "Wirkungsarchitektur", "Wirkungssteuerung", "Infrastrukturwirkung"],
  applicationFields: ["Energie", "Klima", "Produkte", "Lieferkette", "Unternehmen", "Konsum", "Staat und Verwaltung", "Technologie / KI"],
  sourceField: ["Klimawissenschaft", "Recht", "Management", "Design / Innovation"],
  sourceGroup: "batteryInfrastructure",
};
const feminismCareBase = {
  category: CAT_FEMINISM_CARE,
  concept: "precision",
  theme: [
    "Feminismus und Gleichwertigkeit",
    "Feministische Ökonomie",
    "Care und soziale Reproduktion",
    "Macht, Patriarchat und Dezentralisierung",
    "Gleichstellung und Teilhabe",
    "Gender Data und Wirkungsmessung",
    "Arbeit, Care und soziale Systeme",
    "Wirkung und Wirkungslogik",
    "Kapital, Markt und Macht",
    "Wirtschaftssysteme und Gesellschaftsmodelle",
    "Philosophie, Ethik und Werte",
    "Management und Organisation",
    "Recht, Staat und Institutionen",
    "Psychologie und Resonanz",
    "Produkte, Lieferketten und Scorecards",
  ],
  dimensions: ["Mensch", "Demokratie"],
  wirklogik: ["Wirkungsbewertung", "Wirkungsrisiko", "Wirkungssteuerung", "Wirkmechanismus"],
  applicationFields: ["Arbeit", "Care", "Gesundheit", "Bildung", "Politik", "Staat und Verwaltung", "Unternehmen", "Demokratie"],
  sourceField: ["Ökonomie", "Soziologie", "Philosophie", "Politische Theorie", "WÖk-eigener Begriff"],
  sourceGroup: "feministEconomics",
};
const liberalMarketBase = {
  category: CAT_LIBERAL_MARKET,
  concept: "connection",
  theme: [
    "Liberalismus und Freiheit",
    "Libertarismus und Eigentum",
    "Neoklassik und Marktmodell",
    "Marktversagen und Staatsversagen",
    "Wettbewerb und Preise",
    "Regulierung und Deregulierung",
    "Eigentum und Verantwortung",
    "Wirtschaftspolitische Ideologien",
    "Ökonomische Grundbegriffe",
    "Kapital, Markt und Macht",
    "Freiheit, Staat und Wirkung",
    "Wirtschaftssysteme und Gesellschaftsmodelle",
    "Wirkung und Wirkungslogik",
    "Philosophie, Ethik und Werte",
    "Recht, Staat und Institutionen",
    "Systemtheorie und Komplexität",
  ],
  dimensions: ["Mensch", "Planet", "Demokratie"],
  wirklogik: ["Wirkungsbewertung", "Wirkungssteuerung", "Wirkungsrückkopplung", "Wirkungsrisiko"],
  applicationFields: ["Politik", "Unternehmen", "Kapitalmärkte", "Staat und Verwaltung", "Demokratie", "Konsum"],
  sourceField: ["Ökonomie", "Philosophie", "Politische Theorie", "Soziologie", "WÖk-eigener Begriff"],
  sourceGroup: "liberalMarket",
};
const actorsInfluenceBase = {
  category: CAT_ACTORS_INFLUENCE,
  concept: "connection",
  theme: [
    "Akteure und Einfluss",
    "Thinktanks und Policy-Netzwerke",
    "NGOs und Zivilgesellschaft",
    "Lobbyismus und Interessenvertretung",
    "Machtkonzentration und Transparenz",
    "Ideologien und politische Lager",
    "Demokratie und Grundgesetz",
    "Rassismus, Faschismus und autoritäre Wirkungsrisiken",
    "Progressiv, konservativ und politische Orientierung",
    "Sozialisation, Sozialisierung und Vergesellschaftung",
    "Politischer Vorraum",
    "Wirkung politischer Programme",
    "Demokratie, Medien und Öffentlichkeit",
    "Wirkung und Wirkungslogik",
    "Psychologie und Resonanz",
    "Systemtheorie und Konstruktivismus",
    "Kapital, Markt und Macht",
    "Recht, Staat und Institutionen",
    "Wirtschaftssysteme und Gesellschaftsmodelle",
    "Medienwirkung und Folgencheck",
  ],
  dimensions: ["Mensch", "Planet", "Demokratie"],
  wirklogik: ["Wirkmechanismus", "Wirkungspotenzial", "Wirkungsrisiko", "Wirkungsbewertung", "Wirkungsrückkopplung"],
  applicationFields: ["Politik", "Medien", "Staat und Verwaltung", "Demokratie", "Kapitalmärkte", "Bildung"],
  sourceField: ["Politische Theorie", "Soziologie", "Recht", "Psychologie", "Ökonomie", "WÖk-eigener Begriff"],
  sourceGroup: "actorsInfluence",
};
const democraticRiskBase = {
  category: CAT_FASCISM_RISKS,
  concept: "connection",
  theme: [
    "Faschismus, faschistoid und autoritäre Wirkungsrisiken",
    "Autokratien, Regimeformen und demokratische Erosion",
    "Demokratie und Grundgesetz",
    "Rassismus, Faschismus und autoritäre Wirkungsrisiken",
    "Wirkung politischer Programme",
    "Demokratie, Medien und Öffentlichkeit",
    "Wirkung und Wirkungslogik",
    "Psychologie und Resonanz",
    "Recht, Staat und Institutionen",
    "Kapital, Markt und Macht",
  ],
  dimensions: ["Mensch", "Demokratie"],
  wirklogik: ["Wirkmechanismus", "Wirkungspotenzial", "Wirkungsrisiko", "Wirkungsbewertung"],
  applicationFields: ["Politik", "Medien", "Staat und Verwaltung", "Demokratie", "Bildung"],
  sourceField: ["Politische Theorie", "Soziologie", "Recht", "Psychologie"],
  sourceGroup: "democraticRisk",
};
const arendtBase = {
  category: CAT_ARENDT,
  concept: "sourceLine",
  theme: [
    "Hannah Arendt und politische Wirkungsbegriffe",
    "Demokratie und Grundgesetz",
    "Philosophie, Ethik und Werte",
    "Wirkung und Wirkungslogik",
    "Recht, Staat und Institutionen",
    "Demokratie, Medien und Öffentlichkeit",
  ],
  dimensions: ["Mensch", "Demokratie"],
  wirklogik: ["Wirkmechanismus", "Wirkungsbewertung", "Wirkungsrisiko"],
  applicationFields: ["Politik", "Medien", "Staat und Verwaltung", "Demokratie", "Bildung"],
  sourceField: ["Philosophie", "Politische Theorie", "Soziologie"],
  sourceGroup: "democraticRisk",
};
const stateGovBase = {
  category: CAT_STATE_GOV,
  concept: "connection",
  theme: [
    "Staat, Regierung, Verwaltung und Gesellschaft",
    "Demokratie und Grundgesetz",
    "Recht, Staat und Institutionen",
    "Wirkung politischer Programme",
    "Demokratie, Medien und Öffentlichkeit",
    "Wirkung und Wirkungslogik",
  ],
  dimensions: ["Mensch", "Demokratie"],
  wirklogik: ["Wirkungsbewertung", "Wirkungssteuerung", "Wirkungsrisiko", "Wirkungsarchitektur"],
  applicationFields: ["Politik", "Staat und Verwaltung", "Demokratie", "Bildung"],
  sourceField: ["Recht", "Politische Theorie", "Soziologie", "WÖk-eigener Begriff"],
  sourceGroup: "democraticRisk",
};
const regimeFormsBase = {
  category: CAT_REGIME_FORMS,
  concept: "connection",
  theme: [
    "Autokratien, Regimeformen und demokratische Erosion",
    "Faschismus, faschistoid und autoritäre Wirkungsrisiken",
    "Demokratie und Grundgesetz",
    "Recht, Staat und Institutionen",
    "Machtkonzentration und Transparenz",
    "Demokratie, Medien und Öffentlichkeit",
  ],
  dimensions: ["Mensch", "Demokratie"],
  wirklogik: ["Wirkungsrisiko", "Wirkmechanismus", "Wirkungsbewertung"],
  applicationFields: ["Politik", "Medien", "Staat und Verwaltung", "Demokratie"],
  sourceField: ["Politische Theorie", "Soziologie", "Recht"],
  sourceGroup: "democraticRisk",
};

function addTerm(base, spec) {
  return term({
    ...base,
    ...spec,
    related: unique([...(spec.related || []), ...(base.related || [])]),
    aliases: unique(spec.aliases || []),
  });
}

const economicSystemTerms = [
  addTerm(econBase, { id: "marktwirtschaft", title: "Marktwirtschaft", short: "Marktwirtschaft ist ein Wirtschaftssystem, in dem dezentrale Entscheidungen, Wettbewerb, Preise und Eigentum zentrale Koordinationsfunktionen übernehmen.", definition: "Marktwirtschaft koordiniert Entscheidungen über Preise, Wettbewerb, Eigentum und Vertragsfreiheit.", woek: "Die Wirkungsökonomie verwirft Marktwirtschaft nicht. Sie korrigiert ihren blinden Fleck: Preise müssen Wirkung abbilden.", mythos: "Der Markt regelt automatisch das Gemeinwohl.", woekKlaerung: "Der Markt regelt nur, was in Preisen, Regeln und Anreizen sichtbar ist.", blindSpot: "Unsichtbare Klima-, Sozial- oder Demokratiewirkungen bleiben unzureichend rückgekoppelt.", related: ["kapitalismus", "soziale-marktwirtschaft", "wirkungsmarkt", "wirkungswahrheit", "externalisierung", "wirkungssteuer"] }),
  addTerm(econBase, { id: "kapitalismus", title: "Kapitalismus", short: "Kapitalismus ist ein Wirtschaftssystem, in dem Kapital, Privateigentum, Investition, Gewinn und Kapitalverwertung zentrale Steuerungsgrößen sind.", definition: "Kapitalismus kann Innovation und Wohlstand erzeugen, richtet Systeme aber häufig an Kapitalrendite aus.", woek: "Problematisch wird Kapitalismus dort, wo Kapitalrendite wichtiger wird als Mensch, Planet und Demokratie.", mythos: "Kapitalismus ist dasselbe wie Marktwirtschaft.", woekKlaerung: "Marktwirtschaft beschreibt dezentrale Koordination; Kapitalismus beschreibt die Dominanz von Kapital als Ziel- und Machtgröße.", blindSpot: "Kapitalrendite kann Externalisierung belohnen.", related: ["kapital", "marktwirtschaft", "kapitalrendite", "kapitalwirkung", "externalisierung", "raubtierkapitalismus", "finanzmarktkapitalismus"] }),
  addTerm(econBase, { id: "soziale-marktwirtschaft", title: "Soziale Marktwirtschaft", short: "Die soziale Marktwirtschaft verbindet Marktwettbewerb mit sozialem Ausgleich und staatlicher Ordnung.", definition: "Sie ordnet Wettbewerb, Sozialstaat und staatliche Rahmensetzung zusammen.", woek: "Historisch ein Fortschritt, aber ökologisch, global und demokratiebezogen wirkungsunvollständig.", mythos: "Soziale Marktwirtschaft reicht als Antwort auf die Krisen des 21. Jahrhunderts.", woekKlaerung: "Sie braucht Weiterentwicklung zur Wirkungsmarktwirtschaft mit Klima-, Lieferketten- und Demokratiewirkung.", blindSpot: "Planetare und globale Folgewirkungen werden nicht systematisch gesteuert.", related: ["ordoliberalismus", "wohlfahrtsstaat", "marktwirtschaft", "wirkungsmarktwirtschaft", "wstg"] }),
  addTerm(econBase, { id: "skandinavisches-modell", title: "Skandinavisches Modell / Nordic Model", aliases: ["Nordic Model", "nordisches Modell", "skandinavischer Wohlfahrtsstaat"], short: "Das skandinavische Modell verbindet marktwirtschaftliche Elemente mit starkem Wohlfahrtsstaat, öffentlicher Daseinsvorsorge, Arbeitsmarktpartnerschaft und hohem Vertrauen.", definition: "Es ist geprägt durch breite Wohlfahrtspolitik, soziale Sicherheit, Gesundheit, Bildung, Wohnen, Beschäftigung und einen starken öffentlichen Sektor.", woek: "Ein starkes Referenzmodell für Vertrauen, soziale Sicherheit und Daseinsvorsorge, aber noch keine vollständige Wirkungsökonomie.", mythos: "Das skandinavische Modell ist bereits die fertige Lösung.", woekKlaerung: "Es bleibt kapital- und wachstumsorientiert, solange Wirkung nicht systematisch in Preise, Steuern, Kapitalflüsse und Produktwirkung rückgekoppelt wird.", blindSpot: "Produkt-, Lieferketten-, Klima- und Demokratiewirkung sind nicht automatisch integriert.", related: ["wohlfahrtsstaat", "soziale-marktwirtschaft", "vertrauen", "daseinsvorsorge", "gleichstellung", "wirkungsstaat", "wirkungsoekonomie"] }),
  addTerm(econBase, { id: "wohlfahrtsstaat", title: "Wohlfahrtsstaat", short: "Der Wohlfahrtsstaat sichert soziale Risiken durch öffentliche Leistungen, Transfers und Infrastruktur ab.", definition: "Er stabilisiert Lebenslagen durch Gesundheit, Bildung, soziale Sicherung, Wohnen, Pflege und Arbeitsmarktpolitik.", woek: "Er stabilisiert Mensch und Demokratie, kann aber in Reparaturlogik stecken bleiben.", mythos: "Mehr Sozialausgaben bedeuten automatisch mehr soziale Wirkung.", woekKlaerung: "Entscheidend ist tatsächliche Wirkung auf Armut, Gesundheit, Teilhabe, Vertrauen und Resilienz.", blindSpot: "Ausgabehöhe ersetzt keine Wirkungsprüfung.", related: ["skandinavisches-modell", "soziale-marktwirtschaft", "daseinsvorsorge", "wirkungshaushalt"] }),
  addTerm(econBase, { id: "ordoliberalismus", title: "Ordoliberalismus", short: "Ordoliberalismus betont die staatliche Ordnung des Wettbewerbs durch Regeln, Kartellkontrolle und Rechtsrahmen.", definition: "Er sieht den Staat als Hüter einer Wettbewerbsordnung.", woek: "Anschlussfähig, weil Märkte Regeln brauchen; unvollständig, wenn Wirkung nicht als Steuerungsmaßstab integriert wird.", mythos: "Gute Wettbewerbsordnung löst das Wirkungsproblem.", woekKlaerung: "Wettbewerb braucht Wirkungswahrheit, sonst konkurrieren auch Externalisierer erfolgreich.", blindSpot: "Schutz des Wettbewerbs ersetzt keine Messung von Wirkung.", related: ["soziale-marktwirtschaft", "marktwirtschaft", "wirkungswahrheit"] }),
  addTerm(econBase, { id: "neoliberalismus", title: "Neoliberalismus", short: "Neoliberalismus beschreibt Strömungen, die Marktmechanismen, Wettbewerb, Privatisierung und Deregulierung stark betonen.", definition: "Der Begriff wird historisch und politisch unterschiedlich verwendet.", woek: "Problematisch wird er, wenn Marktlogik von Wirkungswahrheit entkoppelt wird und Externalisierung als Effizienz erscheint.", mythos: "Deregulierung erzeugt automatisch Effizienz.", woekKlaerung: "Deregulierung ohne Wirkungsrückkopplung kann destruktive Effizienz erzeugen.", blindSpot: "Effizienzgewinne können auf andere Systeme abgewälzt werden.", related: ["effizienz", "externalisierung", "marktwirtschaft", "kapitalismus"] }),
  addTerm(econBase, { id: "raubtierkapitalismus", title: "Raubtierkapitalismus", short: "Raubtierkapitalismus bezeichnet aggressive Kapitalverwertung, bei der Gewinnmaximierung, Machtkonzentration und Externalisierung Schäden verdrängen.", definition: "Der Begriff wird in der WÖk analytisch und vorsichtig verwendet, nicht als pauschale Polemik.", woek: "Entscheidend ist die konkrete Wirkungsanalyse: Welche Schäden werden externalisiert, welche Macht konzentriert sich?", mythos: "Raubtierkapitalismus ist nur moralisches Fehlverhalten einzelner Akteure.", woekKlaerung: "Oft ist es eine Anreizstruktur: Wer Schäden nicht tragen muss, kann billiger und aggressiver wachsen.", blindSpot: "Moralische Empörung ersetzt keine Anreiz- und Wirkungsanalyse.", related: ["kapitalismus", "externalisierung", "machtkonzentration", "kapitalwirkung"] }),
  addTerm(econBase, { id: "finanzmarktkapitalismus", title: "Finanzmarktkapitalismus", short: "Finanzmarktkapitalismus beschreibt eine Wirtschaftsform, in der Finanzmärkte, Renditeerwartungen, Shareholder Value und Kapitalallokation dominieren.", definition: "Finanzielle Kennzahlen und Kapitalmärkte prägen Unternehmensentscheidungen und wirtschaftliche Entwicklung.", woek: "Problematisch, wenn kurzfristige Kapitalrendite langfristige Wirkung verdrängt.", mythos: "Finanzmärkte allokieren Kapital automatisch gesellschaftlich optimal.", woekKlaerung: "Kapitalallokation braucht Wirkungsdaten, Risikowahrheit und demokratische Schutzbedingungen.", blindSpot: "Langfristige Folgewirkungen können unterbewertet werden.", related: ["kapitalismus", "kapitalrendite", "kapitalwirkung", "wirkungskapital"] }),
  addTerm({ ...econBase, sourceGroup: "platformCapitalism" }, { id: "plattformkapitalismus", title: "Plattformkapitalismus", short: "Plattformkapitalismus beschreibt Geschäftsmodelle, in denen digitale Plattformen Netzwerkeffekte, Daten, Aufmerksamkeit und Marktinfrastruktur kontrollieren.", definition: "Plattformen vermitteln Märkte, Arbeit, Kommunikation oder Konsum und können durch Netzwerkeffekte Gatekeeper-Macht aufbauen.", woek: "Relevant für Medienwirkung, Arbeitsmärkte, Datenmacht, Plattformlogik, Überwachung und Demokratie.", mythos: "Plattformen sind neutrale Marktplätze.", woekKlaerung: "Plattformen gestalten Regeln, Sichtbarkeit, Datenzugang und Anreize.", blindSpot: "Infrastruktur- und Deutungsmacht werden oft als Service getarnt.", related: ["aufmerksamkeitsoekonomie", "ueberwachungskapitalismus", "machtkonzentration", "digitale-selbstbestimmung"] }),
  addTerm({ ...econBase, sourceGroup: "platformCapitalism" }, { id: "ueberwachungskapitalismus", title: "Überwachungskapitalismus", aliases: ["Surveillance Capitalism"], short: "Überwachungskapitalismus beschreibt Geschäftsmodelle, die Verhaltensdaten extrahieren, analysieren und zur Vorhersage oder Beeinflussung von Verhalten monetarisieren.", definition: "Der Begriff markiert Datenextraktion und Verhaltensbeeinflussung als Geschäftsmodell.", woek: "Relevant für digitale Selbstbestimmung, Demokratie, Medienqualität, KI-Governance und Wirkungsrisiken digitaler Märkte.", mythos: "Personalisierung ist immer nur besserer Service.", woekKlaerung: "Personalisierung kann Autonomie, Datenschutz und demokratische Diskursräume schwächen.", blindSpot: "Verhaltensdaten werden als Rohstoff behandelt.", related: ["plattformkapitalismus", "digitale-selbstbestimmung", "vertrauen", "demokratie"] }),
  addTerm(econBase, { id: "staatskapitalismus", title: "Staatskapitalismus", short: "Staatskapitalismus beschreibt Systeme, in denen der Staat erhebliche Kontrolle über Kapital, Unternehmen oder strategische Märkte ausübt, ohne Kapital- und Machtlogik aufzuheben.", definition: "Staatliche Eigentums- oder Kontrollrechte können mit kapitalistischer Wettbewerbs- und Renditelogik verbunden sein.", woek: "Staatseigentum ist nicht automatisch positive Wirkung. Auch staatlich gelenktes Kapital braucht Wirkungsprüfung, Transparenz und demokratische Kontrolle.", mythos: "Wenn der Staat steuert, ist Gemeinwohl gesichert.", woekKlaerung: "Staatliche Steuerung kann Wirkung ermöglichen oder Macht konzentrieren.", blindSpot: "Eigentumsform ersetzt keine Wirkungsprüfung.", related: ["kapitalismus", "staatssozialismus", "kapitalwirkung", "wirkungsstaat"] }),
  addTerm(econBase, { id: "extraktiver-kapitalismus", title: "Extraktiver Kapitalismus", short: "Extraktiver Kapitalismus beschreibt eine Logik, die Wert aus Natur, Arbeit, Daten, Aufmerksamkeit oder Gemeinschaften entnimmt, ohne Schäden angemessen zurückzukoppeln.", definition: "Extraktion meint nicht nur Rohstoffabbau, sondern auch Abschöpfung sozialer, digitaler oder ökologischer Ressourcen.", woek: "Zentraler Gegenbegriff zur regenerativen Wirkungsökonomie.", mythos: "Wachstum zeigt, dass Wert geschaffen wurde.", woekKlaerung: "Wachstum kann auch auf Entnahme und Externalisierung beruhen.", blindSpot: "Regeneration, Rechte und Folgekosten bleiben unsichtbar.", related: ["externalisierung", "kapitalwirkung", "kreislaufwirtschaft", "regenerative-landwirtschaft"] }),
  addTerm(econBase, { id: "gruener-kapitalismus", title: "Grüner Kapitalismus", short: "Grüner Kapitalismus versucht, kapitalistische Märkte durch grüne Technologien, ESG, CO2-Preise oder nachhaltige Investitionen ökologisch zu modernisieren.", definition: "Er verbindet Marktlogik mit ökologischer Modernisierung.", woek: "Kann Fortschritt ermöglichen, bleibt aber unvollständig, wenn Wirkung nur als Marktchance oder Risiko erscheint.", mythos: "Grüne Märkte lösen die ökologische Krise allein.", woekKlaerung: "Wirkung muss Steuerungsgröße werden, nicht nur Geschäftsmodell.", blindSpot: "Greenwashing, Rebound und soziale Folgewirkungen.", related: ["esg", "co2-preis", "wirkungssteuer", "positive-netto-wirkung"] }),
  addTerm(econBase, { id: "stakeholder-kapitalismus", title: "Stakeholder-Kapitalismus", short: "Stakeholder-Kapitalismus erweitert Unternehmensverantwortung von Shareholdern auf weitere Anspruchsgruppen.", definition: "Unternehmen berücksichtigen Kund:innen, Beschäftigte, Lieferanten, Gemeinschaften und Umwelt stärker.", woek: "Wichtig, aber nicht ausreichend. Stakeholder-Berücksichtigung ersetzt keine messbare Wirkung.", mythos: "Stakeholder-Dialog ist schon Wirkung.", woekKlaerung: "Dialog muss in überprüfbare Zustandsveränderungen übersetzt werden.", blindSpot: "Anspruchsgruppen können ungleich sichtbar oder mächtig sein.", related: ["stakeholder", "wirkungswert", "scorecard", "wirkungsempfaenger"] }),
  addTerm(econBase, { id: "privatwirtschaftliche-planwirtschaft", title: "Privatwirtschaftliche Planwirtschaft", aliases: ["konzerngetriebene Planwirtschaft", "private Planwirtschaft", "monopolistische Planwirtschaft"], short: "Privatwirtschaftliche Planwirtschaft beschreibt, wenn große Konzerne, Plattformen oder Finanzakteure Märkte, Lieferketten, Preise, Daten oder Standards faktisch planen.", definition: "Formal besteht Marktwirtschaft, faktisch können private Akteure Infrastruktur, Regeln und Alternativen kontrollieren.", woek: "Der Begriff zeigt: Zentralisierung entsteht nicht nur im Sozialismus. Auch Kapitalismus kann private Planung und Machtkonzentration erzeugen.", mythos: "Planwirtschaft gibt es nur beim Staat.", woekKlaerung: "Auch private Machtkonzentration kann Märkte entdemokratisieren, Alternativen verdrängen und Wirkung unsichtbar machen.", blindSpot: "Private Steuerungsmacht bleibt als Marktprozess getarnt.", related: ["machtkonzentration", "plattformkapitalismus", "kapitalismus", "planwirtschaft"] }),
  addTerm(econBase, { id: "sozialismus", title: "Sozialismus", short: "Sozialismus bezeichnet Modelle, die Privateigentum an Produktionsmitteln begrenzen oder überwinden und gesellschaftliche Gleichheit stärker betonen.", definition: "Sozialismus adressiert Ungleichheit, Ausbeutung und Kapitalmacht.", woek: "Er löst das Wirkungsproblem nicht automatisch. Eigentumsform ersetzt keine Wirkungsprüfung.", mythos: "Wenn Eigentum kollektiv oder staatlich ist, entsteht automatisch Gemeinwohl.", woekKlaerung: "Auch kollektives oder staatliches Eigentum kann negative Wirkung erzeugen.", blindSpot: "Zentralisierung, Bürokratie und Innovationshemmnisse können selbst Wirkungsschäden erzeugen.", related: ["demokratischer-sozialismus", "staatssozialismus", "kommunismus", "planwirtschaft", "kapital-als-machtverhaeltnis"] }),
  addTerm(econBase, { id: "demokratischer-sozialismus", title: "Demokratischer Sozialismus", short: "Demokratischer Sozialismus versucht sozialistische Ziele mit demokratischen Verfahren und Rechtsstaatlichkeit zu verbinden.", definition: "Er betont soziale Gleichheit, demokratische Kontrolle und öffentliche Güter.", woek: "Anschlussfähig bei sozialer Gerechtigkeit, aber unvollständig, wenn Wirkung, Planet, Innovation, Dezentralität und Rückkopplung nicht operationalisiert werden.", mythos: "Demokratische Verfahren sichern automatisch positive Wirkung.", woekKlaerung: "Demokratie braucht Wirkungsdaten, Rechtsstaatlichkeit und Korrekturfähigkeit.", blindSpot: "Gute Absicht ersetzt keine Zustandsprüfung.", related: ["sozialismus", "demokratie", "wirkungsrat"] }),
  addTerm(econBase, { id: "staatssozialismus", title: "Staatssozialismus", short: "Staatssozialismus beschreibt Systeme, in denen der Staat zentrale Kontrolle über Produktion, Eigentum und Verteilung übernimmt.", definition: "Wirtschaftliche Koordination erfolgt stark administrativ und zentral.", woek: "Problematisch durch Zentralisierung, Informationsprobleme, Machtkonzentration und geringe Anpassungsfähigkeit.", mythos: "Zentrale Planung kann komplexe Wirkung vollständig steuern.", woekKlaerung: "Komplexe Systeme brauchen Rückkopplung, dezentrales Wissen und Korrekturfähigkeit.", blindSpot: "Macht- und Informationsprobleme werden unterschätzt.", related: ["sozialismus", "zentralverwaltungswirtschaft", "planwirtschaft", "nichttriviales-system"] }),
  addTerm(econBase, { id: "kommunismus", title: "Kommunismus", short: "Kommunismus bezeichnet die Idee einer klassenlosen Gesellschaft ohne Privateigentum an Produktionsmitteln.", definition: "Historisch-radikale Ausprägungen gingen häufig mit zentralisierter Macht, Parteiendominanz und Freiheitsverlust einher.", woek: "Kommunismus adressiert Ungleichheit radikal, löst aber Wirkung, Freiheit, Innovation und dezentrales Wissen nicht automatisch.", mythos: "Radikale Gleichheit erzeugt automatisch gerechte Wirkung.", woekKlaerung: "Gleichheit ohne Freiheit, Wirkungsmessung, Rückkopplung und dezentrale Lernfähigkeit kann neue Machtkonzentration erzeugen.", blindSpot: "Machtkonzentration kann unter Gleichheitsversprechen unsichtbar werden.", related: ["sozialismus", "staatssozialismus", "planwirtschaft", "machtkonzentration"] }),
  addTerm(econBase, { id: "planwirtschaft", title: "Planwirtschaft", short: "Planwirtschaft ist ein Wirtschaftssystem, in dem Produktion, Verteilung und Investition zentral geplant werden.", definition: "Sie ersetzt dezentrale Marktkoordination weitgehend durch zentrale Ziel- und Mengenentscheidungen.", woek: "Sie kann Ziele direkt setzen, leidet in komplexen Systemen aber an Informations-, Innovations- und Anpassungsproblemen.", mythos: "Planung macht Wirtschaft automatisch rationaler.", woekKlaerung: "WÖk setzt nicht auf zentrale Durchsteuerung, sondern auf Wirkungsrückkopplung in dezentralen Entscheidungen.", blindSpot: "Nichttriviale Systeme reagieren nicht linear auf Planvorgaben.", related: ["zentralverwaltungswirtschaft", "privatwirtschaftliche-planwirtschaft", "nichttriviale-maschine", "rueckkopplung"] }),
  addTerm(econBase, { id: "zentralverwaltungswirtschaft", title: "Zentralverwaltungswirtschaft", short: "Zentralverwaltungswirtschaft ist eine Form der Planwirtschaft, in der zentrale Behörden wirtschaftliche Entscheidungen administrativ vorgeben.", definition: "Sie ist die administrativ stark verdichtete Variante zentraler Wirtschaftsplanung.", woek: "Wichtige Abgrenzung: Wirkungsökonomie ist keine Zentralverwaltungswirtschaft, weil dezentrale Entscheidungen erhalten bleiben.", mythos: "Wirkungssteuerung bedeutet zentrale Verwaltungswirtschaft.", woekKlaerung: "WÖk koppelt Wirkung in Signale, Regeln und Daten zurück, statt alle Einzelentscheidungen zentral zu setzen.", blindSpot: "Verwechslung von Rückkopplung und Befehl.", related: ["planwirtschaft", "wirkungsrueckkopplung", "wirkungssteuer"] }),
  addTerm(econBase, { id: "genossenschaft", title: "Genossenschaft", short: "Eine Genossenschaft ist eine Organisationsform, in der Mitglieder gemeinschaftlich Eigentum halten, Entscheidungen mittragen und Nutzen teilen.", definition: "Genossenschaften können Teilhabe, Dezentralisierung und Gemeinwohl stärken.", woek: "Sie sind aber nicht automatisch wirkungspositiv. Auch Mitgliedermehrheiten können Entscheidungen treffen, die Mensch, Planet oder Demokratie schwächen.", mythos: "Genossenschaft = automatisch gut.", woekKlaerung: "Demokratische Eigentumsform ersetzt keine Wirkungsbewertung.", blindSpot: "Wirkung auf Nichtmitglieder, Umwelt und Demokratie wird nicht automatisch gemessen.", related: ["genossenschaftsblindheit", "commons", "gemeineigentum", "dezentralisierung"] }),
  addTerm(econBase, { id: "genossenschaftsblindheit", title: "Genossenschaftsblindheit", concept: "precision", short: "Genossenschaftsblindheit beschreibt das Missverständnis, dass gemeinschaftliche Eigentumsform automatisch positive Wirkung erzeugt.", definition: "Sie verwechselt demokratische oder gemeinschaftliche Eigentumsform mit tatsächlicher Wirkung.", woek: "Die Frage ist nicht nur, wem etwas gehört, sondern was es bewirkt.", mythos: "Gemeinschaftliches Eigentum ist automatisch Gemeinwohl.", woekKlaerung: "Eigentumsform muss mit Wirkungsdaten und Rückkopplung verbunden werden.", blindSpot: "Externe Wirkung und Minderheitenpositionen bleiben unsichtbar.", related: ["genossenschaft", "wirkungsbewertung", "wirkungsempfaenger"] }),
  addTerm({ ...econBase, sourceGroup: "feministEconomics" }, { id: "commons", title: "Commons", short: "Commons sind gemeinschaftlich genutzte und verwaltete Ressourcen, Räume oder Infrastrukturen.", definition: "Commons funktionieren durch Regeln, Zugang, Verantwortung, Selbstorganisation und Sanktionen.", woek: "Commons können Wirkung stärken, wenn Governance, Zugang, Verantwortung und Regeneration gesichert sind.", mythos: "Gemeinschaftliche Nutzung funktioniert automatisch.", woekKlaerung: "Commons brauchen Regeln, Vertrauen, Monitoring und faire Governance.", blindSpot: "Ohne Governance drohen Übernutzung oder Ausschluss.", related: ["elinor-ostrom", "gemeineigentum", "selbstorganisation", "vertrauen"] }),
  addTerm(econBase, { id: "gemeineigentum", title: "Gemeineigentum", short: "Gemeineigentum beschreibt Eigentum, das gemeinschaftlich oder öffentlich gehalten wird.", definition: "Es kann Kommune, Staat, Gemeinschaften oder institutionelle Träger betreffen.", woek: "Auch Gemeineigentum braucht Wirkungsmessung.", mythos: "Gemeineigentum ist automatisch gemeinwohlorientiert.", woekKlaerung: "Öffentliches oder gemeinschaftliches Eigentum muss Wirkung nachweisen und korrigierbar bleiben.", blindSpot: "Nutzung, Zugang und Folgewirkung werden nicht durch Eigentumsform allein geregelt.", related: ["commons", "genossenschaft", "wirkungsbewertung"] }),
  addTerm({ ...econBase, sourceGroup: "feministEconomics" }, { id: "patriarchat", title: "Patriarchat", short: "Patriarchat beschreibt historisch gewachsene Macht- und Deutungsordnungen, in denen männlich codierte Dominanz, Kontrolle, Hierarchie und Eigentumslogik strukturell bevorzugt werden.", definition: "Der Begriff wird in der WÖk nicht als Angriff auf Männer verwendet, sondern als Analyse von Macht-, Eigentums-, Hierarchie- und Externalisierungslogiken.", woek: "Patriarchale Strukturen können Care-Arbeit entwerten, Kooperation schwächen, Dominanzlogiken normalisieren und Wirkung unsichtbar machen.", mythos: "Patriarchat bedeutet nur individuelle Männerherrschaft.", woekKlaerung: "Patriarchat ist eine Systemlogik, die durch Institutionen, Märkte, Sprache, Rollenbilder und Machtstrukturen reproduziert werden kann.", blindSpot: "Unsichtbare Care- und Reproduktionsarbeit wird abgewertet.", related: ["feministische-oekonomie", "care-oekonomie", "sorgearbeit", "machtkonzentration"] }),
  addTerm(econBase, { id: "machtkonzentration", title: "Machtkonzentration", concept: "precision", short: "Machtkonzentration beschreibt die Verdichtung von Entscheidungs-, Kapital-, Daten-, Medien- oder Deutungsmacht bei wenigen Akteuren.", definition: "Macht kann über Eigentum, Plattformen, Daten, Medien, Infrastruktur, Kapital oder Verfahren konzentriert werden.", woek: "Ein Wirkungsrisiko für Demokratie, Märkte, Innovation, Medienqualität und soziale Gerechtigkeit.", mythos: "Machtkonzentration ist nur ein Wettbewerbsproblem.", woekKlaerung: "Sie ist auch ein Wirkungsrisiko für Freiheit, Vertrauen und Korrekturfähigkeit.", blindSpot: "Konzentrierte Deutungsmacht wird oft nicht bilanziert.", related: ["dezentralisierung", "dezentralisierung-von-macht", "kapital-als-machtverhaeltnis", "plattformkapitalismus"] }),
  addTerm(econBase, { id: "dezentralisierung", title: "Dezentralisierung", short: "Dezentralisierung beschreibt die Verteilung von Entscheidungs-, Eigentums-, Daten- oder Gestaltungsmacht auf mehrere Akteure oder Ebenen.", definition: "Dezentralisierung kann lokale Kompetenz, Teilhabe, Resilienz und Vielfalt stärken.", woek: "Sie ist nicht automatisch positiv. Sie stärkt Wirkung, wenn Verantwortung, Datenklarheit, Rückkopplung und demokratische Kontrolle verbunden sind.", mythos: "Dezentral ist automatisch gut.", woekKlaerung: "Dezentralisierung braucht Verantwortung, Rückkopplung und Wirkungsdaten.", blindSpot: "Fragmentierung oder Verantwortungsdiffusion können Wirkung blockieren.", related: ["dezentralisierung-von-macht", "selbstorganisation", "commons", "wirkungsrat"] }),
  addTerm(econBase, { id: "dezentralisierung-von-macht", title: "Dezentralisierung von Macht", concept: "precision", short: "Dezentralisierung von Macht verteilt Einfluss, Kontrolle und Entscheidungsmöglichkeiten so, dass Machtkonzentration, Abhängigkeit und Missbrauch begrenzt werden.", definition: "Sie betrifft politische, wirtschaftliche, digitale, institutionelle und infrastrukturelle Macht.", woek: "Zentral für Demokratie, Plattformregulierung, Genossenschaften, Commons, Wirkungsrat, Datenräume und föderale Wirkungspolitik.", mythos: "Macht löst sich durch Beteiligung allein auf.", woekKlaerung: "Dezentralisierung braucht Ressourcen, Rechte, Datenzugang und Korrekturwege.", blindSpot: "Scheinbeteiligung ohne Entscheidungsmacht.", related: ["dezentralisierung", "machtkonzentration", "wirkungsrat", "datenraum"] }),
  addTerm({ ...econBase, sourceGroup: "feministEconomics" }, { id: "feministische-oekonomie", title: "Feministische Ökonomie", short: "Feministische Ökonomie untersucht, wie Wirtschaft durch Geschlecht, Care-Arbeit, Machtverhältnisse, unbezahlte Arbeit und soziale Reproduktion geprägt wird.", definition: "Sie macht sichtbar, was klassische Ökonomie oft ausblendet: Sorge, Reproduktion, Abhängigkeit, Macht und Zeit.", woek: "Sehr relevant, weil sie unsichtbare Wirkleistung sichtbar macht und mit Wirkungsmessung für Mensch, Planet und Demokratie verbunden werden kann.", mythos: "Feministische Ökonomie ist nur Identitätspolitik.", woekKlaerung: "Sie analysiert reale Leistungen, Kosten und Machtverhältnisse, insbesondere Care und soziale Reproduktion.", blindSpot: "Klassische Kennzahlen unterschätzen unbezahlte und unterbezahlte Systemleistung.", related: ["care-oekonomie", "sorgearbeit", "reproduktive-arbeit", "patriarchat"] }),
  addTerm({ ...econBase, sourceGroup: "feministEconomics" }, { id: "care-oekonomie", title: "Care-Ökonomie", short: "Care-Ökonomie beschreibt Sorge-, Pflege-, Erziehungs-, Beziehungs- und Reproduktionsarbeit als zentrale wirtschaftliche und gesellschaftliche Grundlage.", definition: "Care umfasst bezahlte und unbezahlte Arbeit, die Menschen versorgt und soziale Systeme stabilisiert.", woek: "Care ist nicht Nebentätigkeit, sondern Wirkleistung. Sie stabilisiert Mensch, Gesellschaft und Demokratie.", mythos: "Care ist privat oder nachrangig gegenüber produktiver Wirtschaft.", woekKlaerung: "Care erzeugt reale Systemleistung und muss wirkungsökonomisch sichtbar werden.", blindSpot: "Marktpreise unterschätzen Sorgearbeit systematisch.", related: ["feministische-oekonomie", "sorgearbeit", "reproduktive-arbeit", "wirkungseinkommen"] }),
  addTerm({ ...econBase, sourceGroup: "feministEconomics" }, { id: "sorgearbeit", title: "Sorgearbeit", short: "Sorgearbeit umfasst Tätigkeiten, die Menschen versorgen, pflegen, begleiten, erziehen oder stabilisieren.", definition: "Sie findet in Familien, Nachbarschaften, Bildung, Pflege, Gesundheit und sozialen Institutionen statt.", woek: "Sorgearbeit ist oft unterbezahlt oder unsichtbar, obwohl sie hohe Wirkung erzeugt.", mythos: "Sorgearbeit ist keine echte wirtschaftliche Leistung.", woekKlaerung: "Sie erzeugt Gesundheit, Teilhabe, Stabilität, Bildung und Vertrauen.", blindSpot: "Unbezahlte Arbeit fällt aus klassischen Wertschöpfungsrechnungen heraus.", related: ["care-oekonomie", "reproduktive-arbeit", "wirkungswertschoepfung"] }),
  addTerm({ ...econBase, sourceGroup: "feministEconomics" }, { id: "reproduktive-arbeit", title: "Reproduktive Arbeit", short: "Reproduktive Arbeit umfasst Tätigkeiten, die Leben, Arbeitsfähigkeit, soziale Bindungen und gesellschaftliche Reproduktion ermöglichen.", definition: "Sie umfasst Sorge, Pflege, Erziehung, Haushaltsarbeit, emotionale Stabilisierung und soziale Infrastruktur.", woek: "Zentral für Wirkungs-BIP, Wirkungseinkommen, Wirkungsrente und Care-Ökonomie.", mythos: "Reproduktive Arbeit ist nur Kostenfaktor.", woekKlaerung: "Sie erhält die Voraussetzungen jeder produktiven Wirtschaft.", blindSpot: "Wirkung entsteht oft außerhalb monetärer Transaktionen.", related: ["care-oekonomie", "sorgearbeit", "feministische-oekonomie"] }),
  addTerm({ ...econBase, sourceGroup: "trickleDown" }, {
    id: "trickle-down-oekonomie",
    title: "Trickle-down-Ökonomie",
    concept: "connection",
    customStatus: "Anschlussbegriff / Systemmythos / wirtschaftspolitischer Wirkpfad",
    aliases: ["Trickle-down Economics", "Durchsickerungsökonomie", "Durchsickerungsmythos", "Trickle-down-Theorie", "trickle-down"],
    short: "Trickle-down-Ökonomie bezeichnet die Annahme, dass Entlastungen für Vermögende, Unternehmen oder Kapital langfristig allen zugutekommen sollen.",
    definition: "Trickle-down-Ökonomie beschreibt eine wirtschaftspolitische Logik, nach der Entlastungen am oberen Ende der Einkommens-, Vermögens- oder Unternehmensstruktur positive Effekte für die gesamte Gesellschaft erzeugen sollen. Die angenommene Wirkungskette lautet: Kapital wird entlastet, Investitionen steigen, Unternehmen wachsen, Arbeitsplätze entstehen und Wohlstand sickert nach unten.",
    woek: "In der Wirkungsökonomie ist Trickle-down ein Beispiel für ein Wirkungsversprechen ohne ausreichende Wirkungsprüfung. Behauptete Folgewirkungen müssen daran geprüft werden, wer entlastet wird, wohin zusätzliches Kapital fließt, ob investiert, ausgeschüttet, gespart oder spekuliert wird, ob gute Arbeitsplätze entstehen, ob Ungleichheit sinkt oder steigt und was mit Infrastruktur, Klima- und Sozialkosten sowie Vertrauen in Demokratie und Gerechtigkeit geschieht. Trickle-down behauptet Wirkung. Die Wirkungsökonomie misst Wirkung.",
    mythos: "Wenn es dem Kapital gut geht, geht es irgendwann allen gut.",
    woekKlaerung: "Kapital kann positive Wirkung ermöglichen, aber nur, wenn es an Wirkung rückgekoppelt wird. Ohne Wirkungsbindung kann Kapitalentlastung Vermögenskonzentration, soziale Spaltung, Staatsunterfinanzierung, ökologische Externalisierung und demokratischen Vertrauensverlust verstärken. Kapitalzuwachs ist keine positive Netto-Wirkung.",
    blindSpot: "Trickle-down verwechselt Kapitalaktivierung mit gesellschaftlicher Wirkung.",
    related: ["kapital", "kapitalwirkung", "kapitalrendite", "marktwirtschaft", "kapitalismus", "raubtierkapitalismus", "finanzmarktkapitalismus", "externalisierung", "positive-netto-wirkung", "wirkungssteuer", "vertrauen", "demokratie"]
  }),
];

const feminismCareTerms = [
  addTerm(feminismCareBase, { id: "feminismus", title: "Feminismus", concept: "connection", short: "Feminismus bezeichnet Denk- und Handlungsansätze, die Gleichwertigkeit, Selbstbestimmung, Teilhabe und Machtkritik ins Zentrum stellen und patriarchale Strukturen überwinden wollen.", definition: "Feminismus ist nicht nur der Einsatz für Frauenrechte. Er analysiert Macht-, Rollen-, Eigentums-, Arbeits- und Anerkennungsstrukturen, die Menschen aufgrund von Geschlecht, Körper, Sorgeverantwortung, Lebensform oder sozialer Position ungleich behandeln. Er fragt, welche Lebens- und Arbeitsformen sichtbar, anerkannt, bezahlt, geschützt und politisch berücksichtigt werden und welche nicht.", woek: "In der Wirkungsökonomie ist Feminismus eine zentrale Anschlusslinie, weil er zeigt, dass klassische Steuerungssysteme viele wirkungsstarke Tätigkeiten ausblenden: Sorgearbeit, Pflege, Erziehung, emotionale Arbeit, soziale Stabilisierung, Beziehungspflege, Reproduktion, Schutzräume und Teilhabe. Feminismus macht sichtbar, dass Marktwert nicht Wirkungswert ist.", mythos: "Feminismus richtet sich gegen Männer.", woekKlaerung: "Feminismus richtet sich gegen Strukturen, die Macht, Anerkennung, Einkommen, Sicherheit, Freiheit, Wirkung und Würde ungleich verteilen.", blindSpot: "Ohne feministische Wirkungsperspektive bleiben Care, Machtverteilung, Repräsentation und Datenlücken unsichtbar.", related: ["patriarchat", "feministische-oekonomie", "care-oekonomie", "sorgearbeit", "gleichwertigkeit", "teilhabe", "teilgabe", "machtdezentralisierung", "gender-pay-gap", "gender-care-gap", "gender-data-gap", "soziale-reproduktion", "wirkungswert"] }),
  addTerm(feminismCareBase, { id: "feministische-oekonomie", title: "Feministische Ökonomie", aliases: ["feministische Wirtschaft", "feministische Wirtschaftswissenschaft", "feministische Wirtschaftslehre"], concept: "connection", short: "Feministische Ökonomie untersucht, wie Wirtschaft durch Geschlecht, Care-Arbeit, unbezahlte Arbeit, Machtverhältnisse, soziale Reproduktion und ungleiche Anerkennung geprägt wird.", definition: "Feministische Ökonomie kritisiert, dass klassische ökonomische Modelle häufig nur bezahlte Erwerbsarbeit, Markttransaktionen, Kapital, Produktivität und Wachstum messen. Sie macht sichtbar, dass Gesellschaften auf unbezahlter oder unterbezahlter Arbeit beruhen: Pflege, Erziehung, Haushalt, emotionale Arbeit, Sorge, Beziehung, Gemeinschaft und soziale Stabilisierung.", woek: "Feministische Ökonomie ist eine zentrale Anschlusslinie der Wirkungsökonomie. Sie zeigt, dass Tätigkeiten mit hoher gesellschaftlicher Wirkung im alten System als Kosten, private Angelegenheit oder unsichtbare Voraussetzung behandelt werden. Die WÖk übersetzt diese Einsicht in Wirkungsmessung, Wirkungs-BIP, Wirkungseinkommen, Wirkungsrente, Scorecards und Wirkungssteuerung.", mythos: "Feministische Ökonomie ist eine Nischenperspektive oder reine Frauenpolitik.", woekKlaerung: "Sie betrifft das Fundament jeder Wirtschaft: Wer versorgt, pflegt, erzieht, stabilisiert und reproduziert die Gesellschaft?", blindSpot: "Klassische Kennzahlen unterschätzen unbezahlte und unterbezahlte Wirkleistung.", related: ["feminismus", "care-oekonomie", "sorgearbeit", "soziale-reproduktion", "unbezahlte-arbeit", "gender-pay-gap", "gender-care-gap", "gender-pension-gap", "wirkungs-bip", "wirkungseinkommen", "wirkungsrente", "wert", "wirkungswert", "patriarchat"] }),
  addTerm(feminismCareBase, { id: "feministische-wirtschaftspolitik", title: "Feministische Wirtschaftspolitik", short: "Feministische Wirtschaftspolitik richtet wirtschaftspolitische Entscheidungen auf Gleichwertigkeit, Care, soziale Reproduktion, Teilhabe und Machtdezentralisierung aus.", definition: "Sie fragt, welche Wirkungen Haushalte, Steuern, Sozialpolitik, Arbeitsmarktpolitik, Infrastruktur, Bildung, Gesundheit und Pflege auf unterschiedliche Gruppen haben. Beispiele sind Gender Budgeting, Care-Infrastruktur, armutsfeste Sozialpolitik, gleiche Bezahlung, Anerkennung unbezahlter Arbeit und Beteiligung an wirtschaftlichen Entscheidungen.", woek: "In der WÖk ist feministische Wirtschaftspolitik ein Anwendungsfeld von Wirkungshaushalt, Wirkungssteuerung und demokratischer Teilhabe.", mythos: "Feministische Wirtschaftspolitik ist Sonderpolitik.", woekKlaerung: "Sie prüft Grundentscheidungen von Staat, Markt und Infrastruktur auf reale Wirkung und Gleichwertigkeit.", blindSpot: "Haushalte und Steuerregeln können ungleiche Care- und Machtstrukturen stabilisieren.", related: ["gender-budgeting", "wirkungshaushalt", "care-oekonomie", "teilhabe", "soziale-gerechtigkeit", "wirkungsstaat"] }),
  addTerm(feminismCareBase, { id: "care-oekonomie", title: "Care-Ökonomie", short: "Care-Ökonomie beschreibt Sorge-, Pflege-, Erziehungs-, Beziehungs- und Reproduktionsarbeit als zentrale wirtschaftliche und gesellschaftliche Grundlage.", definition: "Care umfasst bezahlte und unbezahlte Arbeit, die Menschen versorgt, stabilisiert, begleitet, schützt und soziale Systeme reproduziert.", woek: "Care ist keine Randtätigkeit, sondern Wirkleistung. Sie stabilisiert Menschen, Familien, Gesundheit, Bildung, Gesellschaft und Demokratie. Die WÖk macht diese Wirkung sichtbar und koppelt sie in Einkommen, Rente, Haushalt, Infrastruktur und politische Steuerung zurück.", mythos: "Care ist privat und keine wirtschaftliche Leistung.", woekKlaerung: "Care ist eine zentrale Voraussetzung jeder Wirtschaft. Ohne Care gibt es keine Arbeitsfähigkeit, Bildung, Gesundheit, soziale Stabilität und demokratische Teilhabe.", blindSpot: "Marktpreise unterschätzen Sorgearbeit systematisch.", related: ["feministische-oekonomie", "sorgearbeit", "reproduktive-arbeit", "soziale-reproduktion", "wirkungseinkommen", "wirkungsrente", "patriarchat"] }),
  addTerm(feminismCareBase, { id: "sorgearbeit", title: "Sorgearbeit", aliases: ["Care-Arbeit", "Sorge-Arbeit", "Care Work"], short: "Sorgearbeit umfasst Tätigkeiten, die Menschen versorgen, pflegen, begleiten, erziehen, stabilisieren oder schützen.", definition: "Sorgearbeit umfasst Pflege, Kinderbetreuung, Angehörigenpflege, Haushalt, emotionale Unterstützung, Begleitung, Nachbarschaftshilfe und soziale Stabilisierung.", woek: "Sorgearbeit erzeugt hohe Wirkung, wird aber in klassischen Märkten häufig schlecht bezahlt oder gar nicht als Arbeit anerkannt. In der WÖk ist Sorgearbeit ein zentraler Bereich von Wirkleistung.", mythos: "Sorgearbeit ist keine echte wirtschaftliche Leistung.", woekKlaerung: "Sie erzeugt Gesundheit, Teilhabe, Stabilität, Bildung und Vertrauen.", blindSpot: "Unbezahlte Sorgearbeit fällt aus klassischen Wertschöpfungsrechnungen heraus.", related: ["care-oekonomie", "reproduktive-arbeit", "soziale-reproduktion", "unbezahlte-arbeit", "mental-load", "emotionale-arbeit", "wirkungswertschoepfung"] }),
  addTerm(feminismCareBase, { id: "reproduktive-arbeit", title: "Reproduktive Arbeit", short: "Reproduktive Arbeit umfasst Tätigkeiten, die Leben, Arbeitsfähigkeit, soziale Bindungen und gesellschaftliche Reproduktion ermöglichen.", definition: "Sie umfasst Sorge, Pflege, Erziehung, Haushaltsarbeit, emotionale Stabilisierung und soziale Infrastruktur.", woek: "Reproduktive Arbeit ist ein Kernbegriff feministischer Ökonomie. Die WÖk ordnet sie als häufig unsichtbare, aber systemerhaltende Wirkung ein.", mythos: "Reproduktive Arbeit ist nur Kostenfaktor.", woekKlaerung: "Sie erhält die Voraussetzungen jeder produktiven Wirtschaft.", blindSpot: "Wirkung entsteht oft außerhalb monetärer Transaktionen.", related: ["care-oekonomie", "sorgearbeit", "soziale-reproduktion", "feministische-oekonomie"] }),
  addTerm(feminismCareBase, { id: "soziale-reproduktion", title: "Soziale Reproduktion", short: "Soziale Reproduktion beschreibt die gesellschaftlichen Prozesse, durch die Menschen, Beziehungen, Fähigkeiten, Versorgung und soziale Ordnung fortlaufend erhalten werden.", definition: "Sie umfasst Care, Bildung, Gesundheit, Haushalte, soziale Bindungen, Alltagsorganisation, Schutz, Erziehung und Regeneration.", woek: "Soziale Reproduktion ist der unsichtbare Unterbau von Märkten, Arbeit, Staat und Demokratie. Die WÖk macht sichtbar, dass Wirtschaft nicht nur Produktion, sondern auch Erhaltung, Pflege und Stabilisierung braucht.", mythos: "Wirtschaft ist vor allem Produktion und Markt.", woekKlaerung: "Produktion setzt soziale Reproduktion voraus.", blindSpot: "Systemerhaltende Arbeit wird als private Voraussetzung statt als Wirkleistung behandelt.", related: ["feministische-oekonomie", "care-oekonomie", "sorgearbeit", "reproduktive-arbeit", "unbezahlte-arbeit"] }),
  addTerm(feminismCareBase, { id: "unbezahlte-arbeit", title: "Unbezahlte Arbeit", short: "Unbezahlte Arbeit sind Tätigkeiten, die gesellschaftlich notwendig sind, aber nicht oder nicht direkt monetär entlohnt werden.", definition: "Sie umfasst große Teile von Sorgearbeit, Haushalt, Ehrenamt, Nachbarschaftshilfe, Familienorganisation und sozialer Stabilisierung.", woek: "Unbezahlte Arbeit zeigt den blinden Fleck kapital- und einkommensorientierter Systeme. Die WÖk bewertet Arbeit nicht nur nach Einkommen, sondern nach Wirkung.", mythos: "Was nicht bezahlt wird, ist ökonomisch weniger relevant.", woekKlaerung: "Nichtzahlung kann gerade anzeigen, dass zentrale Wirkung externalisiert oder privatisiert wird.", blindSpot: "Leistung wird über Marktzahlung statt über Zustandsveränderung gelesen.", related: ["unsichtbare-arbeit", "sorgearbeit", "gender-care-gap", "wirkungseinkommen", "wirkungswert"] }),
  addTerm(feminismCareBase, { id: "unsichtbare-arbeit", title: "Unsichtbare Arbeit", short: "Unsichtbare Arbeit beschreibt Tätigkeiten, die notwendig sind, aber sozial, ökonomisch oder statistisch kaum sichtbar werden.", definition: "Unsichtbare Arbeit umfasst Planung, Koordination, Pflege, Beziehungspflege, Konfliktvermeidung, emotionale Stabilisierung und vieles, was Systeme trägt, ohne als Leistung zu erscheinen.", woek: "Unsichtbare Arbeit ist ein zentrales Beispiel für Wirkungsblindheit. Sie kann hohe positive Wirkung erzeugen, ohne als Leistung anerkannt zu werden.", mythos: "Unsichtbare Arbeit ist Kleinkram.", woekKlaerung: "Gerade unsichtbare Arbeit hält oft Systeme stabil.", blindSpot: "Messsysteme erkennen nicht, was nicht als Transaktion erscheint.", related: ["unbezahlte-arbeit", "mental-load", "emotionale-arbeit", "wirkungsblindheit"] }),
  addTerm(feminismCareBase, { id: "mental-load", title: "Mental Load", short: "Mental Load beschreibt die mentale Verantwortung für Planung, Organisation, Erinnerung und Koordination von Sorge-, Haushalts- oder Familienaufgaben.", definition: "Mental Load umfasst das dauerhafte Mitdenken, Planen, Erinnern, Priorisieren und Koordinieren von Aufgaben, auch wenn die Ausführung geteilt wird.", woek: "Mental Load ist ein Beispiel für unsichtbare Arbeit und ungleich verteilte Belastung. Er beeinflusst Gesundheit, Zeit, Erwerbsarbeit, Teilhabe und Gleichwertigkeit.", mythos: "Organisation nebenbei ist keine Arbeit.", woekKlaerung: "Planungsverantwortung verbraucht Aufmerksamkeit, Zeit und Gesundheit und erzeugt reale Wirkung.", blindSpot: "Verantwortung wird oft erst sichtbar, wenn sie ausfällt.", related: ["unsichtbare-arbeit", "sorgearbeit", "gender-care-gap", "kognitive-belastung"] }),
  addTerm(feminismCareBase, { id: "emotionale-arbeit", title: "Emotionale Arbeit", aliases: ["Emotional Labour"], short: "Emotionale Arbeit beschreibt die Regulation, Darstellung oder Unterstützung von Emotionen als Teil sozialer, beruflicher oder familiärer Arbeit.", definition: "Sie umfasst das Beruhigen, Motivieren, Vermitteln, Zuhören, Konflikte Abfangen und emotionale Stabilisieren in Familien, Pflege, Dienstleistung, Bildung, Führung oder Gemeinschaft.", woek: "Emotionale Arbeit kann hohe Wirkung für Beziehungen, Pflege, Dienstleistung, Konfliktvermeidung und soziale Stabilität erzeugen, bleibt aber häufig unsichtbar.", mythos: "Emotionale Stabilisierung ist Persönlichkeit, keine Arbeit.", woekKlaerung: "Emotionale Arbeit erzeugt reale Zustandsveränderungen in Vertrauen, Sicherheit, Gesundheit und Zusammenarbeit.", blindSpot: "Soziale Stabilisierung wird oft naturalisiert statt anerkannt.", related: ["sorgearbeit", "unsichtbare-arbeit", "resonanzraum", "vertrauen"] }),
  addTerm(feminismCareBase, { id: "gender-pay-gap", title: "Gender Pay Gap", short: "Der Gender Pay Gap beschreibt den Unterschied im durchschnittlichen Einkommen zwischen Frauen und Männern.", definition: "Der Gender Pay Gap entsteht durch mehrere Wirkpfade: Berufswahl, Branchenbewertung, Care-Verteilung, Teilzeit, Karrierebarrieren, Lohnstrukturen, Repräsentation und Machtverteilung.", woek: "Er ist nicht nur eine Einkommensfrage, sondern zeigt Wirkungslücken in Anerkennung, Macht, Care-Verteilung, Karrierewegen und Altersvorsorge.", mythos: "Der Gender Pay Gap ist nur eine Frage individueller Berufswahl.", woekKlaerung: "Er entsteht aus komplexen strukturellen Wirkpfaden, die sichtbar und steuerbar gemacht werden müssen.", blindSpot: "Durchschnittswerte verdecken Ursachen, Machtpfade und Langzeitfolgen.", related: ["gender-care-gap", "gender-pension-gap", "gleichstellung", "feministische-oekonomie", "wirkungsrente"] }),
  addTerm(feminismCareBase, { id: "gender-care-gap", title: "Gender Care Gap", short: "Der Gender Care Gap beschreibt die ungleiche Verteilung unbezahlter Sorgearbeit zwischen den Geschlechtern.", definition: "Er zeigt, wer wie viel Zeit und Verantwortung für Pflege, Kinder, Haushalt, Angehörige und soziale Stabilisierung übernimmt.", woek: "Der Gender Care Gap ist zentral, weil unbezahlte Care-Arbeit gesellschaftliche Stabilität erzeugt, aber Einkommen, Zeit, Rente, Gesundheit und Teilhabe ungleich beeinflusst.", mythos: "Care-Verteilung ist reine Privatsache.", woekKlaerung: "Private Care-Verteilung hat öffentliche Wirkungen auf Arbeit, Einkommen, Gesundheit, Bildung und Demokratie.", blindSpot: "Zeit- und Verantwortungslasten werden in Geldkennzahlen unterschätzt.", related: ["sorgearbeit", "gender-pay-gap", "gender-pension-gap", "mental-load", "care-oekonomie"] }),
  addTerm(feminismCareBase, { id: "gender-pension-gap", title: "Gender Pension Gap", short: "Der Gender Pension Gap beschreibt den Unterschied in Alterseinkünften zwischen Frauen und Männern.", definition: "Er entsteht aus Erwerbsunterbrechungen, Teilzeit, schlechter bezahlten Care-Berufen, unbezahlter Arbeit, Lohnunterschieden und Rentenlogiken.", woek: "Der Begriff zeigt, wie heutige Care- und Einkommensstrukturen langfristig in Altersarmut und Abhängigkeit übersetzt werden.", mythos: "Rentenunterschiede entstehen erst im Alter.", woekKlaerung: "Der Gender Pension Gap ist eine Langzeitfolge von Arbeitsteilung, Lohnstruktur und Care-Bewertung.", blindSpot: "Lebensverlaufswirkungen werden in kurzfristigen Arbeitsmarktkennzahlen verdeckt.", related: ["gender-pay-gap", "gender-care-gap", "wirkungsrente", "unbezahlte-arbeit"] }),
  addTerm(feminismCareBase, { id: "gender-data-gap", title: "Gender Data Gap", short: "Der Gender Data Gap beschreibt Datenlücken, Verzerrungen oder fehlende Differenzierung, durch die Lebensrealitäten von Frauen oder anderen Gruppen unzureichend erfasst werden.", definition: "Er betrifft Forschung, Produkte, Medizin, Mobilität, Arbeit, KI, Infrastruktur, Sicherheit und politische Steuerung.", woek: "Der Gender Data Gap ist ein Wirkungsrisiko. Was nicht gemessen wird, wird politisch, technisch und ökonomisch oft falsch gestaltet. Für die WÖk ist Datenqualität daher auch eine Frage von Gleichwertigkeit und Demokratie.", mythos: "Daten sind neutral.", woekKlaerung: "Daten können blinde Flecken enthalten. Wer nicht gemessen wird, wird in Politik, Technik, Produkten und Infrastruktur schlechter berücksichtigt.", blindSpot: "Durchschnittsdaten können betroffene Gruppen unsichtbar machen.", related: ["datenqualitaet", "wirkungsdaten", "gender-mainstreaming", "gleichstellung", "scorecard"] }),
  addTerm(feminismCareBase, { id: "glaeserne-decke", title: "Gläserne Decke", short: "Die gläserne Decke beschreibt unsichtbare strukturelle Barrieren, die Aufstieg und Führungsverantwortung trotz formaler Gleichberechtigung begrenzen.", definition: "Sie entsteht durch Netzwerke, Rollenbilder, Bewertungsmuster, Care-Erwartungen, Auswahlprozesse und informelle Macht.", woek: "Relevant für Machtverteilung, Unternehmenswirkung, Governance, Repräsentation und Teilhabe.", mythos: "Wer gut genug ist, steigt automatisch auf.", woekKlaerung: "Formale Offenheit ersetzt keine Prüfung tatsächlicher Barrieren und Wirkpfade.", blindSpot: "Informelle Macht wird selten gemessen.", related: ["gleichstellung", "gender-pay-gap", "machtkonzentration", "glaeserne-klippe"] }),
  addTerm(feminismCareBase, { id: "intersektionalitaet", title: "Intersektionalität", short: "Intersektionalität beschreibt, dass unterschiedliche Diskriminierungs- und Machtverhältnisse zusammenwirken können.", definition: "Geschlecht, Klasse, Herkunft, Behinderung, Alter, Religion, sexuelle Orientierung oder Aufenthaltsstatus können Wirkungspfade überlagern und verstärken.", woek: "Intersektionalität ist wichtig, weil Wirkungsempfänger nicht homogen sind. Eine Maßnahme kann für verschiedene Gruppen sehr unterschiedlich wirken.", mythos: "Intersektionalität macht alles kompliziert.", woekKlaerung: "Intersektionalität macht Wirkungsunterschiede sichtbar und verhindert, dass Durchschnittswerte Betroffene unsichtbar machen.", blindSpot: "Einzelkategorien können reale Mehrfachbelastungen verdecken.", related: ["gleichstellung", "gender-data-gap", "wirkungsempfaenger", "teilhabe"] }),
  addTerm(feminismCareBase, { id: "gleichstellung", title: "Gleichstellung", short: "Gleichstellung beschreibt politische, rechtliche und gesellschaftliche Maßnahmen, die gleiche Chancen, Rechte und Teilhabe praktisch ermöglichen sollen.", definition: "Gleichstellung umfasst Regeln, Ressourcen, Schutz, Zugang, Repräsentation, Daten, Infrastruktur und Korrektur von Benachteiligung.", woek: "Gleichstellung ist nicht nur formale Gleichberechtigung, sondern praktische Wirkung auf Einkommen, Sicherheit, Gesundheit, Teilhabe und Machtverteilung.", mythos: "Gleichstellung ist erreicht, wenn Rechte formal gleich sind.", woekKlaerung: "Die WÖk fragt, ob gleiche Rechte tatsächlich gleiche Wirkungschancen erzeugen.", blindSpot: "Formale Gleichheit kann strukturelle Hürden verdecken.", related: ["gleichberechtigung", "gleichwertigkeit", "gender-mainstreaming", "gender-budgeting", "intersektionalitaet"] }),
  addTerm(feminismCareBase, { id: "gleichberechtigung", title: "Gleichberechtigung", short: "Gleichberechtigung beschreibt die gleiche rechtliche Anerkennung und Behandlung von Menschen.", definition: "Sie ist eine rechtliche und normative Grundlage demokratischer Gesellschaften.", woek: "Gleichberechtigung ist notwendig, aber nicht hinreichend. Die WÖk fragt zusätzlich, ob gleiche Rechte tatsächlich gleiche Wirkungschancen erzeugen.", mythos: "Gleiche Rechte lösen gleiche Wirkungen aus.", woekKlaerung: "Rechte brauchen Ressourcen, Zugang, Schutz, Daten und Durchsetzung.", blindSpot: "Rechtslage und Lebenswirklichkeit können auseinanderfallen.", related: ["gleichstellung", "gleichwertigkeit", "rechtsstaatlichkeit", "teilhabe"] }),
  addTerm(feminismCareBase, { id: "gleichwertigkeit", title: "Gleichwertigkeit", short: "Gleichwertigkeit beschreibt die Anerkennung gleicher Würde, Bedeutung und Schutzwürdigkeit aller Menschen.", definition: "Gleichwertigkeit ist keine Gleichmacherei, sondern die normative Anerkennung gleicher Würde bei unterschiedlichen Lebenslagen.", woek: "Gleichwertigkeit ist ein normativer Grundzustand der Dimension Mensch und Voraussetzung demokratischer Stabilität.", mythos: "Gleichwertigkeit bedeutet gleiche Lebensentwürfe.", woekKlaerung: "Gleichwertigkeit schützt Würde und Teilhabe gerade in Unterschiedlichkeit.", blindSpot: "Ungleich bewertete Arbeit und Sorge bleiben häufig normalisiert.", related: ["menschenwuerde", "gleichstellung", "gleichberechtigung", "feminismus", "demokratie"] }),
  addTerm(feminismCareBase, { id: "gender-mainstreaming", title: "Gender Mainstreaming", short: "Gender Mainstreaming bedeutet, Geschlechterwirkungen systematisch in Planung, Entscheidung, Umsetzung und Evaluation einzubeziehen.", definition: "Es prüft, wie Regeln, Haushalte, Produkte, Infrastruktur oder Programme unterschiedliche Gruppen unterschiedlich betreffen.", woek: "In der WÖk ist Gender Mainstreaming eine Form von Wirkungsprüfung. Es zeigt, dass Maßnahmen unterschiedliche Folgewirkungen für unterschiedliche Gruppen haben können.", mythos: "Gender Mainstreaming ist Bürokratie ohne Wirkung.", woekKlaerung: "Richtig angewandt verhindert es Wirkungsblindheit in Planung und Evaluation.", blindSpot: "Ohne Daten und Verantwortlichkeit bleibt es Symbolik.", related: ["gender-data-gap", "gleichstellung", "gleichstellungsfolgenabschaetzung", "wirkungspruefung"] }),
  addTerm(feminismCareBase, { id: "gender-budgeting", title: "Gender Budgeting", short: "Gender Budgeting untersucht, wie öffentliche Haushalte und Finanzentscheidungen auf Geschlechtergerechtigkeit und Gleichstellung wirken.", definition: "Es analysiert, wer von Ausgaben, Steuern, Kürzungen, Investitionen und Infrastruktur profitiert oder belastet wird.", woek: "Gender Budgeting ist eng mit Wirkungshaushalt verbunden. Die WÖk erweitert es um Mensch, Planet und Demokratie.", mythos: "Haushalte sind neutral.", woekKlaerung: "Budgets verteilen Wirkung, Macht, Zeit und Chancen.", blindSpot: "Finanzplanung verdeckt oft unbezahlte Folgekosten.", related: ["wirkungshaushalt", "feministische-wirtschaftspolitik", "gleichstellung", "care-oekonomie"] }),
  addTerm(feminismCareBase, { id: "machtdezentralisierung", title: "Machtdezentralisierung", short: "Machtdezentralisierung beschreibt die Verteilung von Entscheidungs-, Eigentums-, Daten-, Deutungs- und Gestaltungsmacht auf mehrere Akteure und Ebenen.", definition: "Sie zielt darauf, Abhängigkeit, Missbrauch, Dominanz und Ausschluss zu begrenzen.", woek: "Feminismus ist eng mit Machtdezentralisierung verbunden, weil patriarchale Systeme häufig durch Hierarchie, Kontrolle und Konzentration wirken.", mythos: "Beteiligung allein dezentralisiert Macht.", woekKlaerung: "Machtdezentralisierung braucht Rechte, Ressourcen, Datenzugang, Schutz und reale Entscheidungsmöglichkeiten.", blindSpot: "Scheinbeteiligung kann Machtkonzentration stabilisieren.", related: ["feminismus", "patriarchat", "machtkonzentration", "dezentralisierung-von-macht", "teilhabe"] }),
  addTerm(feminismCareBase, { id: "kooperationslogik", title: "Kooperationslogik", short: "Kooperationslogik beschreibt eine Handlungslogik, in der Zusammenarbeit, Beziehung, gegenseitige Stärkung und geteilte Verantwortung im Mittelpunkt stehen.", definition: "Kooperationslogik sucht Wirkung über Abstimmung, Vertrauen, Sorge, Rückkopplung und gemeinsame Lernfähigkeit.", woek: "In der WÖk ist Kooperationslogik ein Gegenpol zu Dominanzlogik und Machtkonzentration.", mythos: "Kooperation ist weich und weniger wirksam.", woekKlaerung: "In komplexen Systemen kann Kooperation die zentrale Bedingung stabiler Wirkung sein.", blindSpot: "Kooperation ohne Machtanalyse kann ungleiche Lasten verdecken.", related: ["dominanzlogik", "feminismus", "patriarchat", "vertrauen", "systemische-kooperation"] }),
  addTerm(feminismCareBase, { id: "dominanzlogik", title: "Dominanzlogik", short: "Dominanzlogik beschreibt eine Handlungslogik, in der Kontrolle, Hierarchie, Durchsetzung und Machtvorteile im Mittelpunkt stehen.", definition: "Dominanzlogik wirkt über Überordnung, Abwertung, Externalisierung, Kontrollansprüche und die Konzentration von Eigentum, Daten oder Deutungsmacht.", woek: "Dominanzlogik ist ein zentraler Mechanismus patriarchaler und extraktiver Systeme.", mythos: "Dominanz ist nur persönliche Haltung.", woekKlaerung: "Dominanzlogik kann in Regeln, Märkten, Organisationen, Sprache und Infrastruktur eingebaut sein.", blindSpot: "Durchsetzungserfolge verdecken Folgekosten für Mensch, Planet und Demokratie.", related: ["kooperationslogik", "patriarchat", "machtkonzentration", "externalisierung", "extraktiver-kapitalismus"] }),
  addTerm(feminismCareBase, { id: "patriarchat", title: "Patriarchat", concept: "precision", short: "Patriarchat beschreibt historisch gewachsene Macht- und Deutungsordnungen, in denen männlich codierte Dominanz, Kontrolle, Hierarchie und Eigentumslogik strukturell bevorzugt werden.", definition: "Patriarchat ist in der Wirkungsökonomie nicht als biologischer Männerbegriff zu verstehen, sondern als historisch gewachsene Struktur von Dominanz, Kontrolle, Hierarchie, Eigentumslogik, Externalisierung und Abwertung von Care. Feminismus ist die Gegenbewegung nicht im Sinne einer bloßen Umkehrung von Macht, sondern im Sinne von Gleichwertigkeit, Machtdezentralisierung, Teilhabe, Teilgabe und Kooperationslogik.", woek: "Patriarchale Strukturen können Care-Arbeit entwerten, Kooperation schwächen, Dominanzlogiken normalisieren und Wirkung unsichtbar machen.", mythos: "Patriarchat bedeutet nur individuelle Männerherrschaft.", woekKlaerung: "Patriarchat ist eine Systemlogik, die durch Institutionen, Märkte, Sprache, Rollenbilder und Machtstrukturen reproduziert werden kann.", blindSpot: "Unsichtbare Care- und Reproduktionsarbeit wird abgewertet.", related: ["feminismus", "feministische-oekonomie", "care-oekonomie", "dominanzlogik", "kooperationslogik", "machtkonzentration", "machtdezentralisierung", "sorgearbeit", "soziale-reproduktion", "gender-pay-gap", "gender-care-gap", "gender-data-gap", "gleichwertigkeit", "intersektionalitaet"] }),
  addTerm(feminismCareBase, { id: "gleichstellungsfolgenabschaetzung", title: "Gleichstellungsfolgenabschätzung", concept: "method", statusNote: "Priorität 2", short: "Gleichstellungsfolgenabschätzung prüft, welche Auswirkungen eine Maßnahme, Regel oder Entscheidung auf Gleichstellung hat.", definition: "Sie untersucht unterschiedliche Wirkungspfade nach Geschlecht, Lebenslage, Care-Verantwortung und weiteren Machtpositionen.", woek: "Teilbereich einer Wirkungsprüfung.", related: ["gender-mainstreaming", "gleichstellung", "wirkungspruefung"] }),
  addTerm(feminismCareBase, { id: "koerperliche-selbstbestimmung", title: "Körperliche Selbstbestimmung", statusNote: "Priorität 2", short: "Körperliche Selbstbestimmung beschreibt das Recht und die Fähigkeit, über den eigenen Körper, Gesundheit, Sexualität und Reproduktion frei und sicher zu entscheiden.", definition: "Der Begriff verbindet Würde, Gesundheit, Freiheit, Schutz und demokratische Teilhabe.", woek: "Relevant für Mensch, Würde, Gesundheit, Teilhabe und Demokratie.", related: ["menschenwuerde", "gesundheit", "reproduktive-rechte", "gleichwertigkeit"] }),
  addTerm(feminismCareBase, { id: "reproduktive-rechte", title: "Reproduktive Rechte", statusNote: "Priorität 2", short: "Reproduktive Rechte umfassen Rechte im Zusammenhang mit Schwangerschaft, Geburt, Familienplanung, Verhütung und reproduktiver Gesundheit.", definition: "Sie betreffen Freiheit, Gesundheit, körperliche Selbstbestimmung, Zugang, Schutz und Information.", woek: "Relevanter Begriff für Mensch, Gesundheit und Demokratie, wenn Grundrechte und Gesundheitswirkung verhandelt werden.", related: ["koerperliche-selbstbestimmung", "gesundheit", "gleichberechtigung"] }),
  addTerm(feminismCareBase, { id: "glaeserne-klippe", title: "Gläserne Klippe", aliases: ["Glass Cliff"], statusNote: "Priorität 2", short: "Die gläserne Klippe beschreibt Situationen, in denen Frauen oder marginalisierte Personen besonders häufig in Krisen- oder Hochrisikopositionen berufen werden.", definition: "Der Begriff verweist auf ungleiche Risikoübernahme in Führung und Transformation.", woek: "Relevant für Governance, Führung, Machtverteilung und Krisenwirkung.", related: ["glaeserne-decke", "gleichstellung", "governance"] }),
  addTerm(feminismCareBase, { id: "patriarchale-dividende", title: "Patriarchale Dividende", statusNote: "Priorität 2", short: "Patriarchale Dividende beschreibt Vorteile, die Menschen in patriarchalen Strukturen durch geschlechtsspezifische Macht- und Anerkennungsordnungen erhalten können.", definition: "Der Begriff ist als Strukturbegriff zu verwenden, nicht als individuelle Schuldzuweisung.", woek: "Er kann sichtbar machen, wie Vorteile, Einkommen, Zeit, Sicherheit und Anerkennung ungleich verteilt werden.", mythos: "Patriarchale Dividende bedeutet persönliche Schuld jedes Mannes.", woekKlaerung: "Der Begriff beschreibt strukturelle Vorteile, die geprüft und verändert werden können.", blindSpot: "Strukturvorteile werden oft als individuelle Leistung normalisiert.", related: ["patriarchat", "machtkonzentration", "gender-pay-gap"] }),
  addTerm(feminismCareBase, { id: "reproduktive-gerechtigkeit", title: "Reproduktive Gerechtigkeit", statusNote: "Priorität 2", short: "Reproduktive Gerechtigkeit verbindet reproduktive Rechte mit sozialer, gesundheitlicher, ökonomischer und politischer Teilhabe.", definition: "Sie fragt nicht nur nach formalen Rechten, sondern nach realen Möglichkeiten, Sicherheit, Versorgung und Selbstbestimmung.", woek: "Anschlussbegriff für Mensch, Gesundheit, Gleichwertigkeit und Demokratie.", related: ["reproduktive-rechte", "koerperliche-selbstbestimmung", "gleichwertigkeit"] }),
  addTerm(feminismCareBase, { id: "feminisierung-von-armut", title: "Feminisierung von Armut", statusNote: "Priorität 2", short: "Feminisierung von Armut beschreibt, dass Frauen oder weiblich gelesene Lebenslagen überdurchschnittlich von Armut betroffen sein können.", definition: "Ursachen können Care-Verteilung, Teilzeit, Lohnstrukturen, Alleinerziehung, Altersarmut und Gewalt- oder Abhängigkeitsverhältnisse sein.", woek: "Der Begriff macht Verteilungs- und Langzeitwirkungen von Arbeit, Care und Einkommen sichtbar.", related: ["gender-pay-gap", "gender-pension-gap", "wirkungseinkommen", "wirkungsrente"] }),
  addTerm(feminismCareBase, { id: "feministische-transformation", title: "Feministische Transformation", statusNote: "Priorität 2", short: "Feministische Transformation beschreibt Veränderung von Macht-, Arbeits-, Care-, Repräsentations- und Anerkennungsstrukturen in Richtung Gleichwertigkeit.", definition: "Sie verbindet Kritik an patriarchalen Strukturen mit praktischer Gestaltung von Teilhabe, Care-Infrastruktur, Datenqualität und Machtdezentralisierung.", woek: "Anschlussbegriff für Transformation, Wirkungsgerechtigkeit und demokratische Resilienz.", related: ["feminismus", "feministische-wirtschaftspolitik", "machtdezentralisierung", "kooperationslogik"] }),
  addTerm(feminismCareBase, { id: "oekofeminismus", title: "Ökofeminismus", aliases: ["Ecofeminism"], statusNote: "Priorität 2", short: "Ökofeminismus verbindet feministische Machtkritik mit ökologischer Kritik an Ausbeutung, Dominanz und Externalisierung.", definition: "Der Begriff wird im WÖk-Glossar nur funktional genutzt, wenn Zusammenhänge zwischen Care, Natur, Macht und Externalisierung erklärt werden.", woek: "Anschlusslinie für Planet, Care und Dominanzlogik, aber kein allgemeines Theoriesammelbecken.", related: ["feminismus", "dominanzlogik", "externalisierung", "planet"] }),
];

function liberalMarketTerm([id, title, short, woek, aliases = [], related = [], concept = "connection", extra = {}]) {
  return addTerm(liberalMarketBase, {
    id,
    title,
    aliases,
    concept,
    short,
    definition: extra.definition || short,
    woek,
    related,
    ...extra,
  });
}

const liberalMarketTerms = [
  ["liberalismus", "Liberalismus", "Liberalismus betont individuelle Freiheit, Rechtsstaatlichkeit, Eigentum, Selbstbestimmung und Begrenzung staatlicher Macht.", "Die WÖk ist mit liberalen Grundwerten vereinbar, wenn Freiheit nicht als Wirkungsblindheit verstanden wird. Freiheit braucht reale Handlungsfähigkeit, transparente Informationen, faire Verfahren und die Begrenzung von Schäden, die andere tragen müssen.", [], ["freiheit", "negative-freiheit", "positive-freiheit", "reale-freiheit", "marktwirtschaft", "eigentumsrechte", "rechtsstaatlichkeit", "verantwortung", "wirkungsfreiheit", "wirklichkeitsbindung"], "system", { mythos: "Liberalismus bedeutet, dass der Markt alles regelt.", woekKlaerung: "Liberalismus schützt Freiheit. Märkte sind dezentrale Suchräume, brauchen aber Regeln, Eigentumsrechte, Haftung, Transparenz und Wirkungswahrheit.", blindSpot: "Formale Freiheit kann reale Abhängigkeiten, Externalitäten und Machtasymmetrien übersehen." }],
  ["politischer-liberalismus", "Politischer Liberalismus", "Politischer Liberalismus betont Grundrechte, Rechtsstaat, Gewaltenteilung, Pluralismus und Schutz individueller Freiheit vor willkürlicher Macht.", "Wichtig für Demokratie, Rechtsschutz, Datenschutz, Meinungsfreiheit und Schutz vor technokratischer Wirkungssteuerung.", [], ["liberalismus", "demokratie", "rechtsstaatlichkeit", "grundrechte", "wirkungsrat"]],
  ["wirtschaftsliberalismus", "Wirtschaftsliberalismus", "Wirtschaftsliberalismus betont wirtschaftliche Freiheit, Privateigentum, Vertragsfreiheit, Wettbewerb und begrenzte staatliche Eingriffe.", "Anschlussfähig, solange wirtschaftliche Freiheit nicht bedeutet, Folgekosten auf andere abzuwälzen.", [], ["liberalismus", "marktwirtschaft", "vertragsfreiheit", "eigentumsrechte", "wettbewerb", "externalitaet"]],
  ["klassischer-liberalismus", "Klassischer Liberalismus", "Klassischer Liberalismus betont individuelle Freiheit, Eigentum, Vertragsfreiheit, freie Märkte und begrenzten Staat.", "Anschlussfähig bei Freiheit und Rechtsstaat, unvollständig bei Klima, Externalitäten, Datenmacht, Plattformmacht und demokratischer Resonanz.", [], ["liberalismus", "wirtschaftsliberalismus", "negative-freiheit", "eigentumsrechte"]],
  ["sozialliberalismus", "Sozialliberalismus", "Sozialliberalismus verbindet individuelle Freiheit mit sozialer Absicherung, Chancengerechtigkeit und gesellschaftlicher Verantwortung.", "Eine wichtige Brücke zur WÖk, weil Freiheit nicht nur formal, sondern real möglich sein muss.", [], ["liberalismus", "positive-freiheit", "reale-freiheit", "gleichwertigkeit", "teilhabe"]],
  ["negative-freiheit", "Negative Freiheit", "Negative Freiheit beschreibt Freiheit von äußerem Zwang oder Eingriffen.", "Wichtig, aber nicht ausreichend: Eine Person kann formal frei sein und durch Armut, Informationsasymmetrie, Umweltbelastung oder Machtkonzentration real unfrei werden.", [], ["liberalismus", "positive-freiheit", "reale-freiheit", "libertarismus"]],
  ["positive-freiheit", "Positive Freiheit", "Positive Freiheit beschreibt die Fähigkeit, das eigene Leben aktiv zu gestalten und reale Handlungsmöglichkeiten zu nutzen.", "Zentral, weil Freiheit ohne Zugang, Gesundheit, Bildung, Sicherheit, Information und Teilhabe leer bleiben kann.", [], ["negative-freiheit", "reale-freiheit", "teilhabe", "amartya-sen"]],
  ["reale-freiheit", "Reale Freiheit", "Reale Freiheit beschreibt tatsächliche Handlungsfähigkeit unter realen Bedingungen, nicht nur formale Wahlmöglichkeit.", "Anschluss an Sen: In der WÖk entsteht reale Freiheit, wenn Mensch, Planet und Demokratie stabile Bedingungen schaffen.", [], ["positive-freiheit", "capability-approach", "mensch", "demokratie"]],
  ["wirkungsfreiheit", "Wirkungsfreiheit", "Wirkungsfreiheit beschreibt Freiheit, die ihre eigenen Folgen mitdenkt und nicht auf Kosten unsichtbarer Schäden anderer beruht.", "Freiheit endet nicht erst bei direkten Verboten, sondern dort, wo Entscheidungen systematisch Schäden externalisieren, die andere tragen müssen.", [], ["liberalismus", "wirkungsverantwortung", "externalisierung", "eigentumsverantwortung"], "precision", { mythos: "Freiheit bedeutet Folgenfreiheit.", woekKlaerung: "Freiheit ohne Wirkungsverantwortung wird zur Freiheit, Schäden auszulagern.", blindSpot: "Unsichtbare Betroffene erscheinen nicht als Teil der Freiheitsrechnung." }],
  ["wirklichkeitsbindung", "Wirklichkeitsbindung", "Wirklichkeitsbindung beschreibt die Rückbindung von Entscheidungen an überprüfbare Zustände, Folgen und Daten.", "Zentral für Freiheit, Markt und Demokratie: Entscheidungen sind freier, wenn sie auf ehrlichen Preisen, klaren Daten und transparenter Wirkung beruhen.", [], ["wirkungswahrheit", "wahrheit", "wirkungsdaten", "marktwirtschaft", "demokratie"], "precision", { mythos: "Mehr Wahlfreiheit reicht aus.", woekKlaerung: "Freiheit braucht Wirklichkeitsbindung. Märkte bleiben Suchräume, aber sie brauchen Wirkungssignale.", blindSpot: "Entscheidungen ohne Folgenwissen können Scheinfreiheit erzeugen." }],
  ["selbstverantwortung", "Selbstverantwortung", "Selbstverantwortung beschreibt die Verantwortung des Individuums für eigene Entscheidungen und deren Folgen.", "Wichtig, aber nur fair, wenn Menschen reale Handlungsoptionen, Informationen und Alternativen haben.", [], ["reale-freiheit", "wirkungsverantwortung", "informationsasymmetrie"]],
  ["vertragsfreiheit", "Vertragsfreiheit", "Vertragsfreiheit beschreibt die Freiheit, Verträge freiwillig zu schließen oder nicht zu schließen.", "Sie kann durch Machtasymmetrien, Informationsasymmetrien oder existenzielle Abhängigkeiten eingeschränkt sein.", [], ["wirtschaftsliberalismus", "informationsasymmetrie", "marktmacht", "eigentumsrechte"]],
  ["eigentumsrechte", "Eigentumsrechte", "Eigentumsrechte regeln, wer über Ressourcen, Güter oder Kapital verfügen darf.", "Eigentum bleibt geschützt, aber es trägt Wirkungsverantwortung. Eigentum darf nicht als Freibrief zur Externalisierung von Schäden verstanden werden.", [], ["eigentum", "eigentumsverantwortung", "kapital", "liberalismus", "libertarismus"]],
  ["eigentumsverantwortung", "Eigentumsverantwortung", "Eigentumsverantwortung beschreibt Verantwortung für Wirkungen, die aus Nutzung, Kontrolle oder Kapitalisierung von Eigentum entstehen.", "Die WÖk verbindet Eigentumsschutz mit Wirkungspflicht: Wer Kontrolle hat, trägt Verantwortung für Folgewirkungen.", [], ["eigentumsrechte", "wirkungsverantwortung", "externalisierung", "kapitalwirkung"], "precision"],
  ["libertarismus", "Libertarismus", "Libertarismus betont individuelle Freiheit, Eigentumsrechte, freiwillige Verträge und minimale staatliche Eingriffe besonders stark.", "Relevant, weil er zentrale Einwände gegen Wirkungssteuerung formuliert. Die WÖk antwortet: Nicht jede Lenkung ist Zwang; wenn Preise Schäden verschweigen, sind auch Marktentscheidungen verzerrt.", [], ["negative-freiheit", "eigentumsrechte", "nachtwaechterstaat", "minarchismus", "anarchokapitalismus", "non-aggression-principle", "steuerkritik", "externalisierung"], "system", { mythos: "Jede staatliche Wirkungslenkung ist Freiheitsverlust.", woekKlaerung: "Wirkungslenkung kann Freiheit schützen, wenn sie Schäden sichtbar macht, Macht begrenzt und reale Handlungsfähigkeit stärkt.", blindSpot: "Verlagerte Schäden werden oft nicht als Eingriff in die Freiheit anderer gelesen." }],
  ["minarchismus", "Minarchismus", "Minarchismus fordert einen Minimalstaat, der vor allem Eigentum, Verträge, innere und äußere Sicherheit schützt.", "Unzureichend, wenn Klima, Plattformmacht, Monopole, Gesundheitsfolgen, Datenmacht oder Externalitäten nicht durch Minimalstaatlichkeit verarbeitet werden können.", [], ["libertarismus", "nachtwaechterstaat", "eigentumsrechte", "marktversagen"]],
  ["nachtwaechterstaat", "Nachtwächterstaat", "Der Nachtwächterstaat ist ein Minimalstaat, der sich auf Schutz von Eigentum, Sicherheit und Rechtsordnung beschränkt.", "Als Grenzmodell hilfreich, um zu klären, welche Wirkungsprobleme reine Schutzfunktionen nicht lösen.", ["Minimalstaat"], ["minarchismus", "libertarismus", "staatsversagen"]],
  ["anarchokapitalismus", "Anarchokapitalismus", "Anarchokapitalismus lehnt staatliche Herrschaft ab und will Ordnung über Privateigentum, Märkte, Verträge und private Sicherheits- oder Rechtsdienste organisieren.", "Als Extremmodell relevant, aber nicht auszubauen: Private Vertragslogik kann Gemeingüter, Umwelt, Machtkonzentration und demokratische Legitimität nicht ausreichend sichern.", [], ["libertarismus", "self-ownership", "non-aggression-principle", "oeffentliche-gueter"], "connection", { statusNote: "Priorität 2" }],
  ["non-aggression-principle", "Non-Aggression Principle", "Das Non-Aggression Principle hält Gewalt, Zwang oder Eingriffe in Eigentum und Person grundsätzlich für unzulässig, außer zur Verteidigung.", "Die WÖk-Frage lautet: Was gilt als Eingriff, wenn Schäden über Klima, Luft, Wasser, Plattformmacht oder Desinformation auf andere verlagert werden?", ["Nichtaggressionsprinzip"], ["libertarismus", "externalitaet", "wirkungsverantwortung"], "connection", { statusNote: "Priorität 2" }],
  ["self-ownership", "Self-Ownership", "Self-Ownership beschreibt die Vorstellung, dass Menschen Eigentümer:innen ihrer selbst sind.", "Relevant für Autonomie und Selbstbestimmung, aber nicht ausreichend für soziale, ökologische und demokratische Folgewirkungen.", ["Selbsteigentum"], ["libertarismus", "autonomie", "koerperliche-selbstbestimmung"], "connection", { statusNote: "Priorität 2" }],
  ["steuerkritik", "Steuerkritik", "Steuerkritik beschreibt Einwände gegen staatliche Abgaben, insbesondere wegen Freiheits-, Eigentums- oder Effizienzargumenten.", "Die WÖk unterscheidet fiskalische Abschöpfung von Wirkungsrückkopplung. Wirkungssteuern sollen Folgekosten sichtbar machen und Anreize korrigieren.", [], ["libertarismus", "wirkungssteuer", "pigou-steuer", "laffer-kurve"], "connection", { statusNote: "Priorität 2" }],
  ["neoklassik", "Neoklassik", "Neoklassik modelliert Märkte, Knappheit, Präferenzen, Nutzenmaximierung, Gleichgewicht, Grenzgrößen und effiziente Allokation.", "Wichtig für Preise, Knappheit, Anreize und Marktkoordination. Ihre Grenze liegt in Vereinfachungen wie vollständiger Information, rationaler Entscheidung, Gleichgewichtsbildern und isolierten Akteuren. WÖk ergänzt reale Zustandsveränderungen, Rückkopplungen, Macht, Zeit, Externalitäten und Wirkungsräume.", [], ["homo-oeconomicus", "nutzenmaximierung", "grenznutzen", "grenzkosten", "opportunitaetskosten", "marktgleichgewicht", "pareto-effizienz", "externalitaet", "modellblindheit"], "connection", { mythos: "Wenn ein Markt effizient ist, ist er gesellschaftlich gut.", woekKlaerung: "Effizienz ohne richtige Zielgröße kann negative Wirkung beschleunigen.", blindSpot: "Externe Wirkungen, Macht und nichtlineare Rückkopplungen werden oft als Randprobleme behandelt." }],
  ["homo-oeconomicus", "Homo oeconomicus", "Der Homo oeconomicus ist ein Modell des rational eigennützig handelnden Menschen, der Präferenzen unter Knappheit optimiert.", "Als Modell nützlich, als Menschenbild unzureichend: Menschen handeln auch aus Angst, Zugehörigkeit, Vertrauen, Status, Sinn, Care, Dissonanz, Moral, Gewohnheit und Resonanzräumen.", [], ["neoklassik", "nutzenmaximierung", "praeferenzen", "begrenzte-rationalitaet"]],
  ["nutzenmaximierung", "Nutzenmaximierung", "Nutzenmaximierung beschreibt die Annahme, dass Akteure Entscheidungen treffen, um ihren subjektiven Nutzen zu maximieren.", "Nutzen ist nicht identisch mit Wirkung. Hoher individueller Nutzen kann negative Wirkung auf andere erzeugen.", [], ["homo-oeconomicus", "praeferenzen", "wirkungswert"]],
  ["praeferenzen", "Präferenzen", "Präferenzen beschreiben Vorlieben oder Rangordnungen von Optionen.", "Präferenzen sind nicht naturgegeben. Sie werden durch Kultur, Werbung, Preise, Status, Salienz, Gewohnheit, Plattformlogik und soziale Normen geprägt.", [], ["nutzenmaximierung", "salienz", "plattformlogik", "konsumentensouveraenitaet"]],
  ["knappheit", "Knappheit", "Knappheit beschreibt, dass Ressourcen, Zeit, Aufmerksamkeit oder Güter begrenzt sind.", "Die WÖk erweitert Knappheit: knapp sind auch planetare Grenzen, Vertrauen, Aufmerksamkeit, Gesundheit, Pflegezeit, Biodiversität und demokratische Stabilität.", [], ["planetare-grenzen", "aufmerksamkeit", "pflegezeit", "biodiversitaet"]],
  ["grenznutzen", "Grenznutzen", "Grenznutzen beschreibt den zusätzlichen Nutzen einer weiteren Einheit eines Gutes.", "Hilfreich für Entscheidungsmodelle, aber keine Aussage über externe Wirkung oder Verteilung.", [], ["neoklassik", "nutzenmaximierung", "grenzkosten"]],
  ["grenzkosten", "Grenzkosten", "Grenzkosten beschreiben die zusätzlichen Kosten einer weiteren Einheit.", "Grenzkosten müssen wirkungsökonomisch erweitert werden: Eine zusätzliche Einheit kann externe Kosten, Klimafolgen, Gesundheitsrisiken oder Demokratiewirkungen auslösen.", [], ["merit-order", "strommarkt", "externalitaet", "systemkosten"]],
  ["opportunitaetskosten", "Opportunitätskosten", "Opportunitätskosten sind der Wert der besten Alternative, auf die durch eine Entscheidung verzichtet wird.", "Die WÖk erweitert Opportunitätskosten um verpasste positive Wirkung und künftige Folgekosten.", [], ["allokation", "wirkungswert", "klimafolgeschaden"]],
  ["marktgleichgewicht", "Marktgleichgewicht", "Marktgleichgewicht beschreibt einen Zustand, in dem Angebot und Nachfrage bei einem bestimmten Preis zusammenfinden.", "Ein Markt kann im Gleichgewicht sein und trotzdem negative Wirkung erzeugen, wenn Preise Schäden nicht enthalten.", [], ["neoklassik", "marktwirtschaft", "wirkungswahrheit", "externalitaet"]],
  ["allgemeines-gleichgewicht", "Allgemeines Gleichgewicht", "Allgemeines Gleichgewicht beschreibt ein theoretisches Modell, in dem alle Märkte gleichzeitig im Gleichgewicht sind.", "Nützlich als Modell, aber begrenzt in rückgekoppelten, planetar begrenzten und politisch-medial beeinflussten Systemen.", [], ["marktgleichgewicht", "neoklassik", "modellannahme"], "connection", { statusNote: "Priorität 2" }],
  ["pareto-effizienz", "Pareto-Effizienz", "Pareto-Effizienz beschreibt einen Zustand, in dem niemand besser gestellt werden kann, ohne jemand anderen schlechter zu stellen.", "Kein ausreichender Gerechtigkeits- oder Wirkungsmaßstab. Sie kann bestehende Ungleichheit und externe Schäden stabilisieren.", [], ["effizienz", "wohlfahrtsoekonomie", "ungleichheit", "externalitaet"], "connection", { mythos: "Pareto-Effizienz bedeutet gesellschaftliche Gerechtigkeit.", woekKlaerung: "Pareto-Effizienz sagt wenig über Ausgangsverteilung, Würde, externe Schäden oder positive Netto-Wirkung." }],
  ["wohlfahrtsoekonomie", "Wohlfahrtsökonomie", "Wohlfahrtsökonomie untersucht, wie wirtschaftliche Zustände und Allokationen gesellschaftliche Wohlfahrt beeinflussen.", "Wichtige Anschlusslinie. Die WÖk erweitert Wohlfahrt um Mensch, Planet, Demokratie, Wirkung erster bis dritter Ordnung und Nichtkompensation.", [], ["pareto-effizienz", "pigou-steuer", "amartya-sen", "wirkungswert"]],
  ["effizienz", "Effizienz", "Effizienz beschreibt das Verhältnis von eingesetzten Mitteln zu erreichtem Ergebnis.", "Effizienz ist nicht automatisch positive Wirkung. Effizienz mit falscher Zielgröße kann Externalisierung, Machtkonzentration oder Schäden beschleunigen.", [], ["neoklassik", "systemkosten", "externalisierung", "positive-netto-wirkung"], "precision", { mythos: "Effizienz ist immer gut.", woekKlaerung: "Wirkungsökonomisch zählt, welches Ergebnis effizient erzeugt wird und welche Folgekosten entstehen." }],
  ["allokation", "Allokation", "Allokation beschreibt die Verteilung knapper Ressourcen auf unterschiedliche Verwendungen.", "WÖk fragt nicht nur, ob Ressourcen effizient verteilt werden, sondern ob diese Verteilung positive Netto-Wirkung erzeugt.", [], ["ressourcenallokation", "knappheit", "wirkungswert"]],
  ["ressourcenallokation", "Ressourcenallokation", "Ressourcenallokation beschreibt die Verteilung von Ressourcen auf Nutzungen, Akteure oder Ziele.", "Die WÖk erweitert Allokation um Wirkung: Ressourcen sollen dort wirken, wo sie Mensch, Planet und Demokratie stärken.", [], ["allokation", "wirkungskapital", "wirkungssteuer"], "connection", { statusNote: "Priorität 2" }],
  ["konsumentensouveraenitaet", "Konsumentensouveränität", "Konsumentensouveränität beschreibt die Vorstellung, dass Konsument:innen durch Nachfrage bestimmen, was produziert wird.", "Nur realistisch, wenn Informationen, Preise, Alternativen, Kaufkraft und Wirkungsdaten vorhanden sind. Sie ist verzerrt, wenn schlechte Wirkung billiger ist.", [], ["praeferenzen", "vollstaendige-information", "wirkungsdaten", "produktpass"]],
  ["vollstaendige-information", "Vollständige Information", "Vollständige Information beschreibt die Annahme, dass alle relevanten Informationen für Entscheidungen verfügbar sind.", "In der Realität häufig falsch. Wirkungsdaten, Produktpässe, Scorecards und Transparenz versuchen diese Lücke zu verringern.", [], ["informationsasymmetrie", "digitaler-produktpass", "scorecard", "wirkungsdaten"]],
  ["rationalitaet", "Rationalität", "Rationalität beschreibt begründetes, zielgerichtetes Entscheiden unter Annahmen und Informationen.", "Rational ist wirkungsökonomisch nicht, was kurzfristig Kapital maximiert, sondern was unter realen Wirkungen, Risiken und Rückkopplungen zukunftsfähig ist.", [], ["begrenzte-rationalitaet", "modellannahme", "wirklichkeitsbindung"], "connection", { statusNote: "Priorität 2" }],
  ["begrenzte-rationalitaet", "Begrenzte Rationalität", "Begrenzte Rationalität beschreibt, dass Menschen unter begrenzter Information, Zeit, Aufmerksamkeit und Verarbeitungskapazität entscheiden.", "Zentral für Produktwirkung, Medienwirkung, Politik und Wirkungskommunikation.", [], ["kognitive-belastung", "informationsueberlastung", "rationalitaet", "homo-oeconomicus"]],
  ["modellannahme", "Modellannahme", "Eine Modellannahme ist eine vereinfachende Voraussetzung, auf der ein Modell aufbaut.", "Modellannahmen müssen sichtbar sein, weil sie entscheiden, welche Wirkungen gesehen und welche ausgeblendet werden.", [], ["modellblindheit", "neoklassik", "rationalitaet"], "connection", { statusNote: "Priorität 2" }],
  ["modellblindheit", "Modellblindheit", "Modellblindheit entsteht, wenn ein Modell durch seine Annahmen relevante Wirkungen systematisch unsichtbar macht.", "Zentral für Kritik an Neoklassik, ESG, BIP, Trickle-down, Sozialismus, Genossenschaftsmythos und reinem Marktdenken.", [], ["modellannahme", "neoklassik", "wirkungsblindheit", "trickle-down-oekonomie"], "precision"],
  ["marktversagen", "Marktversagen", "Marktversagen liegt vor, wenn Märkte nicht zu gesellschaftlich wünschenswerten oder effizienten Ergebnissen führen.", "Aus WÖk-Sicht ist Marktversagen oft Wirkungsblindheit: Preise, Rechte oder Anreize bilden reale Folgen nicht ab.", [], ["externalitaet", "oeffentliche-gueter", "informationsasymmetrie", "marktmacht", "staatsversagen"], "connection", { mythos: "Marktversagen ist ein Ausnahmefall.", woekKlaerung: "In planetaren, sozialen und digitalen Wirkungsräumen können unsichtbare Folgekosten systematisch sein." }],
  ["externalitaet", "Externalität", "Externalitäten sind Kosten oder Nutzen, die bei Dritten entstehen und nicht im Marktpreis enthalten sind.", "Zentraler WÖk-Begriff: Wirkungsökonomie macht Externalitäten sichtbar und koppelt sie in Preise, Steuern, Kapital, Haftung und Beschaffung zurück.", [], ["externalisierung", "negative-externalitaet", "positive-externalitaet", "marktversagen", "wirkungssteuer"], "precision"],
  ["negative-externalitaet", "Negative Externalität", "Eine negative Externalität ist ein Schaden oder Risiko für Dritte, das nicht im Preis enthalten ist.", "Sie erklärt Klima-, Gesundheits-, Sozial- oder Demokratieschäden, die Verursacher nicht vollständig tragen.", [], ["externalitaet", "externalisierung", "klimafolgeschaeden", "soziale-folgekosten"]],
  ["positive-externalitaet", "Positive Externalität", "Eine positive Externalität ist ein Nutzen für Dritte, der nicht oder nicht vollständig vergütet wird.", "Relevant für Bildung, Care, Prävention, Wissen, Vertrauen und ökologische Regeneration.", [], ["externalitaet", "sorgearbeit", "bildung", "vertrauen"]],
  ["oeffentliche-gueter", "Öffentliche Güter", "Öffentliche Güter sind Güter, von deren Nutzung niemand leicht ausgeschlossen werden kann und deren Nutzung andere kaum verringert.", "Saubere Luft, Wissen, Sicherheit oder demokratische Öffentlichkeit brauchen besondere Governance, weil Märkte sie oft unterbereitstellen.", [], ["trittbrettfahrerproblem", "allmendeproblem", "wohlfahrtsstaat", "demokratie"]],
  ["trittbrettfahrerproblem", "Trittbrettfahrerproblem", "Das Trittbrettfahrerproblem entsteht, wenn Akteure von einem Gut profitieren, ohne zu dessen Bereitstellung beizutragen.", "Relevant für Klima, Infrastruktur, Medienqualität, Gemeingüter und kollektive Wirkung.", [], ["oeffentliche-gueter", "allmendeproblem", "commons"]],
  ["allmendeproblem", "Allmendeproblem", "Das Allmendeproblem beschreibt Übernutzung gemeinsamer Ressourcen, wenn individuelle Nutzungsvorteile und kollektive Schäden auseinanderfallen.", "Wichtig für Klima, Biodiversität, Wasser, öffentliche Räume, digitale Aufmerksamkeit und Demokratie.", [], ["commons", "oeffentliche-gueter", "externalitaet"], "connection", { statusNote: "Priorität 2" }],
  ["informationsasymmetrie", "Informationsasymmetrie", "Informationsasymmetrie liegt vor, wenn eine Seite einer Transaktion mehr oder bessere Informationen hat als die andere.", "Zentral für Produktpässe, Scorecards, Wirkungslabel, Finanzmärkte, Medien und Gesundheit.", [], ["vollstaendige-information", "adverse-selection", "moral-hazard", "digitaler-produktpass", "scorecard"]],
  ["moral-hazard", "Moral Hazard", "Moral Hazard beschreibt riskanteres Verhalten, wenn Folgen oder Kosten auf andere übertragen werden.", "Zentral für Banken, Versicherungen, Klima, Lieferketten, Plattformen und Externalisierung.", [], ["informationsasymmetrie", "externalisierung", "wirkungsverantwortung"]],
  ["adverse-selection", "Adverse Selection", "Adverse Selection beschreibt Fehlselektion durch Informationsasymmetrie, wenn schlechte Qualität gute Qualität verdrängen kann.", "Wirkungslabel und Produktpässe sollen verhindern, dass schädliche Produkte durch niedrigere Preise bessere Produkte verdrängen.", [], ["informationsasymmetrie", "produktpass", "wirkungslabel"]],
  ["principal-agent-problem", "Principal-Agent-Problem", "Das Principal-Agent-Problem beschreibt Zielkonflikte und Informationsasymmetrien zwischen Auftraggeber:innen und Beauftragten.", "Relevant für Management, Politik, Kapitalmärkte, Lieferketten, Prüfungen und Wirkungsrat.", [], ["informationsasymmetrie", "governance", "wirkungsrat", "lieferkette"]],
  ["transaktionskosten", "Transaktionskosten", "Transaktionskosten sind Kosten der Anbahnung, Durchführung, Kontrolle und Durchsetzung von Austauschbeziehungen.", "Gute Wirkungsdaten und Standards können Transaktionskosten senken, ohne Wirkungsprüfung abzubauen.", [], ["coase-theorem", "wirkungsdaten", "standardisierung"], "connection", { statusNote: "Priorität 2" }],
  ["coase-theorem", "Coase-Theorem", "Das Coase-Theorem beschreibt die Idee, dass externe Effekte bei klaren Eigentumsrechten und geringen Transaktionskosten durch Verhandlungen gelöst werden können.", "In realen komplexen Systemen sind Transaktionskosten, Machtasymmetrien, Zukunftsbetroffene und planetare Grenzen zentrale Hindernisse.", [], ["externalitaet", "transaktionskosten", "eigentumsrechte"], "connection", { statusNote: "Priorität 2" }],
  ["pigou-steuer", "Pigou-Steuer", "Eine Pigou-Steuer besteuert negative Externalitäten, um private Kosten an gesellschaftliche Kosten anzunähern.", "Wichtige Vorläuferlogik der Wirkungssteuer, aber enger. Die WÖk erweitert um Mensch, Planet, Demokratie, Scorecards, Nichtkompensation und Wirkungsarchitektur.", [], ["externalitaet", "wirkungssteuer", "co2-preis"], "connection", { statusNote: "Priorität 2" }],
  ["staatsversagen", "Staatsversagen", "Staatsversagen liegt vor, wenn staatliches Handeln durch Informationsmangel, Fehlanreize, Bürokratie, Machtinteressen oder schlechte Umsetzung negative Ergebnisse erzeugt.", "Die WÖk nimmt Staatsversagen ernst. Deshalb braucht sie Wirkungsrat, Transparenz, Evaluation, Versionierung, Rechtsschutz und demokratische Kontrolle.", [], ["marktversagen", "regulierungsversagen", "wirkungsrat", "evaluation"]],
  ["regulierungsversagen", "Regulierungsversagen", "Regulierungsversagen entsteht, wenn Regeln ihre Ziele verfehlen, falsche Anreize setzen oder neue Schäden erzeugen.", "Relevant, weil Wirkungssteuerung selbst korrigierbar, transparent und lernfähig bleiben muss.", [], ["staatsversagen", "regulatory-capture", "wirkungssteuer"]],
  ["regulatory-capture", "Regulatory Capture", "Regulatory Capture beschreibt, wenn Regulierung oder Aufsicht von den Interessen der regulierten Akteure beeinflusst oder vereinnahmt wird.", "Zentrales Risiko für Wirkungsrat, WÖk-IDs, Benchmarks, Energie, Finanzmärkte und Lieferketten.", ["Regulierungsvereinnahmung"], ["regulierungsversagen", "rent-seeking", "marktmacht", "wirkungsrat"]],
  ["rent-seeking", "Rent Seeking", "Rent Seeking beschreibt den Versuch, Vorteile durch politische Einflussnahme, Monopole oder Sonderregeln zu erzielen, statt durch produktive oder wirkungsvolle Leistung.", "Relevant für Lobbyismus, Subventionen, Marktverzerrung, Kapitalmacht und Wirkungsblindheit.", [], ["regulatory-capture", "marktmacht", "subvention", "kapitalwirkung"]],
  ["monopol", "Monopol", "Ein Monopol liegt vor, wenn ein Anbieter einen Markt wesentlich allein kontrolliert.", "Monopole können Preise, Zugang, Innovation und demokratische Handlungsspielräume beeinflussen und brauchen Wirkungs- und Machtprüfung.", [], ["marktmacht", "natuerliches-monopol", "oligopol"]],
  ["oligopol", "Oligopol", "Ein Oligopol liegt vor, wenn wenige Anbieter einen Markt dominieren.", "Relevant für Preise, Zugang, Lieferketten, Medien, Energie und Plattformen.", [], ["monopol", "marktmacht", "wettbewerb"]],
  ["marktmacht", "Marktmacht", "Marktmacht beschreibt die Fähigkeit, Preise, Zugang, Standards, Bedingungen oder Alternativen wesentlich zu beeinflussen.", "Ein Wirkungsrisiko, wenn sie Wettbewerb, Teilhabe, Innovation, Medienqualität oder demokratische Kontrolle schwächt.", [], ["monopol", "oligopol", "machtkonzentration", "plattformkapitalismus"]],
  ["netzwerkeffekt", "Netzwerkeffekt", "Ein Netzwerkeffekt liegt vor, wenn der Nutzen eines Angebots mit der Zahl seiner Nutzer:innen steigt.", "Besonders wichtig für Plattformkapitalismus, digitale Öffentlichkeit, Ladeinfrastruktur, Datenräume und Marktmacht.", [], ["plattformkapitalismus", "marktmacht", "natuerliches-monopol"], "connection", { statusNote: "Priorität 2" }],
  ["natuerliches-monopol", "Natürliches Monopol", "Ein natürliches Monopol liegt vor, wenn eine Infrastruktur aus Kostengründen effizienter von einem Anbieter betrieben wird, etwa Strom- oder Wassernetze.", "Relevant für Netzentgelte, Regulierung, Energieinfrastruktur und Daseinsvorsorge.", [], ["monopol", "stromnetz", "netzentgelt", "daseinsvorsorge"]],
  ["neoliberalismus", "Neoliberalismus", "Neoliberalismus bezeichnet Strömungen, die Marktmechanismen, Wettbewerb, Privatisierung, Deregulierung und Eigenverantwortung stark betonen.", "Problematisch, wenn Marktvertrauen ohne Wirkungswahrheit entsteht. Nicht mit Liberalismus oder Neoklassik gleichsetzen.", [], ["liberalismus", "wirtschaftsliberalismus", "deregulierung", "privatisierung", "externalitaet"], "connection", { mythos: "Neoliberalismus ist dasselbe wie Liberalismus.", woekKlaerung: "Liberalismus ist eine Freiheits- und Rechtsstaatsidee; Neoliberalismus bezeichnet marktorientierte politische Strömungen." }],
  ["ordoliberalismus", "Ordoliberalismus", "Ordoliberalismus betont staatliche Ordnung des Wettbewerbs durch Regeln, Kartellkontrolle und Rechtsrahmen.", "Anschlussfähig bei Ordnung und Wettbewerb. WÖk-Korrektur: Wettbewerbsordnung braucht Wirkungswahrheit für Mensch, Planet und Demokratie.", [], ["soziale-marktwirtschaft", "marktwirtschaft", "wettbewerb", "wirkungswahrheit"]],
  ["oesterreichische-schule", "Österreichische Schule", "Die Österreichische Schule betont subjektiven Wert, Unternehmertum, dezentrales Wissen, Marktprozesse und Skepsis gegenüber zentraler Planung.", "Anschlussfähig bei dezentralem Wissen und Planwirtschaftskritik. WÖk-Korrektur: Marktprozesse brauchen Wirkungsdaten, weil Preise Externalitäten sonst nicht abbilden.", ["Austrian School"], ["hayek", "dezentralisierung", "marktwirtschaft", "wirkungsdaten"], "connection", { statusNote: "Priorität 2" }],
  ["chicago-school", "Chicago School", "Die Chicago School steht für marktorientierte ökonomische Ansätze, Monetarismus, Deregulierung und starke Betonung von Preisen und Anreizen.", "Anschlussfähig bei Anreizen, problematisch bei Wirkungsblindheit und Externalitäten.", [], ["monetarismus", "deregulierung", "supply-side-economics"], "connection", { statusNote: "Priorität 2" }],
  ["monetarismus", "Monetarismus", "Monetarismus betont die Rolle der Geldmenge und Geldpolitik für Inflation und wirtschaftliche Stabilität.", "Priorität 2, weil für WÖk nur relevant, wenn Geldpolitik als Wirkungsrahmen von Preisen, Investitionen und Verteilung behandelt wird.", [], ["chicago-school", "inflation", "geldpolitik"], "connection", { statusNote: "Priorität 2" }],
  ["supply-side-economics", "Supply-side Economics", "Supply-side Economics betont Wachstum durch bessere Angebotsbedingungen, niedrigere Steuern, Deregulierung und Investitionsanreize.", "Relevant, weil häufig positive Folgewirkungen behauptet werden, ohne sie ausreichend zu messen.", ["Angebotsökonomie"], ["trickle-down-oekonomie", "laffer-kurve", "steuerkritik", "deregulierung"], "connection", { mythos: "Entlastung der Angebotsseite erzeugt automatisch gesellschaftliche Wirkung.", woekKlaerung: "Wirkung muss an Investitionen, Arbeitsplätzen, Verteilung, Infrastruktur, Klima und Demokratie geprüft werden." }],
  ["trickle-down-oekonomie", "Trickle-down-Ökonomie", "Trickle-down-Ökonomie bezeichnet die Annahme, dass Entlastungen für Vermögende, Unternehmen oder Kapital langfristig allen zugutekommen sollen.", "Ein Beispiel für ein Wirkungsversprechen ohne ausreichende Wirkungsprüfung. Trickle-down behauptet Wirkung; die WÖk misst Wirkung.", ["Trickle-down Economics", "Durchsickerungsökonomie", "Durchsickerungsmythos", "Trickle-down-Theorie", "trickle-down"], ["supply-side-economics", "laffer-kurve", "kapitalwirkung", "kapitalrendite", "externalisierung", "verteilungseffekt", "wirkungsnachweis"], "connection", { customStatus: "Anschlussbegriff / Systemmythos / wirtschaftspolitischer Wirkpfad", mythos: "Wenn es dem Kapital gut geht, geht es irgendwann allen gut.", woekKlaerung: "Kapitalzuwachs ist keine positive Netto-Wirkung. Kapital braucht Wirkungsbindung.", blindSpot: "Trickle-down verwechselt Kapitalaktivierung mit gesellschaftlicher Wirkung.", sourceGroup: "trickleDown" }],
  ["laffer-kurve", "Laffer-Kurve", "Die Laffer-Kurve beschreibt die Idee, dass Steuersätze und Steueraufkommen nicht linear zusammenhängen und zu hohe Steuersätze das Aufkommen senken können.", "Als wirtschaftspolitisches Argument relevant. WÖk fragt zusätzlich: Welche Wirkung erzeugt die Steuerstruktur, nicht nur welches Aufkommen?", [], ["supply-side-economics", "trickle-down-oekonomie", "steuerkritik"]],
  ["deregulierung", "Deregulierung", "Deregulierung beschreibt den Abbau staatlicher Regeln oder Eingriffe.", "Kann Bürokratie senken, aber auch Wirkungsblindheit, Externalisierung, Marktmacht oder Sicherheitsrisiken erhöhen.", [], ["neoliberalismus", "regulierungsversagen", "externalitaet"], "connection", { mythos: "Deregulierung erzeugt automatisch Effizienz.", woekKlaerung: "Regelabbau ist nur dann hilfreich, wenn Wirkung, Sicherheit, Zugang und Machtfolgen geprüft werden." }],
  ["privatisierung", "Privatisierung", "Privatisierung beschreibt die Übertragung öffentlicher Aufgaben, Güter oder Unternehmen in private Eigentums- oder Betriebsformen.", "Nicht automatisch gut oder schlecht. Entscheidend ist die Wirkung auf Zugang, Preis, Qualität, Resilienz, Demokratie und Langfristigkeit.", [], ["neoliberalismus", "eigentumsrechte", "daseinsvorsorge", "natuerliches-monopol"]],
  ["austeritaet", "Austerität", "Austerität beschreibt eine Politik strenger Haushaltskonsolidierung durch Ausgabenkürzungen oder Sparmaßnahmen.", "Nur sinnvoll, wenn nicht notwendige Wirkungsinfrastruktur zerstört wird. Sparen kann Verlustleistung erhöhen, wenn spätere Schäden wachsen.", [], ["schuldenbremse", "wirkungshaushalt", "infrastruktur"], "connection", { statusNote: "Priorität 2" }],
  ["schuldenbremse", "Schuldenbremse", "Die Schuldenbremse begrenzt staatliche Neuverschuldung nach fiskalischen Regeln.", "Wirkungsökonomisch nicht nur fiskalisch bewerten, sondern nach Wirkung auf Zukunftsinvestitionen, Resilienz, Infrastruktur, Generationengerechtigkeit und Reparaturkosten.", [], ["austeritaet", "wirkungshaushalt", "generationengerechtigkeit"], "connection", { statusNote: "Priorität 2" }],
].map(liberalMarketTerm);

function actorsInfluenceTerm([id, title, short, woek, aliases = [], related = [], concept = "connection", extra = {}]) {
  return addTerm(actorsInfluenceBase, {
    id,
    title,
    aliases,
    concept,
    short,
    definition: extra.definition || short,
    woek,
    related,
    ...extra,
  });
}

const actorsInfluenceTerms = [
  ["thinktank", "Thinktank", "Ein Thinktank ist eine Organisation, die politische, gesellschaftliche, wirtschaftliche oder strategische Fragen analysiert und Vorschläge für öffentliche Debatten, Gesetzgebung oder politische Entscheidungen entwickelt.", "Thinktanks sind Wirkungsträger im politischen Vorraum. Sie wirken durch Problemdefinition, Themenpriorisierung, Sprache, Daten, Expert:innen, Medienpräsenz, Gesetzesvorschläge, Personalnetzwerke und internationale Vernetzung.", ["Denkfabrik", "Policy Institute", "Public Policy Institute"], ["policy-netzwerk", "policy-laundering", "agenda-setting", "lobbyismus", "advocacy-organisation", "stiftung", "dark-money", "transparenzregister-lobbyismus", "regulatory-capture", "politische-einflussarchitektur"], "connection", { customStatus: "Anschlussbegriff / Akteurstyp", definition: "Thinktanks erzeugen Wissen, Deutungen, Studien, Narrative, Policy-Papiere, Netzwerke und Personalangebote. Sie können zwischen Wissenschaft, Politik, Medien und Öffentlichkeit vermitteln. Sie können aber auch als Einflussarchitektur wirken, wenn Finanzierung, Interessen, Auftraggeber, Netzwerke oder politische Zielrichtung nicht transparent sind.", mythos: "Thinktanks liefern neutrale Expertise.", woekKlaerung: "Thinktanks können wertvolle Expertise liefern, sind aber nicht automatisch neutral. Ihre Wirkung hängt von Finanzierung, Methodik, Transparenz, Pluralität, Datenqualität, öffentlicher Rechenschaft und Interessenkontext ab.", blindSpot: "Thinktanks können politische Entscheidungen beeinflussen, ohne demokratisch gewählt zu sein." }],
  ["policy-netzwerk", "Policy-Netzwerk", "Ein Policy-Netzwerk ist ein Zusammenspiel von Organisationen, Personen, Daten, Interessen und Kommunikationskanälen, die politische Themen, Vorschläge oder Entscheidungen beeinflussen.", "Policy-Netzwerke können Expertise bündeln oder politische Macht unsichtbar koordinieren. Wirkung entsteht über Zugang, Wiederholung, Reichweite, Personal, Finanzierung und Anschlussfähigkeit.", [], ["thinktank", "thinktank-netzwerk", "agenda-setting", "politischer-vorraum", "personalnetzwerk"]],
  ["policy-laundering", "Policy-Laundering", "Policy-Laundering beschreibt, wenn partikulare Interessen, Konzerninteressen oder Ideologien über scheinbar neutrale Studien, Thinktanks oder Expertengremien als allgemeine Sachlogik erscheinen.", "Policy-Laundering ist ein demokratisches Wirkungsrisiko, weil es Eigeninteressen in den Mantel neutraler Expertise verschiebt.", [], ["thinktank", "expertinnenlobbyismus", "studienfinanzierung", "selektive-evidenz", "regulatory-capture"], "precision", { mythos: "Eine Studie macht politische Forderungen automatisch neutral.", woekKlaerung: "Methodik, Finanzierung, Fragestellung und Interessenkontext müssen sichtbar sein." }],
  ["agenda-setting", "Agenda-Setting", "Agenda-Setting beschreibt die Wirkung, durch Themenwahl und Wiederholung zu beeinflussen, welche Fragen als wichtig gelten.", "Was auf die Agenda kommt, wird politisch bearbeitbar; was unsichtbar bleibt, bleibt wirkungslos oder wird verdrängt.", [], ["framing", "medienwirkung", "thinktank", "policy-netzwerk", "aufmerksamkeit"], "method"],
  ["policy-entrepreneurship", "Policy Entrepreneurship", "Policy Entrepreneurship beschreibt Akteure, die politische Ideen, Reformen oder Lösungen aktiv entwickeln, platzieren und durchsetzen wollen.", "Kann positiv wirken, wenn reale Probleme adressiert, Daten offengelegt und Beteiligung ermöglicht werden. Problematisch wird es bei verdeckten Interessen oder fehlender demokratischer Rückkopplung.", [], ["policy-netzwerk", "reform", "agenda-setting"], "connection", { statusNote: "Priorität 2" }],
  ["epistemische-gemeinschaft", "Epistemische Gemeinschaft", "Eine epistemische Gemeinschaft ist ein Netzwerk von Expert:innen mit gemeinsamem Wissen, Methoden und Problemverständnis, das politische Entscheidungen beeinflussen kann.", "Relevant für Wissenschaft, Klimapolitik, Gesundheit, Sicherheit und Wirkungsmessung. Expertise braucht Transparenz, Pluralität und Korrekturfähigkeit.", [], ["expertise", "wissenschaft", "policy-netzwerk", "wirkungsrat"], "connection", { statusNote: "Priorität 2" }],
  ["dark-money", "Dark Money", "Dark Money bezeichnet politische Finanzierung oder Einflussnahme, deren Geldquellen für Öffentlichkeit oder Betroffene nicht transparent sind.", "Dark Money ist ein demokratisches Wirkungsrisiko, weil es Einfluss ohne Rechenschaft ermöglicht.", [], ["thinktank", "lobbyismus", "transparenzregister-lobbyismus", "donor-dependency"], "connection", { mythos: "Nur direkte Spenden an Parteien sind politisch relevant.", woekKlaerung: "Auch Finanzierung von Kampagnen, Studien, Netzwerken und Vorfeldorganisationen kann demokratische Wirkung erzeugen." }],
  ["astroturfing", "Astroturfing", "Astroturfing beschreibt künstlich erzeugte Graswurzelbewegungen, die wie spontane Bürger:innenbewegungen aussehen, tatsächlich aber organisiert oder finanziert gesteuert werden.", "Astroturfing verzerrt Resonanzräume und kann demokratische Rückkopplung simulieren.", [], ["grassroots-bewegung", "dark-money", "agenda-setting", "resonanzraum"], "connection", { mythos: "Sichtbare Empörung zeigt immer echte gesellschaftliche Breite.", woekKlaerung: "Resonanz braucht Herkunfts-, Finanzierungs- und Koordinationsprüfung." }],
  ["grassroots-bewegung", "Grassroots-Bewegung", "Eine Grassroots-Bewegung ist eine von unten getragene Bewegung, die aus Bürger:innen, lokalen Gruppen oder Betroffenen heraus entsteht.", "Kann demokratische Wirkung stärken, wenn sie transparent, plural und betroffenenorientiert ist.", ["Graswurzelbewegung"], ["zivilgesellschaft", "buergerinitiative", "astroturfing"]],
  ["thinktank-netzwerk", "Thinktank-Netzwerk", "Ein Thinktank-Netzwerk verbindet mehrere Thinktanks, Stiftungen, Forschungseinrichtungen, politische Akteure oder Geldgeber.", "Kann Wissen verbreiten und Kompetenzen aufbauen, aber auch Ideologien, Personalstrategien oder Policy-Programme transnational koordinieren.", [], ["thinktank", "policy-netzwerk", "atlas-network", "stiftung"], "connection", { statusNote: "Priorität 2" }],
  ["heritage-foundation", "Heritage Foundation", "Die Heritage Foundation ist ein einflussreicher konservativer US-Thinktank.", "Als Beispielbegriff relevant, wenn konkrete Thinktank-Wirkung, Project 2025, Policy-Vorbereitung oder transnationale Einflussarchitektur behandelt werden. Nicht pauschal bewerten; Wirkung anhand konkreter Programme, Finanzierung, Personalstrategien, Transparenz und demokratischer Anschlussfähigkeit analysieren.", [], ["project-2025", "thinktank", "policy-netzwerk", "konservativ", "advocacy-organisation", "politischer-vorraum"], "sourceLine", { customStatus: "Vordenker-/Akteursbegriff / Beispielbegriff", statusNote: "Priorität 2", sourceGroup: "actorsInfluence" }],
  ["project-2025", "Project 2025", "Project 2025 ist ein von der Heritage Foundation initiiertes US-amerikanisches Projekt zur Vorbereitung politischer Programme, Personalstrukturen und Trainings für eine konservative Administration.", "Relevant, weil es zeigt, dass Politik nicht erst durch gewählte Regierung wirkt, sondern bereits durch Policy-Papiere, Personalpools, Trainings, institutionelle Vorbereitung und Umsetzungsarchitektur.", [], ["heritage-foundation", "thinktank", "policy-entrepreneurship", "politischer-vorraum"], "sourceLine", { customStatus: "Beispielbegriff / politischer Vorraum", statusNote: "Priorität 2" }],
  ["atlas-network", "Atlas Network", "Atlas Network ist ein international vernetztes Netzwerk marktwirtschaftlich-libertärer und pro-freedom orientierter Organisationen und Thinktanks.", "Als Beispiel für transnationale Thinktank-Vernetzung relevant. WÖk-Prüffragen: Welche Programme werden gefördert, welche Finanzierung liegt offen, welche Narrative werden verbreitet und welche Wirkung entsteht auf Demokratie, Klima, Marktregeln, Eigentum, Steuern und öffentliche Infrastruktur?", [], ["thinktank-netzwerk", "libertarismus", "wirtschaftsliberalismus", "policy-netzwerk"], "sourceLine", { customStatus: "Beispielbegriff / Thinktank-Netzwerk", statusNote: "Priorität 2" }],
  ["ngo", "NGO", "Eine NGO ist eine nichtstaatliche, meist gemeinnützige Organisation, die gesellschaftliche, humanitäre, ökologische, politische oder soziale Anliegen verfolgt.", "NGOs sind wichtige Wirkungsträger, weil sie Betroffene sichtbar machen, Expertise bündeln, Missstände benennen, Hilfe leisten und demokratische Rückkopplung stärken können. Problematisch wird es, wenn Finanzierung, Repräsentationsanspruch, Daten oder Interessen unklar bleiben.", ["Non-Governmental Organization", "Nichtregierungsorganisation"], ["zivilgesellschaft", "cso", "advocacy-organisation", "watchdog-organisation", "ngo-wirkungspruefung", "ngo-capture"], "connection", { mythos: "NGOs sind automatisch gut und unabhängig.", woekKlaerung: "NGOs müssen wie andere Akteure nach Wirkung, Transparenz, Finanzierung, Governance, Betroffenenbezug, Datenqualität und Rechenschaft bewertet werden.", blindSpot: "Gute Absicht ersetzt keine Wirkung und keine Rechenschaft." }],
  ["zivilgesellschaft", "Zivilgesellschaft", "Zivilgesellschaft umfasst freiwillige, nichtstaatliche Formen gesellschaftlicher Organisation und Beteiligung, etwa Vereine, Initiativen, NGOs, Bewegungen, Stiftungen und Bürgergruppen.", "Zivilgesellschaft ist ein Rückkopplungsraum der Demokratie. Sie macht Wirkungen sichtbar, die Staat oder Markt übersehen.", [], ["ngo", "cso", "buergerinitiative", "grassroots-bewegung", "demokratie"]],
  ["cso", "CSO", "Eine CSO ist eine zivilgesellschaftliche Organisation, also ein organisierter Teil der Zivilgesellschaft.", "CSOs können Beteiligung, Betroffenenbezug, Expertise und Kritik in demokratische Prozesse einspeisen; ihre Wirkung hängt von Transparenz, Repräsentation und Rechenschaft ab.", ["Civil Society Organization", "zivilgesellschaftliche Organisation"], ["zivilgesellschaft", "ngo"]],
  ["buergerinitiative", "Bürgerinitiative", "Eine Bürgerinitiative ist ein Zusammenschluss von Bürger:innen, der ein konkretes Anliegen gegenüber Öffentlichkeit, Verwaltung oder Politik vertritt.", "Kann lokale Rückkopplung stärken, muss aber nach Betroffenenbezug, Transparenz, Faktenlage und Wirkung auf andere Gruppen geprüft werden.", [], ["zivilgesellschaft", "grassroots-bewegung", "interessenvertretung"]],
  ["stiftung", "Stiftung", "Eine Stiftung ist eine Organisation, die Vermögen dauerhaft einem bestimmten Zweck widmet.", "Stiftungen können Gemeinwohl, Forschung und Demokratie stärken, aber auch politischen Einfluss mit geringer demokratischer Rechenschaft ermöglichen.", [], ["thinktank", "ngo", "dark-money", "studienfinanzierung"]],
  ["advocacy-organisation", "Advocacy-Organisation", "Eine Advocacy-Organisation setzt sich gezielt für politische, soziale, ökologische oder rechtliche Anliegen ein.", "Advocacy ist legitim, wenn Interessen, Daten, Ziele und Finanzierung transparent sind.", [], ["ngo", "lobbyismus", "interessenvertretung", "public-affairs"]],
  ["bewegungs-ngo", "Bewegungs-NGO", "Eine Bewegungs-NGO verbindet Organisationsstruktur mit Mobilisierung, Kampagnen und öffentlichem Druck.", "Kann Beteiligung und Sichtbarkeit stärken, braucht aber Transparenz über Ziele, Finanzierung und Repräsentationsanspruch.", [], ["ngo", "grassroots-bewegung", "advocacy-organisation"], "connection", { statusNote: "Priorität 2" }],
  ["service-ngo", "Service-NGO", "Eine Service-NGO erbringt konkrete Leistungen, etwa humanitäre Hilfe, Bildung, Gesundheit, Beratung oder Versorgung.", "Wirkung zeigt sich an realer Leistung, Zugang, Qualität, lokaler Einbettung und Betroffenenorientierung.", [], ["ngo", "service", "care-oekonomie"], "connection", { statusNote: "Priorität 2" }],
  ["watchdog-organisation", "Watchdog-Organisation", "Eine Watchdog-Organisation beobachtet Macht, Institutionen, Unternehmen oder Politik und macht Missstände öffentlich.", "Watchdogs können demokratische Rückkopplung stärken, brauchen aber selbst Transparenz, methodische Sorgfalt und Korrekturfähigkeit.", [], ["ngo", "transparenz", "rechenschaft", "medienqualitaet"]],
  ["gongo", "GONGO", "Eine GONGO ist eine formal nichtstaatliche Organisation, die faktisch von staatlichen Interessen organisiert, kontrolliert oder geprägt ist.", "Problematisch, wenn sie Unabhängigkeit simuliert und demokratische oder internationale Foren verzerrt.", ["Government-Organized NGO", "staatlich organisierte NGO"], ["ngo", "quango", "astroturfing"]],
  ["quango", "QUANGO", "Eine QUANGO ist eine formal nichtstaatliche oder halbunabhängige Organisation mit enger staatlicher Finanzierung, Einbindung oder Steuerung.", "Nicht automatisch problematisch, aber transparenzpflichtig. Entscheidend ist, ob staatliche Nähe offen erkennbar und demokratisch kontrolliert ist.", ["Quasi Non-Governmental Organization"], ["ngo", "gongo", "transparenz"]],
  ["ngo-wirkungspruefung", "NGO-Wirkungsprüfung", "NGO-Wirkungsprüfung bewertet nicht nur Absicht oder Gemeinnützigkeit einer NGO, sondern tatsächliche Wirkung, Transparenz, Rechenschaft und Betroffenenorientierung.", "WÖk-Präzisierungsbegriff: Auch gemeinnützige Akteure brauchen Wirkungsdaten, Governance und Korrekturwege.", [], ["ngo", "wirkungspruefung", "betroffenenbezug", "rechenschaft"], "precision"],
  ["ngo-capture", "NGO-Capture", "NGO-Capture beschreibt die Vereinnahmung einer NGO durch Geldgeber, Staaten, Unternehmen, Parteien oder institutionelle Eigeninteressen.", "Ein Wirkungsrisiko, wenn Organisationen ihren Betroffenenbezug oder ihre Unabhängigkeit verlieren.", [], ["ngo", "donor-dependency", "corporate-capture"], "connection", { statusNote: "Priorität 2" }],
  ["donor-dependency", "Donor Dependency", "Donor Dependency beschreibt die Abhängigkeit einer Organisation von wenigen Geldgebern.", "Kann Wirkungsrisiko werden, wenn Finanzierung Prioritäten, Sprache, Projekte oder öffentliche Positionen verzerrt.", ["Geberabhängigkeit"], ["ngo", "stiftung", "dark-money", "studienfinanzierung"], "connection", { statusNote: "Priorität 2" }],
  ["repraesentationsanspruch", "Repräsentationsanspruch", "Repräsentationsanspruch beschreibt den Anspruch, für eine Gruppe, Betroffene oder ein Gemeinwohlinteresse zu sprechen.", "Muss durch Beteiligung, Transparenz und Betroffenenbezug rückgekoppelt sein.", [], ["ngo", "betroffenenbezug", "zivilgesellschaft"], "connection", { statusNote: "Priorität 2" }],
  ["lobbyismus", "Lobbyismus", "Lobbyismus bezeichnet organisierte Einflussnahme auf politische Entscheidungen, Gesetzgebung, Verwaltung oder öffentliche Meinung.", "Lobbyismus ist nicht automatisch schlecht. Demokratie braucht Expertise und Interessenvertretung. Problematisch wird er bei Intransparenz, Machtasymmetrie, verzerrten Daten, verdeckter Gesetzesmitwirkung oder blockierter Rückkopplung.", [], ["interessenvertretung", "legitimer-lobbyismus", "systemverzerrender-lobbyismus", "public-affairs", "transparenzregister-lobbyismus", "legislative-footprint", "regulatory-capture"], "connection", { mythos: "Lobbyismus ist immer Korruption.", woekKlaerung: "Lobbyismus kann legitime Interessenvertretung oder Systemverzerrung sein. Die Grenze liegt in Transparenz, Rechenschaft, Datenqualität, Zugangsgerechtigkeit und Wirkung.", blindSpot: "Ungleicher Zugang kann als normale Expertise erscheinen." }],
  ["interessenvertretung", "Interessenvertretung", "Interessenvertretung bedeutet, Anliegen, Perspektiven oder Betroffenheiten gegenüber Politik, Öffentlichkeit oder Institutionen sichtbar zu machen.", "Legitim, wenn sichtbar, nachvollziehbar und plural rückgekoppelt.", [], ["lobbyismus", "advocacy-organisation", "buergerinitiative"]],
  ["legitimer-lobbyismus", "Legitimer Lobbyismus", "Legitimer Lobbyismus bringt Expertise, Betroffenheit oder Praxiswissen transparent in demokratische Entscheidungen ein.", "Er stärkt demokratische Wirkung, wenn Finanzierung, Auftrag, Daten und Interessen offenliegen und andere Perspektiven Zugang erhalten.", [], ["lobbyismus", "interessenvertretung", "transparenzregister-lobbyismus"]],
  ["systemverzerrender-lobbyismus", "Systemverzerrender Lobbyismus", "Systemverzerrender Lobbyismus beeinflusst politische Entscheidungen durch Intransparenz, Machtasymmetrie, selektive Daten, verdeckte Finanzierung oder ungleiche Zugänge.", "Wirkungsrisiko für Demokratie, Vertrauen, Rechtsstaatlichkeit und faire Marktregeln.", [], ["lobbyismus", "policy-laundering", "regulatory-capture", "corporate-capture"]],
  ["public-affairs", "Public Affairs", "Public Affairs bezeichnet professionelle Kommunikation und Interessenvertretung gegenüber Politik, Verwaltung, Öffentlichkeit und Stakeholdern.", "Legitim als Schnittstelle, aber wirkungssensibel bei Zugang, Transparenz, Framing, Studien und Gesetzesnähe.", [], ["lobbyismus", "advocacy-organisation", "agenda-setting"]],
  ["transparenzregister-lobbyismus", "Transparenzregister", "Ein Transparenzregister macht sichtbar, welche Organisationen politische Entscheidungen beeinflussen wollen, welche Interessen sie vertreten und welche Mittel sie einsetzen.", "Zentrale Infrastruktur für demokratische Rückkopplung, aber nur wirksam mit guter Datenqualität, Kontrolle und Sanktionen.", ["Lobby-Transparenzregister"], ["lobbyregister", "lobbyismus", "dark-money"]],
  ["lobbyregister", "Lobbyregister", "Ein Lobbyregister erfasst Interessenvertretung gegenüber Politik und Verwaltung.", "Es macht Einfluss prüfbarer, ersetzt aber nicht Legislative Footprints, Interessenkonfliktregeln und Zugangsgerechtigkeit.", [], ["transparenzregister-lobbyismus", "legislative-footprint", "lobbyismus"]],
  ["legislative-footprint", "Legislative Footprint", "Ein Legislative Footprint dokumentiert, welche externen Akteure an der Entstehung eines Gesetzes oder einer Regel mitgewirkt haben.", "Sehr wichtig für Wirkungstransparenz und demokratische Rückkopplung, weil Gesetzgebung als Einflussprozess sichtbar wird.", [], ["lobbyismus", "transparenzregister-lobbyismus", "gesetzgebung"], "method"],
  ["interessenkonflikt", "Interessenkonflikt", "Ein Interessenkonflikt liegt vor, wenn private, institutionelle oder finanzielle Interessen eine öffentliche, fachliche oder treuhänderische Entscheidung beeinflussen können.", "Interessenkonflikte sind nicht automatisch Fehlverhalten, müssen aber offengelegt, begrenzt und kontrolliert werden.", [], ["drehtuer-effekt", "studienfinanzierung", "regulatory-capture"]],
  ["drehtuer-effekt", "Drehtür-Effekt", "Der Drehtür-Effekt beschreibt Wechsel zwischen Politik, Verwaltung, Aufsicht und regulierten Unternehmen oder Lobbyorganisationen.", "Kann Expertise ermöglichen, aber auch Regulatory Capture, Interessenkonflikte und Vertrauensverlust erzeugen.", ["Revolving Door"], ["cooling-off-regel", "interessenkonflikt", "regulatory-capture"]],
  ["cooling-off-regel", "Cooling-off-Regel", "Cooling-off-Regeln legen Sperrfristen für Wechsel zwischen öffentlichem Amt und bestimmten privaten Interessenpositionen fest.", "Sie schützen Vertrauen, reduzieren Interessenkonflikte und begrenzen den Drehtür-Effekt.", [], ["drehtuer-effekt", "interessenkonflikt"]],
  ["corporate-capture", "Corporate Capture", "Corporate Capture beschreibt die Vereinnahmung politischer, regulatorischer oder öffentlicher Prozesse durch Unternehmensinteressen.", "Wirkungsrisiko, wenn private Macht öffentliche Regeln, Evidenz oder Zugänge systematisch prägt.", [], ["regulatory-capture", "state-capture", "systemverzerrender-lobbyismus", "marktmacht"]],
  ["state-capture", "State Capture", "State Capture beschreibt die systematische Vereinnahmung staatlicher Institutionen durch private, politische oder kriminelle Interessen.", "Schweres demokratisches Wirkungsrisiko, weil Rechtsstaatlichkeit, Rechenschaft und Gemeinwohlorientierung beschädigt werden.", [], ["corporate-capture", "regulatory-capture", "korruption"], "connection", { statusNote: "Priorität 2" }],
  ["expertinnenlobbyismus", "Expert:innenlobbyismus", "Expert:innenlobbyismus nutzt Fachwissen, Studien oder Gutachten zur politischen Einflussnahme.", "Kann wertvoll oder verzerrend sein. Entscheidend sind Datenqualität, Interessentransparenz und methodische Offenlegung.", ["Expertenlobbyismus"], ["policy-laundering", "studienfinanzierung", "selektive-evidenz"]],
  ["studienfinanzierung", "Studienfinanzierung", "Studienfinanzierung beschreibt, wer Forschung, Gutachten oder Policy-Papiere bezahlt.", "Wichtig, weil Finanzierung Fragestellung, Interpretation oder Veröffentlichung beeinflussen kann.", [], ["expertinnenlobbyismus", "policy-laundering", "interessenkonflikt"], "connection", { statusNote: "Priorität 2" }],
  ["selektive-evidenz", "Selektive Evidenz", "Selektive Evidenz beschreibt die Nutzung einzelner Daten oder Studien, während widersprechende Evidenz ausgeblendet wird.", "Ein Wirkmechanismus von Framing, Policy-Laundering und Desinformation.", [], ["faktencheck", "folgencheck", "false-balance", "policy-laundering"]],
  ["false-balance", "False Balance", "False Balance entsteht, wenn Positionen trotz sehr unterschiedlicher Evidenzlage als gleichwertig dargestellt werden.", "Relevant für Medien, Klimadebatte, Gesundheit und politisches Framing.", ["falsche Ausgewogenheit"], ["selektive-evidenz", "medienqualitaet", "klimawandel"], "connection", { statusNote: "Priorität 2" }],
  ["grundgesetz", "Grundgesetz", "Das Grundgesetz ist die Verfassung der Bundesrepublik Deutschland und legt Grundrechte, Staatsstrukturprinzipien, demokratische Ordnung und Grenzen staatlicher Macht fest.", "Nicht nur Rechtsrahmen, sondern Schutzrahmen der Wirkungsarchitektur. Wirkung darf nie über Grundrechte, Demokratie, Rechtsstaatlichkeit, Verhältnismäßigkeit und Rechtsschutz gestellt werden.", [], ["menschenwuerde", "demokratieprinzip", "rechtsstaatsprinzip", "sozialstaatsprinzip", "art-20a-gg", "verhaeltnismaessigkeit", "rechtsschutz"]],
  ["menschenwuerde", "Menschenwürde", "Menschenwürde bezeichnet den unantastbaren Wert jedes Menschen und die Pflicht staatlicher Gewalt, ihn zu achten und zu schützen.", "Menschenwürde ist eine Wirkungsgrenze. Keine positive Gesamtrechnung darf Würdeverletzungen kompensieren.", [], ["grundgesetz", "nichtkompensation", "gleichwertigkeit", "rassismus"], "precision"],
  ["gleichheit", "Gleichheit", "Gleichheit beschreibt rechtliche, politische oder soziale Gleichstellung in relevanten Hinsichten.", "Wirkungsökonomisch ist Gleichheit nicht Gleichmacherei, sondern Schutz vor systematischer Benachteiligung und ungleichen Wirkungschancen.", [], ["gleichbehandlung", "gleichwertigkeit", "diskriminierungsverbot"], "connection", { statusNote: "Priorität 2" }],
  ["gleichbehandlung", "Gleichbehandlung", "Gleichbehandlung verlangt, vergleichbare Fälle ohne sachwidrige Ungleichbehandlung zu behandeln.", "Wichtig für Rechtsstaat, Verwaltung, Arbeit, Produkte und Zugang zu Infrastruktur.", [], ["gleichheit", "diskriminierungsverbot", "rechtsstaatsprinzip"], "connection", { statusNote: "Priorität 2" }],
  ["diskriminierungsverbot", "Diskriminierungsverbot", "Das Diskriminierungsverbot untersagt ungerechtfertigte Benachteiligung aufgrund geschützter Merkmale oder Zuschreibungen.", "Zentrale Wirkungsgrenze für Mensch, Demokratie, Arbeit, Wohnen, Bildung, Gesundheit und KI.", [], ["gleichheit", "rassismus", "menschenwuerde"], "connection", { statusNote: "Priorität 2" }],
  ["meinungsfreiheit", "Meinungsfreiheit", "Meinungsfreiheit schützt freie Äußerung und demokratischen Streit.", "Die WÖk bewertet nicht Meinungen als solche, sondern Wirkungspotenziale, Wirkungsrisiken und Zustandsveränderungen durch Sprache, Reichweite, Normalisierung und Machtkontexte.", [], ["grundgesetz", "wirkung-politischer-sprache", "medienqualitaet"], "connection", { statusNote: "Priorität 2" }],
  ["eigentum-verpflichtet", "Eigentum verpflichtet", "Eigentum verpflichtet ist die verfassungsrechtliche Anschlusslinie, dass Eigentum geschützt ist und seine Nutzung zugleich dem Wohl der Allgemeinheit dienen soll.", "Art. 14 GG ist zentral: Die WÖk operationalisiert Eigentumsverantwortung über Wirkung.", [], ["eigentumsrechte", "eigentumsverantwortung", "grundgesetz", "kapitalwirkung"], "precision"],
  ["sozialisierung-vergesellschaftung", "Sozialisierung / Vergesellschaftung", "Sozialisierung oder Vergesellschaftung bezeichnet verfassungsrechtlich die Überführung bestimmter Güter, Ressourcen oder Produktionsmittel in Gemeineigentum oder Gemeinwirtschaft.", "Nicht identisch mit Sozialisation als Lernprozess. Aus WÖk-Sicht ersetzt Eigentumsform keine Wirkungsprüfung; auch vergesellschaftete Güter brauchen Steuerung nach Mensch, Planet und Demokratie.", ["Vergesellschaftung", "Art. 15 GG"], ["sozialisation", "gemeineigentum", "eigentumsverantwortung", "genossenschaftsblindheit"], "connection", { mythos: "Vergesellschaftung erzeugt automatisch Gemeinwohl.", woekKlaerung: "Eigentumsform ersetzt keine Wirkungsprüfung." }],
  ["sozialisation", "Sozialisation", "Sozialisation beschreibt den Prozess, durch den Menschen Normen, Werte, Rollen, Sprache und Verhaltensmuster einer Gesellschaft erlernen.", "Relevant für politische Sprache, Medienwirkung, Konsum, Vertrauen, Identität und Normalisierung.", [], ["sozialisierung-vergesellschaftung", "normalisierung", "lebensform", "politische-sprache"]],
  ["sozialstaatsprinzip", "Sozialstaatsprinzip", "Das Sozialstaatsprinzip verpflichtet den Staat, soziale Sicherheit, Teilhabe und Ausgleich als Staatsziel zu berücksichtigen.", "Wichtige Anschlusslinie für Mensch, Daseinsvorsorge, Wirkungshaushalt und reale Freiheit.", [], ["grundgesetz", "wohlfahrtsstaat", "reale-freiheit"], "connection", { statusNote: "Priorität 2" }],
  ["demokratieprinzip", "Demokratieprinzip", "Das Demokratieprinzip verlangt, dass staatliche Herrschaft demokratisch legitimiert, kontrolliert und rückgebunden ist.", "Zentral gegen technokratische Wirkungssteuerung: Wirkung braucht demokratische Verfahren, Öffentlichkeit und Rechtsschutz.", [], ["grundgesetz", "demokratie", "wirkungsrat"], "connection", { statusNote: "Priorität 2" }],
  ["rechtsstaatsprinzip", "Rechtsstaatsprinzip", "Das Rechtsstaatsprinzip bindet staatliche Macht an Recht, Verfahren, Grundrechte, Kontrolle und gerichtlichen Schutz.", "Schutzrahmen der WÖk: Wirkungssteuerung muss berechenbar, überprüfbar und anfechtbar bleiben.", [], ["grundgesetz", "rechtsschutz", "verhaeltnismaessigkeit"], "connection", { statusNote: "Priorität 2" }],
  ["verhaeltnismaessigkeit", "Verhältnismäßigkeit", "Verhältnismäßigkeit verlangt, dass staatliche Maßnahmen geeignet, erforderlich und angemessen sind.", "Zentral, damit Wirkungssteuerung nicht in Technokratie oder Freiheitsbeschädigung kippt.", [], ["grundgesetz", "rechtsstaatsprinzip", "wirkungssteuer", "rechtsschutz"], "method"],
  ["rechtsschutz", "Rechtsschutz", "Rechtsschutz beschreibt die Möglichkeit, staatliches Handeln rechtlich überprüfen und korrigieren zu lassen.", "Unverzichtbar für eine verfassungsmäßige Wirkungsarchitektur und Schutz vor Fehlsteuerung.", [], ["grundgesetz", "rechtsstaatsprinzip", "verfassungsmaessige-wirkungsarchitektur"]],
  ["schutzpflicht", "Schutzpflicht", "Schutzpflicht beschreibt staatliche Pflichten, Grundrechte und zentrale Rechtsgüter aktiv zu schützen.", "Relevant für Klima, Gesundheit, Sicherheit, Minderheitenschutz und demokratische Infrastruktur.", [], ["grundgesetz", "art-20a-gg", "menschenwuerde"], "connection", { statusNote: "Priorität 2" }],
  ["art-20a-gg", "Art. 20a GG", "Art. 20a GG verpflichtet den Staat, natürliche Lebensgrundlagen und Tiere auch in Verantwortung für künftige Generationen zu schützen.", "Zentrale Anschlusslinie der WÖk, aber kein Freibrief für beliebige Steuerung. Wirkung muss im Rahmen von Grundrechten, Demokratie, Rechtsstaatlichkeit, Verhältnismäßigkeit und parlamentarischer Verantwortung entwickelt werden.", ["Artikel 20a Grundgesetz"], ["grundgesetz", "intertemporale-freiheit", "planetare-grenzen", "klimaschutz"], "precision"],
  ["intertemporale-freiheit", "Intertemporale Freiheit", "Intertemporale Freiheit beschreibt die Freiheit künftiger Generationen, die durch heutige Entscheidungen nicht unverhältnismäßig eingeschränkt werden darf.", "Zentral für Klima, Schulden, Infrastruktur, Ressourcen und Wirkungsrisiken.", [], ["art-20a-gg", "generationengerechtigkeit", "klimafolgeschaeden"], "connection", { statusNote: "Priorität 2" }],
  ["verfassungsmaessige-wirkungsarchitektur", "Verfassungsmäßige Wirkungsarchitektur", "Eine verfassungsmäßige Wirkungsarchitektur ordnet Wirkungsmessung, Wirkungsprüfung und Wirkungssteuerung innerhalb von Grundrechten, Demokratie, Rechtsstaatlichkeit, Verhältnismäßigkeit und Rechtsschutz.", "WÖk-Präzisierungsbegriff gegen Planwirtschafts- und Technokratie-Missverständnisse.", [], ["grundgesetz", "wirkungsarchitektur", "verhaeltnismaessigkeit", "rechtsschutz"], "precision", { statusNote: "Priorität 2" }],
  ["rassismus", "Rassismus", "Rassismus ist eine Form der Diskriminierung, bei der Menschen aufgrund zugeschriebener Herkunft, Hautfarbe, Kultur, Sprache, Namen oder anderer Merkmale abgewertet, ausgegrenzt oder hierarchisiert werden.", "Rassismus ist negative Wirkung auf Mensch und Demokratie. Er beschädigt Gleichwertigkeit, Würde, Sicherheit, Teilhabe, Vertrauen, Rechtsstaatlichkeit und gesellschaftlichen Zusammenhalt.", [], ["struktureller-rassismus", "institutioneller-rassismus", "alltagsrassismus", "diskriminierungsverbot", "menschenwuerde", "demokratie"], "connection", { mythos: "Rassismus ist nur individuelles Vorurteil.", woekKlaerung: "Rassismus kann individuell, strukturell, institutionell, sprachlich, medial und politisch wirken.", blindSpot: "Wirkung entsteht auch ohne ausdrücklich rassistische Absicht." }],
  ["struktureller-rassismus", "Struktureller Rassismus", "Struktureller Rassismus beschreibt rassistische Wirkungsmuster, die durch Regeln, Routinen, Daten, Institutionen, Märkte oder Sprache entstehen können.", "Wichtig, weil Wirkungen auch ohne einzelne absichtsvoll diskriminierende Handlung entstehen können.", [], ["rassismus", "institutioneller-rassismus", "gender-data-gap"]],
  ["institutioneller-rassismus", "Institutioneller Rassismus", "Institutioneller Rassismus beschreibt rassistische Benachteiligung durch Verfahren, Routinen oder Entscheidungen von Institutionen.", "Wirkungsökonomisch relevant für Verwaltung, Polizei, Bildung, Gesundheit, Arbeit, Wohnen und Datenqualität.", [], ["rassismus", "struktureller-rassismus", "gleichbehandlung"]],
  ["alltagsrassismus", "Alltagsrassismus", "Alltagsrassismus beschreibt rassistische Abwertung, Ausschlüsse oder Normalisierungen im alltäglichen Umgang, in Sprache, Medien oder Routinen.", "Er beschädigt Sicherheit, Zugehörigkeit, Vertrauen und Teilhabe.", [], ["rassismus", "normalisierung", "sprache"], "connection", { statusNote: "Priorität 2" }],
  ["antisemitismus", "Antisemitismus", "Antisemitismus bezeichnet Feindschaft, Abwertung oder Verschwörungsdenken gegenüber Jüdinnen und Juden oder jüdisch markierten Gruppen.", "Ein demokratisches und menschenrechtliches Wirkungsrisiko, weil Menschenwürde, Sicherheit, Wahrheit und gesellschaftlicher Zusammenhalt beschädigt werden.", [], ["rassismus", "verschwoerungserzaehlung", "menschenwuerde"], "connection", { statusNote: "Priorität 2" }],
  ["antiziganismus", "Antiziganismus", "Antiziganismus bezeichnet Feindschaft, Abwertung oder Diskriminierung gegenüber Sinti:zze und Rom:nja oder so markierten Gruppen.", "Wirkungsrisiko für Würde, Gleichbehandlung, Sicherheit, Teilhabe und Vertrauen in Institutionen.", [], ["rassismus", "diskriminierungsverbot"], "connection", { statusNote: "Priorität 2" }],
  ["muslimfeindlichkeit", "Muslimfeindlichkeit", "Muslimfeindlichkeit beschreibt Abwertung, Ausgrenzung oder Feindbilder gegenüber Muslim:innen oder als muslimisch markierten Menschen.", "Wirkungsrisiko für Teilhabe, Sicherheit, Religionsfreiheit, Vertrauen und demokratische Gleichwertigkeit.", [], ["rassismus", "feindbildlogik", "diskriminierungsverbot"], "connection", { statusNote: "Priorität 2" }],
  ["xenophobie", "Xenophobie", "Xenophobie bezeichnet Fremdenfeindlichkeit oder Abwertung von Menschen, die als fremd markiert werden.", "Sie kann soziale Spaltung, Angstkommunikation und Ausschluss verstärken.", [], ["rassismus", "feindbildlogik", "ingroup-outgroup-dynamik"], "connection", { statusNote: "Priorität 2" }],
  ["faschismus", "Faschismus", "Faschismus bezeichnet historische und ideologische Bewegungen, die häufig durch autoritäre Führung, Nationalismus, Anti-Liberalismus, Gewalt, Feindbildlogik, Pluralismusfeindlichkeit und Unterordnung des Individuums unter ein Kollektiv oder einen Führer geprägt sind.", "Aus WÖk-Sicht ein schweres demokratisches Wirkungsrisiko, weil Rechtsstaatlichkeit, Minderheitenschutz, Pluralismus, Wahrheit, institutionelle Korrektur und Menschenwürde beschädigt werden.", [], ["autoritarismus", "totalitarismus", "feindbildlogik", "entmenschlichung", "fuehrerprinzip", "pluralismusfeindlichkeit"], "connection", { mythos: "Faschismus ist nur ein historisches Phänomen.", woekKlaerung: "Historischer Faschismus ist eindeutig historisch verortet. Faschistische Muster können als Wirkmechanismen in Sprache, Organisation, Gewalt, Feindbildlogik, Führerkult, Anti-Pluralismus oder demokratischer Delegitimierung wiederkehren. Konkrete Einordnung braucht Sorgfalt.", blindSpot: "Begriffe können selbst entwertet werden, wenn sie leichtfertig als Etikett verwendet werden." }],
  ["autoritarismus", "Autoritarismus", "Autoritarismus beschreibt politische Ordnungen oder Haltungen, die Gehorsam, Machtkonzentration, Kontrolle und begrenzten Pluralismus betonen.", "Wirkungsrisiko, wenn demokratische Korrektur, Minderheitenschutz, Rechtsstaatlichkeit und freie Öffentlichkeit geschwächt werden.", [], ["faschismus", "demokratische-erosion", "autoritaeres-wirkungspotenzial"]],
  ["totalitarismus", "Totalitarismus", "Totalitarismus beschreibt Herrschaftsansprüche, die Gesellschaft, Politik, Öffentlichkeit und Privatleben umfassend kontrollieren wollen.", "Schweres Wirkungsrisiko für Menschenwürde, Freiheit, Wahrheit, Pluralismus und Rechtsstaat.", [], ["autoritarismus", "faschismus", "kommunismus"], "connection", { statusNote: "Priorität 2" }],
  ["rechtsextremismus", "Rechtsextremismus", "Rechtsextremismus bezeichnet politische Strömungen, die Gleichwertigkeit, Menschenwürde, Demokratie oder Pluralismus von rechtsaußen infrage stellen können.", "Wirkungsökonomisch nach Angriffen auf Menschenwürde, Minderheitenschutz, Gewaltfreiheit, Wahrheit und demokratische Institutionen prüfen.", [], ["extremismus", "rassismus", "faschismus"], "connection", { statusNote: "Priorität 2" }],
  ["linksextremismus", "Linksextremismus", "Linksextremismus bezeichnet politische Strömungen, die demokratische Rechtsstaatlichkeit, Gewaltfreiheit oder Grundrechte aus linksaußen Positionen infrage stellen können.", "Wirkungsökonomisch nach konkreten Angriffen auf Grundrechte, Rechtsstaat, Pluralismus, Eigentumsordnung und demokratische Verfahren prüfen.", [], ["extremismus", "kommunismus", "demokratieprinzip"], "connection", { statusNote: "Priorität 2" }],
  ["extremismus", "Extremismus", "Extremismus beschreibt politische Positionen oder Handlungen, die Grundrechte, Demokratie, Rechtsstaatlichkeit, Menschenwürde oder Gewaltfreiheit systematisch infrage stellen.", "Nicht bloß Randposition, sondern Wirkungsrisiko, wenn demokratische Korrektur und Schutzgrenzen angegriffen werden.", [], ["rechtsextremismus", "linksextremismus", "autoritarismus", "menschenwuerde"]],
  ["populismus", "Populismus", "Populismus stellt häufig ein homogenes Volk einer angeblich korrupten Elite gegenüber und vereinfacht komplexe Konflikte in Freund-Feind-Muster.", "Kann reale Repräsentationslücken sichtbar machen, wird aber zum Wirkungsrisiko, wenn Pluralismus, Fakten, Institutionen oder Minderheitenschutz delegitimiert werden.", [], ["feindbildlogik", "demokratische-erosion", "framing"], "connection", { mythos: "Populismus ist nur Volkstümlichkeit.", woekKlaerung: "Wirkungsentscheidend ist, ob demokratische Rückkopplung gestärkt oder pluralistische Korrektur geschwächt wird." }],
  ["feindbildlogik", "Feindbildlogik", "Feindbildlogik ordnet politische oder soziale Konflikte über stark vereinfachte Gegnerbilder.", "Sie kann Aufmerksamkeit mobilisieren, aber Vertrauen, Differenzierung, Minderheitenschutz und demokratische Lösungssuche beschädigen.", [], ["faschismus", "populismus", "entmenschlichung", "suendenbockmechanismus"], "precision"],
  ["entmenschlichung", "Entmenschlichung", "Entmenschlichung beschreibt Sprache oder Praxis, die Menschen ihre Würde, Individualität oder Schutzwürdigkeit abspricht.", "Schweres Wirkungsrisiko, weil Gewalt, Ausschluss und Rechtsbrüche leichter legitimierbar werden.", [], ["menschenwuerde", "faschismus", "feindbildlogik"]],
  ["suendenbockmechanismus", "Sündenbockmechanismus", "Der Sündenbockmechanismus verschiebt komplexe Probleme auf eine Gruppe, Person oder Minderheit, die als Ursache markiert wird.", "Wirkungsrisiko für Wahrheit, Minderheitenschutz, Gewaltfreiheit und gesellschaftlichen Zusammenhalt.", [], ["feindbildlogik", "populismus", "rassismus"], "connection", { statusNote: "Priorität 2" }],
  ["fuehrerprinzip", "Führerprinzip", "Das Führerprinzip beschreibt die Unterordnung von Institutionen, Gruppen oder Individuen unter eine autoritäre Führungsperson.", "Schweres Wirkungsrisiko, weil Korrektur, Gewaltenteilung, Pluralismus und Rechtsstaatlichkeit verdrängt werden.", [], ["faschismus", "autoritarismus", "demokratieprinzip"], "connection", { statusNote: "Priorität 2" }],
  ["pluralismusfeindlichkeit", "Pluralismusfeindlichkeit", "Pluralismusfeindlichkeit beschreibt Ablehnung politischer, sozialer oder kultureller Vielfalt und legitimer Gegenpositionen.", "Demokratisches Wirkungsrisiko, weil Streit, Minderheitenschutz und Korrekturfähigkeit geschwächt werden.", [], ["faschismus", "autoritarismus", "demokratische-erosion"], "connection", { statusNote: "Priorität 2" }],
  ["demokratische-erosion", "Demokratische Erosion", "Demokratische Erosion beschreibt die schrittweise Schwächung demokratischer Normen, Institutionen, Öffentlichkeit, Rechte oder Kontrollmechanismen.", "Wirkungsökonomisch relevant, weil Schäden oft kumulativ entstehen: kleine Normalisierungen können große Zustandsverschiebungen auslösen.", [], ["autoritarismus", "populismus", "pluralismusfeindlichkeit", "vertrauensverschiebung"]],
  ["autoritaeres-wirkungspotenzial", "Autoritäres Wirkungspotenzial", "Autoritäres Wirkungspotenzial beschreibt die Möglichkeit, dass Sprache, Programme, Institutionen oder Bewegungen demokratische Korrektur, Rechtsstaatlichkeit, Minderheitenschutz und Pluralismus schrittweise schwächen.", "WÖk-Präzisierungsbegriff für Früherkennung demokratischer Risiken ohne vorschnelle Etikettierung.", [], ["autoritarismus", "demokratische-erosion", "wirkungsrisiko"], "precision", { statusNote: "Priorität 2" }],
  ["progressiv", "Progressiv", "Progressiv bezeichnet eine politische Orientierung, die gesellschaftliche Veränderung, Reform, Gleichstellung, Modernisierung oder Erweiterung von Rechten betont.", "Nicht automatisch wirkungspositiv. Eine progressive Maßnahme ist wirkungsfähig, wenn sie reale Zustände verbessert, Risiken senkt, Nebenwirkungen beachtet und demokratisch korrigierbar bleibt.", [], ["konservativ", "reform", "transformation", "gleichstellung"], "connection", { mythos: "Progressiv heißt automatisch gut.", woekKlaerung: "Entscheidend ist nicht die Richtung neu, sondern die Wirkung." }],
  ["konservativ", "Konservativ", "Konservativ bezeichnet eine politische Orientierung, die Bewahrung, Kontinuität, Sicherheit, gewachsene Ordnung und vorsichtige Veränderung betont.", "Nicht automatisch rückständig. Konservativ kann wirkungspositiv sein, wenn es tragende Bedingungen schützt: Demokratie, Rechtsstaat, Natur, soziale Stabilität, Vertrauen und Institutionen. Problematisch wird es, wenn notwendige Korrektur blockiert und Schäden konserviert werden.", [], ["progressiv", "reaktionaer", "institutionen", "rechtsstaatlichkeit"], "connection", { mythos: "Konservativ heißt automatisch rückwärtsgewandt.", woekKlaerung: "Die Frage ist: Was wird bewahrt - Lebensgrundlagen und Demokratie oder schädliche Privilegien und Fehlanreize?" }],
  ["reaktionaer", "Reaktionär", "Reaktionär bezeichnet eine politische Orientierung, die frühere Ordnungen wiederherstellen will und gegen emanzipatorische oder pluralistische Veränderungen gerichtet sein kann.", "Wirkungsrisiko, wenn vergangene Ordnung idealisiert und reale Schäden, Ausschlüsse oder Machtverhältnisse unsichtbar gemacht werden.", [], ["konservativ", "pluralismusfeindlichkeit", "demokratische-erosion"]],
  ["reform", "Reform", "Eine Reform ist eine gezielte Veränderung von Regeln, Institutionen oder Praktiken innerhalb eines bestehenden Systems.", "Wirkungsökonomisch zählt nicht der Reformbegriff, sondern ob Zustände tatsächlich verbessert, Nebenwirkungen begrenzt und Korrekturwege erhalten werden.", [], ["transformation", "policy-entrepreneurship", "progressiv"], "connection", { statusNote: "Priorität 2" }],
  ["radikal", "Radikal", "Radikal bedeutet an die Wurzel gehend und ist nicht identisch mit extremistisch.", "Radikale Analyse kann notwendig sein, wenn Probleme systemisch sind. Radikal wird wirkungsgefährdend, wenn demokratische Grenzen, Menschenwürde oder Rechtsstaatlichkeit verlassen werden.", [], ["extremismus", "transformation", "systemtheorie"], "connection", { mythos: "Radikal ist dasselbe wie extremistisch.", woekKlaerung: "Radikal beschreibt Tiefe der Analyse; extremistisch beschreibt Angriffe auf demokratische Schutzgrenzen." }],
  ["extrem", "Extrem", "Extrem beschreibt eine Position am Rand eines Spektrums oder eine besonders starke Ausprägung.", "Nicht jede extreme Position ist automatisch extremistisch; WÖk prüft Wirkung auf Grundrechte, Gewaltfreiheit, Demokratie und Korrekturfähigkeit.", [], ["extremismus", "radikal"], "connection", { statusNote: "Priorität 2" }],
  ["mitte", "Mitte", "Mitte bezeichnet politisch häufig den Raum zwischen ideologischen Polen, kann aber je nach Zeit und Diskurs unterschiedlich gerahmt sein.", "Nicht automatisch wirkungsfähig. Auch Mitte kann wirkungsschwach sein, wenn sie notwendige Transformation vermeidet.", [], ["progressiv", "konservativ", "links-politisch", "rechts-politisch"], "connection", { statusNote: "Priorität 2" }],
  ["links-politisch", "Links", "Links bezeichnet politisch grob Orientierungen, die Gleichheit, soziale Gerechtigkeit, Umverteilung, Arbeit, Teilhabe oder Emanzipation betonen können.", "Nur kontextsensibel verwenden. WÖk fragt nach konkreter Wirkung, nicht nach Lageretikett.", ["links"], ["rechts-politisch", "progressiv", "sozialismus"], "connection", { statusNote: "Priorität 2" }],
  ["rechts-politisch", "Rechts", "Rechts bezeichnet politisch grob Orientierungen, die Ordnung, Nation, Tradition, Eigentum, Sicherheit, Hierarchie oder kulturelle Kontinuität betonen können.", "Nur kontextsensibel verwenden. WÖk unterscheidet konservative Bewahrung tragender Bedingungen von autoritären oder menschenfeindlichen Wirkungsrisiken.", ["rechts"], ["links-politisch", "konservativ", "rechtsextremismus"], "connection", { statusNote: "Priorität 2" }],
].map(actorsInfluenceTerm);

function clusterTerm(base, [id, title, short, woek, aliases = [], related = [], concept = "connection", extra = {}]) {
  return addTerm(base, {
    id,
    title,
    aliases,
    concept,
    short,
    definition: extra.definition || short,
    woek,
    related,
    ...extra,
  });
}

const fascismRiskTerms = [
  ["faschismus", "Faschismus", "Faschismus bezeichnet eine rechtsextreme, autoritäre und anti-liberale Ideologie und Bewegung, die historisch im Italien Mussolinis entstand und später als Oberbegriff für nationalistische, anti-pluralistische und diktatorische Bewegungen verwendet wurde.", "Faschismus ist ein schweres Wirkungsrisiko für Mensch und Demokratie. Er beschädigt Menschenwürde, Minderheitenschutz, Rechtsstaatlichkeit, Pluralismus, freie Medien, Wahrheit, institutionelles Vertrauen und demokratische Korrekturfähigkeit.", [], ["faschistoid", "autoritarismus", "totalitarismus", "rechtsextremismus", "rassismus", "entmenschlichung", "fuehrerprinzip", "feindbildlogik", "suendenbockmechanismus", "demokratische-erosion", "pluralismusfeindlichkeit", "wiedergeburtsnarrativ"], "connection", { customStatus: "Anschlussbegriff / politischer Wirkungsbegriff", definition: "Faschismus ist politikwissenschaftlich nicht durch eine einzige unumstrittene Definition festgelegt. Wiederkehrende Merkmale sind extremer Nationalismus, Führerprinzip, Anti-Liberalismus, Anti-Pluralismus, Gewaltakzeptanz, Feindbildlogik, Unterordnung des Individuums unter eine angeblich höhere Gemeinschaft, Propaganda, Militarisierung, Entmenschlichung und die Vorstellung einer nationalen Wiedergeburt.", mythos: "Faschismus ist einfach alles, was autoritär ist.", woekKlaerung: "Nicht jede autoritäre oder harte Politik ist Faschismus. Faschismus ist ein spezifisches Merkmalsbündel aus Autoritarismus, Rechtsextremismus, Anti-Pluralismus, Feindbildlogik, Gewalt- und Wiedergeburtsnarrativen.", usage: "Den Begriff nicht leichtfertig als Etikett verwenden. Besser Merkmale, Wirkmechanismen und Wirkungspotenziale konkret benennen." }],
  ["faschistoid", "Faschistoid", "Faschistoid bedeutet: faschistische Züge zeigend, ohne dass zwingend voll ausgeprägter Faschismus vorliegt.", "Nützlich, wenn nicht ein ganzes System als faschistisch bezeichnet werden soll, aber einzelne Muster erkennbar sind: Führerlogik, Entmenschlichung, Feindbild, Gewaltfantasie, Anti-Pluralismus, Reinheitsnarrativ oder demokratische Delegitimierung.", [], ["faschismus", "autoritarismus", "feindbildlogik", "entmenschlichung", "pluralismusfeindlichkeit", "demokratische-erosion"], "connection", { mythos: "Faschistoid ist nur eine abgeschwächte Beschimpfung.", woekKlaerung: "Faschistoid sollte analytisch verwendet werden: Welche konkreten Züge sind gemeint? Welche Wirkungspotenziale entstehen? Welche demokratischen Zustände werden geschwächt?" }],
  ["linker-faschismus", "Linker Faschismus", "Linker Faschismus ist ein umstrittener und meist polemischer Begriff. Bei strenger Definition von Faschismus als rechtsextrem, ultranationalistisch und anti-liberal ist der Ausdruck irreführend.", "Autoritäre, totalitäre oder gewaltförmige Muster bei linken Systemen müssen klar kritisiert werden, aber präziser über autoritären Sozialismus, Stalinismus, Staatssozialismus, Parteidiktatur, Totalitarismus oder Zentralverwaltungsstaat.", [], ["faschismus", "totalitarismus", "staatssozialismus", "parteistaat", "einparteienstaat"], "connection", { customStatus: "Warnhinweis / umstrittener Begriff", mythos: "Jede autoritäre linke Politik ist linker Faschismus.", woekKlaerung: "Unpräzise Etiketten verdecken Wirkmechanismen. Die WÖk benennt konkrete Muster: Machtkonzentration, Gewalt, Parteidiktatur, Rechtsstaatsabbau oder Totalitarismus." }],
  ["autoritarismus", "Autoritarismus", "Autoritarismus beschreibt Herrschaftsformen oder politische Muster, in denen Macht konzentriert ist, Widerspruch begrenzt wird und demokratische Kontrolle geschwächt ist.", "Autoritarismus ist ein Wirkungsrisiko, weil Korrektur, Pluralismus, Rechtsstaatlichkeit, Medienfreiheit und Vertrauen unter Druck geraten.", [], ["autokratie", "demokratische-erosion", "pluralismusfeindlichkeit", "fuehrerprinzip"]],
  ["autokratie", "Autokratie", "Eine Autokratie ist eine Herrschaftsform, in der politische Macht bei einer Person oder Gruppe konzentriert ist und demokratische Kontrolle stark eingeschränkt ist.", "Autokratien sind Wirkungsrisiken für Demokratie, Menschenrechte, Rechtsstaatlichkeit, Transparenz, freie Medien und gesellschaftliche Rückkopplung.", [], ["geschlossene-autokratie", "elektorale-autokratie", "diktatur", "autoritarismus", "demokratische-erosion"]],
  ["geschlossene-autokratie", "Geschlossene Autokratie", "Eine geschlossene Autokratie ist eine Herrschaftsform, in der ein Einzelner oder eine Gruppe unkontrolliert Macht ausübt und keine freien, fairen Wahlen bestehen.", "Die demokratische Rückkopplung ist weitgehend blockiert; Kritik, Opposition, Medien und Rechtsschutz sind stark eingeschränkt.", [], ["autokratie", "diktatur", "oppositionsunterdrueckung"]],
  ["elektorale-autokratie", "Elektorale Autokratie", "Eine elektorale Autokratie hat formal Wahlen, diese sind aber in der Realität nicht frei und fair.", "Wirkungsrisiko, weil demokratische Legitimation simuliert wird, während Medien, Opposition, Wahlrecht oder Institutionen verzerrt werden.", [], ["autokratie", "wahlmanipulation", "scheindemokratie"]],
  ["totalitarismus", "Totalitarismus", "Totalitarismus beschreibt Herrschaftsformen, die alle Lebensbereiche kontrollieren wollen und keine freie politische Opposition zulassen.", "Schweres Wirkungsrisiko, weil Öffentlichkeit, Privatheit, Pluralität, Rechtsschutz, Wahrheit und eigenständige Gesellschaft zerstört werden können.", [], ["faschismus", "totalitarismus-arendt", "diktatur", "parteistaat"]],
  ["diktatur", "Diktatur", "Diktatur beschreibt eine Herrschaftsform, in der politische Macht nicht demokratisch kontrolliert wird und Opposition, Rechte oder Gewaltenteilung stark eingeschränkt sind.", "Diktaturen blockieren demokratische Korrektur und konzentrieren Macht über Menschen, Institutionen, Medien und Verwaltung.", [], ["autokratie", "totalitarismus", "militaerdiktatur"]],
  ["hybridregime", "Hybridregime", "Ein Hybridregime verbindet demokratische und autoritäre Elemente, etwa Wahlen mit ungleichen Medien-, Rechts- oder Oppositionsbedingungen.", "Gefährlich, weil demokratische Formen erhalten bleiben können, während demokratische Wirkung schrittweise erodiert.", [], ["elektorale-autokratie", "illiberale-demokratie", "demokratische-erosion"]],
  ["illiberale-demokratie", "Illiberale Demokratie", "Illiberale Demokratie beschreibt Systeme mit Wahlen, aber geschwächten liberalen Schutzrechten, Rechtsstaatlichkeit, Medienfreiheit oder Minderheitenschutz.", "WÖk-Risiko, weil Mehrheitsmacht ohne Schutzgrenzen Demokratie von innen entleeren kann.", [], ["hybridregime", "rechtsstaatsabbau", "pluralismusfeindlichkeit"]],
  ["demokratische-erosion", "Demokratische Erosion", "Demokratische Erosion beschreibt die schrittweise Schwächung demokratischer Normen, Institutionen, Öffentlichkeit, Rechte oder Kontrollmechanismen.", "Schäden entstehen oft kumulativ: kleine Normalisierungen können große Zustandsverschiebungen auslösen.", [], ["rechtsstaatsabbau", "mediengleichschaltung", "gewaltenteilungsabbau", "wahlmanipulation"]],
  ["pluralismusfeindlichkeit", "Pluralismusfeindlichkeit", "Pluralismusfeindlichkeit beschreibt Ablehnung politischer, sozialer oder kultureller Vielfalt und legitimer Gegenpositionen.", "Demokratisches Wirkungsrisiko, weil Streit, Minderheitenschutz und Korrekturfähigkeit geschwächt werden.", [], ["faschismus", "autoritarismus", "demokratische-erosion"]],
  ["fuehrerprinzip", "Führerprinzip", "Das Führerprinzip beschreibt die Unterordnung von Institutionen, Gruppen oder Individuen unter eine autoritäre Führungsperson.", "Schweres Wirkungsrisiko, weil Korrektur, Gewaltenteilung, Pluralismus und Rechtsstaatlichkeit verdrängt werden.", [], ["faschismus", "autoritarismus", "fuehrerkult"]],
  ["entmenschlichung", "Entmenschlichung", "Entmenschlichung beschreibt Sprache oder Praxis, die Menschen ihre Würde, Individualität oder Schutzwürdigkeit abspricht.", "Schweres Wirkungsrisiko, weil Gewalt, Ausschluss und Rechtsbrüche leichter legitimierbar werden.", [], ["menschenwuerde", "faschismus", "feindbildlogik"]],
  ["feindbildlogik", "Feindbildlogik", "Feindbildlogik ordnet politische oder soziale Konflikte über stark vereinfachte Gegnerbilder.", "Sie kann Aufmerksamkeit mobilisieren, aber Vertrauen, Differenzierung, Minderheitenschutz und demokratische Lösungssuche beschädigen.", [], ["faschismus", "populismus", "entmenschlichung", "suendenbockmechanismus"]],
  ["suendenbockmechanismus", "Sündenbockmechanismus", "Der Sündenbockmechanismus verschiebt komplexe Probleme auf eine Gruppe, Person oder Minderheit, die als Ursache markiert wird.", "Wirkungsrisiko für Wahrheit, Minderheitenschutz, Gewaltfreiheit und gesellschaftlichen Zusammenhalt.", [], ["feindbildlogik", "populismus", "rassismus"]],
  ["wiedergeburtsnarrativ", "Wiedergeburtsnarrativ", "Ein Wiedergeburtsnarrativ erzählt, dass eine Nation, ein Volk oder eine Gemeinschaft angeblich aus Verfall, Demütigung oder Verrat wieder auferstehen müsse.", "Relevant für Faschismusforschung und autoritäre politische Sprache, weil es Krise, Feindbild und Erlösungsversprechen koppeln kann.", [], ["faschismus", "reaktionaer", "propaganda"]],
].map((item) => clusterTerm(democraticRiskBase, item));

const arendtTerms = [
  ["hannah-arendt", "Hannah Arendt", "Hannah Arendt ist für die Wirkungsökonomie relevant, weil sie Politik als öffentlichen Raum des Handelns, Sprechens, Urteilens und gemeinsamen Beginnens versteht.", "Arendt hilft zu verstehen, warum Demokratie nicht nur Institutionenordnung ist. Demokratie braucht öffentliche Räume, Pluralität, Sprache, Handeln, Urteilskraft und die Fähigkeit, gemeinsam etwas Neues zu beginnen.", [], ["pluralitaet", "natalitaet", "handeln-arendt", "vita-activa", "oeffentlicher-raum-arendt", "macht-und-gewalt", "banalitaet-des-boesen", "totalitarismus-arendt"], "thinker", { customStatus: "Vordenkerin / Bezugslinie" }],
  ["vita-activa", "Vita activa", "Vita activa bezeichnet bei Hannah Arendt die Tätigkeitsformen Arbeiten, Herstellen und Handeln.", "Relevant, weil Arbeit, Produktion und politisches Handeln unterschiedliche Wirkungsräume sind.", [], ["arbeiten-arendt", "herstellen-arendt", "handeln-arendt", "hannah-arendt"]],
  ["arbeiten-arendt", "Arbeiten", "Arbeiten ist bei Arendt die Tätigkeit, die das Leben erhält und biologische Bedürfnisse deckt.", "Mit Care, Reproduktion, Pflege und sozialer Stabilisierung verbinden, aber Arendts Grenzen gegenüber feministischer Ökonomie beachten.", [], ["vita-activa", "care-oekonomie", "soziale-reproduktion"]],
  ["herstellen-arendt", "Herstellen", "Herstellen schafft dauerhafte Dinge, Werkzeuge, Gebäude und eine gestaltete Welt.", "Relevant für Produktwirkung, Infrastruktur, gebaute Welt und Verantwortung für Dauerhaftigkeit.", [], ["vita-activa", "produkte", "infrastrukturwirkung"]],
  ["handeln-arendt", "Handeln", "Handeln ist bei Arendt das politische Tätigwerden unter Menschen, verbunden mit Sprache, Öffentlichkeit und Freiheit.", "Handeln ist zentral für Demokratie als Wirkungsraum.", [], ["vita-activa", "oeffentlicher-raum-arendt", "demokratie"]],
  ["pluralitaet", "Pluralität", "Pluralität bedeutet, dass Menschen gleichwertig, aber verschieden sind und aus unterschiedlichen Perspektiven handeln und urteilen.", "Pluralität ist eine Bedingung demokratischer Wirkung.", [], ["demokratie", "gleichwertigkeit", "hannah-arendt"]],
  ["natalitaet", "Natalität", "Natalität bezeichnet bei Arendt die Fähigkeit, etwas Neues zu beginnen.", "Wichtig für Transformation, Innovation, demokratisches Handeln und Wirkungsökonomie als neuer Anfang.", [], ["transformation", "innovation", "hannah-arendt"]],
  ["oeffentlicher-raum-arendt", "Öffentlicher Raum / Erscheinungsraum", "Der öffentliche Raum ist bei Arendt der Raum, in dem Menschen durch Sprechen und Handeln voreinander erscheinen und gemeinsam politische Wirklichkeit schaffen.", "Relevant für Medien, Demokratie, Resonanzräume und politische Wirksamkeit.", ["Erscheinungsraum"], ["handeln-arendt", "pluralitaet", "resonanzraum"]],
  ["macht-und-gewalt", "Macht und Gewalt", "Arendt unterscheidet Macht als gemeinsames Handeln von Gewalt als Zwangsmittel.", "Diese Unterscheidung ist zentral für Demokratie: Macht entsteht durch gemeinsames Handeln; Gewalt zerstört demokratische Rückkopplung.", [], ["hannah-arendt", "gewalt", "demokratie", "autoritarismus"]],
  ["banalitaet-des-boesen", "Banalität des Bösen", "Banalität des Bösen beschreibt Arendts These, dass schweres Unrecht auch durch Gedankenlosigkeit, Gehorsam, Verwaltung und fehlende Urteilskraft entstehen kann.", "Relevant für Verwaltung, Bürokratie, Verantwortung, Mitläufertum, Wirkungsblindheit und autoritäre Systeme.", [], ["gedankenlosigkeit", "urteilskraft", "verwaltung", "totalitarismus-arendt"], "connection", { mythos: "Banalität des Bösen bedeutet, Böses sei harmlos.", woekKlaerung: "Gemeint ist: Schweres Unrecht kann durch normale, gedankenlose Funktionslogik möglich werden." }],
  ["urteilskraft", "Urteilskraft", "Urteilskraft beschreibt die Fähigkeit, Situationen zu beurteilen, Perspektiven mitzudenken und verantwortlich zu entscheiden.", "Für die WÖk zentral, weil Daten und Regeln ohne Urteilskraft technokratisch oder blind werden können.", [], ["banalitaet-des-boesen", "demokratie", "wirkungsrat"]],
  ["gedankenlosigkeit", "Gedankenlosigkeit", "Gedankenlosigkeit beschreibt bei Arendt fehlendes prüfendes Denken und fehlende Verantwortungsübernahme im Handeln.", "Wirkungsrisiko, wenn Verwaltung, Organisationen oder Individuen Regeln ausführen, ohne Folgen für Menschen und Demokratie mitzudenken.", [], ["banalitaet-des-boesen", "verwaltung", "wirkungsblindheit"]],
  ["weltlosigkeit", "Weltlosigkeit", "Weltlosigkeit beschreibt den Verlust eines gemeinsamen öffentlichen Bezugsraums, in dem Menschen Wirklichkeit teilen und beurteilen können.", "Relevant für Desinformation, Einsamkeit, Radikalisierung, Medienräume und demokratische Erosion.", [], ["oeffentlicher-raum-arendt", "resonanzraum", "demokratische-erosion"]],
  ["totalitarismus-arendt", "Totalitarismus nach Arendt", "Totalitarismus nach Arendt beschreibt Herrschaftsformen, die Menschen isolieren, Wahrheit zerstören, Terror und Ideologie verbinden und politische Pluralität abschaffen.", "Anschlussbegriff für Wirkungsrisiken, die Öffentlichkeit, Urteilskraft, Gesellschaft und Rechtsstaatlichkeit zerstören.", [], ["hannah-arendt", "totalitarismus", "weltlosigkeit"]],
].map((item) => clusterTerm(arendtBase, item));

const stateGovTerms = [
  ["staat", "Staat", "Der Staat ist die dauerhafte politische und rechtliche Ordnung eines Landes. Er umfasst Staatsgebiet, Staatsvolk, Staatsgewalt, Verfassung, Gesetze, Institutionen, Gerichte, Verwaltung und Behörden.", "Der Staat ist der institutionelle Rahmen, der Rechte, Verfahren, Schutzpflichten, demokratische Ordnung und Wirkungsarchitektur ermöglicht. Er ist nicht identisch mit der aktuellen Regierung.", [], ["regierung", "verwaltung", "verfassung", "staatsgebiet", "staatsvolk", "staatsgewalt", "gewaltenteilung"], "connection", { mythos: "Der Staat und die Regierung sind dasselbe.", woekKlaerung: "Die Regierung kann wechseln. Der Staat bleibt bestehen." }],
  ["regierung", "Regierung", "Die Regierung ist die politische Führung auf Zeit. Sie leitet die politischen und staatlichen Geschäfte und kann nach Wahlen wechseln.", "Die Regierung ist ein Wirkungsträger, aber nicht der ganze Staat.", [], ["staat", "bundesregierung", "regierungskritik"]],
  ["bundesregierung", "Bundesregierung", "Die Bundesregierung besteht aus Bundeskanzler:in und Bundesminister:innen.", "Sie trägt politische Verantwortung auf Bundesebene, bleibt aber an Verfassung, Parlament, Rechtsschutz und Verwaltung gebunden.", [], ["regierung", "parlament", "verfassung"]],
  ["verwaltung", "Verwaltung", "Die Verwaltung setzt Gesetze, Programme und politische Entscheidungen praktisch um.", "Verwaltung ist nicht bloße Bürokratie. Sie ist ein zentraler Ort, an dem Wirkung tatsächlich entsteht oder blockiert wird.", [], ["behoerde", "staat", "banalitaet-des-boesen", "wirkungsarchitektur"]],
  ["behoerde", "Behörde", "Eine Behörde ist eine staatliche Stelle, die Verwaltungsaufgaben erfüllt und Entscheidungen nach Recht und Gesetz umsetzt.", "Behörden sind Kontaktstellen zwischen Staat und Bürger:innen; ihre Wirkung zeigt sich in Zugang, Fairness, Tempo, Verständlichkeit und Rechtsschutz.", [], ["verwaltung", "staat"]],
  ["parlament", "Parlament", "Ein Parlament ist die gewählte Volksvertretung, die Gesetze beschließt, Regierung kontrolliert und öffentliche Debatten führt.", "Parlamente sind zentrale Rückkopplungsorte der Demokratie.", [], ["gesetz", "regierung", "demokratie"]],
  ["gesetz", "Gesetz", "Ein Gesetz ist eine allgemein verbindliche Regel, die in einem verfassungsmäßigen Verfahren beschlossen wird.", "Gesetze sind Wirkungsträger: Sie verändern Rechte, Pflichten, Preise, Verfahren, Schutz und Handlungsmöglichkeiten.", [], ["parlament", "verfassung", "wirkungsfolgenabschaetzung"]],
  ["verfassung", "Verfassung", "Eine Verfassung legt die grundlegende Ordnung eines Staates, Grundrechte, Institutionen und Machtbegrenzungen fest.", "Verfassung ist Wirkungsgrenze und Schutzarchitektur zugleich.", [], ["grundgesetz", "staat", "menschenwuerde"]],
  ["staatsgebiet", "Staatsgebiet", "Staatsgebiet bezeichnet den räumlichen Bereich, in dem ein Staat Hoheitsgewalt ausübt.", "Grundelement des Staates und relevant für Zuständigkeit, Infrastruktur, Schutz und Verwaltung.", [], ["staat", "staatsvolk", "staatsgewalt"]],
  ["staatsvolk", "Staatsvolk", "Staatsvolk bezeichnet die Menschen, die rechtlich einem Staat angehören.", "Relevant für demokratische Legitimation, Rechte, Pflichten und Teilhabe.", [], ["staat", "staatsgebiet", "staatsgewalt"]],
  ["staatsgewalt", "Staatsgewalt", "Staatsgewalt bezeichnet die hoheitliche Macht des Staates, Recht zu setzen, durchzusetzen und Rechtsschutz zu gewährleisten.", "Wirkungsökonomisch braucht Staatsgewalt Bindung an Grundrechte, Gewaltenteilung, Verhältnismäßigkeit und demokratische Kontrolle.", [], ["staat", "gewaltenteilung", "rechtsschutz"]],
  ["gewaltenteilung", "Gewaltenteilung", "Gewaltenteilung trennt staatliche Macht in Gesetzgebung, Regierung/Verwaltung und Rechtsprechung.", "Sie verhindert Machtkonzentration und schützt demokratische Korrektur.", [], ["staatsgewalt", "rechtsstaatsprinzip", "gewaltenteilungsabbau"]],
  ["verfassungsorgan", "Verfassungsorgan", "Ein Verfassungsorgan ist eine durch die Verfassung vorgesehene zentrale Institution des Staates.", "Relevant für Zuständigkeit, Kontrolle, demokratische Legitimation und Machtbegrenzung.", [], ["grundgesetz", "parlament", "regierung"]],
  ["gesellschaft", "Gesellschaft", "Gesellschaft ist der Raum der Menschen, Beziehungen, Gruppen, Organisationen, Konflikte, Normen und Lebensformen.", "Gesellschaft ist nicht der Staat. Sie ist der Resonanzraum, in dem politische Sprache, Märkte, Medien, Institutionen und Wirkungsdaten aufgenommen werden.", [], ["staat", "resonanzraum", "zivilgesellschaft"]],
  ["politisches-system", "Politisches System", "Das politische System umfasst Institutionen, Verfahren, Akteure und Regeln, durch die politische Entscheidungen entstehen und kontrolliert werden.", "Wirkungsraum für Macht, Beteiligung, Gesetzgebung, Verwaltung, Öffentlichkeit und Korrektur.", [], ["staat", "regierung", "regime"]],
  ["regime", "Regime", "Regime bezeichnet die konkrete Ordnung politischer Herrschaft und ihrer Regeln, Institutionen und Machtverteilung.", "Neutraler Analysebegriff, nicht automatisch abwertend; Wirkung hängt von Rechtsstaatlichkeit, Freiheit, Kontrolle und Rückkopplung ab.", [], ["regierungsform", "staatsform", "autokratie"]],
  ["staatsform", "Staatsform", "Staatsform beschreibt die grundlegende rechtlich-politische Ordnung eines Staates, etwa Republik oder Monarchie.", "Nicht mit Regierungsform verwechseln; Wirkung entsteht aus Institutionen, Verfahren und Machtbegrenzung.", [], ["regierungsform", "staat"]],
  ["regierungsform", "Regierungsform", "Regierungsform beschreibt, wie politische Führung organisiert und kontrolliert wird, etwa parlamentarisch, präsidentiell, demokratisch oder autokratisch.", "Relevant für Machtkonzentration, Verantwortlichkeit, Korrektur und demokratische Stabilität.", [], ["staatsform", "regierung", "regime"]],
  ["regierungskritik", "Regierungskritik", "Regierungskritik richtet sich gegen konkrete politische Führung, Entscheidungen, Programme oder Maßnahmen.", "Regierungskritik ist demokratisch notwendig, solange sie konkrete Entscheidungen prüfbar kritisiert und nicht die demokratische Ordnung pauschal delegitimiert.", [], ["regierung", "staatsdelegitimierung", "institutionenkritik"]],
  ["staatsdelegitimierung", "Staatsdelegitimierung", "Staatsdelegitimierung beschreibt die pauschale Abwertung oder Feindmarkierung des Staates als demokratische und rechtsstaatliche Ordnung.", "Wirkungsrisiko, wenn Vertrauen in Gerichte, Verwaltung, Verfassung, Wahlen und demokratische Verfahren zerstört wird.", [], ["staat", "regierungskritik", "institutionendelegitimierung", "demokratische-erosion"]],
  ["institutionenkritik", "Institutionenkritik", "Institutionenkritik richtet sich gegen konkrete Institutionen, ihre Fehler, Verfahren oder Machtstrukturen.", "Legitim und notwendig, wenn sie konkret, prüfbar und korrigierbar bleibt.", [], ["institutionendelegitimierung", "regierungskritik", "vertrauen"]],
  ["institutionendelegitimierung", "Institutionendelegitimierung", "Institutionendelegitimierung beschreibt die pauschale Abwertung demokratischer Institutionen als grundsätzlich feindlich, korrupt oder illegitim.", "Demokratisches Wirkungsrisiko, weil Korrekturwege, Vertrauen und gemeinsame Wirklichkeit beschädigt werden.", [], ["institutionenkritik", "staatsdelegitimierung", "demokratische-erosion"]],
  ["kommunistischer-staat", "Kommunistischer Staat", "Kommunistischer Staat ist ein ungenauer Begriff. Historisch gemeint sind meist Staaten mit kommunistischer oder marxistisch-leninistischer Regierung und starker Staats- oder Parteizentralisierung.", "Eigentumsform oder Parteibezeichnung ersetzen keine Wirkungsprüfung. Besser ist: kommunistisch regierter Staat, marxistisch-leninistischer Einparteienstaat oder Staatssozialismus.", [], ["kommunismus", "staatssozialismus", "einparteienstaat"], "precision", { customStatus: "Hinweisbegriff / Präzisierungsbegriff", woekKlaerung: "In der kommunistischen Theorie soll der Staat in einer voll entwickelten klassenlosen Gesellschaft eigentlich absterben. Historisch existierten jedoch stark zentralisierte Staaten mit kommunistischen Parteien." }],
].map((item) => clusterTerm(stateGovBase, item));

const regimeFormTerms = [
  ["parteistaat", "Parteistaat", "Ein Parteistaat ist eine Ordnung, in der eine Partei staatliche Institutionen, Verwaltung, Medien oder Recht stark dominiert.", "Wirkungsrisiko, wenn Staat, Partei und Gesellschaft nicht mehr unterscheidbar bleiben und Korrektur blockiert wird.", [], ["einparteienstaat", "state-capture", "autokratie"]],
  ["einparteienstaat", "Einparteienstaat", "Ein Einparteienstaat lässt faktisch oder rechtlich nur eine führende Partei zur Herrschaft zu.", "Blockiert politische Konkurrenz, Opposition und demokratische Korrektur.", [], ["parteistaat", "kommunistischer-staat", "oppositionsunterdrueckung"]],
  ["militaerdiktatur", "Militärdiktatur", "Eine Militärdiktatur ist eine Herrschaftsform, in der Militär oder Sicherheitsapparate die politische Macht ausüben.", "Wirkungsrisiko für Grundrechte, Zivilgesellschaft, Rechtsschutz und Gewaltenteilung.", ["Militärdiktatur"], ["diktatur", "autokratie"]],
  ["theokratie", "Theokratie", "Theokratie beschreibt eine Herrschaftsform, in der religiöse Autorität und staatliche Macht eng verbunden oder religiös legitimiert sind.", "Wirkung hängt davon ab, ob Grundrechte, Pluralismus, Gleichwertigkeit und Rechtsschutz gesichert oder eingeschränkt werden.", [], ["regime", "pluralismusfeindlichkeit"]],
  ["kleptokratie", "Kleptokratie", "Kleptokratie beschreibt Herrschaft, in der politische Macht systematisch zur privaten Bereicherung genutzt wird.", "Schädigt Vertrauen, öffentliche Infrastruktur, Rechtsstaatlichkeit und Verteilungsgerechtigkeit.", [], ["korruption", "state-capture", "oligarchie"]],
  ["oligarchie", "Oligarchie", "Oligarchie beschreibt Herrschaft oder starken Einfluss weniger mächtiger Akteure.", "Wirkungsrisiko, wenn Zugang, Medien, Kapital, Gesetzgebung oder öffentliche Güter durch kleine Gruppen kontrolliert werden.", [], ["plutokratie", "machtkonzentration", "marktmacht"]],
  ["plutokratie", "Plutokratie", "Plutokratie beschreibt eine Ordnung, in der Reichtum politischen Einfluss stark bestimmt.", "Wirkungsrisiko für Gleichwertigkeit, Demokratie, Rechenschaft und öffentliche Infrastruktur.", [], ["oligarchie", "kapitalmacht", "dark-money"]],
  ["rechtsstaatsabbau", "Rechtsstaatsabbau", "Rechtsstaatsabbau beschreibt die Schwächung unabhängiger Gerichte, Rechtsschutz, Gesetzesbindung oder Verhältnismäßigkeit.", "Zentrales Element demokratischer Erosion, weil Korrektur und Schutz vor Machtmissbrauch verloren gehen.", [], ["rechtsstaatsprinzip", "rechtsschutz", "demokratische-erosion"]],
  ["mediengleichschaltung", "Mediengleichschaltung", "Mediengleichschaltung beschreibt die politische oder staatliche Unterordnung von Medien unter eine einheitliche Linie.", "Schweres Wirkungsrisiko, weil öffentliche Wahrheit, Kritik, Pluralität und Kontrolle zerstört werden.", [], ["propaganda", "staatspropaganda", "pluralismusfeindlichkeit"]],
  ["gewaltenteilungsabbau", "Gewaltenteilungsabbau", "Gewaltenteilungsabbau schwächt die Trennung und Kontrolle staatlicher Macht.", "Er erhöht Machtkonzentration und senkt demokratische Korrekturfähigkeit.", [], ["gewaltenteilung", "rechtsstaatsabbau", "autokratie"]],
  ["wahlmanipulation", "Wahlmanipulation", "Wahlmanipulation beschreibt Eingriffe, die freie, faire oder gleiche Wahlen verzerren.", "Blockiert demokratische Rückkopplung und kann elektorale Autokratie stabilisieren.", [], ["elektorale-autokratie", "scheindemokratie"]],
  ["scheindemokratie", "Scheindemokratie", "Scheindemokratie beschreibt eine Ordnung, die demokratische Formen zeigt, aber reale demokratische Kontrolle stark einschränkt.", "Wirkungsrisiko, weil Legitimität simuliert wird, während Opposition, Medien oder Rechtsschutz geschwächt sind.", [], ["hybridregime", "elektorale-autokratie"]],
  ["oppositionsunterdrueckung", "Oppositionsunterdrückung", "Oppositionsunterdrückung beschreibt die Einschränkung, Kriminalisierung oder Ausschaltung politischer Gegenkräfte.", "Schwächt Pluralismus, Machtkontrolle und demokratische Wechselmöglichkeit.", [], ["autokratie", "einparteienstaat", "demokratische-erosion"]],
  ["zivilgesellschaftsrepression", "Zivilgesellschaftsrepression", "Zivilgesellschaftsrepression beschreibt Druck, Verbote oder Einschüchterung gegenüber NGOs, Initiativen, Medien oder Bewegungen.", "Schwächt demokratische Rückkopplung und Betroffenenbezug.", [], ["zivilgesellschaft", "ngo", "autokratie"]],
  ["propaganda", "Propaganda", "Propaganda ist strategische Kommunikation, die Wahrnehmung, Emotion und Verhalten einseitig beeinflussen soll.", "Wirkungsrisiko, wenn Wahrheit, Pluralität, Urteilskraft und freie Meinungsbildung verdrängt werden.", [], ["staatspropaganda", "mediengleichschaltung", "agenda-setting"]],
  ["staatspropaganda", "Staatspropaganda", "Staatspropaganda ist vom Staat gesteuerte oder dominierte Propaganda.", "Schädigt demokratische Öffentlichkeit, wenn sie Kritik ersetzt, Realität verzerrt und Macht absichert.", [], ["propaganda", "mediengleichschaltung", "autokratie"]],
  ["fuehrerkult", "Führerkult", "Führerkult beschreibt die überhöhte Verehrung einer politischen Führungsperson.", "Wirkungsrisiko, weil Institutionen, Kritik, Recht und Pluralität hinter persönlicher Loyalität zurücktreten.", [], ["fuehrerprinzip", "personalisierte-macht"]],
  ["personalisierte-macht", "Personalisierte Macht", "Personalisierte Macht beschreibt politische Ordnung, in der Entscheidungen stark von einer Person und ihrem Umfeld abhängen.", "Wirkungsrisiko, wenn Verfahren, Institutionen und Rechenschaft durch Loyalität und Nähe ersetzt werden.", [], ["fuehrerkult", "autokratie", "state-capture"]],
].map((item) => clusterTerm(regimeFormsBase, item));

const circularTerms = [
  addTerm(circularBase, { id: "kreislaufwirtschaft", title: "Kreislaufwirtschaft", concept: "precision", short: "Kreislaufwirtschaft hält Produkte, Materialien und Ressourcen möglichst lange im Nutzungskreislauf, vermeidet Abfall und regeneriert natürliche Systeme.", definition: "Sie ersetzt die lineare Logik nehmen, herstellen, wegwerfen durch längere Nutzung, Teilen, Wartung, Reparatur, Wiederverwendung, Refurbishment, Remanufacturing, Recycling und sichere biologische Rückführung.", woek: "Kreislaufwirtschaft ist notwendig, aber nicht hinreichend. Positive Netto-Wirkung entsteht erst, wenn Kreislauffähigkeit mit Mensch, Planet und Demokratie verbunden wird.", mythos: "Kreislaufwirtschaft bedeutet Recycling.", woekKlaerung: "Recycling ist nur ein Teil und meist ein äußerer Loop. Innere Loops wie Vermeidung, längere Nutzung, Reparatur und Wiederverwendung haben oft höhere Wirkung.", blindSpot: "Kreisläufe können toxische Stoffe, Plattformmacht oder Ausbeutung stabilisieren.", related: ["cradle-to-cradle", "circular-economy-butterfly-model", "technischer-kreislauf", "biologischer-kreislauf", "reparierbarkeit", "remanufacturing", "recycling", "materialgesundheit", "produktlebenszyklus", "digitaler-produktpass", "reverse-merit-order"] }),
  addTerm(circularBase, { id: "lineare-wirtschaft", title: "Lineare Wirtschaft", aliases: ["take-make-waste", "Wegwerfökonomie", "lineares Produktionsmodell"], short: "Lineare Wirtschaft entnimmt Ressourcen, stellt Produkte her, nutzt sie und entsorgt sie anschließend.", definition: "Das Modell folgt der Logik Take - Make - Waste.", woek: "Die lineare Wirtschaft ist wirkungsblind, weil sie Abfall, Emissionen, Ressourcenverlust und Entsorgungskosten häufig externalisiert.", mythos: "Billige Produkte sind effizient.", woekKlaerung: "Billigkeit kann durch ausgelagerte Material-, Klima-, Gesundheits- und Entsorgungskosten entstehen.", blindSpot: "Folgekosten verschwinden aus Preis und Bilanz.", related: ["kreislaufwirtschaft", "externalisierung", "abfallhierarchie"] }),
  addTerm(circularBase, { id: "circular-economy-butterfly-model", title: "Circular Economy Butterfly Model", concept: "method", aliases: ["Butterfly Model", "Butterfly Diagram", "Circular Economy System Diagram", "Kreislaufwirtschafts-Schmetterlingsmodell"], short: "Das Circular Economy Butterfly Model visualisiert Kreislaufwirtschaft als biologischen und technischen Kreislauf.", definition: "Das Modell der Ellen MacArthur Foundation zeigt Materialflüsse: biologische Materialien kehren sicher in natürliche Kreisläufe zurück; technische Produkte bleiben durch Nutzung, Wartung, Reparatur, Wiederverwendung, Aufarbeitung, Remanufacturing oder Recycling im Umlauf.", woek: "Anschlussmodell, weil es zeigt, dass nicht alle Kreisläufe gleichwertig sind. Die WÖk ergänzt Mensch und Demokratie.", mythos: "Das Diagramm zeigt schon vollständige Wirkung.", woekKlaerung: "Es zeigt Materialflüsse; WÖk fragt zusätzlich nach Profiten, Risiken, Arbeitsbedingungen, Datenqualität und Macht.", blindSpot: "Soziale und demokratische Folgewirkungen sind im Materialflussmodell nicht vollständig enthalten.", related: ["biologischer-kreislauf", "technischer-kreislauf", "innere-loops", "aeussere-loops", "werterhalt", "cradle-to-cradle", "produktlebenszyklus", "kreislaufwirkung"] }),
  addTerm(circularBase, { id: "biologischer-kreislauf", title: "Biologischer Kreislauf", short: "Der biologische Kreislauf beschreibt die Rückführung biologisch abbaubarer, ungiftiger Materialien in natürliche Kreisläufe.", definition: "Materialien werden so gestaltet, dass sie sicher kompostiert, vergoren oder als Nährstoffe in die Biosphäre zurückgeführt werden können.", woek: "Nur positiv, wenn Materialien tatsächlich ungiftig, biologisch verträglich und regenerativ eingebettet sind.", mythos: "Biologisch abbaubar ist automatisch gut.", woekKlaerung: "Materialgesundheit, Abbaukontext und ökologische Wirkung müssen geprüft werden.", blindSpot: "Schadstoffe können als scheinbar natürliche Rückführung in Böden gelangen.", related: ["biologischer-naehrstoff", "kompostierung", "anaerobe-vergaerung", "regenerative-landwirtschaft", "materialgesundheit", "biodiversitaet", "boden"] }),
  addTerm(circularBase, { id: "technischer-kreislauf", title: "Technischer Kreislauf", short: "Der technische Kreislauf beschreibt die lange Nutzung und Rückführung technischer Produkte, Komponenten und Materialien.", definition: "Technische Güter werden genutzt, geteilt, gewartet, repariert, wiederverwendet, aufgearbeitet, remanufactured oder recycelt.", woek: "Je näher der Loop am bestehenden Produkt bleibt, desto mehr eingebetteter Wert bleibt erhalten.", mythos: "Technische Kreisläufe beginnen beim Recycling.", woekKlaerung: "Wartung, Reparatur, Wiederverwendung und Remanufacturing kommen vor Recycling.", blindSpot: "Herstellerkontrolle kann Reparatur und Zugang begrenzen.", related: ["gebrauchsgueter", "reparatur", "wiederverwendung", "refurbishment", "remanufacturing", "recycling", "materialpass", "digitaler-produktpass"] }),
  addTerm(circularBase, { id: "gebrauchsgueter", title: "Gebrauchsgüter", aliases: ["Durables", "Nutzungsgüter"], short: "Gebrauchsgüter werden über längere Zeit genutzt und können repariert oder weitergegeben werden.", definition: "Dazu gehören Smartphones, Maschinen, Möbel, Fahrzeuge, Haushaltsgeräte und Werkzeuge.", woek: "Sie gehören primär in den technischen Kreislauf. Lebensdauer, Reparierbarkeit, Modularität, Wartung, Wiederverwendung und Rücknahme sind entscheidend.", related: ["technischer-kreislauf", "reparierbarkeit", "nutzungsdauerverlaengerung"] }),
  addTerm(circularBase, { id: "verbrauchsgueter", title: "Verbrauchsgüter", aliases: ["Consumables", "Verbrauchsprodukte"], short: "Verbrauchsgüter werden während der Nutzung verbraucht oder verändert.", definition: "Dazu gehören Lebensmittel, Kosmetika, Reinigungsmittel, Hygieneprodukte und bestimmte Verpackungen.", woek: "Sie gehören nur sinnvoll in biologische Kreisläufe, wenn sie ungiftig, biologisch verträglich und sicher rückführbar sind.", related: ["biologischer-kreislauf", "biologischer-naehrstoff", "materialgesundheit"] }),
  addTerm(circularBase, { id: "biologischer-naehrstoff", title: "Biologischer Nährstoff", short: "Ein biologischer Nährstoff kann nach Nutzung sicher in biologische Kreisläufe zurückgeführt werden.", definition: "Der Begriff ist nur sinnvoll bei ungiftigen und ökologisch verträglichen Materialien.", woek: "Nicht für Materialien verwenden, die nur scheinbar biologisch abbaubar sind und Schadstoffe eintragen.", related: ["biologischer-kreislauf", "materialgesundheit", "kompostierung"] }),
  addTerm(circularBase, { id: "technischer-naehrstoff", title: "Technischer Nährstoff", short: "Ein technischer Nährstoff ist ein Material oder eine Komponente, die im technischen Kreislauf erhalten, wiederverwendet oder aufbereitet werden kann.", definition: "Zentral für Cradle to Cradle, Materialpässe, Produktdesign, Rücknahme und industrielle Dekonstruktion.", woek: "Wert entsteht durch Erhalt von Funktion, Materialqualität und Rückführbarkeit.", related: ["technischer-kreislauf", "materialpass", "cradle-to-cradle"] }),
  addTerm(circularBase, { id: "innere-loops", title: "Innere Loops", short: "Innere Loops erhalten Produkte möglichst nah an ihrer bestehenden Form, etwa durch Teilen, Warten, Wiederverwenden oder Reparieren.", definition: "Sie bewahren mehr eingebettete Energie, Arbeit, Material und Funktion als spätere materialintensive Prozesse.", woek: "Innere Loops sollen vor Recycling priorisiert werden.", mythos: "Alle Kreisläufe sind gleichwertig.", woekKlaerung: "Produktnahe Loops erhalten meist mehr Wert als materialferne Loops.", related: ["aeussere-loops", "werterhalt", "sharing", "wartung", "wiederverwendung", "reparatur"] }),
  addTerm(circularBase, { id: "aeussere-loops", title: "Äußere Loops", short: "Äußere Loops sind spätere Kreislaufstrategien, bei denen Produkte stärker zerlegt, neu verarbeitet oder recycelt werden.", definition: "Sie sind wichtig, aber meist weniger wertschonend als innere Loops.", woek: "Recycling ist daher nicht erste, sondern spätere Kreislaufoption.", related: ["innere-loops", "recycling", "downcycling", "kreislaufwirkung"] }),
  addTerm(circularBase, { id: "werterhalt", title: "Werterhalt", short: "Werterhalt bewahrt eingebettete Materialien, Energie, Arbeit, Daten, Funktionen und Nutzungsfähigkeit eines Produkts.", definition: "Er misst nicht nur Materialmenge, sondern erhaltene Funktion und Nutzungsmöglichkeit.", woek: "Die WÖk erweitert Werterhalt um Mensch, Planet und Demokratie.", related: ["innere-loops", "kreislaufwirkung", "wiederverwendung", "remanufacturing"] }),
  ...[
    ["sharing", "Teilen / Sharing", "Sharing beschreibt die gemeinsame Nutzung eines Produkts durch mehrere Nutzer:innen.", "Sharing kann Wirkung verbessern, wenn es Nutzungskapazität erhöht und neue Produktion vermeidet; es kann aber Plattformmacht oder Rebound-Effekte erzeugen.", ["Product-as-a-Service", "Rebound-Effekt"], ["innere-loops", "plattformkapitalismus"]],
    ["wartung", "Wartung / Maintenance", "Wartung erhält die Funktionsfähigkeit eines Produkts und verlängert seine Nutzungsdauer.", "Wartung ist ein innerer Loop mit hoher Wirkung, weil sie Ersatzproduktion vermeiden kann.", [], ["innere-loops", "nutzungsdauerverlaengerung"]],
    ["nutzungsdauerverlaengerung", "Nutzungsdauerverlängerung", "Nutzungsdauerverlängerung hält Produkte länger nutzbar.", "Wichtige Maßnahmen sind Wartung, Reparatur, Softwareupdates, Ersatzteile und modulare Konstruktion.", [], ["wartung", "reparatur", "modularitaet"]],
    ["wiederverwendung", "Wiederverwendung", "Wiederverwendung bedeutet, ein Produkt oder eine Komponente erneut für denselben Zweck zu nutzen.", "Sie erhält Funktion und eingebetteten Wert ohne wesentliche Veränderung.", [], ["innere-loops", "werterhalt"]],
    ["weiterverteilung", "Weiterverteilung / Redistribute", "Weiterverteilung gibt funktionsfähige Produkte an neue Nutzer:innen weiter.", "Sie kann Zugang verbessern und Neuproduktion vermeiden.", [], ["wiederverwendung", "sharing"]],
    ["reparatur", "Reparatur", "Reparatur stellt die Nutzungsfähigkeit eines beschädigten oder defekten Produkts wieder her.", "Reparatur reduziert Abfall, Rohstoffverbrauch und Ersatzproduktion und stärkt lokale Wertschöpfung sowie Selbstwirksamkeit.", [], ["recht-auf-reparatur", "reparierbarkeit"]],
    ["recht-auf-reparatur", "Recht auf Reparatur", "Das Recht auf Reparatur beschreibt Ansprüche auf Reparierbarkeit, Reparaturinformationen, Ersatzteile und Werkzeuge.", "Es ist zentral für Demokratie und Marktstruktur, weil Herstellerkontrolle über Reparatur Macht konzentrieren kann.", ["Right to Repair"], ["reparatur", "reparierbarkeit", "machtkonzentration"]],
    ["refurbishment", "Refurbishment / Aufarbeitung", "Refurbishment arbeitet gebrauchte Produkte so auf, dass sie wieder funktionsfähig und marktfähig werden.", "Es liegt zwischen Reparatur und industrieller Wiederaufarbeitung.", ["Aufarbeitung"], ["wiederverwendung", "remanufacturing"]],
    ["remanufacturing", "Remanufacturing / Wiederaufbereitung", "Remanufacturing arbeitet Produkte oder Komponenten industriell auf einen neuwertigen oder gleichwertigen Leistungszustand auf.", "Es kann hohe Wirkung entfalten, wenn Material, Energie und Herstellungsaufwand gespart und Qualität gesichert werden.", ["Wiederaufbereitung"], ["refurbishment", "komponentenrueckgewinnung"]],
    ["komponentenrueckgewinnung", "Komponentenrückgewinnung", "Komponentenrückgewinnung baut Bauteile gezielt aus, prüft sie und nutzt sie erneut.", "Sie erhält Funktion statt nur Material.", [], ["remanufacturing", "design-for-disassembly"]],
    ["recycling", "Recycling", "Recycling bereitet Materialien zu neuen Rohstoffen oder Produkten auf.", "Recycling ist wichtig, aber kein Synonym für Kreislaufwirtschaft. Es steht nach Vermeidung, Wartung, Wiederverwendung, Reparatur, Refurbishment und Remanufacturing.", [], ["aeussere-loops", "downcycling", "upcycling"]],
    ["downcycling", "Downcycling", "Downcycling ist Recycling mit abnehmender Materialqualität oder geringeren Einsatzmöglichkeiten.", "Es kann besser sein als Entsorgung, ist aber weniger wirkungsvoll als hochwertige Rückführung oder Werterhalt.", [], ["recycling", "materialgesundheit"]],
    ["upcycling", "Upcycling", "Upcycling wertet Materialien oder Produkte durch neue Nutzung mit höherem Wert oder höherer Funktion auf.", "Wirkung hängt von tatsächlicher Lebensdauer, Nutzbarkeit und Materialgesundheit ab.", [], ["recycling", "werterhalt"]],
    ["kaskadennutzung", "Kaskadennutzung", "Kaskadennutzung nutzt Material oder Produkte mehrstufig über verschiedene Anwendungen hinweg.", "Wichtig im biologischen Kreislauf, etwa bei Biomasse, Holz oder Fasern.", [], ["biologischer-kreislauf", "werterhalt"]],
    ["kompostierung", "Kompostierung", "Kompostierung ist der biologische Abbau organischer Materialien zu Kompost.", "Nur positiv, wenn Materialien schadstofffrei und für biologische Rückführung geeignet sind.", [], ["biologischer-kreislauf", "materialgesundheit"]],
    ["anaerobe-vergaerung", "Anaerobe Vergärung", "Anaerobe Vergärung ist biologischer Abbau organischer Materialien ohne Sauerstoff, bei dem Biogas entstehen kann.", "Sie kann Energie- und Nährstoffkreisläufe verbinden, braucht aber Kontrolle von Methanverlusten und Substratwirkung.", [], ["biogas", "biologischer-kreislauf"]],
    ["biogas", "Biogas", "Biogas ist ein energiereiches Gas aus der Vergärung organischer Materialien.", "Kann Teil biologischer Kreisläufe sein, muss aber Flächennutzung, Biodiversität, Methanverluste und Nährstoffkreisläufe berücksichtigen.", [], ["anaerobe-vergaerung", "bioenergie"]],
    ["biochemische-rohstoffgewinnung", "Biochemische Rohstoffgewinnung", "Biochemische Rohstoffgewinnung extrahiert verwertbare chemische Bestandteile aus biologischen Materialien.", "Relevant für Kaskadennutzung und bio-basierte Kreisläufe.", [], ["biologischer-kreislauf", "kaskadennutzung"]],
    ["regenerative-landwirtschaft", "Regenerative Landwirtschaft", "Regenerative Landwirtschaft verbessert Böden, Biodiversität, Wasserhaushalt und Ökosystemfunktionen aktiv.", "Regeneration ist mehr als Schadensminimierung und stärkt Zustände, auf denen Wirkung beruht.", [], ["biologischer-kreislauf", "biodiversitaet"]],
    ["materialgesundheit", "Materialgesundheit", "Materialgesundheit beschreibt, ob Materialien für Menschen, Umwelt und Kreisläufe sicher und schadstoffarm sind.", "Materialgesundheit ist eine Wirkungsgrenze. Toxische Stoffe dürfen nicht durch Recycling im Kreislauf gehalten werden.", [], ["wirkungsgrenze", "reverse-merit-order"]],
    ["design-for-disassembly", "Design for Disassembly", "Design for Disassembly gestaltet Produkte so, dass Zerlegung, Reparatur, Rücknahme und Wiederverwendung erleichtert werden.", "Es ist ein Designhebel für Reparatur, Komponentenrückgewinnung und Kreislauffähigkeit.", [], ["modularitaet", "reparierbarkeit"]],
    ["modularitaet", "Modularität", "Modularität beschreibt einen Aufbau aus austauschbaren, kombinierbaren oder reparierbaren Modulen.", "Sie stärkt Reparatur, Upgradefähigkeit, Remanufacturing und Produktlebensdauer.", [], ["design-for-disassembly", "nutzungsdauerverlaengerung"]],
    ["reparierbarkeit", "Reparierbarkeit", "Reparierbarkeit beschreibt, wie leicht ein Produkt repariert werden kann.", "Sie ist ein WÖk-Indikator und ein wichtiges Produktwirkungsfeld.", [], ["reparatur", "recht-auf-reparatur"]],
    ["ruecknahmefaehigkeit", "Rücknahmefähigkeit", "Rücknahmefähigkeit beschreibt, ob Produkte nach Nutzung zurückgenommen und in Kreisläufe überführt werden können.", "Sie verbindet Produktdesign, Logistik, Herstellerverantwortung und Datenqualität.", [], ["ruecknahmesystem", "reverse-logistics"]],
    ["ruecknahmesystem", "Rücknahmesystem", "Ein Rücknahmesystem organisiert die Rückführung von Produkten, Verpackungen oder Materialien nach Nutzung.", "Es ist Infrastruktur für Kreislaufwirkung und erweiterte Herstellerverantwortung.", [], ["ruecknahmefaehigkeit", "reverse-logistics"]],
    ["reverse-logistics", "Reverse Logistics", "Reverse Logistics führt Produkte, Komponenten oder Materialien vom Nutzungspunkt zurück in Wiederverwendung, Reparatur, Aufarbeitung oder Recycling.", "Sie ist die Logistikseite der Kreislaufwirtschaft.", [], ["ruecknahmesystem", "remanufacturing"]],
    ["materialpass", "Materialpass", "Ein Materialpass dokumentiert Materialien, Zusammensetzung, Eigenschaften, Schadstoffe, Rückführbarkeit und potenzielle Wiederverwendung.", "Er unterstützt Urban Mining, Materialgesundheit und hochwertige Rückführung.", [], ["digitaler-produktpass", "materialgesundheit"]],
    ["urban-mining", "Urban Mining", "Urban Mining gewinnt Rohstoffe aus Gebäuden, Infrastrukturen, Produkten oder Abfallbeständen zurück.", "Es liest gebaute Umwelt als Materiallager und braucht Materialpässe sowie Dekonstruktion.", [], ["materialpass", "industrielle-dekonstruktion"]],
    ["sekundaerrohstoff", "Sekundärrohstoff", "Sekundärrohstoffe werden durch Wiederverwendung, Aufbereitung oder Recycling aus bereits genutzten Materialien gewonnen.", "Ihre Wirkung hängt von Qualität, Schadstoffen, Energieaufwand und Verdrängung von Primärrohstoffen ab.", [], ["recycling", "rezyklatanteil"]],
    ["rezyklatanteil", "Rezyklatanteil", "Der Rezyklatanteil beschreibt den Anteil recycelter Materialien in einem Produkt oder Materialstrom.", "Er ist ein Indikator, aber kein vollständiger Wirkungsnachweis.", [], ["sekundaerrohstoff", "recyclingquote"]],
    ["recyclingquote", "Recyclingquote", "Die Recyclingquote beschreibt den Anteil von Materialien oder Produkten, der recycelt wird.", "Sie allein reicht nicht: Qualität, Materialgesundheit, Downcycling, tatsächliche Rückführung und Vermeidung müssen mitbewertet werden.", [], ["recycling", "zirkularitaetsindikator"]],
    ["kreislauffaehigkeit", "Kreislauffähigkeit", "Kreislauffähigkeit beschreibt, ob ein Produkt, Material oder System sinnvoll in biologische oder technische Kreisläufe zurückgeführt werden kann.", "Sie ist notwendig, aber keine Garantie positiver Netto-Wirkung.", [], ["kreislaufwirkung", "kreislaufblindheit"]],
    ["kreislaufgrad", "Kreislaufgrad", "Der Kreislaufgrad beschreibt, wie stark ein Produkt, Unternehmen oder System tatsächlich zirkulär organisiert ist.", "Er muss mit Datenqualität, Materialgesundheit, Reparierbarkeit, Rücknahme und Nutzungsdauer verbunden werden.", [], ["kreislauffaehigkeit", "zirkularitaetsindikator"]],
    ["zirkularitaetsindikator", "Circularity Indicator / Zirkularitätsindikator", "Ein Zirkularitätsindikator misst Aspekte wie Materialrückführung, Rezyklatanteil, Lebensdauer, Wiederverwendung oder Recycling.", "Er braucht Kontext, weil Kreislaufwerte allein Wirkung nicht vollständig zeigen.", ["Circularity Indicator"], ["kreislaufgrad", "scorecard"]],
    ["zirkulaeres-geschaeftsmodell", "Zirkuläres Geschäftsmodell", "Ein zirkuläres Geschäftsmodell schafft Wert, indem Produkte, Materialien oder Funktionen möglichst lange im Kreislauf bleiben.", "Beispiele sind Product-as-a-Service, Rücknahmesysteme, Leasing, Sharing, Refurbishment, Remanufacturing und Wiederverkauf.", [], ["product-as-a-service", "ruecknahmesystem"]],
    ["product-as-a-service", "Product-as-a-Service", "Product-as-a-Service verkauft Nutzung oder Funktion statt Eigentum am Produkt.", "Kann Kreislaufwirkung stärken, wenn Anbieter Anreize für Langlebigkeit, Wartung und Rücknahme haben; kann aber Plattformmacht erzeugen.", [], ["zirkulaeres-geschaeftsmodell", "plattformkapitalismus"]],
    ["erweiterte-herstellerverantwortung", "Erweiterte Herstellerverantwortung", "Erweiterte Herstellerverantwortung verpflichtet Hersteller zu Verantwortung über den Verkauf hinaus.", "Wichtig für Rücknahme, Entsorgung, Recycling und Rückkopplung von Produktfolgen an Herstellerentscheidungen.", ["Extended Producer Responsibility", "EPR"], ["ruecknahmesystem", "wirkungsrueckkopplung"]],
    ["geplante-obsoleszenz", "Geplante Obsoleszenz", "Geplante Obsoleszenz verkürzt Nutzungsdauer durch Produktgestaltung oder Marktpraktiken.", "Sie ist negative Produktwirkung, weil sie Ressourcenverbrauch, Abfall und Ersatzproduktion erhöht.", [], ["nutzungsdauerverlaengerung", "reparierbarkeit"]],
    ["industrielle-dekonstruktion", "Industrielle Dekonstruktion", "Industrielle Dekonstruktion zerlegt Produkte, Gebäude oder Anlagen systematisch, um Komponenten und Materialien wiederzuverwenden.", "Wichtig für Bau, Produktion, Materialpass und Urban Mining.", [], ["urban-mining", "materialpass"]],
    ["abfallhierarchie", "Abfallhierarchie", "Die Abfallhierarchie ordnet Maßnahmen nach Priorität: Vermeidung, Wiederverwendung, Recycling, Verwertung und Beseitigung.", "Die WÖk erweitert sie um Wirkung auf Mensch, Planet und Demokratie sowie Produktdesign vor der Abfallphase.", [], ["kreislaufwirtschaft", "recycling"]],
    ["zero-waste", "Null-Abfall / Zero Waste", "Zero Waste zielt darauf, Abfall durch Design, Vermeidung, Wiederverwendung und Rückführung möglichst vollständig zu vermeiden.", "Wirkung hängt davon ab, ob Vermeidung real ist und keine Schäden verlagert werden.", ["Zero Waste"], ["abfallhierarchie", "kreislaufwirtschaft"]],
    ["kreislaufblindheit", "Kreislaufblindheit", "Kreislaufblindheit ist das Missverständnis, dass ein geschlossener Materialkreislauf automatisch positive Wirkung erzeugt.", "Ein Kreislauf kann auch schädliche Stoffe, Machtkonzentration oder Ausbeutung stabilisieren.", [], ["kreislauffaehigkeit", "materialgesundheit", "positive-netto-wirkung"]],
    ["kreislaufwirkung", "Kreislaufwirkung", "Kreislaufwirkung beschreibt die tatsächliche Wirkung zirkulärer Produkt-, Material- oder Geschäftsmodellgestaltung auf Mensch, Planet und Demokratie.", "Sie verbindet Kreislaufdaten mit Netto-Wirkung, Reverse Merit Order und Scorecards.", [], ["kreislaufwirtschaft", "positive-netto-wirkung", "scorecard"]],
  ].map(([id, title, short, woek, aliases = [], related = []]) => addTerm(circularBase, { id, title, short, definition: short, woek, aliases, related })),
];

const neuroTerms = [
  ...[
    ["neuropsychologische-wirkmechanismen", "Neuropsychologische Wirkmechanismen", "Neuropsychologische Wirkmechanismen beschreiben, wie Wahrnehmung, Aufmerksamkeit, Emotion, Gedächtnis und Entscheidung Wirkungspotenziale entfalten oder blockieren.", "Sie sind keine Wirkung im WÖk-Sinn, sondern Wirkmechanismen, Resonanzverstärker oder Aufnahmebedingungen.", [], ["wahrnehmung", "aufmerksamkeit", "salienz", "resonanzraum"]],
    ["wahrnehmung", "Wahrnehmung", "Wahrnehmung beschreibt die Aufnahme und Verarbeitung von Reizen, Informationen und Situationen.", "Sie ist nicht neutral, sondern wird durch Salienz, Erfahrung, Erwartung, Emotion, Kontext, Sprache und Zugehörigkeit geprägt.", [], ["salienz", "praediktive-verarbeitung", "framing"]],
    ["aufmerksamkeit", "Aufmerksamkeit", "Aufmerksamkeit beschreibt die Auswahl dessen, was aus vielen Reizen bewusst oder handlungsrelevant wird.", "Aufmerksamkeit ist ein knappes Wirkungsmedium. Medien, Produkte, Preise und Plattformen wirken oft zuerst über Aufmerksamkeitslenkung.", [], ["aufmerksamkeitsoekonomie", "salienzsteuerung"]],
    ["aufmerksamkeitsoekonomie", "Aufmerksamkeitsökonomie", "Aufmerksamkeitsökonomie beschreibt Märkte und Plattformlogiken, in denen Aufmerksamkeit zur knappen Ressource und zum Geschäftsmodell wird.", "Relevant für Medien, Plattformen, politische Sprache, Werbung und demokratische Stabilität.", [], ["plattformkapitalismus", "medienqualitaet"]],
    ["kognitive-belastung", "Kognitive Belastung", "Kognitive Belastung beschreibt den geistigen Aufwand, um Informationen zu verarbeiten, Entscheidungen zu treffen oder Komplexität zu bewältigen.", "Hohe Belastung kann Reaktanz, Vereinfachung, Scheinentlastung oder Entscheidungsvermeidung begünstigen.", ["Cognitive Load"], ["informationsueberlastung", "scheinentlastung"]],
    ["informationsueberlastung", "Informationsüberlastung", "Informationsüberlastung entsteht, wenn Menschen mehr Informationen erhalten, als sie sinnvoll verarbeiten können.", "Mehr Daten erzeugen nicht automatisch mehr Wirkung; ohne Orientierung, Filter, Vertrauen und Handlungsmöglichkeit kann Überlastung Wirkung blockieren.", [], ["orientierung", "vertrauen"]],
    ["mentales-modell", "Mentales Modell", "Ein mentales Modell ist eine innere Vorstellung davon, wie ein Ausschnitt der Welt funktioniert.", "Mentale Modelle beeinflussen, ob Wirkungsdaten, Fakten, Produkte, Risiken oder politische Botschaften verstanden und akzeptiert werden.", [], ["wirklichkeitskonstruktion", "reframing"]],
    ["praediktive-verarbeitung", "Prädiktive Verarbeitung", "Prädiktive Verarbeitung beschreibt die Idee, dass Wahrnehmung stark durch Erwartungen und Vorhersagen geprägt wird.", "Relevant für Wirklichkeitskonstruktion, kognitive Dissonanz, Framing und Faktenreaktanz.", ["Predictive Processing", "Vorhersageverarbeitung"], ["kognitive-dissonanz", "framing"]],
    ["belohnungslernen", "Belohnungslernen", "Belohnungslernen beschreibt, wie Verhalten durch positive Rückmeldung, Erfolgserleben oder soziale Anerkennung wahrscheinlicher wird.", "Relevant für Konsum, Plattformlogik, Likes, Status, Bonusprogramme, Gamification und Produktverhalten.", [], ["verstaerkungslernen", "plattformkapitalismus"]],
    ["verstaerkungslernen", "Verstärkungslernen", "Verstärkungslernen beschreibt Verhaltensänderung durch wiederholte Rückmeldungen, Belohnungen oder Sanktionen.", "Wirkungsrückkopplung kann gesellschaftliches Verstärkungslernen sein: positive Wirkung wird belohnt, negative Wirkung belastet.", [], ["belohnungslernen", "wirkungsrueckkopplung"]],
    ["gewoehnung", "Gewöhnung / Habituation", "Gewöhnung beschreibt, dass wiederholte Reize mit der Zeit weniger stark wahrgenommen werden.", "Relevant für Normalisierung, mediale Erregung, Klimarisiken, Gewaltbilder, politische Eskalation und Produktgewohnheiten.", ["Habituation"], ["normalisierung", "baseline-verschiebung"]],
    ["sensibilisierung", "Sensibilisierung", "Sensibilisierung beschreibt, dass wiederholte oder starke Reize die Reaktionsbereitschaft erhöhen.", "Relevant für Angstkommunikation, Alarm-Frames, Diskurseskalation und Vertrauensverlust.", [], ["alarm-frame", "bedrohungsverarbeitung"]],
    ["bedrohungsverarbeitung", "Bedrohungsverarbeitung", "Bedrohungsverarbeitung beschreibt, wie Menschen mögliche Gefahren wahrnehmen, emotional bewerten und handlungsrelevant machen.", "Kann Schutzverhalten fördern, aber auch Reaktanz, Polarisierung oder Feindbilder verstärken.", [], ["reaktanz", "alarm-frame"]],
    ["stressreaktion", "Stressreaktion", "Stressreaktion beschreibt körperliche und psychische Aktivierung bei wahrgenommener Belastung, Bedrohung oder Kontrollverlust.", "Dauerstress reduziert Dialogfähigkeit, Reflexion und Vertrauen; gesellschaftliche Dauererregung ist ein demokratisches Wirkungsrisiko.", [], ["emotionsregulation", "wirkungsresilienz"]],
    ["affekt", "Affekt", "Affekt beschreibt eine unmittelbare emotionale Reaktion oder Grundtönung, die Wahrnehmung und Bewertung beeinflusst.", "Affekt kann Salienz erhöhen und Entscheidungsräume verengen oder öffnen.", [], ["affektheuristik", "emotionsregulation"]],
    ["wahrheitsillusionseffekt", "Wahrheitsillusionseffekt", "Der Wahrheitsillusionseffekt beschreibt, dass wiederholte Aussagen vertrauter und dadurch glaubwürdiger wirken können, selbst wenn sie falsch sind.", "Zentral für Desinformation, politische Sprache, Werbung, Medienwirkung und Folgencheck.", ["Illusory Truth Effect"], ["desinformation", "faktencheck", "folgencheck"]],
    ["vertrautheitseffekt", "Vertrautheitseffekt", "Der Vertrautheitseffekt beschreibt, dass wiederholter Kontakt mit einem Reiz dessen positive Bewertung erhöhen kann.", "Relevant für Marken, Narrative, politische Begriffe, Normalisierung und Plattformkommunikation.", ["Mere Exposure Effect"], ["normalisierung", "narrativ"]],
    ["negativitaetsbias", "Negativitätsbias", "Negativitätsbias beschreibt die Tendenz, negative Informationen stärker zu beachten und zu gewichten als positive.", "Relevant für Medienlogik, Alarm-Frames, politische Polarisierung und gesellschaftliche Stabilität.", [], ["alarm-frame", "medienwirkung"]],
    ["neuigkeitsbias", "Neuigkeitsbias", "Neuigkeitsbias beschreibt die Tendenz, neue oder unerwartete Informationen stärker zu beachten.", "Relevant für Medien, Innovation, Produktkommunikation und Plattformlogik.", [], ["salienz", "innovation"]],
    ["gedaechtniskonsolidierung", "Gedächtniskonsolidierung", "Gedächtniskonsolidierung beschreibt Prozesse, durch die Informationen stabiler im Gedächtnis verankert werden.", "Nur sparsam verwenden, wenn Wiederholung, Narrative, Lernen oder Bildung fachlich relevant sind.", [], ["narrativ", "lernen"]],
    ["neuroplastizitaet", "Neuroplastizität", "Neuroplastizität beschreibt die Fähigkeit des Nervensystems, sich durch Erfahrung, Lernen und Übung zu verändern.", "Relevant für Wirkungskompetenz, Lernen, Bildung und Resilienz, aber nicht neuro-deterministisch verwenden.", [], ["wirkungskompetenz", "lernen"]],
  ].map(([id, title, short, woek, aliases = [], related = []]) => addTerm(neuroBase, { id, title, short, definition: short, woek, aliases, related })),
];

const quantumTerms = [
  ...[
    ["quantenphysik", "Quantenphysik", "Quantenphysik beschreibt Gesetzmäßigkeiten von Materie, Energie und Strahlung auf atomarer und subatomarer Ebene.", "Sie ist keine Energiequelle, sondern Grundlage für Halbleiter, Photovoltaik, Sensorik, neue Materialien, Batterieforschung, Quantencomputer und Quantensimulation.", [], ["quantenmaterialien", "halbleiter", "photovoltaik", "quantensolarzelle", "quantenbatterie", "quantentechnologie"]],
    ["quantentechnologie", "Quantentechnologie", "Quantentechnologie nutzt quantenphysikalische Effekte für Sensorik, Kommunikation, Rechnen, Simulation, Materialien oder Energie.", "Sie kann Wirkungspotenziale erzeugen, muss aber Energieverbrauch, Datenmacht, Sicherheitsrisiken, Infrastruktur und demokratische Kontrolle berücksichtigen.", [], ["quantenphysik", "quantensimulation"]],
    ["quantenmaterialien", "Quantenmaterialien", "Quantenmaterialien haben besondere Eigenschaften, die wesentlich durch quantenphysikalische Effekte bestimmt werden.", "Relevant für Photovoltaik, Batterien, Sensorik, Leistungselektronik, Supraleitung und neue Speichertechnologien.", [], ["quantenphysik", "supraleitung"]],
    ["halbleiter", "Halbleiter", "Halbleiter sind Materialien, deren elektrische Leitfähigkeit zwischen Leitern und Isolatoren liegt und gezielt gesteuert werden kann.", "Grundlage von Photovoltaik, Leistungselektronik, Digitalisierung und Sensorik; Lieferketten, Rohstoffe und geopolitische Abhängigkeiten zählen mit.", [], ["bandluecke", "photovoltaik"]],
    ["bandluecke", "Bandlücke", "Die Bandlücke beschreibt den energetischen Abstand zwischen Valenzband und Leitungsband in einem Material.", "Wichtig für Photovoltaik, LEDs, Halbleiter und Energieumwandlung.", ["Bandgap"], ["halbleiter", "photovoltaik"]],
    ["photoelektrischer-effekt", "Photoelektrischer Effekt", "Der photoelektrische Effekt beschreibt die Freisetzung oder Anregung von Elektronen durch Licht.", "Grundlagenbegriff für Photovoltaik und direkte Umwandlung von Licht in elektrische Energie.", [], ["photovoltaik", "energieumwandlung"]],
    ["quantensolarzelle", "Quantensolarzelle", "Quantensolarzellen nutzen quantenphysikalische Effekte oder nanoskalige Materialien wie Quantenpunkte, um Lichtabsorption und Energieumwandlung zu verbessern.", "Forschungs- und Innovationsfeld, keine heutige Standardtechnologie. Wirkung hängt von Wirkungsgrad, Stabilität, Materialgesundheit, Skalierbarkeit, Rohstoffen, Recycling und Lebenszyklus ab.", ["Quantum Solar Cell", "Quantum Dot Solar Cell", "Quantenpunkt-Solarzelle"], ["quantenpunkt", "photovoltaik", "perowskit-solarzelle"]],
    ["quantenpunkt", "Quantenpunkt", "Ein Quantenpunkt ist ein nanoskaliges Halbleitermaterial, dessen optische und elektronische Eigenschaften durch Quanteneffekte und Größe bestimmt werden.", "Relevant für Displays, Sensorik, Photovoltaik und neue Solarzellendesigns; Materialgesundheit und Recycling sind zu bewerten.", ["Quantum Dot"], ["quantensolarzelle", "halbleiter"]],
    ["perowskit-solarzelle", "Perowskit-Solarzelle", "Perowskit-Solarzellen nutzen Materialien mit Perowskit-Struktur zur Umwandlung von Licht in elektrische Energie.", "Wichtiges PV-Innovationsfeld; WÖk-Bewertung umfasst Wirkungsgrad, Stabilität, Toxizität, Rohstoffe, Lebensdauer, Recycling und Skalierbarkeit.", [], ["photovoltaik", "tandem-solarzelle"]],
    ["tandem-solarzelle", "Tandem-Solarzelle", "Tandem-Solarzellen kombinieren mehrere Solarzellenschichten, um verschiedene Lichtbereiche effizienter zu nutzen.", "Relevant für höhere Wirkungsgrade und Flächeneffizienz; zu bewerten sind Materialeinsatz, Lebensdauer, Kosten, Recycling und Produktionswirkung.", [], ["photovoltaik", "perowskit-solarzelle"]],
    ["quantenbatterie", "Quantenbatterie", "Eine Quantenbatterie ist ein Forschungs-Konzept zur Energiespeicherung, das quantenphysikalische Effekte nutzen soll.", "Derzeit primär Forschungsfeld und keine heutige Lösung für Netzspeicher, Elektromobilität oder Haushaltsbatterien.", [], ["quantenphysik", "speicher-energie", "batteriespeicher"]],
    ["supraleitung", "Supraleitung", "Supraleitung beschreibt einen Zustand ohne elektrischen Widerstand und mit besonderen magnetischen Effekten.", "Potenzial für Stromübertragung, Magnetspulen, Sensorik oder Speichertechnologien; Wirkung hängt von Temperaturanforderungen, Materialien und Infrastruktur ab.", [], ["quantenmaterialien", "energieumwandlung"]],
    ["quantensimulation", "Quantensimulation", "Quantensimulation nutzt Quantensysteme oder Quantencomputer zur Modellierung komplexer Materialien, Moleküle oder physikalischer Prozesse.", "Relevant für Batteriematerialien, Katalyse, Solarzellen, Chemie, Medikamente und Materialentwicklung.", [], ["quantentechnologie", "quantenmaterialien"]],
  ].map(([id, title, short, woek, aliases = [], related = []]) => addTerm(quantumBase, { id, title, short, definition: short, woek, aliases, related, mythos: id === "quantenphysik" ? "Quantenphysik ist eine neue Energieform." : id === "quantenbatterie" ? "Quantenbatterien ersetzen bald normale Batterien." : id === "quantensolarzelle" ? "Quantensolarzellen lösen kurzfristig alle PV-Probleme." : "", woekKlaerung: id === "quantenphysik" ? "Quantenphysik erklärt Wirkmechanismen; Wirkung entsteht erst durch konkrete Technologien, Produkte und Infrastrukturen." : id === "quantenbatterie" ? "Aktuell Forschungs- und Zukunftstechnologie, keine heutige Standardlösung." : id === "quantensolarzelle" ? "Forschungsfeld; Wirkung braucht belastbare Skalierung, Lebensdauer, Materialverträglichkeit und Systemintegration." : "" })),
];

const energyTerms = [
  ...[
    ["energie", "Energie", "Energie ist die Fähigkeit, Arbeit zu verrichten, Wärme zu erzeugen oder Zustände zu verändern.", "Energie ist ein Grundträger gesellschaftlicher Wirkung: Wohlstand, Gesundheit, Produktion, Mobilität, Wohnen, Klimawirkung und Abhängigkeiten hängen daran.", [], ["primaerenergie", "endenergie", "nutzenergie"]],
    ["primaerenergie", "Primärenergie", "Primärenergie ist Energie in natürlicher oder ursprünglicher Form vor Umwandlung.", "Beispiele sind Kohle, Erdgas, Rohöl, Uran, Sonnenstrahlung, Wind, Wasserkraft und Biomasse.", [], ["energie", "energieumwandlung"]],
    ["endenergie", "Endenergie", "Endenergie ist die Energie, die Verbraucher:innen nach Umwandlung und Transport beziehen.", "Beispiele sind Strom, Fernwärme, Benzin, Heizöl, Erdgas oder Wasserstoff.", [], ["primaerenergie", "nutzenergie"]],
    ["nutzenergie", "Nutzenergie", "Nutzenergie ist die Energie, die nach Umwandlungsverlusten für den gewünschten Zweck verfügbar ist.", "Beispiele sind Raumwärme, Licht, Bewegung und mechanische Arbeit.", [], ["endenergie", "wirkungsgrad"]],
    ["energieumwandlung", "Energieumwandlung", "Energieumwandlung beschreibt die Umwandlung einer Energieform in eine andere.", "Zentral für Wirkungsgrad, Verlustleistung und Systemwirkung.", [], ["wirkungsgrad", "verlustleistung"]],
    ["energieeffizienz", "Energieeffizienz", "Energieeffizienz beschreibt, wie viel Nutzen mit einem bestimmten Energieeinsatz erzeugt wird.", "Wichtig, aber nicht hinreichend: Rebound-Effekte und Systemwirkung müssen geprüft werden.", [], ["wirkungsgrad", "rebound-effekt"]],
    ["thermisches-kraftwerk", "Thermisches Kraftwerk", "Ein thermisches Kraftwerk erzeugt elektrische Energie über Wärme, die meist eine Turbine oder Wärmekraftmaschine antreibt.", "Wirkung hängt von Brennstoff, Emissionen, Wirkungsgrad, Abwärme, Wasserverbrauch, Sicherheitsrisiken und Flexibilität ab.", ["Wärmekraftwerk"], ["fossiles-kraftwerk", "kernenergie"]],
    ["fossiles-kraftwerk", "Fossiles Kraftwerk", "Ein fossiles Kraftwerk erzeugt Strom durch Verbrennung fossiler Energieträger wie Kohle, Erdgas oder Öl.", "Es erzeugt direkte Treibhausgasemissionen und häufig Luftschadstoffe; ohne Klimafolgeschäden, Gesundheitskosten und geopolitische Risiken sind Kosten unvollständig.", [], ["kohlekraftwerk", "gaskraftwerk", "oelkraftwerk"]],
    ["kohlekraftwerk", "Kohlekraftwerk", "Ein Kohlekraftwerk erzeugt Strom durch Verbrennung von Kohle.", "Hohe CO2- und Luftschadstoffwirkung, relevante Gesundheits-, Klima- und Strukturfolgen.", [], ["fossiles-kraftwerk", "klimafolgeschaeden"]],
    ["gaskraftwerk", "Gaskraftwerk", "Ein Gaskraftwerk erzeugt Strom durch Verbrennung von Erdgas.", "Kann flexibel sein, verursacht aber CO2- und Methan-Vorkettenwirkungen sowie Importabhängigkeiten.", [], ["fossiles-kraftwerk", "flexibilitaet-energiesystem"]],
    ["oelkraftwerk", "Ölkraftwerk", "Ein Ölkraftwerk erzeugt Strom aus Erdölprodukten.", "Meist als Reserve oder in Inselsystemen relevant; hohe Emissions- und Abhängigkeitswirkung.", [], ["fossiles-kraftwerk"]],
    ["kernenergie", "Kernenergie", "Kernenergie nutzt Energie aus Kernspaltung zur Erzeugung von Wärme und daraus Strom.", "Geringe direkte CO2-Emissionen im Betrieb, aber besondere Fragen zu Bauzeit, Kapitalbindung, Sicherheit, Endlagerung, Rückbau, Versicherung, Kühlwasser, Akzeptanz und Opportunitätskosten.", ["Atomenergie", "Nuclear Energy"], ["thermisches-kraftwerk", "systemkosten"]],
    ["erneuerbare-energien", "Erneuerbare Energien", "Erneuerbare Energien stammen aus Quellen, die sich natürlich erneuern oder dauerhaft verfügbar sind.", "Zentral für Klimaschutz, aber nicht konfliktfrei: Flächen, Rohstoffe, Netze, Biodiversität, Akzeptanz, Lieferketten und Speicher zählen mit.", [], ["photovoltaik", "windenergie", "wasserkraft", "bioenergie", "geothermie"]],
    ["photovoltaik", "Photovoltaik", "Photovoltaik wandelt Licht direkt in elektrische Energie um.", "Zentraler Wirkungshebel der Energiewende; braucht Flächen, Materialien, Netzintegration, Speicher, Wechselrichter, Recycling und Lieferkettenverantwortung.", [], ["photoelektrischer-effekt", "strommarkt"]],
    ["solarthermie", "Solarthermie", "Solarthermie nutzt Sonnenenergie zur Wärmeerzeugung.", "Relevant für Wärme, Gebäude, Industrieprozesse und saisonale Speicher.", [], ["erneuerbare-energien", "waermepumpe"]],
    ["windenergie", "Windenergie", "Windenergie wandelt Bewegungsenergie des Windes in Strom um.", "Zentral für erneuerbare Stromsysteme; Wirkung umfasst Flächen, Natur, Akzeptanz, Netze und Systemintegration.", [], ["onshore-windenergie", "offshore-windenergie"]],
    ["onshore-windenergie", "Onshore-Windenergie", "Onshore-Windenergie erzeugt Strom aus Windkraftanlagen an Land.", "Wichtig für regionale Wertschöpfung, Akzeptanz, Flächenplanung und Netzintegration.", [], ["windenergie", "netzausbau"]],
    ["offshore-windenergie", "Offshore-Windenergie", "Offshore-Windenergie erzeugt Strom aus Windkraftanlagen auf See.", "Hohe Volllaststunden, aber besondere Netz-, Meeres-, Bau- und Systemkostenfragen.", [], ["windenergie", "offshore-netzumlage"]],
    ["wasserkraft", "Wasserkraft", "Wasserkraft nutzt Bewegungs- oder Lageenergie von Wasser zur Stromerzeugung.", "Erneuerbar, aber mit Eingriffen in Gewässerökologie, Sedimente und Lebensräume verbunden.", [], ["erneuerbare-energien"]],
    ["bioenergie", "Bioenergie", "Bioenergie nutzt biologische Materialien zur Energieerzeugung.", "Wirkung hängt stark von Flächen, Biodiversität, Nahrungskonkurrenz, Reststoffen und Emissionen ab.", [], ["biogas", "erneuerbare-energien"]],
    ["geothermie", "Geothermie", "Geothermie nutzt Wärme aus dem Erdinneren.", "Relevant für Wärme und Strom, mit Standort-, Bohr-, Risiko- und Infrastrukturfragen.", [], ["erneuerbare-energien"]],
    ["wasserstoff", "Wasserstoff", "Wasserstoff ist ein Energieträger für Speicherung, Transport, Industrie, Verkehr oder Stromsysteme.", "Kein Primärenergieersatz für alles; Wirkung hängt von Herkunft, Wirkungsgrad, Einsatzfeld, Infrastruktur und Alternativen ab.", [], ["gruener-wasserstoff", "blauer-wasserstoff", "grauer-wasserstoff", "power-to-x"]],
    ["gruener-wasserstoff", "Grüner Wasserstoff", "Grüner Wasserstoff wird mit erneuerbarem Strom per Elektrolyse hergestellt.", "Sinnvoll vor allem dort, wo direkte Elektrifizierung schwer ist.", [], ["wasserstoff", "power-to-x"]],
    ["blauer-wasserstoff", "Blauer Wasserstoff", "Blauer Wasserstoff wird aus fossilen Quellen hergestellt, wobei CO2 abgeschieden und gespeichert werden soll.", "Wirkung hängt von Methanemissionen, Abscheiderate, Speicherpermanenz und Alternativen ab.", [], ["wasserstoff", "carbon-capture"]],
    ["grauer-wasserstoff", "Grauer Wasserstoff", "Grauer Wasserstoff wird aus fossilen Energieträgern ohne wirksame CO2-Abscheidung hergestellt.", "Er ist klimapolitisch problematisch und kein Transformationsziel.", [], ["wasserstoff", "treibhausgasemissionen"]],
    ["power-to-x", "Power-to-X", "Power-to-X wandelt Strom in andere Energieträger oder Produkte wie Wasserstoff, Wärme, synthetische Kraftstoffe oder Chemikalien um.", "Relevant für Sektorkopplung, Speicher und Industrie, aber mit Umwandlungsverlusten.", [], ["wasserstoff", "sektorkopplung"]],
    ["strommarkt", "Strommarkt", "Der Strommarkt organisiert Erzeugung, Handel, Transport, Verteilung und Verbrauch von Strom.", "Strom ist netzgebunden, muss in Echtzeit bilanziert werden und braucht Versorgungssicherheit, Flexibilität und Systemdienstleistungen.", [], ["strommarktdesign", "merit-order"]],
    ["strommarktdesign", "Strommarktdesign", "Strommarktdesign beschreibt Regeln für Erzeugung, Handel, Vergütung, Transport und Absicherung von Strom.", "Strommarktdesign ist Wirkungsarchitektur: Es beeinflusst Investitionen, Preise, Flexibilität, Versorgungssicherheit, Netzausbau und Verteilung.", [], ["energy-only-markt", "kapazitaetsmarkt"]],
    ["energy-only-markt", "Energy-only-Markt", "Ein Energy-only-Markt vergütet primär tatsächlich erzeugte und verkaufte Strommenge.", "Relevant für Erneuerbare, Speicher, Flexibilität, Versorgungssicherheit und Missing-Money-Problem.", [], ["strommarktdesign", "kapazitaetsmarkt"]],
    ["kapazitaetsmarkt", "Kapazitätsmarkt", "Ein Kapazitätsmarkt vergütet die Bereitstellung gesicherter Leistung unabhängig von tatsächlicher Stromerzeugung.", "Kann Versorgungssicherheit unterstützen, birgt aber Fehlanreize, fossilen Lock-in oder Überkapazität.", [], ["gesicherte-leistung", "backup-kapazitaet"]],
    ["merit-order", "Merit Order", "Merit Order beschreibt die Einsatzreihenfolge von Stromerzeugungsanlagen nach Grenzkosten.", "Erklärt kurzfristige Strompreisbildung, aber nicht vollständige Systemkosten, Klimafolgen, Netzkosten oder Versorgungssicherheit.", [], ["grenzkosten", "grenzkraftwerk"]],
    ["grenzkosten", "Grenzkosten", "Grenzkosten sind die Kosten für die Erzeugung einer zusätzlichen Einheit Strom.", "Sie prägen kurzfristige Strompreisbildung, aber nicht vollständige Wirkungskosten.", [], ["merit-order", "grenzkraftwerk"]],
    ["grenzkraftwerk", "Grenzkraftwerk", "Das Grenzkraftwerk deckt die Nachfrage zuletzt und setzt häufig den Marktpreis.", "Seine Wirkung hängt von Brennstoff, Flexibilität und Emissionen ab.", [], ["merit-order", "strommarkt"]],
    ["stromgestehungskosten", "Stromgestehungskosten", "Stromgestehungskosten beschreiben durchschnittliche Erzeugungskosten über die Lebensdauer einer Anlage pro Kilowattstunde.", "LCOE ist nützlich, aber nicht vollständig: Systemkosten, Netze, Speicher, Umweltkosten, Gesundheit, Klimafolgen und Zeitpfad zählen mit.", ["Gestehungskosten", "LCOE", "Levelized Cost of Electricity"], ["systemkosten", "strommarkt"]],
    ["systemkosten", "Systemkosten", "Systemkosten umfassen Kosten für Integration, Netze, Speicher, Flexibilität, Reserve, Redispatch und Versorgungssicherheit.", "Eine Technologie kann niedrige Gestehungskosten haben und dennoch Systemkosten verursachen.", [], ["stromgestehungskosten", "redispatch", "speicher-energie"]],
    ["co2-preis", "CO2-Preis", "Ein CO2-Preis belastet Treibhausgasemissionen monetär.", "Er koppelt Klimawirkung teilweise in Preise zurück, ersetzt aber keine vollständige Wirkungsbewertung.", [], ["emissionshandel", "klimafolgeschaeden"]],
    ["emissionshandel", "Emissionshandel", "Emissionshandel begrenzt und handelbar macht Emissionsrechte.", "Wirkt nur so gut wie Cap, Abdeckung, Kontrolle und soziale Ausgleichsarchitektur.", [], ["co2-preis", "treibhausgasemissionen"]],
    ["capture-price", "Capture Price / Marktwert von Strom", "Der Capture Price beschreibt den durchschnittlichen Erlös einer Erzeugungstechnologie abhängig von den Zeiten ihrer Einspeisung.", "Relevant für Solar- und Windstrom, Kannibalisierungseffekt, Speicher und Flexibilität.", ["Marktwert erneuerbarer Energien"], ["kannibalisierungseffekt", "photovoltaik", "windenergie"]],
    ["kannibalisierungseffekt", "Kannibalisierungseffekt", "Der Kannibalisierungseffekt beschreibt sinkende Markterlöse, wenn viele Anlagen gleichzeitig einspeisen und Preise drücken.", "Relevant für PV, Wind, Speicher und Strommarktdesign.", [], ["capture-price", "strommarktdesign"]],
    ["stromnetz", "Stromnetz", "Das Stromnetz verbindet Erzeugung, Speicher und Verbrauch elektrischer Energie.", "Zentral für Versorgungssicherheit, Netzintegration, Kostenverteilung und Teilhabe.", [], ["uebertragungsnetz", "verteilnetz"]],
    ["uebertragungsnetz", "Übertragungsnetz", "Das Übertragungsnetz transportiert Strom über große Entfernungen auf hoher Spannung.", "Wichtig für regionale Ausgleichsräume, Offshore-Anbindung und Versorgungssicherheit.", [], ["stromnetz", "netzausbau"]],
    ["verteilnetz", "Verteilnetz", "Das Verteilnetz bringt Strom regional zu Haushalten, Betrieben und dezentralen Anlagen.", "Zentral für PV, Wärmepumpen, Elektromobilität, Speicher, Prosumer und Netzentgelte.", [], ["stromnetz", "prosumer"]],
    ["netzengpass", "Netzengpass", "Ein Netzengpass entsteht, wenn Stromleitungen oder Betriebsmittel nicht genug Transportkapazität haben.", "Er verursacht Redispatch, Abregelung und Systemkosten.", [], ["redispatch", "abregelung"]],
    ["netzentgelt", "Netzentgelt", "Netzentgelte sind Entgelte für die Nutzung von Strom- oder Gasnetzen und Bestandteil des Endkundenpreises.", "Zentrales Feld für Verteilungswirkung, Energiewende-Kosten, Netzfinanzierung, Prosumer-Logik und Standortgerechtigkeit.", [], ["netzentgeltsystematik", "strompreisbestandteile"]],
    ["netzentgeltsystematik", "Netzentgeltsystematik", "Netzentgeltsystematik beschreibt, wie Netzkosten verteilt und abgerechnet werden.", "Sie beeinflusst soziale Verteilung, Investitionsanreize, Netzdienlichkeit und Prosumer-Rollen.", [], ["netzentgelt", "netzdienlichkeit"]],
    ["netzanschluss", "Netzanschluss", "Netzanschluss verbindet Anlagen oder Verbraucher mit dem Stromnetz.", "Zugang, Kosten und Dauer wirken auf Energiewende, Standortentscheidungen und Teilhabe.", [], ["stromnetz", "netzausbau"]],
    ["netzausbau", "Netzausbau", "Netzausbau erweitert oder verstärkt Stromnetze.", "Er ist Infrastrukturwirkung mit Kosten-, Akzeptanz-, Flächen- und Versorgungssicherheitsfragen.", [], ["stromnetz", "netzengpass"]],
    ["netzdienlichkeit", "Netzdienlichkeit", "Netzdienlichkeit beschreibt Verhalten, Anlagen oder Steuerung, die das Stromnetz entlasten oder stabilisieren.", "Ein wichtiger Wirkungshebel für Flexibilität, Tarife, Speicher und Demand Response.", [], ["demand-response", "flexibilitaet-energiesystem"]],
    ["redispatch", "Redispatch", "Redispatch bezeichnet Eingriffe in Erzeugungsleistung oder Einspeisung, um Netzengpässe zu vermeiden oder zu beheben.", "Symptom unzureichender Netz-, Standort-, Flexibilitäts- oder Marktabstimmung; notwendig, aber kosten- und wirkungsrelevant.", [], ["netzengpass", "abregelung"]],
    ["abregelung", "Abregelung", "Abregelung reduziert Stromerzeugung, etwa aus erneuerbaren Anlagen, wegen Netzengpässen oder Systemanforderungen.", "Zeigt fehlende Netz-, Speicher- oder Flexibilitätsintegration.", ["Curtailment"], ["redispatch", "erneuerbare-energien"]],
    ["einspeisemanagement", "Einspeisemanagement", "Einspeisemanagement steuert oder begrenzt Einspeisung von Anlagen ins Stromnetz.", "Relevant bei Netzengpässen, erneuerbarer Einspeisung und Entschädigungslogik.", [], ["abregelung", "redispatch"]],
    ["netzverlust", "Netzverlust", "Netzverlust beschreibt Energieverluste beim Transport und der Verteilung von Strom.", "Teil der Systemwirkung von Netzstruktur, Spannungsebene und Entfernung.", [], ["stromnetz", "systemkosten"]],
    ["systemdienstleistungen", "Systemdienstleistungen", "Systemdienstleistungen stabilisieren das Stromsystem, etwa Frequenzhaltung, Spannungshaltung, Schwarzstartfähigkeit oder Reserve.", "Sie werden in erneuerbaren Systemen neu organisiert.", [], ["regelenergie", "frequenzhaltung"]],
    ["regelenergie", "Regelenergie", "Regelenergie gleicht kurzfristige Abweichungen zwischen Stromerzeugung und Verbrauch aus.", "Wichtig für Versorgungssicherheit und Flexibilität.", [], ["systemdienstleistungen", "frequenzhaltung"]],
    ["primaerregelung", "Primärregelung", "Primärregelung stabilisiert die Netzfrequenz sehr kurzfristig.", "Ein Detailbegriff der Systemdienstleistungen.", [], ["regelenergie"]],
    ["sekundaerregelung", "Sekundärregelung", "Sekundärregelung stellt nach kurzfristigen Abweichungen die Bilanz eines Regelgebiets wieder her.", "Ein Detailbegriff der Regelenergie.", [], ["regelenergie"]],
    ["minutenreserve", "Minutenreserve", "Minutenreserve stellt Leistung innerhalb weniger Minuten bereit.", "Ein Reserveinstrument im Stromsystem.", [], ["regelenergie"]],
    ["frequenzhaltung", "Frequenzhaltung", "Frequenzhaltung sichert die stabile Frequenz im Stromnetz.", "Zentral für Systemstabilität.", [], ["systemdienstleistungen", "regelenergie"]],
    ["spannungshaltung", "Spannungshaltung", "Spannungshaltung sichert zulässige Spannungsniveaus im Netz.", "Relevant für Netzbetrieb, Blindleistung und dezentrale Einspeisung.", [], ["systemdienstleistungen"]],
    ["schwarzstartfaehigkeit", "Schwarzstartfähigkeit", "Schwarzstartfähigkeit beschreibt die Fähigkeit, Stromerzeugung ohne externes Netz wieder anzufahren.", "Relevant für Krisenresilienz und Wiederaufbau des Stromsystems.", [], ["systemdienstleistungen", "wirkungsresilienz"]],
    ["momentanreserve", "Momentanreserve", "Momentanreserve beschreibt sehr kurzfristige Stabilisierung durch rotierende Massen oder technische Ersatzlösungen.", "Relevant beim Übergang zu inverterbasierten Erzeugern.", [], ["inertia", "systemdienstleistungen"]],
    ["inertia", "Inertia / Trägheit", "Inertia beschreibt Trägheit im Stromsystem, klassisch durch rotierende Massen synchroner Maschinen.", "Relevant beim Übergang von thermischen Kraftwerken zu inverterbasierten Erzeugern.", ["Trägheit"], ["momentanreserve", "thermisches-kraftwerk"]],
    ["flexibilitaet-energiesystem", "Flexibilität im Energiesystem", "Flexibilität beschreibt die Fähigkeit, Erzeugung, Verbrauch, Speicher und Netzbetrieb an schwankende Bedingungen anzupassen.", "Zentrale Systemwirkung in erneuerbaren Stromsystemen.", ["Flexibilität"], ["demand-response", "speicher-energie"]],
    ["demand-response", "Demand Response", "Demand Response verschiebt oder reduziert Stromverbrauch als Reaktion auf Markt- oder Netzsignale.", "Wirkungshebel für Netzdienlichkeit, Kostenreduktion, Versorgungssicherheit und Integration erneuerbarer Energien.", [], ["lastmanagement", "dynamischer-stromtarif"]],
    ["lastmanagement", "Lastmanagement", "Lastmanagement steuert Stromverbrauch zeitlich oder mengenmäßig.", "Es kann Netze entlasten, Kosten senken und erneuerbare Integration verbessern.", [], ["demand-response", "lastgang"]],
    ["lastgang", "Lastgang", "Der Lastgang beschreibt den zeitlichen Verlauf des Stromverbrauchs.", "Grundlage für Tarife, Netzauslegung, Flexibilität und Demand Response.", [], ["lastmanagement", "residuallast"]],
    ["residuallast", "Residuallast", "Residuallast ist die Stromnachfrage nach Abzug variabler erneuerbarer Einspeisung.", "Wichtig für Speicher, Backup, Flexibilität und Strommarktdesign.", [], ["dunkelflaute", "backup-kapazitaet"]],
    ["dunkelflaute", "Dunkelflaute", "Dunkelflaute bezeichnet Phasen mit geringer Solar- und Windstromerzeugung.", "Relevant für Versorgungssicherheit, Speicher, Backup, Netze, Demand Response und Systemkosten.", [], ["residuallast", "langzeitspeicher"]],
    ["grundlast", "Grundlast", "Grundlast beschreibt den dauerhaft vorhandenen Mindeststrombedarf.", "Historisch wichtig, in erneuerbaren Systemen aber kritisch: Zukunftssysteme brauchen Flexibilität, Residuallastdeckung und Systemdienstleistungen.", [], ["residuallast", "gesicherte-leistung"]],
    ["spitzenlast", "Spitzenlast", "Spitzenlast beschreibt besonders hohe Stromnachfrage in bestimmten Zeiten.", "Relevant für Netze, Kapazität, Tarife und Demand Response.", [], ["lastgang", "demand-response"]],
    ["gesicherte-leistung", "Gesicherte Leistung", "Gesicherte Leistung beschreibt Leistung, die mit hoher Verlässlichkeit verfügbar ist.", "Zentral für Versorgungssicherheit, Kapazitätsmärkte, Speicher und Backup.", [], ["kapazitaetsmarkt", "backup-kapazitaet"]],
    ["backup-kapazitaet", "Backup-Kapazität", "Backup-Kapazität steht bereit, wenn andere Erzeugung oder Flexibilität nicht ausreicht.", "Wirkung hängt von Emissionen, Kosten, Einsatzhäufigkeit und Alternativen ab.", [], ["gesicherte-leistung", "dunkelflaute"]],
    ["speicher-energie", "Speicher", "Speicher nehmen Energie auf und geben sie später wieder ab.", "Sie erzeugen keine Primärenergie, können aber Systemkosten, Abregelung und Versorgungssicherheitsrisiken senken.", ["Energiespeicher"], ["batteriespeicher", "pumpspeicher", "langzeitspeicher"]],
    ["batteriespeicher", "Batteriespeicher", "Batteriespeicher speichern elektrische Energie elektrochemisch.", "Relevant für Kurzzeitspeicher, Netzdienlichkeit, Eigenverbrauch und erneuerbare Integration; Rohstoffe und Recycling zählen mit.", [], ["speicher-energie", "kurzzeitspeicher"]],
    ["pumpspeicher", "Pumpspeicher", "Pumpspeicher speichern Energie durch Hochpumpen von Wasser und spätere Stromerzeugung.", "Bewährte Speichertechnologie mit Standort- und Naturräumen.", [], ["speicher-energie", "langzeitspeicher"]],
    ["langzeitspeicher", "Langzeitspeicher", "Langzeitspeicher überbrücken längere Zeiträume mit Energiebedarf.", "Relevant für Dunkelflauten, saisonale Schwankungen und Versorgungssicherheit.", [], ["dunkelflaute", "wasserstoffspeicher"]],
    ["kurzzeitspeicher", "Kurzzeitspeicher", "Kurzzeitspeicher gleichen kurzfristige Schwankungen aus.", "Wichtig für PV, Frequenzhaltung, Lastspitzen und Netzdienlichkeit.", [], ["batteriespeicher", "regelenergie"]],
    ["wasserstoffspeicher", "Wasserstoffspeicher", "Wasserstoffspeicher speichern Energie chemisch in Form von Wasserstoff.", "Relevant für Langzeitspeicherung und Industrie, aber mit Umwandlungsverlusten und Infrastrukturbedarf.", [], ["wasserstoff", "langzeitspeicher"]],
    ["vehicle-to-grid", "Vehicle-to-Grid", "Vehicle-to-Grid nutzt Batterien von Elektrofahrzeugen zur Rückspeisung oder Netzstützung.", "Potenzial für Flexibilität, aber abhängig von Batteriealterung, Tarifen, Standards und Nutzerakzeptanz.", [], ["elektromobilitaet", "batteriespeicher"]],
    ["prosumer", "Prosumer", "Prosumer verbrauchen und erzeugen Energie.", "Relevant für PV, Eigenverbrauch, Netzentgelte, Dezentralisierung, Teilhabe und Verteilungswirkung.", [], ["photovoltaik", "netzentgelt"]],
    ["eeg", "EEG", "Das EEG ist das deutsche Erneuerbare-Energien-Gesetz.", "Es hat Investitionen in erneuerbare Energien stark geprägt und bleibt für Marktintegration und Förderung relevant.", [], ["einspeiseverguetung", "marktpraemie"]],
    ["einspeiseverguetung", "Einspeisevergütung", "Einspeisevergütung vergütet eingespeisten Strom zu festgelegten Sätzen.", "Investitionssignal mit Kosten-, Verteilungs- und Marktwirkung.", [], ["eeg", "marktpraemie"]],
    ["marktpraemie", "Marktprämie", "Die Marktprämie ergänzt Markterlöse erneuerbarer Anlagen.", "Sie verbindet Förderung mit Marktintegration.", [], ["eeg", "capture-price"]],
    ["power-purchase-agreement", "Power Purchase Agreement / PPA", "Ein PPA ist ein langfristiger Stromliefervertrag zwischen Erzeuger und Abnehmer.", "Relevant für Finanzierung, Risikoallokation, Grünstrom und Investitionssicherheit.", ["PPA"], ["gruenstrom", "herkunftsnachweis"]],
    ["contracts-for-difference", "Contracts for Difference / CfD", "Contracts for Difference gleichen Differenzen zwischen Referenzpreis und Marktpreis aus.", "Sie können Investitionssicherheit schaffen, müssen aber fair ausgestaltet werden.", ["CfD"], ["strommarktdesign", "kapazitaetsmarkt"]],
    ["herkunftsnachweis", "Herkunftsnachweis", "Herkunftsnachweise dokumentieren die Herkunft von Strom aus erneuerbaren Quellen.", "Sie sind nicht identisch mit physischer Lieferung und brauchen Wirkungsprüfung.", [], ["gruenstrom", "scope-2"]],
    ["gruenstrom", "Grünstrom", "Grünstrom bezeichnet Strom aus erneuerbaren Quellen oder entsprechende Beschaffungsprodukte.", "Wirkung hängt von Zusätzlichkeit, Marktmodell, Herkunftsnachweisen und Systemintegration ab.", [], ["herkunftsnachweis", "erneuerbare-energien"]],
    ["strompreisbestandteile", "Strompreisbestandteile", "Strompreisbestandteile umfassen Beschaffung, Vertrieb, Netzentgelte, Steuern, Abgaben und Umlagen.", "Wichtig für soziale Verteilung, Akzeptanz und Wirkungssteuerung.", [], ["netzentgelt", "stromsteuer"]],
    ["konzessionsabgabe", "Konzessionsabgabe", "Die Konzessionsabgabe ist ein Entgelt für die Nutzung öffentlicher Wege durch Energieversorgungsnetze.", "Ein Strompreisbestandteil mit kommunaler Finanzierungswirkung.", [], ["strompreisbestandteile"]],
    ["stromsteuer", "Stromsteuer", "Die Stromsteuer ist eine Verbrauchsteuer auf Strom.", "Wirkung hängt von Ausnahmen, Entlastungen und Lenkungslogik ab.", [], ["strompreisbestandteile"]],
    ["offshore-netzumlage", "Offshore-Netzumlage", "Die Offshore-Netzumlage finanziert bestimmte Kosten der Offshore-Netzanbindung.", "Teil der Strompreisbestandteile mit Energiewende- und Verteilungswirkung.", [], ["offshore-windenergie", "strompreisbestandteile"]],
    ["messstellenbetrieb", "Messstellenbetrieb", "Messstellenbetrieb umfasst Einbau, Betrieb und Ablesung von Messeinrichtungen.", "Relevant für Smart Meter, Datenqualität, Tarife und Demand Response.", [], ["smart-meter", "dynamischer-stromtarif"]],
    ["smart-meter", "Smart Meter", "Smart Meter sind digitale Messsysteme für Energieverbrauch und Einspeisung.", "Sie ermöglichen Tarife und Flexibilität, brauchen Datenschutz, Sicherheit und faire Kostenverteilung.", [], ["messstellenbetrieb", "dynamischer-stromtarif"]],
    ["dynamischer-stromtarif", "Dynamischer Stromtarif", "Dynamische Stromtarife verändern Preise zeitlich nach Markt- oder Netzsignalen.", "Sie können Flexibilität aktivieren, aber auch soziale Risiken ohne Schutzmechanismen erzeugen.", [], ["demand-response", "smart-meter"]],
    ["smart-grid", "Smart Grid", "Smart Grid bezeichnet ein digital gesteuertes Stromnetz.", "Es kann Erzeugung, Speicher und Verbrauch besser koordinieren, braucht aber Datenschutz und Resilienz.", [], ["stromnetz", "smart-meter"]],
    ["sektorkopplung", "Sektorkopplung", "Sektorkopplung verbindet Strom, Wärme, Verkehr, Industrie und Gebäude, um erneuerbare Energie systemisch zu nutzen.", "Sie ist ein Systemhebel für Dekarbonisierung, Effizienz und Flexibilität.", [], ["waermepumpe", "elektromobilitaet", "power-to-x"]],
    ["waermepumpe", "Wärmepumpe", "Eine Wärmepumpe nutzt Umweltwärme und Strom, um Gebäude oder Prozesse zu heizen.", "Wirkung hängt von Strommix, Gebäudeeffizienz, Kosten, Netzen und sozialer Ausgestaltung ab.", [], ["sektorkopplung", "energieeffizienz"]],
    ["elektromobilitaet", "Elektromobilität", "Elektromobilität nutzt elektrische Antriebe für Verkehr.", "Wirkung hängt von Strom, Batterie, Rohstoffen, Fahrzeuggröße, Nutzung, Infrastruktur und Verkehrsvermeidung ab.", [], ["vehicle-to-grid", "batteriespeicher"]],
  ].map(([id, title, short, woek, aliases = [], related = []]) => addTerm(energyBase, { id, title, short, definition: short, woek, aliases, related, mythos: id === "kernenergie" ? "Kernenergie ist entweder völlig sauber oder völlig irrational." : id === "wasserstoff" ? "Wasserstoff ist eine Universallösung." : id === "stromgestehungskosten" ? "Die billigsten Gestehungskosten sind automatisch das billigste System." : "", woekKlaerung: id === "kernenergie" ? "Die WÖk bewertet nach Netto-Wirkung, Systemkosten, Risiken, Zeitpfad, Alternativen und demokratischer Stabilität." : id === "wasserstoff" ? "Wasserstoff ist ein Energieträger für passende Einsatzfelder, nicht Ersatz für direkte Elektrifizierung überall." : id === "stromgestehungskosten" ? "LCOE muss von Systemkosten unterschieden werden." : "" })),
];

const energySystemTerms = [
  ["energiewirtschaft", "Energiewirtschaft", "Energiewirtschaft umfasst Erzeugung, Umwandlung, Speicherung, Transport, Verteilung, Handel, Nutzung und Regulierung von Energie.", "Die Energiewirtschaft ist ein zentraler Wirkungsraum, weil Energie nahezu alle anderen Wirkungen ermöglicht oder begrenzt: Klima, Gesundheit, Preise, Versorgungssicherheit, Industrie, Digitalisierung, Mobilität, Wohnen, Pflege, Demokratie und geopolitische Abhängigkeiten.", [], ["energie", "strommarkt", "erneuerbare-energien", "fossiles-kraftwerk", "stromgestehungskosten", "systemkosten", "netzentgelt", "energiearmut", "energieautonomie", "buergerenergie", "versorgungssicherheit"], "connection", { mythos: "Energie ist ein normales Marktprodukt.", woekKlaerung: "Energie ist kritische Grundinfrastruktur. Sie kann über Märkte koordiniert werden, darf aber nicht ausschließlich als Ware verstanden werden.", blindSpot: "Eine Kilowattstunde ist physikalisch gleich, ihre Wirkung aber nicht: Herkunft, Zeit, Ort, Infrastruktur, Preis und Folgewirkungen verändern ihre gesellschaftliche Bedeutung." }],
  ["versorgungssicherheit", "Versorgungssicherheit", "Versorgungssicherheit beschreibt die verlässliche Verfügbarkeit von Energie in ausreichender Menge, Qualität und Zeit.", "Sie ist eine Wirkungsbedingung für Gesundheit, Pflege, Industrie, Verwaltung, Kommunikation, Bildung, Wasser, Wärme, Mobilität und demokratische Handlungsfähigkeit.", [], ["energiesicherheit", "gesicherte-leistung", "backup-kapazitaet", "dunkelflaute", "wirkungsresilienz"]],
  ["energiesicherheit", "Energiesicherheit", "Energiesicherheit beschreibt die Fähigkeit eines Energiesystems, Energieversorgung gegen technische, ökonomische, geopolitische oder klimatische Störungen abzusichern.", "Wirkungsökonomisch verbindet sie Versorgungssicherheit, Resilienz, Importabhängigkeiten, kritische Infrastruktur, Speicher, Netze und demokratische Stabilität.", [], ["versorgungssicherheit", "kritische-energieinfrastruktur", "energieautonomie", "geopolitik"]],
  ["energieautonomie", "Energieautonomie", "Energieautonomie beschreibt die Fähigkeit eines Haushalts, Unternehmens, einer Kommune oder Volkswirtschaft, Energie unabhängiger und kontrollierbarer bereitzustellen.", "Sie kann Resilienz und Demokratie stärken, ist aber nicht automatisch positiv: Kosten, Verteilungswirkung, Netzdienlichkeit und Systemintegration müssen mitbewertet werden.", [], ["buergerenergie", "kommunale-energie", "prosumer", "eigenversorgung", "energie-und-demokratie"], "precision", { mythos: "Autarkie ist immer besser als Vernetzung.", woekKlaerung: "Wirkungsökonomisch zählt resiliente Einbettung: lokale Erzeugung, Speicher und Netze müssen zusammenwirken." }],
  ["energieinfrastruktur", "Energieinfrastruktur", "Energieinfrastruktur umfasst Anlagen, Netze, Speicher, Messsysteme, Leitungen, Plattformen und Regeln, die Energie bereitstellen und nutzbar machen.", "Sie ist Wirkungsarchitektur, weil sie entscheidet, wer Zugang zu Wärme, Strom, Mobilität, Kommunikation und Produktion hat.", [], ["kritische-energieinfrastruktur", "stromnetz", "speicher-energie", "smart-grid", "ladeinfrastruktur"]],
  ["kritische-energieinfrastruktur", "Kritische Energieinfrastruktur", "Kritische Energieinfrastruktur umfasst Energieanlagen und -systeme, deren Ausfall erhebliche Folgen für Gesellschaft, Wirtschaft, Gesundheit oder Staat hätte.", "Relevant für Resilienz, Cybersecurity, Krisenfähigkeit, Demokratie, Versorgungssicherheit und geopolitische Risiken.", [], ["energieinfrastruktur", "versorgungssicherheit", "cyberresilienz", "wirkungsresilienz"]],
  ["kommunale-energie", "Kommunale Energie", "Kommunale Energie beschreibt Energieversorgung, Erzeugung, Netze, Wärmeplanung, Speicher und Beteiligung auf kommunaler Ebene.", "Kommunen sind zentrale Wirkungsorte, weil Energie dort in Wohnen, Mobilität, Daseinsvorsorge, Stadtwerken, Quartieren und sozialer Gerechtigkeit konkret wird.", [], ["stadtwerke", "buergerenergie", "quartiersenergie", "mieterstrom", "kommunale-waermeplanung"], "precision"],
  ["buergerenergie", "Bürgerenergie", "Bürgerenergie beschreibt Energieprojekte, an denen Bürger:innen finanziell, organisatorisch oder demokratisch beteiligt sind.", "Sie kann Teilhabe, Akzeptanz, lokale Wertschöpfung und Vertrauen stärken, braucht aber faire Zugangsmöglichkeiten, professionelle Governance und Wirkungstransparenz.", ["Bürger:innenenergie"], ["energieautonomie", "energiegemeinschaft", "genossenschaft", "stadtwerke"]],
  ["stadtwerke", "Stadtwerke", "Stadtwerke sind kommunal geprägte Versorgungsunternehmen, die häufig Strom, Wärme, Wasser, Verkehr oder digitale Infrastruktur betreiben.", "Sie können Energie als Daseinsvorsorge und Wirkungsinfrastruktur organisieren, brauchen aber ebenfalls Wirkungsprüfung, Transparenz und Investitionsfähigkeit.", [], ["kommunale-energie", "daseinsvorsorge", "waermenetze", "mieterstrom"]],
  ["energiegemeinschaft", "Energiegemeinschaft", "Eine Energiegemeinschaft organisiert gemeinschaftliche Erzeugung, Nutzung, Speicherung oder Verteilung von Energie.", "Sie kann Energie demokratisieren und lokale Resilienz stärken, muss aber Netzdienlichkeit, Zugangsgerechtigkeit, Datenqualität und Verantwortlichkeiten klären.", ["Energy Community"], ["buergerenergie", "eigenversorgung", "prosumer", "dezentralisierung"]],
  ["quartiersenergie", "Quartiersenergie", "Quartiersenergie betrachtet Erzeugung, Speicher, Wärme, Strom, Mobilität und Verbrauch in einem räumlichen Quartier.", "Relevant für Wärmewende, Mieterstrom, Ladeinfrastruktur, soziale Verteilung, Sanierung und kommunale Wirkungsplanung.", [], ["kommunale-energie", "mieterstrom", "waermepumpe", "waermespeicher"]],
  ["mieterstrom", "Mieterstrom", "Mieterstrom beschreibt Strom, der nahe an Mietgebäuden erzeugt und direkt an Bewohner:innen geliefert wird.", "Er kann Teilhabe an der Energiewende verbessern, braucht aber faire Verträge, Messkonzepte, Abrechnung, Gebäudeeigentum und Schutz vor Ausschluss.", [], ["quartiersenergie", "eigenversorgung", "prosumer", "stadtwerke"]],
  ["eigenversorgung", "Eigenversorgung", "Eigenversorgung beschreibt die Nutzung selbst erzeugter Energie durch dieselbe Person, Organisation oder Anlage.", "Sie kann Kosten senken und Resilienz stärken, muss aber netzdienlich, sozial fair und systemisch eingebettet sein.", [], ["prosumer", "energieautonomie", "heimspeicher", "mieterstrom"]],
  ["reservekraftwerk", "Reservekraftwerk", "Ein Reservekraftwerk steht bereit, um Strom in Engpass-, Krisen- oder Knappheitssituationen zu erzeugen.", "Wirkung hängt von Einsatzhäufigkeit, Brennstoff, Emissionen, Kosten, Standort, Versorgungssicherheit und Alternativen wie Speicher oder Demand Response ab.", [], ["backup-kapazitaet", "netzreserve", "strategische-reserve", "gesicherte-leistung"]],
  ["kraft-waerme-kopplung", "Kraft-Wärme-Kopplung", "Kraft-Wärme-Kopplung erzeugt Strom und nutzbare Wärme gemeinsam.", "KWK kann Brennstoff effizienter nutzen, bleibt aber je nach Brennstoff, Wärmebedarf, Laufzeit, Flexibilität und Transformationspfad wirkungsabhängig.", ["KWK"], ["thermisches-kraftwerk", "waermespeicher", "sektorkopplung"]],
  ["netzebene", "Netzebene", "Netzebenen unterscheiden Spannungsebenen im Stromnetz, etwa Niederspannung, Mittelspannung, Hochspannung und Höchstspannung.", "Sie erklären, warum Energiewendeprojekte unterschiedliche Anschluss-, Mess-, Kosten- und Steuerungsanforderungen haben.", [], ["niederspannung", "mittelspannung", "hochspannung", "hoechstspannung", "netzanschluss"], "method"],
  ["waermespeicher", "Wärmespeicher", "Ein Wärmespeicher nimmt Wärme auf und stellt sie zeitversetzt wieder bereit.", "Wärmespeicher sind wichtige Flexibilitätsbausteine für Wärmepumpen, Solarthermie, Quartiere, Industrie und Sektorkopplung.", [], ["solarthermie", "waermepumpe", "quartiersenergie", "sektorkopplung"]],
  ["redispatch-2-0", "Redispatch 2.0", "Redispatch 2.0 erweitert das Netzengpassmanagement auf weitere Erzeugungs- und Speicheranlagen im Verteilnetz.", "Relevant für dezentrale Energiewende, Datenqualität, Abregelung, Entschädigung, Netzbetrieb und Systemkosten.", [], ["redispatch", "verteilnetz", "abregelung"], "method"],
  ["stromnev", "StromNEV", "Die Stromnetzentgeltverordnung regelt Grundsätze zur Ermittlung von Netzentgelten im Strombereich.", "Sie ist relevant für Kostenverteilung, Netzentgeltsystematik, Standortsignale, Industrie, Haushalte und Energiewende-Anreize.", ["Stromnetzentgeltverordnung"], ["netzentgelt", "netzentgeltsystematik"], "method"],
  ["energiewirtschaftsgesetz", "Energiewirtschaftsgesetz / EnWG", "Das Energiewirtschaftsgesetz regelt zentrale Grundlagen der leitungsgebundenen Energieversorgung in Deutschland.", "Wirkungsökonomisch wichtig, weil es Markt, Netze, Versorgungssicherheit, Verbraucherrechte und Regulierung rahmt.", ["EnWG"], ["energiewirtschaft", "strommarkt", "netzanschluss"], "method"],
  ["smart-meter-gateway", "Smart Meter Gateway", "Ein Smart Meter Gateway ist die sichere Kommunikationseinheit eines intelligenten Messsystems.", "Relevant für Datenschutz, IT-Sicherheit, dynamische Tarife, Demand Response, Flexibilität und demokratische Kontrolle digitaler Energieinfrastruktur.", [], ["smart-meter", "messstellenbetrieb", "dynamischer-stromtarif"], "method"],
  ["flexibilitaetsmarkt", "Flexibilitätsmarkt", "Ein Flexibilitätsmarkt organisiert die Bereitstellung oder Vergütung flexibler Erzeugung, Speicherung oder Verbrauchsverschiebung.", "Er kann Netze entlasten und Systemkosten senken, braucht aber faire Teilnahme, klare Daten und Schutz vor Marktmacht.", [], ["demand-response", "lastmanagement", "speicher-energie", "netzdienlichkeit"], "method"],
  ["regelenergiemarkt", "Regelenergiemarkt", "Der Regelenergiemarkt organisiert Beschaffung und Vergütung von Regelenergie zur Stabilisierung des Stromsystems.", "Relevant für Versorgungssicherheit, Speicher, Demand Response, Marktzugang und Systemdienstleistungen.", [], ["regelenergie", "systemdienstleistungen", "batteriespeicher"], "method"],
  ["kapazitaetsreserve", "Kapazitätsreserve", "Eine Kapazitätsreserve hält gesicherte Leistung außerhalb des regulären Strommarkts für besondere Knappheitssituationen vor.", "Sie kann Versorgungssicherheit stärken, muss aber Kosten, Emissionen, Einsatzlogik und Lock-in-Risiken offenlegen.", [], ["kapazitaetsmarkt", "reservekraftwerk", "gesicherte-leistung"], "method"],
  ["strategische-reserve", "Strategische Reserve", "Eine strategische Reserve hält Kraftwerks- oder Speicherleistung für außergewöhnliche Versorgungssituationen vor.", "Wirkung hängt von Governance, Kosten, Einsatzregeln, Transparenz und Alternativen ab.", [], ["kapazitaetsreserve", "reservekraftwerk", "versorgungssicherheit"], "method"],
  ["netzreserve", "Netzreserve", "Die Netzreserve hält Anlagen bereit, um Netzstabilität und Versorgungssicherheit in besonderen Situationen zu unterstützen.", "Sie ist ein Instrument gegen Netzengpässe und Versorgungslücken, verursacht aber Kosten und muss mit Netzausbau, Flexibilität und Speicher verglichen werden.", [], ["reservekraftwerk", "netzengpass", "redispatch"], "method"],
].map(([id, title, short, woek, aliases = [], related = [], concept = "connection", extra = {}]) => addTerm(energyBase, {
  id,
  title,
  short,
  definition: `${short} ${extra.definition || ""}`.trim(),
  woek,
  aliases,
  related,
  concept,
  mythos: extra.mythos || "",
  woekKlaerung: extra.woekKlaerung || "",
  blindSpot: extra.blindSpot || "Wenn Energie nur technisch oder preislich betrachtet wird, bleiben soziale, demokratische, infrastrukturelle und geopolitische Folgewirkungen unsichtbar.",
  usage: "Energie als Wirkungsinfrastruktur behandeln: Erzeugung, Netze, Speicher, Preise, Resilienz, Teilhabe und Folgewirkungen zusammen bewerten.",
}));

function batteryInfraTerm([id, title, short, woek, aliases = [], related = [], concept = "connection", extra = {}]) {
  return addTerm(batteryInfrastructureBase, {
    id,
    title,
    short,
    definition: `${short} ${extra.definition || ""}`.trim(),
    woek,
    aliases,
    related,
    concept,
    mythos: extra.mythos || "",
    woekKlaerung: extra.woekKlaerung || "",
    blindSpot: extra.blindSpot || "Ohne Daten zu Rohstoffen, Lebensdauer, Nutzung, Sicherheit, Rückführung und Systemkosten bleibt die Wirkung unvollständig sichtbar.",
    statusNote: extra.statusNote || "",
    usage: "Nicht als automatisch positive Energiewende-Technik darstellen; Rohstoffe, Lieferketten, Netze, Kreislauf, Teilhabe und Systemkosten mitprüfen.",
  });
}

const batteryInfrastructureTerms = [
  ["batterie", "Batterie", "Eine Batterie ist ein elektrochemischer Speicher, der elektrische Energie chemisch speichert und bei Bedarf wieder abgibt.", "Batterien sind zentrale Infrastruktur der Energiewende, aber nur vollständig bewertbar über Rohstoffe, Herstellung, Nutzung, Sicherheit, Lebensdauer, Second Life, Recycling und Systemintegration.", [], ["speicher-energie", "lithium-ionen-batterie", "natrium-ionen-batterie", "feststoffbatterie", "batterierecycling", "second-life-batterie", "batteriepass"], "connection", { mythos: "Batterien sind automatisch sauber, sobald sie fossile Energie ersetzen.", woekKlaerung: "Batterien können positive Wirkung ermöglichen, brauchen aber Rohstoff-, Lieferketten-, Lebensdauer-, Sicherheits- und Recyclingprüfung." }],
  ["akkumulator", "Akkumulator / Akku", "Ein Akkumulator ist eine wiederaufladbare Batterie.", "Der Begriff ist wichtig, um wiederaufladbare Speicher von Primärbatterien abzugrenzen und Nutzungsdauer, Ladezyklen und Rückführung zu bewerten.", ["Akku", "Akkumulator"], ["batterie", "zyklenfestigkeit"]],
  ["batteriezelle", "Batteriezelle", "Die Batteriezelle ist die kleinste elektrochemische Einheit einer Batterie.", "Zellchemie, Qualität und Herkunft prägen Sicherheit, Lebensdauer, Rohstoffwirkung und Recyclingfähigkeit.", [], ["batteriemodul", "batteriepack", "batterierohstoffe"]],
  ["batteriemodul", "Batteriemodul", "Ein Batteriemodul besteht aus mehreren zusammengeschalteten Batteriezellen.", "Module beeinflussen Reparierbarkeit, Austauschbarkeit, Second-Life-Potenzial und Demontage.", [], ["batteriezelle", "batteriepack", "modularitaet"]],
  ["batteriepack", "Batteriepack", "Ein Batteriepack ist die vollständige Batterieeinheit aus Zellen, Modulen, Gehäuse, Kühlung, Elektronik und Batteriemanagementsystem.", "Das Pack entscheidet über Sicherheit, thermische Führung, Datenqualität, Reparatur, Rückbau und Kreislaufwirkung.", [], ["batteriemodul", "batteriemanagementsystem", "thermal-runaway"]],
  ["batteriemanagementsystem", "Batteriemanagementsystem / BMS", "Ein Batteriemanagementsystem überwacht und steuert Batterieparameter wie Spannung, Temperatur, Ladezustand und Sicherheit.", "BMS-Daten sind relevant für Lebensdauer, Sicherheit, Second Life, Batteriepass, Restwert und Kreislaufwirkung.", ["BMS"], ["state-of-charge", "state-of-health", "batteriepass", "second-life-batterie"], "method"],
  ["state-of-charge", "State of Charge / SOC", "State of Charge beschreibt den aktuellen Ladezustand einer Batterie.", "SOC ist relevant für Betrieb, Ladeplanung, Sicherheit, Smart Charging und Nutzervertrauen.", ["SOC", "Ladezustand"], ["batteriemanagementsystem", "ladeleistung"]],
  ["state-of-health", "State of Health / SOH", "State of Health beschreibt den Gesundheitszustand und die verbleibende Leistungsfähigkeit einer Batterie.", "SOH ist zentral für Second Life, Restwert, Sicherheitsbewertung, Batteriepass und Kreislaufwirtschaft.", ["SOH", "Batteriegesundheit"], ["batteriepass", "second-life-batterie", "batteriealterung"]],
  ["c-rate", "C-Rate", "Die C-Rate beschreibt, wie schnell eine Batterie im Verhältnis zu ihrer Kapazität geladen oder entladen wird.", "C-Rate beeinflusst Ladezeit, Wärme, Alterung, Sicherheit und Auslegung von Ladeinfrastruktur.", ["C Rate"], ["ladeleistung", "batteriealterung"]],
  ["energiedichte", "Energiedichte", "Energiedichte beschreibt, wie viel Energie pro Masse oder Volumen gespeichert werden kann.", "Sie prägt Fahrzeugreichweite, Materialbedarf, Gewicht, Flächenbedarf und Einsatzfelder.", [], ["lithium-ionen-batterie", "leistungsdichte"]],
  ["leistungsdichte", "Leistungsdichte", "Leistungsdichte beschreibt, wie viel Leistung pro Masse oder Volumen abgegeben oder aufgenommen werden kann.", "Relevant für Schnellladen, Netzstabilisierung, Rekuperation und Leistungsspitzen.", [], ["energiedichte", "superkondensator", "hpc-charger"]],
  ["zyklenfestigkeit", "Zyklenfestigkeit", "Zyklenfestigkeit beschreibt, wie viele Lade- und Entladezyklen eine Batterie übersteht, bevor ihre Leistungsfähigkeit deutlich sinkt.", "Hohe Zyklenfestigkeit kann Lebensdauer, Kreislaufwirkung und Wirtschaftlichkeit verbessern.", [], ["batteriealterung", "degradation-batterie"]],
  ["batteriealterung", "Batteriealterung", "Batteriealterung beschreibt den Verlust von Kapazität, Leistung oder Sicherheit über Zeit und Nutzung.", "Alterung entscheidet über Garantie, Second Life, Restwert, Sicherheit und Ressourcenbedarf.", [], ["state-of-health", "degradation-batterie"]],
  ["degradation-batterie", "Degradation", "Degradation beschreibt die schrittweise Verschlechterung einer Batterie durch Alterung, Nutzung, Temperatur oder Ladeverhalten.", "Degradation ist ein Wirkungsfaktor, weil sie Ersatzbedarf, Kosten, Rohstoffnachfrage und Second-Life-Fähigkeit beeinflusst.", ["Batteriedegradation"], ["batteriealterung", "state-of-health"]],
  ["thermal-runaway", "Thermal Runaway", "Thermal Runaway beschreibt eine sich selbst verstärkende Überhitzung einer Batterie, die zu Brand oder Explosion führen kann.", "Thermal Runaway ist ein Sicherheits- und Wirkungsrisiko für Ladeparks, Speicher, Transport, Versicherung, Genehmigung und Rettungskonzepte.", [], ["batteriemanagementsystem", "schutztechnik", "ladepark"], "connection", { blindSpot: "Sicherheitsrisiken werden oft erst bei Genehmigung, Versicherung oder Einsatzkräften sichtbar." }],
  ["batterierohstoffe", "Batterierohstoffe", "Batterierohstoffe sind Materialien für Batterien, etwa Lithium, Nickel, Kobalt, Mangan, Eisen, Phosphat, Graphit, Natrium oder Aluminium.", "Sie sind zentral für Lieferkettenwirkung, Rohstoffabhängigkeit, Arbeitsbedingungen, Biodiversität, Wasser und Recycling.", [], ["kritische-rohstoffe", "lithium-ionen-batterie", "batterierecycling", "lieferkette"]],
  ["lithium-ionen-batterie", "Lithium-Ionen-Batterie", "Lithium-Ionen-Batterien sind wiederaufladbare Batterien, bei denen Lithium-Ionen zwischen den Elektroden wandern.", "Sie sind zentral für heutige Elektromobilität und viele Speicheranwendungen; Wirkung hängt von Chemie, Rohstoffen, Herstellung, Nutzung, Recycling und Sicherheitsarchitektur ab.", [], ["lfp-batterie", "nmc-batterie", "nca-batterie", "batterierohstoffe"]],
  ["lfp-batterie", "LFP-Batterie", "LFP-Batterien sind Lithium-Ionen-Batterien mit Lithium-Eisenphosphat als Kathodenmaterial.", "Relevant wegen Rohstoffprofil, Lebensdauer, Sicherheit, Kostenstruktur und Recycling; auch LFP braucht Rohstoff-, Energie- und Kreislaufbewertung.", ["Lithium-Eisenphosphat-Batterie", "LiFePO4"], ["lithium-ionen-batterie", "batterierecycling"]],
  ["nmc-batterie", "NMC-Batterie", "NMC-Batterien sind Lithium-Ionen-Batterien mit Nickel, Mangan und Kobalt in der Kathode.", "Relevant für Energiedichte und Elektromobilität, aber besonders wirkungssensibel wegen Nickel- und Kobalt-Lieferketten.", ["Nickel-Mangan-Cobalt-Batterie"], ["lithium-ionen-batterie", "kritische-rohstoffe"]],
  ["nca-batterie", "NCA-Batterie", "NCA-Batterien sind Lithium-Ionen-Batterien mit Nickel, Cobalt und Aluminium in der Kathode.", "NCA ist energiedicht, aber rohstoff- und sicherheitsrelevant und daher wirkungsökonomisch entlang der Lieferkette zu prüfen.", ["Nickel-Cobalt-Aluminium-Batterie"], ["lithium-ionen-batterie", "kritische-rohstoffe"]],
  ["lithium-titanat-batterie", "Lithium-Titanat-Batterie / LTO", "Lithium-Titanat-Batterien nutzen Lithium-Titanat als Anodenmaterial.", "LTO kann hohe Zyklenfestigkeit und Schnellladefähigkeit bieten, muss aber nach Energiedichte, Kosten, Rohstoffen und Einsatzfeld bewertet werden.", ["LTO"], ["lithium-ionen-batterie", "zyklenfestigkeit"]],
  ["natrium-ionen-batterie", "Natrium-Ionen-Batterie", "Natrium-Ionen-Batterien sind wiederaufladbare Batterien, bei denen Natrium-Ionen als Ladungsträger genutzt werden.", "Sie sind eine mögliche Ergänzung zu Lithium-Ionen-Batterien, vor allem wegen Rohstoffverfügbarkeit und stationärer Anwendungen; Wirkung hängt von Energiedichte, Lebensdauer, Kosten, Materialeinsatz, Sicherheit und Skalierung ab.", [], ["batterie", "stationaerer-batteriespeicher"]],
  ["feststoffbatterie", "Feststoffbatterie", "Feststoffbatterien nutzen einen festen Elektrolyten statt eines flüssigen oder gelartigen Elektrolyten.", "Zukunftstechnologie mit potenzieller Wirkung auf Sicherheit, Energiedichte und Lebensdauer; nicht als heutige Standardlösung darstellen.", ["Solid-State Battery", "Festkörperbatterie"], ["lithium-ionen-batterie", "energiedichte"], "connection", { mythos: "Feststoffbatterien lösen kurzfristig alle Batterieprobleme.", woekKlaerung: "Sie sind ein wichtiges Innovationsfeld, aber Wirkung entsteht erst mit belastbarer Skalierung, Lebensdauer, Sicherheit und Kreislaufpfad." }],
  ["redox-flow-batterie", "Redox-Flow-Batterie", "Redox-Flow-Batterien speichern Energie in flüssigen Elektrolyten, die durch eine elektrochemische Zelle gepumpt werden.", "Besonders relevant für stationäre Speicher; Bewertung über Materialeinsatz, Skalierung, Standort, Lebensdauer und Kreislauffähigkeit.", [], ["stationaerer-batteriespeicher", "speicher-energie"]],
  ["blei-saeure-batterie", "Blei-Säure-Batterie", "Blei-Säure-Batterien sind wiederaufladbare Batterien mit Blei und Schwefelsäure.", "Historisch und industriell relevant, aber wirkungssensibel wegen Blei, Gesundheit, Recycling und Sicherheitsanforderungen.", [], ["batterierecycling", "kritische-rohstoffe"]],
  ["superkondensator", "Superkondensator", "Ein Superkondensator speichert Energie elektrostatisch und kann sehr schnell laden und entladen.", "Kein klassischer Batteriespeicher; relevant für Leistungsspitzen, Rekuperation und Spezialanwendungen.", [], ["leistungsdichte", "speicher-energie"]],
  ["stationaerer-batteriespeicher", "Stationärer Batteriespeicher", "Ein stationärer Batteriespeicher speichert Strom an einem festen Standort, etwa in Haushalten, Ladeparks, Industrie, Quartieren oder Netzsystemen.", "Relevant für Eigenverbrauch, Netzdienlichkeit, Flexibilität, Lastspitzenreduktion, Strommarktdesign und Systemkosten.", [], ["batteriespeicher", "heimspeicher", "gewerbespeicher", "netzspeicher"]],
  ["heimspeicher", "Heimspeicher", "Ein Heimspeicher ist ein Batteriespeicher in Wohngebäuden oder kleinen Prosumer-Anlagen.", "Er kann Eigenverbrauch und Resilienz stärken, wirft aber Fragen nach Kostenverteilung, Rohstoffen, Brandschutz und Netzdienlichkeit auf.", [], ["prosumer", "stationaerer-batteriespeicher"]],
  ["gewerbespeicher", "Gewerbespeicher", "Ein Gewerbespeicher ist ein stationärer Speicher für Betriebe, Ladeinfrastruktur oder Quartiere.", "Relevant für Lastspitzen, Leistungspreise, Eigenverbrauch, Notstrom, Netzdienlichkeit und Wirtschaftlichkeit.", [], ["stationaerer-batteriespeicher", "leistungspreis"]],
  ["netzspeicher", "Netzspeicher", "Ein Netzspeicher wird zur Stabilisierung, Entlastung oder Flexibilisierung des Stromsystems eingesetzt.", "Er kann Systemkosten senken, muss aber nach Standort, Marktrolle, Regulierung und Verteilungswirkung bewertet werden.", [], ["systemkosten", "netzdienlichkeit"]],
  ["pufferspeicher-ladepark", "Pufferspeicher im Ladepark", "Ein Pufferspeicher im Ladepark speichert Energie lokal, um Lastspitzen zu senken, Ladeleistung bereitzustellen oder Netzanschlussleistung zu begrenzen.", "Wichtig für HPC-Standorte, Netzentgelte, Baukostenzuschüsse, Mittelspannungsanschluss und Demand Response.", [], ["ladepark", "hpc-charger", "netzanschlussleistung"]],
  ["batteriepass", "Batteriepass", "Ein Batteriepass ist ein digitaler Datensatz zu Herkunft, Zusammensetzung, CO2-Fußabdruck, Leistung, Nutzung, Sicherheit und Kreislauf einer Batterie.", "Zentrale Dateninfrastruktur für Wirkungsdaten, Second Life, Recycling, Lieferkettenverantwortung, EU-Batterieverordnung und WÖk-Scorecards.", [], ["digitaler-produktpass", "batterielebenszyklus", "state-of-health", "batterierecycling"], "method"],
  ["batterielebenszyklus", "Batterielebenszyklus", "Der Batterielebenszyklus umfasst Rohstoffgewinnung, Herstellung, Nutzung, Alterung, Second Life, Recycling und Entsorgung.", "Er verbindet Produktwirkung, Lieferkette, Klimawirkung, Sicherheit, Kreislaufwirtschaft und Rückführung.", [], ["batteriepass", "batterierecycling", "second-life-batterie"]],
  ["second-life-batterie", "Second-Life-Batterie", "Eine Second-Life-Batterie wird nach ihrer ersten Nutzung, etwa im Fahrzeug, in einer zweiten Anwendung weiterverwendet.", "Second Life kann Kreislaufwirkung erhöhen, wenn Sicherheit, Restkapazität, Datenqualität, Wirtschaftlichkeit und Rückführung gesichert sind.", ["Second Life Batterie", "Second Life"], ["state-of-health", "batteriepass", "stationaerer-batteriespeicher", "batterierecycling"], "connection", { mythos: "Second Life ist automatisch besser als Recycling.", woekKlaerung: "Second Life braucht Sicherheits-, Restwert-, Daten- und Rückführungspfad; sonst verschiebt es Risiken nur zeitlich." }],
  ["batterierecycling", "Batterierecycling", "Batterierecycling beschreibt die Rückgewinnung von Materialien aus Altbatterien oder Produktionsausschuss.", "Zentral für Rohstoffsicherheit, Kreislaufwirtschaft, Umweltwirkung und strategische Autonomie; ersetzt aber nicht Rohstoffvermeidung, Lebensdauerverlängerung und gutes Design.", [], ["black-mass", "pyrometallurgie", "hydrometallurgie", "direktrecycling-batterie", "batteriepass"], "connection", { mythos: "Recycling löst das Batterieproblem vollständig.", woekKlaerung: "Recycling ist wichtig, aber nach Lebensdauer, Reparierbarkeit, Second Life, Design und Materialvermeidung einzuordnen." }],
  ["black-mass", "Black Mass", "Black Mass ist ein Zwischenprodukt des Batterierecyclings mit aktiven Materialien wie Lithium, Nickel, Kobalt, Mangan oder Graphit.", "Black Mass macht Rohstoffrückgewinnung sichtbar, sagt aber allein noch nichts über Recyclingeffizienz, Herkunft, Umweltlast oder Wiedereinsatz aus.", [], ["batterierecycling", "kritische-rohstoffe"]],
  ["pyrometallurgie", "Pyrometallurgie", "Pyrometallurgie nutzt hohe Temperaturen zur Rückgewinnung von Metallen.", "Relevant für Batterierecycling, aber wirkungssensibel wegen Energieeinsatz, Emissionen und Materialausbeute.", [], ["batterierecycling", "hydrometallurgie"]],
  ["hydrometallurgie", "Hydrometallurgie", "Hydrometallurgie nutzt wässrige chemische Verfahren zur Rückgewinnung von Metallen.", "Kann höhere Ausbeuten ermöglichen, muss aber Chemikalien, Abwasser, Energie und Prozesssicherheit berücksichtigen.", [], ["batterierecycling", "pyrometallurgie"]],
  ["direktrecycling-batterie", "Direktrecycling", "Direktrecycling versucht Batteriematerialien möglichst strukturerhaltend zurückzugewinnen, statt sie vollständig in Grundstoffe zu zerlegen.", "Potenzial für höheren Werterhalt, aber abhängig von Zellchemie, Sortierung, Datenqualität und industrieller Skalierung.", ["Direktrecycling Batterie"], ["batterierecycling", "werterhalt"]],
  ["recyclingeffizienz", "Recyclingeffizienz", "Recyclingeffizienz beschreibt, welcher Anteil eines Materials oder Wertstoffs im Recyclingprozess tatsächlich zurückgewonnen wird.", "Wichtig für WÖk-Scorecards, weil Sammelquote allein keine tatsächliche Rückgewinnung belegt.", [], ["batterierecycling", "rezyklatquote-batterie", "recyclingquote"]],
  ["rezyklatquote-batterie", "Rezyklatquote Batterie", "Die Rezyklatquote beschreibt den Anteil zurückgewonnener Materialien, der wieder in neuen Batterien eingesetzt wird.", "Sie verbindet Kreislaufversprechen mit realer Materialrückführung und Datenqualität.", [], ["batterierecycling", "rezyklatanteil"]],
  ["kritische-rohstoffe", "Kritische Rohstoffe", "Kritische Rohstoffe sind Rohstoffe mit hoher wirtschaftlicher Bedeutung und erhöhtem Versorgungsrisiko.", "Relevant für Batterien, Windkraft, Solar, Halbleiter, Energieinfrastruktur und geopolitische Wirkung.", [], ["batterierohstoffe", "rohstoffkritikalitaet", "lieferkette"]],
  ["urban-mining-batterien", "Urban Mining Batterien", "Urban Mining bei Batterien beschreibt die Rückgewinnung wertvoller Materialien aus gebrauchten Batterien und Produktionsabfällen.", "Es macht Altbatterien und Produktionsausschuss als Rohstoffquelle sichtbar, braucht aber Sammel-, Sortier-, Sicherheits- und Recyclinginfrastruktur.", [], ["urban-mining", "batterierecycling"]],
  ["ladeinfrastruktur", "Ladeinfrastruktur", "Ladeinfrastruktur umfasst alle technischen, baulichen, netzseitigen, digitalen und organisatorischen Komponenten zum Laden von Elektrofahrzeugen.", "Sie ist Wirkungsarchitektur für Mobilität, Stromsystem, Netze, Flächen, Preise, Teilhabe und Versorgungssicherheit.", [], ["ladepunkt", "ladepark", "ac-laden", "dc-laden", "hpc-charger"], "connection", { mythos: "Ladeinfrastruktur ist nur eine Frage der Anzahl von Ladesäulen.", woekKlaerung: "Entscheidend sind Netzanschluss, Leistung, Standort, Zugang, Preise, Abrechnung, Daten, Wartung und soziale Teilhabe." }],
  ["ladepunkt", "Ladepunkt", "Ein Ladepunkt ist eine Einrichtung, an der jeweils ein Elektrofahrzeug geladen werden kann.", "Die Zahl der Ladepunkte sagt wenig ohne Leistung, Verfügbarkeit, Standort, Preis, Zugang und Netzintegration.", [], ["ladeinfrastruktur", "ladesaeule"]],
  ["ladeeinrichtung", "Ladeeinrichtung", "Eine Ladeeinrichtung steuert den Ladeprozess und überträgt elektrische Energie zwischen Stromnetz und Fahrzeug.", "Technik, Normen, Messung, Backend und Wartung prägen Nutzervertrauen und Systemwirkung.", [], ["ladepunkt", "wallbox", "hpc-charger"]],
  ["ladesaeule", "Ladesäule", "Eine Ladesäule ist eine öffentlich oder privat zugängliche Ladeeinrichtung für Elektrofahrzeuge.", "Wirkung hängt von Standort, Ladeleistung, Zugänglichkeit, Abrechnung, Strombezug und Auslastung ab.", [], ["ladepunkt", "ladeinfrastruktur"]],
  ["wallbox", "Wallbox", "Eine Wallbox ist eine Ladeeinrichtung für Elektrofahrzeuge, meist an Wohngebäuden oder Betrieben.", "Sie kann Alltagstauglichkeit stärken, braucht aber sichere Installation, Lastmanagement und faire Zugangsmöglichkeiten.", [], ["ac-laden", "ladeeinrichtung"]],
  ["ladepark", "Ladepark", "Ein Ladepark ist ein Standort mit mehreren Ladepunkten, häufig mit eigener Netzanschlussleistung, Lastmanagement, Trafo, Abrechnung und ggf. Pufferspeicher.", "Ladeparks verbinden Mobilität, Netzanschluss, Mittelspannung, Geschäftsmodell, Flächenwirkung und Preiszugang.", [], ["hpc-charger", "pufferspeicher-ladepark", "ladepark-mittelspannungsanschluss"]],
  ["ladehub", "Ladehub", "Ein Ladehub ist ein größerer Ladeinfrastrukturstandort, häufig an Verkehrsknoten, Logistikstandorten oder Autobahnen.", "Relevant für Flotten, Fernverkehr, Netzanschluss, Aufenthaltsqualität und Standortgerechtigkeit.", [], ["ladepark", "megawatt-charging-system"]],
  ["depotladen", "Depotladen", "Depotladen beschreibt das Laden von Fahrzeugflotten an Betriebshöfen oder Depots, etwa für Busse, Lkw, Lieferflotten oder kommunale Fahrzeuge.", "Wichtig für planbare Elektrifizierung, Lastmanagement, Mittelspannung, Betriebskosten und öffentliche Daseinsvorsorge.", [], ["ladehub", "megawatt-charging-system", "dynamisches-lastmanagement"]],
  ["ac-laden", "AC-Laden", "AC-Laden ist Laden mit Wechselstrom; die Umwandlung in Gleichstrom erfolgt im Fahrzeug über den On-Board-Charger.", "Geeignet für längere Standzeiten zuhause, im Quartier, am Arbeitsplatz oder im Depot; meist geringere Infrastrukturleistung als DC-Laden.", ["Wechselstromladen"], ["on-board-charger", "typ-2-stecker", "wallbox"]],
  ["dc-laden", "DC-Laden", "DC-Laden ist Laden mit Gleichstrom; die Umwandlung erfolgt in der Ladeeinrichtung, sodass die Batterie direkt mit Gleichstrom geladen wird.", "DC-Laden ermöglicht höhere Ladeleistungen, erfordert aber stärkere Infrastruktur, Leistungselektronik und Netzanschlussprüfung.", ["Gleichstromladen"], ["hpc-charger", "ccs-ladestecker"]],
  ["hpc-charger", "HPC-Charger", "Ein HPC-Charger ist ein DC-Schnelllader mit hoher Ladeleistung, der kurze Ladezeiten ermöglichen soll.", "HPC ist ein Netzanschluss-, Mittelspannungs-, Trafo-, Lastmanagement- und Geschäftsmodellthema; Wirkung entsteht über Ladezugang, Netzbelastung, Speicher, Flächen, Netzentgelte und Nutzergruppen.", ["High Power Charger", "High-Power-Charging", "HPC-Lader", "Ultraschnelllader"], ["dc-laden", "ladepark", "mittelspannung", "pufferspeicher-ladepark"], "connection", { mythos: "HPC ist einfach nur eine besonders schnelle Ladesäule.", woekKlaerung: "HPC braucht Netzanschlussleistung, Umspannung, Schutztechnik, Messung, Lastmanagement, Kostenlogik und Standortbewertung." }],
  ["schnellladen", "Schnellladen", "Schnellladen beschreibt Ladevorgänge mit hoher Ladeleistung und kürzeren Ladezeiten.", "Nützlich für Fernverkehr und Flotten, aber wirkungssensibel bei Netzanschluss, Batteriealterung, Kosten und Standort.", [], ["dc-laden", "hpc-charger"]],
  ["normalladen", "Normalladen", "Normalladen beschreibt Laden mit niedrigerer Ladeleistung über längere Standzeiten.", "Kann netz- und batterieschonend sein, wenn Standzeiten, Tarife und Lastmanagement passen.", [], ["ac-laden", "smart-charging"]],
  ["megawatt-charging-system", "Megawatt Charging System / MCS", "MCS ist ein Hochleistungsladestandard für schwere Nutzfahrzeuge mit sehr hoher Ladeleistung.", "Relevant für Lkw, Logistik, Depotladen, Mittelspannung, Netzanschlussleistung und Strommarktdesign.", ["MCS"], ["depotladen", "ladehub", "mittelspannung"]],
  ["ccs-ladestecker", "CCS", "CCS ist ein Ladesteckersystem für AC- und DC-Laden, in Europa insbesondere als Combo 2 für DC-Schnellladen verbreitet.", "Standards beeinflussen Interoperabilität, Wettbewerb, Nutzerzugang und Infrastrukturkosten.", ["Combined Charging System", "Combo 2"], ["dc-laden", "hpc-charger", "typ-2-stecker"]],
  ["typ-2-stecker", "Typ-2-Stecker", "Der Typ-2-Stecker ist ein in Europa verbreiteter Standard für AC-Laden.", "Interoperable Steckersysteme reduzieren Zugangshürden und Fehlinvestitionen.", [], ["ac-laden", "wallbox"]],
  ["chademo", "CHAdeMO", "CHAdeMO ist ein DC-Ladestandard, der in Europa vor allem historisch relevant ist.", "Als Backlog-/Altstandard wichtig für Kompatibilität, Bestand und Übergangskosten.", [], ["dc-laden"], "connection", { statusNote: "Backlog / historisch relevant" }],
  ["on-board-charger", "On-Board-Charger", "Der On-Board-Charger ist das Ladegerät im Fahrzeug, das beim AC-Laden Wechselstrom in Gleichstrom umwandelt.", "Er begrenzt AC-Ladeleistung und beeinflusst Alltagstauglichkeit, Kosten und Ladeinfrastrukturbedarf.", [], ["ac-laden", "ladeleistung"]],
  ["ladeleistung", "Ladeleistung", "Ladeleistung beschreibt die elektrische Leistung, mit der ein Fahrzeug oder Speicher geladen wird.", "Sie beeinflusst Ladezeit, Netzanschluss, Batteriealterung, Kosten, Gleichzeitigkeit und Nutzererlebnis.", [], ["anschlussleistung", "c-rate", "hpc-charger"]],
  ["anschlussleistung", "Anschlussleistung", "Anschlussleistung ist die maximale Leistung, die ein Netzanschluss bereitstellen oder aufnehmen kann.", "Sie begrenzt Ladeparks, Speicher, Gewerbe und PV und prägt Kosten, Baukostenzuschüsse und Netzausbau.", [], ["netzanschlussleistung", "baukostenzuschuss"]],
  ["gleichzeitigkeit-ladeinfrastruktur", "Gleichzeitigkeit", "Gleichzeitigkeit beschreibt, wie viele Ladepunkte oder Verbraucher gleichzeitig ihre maximale Leistung abrufen.", "Zentral für Netzanschlussdimensionierung, Lastmanagement und Kosten.", ["Gleichzeitigkeit Ladeinfrastruktur"], ["dynamisches-lastmanagement", "netzanschlussleistung"]],
  ["dynamisches-lastmanagement", "Dynamisches Lastmanagement", "Dynamisches Lastmanagement verteilt verfügbare Leistung flexibel auf mehrere Ladepunkte oder Verbraucher.", "Es kann Netzanschlusskosten senken, Lastspitzen vermeiden und Ladezugang fairer organisieren.", [], ["lastmanagement", "gleichzeitigkeit-ladeinfrastruktur", "smart-charging"]],
  ["energiemanagementsystem", "Energiemanagementsystem / EMS", "Ein Energiemanagementsystem steuert Erzeugung, Verbrauch, Speicher und Ladeprozesse.", "EMS ist ein Wirkungshebel für Eigenverbrauch, Netzdienlichkeit, Kosten, CO2-Steuerung und Datenqualität.", ["EMS"], ["smart-charging", "stationaerer-batteriespeicher"]],
  ["smart-charging", "Smart Charging", "Smart Charging steuert Ladevorgänge zeitlich oder leistungsmäßig, um Kosten, Netzbelastung oder Emissionen zu reduzieren.", "Kann Flexibilität schaffen, braucht aber transparente Tarife, Datenschutz, Nutzerkontrolle und faire Verteilung.", [], ["dynamischer-stromtarif", "dynamisches-lastmanagement", "vehicle-to-grid"]],
  ["bidirektionales-laden", "Bidirektionales Laden", "Bidirektionales Laden ermöglicht, dass ein Fahrzeug nicht nur Strom aufnimmt, sondern auch zurückspeisen oder lokal bereitstellen kann.", "Potenzial für Flexibilität und Resilienz, aber abhängig von Standards, Batteriealterung, Garantie, Tarifen und Nutzerakzeptanz.", [], ["vehicle-to-grid", "vehicle-to-home", "vehicle-to-load"]],
  ["vehicle-to-home", "Vehicle-to-Home", "Vehicle-to-Home nutzt die Fahrzeugbatterie zur Versorgung eines Gebäudes.", "Relevant für Eigenverbrauch, Resilienz, Notstrom und Kostensteuerung, aber abhängig von Technik, Recht und Batteriealterung.", ["V2H"], ["bidirektionales-laden", "heimspeicher"]],
  ["vehicle-to-load", "Vehicle-to-Load", "Vehicle-to-Load stellt Strom aus der Fahrzeugbatterie direkt für Geräte oder mobile Anwendungen bereit.", "Nützlich für Baustellen, Krisenfälle und mobile Versorgung, aber kein Ersatz für systemische Netzspeicher.", ["V2L"], ["bidirektionales-laden"]],
  ["eichrecht-ladeinfrastruktur", "Eichrecht Ladeinfrastruktur", "Eichrechtliche Anforderungen stellen sicher, dass geladene Energiemengen korrekt gemessen, abgerechnet und nachvollziehbar dargestellt werden.", "Wichtig für Vertrauen, Verbraucherschutz, faire Abrechnung und demokratische Kontrollierbarkeit von Ladepreisen.", [], ["wandlermessung", "arbeitspreis", "ladepunktbetreiber"], "method"],
  ["roaming-ladeinfrastruktur", "Roaming Ladeinfrastruktur", "Roaming ermöglicht Nutzer:innen, Ladepunkte verschiedener Betreiber über gemeinsame Zugangs- und Abrechnungssysteme zu nutzen.", "Roaming beeinflusst Wettbewerb, Zugang, Preistransparenz und Marktmacht.", [], ["ladepunktbetreiber", "elektromobilitaetsdienstleister"]],
  ["ad-hoc-laden", "Ad-hoc-Laden", "Ad-hoc-Laden ermöglicht spontanes Laden ohne bestehenden Vertrag mit einem Elektromobilitätsdienstleister.", "Wichtig für Teilhabe, Transparenz, Tourismus, Wettbewerb und Verbraucherschutz.", [], ["roaming-ladeinfrastruktur", "eichrecht-ladeinfrastruktur"]],
  ["ladepunktbetreiber", "Ladepunktbetreiber / CPO", "Ein Ladepunktbetreiber betreibt Ladepunkte technisch und organisatorisch.", "CPOs prägen Standortwahl, Preisgestaltung, Verfügbarkeit, Datenqualität und Marktmacht.", ["CPO", "Charge Point Operator"], ["ladeinfrastruktur", "backend-ladeinfrastruktur"]],
  ["elektromobilitaetsdienstleister", "Elektromobilitätsdienstleister / EMP", "Ein Elektromobilitätsdienstleister bietet Zugang, Verträge oder Abrechnung für Ladeinfrastruktur an.", "EMPs beeinflussen Preistransparenz, Roaming, Nutzerbindung und Plattformmacht.", ["EMP", "E-Mobility Provider"], ["roaming-ladeinfrastruktur", "ladepunktbetreiber"]],
  ["backend-ladeinfrastruktur", "Backend Ladeinfrastruktur", "Das Backend einer Ladeinfrastruktur verwaltet Ladepunkte, Nutzerzugang, Abrechnung, Monitoring und Schnittstellen.", "Backends sind Daten- und Machtinfrastruktur; sie brauchen Datenschutz, Interoperabilität, Ausfallsicherheit und faire Schnittstellen.", [], ["ocpp", "ladepunktbetreiber"]],
  ["ocpp", "OCPP", "OCPP ist ein Kommunikationsprotokoll zwischen Ladepunkten und Backend-Systemen.", "Interoperabilität kann Anbieterbindung reduzieren und Betrieb, Monitoring und Abrechnung erleichtern.", ["Open Charge Point Protocol"], ["backend-ladeinfrastruktur", "ladepunktbetreiber"], "method"],
  ["plug-and-charge", "Plug & Charge", "Plug & Charge ermöglicht Authentifizierung und Abrechnung beim Laden ohne separate Karte oder App.", "Komfortgewinn mit Daten-, Sicherheits-, Interoperabilitäts- und Marktmachtfragen.", ["Plug and Charge"], ["eichrecht-ladeinfrastruktur", "backend-ladeinfrastruktur"]],
  ["niederspannung", "Niederspannung", "Niederspannung ist die niedrigste Spannungsebene im Stromnetz und versorgt typischerweise Haushalte, kleinere Betriebe und kleinere Ladeeinrichtungen.", "Relevant für Wallboxen, kleine PV-Anlagen, Heimspeicher, Verteilnetze und lokale Engpässe.", [], ["mittelspannung", "verteilnetz"]],
  ["mittelspannung", "Mittelspannung", "Mittelspannung ist eine regionale Verteilnetzebene zwischen Niederspannung und Hochspannung.", "Mittelspannung ist ein Infrastrukturhebel: Viele Energiewendeprojekte scheitern nicht an Technologie, sondern an Anschlussleistung, Trafokapazität, Genehmigung, Netzausbau oder Messkonzept.", [], ["niederspannung", "hochspannung", "trafostation", "ladepark-mittelspannungsanschluss"], "connection", { mythos: "Ladeparks brauchen nur genug Ladesäulen.", woekKlaerung: "Bei hoher Leistung entscheiden Mittelspannung, Trafo, Schutztechnik, Messung, Netzverträglichkeit und Kosten." }],
  ["hochspannung", "Hochspannung", "Hochspannung ist eine höhere Spannungsebene für regionalen oder überregionalen Stromtransport.", "Relevant für große Industrie, Erzeugung, Netzausbau und Umspannwerke.", [], ["mittelspannung", "hoechstspannung", "umspannwerk"]],
  ["hoechstspannung", "Höchstspannung", "Höchstspannung ist die höchste Spannungsebene im Stromnetz für weiträumigen Transport.", "Sie prägt überregionale Versorgungssicherheit, Offshore-Anbindung und große Ausgleichsräume.", [], ["hochspannung", "uebertragungsnetz"]],
  ["umspannwerk", "Umspannwerk", "Ein Umspannwerk verbindet verschiedene Spannungsebenen und transformiert elektrische Energie zwischen ihnen.", "Umspannwerke sind Knoten der Energieinfrastruktur und entscheidend für Anschlussfähigkeit, Versorgungssicherheit und Netzausbau.", [], ["transformator", "hochspannung", "mittelspannung"]],
  ["umspannstation", "Umspannstation", "Eine Umspannstation transformiert Strom zwischen Spannungsebenen, häufig zwischen Mittelspannung und Niederspannung.", "Relevant für Quartiere, Gewerbe, Ladeparks, PV, Speicher und lokale Netzkapazität.", [], ["trafostation", "transformator", "mittelspannung"]],
  ["trafostation", "Trafostation", "Eine Trafostation enthält einen Transformator und weitere Betriebsmittel zur Umwandlung von Spannung, häufig von Mittelspannung auf Niederspannung.", "Trafostationen sind praktische Engpass- und Kostenpunkte für Ladeparks, Gewerbe, Quartiere und dezentrale Energiewende.", ["Transformatorstation", "Trafohäuschen"], ["transformator", "mittelspannung", "ladepark"]],
  ["transformator", "Transformator / Trafo", "Ein Transformator wandelt elektrische Spannung zwischen unterschiedlichen Spannungsebenen um.", "Transformatoren sind Infrastrukturbausteine für Netzanschluss, Verluste, Flächen, Materialbedarf und Versorgungssicherheit.", ["Trafo"], ["trafostation", "umspannstation"]],
  ["uebergabestation", "Übergabestation", "Eine Übergabestation ist der technische Übergabepunkt zwischen Netzbetreiber und Kundenanlage, häufig im Mittelspannungsanschluss.", "Relevant für Ladeparks, Gewerbespeicher, Industrie, PV, Wind und Netzanschlusskosten.", [], ["kundenanlage", "mittelspannung", "wandlermessung"]],
  ["netzanschlusspunkt", "Netzanschlusspunkt", "Der Netzanschlusspunkt ist der Punkt, an dem eine Anlage mit dem Stromnetz verbunden wird.", "Er bestimmt technische Anforderungen, Kosten, Kapazität und oft die Realisierbarkeit von Lade-, Speicher- und Erzeugungsprojekten.", [], ["netzanschlussbegehren", "netzvertraeglichkeitspruefung"]],
  ["netzanschlussbegehren", "Netzanschlussbegehren", "Ein Netzanschlussbegehren ist die Anfrage an den Netzbetreiber, eine Anlage an das Netz anzuschließen.", "Die Bearbeitung beeinflusst Investitionsgeschwindigkeit, Standortwahl, Transparenz und Energiewendeumsetzung.", [], ["netzanschlusspunkt", "netzvertraeglichkeitspruefung"]],
  ["netzvertraeglichkeitspruefung", "Netzverträglichkeitsprüfung", "Die Netzverträglichkeitsprüfung untersucht, ob eine geplante Anlage an einem bestimmten Netzpunkt angeschlossen werden kann, ohne Netzstabilität oder Betriebsmittel zu überlasten.", "Sie ist ein methodischer Engpass zwischen Projektidee und realer Infrastrukturwirkung.", [], ["netzanschlussbegehren", "netzanschlussleistung"], "method"],
  ["baukostenzuschuss", "Baukostenzuschuss", "Ein Baukostenzuschuss ist ein Beitrag zu Kosten, die durch Netzanschluss oder Netzausbau entstehen.", "Relevant für Wirtschaftlichkeit von Ladeparks, Speichern, PV, Industrie und Verteilungswirkung.", [], ["anschlusskosten", "netzanschlussleistung"]],
  ["anschlusskosten", "Anschlusskosten", "Anschlusskosten umfassen Kosten für Herstellung oder Verstärkung eines Netzanschlusses.", "Sie beeinflussen Standortentscheidungen, Geschäftsmodelle, Zugang und soziale Verteilung.", [], ["baukostenzuschuss", "netzanschlusspunkt"]],
  ["netzanschlussleistung", "Netzanschlussleistung", "Netzanschlussleistung beschreibt die am Netzanschluss vereinbarte oder verfügbare elektrische Leistung.", "Sie begrenzt Ladeparks, Speicher, Industrie, PV und Wind und bestimmt Netzentgelte, Baukostenzuschüsse und Lastmanagementbedarf.", [], ["anschlussleistung", "ladepark-mittelspannungsanschluss"]],
  ["kundenanlage", "Kundenanlage", "Eine Kundenanlage ist die elektrische Anlage hinter dem Netzanschlusspunkt im Verantwortungsbereich der Anschlussnehmer:innen.", "Relevant für Eigentum, Betrieb, Sicherheit, Messung, Ladeinfrastruktur und Verantwortungsgrenzen.", [], ["uebergabestation", "niederspannungshauptverteilung"]],
  ["mittelspannungsschaltanlage", "Mittelspannungsschaltanlage", "Eine Mittelspannungsschaltanlage schaltet, schützt und verteilt elektrische Energie auf Mittelspannungsebene.", "Relevant für Ladeparks, Speicher, Industrie und technische Anschlussregeln.", [], ["mittelspannung", "schutztechnik"]],
  ["niederspannungshauptverteilung", "Niederspannungshauptverteilung / NSHV", "Die Niederspannungshauptverteilung verteilt elektrische Energie innerhalb einer Kundenanlage auf Niederspannungsebene.", "Wichtig für Ladeinfrastruktur, Gebäudetechnik, Schutz, Messung und Erweiterbarkeit.", ["NSHV"], ["niederspannung", "kundenanlage"]],
  ["messwandler", "Messwandler", "Messwandler wandeln hohe Ströme oder Spannungen in messbare, sichere Größen für Zähler, Schutz- und Messsysteme um.", "Messwandler sichern Datenqualität bei höheren Leistungen und sind relevant für Abrechnung, Schutztechnik und Netztransparenz.", [], ["messwandlerschrank", "wandlermessung"]],
  ["messwandlerschrank", "Messwandlerschrank", "Ein Messwandlerschrank enthält Messwandler und zugehörige Messkomponenten für Anlagen mit höherer Leistung oder Mittelspannungsanschluss.", "Technischer Planungsbegriff für Ladeparks, Speicher, PV-Anlagen und Gewerbeanschlüsse; relevant für Messkonzept, Abrechnung und Projektkosten.", [], ["messwandler", "wandlermessung"], "method"],
  ["wandlermessung", "Wandlermessung", "Wandlermessung ist eine Messung über Strom- oder Spannungswandler, typischerweise bei höheren Leistungen.", "Wichtig für korrekte Abrechnung, Lastgänge, Leistungspreise und Netztransparenz.", [], ["messwandler", "rlm-messung"], "method"],
  ["rlm-messung", "RLM-Messung", "RLM-Messung erfasst Lastgänge und Leistungswerte größerer Verbraucher oder Erzeuger zeitaufgelöst.", "Sie ist Grundlage für Leistungspreise, Lastmanagement, Energiedaten und Wirkungssteuerung größerer Anlagen.", ["registrierende Leistungsmessung"], ["lastgang", "leistungspreis", "wandlermessung"], "method"],
  ["standardlastprofil", "Standardlastprofil / SLP", "Ein Standardlastprofil ist ein typisierter Verbrauchsverlauf für kleinere Verbraucher ohne registrierende Leistungsmessung.", "SLP vereinfacht Abrechnung, kann aber reale Flexibilität und Lastspitzen unsichtbar machen.", ["SLP"], ["rlm-messung", "lastgang"], "method"],
  ["leistungspreis", "Leistungspreis", "Der Leistungspreis ist ein Preisbestandteil, der sich an der maximalen oder vorgehaltenen Leistung orientiert.", "Er macht Lastspitzen wirtschaftlich sichtbar und beeinflusst Speicher, Ladeparks und Lastmanagement.", [], ["arbeitspreis", "rlm-messung", "gewerbespeicher"]],
  ["arbeitspreis", "Arbeitspreis", "Der Arbeitspreis ist ein Preisbestandteil pro verbrauchter Energiemenge.", "Er erklärt nur Energiemenge, nicht Lastspitzen, Netzanschlussleistung oder Systemkosten.", [], ["leistungspreis", "strompreisbestandteile"]],
  ["leistungsfaktor", "Leistungsfaktor", "Der Leistungsfaktor beschreibt das Verhältnis von Wirkleistung zu Scheinleistung in elektrischen Anlagen.", "Relevant für Blindleistung, Netzqualität, Ladeinfrastruktur und technische Anschlussregeln.", [], ["blindleistung", "spannungsqualitaet"]],
  ["oberschwingungen", "Oberschwingungen", "Oberschwingungen sind Frequenzanteile in elektrischen Netzen, die von der Grundfrequenz abweichen und Netzqualität beeinflussen können.", "Relevant für Ladeinfrastruktur, Wechselrichter, Netzqualität und technische Anschlussregeln.", [], ["spannungsqualitaet", "power-quality"]],
  ["spannungsqualitaet", "Power Quality / Spannungsqualität", "Spannungsqualität beschreibt die Einhaltung technischer Qualitätsmerkmale der elektrischen Spannung.", "Relevant für Ladeparks, Industrie, Wechselrichter, Betriebssicherheit und Netzverträglichkeit.", ["Power Quality"], ["oberschwingungen", "technische-anschlussregel"]],
  ["schutztechnik", "Schutztechnik", "Schutztechnik erkennt Fehlerzustände und trennt elektrische Anlagen sicher vom Netz.", "Zentral für Sicherheit, Versorgungsschutz, Ladeparks, Speicher und Mittelspannungsanschlüsse.", [], ["mittelspannungsschaltanlage", "thermal-runaway"]],
  ["fernwirktechnik", "Fernwirktechnik", "Fernwirktechnik ermöglicht die Überwachung, Steuerung oder Abschaltung von Anlagen aus der Ferne.", "Wichtig für Netzbetrieb, Einspeisemanagement, Ladeparks, Speicher und Krisenresilienz.", [], ["smart-grid", "technische-anschlussregel"]],
  ["technische-anschlussregel", "Technische Anschlussregel / TAR", "Technische Anschlussregeln beschreiben technische Anforderungen für Anschluss und Betrieb von Anlagen am Stromnetz.", "Sie übersetzen Systemstabilität in konkrete Projektanforderungen und wirken auf Kosten, Planung und Geschwindigkeit.", ["TAR"], ["tar-mittelspannung", "tab-mittelspannung"], "method"],
  ["tar-mittelspannung", "TAR Mittelspannung / VDE-AR-N 4110", "Die TAR Mittelspannung beschreibt technische Anforderungen für Anschluss und Betrieb von Kundenanlagen am Mittelspannungsnetz.", "Relevant für Ladeparks, Speicher, Industrie, PV und Wind; sie macht Systemstabilität projektverbindlich.", ["VDE-AR-N 4110"], ["technische-anschlussregel", "mittelspannung"], "method"],
  ["tab-mittelspannung", "TAB Mittelspannung", "Technische Anschlussbedingungen Mittelspannung konkretisieren Anforderungen des Netzbetreibers für den Anschluss an das Mittelspannungsnetz.", "TABs beeinflussen Standort, Planung, Kosten und Ausführung von Ladeparks und Energieanlagen.", [], ["tar-mittelspannung", "netzanschlusspunkt"], "method"],
  ["ladepark-mittelspannungsanschluss", "Ladepark-Mittelspannungsanschluss", "Ein Ladepark-Mittelspannungsanschluss ist ein Netzanschlusskonzept für größere Ladeinfrastrukturstandorte mit hoher Summenleistung.", "HPC wird nicht nur über Ladepunkte entschieden, sondern über Anschlussleistung, Trafo, Messung, Schutztechnik, Lastmanagement und Netzdienlichkeit.", [], ["ladepark", "mittelspannung", "trafostation", "hpc-charger"], "method"],
  ["windrad-recycling", "Windrad-Recycling", "Windrad-Recycling beschreibt die Rückgewinnung oder Verwertung von Materialien aus Windenergieanlagen nach Rückbau oder Repowering.", "Windenergie ist klimawirksam, aber nicht kreislauffrei; Türme, Fundamente, Metalle, Elektronik und Rotorblätter müssen über Lebenszyklus, Rückbau, Recycling und Materialgesundheit bewertet werden.", [], ["rotorblatt-recycling", "rueckbau-windenergieanlagen", "repowering", "windenergieanlage-lebenszyklus"], "connection", { mythos: "Erneuerbare Energieanlagen sind automatisch kreislauffrei oder kreislaufperfekt.", woekKlaerung: "Auch erneuerbare Anlagen brauchen Rückbau-, Recycling-, Material- und Flächenbewertung." }],
  ["rueckbau-windenergieanlagen", "Rückbau von Windenergieanlagen", "Rückbau von Windenergieanlagen beschreibt Demontage, Entsorgung, Wiederverwendung oder Recycling von Anlagenbestandteilen nach Nutzungsende.", "Rückbau ist Teil der tatsächlichen Lebenszykluswirkung und muss finanziell, technisch und regulatorisch abgesichert sein.", [], ["windrad-recycling", "rueckbauverpflichtung"]],
  ["repowering", "Repowering", "Repowering ersetzt ältere Energieanlagen durch leistungsfähigere neue Anlagen am gleichen oder ähnlichen Standort.", "Kann Flächen- und Netzwirkung verbessern, erzeugt aber Rückbau-, Recycling- und Akzeptanzfragen.", [], ["windenergie", "rueckbau-windenergieanlagen", "rotorblatt-recycling"]],
  ["rotorblatt-recycling", "Rotorblatt-Recycling", "Rotorblatt-Recycling beschreibt Verfahren zur Verwertung oder Rückgewinnung von Materialien aus Windturbinenblättern.", "Besonders relevant, weil Rotorblätter aus Faserverbundwerkstoffen bestehen, deren hochwertige Rückführung schwieriger ist als bei Stahl oder Beton.", [], ["faserverbundwerkstoff", "glasfaserverstaerkter-kunststoff", "carbonfaserverstaerkter-kunststoff", "zementverwertung-rotorblaetter"], "connection", { mythos: "Rotorblatt-Verwertung ist automatisch hochwertiges Recycling.", woekKlaerung: "Zementverwertung oder energetische Nutzung können sinnvoll sein, sind aber nicht automatisch hochwertiger Materialerhalt." }],
  ["faserverbundwerkstoff", "Faserverbundwerkstoff", "Ein Faserverbundwerkstoff kombiniert Fasern mit einer Matrix, um hohe Festigkeit bei geringem Gewicht zu erreichen.", "Relevant für Rotorblätter, Leichtbau und Recyclingherausforderungen.", [], ["rotorblatt-recycling", "glasfaserverstaerkter-kunststoff", "carbonfaserverstaerkter-kunststoff"]],
  ["glasfaserverstaerkter-kunststoff", "Glasfaserverstärkter Kunststoff / GFK", "GFK ist ein Faserverbundwerkstoff aus Glasfasern und Kunststoffmatrix.", "Wichtig für Rotorblätter und Bauteile, aber schwierig hochwertig zu recyceln.", ["GFK"], ["faserverbundwerkstoff", "rotorblatt-recycling"]],
  ["carbonfaserverstaerkter-kunststoff", "Carbonfaserverstärkter Kunststoff / CFK", "CFK ist ein Faserverbundwerkstoff aus Carbonfasern und Kunststoffmatrix.", "Leicht und leistungsfähig, aber energie- und recyclingrelevant.", ["CFK"], ["faserverbundwerkstoff", "rotorblatt-recycling"]],
  ["zementverwertung-rotorblaetter", "Zementverwertung Rotorblätter", "Zementverwertung nutzt zerkleinerte Rotorblattmaterialien als Ersatzbrennstoff oder Rohstoffersatz in der Zementindustrie.", "Nicht automatisch hochwertiges Recycling; WÖk-Bewertung über Materialerhalt, Emissionen, Substitution, Kreislaufgrad und Alternativen.", [], ["rotorblatt-recycling", "recycling"]],
  ["windenergieanlage-lebenszyklus", "Windenergieanlage Lebenszyklus", "Der Lebenszyklus einer Windenergieanlage umfasst Rohstoffe, Herstellung, Transport, Bau, Betrieb, Wartung, Repowering, Rückbau und Recycling.", "Er macht sichtbar, dass klimafreundlicher Betrieb mit Material-, Flächen-, Akzeptanz- und Rückbaufragen verbunden bleibt.", [], ["windrad-recycling", "lebenszyklusanalyse"]],
  ["rueckbauverpflichtung", "Rückbauverpflichtung", "Eine Rückbauverpflichtung verpflichtet Betreiber, Anlagen nach Nutzungsende zurückzubauen.", "Sie verhindert, dass Rückbaukosten und Materialrisiken auf Grundstücke, Kommunen oder zukünftige Generationen externalisiert werden.", [], ["rueckbau-windenergieanlagen", "rueckbaustandard"]],
  ["rueckbaustandard", "Rückbaustandard", "Ein Rückbaustandard beschreibt Anforderungen an Demontage, Sortierung, Dokumentation, Wiederverwendung und Verwertung von Anlagen.", "Wichtig für Qualität, Arbeitsschutz, Materialerhalt, Nachvollziehbarkeit und WÖk-Scorecards.", [], ["rueckbauverpflichtung", "anlagenpass"], "method"],
  ["anlagenpass", "Anlagenpass", "Ein Anlagenpass dokumentiert technische, materialbezogene und rückbaurelevante Informationen einer Anlage.", "Analog zum Materialpass oder Digitalen Produktpass für große Energieanlagen; wichtig für Rückbau, Wartung, Versicherung und Kreislaufwirkung.", [], ["materialpass", "digitaler-produktpass", "rueckbaustandard"], "method"],
].map(batteryInfraTerm);

additions.push(...economicSystemTerms, ...feminismCareTerms, ...liberalMarketTerms, ...actorsInfluenceTerms, ...fascismRiskTerms, ...arendtTerms, ...stateGovTerms, ...regimeFormTerms, ...circularTerms, ...neuroTerms, ...quantumTerms, ...energyTerms, ...energySystemTerms, ...batteryInfrastructureTerms);

const raw = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const terms = raw.terms || [];
const byId = new Map();
for (const item of terms) {
  byId.set(item.termId || item.id || item.slug, item);
  if (item.slug) byId.set(item.slug, item);
}

function mergeTerm(existing, next) {
  const merged = { ...existing, ...next };
  merged.aliases = unique([...(existing.aliases || []), ...(existing.synonyms || []), ...(next.aliases || [])]);
  merged.synonyms = unique(merged.aliases);
  merged.relatedTerms = unique([...(existing.relatedTerms || []), ...(next.relatedTerms || [])]);
  merged.related_terms = merged.relatedTerms;
  merged.officialSources = unique([...(existing.officialSources || []), ...(next.officialSources || [])]);
  merged.sourceLinks = [...(existing.sourceLinks || []), ...(next.sourceLinks || [])].filter((item, index, all) => {
    const key = `${item.source_type}|${item.title}|${item.url}`;
    return all.findIndex((candidate) => `${candidate.source_type}|${candidate.title}|${candidate.url}` === key) === index;
  });
  merged.source_links = merged.sourceLinks;
  merged.tags = unique([...(existing.tags || []), ...(next.tags || [])]);
  merged.categories = unique([...(existing.categories || []), ...(next.categories || [])]);
  merged.theme = unique([...(existing.theme || existing.themes || []), ...(next.theme || next.themes || [])]);
  merged.themes = merged.theme;
  merged.dimensions = unique([...(existing.dimensions || []), ...(next.dimensions || [])]);
  merged.wirklogik = unique([...(existing.wirklogik || []), ...(next.wirklogik || [])]);
  merged.applicationFields = unique([...(existing.applicationFields || existing.application_fields || []), ...(next.applicationFields || next.application_fields || [])]);
  merged.application_fields = merged.applicationFields;
  merged.sourceField = unique([...(existing.sourceField || existing.source_field || []), ...(next.sourceField || next.source_field || [])]);
  merged.source_field = merged.sourceField;
  merged.mythos = next.mythos || existing.mythos || "";
  merged.woekKlaerung = next.woekKlaerung || next.woek_klaerung || existing.woekKlaerung || existing.woek_klaerung || "";
  merged.woek_klaerung = merged.woekKlaerung;
  merged.blindSpot = next.blindSpot || next.blind_spot || existing.blindSpot || existing.blind_spot || "";
  merged.blind_spot = merged.blindSpot;
  merged.lastUpdated = today;
  merged.updatedAt = today;
  merged.lastReviewed = today;
  merged.last_reviewed = today;
  return merged;
}

for (const next of additions) {
  const existing = byId.get(next.termId) || byId.get(next.slug);
  if (existing) {
    const merged = mergeTerm(existing, next);
    const index = terms.indexOf(existing);
    terms[index] = merged;
    byId.set(merged.termId, merged);
    byId.set(merged.slug, merged);
  } else if (next.publicationStatus === "published") {
    terms.push(next);
    byId.set(next.termId, next);
    byId.set(next.slug, next);
  }
}

const coreUpdates = {
  wirkung: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Wirkung ist neutral und relational: tatsächliche Veränderung von Zuständen. Positive, negative und neutrale Wirkung müssen am Referenzrahmen Mensch, Planet und Demokratie bewertet werden.",
    relatedTerms: ["wirkungspotenzial", "wirkungsrisiko", "wirkungspfad", "folgewirkung", "positive-netto-wirkung"],
  },
  wirkungspotenzial: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Wirkungspotenzial ist die Möglichkeit, dass Wirkung eintreten kann. Es ist keine eingetretene Wirkung und kein Beweis.",
    relatedTerms: ["wirkung", "wirkungsrisiko", "wirkstoff", "resonanzraum", "anschlussfaehigkeit"],
  },
  wirkungsrisiko: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Wirkungsrisiko ist die Möglichkeit negativer oder destabilisierender Wirkung, nicht der bereits eingetretene Schaden.",
    relatedTerms: ["wirkungspotenzial", "folgewirkung", "resonanzrisiko", "klimarisiko", "wirkungsgrenze"],
  },
  wirkungspfad: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Ein Wirkungspfad ist ein plausibler Weg von Auslöser zu Wirkung. Er ist eine Hypothese mit Datenbedarf, kein Kausalbeweis.",
    relatedTerms: ["wirkung", "wirkungspotenzial", "wirkstoff", "folgewirkung", "rueckkopplung"],
  },
  resonanzraum: {
    conceptStatus: "WÖk-Präzisierungsbegriff",
    relatedTerms: ["resonanz", "anschlussfaehigkeit", "salienz", "framing", "strukturdeterminiertheit"],
  },
  anschlussfaehigkeit: {
    conceptStatus: "WÖk-Präzisierungsbegriff",
    relatedTerms: ["resonanzraum", "strukturdeterminiertheit", "diffusion", "wirkungspotenzial"],
  },
  vertrauen: {
    conceptStatus: "WÖk-Präzisierungsbegriff",
    definition: "Vertrauen ist ein sozialer, institutioneller und demokratischer Systemzustand. Es entsteht durch Wahrhaftigkeit, Rechtsstaatlichkeit, Transparenz, Teilhabe, Berechenbarkeit, Korrekturfähigkeit und erlebte Wirkung. Vertrauen ist relational und nicht automatisch positiv.",
    woekRelation: "Vertrauen kann demokratische Stabilität stärken, wenn es sich auf überprüfbare Verfahren, Rechtsstaatlichkeit, Wahrhaftigkeit, Transparenz und Korrekturfähigkeit richtet. Vertrauen kann destruktiv wirken, wenn blinde Loyalität zu Personen, Gruppen oder Narrativen Vertrauen in Medien, Wissenschaft, Institutionen oder gemeinsame Wirklichkeit zerstört. Vertrauen kann Vertrauen zerstören, wenn personalisierte Loyalität institutionelles Vertrauen verdrängt.",
    relatedTerms: ["vertrauensverschiebung", "destruktive-vertrauensbindung", "rechtsstaatlichkeit", "medienqualitaet", "diskursfaehigkeit"],
  },
  wirkungsarchitektur: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Wirkungsarchitektur ist das Gesamtsystem aus Daten, Regeln, Institutionen, Rückkopplung, Governance und Lernen.",
    relatedTerms: ["rueckkopplung", "kybernetik", "viable-system-model", "wirkungsrat", "scorecard"],
  },
  wirkungsresilienz: {
    conceptStatus: "WÖk-Präzisierungsbegriff",
    relatedTerms: ["wirkungsintegration", "vulnerabilitaet", "anpassungskapazitaet", "varietaet", "wirkungsarchitektur"],
  },
  wirkungslenkung: {
    conceptStatus: "WÖk-Kernbegriff",
    relatedTerms: ["hebelpunkt", "rueckkopplung", "wirkungsarchitektur", "positive-netto-wirkung"],
  },
  wirkungsrueckkopplung: {
    conceptStatus: "WÖk-Kernbegriff",
    relatedTerms: ["rueckkopplung", "kybernetik", "wirkungsarchitektur", "wirkungslenkung"],
  },
  "netto-wirkung": {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Netto-Wirkung ist keine einfache Addition. Rote Linien, Nichtkompensation und Datenqualität begrenzen jede Zusammenfassung.",
    relatedTerms: ["positive-netto-wirkung", "reverse-merit-order", "nichtkompensationsprinzip", "wirkungsgrenze"],
  },
  transformationswirkung: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Transformationswirkung ist nicht identisch mit Netto-Wirkung. Sie verändert Systemlogiken, Standards, Anreize oder Handlungspfade.",
    relatedTerms: ["wirkungsinnovation", "transformationswelle", "strukturdeterminiertheit", "diffusion"],
  },
  "nichttriviales-system": {
    conceptStatus: "Anschlussbegriff",
    relatedTerms: ["nichttriviale-maschine", "triviale-maschine", "strukturdeterminiertheit", "rueckkopplung"],
  },
  "strukturelle-kopplung": {
    conceptStatus: "Anschlussbegriff",
    relatedTerms: ["strukturdeterminiertheit", "strukturelles-driften", "autopoiesis", "resonanzraum"],
  },
  "strukturelles-driften": {
    conceptStatus: "Anschlussbegriff",
    relatedTerms: ["strukturelle-kopplung", "normalisierung", "prozessdenken", "rueckkopplung"],
  },
  rueckkopplung: {
    conceptStatus: "Anschlussbegriff",
    relatedTerms: ["kybernetik", "wirkungsrueckkopplung", "folgewirkung", "hebelpunkt"],
  },
  kipppunkt: {
    conceptStatus: "Anschlussbegriff",
    relatedTerms: ["schwellenwert", "klimarisiko", "wirkungsrisiko", "baseline-verschiebung"],
  },
  "scope-1-2-3": {
    conceptStatus: "Methodenbegriff",
    canonicalLabel: "Scope 1, Scope 2, Scope 3",
    shortDefinition: "Scope 1, 2 und 3 sind der bisherige Überblickseintrag zu THG-Emissions-Scopes und verweisen auf die Detailbegriffe Scope 1, Scope 2 und Scope 3.",
    woekRelation: "Der Überblick bleibt aus Kompatibilitätsgründen erhalten; spezifische Erwähnungen werden auf Scope 1, Scope 2, Scope 3 oder THG-Emissions-Scopes verlinkt.",
    relatedTerms: ["thg-emissions-scopes", "scope-1", "scope-2", "scope-3", "scope-3-datenqualitaet", "treibhausgasemissionen"],
  },
  "kondratieff-zyklus": {
    conceptStatus: "Quellen-/Bezugslinienbegriff",
    woekRelation: "Kondratieff-Zyklen bleiben ein allgemeines Deutungsmuster langer wirtschaftlicher Wellen. Der 6. Kondratieff ist davon als WÖk-spezifische Präzisierung zu trennen.",
    relatedTerms: ["sechster-kondratieff", "nikolai-kondratieff", "basisinnovation", "transformationswelle", "wirkungsinnovation"],
  },
  treibhausgasemissionen: {
    conceptStatus: "Anschlussbegriff",
    relatedTerms: ["thg-emissions-scopes", "scope-1", "scope-2", "scope-3", "co2e", "global-warming-potential", "emissionsfaktor"],
  },
  faktencheck: {
    conceptStatus: "Anschlussbegriff",
    woekRelation: "Faktenchecks sind notwendig, aber nicht ausreichend. Die WÖk ergänzt sie um Folgencheck, Wirkungspotenzial, Resonanzraum und Vertrauensfolgen.",
    relatedTerms: ["fakten", "folgencheck", "faktenreaktanz", "wahrheit", "scheinwahrheit", "metakommunikation"],
  },
  folgencheck: {
    conceptStatus: "WÖk-Präzisierungsbegriff",
    woekRelation: "Ein Folgencheck prüft Wirkungspfade, Wirkungspotenziale, Wirkungsrisiken und mögliche Zustandsveränderungen einer Aussage, Maßnahme oder Entscheidung.",
    relatedTerms: ["faktencheck", "fakten", "wirkungspfad", "wirkungspotenzial", "wirkungsrisiko", "metakommunikation", "beobachtung-zweiter-ordnung"],
  },
  wirkungswahrheit: {
    conceptStatus: "WÖk-Kernbegriff",
    woekRelation: "Wirkungswahrheit beschreibt die Nähe einer Aussage, eines Preises, eines Produkts oder einer Entscheidung zu ihren tatsächlichen Folgen.",
    relatedTerms: ["wahrheit", "wahrhaftigkeit", "scheinwahrheit", "externalisierung", "folgencheck", "wirkungsblindheit"],
  },
  wohnwirkung: {
    relatedTerms: ["wirkungspflicht-eigentum"],
  },
  wirkungsvermietung: {
    relatedTerms: ["wirkungspflicht-eigentum"],
  },
  spekulationslogik: {
    relatedTerms: ["wirkungspflicht-eigentum"],
  },
};

for (const [id, patch] of Object.entries(coreUpdates)) {
  const existing = byId.get(id);
  if (!existing) continue;
  Object.assign(existing, {
    ...patch,
    concept_status: patch.conceptStatus || existing.concept_status,
    publicationStatus: existing.publicationStatus || "published",
    publication_status: existing.publication_status || "published",
    lastReviewed: today,
    last_reviewed: today,
    lastUpdated: today,
    updatedAt: today,
  });
  if (patch.relatedTerms) existing.relatedTerms = unique([...(existing.relatedTerms || []), ...patch.relatedTerms]);
  existing.related_terms = existing.relatedTerms || [];
}

const relationPatches = {
  wohnwirkung: ["wirkungspflicht-eigentum"],
  wirkungsvermietung: ["wirkungspflicht-eigentum"],
  spekulationslogik: ["wirkungspflicht-eigentum"],
};

for (const [id, relatedTerms] of Object.entries(relationPatches)) {
  const existing = byId.get(id);
  if (!existing) continue;
  existing.relatedTerms = unique([...(existing.relatedTerms || []), ...relatedTerms]);
  existing.related_terms = existing.relatedTerms;
}

const termIds = new Set(terms.map((item) => item.termId || item.id || item.slug));
for (const item of terms) {
  item.relatedTerms = unique(item.relatedTerms || []).filter((id) => termIds.has(id));
}
for (const item of terms) {
  for (const relatedId of item.relatedTerms || []) {
    const other = byId.get(relatedId);
    if (!other) continue;
    other.relatedTerms = unique([...(other.relatedTerms || []), item.termId]);
  }
}
for (const item of terms) {
  item.relatedTerms = unique(item.relatedTerms || []).filter((id) => id !== item.termId && termIds.has(id));
  item.related_terms = item.relatedTerms;
  item.publicationStatus ||= "published";
  item.publication_status ||= item.publicationStatus;
  item.concept_status ||= item.conceptStatus || "";
  item.type ||= item.begriffstyp || item.conceptStatus || item.concept_status || "WÖk-Präzisierungsbegriff";
  item.begriffstyp ||= item.type;
  item.theme = unique(item.theme || item.themes || []);
  if (!item.theme.length && item.category) item.theme = [item.category];
  const themeByCategory = {
    [CAT_THINKERS]: "Philosophie, Ethik und Werte",
    [CAT_VALUES]: "Philosophie, Ethik und Werte",
    [CAT_ETHICS]: "Philosophie, Ethik und Werte",
    [CAT_CAPITAL]: "Kapital, Markt und Macht",
    [CAT_FEMINISM_CARE]: "Feminismus und Gleichwertigkeit",
    [CAT_LIBERAL_MARKET]: "Liberalismus und Freiheit",
    [CAT_ACTORS_INFLUENCE]: "Akteure und Einfluss",
    [CAT_FASCISM_RISKS]: "Faschismus, faschistoid und autoritäre Wirkungsrisiken",
    [CAT_ARENDT]: "Hannah Arendt und politische Wirkungsbegriffe",
    [CAT_STATE_GOV]: "Staat, Regierung, Verwaltung und Gesellschaft",
    [CAT_REGIME_FORMS]: "Autokratien, Regimeformen und demokratische Erosion",
    [CAT_LANGUAGE]: "Sprache, Wirklichkeit und Kommunikation",
    [CAT_SYSTEMS]: "Systemtheorie, Kybernetik und Konstruktivismus",
    [CAT_MANAGEMENT2]: "Management, Organisation und Wirksamkeit",
    [CAT_TRANSFORMATION]: "Innovation, Evolution und Transformation",
  };
  if (themeByCategory[item.category]) item.theme = unique([themeByCategory[item.category], ...item.theme]);
  if (!item.theme.length) item.theme = ["Wirkung und Wirkungslogik"];
  item.themes = item.theme;
  item.dimensions = unique(item.dimensions || []);
  if (!item.dimensions.length) item.dimensions = ["Mensch + Planet + Demokratie"];
  item.wirklogik = unique(item.wirklogik || []);
  if (!item.wirklogik.length) item.wirklogik = ["Wirkungsbewertung"];
  item.applicationFields = unique(item.applicationFields || item.application_fields || []);
  if (!item.applicationFields.length) item.applicationFields = ["Politik", "Unternehmen"];
  item.application_fields = item.applicationFields;
  item.sourceField = unique(item.sourceField || item.source_field || []);
  if (!item.sourceField.length) item.sourceField = item.conceptStatus === "WÖk-Kernbegriff" ? ["WÖk-eigener Begriff"] : ["WÖk-eigener Begriff"];
  item.source_field = item.sourceField;
  item.mythos ||= "";
  item.woekKlaerung ||= item.woek_klaerung || "";
  item.woek_klaerung = item.woekKlaerung;
  item.blindSpot ||= item.blind_spot || "";
  item.blind_spot = item.blindSpot;
  item.source_links ||= item.sourceLinks || [];
  item.internal_links ||= item.internalLinks || [];
  item.last_reviewed ||= item.lastReviewed || today;
}

terms.sort((a, b) => new Intl.Collator("de", { sensitivity: "base", numeric: true }).compare(a.glossaryOrderKey || a.canonicalLabel, b.glossaryOrderKey || b.canonicalLabel));
raw.terms = terms;
raw.generatedAt = new Date().toISOString();
fs.writeFileSync(registryPath, `${JSON.stringify(raw, null, 2)}\n`);

fs.mkdirSync(glossaryDir, { recursive: true });

const sourceMarkdown = `# Glossar-Quellen und Bezugslinien

Stand: ${today}

Diese Datei bündelt Quellen fuer Glossarbegriffe. Externe Anschlussbegriffe werden nicht als WÖk-Prägungen ausgegeben, sondern wirkungsökonomisch eingeordnet.

## Klassische Ökonomie und Kapital

- Adam Smith: The Theory of Moral Sentiments
- Adam Smith: The Wealth of Nations
- Karl Marx: Das Kapital
- Karl Marx: Ökonomisch-philosophische Manuskripte
- Karl Polanyi: The Great Transformation
- Friedrich Hayek: The Use of Knowledge in Society
- John Maynard Keynes: The General Theory

## Liberalismus / Freiheit / Neoklassik

- John Locke: Two Treatises of Government
- John Stuart Mill: On Liberty
- Isaiah Berlin: Two Concepts of Liberty
- Amartya Sen: Development as Freedom
- Friedrich Hayek: The Road to Serfdom
- Friedrich Hayek: The Use of Knowledge in Society
- Robert Nozick: Anarchy, State, and Utopia
- Milton Friedman: Capitalism and Freedom
- Alfred Marshall: Principles of Economics
- William Stanley Jevons: Theory of Political Economy
- Léon Walras: Elements of Pure Economics
- Vilfredo Pareto: Manual of Political Economy
- Paul Samuelson: Foundations of Economic Analysis
- Kenneth Arrow / Gérard Debreu: general equilibrium
- Arthur Pigou: The Economics of Welfare
- Ronald Coase: The Problem of Social Cost
- George Akerlof: The Market for Lemons
- Joseph Stiglitz: Information asymmetry
- Walter Eucken: Grundlagen der Nationalökonomie / Ordnungspolitik
- Ludwig von Mises: Human Action
- IMF / OECD / empirische Quellen zu Trickle-down, Ungleichheit und Wachstumswirkungen nur bei konkreter Begriffsverwendung.

## Akteure / Einfluss / demokratische Wirkungsräume

- OECD Recommendation on Transparency and Integrity in Lobbying and Influence, https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0379
- OECD Policy Brief Lobbying, https://www.oecd.org/content/dam/oecd/en/about/programmes/grc/grc-see/integrity/Policy_Brief_Note_Lobbying.pdf
- EU Transparency Register, https://commission.europa.eu/about/service-standards-and-principles/transparency/transparency-register_en
- European Parliamentary Research Service / Think Tank, https://www.europarl.europa.eu/thinktank/
- Mandate for Leadership / Project 2025 official, https://www.mandateforleadership.org/
- Atlas Network official, https://www.atlasnetwork.org/
- United Nations: The UN and Civil Society, https://www.un.org/en/get-involved/un-and-civil-society
- UN ECOSOC NGO consultative status, https://ecosoc.un.org/en/ngo
- Grundgesetz für die Bundesrepublik Deutschland, https://www.gesetze-im-internet.de/gg/
- Bundesverfassungsgericht Klimabeschluss 2021, https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2021/03/rs20210324_1bvr265618.html
- Bundeszentrale für politische Bildung: Rassismus, https://www.bpb.de/kurz-knapp/lexika/lexikon-in-einfacher-sprache/322448/rassismus/
- Bundeszentrale für politische Bildung: Faschismus, https://www.bpb.de/themen/rechtsextremismus/dossier-rechtsextremismus/500776/faschismus/
- Bundeszentrale für politische Bildung: Rechtsextremismus / Rassismus / Faschismus-Dossiers, https://www.bpb.de/themen/rechtsextremismus/
- Bundeszentrale für politische Bildung: Konservatismus, https://www.bpb.de/kurz-knapp/lexika/politiklexikon/17742/konservatismus/
- Interne WÖk-Quellen: Politik als Wirkungsraum, Parteien und Programme, Lobbyismus und Machtkonzentration, Wirkung als Rechtsprinzip, Wirkungsrat-Konzept, Folgencheck statt Faktencheck, Wirkung politischer Sprache, Medien & Demokratie.

## Faschismus / Arendt / Staat / Regimeformen

- Encyclopaedia Britannica: Fascism, common characteristics, https://www.britannica.com/topic/fascism
- Bundeszentrale für politische Bildung: Faschismus, https://www.bpb.de/themen/rechtsextremismus/dossier-rechtsextremismus/500776/faschismus/
- Robert O. Paxton: The Anatomy of Fascism
- Roger Griffin: The Nature of Fascism
- Umberto Eco: Ur-Fascism
- Duden: faschistoid, https://www.duden.de/rechtschreibung/faschistoid
- Bundeszentrale für politische Bildung: Autoritäre Politik / Autokratie / Totalitarismus, https://www.bpb.de/
- V-Dem: Regimes of the World, https://v-dem.net/
- Hannah Arendt: Vita activa / The Human Condition
- Hannah Arendt: Elemente und Ursprünge totaler Herrschaft
- Hannah Arendt: Eichmann in Jerusalem
- Hannah Arendt: Macht und Gewalt
- Stanford Encyclopedia of Philosophy: Hannah Arendt, https://plato.stanford.edu/entries/arendt/
- Grundgesetz für die Bundesrepublik Deutschland, https://www.gesetze-im-internet.de/gg/
- Bundesregierung: Aufbau und Aufgaben der Bundesregierung, https://www.bundesregierung.de/breg-de/bundesregierung
- Bundeszentrale für politische Bildung / HanisauLand: Staat, Regierung, Demokratie, Rechtsstaat, https://www.bpb.de/
- Bundesverfassungsgericht Klimabeschluss 2021, https://www.bundesverfassungsgericht.de/SharedDocs/Entscheidungen/DE/2021/03/rs20210324_1bvr265618.html
- Interne WÖk-Quellen: Folgencheck statt Faktencheck, Wirkung politischer Sprache, Demokratie als Wirkungsraum, Wirkungsarchitektur, Wirkungsrat, WStG / WUStG, Die neue Ordnung des Wohlstands, Systemmodell der Wirkungsökonomie.

## Feministische Ökonomie / Care

- Marilyn Waring: If Women Counted
- Nancy Fraser: Cannibal Capitalism / Crisis of Care
- Silvia Federici: Revolution at Point Zero / Caliban and the Witch
- Diane Elson: Gender Budgeting / feminist economics
- Julie A. Nelson: Feminism, Objectivity and Economics
- Caroline Criado Perez: Invisible Women
- ILO: Care Work and Care Jobs for the Future of Decent Work, https://www.ilo.org/global/publications/books/WCMS_633135/lang--en/index.htm
- UN Women: unpaid care work / gender equality, https://www.unwomen.org/en
- OECD: unpaid care work / gender data, https://www.oecd.org/gender/
- Destatis: Gender Pay Gap / Gender Care Gap / Gender Pension Gap, https://www.destatis.de/
- BMFSFJ: Gleichstellung, Gender Care Gap, Gender Pension Gap, https://www.bmfsfj.de/

## Ethik und Philosophie

- Immanuel Kant: Grundlegung zur Metaphysik der Sitten
- Immanuel Kant: Kritik der praktischen Vernunft
- Platon: Politeia, nur Backlog
- Hannah Arendt: Vita activa / The Human Condition
- Amartya Sen: Development as Freedom
- Martha Nussbaum: Creating Capabilities
- Grundgesetz Art. 1 und Art. 20a, https://www.gesetze-im-internet.de/gg/

## Sprache, Kommunikation und Konstruktivismus

- Ludwig Wittgenstein: Philosophische Untersuchungen
- Paul Watzlawick, Janet Beavin, Don Jackson: Pragmatics of Human Communication
- Paul Watzlawick: Die erfundene Wirklichkeit
- Ernst von Glasersfeld: Radical Constructivism
- Maturana / Varela: Autopoiesis and Cognition
- Maturana / Varela: Der Baum der Erkenntnis

## Systemtheorie / Kybernetik

- Humberto Maturana / Francisco Varela: Autopoiesis and Cognition
- Heinz von Foerster: Understanding Understanding
- Heinz von Foerster / Bernhard Pörksen: Wahrheit ist die Erfindung eines Lügners
- Stafford Beer: Brain of the Firm
- Stafford Beer: The Heart of Enterprise
- Stafford Beer: Diagnosing the System for Organizations
- Stafford Beer: The Viable System Model
- Gregory Bateson: Steps to an Ecology of Mind
- Niklas Luhmann: Soziale Systeme
- Donella Meadows: Leverage Points, https://donellameadows.org/archives/leverage-points-places-to-intervene-in-a-system/
- Donella Meadows: Thinking in Systems
- Frederic Vester: Vernetztes Denken

## Management

- Peter Drucker: The Practice of Management
- Peter Drucker: The Effective Executive
- Peter Drucker: Management: Tasks, Responsibilities, Practices
- Drucker Institute, https://drucker.institute/
- Hans Ulrich: Die Unternehmung als produktives soziales System
- St. Galler Management-Modell, https://www.sgmm.ch/en/about-the-model/history/
- Fredmund Malik: Führen Leisten Leben
- Fredmund Malik: Strategie des Managements komplexer Systeme
- Malik Management, https://www.malik-management.com/

## Innovation / Evolution

- Joseph A. Schumpeter: Theorie der wirtschaftlichen Entwicklung
- Joseph A. Schumpeter: Capitalism, Socialism and Democracy
- Nikolai Kondratieff: The Long Waves in Economic Life
- Jochen Röpke: Der lernende Unternehmer
- EconStor als Recherchepunkt fuer Röpke, Kondratieff und Lernebenen: https://www.econstor.eu/

## Transformation und Wohlstand

- Maja Göpel: Unsere Welt neu denken
- Kate Raworth: Doughnut Economics
- Mariana Mazzucato: Mission Economy
- Wellbeing Economy Alliance, https://weall.org/
- Stiglitz-Sen-Fitoussi Report
- OECD Measuring Well-being and Progress, https://www.oecd.org/wise/measuring-well-being-and-progress.htm
- Stockholm Resilience Centre: Planetary Boundaries, https://www.stockholmresilience.org/research/planetary-boundaries.html

## Daoismus / Prozessdenken

- Laozi: Daodejing
- Alan Watts: The Book
- Alan Watts: Taoist Way / Taoismus-Vorträge
- Daoismus wird nur als philosophische Bezugslinie fuer Prozessdenken, Nicht-Erzwingen und Eingebettetheit verwendet.

## Klima / Lebenszyklus

- IPCC AR6 Glossary, https://www.ipcc.ch/report/ar6/syr/downloads/report/IPCC_AR6_SYR_Annex-I.pdf
- IPCC WGII, https://www.ipcc.ch/report/ar6/wg2/
- EU JRC Life Cycle Assessment, https://eplca.jrc.ec.europa.eu/lifecycleassessment.html
- EU Product Environmental Footprint, https://eplca.jrc.ec.europa.eu/EnvironmentalFootprint.html
- ISO 14040, https://www.iso.org/standard/37456.html
- ISO 14064, https://www.iso.org/standard/66453.html
- ISO 14067, https://www.iso.org/standard/71206.html
- GHG Protocol Corporate Standard, https://ghgprotocol.org/corporate-standard
- GHG Protocol Scope 3 Standard, https://ghgprotocol.org/corporate-value-chain-scope-3-standard
- GHG Protocol Product Life Cycle Standard, https://ghgprotocol.org/sites/default/files/standards/Product-Life-Cycle-Accounting-Reporting-Standard_041613.pdf
- ESRS E1 Climate Change, https://www.efrag.org/en/sustainability-reporting/esrs
- JEC Well-to-Wheels, https://joint-research-centre.ec.europa.eu/welcome-jec-website/jec-activities/well-wheels-analyses_en
- Cradle to Cradle Certified, https://c2ccertified.org/the-standard

## Wirtschaftssysteme, Kapitalmythen und Verteilungslogiken

- Adam Smith: The Theory of Moral Sentiments
- Adam Smith: The Wealth of Nations
- Karl Marx: Das Kapital
- Karl Polanyi: The Great Transformation
- Friedrich Hayek: The Use of Knowledge in Society
- John Maynard Keynes: The General Theory
- Gøsta Esping-Andersen: The Three Worlds of Welfare Capitalism
- Nordic Council: Nordic Welfare Model, https://www.norden.org/en/information/nordic-welfare-model
- Silvia Federici: Caliban and the Witch
- Nancy Fraser: soziale Reproduktion und Care-Krise
- Elinor Ostrom: Governing the Commons
- Shoshana Zuboff: The Age of Surveillance Capitalism
- Nick Srnicek: Platform Capitalism
- Investopedia: Trickle-Down Economics, https://www.investopedia.com/terms/t/trickledowntheory.asp
- IMF: Inequality and Growth, https://www.imf.org/external/pubs/ft/sdn/2014/sdn1402.pdf
- Hope / Limberg: The economic consequences of major tax cuts for the rich, https://doi.org/10.1093/ser/mwab061

## Kreislaufwirtschaft / Circular Design

- Ellen MacArthur Foundation: Circular Economy Principles, https://www.ellenmacarthurfoundation.org/circular-economy-principles
- Ellen MacArthur Foundation: Butterfly Diagram / Circular Economy System Diagram, https://www.ellenmacarthurfoundation.org/circular-economy-diagram
- Ellen MacArthur Foundation: The technical cycle of the butterfly diagram, https://www.ellenmacarthurfoundation.org/articles/the-technical-cycle-of-the-butterfly-diagram
- Ellen MacArthur Foundation: Towards the Circular Economy, 2013
- Cradle to Cradle Certified, https://c2ccertified.org/the-standard
- McDonough / Braungart: Cradle to Cradle
- EU Ecodesign for Sustainable Products Regulation / Digital Product Passport, https://single-market-economy.ec.europa.eu/news/commission-launches-consultation-digital-product-passport-2025-04-09_en
- EU JRC Life Cycle Assessment, https://eplca.jrc.ec.europa.eu/lifecycleassessment.html
- ISO 14040 / ISO 14044 als LCA-Bezugslinie

## Neuropsychologie / Wahrnehmung

- Leon Festinger: A Theory of Cognitive Dissonance
- Daniel Kahneman: Thinking, Fast and Slow
- Tversky / Kahneman: Judgment under Uncertainty
- Pennycook / Rand: The Psychology of Fake News
- Ecker et al.: Psychological drivers of misinformation belief and resistance to correction
- Zajonc: Mere Exposure Effect
- Hasher / Goldstein / Toppino: Frequency and the Conference of Referential Validity
- Andy Clark: predictive processing / embodied cognition

## Quantenphysik / Zukunftstechnologien

- APS Reviews of Modern Physics: Colloquium Quantum Batteries, https://link.aps.org/doi/10.1103/RevModPhys.96.031001
- ACS Energy Letters: Perovskite Quantum Dot Solar Cells, https://pubs.acs.org/doi/abs/10.1021/acsenergylett.3c01983
- CSIRO Quantum Battery Research, https://research.csiro.au/quantumbattery/research/quantum-batteries/

## Energie / Strommarkt / Systemkosten

- Fraunhofer ISE: Levelized Cost of Electricity - Renewable Energy Technologies, https://www.ise.fraunhofer.de/en/publications/studies/cost-of-electricity.html
- Fraunhofer ISE LCOE Study 2024 PDF, https://www.ise.fraunhofer.de/content/dam/ise/en/documents/publications/studies/EN2024_ISE_Study_Levelized_Cost_of_Electricity_Renewable_Energy_Technologies.pdf
- Bundesnetzagentur Netzentgelte, https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Netzentgelte/start.html
- Bundesnetzagentur Glossar Netzentgelt, https://www.bundesnetzagentur.de/SharedDocs/A_Z_Glossar/N/Netzentgelt.html
- Bundesnetzagentur Redispatch, https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Versorgungssicherheit/Netzengpassmanagement/Engpassmanagement/Redispatch/start.html
- SMARD: So funktioniert der Strommarkt, https://www.smard.de/page/en/wiki-article/5884/5840/this-is-how-the-electricity-market-works
- IEA Glossary / Demand Response, https://www.iea.org/glossary
- IEA Electricity Market Design, https://www.iea.org/reports/electricity-market-design
- IEA: Energy Security, https://www.iea.org/topics/energy-security
- Agora Energiewende: Strommarktdesign und Energiewende, https://www.agora-energiewende.de/
- SMARD: Strommarkt, Merit Order und Netzebenen, https://www.smard.de/
- Umweltbundesamt: Energie und Emissionen, https://www.umweltbundesamt.de/themen/klima-energie
- AG Energiebilanzen, https://ag-energiebilanzen.de/
- VDE FNN: technische Anschlussregeln, https://www.vde.com/de/fnn/themen/tar
- ACER: European energy market regulation, https://www.acer.europa.eu/
- Interne WÖk-Quelle: Die neue Ordnung des Wohlstands 2026, Energie als Betriebssystem moderner Gesellschaft
- Interne WÖk-Quelle: Systemmodell der Wirkungsökonomie, kommunale Energie, Energieautonomie, Speicher, Lastmanagement, Wärmenetze
- Interne WÖk-Quelle: WÖk Master Items zu SDG 7, erneuerbaren Energien, Energieeffizienz, spezifischen Stromemissionen, Energiearmut, Netzverlusten und Energiedaten in Lieferketten

## Batterien / Ladeinfrastruktur / Netzanschluss

- Bundesnetzagentur: Öffentliche Ladeinfrastruktur, https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/E-Mobilitaet/start.html
- NOW GmbH: Einfach laden am Depot, https://www.now-gmbh.de/wp-content/uploads/2023/11/Einfach-laden-am-Depot_Leitfaden.pdf
- VDE: Technischer Leitfaden Ladeinfrastruktur Elektromobilität, https://www.vde.com/resource/blob/988408/87ed1f99814536d66c99797a4545ad5d/technischer-leitfaden-ladeinfrastruktur-elektromobilitaet---version-4-data.pdf
- BDEW: Anwendungshilfe Netzanschluss von Ladesäulen in der Mittelspannung, https://www.bdew.de/energie/vnb-anwendungshilfe-ii-netzanschluss-ladesaeulen-mittelspannung/
- VDE FNN: Technische Anschlussregel Mittelspannung VDE-AR-N 4110, https://www.vde.com/de/fnn/themen/tar/tar-mittelspannung-vde-ar-n-4110
- SMARD: Netzebenen, https://www.smard.de/page/home/wiki-article/446/214010/netzebenen
- Regulation (EU) 2023/1542 on batteries and waste batteries, https://eur-lex.europa.eu/eli/reg/2023/1542/oj/eng
- European Commission: Batteries, https://environment.ec.europa.eu/topics/waste-and-recycling/batteries_en
- VDE Infopapier zur Batterieverordnung, https://www.vde.com/resource/blob/2308300/0609b56a29220934a4276b673c76c176/download-infopapier-zur-batterieverordnung-data.pdf
- Battery Pass Consortium, https://thebatterypass.eu/
- Umweltbundesamt: Rotorblattaufbereitung und Recycling, https://www.umweltbundesamt.de/themen/abfall-ressourcen/produktverantwortung-in-der-abfallwirtschaft/windenergieanlagen/rotorblattaufbereitung-recycling-von
- Umweltbundesamt: Entwicklung von Rückbau- und Recyclingstandards für Rotorblätter, https://www.umweltbundesamt.de/publikationen/entwicklung-von-rueckbau-recyclingstandards-fuer
- WindEurope: Circularity, https://windeurope.org/about-wind/circularity/
- WindEurope: Where do wind turbine blades go when they are decommissioned?, https://windeurope.org/news/where-do-wind-turbine-blades-go-when-they-are-decommissioned/

## Design / Business

- IDEO Design Thinking, https://designthinking.ideo.com/
- Stanford d.school, https://dschool.stanford.edu/
- Strategyzer Business Model Canvas, https://www.strategyzer.com/library/the-business-model-canvas
- Strategyzer Value Proposition Canvas, https://www.strategyzer.com/library/the-value-proposition-canvas
`;
fs.writeFileSync(sourcesPath, sourceMarkdown);

const processMarkdown = `# Glossar-Publizierungsprozess

Stand: ${today}

Bei jedem neuen Artikel oder jeder größeren Überarbeitung gilt:

1. Artikeltext scannen.
2. Erklärungsbedürftige Begriffe markieren.
3. Prüfen, ob ein Glossareintrag existiert.
4. Erste fachlich relevante Nennung verlinken oder durch Hover verfügbar machen.
5. Fehlende Begriffe als Kandidaten ins Backlink-Audit aufnehmen.
6. Relevanz prüfen: wiederkehrend, erklärungsbedürftig, eigene WÖk-Einordnung, Quellenlage, verwandte Begriffe.
7. Bei mindestens drei positiven Kriterien Glossarbegriff anlegen.
8. Related-Terms bidirektional ergänzen.
9. Quellen und Begriffstatus hinterlegen.
10. Suchindex, Sitemap, Glossarübersicht und Hover-Datei neu bauen.
11. Interne Linkprüfung ausführen.
12. Link-Überladung vermeiden: pro Seite nur die erste fachlich zentrale Nennung, bei langen Artikeln zusätzlich in einem späteren Hauptabschnitt.

Begriffstatus:

- WÖk-Kernbegriff
- WÖk-Präzisierungsbegriff
- Anschlussbegriff
- Methodenbegriff
- Wirtschaftssystem / Gesellschaftsmodell
- Quellen-/Bezugslinienbegriff
- Vordenker-/Bezugslinienbegriff
- Artikel-only / nicht ins Glossar

Publikationsstatus:

- published
- draft
- needs_source_check
- article_only
- deprecated
- merge_candidate
`;
fs.writeFileSync(processPath, processMarkdown);

const backlinkTerms = [...feminismCareTerms, ...liberalMarketTerms, ...actorsInfluenceTerms, ...fascismRiskTerms, ...arendtTerms, ...stateGovTerms, ...regimeFormTerms].filter((item) => item.publicationStatus === "published").map((item) => ({
  termId: item.termId,
  label: item.canonicalLabel,
  aliases: item.aliases,
}));
const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || ["node_modules", ".git", "begriffe", "assets"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
walk(root);
const audit = {
  generatedAt: new Date().toISOString(),
  rule: "Nicht jede Nennung verlinken. Pro Seite maximal die erste fachlich zentrale Nennung, bei langen Artikeln zusätzlich in einem späteren Hauptabschnitt.",
  newTerms: backlinkTerms.length,
  backlog: [
    "Empathy Map",
    "User Journey",
    "Minimum Viable Product",
    "Lean Startup",
    "Validated Learning",
    "Additionalität",
    "Leakage",
    "Permanenz",
    "Offsetting",
    "Carbon Removal",
    "Carbon Capture",
    "Scope-3-Kategorien im Detail",
    "weitere Behavioral-Economics-Effekte nur bei konkreter Verwendung",
    "Platon",
    "Höhlengleichnis",
    "Aristoteles",
    "Hegel",
    "Nietzsche",
    "Habermas",
    "Foucault",
    "Bourdieu",
    "Rawls",
    "Jonas",
    "Latour",
    "Nassehi",
    "Rosa",
  ],
  terms: [],
};
for (const item of backlinkTerms) {
  const needles = unique(item.aliases).filter((alias) => alias.length > 3).slice(0, 6);
  const occurrences = [];
  for (const file of htmlFiles) {
    const rel = path.relative(root, file);
    if (rel.includes("node_modules") || rel.includes("assets/downloads")) continue;
    const text = fs.readFileSync(file, "utf8");
    const matched = needles.find((needle) => new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text));
    if (matched) occurrences.push({ file: rel, matched });
    if (occurrences.length >= 12) break;
  }
  audit.terms.push({
    termId: item.termId,
    label: item.label,
    suggestedPages: occurrences,
    action: occurrences.length ? "first_relevant_occurrence_hover_available_or_link_candidate" : "no_existing_occurrence_found",
  });
}
fs.writeFileSync(backlinkAuditPath, `${JSON.stringify(audit, null, 2)}\n`);

console.log(`Updated ${terms.length} glossary terms with architecture clusters.`);
console.log(`Wrote ${path.relative(root, sourcesPath)}, ${path.relative(root, processPath)} and ${path.relative(root, backlinkAuditPath)}.`);
