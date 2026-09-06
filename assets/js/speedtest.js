import SpeedTest from './vendor/cloudflare-speedtest-1.13.1.js';

const $ = (id) => document.getElementById(id);
const format = (value) => Number.isFinite(value) && value > 0
  ? new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(value) : '-';
const stages = ['latency', 'download', 'upload', 'done'];
const names = { latency: 'Ping', download: 'Download', upload: 'Upload' };
const colors = { latency: '#eac879', download: '#8de4b4', upload: '#9cbcff' };
let engine, run = 0, running = false, timer, deadline, metadataController, started;

function phase(type) {
  document.querySelectorAll('[data-stage]').forEach((el) => {
    el.dataset.active = String(el.dataset.stage === type);
    el.dataset.complete = String(stages.indexOf(el.dataset.stage) < stages.indexOf(type));
  });
  ['latency', 'download', 'upload'].forEach((key) => { $(`${key}-card`).dataset.active = String(key === type); });
}

function renderResults(results, type) {
  const summary = results.getSummary();
  $('download').textContent = format(summary.download / 1e6);
  $('upload').textContent = format(summary.upload / 1e6);
  $('latency').textContent = format(summary.latency);
  const value = type === 'latency' ? summary.latency : summary[type] / 1e6;
  $('live-value').textContent = format(value);
  $('live-label').textContent = names[type] || 'Download';
  $('live-unit').textContent = type === 'latency' ? 'ms' : 'Mbit/s';
  $('dial-fill').style.stroke = colors[type] || colors.download;
  // Logarithmic dial corresponds to the printed 0 / 1 / 10 / 100 / 1,000 scale.
  $('dial-fill').style.strokeDashoffset = String(100 - (Number.isFinite(value) ? Math.min(100, Math.log10(1 + value) / 3 * 100) : 0));
}

function finish(message, state = 'idle') {
  running = false;
  clearInterval(timer);
  clearTimeout(deadline);
  metadataController?.abort();
  if (engine) {
    engine.onResultsChange = () => {};
    engine.onError = () => {};
    engine.onFinish = () => {};
    engine.pause();
  }
  $('start').dataset.running = 'false';
  $('start').textContent = 'Erneut testen ↗';
  $('badge').dataset.state = state;
  $('badge-text').textContent = state === 'error' ? 'Messung unterbrochen' : state === 'done' ? 'Messung abgeschlossen' : 'Bereit zum Messen';
  $('status').textContent = message;
  if (state !== 'done') {
    phase(null);
    $('live-label').textContent = 'Teilwerte';
  }
  $('elapsed').textContent = `${Math.round((performance.now() - started) / 1000)} s · ${state === 'done' ? 'abgeschlossen' : 'Teilwerte'} · ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
}

async function loadConnection(id) {
  const controller = new AbortController();
  metadataController = controller;
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch('https://get.geojs.io/v1/ip/geo.json', { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
    if (!response.ok) throw new Error('Metadata unavailable');
    const data = await response.json();
    if (data.error || !data.country_code) throw new Error('Metadata unavailable');
    if (id !== run || !running) return;
    $('location').textContent = data.city || 'Ort nicht verfügbar';
    const country = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['de'], { type: 'region' }).of(data.country_code) : data.country;
    $('region').textContent = [data.region, country].filter(Boolean).join(', ') || 'IP-basierter Standort';
    $('provider').textContent = data.organization_name && data.organization_name !== 'Unknown' ? data.organization_name : 'Provider nicht verfügbar';
    $('network').textContent = data.asn && data.asn !== 64512 ? `Netzbetreiber · AS${data.asn}` : 'Netzbetreiber anhand der IP-Adresse';
  } catch {
    if (id !== run) return;
    $('location').textContent = 'Nicht verfügbar';
    $('provider').textContent = 'Nicht verfügbar';
    $('region').textContent = 'Standortdienst nicht erreichbar';
    $('network').textContent = 'Die Geschwindigkeitsmessung ist unabhängig davon.';
  } finally { clearTimeout(timeout); }
}

function start() {
  if (running) { finish('Abgebrochen. Die angezeigten Teilwerte sind nicht abschließend.'); return; }
  if (!navigator.onLine) {
    $('status').textContent = 'Du bist offline. Bitte die Internet-Verbindung prüfen und erneut starten.';
    return;
  }
  const id = ++run;
  running = true;
  started = performance.now();
  ['download', 'upload', 'latency', 'live-value'].forEach((key) => { $(key).textContent = '-'; });
  $('live-label').textContent = 'Ping';
  $('live-unit').textContent = 'ms';
  $('dial-fill').style.strokeDashoffset = '100';
  $('start').textContent = 'Messung stoppen';
  $('start').dataset.running = 'true';
  $('badge').dataset.state = 'running';
  $('badge-text').textContent = 'Messung läuft';
  $('status').textContent = 'Ping wird gemessen. Bitte den Tab geöffnet lassen.';
  $('location').textContent = $('provider').textContent = 'Wird ermittelt …';
  phase('latency');
  void loadConnection(id);
  timer = setInterval(() => { $('elapsed').textContent = `${Math.round((performance.now() - started) / 1000)} s · Messung läuft`; }, 1000);
  deadline = setTimeout(() => { if (running && id === run) finish('Zeitlimit erreicht. Verbindung prüfen und erneut testen. Nur Teilwerte verfügbar.', 'error'); }, 90000);
  try {
    engine = new SpeedTest({
      autoStart: false,
      measureDownloadLoadedLatency: false,
      measureUploadLoadedLatency: false,
      bandwidthFinishRequestDuration: 1000,
      bandwidthAbortRequestDuration: 0,
      measurements: [
        { type: 'latency', numPackets: 10 },
        ...[1e5, 1e6, 1e7, 2.5e7].map((bytes) => ({ type: 'download', bytes, count: 3 })),
        ...[1e5, 1e6, 1e7, 2.5e7].map((bytes) => ({ type: 'upload', bytes, count: bytes === 2.5e7 ? 2 : 3 })),
      ],
    });
    engine.onResultsChange = ({ type }) => {
      if (!running || id !== run || !names[type]) return;
      renderResults(engine.results, type);
      phase(type);
      $('status').textContent = `${names[type]} wird gemessen. Bitte den Tab geöffnet lassen.`;
    };
    engine.onError = (error) => {
      console.warn('Speedtest measurement failed:', error);
      if (running && id === run) finish('Messserver nicht erreichbar. Verbindung oder Browser-Schutz prüfen und erneut testen. Nur Teilwerte verfügbar.', 'error');
    };
    engine.onFinish = (results) => {
      if (!running || id !== run) return;
      const summary = results.getSummary();
      renderResults(results, 'download');
      if (![summary.download, summary.upload, summary.latency].every((value) => Number.isFinite(value) && value > 0)) {
        finish('Keine vollständige Messung möglich. Bitte erneut testen. Nur Teilwerte verfügbar.', 'error');
        return;
      }
      phase('done');
      finish('Fertig. Deine Messergebnisse stehen fest.', 'done');
    };
    engine.play();
  } catch { finish('Der Speedtest konnte nicht gestartet werden. Bitte die Seite neu laden.', 'error'); }
}

$('start').addEventListener('click', start);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && running) finish('Messung beim Tabwechsel gestoppt. Bitte hier erneut starten, damit die Werte vergleichbar bleiben.');
});
window.addEventListener('offline', () => { if (running) finish('Internet-Verbindung verloren. Nur Teilwerte verfügbar.', 'error'); });
window.addEventListener('pagehide', () => { if (running) finish('Messung gestoppt.'); });
