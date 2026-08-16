export type MasterRegisterItem = {
  WOK_ID: string;
  SDG_or_SDGplus: string;
  Target: string;
  Indikatorfamilie: string;
  Item: string;
  Definition: string;
  Einheit: string;
  Polarity: string;
  Rule_ID: string;
  Schwellen: string;
  Schwellenkategorie: string;
  Schwellenstatus: string;
  Grenzwertbasis: string;
  Benchmarkbedarf: string;
  Quelle_detail: string;
  Quellenfunktion: string;
  Quellenstatus: string;
  Source_IDs: string;
  NACE_Legacy: string;
  NACE_Version: string;
  "NACE_Rev2.1": string;
  NACE_Status: string;
  Systemgrenze: string;
  Berechnungslogik: string;
  Datenqualitätsanforderung: string;
  Assurance_Anforderung: string;
  Fachlogik_Status: string;
  Prüfpriorität: string;
  Prüfhinweis: string;
  Version: string;
  Gültig_ab: string;
  Gültig_bis: string;
};

export function polarityLabel(polarity: string): string {
  if (polarity === "higher_is_better") return "Ein höherer Messwert wird günstiger eingeordnet";
  if (polarity === "lower_is_better") return "Ein niedrigerer Messwert wird günstiger eingeordnet";
  return "Messrichtung fachlich prüfen";
}

export function validityLabel(item: MasterRegisterItem): string {
  if (item.Gültig_bis) return `Historisch - gültig bis ${item.Gültig_bis}`;
  return `Aktiv - gültig seit ${item.Gültig_ab || "nicht dokumentiert"}`;
}

export function isOpenRegisterStatus(item: MasterRegisterItem): boolean {
  return /offen|validier|fehlt|erforderlich|prüfung|parametrisierung|nicht abschließend|neu zu entwerfen/i.test(
    `${item.Schwellenstatus} ${item.Quellenstatus} ${item.Fachlogik_Status} ${item.Prüfhinweis}`
  );
}

