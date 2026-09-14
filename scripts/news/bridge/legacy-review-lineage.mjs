// A private compatibility index, separate from immutable paid response journals.
// Exact bridge identities only: no timestamp, article title or content similarity.
export function legacyReviewLineage(records, getInput) {
  const bindings = {}, unresolved = [];
  const id = /^wt_\d{8}T\d{6}Z_[a-f0-9]{24}$/;
  for (const record of records) {
    if (record.kind !== 'review' || !record.provider_called || record.pre_execution_rejected || record.parent_job_id) continue;
    const input = getInput(record.job_id);
    if (input?.job_type !== 'impact_semantic_review' || input.job_id !== record.job_id || input.input_hash !== record.input_hash
      || !id.test(input.parent_job_id || '') || input.parent_job_id === input.job_id) {
      unresolved.push({key:record.key,job_id:record.job_id,input_hash:record.input_hash});
      continue;
    }
    bindings[record.key] = {job_id:record.job_id,input_hash:record.input_hash,parent_job_id:input.parent_job_id};
  }
  return {version:1,bindings,unresolved};
}
