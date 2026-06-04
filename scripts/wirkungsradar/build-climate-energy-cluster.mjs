import fs from "node:fs";
import path from "node:path";
import { renderRadarTopicMapPage } from "./topic-map-template.mjs";

const UPDATED_AT = "2026-06-03";
const ASSET_VERSION = "20260603-co2-systemkosten";

const sourcePack = {
  id: "climate-energy-v1",
  last_verified: UPDATED_AT,
  update_frequency: "quarterly",
  primary_sources: [
    {
      label: "IPCC AR6 Synthesis Report - Headline Statements",
      publisher: "IPCC",
      url: "https://www.ipcc.ch/report/ar6/syr/resources/spm-headline-statements/",
      type: "wissenschaft",
      use_for: ["Klimawandel Grundlagen", "menschliche Ursache", "Risiken je Erwärmungsgrad", "Dringlichkeit", "Mitigation und Anpassung"],
    },
    {
      label: "Umweltbundesamt - Treibhausgas-Emissionen in Deutschland",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/daten/umweltzustand-trends/klima/treibhausgas-emissionen-in-deutschland",
      type: "amtlich",
      use_for: ["Deutschland Emissionen", "Sektoren", "Trends", "Datenstand Deutschland"],
    },
    {
      label: "EDGAR/JRC - globale Treibhausgasemissionen 2025 Report",
      publisher: "European Commission JRC / EDGAR",
      url: "https://edgar.jrc.ec.europa.eu/report_2025",
      type: "datenbank",
      use_for: ["globale Treibhausgasemissionen", "Vergleichsgröße", "territoriale Anteile"],
    },
    {
      label: "Umweltbundesamt - Treibhausgasemissionen pro Person",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/service/uba-fragen/wie-hoch-sind-die-treibhausgasemissionen-pro-person",
      type: "amtlich",
      use_for: ["Konsumemissionen", "Import-Export-Berücksichtigung", "deutscher Pro-Kopf-Fußabdruck"],
    },
    {
      label: "Eurostat - Greenhouse gas emission footprints",
      publisher: "Eurostat",
      url: "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Greenhouse_gas_emission_footprints",
      type: "datenbank",
      use_for: ["Konsum-Fußabdruck", "produktionsbasierte und konsumbasierte Bilanz", "EU-Länder Vergleich"],
    },
    {
      label: "Eurostat - Methodik Konsumperspektive",
      publisher: "Eurostat",
      url: "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Greenhouse_gas_emission_footprints",
      type: "methodik",
      use_for: ["Konsumperspektive", "globale Produktionsketten", "Bilanzgrenze Konsum"],
    },
    {
      label: "Umweltbundesamt - Treibhausgas-Projektionen",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/themen/klima-energie/klimaschutz-energiepolitik-in-deutschland/szenarien-projektionen/treibhausgas-projektionen/aktuelle-treibhausgas-projektionen",
      type: "amtlich",
      use_for: ["Zielpfade", "Klimaneutralität 2045", "Sektorale Lücken"],
    },
    {
      label: "Umweltbundesamt - Gesellschaftliche Kosten von Umweltbelastungen",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/daten/umwelt-wirtschaft/gesellschaftliche-kosten-von-umweltbelastungen",
      type: "amtlich",
      use_for: ["gesellschaftliche Umweltkosten", "Klimaschäden", "Gesundheitskosten", "Material- und Ernteschäden"],
    },
    {
      label: "Umweltbundesamt - Umweltkosten von Energie und Straßenverkehr",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/daten/umweltindikatoren/indikator-umweltkosten-von-energie-strassenverkehr",
      type: "amtlich",
      use_for: ["Umweltkosten 2022", "Straßenverkehr", "Strom- und Wärmeerzeugung", "Luftschadstoffe"],
    },
    {
      label: "Umweltbundesamt - nEHS-Versteigerungen 2026",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/presse/pressemitteilungen/erstmals-versteigerungen-im-nationalen",
      type: "amtlich",
      use_for: ["nationaler Emissionshandel", "CO₂-Preis 2025", "Preiskorridor 2026"],
    },
    {
      label: "Umweltbundesamt - Emissionshandel 21 Milliarden Euro",
      publisher: "Umweltbundesamt / DEHSt",
      url: "https://www.umweltbundesamt.de/presse/pressemitteilungen/emissionshandel-21-milliarden-euro-fliessen-in-den",
      type: "amtlich",
      use_for: ["Emissionshandelserlöse", "Klima- und Transformationsfonds", "nEHS-Einnahmen 2025"],
    },
    {
      label: "GWS - Volkswirtschaftliche Folgekosten durch Klimawandel",
      publisher: "GWS",
      url: "https://www.gws-os.com/de/publikationen/alle-publikationen/detail/volkswirtschaftliche-folgekosten-durch-klimawandel-szenarioanalyse-bis-2050",
      type: "wissenschaft",
      use_for: ["Klimafolgekosten", "Szenarioanalyse", "Anpassungskosten"],
    },
    {
      label: "Umweltbundesamt - Methodenkonvention Umweltkosten 4.0",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/system/files/medien/479/publikationen/2026-02/UBA_Handbuch%20Umweltkosten_Methodenkonvention%204.0.pdf",
      type: "methodik",
      use_for: ["Kostensätze", "Treibhausgase", "Luftschadstoffe", "Modellwerte"],
    },
    {
      label: "Fraunhofer ISE / Energy-Charts",
      publisher: "Fraunhofer ISE",
      url: "https://www.energy-charts.info/charts/energy/chart.htm?l=de&c=DE",
      type: "datenbank",
      use_for: ["Strommix Deutschland", "Erneuerbare Stromerzeugung", "Energiewende Fakten"],
    },
    {
      label: "Fraunhofer ISE - Stromgestehungskosten 2024",
      publisher: "Fraunhofer ISE",
      url: "https://www.ise.fraunhofer.de/en/publications/studies/cost-of-electricity.html",
      type: "wissenschaft",
      use_for: ["CAPEX/OPEX", "Stromgestehungskosten", "PV/Wind vs fossil/nuklear", "Industrie-Stromkostenlogik"],
    },
    {
      label: "Volkswagen/PowerCo - Salzgitter Gigafactory",
      publisher: "Volkswagen Group / PowerCo",
      url: "https://www.volkswagen-group.com/en/press-releases/start-of-european-battery-cell-production-powerco-commissions-salzgitter-gigafactory-20045",
      type: "industrie_primärquelle",
      use_for: ["Batteriezellfertigung Deutschland", "technologische Souveränität", "Industriecluster"],
    },
    {
      label: "TSMC - ESMC Dresden",
      publisher: "TSMC",
      url: "https://pr.tsmc.com/english/news/3049",
      type: "industrie_primärquelle",
      use_for: ["Halbleiter Deutschland", "Dresden", "Automotive / Industrie / IoT", "40.000 Wafer pro Monat", "Produktionsziel Ende 2027"],
    },
    {
      label: "Infineon - Smart Power Fab Dresden",
      publisher: "Infineon",
      url: "https://www.infineon.com/press-release/2025/INFXX202505-100",
      type: "industrie_primärquelle",
      use_for: ["Leistungshalbleiter", "Erneuerbare", "effiziente Rechenzentren", "Elektromobilität"],
    },
    {
      label: "Bosch - Wafer Fab Dresden",
      publisher: "Bosch",
      url: "https://www.bosch-semiconductors.com/about-us/where-we-produce/dresden/",
      type: "industrie_primärquelle",
      use_for: ["bestehendes Halbleitercluster", "Automotive", "Industrieanwendungen"],
    },
    {
      label: "GTAI - Data Center Germany",
      publisher: "Germany Trade & Invest",
      url: "https://www.gtai.de/en/invest/industries/digital-economy/data-center",
      type: "standortdaten",
      use_for: ["Rechenzentren Deutschland", "digitale Infrastruktur", "Nachhaltigkeit", "Fachkräfte"],
    },
    {
      label: "Reuters - Tesla Batteriezellproduktion Grünheide",
      publisher: "Reuters",
      url: "https://www.reuters.com/business/autos-transportation/tesla-launches-battery-cell-output-germany-gruenheide-site-manager-says-2025-12-16/",
      type: "nachricht",
      use_for: ["Tesla Grünheide", "Batteriezellproduktion", "Projektstatus"],
    },
    {
      label: "electrive - CATL production in Germany",
      publisher: "electrive",
      url: "https://www.electrive.com/2023/01/26/catl-starts-production-in-germany/",
      type: "branchenquelle",
      use_for: ["CATL Thüringen", "Batteriezellfertigung", "Produktionsstart"],
    },
    {
      label: "electrive - Heide / Northvolt / Lyten",
      publisher: "electrive",
      url: "https://www.electrive.com/2025/11/07/what-lyten-is-planning-in-heide-and-how-the-battery-cell-factory-can-be-saved/",
      type: "branchenquelle",
      use_for: ["Heide", "Batteriezellprojekt", "Projektänderung"],
    },
    {
      label: "Reuters - ACC drops German and Italian gigafactory plans",
      publisher: "Reuters",
      url: "https://www.reuters.com/business/autos-transportation/acc-drops-plans-german-italian-ev-battery-gigafactories-2025-06-04/",
      type: "nachricht",
      use_for: ["ACC Kaiserslautern", "Projektunsicherheit", "Batteriemarkt"],
    },
    {
      label: "IEA - Renewables",
      publisher: "International Energy Agency",
      url: "https://www.iea.org/energy-system/renewables",
      type: "wissenschaft_daten",
      use_for: ["globaler Ausbau erneuerbarer Energien", "Solar und Wind", "Net Zero Pfade"],
    },
    {
      label: "GHG Protocol - Corporate Value Chain Scope 3 Standard",
      publisher: "GHG Protocol",
      url: "https://ghgprotocol.org/corporate-value-chain-scope-3-standard",
      type: "standard",
      use_for: ["Scope 3", "Use of Sold Products", "Wertschöpfungskettenemissionen"],
    },
    {
      label: "Destatis - 3.4 million new cars exported from Germany in 2024",
      publisher: "Statistisches Bundesamt",
      url: "https://www.destatis.de/EN/Press/2025/03/PE25_110_51.html",
      type: "amtlich",
      use_for: ["Autoexporte Deutschland", "exportierte Produktnutzung", "Antriebsarten 2024"],
    },
    {
      label: "Our World in Data - Share of global cumulative CO2 emissions",
      publisher: "Our World in Data",
      url: "https://ourworldindata.org/grapher/share-of-cumulative-co2",
      type: "datenbank",
      use_for: ["historische Emissionen", "kumulative Klimawirkung", "Jahresanteil versus Historie"],
    },
    {
      label: "Umweltbundesamt - Klimavorteil für E-Autos bestätigt",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/presse/pressemitteilungen/klimavorteil-fuer-e-autos-bestaetigt",
      type: "amtlich",
      use_for: ["E-Auto Lebenszyklus", "Batterie und Strommix", "Mobilitätsmythen"],
    },
    {
      label: "ICCT - Life-cycle greenhouse gas emissions from passenger cars in Europe",
      publisher: "ICCT",
      url: "https://theicct.org/publication/electric-cars-life-cycle-analysis-emissions-europe-jul25/",
      type: "wissenschaft",
      use_for: ["Lebenszyklusvergleich E-Auto Verbrenner", "EU-Fahrzeugemissionen"],
    },
    {
      label: "IEA - Global EV Outlook 2024",
      publisher: "International Energy Agency",
      url: "https://www.iea.org/reports/global-ev-outlook-2024/executive-summary",
      type: "wissenschaft_daten",
      use_for: ["Batteriemarkt", "LFP-Anteil", "Batteriekosten", "Elektromobilität"],
    },
    {
      label: "Fraunhofer ISI - Batterien für Elektroautos Faktencheck 2025",
      publisher: "Fraunhofer ISI",
      url: "https://www.isi.fraunhofer.de/content/dam/isi/dokumente/policy-briefs/2025-05_policy_brief_batterien_elektroautos_update_faktencheck_handlungsbedarf.pdf",
      type: "wissenschaft",
      use_for: ["Batteriechemien", "Rohstoffe", "Recycling", "Lebensdauer", "Handlungsbedarf"],
    },
    {
      label: "EU - Regulation 2023/1542 on batteries and waste batteries",
      publisher: "European Union",
      url: "https://eur-lex.europa.eu/eli/reg/2023/1542/oj/eng",
      type: "gesetz",
      use_for: ["Batteriepass", "CO₂-Fußabdruck", "Sorgfaltspflichten", "Recyclingziele", "Rezyklatanteile"],
    },
    {
      label: "Fraunhofer ILT - Recycling von LFP-Batterien",
      publisher: "Fraunhofer ILT",
      url: "https://www.ilt.fraunhofer.de/de/presse/pressemitteilungen/2022/11-3-nachhaltiges-recycling-von-lfp-batterien.html",
      type: "wissenschaft_technik",
      use_for: ["LFP ohne Kobalt und Nickel", "LFP-Recycling", "Kreislaufwirtschaft"],
    },
    {
      label: "BGR - Lithium aus Tiefenwässern in Deutschland",
      publisher: "Bundesanstalt für Geowissenschaften und Rohstoffe",
      url: "https://www.bgr.bund.de/DE/Gemeinsames/Oeffentlichkeitsarbeit/Pressemitteilungen/BGR/bgr-2024-04-25_lithium_aus_tiefenwaessern.html",
      type: "amtlich_wissenschaft",
      use_for: ["Lithium aus Tiefenwässern", "Norddeutsches Becken", "Oberrheingraben", "deutsche Rohstoffpotenziale"],
    },
    {
      label: "Fraunhofer ISE - Lithium aus geothermalen Solen im Oberrheingraben",
      publisher: "Fraunhofer ISE",
      url: "https://www.ise.fraunhofer.de/de/presse-und-medien/news/2024/Lithium-aus-geothermalen-Solen-im-Oberrheingraben-Fraunhofer-ISE-entwickelt-mit-Partnern-neues-Verfahren-zur-direkten-Lithiumgewinnung.html",
      type: "wissenschaft_technik",
      use_for: ["direkte Lithiumgewinnung", "geothermale Solen", "Oberrheingraben", "Filter-/Extraktionsverfahren"],
    },
    {
      label: "BMV - Förderrichtlinie öffentlich zugängliche Ladeinfrastruktur",
      publisher: "Bundesministerium für Verkehr",
      url: "https://www.bmv.de/SharedDocs/DE/Anlage/G/foerderrichtlinie-oeffentlich-zugaengliche-ladeinfrastruktur.pdf?__blob=publicationFile",
      type: "foerderrecht",
      use_for: ["geförderte Ladeinfrastruktur", "Strom aus erneuerbaren Energien", "öffentliche Ladepunkte"],
    },
    {
      label: "NIST - Understanding the Risk of Lithium-Ion Battery Fires",
      publisher: "National Institute of Standards and Technology",
      url: "https://www.nist.gov/publications/understanding-risk-lithium-ion-battery-fires-multi-source-data-analysis",
      type: "wissenschaft",
      use_for: ["Batteriebrandrisiko", "Elektrofahrzeugbrände", "Sicherheitsbewertung"],
    },
    {
      label: "Bundesnetzagentur - öffentliche Ladeinfrastruktur Deutschland",
      publisher: "Bundesnetzagentur",
      url: "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/E-Mobilitaet/start.html",
      type: "amtlich",
      use_for: ["Ladeinfrastruktur Deutschland", "Normalladepunkte", "Schnellladepunkte", "Ladeleistung"],
    },
    {
      label: "Deutschlandnetz - HPC-Schnellladepunkte",
      publisher: "Deutschlandnetz",
      url: "https://www.deutschlandnetz.de/standorte",
      type: "infrastruktur",
      use_for: ["HPC-Schnellladen", "Autobahn-Ladeparks", "Flächenabdeckung"],
    },
    {
      label: "BMV - Deutschlandnetz",
      publisher: "Bundesministerium für Verkehr",
      url: "https://bmdv.bund.de/SharedDocs/DE/Artikel/G/deutschlandnetz.html",
      type: "infrastrukturpolitik",
      use_for: ["Deutschlandnetz", "Schnellladeinfrastruktur", "Autobahn- und Regionallose"],
    },
    {
      label: "IEA - EV charging infrastructure",
      publisher: "International Energy Agency",
      url: "https://www.iea.org/reports/global-ev-outlook-2024/trends-in-electric-vehicle-charging",
      type: "internationaler_marktbericht",
      use_for: ["EV-Ladeinfrastruktur", "öffentliche Ladepunkte", "Schnellladen", "Ladeausbau"],
    },
    {
      label: "EU AFIR - Alternative Fuels Infrastructure Regulation",
      publisher: "Europäische Kommission",
      url: "https://transport.ec.europa.eu/transport-themes/clean-transport/alternative-fuels-sustainable-mobility-europe/alternative-fuels-infrastructure_en",
      type: "regulierung",
      use_for: ["TEN-T Ladeziele", "schwere Fahrzeuge", "Zahlung", "Preistransparenz", "Nutzerfreundlichkeit"],
    },
    {
      label: "CharIN - Megawatt Charging System",
      publisher: "CharIN",
      url: "https://www.charin.global/technology/mcs/",
      type: "standard_technik",
      use_for: ["Megawattladen", "E-Lkw", "Busse", "Schwerlastverkehr"],
    },
    {
      label: "HoLa - Hochleistungsladen Lkw",
      publisher: "HoLa Projekt",
      url: "https://hochleistungsladen-lkw.de/hola-en/results/megawatt_charging_networks.php",
      type: "projekt_wissenschaft",
      use_for: ["E-Lkw Ladefenster", "MCS", "400 kWh Beispiel", "Pausenlogik"],
    },
    {
      label: "EU - Lenk- und Ruhezeiten Straßentransport",
      publisher: "Europäische Union",
      url: "https://europa.eu/youreurope/business/human-resources/transport-sector-workers/road-transportation-workers/index_en.htm",
      type: "regulierung",
      use_for: ["4,5 Stunden Fahrzeit", "45 Minuten Pause", "Lkw-Ladefenster"],
    },
    {
      label: "Umweltbundesamt - Windenergie an Land",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/themen/klima-energie/erneuerbare-energien/windenergie-an-land",
      type: "amtlich",
      use_for: ["Windkraft", "Artenschutz", "Planung und Genehmigung"],
    },
    {
      label: "Umweltbundesamt - Ausbau Windenergie an Land 2-Prozent-Ziel",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/themen/ausbau-der-windenergie-an-land-2-prozent-ziel",
      type: "amtlich",
      use_for: ["2-Prozent-Flächenziel", "Ausbauziele Windenergie an Land", "Flächenbedarf"],
    },
    {
      label: "Windenergieflächenbedarfsgesetz",
      publisher: "Bundesministerium der Justiz / Gesetze im Internet",
      url: "https://www.gesetze-im-internet.de/windbg/BJNR135310022.html",
      type: "gesetz",
      use_for: ["rechtlicher Rahmen", "Flächenbeitragswerte", "Windenergie an Land"],
    },
    {
      label: "BfN - Windenergie im Wald",
      publisher: "Bundesamt für Naturschutz",
      url: "https://www.bfn.de/windenergie-im-wald",
      type: "amtlich_fachlich",
      use_for: ["Waldstandorte", "Arten- und Naturschutz", "sorgfältige Standortprüfung"],
    },
    {
      label: "BfN - Windenergie an Land",
      publisher: "Bundesamt für Naturschutz",
      url: "https://www.bfn.de/windenergie-land",
      type: "amtlich_fachlich",
      use_for: ["Windenergie an Land", "Naturschutzkonflikte", "Genehmigungsfragen"],
    },
    {
      label: "BfN - Vögel, Windenergie und Signifikanz",
      publisher: "Bundesamt für Naturschutz",
      url: "https://www.bfn.de/voegel-windenergie-und-signifikanz",
      type: "amtlich_fachlich",
      use_for: ["Vogelschutz", "Antikollisionssysteme", "Abschaltungen", "Minderungsmaßnahmen"],
    },
    {
      label: "Umweltbundesamt - Windenergieanlagen Rückbau Recycling Repowering",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/themen/abfall-ressourcen/produktverantwortung-in-der-abfallwirtschaft/windenergieanlagen-rueckbau-recycling-repowering",
      type: "amtlich",
      use_for: ["Rückbau", "Fundamente", "Beton und Stahl", "Recycling", "Repowering"],
    },
    {
      label: "Umweltbundesamt - Infraschall von Windenergieanlagen",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/system/files/medien/4031/publikationen/umid_01-2021-infraschall.pdf",
      type: "amtlich_wissenschaft",
      use_for: ["Infraschall", "Gesundheitswirkung", "wissenschaftlicher Stand"],
    },
    {
      label: "Fraunhofer ISE - Stromgestehungskosten 2024",
      publisher: "Fraunhofer ISE",
      url: "https://www.ise.fraunhofer.de/de/veroeffentlichungen/studien/studie-stromgestehungskosten-erneuerbare-energien.html",
      type: "wissenschaft",
      use_for: ["Kostenvergleich", "Onshore-Wind", "Offshore-Wind", "Erneuerbare und konventionelle Erzeugung"],
    },
    {
      label: "Umweltbundesamt - Emissionsbilanz erneuerbarer Energieträger",
      publisher: "Umweltbundesamt",
      url: "https://www.umweltbundesamt.de/sites/default/files/medien/11850/publikationen/03_2025_cc_emissionsbilanz_erneuerbarer_energien_2023.pdf",
      type: "amtlich",
      use_for: ["vermiedene Emissionen", "Erneuerbare Energien", "Systemnutzen"],
    },
    {
      label: "BASE - Endlagersuche",
      publisher: "Bundesamt für die Sicherheit der nuklearen Entsorgung",
      url: "https://www.base.bund.de/de/endlager/endlagersuche/endlagersuche_inhalt.html",
      type: "amtlich",
      use_for: ["Kernenergie", "Atommüll", "Endlagerung"],
    },
    {
      label: "BASE - Ausstieg aus der Atomkraft",
      publisher: "Bundesamt für die Sicherheit der nuklearen Entsorgung",
      url: "https://www.base.bund.de/de/nukleare-sicherheit/atomausstieg/ausstieg-atomkraft/ausstieg-atomkraft_inhalt.html",
      type: "amtlich",
      use_for: ["Abschaltung letzte drei AKW 15. April 2023", "Atomausstieg Deutschland"],
    },
    {
      label: "BMUV - Atomkraftwerke in Deutschland",
      publisher: "Bundesministerium für Umwelt, Klimaschutz, Naturschutz und nukleare Sicherheit",
      url: "https://www.bundesumweltministerium.de/themen/nukleare-sicherheit/aufsicht-ueber-atomkraftwerke/atomkraftwerke-in-deutschland",
      type: "amtlich",
      use_for: ["Berechtigungen zum Leistungsbetrieb erloschen", "Emsland, Isar 2, Neckarwestheim 2"],
    },
    {
      label: "BGE - Endlagersuche für hochradioaktive Abfälle",
      publisher: "Bundesgesellschaft für Endlagerung",
      url: "https://www.bge.de/de/endlagersuche/",
      type: "amtlich",
      use_for: ["hochradioaktiver Abfall", "5 Prozent Menge und 99 Prozent Radioaktivität", "Standortauswahl"],
    },
    {
      label: "BASE - Zeitperspektive Endlagersuche",
      publisher: "Bundesamt für die Sicherheit der nuklearen Entsorgung",
      url: "https://www.base.bund.de/de/endlager/endlager-sicherheit/zeitperspektive/zeitbedarf-endlagersuche_inhalt.html",
      type: "amtlich",
      use_for: ["Zeitbedarf Endlagersuche", "Standortauswahlgesetz"],
    },
    {
      label: "BASE - Transmutation hochradioaktiver Abfälle",
      publisher: "Bundesamt für die Sicherheit der nuklearen Entsorgung",
      url: "https://www.base.bund.de/de/nukleare-sicherheit/kerntechnik/partitionierung-transmutation/partitionierung-transmutation.html",
      type: "amtlich",
      use_for: ["Transmutation", "Endlager bleibt erforderlich", "hochradioaktive Abfälle"],
    },
    {
      label: "OECD NEA - Financing nuclear new build",
      publisher: "OECD Nuclear Energy Agency",
      url: "https://www.oecd-nea.org/upload/docs/application/pdf/2024-09/nea_publication_2_2024-09-18_16-50-13_471.pdf",
      type: "fachbericht",
      use_for: ["Finanzierung neuer Kernkraft", "Kosten- und Verzögerungsrisiken", "staatliche Risikoübernahme"],
    },
    {
      label: "IAEA - SMR Platform Annual Report",
      publisher: "International Atomic Energy Agency",
      url: "https://nucleus.iaea.org/sites/smr/Shared%20Documents/IAEA%20SMR%20Platform%20Annual%20Report%202025.pdf",
      type: "fachbericht",
      use_for: ["SMR-Forschung", "Sicherheits-, Rechts- und Infrastrukturfragen"],
    },
    {
      label: "ITER - Updated baseline and timeline",
      publisher: "ITER Organization",
      url: "https://www.iter.org/few-lines",
      type: "wissenschaft_technik",
      use_for: ["ITER Zeitplan", "2036 volle magnetische Energie", "2039 Deuterium-Tritium-Betrieb"],
    },
    {
      label: "Max-Planck-Institut für Plasmaphysik - Neuer ITER-Zeitplan",
      publisher: "Max-Planck-Institut für Plasmaphysik",
      url: "https://www.ipp.mpg.de/5434926/ITER_baseline_2024",
      type: "wissenschaft_technik",
      use_for: ["wissenschaftliche Einordnung ITER-Zeitplan", "2034 wissenschaftlicher Betrieb", "2036 volle magnetische Energie"],
    },
    {
      label: "LLNL / National Ignition Facility - Achieving Fusion Ignition",
      publisher: "Lawrence Livermore National Laboratory",
      url: "https://lasers.llnl.gov/science/achieving-fusion-ignition",
      type: "wissenschaft_technik",
      use_for: ["Fusionszündung", "Target Gain", "NIF-Ergebnisse"],
    },
    {
      label: "STEP Fusion - UK prototype fusion powerplant",
      publisher: "STEP Fusion",
      url: "https://stepfusion.com/",
      type: "wissenschaft_technik",
      use_for: ["Prototyp-Ziel bis 2040", "UK-Programm"],
    },
    {
      label: "EUROfusion - DEMO",
      publisher: "EUROfusion",
      url: "https://euro-fusion.org/programme/demo/",
      type: "wissenschaft_technik",
      use_for: ["Fusionskraftwerke", "DEMO", "Technologiereife"],
    },
    {
      label: "IAEA - Tritium Breeding",
      publisher: "International Atomic Energy Agency",
      url: "https://nucleus.iaea.org/sites/connect/FUSEpublic/SitePages/Tritium-Breeding.aspx",
      type: "wissenschaft_technik",
      use_for: ["Tritium-Selbstversorgung", "Breeding Blankets", "Brennstoffkreislauf"],
    },
    {
      label: "ITER - Tritium breeding",
      publisher: "ITER Organization",
      url: "https://www.iter.org/machine/supporting-systems/tritium-breeding",
      type: "wissenschaft_technik",
      use_for: ["ITER Test Blanket Modules", "Brutblanket-Technologie"],
    },
    {
      label: "UKAEA - Materials challenges for commercial fusion",
      publisher: "UK Atomic Energy Authority",
      url: "https://scientific-publications.ukaea.uk/wp-content/uploads/UKAEA-CCFE-PR2152.PDF",
      type: "fachbericht",
      use_for: ["Materialschäden", "Tritium", "Neutronenbeschuss"],
    },
  ],
};

const deepDiveSourcePack = {
  id: "deep-dive-climate-energy-v1",
  last_verified: UPDATED_AT,
  update_frequency: "quarterly",
  sources: {
    ipcc_ar6_headline: {
      label: "IPCC AR6 Synthesis Report - Headline Statements",
      url: "https://www.ipcc.ch/report/ar6/syr/resources/spm-headline-statements/",
      type: "wissenschaft",
      relevance: ["Klimawissenschaft", "Risiken je Erwärmungsgrad", "menschliche Ursache"],
    },
    ipcc_wg1_headline: {
      label: "IPCC AR6 WGI - Headline Statements",
      url: "https://www.ipcc.ch/report/ar6/wg1/resources/spm-headline-statements/",
      type: "wissenschaft",
      relevance: ["menschlicher Einfluss", "Atmosphäre, Ozean, Land"],
    },
    uba_emissions_germany: {
      label: "Umweltbundesamt - Treibhausgasemissionen Deutschland",
      url: "https://www.umweltbundesamt.de/daten/umweltzustand-trends/klima/treibhausgas-emissionen-in-deutschland",
      type: "amtlich",
      relevance: ["Deutschland Emissionen", "Klimaziele", "Sektortrends"],
    },
    fraunhofer_ise_energy_charts: {
      label: "Fraunhofer ISE / Energy-Charts",
      url: "https://www.energy-charts.info/charts/energy/chart.htm?l=de&c=DE",
      type: "datenbank",
      relevance: ["Strommix", "erneuerbare Energien", "Energiewende"],
    },
    icct_lca_ev_2025: {
      label: "ICCT - Life-cycle greenhouse gas emissions from passenger cars in Europe, 2025",
      url: "https://theicct.org/publication/electric-cars-life-cycle-analysis-emissions-europe-jul25/",
      type: "wissenschaft",
      relevance: ["E-Auto Lebenszyklus", "Verbrennervergleich", "Batterie und Strommix"],
    },
    iea_global_ev_2024: {
      label: "IEA - Global EV Outlook 2024",
      url: "https://www.iea.org/reports/global-ev-outlook-2024/executive-summary",
      type: "wissenschaft_daten",
      relevance: ["Elektromobilität", "Batteriechemien", "LFP-Anteil", "Batteriemarkt"],
    },
    fraunhofer_isi_battery_facts_2025: {
      label: "Fraunhofer ISI - Batterien für Elektroautos Faktencheck 2025",
      url: "https://www.isi.fraunhofer.de/content/dam/isi/dokumente/policy-briefs/2025-05_policy_brief_batterien_elektroautos_update_faktencheck_handlungsbedarf.pdf",
      type: "wissenschaft",
      relevance: ["Batterierohstoffe", "Recycling", "Lebensdauer", "Batterieproduktion"],
    },
    eu_battery_regulation_2023: {
      label: "EU - Regulation 2023/1542 on batteries and waste batteries",
      url: "https://eur-lex.europa.eu/eli/reg/2023/1542/oj/eng",
      type: "gesetz",
      relevance: ["Batteriepass", "CO₂-Fußabdruck", "Recyclingziele", "Sorgfaltspflichten"],
    },
    fraunhofer_ilt_lfp_recycling: {
      label: "Fraunhofer ILT - Recycling von LFP-Batterien",
      url: "https://www.ilt.fraunhofer.de/de/presse/pressemitteilungen/2022/11-3-nachhaltiges-recycling-von-lfp-batterien.html",
      type: "wissenschaft_technik",
      relevance: ["LFP ohne Kobalt und Nickel", "LFP-Recycling", "Kreislaufwirtschaft"],
    },
    bgr_lithium_tiefenwaesser: {
      label: "BGR - Lithium aus Tiefenwässern in Deutschland",
      url: "https://www.bgr.bund.de/DE/Gemeinsames/Oeffentlichkeitsarbeit/Pressemitteilungen/BGR/bgr-2024-04-25_lithium_aus_tiefenwaessern.html",
      type: "amtlich_wissenschaft",
      relevance: ["Lithium aus Tiefenwässern", "Norddeutsches Becken", "Oberrheingraben", "deutsche Rohstoffpotenziale"],
    },
    fraunhofer_ise_geothermal_lithium: {
      label: "Fraunhofer ISE - Lithium aus geothermalen Solen im Oberrheingraben",
      url: "https://www.ise.fraunhofer.de/de/presse-und-medien/news/2024/Lithium-aus-geothermalen-Solen-im-Oberrheingraben-Fraunhofer-ISE-entwickelt-mit-Partnern-neues-Verfahren-zur-direkten-Lithiumgewinnung.html",
      type: "wissenschaft_technik",
      relevance: ["direkte Lithiumgewinnung", "geothermale Solen", "Oberrheingraben", "Filter-/Extraktionsverfahren"],
    },
    bmv_ladeinfrastruktur_foerderung: {
      label: "BMV - Förderrichtlinie öffentlich zugängliche Ladeinfrastruktur",
      url: "https://www.bmv.de/SharedDocs/DE/Anlage/G/foerderrichtlinie-oeffentlich-zugaengliche-ladeinfrastruktur.pdf?__blob=publicationFile",
      type: "foerderrecht",
      relevance: ["geförderte Ladeinfrastruktur", "erneuerbarer Strom", "öffentliche Ladepunkte"],
    },
    nist_battery_fire_risk: {
      label: "NIST - Understanding the Risk of Lithium-Ion Battery Fires",
      url: "https://www.nist.gov/publications/understanding-risk-lithium-ion-battery-fires-multi-source-data-analysis",
      type: "wissenschaft",
      relevance: ["Batteriebrandrisiko", "Elektrofahrzeugbrände", "Sicherheitsbewertung"],
    },
    bnetza_ladeinfrastruktur_2026: {
      label: "Bundesnetzagentur - öffentliche Ladeinfrastruktur Deutschland",
      url: "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/E-Mobilitaet/start.html",
      type: "amtlich",
      relevance: ["149.002 Normalladepunkte", "51.253 Schnellladepunkte", "8,50 GW Ladeleistung", "Datenstand 01.04.2026"],
    },
    deutschlandnetz_hpc: {
      label: "Deutschlandnetz - HPC-Schnellladepunkte",
      url: "https://www.deutschlandnetz.de/standorte",
      type: "infrastruktur",
      relevance: ["HPC-Schnellladepunkte", "Autobahn-Ladeparks", "Alltags- und Langstreckenladen"],
    },
    bmv_deutschlandnetz: {
      label: "BMV - Deutschlandnetz",
      url: "https://bmdv.bund.de/SharedDocs/DE/Artikel/G/deutschlandnetz.html",
      type: "infrastrukturpolitik",
      relevance: ["Deutschlandnetz", "Schnellladeinfrastruktur", "Autobahn- und Regionallose"],
    },
    iea_ev_charging_infrastructure: {
      label: "IEA - EV charging infrastructure",
      url: "https://www.iea.org/reports/global-ev-outlook-2024/trends-in-electric-vehicle-charging",
      type: "internationaler_marktbericht",
      relevance: ["EV-Ladeinfrastruktur", "öffentliche Ladepunkte", "Schnellladen", "Ladeausbau"],
    },
    eu_afir: {
      label: "EU AFIR - Alternative Fuels Infrastructure Regulation",
      url: "https://transport.ec.europa.eu/transport-themes/clean-transport/alternative-fuels-sustainable-mobility-europe/alternative-fuels-infrastructure_en",
      type: "regulierung",
      relevance: ["TEN-T Ladeziele", "leichte und schwere Fahrzeuge", "Nutzerfreundlichkeit", "Zahlung", "Preistransparenz"],
    },
    charin_mcs: {
      label: "CharIN - Megawatt Charging System",
      url: "https://www.charin.global/technology/mcs/",
      type: "standard_technik",
      relevance: ["Megawattladen", "E-Lkw", "Busse", "Schwerlastverkehr"],
    },
    hola_lkw_mcs: {
      label: "HoLa - Hochleistungsladen Lkw",
      url: "https://hochleistungsladen-lkw.de/hola-en/results/megawatt_charging_networks.php",
      type: "projekt_wissenschaft",
      relevance: ["E-Lkw Ladefenster", "400 kWh Beispiel", "MCS bis 3,75 MW", "Pausenlogik"],
    },
    eu_road_transport_rest: {
      label: "EU - Lenk- und Ruhezeiten Straßentransport",
      url: "https://europa.eu/youreurope/business/human-resources/transport-sector-workers/road-transportation-workers/index_en.htm",
      type: "regulierung",
      relevance: ["4,5 Stunden Fahrzeit", "45 Minuten Pause", "Lkw-Ladefenster"],
    },
    base_endlager: {
      label: "BASE - Endlagersuche",
      url: "https://www.base.bund.de/de/endlager/endlagersuche/endlagersuche_inhalt.html",
      type: "amtlich",
      relevance: ["Kernenergie", "Endlagerung", "radioaktive Abfälle"],
    },
    base_atomausstieg: {
      label: "BASE - Ausstieg aus der Atomkraft",
      url: "https://www.base.bund.de/de/nukleare-sicherheit/atomausstieg/ausstieg-atomkraft/ausstieg-atomkraft_inhalt.html",
      type: "amtlich",
      relevance: ["Abschaltung letzte drei AKW", "Atomausstieg Deutschland", "15. April 2023"],
    },
    bmuv_atomkraftwerke_deutschland: {
      label: "BMUV - Atomkraftwerke in Deutschland",
      url: "https://www.bundesumweltministerium.de/themen/nukleare-sicherheit/aufsicht-ueber-atomkraftwerke/atomkraftwerke-in-deutschland",
      type: "amtlich",
      relevance: ["Berechtigungen zum Leistungsbetrieb erloschen", "Emsland", "Isar 2", "Neckarwestheim 2"],
    },
    fraunhofer_lcoe_2024: {
      label: "Fraunhofer ISE - Stromgestehungskosten 2024",
      url: "https://www.ise.fraunhofer.de/en/publications/studies/cost-of-electricity.html",
      type: "wissenschaft",
      relevance: ["Stromgestehungskosten", "Kostenvergleich", "PV", "Wind", "Kernkraft"],
    },
    bge_endlagersuche: {
      label: "BGE - Endlagersuche für hochradioaktive Abfälle",
      url: "https://www.bge.de/de/endlagersuche/",
      type: "amtlich",
      relevance: ["hochradioaktiver Abfall", "Menge und Radioaktivität", "Standortauswahl"],
    },
    base_transmutation: {
      label: "BASE - Transmutation hochradioaktiver Abfälle",
      url: "https://www.base.bund.de/de/nukleare-sicherheit/kerntechnik/partitionierung-transmutation/partitionierung-transmutation.html",
      type: "amtlich",
      relevance: ["Transmutation", "Endlager bleibt erforderlich", "hochradioaktive Abfälle"],
    },
    oecd_nea_financing_new_nuclear: {
      label: "OECD NEA - Financing nuclear new build",
      url: "https://www.oecd-nea.org/upload/docs/application/pdf/2024-09/nea_publication_2_2024-09-18_16-50-13_471.pdf",
      type: "fachbericht",
      relevance: ["Finanzierung neuer Kernkraft", "Kostenrisiko", "Verzögerungsrisiko"],
    },
    iaea_smr_platform: {
      label: "IAEA - SMR Platform Annual Report",
      url: "https://nucleus.iaea.org/sites/smr/Shared%20Documents/IAEA%20SMR%20Platform%20Annual%20Report%202025.pdf",
      type: "fachbericht",
      relevance: ["SMR", "Forschung", "Sicherheits-, Rechts- und Infrastrukturfragen"],
    },
    iea_nuclear: {
      label: "IEA - The Path to a New Era for Nuclear Energy",
      url: "https://www.iea.org/reports/the-path-to-a-new-era-for-nuclear-energy/executive-summary",
      type: "wissenschaft_daten",
      relevance: ["Kernenergie", "Kosten", "Bauzeiten", "Energiesicherheit"],
    },
    iter: {
      label: "ITER - In a Few Lines",
      url: "https://www.iter.org/few-lines",
      type: "wissenschaft_technik",
      relevance: ["Fusion", "Fusionsleistung", "Forschungsstatus"],
    },
    eurofusion_demo: {
      label: "EUROfusion - DEMO",
      url: "https://euro-fusion.org/programme/demo/",
      type: "wissenschaft_technik",
      relevance: ["Fusionskraftwerke", "Demonstrationskraftwerk", "Technologiereife"],
    },
  },
};

const mapping = {
  id: "climate-energy-mapping-v1",
  last_updated: UPDATED_AT,
  wok_mapping: {
    dimensions: {
      mensch: [
        "Gesundheit durch Luftqualität, Hitze- und Katastrophenschutz",
        "Energiearmut und soziale Abfederung",
        "Arbeitsplätze, Qualifizierung und regionale Strukturentwicklung",
      ],
      planet: ["Treibhausgasemissionen", "Ressourcenverbrauch", "Biodiversität", "Wasser, Boden und Flächen"],
      demokratie: [
        "Vertrauen in Wissenschaft und Institutionen",
        "Diskursfähigkeit",
        "Beteiligung bei Infrastruktur",
        "Schutz vor Desinformation und Polarisierung",
      ],
    },
    relevant_sdgs: [
      "SDG 3 - Gesundheit",
      "SDG 7 - Bezahlbare und saubere Energie",
      "SDG 8 - Menschenwürdige Arbeit und Wirtschaft",
      "SDG 9 - Industrie, Innovation und Infrastruktur",
      "SDG 11 - Nachhaltige Städte und Gemeinden",
      "SDG 12 - Nachhaltige Produktion und Konsum",
      "SDG 13 - Klimaschutz",
      "SDG 15 - Leben an Land",
      "SDG 16 - Frieden, Gerechtigkeit und starke Institutionen",
    ],
    relevant_sdg_plus: [
      "Wissensqualität",
      "Medienqualität",
      "Diskursfähigkeit",
      "institutionelles Vertrauen",
      "Schutz vor Manipulation",
      "demokratische Beteiligung",
      "digitale Selbstbestimmung",
    ],
    rule:
      "Nichtkompensation / Reverse Merit Order: Gute Klimawerte dürfen soziale Verdrängung, schlechte Arbeitsbedingungen, Biodiversitätsschäden oder demokratische Destabilisierung nicht verdecken.",
  },
};

const factStatus = {
  data_stand: UPDATED_AT,
  update_frequency: "quarterly",
  update_triggers: [
    "Neue UBA-Emissionsdaten",
    "Neue IPCC-/WMO-/Copernicus-Berichte",
    "Neue Strommixdaten Fraunhofer ISE / Energy-Charts",
    "Neue IEA-Berichte",
    "Neue Lebenszyklusanalysen zu E-Mobilität und Batterien",
    "Neue politische Zielpfade oder Gesetzesänderungen",
  ],
  warning: "Zahlen zu Emissionen, Strommix, Preisen, Ausbaupfaden und Technologie-Kosten regelmäßig aktualisieren.",
};

const glossaryLinks = [
  ["verantwortungsverkuerzung", "Verantwortungsverkürzung"],
  ["wirkung", "Wirkung"],
  ["wirkungspotenzial", "Wirkungspotenzial"],
  ["wirkungsrisiko", "Wirkungsrisiko"],
  ["wirkungspfad", "Wirkungspfad"],
  ["scope-3", "Scope 3"],
  ["lieferkettenwirkung", "Lieferkettenwirkung"],
  ["produktwirkung", "Produktwirkung"],
  ["resonanzraum", "Resonanzraum"],
  ["wirkungslenkung", "Wirkungslenkung"],
  ["positive-netto-wirkung", "Positive Netto-Wirkung"],
  ["reverse-merit-order", "Reverse Merit Order"],
  ["digitaler-produktpass", "Digitaler Produktpass"],
  ["sdg-plus", "SDG+"],
  ["t-sroi", "T-SROI"],
  ["woek-id", "WÖk-ID"],
];

const frameResponses = {
  ohnmacht:
    "Ich beantworte das, aber ich übernehme nicht den Frame. Der Frame lautet: Unser Handeln sei wirkungslos. Die bessere Frage ist: Welche Hebel haben wir tatsächlich?",
  verzoegerung:
    "Ich beantworte das, aber ich übernehme nicht den Frame. Der Frame lautet: Erst später handeln sei vernünftiger. Die wirkungsökonomische Frage ist: Welche Kosten und Risiken erzeugt weiteres Warten?",
  scheitern:
    "Ich beantworte das, aber ich übernehme nicht den Totalframe. Probleme sind nicht automatisch Scheitern. Die Frage ist: Welcher Engpass begrenzt die Wirkung?",
  technikwunder:
    "Ich beantworte das, aber ich übernehme nicht den Aufschubframe. Forschung ist wichtig. Aber ungewisse Zukunftstechnik ersetzt keine heute verfügbare Wirkung.",
  verbotsangst:
    "Ich beantworte das, aber ich übernehme nicht den Verbotsframe. Nicht jede Regel ist ein Verbot. Die Frage ist: Welche Freiheit wird geschützt, welche Schäden werden vermieden und wie demokratisch ist die Maßnahme?",
};

const methodChecklist = [
  "Was ist der wahre Kern?",
  "Was fehlt?",
  "Welche Schlussfolgerung ist falsch?",
  "Welches Narrativ wirkt?",
  "Welches Wirkungspotenzial entsteht?",
  "Welche Folgen hätte falsches Handeln?",
  "Welche Lösung erzeugt positive Netto-Wirkung?",
];

const clusterSummary = [
  ["Kernfrage", "Welche Klima- und Energieaussagen erzeugen Handlungsfähigkeit - und welche blockieren sie?", "neutral"],
  ["Häufige Narrative", "Ohnmacht, Verzögerung, Verbotsangst, Scheitern, Technikwunder, Sündenbock.", "warning"],
  ["Wirkungsrisiko", "Falsche Aussagen können Investitionen, Infrastruktur und demokratische Akzeptanz verzögern.", "critical"],
  ["Faktenbasis", "IPCC, UBA, IEA, Fraunhofer ISE, ICCT, BASE, BfN.", "neutral"],
  ["WÖk-Maßstab", "Mensch, Planet und Demokratie.", "positive"],
  ["Lösungslogik", "Wirkung sichtbar machen, in Preise und Entscheidungen rückkoppeln, soziale Abfederung sichern.", "positive"],
];

const subtopics = [
  {
    slug: "klimawandel",
    title: "Klimawandel",
    subtitle: "Fakten, Mythen, Narrative und Wirkungspfade",
    abstract:
      "Der Klimawandel ist nicht nur ein naturwissenschaftliches Thema, sondern ein Wirkungsraum für Gesundheit, Sicherheit, Ernährung, Wasser, Infrastruktur, Wirtschaft und Demokratie. Die zentrale Faktenlage ist klar: Menschliche Treibhausgasemissionen treiben die gegenwärtige Erwärmung. Viele Debatten drehen sich aber nicht um diese Grundlage, sondern um Narrative: Verharmlosung, Ursachenumdeutung, Ohnmacht, Verzögerung oder Wissenschaftsangriff. Der Wirkungsradar trennt deshalb Faktenkern, irreführende Schlussfolgerung und Wirkungspfad. Wirkungsökonomisch geht es nicht nur darum, CO₂ zu senken, sondern darum, Entscheidungen so zu lenken, dass Mensch, Planet und Demokratie zugleich stabilisiert werden.",
    summary: [
      ["Kernfakt", "Menschliche Treibhausgasemissionen sind der Haupttreiber der heutigen Erwärmung.", "neutral"],
      ["Häufiger Denkfehler", "Natürliche Klimaveränderungen werden genutzt, um die heutige Ursache umzudeuten.", "warning"],
      ["Häufiges Narrativ", "Verharmlosung, Ohnmacht, Verzögerung, Wissenschaftsdelegitimierung.", "warning"],
      ["Wirkungsrisiko", "Notwendige Emissionsminderung, Anpassung und Infrastrukturumbau werden verzögert.", "critical"],
      ["WÖk-Lösung", "Emissionen, Ressourcen, Lieferketten, Gesundheit und Demokratie in Preise, Steuern und Investitionen rückkoppeln.", "positive"],
      ["Quellen", "IPCC, UBA, WMO/Copernicus optional, IEA.", "neutral"],
    ],
    claims: ["klima-hat-sich-schon-immer-veraendert", "co2-ist-nur-ein-spurengas", "deutschland-nur-zwei-prozent"],
  },
  {
    slug: "energiewende",
    title: "Energiewende",
    subtitle: "Stromsystem, Netze, Speicher, Preise und Akzeptanz",
    abstract:
      "Die Energiewende ist ein Systemumbau, kein einzelner Schalter. Wirkungsökonomisch zählen Emissionsminderung, Versorgungssicherheit, Kosten, soziale Abfederung, Netze, Speicher, Flexibilität und demokratische Akzeptanz zusammen. Scheiternsframes sind besonders wirksam, weil sie reale Engpässe aufgreifen und daraus ein Totalurteil machen.",
    summary: [
      ["Kernfrage", "Welche Engpässe begrenzen Wirkung im Strom- und Energiesystem?", "neutral"],
      ["Narrative", "Scheiternsframe, Verzögerung, Verbotsangst und Technikaufwand.", "warning"],
      ["Wirkungsrisiko", "Investitionssicherheit und Akzeptanz sinken, wenn Engpässe als Totalversagen gerahmt werden.", "critical"],
      ["WÖk-Lösung", "Von Lagerkampf zu Engpasslogik, Wirkungshaushalten und T-SROI für Infrastruktur.", "positive"],
    ],
    claims: ["energiewende-gescheitert", "windraeder-zerstoeren-natur", "windraeder-voegel-wald-beton-rueckbau", "klimaschutz-ist-oekodiktatur", "co2-preis-oder-fossile-systemkosten"],
  },
  {
    slug: "mobilitaet-batterien",
    title: "Mobilität & Batterien",
    subtitle: "Lebenszyklus, Rohstoffe, Recycling und Mobilitätswirkung",
    abstract:
      "Mobilitätsdebatten kippen schnell in Lagerlogik. Der Wirkungsradar prüft deshalb Produktlebenszyklus, realen Lade- und Produktionsstrom, Fahrzeuggröße, Nutzung, Batteriechemie, Rohstoffe, Arbeitsbedingungen, Brandrisiko, Lebensdauer, Recycling, Second Life und Alternativen. Nicht das Symbol E-Auto entscheidet, sondern die positive Netto-Wirkung der Mobilitätslösung.",
    summary: [
      ["Kernfrage", "Welche Mobilitätslösung erzeugt über den Lebenszyklus die bessere Netto-Wirkung - inklusive Batteriechemie, Stromquelle, Lebensdauer und Recycling?", "neutral"],
      ["Narrative", "Rohstoffangst, Verzögerung, falscher Lebenszyklusvergleich.", "warning"],
      ["Wirkungsrisiko", "Fossile Mobilität bleibt länger bestehen, wenn Herstellung isoliert betrachtet wird.", "critical"],
      ["WÖk-Lösung", "Produktscorecards für CO₂, Ressourcen, Arbeit, Gesundheit, Batteriechemie, Ladequelle, Lebensdauer, Brandrisiko und Recycling.", "positive"],
    ],
    claims: ["e-autos-schlimmer-als-verbrenner", "batterien-sind-nicht-recyclebar"],
  },
  {
    slug: "kernenergie-fusion",
    title: "Kernenergie & Fusion",
    subtitle: "Zeitpfad, Kosten, Endlagerung und Technologiereife",
    abstract:
      "Kernenergie und Fusion sind keine reinen Faktenfragen, sondern Strategie- und Zeitpfadfragen. Wirkungsökonomisch zählt, was im konkreten Land, im relevanten Zeitraum und im Vergleich zu Alternativen Wirkung erzeugt. Forschung bleibt wichtig, darf aber nicht zum Aufschubframe werden.",
    summary: [
      ["Kernfrage", "Was wirkt rechtzeitig, bezahlbar, skalierbar und mit geringster Netto-Negativwirkung?", "neutral"],
      ["Narrative", "Technikwunder, Opportunitätskosten, Scheiternsframe gegen Erneuerbare.", "warning"],
      ["Wirkungsrisiko", "Schnellere Lösungen werden verzögert, wenn Zukunftstechnik heutige Wirkung ersetzt.", "critical"],
      ["WÖk-Lösung", "Technologien nach Zeithorizont, Kosten, Risiken, Alternativen und Systemwirkung bewerten.", "positive"],
    ],
    claims: ["kernenergie-wieder-in-deutschland", "kernenergie-einfache-loesung", "fusion-loest-das-energieproblem"],
  },
  {
    slug: "industrie-wirtschaft",
    title: "Industrie & Wirtschaft",
    subtitle: "Wettbewerbsfähigkeit, Transformation und Wohlstand",
    abstract:
      "Industrie- und Wohlstandsdebatten nutzen oft Verlustframes. Der wahre Kern ist: Transformation verändert Kosten, Geschäftsmodelle und Arbeit. Irreführend wird es, wenn Klimaschutz pauschal als Wohlstandsfeind gerahmt wird und fossile Abhängigkeit, CO₂-Kosten, alte Anlagen, Importabhängigkeit und Innovationschancen ausgeblendet werden.",
    summary: [
      ["Kernfrage", "Welche Industrie ist in einer klimaneutralen Welt zukunftsfähig?", "neutral"],
      ["Narrative", "Angstframe, Statusverlust, Scheiternsframe und Verzögerung.", "warning"],
      ["Wirkungsrisiko", "Zukunftsinvestitionen werden blockiert, alte Abhängigkeiten bleiben bestehen.", "critical"],
      ["WÖk-Lösung", "Industriepolitik nach Zukunftswirkung: Netze, sauberer Strom, Kreislaufwirtschaft und Qualifizierung.", "positive"],
    ],
    claims: ["klimaschutz-deindustrialisiert-deutschland"],
  },
];

const claims = [
  {
    title: "„Klima hat sich schon immer verändert“",
    slug: "klima-hat-sich-schon-immer-veraendert",
    shortJudgement: "Wahrer Kern, falsche Ursache.",
    narrativeFamilies: ["Ursachenumdeutung", "Verharmlosung"],
    riskLevel: "hoch",
    themes: ["Klimawandel"],
    sdgs: ["SDG 13", "SDG 15", "SDG 3"],
    sdgPlus: ["Wissensqualität", "Diskursfähigkeit"],
    subtitle: "Wahrer Kern, falsche Ursache",
    abstract:
      "Die Aussage enthält einen wahren Kern: Das Klima der Erde hat sich in der Erdgeschichte immer wieder verändert. Irreführend wird sie, wenn daraus abgeleitet wird, die heutige Erwärmung sei deshalb natürlich oder harmlos. Wirkungsökonomisch ist die Aussage ein Ursachenumdeutungs-Wirkstoff: Sie verschiebt Verantwortung von fossilen Emissionen auf ein allgemeines „war schon immer so“. Der Denkfehler liegt darin, Möglichkeit mit Ursache zu verwechseln. Die bessere Antwort lautet: Ja, Klima verändert sich - die entscheidende Frage ist, was die heutige Veränderung verursacht und welche Folgen Nicht-Handeln hat.",
    summary: {
      judgement: "Wahrer Kern, falsche Ursache.",
      true_core: "Klima hat sich historisch immer wieder verändert.",
      problem: "Daraus folgt nicht, dass die heutige Erwärmung natürlich verursacht ist.",
      narrative: "Ursachenumdeutung / Verharmlosung.",
      risk: "Verantwortung und Handlungsdruck werden abgeschwächt.",
      host_answer: "Ja, Klima verändert sich. Die Frage ist: Was treibt die heutige Veränderung an?",
    },
    answers: {
      ten_seconds: "Ja, Klima hat sich immer verändert. Die entscheidende Frage ist aber: Was verursacht die heutige schnelle Erwärmung?",
      thirty_seconds:
        "Der wahre Kern ist: Klima war nie statisch. Der Denkfehler ist: Daraus folgt nicht, dass die heutige Erwärmung natürlich ist. Wir wissen, dass menschliche Treibhausgase der Haupttreiber sind. Also geht es nicht um „ob Klima sich ändert“, sondern um Ursache, Geschwindigkeit und Folgen.",
      two_minutes:
        "Ich ordne das kurz ein. Natürlich hat sich Klima in der Erdgeschichte verändert. Aber das ist kein Gegenargument zur heutigen menschengemachten Erwärmung. Auch Feuer gab es schon immer - trotzdem kann ein bestimmter Brand eine bestimmte Ursache haben. Die wirkungsökonomische Frage lautet: Welche Ursache wirkt heute, welche Schäden entstehen, wenn wir sie ignorieren, und welche Maßnahmen reduzieren die negative Wirkung für Mensch, Planet und Demokratie?",
    },
    effectPath: [
      ["Aussage", "Klima hat sich schon immer verändert."],
      ["Wirkstoff", "Historischer Allgemeinsatz als Verantwortungsverschiebung."],
      ["Resonanz", "Entlastung, Verharmlosung, Zweifel."],
      ["Wirkungspotenzial", "Die heutige Ursache wird unscharf."],
      ["Wirkungsrisiko", "Emissionsminderung und Anpassung verlieren Dringlichkeit."],
      ["Folge falschen Handelns", "Klimarisiken, Kosten und Anpassungsdruck steigen."],
    ],
    frameKey: "verzoegerung",
    redirectQuestion: "Was verursacht die heutige schnelle Erwärmung - und was folgt daraus?",
    dontDo: ["Nicht über Erdgeschichte dozieren, bevor die heutige Ursache geklärt ist.", "Nicht den Frame übernehmen, dass Veränderung automatisch Harmlosigkeit bedeutet."],
    facts: ["Natürliche Klimaveränderungen gab es, aber Ursache und Geschwindigkeit müssen konkret geprüft werden.", "Die Seite trennt Möglichkeit, Ursache und Wirkungspfad."],
    consequences: ["Handlungsdruck sinkt.", "Anpassungs- und Klimafolgekosten steigen.", "Wissenschaftsvertrauen wird geschwächt."],
    woekSolution: ["CO₂- und Methanwirkung in Produkt-, Energie- und Lieferkettenscorecards erfassen.", "Fossile Wirkung in Preisen und Steuern abbilden.", "Klimafolgekosten in T-SROI und öffentliche Investitionsentscheidungen integrieren.", "Anpassung als Wirkungsinvestition bewerten, nicht als Reparaturkosten."],
    mpd: {
      mensch: "Hitze, Gesundheit, Sicherheit und Anpassungskosten werden unterschätzt.",
      planet: "Emissionen und ökologische Folgeschäden bleiben länger wirksam.",
      demokratie: "Wissensqualität und Diskursfähigkeit werden geschwächt.",
    },
    sources: ["IPCC AR6 Synthesis Report - Headline Statements", "Umweltbundesamt - Treibhausgas-Emissionen in Deutschland"],
  },
  {
    title: "„CO₂ ist nur ein Spurengas“",
    slug: "co2-ist-nur-ein-spurengas",
    shortJudgement: "Irreführend.",
    narrativeFamilies: ["Scheinfakt", "Wissenschaftsdelegitimierung"],
    riskLevel: "hoch",
    themes: ["Klimawandel"],
    sdgs: ["SDG 13"],
    sdgPlus: ["Wissenschaftsvertrauen"],
    subtitle: "Scheinfakt, falsche Schlussfolgerung",
    abstract:
      "Die Aussage nutzt einen scheinbar sachlichen Zahlenframe: CO₂ macht nur einen kleinen Anteil der Atmosphäre aus. Irreführend wird daraus die Schlussfolgerung, CO₂ könne deshalb keine starke Wirkung haben. Wirkungsökonomisch ist das ein Scheinfakt-Wirkstoff: Eine kleine Konzentration wird mit kleiner Wirkung verwechselt. Entscheidend ist aber nicht der Mengenanteil allein, sondern die physikalische Wirkung auf Wärmestrahlung, Rückkopplungen und den Energiehaushalt der Erde. Die bessere Antwort lautet: Auch kleine Mengen können große Systemwirkung haben, wenn sie an einer wirksamen Stelle im System ansetzen.",
    summary: {
      judgement: "Irreführend.",
      true_core: "CO₂ ist mengenmäßig ein kleiner Bestandteil der Atmosphäre.",
      problem: "Kleine Konzentration wird mit kleiner Wirkung verwechselt.",
      narrative: "Scheinfakt / Wissenschaftsdelegitimierung.",
      risk: "Physikalische Ursache wird verharmlost.",
      host_answer: "Kleine Menge heißt nicht kleine Wirkung. Entscheidend ist der Wirkmechanismus.",
    },
    answers: {
      ten_seconds: "Kleine Menge heißt nicht kleine Wirkung. Entscheidend ist, wie CO₂ im Strahlungshaushalt wirkt.",
      thirty_seconds:
        "Der wahre Kern ist: CO₂ ist ein Spurengas. Der Denkfehler ist: Daraus wird geringe Wirkung abgeleitet. Viele Stoffe wirken in kleinen Mengen stark. Bei CO₂ zählt der physikalische Mechanismus - nicht nur der Prozentanteil.",
      two_minutes:
        "Ich ordne das ein. „Spurengas“ beschreibt nur die Konzentration, nicht die Wirkung. In komplexen Systemen können kleine Größen große Effekte haben, wenn sie an zentralen Hebeln wirken. CO₂ verändert den Strahlungshaushalt der Erde. Wirkungsökonomisch ist die Frage nicht: Ist es viel oder wenig? Sondern: Welche Zustandsveränderung erzeugt es - und welche Schäden entstehen, wenn wir diesen Wirkmechanismus ignorieren?",
    },
    effectPath: [
      ["Aussage", "CO₂ wird über seine geringe Konzentration beschrieben."],
      ["Wirkstoff", "Kleine Menge wird als kleine Wirkung gerahmt."],
      ["Resonanz", "Zweifel, Scheinsachlichkeit und Entlastung."],
      ["Wirkungspotenzial", "Der physikalische Wirkmechanismus wird ausgeblendet."],
      ["Wirkungsrisiko", "Klimawirkung wird unterschätzt."],
      ["Folge falschen Handelns", "Emissionsminderung verliert Plausibilität."],
    ],
    frameKey: "verzoegerung",
    redirectQuestion: "Welche Wirkung hat CO₂ im Strahlungshaushalt - unabhängig vom Prozentanteil?",
    dontDo: ["Nicht nur Prozentzahlen vergleichen.", "Nicht den Scheinfakt als ausreichende Erklärung akzeptieren."],
    facts: ["Spurengas beschreibt Konzentration, nicht Systemwirkung.", "In Wirkungsanalysen zählt der Mechanismus, nicht nur die Menge."],
    consequences: ["Physikalische Ursache wird verharmlost.", "Wissenschaftsvertrauen sinkt.", "Klimaschutz verliert Akzeptanz."],
    woekSolution: ["Wirkmechanismus sichtbar machen.", "Klimawirkung in Energie-, Produkt- und Investitionsentscheidungen rückkoppeln.", "Wissensqualität als SDG+-Dimension stärken."],
    mpd: {
      mensch: "Gesundheits- und Schadensrisiken werden unterschätzt.",
      planet: "Treibhausgaswirkung bleibt länger ungemindert.",
      demokratie: "Scheinfakten schwächen Wissensqualität und Diskursfähigkeit.",
    },
    sources: ["IPCC AR6 Synthesis Report - Headline Statements"],
  },
  {
    title: "Deutschland nur 2 %?",
    slug: "deutschland-nur-zwei-prozent",
    claimPhrase: "„Deutschland ist nur für 2 % verantwortlich.“",
    shortJudgement: "Wahrer Territorialkern, falscher Verantwortungsframe.",
    narrativeFamilies: ["Ohnmacht", "Verantwortungsverkürzung", "Verzögerung"],
    riskLevel: "hoch",
    themes: ["Klimawandel", "Politik", "Industrie"],
    sdgs: ["SDG 7", "SDG 9", "SDG 12", "SDG 13"],
    sdgPlus: ["Handlungsfähigkeit", "institutionelles Vertrauen", "Wirkungswahrheit"],
    subtitle: "Warum die Zahl nur Inlandsemissionen zeigt - nicht unsere Wirkung.",
    abstract:
      "Die Aussage „Deutschland ist nur für rund 2 % verantwortlich“ ist nur in einer sehr engen territorialen Jahresbilanz sinnvoll. Sie zählt, was innerhalb Deutschlands ausgestoßen wird. Als Aussage über Verantwortung ist sie irreführend. Denn deutsche Wirkung endet nicht an der Landesgrenze. Wenn Vorprodukte, Konsumgüter oder Industrieproduktion ins Ausland verlagert werden, entstehen die Emissionen dort - aber sie werden durch deutsche Nachfrage, Wertschöpfung, Produktdesign oder Unternehmensentscheidungen mitausgelöst. Wenn deutsche Unternehmen Verbrenner, Maschinen oder Anlagen weltweit verkaufen, entstehen Nutzungsemissionen oft über Jahre im Ausland. Territorial werden sie dort gezählt; in der Wirkungsanalyse gehören sie auch zur Produkt- und Scope-3-Verantwortung. Deshalb lautet die bessere Frage nicht: „Sind wir nur 2 %?“ Sondern: Welche Emissionen entstehen durch unsere Nachfrage, Produkte, Lieferketten, Kapitalflüsse, Standards und historische Pfade - und wie drehen wir diese Wirkung?",
    summary: {
      judgement: "Wahrer Territorialkern, falscher Verantwortungsframe.",
      true_core: "Deutschland ist nicht der größte territoriale Jahresemittent.",
      problem: "Die Aussage verwechselt eine enge Inlandsbilanz mit Gesamtverantwortung.",
      narrative: "Verantwortungsverkürzung / Ohnmachtsnarrativ / Verzögerungsframe.",
      risk: "Konsum, Vorprodukte, ausgelagerte Produktion, Produktnutzung, Scope 3, Historie und Transformationshebel werden unsichtbar.",
      host_answer: "2 % zählt nur Inlandsemissionen. Unsere Wirkung läuft auch über Konsum, Vorprodukte, Exporte, Scope 3 und historische Pfade.",
    },
    answers: {
      one_liner: "2 % zählt nur Inlandsemissionen. Unsere Wirkung läuft auch über Konsum, Vorprodukte, Exporte, Scope 3 und historische Pfade.",
      ten_seconds: "Die 2-%-Zahl zählt nur, was innerhalb Deutschlands ausgestoßen wird. Wenn unser T-Shirt, Smartphone oder Vorprodukt im Ausland produziert wird, fehlt diese Wirkung in der deutschen Territorialbilanz.",
      thirty_seconds:
        "Der Denkfehler ist die Bilanzgrenze. Die 2 % zählen nur Emissionen innerhalb Deutschlands. Aber wenn ein deutsches Unternehmen Vorprodukte in Asien herstellen lässt oder wir Kleidung, Elektronik und Konsumgüter importieren, entstehen Emissionen im Ausland - ausgelöst durch unsere Nachfrage und unsere Lieferketten. Beispiel: Das Smartphone liegt bei uns im Laden, aber ein Teil der CO₂-Wirkung steckt in Minen, Fabriken, Strommix und Transport außerhalb Deutschlands. Territorial zählt das dort. Verantwortung verschwindet dadurch nicht; sie wird nur in einer anderen Bilanz sichtbar.",
      two_minutes:
        "Die 2-%-Behauptung klingt entlastend, weil sie eine sehr enge Zahl nimmt und daraus Verantwortung macht. Diese Zahl meint höchstens: Was wird innerhalb Deutschlands in einem Jahr ausgestoßen? Das ist eine wichtige Bilanz, aber sie ist nicht die ganze Wirklichkeit. Deutschland ist eine Industrie-, Konsum-, Export-, Kapital- und Technologiewirtschaft. Wir importieren Vorprodukte, Elektronik, Textilien, Rohstoffe, Lebensmittel und Industriekomponenten. Die Emissionen entstehen dann oft in China, Indien, Polen, Vietnam oder anderswo. Territorial werden sie dort gezählt. Aber die Nachfrage, die Wertschöpfung, das Produktdesign oder die Unternehmensentscheidung können bei uns liegen.\n\nEin Beispiel: Ein deutsches Auto kann Rohstoffe aus mehreren Ländern enthalten, Vorprodukte aus Asien nutzen, in Europa montiert oder weltweit verkauft werden und dann 15 Jahre lang in China, den USA oder Brasilien fahren. Die Abgase werden territorial dort gezählt. Aber wenn deutsche Ingenieur:innen den Verbrenner entwickeln, deutsche Unternehmen ihn verkaufen und seine Nutzung über Jahre Emissionen verursacht, ist das Teil der Produkt- und Scope-3-Verantwortung. Das GHG Protocol kennt dafür genau die Kategorie „Use of Sold Products“.\n\nDeshalb ist auch ein einfacher Pro-Kopf-Wert oft verkürzt. Die Frage ist nicht nur: Was wird hier ausgestoßen? Sondern: Was lösen wir durch Konsum, Lieferketten, Produkte, Kapital, Standards und historische Pfade aus? Wir dürfen diese Ebenen nicht zu einer Fantasiezahl addieren. Aber wir dürfen sie auch nicht unsichtbar machen. Die bessere Antwort lautet: Deutschland rettet nicht allein das Klima. Aber Deutschland hat große Hebel - und muss seine tatsächlichen Wirkungsräume ehrlich bilanzieren, in Produktdesign, Beschaffung, Kapital und Standards zurückkoppeln und dann verändern.",
    },
    answersFinal: true,
    effectPath: [
      ["Aussage", "„Deutschland ist nur für 2 % verantwortlich.“"],
      ["Wirkstoff", "Territorialzahl als Verantwortungslöscher."],
      ["Verkürzung", "Inlandsemissionen werden mit Gesamtverantwortung gleichgesetzt."],
      ["Ausblendung", "Konsumemissionen, ausgelagerte Produktion, Scope 3, exportierte Produktnutzung, historische Emissionen sowie Standard- und Kapitalhebel verschwinden."],
      ["Resonanz", "Entlastung, Ohnmacht, Abwehr von Veränderung und Kostenangst."],
      ["Narrativ", "Wir sind zu klein, also müssen wir nicht handeln."],
      ["Wirkungspotenzial", "Handlungsfähigkeit sinkt, Verantwortung wird externalisiert."],
      ["Wirkungsrisiko", "Lieferketten, Produktdesign, Industriepfade und fossile Geschäftsmodelle werden langsamer transformiert."],
      ["Wirkung dritter Ordnung", "Wirkungsblindheit wird stabilisiert: Produkte, Preise und Investitionen zeigen nicht, welche globale Wirkung sie auslösen."],
    ],
    frameKey: "ohnmacht",
    redirectQuestion: "Meinst du die enge Inlandsbilanz - oder die Wirkung über Konsum, Lieferketten, exportierte Produkte, Scope 3 und historische Emissionen?",
    dontDo: ["Nicht in eine endlose Prozentdiskussion gehen.", "Nicht Verantwortung als Prozentzahl formulieren.", "Nicht nationale Alleinwirkung behaupten.", "Nicht Verantwortung moralisieren.", "Nicht unterschiedliche Bilanzgrenzen addieren."],
    facts: [
      "Die territoriale Bilanz misst Emissionen innerhalb deutscher Grenzen, nicht Konsum, Produktnutzung oder historische Wirkung.",
      "Konsumemissionen zeigen, welche Emissionen deutsche Nachfrage auch im Ausland auslöst.",
      "Scope 3 erfasst unter anderem die Nutzung verkaufter Produkte und macht Produktverantwortung sichtbar.",
      "Historische Emissionen beantworten eine andere Verantwortungsfrage als ein einzelnes Emissionsjahr.",
      "Transformationshebel entstehen über Standards, Technologie, Kapital, Beschaffung, EU-Regeln und Industriepfade.",
    ],
    consequences: [
      "Konsum- und Importwirkung bleibt politisch unsichtbar.",
      "Produktdesign, Lieferketten und Scope-3-Emissionen werden schwächer gesteuert.",
      "Fossile Geschäftsmodelle wirken länger, weil ihre globale Nutzung nicht ausreichend rückgekoppelt wird.",
      "Öffentliche Debatten verlieren Handlungsfähigkeit, weil Verantwortung auf einen engen Inlandsausschnitt reduziert wird.",
    ],
    woekSolution: [
      "Territoriale Emissionen weiter senken.",
      "Konsum- und Importemissionen sichtbar machen.",
      "Lieferkettenwirkung über WÖk-IDs, Scorecards und digitale Produktpässe erfassen.",
      "Scope-3-Emissionen verkaufter Produkte einbeziehen, besonders bei Fahrzeugen, Maschinen, Energieanlagen und Chemie.",
      "Öffentliche Beschaffung und Steuern an positive Netto-Wirkung koppeln.",
      "Exportierte Technologien nach Lebenszykluswirkung bewerten.",
      "Kapitalflüsse so lenken, dass sie fossile Pfade nicht verlängern.",
      "Verantwortung nicht moralisieren, sondern in Preise, Steuern, Investitionen, Standards und Produktdesign rückkoppeln.",
    ],
    mpd: {
      mensch: "Klimafolgekosten, Standortunsicherheit und soziale Übergangsrisiken bleiben länger unsichtbar.",
      planet: "Konsum-, Lieferketten-, Produktnutzungs- und historische Klimawirkung werden zu schwach gesteuert.",
      demokratie: "Wirkungsblindheit schwächt Quellenklarheit, Verantwortungsfähigkeit und demokratische Entscheidung.",
    },
    dossier: {
      editorialRule:
        "Nicht moralisieren. Keine Schuldzuschreibung. Präzise sagen: Deutschland hat mehrere Wirkungsräume.",
      leadSentence: "Ausgelagerte Produktion ist keine ausgelagerte Verantwortung.",
      thesis:
        "Die 2-%-Behauptung ist kein Verantwortungsmaßstab, sondern eine enge territoriale Produktionsbilanz. Sie reduziert Verantwortung auf territoriale Jahresemissionen und blendet Konsum, Importe, Lieferketten, exportierte Produktnutzung, historische Emissionen und Transformationshebel aus. Die 2-%-Zahl beantwortet nur die Frage, wo Emissionen territorial entstehen. Sie beantwortet nicht die Frage, wodurch sie ausgelöst werden, wer daran verdient, wer das Produkt designt, wer es nachfragt und welche Wirkung über Lieferketten, Nutzung und Standards entsteht.",
      missingLayers: "Konsum, Importe, Lieferketten, Scope 3, exportierte Produktnutzung, historische Emissionen, Standardsetzung.",
      keyPoints: [
        ["2 % ist eine Territorialzahl", "Sie zählt nur Emissionen innerhalb Deutschlands in einem Jahr. Das ist wichtig, aber kein Maß für Gesamtverantwortung."],
        ["Konsum wirkt im Ausland", "Kleidung, Elektronik, Lebensmittel, Möbel, Chemieprodukte und Vorprodukte verursachen oft Emissionen dort, wo sie produziert werden."],
        ["Ausgelagerte Produktion verschwindet nicht", "Wenn Industrie- oder Konsumgüterproduktion ins Ausland verlagert wird, sinkt die deutsche Inlandsbilanz - aber nicht automatisch die reale Wirkung."],
        ["Exportierte Produkte wirken über Jahre", "Verbrenner, Maschinen, Anlagen und energieverbrauchende Produkte können im Ausland langfristige Nutzungsemissionen verursachen."],
        ["Pro-Kopf-Zahlen brauchen Bilanzgrenze", "Territoriale Pro-Kopf-Werte sind nicht falsch, aber verkürzt. Konsumbasierte Pro-Kopf-Fußabdrücke zeigen eine andere Verantwortung."],
        ["WÖk-Antwort: Wirkungsketten sichtbar machen", "Territorial, Konsum, Lieferkette, Scope 3, Historie und Transformationshebel nebeneinander bilanzieren - nicht addieren, aber auch nicht ausblenden."],
      ],
      liveResponse: {
        frameCheck:
          "Ich übernehme nicht den Frame, dass eine territoriale Jahreszahl Verantwortung erledigt. Die 2-%-Zahl zeigt nur, wo Emissionen territorial entstehen. Sie zeigt nicht, wodurch sie ausgelöst werden und welche Produkte, Lieferketten oder Standards sie verursachen.",
        betterQuestion:
          "Welche Emissionen entstehen durch deutsche Nachfrage, Produkte, Lieferketten, Kapital und Standards - und wie können wir diese Wirkung reduzieren?",
        purposes: {
          one_liner: "Ein Satz für Kommentarspalten, Reels und Moderation.",
          ten_seconds: "Schnelle Host-Antwort mit Bilanzgrenze.",
          thirty_seconds: "Kurze Einordnung mit Smartphone-Beispiel.",
          two_minutes: "Vollständige Host-Antwort für Livestream, Panel oder Artikelteaser.",
        },
      },
      hostExample: {
        title: "Beispiel für Hosts: Das T-Shirt und der Verbrenner",
        everydayExample: {
          title: "Das T-Shirt im deutschen Laden",
          text:
            "Stell dir ein T-Shirt vor, das in Deutschland gekauft wird. Baumwolle, Färbung, Nähen, Strom, Transport und Verpackung passieren aber in anderen Ländern. In der deutschen Territorialbilanz taucht davon fast nichts auf. Trotzdem wurde das Produkt für unseren Markt hergestellt. Wenn man nur sagt „Deutschland stößt nur 2 % aus“, tut man so, als hätte der Kauf hier nichts mit der Produktion dort zu tun.",
          hostLine:
            "Wenn mein T-Shirt für den deutschen Markt in Bangladesch oder China produziert wird, zählt der Fabrikstrom dort - aber die Nachfrage kommt von hier.",
        },
        systemExample: {
          title: "Der deutsche Verbrenner im Ausland",
          text:
            "Ein deutscher Hersteller entwickelt einen Verbrenner, verkauft ihn ins Ausland, und das Auto fährt dort 15 Jahre. Die Abgase werden territorial in dem Land gezählt, in dem das Auto fährt. Aber die Produktentscheidung, das Design, die Motorentechnik, die Flottenstrategie und der Verkauf liegen beim Unternehmen. In einer Wirkungsanalyse ist das nicht einfach „weg“, sondern Teil der Scope-3- und Produktverantwortung.",
          hostLine:
            "Wenn ein deutscher Verbrenner in China fährt, zählt der Auspuff territorial in China. Aber die Produktwirkung beginnt nicht erst am chinesischen Auspuff.",
        },
        whatItShows: [
          "Territorialbilanz ist nicht Verantwortungsbilanz.",
          "Ausgelagerte Produktion bleibt reale Wirkung.",
          "Exportierte Produkte erzeugen Nutzungsemissionen.",
          "Scope 3 erklärt Unternehmensverantwortung.",
          "Nicht alles addieren, aber alles sichtbar machen.",
        ],
        avoid: [
          "Nicht sagen: Alles ist allein Deutschlands Schuld.",
          "Nicht Territorialbilanz für nutzlos erklären.",
          "Nicht Konsum, Scope 3 und Historie zu einer einzigen Zahl addieren.",
          "Nicht moralisch beschämen.",
        ],
      },
      variants: [
        "Deutschland ist doch nur für rund 2 % der Emissionen zuständig.",
        "Solange China und die USA mehr ausstoßen, bringt deutsches Handeln nichts.",
        "Unsere Industrie soll leiden, obwohl unser Anteil winzig ist.",
        "Deutsche Klimapolitik ist Symbolpolitik, weil der globale Effekt zu klein sei.",
      ],
      responsibilityMatrix: [
        ["Territorial", "Was wird innerhalb Deutschlands ausgestoßen?", "Kraftwerke, Verkehr, Industrie, Gebäude in Deutschland.", "Konsum, Importe, Exporte, Scope 3, Historie."],
        ["Konsum", "Welche Emissionen verursacht deutsche Nachfrage weltweit?", "T-Shirt, Smartphone, Möbel, Lebensmittel, Elektronik.", "Emissionen in ausländischen Produktionsketten."],
        ["Importierte Vorprodukte", "Welche Emissionen stecken in Rohstoffen, Komponenten und Industrievorleistungen?", "Stahl, Aluminium, Batterierohstoffe, Chemie, Halbleiter, Kunststoffe.", "Ausgelagerte Industrie- und Zulieferwirkung."],
        ["Unternehmens-Scope-3", "Welche Emissionen entstehen vor und nach dem eigenen Werkstor?", "Eingekaufte Güter, Transport, Nutzung verkaufter Produkte.", "Wertschöpfungskettenverantwortung."],
        ["Produktnutzung", "Welche Emissionen entstehen durch verkaufte Produkte über ihre Lebensdauer?", "Exportierte Verbrenner, Maschinen, Anlagen, Geräte.", "Nutzungsemissionen im Ausland."],
        ["Historisch", "Wie hoch ist die kumulative Wirkung seit Industrialisierung?", "Kohle, Industriegeschichte, Wohlstandspfad, langlebiges CO₂.", "Vergangene Emissionen und Pfadabhängigkeit."],
        ["Transformativ", "Welche globalen Pfade beeinflusst Deutschland?", "EU-Regeln, Normen, Technologie, Maschinenbau, Kapital, Beschaffung.", "Gestaltungsmacht und Hebelwirkung."],
      ],
      perCapitaModule: {
        title: "Warum Pro-Kopf-Zahlen oft falsch verwendet werden",
        text:
          "Pro-Kopf-Zahlen sind nicht falsch. Aber sie sind nur dann sinnvoll, wenn die Bilanzgrenze genannt wird. Ein territorialer Pro-Kopf-Wert verteilt die Inlandsemissionen auf die Bevölkerung. Ein konsumbasierter Pro-Kopf-Fußabdruck betrachtet dagegen die Emissionen, die durch den Konsum einer Bevölkerung weltweit ausgelöst werden. Wer nur den territorialen Pro-Kopf-Wert nennt, kann ausgelagerte Produktion, importierte Vorprodukte und Konsumgüter unsichtbar machen.",
        keySentence: "Nicht die Pro-Kopf-Zahl ist das Problem. Das Problem ist eine Pro-Kopf-Zahl ohne Bilanzgrenze.",
        example:
          "Wenn Deutschland ein Produkt importiert, erscheint der Produktionsausstoß territorial im Herstellerland. Konsumbasiert gehört er aber zur Nachfrage des Käuferlandes.",
      },
      scope3Module: {
        title: "Scope 3: Warum Produktverantwortung nicht am Werkstor endet",
        text:
          "Scope 3 ist keine nationale Territorialbilanz. Aber Scope 3 ist entscheidend für eine Wirkungsanalyse von Unternehmen und Produkten. Besonders Kategorie 11 des GHG Protocol - Nutzung verkaufter Produkte - erfasst die erwarteten Lebenszyklus-Emissionen relevanter Produkte, die ein Unternehmen verkauft. Für energieverbrauchende Produkte ist das zentral: Fahrzeuge, Motoren, Maschinen, Anlagen, Geräte oder Heiztechnik können über Jahre Emissionen verursachen.",
        keySentence:
          "Territorial zählt der Auspuff dort, wo er raucht. In der Wirkungsanalyse zählt auch, wer Produktdesign, Technik, Verkauf und Marktpfad bestimmt.",
        example:
          "Ein deutscher Verbrenner, der in China fährt, ist in Chinas Territorialbilanz. In der Unternehmens- und Produktwirkung gehört seine Nutzung aber zur Scope-3-Verantwortung des Herstellers.",
        warning: "Scope 3 als Mitverantwortung und Steuerungshebel formulieren, nicht als nationale Alleinschuld.",
      },
      woekMeasures: [
        { title: "Mehrfachbilanz statt 2-%-Frame", text: "Territorial, konsumbezogen, lieferkettenbezogen, Scope 3, historisch und transformativ getrennt anzeigen." },
        { title: "Produktwirkung sichtbar machen", text: "Produkte erhalten Lebenszyklus- und Nutzungswirkung: Rohstoffe, Produktion, Transport, Nutzung, Reparatur, Entsorgung." },
        { title: "Scope-3-Verantwortung operationalisieren", text: "Unternehmen müssen Nutzung verkaufter Produkte und eingekaufte Vorprodukte transparent bilanzieren." },
        { title: "Importierte Emissionen rückkoppeln", text: "CBAM, Lieferkettenstandards, Produktpässe und Wirkungssteuer machen ausgelagerte Wirkung sichtbar." },
        { title: "Exportierte Produktnutzung steuern", text: "Wer weltweit Fahrzeuge, Maschinen oder Anlagen verkauft, muss deren Nutzungswirkung in Produktdesign, Flottenstrategie und Transformation berücksichtigen." },
        { title: "Konsum-Fußabdruck transparent machen", text: "Konsument:innen sehen nicht nur Preis, sondern Produktwirkung: CO₂, Arbeit, Wasser, Material, Reparierbarkeit, Kreislauf." },
        { title: "Nicht addieren, aber nebeneinander zeigen", text: "Territorial-, Konsum-, Scope-3- und historische Bilanzen werden nicht zusammengerechnet, sondern als unterschiedliche Verantwortungsräume sichtbar." },
      ],
      internalSourceCards: [
        ["WÖk - Lieferketten als Wirkungsketten", "Globale Lieferketten sind keine neutralen Beschaffungswege, sondern Wirkungsräume.", "Ausgelagerte Produktion, Vorprodukte, Rohstoffe, Arbeit, Wasser, Energie."],
        ["WÖk - Produkte als Wirkungsträger", "Produkte wirken über Rohstoffe, Herstellung, Nutzung, Reparatur, Entsorgung und Kreislauffähigkeit.", "Exportierte Fahrzeuge, Maschinen, Anlagen, Chemieprodukte und Produktlebenszyklus."],
        ["WÖk - WÖk-IDs, Scorecards und Reverse Merit Order", "Wirkung wird über Indikatoren, Benchmarks, Scorecards und Nichtkompensation operationalisiert.", "Konkrete Lösung gegen Verantwortungsverkürzung."],
      ],
      relevantWoekIds: [
        ["WOK-E-179", "SDG 13 - Klima", "THG-Emissionen Scope 1/2/Intensität", "Territoriale und unternehmensnahe Emissionsdaten."],
        ["WOK-SC-128", "SDG 13 - Klima", "Scope-3 Datenqualität", "Qualität der Lieferketten- und Produktnutzungsdaten."],
        ["WOK-P-125", "SDG 13 - Klima", "Produktlebenszyklus CO₂", "Bewertung exportierter Produkte über Rohstoff, Herstellung, Nutzung und Lebensende."],
        ["WOK-SC-125", "SDG 12 - Konsum/Produktion", "Lieferkette - Zirkularität", "Ressourcen- und Kreislaufwirkung in Vorstufen."],
        ["WOK-P-122", "SDG 12 - Konsum/Produktion", "PCF / Reparierbarkeit / Rücknahme", "Produktfußabdruck, Nutzungsdauer und Rücknahmesysteme."],
        ["WOK-SC-119", "SDG 9 - Industrie/Innovation", "Lieferkette - Digitalisierung / Transparenz", "Datenfähigkeit globaler Lieferketten."],
      ],
      dataFacts: [
        ["Territorial", "Deutschland meldete für 2024 rund 649 Mio. t CO₂-Äquivalente; BMUKN/UBA-Vorabdaten beziffern 2025 auf 648,9 Mio. t CO₂e. Diese Werte sind wichtig für nationale Klimaziele, messen aber nur Inlandsemissionen."],
        ["Global", "EDGAR/JRC weist für 2024 globale Treibhausgasemissionen von rund 53,2 Gt CO₂e ohne LULUCF aus. Das ist die Vergleichsgröße für enge territoriale Anteile."],
        ["Konsum", "Das UBA beziffert deutsche Pro-Kopf-Treibhausgasemissionen bei Berücksichtigung von Import und Export von Gütern mit 10,3 t CO₂e pro Jahr."],
        ["Fußabdruck", "Eurostat weist für 2023 einen deutschen Treibhausgas-Fußabdruck des Konsums von 903 Mio. t CO₂e beziehungsweise 10,8 t pro Kopf aus. Die Konsumperspektive umfasst Emissionen entlang der Produktionskette, unabhängig davon, wo sie entstehen."],
        ["Scope 3", "Das GHG Protocol führt die Nutzung verkaufter Produkte als Scope-3-Kategorie 11. Für Automobil-, Maschinen- und Energieprodukte ist diese Bilanzgrenze zentral."],
        ["Autoexporte", "Destatis meldete für 2024 rund 3,4 Mio. exportierte neue Pkw aus Deutschland; 25,9 % waren vollelektrisch, der Rest überwiegend Verbrenner oder Hybride."],
        ["Historie", "Our World in Data zeigt kumulative CO₂-Emissionen seit 1750 als eigene Verantwortungsfrage. Ein Jahresanteil ersetzt diese Perspektive nicht."],
      ],
      boundaryNote:
        "Territoriale Emissionen, Konsumemissionen, Unternehmens-Scope-3 und historische Emissionen dürfen nicht zu einer einzigen Zahl addiert werden. Sie müssen nebeneinander sichtbar werden, weil sie unterschiedliche Verantwortungsfragen beantworten.",
      conclusion:
        "Die 2-%-Behauptung wirkt stark, weil sie einfach ist. Aber sie ist zu einfach. Sie misst höchstens einen engen territorialen Ausschnitt und macht daraus eine Aussage über Verantwortung. Genau dort liegt die Verzerrung.\n\nWirkungsökonomisch reicht es nicht, auf Landesgrenzen zu schauen. Entscheidend ist, welche Wirkung durch Nachfrage, Produkte, Lieferketten, Technologien, Kapital und politische Standards entsteht. Diese Wirkung darf nicht in Bilanzen verschwinden. Sie muss sichtbar, prüfbar und rückgekoppelt werden.\n\nDie bessere Antwort auf die 2-%-Behauptung lautet daher nicht: Deutschland rettet allein das Klima. Sie lautet: Deutschland muss die Wirkungsräume, die es beeinflusst, ehrlich bilanzieren und so steuern, dass Produkte, Märkte, Investitionen und Regeln positive Netto-Wirkung für Mensch, Planet und Demokratie erzeugen.",
    },
    sources: [
      "Umweltbundesamt - Treibhausgas-Emissionen in Deutschland",
      "EDGAR/JRC - globale Treibhausgasemissionen 2025 Report",
      "Umweltbundesamt - Treibhausgasemissionen pro Person",
      "Eurostat - Greenhouse gas emission footprints",
      "Eurostat - Methodik Konsumperspektive",
      "GHG Protocol - Corporate Value Chain Scope 3 Standard",
      "Destatis - 3.4 million new cars exported from Germany in 2024",
      "Our World in Data - Share of global cumulative CO2 emissions",
    ],
  },
  {
    title: "CO₂-Preis oder fossile Systemkosten? Warum wir so oder so zahlen",
    slug: "co2-preis-oder-fossile-systemkosten",
    claimPhrase: "„Der CO₂-Preis macht alles teurer.“",
    shortJudgement: "Wahrer Kostenkern, falscher Belastungsframe.",
    narrativeFamilies: ["CO₂-Preis-Abzocke", "Kontrollverlust", "Ohnmacht", "Verzögerung"],
    riskLevel: "hoch",
    themes: ["Energiewende", "Politik", "Wirtschaft"],
    sdgs: ["SDG 7", "SDG 9", "SDG 11", "SDG 13"],
    sdgPlus: ["Wirkungswahrheit", "soziale Fairness", "Handlungsfähigkeit"],
    subtitle: "Wahrer Kostenkern, falscher Belastungsframe.",
    abstract:
      "Die Aussage „Der CO₂-Preis macht alles teurer“ enthält einen wahren Kern: Fossile Energie wird durch CO₂-Bepreisung sichtbar teurer. Irreführend wird sie, wenn der CO₂-Preis als reine Zusatzbelastung dargestellt wird, während fossile Systemkosten ausgeblendet bleiben. Klimaschäden, Luftschadstoffe, Gesundheitskosten, fossile Importabhängigkeit, Preis- und Versorgungsschocks sowie geopolitische Verwundbarkeit entstehen auch ohne CO₂-Preis. Ohne wirksame Steuerung zahlen wir später, unsichtbarer, ungerechter und oft teurer.",
    summary: {
      judgement: "Wahrer Kostenkern, falscher Belastungsframe.",
      true_core: "CO₂-Bepreisung macht fossile Nutzung sichtbar teurer.",
      problem: "Der Frame vergleicht sichtbare CO₂-Kosten mit null Kosten und blendet fossile Folgekosten aus.",
      narrative: "CO₂-Preis-Abzocke / Kontrollverlust / Ohnmacht.",
      risk: "Akzeptanz für Lenkung, Entlastung und Transformation sinkt.",
      host_answer: "Wir zahlen so oder so - die Frage ist, ob wir Wirkung steuern oder Schäden reparieren.",
    },
    answers: {
      ten_seconds:
        "Der CO₂-Preis ist nicht die eigentliche Rechnung. Die eigentliche Rechnung sind Klimaschäden, Krankheitskosten, fossile Importe und Krisenrisiken.",
      thirty_seconds:
        "Ja, der CO₂-Preis macht fossile Energie sichtbar teurer. Aber ohne CO₂-Preis zahlen wir trotzdem: über Klimaschäden, Luftverschmutzung, Krankheit, fossile Importrechnungen und Preisschocks. Der Unterschied ist: Der CO₂-Preis kann lenken und zurückverteilt werden. Fossile Schäden sind echte Verluste.",
      two_minutes:
        "Ich ordne das sauber ein. Der CO₂-Preis ist nicht einfach eine zusätzliche Rechnung, die vorher nicht existierte. Fossile Energie verursacht bereits Kosten: Klimaschäden, zerstörte Infrastruktur, Ernteausfälle, Luftschadstoffe, Gesundheitskosten, fossile Importabhängigkeit und geopolitische Risiken. Diese Kosten tauchen nur nicht vollständig im Preis auf. Der CO₂-Preis ist der Versuch, einen Teil dieser Wirkung sichtbar zu machen und in Entscheidungen zurückzuführen. Wichtig ist: Dieses Geld ist nicht automatisch verloren. Es kann für Klimageld, Gebäudesanierung, erneuerbare Energien, ÖPNV, Industrieumbau und soziale Entlastung genutzt werden. Wirkungsökonomisch ist die Frage deshalb nicht: CO₂-Preis ja oder nein? Sondern: Wie gestalten wir ihn so, dass er Emissionen senkt, Menschen entlastet und fossile Systemkosten reduziert?",
    },
    effectPath: [
      ["Aussage", "Der CO₂-Preis macht alles teurer."],
      ["Wirkstoff", "Sichtbarer Preis als Empörungsimpuls."],
      ["Ausblendung", "Unsichtbare fossile Systemkosten werden nicht mitgerechnet."],
      ["Resonanz", "Kostenangst, Misstrauen, Kontrollverlust."],
      ["Narrativ", "Klimapolitik ist Abzocke."],
      ["Wirkungspotenzial", "Akzeptanz für CO₂-Bepreisung und Klimaschutz sinkt."],
      ["Wirkungsrisiko", "Fossile Abhängigkeit, Gesundheitskosten und Klimaschäden bleiben höher."],
      ["Wirkung dritter Ordnung", "Die Gesellschaft bleibt wirkungsblind: Fossile Energie wirkt billig, obwohl ihre Folgekosten real sind."],
    ],
    frameKey: "verzoegerung",
    redirectQuestion:
      "Vergleichst du gerade den sichtbaren CO₂-Preis mit null Kosten - oder mit den realen fossilen Folgekosten, die wir sonst trotzdem zahlen?",
    dontDo: [
      "Nicht behaupten: CO₂-Preis löst die Klimakrise allein.",
      "Nicht sagen: CO₂-Preis ist keine Belastung.",
      "Nicht soziale Härten kleinreden.",
      "Nicht Klimaschäden und CO₂-Preis als identische Kostenart behandeln.",
      "Nicht auf Scheingenauigkeit bestehen, wenn Modellzahlen genutzt werden.",
    ],
    facts: [
      "2025 lag der nationale CO₂-Preis bei 55 Euro je Tonne; 2026 folgt ein Preiskorridor von 55 bis 65 Euro.",
      "UBA beziffert Umweltkosten aus Straßenverkehr, Strom- und Wärmeerzeugung für 2022 auf rund 301,1 Milliarden Euro.",
      "Emissionshandelserlöse sind öffentliche Mittel und können entlasten oder transformativ investiert werden.",
    ],
    consequences: [
      "Fossile Systemkosten bleiben unsichtbar.",
      "Soziale Belastungen werden gegen Klimaschutz ausgespielt.",
      "Fossile Importabhängigkeit, Gesundheitskosten und Klimaschäden bleiben länger hoch.",
    ],
    woekSolution: [
      "CO₂-Preis als Rückkopplung, nicht als Strafzahlung gestalten.",
      "Einnahmen sozial und transformativ verwenden.",
      "Fossile Systemkosten vollständig sichtbar machen.",
      "Nicht nur Preis erhöhen, sondern echte Alternativen schaffen.",
      "Wirkungshaushalt statt bloßer Einnahmenlogik.",
    ],
    mpd: {
      mensch: "Ohne Entlastung kann CO₂-Bepreisung Haushalte belasten; ohne Steuerung steigen Gesundheits-, Schadens- und Krisenkosten.",
      planet: "Fossile Nutzung bleibt länger attraktiv, wenn Klimaschäden nicht in Entscheidungen zurückgeführt werden.",
      demokratie: "Kostenangst und Misstrauen wachsen, wenn Einnahmen, Entlastung und Wirkung nicht transparent sind.",
    },
    sources: [
      "Umweltbundesamt - Gesellschaftliche Kosten von Umweltbelastungen",
      "Umweltbundesamt - Umweltkosten von Energie und Straßenverkehr",
      "Umweltbundesamt - nEHS-Versteigerungen 2026",
      "Umweltbundesamt - Emissionshandel 21 Milliarden Euro",
    ],
  },
  {
    title: "„Klimaschutz ist Ökodiktatur“",
    slug: "klimaschutz-ist-oekodiktatur",
    shortJudgement: "Irreführender Kontrollverlustframe.",
    narrativeFamilies: ["Kontrollverlust", "Verbotsnarrativ"],
    riskLevel: "hoch",
    themes: ["Klimapolitik", "Demokratie"],
    sdgs: ["SDG 13", "SDG 16"],
    sdgPlus: ["Demokratische Legitimität", "Diskursfähigkeit"],
    subtitle: "Kontrollverlustframe statt demokratischer Prüfung",
    abstract:
      "Die Aussage greift eine reale demokratische Frage auf: Klimapolitik muss legitimiert, verhältnismäßig, sozial abgefedert und kontrollierbar sein. Irreführend wird sie, wenn jede Regel, jeder Standard oder jedes Preissignal pauschal als Diktatur gerahmt wird. Wirkungsökonomisch ist das ein Kontrollverlust- und Verbotsangst-Wirkstoff: Die konkrete Maßnahme wird nicht mehr geprüft, sondern als Freiheitsbedrohung aufgeladen.",
    summary: {
      judgement: "Irreführender Kontrollverlustframe.",
      true_core: "Klimapolitik muss demokratisch legitimiert und verhältnismäßig sein.",
      problem: "Regeln und Steuerung werden pauschal als Diktatur gerahmt.",
      narrative: "Kontrollverlust / Verbotsnarrativ.",
      risk: "Demokratische Abwägung wird durch Angst und Misstrauen verdrängt.",
      host_answer: "Nicht jede Regel ist Diktatur. Prüfen wir Legitimation, Wirkung und Verhältnismäßigkeit.",
    },
    answers: {
      ten_seconds: "Nicht jede Regel ist Diktatur. Die Frage ist: Ist die Maßnahme demokratisch, verhältnismäßig und wirksam?",
      thirty_seconds:
        "Der wahre Kern ist: Klimapolitik muss demokratisch kontrolliert werden. Der Denkfehler ist, jede Regel als Ökodiktatur zu rahmen. Wirkungsökonomisch prüfen wir konkrete Maßnahmen: Wer entscheidet, wer zahlt, wer profitiert, welche Wirkung entsteht?",
      two_minutes:
        "Ich ordne das ein. In einer Demokratie darf und muss man Klimapolitik kritisieren: Kosten, Freiheit, soziale Verteilung und Nebenwirkungen sind relevante Fragen. Aber der Begriff Ökodiktatur macht aus demokratisch prüfbaren Maßnahmen ein Feindbild. Dann sprechen wir nicht mehr über konkrete Gesetze, Alternativen und Wirkungen, sondern über Angst. Die bessere wirkungsökonomische Frage lautet: Welche Maßnahme schützt Freiheit, Gesundheit, Klima und soziale Stabilität zugleich - und wie wird sie demokratisch kontrolliert?",
    },
    effectPath: [
      ["Aussage", "Klimaschutz wird als Diktatur gerahmt."],
      ["Wirkstoff", "Verbots- und Kontrollverlustimpuls."],
      ["Resonanz", "Freiheitsangst, Trotz und Misstrauen."],
      ["Wirkungspotenzial", "Konkrete Maßnahmen werden nicht mehr differenziert geprüft."],
      ["Wirkungsrisiko", "Akzeptanz für wirksame und demokratische Lösungen sinkt."],
      ["Folge falschen Handelns", "Polarisierung steigt, notwendige Infrastruktur wird verzögert."],
    ],
    frameKey: "verbotsangst",
    redirectQuestion: "Welche konkrete Maßnahme meinst du - und wo genau fehlt demokratische Kontrolle?",
    dontDo: ["Nicht Freiheit gegen Klima ausspielen.", "Nicht echte soziale Härten ignorieren."],
    facts: ["Klimapolitik kann Regeln, Preise, Standards und Förderung enthalten.", "Demokratische Legitimation und Verhältnismäßigkeit müssen konkret geprüft werden."],
    consequences: ["Misstrauen steigt.", "Lösungen werden pauschal delegitimiert.", "Polarisierung blockiert Infrastruktur."],
    woekSolution: ["Maßnahmen nach MPD und Reverse Merit Order prüfen.", "Soziale Rückverteilung und Beteiligung sichtbar machen.", "Freiheitsschutz und Schadensvermeidung zusammen bewerten."],
    mpd: {
      mensch: "Soziale Abfederung und Freiheitsschutz müssen mitgedacht werden.",
      planet: "Wirksame Klimamaßnahmen können durch Pauschalabwehr verzögert werden.",
      demokratie: "Diskursfähigkeit und Vertrauen in demokratische Verfahren sinken.",
    },
    sources: ["Umweltbundesamt - Treibhausgas-Projektionen", "IPCC AR6 Synthesis Report - Headline Statements"],
  },
  {
    title: "„Die Energiewende ist gescheitert“",
    slug: "energiewende-gescheitert",
    shortJudgement: "Pauschaler Scheiternsframe.",
    narrativeFamilies: ["Scheiternsframe", "Rosinenpickerei"],
    riskLevel: "hoch",
    themes: ["Energiewende", "Stromsystem"],
    sdgs: ["SDG 7", "SDG 9", "SDG 13"],
    sdgPlus: ["Quellenklarheit"],
    subtitle: "Scheiternsframe statt Engpassanalyse",
    abstract:
      "Die Aussage enthält oft reale Probleme: Netzausbau, Speicher, Genehmigungen, Strompreise, Industriebelastung oder Akzeptanzkonflikte. Irreführend wird sie, wenn daraus ein pauschales Scheitern der gesamten Energiewende konstruiert wird. Wirkungsökonomisch ist das ein Scheiternsframe: Einzelne Engpässe werden genutzt, um den Transformationspfad insgesamt zu delegitimieren. Die bessere Antwort lautet: Nicht pauschal scheitern oder feiern, sondern Engpässe identifizieren.",
    summary: {
      judgement: "Pauschaler Scheiternsframe.",
      true_core: "Die Energiewende hat reale Engpässe und Zielkonflikte.",
      problem: "Aus Engpässen wird Totalversagen gemacht.",
      narrative: "Scheiternsframe / Verzögerung.",
      risk: "Lernfähigkeit und Investitionssicherheit sinken.",
      host_answer: "Probleme sind nicht automatisch Scheitern. Die Frage ist: Welcher Engpass begrenzt die Wirkung?",
    },
    answers: {
      ten_seconds: "Probleme sind nicht automatisch Scheitern. Wirkungsökonomisch fragen wir: Welcher Engpass begrenzt gerade die Wirkung?",
      thirty_seconds:
        "Der wahre Kern ist: Es gibt reale Probleme bei Netzen, Speichern, Preisen und Tempo. Der Denkfehler ist, daraus ein komplettes Scheitern zu machen. Die Energiewende ist kein einzelner Schalter, sondern ein Systemumbau. Entscheidend ist, welche Engpässe wir lösen.",
      two_minutes:
        "Ich ordne das kurz ein. Die Aussage klingt stark, weil sie reale Frustration aufgreift: Netze dauern, Speicher fehlen, Preise sind komplex, Genehmigungen dauern. Aber ein komplexer Umbau ist nicht gescheitert, nur weil Engpässe sichtbar werden. Wirkungsökonomisch behandeln wir das als Engpassanalyse: Was senkt Emissionen? Was schafft Versorgungssicherheit? Was schützt Haushalte und Industrie? Was stärkt Akzeptanz? Dann lenken wir Investitionen genau dorthin, wo die nächste positive Netto-Wirkung entsteht.",
    },
    effectPath: [
      ["Aussage", "Die Energiewende ist gescheitert."],
      ["Wirkstoff", "Engpass wird als Totalversagen gerahmt."],
      ["Resonanz", "Frust, Ohnmacht und Abbruchimpuls."],
      ["Wirkungspotenzial", "Lernfähigkeit und Investitionssicherheit sinken."],
      ["Wirkungsrisiko", "Notwendige Netze, Speicher und Flexibilität werden verzögert."],
      ["Folge falschen Handelns", "Fossile Pfade bleiben länger bestehen."],
    ],
    frameKey: "scheitern",
    redirectQuestion: "Welcher konkrete Engpass begrenzt die Wirkung - und was müsste angepasst werden?",
    dontDo: ["Nicht reale Engpässe schönreden.", "Nicht in eine Ja/Nein-Lagerfrage über die gesamte Energiewende rutschen."],
    facts: ["Energiewende ist ein Systemumbau aus Erzeugung, Netz, Speicher, Flexibilität und Nachfrage.", "Engpässe sind Korrektursignale, nicht automatisch Scheitern."],
    consequences: ["Investitionen werden unsicherer.", "Infrastruktur wird verzögert.", "Lernfähigkeit sinkt."],
    woekSolution: ["T-SROI für Netze, Speicher, Wärmenetze, Gebäudesanierung und Industrieumstellung.", "Wirkungshaushalte für Energieinfrastruktur.", "Wirkungssteuer auf Energieträger nach Klima-, Gesundheits-, Ressourcen- und Demokratiewirkung.", "Soziale Rückverteilung, damit Transformation nicht als Kontrollverlust erlebt wird."],
    mpd: {
      mensch: "Haushalte und Beschäftigte brauchen verlässliche, sozial abgefederte Übergänge.",
      planet: "Fossile Emissionen bleiben länger wirksam, wenn Infrastruktur stockt.",
      demokratie: "Akzeptanz sinkt, wenn Frust in Totalurteile kippt.",
    },
    sources: ["Fraunhofer ISE / Energy-Charts", "IEA - Renewables", "Umweltbundesamt - Treibhausgas-Projektionen"],
  },
  {
    title: "„Windräder zerstören die Natur“",
    slug: "windraeder-zerstoeren-natur",
    shortJudgement: "Wahrer Konflikt, falsche Pauschalisierung.",
    narrativeFamilies: ["Halbwahrheit", "Angstframe"],
    riskLevel: "mittel",
    themes: ["Windkraft", "Naturschutz"],
    sdgs: ["SDG 7", "SDG 13", "SDG 15"],
    sdgPlus: ["lokale Beteiligung"],
    subtitle: "Realer Zielkonflikt, falsche Pauschalisierung",
    abstract:
      "Die Aussage enthält einen berechtigten Kern: Windenergie kann lokale Konflikte mit Landschaft, Artenschutz, Vögeln, Fledermäusen, Waldstandorten und Anwohner:innen erzeugen. Irreführend wird sie, wenn daraus pauschal folgt, Windkraft sei grundsätzlich naturzerstörend oder klimapolitisch falsch. Wirkungsökonomisch ist das ein Halbwahrheits-Wirkstoff: Ein realer Einzelkonflikt wird gegen den gesamten Transformationspfad gestellt. Die bessere Antwort lautet: Natur- und Klimaschutz dürfen nicht gegeneinander ausgespielt werden.",
    summary: {
      judgement: "Wahrer Konflikt, falsche Pauschalisierung.",
      true_core: "Windenergie kann lokale Natur- und Artenschutzkonflikte erzeugen.",
      problem: "Einzelkonflikte werden zur Ablehnung der gesamten Technologie genutzt.",
      narrative: "Angstframe / Halbwahrheit / Verzögerung.",
      risk: "Klimaschutz und Naturschutz werden gegeneinander ausgespielt.",
      host_answer: "Der Zielkonflikt ist real. Aber die Lösung heißt gute Planung, nicht pauschale Blockade.",
    },
    answers: {
      ten_seconds: "Der Zielkonflikt ist real. Aber daraus folgt nicht: keine Windkraft. Daraus folgt: bessere Standorte, Artenschutz und Beteiligung.",
      thirty_seconds:
        "Ja, Windräder können lokale Konflikte verursachen. Aber fossile Energien zerstören Natur und Klima systemisch. Die wirkungsökonomische Frage lautet: Welche Option erzeugt über den Lebenszyklus die bessere Netto-Wirkung - mit Artenschutz, Standortprüfung und Beteiligung?",
      two_minutes:
        "Ich ordne das kurz ein. Es wäre falsch, Artenschutz kleinzureden. Vögel, Fledermäuse, Wälder und Landschaften sind reale Wirkungsfelder. Aber es wäre ebenso falsch, daraus eine pauschale Ablehnung von Windenergie zu machen. Die WÖk würde nicht sagen: Wind immer gut. Sie würde sagen: Standort, Bauweise, Beteiligung, Biodiversität, Stromwirkung und Alternativen zusammen bewerten. Das schwächste Wirkungsfeld muss verbessert werden - nicht durch andere Vorteile verdeckt.",
    },
    effectPath: [
      ["Aussage", "Windräder zerstören die Natur."],
      ["Wirkstoff", "Realer Einzelkonflikt wird zur Pauschalablehnung."],
      ["Resonanz", "Natursorge, Landschaftsverlust, lokale Betroffenheit."],
      ["Wirkungspotenzial", "Klimaschutz und Naturschutz werden gegeneinander gestellt."],
      ["Wirkungsrisiko", "Planung, Repowering und Beteiligung werden blockiert."],
      ["Folge falschen Handelns", "Fossile Natur- und Klimaschäden bleiben bestehen."],
    ],
    frameKey: "verzoegerung",
    redirectQuestion: "Welcher Standort, welche Art und welche Minderungsmaßnahme sind konkret gemeint?",
    dontDo: ["Artenschutz nicht kleinreden.", "Nicht Windkraft pauschal als immer gut rahmen."],
    facts: ["Windenergie kann lokale Artenschutzkonflikte erzeugen.", "Netto-Wirkung hängt von Standort, Planung, Minderungsmaßnahmen und Alternativen ab."],
    consequences: ["Naturschutz und Klimaschutz werden gegeneinander ausgespielt.", "Repowering und Beteiligung werden schwieriger.", "Fossile Schäden bleiben länger bestehen."],
    woekSolution: ["Standortprüfung, Artenschutz, Beteiligung und Repowering in Scorecards erfassen.", "Nichtkompensation anwenden: Biodiversitätsschäden dürfen nicht durch Klimanutzen verdeckt werden.", "Lokale Wirkungsdaten in Planung und Beschaffung rückkoppeln."],
    mpd: {
      mensch: "Beteiligung und lokale Belastungen müssen ernst genommen werden.",
      planet: "Klima- und Biodiversitätswirkung müssen zusammen bewertet werden.",
      demokratie: "Akzeptanz wächst durch transparente Planung und Beteiligung.",
    },
    sources: ["Umweltbundesamt - Windenergie an Land"],
  },
  {
    title: "Windräder zerstören Natur?",
    slug: "windraeder-voegel-wald-beton-rueckbau",
    claimPhrase: "„Windräder töten Vögel, zerstören Wald, machen krank und hinterlassen Beton.“",
    shortJudgement: "Reale Zielkonflikte, aber falsches Blockadenarrativ.",
    narrativeFamilies: ["Naturschutz gegen Klimaschutz", "Teilkonflikt als Blockade", "fossile Alternative unsichtbar", "Scheiternsframe"],
    riskLevel: "hoch",
    themes: ["Windkraft", "Artenschutz", "Wald", "Rückbau", "Gesundheit"],
    sdgs: ["SDG 3", "SDG 7", "SDG 9", "SDG 11", "SDG 12", "SDG 13", "SDG 15", "SDG 16"],
    sdgPlus: ["Diskursfähigkeit", "institutionelles Vertrauen", "kommunale Beteiligung", "Quellenklarheit", "Schutz vor Manipulation"],
    subtitle: "Vögel, Fledermäuse, Wald, Beton, Infraschall und Rückbau im Folgencheck.",
    abstract:
      "Die Aussage „Windräder zerstören Natur“ enthält einen wahren Kern: Windenergieanlagen können Vögel und Fledermäuse gefährden, Waldstandorte verändern, Flächen beanspruchen, Betonfundamente benötigen, Landschaftsbilder prägen, Anwohner:innen belasten und beim Rückbau Recyclingfragen aufwerfen. Irreführend wird die Aussage, wenn daraus folgt, Windenergie sei grundsätzlich naturfeindlich oder fossile Energie sei die bessere Naturschutzoption. Wirkungsökonomisch liegt ein Zielkonflikt vor, kein Totalurteil. Ein fairer Vergleich betrachtet Standort, Artenschutz, Abschaltalgorithmen, Repowering, Rückbau, Materialkreislauf, Netzwirkung, fossile Alternativen, Klimaschäden, Luftschadstoffe und langfristige Biodiversitätsrisiken zusammen.",
    summary: {
      judgement: "Reale Zielkonflikte, aber falsches Blockadenarrativ.",
      true_core: "Windenergie hat reale Zielkonflikte: Vögel, Fledermäuse, Waldstandorte, Betonfundamente, Landschaft, Schall, Schattenwurf, Akzeptanz, Rückbau und Recycling müssen ernst genommen werden.",
      problem: "Aus konkreten Standort- und Schutzfragen wird ein pauschales Nein zu Windenergie, während fossile Klima-, Luft-, Wasser-, Bergbau- und Biodiversitätsschäden unsichtbar bleiben.",
      narrative: "Naturschutz gegen Klimaschutz / Teilkonflikt als Blockade / fossile Alternative unsichtbar.",
      risk: "Legitime Prüfpflichten kippen in fossile Verzögerung; Klima-, Luft-, Gesundheits- und Biodiversitätsschäden bleiben länger im System.",
      host_answer: "Artenschutz ist real. Blockade ist keine Lösung. Die Antwort heißt Standortscorecard, Abschaltungen, Monitoring, Rückbau und Beteiligung.",
    },
    answers: {
      ten_seconds:
        "Ja, Windräder haben Artenschutzkonflikte. Aber fossile Energie zerstört Natur systemisch. Die Lösung ist Standortscorecard, Abschaltung, Monitoring und Rückbau - nicht fossile Dauerabhängigkeit.",
      thirty_seconds:
        "Der wahre Kern ist: Windräder können Vögel, Fledermäuse, Waldstandorte und Landschaft beeinträchtigen. Der Denkfehler ist: daraus ein pauschales Nein zu Windenergie zu machen. Fossile Alternativen verursachen Klima-, Luft-, Wasser- und Biodiversitätsschäden. Die bessere Frage lautet: Welcher Standort, welche Schutzmaßnahmen und welche Energiealternative haben die beste Netto-Wirkung?",
      two_minutes:
        "Ich ordne das sauber ein. Windenergie ist nicht wirkungsfrei. Es gibt reale Konflikte mit Vögeln, Fledermäusen, Waldstandorten, Landschaft, Beton, Rückbau und Akzeptanz. Das muss man ernst nehmen. Aber daraus folgt nicht, dass fossile Energie die bessere Naturschutzoption ist. Kohle, Öl und Gas verursachen Klimaschäden, Luftschadstoffe, Bergbaufolgen, Wasserbelastungen, fossile Importabhängigkeit und massive Biodiversitätsrisiken. Wirkungsökonomisch vergleichen wir deshalb nicht Windrad gegen ideale Natur, sondern Windenergie am konkreten Standort gegen die realen Alternativen im Energiesystem. Die Lösung heißt: sensible Gebiete vermeiden, Artenschutzdaten nutzen, Fledermausabschaltungen, Antikollisionssysteme, Repowering, Rückbaupflichten, Recycling, Bürgerbeteiligung und eine Standortscorecard. Dann wird aus dem Kulturkampf ein echter Folgencheck.",
    },
    effectPath: [
      ["Aussage", "„Windräder töten Vögel, zerstören Wald, machen krank und hinterlassen Beton.“"],
      ["Wirkstoff", "Einzelkonflikt als Totalblockade."],
      ["Verkürzung", "Lokale Zielkonflikte werden mit Gesamtwirkung verwechselt."],
      ["Ausblendung", "Fossile Klimaschäden, Luftschadstoffe, Bergbau, Wasserbelastungen, Biodiversitätsrisiko durch Erderwärmung und Schutzmaßnahmen verschwinden."],
      ["Resonanz", "Schutzimpuls, Heimatverlust, Angst vor Krankheit, Misstrauen gegen Planung."],
      ["Narrativ", "„Grüne Energie zerstört Natur und Menschen.“"],
      ["Wirkung erster Ordnung", "Ablehnung konkreter Projekte, Konflikte in Kommunen, Verunsicherung."],
      ["Wirkung zweiter Ordnung", "Ausbau, Repowering, Netze und lokale Energiewertschöpfung verzögern sich."],
      ["Wirkung dritter Ordnung", "Fossile Energie bleibt länger im System; Klimaschäden für Natur und Gesellschaft steigen."],
    ],
    frameKey: "verzoegerung",
    redirectQuestion: "Vergleichst du Windräder gerade mit unberührter Natur - oder mit den realen Folgen von Kohle, Öl und Gas?",
    dontDo: [
      "Nicht sagen: Windräder töten keine Vögel.",
      "Nicht Artenschutz gegen Klimaschutz ausspielen.",
      "Nicht mit „Katzen töten mehr Vögel“ als Hauptargument reagieren.",
      "Nicht Waldkonflikte kleinreden.",
      "Nicht Infraschall-Sorgen verspotten.",
      "Nicht Beton, Rückbau und Rotorblatt-Recycling ignorieren.",
      "Nicht fossile Alternativen als neutral behandeln.",
      "Nicht jede Kritik als Desinformation abtun.",
      "Nicht Windenergie als immer und überall richtig darstellen.",
    ],
    facts: [
      "Windenergie kann für bestimmte Vogel- und Fledermausarten reale Risiken erzeugen.",
      "Wind im Wald erfordert besonders sorgfältige Standortprüfung und Naturschutzmaßnahmen.",
      "Fundamente, Kranstellflächen, Wege und Kabeltrassen verändern lokale Böden und Flächen.",
      "Rotorblätter und faserverstärkte Kunststoffe sind beim Recycling anspruchsvoller als Stahl oder Beton.",
      "Nach aktuellem Forschungsstand stützt die Evidenz keine pauschale Gesundheitsbehauptung durch Windenergie-Infraschall unterhalb der Wahrnehmungsschwelle.",
      "Fossile Alternativen verursachen Klima-, Luft-, Wasser-, Bergbau- und Biodiversitätsschäden.",
    ],
    consequences: [
      "Aus legitimer Standortkritik wird pauschale Blockade.",
      "Erneuerbarer Ausbau verzögert sich, fossile Emissionen bleiben länger hoch.",
      "Kommunale Konflikte verhärten sich, statt bessere Schutzmaßnahmen, Rückbaupflichten und Recyclingpfade zu erzwingen.",
      "Klimawandel setzt Wälder, Arten, Böden und Gesundheit stärker unter Druck.",
    ],
    woekSolution: [
      { title: "Standortscorecard für Windenergie", text: "Jeder Standort wird nach Arten, Wald, Boden, Wasser, Landschaft, Schall, Schatten, Netznutzen, Rückbau, Bürgerbeteiligung und fossilem Alternativenvergleich bewertet." },
      { title: "Artenschutzdaten systematisch nutzen", text: "Brutplätze, Flugrouten, Nahrungshabitate, Fledermausaktivität und saisonale Risiken werden in Planung und Betrieb integriert." },
      { title: "Abschaltregeln und Antikollisionssysteme", text: "Temporäre Abschaltungen bei Fledermausaktivität, Brutzeiten oder kritischen Flugereignissen senken Risiken." },
      { title: "Wald differenziert bewerten", text: "Alte, naturnahe, artenreiche oder geschützte Wälder anders bewerten als vorbelastete, monotone oder bereits geschädigte Flächen." },
      { title: "Repowering priorisieren", text: "Alte Anlagen werden ersetzt, wenn dadurch mehr Strom mit weniger Anlagen und besserem Artenschutz möglich wird." },
      { title: "Rückbau und Recycling verpflichtend machen", text: "Fundamente, Wege, Betriebsmittel, Stahl, Beton und Rotorblätter brauchen Rückstellungen, Rückbaupflichten, Recyclingpfade und Nachweis." },
      { title: "Kommunale Beteiligung und lokale Wertschöpfung", text: "Kommunen, Bürger:innen und Anwohner:innen müssen finanziell, planerisch und kommunikativ beteiligt werden." },
      { title: "Fossile Alternativen mitbilanzieren", text: "Jede Ablehnung muss zeigen, welche Stromquelle stattdessen genutzt wird und welche Klima-, Gesundheits- und Naturwirkung daraus entsteht." },
      { title: "Beschwerde- und Monitoringpflicht", text: "Betriebserfahrungen, Beschwerden, Artenschutzdaten und Schallmessungen fließen in lernende Standortbewertung ein." },
    ],
    mpd: {
      mensch: "Schlechte Standortplanung, mangelnde Beteiligung, Schall- und Schattenbelastung oder Vertrauensverlust können Menschen real belasten.",
      planet: "Einzelne Windstandorte können Arten, Wald und Boden schädigen; fossile Verzögerung verschärft Klima- und Biodiversitätsrisiken.",
      demokratie: "Zielkonflikte werden emotionalisiert und polarisieren Kommunen; legitime Sorgen können in Desinformation kippen.",
    },
    sources: [
      "Umweltbundesamt - Ausbau Windenergie an Land 2-Prozent-Ziel",
      "Windenergieflächenbedarfsgesetz",
      "BfN - Windenergie im Wald",
      "BfN-Schriften 742 - Schutz von Fledermäusen beim Ausbau der Windenergie",
      "KNE - Studien zu Windenergie, Biodiversität, Vögeln und Fledermäusen",
      "Fachagentur Wind & Solar - Natur- und Artenschutz",
      "Umweltbundesamt - Windenergieanlagen Rückbau Recycling Repowering",
      "Umweltbundesamt - Gute Praxis Rückbau und Recycling von Windenergieanlagen",
      "Umweltbundesamt - Infraschall von Windenergieanlagen",
      "Umweltbundesamt - Infraschall einfach erklärt",
      "Fraunhofer ISE - Stromgestehungskosten 2024",
      "Umweltbundesamt - Emissionsbilanz erneuerbarer Energieträger",
    ],
  },
  {
    title: "„E-Autos sind schlimmer als Verbrenner“",
    slug: "e-autos-schlimmer-als-verbrenner",
    shortJudgement: "Meist irreführender Lebenszyklusvergleich.",
    narrativeFamilies: ["Halbwahrheit", "Rohstoffangst", "Verzögerung"],
    riskLevel: "hoch",
    themes: ["Mobilität", "Batterien"],
    sdgs: ["SDG 9", "SDG 12", "SDG 13"],
    sdgPlus: ["Lieferkettentransparenz"],
    subtitle: "Rohstoffangst und falscher Lebenszyklusvergleich",
    abstract:
      "Die Aussage enthält einen wahren Kern: Batterien verursachen Rohstoff-, Energie-, Lieferketten- und Recyclingwirkungen. Irreführend wird sie, wenn nur die Herstellung betrachtet wird und die dauerhaften Emissionen von Verbrennern ausgeblendet werden. Zusätzlich wird die Debatte verzerrt, wenn Elektromobilität nur als „Pkw mit Akku“ verstanden wird. Tatsächlich entscheidet die Systemwirkung auch an Ladeinfrastruktur, Alltagseinbettung, E-Transportern, E-Lkw, Depotladen, Schnellladeparks, Megawattladen, Netzanschlüssen, Lastmanagement und Logistikplanung. Wirkungsökonomisch ist das ein Lebenszyklus- und Infrastrukturvergleich: Fahrzeug, Batterie, Strom, Ladeort, Netz, Flotte, Alltag und Alternativen müssen zusammen bewertet werden.",
    summary: {
      judgement: "Meist irreführend.",
      true_core: "Batterien haben relevante Rohstoff- und Herstellungswirkungen.",
      problem: "Herstellung und einzelne Ladeprobleme werden isoliert; Nutzungsemissionen des Verbrenners, Ladeinfrastruktur, E-Lkw, Depotladen, Megawattladen und Fortschritte bei Batteriechemie, Produktion und Recycling werden ausgeblendet.",
      narrative: "Rohstoffangst / Ladeangst / Verzögerung / falscher Lebenszyklus- und Infrastrukturvergleich.",
      risk: "Fossile Mobilität bleibt länger bestehen.",
      host_answer: "Batterien und Laden haben Wirkung - aber der Vergleich muss über Lebenszyklus, Ladeinfrastruktur, Alltag und Logistik gehen.",
    },
    answers: {
      ten_seconds: "Batterien haben Wirkung. Aber fair ist nur der Lebenszyklusvergleich: Herstellung, Strom, Nutzung, Recycling - und fossiler Kraftstoff.",
      thirty_seconds:
        "Der wahre Kern ist: Batterieproduktion braucht Energie und Rohstoffe. Der Denkfehler ist: alte Durchschnittsdaten, falsche Stromannahmen und sichtbare Akkuprobleme gegen unsichtbar gemachte fossile Nutzungsemissionen zu stellen. Wirkungsökonomisch zählen Batteriechemie, Produktionsstrom, Ladequelle, Lebensdauer, Recycling, Fahrzeuggröße, Lieferkette und der verbrannte Kraftstoff des Verbrenners zusammen.",
      two_minutes:
        "Ein E-Auto ist nicht automatisch perfekt. Batterie, Rohstoffe, Arbeitsbedingungen, Strommix, Fahrzeuggröße und Recycling müssen bewertet werden. Aber ein Verbrenner emittiert während seiner gesamten Nutzung fossiles CO₂ und Luftschadstoffe. Deshalb reicht der Blick auf die Herstellung nicht. Ein fairer Vergleich betrachtet den gesamten Lebenszyklus: Rohstoffe, Produktion, Transport, Energiequelle, Nutzung, Wartung, Reparatur, Recycling und Entsorgung. Und Elektromobilität ist mehr als Pkw: Transporter, Busse und Lkw werden über Depotladen, Schnellladeparks und künftig Megawattladen eingebunden. Gute Ladeinfrastruktur entsteht dort, wo Fahrzeuge ohnehin stehen: zuhause, bei der Arbeit, am Supermarkt, am Baumarkt, im Parkhaus, im Logistikdepot und an Autobahnen. Wirkungsökonomisch ist die Lösung keine Technologie-Religion, sondern eine Produktscorecard plus Infrastruktur-Scorecard: CO₂-Lebenszyklus, Rohstoffe, Arbeit, Gesundheit, Ladeverfügbarkeit, Strommix, Reparierbarkeit, Recycling und Nutzungskontext. Dann gewinnt nicht das ideologische Lager, sondern die Mobilitätslösung mit der besten Netto-Wirkung.",
    },
    answersFinal: true,
    effectPath: [
      ["Aussage", "„E-Autos sind schlimmer / unpraktisch / Laden dauert zu lange / Lkw gehen elektrisch nicht.“"],
      ["Wirkstoff", "Batterieproblem und Ladeangst als Totalargument."],
      ["Verkürzung", "Batterieherstellung oder einzelne Ladeprobleme werden mit Gesamtwirkung und Alltagstauglichkeit verwechselt."],
      ["Ausblendung", "Lebenszyklus, Nutzungsemissionen des Verbrenners, Depotladen, Alltagsladen, Schnellladeparks, Megawattladen, Lastmanagement und Mobilitätsalternativen verschwinden."],
      ["Resonanz", "Rohstoffangst, Ladeangst, Kontrollverlust, Technikskepsis, Veränderungsabwehr."],
      ["Narrativ", "„Die grüne Lösung funktioniert in der Realität sowieso nicht.“"],
      ["Wirkungspotenzial", "Akzeptanz für E-Mobilität, Ladeinfrastruktur, E-Lkw-Korridore und Flottenumstellung sinkt."],
      ["Wirkungsrisiko", "Fossile Pkw, Transporter und Lkw bleiben länger im System."],
      ["Wirkung dritter Ordnung", "Das Verkehrssystem bleibt an Tankstellenlogik, fossile Lieferketten und Verbrenner-Infrastruktur gebunden."],
    ],
    frameKey: "verzoegerung",
    redirectQuestion: "Reden wir über Alltag, Langstrecke oder Lkw-Logistik - und welche Ladeinfrastruktur gehört zu diesem Fall?",
    dontDo: ["Batterieprobleme nicht wegwischen.", "Nicht nur CO₂ betrachten und Arbeitsbedingungen vergessen.", "Nicht behaupten, Ladeinfrastruktur sei überall perfekt.", "Nicht nur Ladepunktzahl nennen; Ladeleistung, Standort, Verfügbarkeit und Nutzerfreundlichkeit mitbewerten.", "E-Lkw nicht wie Pkw behandeln.", "Ladezeit nicht als absolute Zahl verkaufen; Ladefenster und durchschnittliche Ladeleistung nennen."],
    facts: [
      "Batterieproduktion hat relevante Wirkungen, aber sie ist nur ein Teil des Lebenszyklus.",
      "LFP-Batterien verwenden Lithium-Eisenphosphat und kommen in der Kathode ohne Kobalt und Nickel aus; sie lösen nicht jede Rohstofffrage, verändern aber den Kobalt-Frame deutlich.",
      "Der CO₂-Fußabdruck von Batterien hängt stark vom Produktionsstrom ab; alte Studien mit fossilem Durchschnittsstrom überschätzen heutige und künftige Werke, wenn reale Energieverträge und erneuerbare Versorgung ignoriert werden.",
      "Bei geförderter öffentlich zugänglicher Ladeinfrastruktur in Deutschland verlangen Förderbedingungen Strom aus erneuerbaren Energien. Das ist präziser als die pauschale Behauptung, jede Ladesäule sei rechtlich immer Ökostrom.",
      "Recycling und Second Life machen Batterien zu einem Materialkreislauf; fossile Kraftstoffe werden einmal verbrannt und sind danach als Energie- und Kohlenstoffträger weg.",
      "Brandrisiken sind real, aber der Satz vom grundsätzlich unlöschbaren Akku ist ein Angstframe. Elektrofahrzeugbrände brauchen angepasste Taktik, sind aber kein Beweis gegen E-Mobilität insgesamt.",
      "Batteriegarantien sind modellabhängig; 8 Jahre und etwa 160.000 bis 250.000 km sind im Pkw-Markt verbreitet. Extrem hohe Laufleistungsangaben einzelner Hersteller oder Nutzfahrzeuganwendungen dürfen nicht als Standardgarantie für alle E-Autos verkauft werden.",
      "Laden ist nicht Tanken: Ein großer Teil des Ladens kann dort passieren, wo Fahrzeuge ohnehin stehen - zuhause, bei der Arbeit, beim Einkaufen, im Parkhaus, am Depot, an Hubs oder entlang der Autobahn.",
      "Für E-Transporter, Busse und viele regionale Lkw ist Depotladen zentral; für Fernverkehr braucht es zusätzlich HPC- und Megawattladeinfrastruktur entlang logistischer Korridore.",
      "Ladeinfrastruktur muss nach Ladeleistung, Verfügbarkeit, Wartung, Preisfairness, Bezahlung, Standortqualität und Alltagseinbettung bewertet werden - nicht nur nach Anzahl der Ladepunkte.",
    ],
    consequences: ["Fossile Nutzungsemissionen werden unsichtbar.", "Rohstofffragen werden nicht gelöst, sondern als Aufschub genutzt.", "Batterieproduktion, Recycling und Ladeinfrastruktur werden schlechter gesteuert.", "E-Transporter-, Bus- und E-Lkw-Korridore werden verzögert.", "Mobilitätswende wird polarisiert."],
    woekSolution: ["Produktscorecards für CO₂, Ressourcen, Arbeit, Gesundheit, Brandrisiko, Recycling und Energiequelle.", "Lieferkettentransparenz, Batteriepass und Batteriechemie sichtbar machen.", "Realen Produktionsstrom und Ladequelle statt alter Durchschnittsannahmen ausweisen.", "Fahrzeuggröße, Lebensdauer und Mobilitätsbedarf in die Bewertung einbeziehen.", "Recyclingfähigkeit, Rückgewinnungsquoten, Second Life und Reparierbarkeit als eigene Wirkungsfelder bewerten.", "Ladeinfrastruktur als Wirkungsinfrastruktur bewerten: Ladeleistung, Verfügbarkeit, Standortnutzen, Preisfairness, Barrierefreiheit, Wartung, Netzanschluss und Alltagseinbettung.", "Alltagsladen an Supermärkten, Baumärkten, Parkhäusern, Arbeitsplätzen, Hotels und kommunalen Orten ausbauen.", "E-Lkw-Korridore, Depotladen, Logistikhubs und Megawattladen entlang relevanter Routen aufbauen.", "Ladezeit als Standzeit planen: Einkauf, Arbeit, Parken, Depot, Pause, Be- und Entladung sowie Schichtwechsel.", "Netzanschluss, Lastmanagement, Speicher, PV-Dächer und faire Netzentgelte mitbewerten."],
    mpd: {
      mensch: "Gesundheit, Arbeitsbedingungen und bezahlbare Mobilität müssen zusammen bewertet werden.",
      planet: "CO₂, Ressourcen und Recycling entscheiden gemeinsam über Netto-Wirkung.",
      demokratie: "Lieferkettentransparenz und Quellenklarheit stärken Vertrauen.",
    },
    sources: [
      "Umweltbundesamt - Klimavorteil für E-Autos bestätigt",
      "ICCT - Life-cycle greenhouse gas emissions from passenger cars in Europe",
      "IEA - Global EV Outlook 2024",
      "Fraunhofer ISI - Batterien für Elektroautos Faktencheck 2025",
      "EU - Regulation 2023/1542 on batteries and waste batteries",
      "Fraunhofer ILT - Recycling von LFP-Batterien",
      "BGR - Lithium aus Tiefenwässern in Deutschland",
      "Fraunhofer ISE - Lithium aus geothermalen Solen im Oberrheingraben",
      "BMV - Förderrichtlinie öffentlich zugängliche Ladeinfrastruktur",
      "NIST - Understanding the Risk of Lithium-Ion Battery Fires",
      "Bundesnetzagentur - öffentliche Ladeinfrastruktur Deutschland",
      "Deutschlandnetz - HPC-Schnellladepunkte",
      "BMV - Deutschlandnetz",
      "IEA - EV charging infrastructure",
      "EU AFIR - Alternative Fuels Infrastructure Regulation",
      "CharIN - Megawatt Charging System",
      "HoLa - Hochleistungsladen Lkw",
      "EU - Lenk- und Ruhezeiten Straßentransport",
    ],
  },
  {
    title: "„Batterien sind nicht recyclebar“",
    slug: "batterien-sind-nicht-recyclebar",
    shortJudgement: "Falsch oder veraltet, je nach Batterie- und Recyclingtyp.",
    narrativeFamilies: ["Technikskepsis", "Rohstoffangst"],
    riskLevel: "mittel",
    themes: ["Batterien", "Kreislaufwirtschaft"],
    sdgs: ["SDG 9", "SDG 12", "SDG 13"],
    sdgPlus: ["Lieferkettentransparenz"],
    subtitle: "Rohstoffangst statt Kreislaufanalyse",
    abstract:
      "Die Aussage enthält einen wahren Kern: Batterierecycling ist technisch, ökonomisch und organisatorisch anspruchsvoll. Irreführend wird sie, wenn daraus folgt, Batterien seien grundsätzlich nicht recyclebar oder Kreislaufwirtschaft sei sinnlos. Heute geht es nicht mehr um Ja oder Nein, sondern um Batteriechemie, Design, Rücknahme, Second Life, Prozessqualität, Rückgewinnungsquoten, Energiequelle und Regulierung. Wirkungsökonomisch zählt, welche Materialien tatsächlich im Kreislauf bleiben - und welche Rohstoff-, Arbeits- und Klimawirkung dadurch sinkt.",
    summary: {
      judgement: "Falsch oder veraltet, je nach Batterie- und Recyclingtyp.",
      true_core: "Batterierecycling ist anspruchsvoll und braucht Standards.",
      problem: "Aus Herausforderungen wird grundsätzliche Unmöglichkeit gemacht.",
      narrative: "Technikskepsis / Rohstoffangst.",
      risk: "Kreislaufwirtschaft und bessere Batteriepolitik werden verzögert.",
      host_answer: "Recycling ist eine Industrie-, Design- und Skalierungsfrage, kein pauschales Unmöglichkeitsargument.",
    },
    answers: {
      ten_seconds: "Batterien sind nicht „nicht recyclebar“. Entscheidend sind Chemie, Rücknahme, Verfahren, Rückgewinnungsquote und sauberer Prozessstrom.",
      thirty_seconds:
        "Der wahre Kern ist: Recycling braucht Standards, Rücknahme und Skalierung. Der Denkfehler ist, daraus Nicht-Recyclebarkeit zu machen. EU-Batterierecht, Batteriepass, Rezyklatvorgaben und industrielle Recyclingkapazitäten verschieben die Frage: Welche Chemie, welches Design, welches Verfahren, welche Rückgewinnungsquote und welche Nutzung vor dem Recycling sind gemeint?",
      two_minutes:
        "Ich ordne das ein. Batterien sind kein wirkungsfreies Produkt: Rohstoffe, Herstellung, Nutzung, Sicherheit und Recycling müssen geprüft werden. Aber der Satz „nicht recyclebar“ ist zu pauschal und oft veraltet. Moderne Recyclingverfahren gewinnen wertvolle Metalle zurück; EU-Regeln setzen Mindestziele für Rückgewinnung, Rezyklatanteile, CO₂-Fußabdruck, Sorgfaltspflichten und Batteriepass. LFP-Batterien verändern außerdem die Rohstoffdebatte, weil sie in der Kathode ohne Kobalt und Nickel auskommen, auch wenn Lithium, Graphit, Energie und gute Lieferketten weiter relevant bleiben. Wirkungsökonomisch lautet die richtige Frage nicht: Akku gut oder böse? Sondern: Welche Batterie wird wie gebaut, wie lange genutzt, wie geladen, wie sicher betrieben, wie demontiert, wie hochwertig recycelt und wie transparent dokumentiert?",
    },
    effectPath: [
      ["Aussage", "Batterien seien nicht recyclebar."],
      ["Wirkstoff", "Rohstoffproblem wird als technischer Endpunkt gerahmt."],
      ["Resonanz", "Technikskepsis und Ressourcenangst."],
      ["Wirkungspotenzial", "Kreislaufstrategien wirken sinnlos."],
      ["Wirkungsrisiko", "Recycling, Design und Rücknahme werden weniger priorisiert."],
      ["Folge falschen Handelns", "Rohstoff- und Lieferkettenprobleme bleiben schlechter steuerbar."],
    ],
    frameKey: "verzoegerung",
    redirectQuestion: "Welche Batteriechemie und welches Recyclingverfahren meinst du konkret?",
    dontDo: ["Nicht behaupten, Recycling löse alle Rohstofffragen allein.", "Nicht Batterieprobleme als Argument gegen jede Elektrifizierung verallgemeinern."],
    facts: [
      "Batterierecycling braucht Standards, Rücknahme, Demontage, Prozessenergie und industrielle Skalierung.",
      "Die Bewertung hängt von Chemie, Verfahren, Design, Nutzung, Restkapazität und Rückgewinnungsquote ab.",
      "EU-Batterierecht schreibt unter anderem CO₂-Fußabdruck, Sorgfaltspflichten, Batteriepass, Recyclingeffizienz, Materialrückgewinnung und Rezyklatanteile vor.",
      "Für Kobalt, Kupfer, Blei und Nickel gelten hohe Rückgewinnungsziele; für Lithium steigen die Zielwerte stufenweise. Deshalb ist „gar nicht recyclebar“ als Pauschalbehauptung falsch.",
      "Industrielle Verfahren können hohe Materialrückgewinnung erreichen; das ersetzt aber nicht gutes Design, Rücknahme und ehrliche Datenqualität.",
      "LFP-Akkus enthalten in der Kathode kein Kobalt und Nickel. Dadurch verschiebt sich die Rohstoffkritik, sie verschwindet aber nicht vollständig.",
      "Second Life kann die Nutzungsdauer verlängern, bevor Recycling sinnvoll wird.",
    ],
    consequences: ["Kreislaufwirtschaft wird delegitimiert.", "Rohstoffpolitik bleibt reaktiv.", "Batteriedesign, Rücknahme und europäische Recyclingkompetenz werden verzögert.", "Technikvertrauen sinkt."],
    woekSolution: ["Batteriepass, Rücknahmesysteme und Materialscorecards stärken.", "Design for Recycling, Demontagefähigkeit und Second-Life-Nutzung bewerten.", "Rohstoff-, Arbeits- und Recyclingwirkung in Produktentscheidungen rückkoppeln.", "Rückgewinnungsquoten, Rezyklatanteile und Prozessstrom transparent ausweisen.", "Recycling nicht als moralische Beruhigung nutzen, sondern als überprüfbaren industriellen Kreislauf."],
    mpd: {
      mensch: "Arbeitsbedingungen und regionale Wertschöpfung müssen sichtbar werden.",
      planet: "Ressourcen, Recycling und Energiequelle entscheiden über Netto-Wirkung.",
      demokratie: "Transparente Produktdaten stärken Vertrauen und Kontrolle.",
    },
    sources: [
      "Fraunhofer ISI - Batterien für Elektroautos Faktencheck 2025",
      "EU - Regulation 2023/1542 on batteries and waste batteries",
      "Fraunhofer ILT - Recycling von LFP-Batterien",
      "BGR - Lithium aus Tiefenwässern in Deutschland",
      "Fraunhofer ISE - Lithium aus geothermalen Solen im Oberrheingraben",
      "IEA - Global EV Outlook 2024",
      "NIST - Understanding the Risk of Lithium-Ion Battery Fires",
    ],
  },
  {
    title: "„Kernkraft zurück?“",
    slug: "kernenergie-wieder-in-deutschland",
    shortJudgement: "Wahrer CO₂-Kern, falsches Abkürzungsnarrativ.",
    narrativeFamilies: ["Kernkraft als Rettung", "Grundlastnarrativ", "Rationalität gegen Ideologie", "Zeitfensterblindheit"],
    riskLevel: "hoch",
    themes: ["Kernenergie", "Stromsystem", "Deutschland"],
    sdgs: ["SDG 7", "SDG 9", "SDG 12", "SDG 13", "SDG 16"],
    sdgPlus: ["intergenerationelle Verantwortung", "Quellenklarheit", "demokratische Risikolegitimation"],
    subtitle: "CO₂-arm heißt nicht automatisch sinnvoll für Deutschland.",
    abstract:
      "Die Aussage „Deutschland sollte zur Kernkraft zurück“ enthält einen wahren Kern: Kernkraftwerke erzeugen im Betrieb sehr wenig CO₂, liefern wetterunabhängig Strom und werden in mehreren Ländern als Teil der Klimastrategie betrachtet. Irreführend wird das Narrativ, wenn Kernenergie als schnelle, billige und einfache Lösung für Deutschlands Energieprobleme dargestellt wird. Für Deutschland geht es nicht nur um Physik, sondern um Systemwirkung: Die letzten Kraftwerke sind abgeschaltet, Rückbauprozesse laufen, Fachkräfte und Lieferketten müssten neu aufgebaut werden, neue Anlagen hätten lange Planungs- und Bauzeiten, hohe Finanzierungskosten, Sicherheitsanforderungen, Rückbau- und Endlagerverpflichtungen. Auch Transmutation ersetzt kein Endlager.",
    summary: {
      judgement: "Wahrer CO₂-Kern, falsches Abkürzungsnarrativ.",
      true_core: "Kernenergie ist im Betrieb CO₂-arm, energiedicht und wetterunabhängig.",
      problem: "Bauzeit, Kosten, Finanzierung, Endlager, Rückbau, Sicherheit, Kühlwasser, Fachkräfte, Flexibilität und Opportunitätskosten werden oft ausgeblendet.",
      narrative: "Kernkraft als Rettung / Rationalität gegen Ideologie / Grundlastnarrativ.",
      risk: "Politische Aufmerksamkeit und Kapital können von schneller wirksamen Maßnahmen abgezogen werden.",
      host_answer: "CO₂-arm im Betrieb stimmt. Aber für Deutschland zählt die vollständige Wirkungsbilanz: Zeit, Kosten, Risiko, Endlager und Alternativen.",
    },
    answers: {
      ten_seconds:
        "Kernkraft ist CO₂-arm im Betrieb. Aber für Deutschland wäre sie nicht schnell, nicht billig und nicht ohne Langzeitrisiken. Entscheidend sind Bauzeit, Kosten, Endlager und Alternativen.",
      thirty_seconds:
        "Der wahre Kern ist: Atomstrom ist im Betrieb CO₂-arm und wetterunabhängig. Der Denkfehler ist: daraus eine schnelle Lösung für Deutschland zu machen. Unsere AKW sind abgeschaltet, neue Anlagen dauern lange, kosten viel, brauchen Fachkräfte, Sicherheitsarchitektur, Endlager und Finanzierung. Die bessere Frage lautet: Welche Investition senkt bis 2030 und 2035 am meisten Emissionen und Systemkosten?",
      two_minutes:
        "Ich ordne das sauber ein. Kernkraft ist nicht einfach „dumm“ oder „böse“. Im Betrieb ist sie CO₂-arm und liefert verlässlich Strom. Deshalb setzen einige Länder weiter darauf. Aber für Deutschland ist die Lage anders: Die letzten Kraftwerke wurden 2023 abgeschaltet, Rückbau und Entsorgung laufen, Personal und Lieferketten müssten neu aufgebaut werden. Neue Kernkraftwerke brauchen lange Planungs-, Genehmigungs- und Bauzeiten, hohe Finanzierung, staatliche Garantien, Sicherheitsprüfungen, Kühlwasser, Rückbau und Endlager. Transmutation löst das Endlagerproblem nicht. Wirkungsökonomisch ist deshalb die Frage nicht: Wer ist für oder gegen Atomkraft? Sondern: Welche Maßnahme bringt pro Euro, pro Jahr und pro Risiko die meiste positive Netto-Wirkung? Wenn Erneuerbare, Netze, Speicher, Effizienz, Lastmanagement und flexible Kraftwerke schneller und günstiger wirken, dann ist Atomkraft für Deutschland kein Klimaschutzhebel, sondern ein Opportunitätskostenrisiko.",
    },
    effectPath: [
      ["Aussage", "Deutschland muss zur Kernkraft zurück."],
      ["Wirkstoff", "CO₂-arme Technik als Abkürzungsversprechen."],
      ["Verkürzung", "Betriebs-CO₂ wird mit Gesamtwirkung verwechselt."],
      ["Ausblendung", "Bauzeit, Kosten, Endlager, Rückbau, Sicherheit, Finanzierung, Fachkräfte, Kühlwasser, Flexibilität und Opportunitätskosten verschwinden."],
      ["Resonanz", "Sicherheitswunsch, Technikvertrauen, Dunkelflaute-Angst und Anti-Ideologie-Frame."],
      ["Wirkungsrisiko", "Investitionen in Netze, Speicher, Effizienz, Flexibilität und Erneuerbare werden politisch relativiert."],
      ["Wirkung dritter Ordnung", "Die Gesellschaft sucht wieder eine zentrale Großlösung statt eine lernende, resiliente Wirkungsarchitektur aufzubauen."],
    ],
    frameKey: "technikwunder",
    redirectQuestion:
      "Redest du über bestehende Kernkraftwerke in anderen Ländern - oder über einen realistischen Neustart und Neubau in Deutschland mit Zeit, Kosten, Personal, Endlager und Finanzierung?",
    dontDo: [
      "Nicht Kernkraft-Befürworter:innen als dumm darstellen.",
      "Nicht den niedrigen CO₂-Ausstoß im Betrieb leugnen.",
      "Nicht nur mit Tschernobyl oder Fukushima argumentieren.",
      "Nicht Frankreich, Finnland, UK, Polen oder China pauschal auf Deutschland übertragen.",
      "Nicht Stromgestehungskosten mit Endkundenpreisen verwechseln.",
      "Nicht Transmutation als erledigt oder als Wunderlösung darstellen.",
      "Nicht Grundlast mit Versorgungssicherheit verwechseln.",
    ],
    facts: [
      "Deutschland hat die letzten drei Atomkraftwerke am 15. April 2023 abgeschaltet.",
      "Neue Kernkraft wird in der Fraunhofer-ISE-Stromgestehungskostenstudie 2024 mit einer breiten Kostenspanne geführt; LCOE ist aber nicht Endkundenpreis.",
      "Hochradioaktive Abfälle enthalten den Großteil der Radioaktivität und brauchen eine belastbare Endlagerstrategie.",
      "Transmutation kann Forschung sein, ersetzt nach heutiger Bewertung aber kein Endlager.",
      "Ein Stromsystem mit viel Wind und Sonne braucht gesicherte Leistung, Flexibilität, Speicher, Netze und Systemdienste.",
    ],
    consequences: [
      "Zu späte Wirkung kann Emissionsminderungen im entscheidenden Jahrzehnt verfehlen.",
      "Hohe Kapitalbindung und staatliche Garantien können Mittel für schnellere Maßnahmen verdrängen.",
      "Endlager-, Rückbau-, Zwischenlager- und Sicherheitsverantwortung bleibt über sehr lange Zeiträume bestehen.",
      "Energiepolitik kippt wieder in Lagerkampf statt Wirkungsvergleich.",
    ],
    woekSolution: [
      { title: "Technologie-Wirkungsgate einführen", text: "Energieoptionen nach CO₂-Minderung, Zeit bis Wirkung, Kosten, Systemnutzen, Sicherheit, Rückbau, Ressourcen, Flexibilität und Akzeptanz bewerten." },
      { title: "Zeitfenster verpflichtend machen", text: "Jede Maßnahme muss getrennt für 2030, 2035 und 2045 zeigen, welche Emissions- und Versorgungssicherheitswirkung sie erzeugt." },
      { title: "Opportunitätskosten sichtbar machen", text: "Kapital, Fachkräfte, Genehmigungskapazität und politische Aufmerksamkeit werden als knappe Ressourcen bilanziert." },
      { title: "Endlager und Rückbau nicht ausklammern", text: "Zwischenlagerung, Endlagersuche, Rückbaukosten, Sicherheitsanforderungen und Langzeitverantwortung gehören in jede Kernkraftbilanz." },
      { title: "Erneuerbare Systemarchitektur beschleunigen", text: "Wind, Solar, Netze, Speicher, Lastmanagement, Effizienz, flexible Kraftwerke und europäische Kopplung als Systempaket bewerten." },
    ],
    mpd: {
      mensch: "Hohe Kosten, Sicherheitsrisiken, Endlagerkonflikte und verzögerte Strompreisentlastung können Menschen belasten. Energieinvestitionen müssen nach Zeit, Kosten, Versorgung, Gesundheit, sozialer Fairness und Sicherheit bewertet werden.",
      planet: "Kernkraft ist CO₂-arm im Betrieb, aber langsame Umsetzung kann fossile Emissionen länger im System halten; Atommüll bleibt Langzeitrisiko.",
      demokratie: "Großtechnologische Lagerkämpfe können Vertrauen und Akzeptanz für pragmatische Systemlösungen schwächen. Transparente Wirkungsgates, Kostenoffenheit und Risikolegitimation stärken demokratische Kontrolle.",
    },
    sources: [
      "BASE - Ausstieg aus der Atomkraft",
      "BMUV - Atomkraftwerke in Deutschland",
      "Fraunhofer ISE - Stromgestehungskosten 2024",
      "BGE - Endlagersuche für hochradioaktive Abfälle",
      "BASE - Transmutation hochradioaktiver Abfälle",
      "OECD NEA - Financing nuclear new build",
      "IAEA - SMR Platform Annual Report",
    ],
  },
  {
    title: "„Kernenergie wäre die einfache Lösung“",
    slug: "kernenergie-einfache-loesung",
    shortJudgement: "Strategiebehauptung mit hohen Zeit-, Kosten- und Risikooffenheiten.",
    narrativeFamilies: ["Technikwunder", "Opportunitätskosten"],
    riskLevel: "hoch",
    themes: ["Kernenergie", "Stromsystem"],
    sdgs: ["SDG 7", "SDG 9", "SDG 13"],
    sdgPlus: ["Generationenverantwortung", "Transparenz"],
    subtitle: "Strategiebehauptung statt reiner Faktenfrage",
    abstract:
      "Die Aussage ist kein einfacher Mythos, sondern eine politische Strategiebehauptung. Der wahre Kern ist: Kernenergie ist im Betrieb CO₂-arm und kann grundlastfähigen Strom liefern. Irreführend wird sie, wenn Zeitbedarf, Kosten, Endlagerung, Sicherheitsfragen, Fachkräfte, Lieferketten, politische Akzeptanz und Opportunitätskosten gegenüber Netzen, Speichern, Erneuerbaren, Effizienz und Lastmanagement ausgeblendet werden.",
    summary: {
      judgement: "Strategiebehauptung mit offenen Zeit-, Kosten- und Risikofragen.",
      true_core: "Kernenergie ist im Betrieb CO₂-arm.",
      problem: "Zeitbedarf, Endlagerung, Kosten und Opportunitätskosten werden oft ausgeblendet.",
      narrative: "Technikwunder / Scheiternsframe gegen Erneuerbare.",
      risk: "Investitionen in schnellere Lösungen können verzögert werden.",
      host_answer: "Die Frage ist nicht abstrakt Kernenergie ja/nein, sondern: Was wirkt rechtzeitig, bezahlbar und mit geringster Netto-Negativwirkung?",
    },
    answers: {
      ten_seconds: "Die Frage ist nicht abstrakt Kernenergie ja oder nein. Die Frage ist: Was wirkt rechtzeitig, bezahlbar und mit geringster Netto-Negativwirkung?",
      thirty_seconds:
        "Der wahre Kern ist: Kernenergie hat niedrige Betriebsemissionen. Aber als Lösung für Deutschland zählen Zeit, Kosten, Endlagerung, Sicherheit, Fachkräfte und Alternativen. Wirkungsökonomisch prüfen wir nicht Technologie-Image, sondern Wirkung im konkreten Zeitfenster.",
      two_minutes:
        "Ich ordne das ein. Kernenergie ist nicht einfach nur ein Mythos oder eine Lösung. Sie ist eine Strategieoption mit bestimmten Stärken und erheblichen offenen Fragen. Wenn wir sie ernsthaft prüfen, dann mit Zeithorizont, Kosten, Endlager, Sicherheitsarchitektur, gesellschaftlicher Akzeptanz und Opportunitätskosten. Jeder Euro und jedes Jahr, das in eine Option fließt, fehlt an anderer Stelle. Die WÖk-Frage lautet: Welche Investition senkt im relevanten Zeitraum die meisten Risiken für Mensch, Planet und Demokratie?",
    },
    effectPath: [
      ["Aussage", "Kernenergie wäre die einfache Lösung."],
      ["Wirkstoff", "Komplexe Strategie wird als einfache Techniklösung gerahmt."],
      ["Resonanz", "Wunsch nach Stabilität, Grundlast und Eindeutigkeit."],
      ["Wirkungspotenzial", "Zeit-, Kosten- und Endlagerfragen werden zweitrangig."],
      ["Wirkungsrisiko", "Schnellere oder günstigere Alternativen werden verzögert."],
      ["Folge falschen Handelns", "Opportunitätskosten steigen, Systemumbau verlangsamt sich."],
    ],
    frameKey: "technikwunder",
    redirectQuestion: "Welche Option senkt im relevanten Zeitraum die meisten Risiken pro Euro und Jahr?",
    dontDo: ["Nicht Kernenergie als reine Glaubensfrage behandeln.", "Nicht Betriebsemissionen isoliert bewerten."],
    facts: ["Kernenergie ist im Betrieb CO₂-arm.", "Strategisch zählen Zeit, Kosten, Endlagerung, Sicherheit, Fachkräfte und Alternativen."],
    consequences: ["Investitionen können in langsamere Pfade fließen.", "Endlager- und Generationenfragen bleiben offen.", "Lagerkampf verdrängt Systemvergleich."],
    woekSolution: ["Technologien nach Zeithorizont, Kosten, Risiko und Alternativen vergleichen.", "Endlager- und Sicherheitswirkung als nicht kompensierbare Felder prüfen.", "Kapital nach positiver Netto-Wirkung statt Technologie-Image lenken."],
    mpd: {
      mensch: "Sicherheit, Kosten und Generationenverantwortung müssen sichtbar sein.",
      planet: "CO₂-armer Betrieb reicht nicht als Gesamtbewertung.",
      demokratie: "Transparenz über Risiken, Kosten und Zeithorizonte schützt Vertrauen.",
    },
    sources: ["BASE - Endlagersuche", "Fraunhofer ISE / Energy-Charts"],
  },
  {
    title: "Fusion löst das Energieproblem?",
    slug: "fusion-loest-das-energieproblem",
    claimPhrase: "„Warum jetzt teure Energiewende, wenn bald Fusion kommt?“",
    shortJudgement: "Wahrer Forschungsoptimismus, falscher Verzögerungsframe.",
    narrativeFamilies: ["Technikwunder-Aufschub", "Fusion als Rettung", "Zeitfensterblindheit", "Hype als Sedativ"],
    riskLevel: "hoch",
    themes: ["Fusion", "Energiezukunft", "Innovation", "Zeitfenster"],
    sdgs: ["SDG 7", "SDG 9", "SDG 12", "SDG 13", "SDG 16", "SDG 17"],
    sdgPlus: ["Quellenklarheit", "Wissenschaftsvertrauen", "Diskursfähigkeit", "Schutz vor Hype und Verzögerung", "institutionelles Vertrauen", "intergenerationelle Verantwortung"],
    subtitle: "Warum Zukunftstechnologie kein Aufschubargument sein darf.",
    abstract:
      "Die Aussage „Fusion löst bald unser Energieproblem“ enthält einen wahren Kern: Fusionsforschung macht Fortschritte, große Programme wie ITER, STEP, DEMO und private Start-ups treiben Plasma- und Kraftwerkstechnologien voran, und langfristig könnte Fusion eine wichtige saubere Energiequelle werden. Irreführend wird die Aussage, wenn daraus folgt, heutige Energiewende, Erneuerbare, Netze, Speicher, Effizienz, Wärmewende, Elektromobilität oder Industrieumbau könnten warten. Wirkungsökonomisch ist das ein Zeitfensterfehler: Eine mögliche spätere Technologie wird gegen heute verfügbare Maßnahmen gestellt. Für Klimaschutz, Versorgungssicherheit und industrielle Transformation zählen aber die Jahre bis 2030, 2035 und 2045. Die bessere Frage lautet nicht: Fusion oder Erneuerbare? Sondern: Welche Energieinvestition erzeugt wann welche positive Netto-Wirkung - und welche Investition darf nicht als Vorwand für Verzögerung dienen?",
    summary: {
      judgement: "Wahrer Forschungsoptimismus, falscher Verzögerungsframe.",
      true_core: "Fusion ist eine wichtige Zukunftstechnologie und sollte erforscht werden.",
      problem: "Aus Zukunftspotenzial wird ein Aufschubargument gegen heute verfügbare Klimaschutz-, Energie- und Effizienzmaßnahmen.",
      narrative: "Technikwunder-Aufschub / Fusion als Rettung / Zeitfensterblindheit / Hype als Sedativ.",
      risk: "Heute verfügbare Systemhebel werden verzögert, obwohl Emissionen, Kosten, Abhängigkeiten und Risiken bis 2030 und 2035 sinken müssen.",
      host_answer: "Fusion erforschen. Aber nicht auf Fusion warten.",
    },
    answers: {
      ten_seconds: "Fusion ist wichtig und soll erforscht werden. Aber sie löst nicht unsere 2030er-Klimaprobleme. Forschung ja - Aufschub nein.",
      thirty_seconds:
        "Der wahre Kern ist: Fusion macht Fortschritte und kann langfristig wertvoll werden. Der Denkfehler ist: daraus abzuleiten, dass wir Erneuerbare, Netze, Speicher, Effizienz und Wärmewende verschieben können. Klimaschutz braucht Wirkung in diesem Jahrzehnt, nicht nur Hoffnung für die 2040er.",
      two_minutes:
        "Ich ordne das sauber ein. Fusion ist faszinierend und wichtig. Die Forschung macht Fortschritte, und es wäre falsch, sie kleinzureden. Aber ein Laborerfolg, ein Target Gain oder ein geplanter Prototyp ist noch kein kommerzielles Kraftwerk, das zuverlässig, bezahlbar und massenhaft Strom liefert. Dafür braucht es kontinuierlichen Betrieb, Tritium-Selbstversorgung, Materialien, Wartung, Netzintegration, Sicherheitskonzepte, Finanzierung und industrielle Skalierung. ITER plant Deuterium-Tritium-Betrieb erst für die späten 2030er, STEP zielt auf einen Prototyp um 2040, und DEMO soll danach Kraftwerkstechnologien demonstrieren. Wirkungsökonomisch ist deshalb entscheidend: Was senkt Emissionen bis 2030 und 2035? Wenn Fusion später kommt, wunderbar. Aber heute verfügbare Lösungen zu verzögern, wäre ein Wirkungsfehler.",
    },
    effectPath: [
      ["Aussage", "„Fusion löst bald das Energieproblem.“"],
      ["Wirkstoff", "Zukunftstechnologie als Aufschubsedativ."],
      ["Verkürzung", "Forschungspotenzial wird mit aktueller Systemverfügbarkeit verwechselt."],
      ["Ausblendung", "Zeitfenster, Kraftwerksbetrieb, Tritium, Materialien, Wartung, Kosten, Netzintegration und Opportunitätskosten verschwinden."],
      ["Resonanz", "Hoffnung, Technikstolz, Beruhigung, Transformationsmüdigkeit."],
      ["Narrativ", "„Wir müssen jetzt nicht so stark umbauen, weil bald der Durchbruch kommt.“"],
      ["Wirkung erster Ordnung", "Dringlichkeit für Erneuerbare, Netze, Effizienz und Elektrifizierung sinkt."],
      ["Wirkung zweiter Ordnung", "Investitionen und politische Entscheidungen werden verzögert."],
      ["Wirkung dritter Ordnung", "Gesellschaftliche Handlungsfähigkeit wird an Zukunftshoffnung delegiert, statt in reale Rückkopplung übersetzt."],
    ],
    frameKey: "technikwunder",
    redirectQuestion: "Redest du über Fusionsforschung - oder benutzt du Fusion als Grund, heute verfügbare Maßnahmen zu verschieben?",
    dontDo: [
      "Nicht sagen: Fusion ist Unsinn.",
      "Nicht Wissenschaftler:innen abwerten.",
      "Nicht so tun, als wären Laborerfolge irrelevant.",
      "Nicht behaupten, Fusion werde nie funktionieren.",
      "Nicht Target Gain mit Kraftwerks-Nettoleistung verwechseln.",
      "Nicht ITER, STEP, DEMO und private Start-ups vermischen.",
      "Nicht Forschung gegen Erneuerbare ausspielen.",
      "Nicht Erneuerbare als perfekt darstellen.",
      "Nicht Zeitfenster 2030/2035 ausblenden.",
    ],
    facts: [
      "Fusion hat langfristig enormes Potenzial und verdient Forschung.",
      "Bisher gibt es keine breit verfügbare, netzrelevante, wirtschaftliche Fusionsstromerzeugung.",
      "Target Gain ist nicht Kraftwerks-Nettoleistung.",
      "ITER, STEP und DEMO zeigen eher Forschungs-, Prototyp- und Demonstrationszeitachsen als sofortige Massenstromversorgung.",
      "Tritium-Selbstversorgung, Brutblankets, Materialien, Wartung und Kraftwerksintegration bleiben zentrale Hürden.",
      "Erneuerbare, Netze, Speicher, Effizienz, Elektrifizierung und Flexibilität wirken bereits im aktuellen Klimazeitfenster.",
    ],
    consequences: [
      "Emissionen sinken zu spät, wenn heutige Maßnahmen auf spätere Fusion verschoben werden.",
      "Netze, Speicher, Effizienz, Lastmanagement und Erneuerbare werden langsamer ausgebaut.",
      "Industrie wartet auf Zukunftsstrom, statt Standortvorteile durch erneuerbare Systemarchitektur aufzubauen.",
      "Fusion wird politisch überfrachtet und verliert Glaubwürdigkeit, wenn sie als Sofortlösung verkauft wird.",
      "Kapital kann in Optionen mit spätem Wirkungseintritt fließen, während schnelle Maßnahmen unterfinanziert bleiben.",
      "Wenn Versprechen nicht schnell eintreten, wächst Misstrauen gegen Wissenschaft und Politik.",
      "Klimaschäden und Biodiversitätsverluste steigen durch Verzögerung.",
    ],
    woekSolution: [
      { title: "Fusion als Forschungsportfolio führen", text: "Fusion erhält langfristige Förderung, aber mit ehrlicher Stufenlogik: Experiment, Demonstrator, Kraftwerk, Skalierung." },
      { title: "Zeitfenster-Gate einführen", text: "Jede Technologie wird nach Wirkung bis 2030, 2035 und 2045 bewertet." },
      { title: "Soforthebel priorisieren", text: "Wind, Solar, Netze, Speicher, Effizienz, Wärmepumpen, Elektromobilität, E-Lkw, Lastmanagement und Flexibilität senken heute Risiken." },
      { title: "Tritium- und Materialrisiken sichtbar machen", text: "Fusionsforschung muss Brennstoffkreislauf, Brutblankets, Neutronenschäden, Wartung und Entsorgung transparent berichten." },
      { title: "Hype-Schutz in Wissenschaftskommunikation", text: "Kommunikation unterscheidet klar zwischen Laborerfolg, Anlagen-Nettoenergie, Demonstrator und kommerziellem Betrieb." },
      { title: "Opportunitätskosten prüfen", text: "Große Forschungsausgaben werden im Vergleich zu anderen Emissions-, Resilienz- und Innovationshebeln bewertet." },
      { title: "Forschung nicht gegen Erneuerbare ausspielen", text: "Fusion kann langfristig ergänzen, aber die erneuerbare Systemarchitektur muss jetzt entstehen." },
      { title: "Lernendes Innovationssystem bauen", text: "Fortschritte, Rückschläge, Kosten, Zeitpläne und technische Engpässe werden regelmäßig öffentlich aktualisiert." },
    ],
    mpd: {
      mensch: "Aufschub erhöht künftige Kosten, Energiepreisrisiken, Klimaschäden und soziale Belastungen.",
      planet: "Verzögerung hält fossile Emissionen länger im System.",
      demokratie: "Technikhype kann Handlungsfähigkeit ersetzen; enttäuschte Erwartungen können Wissenschaftsvertrauen beschädigen.",
    },
    sources: [
      "ITER - Updated baseline and timeline",
      "Max-Planck-Institut für Plasmaphysik - Neuer ITER-Zeitplan",
      "LLNL / National Ignition Facility - Achieving Fusion Ignition",
      "STEP Fusion - UK prototype fusion powerplant",
      "EUROfusion - DEMO",
      "IAEA - Tritium Breeding",
      "ITER - Tritium breeding",
      "UKAEA - Materials challenges for commercial fusion",
    ],
  },
  {
    title: "„Klimaschutz deindustrialisiert Deutschland“",
    slug: "klimaschutz-deindustrialisiert-deutschland",
    shortJudgement: "Wahrer Transformationsstress, falsches Niedergangsnarrativ.",
    narrativeFamilies: ["Deindustrialisierungsnarrativ", "Niedergangsframe", "falsche Standortrechnung"],
    riskLevel: "hoch",
    themes: ["Industrie", "Wettbewerbsfähigkeit", "Transformation"],
    sdgs: ["SDG 8", "SDG 9", "SDG 13"],
    sdgPlus: ["soziale Stabilität", "Standortwirkung", "Wirkungsinfrastruktur"],
    subtitle: "Warum Transformation kein Niedergang ist, sondern Standortpolitik.",
    abstract:
      "Die Aussage „Klimaschutz deindustrialisiert Deutschland“ enthält einen wahren Kern: Energieintensive Industrien stehen unter Druck durch hohe Strom- und Gaspreise, globale Konkurrenz, Investitionsrisiken, Genehmigungsstau, Netzausbau, Fachkräftemangel und Transformationskosten. Irreführend wird die Aussage, wenn daraus folgt, Klimaschutz sei der eigentliche Grund für industriellen Niedergang. Wirkungsökonomisch ist das eine falsche Systemgrenze: Sie betrachtet sichtbare Umbaukosten, blendet aber fossile Importabhängigkeit, Preisschocks, CO₂-Kosten, Klimaschäden, technologische Pfadabhängigkeit und neue Wertschöpfung aus.",
    summary: {
      judgement: "Wahrer Transformationsstress, falsches Niedergangsnarrativ.",
      true_core: "Industrie steht unter realem Druck: Energiepreise, Netze, Genehmigungen, Fachkräfte, Kapital und internationale Konkurrenz.",
      problem: "Sichtbare Umbaukosten werden als Beweis genutzt, dass Klimaschutz Industrie zerstöre.",
      narrative: "Deindustrialisierung / Klimaschutz gegen Wirtschaft / fossile Nostalgie.",
      risk: "Deutschland schützt alte Pfade und verpasst neue Wertschöpfung in Batterien, Halbleitern, Netzen, Speichern, E-Lkw, Elektrolyse und digitalen Infrastrukturen.",
      host_answer: "Nicht Klimaschutz zerstört Industrie. Fossile Abhängigkeit, teure Brennstoffe und verschleppte Infrastruktur gefährden sie. Transformation ist Standortpolitik.",
    },
    answers: {
      ten_seconds: "Nicht Klimaschutz zerstört Industrie. Fossile Abhängigkeit, teure Brennstoffe und verschleppte Infrastruktur gefährden sie. Transformation ist Standortpolitik.",
      thirty_seconds:
        "Der wahre Kern ist: Industrie steht unter Druck. Der Denkfehler ist: diesen Druck allein Klimaschutz zuzuschreiben. Erneuerbare Energien, Batterien, Halbleiter, E-Lkw, Ladeinfrastruktur, Rechenzentren, Speicher und Elektrolyse sind neue industrielle Wertschöpfung. Die Frage ist nicht Klimaschutz oder Industrie, sondern: Wie bekommt Deutschland günstigen sauberen Strom, Netze, Flächen, Fachkräfte und Investitionssicherheit?",
      two_minutes:
        "Ich ordne das sauber ein. Ja, viele Industrien stehen unter Druck: Energiepreise, internationale Konkurrenz, Bürokratie, Fachkräfte, Netze, Kapital und unsichere Nachfrage sind reale Probleme. Aber daraus zu machen, Klimaschutz sei Deindustrialisierung, ist eine falsche Schlussfolgerung. Industrie hat sich immer transformiert. Heute geht es um die nächste industrielle Basis: erneuerbarer Strom, Elektrifizierung, Batteriezellen, Halbleiter, Leistungselektronik, Ladeinfrastruktur, E-Lkw, Wärmepumpen, Elektrolyse, Speicher und Rechenzentren. Fossile Energie ist nicht billig, wenn man Brennstoffimporte, CO₂-Kosten, Preisschocks, geopolitische Risiken und Klimaschäden mitrechnet. Erneuerbare haben eine andere Kostenstruktur: viel Anfangsinvestition, wenig variable Kosten, kein Brennstoff. Wirkungsökonomisch ist die richtige Frage deshalb: Wie bauen wir ein Energiesystem, das Industrie mit sauberem, verlässlichem und günstigem Strom versorgt - und wie lenken wir Kapital in die Wertschöpfung der nächsten Industriephase?",
    },
    answersFinal: true,
    effectPath: [
      ["Aussage", "Klimaschutz deindustrialisiert Deutschland."],
      ["Wirkstoff", "Transformationskosten als Niedergangsbeweis."],
      ["Verkürzung", "Kurzfristige Belastungen werden mit langfristigem Standortverlust gleichgesetzt."],
      ["Ausblendung", "Fossile Importkosten, CO₂-Kosten, Klimaschäden, neue Industriecluster, Erneuerbaren-LCOE, Speicher, Netze und Transformationsinvestitionen verschwinden."],
      ["Resonanz", "Arbeitsplatzangst, Wohlstandsverlust, Statusbedrohung und Nostalgie."],
      ["Wirkungspotenzial", "Akzeptanz für Erneuerbare, Netze, Speicher, E-Mobilität, Industrieumbau und Klimapolitik sinkt."],
      ["Wirkungsrisiko", "Deutschland verpasst die nächste industrielle Wertschöpfungswelle."],
      ["Wirkung dritter Ordnung", "Kapital, Politik und Öffentlichkeit verharren im Schutz alter Pfade, statt neue Standortarchitektur aufzubauen."],
    ],
    frameKey: "scheitern",
    redirectQuestion: "Reden wir über echten Transformationsdruck - oder über das Narrativ, dass Klimaschutz grundsätzlich Industrie zerstört?",
    dontDo: ["Nicht behaupten, Transformation sei schmerzfrei.", "Nicht Strompreisprobleme kleinreden.", "Nicht jedes Industrieproblem auf Klimaschutz zurückführen.", "Nicht so tun, als kämen alle neuen Industrien automatisch nach Deutschland.", "Nicht Kernkraft, Fossile oder Erneuerbare isoliert betrachten.", "Nicht Erzeugungskosten mit Endkundenpreisen verwechseln.", "Nicht CAPEX, OPEX, Netze, Speicher und Systemkosten vermischen."],
    facts: ["Energieintensive Branchen stehen unter realem Kostendruck.", "Gaspreisschocks haben gezeigt, wie verletzlich fossile Abhängigkeit ist.", "Industriestrompreise hängen nicht nur von Erzeugungskosten ab, sondern auch von Netzentgelten, Steuern, Abgaben, Absicherung, Netzanschlüssen und Versorgungssicherheit.", "Netzausbau, Genehmigungen, Flächen, Fachkräfte und Kapital sind echte Engpässe.", "Nicht jedes Transformationsprojekt gelingt; einige Batterieprojekte wurden verschoben, verkleinert oder gestrichen.", "Viele Zukunftsindustrien brauchen sauberen Strom: Batterien, Halbleiter, Rechenzentren, Elektrolyse, E-Lkw, Ladeparks, Wärmepumpen, Speicher und Leistungselektronik.", "Erzeugungskosten sind nicht Industriestrompreise; Infrastruktur, Finanzierung, Flexibilität und Systemdesign entscheiden mit."],
    consequences: ["Investitionen in Batterien, Halbleiter, Leistungselektronik, Speicher, Elektrolyse, E-Lkw und Rechenzentren werden verzögert.", "Fossile Importabhängigkeit bleibt bestehen und Preisschocks bleiben ein Standortproblem.", "Kapital fließt in alte Pfade statt in Transformationsinfrastruktur.", "Neue Qualifikationen, Fachkräfteprogramme und regionale Transformationscluster entstehen zu spät.", "Wohlstandsangst wird gegen Klimapolitik mobilisiert.", "Emissionen sinken langsamer und Klimaschäden erhöhen künftige Kosten."],
    woekSolution: [
      { title: "Erneuerbaren Industriestrom systemisch denken", text: "Günstiger sauberer Strom entsteht durch Erzeugung, Netze, Speicher, PPAs, Lastmanagement, Standortnähe und Planungssicherheit." },
      { title: "Transformationscluster aufbauen", text: "Batterien, Halbleiter, Rechenzentren, E-Lkw, Ladeparks, Elektrolyse, Speicher und Wärmetechnik werden regional mit Strom, Wärme, Wasser, Daten und Fachkräften gekoppelt." },
      { title: "T-SROI für Industriepolitik nutzen", text: "Investitionen werden nicht nur nach Rendite, sondern nach finanzieller, sozialer, ökologischer und systemischer Transformationswirkung bewertet." },
      { title: "Fossile Systemkosten sichtbar machen", text: "Brennstoffimporte, CO₂-Kosten, Preisschocks, Gesundheitskosten und Klimaschäden gehören in die Standortrechnung." },
      { title: "Öffentliche Beschaffung als Nachfrageanker", text: "Staat, Kommunen und öffentliche Unternehmen schaffen Nachfrage für emissionsarme Industrieprodukte, Ladeinfrastruktur, Speicher, E-Busse, E-Lkw und Gebäudetechnik." },
      { title: "Fachkräfte und Bildung als Industriepolitik", text: "Transformation braucht Qualifizierung in Elektrohandwerk, Netztechnik, Halbleitern, Software, KI, Batterien, Recycling, Maschinenbau und Dateninfrastruktur." },
      { title: "Regionale Wertschöpfung und Beteiligung", text: "Kommunen und Regionen profitieren stärker, wenn Erzeugung, Verbrauch, Speicher und Industrie vor Ort gekoppelt und Bürger:innen beteiligt werden." },
      { title: "Reverse Merit Order anwenden", text: "Niedrige CO₂-Werte dürfen schlechte Arbeitsbedingungen, Wasserstress, Biodiversitätsrisiken oder demokratische Schäden nicht verdecken." },
    ],
    mpd: {
      mensch: "Wenn Transformation schlecht gestaltet wird, entstehen Arbeitsplatzverluste, regionale Brüche und soziale Unsicherheit. Lösung: Qualifizierung, regionale Industriecluster, Beteiligung, bezahlbarer Strom, gute Arbeit und soziale Abfederung.",
      planet: "Fossile Industriepfade verlängern Emissionen, Importabhängigkeit und Ressourcenverbrauch. Lösung: Erneuerbare, Effizienz, Elektrifizierung, Kreislaufwirtschaft, Speicher und gezielter grüner Wasserstoff.",
      demokratie: "Das Niedergangsframe kann Vertrauen zerstören und Transformationspolitik als Angriff auf Wohlstand rahmen. Lösung: transparente Standortstrategie, Quellenklarheit, Wirkungshaushalt, regionale Beteiligung und sichtbare Verbesserungen.",
    },
    sources: ["Fraunhofer ISE - Stromgestehungskosten 2024", "Volkswagen/PowerCo - Salzgitter Gigafactory", "TSMC - ESMC Dresden", "Infineon - Smart Power Fab Dresden", "GTAI - Data Center Germany"],
  },
];

const answerExpansions = {
  "klima-hat-sich-schon-immer-veraendert": {
    thirty_seconds:
      "Dazu kommt: Natürliche Veränderung erklärt noch nicht den heutigen Zeitraum. Für eine gute Einordnung brauchen wir Ursache, Tempo, Messdaten und Folgen. Erst dann wird aus einem richtigen Allgemeinsatz eine brauchbare politische Schlussfolgerung.",
    two_minutes:
      "Der entscheidende Unterschied ist der Nachweis des Treibers. In der Erdgeschichte gab es Vulkane, Sonnenzyklen, Umlaufbahnen und andere Faktoren. Heute sehen wir aber ein Muster, das sehr gut zu zusätzlichen Treibhausgasen passt: steigende Konzentrationen, veränderter Strahlungshaushalt, Erwärmung von Ozeanen und Atmosphäre, schmelzendes Eis und zunehmende Extremrisiken. Wer nur sagt, Klima habe sich immer verändert, springt an der entscheidenden Stelle aus der Analyse heraus. Wirkungsökonomisch zählt nicht die Beruhigung durch einen historischen Allgemeinsatz, sondern die Zustandsveränderung, die heute entsteht: Gesundheit, Infrastruktur, Landwirtschaft, Wasser, Versicherbarkeit, öffentliche Haushalte und demokratische Stabilität. Die bessere Debatte fragt deshalb: Was ist die Ursache im aktuellen System, welche Schäden entstehen bei weiterer Verzögerung, und welche Maßnahmen senken die Risiken mit der besten Netto-Wirkung?",
  },
  "co2-ist-nur-ein-spurengas": {
    thirty_seconds:
      "Wenn jemand einen Prozentanteil nennt, ist das noch keine Wirkungsanalyse. Wir müssten fragen: Wo greift der Stoff im System an, wie verändert er Energieflüsse, und welche Rückkopplungen werden ausgelöst?",
    two_minutes:
      "Das Wort Spurengas klingt, als könne etwas Kleines nur eine kleine Rolle spielen. Genau da sitzt der Denkfehler. Wirkung hängt nicht nur von Menge ab, sondern von Ort, Mechanismus und Systemempfindlichkeit. Ein winziger Anteil eines Medikaments kann den Körper verändern, ein kleiner Zinssatz kann über Jahrzehnte große Vermögen verschieben, und ein Stoff in der Atmosphäre kann den Energiehaushalt beeinflussen, wenn er an der richtigen physikalischen Stelle wirkt. Bei CO₂ geht es um Wärmestrahlung, Konzentrationsanstieg und Rückkopplungen im Klimasystem. Wirkungsökonomisch übersetzen wir das in die Frage: Welche reale Zustandsveränderung entsteht für Mensch, Planet und Demokratie? Wenn wir den Mechanismus kleinreden, unterschätzen wir Hitze, Extremwetter, Gesundheitskosten, Anpassungsdruck und Infrastrukturfolgen. Die gute Antwort nimmt den Zahlenkern ernst, aber lässt aus klein nicht automatisch unwichtig werden.",
  },
  "deutschland-nur-zwei-prozent": {
    thirty_seconds:
      "Zusätzlich zählt die Vorbild- und Standardwirkung: Maschinenbau, Chemie, Automobilindustrie, EU-Regeln, Beschaffung und Kapitalmärkte können Wirkung weit über die nationale Emissionsmenge hinaus auslösen.",
    two_minutes:
      "Außerdem steckt in dem Satz eine gefährliche Kopierlogik. Sehr viele Länder können einzeln sagen: Unser Anteil ist nicht groß genug, um allein das Klima zu retten. Wenn alle diese Schlussfolgerung ziehen, entsteht kollektive Untätigkeit. Genau deshalb unterscheidet die WÖk zwischen Anteil und Wirkungspfad. Deutschland hat direkte Emissionen, aber auch indirekte Hebel: Technologieentwicklung, Netze, Industrieprozesse, Normen, Finanzierungsbedingungen, EU-Gesetzgebung, Lieferketten und internationale Glaubwürdigkeit. Wenn ein Industrieland zeigt, dass klimaneutrale Produktion, sichere Energieversorgung und soziale Abfederung zusammen funktionieren, senkt das Risiko und Kosten für andere. Wenn es scheitert oder abwartet, stärkt es Verzögerungsargumente. Die bessere Frage lautet also nicht, ob Deutschland allein die Welt rettet. Die Frage lautet: Welche Hebel sind real, wie stark wirken sie, und welche Folgeschäden entstehen, wenn wir sie nicht nutzen?",
  },
  "klimaschutz-ist-oekodiktatur": {
    thirty_seconds:
      "Eine seriöse Kritik benennt deshalb die konkrete Maßnahme: Gesetz, Preis, Standard, Förderung oder Verbot. Erst dann kann man demokratische Legitimation, soziale Fairness, Alternativen und Wirkung prüfen.",
    two_minutes:
      "Der Begriff Ökodiktatur ist stark, weil er Freiheitsschutz aktiviert. Freiheit ist ein echter demokratischer Wert, und Klimapolitik muss sich daran messen lassen. Aber der Begriff verschiebt die Debatte oft von überprüfbaren Fragen zu einem Feindbild. Dann reden wir nicht mehr darüber, ob ein CO₂-Preis sozial zurückverteilt wird, ob ein Standard verhältnismäßig ist, ob eine Förderung besser wäre oder welche Alternativen es gibt. Wir reden nur noch über Angst vor Kontrolle. Wirkungsökonomisch ist das zu grob. Gute Klimapolitik muss Schäden vermeiden, Gesundheit schützen, soziale Härten abfedern, Beteiligung ermöglichen und demokratisch kontrollierbar bleiben. Schlechte Klimapolitik darf man kritisieren. Aber pauschal jede Steuerung als Diktatur zu rahmen, blockiert genau die Abwägung, die Demokratie leisten soll. Die bessere Frage ist: Welche konkrete Maßnahme schützt Freiheit, Klima, Gesundheit und soziale Stabilität am besten?",
  },
  "energiewende-gescheitert": {
    thirty_seconds:
      "Man muss also unterscheiden zwischen Befund und Schlussfolgerung. Ein Engpass ist ein Steuerungssignal: Wo fehlen Netze, wo Flexibilität, wo Speicher, wo Planungssicherheit, wo soziale Abfederung?",
    two_minutes:
      "Das Wort gescheitert ist politisch bequem, aber analytisch zu grob. Ein Energiesystem besteht aus Erzeugung, Netzen, Speichern, Lastmanagement, Preisen, Genehmigungen, Industrieprozessen, Gebäuden und Verbrauchsverhalten. In so einem System kann ein Teil gut laufen, während andere Teile bremsen. Genau deshalb hilft der Pauschalframe nicht weiter. Wenn der Ausbau erneuerbarer Erzeugung Fortschritte macht, aber Netze oder Flexibilität hinterherlaufen, heißt die Lösung nicht Abbruch, sondern Engpassbeseitigung. Wenn Strompreise Haushalte belasten, braucht es soziale Rückverteilung, Effizienz und bessere Marktdesigns. Wenn Industrie Planungssicherheit braucht, müssen Infrastruktur und Verträge verlässlicher werden. Die WÖk fragt: Wo entsteht positive Netto-Wirkung pro eingesetztem Euro und Jahr? Welche Engpässe verhindern diese Wirkung? Und welche politischen Instrumente koppeln Klima-, Kosten-, Versorgungs- und Demokratieeffekte besser zurück?",
  },
  "windraeder-zerstoeren-natur": {
    thirty_seconds:
      "Die Antwort darf deshalb weder beschwichtigen noch pauschal blockieren. Entscheidend sind Standort, Artenschutzprüfung, Abschaltzeiten, Repowering, Beteiligung und der Vergleich mit fossilen Alternativen.",
    two_minutes:
      "Eine gute Antwort beginnt mit Anerkennung: Ja, Windenergie kann lokal belasten. Es gibt Konflikte mit Landschaft, bestimmten Vogel- und Fledermausarten, Waldstandorten, Schall, Schatten und Beteiligungsfragen. Wer das wegwischt, verliert Vertrauen. Aber der nächste Schritt ist genauso wichtig: Lokaler Zielkonflikt ist nicht dasselbe wie generelle Naturzerstörung. Auch fossile Energien haben Naturwirkungen - über Flächen, Abbau, Luftschadstoffe, Wasser, Klimaerwärmung und Extremereignisse. Wirkungsökonomisch bewerten wir deshalb nicht eine Technologie im Symbolkampf, sondern konkrete Netto-Wirkung. Welche Fläche, welcher Standort, welche Arten, welche Minderungsmaßnahmen, welche Alternativen, welche Beteiligung? Die Reverse Merit Order sagt: Biodiversitätsschäden dürfen nicht durch Klimanutzen verdeckt werden. Das heißt aber nicht Stillstand. Es heißt: planen, messen, verbessern, beteiligen und die schwächsten Wirkungsfelder gezielt stärken.",
  },
  "e-autos-schlimmer-als-verbrenner": {
    thirty_seconds:
      "Dazu kommt: Der Akku ist kein einmal verbrannter Energieträger. Er altert, kann oft lange genutzt, teilweise zweitgenutzt und anschließend recycelt werden. Benzin und Diesel dagegen werden verbrannt und sind weg. Wer nur den Akku-Rucksack zeigt, aber die fortlaufende fossile Verbrennung ausblendet, macht keinen fairen Vergleich.",
    two_minutes:
      "Der Satz funktioniert, weil er ein reales Problem anspricht: Batterien brauchen Rohstoffe, Energie und gute Lieferkettenkontrolle. Das muss in jede seriöse Bewertung hinein. Irreführend wird es, wenn nur dieser Teil gezeigt wird und der Verbrenner so behandelt wird, als sei nach der Herstellung kaum noch Wirkung vorhanden. Tatsächlich entstehen beim Verbrenner über die Nutzung fortlaufend fossile CO₂-Emissionen und Luftschadstoffe. Beim E-Auto verlagert sich ein größerer Teil der Wirkung in Herstellung, Batterie und Stromerzeugung - und genau deshalb verbessern erneuerbarer Strom, bessere Zellchemien, LFP ohne Kobalt und Nickel, Recycling, Fahrzeuggröße und Nutzungsdauer die Bilanz. Auch Brand- und Haltbarkeitsfragen gehören in die Prüfung, aber als Datenfrage, nicht als Angstbild. Wirkungsökonomisch ist die Lösung keine Werbung für jedes einzelne E-Auto. Ein schweres Fahrzeug mit schlechter Nutzung bleibt problematisch. Die Lösung ist eine Mobilitätsscorecard: CO₂, Ressourcen, Gesundheit, Arbeit, Lieferketten, Brandrisiko, Recycling und tatsächlicher Mobilitätsbedarf. Dann gewinnt nicht das Lager, sondern die bessere Netto-Wirkung.",
  },
  "batterien-sind-nicht-recyclebar": {
    thirty_seconds:
      "Die sinnvolle Frage lautet also nicht ja oder nein, sondern: Welche Batteriechemie, welches Sammelsystem, welches Verfahren, welche Rückgewinnungsquote, welcher Rezyklatanteil und welche Designstandards sind gemeint? Aus einer schwierigen Skalierung folgt keine grundsätzliche Unmöglichkeit.",
    two_minutes:
      "Der Satz klingt endgültig, aber Batterierecycling ist kein statischer Zustand. Es hängt von Chemie, Bauform, Rücknahme, Sortierung, Prozess, Energiequelle, Regulierung und Marktgröße ab. Es gibt Materialien, die technisch leichter zurückgewonnen werden, andere sind schwieriger oder wirtschaftlich weniger attraktiv. Daraus folgt aber nicht, dass Batterien grundsätzlich nicht recyclebar sind. Wirkungsökonomisch wäre die falsche Reaktion, Rohstoffprobleme als Totschlagargument gegen jede Elektrifizierung zu nutzen. Die richtige Reaktion ist eine Kreislaufstrategie: kleinere und langlebigere Batterien, besseres Design, Reparierbarkeit, Second-Life-Nutzung, verpflichtende Rücknahme, transparente Materialdaten, hohe Recyclingstandards, Lithiumrückgewinnung, LFP-spezifische Verfahren und saubere Energie im Prozess. Gleichzeitig bleiben soziale und ökologische Lieferkettenfragen relevant. Nichtkompensation heißt: Gute Klimawerte dürfen schlechte Arbeitsbedingungen oder Rohstoffschäden nicht verdecken. Genau darum braucht es Produktdaten statt Pauschalsätze.",
  },
  "kernenergie-einfache-loesung": {
    thirty_seconds:
      "Außerdem ist eine Energieoption nur im Vergleich bewertbar. Was kostet sie, wann wirkt sie, welche Risiken bleiben, und welche Alternativen könnten im selben Zeitraum mehr Wirkung erzeugen?",
    two_minutes:
      "Die faire Einordnung ist: Kernenergie hat Stärken, aber einfach ist sie als politische Lösung nicht. Niedrige Betriebsemissionen sind ein relevanter Punkt. Aber ein Energiesystem entscheidet sich nicht allein im Betrieb. Es geht um Neubauzeiten, Finanzierung, Bau- und Kostenrisiken, Endlagerung, Sicherheitsarchitektur, Fachkräfte, Lieferketten, gesellschaftliche Akzeptanz, Versicherung, Regulierung und die Frage, was im gleichen Zeitraum mit Netzen, Speichern, Erneuerbaren, Effizienz, Lastmanagement und Industrieumbau möglich wäre. Wirkungsökonomisch sind Opportunitätskosten zentral: Jeder Euro, jedes politische Mandat und jedes Jahr kann nur einmal eingesetzt werden. Eine Technologie kann also abstrakt funktionieren und trotzdem im konkreten Zeitfenster nicht die beste Netto-Wirkung haben. Die bessere Debatte lautet nicht Kernenergie als Identitätsfrage, sondern: Welche Investition senkt rechtzeitig die meisten Risiken für Mensch, Planet und Demokratie?",
  },
  "fusion-loest-das-energieproblem": {
    thirty_seconds:
      "Deshalb muss man Zeithorizonte trennen: Forschung kann langfristige Optionen schaffen. Klimaschutz braucht aber Wirkung in den nächsten Jahren, nicht erst nach möglicher Industrialisierung. Zukunftsforschung ist Ergänzung, keine Ausrede für heutigen Aufschub.",
    two_minutes:
      "Fusion ist ein gutes Beispiel dafür, wie Hoffnung und Aufschub ineinander rutschen können. Hoffnung ist berechtigt: Forschung an neuen Energiequellen kann langfristig sehr wertvoll sein. Aber daraus folgt nicht, dass heutige Emissionen warten können. Für Klimarisiken zählt der kumulierte Ausstoß. Jede Tonne, die heute zusätzlich in der Atmosphäre landet, erhöht den späteren Druck auf Anpassung, Infrastruktur und Ökosysteme. Wenn Fusion als Ergänzung zu Netzen, Speichern, Erneuerbaren, Effizienz und Industrieumbau diskutiert wird, ist sie Teil einer Zukunftsstrategie. Wenn sie als Ersatz für heutige Maßnahmen verwendet wird, wird sie zum Verzögerungsnarrativ. Die WÖk trennt deshalb Forschungspfad und Wirkungspfad: Was ist wissenschaftlich sinnvoll? Was ist netzrelevant, skalierbar und bezahlbar? Und was senkt in diesem Jahrzehnt real Schäden für Mensch, Planet und Demokratie?",
  },
  "klimaschutz-deindustrialisiert-deutschland": {
    thirty_seconds:
      "Dazu gehört auch: Nicht-Transformation ist keine kostenlose Stabilität. CO₂-Kosten, Importabhängigkeit, fossile Preisschocks und veraltete Anlagen können selbst Wettbewerbsfähigkeit zerstören. Die strategische Frage lautet: Welche Investitionen sichern Zukunftsmärkte?",
    two_minutes:
      "Der Satz trifft einen echten Nerv, weil Industriepolitik über Arbeitsplätze, Regionen, Einkommen und Sicherheit entscheidet. Schlechte Transformation kann Schaden anrichten: zu hohe Kosten, unklare Regeln, langsame Netze, fehlende Fachkräfte, unsichere Förderung oder soziale Härten. Aber daraus folgt nicht, dass Klimaschutz der Gegner von Industrie ist. Eine klimaneutrale Welt verändert Märkte. Wer zu spät investiert, kann ebenso Wertschöpfung verlieren: durch CO₂-Preise, fossile Importabhängigkeit, veraltete Anlagen, technologische Rückstände oder verlorene Exportchancen. Wirkungsökonomisch fragen wir deshalb nach Zukunftswirkung: Welche Industriepfade sichern gute Arbeit, regionale Stabilität, Versorgungssicherheit, Ressourcenproduktivität und Klimastabilität zugleich? Dafür braucht es günstigen sauberen Strom, Netze, Speicher, grüne Grundstoffe, Kreislaufwirtschaft, Qualifizierung und faire Übergänge. Die Alternative ist nicht alter Wohlstand ohne Risiko, sondern ein anderer Risikomix.",
  },
};

const deepDiveSlugs = [
  "deutschland-nur-zwei-prozent",
  "energiewende-gescheitert",
  "e-autos-schlimmer-als-verbrenner",
  "batterien-sind-nicht-recyclebar",
  "klimaschutz-deindustrialisiert-deutschland",
  "kernenergie-wieder-in-deutschland",
  "kernenergie-einfache-loesung",
  "fusion-loest-das-energieproblem",
];

const deepDiveDetails = {
  "kernenergie-wieder-in-deutschland": {
    title: "„Kernkraft zurück?“",
    subtitle: "CO₂-arm heißt nicht automatisch sinnvoll für Deutschland",
    confidence: "hoch",
    readingTime: "18 Minuten",
    leadQuestion: "Welche Energieoption senkt Emissionen am schnellsten, zuverlässigsten, sichersten und günstigsten - mit den geringsten Langzeitrisiken?",
    claimAnatomy: {
      original: "Kernkraft zurück?",
      extended: "Deutschland sollte zur Kernkraft zurück, weil Atomstrom CO₂-arm, rational und versorgungssicher sei.",
      trueCore: "Kernkraftwerke erzeugen im Betrieb sehr wenig CO₂, liefern wetterunabhängig Strom und haben eine hohe Energiedichte.",
      missingContext:
        "Für Deutschland zählen Bauzeit, Kosten, Finanzierung, Endlager, Rückbau, Sicherheit, Kühlwasser, Fachkräfte, Lieferketten, Systemflexibilität und Opportunitätskosten.",
      falseConclusion: "Aus CO₂-arm im Betrieb folgt nicht automatisch schnell, günstig, risikoarm oder systemisch optimal.",
    },
    trueText:
      "Kernenergie ist im Betrieb CO₂-arm und kann in Ländern mit bestehender Flotte anders bewertet werden als in Deutschland. Forschung zu SMR, Gen IV oder Transmutation ist legitim. Aber eine deutsche Rückkehr ist keine moralische Abkürzung, sondern eine hochkomplexe Infrastruktur-, Finanzierungs-, Sicherheits- und Entsorgungsentscheidung.",
    missingItems: [
      "Die letzten deutschen AKW sind seit dem 15. April 2023 abgeschaltet.",
      "Neustart wäre kein Umlegen eines Schalters, sondern eine Genehmigungs-, Sicherheits-, Brennstoff-, Personal- und Betreiberfrage.",
      "Neubau dauert lange und konkurriert mit Maßnahmen, die sofort oder deutlich früher wirken können.",
      "Stromgestehungskosten sind nicht Endkundenpreise; Finanzierung, Risikoübernahme, Rückbau, Endlager und Systemintegration müssen separat betrachtet werden.",
      "Endlagerung hochradioaktiver Abfälle ist in Deutschland noch nicht gelöst.",
      "Transmutation ersetzt nach heutigem Stand kein Endlager.",
      "Gesicherte Leistung ist nicht dasselbe wie starre Grundlast.",
      "Kühlwasser, Hitzeperioden, Sicherheitsarchitektur, Sabotageschutz und Uran-/Brennstoffketten gehören zur Bilanz.",
      "Jede Milliarde und jede Fachkraft kann nur einmal eingesetzt werden.",
    ],
    evidence: {
      status: "datenbasiert",
      level: "hoch",
      uncertainty: "Mittel bis hoch bei Neubaukosten, Genehmigungspfaden, Finanzierung, Betreiberbereitschaft, SMR-Reife und politischer Akzeptanz in Deutschland.",
      sourceKeys: [
        "base_atomausstieg",
        "bmuv_atomkraftwerke_deutschland",
        "fraunhofer_lcoe_2024",
        "bge_endlagersuche",
        "base_transmutation",
        "oecd_nea_financing_new_nuclear",
        "iaea_smr_platform",
      ],
    },
    wirkstoff: {
      label: "CO₂-arme Technik als Abkürzungsversprechen",
      description: "Ein realer Vorteil der Kernenergie wird zum Gesamtargument für eine Rückkehr zur Kernkraft erweitert.",
      mechanism: "Die Aussage verschiebt Aufmerksamkeit von Zeit, Kosten, Endlager, Rückbau, Sicherheit und Alternativen auf einen starken Klimaindikator.",
      resonance: ["Angst vor Stromausfall", "Dunkelflaute", "Industrieverlust", "Kontrollverlust", "Technikvertrauen", "Rationalität gegen Ideologie"],
    },
    narrative: {
      message: "Kernkraft ist die einzige rationale Lösung, alles andere ist Ideologie.",
      emotional: "Sicherheitsgefühl, Kontrollillusion, Technikvertrauen und Abwertung politischer Gegner.",
      political: "Investitionen in erneuerbare Systemarchitektur werden delegitimiert oder verzögert.",
    },
    orders: [
      ["Wirkung 1. Ordnung", "Menschen verwechseln CO₂-arm im Betrieb mit vollständiger Systembilanz."],
      ["Wirkung 2. Ordnung", "Netze, Speicher, Effizienz, Lastmanagement und flexible Kraftwerke wirken weniger dringlich."],
      ["Wirkung 3. Ordnung", "Kapital, Planungskapazität und Öffentlichkeit binden sich an eine späte Großprojektlogik."],
    ],
    falseActions: [
      ["Klima", "Zu späte Wirkung kann Emissionsminderungen im entscheidenden Jahrzehnt verfehlen."],
      ["Haushalt", "Hohe Kapitalbindung und staatliche Garantien verdrängen schnellere Maßnahmen."],
      ["Energie", "Systemflexibilität, Speicher, Netze und Lastmanagement werden unterschätzt."],
      ["Endlager", "Langzeitverantwortung wird politisch in die Zukunft verschoben."],
      ["Demokratie", "Energiepolitik wird Lagerkampf statt transparenter Wirkungsvergleich."],
      ["Sicherheit", "Sicherheits-, Sabotage-, Zwischenlager- und Entsorgungsrisiken müssen über Jahrzehnte getragen werden."],
    ],
    solutionLead: "Die WÖk macht aus der Lagerfrage ein Technologie-Wirkungsgate mit Zeit, Kosten, Risiko, Endlager und Alternativen.",
    clipHook: "Kernkraft ist CO₂-arm im Betrieb. Aber die Klimakrise wartet nicht auf Großprojekte, die vielleicht in 15 bis 25 Jahren wirken.",
    caption: "Kernenergie prüfen: CO₂, Zeit, Kosten, Endlager, Rückbau, Sicherheit, Flexibilität und Opportunitätskosten.",
  },
  "deutschland-nur-zwei-prozent": {
    title: "„Deutschland ist nur für 2 % verantwortlich“",
    subtitle: "Wahrer Kern, falsche Schlussfolgerung",
    confidence: "hoch",
    readingTime: "12 Minuten",
    leadQuestion: "Welche Hebelwirkung können wir trotz begrenztem Anteil erzeugen?",
    claimAnatomy: {
      original: "Deutschland ist nur für 2 % verantwortlich.",
      extended: "Deutschland ist nur für 2 % verantwortlich, also bringt Klimaschutz hier nichts.",
      trueCore: "Deutschland hat nur einen begrenzten Anteil an den aktuellen globalen Jahresemissionen.",
      missingContext:
        "Aktueller Anteil ist nicht gleich historische Verantwortung, Pro-Kopf-Verantwortung, technologische Hebelwirkung oder politische Systemwirkung.",
      falseConclusion: "Aus einem kleineren Anteil folgt nicht, dass Handeln wirkungslos ist.",
    },
    trueText:
      "Deutschland löst die Klimakrise nicht allein. Klimaschutz ist ein globales Kooperationsproblem, und ohne große Emittenten wie China, USA, Indien, EU und weitere Staaten kann das Ziel nicht erreicht werden.",
    missingItems: [
      "Historische Verantwortung: Industrieländer haben über lange Zeiträume zur CO₂-Konzentration beigetragen.",
      "Pro-Kopf-Perspektive: Ein Land kann bei Gesamtmenge kleiner wirken, aber pro Kopf überdurchschnittlich emittieren.",
      "Technologie- und Markthebel: Standards, Maschinenbau, Netze, Speicher, Verfahren und Regulierung wirken über Grenzen hinaus.",
      "EU-Hebel: Deutschland wirkt als Teil eines großen Binnenmarkts, der internationale Standards prägen kann.",
      "Unterlassungswirkung: Nicht-Handeln verzögert Innovation, Infrastruktur, Planungssicherheit und Glaubwürdigkeit.",
    ],
    evidence: {
      status: "datenbasiert",
      level: "hoch",
      uncertainty:
        "Nationale Anteile variieren je nach Datenquelle, Jahr, Emissionsart und Bilanzgrenze. Die Schlussfolgerung der Wirkungslosigkeit folgt daraus aber logisch nicht.",
      sourceKeys: ["uba_emissions_germany", "ipcc_ar6_headline"],
    },
    wirkstoff: {
      label: "Zahlenargument als Ohnmachtsimpuls",
      description: "Ein scheinbar nüchterner Prozentwert wird genutzt, um Handlungsfähigkeit zu senken.",
      mechanism: "Der Anteil eines Landes wird mit Wirkungslosigkeit verwechselt.",
      resonance: ["Kostenangst", "Veränderungsmüdigkeit", "Entlastungsbedürfnis", "Misstrauen gegen Klimapolitik"],
    },
    narrative: {
      message: "Wir können sowieso nichts ändern.",
      emotional: "Entlastung und Abwehr von Veränderungsdruck.",
      political: "Klimapolitik erscheint nutzlos oder überzogen.",
    },
    orders: [
      ["Wirkung 1. Ordnung", "Menschen halten Klimaschutz für nutzlos."],
      ["Wirkung 2. Ordnung", "Politische Unterstützung für Energiewende, Infrastruktur und Industrieumbau sinkt."],
      ["Wirkung 3. Ordnung", "Fossile Pfadabhängigkeiten, alte Geschäftsmodelle und Verzögerungslogiken bleiben länger bestehen."],
    ],
    falseActions: [
      ["Politik", "Maßnahmen werden verschoben, abgeschwächt oder symbolisch."],
      ["Wirtschaft", "Investitionssicherheit für klimafreundliche Technologien sinkt."],
      ["Infrastruktur", "Netze, Speicher, Ladepunkte, Gebäudesanierung und Industrieumbau kommen langsamer voran."],
      ["Demokratie", "Ohnmacht und Zynismus wachsen; kollektive Problemlösung wirkt sinnlos."],
      ["Planet", "Emissionen sinken langsamer, Klimafolgekosten steigen."],
    ],
    solutionLead: "Die wirkungsökonomische Antwort lautet nicht: Deutschland rettet allein das Klima. Sie lautet: Wirkung entsteht über Hebel.",
    clipHook: "Stimmt der 2-Prozent-Satz? Vielleicht. Aber die Schlussfolgerung ist trotzdem falsch.",
    caption: "Wahrer Kern, falsche Folgerung: Klimawirkung entsteht über Hebel, nicht nur über Prozentanteile.",
  },
  "klimaschutz-deindustrialisiert-deutschland": {
    title: "„Klimaschutz deindustrialisiert Deutschland“",
    subtitle: "Wahrer Transformationsstress, falsches Niedergangsnarrativ",
    confidence: "mittel bis hoch",
    readingTime: "18 Minuten",
    leadQuestion: "Welche Standortbedingungen sichern Industrie in einer klimaneutralen Wirtschaft?",
    claimAnatomy: {
      original: "Klimaschutz deindustrialisiert Deutschland.",
      extended: "Klimaschutz zerstört die industrielle Basis; deshalb müssen wir den Umbau stoppen oder zurückdrehen.",
      trueCore: "Industrie steht unter realem Druck durch Energiepreise, globale Konkurrenz, Netze, Genehmigungen, Fachkräfte, Kapital und Transformationskosten.",
      missingContext: "Fossile Abhängigkeit, Brennstoffimporte, CO₂-Kosten, Preisschocks, Klimaschäden und neue Wertschöpfung werden ausgeblendet.",
      falseConclusion: "Aus Transformationsstress folgt nicht, dass Klimaschutz die Ursache von Deindustrialisierung ist.",
    },
    trueText: "Schlecht gestaltete Transformation kann Industrie belasten. Nicht-Transformation ist aber ebenfalls ein Standort- und Kostenrisiko.",
    missingItems: ["CAPEX/OPEX-Unterschiede", "fossile Systemkosten", "neue Transformationscluster", "Netze, Speicher und Standortnähe", "Batterien, Halbleiter, Rechenzentren, E-Lkw und Ladeinfrastruktur"],
    evidence: {
      status: "checked_candidate",
      level: "mittel bis hoch",
      uncertainty: "Projektstatus, Industriepreise, Förderungen, Netzausbau und Investitionsentscheidungen müssen laufend aktualisiert werden.",
      sourceKeys: ["industry_transformation_v1"],
    },
    wirkstoff: {
      label: "Transformationskosten als Niedergangsbeweis",
      description: "Sichtbare Belastungen werden genutzt, um Klimaschutz pauschal als wirtschaftsfeindlich zu rahmen.",
      mechanism: "Kurzfristige Kosten und einzelne Krisenfälle werden mit langfristiger Standortwirkung verwechselt.",
      resonance: ["Arbeitsplatzangst", "Wohlstandsverlust", "Statusbedrohung", "fossile Nostalgie"],
    },
    narrative: {
      message: "Klimaschutz zerstört Wohlstand.",
      emotional: "Verlustangst und Schutz alter Identität.",
      political: "Transformation, Netze, Erneuerbare und Elektrifizierung verlieren Legitimität.",
    },
    orders: [],
    falseActions: [],
    solutionLead: "Die WÖk-Lösung ist Reindustrialisierung nach Wirkung: sauberer Strom, Netze, Speicher, Transformationscluster und ehrliche Systemkostenrechnung.",
    clipHook: "Nicht Klimaschutz zerstört Industrie. Die falsche Standortrechnung tut es.",
    caption: "Industrie sichern heißt Transformation gestalten, nicht fossile Verwundbarkeit verlängern.",
  },
  "energiewende-gescheitert": {
    title: "„Die Energiewende ist gescheitert“",
    subtitle: "Scheiternsframe statt Engpassanalyse",
    confidence: "hoch",
    readingTime: "14 Minuten",
    leadQuestion: "Welcher Engpass begrenzt die nächste positive Netto-Wirkung?",
    claimAnatomy: {
      original: "Die Energiewende ist gescheitert.",
      extended: "Die Energiewende ist gescheitert, deshalb sollten wir den Kurs stoppen oder zurückdrehen.",
      trueCore: "Es gibt reale Probleme bei Tempo, Kosten, Infrastruktur, Netzen, Speichern, Wärme, Verkehr und Industrie.",
      missingContext: "Ein Systemumbau kann Engpässe haben, ohne gescheitert zu sein.",
      falseConclusion: "Aus Problemen folgt nicht automatisch, dass der gesamte Transformationspfad falsch ist.",
    },
    trueText:
      "Netzausbau, Speicher, Flexibilität, Genehmigungen, Wärmewende, Verkehr, Preise, Industriepolitik und Akzeptanz sind reale Engpässe.",
    missingItems: [
      "Der Stromsektor hat bereits deutliche Transformation erlebt.",
      "Engpässe sind Steuerungsinformationen, kein Beweis des Totalversagens.",
      "Fossile Alternativen haben Kosten, Importabhängigkeiten, Gesundheitsrisiken und Folgeschäden.",
      "Die relevante Frage ist nicht Energiewende ja oder nein, sondern welche Engpässe zuerst gelöst werden.",
    ],
    evidence: {
      status: "datenbasiert",
      level: "hoch",
      uncertainty: "Mittel bei zukünftigen Strompreisen, Speicherpfaden, Industrieeffekten und Importabhängigkeiten.",
      sourceKeys: ["fraunhofer_ise_energy_charts", "uba_emissions_germany"],
    },
    wirkstoff: {
      label: "Scheiternsframe",
      description: "Sichtbare Engpässe werden in ein Totalurteil über einen komplexen Systemumbau verwandelt.",
      mechanism: "Komplexität wird auf gelungen oder gescheitert reduziert.",
      resonance: ["Frust über Kosten", "Misstrauen gegen Politik", "Infrastrukturmüdigkeit", "Angst vor Kontrollverlust"],
    },
    narrative: {
      message: "Der ganze Kurs ist falsch.",
      emotional: "Frust wird in Abbruchlogik übersetzt.",
      political: "Investitionen und Transformation verlieren Legitimität.",
    },
    orders: [
      ["Wirkung 1. Ordnung", "Menschen übernehmen den Eindruck, der Umbau sei grundsätzlich gescheitert."],
      ["Wirkung 2. Ordnung", "Politischer Druck gegen Netze, Speicher, Wind, Solar, Wärmepumpen oder Ladeinfrastruktur steigt."],
      ["Wirkung 3. Ordnung", "Die Entscheidungsstruktur kippt von lernender Transformation zurück in fossile Reparaturlogik."],
    ],
    falseActions: [
      ["Stromsystem", "Netz-, Speicher- und Flexibilitätsausbau werden verlangsamt."],
      ["Wirtschaft", "Unternehmen erhalten unsichere Signale und verschieben Investitionen."],
      ["Haushalte", "Kosten bleiben höher, wenn alte fossile Abhängigkeiten fortbestehen."],
      ["Demokratie", "Politik erscheint handlungsunfähig; Populismus erhält Resonanz."],
      ["Planet", "Emissionen sinken langsamer."],
    ],
    solutionLead: "Die wirkungsökonomische Antwort verschiebt die Debatte von der Lagerfrage zur Engpasslogik.",
    clipHook: "Die Energiewende ist nicht gescheitert - sie zeigt Engpässe. Und genau die müssen wir lösen.",
    caption: "Nicht Totalurteil, sondern Engpassanalyse: So denkt der Wirkungsradar.",
  },
  "e-autos-schlimmer-als-verbrenner": {
    title: "„E-Autos sind schlimmer als Verbrenner“",
    subtitle: "Rohstoffangst und falscher Lebenszyklusvergleich",
    confidence: "hoch",
    readingTime: "15 Minuten",
    leadQuestion: "Welche Kombination aus Fahrzeug, Batterie, Strom, Ladeinfrastruktur, Flotte, Alltag und Alternativen erzeugt die beste Netto-Wirkung?",
    claimAnatomy: {
      original: "E-Autos sind schlimmer als Verbrenner.",
      extended: "E-Autos sind wegen Batterie, Rohstoffen, Strommix und Ladeinfrastruktur unpraktischer oder klimaschädlicher als Verbrenner.",
      trueCore: "Batterieproduktion und Rohstoffabbau verursachen relevante ökologische und soziale Wirkungen.",
      missingContext: "Entscheidend sind der gesamte Lebenszyklus und die Infrastruktur: Ladeort, Ladeleistung, Ladefenster, Depot, Netzanschluss, Stromquelle, Logistik und Nutzungskontext.",
      falseConclusion: "Aus Batterie- oder Ladeproblemen folgt nicht automatisch, dass Verbrenner besser sind.",
    },
    trueText:
      "Batterieproduktion benötigt Energie und Rohstoffe. Lieferketten können Wasser-, Biodiversitäts-, Arbeitsrechts- und Governance-Probleme enthalten. Genau deshalb muss man Batterien ernst prüfen - aber aktuell, chemiespezifisch und über den Lebenszyklus, nicht mit einem pauschalen Akku-Angstbild.",
    missingItems: [
      "Verbrenner emittieren während der gesamten Nutzung fossiles CO₂.",
      "Verbrenner verursachen Luftschadstoffe und fossile Importabhängigkeit.",
      "Der Strommix kann über die Lebensdauer erneuerbarer werden; geförderte öffentliche Ladeinfrastruktur ist in Deutschland an erneuerbaren Strom gebunden.",
      "Der CO₂-Fußabdruck der Batterie hängt stark vom realen Produktionsstrom ab. Alte Durchschnittsannahmen sind angreifbar, wenn Zellwerke mit erneuerbaren Energien oder spezifischen Stromverträgen produzieren.",
      "Batteriechemien unterscheiden sich: LFP kommt in der Kathode ohne Kobalt und Nickel aus; NMC/NCA haben andere Energie- und Rohstoffprofile.",
      "Batterien können recycelt, weitergenutzt und technologisch verbessert werden. Fossile Kraftstoffe werden dagegen einmal verbrannt und sind danach weg.",
      "Brandrisiken, Garantie und Lebensdauer sind Datenfragen: Sie gehören in die Bewertung, aber nicht als Pauschalnarrativ gegen alle Akkus.",
      "Die beste Mobilitätswirkung entsteht nicht automatisch durch Autoersatz, sondern durch bessere Mobilitätssysteme.",
      "Elektromobilität ist nicht nur Pkw: E-Transporter, Busse und E-Lkw brauchen Depotladen, Schnellladeparks, Megawattladen, Netzanschlüsse, Lastmanagement und Routenplanung.",
      "Laden ist nicht Tanken: Viele Ladefälle funktionieren über Standzeiten im Alltag, bei Arbeit, Handel, Parken, Hotel, Depot, Hub, Pause oder Autobahn-Ladepark.",
      "Ladepunktzahl ist nicht Ladequalität: Leistung, Verfügbarkeit, Wartung, Preisfairness, Bezahlung, Barrierefreiheit und Aufenthaltsqualität entscheiden mit.",
    ],
    evidence: {
      status: "datenbasiert",
      level: "hoch",
      uncertainty: "Mittel bei künftigen Batteriechemien, Recyclingquoten, Strommix, Fahrzeuggröße und Lieferkettenqualität.",
      sourceKeys: ["icct_lca_ev_2025", "fraunhofer_isi_battery_facts_2025", "eu_battery_regulation_2023", "iea_global_ev_2024", "bmv_ladeinfrastruktur_foerderung", "bgr_lithium_tiefenwaesser", "fraunhofer_ise_geothermal_lithium", "nist_battery_fire_risk", "bnetza_ladeinfrastruktur_2026", "deutschlandnetz_hpc", "bmv_deutschlandnetz", "iea_ev_charging_infrastructure", "eu_afir", "charin_mcs", "hola_lkw_mcs", "eu_road_transport_rest"],
    },
    wirkstoff: {
      label: "Batterieproblem und Ladeangst als Totalargument",
      description: "Reale Fragen zu Batterie, Rohstoffen und Ladeinfrastruktur werden isoliert und als Gesamtbeweis gegen Elektromobilität genutzt.",
      mechanism: "Die Aussage verschiebt Aufmerksamkeit von Lebenszyklus, Infrastrukturentwicklung und Nutzungskontext auf einzelne Reibungspunkte: Ladezeit, Ladesäulen, Rohstoffe oder Netzangst.",
      resonance: ["Misstrauen gegen neue Technologien", "Rohstoffangst", "Ladeangst", "Angst liegenzubleiben", "Kontrollverlust", "Sorge um Alltagstauglichkeit", "Abwehr gegen Mobilitätswandel"],
    },
    narrative: {
      message: "Die angeblich grüne Lösung ist in Wahrheit schlimmer und funktioniert im Alltag oder in der Logistik sowieso nicht.",
      emotional: "Moralische Entlastung für fossile Weiterführung, Reichweitenangst, Kontrollverlust, Komfortverlust und Technikmisstrauen.",
      political: "Ladeinfrastrukturausbau, E-Lkw-Korridore, Elektrifizierung von Flotten und Netzplanung verlieren Akzeptanz.",
    },
    orders: [
      ["Wirkung 1. Ordnung", "Menschen zweifeln an der Klimawirkung von E-Mobilität."],
      ["Wirkung 2. Ordnung", "Investitionen in Ladeinfrastruktur, Batterierecycling und Flottenumstellung sinken."],
      ["Wirkung 3. Ordnung", "Der Mobilitätsmarkt bleibt länger an fossile Pfade und alte Industrieinteressen gebunden."],
    ],
    falseActions: [
      ["Mobilität", "Verbrenner bleiben länger im System."],
      ["Industrie", "Batterie-, Recycling- und Lieferkettenkompetenz wandert ab."],
      ["Klima", "Nutzungsemissionen bleiben höher."],
      ["Gesundheit", "Luftschadstoffbelastungen sinken langsamer."],
      ["Lieferketten", "Echte Rohstoffprobleme werden nicht gelöst, sondern als Abbruchargument missbraucht."],
    ],
    batteryAudit: [
      [
        "Batteriechemie",
        "LFP ohne Kobalt und Nickel in der Kathode verändert das Rohstoffargument; NMC/NCA bleiben anders zu bewerten.",
        "Nicht alle Akkus über einen Rohstoffkamm scheren. Chemie, Zellformat, Fahrzeugklasse und Anwendung ausweisen.",
      ],
      [
        "Lithium",
        "Lithium bleibt relevant, kann aber auch in Europa und perspektivisch aus geothermischen Solen in Deutschland gewonnen werden. Das ist kein Freifahrtschein, aber es schwächt die Behauptung vollständiger Import- und Lieferkettenausweglosigkeit.",
        "Herkunft, Wasserwirkung, Energieeinsatz, Genehmigung und lokale Beteiligung als eigene Wirkungsfelder prüfen.",
      ],
      [
        "Produktionsstrom",
        "Der CO₂-Fußabdruck der Batterie hängt stark vom Strom der Zellproduktion ab. Studien, die pauschal fossile Durchschnittsmixe ansetzen, können heutige oder künftige Werke falsch abbilden.",
        "Mit werksspezifischem Strom, Datenqualitätsklasse und zeitlichem Datenstand rechnen.",
      ],
      [
        "Ladestrom",
        "Der Fahrstrom entscheidet über Nutzungsemissionen. Bei geförderter öffentlich zugänglicher Ladeinfrastruktur in Deutschland verlangen Förderbedingungen erneuerbaren Strom; private und ungeförderte Ladefälle müssen separat betrachtet werden.",
        "Nicht pauschal „Netzmix“ oder pauschal „Ökostrom“ behaupten, sondern Ladefall und Nachweis trennen.",
      ],
      [
        "Recycling",
        "EU-Batterierecht und industrielle Verfahren machen Recycling zu einer realen Skalierungsfrage. Hohe Rückgewinnung ist möglich, aber nur mit Rücknahme, Design, Demontage, Prozessqualität und sauberer Energie.",
        "Rückgewinnungsquote, Rezyklatanteil, Lithiumrückgewinnung, Second Life und Prozessstrom sichtbar machen.",
      ],
      [
        "Brandrisiko",
        "Akkubrände sind real, aber das Narrativ vom unlöschbaren Akku ist zu grob. Moderne Batterie- und Feuerwehrpraxis arbeitet mit Überwachung, Kühlung, Eindämmung und angepassten Verfahren; LFP ist thermisch stabiler als viele nickelreiche Chemien.",
        "Risiko nach Fahrzeugtyp, Batteriechemie, Unfallbild, Ladezustand und Einsatzkonzept bewerten.",
      ],
      [
        "Lebensdauer",
        "Viele Pkw-Hersteller geben lange Batteriegarantien, häufig um 8 Jahre und etwa 160.000 bis 250.000 km. Extrem hohe Laufleistungszusagen einzelner Hersteller oder Nutzfahrzeuganwendungen sind nicht der Standard für jedes E-Auto.",
        "Garantie, reale Degradation, Restkapazität, Reparaturfähigkeit und Second-Life-Nutzung modellbezogen prüfen.",
      ],
      [
        "Fossiler Vergleich",
        "Benzin und Diesel werden importiert, raffiniert, transportiert und verbrannt. Danach ist der Energieträger weg und die Emission bleibt im System. Eine Batterie ist dagegen ein langlebiges Produkt und Materiallager.",
        "Nicht Akku-Rucksack gegen leeren Verbrenner vergleichen, sondern beide Pfade vollständig bilanzieren.",
      ],
      [
        "Ladeinfrastruktur",
        "Die Bundesnetzagentur meldete zum 1. April 2026 rund 149.002 Normalladepunkte, 51.253 Schnellladepunkte und 8,50 GW gleichzeitig verfügbare Ladeleistung. Aussagekräftig sind neben Anzahl auch Leistung, Verfügbarkeit, Wartung, Standort und Preisfairness.",
        "Ladepunktzahl nie allein bewerten. Standortqualität, Ladeleistung, Nutzerfreundlichkeit und Datenstand mitführen.",
      ],
      [
        "Alltagsladen",
        "Laden passiert nicht nur an klassischen Tankstellenorten. Zuhause, Arbeitsplatz, Supermarkt, Baumarkt, Einkaufszentrum, Parkhaus, Hotel und Gastronomie können Standzeit in Ladezeit verwandeln.",
        "Tankstellenlogik nicht auf jeden Ladefall übertragen. Alltagsladen, Langstreckenladen und Logistikladen trennen.",
      ],
      [
        "E-Lkw und Depotladen",
        "E-Transporter, Busse und viele regionale Lkw können planbar im Depot laden. Fernverkehr braucht zusätzlich HPC- und MCS-Ladepunkte an Hubs, Rastanlagen und Korridoren.",
        "E-Lkw nicht wie Pkw behandeln. Route, Depot, Pause, Nutzlast, Ladefenster, Strompreis und Netzanschluss prüfen.",
      ],
      [
        "Ladezeit",
        "Ladezeit hängt von benötigter Energiemenge, durchschnittlicher Ladeleistung, Fahrzeug, Ladekurve, Temperatur, Auslastung, Netzanschluss und Ladezustand ab.",
        "Nicht Maximalleistung versprechen. Relevante Frage: durchschnittliche Ladeleistung im passenden Ladefenster.",
      ],
    ],
    evInfrastructure: true,
    solutionLead: "Die WÖk bewertet nicht Technologie-Lager, sondern Mobilitätswirkung über den Lebenszyklus.",
    clipHook: "E-Autos sind nicht perfekt. Aber der Verbrenner-Vergleich muss ehrlich sein.",
    caption: "Lebenszyklus statt Lagerkampf: Mobilität wirkungsökonomisch prüfen.",
  },
  "batterien-sind-nicht-recyclebar": {
    title: "„Batterien sind nicht recyclebar“",
    subtitle: "Rohstoffangst statt Kreislaufanalyse",
    confidence: "hoch",
    readingTime: "13 Minuten",
    leadQuestion: "Welche Batterie wird wie lange genutzt, wie zurückgenommen und mit welcher Quote hochwertig recycelt?",
    claimAnatomy: {
      original: "Batterien sind nicht recyclebar.",
      extended: "Akkus sind Sondermüll, brennen, brauchen Kobalt und Lithium und sind deshalb keine ökologische Lösung.",
      trueCore: "Batterien haben reale Rohstoff-, Sicherheits-, Produktions- und Recyclingwirkungen.",
      missingContext: "Recyclingfähigkeit hängt von Batteriechemie, Design, Rücknahme, Verfahren, Energiequelle, Regulierung und industrieller Skalierung ab.",
      falseConclusion: "Aus anspruchsvollem Recycling folgt nicht, dass Batterien grundsätzlich nicht recyclebar oder E-Mobilität wirkungslos sind.",
    },
    trueText:
      "Batterien sind anspruchsvolle Produkte. Sie enthalten Rohstoffe, brauchen Energie in der Herstellung und müssen am Ende der Nutzung sicher zurückgenommen und recycelt werden. Das ist ein echtes Wirkungsfeld, aber kein Beweis für Nicht-Recyclebarkeit.",
    missingItems: [
      "Batteriechemien unterscheiden sich: LFP kommt ohne Kobalt und Nickel in der Kathode aus, NMC/NCA haben andere Rohstoffprofile.",
      "EU-Batterierecht setzt Vorgaben zu CO₂-Fußabdruck, Sorgfaltspflichten, Batteriepass, Recyclingeffizienz, Materialrückgewinnung und Rezyklatanteilen.",
      "Lithium kann perspektivisch auch aus deutschen Tiefenwässern und geothermalen Solen gewonnen werden; das ist ein Potenzial- und Genehmigungspfad, keine automatische Entlastung.",
      "Second Life kann die Nutzungsdauer verlängern, bevor Recycling ansteht.",
      "Industrielles Recycling kann hohe Materialrückgewinnung erreichen, braucht aber Rücknahme, Demontage, Design und saubere Prozessenergie.",
      "Akkubrände brauchen angepasste Brandbekämpfung, sind aber kein Argument für das Pauschalbild „unlöschbar“.",
      "Fossile Kraftstoffe werden nicht recycelt: Benzin und Diesel werden verbrannt, der Kohlenstoff gelangt in die Atmosphäre.",
    ],
    evidence: {
      status: "datenbasiert",
      level: "hoch",
      uncertainty:
        "Mittel bei künftigen Recyclingkapazitäten, Rücklaufmengen, Lithiumrückgewinnung, Wirtschaftlichkeit einzelner Verfahren, LFP-Recycling und realer Datenqualität aus Lieferketten.",
      sourceKeys: ["fraunhofer_isi_battery_facts_2025", "eu_battery_regulation_2023", "fraunhofer_ilt_lfp_recycling", "iea_global_ev_2024", "bgr_lithium_tiefenwaesser", "fraunhofer_ise_geothermal_lithium", "nist_battery_fire_risk"],
    },
    wirkstoff: {
      label: "Rohstoffangst als Endpunkt-Erzählung",
      description: "Ein reales Rohstoff- und Recyclingthema wird so gerahmt, als sei jeder Akku automatisch ökologischer Stillstand.",
      mechanism: "Aus technischer und industrieller Komplexität wird Unmöglichkeit gemacht.",
      resonance: ["Sorge um Rohstoffe", "Misstrauen gegen neue Technik", "Brandangst", "Abwehr gegen Mobilitätswandel"],
    },
    narrative: {
      message: "Die neue Lösung ist in Wahrheit Sondermüll.",
      emotional: "Rohstoffangst und Sicherheitsangst entlasten vom Vergleich mit fossilen Pfaden.",
      political: "Rücknahme, Recycling, Ladeinfrastruktur und Batteriewertschöpfung werden langsamer aufgebaut.",
    },
    orders: [
      ["Wirkung 1. Ordnung", "Menschen übernehmen ein statisches Bild: Akku gleich Sondermüll."],
      ["Wirkung 2. Ordnung", "Investitionen in Rücknahme, Recycling, Design und europäische Batteriewertschöpfung verlieren Akzeptanz."],
      ["Wirkung 3. Ordnung", "Fossile Kraftstoffe werden indirekt geschont, obwohl sie nicht recycelbar sind, sondern verbrannt werden."],
    ],
    falseActions: [
      ["Recycling", "Rücknahme- und Recyclinginfrastruktur wird zu langsam aufgebaut."],
      ["Design", "Batterien werden weniger konsequent auf Demontage, Reparatur und Materialrückgewinnung optimiert."],
      ["Rohstoffe", "Kritische Lieferketten werden nicht verbessert, sondern als Abbruchargument benutzt."],
      ["Industrie", "Europäische Kreislauf- und Batteriekompetenz wird verzögert."],
      ["Klima", "Fossile Nutzungspfade bleiben länger im System."],
    ],
    batteryAudit: [
      ["Chemie", "LFP ohne Kobalt und Nickel in der Kathode schwächt das Kobalt-Narrativ, ersetzt aber keine Lithium-, Graphit-, Energie- und Lieferkettenprüfung.", "Batteriechemie immer nennen: LFP, NMC, NCA oder andere."],
      ["Recycling", "EU-Regeln und industrielle Verfahren machen Recycling real. Entscheidend sind Rücklauf, Demontage, Sortierung, Prozessenergie und Rückgewinnungsquote.", "Rückgewinnungsquote, Recyclingeffizienz, Rezyklatanteil und Datenqualität getrennt ausweisen."],
      ["Lithium", "Deutschland hat Potenzialpfade für Lithium aus Tiefenwässern und geothermalen Solen. Das ist kein Sofortargument, aber es widerlegt die völlige Ausweglosigkeit.", "Herkunft, Wasserwirkung, Genehmigung, lokale Akzeptanz und Energieeinsatz prüfen."],
      ["Lade- und Produktionsstrom", "Ökostrompflichten in Förderprogrammen und erneuerbarer Produktionsstrom verändern die Bilanz gegenüber alten Durchschnittsstrom-Annahmen.", "Nicht pauschalisieren: Ladefall, Förderstatus, Stromvertrag und Produktionsstandort prüfen."],
      ["Brand", "Lithium-Ionen-Brände sind anders zu bekämpfen, aber nicht automatisch unbeherrschbar. LFP ist thermisch stabiler als viele nickelreiche Zellchemien.", "Sicherheitsdaten, Chemie, Unfallbild, Feuerwehrkonzept und Nachkontrolle nennen."],
      ["Lebensdauer", "Garantien sind modellabhängig; lange Garantien und hohe Laufleistungen sind ein Gegenargument gegen das Wegwerf-Bild, aber keine Pauschalgarantie für jedes Fahrzeug.", "Garantiebedingungen, Degradation, Restkapazität und Second Life modellbezogen prüfen."],
      ["Fossiler Vergleich", "Akkus bleiben Materiallager. Benzin und Diesel werden verbrannt und können nicht zurückgewonnen werden.", "Batteriepfad nie gegen einen scheinbar wirkungsfreien Verbrenner vergleichen."],
    ],
    solutionLead: "Die WÖk macht aus Akku-Angst eine prüfbare Kreislauf- und Produktdatenstrategie.",
    clipHook: "Akkus sind kein Zauberprodukt. Aber „nicht recyclebar“ ist als Pauschalsatz veraltet.",
    caption: "Batterien prüfen: Chemie, Strom, Nutzung, Brandrisiko, Rücknahme, Recycling und Lieferkette.",
  },
  "kernenergie-einfache-loesung": {
    title: "„Kernenergie wäre die einfache Lösung“",
    subtitle: "Strategiebehauptung mit Zeit-, Kosten- und Risikooffenheiten",
    confidence: "mittel",
    readingTime: "16 Minuten",
    leadQuestion: "Welche Energieinvestition wirkt rechtzeitig, bezahlbar und mit geringster Netto-Negativwirkung?",
    claimAnatomy: {
      original: "Kernenergie wäre die einfache Lösung.",
      extended: "Deutschland hätte mit Kernenergie keine Energieprobleme und könnte Klimaschutz einfacher erreichen.",
      trueCore: "Kernkraftwerke emittieren im Betrieb wenig CO₂ und können steuerbare Leistung bereitstellen.",
      missingContext: "Neue Kernenergie braucht lange Planung, hohe Investitionen, Sicherheits- und Entsorgungsstrukturen sowie Akzeptanz.",
      falseConclusion: "Aus niedrigen Betriebsemissionen folgt nicht automatisch, dass Kernenergie im deutschen Zeitfenster die beste Lösung ist.",
    },
    trueText:
      "Kernenergie ist im Betrieb CO₂-arm und steuerbar. In Ländern mit bestehender Kernenergieflotte kann die Laufzeitfrage anders bewertet werden als in Deutschland.",
    missingItems: [
      "Deutschland hat die Kernenergie politisch, rechtlich, personell und infrastrukturell beendet.",
      "Neue Reaktoren hätten lange Vorlaufzeiten.",
      "Kapitalbindung und Opportunitätskosten sind zentral.",
      "Endlagerung, Sicherheit, Haftung, Rückbau und Kühlwasserfragen gehören zur Netto-Wirkung.",
      "Die relevante Frage lautet: Was wirkt in Deutschland rechtzeitig und am besten?",
    ],
    evidence: {
      status: "teilweise umstritten",
      level: "mittel",
      uncertainty: "Hoch bei Neubaukosten, Bauzeiten, Finanzierung, regulatorischen Pfaden und politischer Akzeptanz in Deutschland.",
      sourceKeys: ["iea_nuclear", "base_endlager"],
    },
    wirkstoff: {
      label: "Falsche Einfachheit",
      description: "Eine komplexe Strategieoption wird als unkomplizierte Lösung dargestellt.",
      mechanism: "Ein positiver Technologieaspekt wird vom Systemkontext getrennt.",
      resonance: ["Sehnsucht nach einfacher Lösung", "Frust über Energiewende", "Misstrauen gegen Erneuerbare", "Kontrollbedürfnis"],
    },
    narrative: {
      message: "Man hätte nur bei Atomkraft bleiben müssen.",
      emotional: "Rückkehr zu scheinbarer Kontrolle.",
      political: "Erneuerbare, Netze, Speicher und Effizienz werden als zweitbeste Lösungen gerahmt.",
    },
    orders: [
      ["Wirkung 1. Ordnung", "Menschen unterschätzen Zeit-, Kosten- und Entsorgungsfragen."],
      ["Wirkung 2. Ordnung", "Politischer Druck entsteht, verfügbare Lösungen als unzureichend darzustellen."],
      ["Wirkung 3. Ordnung", "Die Transformationsarchitektur verschiebt sich von lernender Dezentralität zu Großprojekt- und Kontrolllogik."],
    ],
    falseActions: [
      ["Zeit", "Emissionseinsparungen im laufenden Jahrzehnt werden nicht durch Neubauten erreicht."],
      ["Kapital", "Investitionen könnten von Netzen, Speichern, Effizienz, Gebäuden und Industrieumstellung abgezogen werden."],
      ["Entsorgung", "Langfristige Abfall- und Governance-Verantwortung steigt."],
      ["Demokratie", "Konflikte um Standorte, Risiken und Kosten können Akzeptanz belasten."],
      ["System", "Komplexitätsreduktion ersetzt echte Netto-Wirkungsanalyse."],
    ],
    solutionLead: "Die WÖk vergleicht Technologien nach Netto-Wirkung im konkreten Zeitfenster.",
    clipHook: "Atomkraft ist nicht die Frage. Die Frage ist: Welche Option wirkt rechtzeitig?",
    caption: "Technologievergleich nach Wirkung: Zeit, Kosten, Risiko, Alternativen.",
  },
  "fusion-loest-das-energieproblem": {
    title: "Fusion löst das Energieproblem?",
    subtitle: "Warum Zukunftstechnologie kein Aufschubargument sein darf",
    confidence: "hoch",
    readingTime: "20 Minuten",
    leadQuestion: "Welche Maßnahme senkt im relevanten Zeitfenster real Emissionen, Kosten, Abhängigkeiten und Risiken?",
    claimAnatomy: {
      original: "Fusion löst bald das Energieproblem.",
      extended: "Wir müssen jetzt nicht so stark auf heutige Klimaschutzmaßnahmen setzen, weil Fusion das Energieproblem später lösen wird.",
      trueCore: "Fusion ist wissenschaftlich relevant, faszinierend und kann langfristig eine wichtige Energieoption werden.",
      missingContext: "Kommerzielle, skalierte, netzrelevante Fusionsstromerzeugung ist nicht kurzfristig verfügbar.",
      falseConclusion: "Aus langfristiger Forschung folgt nicht, dass heutige Emissionsminderung, Netze, Speicher, Effizienz und Elektrifizierung warten können.",
    },
    trueText:
      "Fusion ist ein bedeutendes Forschungsfeld. Bei erfolgreicher Entwicklung könnte sie langfristig neue Energieoptionen eröffnen. Forschung an Plasma, Magneten, Lasern, Materialien, Simulation und Robotik ist wertvoll.",
    missingItems: [
      "Klimaschutz hat ein akutes Zeitfenster bis 2030, 2035 und 2045.",
      "Fusion ist noch keine verfügbare, skalierte und netzdienliche Stromquelle.",
      "Target Gain ist nicht Kraftwerks-Nettoleistung.",
      "Tritium-Selbstversorgung, Brutblankets, Materialien, Wartung, Kosten und Netzintegration bleiben zentrale Fragen.",
      "Netze, Erneuerbare, Speicher, Effizienz, Wärmewende und Industrieumbau wirken jetzt.",
      "Forschung darf nicht gegen Implementierung ausgespielt werden.",
    ],
    evidence: {
      status: "prognose unsicher",
      level: "hoch beim Technologiestatus, offen bei Kommerzialisierung",
      uncertainty: "Hoch bei Zeitpunkt, Kosten, Skalierbarkeit, Materialfragen und Systemintegration künftiger Fusionskraftwerke.",
      sourceKeys: ["iter", "eurofusion_demo"],
    },
    wirkstoff: {
      label: "Zukunftstechnologie als Aufschubimpuls",
      description: "Eine mögliche spätere Lösung wird als Grund genutzt, heutige Lösungen zu verlangsamen.",
      mechanism: "Hoffnung wird von Handlungsenergie in Wartelogik umgewandelt.",
      resonance: ["Technikoptimismus", "Veränderungsvermeidung", "Sehnsucht nach problemloser Lösung", "Misstrauen gegen heutige Transformation"],
    },
    narrative: {
      message: "Wir müssen nur warten, bis die perfekte Lösung kommt.",
      emotional: "Entlastung von unbequemen heutigen Entscheidungen.",
      political: "Heute verfügbare Maßnahmen verlieren Dringlichkeit.",
    },
    orders: [
      ["Wirkung 1. Ordnung", "Menschen glauben, heutige Maßnahmen seien weniger dringend."],
      ["Wirkung 2. Ordnung", "Politische Unterstützung für kurzfristig wirksame Infrastruktur sinkt."],
      ["Wirkung 3. Ordnung", "Das System stabilisiert eine Wartelogik statt eine Lern- und Umsetzungskultur."],
    ],
    falseActions: [
      ["Klima", "Emissionen bleiben länger hoch."],
      ["Industrie", "Heute verfügbare Technologien skalieren langsamer."],
      ["Forschung", "Fusion wird politisch überfrachtet und als Heilsversprechen statt Forschungsprogramm kommuniziert."],
      ["Demokratie", "Enttäuschung kann wachsen, wenn versprochene Durchbrüche nicht rechtzeitig eintreten."],
    ],
    solutionLead: "Die WÖk trennt Forschung und Umsetzung, finanziert aber beide wirkungsorientiert.",
    clipHook: "Fusion ist Hoffnung - aber kein Ersatz für Handeln.",
    caption: "Forschung ja. Aufschub nein.",
  },
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugSource(label) {
  return sourcePack.primary_sources.find((source) => source.label === label) || sourcePack.primary_sources[0];
}

const germanyTwoPercentSourceMeta = new Map([
  [
    "Umweltbundesamt - Treibhausgas-Emissionen in Deutschland",
    {
      title: "UBA - territoriale Treibhausgasemissionen",
      shows: "Deutschland emittierte 2024 territorial rund 649 Mio. t CO₂e; BMUKN/UBA-Vorabdaten für 2025 nennen 648,9 Mio. t CO₂e.",
      use_for: "Einordnung der engen territorialen Bilanz.",
      warning: "Territoriale Emissionen sind nicht Gesamtverantwortung.",
    },
  ],
  [
    "EDGAR/JRC - globale Treibhausgasemissionen 2025 Report",
    {
      title: "EDGAR/JRC - globale Treibhausgasemissionen",
      shows: "Globale Treibhausgasemissionen erreichten 2024 rund 53,2 Gt CO₂e ohne LULUCF.",
      use_for: "Vergleichsgröße für territoriale Anteile.",
      warning: "Globaler Anteil sagt nichts über Konsum-, Produkt-, Scope-3- oder historische Verantwortung.",
    },
  ],
  [
    "Umweltbundesamt - Treibhausgasemissionen pro Person",
    {
      title: "UBA - Pro-Kopf-Emissionen mit Import-/Exportberücksichtigung",
      shows: "10,3 t CO₂e pro Person und Jahr, Stand 2021; mehr als 60 Prozent über dem Weltdurchschnitt.",
      use_for: "Konsum- und Nachfrageverantwortung.",
      warning: "Pro-Kopf-Fußabdruck ist eine andere Bilanzlogik als Territorialemissionen.",
    },
  ],
  [
    "Eurostat - Greenhouse gas emission footprints",
    {
      title: "Eurostat - Greenhouse gas emission footprints",
      shows: "Deutschlands Konsum war 2023 mit 903 Mio. t CO₂e verbunden; pro Kopf lag der Fußabdruck bei 10,8 t.",
      use_for: "Konsumemissionen und ausgelagerte Produktionswirkung.",
      warning: "Nicht mit Territorialwerten addieren; Bilanzgrenzen erklären.",
    },
  ],
  [
    "Eurostat - Methodik Konsumperspektive",
    {
      title: "Eurostat - Methodik Konsumperspektive",
      shows: "Die Konsumperspektive erfasst Emissionen entlang globaler Produktionsketten unabhängig davon, wo sie entstehen.",
      use_for: "Definition der Bilanzgrenze Konsum.",
      warning: "Modellierte Daten, keine direkt gemessene Territorialinventur.",
    },
  ],
  [
    "GHG Protocol - Corporate Value Chain Scope 3 Standard",
    {
      title: "GHG Protocol - Scope 3 Category 11: Use of Sold Products",
      shows: "Die Nutzung verkaufter Produkte ist Scope-3-Kategorie 11; Beispiele sind Automobile, Motoren, Kraftwerke, Gebäude und Geräte.",
      use_for: "Produktnutzung und exportierte Emissionsverantwortung.",
      warning: "Scope 3 ist Unternehmensbilanz, nicht nationale Territorialbilanz.",
    },
  ],
  [
    "Destatis - 3.4 million new cars exported from Germany in 2024",
    {
      title: "Destatis - Pkw-Exporte",
      shows: "Deutschland exportierte 2024 rund 3,4 Mio. neue Pkw; 25,9 Prozent waren reine Elektroautos.",
      use_for: "Beispiel für exportierte Produktnutzung und Scope-3-Relevanz.",
      warning: "Die Exportzahl allein ist keine Emissionsbilanz; sie zeigt den Wirkungsraum.",
    },
  ],
  [
    "Our World in Data - Share of global cumulative CO2 emissions",
    {
      title: "Our World in Data - kumulative CO₂-Emissionen",
      shows: "Kumulative CO₂-Emissionen werden als laufende Summe jährlicher Emissionen seit 1750 ausgewiesen.",
      use_for: "Historische Verantwortung als eigene Bilanzfrage.",
      warning: "Jahresanteil ist nicht kumulative Klimawirkung.",
    },
  ],
]);

function germanyTwoPercentSourceCard(label) {
  const source = slugSource(label);
  const meta = germanyTwoPercentSourceMeta.get(label) || {
    title: source.label,
    shows: source.use_for.join(" / "),
    use_for: "Faktenprüfung und Kontext.",
    warning: "Bilanzgrenze offenlegen.",
  };
  return { ...source, ...meta };
}

function sentence(value) {
  const text = String(value ?? "");
  return text.length > 155 ? `${text.slice(0, 152)}...` : text;
}

function words(value) {
  return String(value || "").split(/\s+/).filter(Boolean).length;
}

function speechSeconds(value) {
  return Math.max(1, Math.round((words(value) / 135) * 60));
}

function formatSpeechTime(value) {
  const seconds = typeof value === "number" ? value : speechSeconds(value);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes ? `ca. ${minutes}:${String(rest).padStart(2, "0")} Min.` : `ca. 0:${String(rest).padStart(2, "0")} Min.`;
}

function copyButton(text, label = "Kopieren") {
  return `<button class="copy-answer-button" type="button" data-copy-text="${escapeHtml(text)}">${escapeHtml(label)}</button>`;
}

function answerText(claim, key) {
  const base = claim.answers[key];
  if (claim.answersFinal) return base;
  const expansion = answerExpansions[claim.slug]?.[key];
  return expansion ? `${base} ${expansion}` : base;
}

function expandedAnswers(claim) {
  return {
    one_liner: answerText(claim, "one_liner") || claim.summary?.host_answer || "",
    ten_seconds: answerText(claim, "ten_seconds"),
    thirty_seconds: answerText(claim, "thirty_seconds"),
    two_minutes: answerText(claim, "two_minutes"),
  };
}

function deepDiveDetailFor(claim) {
  return deepDiveDetails[claim?.slug];
}

function deepDiveSources(detail) {
  return (detail?.evidence?.sourceKeys || []).map((key) => deepDiveSourcePack.sources[key]).filter(Boolean);
}

function htmlList(items) {
  return `<ul class="clean-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

const psychologyNotice =
  "Psychologische Effekte sind keine Diagnose einzelner Personen. Sie beschreiben allgemeine menschliche Wahrnehmungs- und Kommunikationsmuster. Der Wirkungsradar nutzt sie, um Frames, Resonanzräume und Wirkungsrisiken sichtbar zu machen - nicht um Menschen abzuwerten.";

const hostControlSteps = [
  "Stoppen: nicht sofort auf den Köder reagieren.",
  "Frame markieren: Ich beantworte das, aber ich übernehme nicht den Frame.",
  "Wahren Kern anerkennen.",
  "Denkfehler oder psychologisches Muster benennen.",
  "Zur Wirkungsfrage zurückführen.",
  "Konkrete Lösung verlangen.",
];

const psychologyBySlug = {
  "deutschland-nur-zwei-prozent": {
    effects: ["Verantwortungsdiffusion", "Erlernte Hilflosigkeit", "Motiviertes Denken"],
    triggers: ["Entlastung", "Ohnmacht", "Kostenabwehr"],
    patterns: ["Whataboutism", "Territorialframe", "Verantwortungsverkürzung"],
    why: "Der kleine Prozentwert fühlt sich wie ein Freispruch an. Aus einer Teilzahl wird ein psychologischer Entlastungsanker.",
  },
  "co2-preis-oder-fossile-systemkosten": {
    effects: ["Verlustaversion", "Reaktanz", "Salienz-Bias"],
    triggers: ["sichtbare Rechnung", "Fairnessgefühl", "Abzocke-Frame"],
    patterns: ["nur neue Kosten zeigen", "ausgelagerte Schäden ausblenden", "Rückverteilung verschweigen"],
    why: "Sichtbare Kosten wirken stärker als vermiedene Schäden, obwohl die fossilen Systemkosten real weiterlaufen.",
  },
  "e-autos-schlimmer-als-verbrenner": {
    effects: ["Verfügbarkeitsheuristik", "Negativitätsbias", "falscher Lebenszyklusvergleich"],
    triggers: ["Rohstoffangst", "Technikmisstrauen", "Gerechtigkeitsgefühl"],
    patterns: ["Akku-Fokus ohne Betrieb", "Strommix statisch setzen", "Verbrennerfolgen unsichtbar machen"],
    why: "Ein emotional auffälliger Akku wirkt greifbarer als Millionen Liter verbrannter Kraftstoff und laufende Abgase.",
  },
  "batterien-sind-nicht-recyclebar": {
    effects: ["Verfügbarkeitsheuristik", "Negativitätsbias", "Verlustaversion"],
    triggers: ["Giftmüllbild", "Brandangst", "Rohstoffsorge"],
    patterns: ["Altdaten verallgemeinern", "Recyclingfortschritt ausblenden", "Benzin/Diesel als verschwindenden Rohstoff vergessen"],
    why: "Der Akku bleibt sichtbar. Der verbrannte Kraftstoff ist weg. Dadurch wirkt der Akku als Problemträger, obwohl er industriell wiedergewonnen werden kann.",
  },
  "kernenergie-einfache-loesung": {
    effects: ["Kontrollbedürfnis", "Nostalgie-Bias", "Komplexitätsreduktion"],
    triggers: ["Versorgungssicherheit", "Industrieangst", "Technikvertrauen"],
    patterns: ["Zeitpfad ausblenden", "Kosten externalisieren", "Systemintegration verkürzen"],
    why: "Ein großes Kraftwerk fühlt sich kontrollierbarer an als ein verteiltes Energiesystem mit Netzen, Speichern und Flexibilität.",
  },
  "kernenergie-wieder-in-deutschland": {
    effects: ["Solutionism", "Authority Bias", "Status-quo-Bias", "Technological Fix Bias", "Komplexitätsreduktion"],
    triggers: ["Angst vor Stromausfall", "Dunkelflaute", "Industrieverlust", "Kontrollverlust", "Technikstolz"],
    patterns: ["Einzelindikator als Gesamturteil", "Zeitfenster ausblenden", "Kosten ausblenden", "Transmutation-Joker", "Opportunitätskosten unsichtbar machen"],
    why: "Kernkraft bietet psychologisch ein starkes Versprechen: viel Energie, wenig CO₂, große Technik und scheinbare Kontrolle. Dadurch erscheint sie einfacher, obwohl sie institutionell, finanziell und sicherheitlich hochkomplex ist.",
  },
  "fusion-loest-das-energieproblem": {
    effects: ["Optimismusbias", "Gegenwartsbias", "Technikwunder-Aufschub"],
    triggers: ["Hoffnung", "Aufschubentlastung", "Erlösungsversprechen"],
    patterns: ["Potenzial mit Wirkung verwechseln", "Zeitpfad verschieben", "heutige Lösungen entwerten"],
    why: "Eine mögliche Zukunftstechnologie nimmt Druck aus heutigen Entscheidungen, obwohl heutige Emissionen weiter wirken.",
  },
};

function psychologyForClaim(claim) {
  return psychologyBySlug[claim.slug] || {
    effects: ["Kognitive Dissonanz", "Bestätigungsfehler", "Reaktanz"],
    triggers: [claim.narrativeFamilies?.[0] || "Narrativdruck", claim.summary?.problem || "Denkfehler", "Handlungsabwehr"],
    patterns: ["wahren Kern überdehnen", "Folgekosten ausblenden", "Wirkungsfrage verschieben"],
    why: "Der Frame bietet schnelle emotionale Entlastung und macht eine komplexe Wirkungsfrage scheinbar einfacher.",
  };
}

function renderPsychologyModule(claim) {
  const profile = psychologyForClaim(claim);
  return `<section class="section section-soft deep-dive-section" id="psychologischer-wirkungscheck">
        <div>
          <div class="section-header"><p class="hero-kicker">Psychologischer Wirkungscheck</p><h2>Warum der Frame hängen bleibt.</h2><p>${escapeHtml(psychologyNotice)}</p></div>
          <div class="card-grid three">
            <article class="card"><p class="card-kicker">Kognitive Effekte</p>${htmlList(profile.effects)}</article>
            <article class="card"><p class="card-kicker">Emotionale Trigger</p>${htmlList(profile.triggers)}</article>
            <article class="card"><p class="card-kicker">Gesprächsmuster</p>${htmlList(profile.patterns)}</article>
          </div>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Warum es wirkt</p><p class="card-text">${escapeHtml(profile.why)}</p></article>
            <article class="card"><p class="card-kicker">Kommunikative Kontrolle zurückgewinnen</p><h3 class="card-title">Gefühl anerkennen. Frame halten. Wirkungsfrage stellen.</h3>${htmlList(hostControlSteps)}<p class="card-text"><strong>Standardsatz:</strong> Ich sehe den emotionalen Punkt. Aber ich trenne Gefühl, Fakt und Folgerung.</p></article>
          </div>
        </div>
      </section>`;
}

function renderHostControlModule() {
  return `<section class="section section-soft" id="kommunikative-kontrolle"><div><div class="section-header"><p class="hero-kicker">Live-Kompetenz</p><h2>Kommunikative Kontrolle zurückgewinnen.</h2><p>Oberhand bedeutet hier nicht Dominanz, sondern Frame-Kontrolle: ruhig bleiben, Mechanismus sichtbar machen und zur prüfbaren Wirkung zurückführen.</p></div><div class="card-grid two"><article class="card"><p class="card-kicker">Ablauf</p>${htmlList(hostControlSteps)}</article><article class="card"><p class="card-kicker">Formel</p><h3 class="card-title">Gefühl anerkennen. Frame halten. Wirkungsfrage stellen.</h3><p class="card-text">Ich beantworte das, aber ich übernehme nicht den Frame.</p><p class="card-text">Ich sehe den emotionalen Punkt. Aber ich trenne Gefühl, Fakt und Folgerung.</p></article></div></div></section>`;
}

function renderPsychologicalStoeckchenChecklist() {
  return `<section class="section" id="psychologische-stoeckchen"><div><div class="section-header"><p class="hero-kicker">Checkliste</p><h2>Woran erkenne ich psychologische Stöckchen?</h2></div>${summaryGrid([["Emotion vor Klärung", "Wut, Angst oder Kränkung soll schneller sein als Prüfung.", "warning"], ["Falsche Voraussetzung", "Die Frage enthält bereits den Frame.", "critical"], ["Beweislastumkehr", "Du sollst endlos widerlegen, statt der Claim belegt wird.", "warning"], ["Themenverschiebung", "Nach jeder Klärung kommt der nächste Vorwurf.", "warning"], ["Identitätsfalle", "Widerspruch soll wie Angriff auf Zugehörigkeit wirken.", "critical"], ["Host-Satz", "Ich reagiere nicht auf den Köder, sondern auf den Mechanismus.", "positive"]], "Psychologische Stöckchen", "stoeckchen-warning-grid")}</div></section>`;
}

function deepDiveLiveLink(claim) {
  if (!deepDiveDetailFor(claim)) return "";
  return `<section class="section section-soft deep-dive-live-link" aria-labelledby="deep-dive-link-${escapeHtml(claim.slug)}">
        <div class="card">
          <p class="card-kicker">Deep Dive</p>
          <h2 class="card-title" id="deep-dive-link-${escapeHtml(claim.slug)}">Ausführliche Wirkungsanalyse.</h2>
          <p class="card-text">Die Detailseite trennt Faktenkern, Ausblendungen, Evidenz, Wirkstoff, Wirkungspfad und wirkungsökonomische Lösung.</p>
          <p><a class="btn btn-primary" href="../../detail/${escapeHtml(claim.slug)}/">Detailanalyse öffnen</a></p>
        </div>
      </section>`;
}

function isComplexYaml(value) {
  return value && typeof value === "object";
}

function yamlScalar(value) {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value == null) return "null";
  return JSON.stringify(value);
}

function toYaml(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return `\n${value
      .map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const entries = Object.entries(item);
          const [firstKey, firstValue] = entries[0];
          const first = isComplexYaml(firstValue)
            ? `${pad}- ${firstKey}:${toYaml(firstValue, indent + 4)}`
            : `${pad}- ${firstKey}: ${yamlScalar(firstValue)}`;
          const rest = entries
            .slice(1)
            .map(([key, entryValue]) =>
              isComplexYaml(entryValue)
                ? `${" ".repeat(indent + 2)}${key}:${toYaml(entryValue, indent + 4)}`
                : `${" ".repeat(indent + 2)}${key}: ${yamlScalar(entryValue)}`
            );
          return [first, ...rest].join("\n");
        }
        return isComplexYaml(item) ? `${pad}-${toYaml(item, indent + 2)}` : `${pad}- ${yamlScalar(item)}`;
      })
      .join("\n")}`;
  }
  if (value && typeof value === "object") {
    return `\n${Object.entries(value)
      .map(([key, item]) =>
        isComplexYaml(item) ? `${pad}${key}:${toYaml(item, indent + 2)}` : `${pad}${key}: ${yamlScalar(item)}`
      )
      .join("\n")}`;
  }
  return yamlScalar(value);
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function pageShell({ title, description, canonical, base, main, searchType = "Klima & Energie", assetVersion = ASSET_VERSION }) {
  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="search_section" content="Wirkungsradar">
    <meta name="search_type" content="${escapeHtml(searchType)}">
    <link rel="canonical" href="${escapeHtml(canonical)}">
    <link rel="icon" href="${base}assets/img/brand/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="${base}assets/css/style.css?v=${escapeHtml(assetVersion)}">
  </head>
  <body>
    <header class="site-header" data-search-exclude>
      <a class="brand" href="${base}index.html" aria-label="Wirkungsökonomie Startseite">
        <span class="brand-mark"><img src="${base}assets/img/brand/signet.svg" alt="Wirkungsökonomie Logo"></span>
        <span class="brand-name">Wirkungsökonomie</span>
      </a>
      <button class="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-icon" aria-hidden="true">☰</span>
        <span class="sr-only">Menü</span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Hauptnavigation" data-search-exclude>
        <a href="${base}index.html" data-nav-match="index.html">Start</a>
        <a href="${base}verstehen.html" data-nav-match="verstehen.html|wirkungsoekonomie.html|wirkungsoekonomie/|verstehen/">Verstehen</a>
        <a href="${base}so-wirkt-wirkungsoekonomie/" data-nav-match="so-wirkt-wirkungsoekonomie/">So wirkt WÖk</a>
        <a href="${base}wirkungsfelder/" data-nav-match="wirkungsfelder/">Wirkungsfelder</a>
        <a href="${base}werkzeuge/" data-nav-match="werkzeuge/">Methoden &amp; Werkzeuge</a>
        <a href="${base}erleben/" data-nav-match="erleben/">Erleben</a>
        <a href="${base}akademie.html" data-nav-match="akademie.html|akademie/">Akademie</a>
        <a href="${base}downloads.html" data-nav-match="downloads.html|downloads/">Bibliothek</a>
        <a href="${base}mitmachen.html" data-nav-match="mitmachen.html|mitmachen/">Mitmachen</a>
        <a href="${base}suche.html" data-nav-match="suche.html">Suche</a>
      </nav>
    </header>
${main}
    <footer class="footer" data-search-exclude>
      <div class="footer-grid">
        <div>
          <p class="hero-kicker">Wirkungsökonomie</p>
          <h2>Die neue Ordnung des Wohlstands</h2>
          <p>Website der Wirkungsökonomie: ein Gesellschafts- und Wirtschaftsmodell, das Wirkung auf Mensch, Planet und Demokratie sichtbar macht.</p>
          <p>Kontakt: <a class="text-link" href="mailto:impact@wirkungsoekonomie.org">impact@wirkungsoekonomie.org</a></p>
        </div>
        <a class="btn btn-primary" href="${base}kompass.html">WÖk-Kompass öffnen</a>
      </div>
    </footer>
    <script src="${base}assets/js/main.js?v=${escapeHtml(assetVersion)}"></script>
  </body>
</html>
`;
}

function topicSubnav(current, baseToRadar = "../") {
  const links = [
    ["Überblick", "../"],
    ["Methode", "../methode/"],
    ["Wissen", "../wissen/"],
    ["Live", "../live/"],
    ["Narrative", "../narrative/"],
    ["Psychologie", "../psychologie/"],
    ["Themen", "../themen/"],
    ["Detail", "../detail/"],
    ["Was er nicht ist", "../was-der-wirkungsradar-nicht-ist/"],
  ];
  return `<nav class="topic-subnav" aria-label="Wirkungsradar Navigation" data-search-exclude>
${links
  .map(([label, href]) => `        <a href="${baseToRadar}${href}"${label === current ? ' aria-current="page"' : ""}>${label}</a>`)
  .join("\n")}
      </nav>`;
}

function summaryGrid(items, label, className = "") {
  return `<div class="radar-summary-grid ${className}" aria-label="${escapeHtml(label)}">
${items
  .map(([itemLabel, value, tone = "neutral"]) => `          <article class="radar-summary-item" data-tone="${escapeHtml(tone)}"><p class="radar-summary-label">${escapeHtml(itemLabel)}</p><p class="radar-summary-value">${escapeHtml(value)}</p></article>`)
  .join("\n")}
        </div>`;
}

function factStatusBadge() {
  return `<section class="section section-soft fact-status-badge" aria-labelledby="fact-status">
        <div class="card">
          <p class="card-kicker">Faktenstand</p>
          <h2 class="card-title" id="fact-status">Datenstand: ${UPDATED_AT}</h2>
          <p class="card-text"><strong>Update-Frequenz:</strong> quartalsweise. ${escapeHtml(factStatus.warning)}</p>
          <ul class="clean-list">
            ${factStatus.update_triggers.map((trigger) => `<li>${escapeHtml(trigger)}</li>`).join("\n            ")}
          </ul>
        </div>
      </section>`;
}

function methodBox() {
  return `<section class="section section-soft climate-method-box" aria-labelledby="climate-method">
        <div class="card">
          <p class="card-kicker">Methodik</p>
          <h2 class="card-title" id="climate-method">Nicht nur Faktencheck, sondern Wirkungscheck.</h2>
          <ol class="radar-mini-flow">
            ${methodChecklist.map((step) => `<li>${escapeHtml(step)}</li>`).join("\n            ")}
          </ol>
        </div>
      </section>`;
}

function evidenceStack(selectedLabels = []) {
  const sources = selectedLabels.length ? selectedLabels.map(slugSource) : sourcePack.primary_sources.slice(0, 5);
  return `<section class="section evidence-stack" aria-labelledby="evidence-stack">
        <div>
          <div class="section-header"><p class="hero-kicker">EvidenceStack</p><h2 id="evidence-stack">Quellen und Prüfstand.</h2></div>
          <div class="card-grid">
            ${sources
              .map(
                (source) => `<article class="card">
              <p class="card-kicker">${escapeHtml(source.type)} · ${escapeHtml(source.publisher)}</p>
              <h3 class="card-title">${escapeHtml(source.label)}</h3>
              <p class="card-text">${escapeHtml(source.use_for.join(" / "))}</p>
              <p><a class="text-link" href="${escapeHtml(source.url)}">Quelle öffnen</a></p>
            </article>`
              )
              .join("\n            ")}
          </div>
        </div>
      </section>`;
}

function woekSolutionMatrix(items) {
  return `<section class="section woe-k-solution-matrix" aria-labelledby="woek-solution">
        <div>
          <div class="section-header"><p class="hero-kicker">WÖk-Lösung</p><h2 id="woek-solution">Von Sichtbarkeit zu Rückkopplung.</h2></div>
          <div class="card-grid">
            ${items
              .map((item) => {
                const title = typeof item === "string" ? item : item.title;
                const text = typeof item === "string" ? "" : item.text;
                const textHtml = text ? `\n              <p class="card-text">${escapeHtml(text)}</p>` : "";
                return `<article class="card">
              <p class="card-kicker">Wirkungsökonomische Lösung</p>
              <h3 class="card-title">${escapeHtml(title)}</h3>${textHtml}
            </article>`;
              })
              .join("\n            ")}
          </div>
        </div>
      </section>`;
}

function internalLinks() {
  return `<section class="section section-soft" aria-labelledby="internal-links">
        <div class="card">
          <p class="card-kicker">Interne Links</p>
          <h2 class="card-title" id="internal-links">Glossar, Narrative und WÖk-Grundlagen.</h2>
          <div class="radar-link-cluster">
            ${glossaryLinks.map(([slug, label]) => `<a href="../../../begriffe/${slug}/" data-glossary-key="${escapeHtml(slug)}">${escapeHtml(label)}</a>`).join("\n            ")}
            <a href="../../narrative/ohnmacht/">Ohnmacht</a>
            <a href="../../narrative/verzoegerung/">Verzögerung</a>
            <a href="../../narrative/scheiternsframe/">Scheiternsframe</a>
            <a href="../../narrative/technikwunder-aufschub/">Technikwunder-Aufschub</a>
            <a href="../../narrative/kontrollverlust/">Kontrollverlust</a>
            <a href="../../narrative/wissenschaftsdelegitimierung/">Wissenschaftsdelegitimierung</a>
            <a href="../../narrative/whataboutism/">Whataboutism</a>
            <a href="../../../werkzeuge/woek-ids/">WÖk-IDs</a>
            <a href="../../../werkzeuge/reverse-merit-order/">Reverse Merit Order</a>
            <a href="../../../werkzeuge/wirkungssteuergesetz/">Wirkungssteuer</a>
            <a href="../../../werkzeuge/wirkungsrat/">Wirkungsrat</a>
            <a href="../../../werkzeuge/t-sroi/">T-SROI</a>
            <a href="../../../begriffe/digitaler-produktpass/">Digitaler Produktpass</a>
          </div>
          <p class="card-text"><strong>Nichtkompensation:</strong> Das kritischste Wirkungsfeld begrenzt die Gesamtbewertung; gute Klimawerte verdecken keine sozialen, ökologischen oder demokratischen Schäden.</p>
        </div>
      </section>`;
}

function renderClaimAnatomy(detail) {
  const anatomy = detail.claimAnatomy;
  return `<section class="section deep-dive-section" id="aussage">
        <div>
          <div class="section-header"><p class="hero-kicker">ClaimAnatomy</p><h2>Aussage zerlegen.</h2></div>
          <div class="deep-dive-definition-grid">
            <article class="card" data-tone="neutral"><p class="card-kicker">Originalaussage</p><h3 class="card-title">${escapeHtml(anatomy.original)}</h3></article>
            <article class="card" data-tone="warning"><p class="card-kicker">Erweiterter Frame</p><h3 class="card-title">${escapeHtml(anatomy.extended)}</h3></article>
            <article class="card" data-tone="positive"><p class="card-kicker">Wahrer Kern</p><p class="card-text">${escapeHtml(anatomy.trueCore)}</p></article>
            <article class="card" data-tone="critical"><p class="card-kicker">Was fehlt?</p><p class="card-text">${escapeHtml(anatomy.missingContext)}</p></article>
            <article class="card deep-dive-wide-card" data-tone="critical"><p class="card-kicker">Falsche Schlussfolgerung</p><h3 class="card-title">${escapeHtml(anatomy.falseConclusion)}</h3></article>
          </div>
        </div>
      </section>`;
}

function renderEvidenceAssessment(detail) {
  const sources = deepDiveSources(detail);
  return `<section class="section section-soft deep-dive-section" id="faktenlage">
        <div>
          <div class="section-header"><p class="hero-kicker">EvidenceAssessment</p><h2>Faktenlage und Unsicherheit.</h2></div>
          ${summaryGrid([
            ["Evidenzstatus", detail.evidence.status, "positive"],
            ["Vertrauensniveau", detail.evidence.level, detail.confidence === "hoch" ? "positive" : "warning"],
            ["Unsicherheit", detail.evidence.uncertainty, "warning"],
          ], "Evidence Assessment", "deep-dive-inline-summary")}
          <div class="card-grid deep-dive-source-mini-grid">
            ${sources
              .map(
                (source) => `<article class="card">
              <p class="card-kicker">${escapeHtml(source.type)}</p>
              <h3 class="card-title">${escapeHtml(source.label)}</h3>
              <p class="card-text">${escapeHtml(source.relevance.join(" / "))}</p>
              <p><a class="text-link" href="${escapeHtml(source.url)}">Quelle öffnen</a></p>
            </article>`
              )
              .join("\n            ")}
          </div>
        </div>
      </section>`;
}

function renderWirkungOrders(detail) {
  return `<section class="section deep-dive-section" id="wirkungsordnung">
        <div>
          <div class="section-header"><p class="hero-kicker">WirkungOrders</p><h2>Wirkung erster, zweiter und dritter Ordnung.</h2></div>
          <div class="card-grid three deep-dive-order-grid">
            ${detail.orders
              .map(
                ([label, text], index) => `<article class="card">
              <p class="card-kicker">${String(index + 1).padStart(2, "0")}</p>
              <h3 class="card-title">${escapeHtml(label)}</h3>
              <p class="card-text">${escapeHtml(text)}</p>
            </article>`
              )
              .join("\n            ")}
          </div>
        </div>
      </section>`;
}

function renderBatteryAudit(detail) {
  if (!detail.batteryAudit) return "<!-- no battery audit -->";
  return `<section class="section section-soft deep-dive-section" id="akku-faktencheck">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Akku-Faktencheck</p>
            <h2>Batterieargumente nicht wegwischen, sondern sauber bilanzieren.</h2>
            <p>Der Akku-Frame wirkt stark, weil er reale Probleme benennt. Die Gegenstrategie ist nicht Beschwichtigung, sondern Präzision: Welche Batterie, welcher Strom, welche Nutzung, welches Recycling und welcher Vergleichspfad?</p>
          </div>
          <div class="dossier-matrix-wrap">
            <table class="dossier-matrix">
              <caption>Akku- und E-Auto-Prüfmatrix</caption>
              <thead><tr><th>Prüffeld</th><th>Was heute dazugehört</th><th>Wirkungsökonomische Prüfung</th></tr></thead>
              <tbody>
                ${detail.batteryAudit.map(([field, context, check]) => `<tr><th scope="row">${escapeHtml(field)}</th><td>${escapeHtml(context)}</td><td>${escapeHtml(check)}</td></tr>`).join("\n                ")}
              </tbody>
            </table>
          </div>
        </div>
      </section>`;
}

const evEverydayChargingMatrix = [
  ["Zuhause", "über Nacht laden", "entlastet öffentliche Infrastruktur, niedrige Standzeitkosten"],
  ["Arbeitsplatz", "während der Arbeitszeit laden", "Pendelverkehr wird planbar elektrifiziert"],
  ["Supermarkt", "15-30 Minuten während Einkauf", "Laden wird in Alltagszeit integriert"],
  ["Baumarkt / Möbelhaus", "längere Einkaufsdauer", "gute Standzeit für Schnellladen"],
  ["Einkaufszentrum / Innenstadt", "Parkdauer 30-120 Minuten", "Laden wird Teil von Aufenthaltszeit"],
  ["Parkhaus", "längere Standzeit", "ideal für AC- und moderate DC-Ladepunkte"],
  ["Hotel / Gastronomie", "Aufenthalt / Übernachtung", "Reise- und Tourismusmobilität wird einfacher"],
  ["Autobahn-Ladepark", "Langstrecke", "hohe Ladeleistung, kurze Pausen, Fernverkehr"],
  ["Logistikdepot", "Nacht / Schichtwechsel", "E-Transporter und E-Lkw planbar laden"],
  ["Rast- und Ruheplätze für Lkw", "gesetzliche Pausen", "Megawattladen kann Pausenzeit nutzen"],
];

const evInfrastructureBoundaries = [
  ["Ladeinfrastruktur", "Wo und wie wird geladen?", "Alltagstauglichkeit, Langstrecke, Verfügbarkeit", "Strommix, Netzanschluss, Fahrzeuggröße"],
  ["Ladeleistung", "Wie schnell kann im passenden Zeitfenster Energie nachgeladen werden?", "Langstrecken- und Logistikfähigkeit", "reale Ladekurve, Standortauslastung"],
  ["Depotlogik", "Können Flotten planbar im Stand laden?", "E-Transporter, Busse, regionale Lkw", "öffentliche Ladeinfrastruktur"],
  ["Alltagsintegration", "Kann Laden nebenbei passieren?", "Supermarkt, Baumarkt, Arbeit, Parkhaus", "Fernverkehr und Logistik"],
  ["Netz- und Standortwirkung", "Welche Netzanschlüsse, Speicher und Laststeuerung braucht es?", "Systemkosten, Resilienz, Standortplanung", "Fahrzeugvergleich allein"],
  ["Logistikarchitektur", "Passen Ladefenster zu Touren, Pausen und Hubs?", "E-Lkw-Wirkung", "Pkw-Perspektive"],
];

const evChargingSubclaims = [
  ["„Laden dauert viel zu lange“", "Kommt auf Ladeort, Ladefenster und Ladeleistung an.", "Langsames Laden kann unpraktisch sein, wenn Standort, Leistung und Fahrzeug nicht passen. Was fehlt: Viele Fahrzeuge stehen lange genug, sodass Laden nebenbei passiert. Langstrecke braucht Schnellladen, Logistik braucht Depot- und Megawattladen.", "Laden ist nicht immer Tanken. Im Alltag lädt man oft, während das Auto ohnehin steht. Auf Langstrecke zählt Schnellladen, beim Lkw zählt das passende Ladefenster."],
  ["„Es gibt nicht genug Ladepunkte“", "Regional unterschiedlich; Ausbau, Leistung, Verfügbarkeit und Standortqualität zählen.", "Lücken, defekte Säulen, Preischaos und regionale Unterschiede sind reale Akzeptanzprobleme. Entscheidend sind nicht nur Anzahl, sondern Leistung, Zuverlässigkeit, Standort, Bezahlung und Alltagseinbettung.", "Die richtige Frage ist nicht nur: Wie viele Ladepunkte gibt es? Sondern: Wo stehen sie, wie schnell sind sie, funktionieren sie, und passen sie zum Alltag?"],
  ["„E-Lkw funktionieren nicht“", "Pauschal falsch. Es kommt auf Route, Nutzlast, Ladefenster, Depot, Strompreis und Megawatt-Infrastruktur an.", "Fernverkehr mit schweren Lkw braucht hohe Ladeleistung und gute Planung. Viele Flotten laden im Depot. Für Langstrecke entstehen MCS- und HPC-Korridore. Fahrerpausen und Ladefenster können zusammenfallen.", "E-Lkw sind kein Pkw mit größerem Akku. Sie brauchen eine andere Infrastruktur: Depotladen, Logistikhubs, Megawattladen und Routenplanung."],
  ["„Das Netz bricht zusammen“", "Falscher Totalframe. Netzanschlüsse, Lastmanagement, Speicher, variable Tarife und Standortplanung entscheiden.", "Viele Schnellladepunkte brauchen lokale Netzleistung und Planung. Was fehlt: Laden ist steuerbar. Fahrzeuge stehen lange. Lastmanagement, Speicher, PV-Dächer, Netzausbau und zeitvariable Tarife können Lasten verschieben.", "Das Netz muss geplant werden. Aber Laden ist steuerbar - anders als viele andere Verbraucher. Entscheidend sind Lastmanagement, Speicher und gute Standortplanung."],
];

const evInfrastructureSources = [
  ["Bundesnetzagentur - öffentliche Ladeinfrastruktur Deutschland", "Zum 1. April 2026 waren 149.002 Normalladepunkte und 51.253 Schnellladepunkte im Ladesäulenregister enthalten; insgesamt standen 8,50 GW Ladeleistung bereit.", "Aktueller Faktenblock zum Ladeinfrastrukturausbau in Deutschland.", "Registerdaten enthalten auch Meldungen aus noch nicht abgeschlossenen Anzeigeverfahren.", "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/E-Mobilitaet/start.html"],
  ["Deutschlandnetz - HPC-Schnellladepunkte", "Rund 9.000 zusätzliche HPC-Schnellladepunkte an mehr als 1.000 Standorten.", "Autobahn- und Flächenabdeckung für Pkw und Transporter.", "Deutschlandnetz ergänzt private und andere öffentliche Ladepunkte.", "https://www.deutschlandnetz.de/standorte"],
  ["BMV - Deutschlandnetz", "Das Deutschlandnetz soll Schnellladeinfrastruktur in Regionen und an Autobahnen ergänzen.", "Politische Einordnung des Ladeinfrastruktur-Ausbaus.", "Tatsächliche Standortqualität, Verfügbarkeit und Preisgestaltung separat prüfen.", "https://bmdv.bund.de/SharedDocs/DE/Artikel/G/deutschlandnetz.html"],
  ["IEA - EV charging infrastructure", "Die IEA beschreibt den schnellen Ausbau öffentlicher und schneller Ladeinfrastruktur als zentralen Teil wachsender Elektromobilität.", "Internationaler Kontext für Ladepunkte, Schnellladen und Infrastrukturbedarf.", "Internationale Trends ersetzen keine lokale Standortprüfung.", "https://www.iea.org/reports/global-ev-outlook-2024/trends-in-electric-vehicle-charging"],
  ["EU AFIR - Alternative Fuels Infrastructure Regulation", "Mindestziele für Ladeinfrastruktur im TEN-T-Netz und Vorgaben zu Nutzerfreundlichkeit, Zahlung und Preistransparenz.", "Einordnung, dass Ladeinfrastruktur regulatorisch geplant wird.", "Nationale Umsetzung und tatsächliche Standortqualität separat prüfen.", "https://transport.ec.europa.eu/transport-themes/clean-transport/alternative-fuels-sustainable-mobility-europe/alternative-fuels-infrastructure_en"],
  ["CharIN - Megawatt Charging System", "MCS wurde für schnelles Hochleistungsladen schwerer Elektrofahrzeuge wie Lkw und Busse entwickelt.", "E-Lkw, Busse, Schwerlastverkehr, Ladezeit.", "Technologie und Standardisierung weiter beobachten.", "https://www.charin.global/technology/mcs/"],
  ["HoLa - Hochleistungsladen Lkw", "Für bis zu 360 km in 4,5 Stunden werden etwa 400 kWh genannt; MCS erlaubt bis zu 3,75 MW, erste Stationen eher bis 1 MW.", "Rechenbeispiele zu E-Lkw, Ladezeit und Pausenlogik.", "Projekt- und Annahmenkontext beachten.", "https://hochleistungsladen-lkw.de/hola-en/results/megawatt_charging_networks.php"],
  ["EU - Lenk- und Ruhezeiten", "Nach 4,5 Stunden Fahrzeit ist grundsätzlich eine Pause von mindestens 45 Minuten vorgeschrieben.", "Warum E-Lkw-Laden in gesetzliche Pausenfenster integriert werden kann.", "Konkrete Transportplanung hängt von Tour, Beladung, Betrieb und Rechtsrahmen ab.", "https://europa.eu/youreurope/business/human-resources/transport-sector-workers/road-transportation-workers/index_en.htm"],
];

function renderEvChargingInfrastructure(detail) {
  if (!detail.evInfrastructure) return "<!-- no EV infrastructure module -->";
  return `<section class="section section-soft deep-dive-section" id="ladeinfrastruktur">
        <div>
          <div class="section-header">
            <p class="hero-kicker">Ladeinfrastruktur</p>
            <h2>Laden ist nicht Tanken: Warum die alte Tankstellenlogik täuscht.</h2>
            <p>Viele Einwände gegen Elektromobilität übernehmen unbewusst die Logik des Verbrenners: Man fährt leer, sucht eine Tankstelle, füllt in wenigen Minuten nach und fährt weiter. Elektromobilität funktioniert anders. Ein großer Teil des Ladens passiert dort, wo Fahrzeuge ohnehin stehen.</p>
            <p><strong>Kernsatz:</strong> Die beste Ladeinfrastruktur ist nicht nur dort, wo man extra hinfährt, sondern dort, wo Menschen und Fahrzeuge ohnehin Zeit verbringen.</p>
          </div>
          <div class="dossier-matrix-wrap">
            <table class="dossier-matrix">
              <caption>Alltagslade-Matrix</caption>
              <thead><tr><th>Ladeort</th><th>Typische Nutzung</th><th>Wirkung</th></tr></thead>
              <tbody>${evEverydayChargingMatrix.map(([place, use, effect]) => `<tr><th scope="row">${escapeHtml(place)}</th><td>${escapeHtml(use)}</td><td>${escapeHtml(effect)}</td></tr>`).join("")}</tbody>
            </table>
          </div>
          <section class="section deep-dive-section" id="alltagsladen"><div class="section-header"><p class="hero-kicker">Alltagsladen</p><h2>Schnellladen dort, wo Alltag passiert.</h2><p>Supermärkte, Baumärkte, Einkaufszentren, Parkhäuser und Freizeitstandorte können Ladeangst senken, weil Laden als Nebenbei-Vorgang statt Zusatztermin erlebt wird. Entscheidend sind Sichtbarkeit, einfache Nutzung, Barrierearmut, Zuverlässigkeit, Preisfairness, verfügbare Ladeleistung und Aufenthaltsqualität.</p></div></section>
          <section class="section deep-dive-section" id="e-lkw-megawattladen"><div class="section-header"><p class="hero-kicker">E-Lkw &amp; Megawattladen</p><h2>Warum Megawattladen die Logistik verändert.</h2><p>Elektromobilität endet nicht beim Pkw. Lieferverkehr, Busse, Transporter und schwere Lkw brauchen andere Ladearchitektur: Depotladen, Logistikhubs, Hafenstandorte, Rastanlagen, Ladeparks, größere Rangierflächen, Buchbarkeit, Netzanschlüsse und Sicherheit. Beim E-Lkw entscheidet nicht nur die Batteriegröße. Es entscheidet die Logistikarchitektur: Depot, Route, Pause, Ladeleistung, Netzanschluss und Planung.</p></div></section>
          <div class="card-grid two">
            <article class="formula-box"><p class="card-kicker">Ladezeit verstehen</p><h3>kW, kWh und Ladefenster</h3><p><strong>kWh</strong> ist die Energiemenge. <strong>kW</strong> ist die Ladeleistung.</p><p><strong>Ladezeit grob = benötigte Energiemenge ÷ durchschnittliche Ladeleistung</strong></p><p>40 kWh bei 150 kW ≈ 16 Minuten<br>60 kWh bei 200 kW ≈ 18 Minuten<br>400 kWh bei 1 MW ≈ 24 Minuten<br>400 kWh bei 700 kW ≈ 34 Minuten</p><p>Vereinfachte Faustwerte; reale Ladezeiten hängen von Ladekurve, Fahrzeug, Temperatur, Auslastung und Ladezustand ab.</p></article>
            <article class="formula-box"><p class="card-kicker">Systemgrenze</p><h3>Fahrzeug + Infrastruktur</h3><p>Die relevante Frage ist nicht nur maximale Ladeleistung, sondern durchschnittliche Ladeleistung im passenden Ladefenster. Hohe Leistung ist vor allem für Langstrecke und Logistik relevant; im Alltag reicht oft längere Standzeit.</p></article>
          </div>
          <div class="term-link-grid" aria-label="Glossar zur Ladeinfrastruktur">
            ${evGlossaryTerms.map(([slug, label]) => `<a href="/begriffe/${slug}/">${escapeHtml(label)}</a>`).join("")}
          </div>
          <div class="dossier-matrix-wrap">
            <table class="dossier-matrix">
              <caption>Zusätzliche Bilanzgrenzen: Fahrzeug plus Infrastruktur</caption>
              <thead><tr><th>Bilanzgrenze</th><th>Frage</th><th>Was sie zeigt</th><th>Was sie ausblenden kann</th></tr></thead>
              <tbody>${evInfrastructureBoundaries.map(([boundary, question, shows, hides]) => `<tr><th scope="row">${escapeHtml(boundary)}</th><td>${escapeHtml(question)}</td><td>${escapeHtml(shows)}</td><td>${escapeHtml(hides)}</td></tr>`).join("")}</tbody>
            </table>
          </div>
          <section class="section deep-dive-section" id="lade-unterclaims"><div class="section-header"><p class="hero-kicker">Häufige Zusatzbehauptungen</p><h2>Ladeinfrastruktur als Akkordeon.</h2></div><div class="radar-answer-accordion">${evChargingSubclaims.map(([title, judgement, context, answer]) => `<details class="radar-answer-item"><summary><span class="radar-answer-time">${escapeHtml(title)}</span> <span class="radar-answer-label">${escapeHtml(judgement)}</span></summary><p>${escapeHtml(context)}</p><p><strong>Live-Antwort:</strong> ${escapeHtml(answer)}</p></details>`).join("\n            ")}</div></section>
          ${summaryGrid([["Ladeleistung und Ladeverfügbarkeit", "Infrastruktur muss nutzbar, leistungsfähig und verfügbar sein.", "positive"], ["Netzanschluss- und Standortqualität", "Ladeparks brauchen skalierbare, resiliente Netzplanung.", "positive"], ["Megawattladen für Schwerlastverkehr", "MCS-Korridore, Hubs und Depots werden Teil der Logistikwirkung.", "positive"], ["Transparente Ladeinformationen", "Preis-, Verfügbarkeits- und Leistungsinformationen senken Ladeangst.", "positive"]], "E-Mobilität Infrastrukturindikatoren", "deep-dive-inline-summary")}
          ${sourceCards(evInfrastructureSources)}
          <article class="card dossier-conclusion-card"><p class="card-kicker">Abschluss</p><h3 class="card-title">Laden scheitert nicht daran, dass es anders ist als Tanken.</h3><p class="card-text">Elektromobilität gelingt, wenn Laden anders geplant wird: als Teil von Alltag, Arbeit, Logistik und Reise. Der Wirkungsradar bewertet deshalb nicht nur das Fahrzeug, sondern das ganze Mobilitätssystem.</p></article>
        </div>
      </section>`;
}

function renderEvIndustryPolicyLink(claim) {
  if (claim.slug !== "e-autos-schlimmer-als-verbrenner") return "";
  return `<section class="section section-soft" id="industriepolitik">
        <div class="card">
          <p class="card-kicker">Vom Fahrzeug zur Industriepolitik</p>
          <h2 class="card-title">E-Mobilität ist ein Standortthema.</h2>
          <p class="card-text">Die Frage ist nicht nur, ob ein einzelnes Auto besser ist. Entscheidend ist die ganze Wertschöpfungskette: Batteriezellen, Leistungselektronik, Ladeinfrastruktur, E-Lkw, Software, Recycling, Netze, Speicher und sauberer Industriestrom. Genau dort entscheidet sich, ob Deutschland neue Industriewertschöpfung aufbaut oder alte Abhängigkeiten verlängert.</p>
          <p><a class="btn btn-primary" href="/wirkungsradar/live/klimaschutz-deindustrialisiert-deutschland/">Zum Dossier: Klimaschutz deindustrialisiert Deutschland?</a></p>
        </div>
      </section>`;
}

function renderFalseActionAnalysis(detail) {
  return `<section class="section section-soft deep-dive-section" id="folgenanalyse">
        <div>
          <div class="section-header"><p class="hero-kicker">FalseActionAnalysis</p><h2>Folgen, wenn man der Aussage folgt.</h2></div>
          <div class="deep-dive-consequence-grid">
            ${detail.falseActions
              .map(
                ([label, text]) => `<article class="card">
              <p class="card-kicker">${escapeHtml(label)}</p>
              <p class="card-text">${escapeHtml(text)}</p>
            </article>`
              )
              .join("\n            ")}
          </div>
        </div>
      </section>`;
}

function renderCreatorExport(claim, detail) {
  const answers = expandedAnswers(claim);
  return `<section class="section deep-dive-section" id="creator-export">
        <div>
          <div class="section-header"><p class="hero-kicker">CreatorExportBox</p><h2>Antworten und Social Hooks.</h2></div>
          <div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge">
            <details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">Kurzantwort · ${words(answers.ten_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.ten_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">Einordnung · ${words(answers.thirty_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.thirty_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">Lange Antwort · ${words(answers.two_minutes)} Wörter</span></summary><p>„${escapeHtml(answers.two_minutes)}“</p></details>
          </div>
          <div class="card-grid two deep-dive-export-grid">
            <article class="card"><p class="card-kicker">Clip Hook</p><h3 class="card-title">${escapeHtml(detail.clipHook)}</h3></article>
            <article class="card"><p class="card-kicker">Caption</p><p class="card-text">${escapeHtml(detail.caption)}</p></article>
          </div>
        </div>
      </section>`;
}

function renderSourceReliability(detail) {
  const sources = deepDiveSources(detail);
  return `<section class="section section-soft deep-dive-section" id="quellen">
        <div>
          <div class="section-header"><p class="hero-kicker">SourceReliabilityBox</p><h2>Quellen, Reliabilität und Datenstand.</h2></div>
          <div class="card-grid deep-dive-source-grid">
            ${sources
              .map(
                (source) => `<article class="card">
              <p class="card-kicker">${escapeHtml(source.type)}</p>
              <h3 class="card-title">${escapeHtml(source.label)}</h3>
              <p class="card-text"><strong>Geeignet für:</strong> ${escapeHtml(source.relevance.join(" / "))}</p>
              <p><a class="text-link" href="${escapeHtml(source.url)}">Originalquelle öffnen</a></p>
            </article>`
              )
              .join("\n            ")}
          </div>
          ${factStatusBadge()}
        </div>
      </section>`;
}

function renderStandardBox(id, title, text) {
  return `<section class="section section-soft deep-dive-standard-box" id="${escapeHtml(id)}">
        <div class="card">
          <p class="card-kicker">Standardbox</p>
          <h2 class="card-title">${escapeHtml(title)}</h2>
          <p class="card-text">${escapeHtml(text)}</p>
        </div>
      </section>`;
}

const industryKeyPoints = [
  ["Transformation gab es immer", "Industriegeschichte ist Strukturwandel: Kohle, Stahl, Chemie, Auto, Maschinenbau, Software, Halbleiter, KI. Die Frage ist nicht Wandel oder kein Wandel, sondern ob Deutschland ihn gestaltet.", "neutral"],
  ["Fossile Energie ist kein billiger Dauerzustand", "Gas, Kohle und Öl verursachen Brennstoffkosten, Importabhängigkeit, CO₂-Kosten, Preisschocks, geopolitische Risiken und Klimaschäden.", "warning"],
  ["Erneuerbare haben eine andere Kostenlogik", "Wind und Sonne brauchen hohe Anfangsinvestitionen, aber keine Brennstoffe. Die Kosten liegen vor allem in Infrastruktur, Finanzierung, Netzen, Speichern und Systemintegration.", "positive"],
  ["Neue Industrie entsteht um sauberen Strom", "Batteriezellen, Leistungselektronik, Halbleiter, Rechenzentren, Elektrolyse, E-Lkw, Ladeinfrastruktur, Wärmepumpen und Speicher brauchen günstigen, sauberen und verlässlichen Strom.", "positive"],
  ["Billige Erzeugung ist nicht automatisch billiger Endpreis", "Industriestrom hängt auch von Netzentgelten, Steuern, Abgaben, PPAs, Netzausbau, Speichern, Flexibilität, Standortnähe und Planungssicherheit ab.", "warning"],
  ["WÖk-Ziel ist Reindustrialisierung nach Wirkung", "Investitionen werden nach Netto-Wirkung, T-SROI, Systemresilienz, Standortqualität, Lieferketten, Energieeffizienz und Zukunftsfähigkeit bewertet.", "positive"],
];

const industryCostMatrix = [
  ["Photovoltaik", "hoch am Anfang", "sehr niedrig, kein Brennstoff", "gut dezentral, Dach/Freifläche, Speicher nötig"],
  ["Wind onshore", "hoch am Anfang", "niedrig, kein Brennstoff", "standortabhängig, Netze/Akzeptanz/Artenschutz wichtig"],
  ["Wind offshore", "sehr hoch", "niedriger Brennstoffanteil, höhere Wartung", "hohe Volllaststunden, Netzanbindung teuer"],
  ["Batteriespeicher", "CAPEX", "niedrige variable Kosten, Alterung", "verschiebt Strom, senkt Spitzen, erhöht Flexibilität"],
  ["Gas-Kraftwerk", "mittlerer CAPEX", "hohe variable Brennstoff- und CO₂-Kosten", "flexibel, aber import- und preisabhängig"],
  ["Kohlekraft", "hoher CAPEX / Bestand", "Brennstoff, CO₂, Umwelt- und Folgekosten", "geringe Flexibilität, hohe Emissionen"],
  ["Kernkraft neu", "sehr hoher CAPEX", "Betrieb, Personal, Sicherheit, Brennstoff, Rückbau, Entsorgung", "lange Bauzeit, hohes Finanzierungsrisiko, Grundlastlogik"],
  ["Erneuerbarer Industriepark", "CAPEX für Erzeugung, Speicher, Netze", "niedrige variable Energiekosten", "lokaler Standortvorteil durch Kopplung von Erzeugung und Verbrauch"],
];

const industryClusters = [
  ["Batteriezellen und Batteriematerialien", "Zellfertigung, Modul- und Packproduktion, Recycling, Second Life, Batteriepass, Kathoden-/Anodenmaterialien, Maschinenbau und Automatisierung."],
  ["Halbleiter und Leistungselektronik", "Chips für E-Mobilität, Industrie, Energieumwandlung, effiziente Rechenzentren, Netze, Wechselrichter, Sensorik und Automatisierung."],
  ["Ladeinfrastruktur und E-Lkw", "HPC-Ladeparks, Megawattladen, Depotladen, Netzanschluss, Speicher, Software, Bezahlung, Wartung und Standortbetrieb."],
  ["Erneuerbare Energie und Speicher", "PV, Wind, Wechselrichter, Batteriespeicher, Netztechnik, Transformatoren, Systemdienstleistungen und Flexibilität."],
  ["KI-Rechenzentren und digitale Infrastruktur", "Rechenzentren brauchen sauberen, verlässlichen Strom, Abwärmenutzung, Effizienz, Wasserstrategie, Netzanschluss und Datenhoheit."],
  ["Wasserstoff und Elektrolyse", "Grüner Wasserstoff für Stahl, Chemie, Raffinerien, Schwerindustrie, Langzeitspeicher und Prozesswärme - gezielt, nicht als Allzwecklösung."],
  ["Wärmepumpen und Gebäudetechnik", "Elektrifizierung von Wärme schafft Industrie für Komponenten, Steuerung, Installation, Wartung, Speicher und Netzintegration."],
  ["Kreislaufwirtschaft und Recycling", "Batterierecycling, Metallrückgewinnung, Kunststoffkreisläufe, Produktpässe, Rücknahme- und Reparatursysteme."],
  ["Maschinenbau für Transformationsindustrien", "Anlagen für Batterien, Chips, Elektrolyse, Recycling, Automatisierung, Robotik und Energieeffizienz."],
  ["Software, KI und Energiemanagement", "Lastmanagement, virtuelle Kraftwerke, Netzoptimierung, Predictive Maintenance, Energiedatenräume und Wirkungsdaten."],
];

const industryProjectCards = [
  ["PowerCo Salzgitter", "In Betrieb / Hochlauf", "Volkswagen/PowerCo hat im Dezember 2025 in Salzgitter die erste Unified-Cell-Produktion „made in Europe“ gestartet. Das stärkt europäische Batterietechnologie und industrielle Souveränität.", "Hochlauf, Nachfrage und Zellchemie weiter prüfen.", "Volkswagen/PowerCo - Salzgitter Gigafactory"],
  ["Tesla Grünheide", "Batteriezellproduktion angekündigt / prüfen", "Grünheide steht nicht nur für Fahrzeugmontage, sondern auch für die Frage, ob Batterietechnik, Zellfertigung und Zulieferketten in Deutschland industriell skaliert werden.", "Produktionsumfang, Zellchemie und Dauerhaftigkeit regelmäßig prüfen.", "Reuters - Tesla Batteriezellproduktion Grünheide"],
  ["CATL Arnstadt / Erfurter Kreuz", "Produktion seit 2023", "CATL betreibt in Thüringen eine Batteriezellfertigung und beliefert europäische Kunden. Das zeigt: Batterien sind nicht automatisch Importabhängigkeit, sondern können Teil europäischer Wertschöpfung sein.", "Aktuelle Kapazität und Auslastung regelmäßig prüfen.", "electrive - CATL production in Germany"],
  ["Heide / Northvolt / Lyten", "Projekt verändert", "Der Standort Heide zeigt Chance und Risiko europäischer Batteriezellfertigung: Erneuerbare Standortvorteile waren zentral, aber Finanzierung, Markt und Unternehmensrisiken entscheiden.", "Nicht als gesicherte ursprüngliche Northvolt-Gigafactory darstellen.", "electrive - Heide / Northvolt / Lyten"],
  ["ACC Kaiserslautern", "Pläne auf Eis / unsicher", "ACC zeigt, dass nicht jedes Transformationsprojekt gelingt. Genau deshalb braucht das Dossier eine nüchterne Standort- und Risikologik.", "Als Gegenbeispiel nutzen: Transformation ist real, aber kein Selbstläufer.", "Reuters - ACC drops German and Italian gigafactory plans"],
  ["ESMC Dresden", "Im Bau / Produktionsziel Ende 2027", "TSMC, Bosch, Infineon und NXP bauen über ESMC eine Halbleiterfabrik in Dresden. Geplant sind 40.000 300-mm-Wafer pro Monat und rund 2.000 direkte High-Tech-Jobs.", "Halbleiter brauchen nicht nur Strom, sondern Wasser, Fachkräfte, Zulieferer und Versorgungssicherheit.", "TSMC - ESMC Dresden"],
  ["Infineon Smart Power Fab Dresden", "Förderung genehmigt / Ausbau", "Infineon investiert in Dresden in eine Smart Power Fab und nennt Nachfrage aus Erneuerbaren, effizienten Rechenzentren und Elektromobilität als Treiber.", "Power-Halbleiter sind ein Schlüssel für Elektrifizierung und effiziente Energieumwandlung.", "Infineon - Smart Power Fab Dresden"],
  ["Bosch Dresden / Reutlingen", "Bestand und Ausbau", "Bosch betreibt in Dresden eine moderne 300-mm-Waferfabrik für Automotive- und Industrieanwendungen und erweitert weitere Halbleiterkapazitäten.", "Bestandsindustrie plus Transformation, nicht nur neue Gigaprojekte.", "Bosch - Wafer Fab Dresden"],
];

const dataCenterMatrix = [
  ["Sauberer Strom", "KI-Rechenzentren haben hohen Strombedarf.", "CO₂-Intensität, PPA, Grünstromqualität"],
  ["Netzanschluss", "Große Anschlussleistung nötig.", "Netzwirkung, Engpass, Flexibilität"],
  ["Abwärme", "Rechenzentren erzeugen Wärme.", "Nutzung für Quartiere, Gewerbe, Wärmenetze"],
  ["Wasser", "Kühlung kann Wasserbedarf erzeugen.", "Wasserstress, Kreislauf, Kühltechnik"],
  ["Effizienz", "PUE und Auslastung entscheiden.", "Energie pro Rechenleistung"],
  ["Digitale Souveränität", "Daten- und KI-Infrastruktur ist strategisch.", "SDG+, Datenschutz, Resilienz"],
  ["Regionale Wirkung", "Jobs, Gewerbesteuer, Wärme, Infrastruktur.", "T-SROI und Wirkungshaushalt"],
];

function industrySourceByLabel(label) {
  return sourcePack.primary_sources.find((source) => source.label === label) || slugSource(label);
}

function renderIndustryTable(caption, headers, rows) {
  return `<div class="dossier-matrix-wrap">
            <table class="dossier-matrix">
              <caption>${escapeHtml(caption)}</caption>
              <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
              <tbody>${rows.map((row) => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
          </div>`;
}

function renderIndustryProjectStatus() {
  return `<section class="section dossier-tab-panel" id="projektstatus">
        <div>
          <div class="section-header"><p class="hero-kicker">Projektstatus</p><h2>Batterie-, Halbleiter- und Infrastrukturprojekte nüchtern lesen.</h2><p>Status regelmäßig prüfen. Diese Karten sind keine sichere Erfolgsliste, sondern Beispiele für Chancen, Risiken und Standortbedingungen.</p></div>
          <div class="card-grid">${industryProjectCards.map(([title, status, text, note, sourceLabel]) => {
            const source = industrySourceByLabel(sourceLabel);
            return `<article class="card"><p class="card-kicker">${escapeHtml(status)}</p><h3 class="card-title">${escapeHtml(title)}</h3><p class="card-text">${escapeHtml(text)}</p><p class="card-text"><strong>Hinweis:</strong> ${escapeHtml(note)}</p><p><a class="text-link" href="${escapeHtml(source.url)}">Quelle öffnen</a></p></article>`;
          }).join("\n")}</div>
        </div>
      </section>`;
}

function renderIndustryUnderstandingSections() {
  return `<section class="section section-soft dossier-tab-panel" id="standort-energie-verstehen">
        <div>
          <div class="section-header"><p class="hero-kicker">Standort &amp; Energie verstehen</p><h2>Transformation ist Standortumbau.</h2><p>Das Deindustrialisierungsnarrativ wirkt stark, weil es reale Ängste aufgreift: Jobs, Wettbewerbsfähigkeit, Energiepreise, Standortverlust. Aber es setzt eine zu enge Systemgrenze. Es betrachtet Umbaukosten und Belastungen, blendet aber neue Wertschöpfung, vermiedene fossile Kosten, technologische Pfade, Versorgungssicherheit und Standortvorteile sauberer Energie aus.</p></div>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Kernsatz</p><h3 class="card-title">Der Industriestandort der Zukunft entsteht dort, wo Energie sauber, günstig, planbar, lokal verfügbar und systemisch integriert ist.</h3></article>
            <article class="card"><p class="card-kicker">Zweiter Kernsatz</p><h3 class="card-title">Erneuerbare Energie ist nicht nur Stromproduktion. Sie ist Standortinfrastruktur.</h3></article>
          </div>
        </div>
      </section>
      <section class="section dossier-tab-panel" id="was-stimmt"><div><div class="section-header"><p class="hero-kicker">Was stimmt?</p><h2>Der Transformationsdruck ist real.</h2></div>${htmlList(["Energieintensive Branchen stehen unter realem Kostendruck.", "Gaspreisschocks haben gezeigt, wie verletzlich fossile Abhängigkeit ist.", "Industriestrompreise hängen nicht nur von Erzeugungskosten ab, sondern auch von Netzentgelten, Steuern, Abgaben, Absicherung, Netzanschlüssen und Versorgungssicherheit.", "Netzausbau, Genehmigungen, Flächen, Fachkräfte und Kapital sind echte Engpässe.", "Nicht jedes Transformationsprojekt gelingt; einige Batterieprojekte wurden verschoben, verkleinert oder gestrichen.", "Internationale Konkurrenz durch China, USA, Frankreich, Skandinavien und Osteuropa ist real.", "Unternehmen brauchen Planungssicherheit, nicht nur Zielbilder."])}</div></section>
      <section class="section section-soft dossier-tab-panel" id="was-fehlt"><div><div class="section-header"><p class="hero-kicker">Was fehlt?</p><h2>Die fossile und industrielle Systemgrenze.</h2></div>${htmlList(["Fossile Energie hat hohe OPEX: Brennstoffförderung, Transport, Import, Preisrisiko, CO₂-Zertifikate, geopolitische Verwundbarkeit.", "Erneuerbare haben keine Brennstoffkosten und sehr niedrige variable Kosten.", "Viele Zukunftsindustrien brauchen explizit sauberen Strom: Batterien, Halbleiter, Rechenzentren, Elektrolyse, E-Lkw, Ladeparks, Wärmepumpen, Speicher, Leistungselektronik.", "Standortnähe kann Netz-, Transport- und Systemkosten senken, wenn Erzeugung, Verbrauch, Speicher, Wärme und Flexibilität gekoppelt werden.", "Industrie wird nicht nur durch Energiekosten bestimmt, sondern durch Ökosysteme: Fachkräfte, Zulieferer, Forschung, Genehmigungen, Infrastruktur, Kapital, Kunden, Rechtsstaatlichkeit, Daten- und Versorgungssicherheit.", "Klimaschutz ist nicht Zusatz, sondern Teil der neuen Wettbewerbsfähigkeit."])}<p class="formula-note"><strong>Kernsatz:</strong> Die falsche Frage lautet: Wie halten wir die alte Industrie billig? Die richtige Frage lautet: Wie machen wir Deutschland zum Standort der nächsten Industrie?</p></div></section>
      <section class="section dossier-tab-panel" id="capex-opex"><div><div class="section-header"><p class="hero-kicker">CAPEX / OPEX</p><h2>Warum Erneuerbare anders rechnen.</h2><p>CAPEX sind Investitionskosten: Bau, Anlagen, Netzanschluss, Planung, Finanzierung. OPEX sind Betriebskosten: Brennstoffe, Wartung, Personal, CO₂-Kosten, Transport, Entsorgung, Versicherungen, Sicherheits- und Systemkosten.</p></div>${renderIndustryTable("Kostenlogik-Matrix", ["Technologie / System", "CAPEX", "OPEX / variable Kosten", "Systemische Besonderheit"], industryCostMatrix)}<p class="formula-note"><strong>Kernsatz:</strong> Fossile Energie muss ständig gefördert, transportiert, gekauft und verbrannt werden. Wind und Sonne müssen gebaut, finanziert und integriert werden - aber sie stellen keine Brennstoffrechnung.</p></div></section>
      <section class="section section-soft dossier-tab-panel" id="standortnaehe"><div><div class="section-header"><p class="hero-kicker">Dezentralität und Standortnähe</p><h2>Strom dort erzeugen, wo Wirkung entsteht.</h2><p>Industrieparks, Gewerbegebiete, Supermärkte, Rechenzentren, Logistikhubs, Ladeparks, Wärmenetze, Kläranlagen, Speicher und kommunale Infrastruktur können zu Energie- und Wirkungsclustern werden. Dezentral heißt nicht netzlos: Auch ein dezentrales erneuerbares System braucht Netze, Speicher, Marktregeln, Flexibilität, Daten und Planung.</p></div>${htmlList(["PV auf Industrie- und Handelsdächern.", "Wind- und Solarparks in Nähe energieintensiver Verbraucher.", "Batteriespeicher an Netzengpässen, Ladeparks und Industrieparks.", "Abwärmenutzung von Rechenzentren für Quartiere und Gewerbe.", "Elektrolyse dort, wo erneuerbarer Überschuss und industrielle Nachfrage zusammentreffen.", "Ladeinfrastruktur an Supermärkten, Baumärkten, Autobahnen und Logistikhubs.", "Power Purchase Agreements für Industrie.", "Kommunale Beteiligung und lokale Wertschöpfung."])}</div></section>
      <section class="section dossier-tab-panel" id="industriecluster"><div><div class="section-header"><p class="hero-kicker">Neue Industriecluster</p><h2>Welche Industrien durch Transformation wachsen können.</h2></div><div class="card-grid">${industryClusters.map(([title, text]) => `<article class="card"><p class="card-kicker">Transformationscluster</p><h3 class="card-title">${escapeHtml(title)}</h3><p class="card-text">${escapeHtml(text)}</p></article>`).join("\n")}</div></div></section>
      ${renderIndustryProjectStatus()}
      <section class="section section-soft dossier-tab-panel" id="ki-rechenzentren"><div><div class="section-header"><p class="hero-kicker">KI-Rechenzentren</p><h2>Energie wird digitaler Standortfaktor.</h2><p>KI, Cloud und Dateninfrastruktur erhöhen den Strombedarf. Deshalb werden Rechenzentren zu einem Testfall für wirkungsökonomische Standortpolitik: Sie brauchen günstigen, zuverlässigen und zunehmend erneuerbaren Strom, hohe Effizienz, Abwärmenutzung, Netzanschlüsse, Wasserstrategie, Sicherheit, Datenschutz und digitale Souveränität.</p></div>${renderIndustryTable("WÖk-Matrix für KI-Rechenzentren", ["Standortfaktor", "Warum wichtig?", "WÖk-Bewertung"], dataCenterMatrix)}<p class="formula-note">KI-Rechenzentren sind nicht automatisch gut oder schlecht. Sie sind Wirkungsträger. Entscheidend ist, ob sie mit sauberem Strom, Effizienz, Abwärmenutzung, Datenschutz und regionaler Rückkopplung betrieben werden.</p></div></section>
      <section class="section dossier-tab-panel" id="erneuerbare-industriestrom"><div><div class="section-header"><p class="hero-kicker">Erneuerbare als Industriestrom</p><h2>Warum Erneuerbare langfristig Standortvorteile schaffen können.</h2><p>Bei Wind und Sonne fallen die Kosten hauptsächlich beim Bau, bei Finanzierung, Netzanschluss, Wartung, Speicher und Systemintegration an. Der Energieträger selbst kostet nichts. Bei fossilen Kraftwerken entstehen dauerhaft variable Kosten für Brennstoff, Förderung, Transport, CO₂-Zertifikate, Importabhängigkeit und geopolitische Risiken. Bei neuer Kernkraft kommen sehr hohe Kapitalbindung, lange Bauzeiten, Sicherheits-, Rückbau- und Entsorgungsfragen hinzu.</p></div><article class="card"><p class="card-kicker">Fraunhofer ISE - Stromgestehungskosten 2024</p><h3 class="card-title">Erzeugungskosten sind nicht Industriestrompreise.</h3><p class="card-text">Fraunhofer ISE weist für Deutschland niedrige Stromgestehungskosten für PV und Wind aus; neue Kernkraft wird mit einer sehr breiten Spanne geführt. Diese Zahlen sind ein CAPEX/OPEX- und Standortargument, aber kein Endkundenpreis.</p><p class="card-text"><strong>Vorsicht:</strong> Netze, Speicher, Abgaben, Systemkosten und Beschaffung zählen mit.</p><p><a class="text-link" href="${escapeHtml(industrySourceByLabel("Fraunhofer ISE - Stromgestehungskosten 2024").url)}">Quelle öffnen</a></p></article></div></section>`;
}

function renderIndustryTransformationDossier(claim, sectionLabel = "live") {
  const base = sectionLabel === "detail" ? "../../../" : "../../../";
  const canonicalPath = sectionLabel === "detail" ? "detail" : "live";
  const answers = expandedAnswers(claim);
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero industry-transformation-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">${sectionLabel === "detail" ? "Detail" : "Live"}</a> / ${escapeHtml(claim.title)}</nav>
          <p class="hero-kicker">Leuchtturm · Bilanzgrenze Wirtschaft / Standort / Transformation</p>
          <h1 class="hero-title">Klimaschutz deindustrialisiert Deutschland?</h1>
          <p class="hero-subtitle">${escapeHtml(claim.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(claim.abstract)} Die bessere Frage lautet nicht: Klimaschutz oder Industrie? Sondern: Welche Industrie bleibt in Deutschland wettbewerbsfähig, wenn Energie, Mobilität, Halbleiter, Rechenzentren, Batterien, Wärme, Logistik und Produktion klimaneutral, resilient und bezahlbar werden müssen?</p>
          <p class="radar-status-line"><span>Status: checked_candidate</span><span>Datenstand: ${UPDATED_AT}</span><span>Hinweis: Strukturwandel ist real, aber Niedergangsframe ist verkürzt</span></p>
        </div>
      </section>
      ${summaryGrid([["Kurzurteil", claim.summary.judgement, "warning"], ["Leitsatz", "Industrie bleibt nicht, indem man alte Kostenstrukturen konserviert. Industrie bleibt, wenn der Standort die nächste Technologie- und Energiephase gewinnt.", "positive"], ["Kernthese", "Nicht Klimaschutz deindustrialisiert Deutschland. Fossile Abhängigkeit, verschleppte Infrastruktur, hohe Systemkosten und fehlende Transformationsfähigkeit gefährden Industrie.", "critical"], ["Kurzformel", "Transformation ist nicht Deindustrialisierung. Transformation ist Standortumbau.", "positive"], ["Noch kürzer", "Nicht Industrie bewahren, wie sie war. Industrie erneuern, damit sie bleibt.", "positive"], ["Risiko", claim.summary.risk, "critical"]], `${claim.title} Summary`, "deep-dive-summary-grid")}
      <section class="section radar-summary-section" id="sechs-punkte"><div class="radar-section-intro"><p class="hero-kicker">Das Wichtigste</p><h2>Sechs Punkte zur Standortrechnung.</h2></div>${summaryGrid(industryKeyPoints, "Industrie Transformation Summary")}</section>
      ${topicSubnav(sectionLabel === "detail" ? "Detail" : "Live", "../")}
      <section class="section" id="live-antworten"><div><div class="section-header"><p class="hero-kicker">Tab 1</p><h2>Live antworten.</h2></div><div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge"><details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">Kurzantwort · ${words(answers.ten_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.ten_seconds)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">Einordnung · ${words(answers.thirty_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.thirty_seconds)}“</p></details><details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">Lange Antwort · ${words(answers.two_minutes)} Wörter</span></summary><p>„${escapeHtml(answers.two_minutes)}“</p></details></div><div class="card-grid two"><article class="card"><p class="card-kicker">Gute Rückfrage</p><h3 class="card-title">${escapeHtml(claim.redirectQuestion)}</h3></article><article class="card"><p class="card-kicker">Frame sichtbar machen</p><p class="card-text">Ich beantworte das, aber ich übernehme nicht den Niedergangsframe. Die bessere Wirkungsfrage ist: Welche Standortbedingungen machen Industrie in der klimaneutralen Wirtschaft wettbewerbsfähig?</p></article></div></div></section>
      <section class="section section-soft"><div class="card"><p class="card-kicker">Nicht ins Stöckchen springen</p><h2 class="card-title">Was man nicht tun sollte.</h2>${htmlList(claim.dontDo)}</div></section>
      ${renderIndustryUnderstandingSections()}
      <section class="section dossier-tab-panel" id="wirkstoffanalyse"><div><div class="section-header"><p class="hero-kicker">Wirkstoffanalyse</p><h2>Transformationskosten als Niedergangsbeweis.</h2><p>Der Frame verschiebt Aufmerksamkeit von fossilen Systemkosten, neuen Wertschöpfungsfeldern und Standorthebeln auf kurzfristige Belastungen.</p></div>${htmlList(["fossile Brennstoffkosten", "Importabhängigkeit", "CO₂-Kosten", "Klimaschäden", "neue Industriecluster", "LCOE erneuerbarer Energien", "CAPEX/OPEX-Unterschiede", "Netz- und Speicherinfrastruktur", "Power Purchase Agreements", "Batteriezellfertigung", "Halbleiter und Leistungselektronik", "KI-Rechenzentren", "Ladeinfrastruktur und E-Lkw", "T-SROI von Infrastrukturinvestitionen"])}</div></section>
      <section class="section section-soft dossier-tab-panel" id="narrativanalyse"><div><div class="section-header"><p class="hero-kicker">Narrativanalyse</p><h2>Deindustrialisierungsnarrativ.</h2><p>Das Narrativ funktioniert, weil es reale Transformationsschmerzen aufgreift. Die Entlarvung darf diese Schmerzen nicht leugnen. Sie muss zeigen: Der Schluss „also zurück zu fossil“ ist wirkungsökonomisch falsch.</p></div>${summaryGrid([["Primär", "Deindustrialisierungsnarrativ", "warning"], ["Sekundär", "Niedergangsframe / Klimaschutz gegen Wirtschaft / Scheiternsframe / fossile Entlastung", "warning"], ["Emotion", "Verlustangst, Statusbedrohung, Nostalgie und Abwehr von Veränderung", "critical"], ["Politische Funktion", "Transformation, Erneuerbare, Elektrifizierung, Netze und Klimapolitik werden als wirtschaftsfeindlich gerahmt.", "critical"]], "Narrativanalyse Industrie")}</div></section>
      ${renderPsychologyModule(claim)}
      <section class="section dossier-tab-panel" id="wirkungspfad"><div><div class="section-header"><p class="hero-kicker">Wirkungspfad</p><h2>Vom Satz zur Standortwirkung.</h2></div><ol class="timeline radar-flow radar-effect-path">${claim.effectPath.map(([label, description], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(description)}</p></div></li>`).join("")}</ol></div></section>
      <section class="section section-soft dossier-tab-panel" id="folgen-falschen-handelns"><div><div class="section-header"><p class="hero-kicker">Folgen falschen Handelns</p><h2>Was wahrscheinlicher wird.</h2></div><div class="deep-dive-consequence-grid">${claim.consequences.map((item) => `<article class="card"><p class="card-kicker">Folge</p><p class="card-text">${escapeHtml(item)}</p></article>`).join("")}</div></div></section>
      ${summaryGrid([["Mensch", claim.mpd.mensch, "warning"], ["Planet", claim.mpd.planet, "warning"], ["Demokratie", claim.mpd.demokratie, "critical"]], `${claim.title} MPD`, "mpd-impact-panel")}
      ${woekSolutionMatrix(claim.woekSolution)}
      <section class="section section-soft" id="verknuepfung-emobilitaet"><div class="card"><p class="card-kicker">Verwandtes Dossier</p><h2 class="card-title">Vom Standort zur Mobilität.</h2><p class="card-text">Elektromobilität ist nicht nur ein Fahrzeugthema. Sie ist Industriepolitik: Batteriezellen, Leistungselektronik, Ladeinfrastruktur, E-Lkw, Software, Recycling, Stromsystem, Netze und Speicher bilden neue Wertschöpfungsketten.</p><p><a class="btn btn-primary" href="/wirkungsradar/live/e-autos-schlimmer-als-verbrenner/">Zum Dossier: E-Autos schlimmer als Verbrenner?</a></p></div></section>
      <section class="section dossier-tab-panel" id="deep-dive-quellen"><div><div class="section-header"><p class="hero-kicker">Tab 3</p><h2>Deep Dive &amp; Quellen.</h2><p>Quellen dienen als Prüfstand. Projektstatus, Kosten, Förderungen und Produktionsziele müssen regelmäßig aktualisiert werden.</p></div>${evidenceStack(claim.sources)}</div></section>
      ${factStatusBadge()}
    </main>`;
  return pageShell({
    title: `Klimaschutz deindustrialisiert Deutschland? - Wirkungsradar ${sectionLabel === "detail" ? "Detail" : "Live"} | Wirkungsökonomie`,
    description: sentence(claim.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/${canonicalPath}/${claim.slug}/`,
    base,
    main,
  });
}

function renderDeepDiveDetail(claim) {
  if (claim.slug === "klimaschutz-deindustrialisiert-deutschland") return renderIndustryTransformationDossier(claim, "detail");
  if (claim.slug === "fusion-loest-das-energieproblem") return renderFusionDossier(claim, "detail");
  const detail = deepDiveDetailFor(claim);
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero deep-dive-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Detail</a> / ${escapeHtml(detail.title)}</nav>
          <p class="hero-kicker">Deep-Dive-Detailseite</p>
          <h1 class="hero-title">${escapeHtml(detail.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(detail.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(claim.abstract)}</p>
          <p class="radar-status-line"><span>Status: Detailanalyse</span><span>Datenstand: ${UPDATED_AT}</span><span>Vertrauen: ${escapeHtml(detail.confidence)}</span><span>Lesezeit: ${escapeHtml(detail.readingTime)}</span></p>
        </div>
      </section>
      ${summaryGrid([
        ["Kurzurteil", claim.summary.judgement, "warning"],
        ["Wahrer Kern", claim.summary.true_core, "neutral"],
        ["Was fehlt?", detail.claimAnatomy.missingContext, "critical"],
        ["Narrativtyp", claim.summary.narrative, "warning"],
        ["Wirkungsrisiko", claim.summary.risk, "critical"],
        ["Leitfrage", detail.leadQuestion, "positive"],
      ], `${claim.title} Detail Summary`, "deep-dive-summary-grid")}
      ${topicSubnav("Detail", "../")}
      <section class="section">
        <div class="radar-detail-layout">
          <nav class="article-toc" aria-label="Inhaltsverzeichnis" data-search-exclude>
            <p>Inhaltsverzeichnis</p>
            <ol>
              <li><a href="#aussage">Aussage</a></li>
              <li><a href="#kurzurteil">Kurzurteil</a></li>
              <li><a href="#was-stimmt">Was stimmt daran?</a></li>
              <li><a href="#was-fehlt">Was fehlt?</a></li>
              <li><a href="#faktenlage">Faktenlage</a></li>
              <li><a href="#wirkstoff">Gesellschaftlicher Wirkstoff</a></li>
              <li><a href="#wirkungspfad">Wirkmechanismus</a></li>
              <li><a href="#psychologischer-wirkungscheck">Psychologischer Wirkungscheck</a></li>
              <li><a href="#wirkungsordnung">Wirkungsordnung</a></li>
              ${detail.batteryAudit ? '<li><a href="#akku-faktencheck">Akku-Faktencheck</a></li>' : "<!-- no battery audit toc -->"}
              ${detail.evInfrastructure ? '<li><a href="#ladeinfrastruktur">Ladeinfrastruktur</a></li>' : "<!-- no EV infrastructure toc -->"}
              <li><a href="#folgenanalyse">Folgenanalyse</a></li>
              <li><a href="#mpd">Mensch, Planet, Demokratie</a></li>
              <li><a href="#sdg">SDG-/SDG+-Bezug</a></li>
              <li><a href="#woek-loesung">WÖk-Lösung</a></li>
              <li><a href="#creator-export">Creator Export</a></li>
              <li><a href="#quellen">Quellen</a></li>
            </ol>
          </nav>
          <article class="article-body deep-dive-body">
            ${renderClaimAnatomy(detail)}
            <section class="section deep-dive-section deep-dive-text-section" id="kurzurteil"><h2>Kurzurteil</h2><p>${escapeHtml(claim.summary.judgement)} ${escapeHtml(claim.summary.problem)}</p></section>
            <section class="section deep-dive-section deep-dive-text-section" id="was-stimmt"><h2>Was stimmt daran?</h2><p>${escapeHtml(detail.trueText)}</p></section>
            <section class="section deep-dive-section deep-dive-text-section" id="was-fehlt"><h2>Was fehlt?</h2>${htmlList(detail.missingItems)}</section>
            ${renderEvidenceAssessment(detail)}
            ${renderStandardBox("fakten-allein", "Warum Fakten allein nicht reichen", "Die Aussage wirkt nicht nur über ihren Faktenkern, sondern über emotionale Entlastung, Ohnmacht, Scheiternsgefühl oder Technikhoffnung. Deshalb reicht eine Zahl allein nicht: Entscheidend ist, welchen Handlungspfad sie im Publikum aktiviert.")}
            <section class="section deep-dive-section" id="wirkstoff">
              <div class="section-header"><p class="hero-kicker">Gesellschaftlicher Wirkstoff</p><h2>${escapeHtml(detail.wirkstoff.label)}</h2></div>
              <div class="card-grid two">
                <article class="card"><p class="card-kicker">Mechanismus</p><h3 class="card-title">${escapeHtml(detail.wirkstoff.mechanism)}</h3><p class="card-text">${escapeHtml(detail.wirkstoff.description)}</p></article>
                <article class="card"><p class="card-kicker">Resonanzraum</p>${htmlList(detail.wirkstoff.resonance)}</article>
              </div>
            </section>
            <section class="section section-soft deep-dive-section" id="narrativtyp">
              <div>
                <div class="section-header"><p class="hero-kicker">Narrativtyp</p><h2>${escapeHtml(claim.narrativeFamilies.join(" / "))}</h2></div>
                ${summaryGrid([["Botschaft", detail.narrative.message, "warning"], ["Emotion", detail.narrative.emotional, "warning"], ["Politischer Effekt", detail.narrative.political, "critical"]], "Narrativanalyse", "deep-dive-inline-summary")}
              </div>
            </section>
            <section class="section deep-dive-section" id="wirkungspfad">
              <div class="section-header"><p class="hero-kicker">Wirkmechanismus</p><h2>Vom Satz zur Wirkung.</h2></div>
              <ol class="timeline radar-flow radar-effect-path">
                ${claim.effectPath.map(([label, description], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(description)}</p></div></li>`).join("\n                ")}
              </ol>
            </section>
            ${renderPsychologyModule(claim)}
            ${renderWirkungOrders(detail)}
            ${renderBatteryAudit(detail)}
            ${renderEvChargingInfrastructure(detail)}
            ${renderEvIndustryPolicyLink(claim)}
            ${renderFalseActionAnalysis(detail)}
            <section class="section deep-dive-section" id="mpd">
              <div class="section-header"><p class="hero-kicker">Bewertung nach Mensch, Planet, Demokratie</p><h2>MPD-Wirkungsrisiko.</h2></div>
              ${summaryGrid([["Mensch", claim.mpd.mensch, "warning"], ["Planet", claim.mpd.planet, "warning"], ["Demokratie", claim.mpd.demokratie, "critical"]], `${claim.title} MPD`, "mpd-impact-panel deep-dive-inline-summary")}
            </section>
            <section class="section section-soft deep-dive-section" id="sdg">
              <div>
                <div class="section-header"><p class="hero-kicker">SDG-/SDG+-Bezug</p><h2>Ziele und demokratische Wirkungsqualität.</h2></div>
                ${summaryGrid([["SDGs", claim.sdgs.join(" / "), "positive"], ["SDG+", claim.sdgPlus.join(" / "), "positive"], ["Nichtkompensation", mapping.wok_mapping.rule, "warning"]], `${claim.title} SDG`, "climate-sdg-panel deep-dive-inline-summary")}
              </div>
            </section>
            <section class="section deep-dive-section" id="woek-loesung">
              <div class="section-header"><p class="hero-kicker">WÖk-Lösung</p><h2>${escapeHtml(detail.solutionLead)}</h2></div>
              ${htmlList(claim.woekSolution)}
            </section>
            ${renderCreatorExport(claim, detail)}
            ${renderStandardBox("nicht-ins-stoeckchen", "Nicht ins Stöckchen springen", claim.dontDo.join(" "))}
            ${renderStandardBox("leitfrage", "Wirkungsökonomische Leitfrage", detail.leadQuestion)}
            ${internalLinks()}
            ${renderSourceReliability(detail)}
          </article>
        </div>
      </section>
    </main>`;
  return pageShell({
    title: `${detail.title.replace(/[„“]/g, "")} | Wirkungsradar Detail | Wirkungsökonomie`,
    description: sentence(claim.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/detail/${claim.slug}/`,
    base: "../../../",
    main,
  });
}

function renderDetailIndex() {
  const deepDiveClaims = deepDiveSlugs.map((slug) => claims.find((claim) => claim.slug === slug)).filter(Boolean);
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../index.html">Start</a> / <a href="../">Wirkungsradar</a> / Detail</nav>
          <p class="hero-kicker">Wirkungsradar Detail</p>
          <h1 class="hero-title">Detailanalysen für Aussagen mit hoher Wirkung.</h1>
          <p class="hero-subtitle">Deep Dives mit Faktenkern, Narrativanalyse, Wirkmechanismus, MPD-Bewertung und WÖk-Lösung.</p>
          <p class="radar-abstract"><strong>Abstract:</strong> Die Detailseiten sind die Langform zu Wirkungsradar-Livekarten. Sie ordnen nicht nur Fakten, sondern zeigen, welche gesellschaftliche Wirkung eine Aussage auslöst und welche bessere Handlungsfrage daraus folgt.</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Format: Deep Dive</span></p>
        </div>
      </section>
      ${summaryGrid([
        ["Bestehender Deep Dive", "SDGs sind Weltregierung", "neutral"],
        ["Klima & Energie", `${deepDiveClaims.length} neue Detailanalysen`, "positive"],
        ["Methode", "Faktencheck plus Wirkungscheck", "positive"],
        ["Bausteine", "ClaimAnatomy, EvidenceAssessment, WirkungOrders, WÖk-Antwort", "neutral"],
        ["Ziel", "Handlungsfähigkeit statt Stöckchen-Reaktion", "positive"],
        ["Datenstand", UPDATED_AT, "neutral"],
      ], "Detail Index Summary")}
      ${topicSubnav("Detail", "")}
      <section class="section" aria-labelledby="detail-list">
        <div>
          <div class="section-header"><p class="hero-kicker">Detailseiten</p><h2 id="detail-list">Verfügbare Analysen.</h2></div>
          <div class="card-grid">
            <a class="card text-link-card" href="sdgs-sind-weltregierung/"><p class="card-kicker">Internationale Kooperation</p><h3 class="card-title">„Die SDGs sind Weltregierung“</h3><p class="card-text">Kooperationsrahmen, Herrschaftsframe und demokratische Entscheidung.</p></a>
            ${deepDiveClaims
              .map((claim) => {
                const detail = deepDiveDetailFor(claim);
                return `<a class="card text-link-card" href="${escapeHtml(claim.slug)}/">
              <p class="card-kicker">${escapeHtml(detail.subtitle)}</p>
              <h3 class="card-title">${escapeHtml(detail.title)}</h3>
              <p class="card-text">${escapeHtml(detail.leadQuestion)}</p>
            </a>`;
              })
              .join("\n            ")}
          </div>
        </div>
      </section>
    </main>`;
  return pageShell({
    title: "Wirkungsradar Detailanalysen | Wirkungsökonomie",
    description: "Detailanalysen im Wirkungsradar mit Faktenkern, Narrativanalyse, Wirkmechanismus, MPD-Bewertung und wirkungsökonomischer Lösung.",
    canonical: "https://wirkungsoekonomie.de/wirkungsradar/detail/",
    base: "../../",
    main,
  });
}

function claimIndex() {
  return `<section class="section" id="claim-index" aria-labelledby="claim-index-title">
        <div>
          <div class="section-header">
            <p class="hero-kicker">ClaimIndex</p>
            <h2 id="claim-index-title">Live-Karten Klima &amp; Energie.</h2>
          </div>
          <form class="climate-claim-toolbar" data-search-exclude>
            <label><span class="sr-only">Claims suchen</span><input type="search" placeholder="Aussage, Narrativ oder Thema suchen" data-climate-search></label>
            <label><span class="sr-only">Risiko filtern</span><select data-climate-risk><option value="">Risiko: alle</option><option value="mittel">mittel</option><option value="hoch">hoch</option></select></label>
            <label><span class="sr-only">Thema filtern</span><select data-climate-theme><option value="">Thema: alle</option>${Array.from(new Set(claims.flatMap((claim) => claim.themes))).map((theme) => `<option value="${escapeHtml(theme.toLowerCase())}">${escapeHtml(theme)}</option>`).join("")}</select></label>
          </form>
          <p class="narrative-library-count" data-climate-count>${claims.length} Karten</p>
          <div class="card-grid climate-claim-grid" data-climate-grid>
            ${claims
              .map(
                (claim) => `<a class="card text-link-card climate-claim-card" href="../../live/${claim.slug}/" data-risk="${escapeHtml(claim.riskLevel)}" data-theme="${escapeHtml(claim.themes.map((theme) => theme.toLowerCase()).join(" "))}" data-search="${escapeHtml([claim.title, claim.shortJudgement, claim.narrativeFamilies.join(" "), claim.themes.join(" "), claim.sdgs.join(" "), claim.sdgPlus.join(" ")].join(" ").toLowerCase())}">
              <p class="card-kicker">${escapeHtml(claim.shortJudgement)}</p>
              <h3 class="card-title">${escapeHtml(claim.title)}</h3>
              <p class="card-text">${escapeHtml(claim.narrativeFamilies.join(" / "))}</p>
              <p class="narrative-pill-row"><span data-risk="${escapeHtml(claim.riskLevel)}">Risiko: ${escapeHtml(claim.riskLevel)}</span><span>${escapeHtml(claim.sdgs.join(" / "))}</span></p>
            </a>`
              )
              .join("\n            ")}
          </div>
          <p class="narrative-library-empty" data-climate-empty hidden>Keine Karten für diese Filter.</p>
        </div>
      </section>
      <script>
        (() => {
          const cards = Array.from(document.querySelectorAll("[data-climate-grid] [data-search]"));
          const search = document.querySelector("[data-climate-search]");
          const risk = document.querySelector("[data-climate-risk]");
          const theme = document.querySelector("[data-climate-theme]");
          const count = document.querySelector("[data-climate-count]");
          const empty = document.querySelector("[data-climate-empty]");
          const norm = (value) => String(value || "").trim().toLowerCase();
          const update = () => {
            const q = norm(search?.value);
            const selectedRisk = norm(risk?.value);
            const selectedTheme = norm(theme?.value);
            let visible = 0;
            cards.forEach((card) => {
              const match = (!q || card.dataset.search.includes(q)) &&
                (!selectedRisk || norm(card.dataset.risk) === selectedRisk) &&
                (!selectedTheme || String(card.dataset.theme || "").split(/\\s+/).includes(selectedTheme));
              card.hidden = !match;
              if (match) visible += 1;
            });
            if (count) count.textContent = visible === 1 ? "1 Karte" : visible + " Karten";
            if (empty) empty.hidden = visible !== 0;
          };
          [search, risk, theme].forEach((control) => control?.addEventListener("input", update));
          update();
        })();
      </script>`;
}

function debateMap() {
  const clusters = ["Klimawandel", "Energiewende", "Mobilität & Batterien", "Kernenergie & Fusion", "Industrie & Wohlstand"];
  return `<section class="section debate-map" aria-labelledby="debate-map">
        <div>
          <div class="section-header"><p class="hero-kicker">DebateMap</p><h2 id="debate-map">Debattenlandschaft Klima &amp; Energie.</h2></div>
          <div class="climate-debate-map">
            <div class="climate-debate-center">Klima &amp; Energie</div>
            ${clusters.map((cluster) => `<div class="climate-debate-node">${escapeHtml(cluster)}</div>`).join("\n            ")}
          </div>
        </div>
      </section>`;
}

function renderThemesIndex() {
  return renderRadarTopicMapPage(pageShell);
}

function renderClusterPage() {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Themen</a> / Klima &amp; Energie</nav>
          <p class="hero-kicker">Themencluster</p>
          <h1 class="hero-title">Klima &amp; Energie</h1>
          <p class="hero-subtitle">Mythen, Narrative, Fakten und Wirkungspfade</p>
          <p class="radar-abstract"><strong>Abstract:</strong> Klima- und Energiedebatten sind selten reine Faktendebatten. Viele Aussagen enthalten einen wahren Kern, werden aber durch Narrative zu falschen Schlussfolgerungen: Ohnmacht, Verzögerung, Kontrollverlust, Verbotsangst, Technikwunder-Aufschub oder Scheiternsframes. Dieser Themencluster prüft zentrale Aussagen zu Klimawandel, Energiewende, Elektromobilität, Windkraft, Batterien, Kernenergie, Fusion und Industrie. Jede Aussage wird wirkungsökonomisch analysiert: Was stimmt? Was fehlt? Welcher gesellschaftliche Wirkstoff wird aktiviert? Welche Folgen hätte falsches Handeln? Und welche Lösung erzeugt positive Netto-Wirkung für Mensch, Planet und Demokratie?</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Vertrauen: hoch</span></p>
        </div>
      </section>
      ${summaryGrid(clusterSummary, "Klima & Energie Summary")}
      ${methodBox()}
      ${topicSubnav("Themen", "../")}
      ${renderHostControlModule()}
      ${renderPsychologicalStoeckchenChecklist()}
      ${debateMap()}
      ${claimIndex()}
      ${evidenceStack()}
      ${woekSolutionMatrix(["Wirkungssteuer: schädliche Wirkung wird teurer, positive Wirkung günstiger.", "T-SROI: Folgekosten und Nutzen werden in öffentliche Investitionsentscheidungen integriert.", "Reverse Merit Order: das kritischste Wirkungsfeld begrenzt die Gesamtbewertung.", "Soziale Abfederung und Beteiligung sichern demokratische Akzeptanz."])}
      ${factStatusBadge()}
    </main>`;
  return pageShell({
    title: "Klima & Energie – Wirkungsradar",
    description: "Mythen, Narrative, Fakten und Wirkungspfade zu Klimawandel, Energiewende, Windkraft, E-Mobilität, Batterien, Kernenergie, Fusion und Industrie.",
    canonical: "https://wirkungsoekonomie.de/wirkungsradar/themen/klima-energie/",
    base: "../../../",
    main,
  });
}

function renderSubtopic(topic) {
  const topicClaims = topic.claims.map((slug) => claims.find((claim) => claim.slug === slug)).filter(Boolean);
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../../index.html">Start</a> / <a href="../../../">Wirkungsradar</a> / <a href="../../">Themen</a> / <a href="../">Klima &amp; Energie</a> / ${escapeHtml(topic.title)}</nav>
          <p class="hero-kicker">Thema</p>
          <h1 class="hero-title">${escapeHtml(topic.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(topic.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(topic.abstract)}</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Vertrauen: hoch</span></p>
        </div>
      </section>
      ${summaryGrid(topic.summary, `${topic.title} Summary`)}
      ${methodBox()}
      ${topicSubnav("Themen", "../../")}
      ${renderHostControlModule()}
      <section class="section" aria-labelledby="topic-claims">
        <div>
          <div class="section-header"><p class="hero-kicker">Live-Karten</p><h2 id="topic-claims">Aussagen in diesem Thema.</h2></div>
          <div class="card-grid">
            ${topicClaims.map((claim) => `<a class="card text-link-card" href="../../../live/${claim.slug}/"><p class="card-kicker">${escapeHtml(claim.shortJudgement)}</p><h3 class="card-title">${escapeHtml(claim.title)}</h3><p class="card-text">${escapeHtml(claim.narrativeFamilies.join(" / "))}</p></a>`).join("\n            ")}
          </div>
        </div>
      </section>
      ${evidenceStack(topicClaims.flatMap((claim) => claim.sources || []).slice(0, 5))}
      ${woekSolutionMatrix(["Wirkung sichtbar machen.", "Engpasslogik statt Durchschnittslogik anwenden.", "Wirkung in Preise, Beschaffung, Kapitalzugang und öffentliche Entscheidungen rückkoppeln."])}
      ${factStatusBadge()}
    </main>`;
  return pageShell({
    title: `${topic.title} – Klima & Energie – Wirkungsradar`,
    description: sentence(topic.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/themen/klima-energie/${topic.slug}/`,
    base: "../../../../",
    main,
  });
}

function renderGermanyTwoPercentDossier(claim) {
  const answers = expandedAnswers(claim);
  const dossier = claim.dossier;
  const liveResponse = dossier.liveResponse || {};
  const answerPurposes = liveResponse.purposes || {};
  const hostExample = dossier.hostExample;
  const responseEntries = [
    ["One-Liner", "one_liner", answers.one_liner, answerPurposes.one_liner || "Ein Satz für Kommentarspalten, Reels und Moderation.", true],
    ["10 Sekunden", "ten_seconds", answers.ten_seconds, answerPurposes.ten_seconds || "Schnelle Host-Antwort.", true],
    ["30 Sekunden", "thirty_seconds", answers.thirty_seconds, answerPurposes.thirty_seconds || "Kurze Einordnung mit Beispiel.", false],
    ["2 Minuten", "two_minutes", answers.two_minutes, answerPurposes.two_minutes || "Vollständige Host-Antwort.", false],
  ];
  const summaryItems = [
    ["Kurzurteil", claim.summary.judgement, "warning"],
    ["Wahrer Kern", claim.summary.true_core, "neutral"],
    ["Problem", claim.summary.problem, "critical"],
    ["Fehlende Ebenen", dossier.missingLayers, "critical"],
    ["Narrativ", claim.summary.narrative, "warning"],
    ["Live-Antwort", claim.summary.host_answer, "positive"],
  ];
  const sourceCards = claim.sources.map((label) => germanyTwoPercentSourceCard(label));
  const understandingSections = [
    {
      kicker: "2.1 Territorial",
      title: "Territorial ist nicht falsch - aber eng.",
      text:
        "Territoriale Emissionen messen, was innerhalb der Landesgrenzen entsteht. Diese Bilanz ist wichtig für nationale Klimaziele, aber sie ist nicht identisch mit Verantwortung. Der enge Territorialanteil zeigt einen Ausschnitt, nicht die globale Wirkung deutscher Nachfrage, Produkte, Lieferketten, Kapitalflüsse oder Standards.",
    },
    {
      kicker: "2.2 Konsum",
      title: "Was wir nachfragen, wirkt auch im Ausland.",
      text:
        "Wenn Deutschland Produkte importiert, entstehen Teile der Emissionen im Ausland. Territorial werden sie dort gezählt. Wirkungsökonomisch gehören sie zugleich zur Nachfrage- und Konsumverantwortung Deutschlands: Emissionen verschwinden nicht, wenn sie aus der Territorialbilanz fallen.",
    },
    {
      kicker: "2.3 Lieferkette",
      title: "Ausgelagerte Produktion ist keine ausgelagerte Wirkung.",
      text:
        "Wenn Produktion ins Ausland verlagert wird, sinkt möglicherweise die deutsche Inlandsbilanz. Die Wirkung bleibt real: Energie, Rohstoffe, Wasser, Arbeitsbedingungen, Transport und Emissionen entstehen weiter - nur an einem anderen Ort. Wirkungsökonomischer Satz: Ausgelagerte Produktion ist keine ausgelagerte Verantwortung.",
    },
    {
      kicker: "2.4 Scope 3",
      title: "Die Wirkung endet nicht am Werkstor.",
      text:
        "Scope 3 ist keine nationale Klimabilanz, sondern eine Unternehmens- und Wertschöpfungskettenbilanz. Genau deshalb ist sie wirkungsökonomisch wichtig: Exportierte Fahrzeuge, Maschinen, Anlagen und energieverbrauchende Produkte können über Jahre Nutzungsemissionen außerhalb Deutschlands verursachen.",
    },
    {
      kicker: "2.5 Historisch",
      title: "Jahresanteil ist nicht kumulative Klimawirkung.",
      text:
        "Die 2-%-Behauptung betrachtet meist ein einzelnes Jahr. Klimawirkung entsteht aber kumulativ, weil CO₂ lange in der Atmosphäre bleibt. Die historische Perspektive beantwortet deshalb eine andere Verantwortungsfrage als der aktuelle Jahresanteil. Wirkungsökonomischer Satz: Jahresanteil ist nicht kumulative Klimawirkung.",
    },
    {
      kicker: "2.6 Transformativ",
      title: "Deutschland ist nicht nur Emittent, sondern Pfadsetzer.",
      text:
        "Deutschland wirkt als Industrieland, Exportland, EU-Mitglied, Normsetzer, Maschinenbau-, Chemie- und Automobilland, Kapitalstandort, Beschaffungsmarkt und Technologieanbieter. Produktstandards, Exporttechnologien, Investitionen, öffentliche Beschaffung und EU-Regeln beeinflussen globale Pfade.",
    },
  ];
  const differentiatedBalanceItems = [
    ["Territorial", "Was entsteht im Inland?"],
    ["Konsum", "Was verursacht unsere Nachfrage?"],
    ["Importierte Vorprodukte", "Was steckt in Rohstoffen und Komponenten?"],
    ["Unternehmens-Scope-3", "Was entsteht vor und nach dem Werkstor?"],
    ["Produktnutzung", "Was bewirken verkaufte Produkte?"],
    ["Historisch", "Was wurde kumulativ verursacht?"],
    ["Transformativ", "Welche Pfade und Standards setzen wir?"],
  ];
  const falseActionItems = [
    ["Politik", "Klimapolitik wird als symbolisch oder nutzlos gerahmt."],
    ["Industrie", "Produktdesign, Lieferketten, Antriebswende und Maschinenwirkung werden zu langsam umgestellt."],
    ["Konsum", "Importierte Produktionswirkung bleibt unsichtbar."],
    ["Kapital", "Investitionen fließen weiter in Geschäftsmodelle mit ausgelagerter Wirkung."],
    ["Demokratie", "Ohnmacht und Zynismus wachsen: Wir können sowieso nichts ändern."],
    ["Planet", "Emissionen sinken langsamer, weil Verantwortung an Bilanzgrenzen verschwindet."],
  ];
  const woekDossierSolutions = dossier.woekMeasures || [
    { title: "Territoriale Emissionen senken", text: "Deutschland muss seine Inlandsemissionen weiter senken: Energie, Gebäude, Verkehr, Industrie und Landwirtschaft." },
    { title: "Konsumemissionen sichtbar machen", text: "Konsum- und Importfußabdrücke müssen neben der Territorialbilanz öffentlich sichtbar werden." },
    { title: "Lieferkettenwirkung erfassen", text: "Rohstoffe, Vorprodukte, Energie, Wasser, Arbeit, Transport und Datenqualität werden über Scorecards und WÖk-IDs abgebildet." },
    { title: "Scope-3-Produktnutzung einbeziehen", text: "Fahrzeuge, Maschinen, Anlagen, Chemieprodukte und energieverbrauchende Geräte werden nach Nutzungsemissionen über den Lebenszyklus bewertet." },
    { title: "Digitale Produktpässe nutzen", text: "Der digitale Produktpass wird zum Produktgedächtnis: Herkunft, Materialien, Lieferketten, Nutzung, Reparierbarkeit, Recycling und Wirkungsdaten werden maschinenlesbar." },
    { title: "Reverse Merit Order anwenden", text: "Gute Werte in einem Feld dürfen schwere negative Wirkungen in anderen Feldern nicht verdecken." },
    { title: "Wirkungssteuer und Beschaffung koppeln", text: "Produkte mit negativer Netto-Wirkung werden teurer, Produkte mit positiver Netto-Wirkung günstiger; öffentliche Beschaffung folgt Wirkung." },
    { title: "Verantwortung operationalisieren", text: "Nicht Schuld moralisch verteilen, sondern Wirkung sichtbar machen und in Preise, Steuern, Kapital, Standards und Produktdesign zurückführen." },
  ];
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero dossier-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Live</a> / Deutschland nur 2 %</nav>
          <p class="hero-kicker">Wirkungsradar Dossier</p>
          <h1 class="hero-title">${escapeHtml(claim.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(claim.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(claim.abstract)}</p>
          <p class="radar-status-line"><span>Status: Dossier</span><span>Datenstand: ${UPDATED_AT}</span><span>Faktenstatus: datenbasiert</span></p>
        </div>
      </section>
      ${summaryGrid(summaryItems, `${claim.title} Summary`, "dossier-summary-grid")}
      ${deepDiveLiveLink(claim)}
      <section class="section dossier-keypoints" aria-labelledby="dossier-keypoints">
        <div>
          <div class="section-header"><p class="hero-kicker">Das Wichtigste</p><h2 id="dossier-keypoints">In 6 Punkten.</h2></div>
          <div class="card-grid three">
            ${dossier.keyPoints.map(([title, text], index) => `<article class="card dossier-key-card">
              <p class="card-kicker">${String(index + 1).padStart(2, "0")}</p>
              <h3 class="card-title">${escapeHtml(title)}</h3>
              <p class="card-text">${escapeHtml(text)}</p>
            </article>`).join("\n            ")}
          </div>
        </div>
      </section>
      <nav class="dossier-tab-nav" aria-label="Dossierbereiche" data-search-exclude>
        <a href="#host-antworten">Live antworten</a>
        <a href="#verantwortung-verstehen">Verantwortung verstehen</a>
        <a href="#deep-dive-quellen">Deep Dive &amp; Quellen</a>
      </nav>
      <section class="section dossier-tab-panel" id="host-antworten">
        <div>
          <div class="section-header"><p class="hero-kicker">Live antworten</p><h2>Kurz reagieren, ohne den Frame zu übernehmen.</h2></div>
          <div class="card dossier-live-lead">
            <p class="card-kicker">Kurzurteil</p>
            <h3 class="card-title">${escapeHtml(claim.shortJudgement)}</h3>
            <p class="card-text">${escapeHtml(dossier.leadSentence || "Ausgelagerte Produktion ist keine ausgelagerte Verantwortung.")}</p>
            <p class="card-text">Diese Seite unterscheidet Territorialbilanz, Konsumbilanz, Lieferkettenwirkung, Produktnutzung, Unternehmens-Scope-3, historische Verantwortung und transformative Gestaltungsmacht. Diese Ebenen dürfen nicht einfach addiert werden - aber sie dürfen auch nicht unsichtbar gemacht werden.</p>
          </div>
          <div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge">
            ${responseEntries.map(([label, key, text, purpose, isOpen]) => {
              const wordCount = words(text);
              const labelPrefix = key === "one_liner" ? "Kurzform" : key === "two_minutes" ? "2-Minuten-Antwort" : `${label}-Antwort`;
              return `<details class="radar-answer-item live-response-card"${isOpen ? " open" : ""}>
                <summary>
                  <span class="radar-answer-time">${escapeHtml(label)}</span>
                  <span class="radar-answer-label">${escapeHtml(labelPrefix)} · ${wordCount} Wörter · ${formatSpeechTime(text)}</span>
                </summary>
                <div class="live-response-body">
                  <p class="live-response-purpose">${escapeHtml(purpose)}</p>
                  ${String(text).split("\n\n").map((paragraph) => `<p>„${escapeHtml(paragraph)}“</p>`).join("\n                  ")}
                  ${copyButton(text)}
                </div>
              </details>`;
            }).join("\n            ")}
          </div>
          <article class="card host-example-module">
            <p class="card-kicker">Anschauliches Beispiel</p>
            <h3 class="card-title">${escapeHtml(hostExample.title)}</h3>
            <div class="card-grid two host-example-grid">
              ${[hostExample.everydayExample, hostExample.systemExample].map((example) => `<div class="host-example-box">
                <p class="card-kicker">Beispiel für Hosts</p>
                <h4>${escapeHtml(example.title)}</h4>
                <p>${escapeHtml(example.text)}</p>
                <p><strong>Host-Line:</strong> ${escapeHtml(example.hostLine)}</p>
              </div>`).join("\n              ")}
            </div>
            <div class="card-grid two host-example-rules">
              <div><p class="card-kicker">Zeigt</p><ul class="clean-list">${hostExample.whatItShows.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
              <div><p class="card-kicker">Vermeiden</p><ul class="clean-list">${hostExample.avoid.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
            </div>
          </article>
          <div class="card-grid two dossier-live-support">
            <article class="card"><p class="card-kicker">Gute Rückfrage</p><h3 class="card-title">Zur Wirkungsfrage zurück.</h3><p class="card-text">${escapeHtml(claim.redirectQuestion)}</p></article>
            <article class="card"><p class="card-kicker">Frame nicht übernehmen</p><h3 class="card-title">Erst die Bilanzgrenze klären.</h3><p class="card-text">${escapeHtml(liveResponse.frameCheck)}</p></article>
          </div>
          <div class="card dossier-dont-card">
            <p class="card-kicker">Nicht ins Stöckchen springen</p>
            <h3 class="card-title">Was man nicht tun sollte.</h3>
            <ul class="clean-list">${claim.dontDo.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
          <article class="card dossier-better-question">
            <p class="card-kicker">Bessere Wirkungsfrage</p>
            <h3 class="card-title">${escapeHtml(liveResponse.betterQuestion)}</h3>
          </article>
        </div>
      </section>
      <section class="section section-soft dossier-tab-panel" id="verantwortung-verstehen">
        <div>
          <div class="section-header"><p class="hero-kicker">Verantwortung verstehen</p><h2>Territorialer Anteil ist nicht Gesamtverantwortung.</h2></div>
          <article class="card dossier-thesis-card">
            <p class="card-kicker">Zentrale These</p>
            <h3 class="card-title">Verantwortungsverkürzung erkennen.</h3>
            <p class="card-text">${escapeHtml(dossier.thesis)}</p>
            <p class="card-text"><a class="text-link" href="../../../begriffe/verantwortungsverkuerzung/" data-glossary-key="verantwortungsverkuerzung"><strong>Verantwortungsverkürzung</strong></a>: Eine enge Bilanzgrenze wird benutzt, um größere Wirkungszusammenhänge unsichtbar zu machen.</p>
            <p class="card-text">Wirkungsökonomisch entsteht Verantwortung dort, wo Entscheidungen, Produkte, Lieferketten, Kapital, Regeln oder Technologien Zustände verändern - direkt, indirekt, verzögert oder systemisch. Die WÖk unterscheidet dafür <a class="text-link" href="../../../begriffe/wirkung/" data-glossary-key="wirkung">Wirkung</a>, Netto-Wirkung und Transformationswirkung.</p>
            <p class="card-text"><strong>Redaktionelle Regel:</strong> ${escapeHtml(dossier.editorialRule)}</p>
          </article>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Aussagenvarianten</p><h3 class="card-title">So taucht der Frame auf.</h3><ul class="clean-list">${dossier.variants.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
            <article class="card"><p class="card-kicker">Bilanzgrenzen</p><h3 class="card-title">Nicht addieren, aber sichtbar machen.</h3><p class="card-text">${escapeHtml(dossier.boundaryNote)}</p></article>
          </div>
          <div class="dossier-matrix-wrap">
            <table class="dossier-matrix">
              <caption>Sieben Bilanzgrenzen deutscher Klimaverantwortung</caption>
              <thead><tr><th>Ebene</th><th>Frage</th><th>Beispiel</th><th>Was der 2-%-Zahlenframe ausblendet</th></tr></thead>
              <tbody>
                ${dossier.responsibilityMatrix.map(([level, question, example, blindSpot]) => `<tr><th scope="row">${escapeHtml(level)}</th><td>${escapeHtml(question)}</td><td>${escapeHtml(example)}</td><td>${escapeHtml(blindSpot)}</td></tr>`).join("\n                ")}
              </tbody>
            </table>
          </div>
          <div class="card-grid two dossier-understanding-grid">
            ${understandingSections.map((section) => `<article class="card">
              <p class="card-kicker">${escapeHtml(section.kicker)}</p>
              <h3 class="card-title">${escapeHtml(section.title)}</h3>
              <p class="card-text">${escapeHtml(section.text)}</p>
            </article>`).join("\n            ")}
          </div>
          <article class="card dossier-boundary-card">
            <p class="card-kicker">Nicht addieren, sondern differenzieren</p>
            <h3 class="card-title">Unterschiedliche Verantwortungsbilanzen dürfen nicht einfach addiert werden.</h3>
            <p class="card-text">Territoriale Emissionen, Konsumemissionen, Unternehmens-Scope-3-Emissionen und historische Emissionen sind verschiedene Bilanzierungslogiken. Man darf sie nicht zu einer einzigen Zahl zusammenwerfen. Aber man muss sie nebeneinander sichtbar machen, weil sie unterschiedliche Verantwortungsfragen beantworten.</p>
            <div class="radar-link-cluster">${differentiatedBalanceItems.map(([label, text]) => `<span><strong>${escapeHtml(label)}:</strong> ${escapeHtml(text)}</span>`).join("\n              ")}</div>
          </article>
          <div class="card-grid two dossier-balance-modules">
            <article class="card">
              <p class="card-kicker">Pro-Kopf-Zahlen</p>
              <h3 class="card-title">${escapeHtml(dossier.perCapitaModule.title)}</h3>
              <p class="card-text">${escapeHtml(dossier.perCapitaModule.text)}</p>
              <p class="card-text"><strong>Kernsatz:</strong> ${escapeHtml(dossier.perCapitaModule.keySentence)}</p>
              <p class="card-text"><strong>Beispiel:</strong> ${escapeHtml(dossier.perCapitaModule.example)}</p>
            </article>
            <article class="card">
              <p class="card-kicker">Scope 3</p>
              <h3 class="card-title">${escapeHtml(dossier.scope3Module.title)}</h3>
              <p class="card-text">${escapeHtml(dossier.scope3Module.text)}</p>
              <p class="card-text"><strong>Kernsatz:</strong> ${escapeHtml(dossier.scope3Module.keySentence)}</p>
              <p class="card-text"><strong>Beispiel:</strong> ${escapeHtml(dossier.scope3Module.example)}</p>
              <p class="card-text"><strong>Warnhinweis:</strong> ${escapeHtml(dossier.scope3Module.warning)}</p>
            </article>
          </div>
          <div class="section-header dossier-subheader"><p class="hero-kicker">Wirkungslogik</p><h2>Von der Zahl zur Wirkungsblindheit.</h2></div>
          <ol class="timeline radar-flow radar-effect-path dossier-effect-path">
            ${claim.effectPath.map(([label, description], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(description)}</p></div></li>`).join("\n            ")}
          </ol>
        </div>
      </section>
      ${renderPsychologyModule(claim)}
      <section class="section dossier-tab-panel" id="deep-dive-quellen">
        <div>
          <div class="section-header"><p class="hero-kicker">Deep Dive &amp; Quellen</p><h2>Datenlogik, Folgen und Rückkopplung.</h2></div>
          <div class="card-grid dossier-fact-grid">
            ${dossier.dataFacts.map(([label, text]) => `<article class="card"><p class="card-kicker">${escapeHtml(label)}</p><h3 class="card-title">${escapeHtml(text)}</h3></article>`).join("\n            ")}
          </div>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Faktenlage</p><h3 class="card-title">Was prüfbar ist.</h3><ul class="clean-list">${claim.facts.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
            <article class="card"><p class="card-kicker">Wirkstoffanalyse</p><h3 class="card-title">Territoriale Zahl als Verantwortungsverkürzer.</h3><p class="card-text">Eine enge territoriale Kennzahl wird als scheinbar vollständiger Verantwortungsbeweis benutzt. Die Aussage verschiebt Aufmerksamkeit von Wirkungsketten auf Landesgrenzen.</p><ul class="clean-list"><li>Konsumemissionen</li><li>ausgelagerte Produktion</li><li>importierte Vorprodukte</li><li>Scope 3 / Use of Sold Products</li><li>exportierte Produktnutzung</li><li>historische Emissionen</li><li>Technologie-, Kapital- und Beschaffungshebel</li></ul></article>
          </div>
          <article class="card dossier-thesis-card">
            <p class="card-kicker">Narrativanalyse</p>
            <h3 class="card-title">Ohnmachtsnarrativ / Verantwortungsverkürzung / Verzögerungsframe.</h3>
            <p class="card-text">Typische Botschaft: Wir sind zu klein, also müssen wir nicht handeln. Die emotionale Funktion ist Entlastung, Veränderungsvermeidung und Kostenabwehr; politisch wirkt die Transformation dadurch überzogen, nutzlos oder unfair.</p>
            <p class="card-text">Nebenmuster sind Whataboutism und Territorialframe: Der Blick wird auf Landesgrenzen verengt, während Konsum, Lieferketten, Scope 3, historische Wirkung sowie Technologie- und Kapitalhebel aus der Debatte verschwinden.</p>
          </article>
          <section class="section section-soft dossier-false-action" aria-labelledby="false-action">
            <div>
              <div class="section-header"><p class="hero-kicker">Folgen falschen Handelns</p><h2 id="false-action">Was wahrscheinlicher wird.</h2></div>
              <div class="card-grid">${falseActionItems.map(([dimension, consequence]) => `<article class="card"><p class="card-kicker">${escapeHtml(dimension)}</p><h3 class="card-title">${escapeHtml(consequence)}</h3></article>`).join("\n                ")}</div>
            </div>
          </section>
          <article class="card dossier-thesis-card">
            <p class="card-kicker">Wirkungsökonomische Antwort</p>
            <h3 class="card-title">Aus der 2-%-Behauptung folgt nicht Rückzug, sondern präzisere Bilanzierung und bessere Rückkopplung.</h3>
            <p class="card-text">Die Reverse Merit Order schützt vor Schönrechnen: Negative Wirkung in einem kritischen Feld kann nicht durch positive Werte an anderer Stelle verdeckt werden. Sie wirkt als Firewall gegen Greenwashing, Wirkungsverwässerung und Machtverzerrung.</p>
          </article>
          ${woekSolutionMatrix(woekDossierSolutions)}
          <section class="dossier-source-section" aria-labelledby="woek-source-cards">
            <div class="section-header"><p class="hero-kicker">WÖk-Quellenkarten</p><h2 id="woek-source-cards">Welche interne Logik hier trägt.</h2></div>
            <div class="card-grid three">
              ${dossier.internalSourceCards.map(([title, shows, useFor]) => `<article class="card">
                <p class="card-kicker">WÖk intern</p>
                <h3 class="card-title">${escapeHtml(title)}</h3>
                <p class="card-text"><strong>Zeigt:</strong> ${escapeHtml(shows)}</p>
                <p class="card-text"><strong>Nutzen:</strong> ${escapeHtml(useFor)}</p>
              </article>`).join("\n              ")}
            </div>
          </section>
          <section class="dossier-source-section" aria-labelledby="woek-id-module">
            <div class="section-header"><p class="hero-kicker">WÖk-Indikatoren</p><h2 id="woek-id-module">Welche WÖk-IDs relevant wären.</h2></div>
            <div class="dossier-matrix-wrap">
              <table class="dossier-matrix dossier-id-matrix">
                <caption>Relevante WÖk-ID-Familien für diese Verantwortungsfrage</caption>
                <thead><tr><th>ID</th><th>Feld</th><th>Indikator</th><th>Relevanz</th></tr></thead>
                <tbody>
                  ${dossier.relevantWoekIds.map(([id, field, label, relevance]) => `<tr><th scope="row">${escapeHtml(id)}</th><td>${escapeHtml(field)}</td><td>${escapeHtml(label)}</td><td>${escapeHtml(relevance)}</td></tr>`).join("\n                  ")}
                </tbody>
              </table>
            </div>
          </section>
          ${summaryGrid([["Mensch", claim.mpd.mensch, "warning"], ["Planet", claim.mpd.planet, "warning"], ["Demokratie", claim.mpd.demokratie, "critical"]], `${claim.title} MPD`, "mpd-impact-panel")}
          ${summaryGrid([["SDGs", claim.sdgs.join(" / "), "positive"], ["SDG+", claim.sdgPlus.join(" / "), "positive"], ["Wirkungsrisiko", claim.riskLevel, "critical"]], `${claim.title} SDG`, "climate-sdg-panel")}
          <section class="dossier-source-section" aria-labelledby="dossier-sources">
            <div class="section-header"><p class="hero-kicker">Quellenkarten</p><h2 id="dossier-sources">Welche Quelle welche Frage beantwortet.</h2></div>
            <div class="card-grid">
              ${sourceCards.map((source) => `<article class="card">
                <p class="card-kicker">${escapeHtml(source.type)} · ${escapeHtml(source.publisher)}</p>
                <h3 class="card-title">${escapeHtml(source.title)}</h3>
                <p class="card-text"><strong>Zeigt:</strong> ${escapeHtml(source.shows)}</p>
                <p class="card-text"><strong>Nutzen:</strong> ${escapeHtml(source.use_for)}</p>
                <p class="card-text"><strong>Warnung:</strong> ${escapeHtml(source.warning)}</p>
                <p><a class="text-link" href="${escapeHtml(source.url)}">Quelle öffnen</a></p>
              </article>`).join("\n              ")}
              <article class="card">
                <p class="card-kicker">WÖk intern</p>
                <h3 class="card-title">Lieferketten, Produktwirkung, WÖk-IDs, Reverse Merit Order und Wirkungssteuer</h3>
                <p class="card-text">Die WÖk-Logik übersetzt sichtbare Wirkung in Scorecards, digitale Produktpässe, Beschaffung, Kapitalzugang, Preise und Steuerung.</p>
                <p><a class="text-link" href="../../../werkzeuge/">WÖk-Werkzeuge öffnen</a></p>
              </article>
            </div>
          </section>
          <article class="card dossier-conclusion-card">
            <p class="card-kicker">Schluss</p>
            <h3 class="card-title">Die bessere Antwort ist Rückkopplung.</h3>
            ${dossier.conclusion.split("\n\n").map((paragraph) => `<p class="card-text">${escapeHtml(paragraph)}</p>`).join("\n            ")}
          </article>
          ${internalLinks()}
          ${factStatusBadge()}
        </div>
      </section>
    </main>`;
  return pageShell({
    title: "Deutschland nur 2 %? Warum die Zahl nur Inlandsemissionen zeigt | Wirkungsökonomie",
    description: sentence(claim.abstract),
    canonical: "https://wirkungsoekonomie.de/wirkungsradar/live/deutschland-nur-zwei-prozent/",
    base: "../../../",
    main,
  });
}

const co2SystemKeyPoints = [
  ["Der CO₂-Preis ist sichtbar", "Er verteuert fossile Nutzung unmittelbar und löst deshalb politischen Widerstand aus.", "warning"],
  ["Fossile Systemkosten sind oft unsichtbar", "Klimaschäden, Luftschadstoffe, Krankheit, Importabhängigkeit und Krisenrisiken erscheinen nicht direkt auf der Tank- oder Heizrechnung.", "critical"],
  ["CO₂-Preis ist nicht automatisch verlorenes Geld", "Die Einnahmen können für Entlastung, Klimaschutz, Infrastruktur, Gebäudesanierung und Transformation genutzt werden.", "positive"],
  ["Die Rechnung hängt von der Rückverteilung ab", "Ein CO₂-Preis ohne soziale Abfederung kann ungerecht wirken. Mit Klimageld, Infrastruktur und Alternativen kann er entlasten.", "neutral"],
  ["Der Preis pro Tonne ist nicht die Gesamtrechnung", "Entscheidend ist: CO₂-Preis mal verbleibende Emissionen. Wenn Emissionen sinken, kann die Gesamtrechnung trotz höherem Tonnenpreis sinken.", "neutral"],
  ["Wirkungsökonomisch geht es um Rückkopplung", "Fossile Folgekosten werden in Entscheidungen zurückgeführt, statt später als Schäden, Krankheit oder Krisenkosten aufzutauchen.", "positive"],
];

const co2SystemMatrix = [
  ["Klimaschäden", "Extremwetter, Ernteausfälle, Infrastruktur, Produktivität", "geringere Schäden durch Emissionsminderung und Anpassung"],
  ["Luftverschmutzung", "NO₂/NOx, Feinstaub, Ozon, Atemwegs- und Herz-Kreislauf-Erkrankungen", "sauberere Luft, weniger Krankheit, weniger Todesfälle"],
  ["Fossile Importe", "Geldabfluss für Öl, Gas, Kohle", "weniger Importabhängigkeit, mehr Wertschöpfung im Inland"],
  ["Preisschocks", "Abhängigkeit von Weltmarkt, Krisen, Kriegen", "stabilere Kosten durch erneuerbare Energien und Effizienz"],
  ["Staatshaushalt", "Reparatur, Krisenhilfen, Katastrophenschutz", "Investition in Vorbeugung, Infrastruktur, Resilienz"],
  ["Demokratie", "Kostenangst, Misstrauen, Populismus", "transparente Rückverteilung und sichtbare Wirkung"],
];

const co2ExternalSources = [
  ["UBA - Gesellschaftliche Kosten von Umweltbelastungen", "Umweltkosten aus Straßenverkehr, Strom- und Wärmeerzeugung 2022: mindestens 301 Mrd. Euro.", "Begründung, dass Luftschadstoffe, Treibhausgase und Energie-/Verkehrsfolgen reale gesellschaftliche Kosten erzeugen.", "Nicht vollständig identisch mit der erweiterten Systemrechnung der Grafik.", "https://www.umweltbundesamt.de/daten/umwelt-wirtschaft/gesellschaftliche-kosten-von-umweltbelastungen"],
  ["UBA - Umweltkosten von Energie und Straßenverkehr", "Treibhausgase und Luftschadstoffe aus Strom, Wärme und Straßenverkehr verursachen hohe Kosten durch Gesundheit, Ökosysteme, Gebäude und Extremwetter.", "Gesundheits- und Umweltkostenblock.", "Sektorale Abgrenzung beachten.", "https://www.umweltbundesamt.de/daten/umweltindikatoren/indikator-umweltkosten-von-energie-strassenverkehr"],
  ["DEHSt / UBA - Emissionshandelserlöse 2025", "2025 wurden insgesamt rund 21 Mrd. Euro aus dem Emissionshandel erlöst; der nEHS lag bei über 15,2 Mrd. Euro.", "Einordnung: CO₂-Preis-Einnahmen sind öffentliche Mittel, keine verschwundenen Verluste.", "Bruttoeinnahmen sind nicht gleich Netto-Belastung pro Haushalt.", "https://www.umweltbundesamt.de/presse/pressemitteilungen/emissionshandel-21-milliarden-euro-fliessen-in-den"],
  ["UBA - nEHS-Preis 2025/2026", "2025 Festpreis 55 Euro/t; 2026 Versteigerung im Preiskorridor 55-65 Euro/t.", "Faktenblock zum CO₂-Preis.", "Ab 2027 wird die Preisbildung stärker vom Emissionshandel geprägt.", "https://www.umweltbundesamt.de/presse/pressemitteilungen/erstmals-versteigerungen-im-nationalen"],
  ["GWS - Volkswirtschaftliche Folgekosten durch Klimawandel", "Szenarioanalysen zu Klimawandelkosten in Deutschland bis 2050.", "Klimaschadensblock und Anpassungslogik.", "Szenarien, keine exakte Vorhersage.", "https://www.gws-os.com/de/publikationen/alle-publikationen/detail/volkswirtschaftliche-folgekosten-durch-klimawandel-szenarioanalyse-bis-2050"],
  ["UBA - Methodenkonvention / Handbuch Umweltkosten 4.0", "Kostensätze für Treibhausgase und Luftschadstoffe, inklusive NOx und PM2,5.", "Kostenbewertung von Luftschadstoffen.", "Kostensätze sind Modellwerte und kontextabhängig.", "https://www.umweltbundesamt.de/system/files/medien/479/publikationen/2026-02/UBA_Handbuch%20Umweltkosten_Methodenkonvention%204.0.pdf"],
];

const co2InternalSources = [
  ["Produkte als Wirkungsträger", "Produktpreise zeigen heute nur einen Bruchteil der Wahrheit, wenn Klima-, Gesundheits- und Ressourcenfolgen unsichtbar bleiben.", "../../../referenz/kapitel-048-produkte-als-wirkungstraeger/"],
  ["Wirkungssteuer", "Steuern sollen nicht nur Einnahmen erzeugen, sondern Wirkung in Entscheidungen zurückführen.", "../../../referenz/kapitel-037-das-wirkungssteuergesetz-wstg/"],
  ["Wirkungslenkung", "Sichtbarkeit reicht nicht: Wirkung muss in Preise, Steuern, Kapital, Beschaffung und Infrastrukturentscheidungen zurückfließen.", "../../../begriffe/wirkungslenkung/"],
  ["Wirkungshaushalt", "Öffentliche Mittel werden nach Entlastung, Emissionsminderung, Resilienz und Gesundheit gefragt.", "../../../begriffe/wirkungshaushalt/"],
];

function sourceCards(cards) {
  return `<div class="card-grid deep-dive-source-grid">
            ${cards
              .map(
                ([title, shows, useFor, warning, url]) => `<article class="card">
                  <p class="card-kicker">Quelle</p>
                  <h3 class="card-title">${escapeHtml(title)}</h3>
                  <p class="card-text"><strong>Zeigt:</strong> ${escapeHtml(shows)}</p>
                  <p class="card-text"><strong>Verwendet für:</strong> ${escapeHtml(useFor)}</p>
                  <p class="card-text"><strong>Hinweis:</strong> ${escapeHtml(warning)}</p>
                  <p><a class="text-link" href="${escapeHtml(url)}">Quelle öffnen</a></p>
                </article>`
              )
              .join("\n            ")}
          </div>`;
}

const fusionKeyPoints = [
  ["Fusion ist wissenschaftlich wichtig", "Fortschritte bei Plasma, Magneten, Lasern, Materialien und Diagnostik sind real und verdienen Forschung.", "positive"],
  ["Aber noch kein kommerzielles Stromsystem", "Bisher gibt es keine breit verfügbare, netzrelevante, wirtschaftliche Fusionsstromerzeugung.", "warning"],
  ["Target Gain ist nicht Kraftwerksbetrieb", "Ein erfolgreicher Fusionsschuss im Labor ist nicht dasselbe wie kontinuierliche, bezahlbare Stromproduktion mit Wartung, Verfügbarkeit und Netzeinspeisung.", "critical"],
  ["ITER, STEP und DEMO zeigen die Zeitachse", "Große Programme liegen im Bereich 2030er bis 2040er Jahre für Forschungsbetrieb, Prototypen oder Demonstratoren - nicht für sofortige Massenstromversorgung.", "warning"],
  ["Tritium und Materialien bleiben zentrale Hürden", "Kommerzielle Deuterium-Tritium-Fusion braucht Tritium-Selbstversorgung, Brutblankets, strahlenresistente Materialien, Wartung und sichere Brennstoffkreisläufe.", "warning"],
  ["WÖk-Lösung: Forschung plus Sofortwirkung", "Fusion fördern, aber Klimaschutz nicht darauf verschieben: Erneuerbare, Netze, Speicher, Effizienz, Elektrifizierung und Flexibilität jetzt skalieren.", "positive"],
];

const fusionStageMatrix = [
  ["Physikalischer Effekt", "Kann Fusion prinzipiell Energie freisetzen?", "Fusionsreaktionen", "kein Kraftwerksbeweis"],
  ["Plasmaexperiment", "Kann ein Plasma eingeschlossen oder gezündet werden?", "Tokamak, Stellarator, Laserfusion", "keine kontinuierliche Stromproduktion"],
  ["Target Gain / Q plasma", "Erzeugt das Plasma mehr Energie als direkt eingebracht?", "NIF, ITER-Zielgrößen", "nicht automatisch Nettoanlage"],
  ["Kraftwerkskomponenten", "Funktionieren Blanket, Materialien, Divertor, Tritiumkreislauf, Wartung?", "DEMO-Technologien", "oft noch nicht industriell qualifiziert"],
  ["Demonstrationskraftwerk", "Kann Strom erzeugt und Betrieb demonstriert werden?", "STEP, DEMO", "noch keine Massenmarkttechnologie"],
  ["Kommerzielle Skalierung", "Ist Strom bezahlbar, verfügbar, genehmigt, finanziert und skalierbar?", "zukünftige FPP", "noch offen"],
  ["Systemwirkung", "Senkt es im Zeitfenster Emissionen und Kosten?", "2030/2035/2045", "entscheidend für Politik heute"],
];

const fusionTimelineMatrix = [
  ["bis 2030", "Forschung, Experimente, private Demonstratoren in Entwicklung", "Erneuerbare, Netze, Speicher, Effizienz, Wärmepumpen, E-Mobilität, Lastmanagement"],
  ["2030-2035", "ITER-Inbetriebnahme/Research-Phasen, private Demonstrationsziele möglich, aber unsicher", "schnelle CO₂-Minderung, Industrieelektrifizierung, Wasserstoff für harte Sektoren"],
  ["2035-2045", "STEP/DEMO-nahe Demonstration möglich, aber kommerzielle Breite offen", "nahezu klimaneutrales Energiesystem braucht bereits Infrastruktur"],
  ["nach 2045", "mögliche industrielle Skalierung je nach Erfolg", "potenzieller Zusatzbaustein für saubere Energie, nicht Ersatz für heutiges Handeln"],
];

const fusionBoundaryMatrix = [
  ["Physik", "Kann Fusion Energie freisetzen?", "Grundprinzip und Fortschritt", "Kraftwerksbetrieb"],
  ["Experiment", "Wurde Zündung oder Gain erreicht?", "wissenschaftlicher Durchbruch", "Anlagenenergie, Wiederholrate, Kosten"],
  ["Kraftwerk", "Kann kontinuierlich Strom erzeugt werden?", "Verfügbarkeit, Wartung, Netz", "Plasmaerfolg allein"],
  ["Brennstoff", "Gibt es genügend Tritium?", "Tritiumkreislauf und Brutblankets", "Deuterium-Verfügbarkeit allein"],
  ["Material", "Halten Komponenten Neutronen aus?", "Aktivierung, Schaden, Wartung", "CO₂-Vorteil"],
  ["Zeit", "Wann ist die Technologie verfügbar?", "Klimawirkung im relevanten Fenster", "langfristige Vision"],
  ["Kosten", "Was kostet Strom und Infrastruktur?", "Finanzierung, Skalierung, Risiken", "reine Forschungserfolge"],
  ["Alternativen", "Was könnte stattdessen schneller wirken?", "Opportunitätskosten", "Technikoptimismus"],
  ["Demokratie", "Wie wird Zukunftshoffnung kommuniziert?", "Vertrauen, Akzeptanz, Aufschubrisiko", "reine Technikdaten"],
];

const fusionSubclaims = [
  ["„Fusion liefert bald unbegrenzte Energie“", "Langfristiges Potenzial, aber kein gesicherter kurzfristiger Systemhebel.", "Fusion hat theoretisch enormes Potenzial. Aber „bald unbegrenzt“ überspringt Technologiereife, Kraftwerksbetrieb, Kosten, Wartung, Brennstoffkreislauf, Genehmigung und Skalierung. Für Energiepolitik zählt, wann eine Technologie real verfügbar, bezahlbar und netzdienlich wirkt.", "Welche Emissionen, Kosten und Systemrisiken senkt Fusion bis 2030 oder 2035 konkret?"],
  ["„NIF hat Nettoenergie erzeugt“", "Target Gain ist real, aber nicht gleich Kraftwerks-Nettoleistung.", "Die National Ignition Facility hat Fusionszündung und Target-Gain-Erfolge erzielt. Das ist wissenschaftlich enorm wichtig. Aber ein NIF-Schuss ist kein Kraftwerksbetrieb. Bei Laserfusion muss man zwischen Energie am Target, Laserenergie, Anlagenenergie, Wiederholrate, Target-Herstellung, Wärmeauskopplung, Turbine, Wartung und Netzeinspeisung unterscheiden.", "Welche Stufe wurde erreicht: physikalischer Schuss, Anlagen-Nettoenergie oder kommerzielle Stromerzeugung?"],
  ["„ITER beweist, dass Fusion bald kommt“", "ITER ist Forschungsinfrastruktur, kein kommerzielles Kraftwerk.", "ITER soll wichtige Physik- und Technologiefragen des magnetischen Plasmaeinschlusses klären. Er soll aber keinen kommerziellen Strom liefern. Nach neuer Planung liegen wichtige Deuterium-Tritium-Phasen in den späten 2030ern. Danach braucht es Demonstrationskraftwerke wie DEMO, die Stromerzeugung, Wartung, Materialien, Tritiumkreislauf und Verfügbarkeit zeigen.", "Was liefert ITER wann - und welche Maßnahmen liefern bis dahin reale Emissionsminderung?"],
  ["„Fusion braucht keine Brennstofffrage“", "Deuterium ist verfügbar, Tritium-Selbstversorgung bleibt eine zentrale Hürde.", "Viele Fusionskonzepte nutzen Deuterium und Tritium. Deuterium ist vergleichsweise gut verfügbar. Tritium ist radioaktiv, zerfällt mit einer Halbwertszeit von rund 12 Jahren und muss für kommerzielle Anlagen in ausreichender Menge verfügbar sein. Künftige Anlagen müssen Tritium über Brutblankets aus Lithium selbst erzeugen.", "Ist Tritium-Selbstversorgung in realem Kraftwerksbetrieb gezeigt - oder als Konzept geplant?"],
  ["„Fusion hat keinen Atommüll“", "Keine Spaltprodukte wie bei Kernspaltung, aber aktivierte Materialien und Wartungsabfälle müssen bilanziert werden.", "Fusion erzeugt keine langlebigen Spaltprodukte wie klassische Kernspaltung. Das ist ein wichtiger Unterschied. Viele Deuterium-Tritium-Konzepte erzeugen aber energiereiche Neutronen, die Materialien aktivieren und beschädigen können. Komponenten müssen ausgetauscht, abgeschirmt, ferngesteuert gewartet und entsorgt werden.", "Welche radioaktiven Materialströme entstehen, wie lange, in welcher Menge und mit welchen Entsorgungswegen?"],
  ["„Wir können auf Fusion warten“", "Falsches Aufschubargument: Emissionen müssen vor kommerzieller Fusion massiv sinken.", "Die Klimakrise wird durch kumulierte Emissionen getrieben. Warten erhöht spätere Schäden, Anpassungskosten und Risiken. Selbst wenn Fusion später gelingt, ersetzt sie nicht den Aufbau von Netzen, Speichern, Effizienz, Elektrifizierung und erneuerbarer Infrastruktur im aktuellen Zeitfenster.", "Welche Maßnahmen senken bis 2030 und 2035 real Emissionen und Risiken?"],
  ["„Private Start-ups sind schneller als Politik“", "Dynamik ist real, aber Demonstrator, Finanzierung, Regulierung und Skalierung bleiben offen.", "Private Fusion-Start-ups erhöhen Tempo, Kapital und Ideenvielfalt. Aber Ankündigungen, Demonstrationsziele und Prototypen sind nicht gleich kommerzieller Massenmarkt. Auch private Projekte müssen Kraftwerksbetrieb, Verfügbarkeit, Kosten, Genehmigung, Lieferketten, Wartung, Sicherheit und Netzintegration zeigen.", "Was ist angekündigt, was ist demonstriert, und was ist im Stromsystem verfügbar?"],
];

const fusionManipulationPatterns = [
  ["Zukunftsversprechen als Gegenwartsersatz", "Eine mögliche spätere Technologie ersetzt heutiges Handeln.", "Zeitfenster 2030, 2035 und 2045 abfragen."],
  ["Forschungsdurchbruch als Systembeweis", "Ein wissenschaftlicher Erfolg wird als Beweis für kommerzielle Verfügbarkeit behandelt.", "Entwicklungsstufen trennen: Experiment, Demonstrator, Kraftwerk, Markt."],
  ["Target Gain als Netzstrom", "Energiegewinn am Target wird mit Kraftwerks-Nettoleistung verwechselt.", "Target, Laser, Anlage, Turbine und Netz getrennt erklären."],
  ["Tritium ausblenden", "Fusion wird als Brennstofffrage ohne Engpass erzählt.", "Tritium-Selbstversorgung und Brutblankets sichtbar machen."],
  ["Opportunitätskosten unsichtbar", "Forschung, Kapital und politische Aufmerksamkeit werden als unbegrenzt behandelt.", "Was wirkt mit demselben Geld bis 2030?"],
  ["Hype als Sedativ", "Technikoptimismus beruhigt Transformationsangst und senkt Handlungsdruck.", "Hoffnung mit Handlungspflicht koppeln."],
];

const fusionExternalSources = [
  ["ITER - Updated baseline and timeline", "ITER beschreibt Zielsetzung, neue Baseline und Zeitachsen der Forschungsanlage.", "ITER Zeitplan, volle magnetische Energie, Deuterium-Tritium-Betrieb.", "ITER ist Forschungsanlage, kein kommerzielles Stromkraftwerk.", "https://www.iter.org/few-lines"],
  ["Max-Planck-Institut für Plasmaphysik - Neuer ITER-Zeitplan", "Wissenschaftliche Einordnung des aktualisierten ITER-Zeitplans.", "2034 wissenschaftlicher Betrieb, 2036 volle magnetische Energie, Zeitplanrisiko.", "Zeitpläne können sich ändern.", "https://www.ipp.mpg.de/5434926/ITER_baseline_2024"],
  ["LLNL / National Ignition Facility - Achieving Fusion Ignition", "Einordnung der NIF-Zündungs- und Target-Gain-Erfolge.", "Fusionszündung, Target Gain, April-2025-Ergebnis.", "Target Gain ist nicht Kraftwerks-Nettoleistung.", "https://lasers.llnl.gov/science/achieving-fusion-ignition"],
  ["U.S. Department of Energy - Fusion ignition announcement", "Historischer Kontext des Zündungsdurchbruchs am DOE National Laboratory.", "wissenschaftlicher Kontext und Forschungsdurchbruch.", "Presseereignis nicht als kommerzielle Verfügbarkeit lesen.", "https://www.energy.gov/articles/doe-national-laboratory-makes-history-achieving-fusion-ignition"],
  ["STEP Fusion - UK prototype fusion powerplant", "Britisches Programm für einen Prototyp-Fusionskraftwerksdemonstrator.", "Prototyp-Ziel bis 2040 und UK-Programm.", "Prototyp ist nicht gleich kommerzieller Massenmarkt.", "https://stepfusion.com/"],
  ["UKAEA - STEP Programme", "Programmseite zur Entwicklung von STEP und industrieller Fusionskraftwerkstechnologie.", "STEP-Programm, Kraftwerksdemonstration, Industrieentwicklung.", "Projektziele regelmäßig aktualisieren.", "https://www.ukaea.org/work/step/"],
  ["EUROfusion - DEMO", "DEMO soll nach ITER Kraftwerkstechnologien, Stromerzeugung, Wartung und Integration demonstrieren.", "DEMO als ITER-Nachfolger und Technologie-Demonstration.", "DEMO ist Demonstration, nicht kommerzielle Serienanlage.", "https://euro-fusion.org/programme/demo/"],
  ["EUROfusion - Roadmap", "Europäische Roadmap von Forschung über ITER/DEMO zu kommerzieller Energie.", "Schritte zu kommerzieller Fusionsenergie.", "Roadmap ist Planungsrahmen, nicht gesicherter Markteintritt.", "https://euro-fusion.org/eurofusion/roadmap/"],
  ["IAEA - Tritium Breeding", "IAEA-Portal zu Tritium-Brutblankets und deren Funktionen.", "Tritium-Selbstversorgung, Breeding Blankets, Brennstoffkreislauf.", "Fachportal; mit ITER/DEMO-Quellen ergänzen.", "https://nucleus.iaea.org/sites/connect/FUSEpublic/SitePages/Tritium-Breeding.aspx"],
  ["ITER - Tritium breeding", "ITER erklärt Test Blanket Modules und Brutblanket-Technologie.", "ITER Test Blanket Modules und Brutblanket-Technologie.", "ITER testet Mockups; kommerzielle Selbstversorgung ist eine spätere Hürde.", "https://www.iter.org/machine/supporting-systems/tritium-breeding"],
  ["IAEA - Fusion Energy", "Grundlagenpapier zu Fusion, Brennstoffen und künftigen Kraftwerken.", "Grundlagen Fusion, Deuterium-Tritium, künftige Kraftwerke.", "Grundlagenquelle; aktuelle Projektstände separat prüfen.", "https://www.iaea.org/sites/default/files/fusionenergy.pdf"],
  ["UKAEA - Materials challenges for commercial fusion", "Fachpaper zu Materialschäden, Tritium, Transmutation und Neutronenbeschuss.", "Materialschäden, Tritium, Transmutation, Neutronenbeschuss.", "Fachpaper; verständlich zusammenfassen.", "https://scientific-publications.ukaea.uk/wp-content/uploads/UKAEA-CCFE-PR2152.PDF"],
];

const windKeyPoints = [
  ["Vögel und Fledermäuse sind reale Schutzgüter", "Windenergie kann Kollisionen, Störungen und Habitatkonflikte verursachen. Das muss über Standortwahl, Monitoring und Schutzmaßnahmen ernsthaft minimiert werden.", "warning"],
  ["Fossile Alternativen sind nicht naturneutral", "Kohle, Öl und Gas verursachen Klimaschäden, Luftschadstoffe, Wasserbelastungen, Bergbaufolgen, Flächenverbrauch und Biodiversitätsverluste.", "critical"],
  ["Waldstandorte sind besonders sensibel", "Wind im Wald kann möglich sein, erfordert aber strenge Standortprüfung, Ausschluss ökologisch wertvoller Flächen und wirksame Schutzmaßnahmen.", "warning"],
  ["Beton und Rückbau müssen geregelt sein", "Fundamente, Wege, Kabel, Stahl, Rotorblätter und Betriebsmittel brauchen Rückbau-, Recycling- und Sicherungsstandards.", "neutral"],
  ["Infraschall darf nicht als Panikframe dienen", "Sorgen müssen ernst genommen werden. Nach aktuellem Forschungsstand gibt es aber keine belastbare Evidenz für gesundheitliche Schäden durch Windenergie-Infraschall unterhalb der Wahrnehmungsschwelle.", "warning"],
  ["WÖk-Lösung: Standortscorecard", "Jeder Standort wird nach Klima, Arten, Wald, Boden, Landschaft, Gesundheit, Akzeptanz, Rückbau, Netznutzen und Alternativenvergleich bewertet.", "positive"],
];

const windBoundaryMatrix = [
  ["Einzelanlage", "Welche Wirkung hat dieses Windrad?", "Standort, Arten, Schall, Schatten, Fundament", "Energiesystem und fossile Alternativen"],
  ["Artenschutz", "Welche Arten sind betroffen?", "Vögel, Fledermäuse, Habitate, Zugrouten", "Klimarisiko für Arten und Lebensräume"],
  ["Waldstandort", "Welche Waldwirkung entsteht?", "Rodung, Wege, Quartiere, Boden", "Standortunterschiede und Alternativen"],
  ["Material", "Welche Rohstoffe und Baustoffe werden genutzt?", "Beton, Stahl, Verbundstoffe, Seltene Erden je nach Technik", "vermiedene fossile Brennstoffe"],
  ["Rückbau", "Was passiert nach Betriebsende?", "Fundament, Rotorblätter, Recycling, Boden", "Lebenszyklusnutzen der Stromerzeugung"],
  ["Energiesystem", "Was ersetzt Windstrom?", "CO₂-Minderung, Versorgung, Preis, Speicherbedarf", "lokale Konflikte"],
  ["Gesundheit", "Welche Belastungen entstehen?", "Schall, Schatten, Stress, Akzeptanz", "Klimagesundheit und Luftschadstoffe fossiler Alternativen"],
  ["Demokratie", "Wie wird entschieden?", "Beteiligung, Vertrauen, Transparenz, Konfliktkultur", "technische Detailfragen"],
];

const windSubclaims = [
  ["„Windräder töten Vögel“", "Realer Artenschutzkonflikt, aber kein pauschales Blockadeargument.", "Ja, Windenergieanlagen können für bestimmte Vogelarten gefährlich sein. Besonders relevant sind kollisionsgefährdete Arten und Standorte mit Brutplätzen, Nahrungshabitaten oder Flugkorridoren. Der Denkfehler beginnt, wenn aus diesem realen Konflikt ein pauschales Nein zu Windenergie abgeleitet wird. Wirkungsökonomisch zählt der Standort: Welche Arten sind betroffen? Welche Daten liegen vor? Welche Abstände, Abschaltungen, Antikollisionssysteme oder Ausgleichsmaßnahmen sind möglich? Und welche fossilen Klima- und Biodiversitätsschäden werden durch Windenergie vermieden?", "Welche Kombination aus Standortwahl, Artenschutzdaten, Abschaltregeln und Alternativenvergleich schützt Arten und Klima am besten?"],
  ["„Windräder töten Fledermäuse“", "Reales Risiko; Abschaltalgorithmen, Standortwahl und Monitoring sind zentrale Gegenmaßnahmen.", "Fledermäuse können durch Kollision oder Druckunterschiede gefährdet werden. Das ist kein Randthema, sondern ein echter Betriebskonflikt. Gerade deshalb braucht es Standortdaten, Aktivitätsmessungen, temporäre Abschaltungen bei hoher Fledermausaktivität, Monitoring und lernende Betriebsregeln. Der falsche Schluss wäre, aus einem lösbaren Risikomanagementproblem ein pauschales Nein zu Windenergie zu machen.", "Welche Abschaltregeln und Standortdaten senken das Fledermausrisiko konkret?"],
  ["„Windräder zerstören den Wald“", "Wahrer Waldschutzkern, falsches Pauschalurteil.", "Windenergie im Wald ist besonders sensibel. Alte Wälder, naturnahe Wälder, Schutzgebiete, Fledermausquartiere, Brutplätze, Feuchtgebiete und ökologisch wertvolle Lebensräume dürfen nicht leichtfertig überplant werden. Aber nicht jeder Waldstandort ist gleich. Monotone Wirtschaftswälder, vorbelastete Flächen, Kalamitätsflächen oder Standorte mit geringer ökologischer Konfliktlage müssen anders bewertet werden als alte naturnahe Wälder. Wirkungsökonomisch braucht es eine Wald-Standortscorecard: Arten, Boden, Wasser, Kohlenstoffspeicher, Zuwegung, Rückbau, Netzanbindung und fossile Alternativen.", "Wo kann Windenergie mit geringster Wald- und Artenwirkung den größten fossilen Schaden ersetzen?"],
  ["„Betonfundamente verseuchen den Boden“", "Reales Material- und Rückbauthema, aber kein Gesamtargument gegen Windenergie.", "Windenergieanlagen benötigen Fundamente, Zuwegungen, Stahl, Beton, Kabel, Transformatoren und Rotorblätter. Das ist Wirkung. Deshalb braucht Windenergie klare Rückbau- und Recyclingregeln. Flachgründungen sollten nach UBA-Empfehlung vollständig zurückgebaut werden; Beton und Stahl können getrennt und materialspezifisch verwertet werden. Schwieriger sind Rotorblätter aus faserverstärkten Kunststoffen. Hier braucht es Produktverantwortung, Recyclingkapazitäten, Design for Recycling, Rückstellungen und behördliche Kontrolle.", "Welche Rückbau-, Recycling- und Materialstandards machen Windenergie über den Lebenszyklus am wirkungsvollsten?"],
  ["„Windrad-Rotorblätter sind Sondermüll“", "Recycling ist anspruchsvoll, aber lösbar und regulierungsbedürftig.", "Rotorblätter sind wegen Verbundmaterialien anspruchsvoller als Stahl oder Beton. Daraus folgt aber nicht, dass Windkraft insgesamt ein Entsorgungsproblem ohne Lösung ist. Mechanische, thermische und chemische Verfahren, Zement-Koprozessierung, neue Harze und recyclebare Blattdesigns verschieben die Bilanz. Entscheidend ist, ob Projekte Rückbau, Logistik, Nachweis und echte Kreislaufpfade verbindlich mitplanen.", "Wird hier über alte Rotorblätter, aktuelle Recyclingverfahren oder neue recyclebare Designs gesprochen?"],
  ["„Infraschall macht krank“", "Sorgen ernst nehmen, Panikframe vermeiden.", "Windenergieanlagen erzeugen Schall, darunter auch tieffrequenten Schall und Infraschall. Anwohner:innen können sich durch hörbaren Schall, Schattenwurf, Befeuerung oder visuelle Dominanz belastet fühlen. Diese Belastungen sind ernst zu nehmen. Nach aktuellem Stand der Forschung gibt es jedoch keine belastbare Evidenz dafür, dass Infraschall von Windenergieanlagen unterhalb der Wahrnehmungsschwelle gesundheitliche Schäden verursacht. Wirkungsökonomisch heißt das: Beschwerden nicht verspotten, aber Ursache, Wahrnehmung, Abstand, Schallgutachten, Beteiligung, Stress und Nocebo-Effekte sauber trennen.", "Welche Standort-, Schall-, Schatten- und Beteiligungsregeln minimieren reale Belastung und Angst?"],
  ["„Windräder verschandeln die Landschaft“", "Landschaftswirkung ist real, aber kein objektiver Beweis gegen Windenergie.", "Landschaft, Heimatgefühl und Sichtbeziehungen sind reale Akzeptanzfaktoren. Sie dürfen nicht als bloße Einbildung abgetan werden. Zugleich ist Landschaftswirkung kein automatischer Systembeweis gegen Windenergie. Entscheidend sind Beteiligung, Abstände, Konzentrationszonen, Repowering, lokale Wertschöpfung und der Vergleich mit fossiler Infrastruktur, Tagebau, Leitungen und Klimafolgen.", "Welche Planung reduziert Landschaftsbelastung und stärkt lokale Beteiligung?"],
  ["„Ohne Wind gibt es keinen Strom“", "Systemfrage: Wind braucht Netze, Speicher, Flexibilität, europäische Kopplung und andere Erneuerbare.", "Windenergie ist kein isolierter Dauerlieferant, sondern Teil eines Stromsystems. Dunkelflauten, Netze, Speicher, Lastmanagement, europäische Kopplung, Solarenergie, Biomasse, Wasserkraft, flexible Kraftwerke und Effizienz gehören in dieselbe Bilanz. Der Fehler liegt darin, einzelne Wetterlagen als Beweis gegen den gesamten erneuerbaren Systemumbau zu verwenden.", "Welche Kombination aus Wind, Solar, Netzen, Speichern und Flexibilität liefert zuverlässig die beste Netto-Wirkung?"],
];

const windManipulationPatterns = [
  ["Teilfakt als Totalurteil", "Ein echter Konflikt wird als Gesamtbeweis gegen Windenergie genutzt.", "Teilaspekt anerkennen und Systemgrenze öffnen."],
  ["Fossile Alternative unsichtbar", "Wind wird mit idealer Natur verglichen, nicht mit realen fossilen Schäden.", "Alternativenvergleich erzwingen."],
  ["Einzelfall als Systembeweis", "Ein schlecht geplanter Standort wird als Beweis gegen alle Windenergie genutzt.", "Standortqualität, Daten und Schutzmaßnahmen prüfen."],
  ["Angstanker", "Maximalbilder wie Betonwüste, Vogelsterben oder Krankheit bleiben emotional hängen.", "Angst anerkennen, Daten und konkrete Schutzregeln zeigen."],
  ["Falsches Dilemma", "Es wird so getan, als müsse man zwischen Natur und Klimaschutz wählen.", "Gemeinsames Ziel setzen: Natur und Klima gegen fossile Schäden."],
  ["Beweislastumkehr", "Unbelegte Gesundheitsbehauptungen müssen angeblich widerlegt werden.", "Welche konkrete Evidenz, welcher Schallpegel, welche Quelle?"],
];

const windExternalSources = [
  ["UBA - Ausbau Windenergie an Land: 2-Prozent-Ziel", "Das 2-Prozent-Flächenziel bis 2032 und die Einordnung des Flächenbedarfs.", "Flächenziel, Ausbauziele und Systembedarf.", "Flächenziel ist nicht gleich konkrete Genehmigung; Standortqualität bleibt entscheidend.", "https://www.umweltbundesamt.de/themen/ausbau-der-windenergie-an-land-2-prozent-ziel"],
  ["Windenergieflächenbedarfsgesetz", "Rechtlicher Rahmen und Flächenbeitragswerte.", "Rechtsrahmen für Windenergieflächen.", "Rechtsstand regelmäßig prüfen.", "https://www.gesetze-im-internet.de/windbg/BJNR135310022.html"],
  ["BfN - Windenergie im Wald", "Waldstandorte brauchen besonders sorgfältige Untersuchung von Arten und Lebensstätten.", "Wald, Arten- und Naturschutz, Standortprüfung.", "Differenziert lesen; nicht als pauschales Ja oder Nein.", "https://www.bfn.de/windenergie-im-wald"],
  ["BfN-Schriften 742 - Schutz von Fledermäusen beim Ausbau der Windenergie", "Fachliche Einordnung von Fledermausschutz, Konfliktrisiken und Schutzmaßnahmen beim Windenergieausbau.", "Fledermausrisiken, Abschaltungen, Monitoring und Standortprüfung.", "PDF; konkrete Länderregelungen und Standortdaten zusätzlich prüfen.", "https://www.natur-und-erneuerbare.de/fileadmin/Daten/Download_Dokumente/01_Skripte/BfN-Schriften-742-Schutz-Fledermaeuse-Ausbau-Windenergie-2025.pdf"],
  ["KNE - Studien zu Windenergie, Biodiversität, Vögeln und Fledermäusen", "Überblick über deutsche Studien zu Windenergie, Biodiversität, Vögeln und Fledermäusen.", "Artenschutz, Studienlage und Konflikteinordnung.", "Studienüberblick; einzelne Arten und Standorte separat prüfen.", "https://www.naturschutz-energiewende.de/fragenundantworten/277-deutsche-studien-windenergie-biodiversitaet-voegel-fledermaeuse/"],
  ["Fachagentur Wind & Solar - Natur- und Artenschutz", "Praxisnahe Übersicht zu Natur- und Artenschutz bei Windenergieprojekten.", "Planung, Genehmigung, Artenschutz und Kommunikation.", "Praxisportal; Rechtsstand und Landesvorgaben prüfen.", "https://www.fachagentur-wind-solar.de/wind/natur-und-artenschutz"],
  ["UBA - Rückbau, Recycling, Repowering", "Rückbau, Recycling und Repowering von Windenergieanlagen.", "Fundamente, Beton, Stahl, Rotorblätter und Produktverantwortung.", "Rotorblätter und Verbundstoffe bleiben besondere Herausforderung.", "https://www.umweltbundesamt.de/themen/abfall-ressourcen/produktverantwortung-in-der-abfallwirtschaft/windenergieanlagen-rueckbau-recycling-repowering"],
  ["UBA - Gute Praxis Rückbau und Recycling von Windenergieanlagen", "Konzept und Maßnahmen zur Sicherung guter Praxis bei Rückbau und Recycling von Windenergieanlagen.", "Rückbaupflicht, Fundamentrückbau, Beton/Stahl-Trennung und Recyclingstandards.", "PDF; projektspezifische Genehmigungsauflagen bleiben entscheidend.", "https://www.umweltbundesamt.de/system/files/medien/479/publikationen/texte_48-2023_entwicklung_eines_konzepts_und_massnahmen_zur_sicherung_einer_guten_praxis_bei_rueckbau_und_recycling_von_windenergieanlagen.pdf"],
  ["UBA - Infraschall von Windenergieanlagen", "Einordnung tieffrequenten Schalls und Infraschalls bei Windenergieanlagen.", "Gesundheitsframe, Evidenzlage und Bürgerkommunikation.", "Beschwerden ernst nehmen; hörbaren Schall, Schatten, Stress und Nocebo sauber trennen.", "https://www.umweltbundesamt.de/system/files/medien/2380/dokumente/umid_01-2021-infraschall1.pdf"],
  ["UBA - Infraschall einfach erklärt", "Allgemein verständliche Erklärung zu Infraschall, Quellen und Einordnung.", "Einordnung von Sorgen, Messbarkeit und Kommunikation.", "Grundlagenquelle; konkrete Immissionswerte standortbezogen prüfen.", "https://www.umweltbundesamt.de/publikationen/infraschall-einfach-erklaert"],
  ["Fraunhofer ISE - Stromgestehungskosten 2024", "Kostenvergleich verschiedener Stromerzeugungstechnologien.", "Kosten- und Alternativenvergleich.", "Stromgestehungskosten sind nicht Endkundenpreis; Systemkosten ergänzen.", "https://www.ise.fraunhofer.de/de/veroeffentlichungen/studien/studie-stromgestehungskosten-erneuerbare-energien.html"],
  ["UBA - Emissionsbilanz erneuerbarer Energieträger", "Vermiedene Emissionen durch erneuerbare Energien.", "Systemnutzen und fossile Verdrängung.", "Jahresbezogene Bilanz; Standortwirkung separat prüfen.", "https://www.umweltbundesamt.de/system/files/medien/11850/publikationen/03_2025_cc_emissionsbilanz_erneuerbarer_energien_2023.pdf"],
];

function renderFusionDossier(claim, mode = "live") {
  const answers = expandedAnswers(claim);
  const sectionLabel = mode === "detail" ? "Detail" : "Live";
  const canonicalPath = mode === "detail" ? "detail" : "live";
  const matrixTable = (caption, rows, columns = ["Stufe", "Leitfrage", "Beispiel", "Was oft verwechselt wird"]) => `<div class="dossier-matrix-wrap">
            <table class="dossier-matrix">
              <caption>${escapeHtml(caption)}</caption>
              <thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead>
              <tbody>${rows.map((row) => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
            </table>
          </div>`;
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero dossier-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">${sectionLabel}</a> / Fusion</nav>
          <p class="hero-kicker">Wirkungsradar Leuchtturm · checked_candidate</p>
          <h1 class="hero-title">Fusion löst das Energieproblem?</h1>
          <p class="hero-subtitle">${escapeHtml(claim.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(claim.abstract)}</p>
          <p class="radar-abstract"><strong>Kurzformel:</strong> Fusion erforschen. Aber nicht auf Fusion warten.</p>
          <p class="formula-note"><strong>Hero-Hinweis:</strong> Fusion ist Forschung mit Zukunftspotenzial. Dieses Dossier kritisiert nicht Forschung, sondern das Aufschubnarrativ.</p>
          <p class="radar-status-line"><span>Kurzurteil: ${escapeHtml(claim.shortJudgement)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Status: checked_candidate</span></p>
        </div>
      </section>
      ${summaryGrid(fusionKeyPoints, "Fusion Dossier - Das Wichtigste in 6 Punkten")}
      <nav class="topic-subnav" aria-label="Dossier Navigation" data-search-exclude>
        <a href="#live-antworten">Live antworten</a>
        <a href="#zeitfenster-technologie">Zeitfenster &amp; Technologie verstehen</a>
        <a href="#deep-dive-quellen">Deep Dive &amp; Quellen</a>
      </nav>
      <section class="section dossier-tab-panel" id="live-antworten">
        <div>
          <div class="section-header"><p class="hero-kicker">Live antworten</p><h2>Forschung anerkennen, Aufschub stoppen.</h2></div>
          <div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge">
            <details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">Kurzantwort · ${words(answers.ten_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.ten_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">Einordnung · ${words(answers.thirty_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.thirty_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">Lange Antwort · ${words(answers.two_minutes)} Wörter</span></summary><p>„${escapeHtml(answers.two_minutes)}“</p></details>
          </div>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Gute Rückfrage</p><h3 class="card-title">${escapeHtml(claim.redirectQuestion)}</h3></article>
            <article class="card"><p class="card-kicker">Frame sichtbar machen</p><p class="card-text">Ich übernehme nicht den Frame „Fusion statt Energiewende“. Die richtige Wirkungsfrage lautet: Welche Technologie wirkt wann, zu welchen Kosten und mit welchen Risiken?</p></article>
          </div>
          <article class="card"><p class="card-kicker">Nicht ins Stöckchen springen</p><ul class="clean-list">${claim.dontDo.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
        </div>
      </section>
      <section class="section section-soft dossier-tab-panel" id="zeitfenster-technologie">
        <div>
          <div class="section-header"><p class="hero-kicker">Zeitfenster &amp; Technologie verstehen</p><h2>Forschung ist nicht dasselbe wie Systemwirkung.</h2><p>Fusion ist ein gutes Beispiel dafür, warum der Wirkungsradar zwischen Hoffnung, Forschung, Demonstration, Industrialisierung und realer Systemwirkung unterscheiden muss. Ein technologischer Durchbruch kann wissenschaftlich enorm sein und trotzdem für aktuelle Energiepolitik noch keine verfügbare Infrastruktur darstellen.</p></div>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Was stimmt?</p><ul class="clean-list"><li>Fusion hat langfristig enormes Potenzial.</li><li>Fusionsreaktionen können sehr hohe Energiedichten erreichen.</li><li>Deuterium ist vergleichsweise gut verfügbar.</li><li>Im Betrieb entstehen keine CO₂-Emissionen wie bei fossilen Kraftwerken.</li><li>Fusion hat keine klassische Kettenreaktion wie Kernspaltung.</li><li>Forschungserfolge bei Magneten, Lasern, Plasmaeinschluss und Diagnostik sind real.</li><li>ITER, STEP, DEMO und private Start-ups zeigen internationale Dynamik.</li><li>Forschung kann technologische Spillover erzeugen.</li><li>Langfristig könnte Fusion ein Baustein einer sauberen Energieversorgung werden.</li></ul></article>
            <article class="card"><p class="card-kicker">Was fehlt?</p><ul class="clean-list"><li>Es gibt noch keine kommerziell verfügbare Fusionsstromversorgung.</li><li>Ein physikalischer Durchbruch ist nicht gleich Kraftwerksbetrieb.</li><li>Target Gain ist nicht Net Electricity Gain.</li><li>Dauerbetrieb, Wartung und Anlagenverfügbarkeit sind nicht ausreichend skalierte Kraftwerksfragen.</li><li>Deuterium-Tritium-Fusion braucht Tritium-Selbstversorgung über Brutblankets.</li><li>Neutronen belasten Materialien, aktivieren Komponenten und erschweren Wartung.</li><li>Kosten, Finanzierung, Genehmigung, Lieferketten und Bauzeiten sind offen.</li><li>Selbst optimistische Demonstratoren ersetzen nicht die Emissionsminderung bis 2030.</li><li>Der Denkfehler ist, Zukunftspotenzial mit Gegenwartsverfügbarkeit zu verwechseln.</li></ul></article>
          </div>
          ${matrixTable("Welche Entwicklungsstufe wird verwechselt?", fusionStageMatrix)}
          ${matrixTable("Wann wirkt was?", fusionTimelineMatrix, ["Zeitfenster", "Fusionsstatus", "Relevante Energiepolitik"])}
          ${matrixTable("Welche Bilanzgrenze wird falsch gesetzt?", fusionBoundaryMatrix, ["Bilanzgrenze", "Leitfrage", "Was sie zeigt", "Was sie ausblenden kann"])}
          <p class="formula-note">Fusion kann eine Option für spätere Systemarchitektur sein. Sie ist keine Entschuldigung für Verzögerung in diesem Jahrzehnt.</p>
        </div>
      </section>
      <section class="section dossier-tab-panel" id="unterclaims">
        <div>
          <div class="section-header"><p class="hero-kicker">Unterclaims</p><h2>Hype-Sätze sauber aufklappen.</h2></div>
          <div class="radar-answer-accordion">${fusionSubclaims.map(([title, judgement, text, question]) => `<details class="radar-answer-item"><summary><span class="radar-answer-time">${escapeHtml(title)}</span> <span class="radar-answer-label">${escapeHtml(judgement)}</span></summary><p>${escapeHtml(text)}</p><p><strong>Bessere Wirkungsfrage:</strong> ${escapeHtml(question)}</p></details>`).join("\n            ")}</div>
        </div>
      </section>
      <section class="section section-soft" id="psychologischer-wirkungscheck">
        <div>
          <div class="section-header"><p class="hero-kicker">Psychologischer Wirkungscheck</p><h2>Warum Fusion als Aufschub so gut funktioniert.</h2><p>Fusion bietet psychologisch eine ideale Entlastung: große Energie, wenig CO₂, Hightech-Optimismus und scheinbar weniger Veränderungsdruck. Zukunftshoffnung reduziert Gegenwartsdruck.</p></div>
          ${summaryGrid([["Technological Fix Bias", "Eine technische Zukunftslösung wirkt attraktiver als unbequeme Gegenwartsmaßnahmen.", "warning"], ["Optimism Bias", "Menschen überschätzen die Wahrscheinlichkeit schneller Durchbrüche und unterschätzen Zeit-, Kosten- und Skalierungsrisiken.", "warning"], ["Present Bias", "Unbequeme heutige Investitionen werden leichter verschoben, wenn eine spätere Lösung plausibel klingt.", "critical"], ["Status-quo-Bias", "Fusion erlaubt, bestehende fossile oder träge Strukturen länger als Übergang zu rahmen.", "critical"], ["Komplexitätsreduktion", "Viele Systemfragen werden zu einem einfachen Versprechen: bald kommt die perfekte Energiequelle.", "warning"], ["Motivated Reasoning", "Wer Transformation ablehnt, nutzt Fusion als rational klingende Begründung für Aufschub.", "warning"]], "Fusion Psychologie", "deep-dive-inline-summary")}
        </div>
      </section>
      <section class="section" id="deep-dive-quellen">
        <div>
          <div class="section-header"><p class="hero-kicker">Deep Dive &amp; Quellen</p><h2>Wirkstoff, Manipulationsmuster, Wirkungspfad und Quellen.</h2></div>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Wirkstoff</p><h3 class="card-title">Zukunftstechnologie als Aufschubsedativ</h3><p class="card-text">Eine reale oder mögliche künftige Technologie wird genutzt, um heutige Handlungsnotwendigkeit zu beruhigen oder zu verschieben. Der Blick wandert vom aktuellen Emissions- und Infrastrukturzeitfenster auf eine spätere technische Lösung.</p></article>
            <article class="card"><p class="card-kicker">Narrativanalyse</p><h3 class="card-title">Technikwunder-Aufschub</h3><p class="card-text">Hoffnung ist nicht das Problem. Problematisch wird Hoffnung, wenn sie Handeln ersetzt und politisch verfügbare Maßnahmen entwertet.</p></article>
          </div>
          <div class="card-grid deep-dive-source-grid">${fusionManipulationPatterns.map(([label, description, counter]) => `<article class="card"><p class="card-kicker">Manipulationsmuster</p><h3 class="card-title">${escapeHtml(label)}</h3><p class="card-text">${escapeHtml(description)}</p><p class="card-text"><strong>Gegenbewegung:</strong> ${escapeHtml(counter)}</p></article>`).join("")}</div>
          <ol class="timeline radar-flow radar-effect-path">${claim.effectPath.map(([label, description], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(description)}</p></div></li>`).join("")}</ol>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Folgen falschen Handelns</p><ul class="clean-list">${claim.consequences.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
            <article class="card"><p class="card-kicker">Leitsatz</p><h3 class="card-title">Eine Technologie, die vielleicht später hilft, darf nicht verhindern, dass wir heute handeln.</h3><p class="card-text">Die Klimakrise wird im Zeitfenster entschieden, nicht im Zukunftsversprechen.</p></article>
          </div>
          ${summaryGrid([["Mensch", claim.mpd.mensch, "warning"], ["Planet", claim.mpd.planet, "warning"], ["Demokratie", claim.mpd.demokratie, "critical"]], "Fusion MPD", "mpd-impact-panel")}
          ${summaryGrid([["SDGs", claim.sdgs.join(" / "), "positive"], ["SDG+", claim.sdgPlus.join(" / "), "positive"], ["Wirkungsrisiko", claim.riskLevel, "critical"]], "Fusion SDG", "climate-sdg-panel")}
          ${summaryGrid([["Zeit bis netzdienlicher Wirkung", "Bewertet, wann eine Technologie real Strom oder Systemdienstleistung liefert.", "warning"], ["Kraftwerks-Nettoleistung", "Unterscheidet physikalischen Gain von realer Stromabgabe ins Netz.", "critical"], ["Technologiereifegrad", "Bewertet Stufe von Forschung, Demonstrator, Pilot und kommerzieller Skalierung.", "warning"], ["Tritium- und Materialkreislauf", "Bewertet Brennstoff, Brutblanket, Aktivierung, Komponentenwechsel und Entsorgung.", "warning"], ["CO₂-Minderung im relevanten Zeitfenster", "Bewertet Emissionswirkung bis 2030, 2035 und 2045.", "positive"], ["Wissenschaftsvertrauen", "Bewertet transparente Kommunikation von Fortschritt, Unsicherheit und Grenzen.", "positive"]], "Fusion Indikatorfamilien", "deep-dive-inline-summary")}
          ${woekSolutionMatrix(claim.woekSolution)}
          <section class="section section-soft" aria-labelledby="fusion-internal-links">
            <div class="card">
              <p class="card-kicker">Interne Links</p>
              <h2 class="card-title" id="fusion-internal-links">Narrative, Begriffe und verwandte Dossiers.</h2>
              <div class="radar-link-cluster">
                <a href="/wirkungsradar/narrative/technikwunder-aufschub/">Technikwunder-Aufschub</a>
                <a href="/wirkungsradar/narrative/fusion-als-rettung/">Fusion als Rettung</a>
                <a href="/wirkungsradar/narrative/target-gain-verwechslung/">Target-Gain-Verwechslung</a>
                <a href="/wirkungsradar/narrative/zeitfensterblindheit/">Zeitfensterblindheit</a>
                <a href="/wirkungsradar/narrative/hype-als-sedativ/">Hype als Sedativ</a>
                <a href="/wirkungsradar/narrative/forschung-gegen-transformation/">Forschung gegen Transformation</a>
                <a href="/begriffe/fusion/">Fusion</a>
                <a href="/begriffe/target-gain/">Target Gain</a>
                <a href="/begriffe/kraftwerks-nettoleistung/">Kraftwerks-Nettoleistung</a>
                <a href="/begriffe/tritium/">Tritium</a>
                <a href="/begriffe/brutblanket/">Brutblanket</a>
                <a href="/begriffe/technologiereifegrad/">Technologiereifegrad</a>
                <a href="/begriffe/zeitfensterblindheit/">Zeitfensterblindheit</a>
                <a href="/begriffe/aufschubnarrativ/">Aufschubnarrativ</a>
              </div>
            </div>
          </section>
          ${sourceCards(fusionExternalSources)}
          ${internalLinks()}
          ${factStatusBadge()}
        </div>
      </section>
    </main>`;
  return pageShell({
    title: `Fusion löst das Energieproblem? - Wirkungsradar ${sectionLabel} | Wirkungsökonomie`,
    description: sentence(claim.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/${canonicalPath}/${claim.slug}/`,
    base: "../../../",
    main,
  });
}

function renderWindEnergyNatureDossier(claim, mode = "live") {
  const answers = expandedAnswers(claim);
  const sectionLabel = mode === "detail" ? "Detail" : "Live";
  const canonicalPath = mode === "detail" ? "detail" : "live";
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero dossier-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">${sectionLabel}</a> / Windenergie</nav>
          <p class="hero-kicker">Wirkungsradar Leuchtturm · checked_candidate</p>
          <h1 class="hero-title">Windräder zerstören Natur?</h1>
          <p class="hero-subtitle">${escapeHtml(claim.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(claim.abstract)}</p>
          <p class="radar-abstract"><strong>Kurzformel:</strong> Artenschutz ist real. Blockade ist keine Lösung. Standortscorecard statt Lagerkampf.</p>
          <p class="formula-note"><strong>Hero-Hinweis:</strong> Dieses Dossier verharmlost keine Artenschutzkonflikte. Es prüft, wann Windenergie schädlich, vertretbar oder besonders wirksam ist.</p>
          <p class="radar-status-line"><span>Kurzurteil: ${escapeHtml(claim.shortJudgement)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Status: checked_candidate</span></p>
        </div>
      </section>
      ${summaryGrid(windKeyPoints, "Windenergie Dossier - Das Wichtigste in 6 Punkten")}
      <nav class="topic-subnav" aria-label="Dossier Navigation" data-search-exclude>
        <a href="#live-antworten">Live antworten</a>
        <a href="#zielkonflikt-verstehen">Zielkonflikt verstehen</a>
        <a href="#deep-dive-quellen">Deep Dive &amp; Quellen</a>
      </nav>
      <section class="section dossier-tab-panel" id="live-antworten">
        <div>
          <div class="section-header"><p class="hero-kicker">Live antworten</p><h2>Artenschutz anerkennen, Blockadenarrativ trennen.</h2></div>
          <div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge">
            <details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">Kurzantwort · ${words(answers.ten_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.ten_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">Einordnung · ${words(answers.thirty_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.thirty_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">Lange Antwort · ${words(answers.two_minutes)} Wörter</span></summary><p>„${escapeHtml(answers.two_minutes)}“</p></details>
          </div>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Gute Rückfrage</p><h3 class="card-title">${escapeHtml(claim.redirectQuestion)}</h3></article>
            <article class="card"><p class="card-kicker">Frame sichtbar machen</p><p class="card-text">Ich beantworte das, aber ich übernehme nicht den Frame „Wind gegen Natur“. Die bessere Wirkungsfrage lautet: Welche Energieform schützt Klima, Arten, Gesundheit und Versorgung am besten im Gesamtsystem?</p></article>
          </div>
          <article class="card"><p class="card-kicker">Nicht ins Stöckchen springen</p><ul class="clean-list">${claim.dontDo.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
        </div>
      </section>
      <section class="section section-soft dossier-tab-panel" id="zielkonflikt-verstehen">
        <div>
          <div class="section-header"><p class="hero-kicker">Zielkonflikt verstehen</p><h2>Nicht Natur gegen Klima. Natur und Klima gegen fossile Folgekosten.</h2><p>Die Windenergie-Debatte ist ein Musterfall für Zielkonflikte. Sie berührt Klima, Arten, Landschaft, Wald, Gesundheit, Anwohner:innen, Energiepreise, Versorgungssicherheit, Industrie, Kommunen und Demokratie. Der Fehler vieler Narrative liegt darin, nur einen Ausschnitt sichtbar zu machen: den toten Vogel, den gefällten Baum, das Betonfundament oder die Angst vor Infraschall. Diese Punkte können real sein. Aber sie sind kein vollständiger Wirkungsvergleich.</p></div>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Was stimmt?</p><ul class="clean-list"><li>Windenergieanlagen können für bestimmte Vogelarten ein Kollisionsrisiko darstellen.</li><li>Fledermäuse können durch Kollision oder Druckunterschiede gefährdet werden.</li><li>Windenergie im Wald kann Lebensräume beeinträchtigen und braucht besonders sorgfältige Standortprüfung.</li><li>Fundamente, Kranstellflächen, Wege und Kabeltrassen verändern lokale Böden und Flächen.</li><li>Rotorblätter und faserverstärkte Kunststoffe sind beim Recycling anspruchsvoller als Stahl oder Beton.</li><li>Schall, Schattenwurf und nächtliche Befeuerung können Anwohner:innen belasten.</li><li>Landschaftsbild und Heimatgefühl sind reale Akzeptanzfaktoren.</li><li>Schlechte Standortplanung kann Vertrauen zerstören.</li><li>Kommunen brauchen Beteiligung, finanzielle Rückflüsse und transparente Verfahren.</li><li>Artenschutz darf nicht nur formal abgearbeitet werden.</li></ul></article>
            <article class="card"><p class="card-kicker">Was fehlt?</p><ul class="clean-list"><li>Fossile Energie zerstört Natur ebenfalls: durch Klimaschäden, Luftschadstoffe, Bergbau, Wasserbelastung, Infrastruktur, Transport und Extremwetter.</li><li>Klimawandel ist selbst ein massives Risiko für Arten, Wälder, Böden und Ökosysteme.</li><li>Nicht jeder Standort ist gleich: Brutgebiete, Zugrouten, alte Wälder und Fledermaus-Hotspots müssen anders bewertet werden als vorbelastete Flächen.</li><li>Moderne Schutzmaßnahmen können Risiken senken: Abschaltzeiten, Monitoring, Antikollisionssysteme, Mindestabstände, Standortdaten und Repowering.</li><li>Windenergie ersetzt fossile Stromerzeugung und senkt dadurch Klima- und Gesundheitsschäden.</li><li>Betonfundamente sind ein Rückbau- und Recyclingthema, aber kein Gesamtargument gegen Windenergie.</li><li>Bürgerenergie, kommunale Beteiligung und lokale Wertschöpfung können Akzeptanz stärken.</li><li>Der Denkfehler ist nicht, Artenschutz zu fordern. Der Denkfehler ist, Artenschutz als fossiles Verzögerungsargument zu benutzen.</li></ul></article>
          </div>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Infraschall sauber einordnen</p><h3 class="card-title">Sorgen ernst nehmen, Panikframe vermeiden.</h3><p class="card-text">Windenergieanlagen erzeugen hörbaren Schall, tieffrequenten Schall und Infraschall. Belastung durch hörbaren Schall, Schattenwurf, Befeuerung, Stress und fehlende Beteiligung muss ernst genommen werden. Nach aktueller Evidenz stützt Infraschall unterhalb der Wahrnehmungsschwelle aber keine pauschale Gesundheitsbehauptung.</p><p class="card-text"><strong>Kurzsatz:</strong> Beschwerden prüfen, Ursachen trennen, Angst nicht als Beweis verwenden.</p></article>
            <article class="card"><p class="card-kicker">Recycling und Rückbau</p><h3 class="card-title">Nicht Sondermüll-Frame, sondern Kreislaufpflicht.</h3><p class="card-text">Windenergieanlagen brauchen klare Rückbaupflichten, Rückstellungen und Recyclingpfade. Beton, Stahl und Metalle sind anders zu behandeln als Rotorblätter aus Verbundwerkstoffen. Die Standortscorecard fragt deshalb nach Materialbilanz, Fundamentrückbau, Bodenwiederherstellung und Produktverantwortung.</p><p class="card-text"><strong>Kurzsatz:</strong> Prüfaufgaben lösen - nicht fossile Schäden verlängern.</p></article>
          </div>
          <div class="dossier-matrix-wrap">
            <table class="dossier-matrix">
              <caption>Welche Systemgrenze wird gesetzt?</caption>
              <thead><tr><th>Bilanzgrenze</th><th>Leitfrage</th><th>Was sie zeigt</th><th>Was sie ausblenden kann</th></tr></thead>
              <tbody>${windBoundaryMatrix.map(([boundary, question, shows, hides]) => `<tr><th scope="row">${escapeHtml(boundary)}</th><td>${escapeHtml(question)}</td><td>${escapeHtml(shows)}</td><td>${escapeHtml(hides)}</td></tr>`).join("")}</tbody>
            </table>
          </div>
          <p class="formula-note">Keine Bilanzgrenze allein reicht. Windenergie muss standortspezifisch und systemisch bewertet werden.</p>
        </div>
      </section>
      <section class="section dossier-tab-panel" id="unterclaims">
        <div>
          <div class="section-header"><p class="hero-kicker">Unterclaims</p><h2>Einzelkonflikte sauber aufklappen.</h2></div>
          <div class="radar-answer-accordion">${windSubclaims.map(([title, judgement, text, question]) => `<details class="radar-answer-item"><summary><span class="radar-answer-time">${escapeHtml(title)}</span> <span class="radar-answer-label">${escapeHtml(judgement)}</span></summary><p>${escapeHtml(text)}</p><p><strong>Bessere Wirkungsfrage:</strong> ${escapeHtml(question)}</p></details>`).join("\n            ")}</div>
        </div>
      </section>
      <section class="section section-soft" id="psychologischer-wirkungscheck">
        <div>
          <div class="section-header"><p class="hero-kicker">Psychologischer Wirkungscheck</p><h2>Warum Tier-, Wald- und Heimatbilder so stark wirken.</h2><p>Bilder von toten Vögeln, gerodetem Wald oder riesigen Betonfundamenten sind konkret und emotional. Fossile Klimaschäden sind dagegen verteilt, zeitverzögert und weniger sichtbar. Dadurch wirkt der lokale Windkonflikt oft größer als die systemischen Schäden der fossilen Alternative.</p></div>
          ${summaryGrid([["Verfügbarkeitsheuristik", "Tote Vögel, gerodete Flächen oder Betonfundamente sind sichtbarer als verteilte fossile Schäden.", "warning"], ["Negativity Bias", "Ein lokaler Schaden wirkt emotional stärker als vermiedene Klima-, Gesundheits- und Biodiversitätsschäden.", "warning"], ["Verlustaversion und Heimatbindung", "Landschaftsveränderung fühlt sich wie Verlust an und braucht Beteiligung, Sichtbarkeit von Nutzen und faire Verfahren.", "warning"], ["Nocebo-Risiko", "Angst, Kontrollverlust und schlechte Kommunikation können Belastung verstärken, auch wenn Infraschall selbst nicht als pauschaler Gesundheitsbeleg trägt.", "neutral"], ["Scope Neglect", "Ein einzelner Konflikt wird größer wahrgenommen als die systemische Wirkung von Kohle, Öl und Gas.", "critical"], ["Kognitive Dissonanz", "Wer Natur schützen will und zugleich fossile Alternativen ausblendet, hält zwei widersprüchliche Wirkungsbilder auseinander.", "warning"]], "Wind Psychologie", "deep-dive-inline-summary")}
        </div>
      </section>
      <section class="section" id="deep-dive-quellen">
        <div>
          <div class="section-header"><p class="hero-kicker">Deep Dive &amp; Quellen</p><h2>Wirkstoff, Manipulationsmuster, Wirkungspfad und Quellen.</h2></div>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Wirkstoff</p><h3 class="card-title">Einzelkonflikt als Totalblockade</h3><p class="card-text">Ein realer lokaler Zielkonflikt - Vogel, Fledermaus, Wald, Beton, Landschaft oder Infraschall - wird als Gesamtbeweis gegen Windenergie benutzt. Die Aussage verschiebt Aufmerksamkeit von Systemvergleich und fossilen Alternativen auf emotional starke Einzelbilder.</p></article>
            <article class="card"><p class="card-kicker">Narrativanalyse</p><h3 class="card-title">Naturschutz gegen Klimaschutz</h3><p class="card-text">Naturschutzkritik ist legitim. Problematisch wird sie, wenn sie nicht zu besserer Standortplanung führt, sondern fossile Pfade verlängert.</p></article>
          </div>
          <div class="card-grid deep-dive-source-grid">${windManipulationPatterns.map(([label, description, counter]) => `<article class="card"><p class="card-kicker">Manipulationsmuster</p><h3 class="card-title">${escapeHtml(label)}</h3><p class="card-text">${escapeHtml(description)}</p><p class="card-text"><strong>Gegenbewegung:</strong> ${escapeHtml(counter)}</p></article>`).join("")}</div>
          <ol class="timeline radar-flow radar-effect-path">${claim.effectPath.map(([label, description], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(description)}</p></div></li>`).join("")}</ol>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Folgen falschen Handelns</p><ul class="clean-list">${claim.consequences.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
            <article class="card"><p class="card-kicker">Leitsatz</p><h3 class="card-title">Ein realer Zielkonflikt ist kein Freibrief für fossile Dauerabhängigkeit.</h3><p class="card-text">Der faire Vergleich lautet nicht: Windrad gegen perfekte Natur. Der faire Vergleich lautet: Windenergie mit Schutzmaßnahmen gegen fossile Energie mit ihren realen Folgekosten.</p></article>
          </div>
          ${summaryGrid([["Mensch", claim.mpd.mensch, "warning"], ["Planet", claim.mpd.planet, "warning"], ["Demokratie", claim.mpd.demokratie, "critical"]], "Wind MPD", "mpd-impact-panel")}
          ${summaryGrid([["SDGs", claim.sdgs.join(" / "), "positive"], ["SDG+", claim.sdgPlus.join(" / "), "positive"], ["Wirkungsrisiko", claim.riskLevel, "critical"]], "Wind SDG", "climate-sdg-panel")}
          ${summaryGrid([["Artenschutzrisiko", "Kollisionsrisiko, Habitatwirkung, Abschaltzeiten, Monitoring und Artennachweise.", "warning"], ["Wald- und Bodenwirkung", "Rodung, Wege, Kranstellflächen, Wasserhaushalt, Bodenverdichtung und Wiederherstellung.", "warning"], ["Gesundheit und Akzeptanz", "Schall, Schattenwurf, Befeuerung, Beteiligung, Beschwerdepfade und Vertrauen.", "neutral"], ["Material und Rückbau", "Beton, Stahl, Rotorblätter, Betriebsmittel, Rückstellungen, Rückbaupflicht und Recyclingpfade.", "neutral"], ["Systemnutzen", "Ersetzter fossiler Strom, CO₂-Minderung, Luftschadstoffe, Importabhängigkeit und Versorgungssicherheit.", "positive"], ["Demokratiequalität", "Transparenz, kommunale Beteiligung, lokale Wertschöpfung und nachvollziehbare Abwägung.", "positive"]], "Wind Indikatorfamilien", "deep-dive-inline-summary")}
          ${woekSolutionMatrix(claim.woekSolution)}
          <section class="section section-soft" aria-labelledby="wind-internal-links">
            <div class="card">
              <p class="card-kicker">Interne Links</p>
              <h2 class="card-title" id="wind-internal-links">Narrative, Begriffe und verwandte Dossiers.</h2>
              <div class="radar-link-cluster">
                <a href="/wirkungsradar/narrative/naturschutz-gegen-klimaschutz/">Naturschutz gegen Klimaschutz</a>
                <a href="/wirkungsradar/narrative/teilkonflikt-als-blockade/">Teilkonflikt als Blockade</a>
                <a href="/wirkungsradar/narrative/infraschall-angst/">Infraschall-Angst</a>
                <a href="/wirkungsradar/narrative/windkraft-zerstoert-heimat/">Windkraft zerstört Heimat</a>
                <a href="/wirkungsradar/narrative/fossile-alternative-unsichtbar/">Fossile Alternative unsichtbar</a>
                <a href="/begriffe/standortscorecard/">Standortscorecard</a>
                <a href="/begriffe/zielkonflikt/">Zielkonflikt</a>
                <a href="/begriffe/repowering/">Repowering</a>
                <a href="/begriffe/fossile-alternative/">Fossile Alternative</a>
                <a href="/begriffe/infraschall/">Infraschall</a>
                <a href="/begriffe/rueckbaupflicht/">Rückbaupflicht</a>
                <a href="/begriffe/antikollisionssystem/">Antikollisionssystem</a>
                <a href="/begriffe/fledermausabschaltung/">Fledermausabschaltung</a>
                <a href="/wirkungsradar/live/deutschland-nur-zwei-prozent/">Deutschland nur 2 %?</a>
                <a href="/wirkungsradar/live/co2-preis-oder-fossile-systemkosten/">CO₂-Preis oder fossile Systemkosten?</a>
                <a href="/wirkungsradar/live/e-autos-schlimmer-als-verbrenner/">E-Autos und Lebenszyklus</a>
              </div>
            </div>
          </section>
          ${sourceCards(windExternalSources)}
          ${internalLinks()}
          ${factStatusBadge()}
        </div>
      </section>
    </main>`;
  return pageShell({
    title: `Windräder, Vögel, Wald, Beton und Rückbau - Wirkungsradar ${sectionLabel} | Wirkungsökonomie`,
    description: sentence(claim.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/${canonicalPath}/${claim.slug}/`,
    base: "../../../",
    main,
  });
}

function renderCo2SystemCostsDossier(claim, mode = "live") {
  const answers = expandedAnswers(claim);
  const base = mode === "detail" ? "../../../" : "../../../";
  const sectionLabel = mode === "detail" ? "Detail" : "Live";
  const canonicalPath = mode === "detail" ? "detail" : "live";
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero dossier-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">${sectionLabel}</a> / CO₂-Preis</nav>
          <p class="hero-kicker">Wirkungsradar Dossier</p>
          <h1 class="hero-title">CO₂-Preis oder fossile Systemkosten?<br>Warum wir so oder so zahlen</h1>
          <p class="hero-subtitle">Der CO₂-Preis ist nicht die eigentliche Rechnung. Die eigentliche Rechnung sind Klimaschäden, Krankheitskosten, Importabhängigkeit und geopolitische Risiken.</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(claim.abstract)} Wirkungsökonomisch ist der CO₂-Preis kein verlorenes Geld, sondern ein Rückkopplungsinstrument: Er macht fossile Folgekosten sichtbar, verändert Investitionen und kann Einnahmen für Entlastung, Infrastruktur und Transformation bereitstellen.</p>
          <p class="radar-status-line"><span>Kurzurteil: ${escapeHtml(claim.shortJudgement)}</span><span>Datenstand: ${UPDATED_AT}</span><span>Hinweis: modellierte Systemrechnung</span></p>
        </div>
      </section>
      ${summaryGrid(co2SystemKeyPoints, "Das Wichtigste in 6 Punkten")}
      <nav class="topic-subnav" aria-label="Dossier Navigation" data-search-exclude>
        <a href="#live-antworten">Live antworten</a>
        <a href="#systemkosten-verstehen">Systemkosten verstehen</a>
        <a href="#rechenweg-quellen">Rechenweg &amp; Quellen</a>
      </nav>
      <section class="section dossier-tab-panel" id="live-antworten">
        <div>
          <div class="section-header"><p class="hero-kicker">Live antworten</p><h2>Den Belastungsframe sichtbar machen.</h2></div>
          <div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge">
            <details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">Kurzantwort · ${words(answers.ten_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.ten_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">Einordnung · ${words(answers.thirty_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.thirty_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">Lange Antwort · ${words(answers.two_minutes)} Wörter</span></summary><p>„${escapeHtml(answers.two_minutes)}“</p></details>
          </div>
          <div class="card-grid two">
            <article class="card"><p class="card-kicker">Gute Rückfrage</p><h3 class="card-title">${escapeHtml(claim.redirectQuestion)}</h3></article>
            <article class="card"><p class="card-kicker">Frame sichtbar machen</p><p class="card-text">Ich beantworte das, aber ich übernehme nicht den Frame. Der Frame lautet: Der CO₂-Preis sei die Belastung. Wirkungsökonomisch ist die Belastung die fossile Wirkung - der CO₂-Preis macht sie sichtbar und steuerbar.</p></article>
          </div>
          <div class="card"><p class="card-kicker">Nicht ins Stöckchen springen</p><ul class="clean-list">${claim.dontDo.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>
        </div>
      </section>
      <section class="section section-soft dossier-tab-panel" id="systemkosten-verstehen">
        <div>
          <div class="section-header"><p class="hero-kicker">Systemkosten verstehen</p><h2>Wir zahlen so oder so.</h2><p>Die Debatte über den CO₂-Preis wirkt oft so, als gäbe es zwei Optionen: zahlen oder nicht zahlen. Tatsächlich gibt es diese Wahl nicht. Wir zahlen für Reparatur, Krankheit, fossile Abhängigkeit und Krisen - oder für Vermeidung, saubere Alternativen, Anpassung und Transformation.</p></div>
          <div class="dossier-matrix-wrap">
            <table class="dossier-matrix">
              <caption>Systemkosten-Matrix</caption>
              <thead><tr><th>Kostenblock</th><th>Ohne wirksame Steuerung</th><th>Mit wirksamer Steuerung</th></tr></thead>
              <tbody>${co2SystemMatrix.map(([block, without, withControl]) => `<tr><th scope="row">${escapeHtml(block)}</th><td>${escapeHtml(without)}</td><td>${escapeHtml(withControl)}</td></tr>`).join("")}</tbody>
            </table>
          </div>
          <p class="formula-note">Das UBA beziffert die Umweltkosten aus Straßenverkehr, Strom- und Wärmeerzeugung für 2022 auf mindestens 301 Milliarden Euro. Eine ambitionierte Umweltpolitik senkt diese Kosten und entlastet die Gesellschaft.</p>
        </div>
      </section>
      <section class="section dossier-tab-panel" id="rechenweg-quellen">
        <div>
          <div class="section-header"><p class="hero-kicker">Rechenweg &amp; Quellen</p><h2>Rechnung verstehen, ohne Scheingenauigkeit.</h2></div>
          <div class="card-grid two co2-formula-grid">
            <article class="formula-box"><p class="card-kicker">Formel 1</p><h3>CO₂-Preisbelastung</h3><p><strong>Preis pro Tonne × verbleibende Emissionen</strong></p><p>50 Euro/t × 10 t = 500 Euro<br>100 Euro/t × 3 t = 300 Euro</p><p>Der Preis pro Tonne kann steigen, während die Gesamtrechnung sinkt, wenn Emissionen stark genug fallen.</p></article>
            <article class="formula-box"><p class="card-kicker">Formel 2</p><h3>Pro-Kopf-Wert</h3><p><strong>Gesamtkosten ÷ Bevölkerung</strong></p><p>Pro-Kopf-Werte helfen einzuordnen, ersetzen aber keine Verteilungsanalyse nach Einkommen, Wohnform, Region und Alternativen.</p></article>
          </div>
          <article class="formula-box co2-net-formula"><p class="card-kicker">Erweiterte Netto-Systemrechnung</p><h3>Netto-Systembelastung</h3><p><strong>verbleibende Klimaschäden + verbleibende Gesundheits- und Umweltkosten + Umbaukosten - vermiedene Klimaschäden - vermiedene Luftschadstoffkosten - eingesparte fossile Importe - vermiedene Krisen- und Versorgungsschocks - zurückgeführte CO₂-Preis-Einnahmen</strong></p><p>Diese Formel nimmt die berechtigte Kritik auf, dass CO₂-Preis-Einnahmen nicht einfach weg sind.</p></article>
          ${sourceCards(co2ExternalSources)}
        </div>
      </section>
      <section class="section">
        <div>
          <div class="section-header"><p class="hero-kicker">Wirkungspfad</p><h2>Vom sichtbaren Preis zur Systemblindheit.</h2></div>
          <ol class="timeline radar-flow radar-effect-path">${claim.effectPath.map(([label, description], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(description)}</p></div></li>`).join("")}</ol>
        </div>
      </section>
      ${renderPsychologyModule(claim)}
      ${woekSolutionMatrix([
        "CO₂-Preis als Rückkopplung, nicht als Strafzahlung: fossile Wirkung sichtbar machen und Investitionsentscheidungen verändern.",
        "Einnahmen sozial und transformativ verwenden: Klimageld, Gebäudesanierung, ÖPNV, Erneuerbare, Industrieumbau und direkte Entlastung.",
        "Fossile Systemkosten vollständig sichtbar machen: CO₂, NOx, Feinstaub, Ozon, Gesundheitskosten, Importabhängigkeit und Krisenrisiken.",
        "Nicht nur Preis erhöhen, sondern Alternativen schaffen: ÖPNV, Wärmepumpen, Sanierung, günstiger sauberer Strom.",
        "Wirkungshaushalt statt Einnahmenlogik: Jeder Euro muss Entlastung, Emissionsminderung, Resilienz oder Gesundheit sichtbar machen.",
      ])}
      <section class="section section-soft co2-system-graphic" aria-labelledby="co2-system-graphic-title">
        <div class="card">
          <p class="card-kicker">Grafikmodul</p>
          <h2 class="card-title" id="co2-system-graphic-title">CO₂-Preis oder fossile Systemkosten?</h2>
          <div class="co2-system-bars" aria-label="Illustrative Systemrechnung">
            <div><span>Ohne wirksame Klimasteuerung</span><strong>3.485 Mrd. Euro</strong><em>Klimaschäden, Luftverschmutzung, fossile Importkosten und geopolitische Verwundbarkeit bleiben hoch.</em></div>
            <div><span>Mit CO₂-Preis und wirksamer Steuerung</span><strong>1.290 Mrd. Euro</strong><em>CO₂-Preis, Klimaschutz, saubere Luft und sinkende Importabhängigkeit reduzieren die modellierte Belastung.</em></div>
            <p><strong>Ersparnis bis 2050:</strong> rund 2,2 Billionen Euro in dieser erweiterten Systemschätzung.</p>
          </div>
          <p class="card-text"><strong>Hinweis zur Grafik:</strong> Modellierte Schätzung, illustrative Systemrechnung und Szenariovergleich. Diese Grafik zeigt keine amtliche Prognose und keine exakte Haushaltsrechnung. Unterschiedliche Kostenarten werden nicht gleichgesetzt, sondern als Systemkosten sichtbar gemacht.</p>
          <p class="card-text">Geopolitische Verwundbarkeit umfasst Krisenhilfen, Versorgungsschocks, Sicherheitsrisiken und politische Folgekosten - modellierter Zusatzblock, nicht vollständig zurechenbar.</p>
        </div>
      </section>
      <section class="section">
        <div>
          <div class="section-header"><p class="hero-kicker">Glossar &amp; verwandte Seiten</p><h2>Begriffe und Anschlussstellen.</h2></div>
          <div class="radar-link-cluster">
            <a href="../../../begriffe/co2-preis/">CO₂-Preis</a>
            <a href="../../../begriffe/fossile-systemkosten/">Fossile Systemkosten</a>
            <a href="../../../begriffe/sichtbare-rechnung/">Sichtbare Rechnung</a>
            <a href="../../../begriffe/unsichtbare-rechnung/">Unsichtbare Rechnung</a>
            <a href="../../../begriffe/rueckkopplungspreis/">Rückkopplungspreis</a>
            <a href="../../../wirkungsradar/narrative/co2-preis-abzocke/">CO₂-Preis-Abzocke</a>
            <a href="../../../wirkungsradar/narrative/verbotsnarrativ/">Verbotsnarrativ</a>
            <a href="../../../wirkungsradar/narrative/kontrollverlust/">Kontrollverlust</a>
            <a href="../../../wirkungsradar/narrative/ohnmacht/">Ohnmacht</a>
            <a href="../../../wirkungsradar/narrative/verzoegerung/">Verzögerung</a>
          </div>
          <div class="card-grid deep-dive-source-grid">${co2InternalSources.map(([title, text, link]) => `<article class="card"><p class="card-kicker">WÖk-Quelle</p><h3 class="card-title">${escapeHtml(title)}</h3><p class="card-text">${escapeHtml(text)}</p><p><a class="text-link" href="${escapeHtml(link)}">Mehr erfahren</a></p></article>`).join("")}</div>
        </div>
      </section>
    </main>`;
  return pageShell({
    title: `CO₂-Preis oder fossile Systemkosten? - Wirkungsradar ${sectionLabel} | Wirkungsökonomie`,
    description: sentence(claim.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/${canonicalPath}/${claim.slug}/`,
    base,
    main,
  });
}

function renderLiveCard(claim) {
  if (claim.slug === "deutschland-nur-zwei-prozent") return renderGermanyTwoPercentDossier(claim);
  if (claim.slug === "co2-preis-oder-fossile-systemkosten") return renderCo2SystemCostsDossier(claim, "live");
  if (claim.slug === "windraeder-voegel-wald-beton-rueckbau") return renderWindEnergyNatureDossier(claim, "live");
  if (claim.slug === "fusion-loest-das-energieproblem") return renderFusionDossier(claim, "live");
  if (claim.slug === "klimaschutz-deindustrialisiert-deutschland") return renderIndustryTransformationDossier(claim, "live");
  const sources = claim.sources.map(slugSource);
  const answers = expandedAnswers(claim);
  const detailLink = deepDiveLiveLink(claim);
  const summaryItems = [
    ["Kurzurteil", claim.summary.judgement, claim.riskLevel === "hoch" ? "warning" : "neutral"],
    ["Wahrer Kern", claim.summary.true_core, "neutral"],
    ["Problem", claim.summary.problem, "critical"],
    ["Narrativ", claim.summary.narrative, "warning"],
    ["Wirkungsrisiko", claim.summary.risk, "critical"],
    ["Live-Antwort", claim.summary.host_answer, "positive"],
  ];
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero theme-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Live</a> / ${escapeHtml(claim.title)}</nav>
          <p class="hero-kicker">Wirkungsradar Live</p>
          <h1 class="hero-title">${escapeHtml(claim.title)}</h1>
          <p class="hero-subtitle">${escapeHtml(claim.subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(claim.abstract)}</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Faktenstatus: datenbasiert</span></p>
        </div>
      </section>
      ${summaryGrid(summaryItems, `${claim.title} Summary`)}${detailLink ? `\n      ${detailLink}` : ""}
      <section class="section" id="host-antworten">
        <div>
          <div class="section-header"><p class="hero-kicker">Host-Antworten</p><h2>10 Sekunden, 30 Sekunden, 2 Minuten.</h2></div>
          <div class="radar-answer-accordion host-answer-tabs" aria-label="Host-Antworten nach Länge">
            <details class="radar-answer-item" open><summary><span class="radar-answer-time">10 Sekunden</span> <span class="radar-answer-label">Kurzantwort · ${words(answers.ten_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.ten_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">30 Sekunden</span> <span class="radar-answer-label">Einordnung · ${words(answers.thirty_seconds)} Wörter</span></summary><p>„${escapeHtml(answers.thirty_seconds)}“</p></details>
            <details class="radar-answer-item"><summary><span class="radar-answer-time">2 Minuten</span> <span class="radar-answer-label">Lange Antwort · ${words(answers.two_minutes)} Wörter</span></summary><p>„${escapeHtml(answers.two_minutes)}“</p></details>
          </div>
        </div>
      </section>
      <section class="section section-soft">
        <div class="card-grid two">
          <article class="card"><p class="card-kicker">Frame sichtbar machen</p><h2 class="card-title">Nicht hineinspringen.</h2><p class="card-text">${escapeHtml(frameResponses[claim.frameKey] || frameResponses.verzoegerung)}</p></article>
          <article class="card"><p class="card-kicker">Gute Rückfrage</p><h2 class="card-title">Zur Wirkung zurück.</h2><p class="card-text">${escapeHtml(claim.redirectQuestion)}</p></article>
        </div>
      </section>
      <section class="section section-soft">
        <div class="card">
          <p class="card-kicker">Nicht ins Stöckchen springen</p>
          <h2 class="card-title">Was man nicht tun sollte.</h2>
          <ul class="clean-list">${claim.dontDo.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      </section>
      <section class="section">
        <div>
          <div class="section-header"><p class="hero-kicker">Wirkungspfad</p><h2>Von Aussage zu möglicher Folge.</h2></div>
          <ol class="timeline radar-flow radar-effect-path">
            ${claim.effectPath.map(([label, description], index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(description)}</p></div></li>`).join("\n            ")}
          </ol>
        </div>
      </section>
      ${renderPsychologyModule(claim)}
      <section class="section">
        <div class="card-grid two">
          <article class="card"><p class="card-kicker">Faktenlage</p><h2 class="card-title">Was prüfbar ist.</h2><ul class="clean-list">${claim.facts.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
          <article class="card"><p class="card-kicker">Folgen falschen Handelns</p><h2 class="card-title">Was wahrscheinlicher wird.</h2><ul class="clean-list">${claim.consequences.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></article>
        </div>
      </section>
      ${woekSolutionMatrix(claim.woekSolution)}
      ${renderEvIndustryPolicyLink(claim)}
      ${summaryGrid([["Mensch", claim.mpd.mensch, "warning"], ["Planet", claim.mpd.planet, "warning"], ["Demokratie", claim.mpd.demokratie, "critical"]], `${claim.title} MPD`, "mpd-impact-panel")}
      ${summaryGrid([["SDGs", claim.sdgs.join(" / "), "positive"], ["SDG+", claim.sdgPlus.join(" / "), "positive"], ["Wirkungsrisiko", claim.riskLevel, claim.riskLevel === "hoch" ? "critical" : "warning"]], `${claim.title} SDG`, "climate-sdg-panel")}
      ${internalLinks()}
      ${evidenceStack(claim.sources)}
      ${factStatusBadge()}
    </main>`;
  return pageShell({
    title: `${claim.title.replace(/[„“]/g, "")} - Wirkungsradar Live | Wirkungsökonomie`,
    description: sentence(claim.abstract),
    canonical: `https://wirkungsoekonomie.de/wirkungsradar/live/${claim.slug}/`,
    base: "../../../",
    main,
  });
}

function dataModel() {
  return {
    version: "0.1",
    last_updated: UPDATED_AT,
    type: "climate_energy_cluster",
    source_pack: sourcePack.id,
    fact_status: factStatus,
    frame_responses: frameResponses,
    subtopics,
    claims: claims.map((claim) => ({
      title: claim.title,
      slug: claim.slug,
      shortJudgement: claim.shortJudgement,
      narrativeFamilies: claim.narrativeFamilies,
      riskLevel: claim.riskLevel,
      themes: claim.themes,
      sdgs: claim.sdgs,
      sdgPlus: claim.sdgPlus,
      summary: claim.summary,
      answers: expandedAnswers(claim),
      effect_path: claim.effectPath.map(([label, description]) => ({ label, description })),
      woek_solution: claim.woekSolution,
      sources: claim.sources,
    })),
  };
}

const windNarrativePages = [
  ["naturschutz-gegen-klimaschutz", "Naturschutz gegen Klimaschutz", "Wenn ein realer Zielkonflikt zum falschen Entweder-oder wird.", "hoch", "Das Narrativ stellt Klima- und Naturschutz als Gegensätze dar. Der wahre Kern ist: Windenergie kann lokale Arten-, Wald- und Landschaftskonflikte erzeugen. Der Denkfehler ist, daraus ein Entweder-oder zu machen. Ohne Klimaschutz verliert Naturschutz langfristig seine Lebensgrundlage.", "Zielkonflikt anerkennen, fossile Alternative sichtbar machen, Standortscorecard verlangen."],
  ["teilkonflikt-als-blockade", "Teilkonflikt als Blockade", "Wenn ein echter Einzelkonflikt als Gesamtargument gegen Transformation genutzt wird.", "hoch", "Ein echter Konflikt - Vogel, Fledermaus, Wald, Beton, Landschaft oder Schall - wird als Totalbeweis gegen Windenergie verwendet. So verschwindet die Frage nach Standortqualität, Minderungsmaßnahmen und Alternativenvergleich.", "Teilfakt anerkennen, Systemgrenze öffnen, konkrete Lösung statt Pauschalurteil verlangen."],
  ["infraschall-angst", "Infraschall-Angst", "Wenn schwer wahrnehmbare Risiken zu einem Kontrollverlustframe werden.", "mittel", "Der Frame wirkt, weil unsichtbare oder schwer wahrnehmbare Risiken Kontrollverlust auslösen können. Reale Belastung durch hörbaren Schall, Schattenwurf und Stress muss ernst genommen werden. Pauschale Gesundheitsbehauptungen zu Infraschall brauchen aber belastbare Evidenz.", "Sorge anerkennen, messbare Immissionen, Abstände, Schallgutachten und Beteiligung prüfen."],
  ["windkraft-zerstoert-heimat", "Windkraft zerstört Heimat", "Wenn Landschaftsveränderung als Identitätsverlust gerahmt wird.", "hoch", "Landschaft ist nicht nur Fläche, sondern Zugehörigkeit, Erinnerung und Heimatgefühl. Problematisch wird der Frame, wenn Landschaftsverlust absolut gesetzt und fossile Alternativen, lokale Wertschöpfung oder Beteiligung unsichtbar werden.", "Heimatgefühl anerkennen, Beteiligung stärken, Landschaftswirkung und fossile Folgekosten gemeinsam bilanzieren."],
  ["fossile-alternative-unsichtbar", "Fossile Alternative unsichtbar", "Wenn erneuerbare Technologien mit idealer Natur statt realen Alternativen verglichen werden.", "hoch", "Windenergie wird mit unberührter Natur verglichen, nicht mit Kohle, Öl und Gas samt Klimaschäden, Bergbau, Luftschadstoffen, Wasserbelastung und Importabhängigkeit. Dadurch wirkt der Status quo neutral, obwohl er ebenfalls Wirkung erzeugt.", "Immer fragen: Welche Energie ersetzt das Windrad, und welche Wirkung hat diese Alternative?"],
];

const windGlossaryTerms = [
  ["standortscorecard", "Standortscorecard", "Wirkungsökonomische Bewertung eines konkreten Standorts nach Klima-, Arten-, Boden-, Gesundheits-, Akzeptanz-, Infrastruktur- und Alternativenwirkung.", "Eine Standortscorecard ersetzt Pauschalurteile durch konkrete Wirkungsprüfung."],
  ["zielkonflikt", "Zielkonflikt", "Situation, in der mehrere legitime Ziele gleichzeitig betroffen sind, etwa Klimaschutz und Artenschutz.", "Ein Zielkonflikt ist kein Totalargument. Er verlangt Abwägung, Daten und bessere Gestaltung."],
  ["repowering", "Repowering", "Ersatz älterer Energieanlagen durch leistungsfähigere neue Anlagen, oft mit höherem Ertrag und besserer Steuerbarkeit.", "Repowering kann mehr Strom mit weniger oder besser platzierten Anlagen ermöglichen."],
  ["fossile-alternative", "Fossile Alternative", "Reale Energieerzeugung aus Kohle, Öl oder Gas, die als Vergleich mit erneuerbaren Energien mitbilanziert werden muss.", "Wer Wind ablehnt, muss zeigen, welche Alternative die Energie liefert und welche Wirkung sie hat."],
  ["infraschall", "Infraschall", "Schall unterhalb des üblichen Hörbereichs des Menschen, der natürlich und technisch entstehen kann.", "Bei Windenergieanlagen ist die pauschale Behauptung gesundheitlicher Schäden durch Infraschall nach aktueller Evidenz nicht belegt."],
  ["rueckbaupflicht", "Rückbaupflicht", "Pflicht, Anlagen nach Betriebsende sachgerecht zurückzubauen und Materialien zu entsorgen oder zu recyceln.", "Rückbaupflichten schützen Boden, Eigentümer:innen und Kommunen vor späteren Kosten."],
  ["antikollisionssystem", "Antikollisionssystem", "Technisches System, das kollisionsgefährdete Vögel erkennt und Windenergieanlagen bei Risiko temporär abschalten kann.", "Antikollisionssysteme können Artenschutzrisiken senken, ersetzen aber keine gute Standortwahl."],
  ["fledermausabschaltung", "Fledermausabschaltung", "Betriebsregel, bei der Windenergieanlagen zu Zeiten hoher Fledermausaktivität temporär abgeschaltet werden.", "Fledermausabschaltungen sind ein zentraler Baustein zur Risikominderung."],
];

const fusionNarrativePages = [
  ["technikwunder-aufschub", "Technikwunder-Aufschub", "Wenn zukünftige Technologien heutiges Handeln ersetzen sollen.", "hoch", "Das Narrativ nutzt reale Forschung oder mögliche künftige Durchbrüche, um heutige Maßnahmen weniger dringlich erscheinen zu lassen. Der wahre Kern ist: Forschung kann langfristig wichtig sein. Der Denkfehler ist, Zukunftspotenzial mit Gegenwartsverfügbarkeit zu verwechseln.", "Forschung anerkennen, Zeitfenster öffnen und nach Wirkung bis 2030, 2035 und 2045 fragen."],
  ["fusion-als-rettung", "Fusion als Rettung", "Wenn Fusionsforschung als Sofortlösung für Energiepolitik gerahmt wird.", "hoch", "Fusion kann langfristig ein wichtiger Baustein werden. Problematisch wird der Rettungsframe, wenn er Erneuerbare, Netze, Speicher, Effizienz und Elektrifizierung als unnötige Übergangslösungen abwertet.", "Fusion als Forschungsoption stärken, aber Soforthebel nicht verschieben."],
  ["target-gain-verwechslung", "Target-Gain-Verwechslung", "Wenn physikalischer Energiegewinn mit Kraftwerks-Nettoleistung verwechselt wird.", "hoch", "Target Gain kann ein beeindruckender wissenschaftlicher Meilenstein sein. Er ersetzt aber nicht die Frage nach Anlagenenergie, Wiederholrate, Turbine, Wartung, Kosten und Netzeinspeisung.", "Target, Anlage, Kraftwerk und Netz sauber trennen."],
  ["zeitfensterblindheit", "Zeitfensterblindheit", "Wenn eine Lösung bewertet wird, ohne zu fragen, wann sie wirkt.", "hoch", "Zeitfensterblindheit macht aus einer möglichen späteren Option eine heutige Antwort. In der Klimakrise zählt aber, welche Maßnahme bis 2030, 2035 und 2045 real Emissionen, Kosten und Risiken senkt.", "Jede Technologie mit Jahreszahl, Baupfad, Genehmigung, Finanzierung und Alternativenkosten prüfen."],
  ["hype-als-sedativ", "Hype als Sedativ", "Wenn Technologieoptimismus gesellschaftlichen Handlungsdruck beruhigt.", "mittel", "Hype kann Hoffnung geben, aber auch Gegenwartsdruck senken. Bei Fusion wirkt das besonders stark, weil die Vision sauberer, großer Energie psychologisch entlastet.", "Hoffnung mit Handlungspflicht koppeln: Wenn es später hilft, gut; bis dahin muss das System wirken."],
  ["forschung-gegen-transformation", "Forschung gegen Transformation", "Wenn Forschung rhetorisch gegen heute verfügbare Lösungen ausgespielt wird.", "hoch", "Forschung und Transformation sind keine Gegensätze. Problematisch wird es, wenn Forschungsförderung als Argument dient, Erneuerbare, Netze, Speicher, Effizienz und Elektrifizierung zu bremsen.", "Forschung plus Umsetzung denken, nicht Forschung statt Umsetzung."],
];

const fusionGlossaryTerms = [
  ["fusion", "Fusion", "Kernfusion ist die Verschmelzung leichter Atomkerne zu schwereren Kernen, wobei Energie freiwerden kann.", "Fusion ist wissenschaftlich vielversprechend, aber kommerzielle Stromproduktion ist noch nicht breit verfügbar."],
  ["target-gain", "Target Gain", "Target Gain beschreibt das Verhältnis der Fusionsenergie, die aus einem Target freigesetzt wird, zur Energie, die direkt auf das Target eingebracht wurde.", "Target Gain ist nicht dasselbe wie Netto-Stromerzeugung eines Kraftwerks."],
  ["kraftwerks-nettoleistung", "Kraftwerks-Nettoleistung", "Kraftwerks-Nettoleistung ist die elektrische Leistung, die ein Kraftwerk nach Abzug seines Eigenverbrauchs tatsächlich ins Netz einspeist.", "Für Energiesysteme zählt nicht nur Plasmaenergie, sondern nutzbarer Netzstrom."],
  ["tritium", "Tritium", "Tritium ist ein radioaktives Wasserstoffisotop, das in vielen Fusionskonzepten zusammen mit Deuterium als Brennstoff genutzt wird.", "Tritium ist knapp und muss für kommerzielle Fusionskraftwerke voraussichtlich im Reaktor selbst gebrütet werden."],
  ["brutblanket", "Brutblanket", "Ein Brutblanket ist eine Komponente eines Fusionsreaktors, die mit Hilfe von Neutronen aus Lithium Tritium erzeugen und zugleich Wärme sowie Strahlung managen soll.", "Brutblankets sind eine Schlüsseltechnologie für Tritium-Selbstversorgung."],
  ["technologiereifegrad", "Technologiereifegrad", "Der Technologiereifegrad beschreibt, wie weit eine Technologie von Grundlagenforschung über Demonstration bis zur kommerziellen Anwendung entwickelt ist.", "Ein Laborerfolg hat einen anderen Reifegrad als ein marktfähiges Kraftwerk."],
  ["zeitfensterblindheit", "Zeitfensterblindheit", "Zeitfensterblindheit ist ein Denkfehler, bei dem eine Lösung bewertet wird, ohne zu prüfen, ob sie im relevanten Zeitraum wirkt.", "Für Klimapolitik zählt, was bis 2030, 2035 und 2045 real Wirkung erzeugt."],
  ["aufschubnarrativ", "Aufschubnarrativ", "Ein Aufschubnarrativ verzögert heutiges Handeln mit Verweis auf spätere Technologien oder spätere Lösungen.", "Aufschubnarrative wirken beruhigend, erhöhen aber künftige Risiken."],
];

const evGlossaryTerms = [
  ["ladeangst", "Ladeangst", "Sorge, ein Elektrofahrzeug nicht rechtzeitig, nicht zuverlässig oder nicht schnell genug laden zu können.", "Ladeangst entsteht oft aus realen Einzelfällen, fehlender Erfahrung oder schlechter Infrastruktur. Gegenmittel sind Verfügbarkeit, Schnellladen, Alltagsladen und transparente Informationen."],
  ["alltagsladen", "Alltagsladen", "Laden an Orten, an denen Fahrzeuge ohnehin stehen, etwa zuhause, am Arbeitsplatz, beim Einkauf, im Parkhaus oder am Hotel.", "Alltagsladen reduziert Ladezeit als Zusatzaufwand, weil Standzeit zu Ladezeit wird."],
  ["schnellladepark", "Schnellladepark", "Standort mit mehreren Schnellladepunkten, hoher Ladeleistung, guter Erreichbarkeit und idealerweise Aufenthaltsqualität.", "Schnellladeparks sind besonders wichtig für Langstrecke und Menschen ohne private Lademöglichkeit."],
  ["megawattladen", "Megawattladen", "Hochleistungsladen im Leistungsbereich von rund einem Megawatt oder mehr, vor allem für schwere Nutzfahrzeuge wie E-Lkw.", "Megawattladen soll große Batterien in Pausen- oder Logistikfenstern schnell nachladen."],
  ["depotladen", "Depotladen", "Laden von Flottenfahrzeugen am Betriebshof oder Logistikdepot, meist während längerer Standzeiten.", "Depotladen ist zentral für Busse, Transporter und viele E-Lkw, weil es planbar, netzdienlich und betrieblich integrierbar ist."],
  ["ladefenster", "Ladefenster", "Zeitfenster, in dem ein Fahrzeug ohnehin steht und sinnvoll geladen werden kann.", "Bei E-Lkw sind Ladefenster etwa Pausen, Be- und Entladung, Schichtwechsel oder Nachtstand."],
  ["tankstellenlogik", "Tankstellenlogik", "Denkmuster, das Elektromobilität so bewertet, als müsse Laden genauso funktionieren wie Tanken beim Verbrenner.", "Elektromobilität nutzt oft Standzeiten. Deshalb ist die Tankstellenlogik für viele Ladefälle die falsche Vergleichslogik."],
];

const industryNarrativePages = [
  ["deindustrialisierung", "Deindustrialisierung", "Wenn Transformationsstress als Beweis gegen Klimaschutz gelesen wird.", "hoch", "Das Deindustrialisierungsnarrativ greift reale Standortprobleme auf: Strompreise, Netze, Bürokratie, Fachkräfte, globale Konkurrenz und Investitionsrisiken. Der Denkfehler entsteht, wenn daraus folgt, Klimaschutz sei die Ursache industrieller Schwäche. Wirkungsökonomisch gefährden vor allem fossile Abhängigkeit, verschleppte Infrastruktur, hohe Systemkosten und fehlende Transformationsfähigkeit den Standort.", "Reale Probleme anerkennen, fossile Systemkosten mitbilanzieren, konkrete Standorthebel prüfen."],
  ["fossile-nostalgie", "Fossile Nostalgie", "Wenn die alte Energieordnung als sichere Standortbasis verklärt wird.", "hoch", "Fossile Nostalgie macht frühere Kostenstrukturen emotional verfügbar und blendet Importabhängigkeit, CO₂-Kosten, Klimaschäden, geopolitische Risiken und Technologiewandel aus. Sie verspricht Stabilität, obwohl sie viele heutige Verwundbarkeiten erzeugt oder verstärkt.", "Nostalgie nicht lächerlich machen, aber die vollständige Rechnung öffnen: Brennstoff, CO₂, Krisenrisiko, Folgekosten und verpasste Zukunftsmärkte."],
  ["falsche-standortrechnung", "Falsche Standortrechnung", "Wenn nur sichtbare Umbaukosten zählen und Systemvorteile verschwinden.", "hoch", "Die falsche Standortrechnung vergleicht Transformationsinvestitionen mit einem scheinbar kostenlosen Status quo. Dadurch werden Netze, Speicher, Erneuerbare, Effizienz, Industriecluster und vermiedene fossile Kosten zu Belastungen, während Brennstoffimporte, Klimafolgen und Abhängigkeiten unsichtbar bleiben.", "CAPEX und OPEX trennen, Bilanzgrenze erweitern und Standortwirkung statt Einzelpreis behaupten."],
];

const nuclearNarrativePages = [
  ["kernkraft-als-rettung", "Kernkraft als Rettung", "Wenn CO₂-armer Betrieb als Gesamtbeweis für eine Energielösung genutzt wird.", "hoch", "Das Narrativ macht aus einem realen Vorteil der Kernenergie ein Abkürzungsversprechen. Der wahre Kern ist: Kernkraft ist im Betrieb CO₂-arm und wetterunabhängig. Der Denkfehler entsteht, wenn daraus für Deutschland automatisch schnell, günstig, risikoarm und systemisch optimal wird.", "CO₂-Vorteil anerkennen, dann Zeit, Kosten, Endlager, Rückbau, Sicherheit, Flexibilität und Alternativen öffnen."],
  ["grundlastnarrativ", "Grundlastnarrativ", "Wenn Versorgungssicherheit mit starrer Dauerproduktion verwechselt wird.", "hoch", "Das Grundlastnarrativ greift ein echtes Bedürfnis nach Versorgungssicherheit auf. Irreführend wird es, wenn ein erneuerbares Stromsystem so behandelt wird, als brauche es vor allem alte Grundlastlogik statt gesicherter Leistung, Flexibilität, Netzen, Speichern, Lastmanagement und Systemdiensten.", "Nicht Grundlast versprechen, sondern gesicherte Leistung und Systemflexibilität nachweisen lassen."],
  ["transmutation-joker", "Transmutation-Joker", "Wenn ein Forschungsansatz die Endlagerfrage rhetorisch verschwinden lässt.", "hoch", "Transmutation kann bestimmte radioaktive Nuklide theoretisch verändern. Problematisch wird der Frame, wenn Forschung als Beleg genutzt wird, dass Atommüll politisch erledigt sei. Nach heutigem Stand bleibt ein Endlager Teil der Wirkungsbilanz.", "Forschung nicht lächerlich machen, aber Endlagerbedarf und reale Abfallströme sichtbar halten."],
  ["smr-technikwunder", "SMR-Technikwunder", "Wenn zukünftige Reaktorkonzepte heutige Entscheidungen vertagen sollen.", "mittel", "Small Modular Reactors können Forschung und spätere Technologieentwicklung sein. Zum Technikwunder-Frame werden sie, wenn unbewiesene Serienkosten, Genehmigungspfade, Lieferketten und Entsorgung als kurzfristige Lösung für Deutschlands 2030- und 2035-Ziele verkauft werden.", "SMR als Forschung einordnen und fragen: Welche Leistung steht wann, zu welchen Kosten und mit welcher Entsorgung real bereit?"],
  ["rationalitaet-gegen-ideologie", "Rationalität gegen Ideologie", "Wenn eine Technologiepräferenz als alleinige Vernunft gerahmt wird.", "hoch", "Der Frame wirkt stark, weil er nüchtern klingt. Er setzt Kernkraft als rationale Technik und Erneuerbare als Ideologie. Wirkungsökonomisch ist aber nicht das Lager rational, sondern der transparente Vergleich nach Zeit, Kosten, Risiko, Systemnutzen und Alternativenwirkung.", "Rationalität nicht als Selbstetikett akzeptieren, sondern Wirkungskriterien verlangen."],
  ["zeitfensterblindheit", "Zeitfensterblindheit", "Wenn eine Lösung bewertet wird, ohne zu fragen, wann sie wirkt.", "hoch", "Zeitfensterblindheit macht aus einer möglichen späteren Option eine heutige Antwort. In der Klimakrise zählt aber, welche Maßnahme bis 2030, 2035 und 2045 real Emissionen, Kosten und Risiken senkt.", "Jede Technologie mit Jahreszahl, Baupfad, Genehmigung, Finanzierung und Alternativenkosten prüfen."],
];

const industryGlossaryTerms = [
  ["deindustrialisierungsnarrativ", "Deindustrialisierungsnarrativ", "Erzählmuster, das realen Transformationsstress als Beweis deutet, Klimaschutz zerstöre Industrie.", "Der Begriff hilft, reale Standortprobleme ernst zu nehmen, ohne daraus eine falsche Rückkehr-zum-Fossilen-Logik zu machen."],
  ["standortwirkung", "Standortwirkung", "Gesamte Wirkung politischer, infrastruktureller und wirtschaftlicher Bedingungen auf Wertschöpfung, Beschäftigung, Resilienz und demokratische Stabilität eines Standorts.", "Standortwirkung fragt nicht nur nach einem einzelnen Preis, sondern nach Investitionsfähigkeit, Infrastruktur, Lieferketten, Know-how und Zukunftsmärkten."],
  ["capex", "CAPEX", "Investitionsausgaben für Bau, Anlagen, Infrastruktur, Maschinen, Netze, Speicher oder andere langfristige Vermögenswerte.", "CAPEX ist wichtig, weil Erneuerbare, Netze, Speicher und Industrieparks oft hohe Anfangsinvestitionen haben, aber später niedrige variable Kosten erzeugen können."],
  ["opex", "OPEX", "Laufende Betriebsausgaben, zum Beispiel Brennstoff, Wartung, Personal, CO₂-Kosten, Transport, Beschaffung und Betriebsmittel.", "OPEX macht sichtbar, warum fossile Systeme dauerhaft von Brennstoffpreisen, Importen und CO₂-Kosten abhängig bleiben."],
  ["stromgestehungskosten", "Stromgestehungskosten", "Kosten der Stromerzeugung über die Lebensdauer einer Anlage, meist je Kilowattstunde angegeben.", "Stromgestehungskosten sind kein Endkundenpreis, helfen aber, CAPEX/OPEX-Logik und Technologiekosten zu vergleichen."],
  ["industriestrom", "Industriestrom", "Strom, der für industrielle Prozesse, Produktion, Rechenzentren, Wärme, Elektrolyse, Logistik oder Fertigung benötigt wird.", "Industriestrom ist Standortpolitik: Preis, Verfügbarkeit, CO₂-Intensität, Netzanschluss und Planbarkeit entscheiden zusammen."],
  ["transformationscluster", "Transformationscluster", "Räumlich oder wirtschaftlich verbundene Wertschöpfungsketten für klimaneutrale Industrie, etwa Batterien, Halbleiter, Ladeinfrastruktur, Recycling, Speicher oder Wasserstoff.", "Transformationscluster zeigen, dass Klimaschutz nicht nur Verzicht, sondern neue industrielle Kopplung, Spezialisierung und Wertschöpfung bedeuten kann."],
  ["fossile-systemkosten", "Fossile Systemkosten", "Direkte und indirekte Kosten fossiler Energie, darunter Brennstoffimporte, CO₂-Kosten, Luftschadstoffe, Klimaschäden, geopolitische Risiken und Infrastrukturabhängigkeiten.", "Fossile Systemkosten verhindern, dass der fossile Status quo als kostenlos oder neutral erscheint."],
];

function renderWindNarrativePage([slug, title, subtitle, riskLevel, abstract, response]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero narrative-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Narrative</a> / ${escapeHtml(title)}</nav>
          <p class="hero-kicker">Narrativbibliothek · Windenergie</p>
          <h1 class="hero-title">${escapeHtml(title)}</h1>
          <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(abstract)}</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Wirkungsrisiko: ${escapeHtml(riskLevel)}</span></p>
        </div>
      </section>
      ${topicSubnav("Narrative", "../")}
      ${summaryGrid([["Risiko", riskLevel, riskLevel === "hoch" ? "critical" : "warning"], ["Typische Wirkung", "Zielkonflikt wird emotional verkürzt.", "warning"], ["Gegenbewegung", response, "positive"], ["Leuchtturm-Dossier", "Windräder, Vögel, Wald, Beton und Rückbau", "positive"]], `${title} Summary`)}
      <section class="section">
        <div class="card-grid two">
          <article class="card"><p class="card-kicker">Psychologischer Hebel</p><h2 class="card-title">Konkrete Bilder schlagen abstrakte Systemfolgen.</h2><p class="card-text">Verfügbarkeitsheuristik, Verlustaversion, Heimatbindung und Negativity Bias machen lokale Konfliktbilder besonders anschlussfähig.</p></article>
          <article class="card"><p class="card-kicker">Souverän reagieren</p><h2 class="card-title">${escapeHtml(response)}</h2><p class="card-text">Nicht beschwichtigen, nicht spiegeln, nicht entwerten. Sondern Zielkonflikt anerkennen und zur besseren Wirkungsfrage zurückführen.</p></article>
        </div>
        <p><a class="btn btn-primary" href="../../live/windraeder-voegel-wald-beton-rueckbau/">Windenergie-Dossier öffnen</a></p>
      </section>
    </main>`;
  return pageShell({ title: `${title} | Wirkungsradar Narrative | Wirkungsökonomie`, description: subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/narrative/${slug}/`, base: "../../../", main });
}

function renderFusionNarrativePage([slug, title, subtitle, riskLevel, abstract, response]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero narrative-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Narrative</a> / ${escapeHtml(title)}</nav>
          <p class="hero-kicker">Narrativbibliothek · Fusion &amp; Zeitfenster</p>
          <h1 class="hero-title">${escapeHtml(title)}</h1>
          <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(abstract)}</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Wirkungsrisiko: ${escapeHtml(riskLevel)}</span></p>
        </div>
      </section>
      ${topicSubnav("Narrative", "../")}
      ${summaryGrid([["Risiko", riskLevel, riskLevel === "hoch" ? "critical" : "warning"], ["Typische Wirkung", "Zukunftshoffnung senkt Gegenwartsdruck.", "warning"], ["Gegenbewegung", response, "positive"], ["Leuchtturm-Dossier", "Fusion löst das Energieproblem?", "positive"]], `${title} Summary`)}
      <section class="section">
        <div class="card-grid two">
          <article class="card"><p class="card-kicker">Psychologischer Hebel</p><h2 class="card-title">Hoffnung ersetzt Handlungsdruck.</h2><p class="card-text">Technological Fix Bias, Optimism Bias, Status-quo-Bias und Komplexitätsreduktion machen spätere Hightech-Lösungen emotional attraktiv.</p></article>
          <article class="card"><p class="card-kicker">Souverän reagieren</p><h2 class="card-title">${escapeHtml(response)}</h2><p class="card-text">Nicht zynisch werden. Erst Forschung anerkennen, dann Entwicklungsstufe, Zeitfenster, Netzwirkung und Opportunitätskosten klären.</p></article>
        </div>
        <p><a class="btn btn-primary" href="../../live/fusion-loest-das-energieproblem/">Fusion-Dossier öffnen</a></p>
      </section>
    </main>`;
  return pageShell({ title: `${title} | Wirkungsradar Narrative | Wirkungsökonomie`, description: subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/narrative/${slug}/`, base: "../../../", main });
}

function renderIndustryNarrativePage([slug, title, subtitle, riskLevel, abstract, response]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero narrative-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Narrative</a> / ${escapeHtml(title)}</nav>
          <p class="hero-kicker">Narrativbibliothek · Industrie &amp; Transformation</p>
          <h1 class="hero-title">${escapeHtml(title)}</h1>
          <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(abstract)}</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Wirkungsrisiko: ${escapeHtml(riskLevel)}</span></p>
        </div>
      </section>
      ${topicSubnav("Narrative", "../")}
      ${summaryGrid([["Risiko", riskLevel, riskLevel === "hoch" ? "critical" : "warning"], ["Typische Wirkung", "Transformationsstress wird zur Rückkehr-zum-Fossilen-Erzählung verkürzt.", "warning"], ["Gegenbewegung", response, "positive"], ["Leuchtturm-Dossier", "Klimaschutz deindustrialisiert Deutschland?", "positive"]], `${title} Summary`)}
      <section class="section">
        <div class="card-grid two">
          <article class="card"><p class="card-kicker">Psychologischer Hebel</p><h2 class="card-title">Verlustangst schlägt Systemrechnung.</h2><p class="card-text">Verlustaversion, Status-quo-Bias, Nostalgie-Effekt, Identitätsabwehr und Verfügbarkeitsheuristik machen einzelne Werksschließungen oder Preisbilder besonders wirksam.</p></article>
          <article class="card"><p class="card-kicker">Souverän reagieren</p><h2 class="card-title">${escapeHtml(response)}</h2><p class="card-text">Nicht beschwichtigen, nicht triumphieren. Erst reale Standortprobleme anerkennen, dann Bilanzgrenze öffnen und konkrete Transformationshebel verlangen.</p></article>
        </div>
        <p><a class="btn btn-primary" href="../../live/klimaschutz-deindustrialisiert-deutschland/">Industrie-Dossier öffnen</a></p>
      </section>
    </main>`;
  return pageShell({ title: `${title} | Wirkungsradar Narrative | Wirkungsökonomie`, description: subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/narrative/${slug}/`, base: "../../../", main });
}

function renderNuclearNarrativePage([slug, title, subtitle, riskLevel, abstract, response]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="hero radar-page-hero narrative-hero">
        <div class="radar-hero-copy">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../../../index.html">Start</a> / <a href="../../">Wirkungsradar</a> / <a href="../">Narrative</a> / ${escapeHtml(title)}</nav>
          <p class="hero-kicker">Narrativbibliothek · Kernenergie</p>
          <h1 class="hero-title">${escapeHtml(title)}</h1>
          <p class="hero-subtitle">${escapeHtml(subtitle)}</p>
          <p class="radar-abstract"><strong>Abstract:</strong> ${escapeHtml(abstract)}</p>
          <p class="radar-status-line"><span>Status: veröffentlicht</span><span>Datenstand: ${UPDATED_AT}</span><span>Wirkungsrisiko: ${escapeHtml(riskLevel)}</span></p>
        </div>
      </section>
      ${topicSubnav("Narrative", "../")}
      ${summaryGrid([["Risiko", riskLevel, riskLevel === "hoch" ? "critical" : "warning"], ["Typische Wirkung", "Ein realer Technikvorteil wird zum Gesamturteil erweitert.", "warning"], ["Gegenbewegung", response, "positive"], ["Leuchtturm-Dossier", "Kernkraft zurück?", "positive"]], `${title} Summary`)}
      <section class="section">
        <div class="card-grid two">
          <article class="card"><p class="card-kicker">Psychologischer Hebel</p><h2 class="card-title">Kontrolle wirkt einfacher als Systemarchitektur.</h2><p class="card-text">Solutionism, Authority Bias, technologische Fixierung, Nostalgie und Komplexitätsreduktion machen die Rückkehrerzählung anschlussfähig.</p></article>
          <article class="card"><p class="card-kicker">Souverän reagieren</p><h2 class="card-title">${escapeHtml(response)}</h2><p class="card-text">Erst den CO₂-Kern anerkennen. Dann Zeitfenster, Finanzierung, Endlager, Rückbau, Sicherheit und Opportunitätskosten in die Debatte holen.</p></article>
        </div>
        <p><a class="btn btn-primary" href="../../live/kernenergie-wieder-in-deutschland/">Kernenergie-Dossier öffnen</a></p>
      </section>
    </main>`;
  return pageShell({ title: `${title} | Wirkungsradar Narrative | Wirkungsökonomie`, description: subtitle, canonical: `https://wirkungsoekonomie.de/wirkungsradar/narrative/${slug}/`, base: "../../../", main });
}

function renderWindGlossaryPage([slug, label, definition, hover]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="term-hero">
        <div class="term-hero__copy">
          <nav class="breadcrumb"><a href="../">Begriffe</a> / ${escapeHtml(label)}</nav>
          <p class="eyebrow">Glossar der Wirkungsökonomie</p>
          <h1>${escapeHtml(label)}</h1>
          <p class="lead">${escapeHtml(definition)}</p>
          <p class="term-meta">Kategorie: Wirkungsradar · Windenergie · Datenstand: ${UPDATED_AT}</p>
          <div class="term-action-row"><a class="btn btn-primary" href="../../wirkungsradar/live/windraeder-voegel-wald-beton-rueckbau/">Windenergie-Dossier</a><a class="btn btn-secondary" href="../">Alle Begriffe</a></div>
        </div>
      </section>
      <div class="term-page">
        <section class="term-section-card"><h2>Kurz erklärt</h2><p>${escapeHtml(definition)}</p></section>
        <section class="term-section-card"><h2>Warum wichtig?</h2><p>${escapeHtml(hover)}</p></section>
        <section class="term-section-card"><h2>WÖk-Bezug</h2><p>Der Begriff hilft, Windenergie nicht als Lagerfrage, sondern als konkrete Wirkungsprüfung nach Mensch, Planet und Demokratie zu behandeln.</p></section>
      </div>
    </main>`;
  return pageShell({ title: `${label} | Glossar der Wirkungsökonomie`, description: definition, canonical: `https://wirkungsoekonomie.de/begriffe/${slug}/`, base: "../../", main });
}

function renderFusionGlossaryPage([slug, label, definition, hover]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="term-hero">
        <div class="term-hero__copy">
          <nav class="breadcrumb"><a href="../">Begriffe</a> / ${escapeHtml(label)}</nav>
          <p class="eyebrow">Glossar der Wirkungsökonomie</p>
          <h1>${escapeHtml(label)}</h1>
          <p class="lead">${escapeHtml(definition)}</p>
          <p class="term-meta">Kategorie: Wirkungsradar · Fusion · Datenstand: ${UPDATED_AT}</p>
          <div class="term-action-row"><a class="btn btn-primary" href="../../wirkungsradar/live/fusion-loest-das-energieproblem/">Fusion-Dossier</a><a class="btn btn-secondary" href="../">Alle Begriffe</a></div>
        </div>
      </section>
      <div class="term-page">
        <section class="term-section-card"><h2>Kurz erklärt</h2><p>${escapeHtml(definition)}</p></section>
        <section class="term-section-card"><h2>Warum wichtig?</h2><p>${escapeHtml(hover)}</p></section>
        <section class="term-section-card"><h2>WÖk-Bezug</h2><p>Der Begriff hilft, Fusionsforschung nicht als Lagerfrage zu behandeln, sondern nach Entwicklungsstufe, Zeitfenster, Netzwirkung, Kosten und Alternativenwirkung zu prüfen.</p></section>
      </div>
    </main>`;
  return pageShell({ title: `${label} | Glossar der Wirkungsökonomie`, description: definition, canonical: `https://wirkungsoekonomie.de/begriffe/${slug}/`, base: "../../", main });
}

function renderEvGlossaryPage([slug, label, definition, hover]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="term-hero">
        <div class="term-hero__copy">
          <nav class="breadcrumb"><a href="../">Begriffe</a> / ${escapeHtml(label)}</nav>
          <p class="eyebrow">Glossar der Wirkungsökonomie</p>
          <h1>${escapeHtml(label)}</h1>
          <p class="lead">${escapeHtml(definition)}</p>
          <p class="term-meta">Kategorie: Wirkungsradar · Elektromobilität · Ladeinfrastruktur · Datenstand: ${UPDATED_AT}</p>
          <div class="term-action-row"><a class="btn btn-primary" href="../../wirkungsradar/live/e-autos-schlimmer-als-verbrenner/">E-Mobilität-Dossier</a><a class="btn btn-secondary" href="../">Alle Begriffe</a></div>
        </div>
      </section>
      <div class="term-page">
        <section class="term-section-card"><h2>Kurz erklärt</h2><p>${escapeHtml(definition)}</p></section>
        <section class="term-section-card"><h2>Warum wichtig?</h2><p>${escapeHtml(hover)}</p></section>
        <section class="term-section-card"><h2>WÖk-Bezug</h2><p>Der Begriff hilft, Elektromobilität nicht nur als Fahrzeug- oder Akku-Frage zu bewerten, sondern als Zusammenspiel aus Produkt, Ladeinfrastruktur, Netz, Alltag, Logistik und Netto-Wirkung.</p></section>
      </div>
    </main>`;
  return pageShell({ title: `${label} | Glossar der Wirkungsökonomie`, description: definition, canonical: `https://wirkungsoekonomie.de/begriffe/${slug}/`, base: "../../", main });
}

function renderIndustryGlossaryPage([slug, label, definition, hover]) {
  const main = `    <main id="inhalt" data-pagefind-body>
      <section class="term-hero">
        <div class="term-hero__copy">
          <nav class="breadcrumb"><a href="../">Begriffe</a> / ${escapeHtml(label)}</nav>
          <p class="eyebrow">Glossar der Wirkungsökonomie</p>
          <h1>${escapeHtml(label)}</h1>
          <p class="lead">${escapeHtml(definition)}</p>
          <p class="term-meta">Kategorie: Wirkungsradar · Industrie · Transformation · Datenstand: ${UPDATED_AT}</p>
          <div class="term-action-row"><a class="btn btn-primary" href="../../wirkungsradar/live/klimaschutz-deindustrialisiert-deutschland/">Industrie-Dossier</a><a class="btn btn-secondary" href="../">Alle Begriffe</a></div>
        </div>
      </section>
      <div class="term-page">
        <section class="term-section-card"><h2>Kurz erklärt</h2><p>${escapeHtml(definition)}</p></section>
        <section class="term-section-card"><h2>Warum wichtig?</h2><p>${escapeHtml(hover)}</p></section>
        <section class="term-section-card"><h2>WÖk-Bezug</h2><p>Der Begriff hilft, Standort- und Klimadebatten als vollständige Wirkungsrechnung zu führen: Mensch, Planet, Demokratie, Infrastruktur, Kosten, Abhängigkeiten und Zukunftsmärkte gehören gemeinsam in die Bilanz.</p></section>
      </div>
    </main>`;
  return pageShell({ title: `${label} | Glossar der Wirkungsökonomie`, description: definition, canonical: `https://wirkungsoekonomie.de/begriffe/${slug}/`, base: "../../", main });
}

const industrySourceLabels = [
  "Fraunhofer ISE - Stromgestehungskosten 2024",
  "Volkswagen/PowerCo - Salzgitter Gigafactory",
  "Reuters - Tesla Batteriezellproduktion Grünheide",
  "electrive - CATL production in Germany",
  "electrive - Heide / Northvolt / Lyten",
  "Reuters - ACC drops German and Italian gigafactory plans",
  "TSMC - ESMC Dresden",
  "Infineon - Smart Power Fab Dresden",
  "Bosch - Wafer Fab Dresden",
  "GTAI - Data Center Germany",
  "Umweltbundesamt - Gesellschaftliche Kosten von Umweltbelastungen",
  "Fraunhofer ISE / Energy-Charts",
];

const industrySourcePack = {
  id: "industry-transformation-v1",
  last_verified: UPDATED_AT,
  update_frequency: "quarterly",
  dossier: "klimaschutz-deindustrialisiert-deutschland",
  sources: Object.fromEntries(industrySourceLabels.map((label) => {
    const source = sourcePack.primary_sources.find((item) => item.label === label);
    if (!source) throw new Error(`Missing industry source: ${label}`);
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    return [key, {
      label: source.label,
      publisher: source.publisher,
      url: source.url,
      use_for: source.use_for,
      type: source.type,
    }];
  })),
};

writeFile("content/wirkungsradar/source-packs/climate-energy-v1.yaml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml(sourcePack).trim()}\n`);
writeFile("content/wirkungsradar/source-packs/deep-dive-climate-energy-v1.yaml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml(deepDiveSourcePack).trim()}\n`);
writeFile("content/wirkungsradar/source-packs/wind-energy-nature-v1.yaml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml({
  id: "wind-energy-nature-v1",
  last_verified: UPDATED_AT,
  update_frequency: "quarterly",
  sources: Object.fromEntries(windExternalSources.map(([title, shows, use_for, warning, url]) => [
    title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
    { label: title, url, use_for: [use_for], warning, shows },
  ])),
}).trim()}\n`);
writeFile("content/wirkungsradar/source-packs/fusion-energy-v1.yaml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml({
  id: "fusion-energy-v1",
  last_verified: UPDATED_AT,
  update_frequency: "quarterly",
  dossier: "fusion-loest-das-energieproblem",
  sources: Object.fromEntries(fusionExternalSources.map(([title, shows, use_for, warning, url]) => [
    title.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
    { label: title, url, use_for: [use_for], warning, shows },
  ])),
}).trim()}\n`);
writeFile("content/wirkungsradar/source-packs/industry-transformation-v1.yaml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml(industrySourcePack).trim()}\n`);
writeFile("content/wirkungsradar/source-packs/nuclear-germany-v1.yaml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml({
  id: "nuclear-germany-v1",
  last_verified: UPDATED_AT,
  update_frequency: "quarterly",
  dossier: "kernenergie-wieder-in-deutschland",
  sources: {
    base_atomausstieg: {
      label: "BASE - Ausstieg aus der Atomkraft",
      url: "https://www.base.bund.de/de/nukleare-sicherheit/atomausstieg/ausstieg-atomkraft/ausstieg-atomkraft_inhalt.html",
      use_for: ["Abschaltung letzte drei AKW 15. April 2023", "Atomausstieg Deutschland"],
      warning: "Offizielle Quelle; politische Neubewertungen regelmäßig prüfen.",
    },
    bmuv_atomkraftwerke_deutschland: {
      label: "BMUV - Atomkraftwerke in Deutschland",
      url: "https://www.bundesumweltministerium.de/themen/nukleare-sicherheit/aufsicht-ueber-atomkraftwerke/atomkraftwerke-in-deutschland",
      use_for: ["Berechtigungen zum Leistungsbetrieb erloschen", "Emsland, Isar 2, Neckarwestheim 2"],
      warning: "Rechts- und Genehmigungsstand regelmäßig prüfen.",
    },
    fraunhofer_lcoe_2024: {
      label: "Fraunhofer ISE - Stromgestehungskosten erneuerbare Energien 2024",
      url: "https://www.ise.fraunhofer.de/en/publications/studies/cost-of-electricity.html",
      use_for: ["Kostenvergleich neuer Anlagen in Deutschland", "PV, Wind, Kernkraft und fossile Kraftwerke"],
      warning: "LCOE ist nicht Endkundenpreis; Entsorgung, Versicherung und Systemkosten separat prüfen.",
    },
    bge_endlagersuche: {
      label: "BGE - Endlagersuche für hochradioaktive Abfälle",
      url: "https://www.bge.de/de/endlagersuche/",
      use_for: ["hochradioaktiver Abfall", "Standortauswahl", "Menge und Radioaktivität"],
      warning: "Stand der Endlagersuche regelmäßig aktualisieren.",
    },
    base_zeitperspektive_endlager: {
      label: "BASE - Zeitperspektive Endlagersuche",
      url: "https://www.base.bund.de/de/endlager/endlager-sicherheit/zeitperspektive/zeitbedarf-endlagersuche_inhalt.html",
      use_for: ["Zeitbedarf Endlagersuche", "Standortauswahlgesetz"],
      warning: "Zeitpläne können sich politisch und verfahrenstechnisch ändern.",
    },
    base_transmutation: {
      label: "BASE - Transmutation hochradioaktiver Abfälle",
      url: "https://www.base.bund.de/de/nukleare-sicherheit/kerntechnik/partitionierung-transmutation/partitionierung-transmutation.html",
      use_for: ["Transmutation", "Endlager bleibt erforderlich", "hochradioaktive Abfälle"],
      warning: "Forschungsthema; nicht als kurzfristige Entsorgungslösung darstellen.",
    },
    oecd_nea_financing_new_nuclear: {
      label: "OECD NEA - Financing nuclear new build",
      url: "https://www.oecd-nea.org/upload/docs/application/pdf/2024-09/nea_publication_2_2024-09-18_16-50-13_471.pdf",
      use_for: ["Finanzierung neuer Kernkraft", "Kosten- und Verzögerungsrisiken"],
      warning: "OECD NEA ist nuklearfachliche Institution; für Finanzierungsrisiken dennoch relevant.",
    },
    iaea_smr_platform: {
      label: "IAEA - SMR Platform Annual Report",
      url: "https://nucleus.iaea.org/sites/smr/Shared%20Documents/IAEA%20SMR%20Platform%20Annual%20Report%202025.pdf",
      use_for: ["SMR-Forschung", "Sicherheits-, Rechts- und Infrastrukturfragen"],
      warning: "SMR-Entwicklung nicht mit kommerzieller Massenverfügbarkeit verwechseln.",
    },
  },
}).trim()}\n`);
writeFile("content/wirkungsradar/climate-energy-mapping.yaml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml(mapping).trim()}\n`);
writeFile("content/wirkungsradar/climate-energy.yml", `# Generated by scripts/wirkungsradar/build-climate-energy-cluster.mjs\n${toYaml(dataModel()).trim()}\n`);
writeFile("wirkungsradar/detail/index.html", renderDetailIndex());
writeFile("wirkungsradar/themen/index.html", renderThemesIndex());
writeFile("wirkungsradar/themen/klima-energie/index.html", renderClusterPage());
for (const topic of subtopics) {
  writeFile(`wirkungsradar/themen/klima-energie/${topic.slug}/index.html`, renderSubtopic(topic));
}
for (const claim of claims) {
  writeFile(`wirkungsradar/live/${claim.slug}/index.html`, renderLiveCard(claim));
}
for (const slug of deepDiveSlugs) {
  const claim = claims.find((item) => item.slug === slug);
  if (claim) writeFile(`wirkungsradar/detail/${claim.slug}/index.html`, renderDeepDiveDetail(claim));
}
const co2SystemCostsClaim = claims.find((item) => item.slug === "co2-preis-oder-fossile-systemkosten");
if (co2SystemCostsClaim) {
  writeFile(`wirkungsradar/detail/${co2SystemCostsClaim.slug}/index.html`, renderCo2SystemCostsDossier(co2SystemCostsClaim, "detail"));
}
const windEnergyNatureClaim = claims.find((item) => item.slug === "windraeder-voegel-wald-beton-rueckbau");
if (windEnergyNatureClaim) {
  writeFile(`wirkungsradar/detail/${windEnergyNatureClaim.slug}/index.html`, renderWindEnergyNatureDossier(windEnergyNatureClaim, "detail"));
}
for (const narrative of windNarrativePages) {
  writeFile(`wirkungsradar/narrative/${narrative[0]}/index.html`, renderWindNarrativePage(narrative));
}
for (const narrative of fusionNarrativePages) {
  writeFile(`wirkungsradar/narrative/${narrative[0]}/index.html`, renderFusionNarrativePage(narrative));
}
for (const narrative of industryNarrativePages) {
  writeFile(`wirkungsradar/narrative/${narrative[0]}/index.html`, renderIndustryNarrativePage(narrative));
}
for (const narrative of nuclearNarrativePages) {
  writeFile(`wirkungsradar/narrative/${narrative[0]}/index.html`, renderNuclearNarrativePage(narrative));
}
for (const term of windGlossaryTerms) {
  const termPath = `begriffe/${term[0]}/index.html`;
  if (!fs.existsSync(termPath)) writeFile(termPath, renderWindGlossaryPage(term));
}
for (const term of fusionGlossaryTerms) {
  const termPath = `begriffe/${term[0]}/index.html`;
  if (!fs.existsSync(termPath)) writeFile(termPath, renderFusionGlossaryPage(term));
}
for (const term of evGlossaryTerms) {
  const termPath = `begriffe/${term[0]}/index.html`;
  if (!fs.existsSync(termPath)) writeFile(termPath, renderEvGlossaryPage(term));
}
for (const term of industryGlossaryTerms) {
  const termPath = `begriffe/${term[0]}/index.html`;
  if (!fs.existsSync(termPath)) writeFile(termPath, renderIndustryGlossaryPage(term));
}

console.log(`Built climate-energy cluster: ${subtopics.length} subtopics, ${claims.length} live cards, ${deepDiveSlugs.length} deep dives.`);
