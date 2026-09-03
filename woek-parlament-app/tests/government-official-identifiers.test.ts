import assert from "node:assert/strict";
import test from "node:test";
import { publicOfficialIdentifierRows, searchableOfficialIdentifierText } from "../lib/government/official-identifiers";

test("renders supported DIP document identifier objects without exposing raw objects", () => {
  const rows = publicOfficialIdentifierRows({
    other: [{ dip_document_id: "269182", document_url: "https://dserver.bundestag.de/example.pdf" }],
  });
  assert.deepEqual(rows, [{
    key: "other-dip-document-269182-0",
    label: "DIP-Dokumentkennung",
    value: "269182",
    sourceUrl: "https://dserver.bundestag.de/example.pdf",
  }]);
});

test("renders supported cabinet session objects with reviewed labels", () => {
  const rows = publicOfficialIdentifierRows({ other: [{ agenda_item: 5, cabinet_session: 4 }] });
  assert.deepEqual(rows, [{
    key: "other-cabinet-4-5-0",
    label: "Kabinettsbezug",
    value: "Sitzung 4, Tagesordnungspunkt 5",
  }]);
});

test("unknown identifier objects fail closed and never become object strings", () => {
  const rows = publicOfficialIdentifierRows({ other: [{ unknown: "value" }], dip_ids: ["325252"] });
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.value, "325252");
  assert.doesNotMatch(searchableOfficialIdentifierText({ other: [{ unknown: "value" }] }), /object Object|unknown|value/);
});
