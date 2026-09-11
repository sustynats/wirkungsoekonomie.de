# Cloud-Worker: Schedulerverzögerung und frischer Zugriffsnachweis

## Produktionsbefund vom 11. September 2026

Worker B konnte seine eigenen Reads durchführen, brach aber wiederholt ab, weil seit dem geplanten Termin fast 30 Minuten vergangen waren. Der Validator verwendete dieselbe Grenze sowohl für die Verspätung des Schedulers als auch für das Alter des tatsächlichen erfolgreichen Readbacks. Dadurch konnte ein frischer Zugriffsnachweis allein wegen des verspäteten Starts scheitern.

Die Fristen sind nun getrennt:

- `checked_at` bleibt der echte Zeitpunkt des erfolgreichen eigenen Probe-Readbacks.
- Der eigene Nachweis darf bei Annahme weiterhin höchstens 30 Minuten alt sein.
- Zwischen dem echten geplanten Termin und dem Readback dürfen höchstens 90 Minuten liegen. Spätere Vorkommnisse werden verworfen.
- Zukunftszeiten, Rückdatierung, fremde Kontexte, geänderte Proben, unvollständige Reads und nicht übereinstimmende Hashes bleiben gesperrt.
- Claim-, Stunden-Slot-, Shard-, Quellen- und Publikationsprüfungen werden nicht geändert. Eine verzögerte Ausführung erlaubt keine zusätzliche parallele Übernahme eines Jobs.

Der neue private Transportvertrag muss diese Unterscheidung vor einer Wiederaufnahme vermitteln. Erst ein tatsächlicher nativer Preflight erlaubt Verarbeitung. Ein erfolgreicher Test mit Serverzugang bestätigt keinen ChatGPT-Worker.

Ein zweiter, unabhängiger Befund betrifft Worker A: Der Envelope in Issue #508 enthält ungültiges Base64 (`Excess data after padding`). Solche Daten dürfen nicht durch Entfernen von Zeichen repariert werden. Der Sender muss aus seinem Original eine neue echte Probe über den ausgeführten Encoder erzeugen, den serialisierten und den tatsächlich gespeicherten Issue-Body strikt vergleichen und den verifizierten Receipt abwarten. Eine behauptete lokale Prüfung genügt nicht.
