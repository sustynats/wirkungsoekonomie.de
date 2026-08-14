import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzinformationen für das Wirkungsportal Parlament des Instituts für Wirkungsökonomie."
};

export default function DatenschutzPage() {
  return <div className="container page-shell">
    <header className="page-intro">
      <p className="kicker">Datenschutz</p>
      <h1>Datenschutzerklärung</h1>
      <p>Diese Erklärung beschreibt die Datenverarbeitung im Wirkungsportal Parlament in seinem derzeitigen Funktionsumfang. Sie gilt nicht für eigenständige Websites oder Dienste, auf die wir verlinken.</p>
    </header>

    <section className="editorial-grid" aria-label="Datenschutzinformationen">
      <article>
        <h2>Verantwortliche Stelle</h2>
        <p>Verantwortliche im Sinne der Datenschutz-Grundverordnung ist Natalie Weber, c/o IP-Management #6537, Ludwig-Erhard-Straße 18, 20459 Hamburg.</p>
        <p>Kontakt für Datenschutzanfragen: <a href="mailto:impact@wirkungsoekonomie.org">impact@wirkungsoekonomie.org</a>. Das Portal ist ein Fachangebot des Instituts für Wirkungsökonomie. Weitere Pflichtangaben stehen im <a href="https://wirkungsoekonomie.de/impressum.html">Impressum</a>.</p>
      </article>

      <article>
        <h2>Öffentliche Nutzung ohne Tracking</h2>
        <p>Die öffentlichen Seiten setzen derzeit keine Analyse-, Werbe- oder Social-Media-Tracker ein. Es gibt keine öffentlichen Nutzerkonten, kein Kontaktformular und keine personalisierte politische Profilbildung. Das Portal bewertet Maßnahmen und Quellen, nicht Besucherinnen, Besucher, Parteien oder Personen.</p>
        <p>Auf öffentlichen Seiten werden keine nicht erforderlichen Cookies oder vergleichbaren Browser-Speichertechniken eingesetzt. Deshalb wird derzeit kein Einwilligungsbanner angezeigt. Falls wir künftig nicht erforderliche Technologien einsetzen, holen wir die erforderliche Einwilligung vorher ein und aktualisieren diese Erklärung.</p>
      </article>

      <article>
        <h2>Technische Bereitstellung und Hosting</h2>
        <p>Beim Aufruf verarbeitet der Hostingdienst technisch notwendige Verbindungsdaten, insbesondere IP-Adresse, Zeitpunkt, abgerufene Seite, übertragene Datenmenge, Referrer, Browser- und Betriebssysteminformationen. Dies ist erforderlich, um die Website auszuliefern, Angriffe abzuwehren und technische Fehler zu analysieren.</p>
        <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an sicherer und zuverlässiger Bereitstellung). Hostingdienstleister ist Vercel Inc. als Auftragsverarbeiter. Dabei können Daten außerhalb des Europäischen Wirtschaftsraums verarbeitet werden. Die hierfür erforderlichen vertraglichen und gegebenenfalls weiteren Garantien nach Kapitel V DSGVO werden vor dem produktiven Redaktionsbetrieb dokumentiert und regelmäßig überprüft.</p>
      </article>

      <article>
        <h2>Amtliche Parlamentsdaten</h2>
        <p>Für das fachliche Register ruft das Portal amtliche parlamentarische Informationen serverseitig ab, insbesondere vom Deutschen Bundestag und dem Dokumentations- und Informationssystem für Parlamentarische Vorgänge (DIP). Die Daten dienen ausschließlich der Dokumentation und Analyse parlamentarischer Entscheidungen.</p>
        <p>Bei diesen Abrufen werden keine personenbezogenen Nutzungsprofile der Portalbesucherinnen und -besucher gebildet. Amtlich veröffentlichte Namen werden nicht zu Personenprofilen, Scores oder Ranglisten verarbeitet. Namentliche Abstimmungen können allenfalls fallbezogen als amtliche Quelle dokumentiert werden.</p>
      </article>

      <article>
        <h2>Interner Redaktionsbereich</h2>
        <p>Der passwortgeschützte Redaktionsbereich ist ausschließlich für autorisierte Mitarbeitende bestimmt. Dabei können Konto- und Berechtigungsdaten, dienstliche E-Mail-Adresse, Sitzungsdaten, redaktionelle Entscheidungen sowie Audit-Informationen verarbeitet werden. Zweck sind Zugriffssteuerung, Bearbeitung, Nachvollziehbarkeit und Schutz des Redaktionssystems.</p>
        <p>Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO; bei Beschäftigten können ergänzend die jeweils einschlägigen Beschäftigtendatenschutzvorschriften gelten. Die Daten werden gelöscht oder anonymisiert, wenn das Konto endet und keine Aufbewahrungs- oder Nachweispflicht mehr besteht. Redaktionelle Fachentscheidungen können länger pseudonymisiert dokumentiert bleiben, soweit dies zur nachvollziehbaren Veröffentlichung und Korrekturhistorie erforderlich ist.</p>
        <p>Für Datenbank und Authentifizierung wird Supabase als Auftragsverarbeiter eingesetzt. Die zugehörige Auftragsverarbeitungs- und Transferdokumentation wird vor Freischaltung des Redaktionsbetriebs abgeschlossen und im Verzeichnis der Verarbeitungstätigkeiten geführt.</p>
      </article>

      <article>
        <h2>Erforderliche Sitzungen im Redaktionsbereich</h2>
        <p>Nach einer Anmeldung wird ein technisch erforderlicher, geschützter Sitzungscookie eingesetzt, damit der interne Bereich funktioniert und abgesichert werden kann. Er dient nicht Werbung oder Reichweitenmessung. Die Speicherung beziehungsweise der Zugriff erfolgt, soweit erforderlich, auf Grundlage von § 25 Abs. 2 Nr. 2 TDDDG; die anschließende Verarbeitung erfolgt nach Art. 6 Abs. 1 lit. f DSGVO.</p>
      </article>

      <article>
        <h2>KI, Dialog und besondere Daten</h2>
        <p>Die öffentliche WÖK-KI und redaktionelle KI-Microtasks sind derzeit deaktiviert. Es werden deshalb gegenwärtig keine Inhalte von öffentlichen Nutzerinnen oder Nutzern an einen KI-Dienst übermittelt. Vor einer Aktivierung werden Zweck, Datenminimierung, Dienstleister, mögliche Drittlandübermittlungen, Rechtsgrundlage und Löschkonzept gesondert geprüft und diese Erklärung angepasst.</p>
        <p>Der Wirkungsdialog nimmt derzeit keine Antworten entgegen. Politische Meinungen können besondere Kategorien personenbezogener Daten sein. Ein Dialog wird erst aktiviert, wenn die datenschutzrechtliche Grundlage, eine datensparsame Erhebung, Aufbewahrung und transparente Information vollständig umgesetzt sind.</p>
      </article>

      <article>
        <h2>Kontakt per E-Mail</h2>
        <p>Wenn du uns per E-Mail kontaktierst, verarbeiten wir die übermittelten Angaben, etwa Name, E-Mail-Adresse und Nachricht, um dein Anliegen zu beantworten. Rechtsgrundlage ist je nach Anlass Art. 6 Abs. 1 lit. b oder lit. f DSGVO. Nachrichten werden gelöscht, wenn sie nicht mehr benötigt werden und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>
      </article>

      <article>
        <h2>Empfänger und Übermittlungen</h2>
        <p>Empfänger sind nur diejenigen Stellen, die Daten zur jeweiligen Aufgabe benötigen: intern autorisierte Mitarbeitende sowie die genannten Auftragsverarbeiter für Hosting, Datenbank und Authentifizierung. Eine Weitergabe zu Werbe-, Wahlkampf- oder Profilbildungszwecken findet nicht statt.</p>
        <p>Bei einer Verarbeitung außerhalb des Europäischen Wirtschaftsraums nutzen wir nur die jeweils rechtlich vorgesehenen Übermittlungsmechanismen und dokumentieren die geeigneten Garantien. Auf Anfrage erläutern wir die für einen konkreten Verarbeitungsvorgang geltenden Garantien.</p>
      </article>

      <article>
        <h2>Deine Rechte</h2>
        <p>Du hast im gesetzlichen Rahmen das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen Verarbeitungen nach Art. 6 Abs. 1 lit. e oder f DSGVO. Einwilligungen kannst du jederzeit mit Wirkung für die Zukunft widerrufen.</p>
        <p>Du hast außerdem das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren. Es findet keine automatisierte Entscheidung über Personen einschließlich Profiling im Sinne von Art. 22 DSGVO statt.</p>
      </article>

      <article>
        <h2>Aktualität</h2>
        <p>Stand: 14. August 2026. Wir passen diese Erklärung an, bevor sich Zwecke, Datenarten, eingesetzte Dienste oder Rechtsgrundlagen wesentlich ändern.</p>
      </article>
    </section>
  </div>;
}
