/* Shared WÖk-ID bridge: only the saved list is synchronised. Private histories and notes stay local. */
(() => {
  if (window.WoekWirkungsraumAccount || window.WoekWirkungsraumAccountLoading) return;
  window.WoekWirkungsraumAccountLoading = true;
  const academyOrigin = "https://akademie.wirkungsoekonomie.de";
  const api = `${academyOrigin}/api/me`;
  let signedIn = false;
  let knownUser = null;

  function localItems() {
    return window.WoekUserSpace?.getItems("saved_items") || [];
  }

  function itemRef(item) {
    return String(item?.url || item?.itemRef || "").trim();
  }

  function itemType(item) {
    return String(item?.type || item?.itemType || "link").trim().slice(0, 64) || "link";
  }

  function renderAccount() {
    const container = document.querySelector("[data-wirkungsraum-account]");
    if (!container) return;
    const status = container.querySelector("[data-wirkungsraum-account-status]");
    const login = container.querySelector("[data-wirkungsraum-account-login]");
    const sync = container.querySelector("[data-wirkungsraum-account-sync]");
    if (login) login.href = `${academyOrigin}/login?returnTo=${encodeURIComponent(window.location.href)}`;
    if (signedIn) {
      if (status) status.textContent = `Mit WÖk-ID verbunden${knownUser?.displayName ? `: ${knownUser.displayName}` : ""}. Deine Merkliste wird übergreifend synchronisiert.`;
      if (login) login.hidden = true;
      if (sync) sync.hidden = false;
    } else {
      if (status) status.textContent = "Ohne WÖk-ID bleibt dein Wirkungsraum ausschließlich in diesem Browser. Deine Merkliste kannst du freiwillig verknüpfen.";
      if (login) login.hidden = false;
      if (sync) sync.hidden = true;
    }
  }

  async function request(path, options = {}) {
    return fetch(`${api}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
  }

  async function identify() {
    try {
      const response = await request("");
      if (!response.ok) {
        signedIn = false;
        renderAccount();
        return false;
      }
      const payload = await response.json();
      signedIn = true;
      knownUser = payload.user || null;
      renderAccount();
      return true;
    } catch {
      signedIn = false;
      renderAccount();
      return false;
    }
  }

  function localIdForRemote(remote, current) {
    const ref = remote.itemRef;
    const matching = current.find((item) => itemRef(item) === ref);
    if (matching) return matching.id;
    return ref.startsWith("/") ? ref.replace(/^\/+/, "") || "start" : `remote-${remote.id}`;
  }

  async function saveItem(item) {
    const ref = itemRef(item);
    if (!signedIn || !ref) return false;
    try {
      const response = await request("/saved", {
        method: "POST",
        body: JSON.stringify({
          itemType: itemType(item),
          itemRef: ref,
          title: String(item?.title || ref).trim(),
          surface: "website"
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async function removeItem(item) {
    const ref = itemRef(item);
    if (!signedIn || !ref) return false;
    try {
      const query = new URLSearchParams({ itemRef: ref, itemType: itemType(item) });
      const response = await request(`/saved?${query}`, { method: "DELETE" });
      return response.ok;
    } catch {
      return false;
    }
  }

  async function syncSavedItems() {
    if (!(await identify())) return false;
    const response = await request("/saved");
    if (!response.ok) return false;
    const remote = await response.json();
    const local = localItems();
    const remoteItems = Array.isArray(remote.items) ? remote.items : [];
    remoteItems.forEach((item) => {
      const ref = itemRef(item);
      if (!ref || local.some((existing) => itemRef(existing) === ref)) return;
      window.WoekUserSpace?.upsertItem("saved_items", {
        id: localIdForRemote(item, local),
        type: itemType(item),
        title: item.title || ref,
        url: ref,
        category: item.surface === "akademie" ? "Akademie" : itemType(item),
        saved_at: item.createdAt || new Date().toISOString()
      }, { limit: 300, timestampField: "saved_at" });
    });
    await Promise.all(localItems().map((item) => saveItem(item)));
    document.dispatchEvent(new CustomEvent("wirkungsraum:changed"));
    return true;
  }

  window.WoekWirkungsraumAccount = { identify, syncSavedItems, saveItem, removeItem };
  window.WoekWirkungsraumAccountLoading = false;
  document.addEventListener("DOMContentLoaded", async () => {
    const syncButton = document.querySelector("[data-wirkungsraum-account-sync]");
    syncButton?.addEventListener("click", async () => {
      syncButton.disabled = true;
      await syncSavedItems();
      syncButton.disabled = false;
    });
    if (document.querySelector("[data-wirkungsraum-account]")) await syncSavedItems();
  });
})();
