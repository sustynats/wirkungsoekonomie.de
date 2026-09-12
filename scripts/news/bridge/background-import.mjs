// A completed, validated current-news batch must not be discarded because the
// subsequent legacy-profile batch cannot read Oracle. Content gates still fail
// normally; this boundary handles only an explicitly transient read failure.
export async function importBackgroundImpact(importer, report, now) {
  try {
    const results = await importer();
    report.bridge_impact_results = results;
    if (results.some(result => result.changed)) report.public_changed = true;
  } catch (error) {
    if (error.retryable !== true || error.message !== 'BRIDGE_REMOTE_INVALID_RESPONSE'
      || error.transient_read_failure !== true) throw error;
    report.bridge_impact_results = [];
    report.bridge_impact_deferred = {
      status: 'retry_required', code: error.message, at: now,
      operation: error.operation, http_status: error.http_status,
    };
    report.operational_status = 'degraded';
  }
}
