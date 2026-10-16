# Wirkungslexikon V9: Freigabe und Veröffentlichung

Natalie Weber hat im direkten Benutzerauftrag die Inhalte von `WOEK_Wirkungslexikon_V9_REDAKTION_ABSCHLUSS_2026-10-16.zip` fachlich und zur Veröffentlichung freigegeben. Archiv-SHA-256: `a0d7f812580c380c78958b9ac5e094ed2e34e6c26ce037ec5afa88cb51af6315`.

`content/wirkungslexikon/approval-v9.json` dokumentiert diese direkte menschliche Entscheidung und bindet sie an 221 Inhaltsrevisionen: 180 Karten, 20 Familien und 21 gesonderte Programm-Dossiers. Der technische Import behauptet keine zusätzlich ausgeführte menschliche Einzelquellenprüfung oder kryptographische Signatur. Vorherige Sperren bleiben in der privaten Historie erhalten. Neue Revisionen werden nicht automatisch freigegeben.

Der Abschlussmaster enthält die 63 expliziten Kartenkorrekturen und zusätzlich bei 57 AfD-Programmnachweisen die Trennung von unbekanntem PDF-Veröffentlichungsdatum und Beschlussdatum 12.01.2025. Der zusätzliche Metadatenabgleich wird gesondert protokolliert. V3-Original und stabile IDs/Slugs bleiben unverändert archiviert. Die öffentliche Projektion kennzeichnet freigegebene Karten gesondert und ersetzt keine historischen Quelldateien.

15 Wortlautbelege, 31 Quellenauszüge und 17 redaktionelle Lemmata aus dem Korrekturprotokoll werden getrennt dargestellt. Redaktionelle Lemmata erhalten keine Sprecher-Anführungszeichen. Allgemeine Mechanismen, dokumentierte Ziele, kommunikative Interpretation, bedingtes Wirkungspotenzial und beobachtete Vorgänge bleiben getrennte Felder. Likes und Wiederholung sind kein Einstellungsnachweis.

Das versionierte öffentliche Komponentenartefakt liegt in GitHub Releases. `payloadSha256`, `dataSha256` und Artefakt-SHA-256 verhindern die versehentliche Verwendung anderer Revisionen. Das unveränderte Produktionsartefakt wird vor Integration gesichert; Inhaltsidentität außerhalb der gezielten Navigation, Portal-Teaser und Such-/Verzeichnisregistrierung wird nachgewiesen. Vor Deployment blockiert eine zwischenzeitlich veränderte Produktionsbasis den Kandidaten.

Für dieses Paket wird ein Merge mit `[lexikon-release]` im Commit-Titel verwendet: Dieser gezielte Marker überspringt ausschließlich den normalen vollständigen Push-Build. Die tatsächliche Veröffentlichung erfolgt separat über `workflow_dispatch`, `lexikon_only=true`, `lexikon_publish=true` und exakten 40-stelligen Merge-Commit. Alle anderen bisherigen Deploymentpfade bleiben bestehen. Das Pages-Environment erlaubt weiter nur `main` und `gh-pages`; keine Sicherheitsrichtlinie wird erweitert.

Hosting: bestehendes GitHub Pages/GitHub Releases. Kein Vercel-Build, keine neue Infrastruktur oder kostenpflichtige Erweiterung. Die bestehende Vercel-Kontoprüfung meldet aktiviert bepreiste Observability und eine Fair-Use-Sperre; diese werden mit dem Lexikon nicht verändert oder beansprucht.

Natalie Weber hat anschließend klargestellt: Beide Artikel wurden neu geschrieben und werden von ihr selbst bei LinkedIn und für das Journal hochgeladen. Keine weitere Artikelbearbeitung oder Veröffentlichung durch Codex. Das Lexikon-Release enthält keine Artikelübernahme.

Die geschützte Redaktion läuft lokal mit Zugriffskontrolle. Neue Entwürfe und Zusatzobjekte bauen ausschließlich die private Vorschau neu. Bereits veröffentlichte Revisionen bleiben unverändert; keine automatische Produktionserzeugung beim Speichern. Dieser Ablauf wurde mit bereits veröffentlichten Objekten in einem isolierten HTTP-/Browser-Test geprüft. Ein entferntes persönliches SSO-Redaktionskonto ist nicht als bereits eingerichtet zu verstehen.

Der vor dem Livegang erstellte technische Release Candidate R2 bewahrt zusätzlich fünf quellenbezogene Sach- und Urheberhinweise wortgetreu in den öffentlichen Kartendetails. Diese Hinweise waren im genehmigten Originalmaster bereits enthalten; die Inhaltsrevisionen und die fachliche Freigabe ändern sich nicht. Das frühere technische Komponentenartefakt wird als überholter Vorabstand gekennzeichnet, ohne es still zu ersetzen.
