import fs from "node:fs";

const file = "blog/systemresilienz-statt-nachhaltigkeit/index.html";
let html = fs.readFileSync(file, "utf8");

const replacements = [
  ["Nachhaltigkeit als langfristige Wirkungsresilienz mit Stabilitätslandschaft, Rückstellung, Dämpfung, Anpassung und Transformation.", "Nachhaltigkeit als langfristig gesicherte Wirkungsresilienz mit Stabilitätslandschaft, Rückstellung, Dämpfung, Anpassung und Transformation."],
  ["Nachhaltigkeit als langfristige Wirkungsresilienz: Stabilitätslandschaft, Rückstellung, Dämpfung, Anpassung und Transformation im MPD-Referenzrahmen.", "Nachhaltigkeit als langfristig gesicherte Wirkungsresilienz: Stabilitätslandschaft, Rückstellung, Dämpfung, Anpassung und Transformation im MPD-Referenzrahmen."],
  ["Nachhaltigkeit wird als langfristige Wirkungsresilienz des gekoppelten Systems Mensch-Planet-Demokratie präzise und steuerbar.", "Nachhaltigkeit wird als langfristig gesicherte Wirkungsresilienz des gekoppelten Systems Mensch-Planet-Demokratie präzise und steuerbar."],
  ["Nachhaltigkeit ist die langfristige Wirkungsresilienz des gekoppelten Systems Mensch-Planet-Demokratie.", "Nachhaltigkeit ist die langfristig gesicherte Wirkungsresilienz des gekoppelten Systems Mensch-Planet-Demokratie."],
  ["Nachhaltigkeit ist die langfristige Wirkungsresilienz des gekoppelten Systems Mensch–Planet–Demokratie.", "Nachhaltigkeit ist die langfristig gesicherte Wirkungsresilienz des gekoppelten Systems Mensch–Planet–Demokratie."],
  ["<h2>Schluss: Nachhaltigkeit als langfristige Wirkungsresilienz</h2>", "<h2>Schluss: Nachhaltigkeit als langfristig gesicherte Wirkungsresilienz</h2>"],
];
for (const [from, to] of replacements) html = html.replaceAll(from, to);

const oldOpening = `<p><strong>Nachhaltigkeit ist Systemresilienz.</strong> Genauer: Nachhaltigkeit ist die langfristig gesicherte Wirkungsresilienz des gekoppelten Systems Mensch-Planet-Demokratie. Sie verbindet die Resilienz eines tragfähigen Zustandsraums mit Anpassungs-, Lern- und Transformationsfähigkeit.</p>`;
const newOpening = `<p><strong>Nachhaltigkeit ist Systemresilienz.</strong> Präziser: Nachhaltigkeit ist die langfristig gesicherte Wirkungsresilienz des gekoppelten Systems Mensch-Planet-Demokratie. Resilienz beschreibt zunächst die Fähigkeit eines Systems; Systemresilienz diese Fähigkeit für eine benannte Systemgrenze; Wirkungsresilienz bindet sie normativ an Mensch, Planet und Demokratie. Nachhaltigkeit sichert diese Fähigkeit über Zeit innerhalb tragfähiger und nicht beliebig kompensierbarer Grenzen.</p>`;
if (!html.includes(oldOpening) && !html.includes(newOpening)) throw new Error("Journal-Einstieg der Resilienzsystematik nicht gefunden.");
html = html.replace(oldOpening, newOpening);

html = html.replaceAll("Dämpfungsfähigkeit</td><td>Reibung beziehungsweise Dissipation, durch die Schwingungen abklingen", "Dämpfungsfähigkeit</td><td>Puffer und Trägheit begrenzen Schwingungen und Überschwingen");

const marker = "          <h2>Die wirkungsökonomische Herleitung: Warum Nachhaltigkeit Systemresilienz ist</h2>";
const section = `          <section class="article-systematics" aria-labelledby="resilienzmodell-v13">
            <h2 id="resilienzmodell-v13">Resilienzmodell v1.3: Fähigkeit, Richtung und langfristige Sicherung</h2>
            <p><strong>Resilienz</strong> ist die Fähigkeit eines Systems, Störungen aufzunehmen, auf sie zu reagieren oder sich neu zu organisieren, dabei wesentliche Funktionen, Identität und Struktur zu erhalten oder wiederherzustellen und zugleich die Fähigkeit zu Anpassung, Lernen und Transformation zu bewahren. Sie ist zunächst beschreibend: Auch ein unerwünschter Systemzustand kann resilient sein.</p>
            <p><strong>Systemresilienz</strong> macht deshalb die Systemgrenze explizit. <strong>Wirkungsresilienz</strong> ist die lernfähige, normativ an Mensch, Planet und Demokratie gebundene Systemresilienz. Sie erkennt negative Wirkungen und Störungen früh, schützt oder stellt Funktionen wieder her, baut Puffer und Regeneration auf und verlässt schädliche Attraktoren ohne Externalisierung. <strong>Nachhaltigkeit</strong> ist die langfristig gesicherte Wirkungsresilienz dieses gekoppelten Systems.</p>
            <div class="table-wrap"><table class="data-table"><thead><tr><th scope="col">Bereich</th><th scope="col">Analysebausteine</th><th scope="col">Frage</th></tr></thead><tbody><tr><td>Stabilitätslandschaft</td><td>Latitude, Resistance, Precariousness, Panarchy</td><td>Wie groß, widerständig, schwellennahe und skalenabhängig ist der Zustandsraum?</td></tr><tr><td>Dynamische Antwort</td><td>Rückstellfähigkeit, Dämpfungsfähigkeit</td><td>Wohin bewegt sich das System nach der Störung, und wie begrenzt es Überschwingen und Kaskaden?</td></tr><tr><td>Systementwicklung</td><td>Anpassungsfähigkeit, Transformationsfähigkeit</td><td>Wie verringert das System Verwundbarkeit oder baut einen neuen tragfähigen Attraktor auf?</td></tr></tbody></table></div>
            <p>Diese <strong>acht Analysebausteine von Resilienz und Systementwicklung</strong> sind keine additive Rechenformel. Nur Latitude, Resistance, Precariousness und Panarchy sind die vier analytischen Aspekte der Stabilitätslandschaft bei Walker et al. (2004). Adaptability und Transformability sind dort verwandte, eigenständige Fähigkeiten; Rückstellung und Dämpfung erklären die dynamische Antwort. Eine hohe Resistance kann auch einen fossilen Lock-in oder autoritären Machtapparat stabilisieren.</p>
            <h3>Klima, Rückkopplung und der MPD-Zustandsraum</h3>
            <p>Ein vereinfachtes Klimamodell lautet <code>C d(Delta T)/dt = Delta F - lambda Delta T</code>. <code>C</code> steht für Wärmekapazität und thermische Trägheit, <code>Delta F</code> für zusätzlichen Strahlungsantrieb und <code>lambda Delta T</code> für stabilisierende radiative Rückkopplung. Ozeane wirken dabei als Wärmespeicher und Puffer: Sie verzögern Temperaturreaktionen, sind aber nicht wörtlich mechanische Reibung. Bleibt der Antrieb erhöht, verschiebt sich der Gleichgewichtszustand.</p>
            <p>Für die Wirkungsökonomie gilt zugleich der nicht beliebig kompensierbare MPD-Raum: <code>B_MPD = {x : M &gt;= M_min, P &gt;= P_min, D &gt;= D_min}</code>. Eine gute Bilanz in einer Dimension kann den Bruch einer anderen nicht ausgleichen. Die vollständige Herleitung mit Kugel-Becken-Modell, Klimaformeln und Quellen steht in der Bibliothek: <a href="../../bibliothek/nachhaltigkeit-als-systemresilienz-definition-und-klimamodell/">Nachhaltigkeit als Systemresilienz</a>.</p>
          </section>
`;
if (!html.includes(marker) && !html.includes('id="resilienzmodell-v13"')) throw new Error("Einfügemarke für das Journal-Delta fehlt.");
if (!html.includes('id="resilienzmodell-v13"')) html = html.replace(marker, `${section}${marker}`);

fs.writeFileSync(file, html);
console.log("Journalartikel auf Resilienzmodell v1.3 aktualisiert.");
