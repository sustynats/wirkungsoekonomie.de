const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const analyticsMeasurementId = "G-KBSME2T45Y";
const analyticsConsentKey = "wirkungsoekonomie-analytics-consent";

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

function loadAnalytics() {
  if (window.__wirkungAnalyticsLoaded) {
    return;
  }

  window.__wirkungAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag("js", new Date());
  window.gtag("config", analyticsMeasurementId);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsMeasurementId}`;
  document.head.append(script);
}

function createAnalyticsBanner() {
  if (document.querySelector(".cookie-banner")) {
    return;
  }

  const banner = document.createElement("section");
  banner.className = "cookie-banner";
  banner.setAttribute("aria-label", "Analytics-Einstellungen");
  banner.innerHTML = `
    <p class="cookie-banner-title">Analytics erlauben?</p>
    <p>Wir nutzen Google Analytics, um zu verstehen, welche Inhalte gelesen werden. Die Messung startet erst nach Zustimmung.</p>
    <div class="cookie-banner-actions">
      <button class="btn btn-primary btn-small" type="button" data-analytics-consent="granted">Akzeptieren</button>
      <button class="btn btn-secondary btn-small" type="button" data-analytics-consent="denied">Ablehnen</button>
    </div>
  `;

  banner.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const button = event.target.closest("[data-analytics-consent]");
    if (!(button instanceof HTMLElement)) {
      return;
    }

    const consent = button.dataset.analyticsConsent;
    localStorage.setItem(analyticsConsentKey, consent);
    banner.remove();

    if (consent === "granted") {
      loadAnalytics();
    }
  });

  document.body.append(banner);
}

try {
  const analyticsConsent = localStorage.getItem(analyticsConsentKey);

  if (analyticsConsent === "granted") {
    loadAnalytics();
  } else if (analyticsConsent !== "denied") {
    createAnalyticsBanner();
  }
} catch (error) {
  createAnalyticsBanner();
}
