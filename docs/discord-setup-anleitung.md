# Discord-Setup-Anleitung für die WÖk-Akademie-App

Stand: 19. Mai 2026

## Ziel

Discord regelt Zugang, Kohorte und groben Status. Supabase regelt Lernstand, Module, Prüfungen, Fortschritt und Freischaltungen.

Die Akademie-App darf keine Modulfreischaltungen über Discord-Rollen verwalten. Rollen wie `Modul 1`, `Teil I` oder `Prüfung bestanden` werden nicht angelegt.

## Rollen, die in Discord existieren

Aktueller Rollenstand:

- Rookie
- Standard
- Level2
- Akademie-Zugang
- Kohorte-2026-V1
- Kohorte-2026-V2
- Student:in
- Absolvent:in
- Mentor:in
- Team
- @everyone

## Für die Akademie-App relevante Rollen

- Akademie-Zugang
- Kohorte-2026-V1
- Kohorte-2026-V2
- Student:in
- Absolvent:in
- Mentor:in
- Team

## Rollen, die nicht für die Akademie-App genutzt werden

Diese Rollen sind Community-/Discord-Level-Rollen und dürfen nicht als Zugangskriterium verwendet werden:

- Rookie
- Standard
- Level2

## Was Natalie manuell vergibt

### Neuer Student / neue Studentin

1. Person tritt dem Discord-Server bei.
2. Natalie vergibt `Akademie-Zugang`.
3. Natalie vergibt `Student:in`.
4. Natalie vergibt `Kohorte-2026-V2`.
5. Person loggt sich erneut in der Akademie-App ein.

### Alte Studierende

1. Person tritt dem Discord-Server bei oder ist bereits dort.
2. Natalie vergibt `Akademie-Zugang`.
3. Natalie vergibt `Student:in`.
4. Natalie vergibt `Kohorte-2026-V1`.
5. Person sieht die alten Kurse / alten Inhalte / alte Prüfungsstruktur.

### Absolvent:innen

1. `Akademie-Zugang` bleibt bestehen, falls Zugriff auf Archiv oder Abschlussbereich gewünscht ist.
2. Natalie vergibt `Absolvent:in`.
3. Optional bleibt die Kohortenrolle erhalten.

### Mentor:innen

1. Natalie vergibt `Akademie-Zugang`.
2. Natalie vergibt `Mentor:in`.
3. Mentor:innen können perspektivisch erweiterte Einsicht oder Begleitfunktionen erhalten.
4. Wenn Mentor:innen beide Kohorten sehen sollen, können beide Kohortenrollen vergeben werden.

### Team

1. Natalie vergibt `Team`.
2. Team ist Admin-/Redaktions-/Betreuungsrolle.
3. Team kann unabhängig von Kohorte interne Vorschauen und spätere Adminfunktionen erhalten.

## Prioritätsregeln

Wenn normale Student:innen beide Kohortenrollen haben:

- Standardmäßig wird `Kohorte-2026-V2` angezeigt.

Wenn `Team` oder `Mentor:in` beide Kohortenrollen haben:

- Beide Kursversionen dürfen sichtbar sein.

Wenn eine Person `Akademie-Zugang`, aber keine Kohortenrolle hat:

- Die App zeigt:

  `Dein Akademie-Zugang ist aktiv, aber dir wurde noch keine Kohorte zugewiesen. Bitte melde dich im Discord-Server oder warte auf die Zuordnung.`

## Lernstand

Lernstand wird nicht in Discord gepflegt.

Supabase speichert automatisch:

- gelesene Lektüren
- angesehene Videos
- Quizversuche
- bestandene Prüfungen
- Modulfortschritt
- freigeschaltete nächste Module

Discord bleibt für Zugang, Kohorte, Status und Kommunikation zuständig.

## Kommunikation

Kommunikation findet ausschließlich über Discord statt.

Natalie ist dort erreichbar als:

`@natsnatalie`

Die Akademie-App zeigt diesen Kontakt im persönlichen Dashboard an, baut aber kein eigenes Nachrichtensystem.
