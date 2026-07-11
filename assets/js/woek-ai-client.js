(function () {
  const DEFAULT_API_BASE = "https://130.162.217.58.sslip.io";

  function joinUrl(base, path) {
    const cleanBase = String(base || DEFAULT_API_BASE).replace(/\/+$/, "");
    const cleanPath = String(path || "").startsWith("/") ? String(path) : `/${path || ""}`;
    return `${cleanBase}${cleanPath}`;
  }

  async function parseJson(response) {
    return response.json().catch(() => undefined);
  }

  async function requestJson(options = {}) {
    const {
      apiBase = DEFAULT_API_BASE,
      path = "/api/woek-ai",
      url,
      body,
      clientId,
      headers = {},
      unavailableMessage = "Der KI-Dienst ist voruebergehend nicht verfuegbar.",
    } = options;
    const endpoint = url || joinUrl(apiBase, path);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(clientId ? { "X-WOEK-Client-ID": clientId } : {}),
        ...headers,
      },
      body: JSON.stringify(body || {}),
    });
    const payload = await parseJson(response);
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || unavailableMessage);
    }
    return payload;
  }

  function askWoek(options = {}) {
    const { question, context, ...rest } = options;
    return requestJson({
      path: "/api/woek-ai",
      body: { question, ...(context ? { context } : {}) },
      ...rest,
    });
  }

  function sendFeedback(options = {}) {
    const { apiBase = DEFAULT_API_BASE, feedbackUrl, feedback, clientId, headers, unavailableMessage } = options;
    return requestJson({
      apiBase,
      path: "/api/feedback",
      url: feedbackUrl,
      body: feedback,
      clientId,
      headers,
      unavailableMessage,
    });
  }

  window.WoekAiClient = {
    DEFAULT_API_BASE,
    joinUrl,
    requestJson,
    askWoek,
    sendFeedback,
  };
})();
