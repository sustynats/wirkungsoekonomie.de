# Live-Status: Wirkungsökonomie und Akademie

Stand: 2026-07-10, 16:45 CEST

Dieses Dokument ist die gemeinsame Veröffentlichungsübersicht für Website und
Akademie. Es unterscheidet verbindlich zwischen Produktion, Preview und
Branch/PR. Ein grüner Build bedeutet nur, dass der jeweilige Stand technisch
prüfbar ist; er bedeutet nicht automatisch, dass er öffentlich live ist.

## Statusregeln

| Status | Bedeutung |
| --- | --- |
| **Produktion** | Der Inhalt ist über die öffentliche Ziel-URL erreichbar und stammt aus dem Produktions-Deployment. |
| **Preview** | Der Inhalt ist über eine Vorschau-URL erreichbar, aber noch nicht Bestandteil der Produktions-URL. |
| **Branch/PR** | Der Inhalt liegt nur im Arbeitszweig oder Pull Request und ist nicht als nutzbare Vorschau bestätigt. |
| **Release-Asset** | Eine Datei ist direkt über GitHub Releases verfügbar; daraus folgt nicht, dass die Website-Navigation oder der Website-Download bereits aktualisiert ist. |

## Aktueller Stand

| Bereich | Produktion | Preview / Branch | Freigabestatus |
| --- | --- | --- | --- |
| Hauptwebsite | [wirkungsoekonomie.de](https://wirkungsoekonomie.de/) · `main` `3a6a42e597` · letzter erfolgreicher Pages-Deploy 2026-07-08 | [PR #125](https://github.com/sustynats/wirkungsoekonomie.de/pull/125) · `codex/woems-library-methods-coaches` · Draft | **Nicht live:** WÖMS/WÖMM 2.0, Bibliotheksdetailseiten und der neue Journal-Artikel sind noch nicht in `main`. |
| Akademie | [akademie.wirkungsoekonomie.de](https://akademie.wirkungsoekonomie.de/) · `main` `e2cffe4514` | [PR #25](https://github.com/sustynats/woek-akademie-app/pull/25) · [Vercel-Preview](https://woek-akademie-app-git-codex-woems-coaches-backend-woek-akademie.vercel.app/) · Draft | **Nicht live:** Coaches-Backend und Grundstudium mit 5 Teilen sind nur im PR/Preview. |
| Grundlagen-PDFs | Nicht über den Website-Pfad veröffentlicht; die geprüften Website-Pfade liefern derzeit `404`. | [WÖMS 2.0 als Release-Asset](https://github.com/sustynats/wirkungsoekonomie.de/releases/download/woek-public-assets-v2/assets__downloads__grundlagen__woems-2.0-referenzfassung.pdf), [WÖMM 2.0 als Release-Asset](https://github.com/sustynats/wirkungsoekonomie.de/releases/download/woek-public-assets-v2/assets__downloads__grundlagen__woemm-2.0-referenzfassung.pdf) | **Release-Asset live**, Website-Verlinkung noch nicht live. |

## Verifizierte Stichproben

Am Standdatum wurden folgende Produktionspfade geprüft:

- Hauptwebsite: Startseite `200`, Bibliothek `200`
- Neuer Journal-Artikel `/blog/das-managementmodell-der-zukunft/`: `404`
- Website-Download `/assets/downloads/grundlagen/woems-2.0-referenzfassung.pdf`: `404`
- Akademie-Startseite, `/akademie` und `/studium`: jeweils `200`
- Akademie-Branch-Preview: `200`
- Beide 2.0-Grundlagen als GitHub-Release-Asset: `200`

## Veröffentlichungsregel

Eine Änderung darf erst als **live** bezeichnet werden, wenn:

1. der zuständige PR in `main` gemergt ist,
2. das Produktions-Deployment erfolgreich abgeschlossen ist, und
3. die kanonische öffentliche URL mit `200` geprüft wurde.

Claude und Codex aktualisieren dieses Dokument bei jeder Veröffentlichung oder
bei einer Statusänderung. Neue Inhalte werden zunächst als **Branch/PR** oder
**Preview** eingetragen. Erst nach der Produktionsprüfung wechseln sie in
**Produktion**.

## Zuständigkeit und Quellen

- Website-Deployment: GitHub Pages, Workflow `.github/workflows/deploy.yml`,
  ausschließlich Push auf `main` oder manueller Workflow-Start.
- Akademie-Deployment: Vercel, Production-Domain
  `akademie.wirkungsoekonomie.de`; PR-Deployments sind Vorschauen.
- Pull Requests, Deployments und URL-Prüfungen sind maßgeblich gegenüber
  lokalen Build-Ausgaben.
