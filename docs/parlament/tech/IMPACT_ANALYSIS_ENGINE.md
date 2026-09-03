# Impact Analysis Engine

**Entscheidung: EXTEND bestehender deterministischer Sofortreaktions-Registry.** Die Engine formuliert nur vorab freigegebene Wirkpfad- und Prüftexte aus einer Registry; das Frontend erzeugt keine freie Wirkungsaussage.

Ein Wirkpfad hat höchstens fünf Stationen. Jede Kante trägt eine Evidenzklasse `HIGH`, `MEDIUM`, `LIMITED`, `MODEL_ASSUMPTION` oder `DATA_GAP`; mögliche Bruchstellen werden gesondert angezeigt. Wirkungspotenzial, Wirkungsrisiko und beobachtete Wirkung bleiben getrennt.
