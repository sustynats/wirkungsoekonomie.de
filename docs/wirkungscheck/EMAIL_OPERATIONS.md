# E-Mail-Betrieb und Versandfreigabe

Stand: 13. August 2026
Status: Ablauf verbindlich, Werte vor Livegang festzulegen

## Versandwellen

1. **Interner Test:** ausschließlich fest hinterlegte Testadressen, Testmodus aktiv.
2. **Pilot:** kleine, manuell freigegebene Gruppe; technische Zustellbarkeit und Antworten prüfen.
3. **Erste Produktionswelle:** gedrosselt, nach dokumentierter Freigabe.
4. **Auswertung der technischen Qualität:** nur Bounces, Fehler und Suppressions aggregiert.
5. **Weitere Wellen:** erst nach positiver Prüfung der vorherigen Welle.

Ein gesamter Bundestagsversand ist kein Standardbutton und darf nicht aus CiviCRM oder LimeSurvey
heraus versehentlich ausgelöst werden.

## Vorschau und Vier-Augen-Freigabe

Vor jeder Welle erzeugt der Invitation Service eine unveränderbare Vorschau mit:

- Empfängerzahl und Zahl ausgeschlossener Adressen;
- Vorlage und Plain-Text-Version;
- Subject, From, Reply-To und Versandzeit;
- Test-/Produktionsmodus;
- Throttlingwerten;
- Zahl der ungültigen Datensätze und Suppressions.

Der Ablauf ist: `entwerfen` → `Testmail` → `Vorschau` → `zweite Bestätigung` →
`CONFIRM PRODUCTION SEND` → Scheduler starten. Eine geplante Welle kann bis zum tatsächlichen
Start storniert werden.

## Bounce- und Antwortprozess

- Hard Bounce: Adresse sperren, Fehlermeldung erfassen, keine Erinnerung; gegebenenfalls
  manuell gegen offizielle Quelle prüfen.
- Soft Bounce: maximal zwei Wiederholungen mit Abstand, danach `FAILED`.
- Antwort: geht an `wirkungscheck@wirkungsoekonomie.de`, wird vom Projektteam gelesen und als
  sachlicher Dialogvorgang im CRM dokumentiert.
- Keine weiteren Erinnerungen: sofortige Suppression im Invitation Service; keine Rückfrage und
  kein automatisches Re-Opt-in.

## Sicherheit und Monitoring

SMTP- und IMAP-Passwörter sind Server-Secrets. Der Versandservice bietet keine allgemeine
`POST /send-email`-Schnittstelle. Er sendet nur an administrativ freigegebene
`InvitationRecipient`-Datensätze oder an eine befristete, freiwillige Reportzustelladresse.

Das Betriebsdashboard zeigt ausschließlich aggregiert:

```text
Versendet | Hard Bounces | Soft Bounces | Unterdrückt | Technische Fehler
```

Open Rate, Klickhistorie, Heatmaps und individuelle Ereignisprotokolle sind deaktiviert und werden
nicht nachträglich aktiviert.

## Vor jedem Versand

1. Datenquellensnapshot, Deduplizierung und ausgeschiedene Mandate prüfen.
2. Suppression List anwenden.
3. DNS- und Zustellbarkeits-Gate gemäß `EMAIL_DELIVERABILITY.md` bestehen.
4. SMTP- und IMAP-Test mit dem Funktionspostfach durchführen.
5. Header, HTML, Plain Text, Abmeldung und sichtbaren Link auf einer Testadresse prüfen.
6. Sicherstellen, dass `EMAIL_SEND_MODE=test` aktiv ist, bis die zweite Freigabe dokumentiert ist.
