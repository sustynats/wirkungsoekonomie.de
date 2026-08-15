# Claude-Hinweis: Akademie-App Architektur

Die ausführliche technische Übergabe für Claude liegt in der Akademie-App:

`<Projekt-Root>/woek-akademie-app/docs/claude-architecture-handoff.md`

Warum dort? Die Akademie-App ist ein eigenes Git-Repo unter:

`<Projekt-Root>/woek-akademie-app`

Die öffentliche Website bleibt dieses Repo:

`<Projekt-Root>`

Claude soll vor Akademie-Arbeiten beide Stati prüfen:

```bash
cd "<Projekt-Root>"
git status --short
git -C woek-akademie-app status --short
```

Die Doku beschreibt:

- Website- und App-Repository-Struktur
- Vercel, Supabase, Discord, IONOS, GitHub Pages, GitHub Release Assets
- WÖk-KI Beta und LLM-Anbieter
- aktuelle private Zertifikatsstrecke auf der Website
- künftige Zertifikatslogik der App
- Datenbankmigrationen
- Auth-, Rollen-, Curriculum-, Prüfungs- und Analytics-Flüsse
- Oracle/OCI als externer Bot-/Feedback-/Analytics-Dienst sowie nicht vorhandene weitere Integrationen

Ergänzende Übergabe für das geplante Institut:

`<Projekt-Root>/docs/claude-institut-architecture-handoff.md`
