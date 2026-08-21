import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = (file: string) => readFileSync(file, "utf8");
const explainer = source("app/components/GovernmentActionScopeExplainer.tsx");
const canonical = source("app/components/CanonicalMethodExplainer.tsx");
const portalRoute = source("app/[section]/page.tsx");
const governmentRoute = source("app/regierung/methodik/page.tsx");

test("WOEK_SCOPE_MATERIALITY_NOT_LEGAL_FORM", () => {
  assert.match(explainer, /Wirkungsrelevanz statt Rechtsform/);
  assert.match(explainer, /materiell bedeutenden Zustand verändern kann/);
});

test("NON_LEGISLATIVE_GOVERNMENT_ACTIONS_SUPPORTED", () => {
  for (const token of ["Strategien", "Programme", "Förderungen", "Garantien", "Investitionen", "Beschaffung", "Verwaltungsentscheidungen"]) {
    assert.match(explainer, new RegExp(token));
  }
});

test("STATE_ASSESSMENT_FRAMEWORK_OBJECT_SPECIFIC", () => {
  assert.match(explainer, /unterschiedliche, objektspezifische Verfahren/);
  assert.match(explainer, /welches Verfahren, Fachrecht, Haushaltsrecht/);
});

test("GGO_43_44_FULL_SCOPE_ACKNOWLEDGED", () => {
  for (const token of ["Ziel und Notwendigkeit", "Erkenntnisquellen", "andere Lösungsmöglichkeiten", "Ablehnungsgründe", "beabsichtigte Wirkungen", "unbeabsichtigte Nebenwirkungen", "späteren Überprüfung"]) {
    assert.match(explainer, new RegExp(token));
  }
});

test("NO_ENAP_REQUIREMENT_INVENTED_OUTSIDE_SCOPE", () => {
  assert.match(explainer, /keine allgemeine eNAP-Pflicht/);
  assert.match(explainer, /weder auf andere\s+Handlungsformen noch auf Länder oder die EU übertragen/);
});

test("BHO_VVBHO_FRAMEWORK_ACKNOWLEDGED_FOR_FINANCIALLY_EFFECTIVE_MEASURES", () => {
  assert.match(explainer, /alle finanzwirksamen Maßnahmen/);
  assert.match(explainer, /§ 7 Absatz 2 BHO/);
  assert.match(explainer, /Wirtschaftlichkeitsuntersuchungen/);
  assert.match(explainer, /Zielerreichungs-, Wirkungs- und Wirtschaftlichkeitskontrolle/);
  assert.match(explainer, /beabsichtigten und unbeabsichtigten Wirkungen/);
});

test("APPLICABLE_STATE_ASSESSMENT_IDENTIFIED_BY_OBJECT_TYPE", () => {
  for (const token of ["§ 62", "§ 13 KSG", "§ 8 KAnG", "VV-BHO"]) assert.match(explainer, new RegExp(token));
});

test("WOEK_SCOPE_MATERIALITY_NOT_STATE_PROCEDURE_ABSENCE", () => {
  assert.match(explainer, /WÖk ersetzt diese Verfahren nicht/);
  assert.match(explainer, /einheitliche, materialitätsgetriebene Verbindung/);
  assert.doesNotMatch(explainer, /außerhalb (?:der )?Rechtsetzung[^.]{0,100}(?:keine|ohne) (?:Prüfung|Folgenabschätzung)/i);
});

test("PUBLIC_OWNERSHIP_ACTION_SEPARATE_FROM_GOVERNMENT_ATTRIBUTION", () => {
  assert.match(explainer, /Staatliches Eigentum allein/);
  assert.match(explainer, /Attribution und Verantwortung bleiben offen/);
});

test("PORTAL_METHOD_SOURCE_VS_VIEW", () => {
  assert.match(canonical, /<GovernmentActionScopeExplainer compact=\{context === "portal"\} \/>/);
  assert.match(portalRoute, /<CanonicalMethodExplainer \/>/);
  assert.match(governmentRoute, /<CanonicalMethodExplainer context="government" \/>/);
});

test("OFFICIAL_SOURCES_USE_INTERMEDIARY_ARCHIVE_PAGES", () => {
  for (const code of ["9029", "9032", "9034", "9046", "9047", "9048", "9049"]) {
    assert.match(explainer, new RegExp(`wirkungsoekonomie\\.de/quellenarchiv/wok-q-${code}/`));
  }
  assert.doesNotMatch(explainer, /href: "https:\/\/(?:www\.)?(?:gesetze-im-internet|verwaltungsvorschriften-im-internet)/);
});
