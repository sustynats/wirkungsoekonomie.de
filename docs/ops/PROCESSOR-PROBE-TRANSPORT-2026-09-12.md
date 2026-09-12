# Redaktions-Preflight: Testprobe und Artikelausgabe

Die tatsächlichen Diagnoseläufe A/B vom 12.09.2026 konnten alle fünf
Dropbox-Ordner lesen. Sie stoppten vor dem Schreiben, weil der versionierte
Transportvertrag v5 auch für die inhaltsfreie Testprobe zwingend einen langen
verschlüsselten Envelope verlangte. Frühere Versuche hatten beschädigte
Base64-Daten übertragen. Der Empfänger erlaubt bereits ausschließlich für
die exakte Nutzlast `{probe_id, test_only: true}` eine Klartext-Testprobe.

`write-processor-transport.mjs` ergänzt diese eng begrenzte Ausnahme im neuen
unveränderlichen Vertrag `processor-transport-20260912-6.json`. Er prüft vorab
die SHA256 der tatsächlich gelesenen v5-Datei. Die alte Datei bleibt erhalten.
Der vorhandene atomare Dropbox-Transport verhindert abweichendes Überschreiben;
abschließend wird der vollständige Text zurückgelesen und verglichen.

Artikel, persönliche Notizen und Processor-Berichte bleiben verschlüsselt.
Fünf frische Reads, tatsächlicher Write/Readback, eigener Shard, ACK-/Claim-Prüfung
und finale Freigabe bleiben verbindlich. Das Schreiben des Vertrags aktiviert
keinen Worker und bestätigt keinen bestandenen Automations-Preflight.

Deployment: nach grüner Prüfung und Merge den manuellen Workflow
`Wirkungsticker Processor Configuration` auf `main` ausführen. Er nutzt bestehende
GitHub-Secrets direkt im Runner und benötigt weder den Mac noch Oracle-Zugang.
Keine Geheimnisse oder privaten Artikel werden als Artefakt hochgeladen.
Anschließend v6 im tatsächlichen Worker frisch lesen und einen einmaligen
Diagnosetermin ausführen. Regelbetrieb erst nach tatsächlichem Read/Write-PASS
und verifiziertem Processor-Bericht aufnehmen.

Dies behebt den Vertragswiderspruch. Die vollständige verschlüsselte
Artikelübertragung und die Oracle-Importverfügbarkeit müssen weiterhin separat
Ende zu Ende bestätigt werden.
