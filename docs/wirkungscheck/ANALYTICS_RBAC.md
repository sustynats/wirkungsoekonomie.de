# Analytics RBAC

Status: verbindlicher Entwurf vor Implementierung

| Rolle | Zulässig | Nicht zulässig |
| --- | --- | --- |
| `ANALYTICS_VIEWER` | Product-Aggregate, Fieldwork-Funnel, Report-Nutzung | Research-Cube, Exporte, Rohereignisse |
| `RESEARCH_ANALYST` | disclosure-kontrollierte Research-Cubes und geprüfte Exporte | Research-Row-Level, Kontakt- und Einladungsdaten |
| `METHODOLOGY_ANALYST` | Method-Quality, Neutralitätstests, Quellenstatus | Personen- und Antwortdaten |
| `DATA_MANAGER` | Study-/Wave-Metadaten und Job-Status | Rollenerteilung, Security Logs |
| `PRIVACY_OFFICER` | Retention-Health, Löschvorgänge, Privacy-Audits | Forschungswerte ohne Research-Rolle |
| `SECURITY_ADMIN` | Security-Alerts und Detection-Status | Product- und Research-Analytics, außer mit zusätzlicher Rolle |

Rollen werden serverseitig an jeder API und jedem Export erzwungen. Admin-Sitzungen nutzen MFA,
kurze sichere Cookies, CSRF-Schutz, CSP, Noindex und Rate Limits. Der Admin-Bereich ist nicht
öffentlich auffindbar.

Es gibt keine Rolle und keinen Endpunkt für ein Gesamtprofil aus Einladung, Befragung, Report und
Research. Der Testfall `ANALYTICS_VIEWER` gegen jeden Research-Row-Level-Endpoint muss `403`
liefern; ein solcher Endpunkt wird im Produktpfad gar nicht angeboten.
