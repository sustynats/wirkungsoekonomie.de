# Design-Tokens – Wirkungsportal Parlament

**Version:** 1.0.0  
**Stand:** 15. August 2026  
**Verbindliche Laufzeitdatei:** [`app/tokens.css`](../../../app/tokens.css)

Diese Token sind die zentrale Designquelle des Portals. Sie legen Farben,
Typografie, Abstände, Radien, Inhaltsbreiten, Raster und Anforderungen an
Tippziele fest. Neue Komponenten verwenden die Token direkt. Ältere
Komponenten verwenden bis zu ihrer Umstellung ausschließlich die in
`app/globals.css` dokumentierten Kompatibilitätsaliase, die ihrerseits nur auf
die Token verweisen.

## Verbindliche Regeln

- Source Serif 4 und Source Sans 3 werden lokal ausgeliefert; es gibt keinen
  Abruf von Webfonts bei Dritten.
- H1 endet bei 48 CSS-Pixeln; sehr lange amtliche Titel tragen die Klasse
  `ist-langtitel` und nutzen die dafür vorgesehene kleinere Stufe.
- Text bleibt im Lesekorridor von 45 bis 75 Zeichen je Zeile.
- Inhaltskacheln haben höchstens drei Spalten und mindestens 300 CSS-Pixel
  Breite.
- Farbe ist nie der einzige Bedeutungsträger. Ein Status hat immer ein
  lesbares Textlabel.
- Eigenständige Bedienelemente haben mindestens 44 × 44 CSS-Pixel und einen
  sichtbaren Fokus.
- Der Token-Import steht vor allen anderen Styles in `app/globals.css`.

`tokens.json` ist die maschinenlesbare Fassung derselben Werte. Änderungen an
den Tokens sind portalweit wirksam: Ergänzungen erhöhen die Minor-Version,
eine Bedeutungsänderung bestehender Werte die Major-Version.

## Migration und Abnahme

Die vorhandenen Seiten werden in kontrollierten Abschnitten von alten
Komponentenwerten auf direkte Token-Verwendung umgestellt. Vor einem
Produktions-Release gelten zusätzlich die visuellen und zugänglichen
Abnahmepunkte in [`../RELEASE_QA_CHECKLIST.md`](../RELEASE_QA_CHECKLIST.md).
