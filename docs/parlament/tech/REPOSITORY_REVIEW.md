# Repository Review

Stand: 2026-08-14 · technische Umsetzung

`woek-parlament-app/` ist die alleinige Implementierung des Portals. Die Design-Lane liefert unter `docs/parlament/ux/` ausschließlich Spezifikation und statischen Prototyp; sie dupliziert weder App noch Datenmodell.

| Bereich | Entscheidung | Begründung |
|---|---|---|
| Öffentliche WÖk-Referenzen | REUSE | Statische Read-APIs/Registries der Hauptseite bleiben führend. |
| Parlamentarische Daten | BUILD_NEW | DIP-Ingestion, Dokumentfassungen und Freigabezustände fehlen im Bestand. |
| Redaktion | REUSE (Muster) + BUILD_NEW | Akademie zeigt Supabase/Rollen/Audit-Muster; Parlament erhält eine eigene Workbench. |
| KI | WRAP | Nur über einen später entschiedenen WÖk-KI-Shared-Service, niemals votumsfähig. |

Die Anwendung verwendet nur synthetische, sichtbar markierte Falldaten, bis DIP-Zugang, Versionierung und Fachfreigabe produktiv sind.
