# GPT-6-Astra-Migration des Wirkungstickers

Stand: 21.09.2026

## Ziel

GPT-6 Astra wird dort eingesetzt, wo sein Qualitaetsgewinn fuer den
Wirkungsticker am groessten ist: bei einer von Natalie Weber manuell
beauftragten Ausgabe von **Meinung & Analyse**. Der dreimal taeglich
publizierende Nachrichtenbetrieb darf durch den Modellwechsel weder ausfallen
noch sein Monatsbudget in wenigen Tagen verbrauchen.

Die Migration ist deshalb rollen- und nicht namensbasiert. Sie ersetzt nicht
blind jede Modellkennung im Repository.

## Offizielle Kompatibilitaetsbasis

- Modellkennung: `gpt-6-astra`
- API: Responses API
- Reasoning: `low`, `medium`, `high`, `xhigh`, `max`; der Wirkungsticker
  verwendet fuer die Redaktionsspur weiterhin `medium`.
- Kontextfenster: 1.050.000 Tokens; maximale Ausgabe: 128.000 Tokens. Das
  bestehende Limit von 48.000 Ausgabetokens bleibt als Kosten- und
  Laufzeitschutz bestehen.
- Im bestehenden Request werden keine fuer Astra unzulaessigen Sampling-Felder
  (`temperature`, `top_p`, `logprobs`, `top_logprobs`) gesendet.
- Tarif bei der Pruefung: 10 USD/Mio. Input, 1 USD/Mio. gecachter Input und
  50 USD/Mio. Output.

Primaerquellen:

- https://developers.openai.com/api/docs/models/gpt-6-astra
- https://developers.openai.com/api/docs/guides/latest-model
- https://developers.openai.com/api/docs/guides/model-selection

## Bestandsaufnahme und Kostenentscheidung

Die lokale Nutzungsakte enthaelt 239 produktive Luna-Laeufe mit zusammen
8.551.597 Input- und 3.102.248 Output-Tokens. Sie kosteten nach dem erfassten
Tarif 5,8509 USD. Derselbe Tokenumfang wuerde mit Astra rund 240,6284 USD
kosten, also das 41,1-Fache. Im Mittel waeren das etwa 1,0068 USD statt
0,0245 USD pro Lauf.

Ein globaler Austausch des volumenstarken Modells widerspraeche deshalb dem
verbindlichen September-Limit von 100 EUR und dem Betriebsziel, die Ausgaben
zuverlaessig erscheinen zu lassen. Die offizielle Modellauswahl-Anleitung
empfiehlt ebenfalls, die hoechste Qualitaetsstufe zuerst fuer schwierige
Aufgaben einzusetzen und anschliessend Kosten und Latenz je Arbeitslast zu
optimieren.

## Zielarchitektur

| Arbeitslast | Modell | Begruendung |
| --- | --- | --- |
| Manuell von Natalie beauftragte `opinion_analysis` | `gpt-6-astra`, medium | Qualitaetskritische persoenliche Analyse mit hohem redaktionellen Anspruch |
| Automatisch vorgeschlagene `opinion_analysis` | `gpt-5.6-luna`, medium | Hoeheres Volumen, Entwurf bleibt in der Freigabe |
| Nachrichtenticker | `gpt-5.6-luna`, medium | Dreimal taeglicher, kostenkritischer Dauerbetrieb |
| Buch & Wirkung, Nachgehoert, Nachgesehen | `gpt-5.6-luna`, medium | Kein vom Auftrag verlangter Modellwechsel; bestehender manueller Freigabeweg |
| Deaktivierte Batch-/Legacy-Wege | unveraendert | Kein unbeabsichtigtes Wiederbeleben oder Verteuern alter Pfade |

## Umsetzung

- `gpt-6-astra` ist im gemeinsamen Responses-Transport und in der
  Kostenpruefung als bepreistes Modell zugelassen.
- Der Redaktionsworker entscheidet anhand von **Format und Herkunft des
  Auftrags**. Nur `opinion_analysis` plus belegter manueller Ausloeser
  (`draft_id`, manueller Trigger oder manuelle Nachrecherche) waehlt Astra.
- Die Modellwahl wird an den ersten Aufruf und an die einzige erlaubte formale
  Nachlieferung gebunden. Ein Lauf kann deshalb nicht zwischen Modellen wechseln.
- Das angeforderte und das vom Anbieter gemeldete Modell werden im privaten
  Laufprotokoll festgehalten.
- Kosten werden aus der gemeldeten Usage mit dem Astra-Tarif berechnet. Bei
  unklarer Usage reserviert ein Astra-Aufruf konservativ 3 USD statt 0,25 USD.
- GitHub-Variablen:
  - `WOEK_EDITORIAL_ANALYSIS_MODEL=gpt-6-astra`
  - `WOEK_EDITORIAL_MODEL=gpt-5.6-luna`
  - `WOEK_NEWS_MODEL=gpt-5.6-luna` bleibt unveraendert.

## Qualitaets- und Betriebsgates

1. Unit-Test der Modellwahl: manuell + Meinung/Analyse = Astra; automatisch
   oder anderes Format = Luna.
2. Request-Test: Responses API, `store:false`, `reasoning.medium`, ohne
   inkompatible Sampling-Parameter.
3. Kosten-Test: Astra-Tarif, Cached Input und konservative Reserve.
4. Regressionstest fuer Nachrichten- und Redaktionsworker.
5. Typecheck und statischer Build.
6. Nach Aktivierung: naechste manuell beauftragte Analyse als Canary; Modell,
   Usage, Kosten und Freigabeergebnis im privaten Laufprotokoll pruefen.

## Rollback

Die Rueckkehr ist ohne Code-Rollback moeglich:

1. Repository-Variable `WOEK_EDITORIAL_ANALYSIS_MODEL` auf
   `gpt-5.6-luna` setzen.
2. Laufprotokoll des letzten Astra-Auftrags und Kostenjournal erhalten; keine
   bereits verbuchte Usage zuruecksetzen.
3. Einen manuellen Testauftrag durch den privaten Freigabeweg laufen lassen.

Nachrichtenbetrieb, bestehende Entwuerfe und Veroeffentlichungen werden von
diesem Rollback nicht beruehrt.
