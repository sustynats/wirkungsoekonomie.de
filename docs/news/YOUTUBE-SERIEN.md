# YouTube-Reihen in Nachgesehen

Stand: 24.09.2026. Beauftragt sind Missverstehen Sie mich richtig, Tech, KI & Schmetterlinge und Politik mit Anne Will. Kanonische Kanal-IDs und offizielle Feeds stehen in `data/news/show-feeds.json`. Keine Anmeldung oder Abonnements im privaten YouTube-Konto werden geändert.

Die vorhandene Sendungsroutine liest den öffentlichen Atom-Feed, prüft Kanal, Video-ID und Laufzeit an der Originalseite und berücksichtigt vollständige Gespräche oberhalb der jeweiligen Mindestdauer. Gekennzeichnete Trailer, Shorts und Vorschauen fallen heraus. Höchstens die 15 aktuellen Feed-Einträge werden geprüft; das ist keine vollständige Archivsuche. Einzelaufträge bleiben weiterhin möglich. Originalveröffentlichung und späteres Bearbeitungsdatum bleiben getrennt.

Deutsche Video-Untertitel haben Vorrang. Automatische Untertitel werden als maschinell gekennzeichnet; sie sind keine amtliche oder wortgetreu geprüfte Mitschrift. Leere Antworten und Zugriffssperren bleiben Quellenlücken. Keine Cookies, Proxys, Plattformumgehung oder neuen Transkriptionsdienste.

Tech und Anne Will haben ergänzende offizielle Podcast-Feeds. Eine Zuordnung verlangt denselben normalisierten Titel, höchstens 36 Stunden Datumsabstand und weniger als fünf Minuten Laufzeitunterschied. Podcast-Zeitmarken gelten ausdrücklich für die Podcastfassung und dürfen nicht ungeprüft auf das Video übertragen werden. Beobachtungen zum sichtbaren Verhalten lassen sich nicht aus der Tonspur ableiten. Bei Tech wird der Unternehmenskontext Schwarz Digits im Auftrag mitgegeben.

Missverstehen und Tech erhalten keinen bezahlten Transkriptionsfallback. Bei Anne Will ist für eine eindeutig zugeordnete offizielle Audiodatei die bestehende budgetierte Sendungstranskription nutzbar. Globale Kosten-, Tages- und Entwurfsgrenzen werden nicht erhöht. Fehlt Wortlaut, bleibt eine Folge in `waiting_for_subtitles`, ohne einen unbrauchbaren Entwurf zu bezahlen. Eine wartende Folge blockiert keine andere nutzbare Folge; die Prüfung ist pro Lauf begrenzt.

Alle Beiträge bleiben private Nachgesehen-Vorschläge mit `manual_only: true`, leeren Autorinnennotizen und `final_approval_required`. Die Autorin gibt die genaue Vorschaufassung selbst frei. Es entsteht keine neue Veröffentlichungsautomatik, kein neuer Cronjob und keine Mac-Abhängigkeit. YouTube-Dubletten werden anhand der Video-ID erkannt; `watch?v=A` und `watch?v=B` sind verschiedene Folgen.

Prüfung: `node --test tests/news/youtube-episodes.test.mjs tests/news/sendungs-kandidaten.test.mjs`. Ein lesender Realabruf über `showEpisodes` prüft Discovery ohne Aufträge oder Kosten. Der normale Serverlauf übernimmt die Registry von `main`.
