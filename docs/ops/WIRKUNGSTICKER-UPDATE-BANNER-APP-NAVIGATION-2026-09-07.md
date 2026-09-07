# Update-Hinweise und App-Navigation – 7. September 2026

## Leserführung

Aktualisierte Einzelmeldungen und fortgeschriebene Lageakten erhalten auf Übersicht und Detailseite ein rotes Update-Band mit schräger Fahnenkante, Datum und Uhrzeit in Europe/Berlin. Die Schrift bleibt gerade und lesbar; das Band liegt außerhalb von Überschrift und Wirkungsvisualisierung. Es erklärt: „Aktualisierter Stand – keine doppelte Meldung.“ Direkte Links führen zum aktuellen Lageaktenstand bzw. zum Versionsverlauf. Ältere Mitgliedsseiten verweisen auf den aktuellen Repräsentanten, ohne selbst als neu geschriebener Artikel ausgegeben zu werden.

Grundlage sind vorhandene Publikationsquittungen der aktuellen öffentlichen Version; ältere Bestände können ihre versionierten Inhalts-Snapshots verwenden. Reine `last_updated`-Änderungen, Abrufe, fehlgeschlagene Versuche, Bilderzeugung und eine höhere Versionsnummer ohne datierten Nachweis reichen nicht. Ein neu veröffentlichter Einzelbericht mit Version 1 kann gleichwohl eine bestehende Lageakte fortschreiben. Fehlende Datierung wird nicht erfunden.

Die Kennzeichnung gilt rückwirkend aus vorhandenen Metadaten und für künftige Builds. „Neu“ erscheint nicht zusätzlich auf Update-Karten. Das datierte Update-Band bleibt nach „gelesen markieren“ als Orientierung sichtbar; es behauptet nicht „gerade eben“ oder „heute“. Keine Neuanalyse, neuen Providerkosten, Änderung von Clustering, Rangfolge, Artikeldaten oder Veröffentlichungsdaten.

## Reproduzierter App-Fehler

Gemeldet wurde ein sehr langsames Öffnen von Artikeln. Das konkrete Gerät/der Browser ist bisher nicht bekannt; Android als Ursache ist nicht belegt. Im geprüften Desktop-Browser lud die Live-Übersicht in rund 0,7 Sekunden ohne JavaScript- oder Ressourcenfehler.

Der bisherige Service Worker wartete bei erfolgreichem Netzwerkabruf auf `cache.put` und damit auf den vollständigen Antwortkörper und den lokalen Speicher. Ein reproduzierter hängender Cache-Schreibvorgang blockierte die Anzeige trotz bereits vorhandener Antwort; ein Quota-Fehler ließ die frische Antwort zugunsten eines alten Cache-Eintrags verloren gehen. Zusätzlich gab es keine begrenzte Netzwartezeit.

Korrektur: Netzwerkantwort sofort an den Browser, Speichern separat mit `waitUntil`; Speicherzugriff darf Netzwerkzugriff weder verzögern noch verhindern. Gespeicherte Artikel sind bei hängender Verbindung nach 2,5 Sekunden verfügbar, während ein begrenzter Hintergrundabruf den Speicher noch auffrischen kann. Der Netzversuch wird nach acht Sekunden abgebrochen. Auch Speicherzugriffe sind begrenzt. Ohne verfügbare Fassung erscheint ein verständlicher Wiederholungs-/Verbindungshinweis statt endlosen Wartens. Echte 404 bleiben 404, temporäre Serverfehler können auf den gespeicherten Artikel zurückfallen. Live-Aktualitätsproben verwenden weiterhin niemals eine gecachte Antwort.

Der Cache-Namensraum bleibt erhalten; vorhandene gespeicherte Artikel und Push-Zustand werden nicht gelöscht. Kein Backend, Budget, Abo oder Tarif geändert. Der konkrete gemeldete Gerätefall bleibt bis zu weiteren Angaben unbestätigt.

## Prüfungen

Gezielte Regressionen prüfen datierte Updates, Erstveröffentlichungen, technische Änderungen, alte Snapshots, neue Lageaktenmitglieder, historische Verlinkung, Winter-/Sommerzeit und ungültige Daten. Service-Worker-Tests prüfen hängende/gesperrte/vollgelaufene Speicher, langsames Netz, gespeicherte und ungecachete Artikel, verspätete Antworten, Serverfehler und unverfälschte Aktualitätsproben. Bestehende Push-Tests bleiben unverändert erfolgreich.

Browserprüfung erfolgt im bestehenden Design auf schmalen und breiten Ansichten sowie mit kontrolliertem Service Worker und Offline-Fallback. Deployment bleibt im bestehenden GitHub-Pages-Workflow.
