# Testing

Pflicht vor Launch:

- Typprüfung, Lint, Produktionsbuild und Read-API-Smoke-Test.
- Neutralitätsfixture: gleicher Fall, Methodik und Evidenz bei anderer Partei → identisches Ergebnis.
- DB-Test für die Rückschaugrenze und für nicht veröffentlichbare Workflow-Zustände.
- axe/Lighthouse-A11y, Tastaturtest (Drawer, Szenario, Modus, KI-Consent), Screenreader-Stichprobe, 320px und 200%-Zoom.
- DIP-Adapter-Contract-Test gegen die am Testtag dokumentierte OpenAPI-Version; kein Test mit veröffentlichten Fachvoten.
