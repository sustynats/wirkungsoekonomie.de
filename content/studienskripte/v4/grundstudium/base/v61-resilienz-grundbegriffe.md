<!-- WOEK_PUBLIC_MASTER source=sustynats/woek-akademie-app@aa10de6b5a5c26badb3747fd3e4a97b540e327a7 path=content/lehrgaenge/akademie/curriculum-v4/lectures/base/v61-resilienz-grundbegriffe.md curriculum=4.0 sanitized=true -->
# V61 · Resilienz verstehen: Robustheit, Redundanz, Diversität und Anpassungsfähigkeit

**lecture_id:** `WOEK-G-BASE-061`  
**display_code:** `V61`  
**curriculum_version:** `4.0`  
**legacy_source:** `seed.ts` v3.2 plan @ `ef4e627d746e6d61aaf4a0befc3ca8583f7883dc`  
**migration_class:** `MATERIAL_REWRITE_REQUIRED`  
**status:** `FACH_ENDCONTENT_REVIEWED`  
**reviewed_at:** 2026-08-21  
**change_reason:** v4.0 verankert Resilienz in etablierter System-/Risikoforschung und trennt Robustheit, Redundanz, Diversität, Anpassungs- und Erholungsfähigkeit. WÖk beansprucht keine Neuerfindung des Resilienzbegriffs.

## 20-Sekunden-Einstieg

Ein effizientes System kann fragil sein. Ein resilientes System kann Störungen aufnehmen, wesentliche Funktionen erhalten, sich anpassen und sich erholen. Dafür gibt es unterschiedliche Fähigkeiten: **Robustheit** hält aus, **Redundanz** schafft Alternativen, **Diversität** vermeidet gemeinsame Ausfallursachen, **Anpassungsfähigkeit** verändert Verhalten und **Recovery** stellt Funktionen wieder her. WÖk integriert diese Fähigkeiten in Wirkungsentscheidungen – sie hat Resilienz nicht erfunden.

## Lernziele

Nach dieser Vorlesung kannst du:

1. Resilienz von Stabilität und Effizienz unterscheiden.
2. Robustheit, Redundanz, Diversität, Adaptivität und Recovery erklären.
3. Resilienz auf Funktion statt bloßen Bestand beziehen.
4. Effizienz-Resilienz-Trade-offs analysieren.
5. Verteilung und Abhängigkeiten in Resilienzfragen einbauen.
6. geeignete State Variables für Resilienz formulieren.

## 1. Was soll erhalten bleiben?

Resilienz braucht einen Funktionsbezug.

Fragen:

- Welche Funktion ist kritisch?
- für wen?
- wie lange darf sie ausfallen?
- welcher Mindestzustand ist akzeptabel?

Beispiel Stromsystem:

Nicht „jede Anlage bleibt immer online“, sondern „kritische Versorgung bleibt ausreichend erhalten/wird schnell wiederhergestellt“.

## 2. Robustheit

Widerstand gegen Belastung ohne wesentlichen Funktionsverlust.

Beispiel:

Gebäude hält definierte Sturm-/Hitze-/Lastbedingungen aus.

## 3. Redundanz

Alternative Kapazität oder Wege.

Beispiele:

- zweiter Lieferant,
- Backup-Strom,
- Ersatzroute,
- personelle Vertretung.

Redundanz kostet Ressourcen und kann selbst ineffizient sein; ihre Wirkung hängt am Risiko.

## 4. Diversität

Mehrere unterschiedliche Lösungen reduzieren gemeinsame Ausfallursachen.

Zwei identische Backups am selben Standort sind redundant, aber wenig divers.

Diversität kann technologisch, geografisch, organisatorisch oder sozial sein.

## 5. Anpassungsfähigkeit

System kann Regeln, Verhalten oder Struktur verändern.

Beispiele:

- Nachfrage flexibilisieren,
- Produktion umstellen,
- Personal neu einsetzen,
- neue Informationslage verarbeiten.

Adaptivität braucht oft Entscheidungsrechte und Lernfähigkeit.

## 6. Erholung

Wie schnell und vollständig wird Funktion wiederhergestellt?

State Variables:

- Ausfalldauer,
- Recovery Time,
- Restschaden,
- Wiederanlaufkapazität.

## 7. Effizienz vs. Resilienz

Maximale Auslastung kann Kosten senken, aber Reserven reduzieren.

WÖk prüft:

> Welche Reserve ist angesichts erwarteter Störungen sinnvoll?

Nicht:

> „Mehr Redundanz ist immer besser.“

## 8. Abhängigkeit

Resilienz kann durch Konzentration sinken:

- einzelne Rohstoffe,
- Cloudanbieter,
- Regionen,
- Transportkorridore,
- Schlüsselpersonen.

Dafür eignen sich Konzentrations-/Dependency-Indikatoren.

## 9. Verteilung

Ein System kann gesamt resilient wirken und vulnerable Gruppen nicht schützen.

Beispiel Hitze:

Stadtfunktion bleibt, aber Pflegeheime/arme Quartiere leiden überproportional.

Darum:

`SYSTEM_RESILIENCE + DISTRIBUTIONAL_RESILIENCE`.

## 10. Beispiel Krankenhaus

Kritische Funktion:

Akutversorgung.

Kapazitäten:

- Personalreserve,
- Medikamentenlager,
- Strom/IT-Backup,
- Lieferantendiversität,
- Notfallpläne,
- Recovery.

WÖk verbindet diese mit Patienten-/Arbeits-/Kostenwirkungen.

## 11. Begriffsbox

| Begriff | Bedeutung |
|---|---|
| Resilienz | Fähigkeit, wesentliche Funktion unter Störung zu erhalten, anzupassen und wiederherzustellen |
| Robustheit | Widerstand gegen Belastung |
| Redundanz | alternative Kapazität/Wege |
| Diversität | unterschiedliche Lösungen/Quellen gegen gemeinsame Ausfälle |
| Adaptivität | Fähigkeit, Verhalten/Struktur anzupassen |
| Recovery | Wiederherstellung nach Störung |

## 12. Typische Fehlinterpretationen

### „Resilienz = nie ausfallen.“
Falsch.

### „Redundanz = Diversität.“
Nicht identisch.

### „Effizienz und Resilienz widersprechen sich immer.“
Falsch.

### „Resilienz ist automatisch nachhaltig.“
Falsch.

### „Gesamtresilienz zeigt vulnerable Gruppen.“
Falsch.

## 13. WÖk-Abgrenzung

UNDRR, Resilience Engineering, Supply-Chain-/Infrastructure-Resilience und viele Fachfelder existieren lange. WÖk integriert diese Konzepte in Wirkungsprofile, Verteilung, Optionsvergleich und Reality Check.

## 14. Quellen

- UNDRR Terminology – Resilience: https://www.undrr.org/terminology/resilience
- OECD Strategic Foresight: https://www.oecd.org/strategic-foresight/
- WÖk Resilienz-Dossier: https://wirkungsoekonomie.de/wissen/systemresilienz-statt-nachhaltigkeit/

## 15. Transferaufgabe

Wähle ein System und definiere kritische Funktion, fünf Resilienzkapazitäten, einen Stressor, Mindestfunktion, Recovery-Ziel und Verteilungsfrage.

## 17. Prüfungsrelevanz

- fünf Kapazitäten,
- Funktionsbezug,
- Effizienztrade-off,
- Abhängigkeit,
- Distribution,
- State Variables.

## 18. Sprechertext

Resilienz heißt nicht, dass nie etwas kaputtgeht.

Es heißt: Wenn etwas passiert, bleibt das Wichtige funktionsfähig – oder kommt schnell zurück.

Dafür brauchen Systeme unterschiedliche Fähigkeiten.

Robustheit hält aus. Redundanz gibt Alternativen. Diversität verhindert, dass alles am gleichen Fehler hängt. Anpassung verändert Verhalten. Recovery stellt Funktion wieder her.

Und immer fragen wir zuerst: Welche Funktion wollen wir schützen?

Denn ein Krankenhaus muss nicht in jedem Detail unverändert bleiben. Es muss kritische Versorgung gewährleisten.

Der Merksatz lautet:

**Resilienz ist keine Reserve um der Reserve willen. Sie ist die Fähigkeit, das Wesentliche unter realen Störungen aufrechtzuerhalten und daraus zu lernen.**

## Fachlicher Stand und Addendum · 6. September 2026

Dieses Addendum ergänzt die Fassung vom August 2026 transparent. Frühere Versionsangaben dokumentieren deren Entstehung; für die aktuelle Einordnung gilt der [führende Begriffsleitfaden v1.7](https://wirkungsoekonomie.de/bibliothek/woek-begriffsleitfaden-fuehrend/). Wirkung ist eine tatsächliche Zustandsveränderung. Zielbezug, Indikator, Reichweite und Beobachtung sind jeweils vom kausalen Nachweis zu unterscheiden. SDG+ ist eine WÖk-eigene Erweiterung; positive Netto-Wirkung bleibt an Nichtkompensation harter Schutzgrenzen gebunden.
