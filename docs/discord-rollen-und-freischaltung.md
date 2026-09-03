# Discord-Rollen und Freischaltung der WÖk-Akademie-App

Stand: 19. Mai 2026

> Überholt / Übergang: Diese Rollenlogik darf nicht als Zielbild verwendet werden. Zielstand ab Juli 2026: Zugang kann über Community-Beitritt oder LinkedIn-Freischaltung entstehen; Lernfortschritt, Prüfungen, Zertifikate und Kohortenlogik gehören ausschließlich in die Akademie-Plattform. Bestehende Studierende müssen ihren aktuellen Lernraum behalten. Alte Discord-Akademie-Rollen erst entfernen, wenn `user_access`, Kohorte, Plattformrollen und Legacy-Fortschritt in Supabase fixiert sind. Aktuelle Zielstruktur: `docs/discord-community-neustart.md`.

## Grundsatz

Discord steuert Zugang, Kohorte und Stufe.

Supabase steuert Lernstand, Vorlesungen, Prüfungsanfragen, Prüfungsfreigaben, Prüfungsversuche und Zertifikate.

Es werden keine Discord-Rollen für einzelne Vorlesungen, einzelne Prüfungen oder einzelne Module angelegt.

## Bestehende Rollen

Auf dem Discord-Server existieren:

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
- Akademie-Leitung
- @everyone

## Neu anzulegende Rollen

Zusätzlich werden benötigt:

- Akademie-Stufe-1
- Akademie-Stufe-2
- Akademie-Stufe-3
- Akademie-Stufe-4

Diese Rollen geben nur die grundsätzlich sichtbare Akademie-Stufe frei.

## Relevante Rollen für die App

- Akademie-Zugang
- Kohorte-2026-V1
- Kohorte-2026-V2
- Student:in
- Absolvent:in
- Mentor:in
- Team
- Akademie-Leitung
- Akademie-Stufe-1
- Akademie-Stufe-2
- Akademie-Stufe-3
- Akademie-Stufe-4

## Ignorierte Rollen

Diese Rollen sind Community-/Discord-Level-Rollen und dürfen nicht für Akademie-Zugang, Kurse, Inhalte, Prüfungen oder Zertifikate verwendet werden:

- Rookie
- Standard
- Level2

## Zugang

Ohne `Akademie-Zugang` gibt es keinen Zugriff auf den Studienraum.

`Akademie-Leitung` ist die höchste Berechtigungsstufe. Sie darf alle Kohorten, Stufen, Inhalte, Studierende, Lernstände, Prüfungsanfragen und Zertifikate sehen und verwalten.

`Team` ist nicht automatisch Akademie-Leitung. Team kann interne Vorschau, Technik oder Redaktion erhalten, aber keine Prüfungen freigeben und keine Zertifikate ausstellen, sofern das später nicht ausdrücklich erweitert wird.

## Kohorten

- `Kohorte-2026-V1` = alte Kursstruktur, alte Inhalte, alte Prüfungslogik
- `Kohorte-2026-V2` = neue Akademie-Struktur, neue Inhalte, neuer Studienpfad

Wenn normale Student:innen beide Kohortenrollen haben, zeigt die App standardmäßig V2.

Akademie-Leitung sieht alle Kohorten unabhängig von eigenen Kohortenrollen.

## Stufenfreischaltung

Die höchste vorhandene Stufenrolle entscheidet:

- `Akademie-Stufe-1` = Stufe 1 sichtbar
- `Akademie-Stufe-2` = Stufe 1 und 2 sichtbar
- `Akademie-Stufe-3` = Stufe 1, 2 und 3 sichtbar
- `Akademie-Stufe-4` = Stufe 1, 2, 3 und 4 sichtbar

Zusätzlich kann `user_access.highest_stage_unlocked` in Supabase als Leitungs-Override genutzt werden.

## Kursanzeige aus Kohorte und Stufe

Die App berechnet die Kursanzeige immer aus zwei Informationen:

1. `cohort_key` bestimmt die Kursversion.
2. `highest_stage_unlocked` bestimmt die freigeschaltete Stufe.

Beispiele:

- User mit `Kohorte-2026-V1` und `Akademie-Stufe-3` sieht alte Stufe 1, alte Stufe 2 und alte Stufe 3.
- User mit `Kohorte-2026-V2` und `Akademie-Stufe-3` sieht neue Stufe 1, neue Stufe 2 und neue Stufe 3.

Die Stufennummern sind gleich. Die Inhalte kommen aus der jeweiligen Kursversion der Kohorte.

## Beispiel: neue Studierende

Neue Studierende erhalten:

1. Akademie-Zugang
2. Student:in
3. Kohorte-2026-V2
4. Akademie-Stufe-1

Damit sehen sie die neue Kursstruktur und beginnen in Stufe 1.

## Beispiel: alte Studierende

Alte Studierende, die die ersten beiden alten Kurse bereits durchlaufen haben, erhalten:

1. Akademie-Zugang
2. Student:in
3. Kohorte-2026-V1
4. Akademie-Stufe-3

Damit bleiben sie in der alten Kurslogik und erhalten Zugriff auf die für sie passende Stufe.

## Warum Vorlesungen nicht über Discord-Rollen laufen

Vorlesungen werden innerhalb einer Stufe nacheinander freigeschaltet:

- Vorlesung 1 ist sichtbar, wenn die Stufe freigeschaltet ist.
- Vorlesung 2 wird sichtbar, wenn Vorlesung 1 abgeschlossen ist.
- Vorlesung 3 wird sichtbar, wenn Vorlesung 2 abgeschlossen ist.
- Vorlesung 4 wird sichtbar, wenn Vorlesung 3 abgeschlossen ist.

Diese Logik gehört in Supabase, weil sie personenbezogen ist und vom Lernstand abhängt.

## Warum Prüfungen nicht über Discord-Rollen freigegeben werden

Prüfungen werden erst nach einer Prüfungsanfrage und manueller Freigabe durch Akademie-Leitung sichtbar.

Workflow:

1. Student:in schließt alle vier Vorlesungen einer Stufe ab.
2. Student:in klickt `Zur Prüfung anmelden`.
3. App speichert eine Prüfungsanfrage in Supabase.
4. Akademie-Leitung prüft den Lernstand.
5. Akademie-Leitung klickt `Prüfung freigeben`.
6. Erst danach sieht Student:in die Prüfungsfragen.

Die Prüfungsfreigabe bleibt in Supabase. Discord-Rollen können später optional spiegeln, aber nicht im MVP.

## Environment Variables

Für die Rollenprüfung müssen Rollen-IDs in Vercel hinterlegt werden:

- `DISCORD_ROLE_AKADEMIE_ZUGANG_ID`
- `DISCORD_ROLE_KOHORTE_2026_V1_ID`
- `DISCORD_ROLE_KOHORTE_2026_V2_ID`
- `DISCORD_ROLE_STUDENT_ID`
- `DISCORD_ROLE_ABSOLVENT_ID`
- `DISCORD_ROLE_MENTOR_ID`
- `DISCORD_ROLE_TEAM_ID`
- `DISCORD_ROLE_AKADEMIE_LEITUNG_ID`
- `DISCORD_ROLE_AKADEMIE_STUFE_1_ID`
- `DISCORD_ROLE_AKADEMIE_STUFE_2_ID`
- `DISCORD_ROLE_AKADEMIE_STUFE_3_ID`
- `DISCORD_ROLE_AKADEMIE_STUFE_4_ID`

Rollennamen dürfen nur als lesbare Labels gespeichert werden. Die Prüfung muss über Rollen-IDs laufen.

## Zugriffsmeldungen

Ohne Akademie-Zugang:

`Dein Zugang zur WÖk-Akademie ist noch nicht freigeschaltet. Bitte melde dich im Discord-Server oder warte auf die Freischaltung.`

Ohne Kohorte:

`Dein Akademie-Zugang ist aktiv, aber dir wurde noch keine Kohorte zugewiesen. Bitte melde dich im Discord-Server oder warte auf die Zuordnung.`

Ohne Stufenrolle:

`Deine Akademie-Stufe wurde noch nicht freigeschaltet. Bitte warte auf die Freischaltung durch die Akademie-Leitung.`

Prüfung noch nicht freigegeben:

`Deine Prüfungsanmeldung wurde übermittelt. Die Akademie-Leitung prüft deinen Lernstand und schaltet die Prüfung anschließend frei.`
