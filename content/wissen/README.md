# WÖk-Wissensraum

Dieser Ordner sammelt redaktionelle Arbeitsstände für künftige Wissensseiten der Website.

Wichtig:

- Alte Dokumente sind Rohmaterial.
- Der führende Begriffsleitfaden ist Maßstab.
- Der aktuelle Buchstand ist Basis.
- Die Website ist die öffentliche Systemfassung.
- Kein Inhalt aus alten Dokumenten wird automatisch veröffentlicht.

Geplante öffentliche Zielstruktur:

- `/wissen/`
- `/wissen/themen/`
- `/wissen/methodik/`
- `/wissen/beispiele/`
- `/wissen/working-papers/`

Bestehende Website-Bereiche bleiben anschlussfähig:

- `/methodik/`
- `/anwendungen/`
- `/sdg-plus/`
- `/blog/dossiers/`
- `/akademie/`

Workflow:

1. Quelle inventarisieren.
2. Inhalt extrahieren.
3. Begriffe gegen `WOeK_Begriffsleitfaden_fuehrend_v1.0.md` prüfen.
4. Widersprüche dokumentieren.
5. Website-Draft nach Template schreiben.
6. Redaktionsstatus auf `draft` oder `needs_update` setzen.
7. Erst nach Review veröffentlichen.
8. `python3 tools/sync_layout.py` ausführen, damit die Suche aktualisiert wird.
