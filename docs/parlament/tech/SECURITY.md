# Security

Launch-Gates: TLS/HSTS auf der Subdomain, CSP, `frame-ancestors 'none'`, `nosniff`, serverseitiges RBAC, MFA für Freigabe, Audit-Log, RLS ohne öffentliche Draft-Policy, Geheimnisse nur serverseitig.

Dokumente und externe Eingaben sind untrusted input. Import-Worker, Supabase-Service-Rolle und DIP-Schlüssel bleiben von öffentlichen Routen getrennt. `admin/`, `_debug/` und `intern/` des Bestands werden nicht eingebunden; ihre Härtung bleibt ein separates Plattformticket.
