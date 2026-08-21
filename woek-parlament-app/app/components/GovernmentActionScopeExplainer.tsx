type GovernmentActionScopeExplainerProps = {
  compact?: boolean;
};

const sources = [
  {
    label: "Deutsche Nachhaltigkeitsstrategie 2025",
    href: "https://wirkungsoekonomie.de/quellenarchiv/wok-q-9032/",
  },
  {
    label: "GGO - insbesondere §§ 43, 44 und 62",
    href: "https://wirkungsoekonomie.de/quellenarchiv/wok-q-9029/",
  },
  {
    label: "§ 7 Bundeshaushaltsordnung",
    href: "https://wirkungsoekonomie.de/quellenarchiv/wok-q-9048/",
  },
  {
    label: "VV-BHO zu § 7",
    href: "https://wirkungsoekonomie.de/quellenarchiv/wok-q-9049/",
  },
  {
    label: "E-Gesetzgebung / eGFA / eNAP",
    href: "https://wirkungsoekonomie.de/quellenarchiv/wok-q-9034/",
  },
  {
    label: "§ 13 Bundes-Klimaschutzgesetz",
    href: "https://wirkungsoekonomie.de/quellenarchiv/wok-q-9046/",
  },
  {
    label: "§ 8 Bundes-Klimaanpassungsgesetz",
    href: "https://wirkungsoekonomie.de/quellenarchiv/wok-q-9047/",
  },
] as const;

export function GovernmentActionScopeExplainer({ compact = false }: GovernmentActionScopeExplainerProps) {
  return (
    <section className="notice notice-neutral" id="wirkungsrelevanz" aria-labelledby="wirkungsrelevanz-title">
      <p className="eyebrow">Prüfumfang</p>
      <h2 id="wirkungsrelevanz-title">Wirkungsrelevanz statt Rechtsform</h2>
      <p>
        Die WÖk nimmt einen Gegenstand in den Blick, wenn er einen materiell bedeutenden Zustand verändern kann - nicht erst,
        wenn er die Form eines Gesetzes annimmt. Dazu können Gesetze und Rechtsverordnungen ebenso gehören wie Strategien,
        Programme, Förderungen, Garantien, Investitionen, Beschaffung, Infrastruktur- und Verwaltungsentscheidungen.
      </p>
      <p>
        <strong>Deutschland prüft Folgen bereits durch unterschiedliche, objektspezifische Verfahren.</strong> Für Entwürfe von
        Bundesgesetzen verlangen §§ 43 und 44 GGO unter anderem Ziel und Notwendigkeit, Sachverhalt und Erkenntnisquellen,
        andere Lösungsmöglichkeiten und Ablehnungsgründe, beabsichtigte Wirkungen, unbeabsichtigte Nebenwirkungen,
        langfristige Nachhaltigkeitswirkungen und Angaben zur späteren Überprüfung; § 62 erstreckt einschlägige Regeln auf
        Rechtsverordnungen. eNAP unterstützt die Nachhaltigkeitsprüfung innerhalb von E-Gesetzgebung und eGFA. Daraus folgt
        keine allgemeine eNAP-Pflicht für jede Form staatlichen Handelns.
      </p>
      <p>
        Für <strong>alle finanzwirksamen Maßnahmen</strong> verlangt § 7 Absatz 2 BHO angemessene
        Wirtschaftlichkeitsuntersuchungen. Die VV-BHO konkretisiert die Untersuchung in der Planungsphase und die spätere
        Erfolgskontrolle mit Zielerreichungs-, Wirkungs- und Wirtschaftlichkeitskontrolle. Die Wirkungskontrolle fragt dabei
        ausdrücklich nach Ursächlichkeit sowie nach beabsichtigten und unbeabsichtigten Wirkungen. Je nach Gegenstand kommen
        weitere Rahmen hinzu - etwa § 13 KSG für Klimaziele, Bundesinvestitionen und Beschaffung oder § 8 KAnG für
        Klimaanpassung bei Planungen und Entscheidungen öffentlicher Aufgabenträger.
      </p>

      {!compact && (
        <div className="government-method-split">
          <article>
            <p className="eyebrow">Staatliche Prüfarchitektur</p>
            <h3>Der geltende Rahmen folgt dem Entscheidungsobjekt</h3>
            <p>
              Vor jeder WÖk-Analyse wird deshalb festgestellt, welches Verfahren, Fachrecht, Haushaltsrecht, welche Strategie
              und welche spätere Kontrolle im konkreten Fall tatsächlich gelten. Bundes-GGO und eNAP werden weder auf andere
              Handlungsformen noch auf Länder oder die EU übertragen.
            </p>
          </article>
          <article>
            <p className="eyebrow">WÖk-Prüfarchitektur</p>
            <h3>Eine gemeinsame Kette über Objekttypen hinweg</h3>
            <p>
              WÖk ersetzt diese Verfahren nicht. Ihr Zusatznutzen ist eine einheitliche, materialitätsgetriebene Verbindung aus
              Problem Review, Goal Review, kausaler und systemischer Analyse, Gegenfaktum und Attribution, gemeinsamen Zielen und
              Schutzgrenzen, symmetrischem Optionsvergleich, Verteilung, Resilienz, Omissions, Delivery und Policy Coherence sowie
              EvidenceEvents, Reality Check und versioniertem Lernen.
            </p>
          </article>
        </div>
      )}

      <p>
        <strong>Staatliches Eigentum allein macht eine Unternehmensentscheidung nicht zur Regierungsentscheidung.</strong>
        Eigentümerrolle, konkreter Steuerungseinfluss, öffentliches Mandat und politische Flankierung werden getrennt belegt.
        Attribution und Verantwortung bleiben offen, wenn die Quellen eine Zurechnung nicht tragen.
      </p>

      <div className="reference-links" aria-label="Amtliche Grundlagen zum Prüfumfang">
        {sources.map((source) => (
          <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
            {source.label} <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
