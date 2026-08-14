# Editorial Backend

The editorial application is a separate authenticated workbench, never an extension of the public portal and never a database-shaped public page.

Primary navigation:

- Übersicht
- Radar / Vorgänge
- Meine Aufgaben
- Wirkungsanalyse / Evidenz
- Regeln & Muster
- KI-Verbrauch
- Publikation / Korrekturen / Audit
- Systemänderungen

The first operational screen is **Meine Aufgaben**.  A task exposes the specific question, why it needs a human, the minimal fact/source context, structured options and the impact of saving.  The initial implementation stores these elements in `editorial_tasks.context_refs`, `candidate_options` and `impact_preview`; it does not open a free-form AI chat.

Authentication and RBAC are a launch gate for this private surface.  Server routes use only server credentials and must verify an editorial role before calling the service-role data layer.  The currently added worker route is additionally protected by a dedicated server-only secret and cannot publish a case.

