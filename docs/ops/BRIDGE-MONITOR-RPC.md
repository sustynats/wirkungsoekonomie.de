# Private server-side monitoring

Routine discovery, import and ACK finalization call `provider.monitor(now)`. The
previous implementation sent each SQLite lookup/observation through a separate
GitHub-to-Oracle request. A queue with hundreds of claims and outputs therefore
required hundreds of serial WAN round trips while holding the shared lane.

`bridge.monitorRun` now executes the same `runBridgeMonitor` function on Oracle.
The private POST body is:

```json
{"op":"bridge.monitorRun","args":["2026-09-14T19:00:00Z",{"maxPending":48}]}
```

The existing bearer token, `X-Bridge-Owner`, `X-Bridge-Lane`, active ownership,
process lock and lane busy checks all apply before this operation. Only the
existing monitor report is returned; source packets and job bodies remain
private. The observation timestamps, output generation history, review holds,
processor proof validation and Dropbox log writes are unchanged. The operation
cannot claim, ACK, release, approve or generate an article.

The existing read-only `bridge.monitor` status endpoint is unchanged. The new
operation writes observations and logs and is deliberately excluded from remote
read retries. A timeout or malformed response is a real error, not permission to
replay. Only an explicit unsupported-operation response from an older server
falls back to the former client-side pass.

`BridgeStore.monitorJobs()` projects one SQLite row at a time into the fields
read by monitoring and processor health, preserving nested original-input
lineage. The full queue is never materialized in server memory. If those decision
functions gain new job fields, extend the internal projection and parity tests.
Individual Dropbox operations retain their existing bounds; provider access is
not added and workflow concurrency is unchanged.

## Separate reviewed rollout

Deploy this as one complete, commit-bound bridge release, including
`server-handler.mjs`, `monitor.mjs`, `monitor-projection.mjs` and the existing
import dependencies. The server entry point remains `scripts/news/bridge/server.mjs`.
After backing up the existing runtime and private SQLite database, wait until
both remote lanes are idle and no operation is active before restarting
`woek-news-bridge.service`. Do not interrupt an active owner or rewind its journal.
No database migration, new credentials, provider calls or budget change is needed.
The GitHub runtime must also contain the updated provider/remote/runtime modules
to use the new call. Either server-first or client-first is compatible; client
first retains the slow fallback until the server is upgraded. A runtime rollback
retains all observations and restores the old behavior. Do not activate this
through a synthetic production monitoring call while a workflow owns the lane.

Offline coverage compares old remote execution with one HTTP RPC against real
local SQLite: reports, observations and Dropbox logs must match exactly, job
bytes must stay unchanged, and authorization/ownership/busy failures must do no
monitoring work. A 48 MiB subprocess also exercises repeated monitoring of a
queue larger than 75 MiB without loading all job bodies together.
