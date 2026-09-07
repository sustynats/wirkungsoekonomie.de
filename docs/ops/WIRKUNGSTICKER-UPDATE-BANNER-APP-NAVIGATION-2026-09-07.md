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

Ein Browser-Belastungstest mit pausiertem eigenem localhost-Server machte zusätzlich eine Lücke im Asset-Routing sichtbar: HTML kam nach 2,51 Sekunden aus dem Cache, die nicht abgefangene `news.css` hielt die Seite bis 27,6 Sekunden auf. Wesentliche gleich-originige CSS-/Script-/Schriftdateien und die vorhandenen App-Shell-Assets werden nun ebenfalls bedient. Exakt passende Asset-Versionen dürfen sofort aus dem Cache kommen; eine abweichende Query-Version erst bei langsamem/fehlgeschlagenem Netz. Der große Suchindex, APIs und private Endpunkte bleiben ausgeschlossen; Fehler liefern Assets niemals eine HTML-Offlineseite aus.

## Prüfungen

Gezielte Regressionen prüfen datierte Updates, Erstveröffentlichungen, technische Änderungen, alte Snapshots, neue Lageaktenmitglieder, historische Verlinkung, Winter-/Sommerzeit und ungültige Daten. Service-Worker-Tests prüfen hängende/gesperrte/vollgelaufene Speicher, langsames Netz, gespeicherte und ungecachete Artikel, verspätete Antworten, Serverfehler und unverfälschte Aktualitätsproben. Bestehende Push-Tests bleiben unverändert erfolgreich.

Browser mit aktiv kontrollierendem Service Worker: Der wiederholte Belastungstest bei pausiertem eigenem localhost-Server lieferte nach der Asset-Korrektur die vollständige gespeicherte Seite nach 2,557 Sekunden statt 27,617 Sekunden. Die CSS-Anfrage dauerte dabei 3 ms statt rund 25 Sekunden. Der Testserver wurde jeweils in `finally` fortgesetzt; die Produktionsinfrastruktur war nicht beteiligt. Ein CLI-Offline-Schalter erwies sich zuvor für diese Messung als unzureichend und zählt nicht als erfolgreicher Offline-Nachweis.

Browserprüfung des Banners im bestehenden Design: 320-/390-px-Mobilansicht und 1440-px-Desktopansicht ohne horizontale Überbreite. Datum, Link zum aktuellen Lageaktenstand und Link zum Versionsverlauf stimmen; die Sprungziele wurden im Browser geöffnet. Keine Browserfehler bei der Prüfung. Die vollständige Nachrichtentestsuite umfasst 571 erfolgreiche Tests, einschließlich neun Service-Worker-Navigationsregressionen. Validierung, Syntaxprüfung und Sprachprüfung liefen erfolgreich; die Sprachprüfung weist bestehende Befunde separat aus. Deployment bleibt im bestehenden GitHub-Pages-Workflow; ein reales Android-Gerät wurde nicht getestet.

Das vollständige Publikationsartefakt wurde nach Integration der automatischen Abendausgabe um 18:42 UTC erneut gebaut: JavaScript-/JSON-/Vorlagenprüfungen, Linkprüfung (0 defekte interne Links), Methoden-/Versionsprüfung, Umfragen-/Seitenfragen-/Institutsprüfungen, Datenschutzprüfung und Größenlimit bestanden. Die weiter vorhandenen Waisen-/Titelbefunde des Gesamtarchivs sind keine neu behaupteten Fehlerfreiheit. Nachrichtentexte und Warteschlangen wurden für diese UI-Reparatur nicht verändert.
