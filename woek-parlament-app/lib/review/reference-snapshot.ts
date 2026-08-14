import snapshot from "@/data/woek-reference-snapshot.json";
import { sha256 } from "@/lib/review/privacy";

export function currentReferenceSnapshot() {
  return { ...snapshot, snapshot_hash: sha256(snapshot) };
}

export function publicationIsBlockedByReferenceSnapshot() {
  return snapshot.status !== "READY";
}
