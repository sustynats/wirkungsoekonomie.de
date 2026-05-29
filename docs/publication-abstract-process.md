# Publikationsprozess: Abstracts für Download- und Lesebereiche

Jede öffentliche Buch-, Paper-, Ausarbeitungs-, Dossier-, Leitlinien- oder Arbeitsfassung braucht vor dem Download eine kurze Orientierung:

- Zusammenfassung: ein bis zwei Sätze zum Inhalt und Zweck.
- Kernaussagen: zwei bis drei Punkte, die Nutzer:innen vor dem Öffnen verstehen sollen.
- Grenze der Aussage: falls relevant, klarstellen, dass es sich um Arbeits-, Modell- oder Lesefassungen handelt und nicht um amtliche Bewertungen.

## Technische Umsetzung

Die sichtbaren Abstracts werden im Build über `scripts/publications/apply-publication-abstracts.mjs` ergänzt. Der Schritt läuft automatisch in `npm run build` und `npm run portal:build`, nachdem die Portal- und Layoutgeneratoren die HTML-Seiten erzeugt haben.

Die kuratierten Abstracts liegen in `assets/data/publication-abstracts.json`. Neue zentrale Publikationen sollten dort mit `summary`, `keyPoints` und passenden `matches` eingetragen werden. Wenn ein Dokument nur in `assets/data/document-registry.json` gepflegt ist, nutzt der Build dessen `summary` als Fallback. Für noch nicht kuratierte Publikationen erzeugt der Build eine knappe automatische Orientierung aus Titel, Typ, Beschreibung und Downloadpfad.

## Qualitätssicherung

`npm run check:publication-abstracts` prüft, ob die Downloadseite, die Dokumentenseite sowie generierte Publikations- und Downloadbereiche sichtbare Abstract-Blöcke enthalten. Der Check soll vor Veröffentlichung zusammen mit Build, Linkcheck und Suchindex laufen.

Neue Publikationen sind damit nicht mehr nur eine Datei mit Link: Sie brauchen immer eine vorher sichtbare inhaltliche Einordnung.
