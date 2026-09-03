/* Wirkungscheck Bundestag V3 – fachlich versionierte Themenmodule.
 * Jede sichtbare Auswahl und jede unmittelbare Rückmeldung stammt aus dieser
 * Deklaration. Sie enthält keine Personen-, Partei- oder Fraktionsdaten. */
(function () {
  "use strict";

  var common = {
    bottlenecks: [
      { id: "rules", label: "Regeln passen nicht ausreichend zum Ziel", role: "rules" },
      { id: "finance", label: "Finanzierung oder Anreize setzen am falschen Punkt an", role: "finance" },
      { id: "people", label: "Personal oder Fähigkeiten fehlen", role: "delivery" },
      { id: "process", label: "Verfahren dauern zu lange oder greifen schlecht ineinander", role: "delivery" },
      { id: "coordination", label: "Bund, Länder und Kommunen arbeiten an entscheidenden Stellen nicht gut genug zusammen", role: "delivery" },
      { id: "access", label: "Infrastruktur oder tatsächlicher Zugang fehlen", role: "delivery" },
      { id: "data", label: "Wir wissen zu wenig darüber, was nach der Umsetzung tatsächlich passiert", role: "data" },
      { id: "multiple", label: "Mehrere Punkte greifen ineinander", role: "delivery" },
      { id: "unclear", label: "Noch nicht eindeutig", role: "clarify" }
    ],
    conditions: [
      { id: "legal", label: "Zuständigkeiten und Rechtsrahmen vorab klären" },
      { id: "capacity", label: "Umsetzungskapazität vor Ort sichern" },
      { id: "data", label: "Datenbasis und Auswertung vorab verbindlich festlegen" },
      { id: "cooperation", label: "Zusammenarbeit zwischen Bund, Ländern und Kommunen verbindlich organisieren" },
      { id: "participation", label: "Betroffene und umsetzende Stellen früh einbeziehen" },
      { id: "unclear", label: "Noch nicht beurteilbar", exclusive: true }
    ],
    regionalOptions: [
      { id: "visible", label: "Der gewünschte Fortschritt sollte vor Ort spürbar und in Rückmeldungen erkennbar sein." },
      { id: "mixed", label: "Bundesweite Signale und die Erfahrung vor Ort können auseinanderlaufen; beides sollte geprüft werden." },
      { id: "not_visible", label: "Bundesweiter Fortschritt wäre vor Ort zunächst nicht direkt sichtbar; die Verbindung muss erklärt werden." },
      { id: "unclear", label: "Noch nicht beurteilbar." }
    ]
  };

  var modules = {
    housing: {
      id: "housing", title: "Wohnen", short: "Zugang, Bezahlbarkeit und passender Wohnraum", version: "3.0.0",
      intro: "Nicht die Zahl der Maßnahmen entscheidet, sondern ob Haushalte tatsächlich passenden und bezahlbaren Wohnraum finden – ohne andere Schutzgüter zu verschlechtern.",
      goals: [
        { id: "access", label: "Mehr Haushalte finden passenden und bezahlbaren Wohnraum.", questionForm: "mehr Haushalte passenden und bezahlbaren Wohnraum finden" },
        { id: "existing_use", label: "Vorhandener Wohnraum wird besser genutzt.", questionForm: "vorhandener Wohnraum besser genutzt wird" },
        { id: "total_cost", label: "Die gesamten Wohnkosten werden tragbarer.", questionForm: "die gesamten Wohnkosten tragbarer werden" },
        { id: "need_supply", label: "Dort, wo tatsächlich Wohnraum fehlt, entsteht passender zusätzlicher Wohnraum.", questionForm: "dort, wo tatsächlich Wohnraum fehlt, passender zusätzlicher Wohnraum entsteht" },
        { id: "accessible", label: "Mehr barrierearmer und altersgerechter Wohnraum wird verfügbar.", questionForm: "mehr barrierearmer und altersgerechter Wohnraum verfügbar wird" },
        { id: "stability", label: "Menschen müssen seltener wegen steigender Wohnkosten ihr Umfeld verlassen.", questionForm: "Menschen wegen steigender Wohnkosten seltener ihr Umfeld verlassen müssen" },
        { id: "unclear", label: "Der Zielzustand ist noch nicht ausreichend bestimmt.", questionForm: "der Zielzustand so konkret bestimmt wird, dass er überprüft werden kann" }
      ],
      approaches: [
        { id: "build", label: "Zusätzlichen Wohnraum leichter schaffen", first: "Die Bedingungen für zusätzliches Wohnungsangebot verändern sich.", notYet: "Dass der Wohnraum bezahlbar, am passenden Ort und für die gewünschte Zielgruppe zugänglich wird.", role: "rules" },
        { id: "use_existing", label: "Bestehenden Wohnraum besser nutzen", first: "Leerstand, Unterauslastung, Umnutzung, Teilung oder freiwilliger Tausch können leichter ermöglicht werden.", notYet: "Dass Wohnraum tatsächlich verfügbar wird oder Menschen ohne Druck umziehen können.", role: "rules" },
        { id: "funding", label: "Förderung und Finanzierung verändern", first: "Investitionen, Modernisierung oder Zugang können wirtschaftlich anders möglich werden.", notYet: "Dass zusätzliche Mittel zusätzliche Wirkung erzeugen statt nur ohnehin geplante Vorhaben zu finanzieren.", role: "finance" },
        { id: "tax", label: "Steuerliche Anreize verändern", first: "Kosten und Anreize für bestimmte Entscheidungen verändern sich.", notYet: "Dass der Anreiz die adressierten Haushalte erreicht oder unerwünschte Ausweichreaktionen ausbleiben.", role: "finance" },
        { id: "protection", label: "Schutz- und Mietregeln verändern", first: "Rechte, Pflichten und Verhandlungsspielräume im Wohnungsmarkt verändern sich.", notYet: "Dass dadurch passender Wohnraum entsteht oder Gesamtwohnkosten tragbar bleiben.", role: "rules" },
        { id: "municipal", label: "Kommunalen Handlungsspielraum stärken", first: "Kommunen können vor Ort anders planen, steuern, fördern oder Flächen aktivieren.", notYet: "Dass notwendige Mittel, Personal, Rechtsklarheit und regionale Zusammenarbeit vorhanden sind.", role: "delivery" },
        { id: "none", label: "Noch keinen Ansatz festlegen", first: "Es wird noch kein Wirkpfad bevorzugt.", notYet: "Zuerst muss der begrenzende Faktor genauer geklärt werden.", role: "clarify" }
      ],
      redLines: [
        { id: "low_income_access", label: "Zugang einkommensschwächerer Haushalte", questionForm: "dem Zugang einkommensschwächerer Haushalte", detail: "Erfolg ist unvollständig, wenn diese Haushalte ausgeschlossen werden." },
        { id: "cost", label: "Wohnkosten der adressierten Haushalte", questionForm: "den Wohnkosten der adressierten Haushalte", detail: "Mehr Angebot gleicht keinen Anstieg dieser Belastung aus." },
        { id: "tenant_rights", label: "Miet- und Rechtsschutz", questionForm: "dem Miet- und Rechtsschutz", detail: "Zugang darf nicht auf Kosten des Rechtsschutzes verbessert werden." },
        { id: "displacement", label: "Verdrängung aus bestehenden Quartieren", questionForm: "der Verdrängung aus bestehenden Quartieren", detail: "Aufwertung und Sanierung müssen auf Verdrängungsfolgen geprüft werden." },
        { id: "safety", label: "Gesundheit und Sicherheit des Wohnraums", questionForm: "der Gesundheit und Sicherheit des Wohnraums", detail: "Wohnqualität und Sicherheit sind keine verrechenbare Nebenbedingung." },
        { id: "accessibility", label: "Barrierefreiheit", questionForm: "der Barrierefreiheit", detail: "Fortschritt darf die Zugänglichkeit nicht verschlechtern." },
        { id: "land", label: "Natur und Fläche", questionForm: "Natur und Fläche", detail: "Mehr Einheiten sind nicht automatisch vorrangig, wenn unverhältnismäßig Fläche verloren geht." }
      ],
      signals: [
        { id: "cost_burden", label: "Die Wohnkostenbelastung der adressierten Haushalte sinkt.", status: "supplementary_required" },
        { id: "access", label: "Passender Wohnraum wird tatsächlich leichter zugänglich.", status: "supplementary_required" },
        { id: "existing_use", label: "Bestehender leerer oder schlecht genutzter Wohnraum wird tatsächlich bewohnt.", status: "supplementary_required" },
        { id: "target_group", label: "Geförderter Wohnraum erreicht die vorgesehene Zielgruppe.", status: "supplementary_required" },
        { id: "no_displacement", label: "Unfreiwillige Wohnungsverluste oder Verdrängung nehmen nicht zu.", status: "data_gap" },
        { id: "accessible", label: "Geeigneter barrierearmer Wohnraum wird besser verfügbar.", status: "supplementary_required" }
      ],
      regionalPrompts: ["Suchende finden passenden Wohnraum tatsächlich leichter.", "Leerstand oder schlecht genutzter Bestand wird sichtbar aktiviert.", "Geförderte Wohnungen erreichen die vorgesehenen Haushalte.", "Die gesamte Wohnkostenbelastung sinkt auch vor Ort.", "Sanierung senkt die Gesamtbelastung, ohne Verdrängung auszulösen."],
      pairs: {
        "funding:finance": { fit: "direct", text: "Förderung und Finanzierung passen unmittelbar zum benannten Engpass. Zu prüfen bleibt, ob zusätzliche Mittel zusätzliche Wirkung auslösen oder überwiegend bereits geplante Aktivitäten finanzieren." },
        "build:rules": { fit: "direct", text: "Der Ansatz kann Regeln betreffen, die Planung, Genehmigung oder Zugang zu Flächen prägen. Zu prüfen bleibt, ob sich dadurch passender Wohnraum für die gewünschte Gruppe bildet." },
        "build:finance": { fit: "partial", text: "Leichtere Planung kann Angebot ermöglichen. Wenn Finanzierung begrenzt, bleibt offen, ob Vorhaben wirtschaftlich umgesetzt werden und welche Kosten später bei Haushalten ankommen." },
        "use_existing:rules": { fit: "direct", text: "Bessere Nutzung des Bestands hängt oft an Regeln und Verfahren. Zu prüfen bleibt, ob die Veränderung freiwillig, rechtssicher und praktisch zugänglich ist." },
        "use_existing:process": { fit: "direct", text: "Bessere Nutzung des Bestands hängt oft an Regeln und Verfahren. Zu prüfen bleibt, ob die Veränderung freiwillig, rechtssicher und praktisch zugänglich ist." },
        "tax:finance": { fit: "direct", text: "Steuerliche Anreize können Kosten und Entscheidungen direkt beeinflussen. Zu prüfen bleibt, ob sie die adressierte Wirkung erreichen und nicht vor allem Mitnahmeeffekte erzeugen." },
        "protection:rules": { fit: "direct", text: "Schutz- und Mietregeln betreffen den Rechtsrahmen direkt. Zu prüfen bleibt, wie Schutz, Zugang, Investitionen und Gesamtwohnkosten zusammenwirken." },
        "municipal:coordination": { fit: "direct", text: "Kommunaler Handlungsspielraum kann Planung und lokale Umsetzung verbessern. Zu prüfen bleibt, ob Zuständigkeiten, Personal und Finanzierung mitziehen." },
        "municipal:access": { fit: "direct", text: "Kommunaler Handlungsspielraum kann Planung und lokale Umsetzung verbessern. Zu prüfen bleibt, ob Zuständigkeiten, Personal und Finanzierung mitziehen." }
      },
      links: [{ label: "Wirkungsrückkopplung", href: "../../begriffe/wirkungsrueckkopplung/" }, { label: "Nichtkompensationsprinzip", href: "../../begriffe/nichtkompensationsprinzip/" }]
    },
    health: {
      id: "health", title: "Gesundheit und Pflege", short: "Zugang, Versorgung und selbstbestimmtes Leben", version: "3.0.0",
      intro: "Versorgung ist ein zusammenhängender Weg. Mehr Fälle, Plätze oder höhere Ausgaben sind allein kein Beleg für bessere Versorgung.",
      goals: [
        { id: "timely_help", label: "Menschen erhalten rechtzeitig die gesundheitliche oder pflegerische Hilfe, die sie benötigen.", questionForm: "Menschen rechtzeitig die gesundheitliche oder pflegerische Hilfe erhalten, die sie benötigen" },
        { id: "self_determined", label: "Pflegebedürftige Menschen können möglichst selbstbestimmt und sicher leben.", questionForm: "pflegebedürftige Menschen möglichst selbstbestimmt und sicher leben können" },
        { id: "relatives", label: "Angehörige werden durch Pflege nicht dauerhaft überlastet.", questionForm: "Angehörige durch Pflege nicht dauerhaft überlastet werden" },
        { id: "workforce_time", label: "Fachkräfte haben genügend Zeit für gute Versorgung statt für vermeidbaren Verwaltungsaufwand.", questionForm: "Fachkräfte genügend Zeit für gute Versorgung statt für vermeidbaren Verwaltungsaufwand haben" },
        { id: "continuity", label: "Hilfen greifen zwischen Praxis, Krankenhaus, Pflege, Reha und Kommune besser ineinander.", questionForm: "Hilfen zwischen Praxis, Krankenhaus, Pflege, Reha und Kommune besser ineinandergreifen" },
        { id: "prevent_crisis", label: "Gesundheitliche Verschlechterungen werden früher erkannt und vermeidbare Krisen seltener.", questionForm: "gesundheitliche Verschlechterungen früher erkannt werden und vermeidbare Krisen seltener auftreten" },
        { id: "unclear", label: "Der Zielzustand ist noch nicht ausreichend bestimmt.", questionForm: "der Zielzustand so konkret bestimmt wird, dass er überprüft werden kann" }
      ],
      approaches: [
        { id: "access", label: "Zugang zu Versorgung verbessern", first: "Zugangswege, Erreichbarkeit oder Anspruchsvoraussetzungen können sich verändern.", notYet: "Dass Menschen tatsächlich rechtzeitig Hilfe erhalten und Übergänge verlässlich funktionieren.", role: "delivery" },
        { id: "finance", label: "Vergütung, Finanzierung oder Förderung verändern", first: "Anreize und Ressourcen für Versorgung, Pflege oder Prävention können sich verändern.", notYet: "Dass zusätzliche Mittel bei Betroffenen ankommen oder Personal und Kapazitäten verfügbar sind.", role: "finance" },
        { id: "workforce", label: "Personal und Qualifizierung stärken", first: "Zeit, Fähigkeiten und Aufgabenverteilung in der Versorgung können sich verändern.", notYet: "Dass dadurch Versorgungsbrüche, Zugangshürden oder Überlastung in anderen Teilen des Systems abnehmen.", role: "delivery" },
        { id: "coordination", label: "Übergänge und Zusammenarbeit verbessern", first: "Zuständigkeiten, Übergaben und Informationswege können besser verbunden werden.", notYet: "Dass die Abstimmung im Alltag funktioniert und nicht neue Dokumentationslast erzeugt.", role: "delivery" },
        { id: "prevention", label: "Prävention und frühe Unterstützung stärken", first: "Frühzeitige Beratung, Erkennung und Unterstützung können leichter möglich werden.", notYet: "Dass Krisen tatsächlich seltener werden oder Menschen rechtzeitig erreicht werden.", role: "delivery" },
        { id: "digital", label: "Sichere digitale Infrastruktur verbessern", first: "Information, Kommunikation und Abläufe können zuverlässiger werden.", notYet: "Dass Systeme zusammenpassen, Fachkräfte entlastet werden und Gesundheitsdaten geschützt bleiben.", role: "data" },
        { id: "municipal", label: "Kommunale Gesundheits- und Pflegestrukturen stärken", first: "Regionale Beratung, Netzwerke und praktische Unterstützung können besser anschließen.", notYet: "Dass Bundes-, Länder- und Kommunalebene Finanzierung, Zuständigkeiten und Daten passend verbinden.", role: "delivery" },
        { id: "none", label: "Noch keinen Ansatz festlegen", first: "Es wird noch kein Wirkpfad bevorzugt.", notYet: "Zuerst muss der begrenzende Faktor genauer geklärt werden.", role: "clarify" }
      ],
      redLines: [
        { id: "dignity", label: "Sicherheit und Würde der versorgten Menschen", questionForm: "der Sicherheit und Würde der versorgten Menschen", detail: "Effizienzgewinn ersetzt keine sichere und würdige Versorgung." },
        { id: "access", label: "Zugang zu notwendiger Versorgung, auch bei geringem Einkommen", questionForm: "dem Zugang zu notwendiger Versorgung, auch bei geringem Einkommen", detail: "Erfolg ist unvollständig, wenn Zugangshürden wachsen." },
        { id: "self_determination", label: "Selbstbestimmung und informierte Entscheidung der Betroffenen", questionForm: "der Selbstbestimmung und informierten Entscheidung der Betroffenen", detail: "Entlastung darf nicht gegen den erklärten Willen Betroffener organisiert werden." },
        { id: "relatives", label: "Schutz von Angehörigen vor Überlastung", questionForm: "dem Schutz von Angehörigen vor Überlastung", detail: "Verlagerung unbezahlter Pflege ist kein neutraler Nebeneffekt." },
        { id: "workforce", label: "Arbeitsbedingungen und Gesundheit der Fachkräfte", questionForm: "den Arbeitsbedingungen und der Gesundheit der Fachkräfte", detail: "Kapazität darf nicht durch Überlastung erkauft werden." },
        { id: "rural", label: "Verlässlichkeit im ländlichen Raum und in belasteten Regionen", questionForm: "der Verlässlichkeit im ländlichen Raum und in belasteten Regionen", detail: "Zentralisierung erfordert Prüfung der tatsächlichen Erreichbarkeit." },
        { id: "data", label: "Schutz persönlicher Gesundheitsdaten", questionForm: "dem Schutz persönlicher Gesundheitsdaten", detail: "Datengewinnung muss erforderlich, rechtssicher und verhältnismäßig sein." }
      ],
      signals: [
        { id: "timely", label: "Menschen erhalten notwendige Versorgung rechtzeitig und ohne vermeidbare Brüche.", status: "supplementary_required" },
        { id: "support", label: "Pflegebedürftige Menschen und Angehörige finden verlässlich passende Unterstützung.", status: "supplementary_required" },
        { id: "crisis", label: "Vermeidbare Verschlechterungen, Krisen und Krankenhausaufenthalte nehmen ab.", status: "supplementary_required" },
        { id: "time", label: "Fachkräfte verbringen mehr Zeit mit Versorgung und weniger mit vermeidbarer Bürokratie.", status: "supplementary_required" },
        { id: "equity", label: "Versorgung erreicht Menschen unabhängig von Wohnort, Einkommen oder Unterstützungsnetz besser.", status: "data_gap" },
        { id: "chosen_environment", label: "Menschen können länger selbstbestimmt und sicher in ihrem gewählten Umfeld leben.", status: "supplementary_required" }
      ],
      regionalPrompts: ["Menschen und Angehörige finden vor Ort schneller passende Hilfe.", "Übergänge zwischen Praxis, Krankenhaus, Pflege, Reha und Kommune funktionieren verlässlicher.", "Fachkräfte berichten über weniger vermeidbare Dokumentation und Koordination.", "Unterstützung ist auch außerhalb großer Zentren erreichbar.", "Pflegebedürftige Menschen können häufiger im gewünschten Umfeld bleiben."],
      pairs: {
        "finance:finance": { fit: "direct", text: "Mittel passen unmittelbar zum benannten Engpass. Zu prüfen bleibt, ob sie zusätzliche Versorgung, Zeit oder Entlastung ermöglichen." },
        "workforce:people": { fit: "direct", text: "Personal- und Qualifizierungsmaßnahmen greifen den genannten Engpass direkt auf. Zu prüfen bleibt, ob Fachkräfte dort ankommen, wo Versorgung tatsächlich begrenzt ist." },
        "coordination:coordination": { fit: "direct", text: "Bessere Übergaben und Zusammenarbeit können Brüche im Versorgungsweg direkt adressieren. Zu prüfen bleibt, ob sie Fachkräfte entlasten und für Betroffene verlässlich funktionieren." },
        "coordination:process": { fit: "direct", text: "Bessere Übergaben und Zusammenarbeit können Brüche im Versorgungsweg direkt adressieren. Zu prüfen bleibt, ob sie Fachkräfte entlasten und für Betroffene verlässlich funktionieren." },
        "prevention:access": { fit: "partial", text: "Frühe Unterstützung kann wirken. Ohne erreichbare Angebote und passende Beobachtung bleibt offen, ob die richtigen Menschen rechtzeitig erreicht werden." },
        "prevention:data": { fit: "partial", text: "Frühe Unterstützung kann wirken. Ohne erreichbare Angebote und passende Beobachtung bleibt offen, ob die richtigen Menschen rechtzeitig erreicht werden." },
        "digital:process": { fit: "direct", text: "Sichere digitale Infrastruktur kann Verfahren und Rückmeldungen verbessern. Zu prüfen bleibt, ob sie zusammenpasst, Fachzeit freisetzt und Datenschutz wahrt." },
        "digital:data": { fit: "direct", text: "Sichere digitale Infrastruktur kann Verfahren und Rückmeldungen verbessern. Zu prüfen bleibt, ob sie zusammenpasst, Fachzeit freisetzt und Datenschutz wahrt." },
        "municipal:coordination": { fit: "direct", text: "Kommunale Strukturen können Zugang und Zusammenarbeit vor Ort stärken. Zu prüfen bleibt, ob Bundesregeln, Finanzierung und regionale Infrastruktur zusammenpassen." },
        "municipal:access": { fit: "direct", text: "Kommunale Strukturen können Zugang und Zusammenarbeit vor Ort stärken. Zu prüfen bleibt, ob Bundesregeln, Finanzierung und regionale Infrastruktur zusammenpassen." }
      },
      links: [{ label: "Wirkungsrückkopplung", href: "../../begriffe/wirkungsrueckkopplung/" }, { label: "Wirkungsrisiko verstehen", href: "../../begriffe/wirkungsrisiko/" }]
    }
  };

  window.WC_V3_MODULES = { version: "3.0.0", common: common, modules: modules };
})();
