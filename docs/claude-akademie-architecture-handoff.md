# Claude-Hinweis: Akademie-App Architektur

Die ausführliche technische Übergabe für Claude liegt in der Akademie-App:

`/Users/hagen/Documents/New project/woek-akademie-app/docs/claude-architecture-handoff.md`

Warum dort? Die Akademie-App ist ein eigenes Git-Repo unter:

`/Users/hagen/Documents/New project/woek-akademie-app`

Die öffentliche Website bleibt dieses Repo:

`/Users/hagen/Documents/New project`

Claude soll vor Akademie-Arbeiten beide Stati prüfen:

```bash
cd "/Users/hagen/Documents/New project"
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
- bekannte Nicht-Integrationen wie Oracle/OCI

