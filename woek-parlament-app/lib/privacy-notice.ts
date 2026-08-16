/**
 * Central version marker for consent records. A functional change affecting
 * personal data must be reviewed against the public privacy notice before this
 * value is advanced and released.
 */
export const privacyNotice = {
  version: "2026-08-16.1",
  reviewedAt: "2026-08-16",
  reviewScope: [
    "voluntary_email_updates",
    "double_opt_in",
    "self_service_unsubscribe",
    "local_browser_storage",
    "own_reach_measurement",
    "portal_scoped_analytics_proxy",
    "do_not_track_support"
  ] as const
} as const;

export const consentVersion = privacyNotice.version;
export const privacyNoticeVersion = privacyNotice.version;
