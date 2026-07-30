import fs from "node:fs";

const files = [
  "akademie/lernpfad.html",
  "blog/was-ist-nachhaltigkeit-wirklich.html",
  "index.html",
  "portale/sicherheit-resilienz/index.html",
  "portale/sicherheit-resilienz/globale-kooperation/index.html",
  "ueber.html",
];

let changed = 0;
for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;
  text = text
    .replaceAll("Nachhaltigkeit ist die langfristige Wirkungsresilienz", "Nachhaltigkeit ist die langfristig gesicherte Wirkungsresilienz")
    .replaceAll("Nachhaltigkeit als langfristige Wirkungsresilienz", "Nachhaltigkeit als langfristig gesicherte Wirkungsresilienz")
    .replaceAll("langfristige Wirkungsresilienz von Mensch, Planet und Demokratie", "langfristig gesicherte Wirkungsresilienz von Mensch, Planet und Demokratie")
    .replaceAll("langfristige Wirkungsresilienz des gekoppelten Systems", "langfristig gesicherte Wirkungsresilienz des gekoppelten Systems")
    .replaceAll("langfristige Wirkungsresilienz des gekoppelten MPD-Systems", "langfristig gesicherte Wirkungsresilienz des gekoppelten MPD-Systems")
    .replaceAll("langfristige Wirkungsresilienz eines klar benannten Systems", "langfristig gesicherte Wirkungsresilienz eines klar benannten Systems")
    .replaceAll("langfristige Wirkungsresilienz im MPD-Referenzrahmen", "langfristig gesicherte Wirkungsresilienz im MPD-Referenzrahmen")
    .replaceAll("Sondern als langfristige Wirkungsresilienz.", "Sondern als langfristig gesicherte Wirkungsresilienz.");
  if (text !== before) changed += 1;
  fs.writeFileSync(file, text);
}
console.log(`Resilienzmodell-v1.3-Webtexte geprüft, aktualisiert: ${changed}`);
