// Die echten Masse einer ausgelieferten Bilddatei, aus dem Dateikopf gelesen.
//
// Die Sendungslogos wurden pauschal als 800x800 ausgezeichnet, tatsaechlich sind
// vier von sechs im Verhaeltnis 16:9 oder 1,63:1 (16.09.2026). Der Browser
// reserviert dann ein Quadrat und ruckt beim Laden zurecht. Massangaben kommen
// deshalb aus der Datei, nicht aus der Annahme.
import fs from 'node:fs';
export function assetSize(file) {
  // file darf ein Pfad oder eine URL sein: die Endung wird an der Zeichenkette
  // geprueft, nicht am Objekt.
  const name = String(file?.pathname || file || '');
  const d = fs.readFileSync(file);
  if (name.endsWith('.png')) return { width: d.readUInt32BE(16), height: d.readUInt32BE(20) };
  if (name.endsWith('.svg') || name.endsWith('.webp')) return null;
  let i = 2;
  while (i < d.length) {
    if (d[i] !== 0xFF) { i += 1; continue; }
    const m = d[i + 1];
    if (m === 0xC0 || m === 0xC1 || m === 0xC2) return { height: d.readUInt16BE(i + 5), width: d.readUInt16BE(i + 7) };
    if (m === 0xD8 || m === 0xD9 || (m >= 0xD0 && m <= 0xD7)) { i += 2; continue; }
    i += 2 + d.readUInt16BE(i + 2);
  }
  return null;
}
