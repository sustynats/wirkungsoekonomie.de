export type OfficialIdentifierRow = {
  key: string;
  label: string;
  value: string;
  sourceUrl?: string;
};

const primitiveLabels: Record<string, string> = {
  agenda_item_index: "Tagesordnungspunkt",
  bgbl: "Bundesgesetzblatt",
  cabinet_session_number: "Kabinettsitzung",
  coremedia_content_id: "Amtliche Inhaltskennung",
  dip_ids: "DIP-Vorgangskennung",
  dip_position_id: "DIP-Positionskennung",
  dip_procedure_id: "DIP-Vorgangskennung",
  document_number: "Dokumentnummer",
  drucksachen: "Drucksache",
  eli: "ELI-Kennung",
  without_debate: "Beschlussform",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function primitiveText(kind: string, value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (kind === "without_debate" && typeof value === "boolean") {
    return value ? "ohne Aussprache dokumentiert" : "mit Aussprache dokumentiert";
  }
  return null;
}

/**
 * Public rendering projection for untrusted source identifiers. Unknown object
 * shapes are intentionally suppressed instead of becoming React children or
 * cosmetically humanised technical data.
 */
export function publicOfficialIdentifierRows(input: unknown): OfficialIdentifierRow[] {
  if (!isRecord(input)) return [];

  const rows: OfficialIdentifierRow[] = [];
  for (const [kind, rawValues] of Object.entries(input)) {
    const values = Array.isArray(rawValues) ? rawValues : [rawValues];
    values.forEach((value, index) => {
      if (kind === "other" && isRecord(value)) {
        const keys = Object.keys(value).sort().join(",");
        if (
          keys === "dip_document_id,document_url" &&
          typeof value.dip_document_id === "string" && value.dip_document_id.trim() &&
          typeof value.document_url === "string" && value.document_url.trim()
        ) {
          rows.push({
            key: `${kind}-dip-document-${value.dip_document_id}-${index}`,
            label: "DIP-Dokumentkennung",
            value: value.dip_document_id.trim(),
            sourceUrl: value.document_url.trim(),
          });
        } else if (
          keys === "agenda_item,cabinet_session" &&
          typeof value.agenda_item === "number" && Number.isFinite(value.agenda_item) &&
          typeof value.cabinet_session === "number" && Number.isFinite(value.cabinet_session)
        ) {
          rows.push({
            key: `${kind}-cabinet-${value.cabinet_session}-${value.agenda_item}-${index}`,
            label: "Kabinettsbezug",
            value: `Sitzung ${value.cabinet_session}, Tagesordnungspunkt ${value.agenda_item}`,
          });
        }
        return;
      }

      const label = primitiveLabels[kind];
      const text = label ? primitiveText(kind, value) : null;
      if (!label || !text) return;

      rows.push({
        key: `${kind}-${index}-${text}`,
        label,
        value: text,
        sourceUrl: kind === "eli" && typeof value === "string" ? value : undefined,
      });
    });
  }
  return rows;
}

export function searchableOfficialIdentifierText(input: unknown) {
  return publicOfficialIdentifierRows(input).map((row) => `${row.label} ${row.value}`).join(" ");
}
