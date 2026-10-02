# Redaktionsauslieferung: 2. Oktober 2026

## Belegte Blockaden

Der Pages-Lauf 37006090236 scheiterte an `NWI_ACRONYM_DISAMBIGUATED`:
`blog.html` enthielt wieder die unqualifizierte historische WÖk-Kurzbezeichnung.
Der Journalgenerator uebernahm sie aus den Metadaten eines datierten Altartikels.
Die aktuellen Karten und Schlagworte werden nun im bestehenden Generator
qualifiziert; der historische Haupttext, sein Addendum und die PDF-Eingaben
bleiben unveraendert. Die PDF-Pruefsumme darf nicht durch einen aktualisierten
Kartentext veraendert werden; der normale PDF-Verifikationslauf prueft dies.
Das semantische Release-Gate bleibt aktiv.

Im Redaktionslauf 37006136916 waren acht automatische Folgenauftraege des Tages
bereits erreicht. Auch monatelang alte Staffelfolgen hatten Plaetze belegt.
Zwei erkannte Folgen blieben im bestehenden Beobachtungsspeicher erhalten.
Der allgemeine Nachholanteil wird nun begrenzt, damit aktuelle Sendungen auch
bei spaeterem Eintreffen von Untertiteln Platz behalten. Keine Quelle wird
deaktiviert, kein Auftrag entfernt und kein API-/Transkriptionsbudget angehoben. Das volle
Tageskontingent von heute wird nicht nachtraeglich zurueckgesetzt.

Der vorhandene Repository-Schalter `WOEK_EPISODE_CANDIDATES_PER_DAY` wurde
am 02.10.2026 von acht auf zehn Einreihungsplaetze gesetzt und zurueckgelesen.
Dies ermoeglicht die erneute Pruefung der zwei wartenden Folgen; bezahlte
Verarbeitung bleibt an ihre eigenen unveraenderten Kostenlimits gebunden.

## Pruefungen und Grenzen

Eine archivierte Korrekturantwort vom 14.09. scheiterte weiterhin an
`$.preview.sources[0].url`: ein privater Screenshot war faelschlich als
oeffentliche Webquelle modelliert. Der Wiederaufnahmeweg kann einen solchen
Eintrag jetzt ausschliesslich bei exakter Pfad-/SHA-256-Bindung an den
Originalauftrag aus den oeffentlichen Webquellen nehmen. Anhang, Original-
antwort und Auftrag bleiben privat erhalten; keine URL wird erfunden und
fehlende oder ungebundene Quellen scheitern weiterhin. Sieben oeffentliche
Quellen des konkreten Entwurfs bleiben erhalten. Keine Modellanfrage und
keine automatische Freigabe. Der Originaltext wird nicht ins Repository
aufgenommen. Die lokale Vertragspruefung dieser archivierten Fassung sowie
alle 40 Redaktionsworker-Tests bestanden.

Der Betriebsbefund um 13:23 UTC enthaelt genau einen erschoepften Auftrag
ohne gelieferte Antwort (Lanz & Precht, Versuch seit 05:46 UTC). Der zugrunde
liegende Undici-/Quellenabruf-Absturz wurde separat behoben; eine archivierte
Antwort ist fuer diesen Auftrag nicht vorhanden. Workerversion 8 aktiviert den
bereits bestehenden einmaligen, versionsgebundenen Wiederanlauf. Keine
Versuchszaehler werden geloescht, keine Modellantwort als wiederhergestellt
ausgegeben. Ein weiterer Modellaufruf kann Kosten innerhalb der bestehenden
Limits verursachen; bei erneutem Fehler wird er in dieser Version nicht
wiederholt. Bereits zugestellte Entwuerfe bleiben ausgenommen.

Lokal bestanden: 15 Journaltests, 31 Architektur-/Semantikgates einschliesslich
NWI, 1775 Nachrichtentests vor der Nachholkorrektur, anschliessend alle 33
Folgenkandidaten-Tests. Typecheck, Lint (mit bestehenden Hinweisen), Journal-
und Suchgenerator sowie `git diff --check` waren erfolgreich.

Diese Befunde sind kein Deploymentnachweis. Produktion und private Redaktion
muessen nach dem normalen Release separat verifiziert werden. Ein
`PUBLISHING`-Status ist noch kein Beleg einer ausgelieferten Fassung.
Private Manuskripte, Freigaben und Zugangswerte sind nicht Teil dieses Commits.
