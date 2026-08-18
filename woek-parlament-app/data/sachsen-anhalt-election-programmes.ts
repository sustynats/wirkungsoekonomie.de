/**
 * Primary sources for the 2026 Landtag election in Saxony-Anhalt.
 *
 * This catalogue is deliberately source-only. A programme is not an impact
 * assessment: a published programme record becomes a public Wirkungsakte only
 * after the source-bound technical review has been completed.
 */
export type SaxonyAnhaltElectionProgramme = {
  sourceKey: string;
  party: string;
  title: string;
  canonicalUrl: string;
  downloadUrl: string | null;
  sourceFormat: "PDF" | "HTML";
  documentStatus: "BESCHLOSSEN" | "VEROEFFENTLICHTE_WEBFASSUNG";
  decisionDate: string | null;
  note: string;
};

export const saxonyAnhaltElectionProgrammes: SaxonyAnhaltElectionProgramme[] = [
  {
    sourceKey: "ltw-2026-st-cdu",
    party: "CDU Sachsen-Anhalt",
    title: "Regierungsprogramm zur Landtagswahl 2026",
    canonicalUrl: "https://cdulsa.de/landtagswahl-2026",
    downloadUrl: "https://www.cdulsa.de/sites/www.cdulsa.de/files/downloads/regierungsprogramm_ltw_web.pdf",
    sourceFormat: "PDF",
    documentStatus: "BESCHLOSSEN",
    decisionDate: null,
    note: "Auf der Parteiseite als beschlossenes Regierungsprogramm zur Landtagswahl 2026 ausgewiesen."
  },
  {
    sourceKey: "ltw-2026-st-spd",
    party: "SPD Sachsen-Anhalt",
    title: "Wahlprogramm zur Landtagswahl 2026",
    canonicalUrl: "https://spdsachsenanhalt.de/wahlprogramm/",
    downloadUrl: "https://spdsachsenanhalt.de/wp-content/uploads/sites/63/2026/06/Wahlprogramm-der-SPD-Sachsen-Anhalt-zur-Landtagswahl-2026.pdf?x98434",
    sourceFormat: "PDF",
    documentStatus: "BESCHLOSSEN",
    decisionDate: "2026-03-21",
    note: "Nach Angabe des Landesverbands am 21. März 2026 beschlossen."
  },
  {
    sourceKey: "ltw-2026-st-gruene",
    party: "BÜNDNIS 90/DIE GRÜNEN Sachsen-Anhalt",
    title: "Nur mit Grün wird Zukunft draus. – Programm zur Landtagswahl 2026",
    canonicalUrl: "https://www.gruene-lsa.de/programm2026/",
    downloadUrl: "https://www.gruene-lsa.de/wp-content/uploads/2026/05/Programm-zur-Landtagswahl-2026.pdf",
    sourceFormat: "PDF",
    documentStatus: "BESCHLOSSEN",
    decisionDate: null,
    note: "Vollständiges Landtagswahlprogramm des Landesverbands."
  },
  {
    sourceKey: "ltw-2026-st-linke",
    party: "Die Linke Sachsen-Anhalt",
    title: "Wir sind der Pol der Hoffnung. – Wahlprogramm zur Landtagswahl 2026",
    canonicalUrl: "https://www.dielinke-sachsen-anhalt.de/wahlen/landtagswahl-2026/",
    downloadUrl: "https://www.dielinke-sachsen-anhalt.de/fileadmin/aaa_download_lsa/Parteitage/10._LPT_2._Tagung_VV_LTW_2026/Beschluesse/2026-03-19_Landtagswahlprogramm__final_.pdf",
    sourceFormat: "PDF",
    documentStatus: "BESCHLOSSEN",
    decisionDate: "2026-03-14",
    note: "Nach Angabe des Landesverbands am 14. März 2026 beschlossen."
  },
  {
    sourceKey: "ltw-2026-st-bsw",
    party: "BSW Sachsen-Anhalt",
    title: "Wahlprogramm zur Landtagswahl 2026",
    canonicalUrl: "https://st.bsw-vg.de/landtagswahl-2026/",
    downloadUrl: "https://st.bsw-vg.de/wp-content/uploads/2026/04/BSW_Landtagswahlprogramm_SachsenAnhalt.pdf",
    sourceFormat: "PDF",
    documentStatus: "BESCHLOSSEN",
    decisionDate: "2026-03-08",
    note: "Nach Angabe des Landesverbands auf dem Parteitag im März 2026 beschlossen."
  },
  {
    sourceKey: "ltw-2026-st-afd",
    party: "Alternative für Deutschland Sachsen-Anhalt",
    title: "Regierungsprogramm für Sachsen-Anhalt zur Landtagswahl 2026",
    canonicalUrl: "https://afd-regierungsprogramm.de/",
    downloadUrl: null,
    sourceFormat: "HTML",
    documentStatus: "VEROEFFENTLICHTE_WEBFASSUNG",
    decisionDate: "2026-04-11",
    note: "Die öffentlich abrufbare Programmfassung wird als Webquelle mit Inhalts-Hash gesichert; die Beschlussfassung wurde im April 2026 gemeldet."
  }
];
