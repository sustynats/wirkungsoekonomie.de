# Nachrichtenaktualität: Reparatur vom 12. September 2026

## Befund

Die Untersuchung des Quellenfensters 04:36–05:36 UTC fand 49 Feed-Einträge in 49 zwischengespeicherten Quellenpaketen. Dies sind Rohmetadaten, keine 49 fertig recherchierten Ereignisse. Insbesondere gleichlautende Feed-Zeitpunkte sind noch kein Beleg für ein neues Ereignis. In der tatsächlichen Queue war im geprüften Zeitraum nur ein neu eingestelltes altes Update (Briefwahl vom 5. September) sichtbar. Eine erfolgreiche Discovery oder ein Preflight beweist keinen veröffentlichten Artikel.

Zwei technische Stellen begrenzten aktuelle Kandidaten: `run.mjs` verlangte mindestens 30 Punkte im alten Vorfilter. `provider.mjs` ließ bei voller Queue vor allem TOP/HIGH oder Updates bereits publizierter Geschichten passieren. Unauffällig formulierte neue Meldungen hatten damit keinen gleichwertigen Zugang.

## Änderung und Grenzen

- Eine zusätzliche versionierte Metadatenprüfung erkennt Zustandsänderungen in relevanten Bereichen und erlaubt die redaktionelle Prüfung. Sie vergibt keine neue systemische Relevanz und keine MPD-Werte. Event-Signale sind für diesen zusätzlichen Zugang keine Voraussetzung. Offensichtliche Service-, Sport-, Kommentar- und Routineformate erhalten darüber keine Beförderung.
- Tatsächlich frische Quellen (bis drei Stunden) können die bestehende Pending-Grenze passieren. `maxJobs` pro Lauf, Event-Dedupe, Claim-Bindung, Rechteprüfung und alle Publikationsgates bleiben wirksam. Historischer Backfill erhält diese Ausnahme nicht.
- Dringende Fälle bleiben vorn. Neue Meldungen aus der letzten Stunde folgen vor alten neu eingestellten Updates. Innerhalb der Klasse bestimmt der Quellenzeitpunkt LIFO; Import- und Reparaturzeiten erzeugen keine Aktualität.
- Öffentliche News sortieren nach dem ursprünglichen Ereignisbeleg. Hintergrundquellen und Rechtsgrundlagen bestimmen dieses Datum nicht. Redaktionell ausdrücklich dokumentierte `news_update_at`/`news_at` können einen echten Ereignisfortschritt kennzeichnen; bloßes `last_updated` kann das nicht. Solche optionalen Felder werden von dieser Reparatur nicht automatisch aus Importzeiten erzeugt.
- Eine verspätete Erstlieferung (mehr als eine Stunde nach der Originalquelle) erhält weder Neu-Badge noch PWA-Neumeldung. Die gespeicherten Publikations-/Versionszeiten bleiben als Audit erhalten. Persönliche Beiträge und ihre Freigabe bleiben unverändert.

Diese begrenzte Reparatur ersetzt nicht das noch ausstehende vollständige Quellen-/Rubrik-Recall-Audit samt 72/96-Stunden-Nachlieferung. Sie garantiert auch keinen redaktionellen Durchsatz: fehlende oder zurückgewiesene Worker-Ausgaben müssen weiterhin konkret bearbeitet werden. Ein zweiter Prüflauf, eine Quarantäne oder ein privater Entwurf zählen nicht als neue öffentliche Nachricht.

## Betriebsabweichung

Auf Oracle war zusätzlich `intake-news.mjs` älter als der bereits gemergte Stand. Der alte Import verlangte den eingereichten Hinweislink selbst als abrufbaren Nachrichtenbeleg. Die geprüfte Fassung erhält den Hinweis als Herkunft und verlangt unabhängig verifizierte Quellen für das Ereignis. Sie umgeht keine Zugangssperre. Der erste Aktualisierungsversuch wurde nach einem Speicherfehler sofort auf die vorherige Version zurückgesetzt. Der nun erstmals erreichte Dublettenabgleich lud die gesamte Queue einschließlich privater Manuskripte. Die Korrektur liest in SQLite nur passende Kandidaten und iteriert einzeln. Ein separater Test mit 100 MiB Manuskripten und 64 MiB Node-Heap sichert diese Grenze ab. SQLite-Sicherung und Rückfallpfad bleiben erhalten.

## Abnahme

Tests decken neue Meldungen ohne Event-Signal, volle Queue, Quellendatum statt Requeue-Zeit, Dubletten, ursprüngliche Datumsortierung und ausgeblendete Neu-Badges für Nachlieferungen ab. Produktionsabnahme benötigt zusätzlich einen realen neuen Eingang, einen nativen redaktionellen Output, erfolgreichen Import und die erreichbare öffentliche URL. Für private persönliche Beiträge ist die funktionierende Freigabevorschau das nächste überprüfbare Ergebnis.
