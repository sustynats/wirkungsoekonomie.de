# Zustellbarkeit und Domain-Authentifizierung

Stand der Prüfung: 13. August 2026
Status: **Produktivversand gesperrt** bis alle Launch-Gates bestanden sind.

## Festgestellte Infrastruktur

| Prüfung | Ergebnis | Einordnung |
| --- | --- | --- |
| Absenderpostfach | `wirkungscheck@wirkungsoekonomie.de` eingerichtet | bestätigt |
| SMTP-Transport | `smtp.ionos.de:587`, STARTTLS, Authentifizierung | bestätigt durch IONOS-Einrichtung; TLS-Zertifikat am 13.08.2026 abrufbar |
| IMAP für Rückläufer | `imap.ionos.de:993`, SSL | bestätigt durch IONOS-Einrichtung |
| MX | `mx00.ionos.de`, `mx01.ionos.de` | DNS-Auflösung geprüft |
| SPF | `v=spf1 include:_spf-eu.ionos.com ~all` | syntaktisch vorhanden; IONOS-Include löst auf autorisierte IP-Bereiche auf |
| DKIM | noch nicht nachgewiesen | Selector und eine tatsächlich signierte Testmail fehlen |
| DMARC | `_dmarc` verweist auf `dmarc.ionos.de`, dort `v=DMARC1; p=none;` | Record vorhanden, Monitoring-Policy; Alignment noch nicht getestet |
| MTA-STS / TLS-RPT | nicht vorhanden bzw. nicht festgestellt | optional, vor Änderung bestehende Mailarchitektur prüfen |

Die IONOS-DNS-Records wurden nur lesend abgefragt. Es wurden keine DNS-, SMTP- oder
Mailbox-Einstellungen verändert.

## Launch-Gate

Vor einer ersten Pilotmail muss ein Test an mindestens zwei unabhängige Empfängerpostfächer
gesendet und anhand der vollständigen Mail-Header geprüft werden:

```text
SPF: PASS
DKIM: PASS
DMARC: PASS
From alignment: PASS
Reply-To: wirkungscheck@wirkungsoekonomie.de
TLS: PASS
Test delivery: PASS
```

DKIM ist erst bestanden, wenn der Header `DKIM-Signature` sowie `Authentication-Results` eine
gültige Signatur für `wirkungsoekonomie.de` oder eine korrekt ausgerichtete Versanddomain zeigen.
DMARC ist erst bestanden, wenn mindestens SPF oder DKIM zur sichtbaren From-Domain ausgerichtet
ist. Ein vorhandener `p=none`-Record ersetzt diesen Nachweis nicht.

Falls einer dieser Punkte fehlschlägt, bleibt `EMAIL_SEND_MODE=test`; ein Produktivversand ist
nicht zulässig.

## Ausstehende, sichere Schritte

1. Im IONOS-Postfach bzw. den Mail-Domain-Einstellungen den DKIM-Selector feststellen und den
   zugehörigen DNS-Record lesend prüfen.
2. Nach Konfiguration des SMTP-Secrets eine Testmail an getrennte Testpostfächer senden; vollständige
   Header ohne personenbezogene Inhalte sichern.
3. SPF- und DKIM-Alignment sowie DMARC-Ergebnis aus den Headern dokumentieren.
4. Versandlimit, Rate Limit und mögliche IONOS-Anti-Abuse-Regeln verbindlich mit dem gewählten
   Versandweg prüfen. Die Werte bestimmen die Throttling-Parameter.
5. Erst danach entscheiden, ob IONOS-SMTP für die Pilotwelle ausreicht oder ein
   EU-/datenschutzkonformer Transactional-Mail-Dienst als Auftragsverarbeiter erforderlich ist.

Es wird kein externer Bulk-Mail-Dienst integriert, bevor seine Datenschutzrolle, Subprozessoren,
Versanddomain und Grenzen dokumentiert und freigegeben sind.
