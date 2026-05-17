const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Menü öffnen");
    }
  });
}

const analyticsConsentKey = "wirkungsoekonomie_analytics_consent";

function updateAnalyticsConsent(value) {
  if (typeof window.gtag !== "function") return;

  window.gtag("consent", "update", {
    analytics_storage: value === "granted" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });

  if (value === "granted") {
    window.gtag("config", "G-KBSME2T45Y");
  }
}

function createConsentBanner() {
  if (localStorage.getItem(analyticsConsentKey)) {
    updateAnalyticsConsent(localStorage.getItem(analyticsConsentKey));
    return;
  }

  const banner = document.createElement("section");
  banner.className = "cookie-banner";
  banner.setAttribute("aria-label", "Analytics-Einwilligung");
  banner.innerHTML = `
    <div>
      <p class="cookie-banner-title">Statistik</p>
      <p>Wir nutzen Google Analytics, um die Nutzung dieser Website besser zu verstehen. Die Auswertung erfolgt nur mit deiner Zustimmung.</p>
    </div>
    <div class="cookie-banner-actions">
      <button class="btn btn-secondary btn-small" type="button" data-consent="denied">Ablehnen</button>
      <button class="btn btn-primary btn-small" type="button" data-consent="granted">Zustimmen</button>
    </div>
  `;

  banner.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("[data-consent]");
    if (!button) return;

    const value = button.dataset.consent;
    localStorage.setItem(analyticsConsentKey, value);
    updateAnalyticsConsent(value);
    banner.remove();
  });

  document.body.appendChild(banner);
}

createConsentBanner();
