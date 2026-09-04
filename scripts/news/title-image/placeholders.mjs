// Neutrale Platzhaltermotive für Vorschauen des Editorial-Modus.
// Sie stehen stellvertretend für spätere, extern generierte Symbolbilder und
// enthalten bewusst weder Text noch Branding. Die Kompositionen sind abstrakt und
// systemisch (Netze, Ringe, Raster), damit nichts wie ein Nachrichtenfoto wirkt.

function mulberry(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTES = {
  infrastruktur: { ground: ["#0f2a3f", "#1c4a5a"], line: "#9fd3c7", node: "#f6e7c1", accent: "#c89b3c" },
  finanzen: { ground: ["#14213d", "#3a4a6b"], line: "#c7d2ea", node: "#ffffff", accent: "#c89b3c" },
  energie: { ground: ["#16403a", "#2f7d5c"], line: "#bfe8d3", node: "#f7f1e8", accent: "#ffd27b" },
  gesellschaft: { ground: ["#2b2a3d", "#5a4c6b"], line: "#e5d4f0", node: "#fff5e4", accent: "#c89b3c" },
};

export const PLACEHOLDER_VARIANTS = Object.keys(PALETTES);

export function renderPlaceholderMotif(variant = "infrastruktur", { width = 1200, height = 675, seed = 7 } = {}) {
  const palette = PALETTES[variant] || PALETTES.infrastruktur;
  const random = mulberry(seed);
  const parts = [];
  const nodes = [];
  const count = 18;
  for (let index = 0; index < count; index += 1) {
    nodes.push({
      x: width * (0.3 + random() * 0.66),
      y: height * (0.08 + random() * 0.8),
      r: 6 + random() * 16,
    });
  }
  for (let index = 0; index < nodes.length; index += 1) {
    for (let other = index + 1; other < nodes.length; other += 1) {
      const a = nodes[index];
      const b = nodes[other];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < width * 0.22) {
        parts.push(`<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${palette.line}" stroke-opacity="${(0.18 + 0.5 * (1 - distance / (width * 0.22))).toFixed(2)}" stroke-width="2"/>`);
      }
    }
  }
  for (let ring = 1; ring <= 4; ring += 1) {
    parts.push(`<circle cx="${(width * 0.68).toFixed(1)}" cy="${(height * 0.46).toFixed(1)}" r="${(height * 0.12 * ring).toFixed(1)}" fill="none" stroke="${palette.line}" stroke-opacity="${(0.22 - ring * 0.04).toFixed(2)}" stroke-width="1.5" stroke-dasharray="${ring % 2 ? "" : "6 10"}"/>`);
  }
  for (const node of nodes) {
    parts.push(`<circle cx="${node.x.toFixed(1)}" cy="${node.y.toFixed(1)}" r="${node.r.toFixed(1)}" fill="${palette.node}" fill-opacity="0.85"/>`);
    parts.push(`<circle cx="${node.x.toFixed(1)}" cy="${node.y.toFixed(1)}" r="${(node.r * 2.2).toFixed(1)}" fill="none" stroke="${palette.node}" stroke-opacity="0.18" stroke-width="1.5"/>`);
  }
  const accent = nodes[Math.floor(random() * nodes.length)];
  parts.push(`<circle cx="${accent.x.toFixed(1)}" cy="${accent.y.toFixed(1)}" r="${(accent.r * 1.4).toFixed(1)}" fill="${palette.accent}"/>`);
  const gridLines = [];
  for (let index = 0; index <= 12; index += 1) {
    const x = (width / 12) * index;
    gridLines.push(`<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${height}" stroke="${palette.line}" stroke-opacity="0.07" stroke-width="1"/>`);
  }
  for (let index = 0; index <= 7; index += 1) {
    const y = (height / 7) * index;
    gridLines.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${width}" y2="${y.toFixed(1)}" stroke="${palette.line}" stroke-opacity="0.07" stroke-width="1"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
<defs><linearGradient id="ph-ground" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${palette.ground[0]}"/><stop offset="1" stop-color="${palette.ground[1]}"/></linearGradient>
<radialGradient id="ph-glow" cx="0.7" cy="0.45" r="0.6"><stop offset="0" stop-color="${palette.line}" stop-opacity="0.25"/><stop offset="1" stop-color="${palette.line}" stop-opacity="0"/></radialGradient></defs>
<rect width="${width}" height="${height}" fill="url(#ph-ground)"/><rect width="${width}" height="${height}" fill="url(#ph-glow)"/>
${gridLines.join("")}${parts.join("")}
</svg>`;
}

export function placeholderDataUri(variant, options) {
  return `data:image/svg+xml;base64,${Buffer.from(renderPlaceholderMotif(variant, options), "utf8").toString("base64")}`;
}
