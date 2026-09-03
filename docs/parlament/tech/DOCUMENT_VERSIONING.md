# Document Versioning

**Entscheidung: BUILD_NEW, mit Reuse der Bibliotheks-Statuslogik.** Jede Fassung speichert Quelle, Abrufzeit, SHA-256, Fassungstitel, Bezug zum Vorgang und `is_final_voting_version`.

Diffs erhalten nur vier Wirkungsänderungswerte: `NO`, `MINOR`, `MATERIAL`, `VERDICT_REVIEW`. `MATERIAL` löst eine Prüfung aus; es ändert nie selbstständig ein Fachvotum. Alte Seiten bleiben unter einer stabilen Fassungs-URL erreichbar und tragen ein Einfrier-Banner.
