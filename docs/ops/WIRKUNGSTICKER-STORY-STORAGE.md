# Verlustfreie Nachrichtenablage (25.09.2026)

## Anlass und Datenbestand

Der Veröffentlichungslauf 36186698046 scheiterte an der unveränderten
95-MiB-Git-Schutzgrenze: `data/news/stories.json` war 99.666.030 Byte groß.
Auch bereits ausdrücklich freigegebene persönliche Beiträge lagen hinter
diesem fehlgeschlagenen atomaren Commit. Keine neue Freigabe ist erforderlich.

Die Datei war bereits ohne Einrückungen gespeichert. Texte, Quellen, Claims,
Bewertungsstände und historische Versionen werden deshalb nicht gekürzt.
Der Ausgangsbestand auf `54ee3dabc66de2802b32fd3cc7160925a46de60a`
enthielt 5.627 Datensätze und 99.514.922 Byte. SHA-256 der kompakten logischen
JSON-Fassung (ohne abschließenden Zeilenumbruch):
`38fd4544b7ecb775092e7b8d9086ac8a2f0b37621ec506460c293793c0a6ecb5`.
Die vollständige Rekonstruktion wurde vor weiteren Imports tiefenverglichen.

## Bestehende Speichertechnik wiederverwenden

`scripts/news/newsroom-store.mjs` speichert auch den Nachrichtenkatalog im
bereits für `newsroom.json` eingeführten Format `woek-newsroom-parts-1`:

- `data/news/stories.json`: kleines Manifest, Metadaten, Reihenfolge und Anzahl.
- `data/news/stories.json.parts/<sha256>.json`: vollständige Datensätze, höchstens
  8 MiB pro Teil; Namen, Byteanzahl und SHA-256 werden beim Lesen geprüft.
- Erst alle Teile schreiben, dann das Manifest atomar ersetzen. Unveränderte
  Teile wiederverwenden. Veraltete generierte Teile erst danach entfernen;
  frühere Fassungen bleiben in Git und gesicherten Laufartefakten erhalten.
- Fehlende/beschädigte Teile stoppen den Vorgang. Niemals einen leeren oder
  unvollständigen Ersatzbestand weiterverarbeiten.

Alle Repository-Leser/Schreiber verwenden `readRepositoryJson` bzw.
`writeRepositoryJson`. Das logische Datenmodell bleibt unverändert, alte
gewöhnliche JSON-Dateien und alte Wiederherstellungsartefakte bleiben lesbar.
Die Browser-Exporte werden weiterhin separat erzeugt; sie erhalten kein
internes Manifest. Quellen-, Publikations-, Budget- und Freigabegates gelten
unverändert. `manual_only` und die finale Freigabe werden nicht umgangen.

Git-Konflikte werden nur für nachweislich getrennt bearbeitete vollständige
Datensätze aufgelöst. Dabei stammen Manifest und Teile aus jeweils derselben
Git-Fassung. Änderungen am selben Datensatz bleiben ein echter Konflikt.
Monitor-Sparse-Checkout und Recovery-Artefakte schließen die Teile ein.
Letztere sichern nun auch die übernommenen persönlichen Veröffentlichungen.

## Wiederherstellung und Betrieb

Keine neue Recherche oder Modellgenerierung für gesicherte Resultate starten.
Geprüfte Nachrichten aus fehlgeschlagenen Läufen können über
`recover-approved-snapshots.mjs` übernommen werden; Budgetbelege werden über
die eindeutige Laufkennung genau einmal nachgetragen. Persönliche Beiträge
kommen ausschließlich über `import-approved-editorials.mjs --claim` aus den
eingefrorenen Freigaben. Erst die erfolgreiche Live-Prüfung quittiert sie.

Prüfen: `npm run news:test`, `npm run typecheck`, `npm run news:build`,
`npm run news:validate` und nach dem Vormerken `node scripts/news/check-git-size.mjs`.
Die 95-MiB-Grenze wird nicht angehoben. Keine neue Cloud, kein Vercel-Build,
keine Budget- oder Modellerhöhung.

Für eine spätere physische Auslagerung großer Archive gilt weiter:
öffentliche unveränderliche Artefakte in GitHub Releases, private Unterlagen
auf Oracle/OCI. Erst Sicherung, referenzgebundene Migration und geprüfte
Wiederherstellung; keine bloße Löschung von Quellen oder Versionen.
