export type PoliticalSourceCatalogEntry = {
  sourceKey: string;
  sourceType: "ELECTION_PROGRAM" | "COALITION_AGREEMENT";
  actor: string;
  actorType: "PARTY" | "PARTY_ALLIANCE" | "COALITION";
  title: string;
  canonicalUrl: string;
  downloadAssetUrl: string;
  documentDate: string | null;
  sourceStatus: "SOURCE_REGISTERED" | "STRUCTURED" | "EDITORIALLY_VERIFIED";
  commitmentCount: number;
  sourceHash: string;
  note: string;
};

// Canonical primary-source landing pages only.  The portal does not mirror
// programme PDFs publicly; exact passages are added only after source and
// version verification in the protected editorial workflow.
export const politicalSourceCatalog: PoliticalSourceCatalogEntry[] = [
  {
    sourceKey: "btw-2025-cdu-csu",
    sourceType: "ELECTION_PROGRAM",
    actor: "CDU und CSU",
    actorType: "PARTY_ALLIANCE",
    title: "Politikwechsel für Deutschland – Wahlprogramm zur Bundestagswahl 2025",
    canonicalUrl: "https://www.cdu.de/wahlprogramm-von-cdu-und-csu/",
    downloadAssetUrl: "https://www.cdu.de/app/uploads/2025/01/km_btw_2025_wahlprogramm_langfassung_ansicht.pdf",
    documentDate: "2025-01-01",
    sourceStatus: "STRUCTURED",
    commitmentCount: 168,
    sourceHash: "08f751316e731b77aa2f18090b8695d88268f2942481399f37a3a47317361795",
    note: "Originalquelle der Partei; die quellengebundenen Zusagen sind mit Fundstellen erschlossen. Ihre Wirkung wird daraus nicht abgeleitet."
  },
  {
    sourceKey: "btw-2025-spd",
    sourceType: "ELECTION_PROGRAM",
    actor: "SPD",
    actorType: "PARTY",
    title: "Mehr für Dich. Besser für Deutschland. – Regierungsprogramm 2025",
    canonicalUrl: "https://www.spd.de/bundestagswahl/programm",
    downloadAssetUrl: "https://www.spd.de/fileadmin/Dokumente/Beschluesse/Programm/2025_SPD_Regierungsprogramm.pdf",
    documentDate: "2025-01-11",
    sourceStatus: "STRUCTURED",
    commitmentCount: 200,
    sourceHash: "05aeb9eb19fd423288d94de1d15cabcddbcb9bb1ecf65237657d10e4839b9d7e",
    note: "Originalquelle der Partei; die quellengebundenen Zusagen sind mit Fundstellen erschlossen. Ihre Wirkung wird daraus nicht abgeleitet."
  },
  {
    sourceKey: "btw-2025-gruene",
    sourceType: "ELECTION_PROGRAM",
    actor: "BÜNDNIS 90/DIE GRÜNEN",
    actorType: "PARTY",
    title: "Zusammen wachsen – Regierungsprogramm zur Bundestagswahl 2025",
    canonicalUrl: "https://www.gruene.de/artikel/zusammen-wachsen",
    downloadAssetUrl: "https://cms.gruene.de/uploads/assets/20250318_Regierungsprogramm_DIGITAL_DINA5.pdf",
    documentDate: "2025-01-26",
    sourceStatus: "STRUCTURED",
    commitmentCount: 292,
    sourceHash: "bf8d15021d8cc2695cb97d0d4a4bc9b7b93de54b86d491d8536b1325354dc213",
    note: "Originalquelle der Partei; die quellengebundenen Zusagen sind mit Fundstellen erschlossen. Ihre Wirkung wird daraus nicht abgeleitet."
  },
  {
    sourceKey: "btw-2025-afd",
    sourceType: "ELECTION_PROGRAM",
    actor: "Alternative für Deutschland",
    actorType: "PARTY",
    title: "Zeit für Deutschland – Wahlprogramm zur Bundestagswahl 2025",
    canonicalUrl: "https://www.afd.de/wahlprogramm25/",
    downloadAssetUrl: "https://www.afd.de/wp-content/uploads/2025/02/AfD_Bundestagswahlprogramm2025_web.pdf",
    documentDate: "2025-01-12",
    sourceStatus: "STRUCTURED",
    commitmentCount: 103,
    sourceHash: "e2d0a944f54017aa432bcd0c069c7908aefb3ea65af4904e7f86ca7c7bd0d4bb",
    note: "Originalquelle der Partei; die quellengebundenen Zusagen sind mit Fundstellen erschlossen. Ihre Wirkung wird daraus nicht abgeleitet."
  },
  {
    sourceKey: "btw-2025-linke",
    sourceType: "ELECTION_PROGRAM",
    actor: "Die Linke",
    actorType: "PARTY",
    title: "Alle wollen regieren. Wir wollen verändern. – Wahlprogramm 2025",
    canonicalUrl: "https://www.die-linke.de/bundestagswahl-2025/wahlprogramm/",
    downloadAssetUrl: "https://www.die-linke.de/fileadmin/user_upload/Wahlprogramm_Langfassung_Linke-BTW25_01.pdf",
    documentDate: "2025-01-18",
    sourceStatus: "STRUCTURED",
    commitmentCount: 200,
    sourceHash: "301bd30a5fcd2a7e791adc4db5294e79d8f3fd71b8c9b080b057f14bf8cae600",
    note: "Originalquelle der Partei; die quellengebundenen Zusagen sind mit Fundstellen erschlossen. Ihre Wirkung wird daraus nicht abgeleitet."
  },
  {
    sourceKey: "btw-2025-ssw",
    sourceType: "ELECTION_PROGRAM",
    actor: "Südschleswigscher Wählerverband",
    actorType: "PARTY",
    title: "Deine Stimme für den Norden – Wahlprogramm zur Bundestagswahl 2025",
    canonicalUrl: "https://www.ssw.de/bundestagswahl",
    downloadAssetUrl: "https://www.ssw.de/fileadmin/user_upload/daten/aktuelles/2025/BTW25/SSW-Wahlprogramm_BTW_2025.pdf",
    documentDate: "2025-01-11",
    sourceStatus: "STRUCTURED",
    commitmentCount: 283,
    sourceHash: "192d5fbaf8c08a299c419e201ccd0c3496e661c6c0808f3d70ca5077d3cf0a05",
    note: "Originalquelle der Partei; die quellengebundenen Zusagen sind mit Fundstellen erschlossen. Ihre Wirkung wird daraus nicht abgeleitet."
  },
  {
    sourceKey: "coalition-2025-cdu-csu-spd",
    sourceType: "COALITION_AGREEMENT",
    actor: "CDU, CSU und SPD",
    actorType: "COALITION",
    title: "Verantwortung für Deutschland – Koalitionsvertrag für die 21. Legislaturperiode",
    canonicalUrl: "https://www.bundesregierung.de/breg-de/aktuelles/koalitionsvertrag-2025-2340970",
    downloadAssetUrl: "https://www.koalitionsvertrag2025.de/sites/www.koalitionsvertrag2025.de/files/koav_2025.pdf",
    documentDate: "2025-04-09",
    sourceStatus: "STRUCTURED",
    commitmentCount: 347,
    sourceHash: "135a2450cdbc030d6664aa44cd617177bbb8cac76d9861fcdf0c6e37e0d23c4a",
    note: "Originaldokument der Koalitionsparteien, veröffentlicht auf der Website der Bundesregierung. Die Vereinbarung ist kein Gesetz und kein amtlicher Nachweis einer Umsetzung."
  }
];
