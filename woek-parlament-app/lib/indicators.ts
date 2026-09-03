import "server-only";
import registry from "@/data/indicators/dns-official-registry.json";

export type DnsIndicator = (typeof registry.records)[number];
export function listDnsIndicators() { return registry.records as DnsIndicator[]; }
export function getDnsIndicator(id: string) { return listDnsIndicators().find((item) => item.indicator_id === id) ?? null; }
export const dnsRegistryMeta = { recordCount: registry.record_count, commit: registry.official_repository_commit, generatedAt: registry.generated_at };
