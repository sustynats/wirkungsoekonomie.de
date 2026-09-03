export type AutopilotRuntimeMode = "INITIAL_BOOTSTRAP_2_3" | "NORMAL";

export function autopilotRuntimeMode(): AutopilotRuntimeMode {
  return process.env.WOEK_AUTOPILOT_RUNTIME_MODE === "NORMAL" ? "NORMAL" : "INITIAL_BOOTSTRAP_2_3";
}

export function recurringWritersEnabled() {
  return autopilotRuntimeMode() === "NORMAL";
}

export function bootstrapDisabledResponse() {
  return {
    status: "BOOTSTRAP_WRITERS_DISABLED" as const,
    mode: autopilotRuntimeMode(),
    production_deploy: "DISABLED_UNTIL_WOEK_EXTERNAL_END_AUDIT" as const,
    detail: "Wiederkehrende CodeX-Writer bleiben bis zum externen WÖk-Endaudit deaktiviert.",
  };
}
