// One accessible figure shared by the current explanation and glossary pages.
export function impactArchitectureVisual() {
  return `<figure class="woek-visual-figure" data-impact-architecture>
    <picture>
      <source media="(max-width: 760px)" srcset="/assets/visuals/model/woek_wirkpfad_iooi_architektur_mobile.svg" type="image/svg+xml">
      <img class="woek-visual" src="/assets/visuals/model/woek_wirkpfad_iooi_architektur.svg" width="1600" height="1120" alt="Schichtenmodell: ein möglicher oder beobachteter Wirkpfad in der Mitte, IOOI als Results-Chain-Linse darin. Ex-ante-Prüfung, Evidenz und Zurechnung, Bewertung und Schutz sowie Systemprüfung liegen quer zum Pfad. Governance und Rückkopplung umschließen die Ebenen; sie sind keine zeitlichen Wirkungsstationen." loading="lazy" decoding="async">
    </picture>
    <figcaption>IOOI ist eine Teilperspektive innerhalb der WÖk. Problem- und Zielprüfung setzen vor der Auswahl von Inputs an; Prüf-, Bewertungs- und Schutzregeln gelten auch innerhalb der Kette. Systemprüfung und Rückkopplung gehen über ihre Darstellung hinaus, ohne zusätzliche zeitliche Kausalstationen zu bilden. <a href="/verstehen/iooi-und-wirkungsoekonomie/#ebenen">Textalternative: die Ebenen im Einzelnen</a>. <a href="/verstehen/iooi-und-wirkungsoekonomie/#praezisierung-20261001">Analyse und Berechnung präzisieren</a>. <a href="/assets/visuals/model/woek_wirkpfad_iooi_architektur.svg">Desktop-Ansicht</a> · <a href="/assets/visuals/model/woek_wirkpfad_iooi_architektur_mobile.svg">Mobile Ansicht</a>.</figcaption>
  </figure>`;
}
