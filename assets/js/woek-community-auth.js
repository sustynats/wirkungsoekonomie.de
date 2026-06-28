(() => {
  const panels = Array.from(document.querySelectorAll("[data-community-auth]"));
  if (!panels.length) return;

  const apiBase = window.WOEK_API_BASE || "https://130.162.217.58.sslip.io";
  const discordClientId = window.WOEK_DISCORD_CLIENT_ID || "1520742698615832586";
  const discordInviteUrl = window.WOEK_DISCORD_INVITE_URL || "https://discord.gg/AtJpB3ErPZ";
  const redirectPath = "/app/";
  const tokenKey = "woek_community_auth";
  const oauthStatePrefix = "woek_discord_oauth_state:";

  window.WoekCommunityAuth = {
    token: () => window.localStorage.getItem(tokenKey) || "",
    authHeaders: () => {
      const token = window.localStorage.getItem(tokenKey) || "";
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    refresh: refreshStatus
  };

  init();

  async function init() {
    const oauthReturn = await consumeDiscordOAuthFragment();
    await refreshStatus();
    if (oauthReturn && sameSiteUrl(oauthReturn) && cleanUrl(window.location.href) !== cleanUrl(oauthReturn)) {
      window.location.assign(addQuery(oauthReturn, "woek_login", "success"));
    }
  }

  async function consumeDiscordOAuthFragment() {
    if (!window.location.hash || !window.location.hash.includes("access_token=")) return "";
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token") || "";
    const state = params.get("state") || "";
    const returnTo = state ? window.sessionStorage.getItem(`${oauthStatePrefix}${state}`) || "" : "";

    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    if (!accessToken) return returnTo;

    setPanels("checking");
    try {
      const response = await fetch(`${apiBase}/api/community/discord-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken })
      });
      const payload = await response.json().catch(() => undefined);
      if (!response.ok || !payload?.ok || !payload?.token) throw new Error("community-auth");
      window.localStorage.setItem(tokenKey, payload.token);
      if (state) window.sessionStorage.removeItem(`${oauthStatePrefix}${state}`);
      applyStatus(payload);
    } catch {
      setPanels("error");
    }

    return returnTo;
  }

  async function refreshStatus() {
    const token = window.localStorage.getItem(tokenKey) || "";
    setPanels(token ? "checking" : "public");
    if (!token) return;

    try {
      const response = await fetch(`${apiBase}/api/community/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await response.json().catch(() => undefined);
      if (!response.ok || !payload?.ok) throw new Error("community-status");
      if (payload.token) window.localStorage.setItem(tokenKey, payload.token);
      applyStatus(payload);
    } catch {
      setPanels("error");
    }
  }

  function applyStatus(status) {
    if (status?.loggedIn && status?.member) {
      setPanels("member", status);
      return;
    }
    if (status?.loggedIn && !status?.member) {
      setPanels("nonmember", status);
      return;
    }
    setPanels("public", status);
  }

  function setPanels(state, status = {}) {
    panels.forEach((panel) => renderPanel(panel, state, status));
    renderNotes(state);
    renderLoginLinks();
  }

  function renderPanel(panel, state, status) {
    const variant = panel.dataset.communityVariant || "default";
    const title = panel.querySelector("[data-community-title]");
    const kicker = panel.querySelector("[data-community-kicker]");
    const copy = panel.querySelector("[data-community-copy]");
    const actions = panel.querySelector("[data-community-actions]");
    const userName = status?.user?.name || status?.user?.username || "Discord";

    if (kicker) kicker.textContent = state === "member" ? "Community-Zugang aktiv" : "Community-Funktionen";
    if (title) title.textContent = titleText(state, variant, userName);
    if (copy) copy.textContent = copyText(state, variant, userName);
    if (actions) renderActions(actions, state, variant);
    panel.dataset.communityState = state;
  }

  function titleText(state, variant, userName) {
    if (state === "checking") return "Discord-Status wird geprüft.";
    if (state === "member") return `Du bist angemeldet${userName ? `, ${userName}` : ""}.`;
    if (state === "nonmember") return "Discord erkannt, aber noch keine WÖk-Mitgliedschaft.";
    if (state === "error") return "Anmeldestatus gerade nicht erreichbar.";
    return variant === "factcheck" ? "Mit Discord anmelden." : "Mehr Nutzen im WÖk-Server.";
  }

  function copyText(state, variant) {
    if (state === "checking") {
      return "Die Website fragt den WÖk-Server ab und prüft, ob dein Discord-Konto dort Mitglied ist.";
    }
    if (state === "member") {
      return "Dein Discord-Konto wurde als Mitglied des WÖk-Servers erkannt. Die Website kann den Community-Zugang jetzt an WÖk-Wirkungscheck, WebApp und spätere Limits weitergeben.";
    }
    if (state === "nonmember") {
      return "Dein Discord-Konto ist angemeldet, aber auf dem WÖk-Server noch nicht als Mitglied gefunden. Tritt dem Server bei und prüfe den Status danach erneut.";
    }
    if (state === "error") {
      return "Der Login kann lokal gespeichert sein, aber die Mitgliedschaft konnte gerade nicht geprüft werden. Du kannst es direkt noch einmal versuchen.";
    }
    if (variant === "factcheck") {
      return "Melde dich mit Discord an, damit die Website erkennt, ob du Mitglied im WÖk-Server bist. Ohne Anmeldung bleibt die Seite im Basiszugang.";
    }
    return "Ohne Community-Mitgliedschaft ist die WebApp als Basiszugang gedacht. Mit Discord-Anmeldung erkennt die Website, ob du im WÖk-Server bist und kann erweiterte Workflows zuordnen.";
  }

  function renderActions(actions, state, variant) {
    actions.replaceChildren();
    if (state === "member") {
      actions.append(
        actionLink(variant === "factcheck" ? "#faktencheck-pruefen" : "#woek-app-title", variant === "factcheck" ? "Wirkungscheck nutzen" : "Funktionen nutzen", "btn btn-primary"),
        actionLink(discordInviteUrl, "WÖk-Server öffnen", "btn btn-secondary", true)
      );
      return;
    }

    if (state === "checking") {
      const button = document.createElement("button");
      button.className = "btn btn-primary";
      button.type = "button";
      button.disabled = true;
      button.textContent = "Prüfe...";
      actions.append(button);
      return;
    }

    actions.append(
      actionLink(buildDiscordLoginUrl(), "Mit Discord anmelden", "btn btn-primary"),
      actionLink(discordInviteUrl, state === "nonmember" ? "WÖk-Community beitreten" : "Server ansehen", "btn btn-secondary", true)
    );
    if (variant !== "factcheck") {
      actions.append(actionLink("../werkzeuge/faktencheck/", "Wirkungscheck ansehen", "btn btn-secondary"));
    }
  }

  function renderNotes(state) {
    document.querySelectorAll("[data-community-note]").forEach((note) => {
      note.replaceChildren();
      if (state === "member") {
        note.append(document.createTextNode("Community-Zugang aktiv: Dein Discord-Login wurde erkannt."));
        return;
      }
      note.append(document.createTextNode("Noch nicht angemeldet? "));
      note.append(actionLink(buildDiscordLoginUrl(), "Mit Discord anmelden", "text-link"));
      note.append(document.createTextNode(" oder "));
      note.append(actionLink(discordInviteUrl, "dem WÖk-Server beitreten", "text-link", true));
      note.append(document.createTextNode("."));
    });
  }

  function renderLoginLinks() {
    document.querySelectorAll("[data-community-login]").forEach((link) => {
      link.setAttribute("href", buildDiscordLoginUrl());
    });
  }

  function buildDiscordLoginUrl() {
    const state = cryptoRandomState();
    window.sessionStorage.setItem(`${oauthStatePrefix}${state}`, cleanUrl(window.location.href));
    const url = new URL("https://discord.com/oauth2/authorize");
    url.searchParams.set("client_id", discordClientId);
    url.searchParams.set("redirect_uri", `${window.location.origin}${redirectPath}`);
    url.searchParams.set("response_type", "token");
    url.searchParams.set("scope", "identify");
    url.searchParams.set("state", state);
    return url.href;
  }

  function cryptoRandomState() {
    const array = new Uint8Array(16);
    if (window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
    }
    return Array.from(array, (value) => value.toString(16).padStart(2, "0")).join("");
  }

  function actionLink(href, label, className, external = false) {
    const link = document.createElement("a");
    link.className = className;
    link.href = href;
    link.textContent = label;
    if (external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    return link;
  }

  function sameSiteUrl(value) {
    try {
      const url = new URL(value, window.location.origin);
      return url.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  function cleanUrl(value) {
    const url = new URL(value, window.location.origin);
    url.hash = "";
    url.searchParams.delete("woek_login");
    return url.href;
  }

  function addQuery(value, key, nextValue) {
    const url = new URL(value, window.location.origin);
    url.searchParams.set(key, nextValue);
    return url.href;
  }

})();
