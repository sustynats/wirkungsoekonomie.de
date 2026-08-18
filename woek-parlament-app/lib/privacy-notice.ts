/**
 * Central version marker for consent records. A functional change affecting
 * personal data must be reviewed against the public privacy notice before this
 * value is advanced and released.
 */
export const privacyNotice = {
  version: "2026-08-18.1",
  reviewedAt: "2026-08-18",
  reviewScope: [
    "voluntary_email_updates",
    "double_opt_in",
    "self_service_unsubscribe",
    "verified_end_of_day_political_updates",
    "list_unsubscribe_one_click",
    "digest_delivery_ledger_without_open_or_click_tracking",
    "local_browser_storage",
    "privacy_preserving_parliament_reach_measurement",
    "shared_first_party_analytics_dashboard_with_site_filter"
  ] as const
} as const;

export const consentVersion = privacyNotice.version;
export const privacyNoticeVersion = privacyNotice.version;
