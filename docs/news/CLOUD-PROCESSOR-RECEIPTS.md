# Cloud processor receipts

The news transport and importer run on GitHub Actions and the existing server.
Native ChatGPT scheduled workers supply editorial decisions. No local browser,
Mac directory or Codex heartbeat is part of the recurring transport.

## Activation evidence

A completed manual test does not establish scheduled-worker capability. Check
the actual automation run time and its own newly created probe. Use
`preflight-auto-<automation_id>-<32 lowercase hex random bytes>` as the probe ID.
Generate the random suffix inside the scheduled run, after its scheduled start.
The probe remains the minimal object `{probe_id, test_only: true}`. Never reuse a
probe from the conversation's manual run.

An automation ID in a report is an attestation, not cryptographic proof of the
scheduler's identity. The GitHub actor permission check establishes who may
submit transport data. Independently verify the actual scheduled execution
before enabling a productive schedule; a transport receipt alone is insufficient.

## Private health reports

After its own five folder reads, successful probe delivery, and exact Dropbox
readback, the worker encrypts a second object using the existing v2 encoder:

```json
{
  "report_type": "processor_preflight",
  "run_id": "auto-<automation_id>-<same32hexNonce>",
  "context": {
    "actor": "chatgpt",
    "kind": "automation",
    "context_id": "<actual native chat id>",
    "automation_id": "<32 lowercase hex id>",
    "shard": 0
  },
  "scheduled_for": "<actual scheduled UTC time>",
  "checked_at": "<own successful readback UTC time>",
  "reads": {
    "98_CONFIG": true,
    "00_INBOX": true,
    "10_CLAIMED": true,
    "20_OUTPUT_READY": true,
    "30_ACK": true
  },
  "probe_sha256": "<SHA256 of original serialized probe bytes>",
  "readback_sha256": "<SHA256 of own Dropbox readback bytes>"
}
```

The envelope job is `processor-<run_id>`, the destination filename is
`<job>.processor.json`. Encryption and repository write permission are mandatory.
Do not send this object as plaintext. Do not retype or abbreviate ciphertext.
Roundtrip the actual GitHub issue body against the generated envelope.

The receiver validates context/run binding, all reads, bounded timestamps, both
digests and the actual immutable Dropbox probe. It derives exactly one target:
`95_LOGS/processor-preflight-<run_id>.json`. No arbitrary log path or caller-set
PASS status is accepted. Atomic add and exact readback apply to logs as well.
Identical retries do not rewrite; conflicting bytes fail closed.

The receipt is compatible with the existing `updateProcessorHealth()` reader.
Queue sizes and throughput remain measured by the importer, not reported by the
LLM. This receipt does not claim that any editorial job has completed or that a
publication has passed its independent quality gate.

## Failures and recovery

No report may repair a missing or failed worker preflight. A failed report means
the permanent health monitor cannot yet attest that worker. Repair the transport
and rerun the worker's preflight; do not manufacture a server-only PASS.

For a failed editorial issue, resume the existing owned claim and existing
complete native output. Re-encrypt it faithfully and confirm the resulting
delivery. Never discard a claim, regenerate facts for convenience, overwrite an
output, count a rejected candidate as a published story, or bypass final author
approval for personal contributions.

Validation: Python transport/crypto/security tests and existing news/processor
tests. Production activation additionally requires an actual scheduled run with
its own probe, private health receipt and independently observed scheduler time.

## Import lane recovery (11 September 2026)

The lane lock and queue journal use different SQLite connections. A journal
write failure after lane acquisition (or while recording completion) previously
left the lane transaction open. Subsequent imports could only return
`BRIDGE_RUN_LOCKED`. Acquisition failures now roll back lane ownership, and
release always rolls back even if slot bookkeeping fails. Remote-owner
bookkeeping failures also release the newly acquired lane. Active owners and
completed slots remain protected; there is no timeout takeover.

Four regression tests exercise real SQLite write contention, release failure,
repeated acquisition by an active owner, and completed-slot protection. The
private authenticated monitor exposes lane ownership for operational diagnosis.
Deploy the tested store to both existing Oracle services after backing up the
queue and service code; restart only those services to release a pre-existing
orphaned in-memory transaction. No queue reset or lock-file deletion is required.
