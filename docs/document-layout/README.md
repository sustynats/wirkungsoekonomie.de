# Dokumentlayout-Standardisierung

Der WÖk-Dokumentlayout-Workflow ist für Arbeitspapiere, Konzeptpapiere,
Dossiers, Whitepaper, Working Paper, technische Leitlinien und Fallstudien
gedacht.

Nicht im Scope sind Präsentationen, Bücher, Manifeste, Minifeste,
Parteiprogramme, Presse-/Gastbeiträge sowie Website-, Blog- oder
Social-Media-Texte.

## Ablauf

1. Template-Paket importieren:
   `npm run layout:import-template -- /pfad/zu/WOeK_Dossier_Template_Paket.zip`
2. Kandidaten mit `standardize_layout: true` und erlaubtem Dokumenttyp markieren.
3. Standardisierung starten:
   `npm run layout:standardize`
4. Bericht prüfen:
   `layout-standardization-report.md`

## Inhaltsschutz

Vor jeder Übernahme muss der Textvergleich erfolgreich sein. Der Vergleich
normalisiert nur Layoutartefakte wie Zeilenumbrüche, Mehrfachspaces,
Seitenzahlen sowie Kopf- und Fußzeilen. Überschriften, Absätze,
Tabelleninhalte, Zahlen, Quellen und Begriffe dürfen nicht verändert werden.
