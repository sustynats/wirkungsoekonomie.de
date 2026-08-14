# AI Cache and Dependency Rules

The cache key combines task type, normalized bounded input, relevant source hashes, WÖk reference snapshot, prompt-template version and model version.  A case may reuse a result only when the changed document chunks are not dependencies of that task.  Metadata or UI changes therefore create zero new model calls.

`document_chunk_diffs` records `UNCHANGED`, `ADDED`, `REMOVED` and `MODIFIED` chunks.  Later dependency edges connect chunks to claims, impact paths and recommendation reasons, so recomputation can remain local.

