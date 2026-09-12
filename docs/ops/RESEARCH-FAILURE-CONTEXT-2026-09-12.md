# Recherchefehler eindeutig zuordnen

Stand: 12.09.2026

Der Import meldete bei einer zusaetzlichen Recherchequelle nur `RSL_STATUS_OPEN`.
Erst die Laufprotokolle zeigten, welcher Abruf betroffen war. Dadurch musste die
Redaktion mehrere moegliche Quellen einzeln untersuchen; die Ausgangsquelle war
nicht notwendigerweise die Ursache.

Der private Korrekturauftrag nennt jetzt auch bei Robots-/RSL-/HTTP-Verweigerung
und fehlendem Originalzitat die validierte `research-...`-Quellen-ID. Die bestehende
Quellenkennung fuer deaktivierte Registry-Eintraege bleibt erhalten. Keine URL,
kein Quellentext und keine technischen Anbieterantworten werden hinzugefuegt.

Die Zugangsentscheidung bleibt unveraendert: Es gibt keinen zusaetzlichen Abruf,
keinen Proxy, keine Freigabe trotz Sperre und keinen erfolgreich gespeicherten
Beleg bei einem fehlgeschlagenen Abruf. Fehlende Zitate werden auch beim erneuten
Pruefen eines anderen Zitats im selben Dokument mit der richtigen Quelle gemeldet.

Validierung: Tests fuer verweigerten RSL-/Robots-/HTTP-Zugang, ausbleibende
Belegspeicherung und fehlende Zitate bei Erstpruefung sowie vorhandenem Cache.
