# Akademie: geprüfter Release Candidate 15.10.2026

Nur dokumentierte Fehler korrigiert: sieben Skripte, 171 fachlich unverändert geerbt; 178 historische Leitfaden-Verweise zeitlich präzisiert. Alle 178 öffentlichen Textkörper mit App-Mirror abgeglichen. Claude erstellt Präsentationen nur auf Basis dieser Quellen.

7 PDFs mit 40 Seiten aus korrigierten Quellen neu erzeugt; alle Seiten gerendert und visuell geprüft. Vollständige Artikeltext-Parität zum Reader sowie Metadaten und Hashes geprüft. Historische Originale erhalten.

Vollständiger Website-Build, Quellen-Audit, Architektur-Gates und finales öffentliches Artefakt bestanden. 22.417 deutsche HTML-Seiten auf redaktionelle Reste geprüft: null Fundstellen. Suche 18.513/18.513 öffentliche Routen; null kaputte Links. 3.008 verwaiste Routen und 1.167 doppelte Titel sind geerbte Diagnosen, keine pauschale Fehlerfreiheit. Englisch bleibt offline.

App-Änderungen in PRs 109, 110 und 111 gemergt; Build, Typecheck, Lint, acht Referenz-/Reader-Tests, Curriculum-/Runtime-Staging-Gate, Assessment- und Public-Smoke bestanden. Neue App-Fassung nicht deployed: bestehendes Vercel-Gate FAIR_USE_LIMITS_EXCEEDED/fluidCpuDuration rot, bestehender Oracle-SSH-Endpunkt mit Timeout. Keine Kosten- oder Qualitätsgrenzen umgangen, keine Nutzerdaten migriert.

Veröffentlichung: geprüfte eigene Dateiliste wird auf den aktuellen remote-main-Baum übertragen. Fremde zwischenzeitliche Änderungen bleiben erhalten, bei Konflikten abbrechen. Alternative GitHub-Git-API-Übertragung erforderlich, weil git push des partiellen Klons beim Nachladen alter Blobs hängt. Remote-Dateihashes werden bytegenau verifiziert. Danach bestehender Pages-Prozess, sieben Release-PDFs und Quellenarchiv, echte Live-Prüfung; published erst nach Nachweis.
