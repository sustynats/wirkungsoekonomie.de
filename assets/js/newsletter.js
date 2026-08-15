(() => {
  const root = document.querySelector("[data-woek-newsletter]");
  if (!(root instanceof HTMLElement)) return;

  const apiOrigin = root.dataset.apiOrigin || "https://parlament.wirkungsoekonomie.de";
  const form = root.querySelector("[data-woek-newsletter-form]");
  const message = root.querySelector("[data-woek-newsletter-message]");
  const welcome = root.querySelector("[data-woek-newsletter-welcome]");
  const controls = Array.from(document.querySelectorAll("[data-woek-newsletter-control]"));
  let signupAvailable = true;

  function setMessage(text, isError = false) {
    if (!(message instanceof HTMLElement)) return;
    message.textContent = text;
    message.classList.toggle("is-error", isError);
  }

  function updateControls(state) {
    const active = state === "active";
    root.dataset.newsletterState = state;
    if (form instanceof HTMLFormElement) form.hidden = active;
    if (welcome instanceof HTMLElement) welcome.hidden = !active;
    controls.forEach((control) => {
      if (!(control instanceof HTMLButtonElement)) return;
      control.classList.toggle("is-active", active);
      control.textContent = active ? "Willkommen zurück" : (control.dataset.newsletterLabel || "Newsletter");
      control.setAttribute("aria-label", active ? "Der Wirkungsbrief ist aktiv" : "Der Wirkungsbrief anmelden");
    });
  }

  function showSignup() {
    updateControls("unknown");
    root.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => root.querySelector("input[name='email']")?.focus(), 420);
  }

  controls.forEach((control) => control.addEventListener("click", showSignup));

  async function loadState() {
    try {
      const response = await fetch(`${apiOrigin}/api/woek-newsletter`, { credentials: "include", cache: "no-store" });
      if (!response.ok) throw new Error("Newsletter status unavailable");
      const data = await response.json();
      signupAvailable = data.signup_available !== false;
      updateControls(data.state === "active" ? "active" : "unknown");
      if (!signupAvailable && form instanceof HTMLFormElement && !form.hidden) {
        const submit = form.querySelector("button[type='submit']");
        if (submit instanceof HTMLButtonElement) submit.disabled = true;
        setMessage("Die Newsletter-Anmeldung ist derzeit nicht verfügbar. Bitte versuchen Sie es später erneut.", true);
      }
    } catch {
      updateControls("unknown");
    }
  }

  if (form instanceof HTMLFormElement) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!signupAvailable || !form.reportValidity()) return;
      const submit = form.querySelector("button[type='submit']");
      if (!(submit instanceof HTMLButtonElement)) return;
      const values = new FormData(form);
      submit.disabled = true;
      setMessage("Die Bestätigungs-E-Mail wird vorbereitet …");
      try {
        const response = await fetch(`${apiOrigin}/api/woek-newsletter`, {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: values.get("email"),
            consent: values.get("consent") === "on",
            consent_source: "wirkungsoekonomie.de/",
            website: values.get("website")
          })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Die Newsletter-Anmeldung konnte nicht verarbeitet werden.");
        if (result.outcome === "already_active") setMessage("Diese Adresse ist bereits angemeldet. Der Wirkungsbrief ist für sie aktiv.");
        else if (result.outcome === "already_pending") setMessage("Bitte prüfen Sie Ihr E-Mail-Postfach und bestätigen Sie die Anmeldung.");
        else if (result.outcome === "contact_required") setMessage("Für diese Adresse ist eine manuelle Klärung nötig. Bitte wenden Sie sich an uns.", true);
        else if (result.delivery === "sent") setMessage("Bitte bestätigen Sie jetzt die E-Mail in Ihrem Postfach.");
        else setMessage("Die Anmeldung ist noch nicht aktiv. Bitte versuchen Sie es später erneut.", true);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Die Newsletter-Anmeldung konnte nicht verarbeitet werden.", true);
      } finally {
        submit.disabled = false;
      }
    });
  }

  loadState();
})();
