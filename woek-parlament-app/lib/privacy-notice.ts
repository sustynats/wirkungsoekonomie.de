/**
 * Central version marker for consent records. A functional change affecting
 * personal data must be reviewed against the public privacy notice before this
 * value is advanced and released.
 */
export const privacyNotice = {
  version: "2026-08-15.2",
  reviewedAt: "2026-08-15",
  reviewScope: [
    "voluntary_email_updates",
    "double_opt_in",
    "self_service_unsubscribe",
    "local_browser_storage",
    "own_reach_measurement"
  ] as const
} as const;

export const consentVersion = privacyNotice.version;
export const privacyNoticeVersion = privacyNotice.version;
