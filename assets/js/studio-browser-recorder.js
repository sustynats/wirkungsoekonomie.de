(function () {
  "use strict";

  const DB_NAME = "woek-studio-aufnahme";
  const DB_STORE = "segments";
  const STATE_KEY = "woek-studio-aufnahme-state-v1";
  const GAP_SECONDS = 0.32;
  const TARGET_SAMPLE_RATE = 48000;
  const TARGET_PEAK = Math.pow(10, -1.5 / 20);

  const titleInput = document.getElementById("recording-title");
  const textInput = document.getElementById("recording-text");
  const useTextButton = document.getElementById("use-text");
  const clearAllButton = document.getElementById("clear-all");
  const segmentsElement = document.getElementById("segments");
  const recordingStatus = document.getElementById("recording-status");
  const produceButton = document.getElementById("produce");
  const productionStatus = document.getElementById("production-status");
  const productionProgress = document.getElementById("production-progress");
  const output = document.getElementById("output");
  const outputStatus = document.getElementById("output-status");
  const downloadRawWav = document.getElementById("download-raw-wav");
  const downloadRawMp3 = document.getElementById("download-raw-mp3");
  const downloadWav = document.getElementById("download-wav");
  const downloadMp3 = document.getElementById("download-mp3");

  const state = { title: "", segments: [] };
  const recordings = new Map();
  const previewUrls = [];
  const downloads = [];
  let recording = null;
  let productionRunning = false;

  function openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(DB_STORE)) {
          request.result.createObjectStore(DB_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Lokaler Speicher ist nicht verfügbar."));
    });
  }

  async function readRecordings() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DB_STORE, "readonly");
      const request = transaction.objectStore(DB_STORE).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    }).finally(() => db.close());
  }

  async function saveRecording(id, blob) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DB_STORE, "readwrite");
      transaction.objectStore(DB_STORE).put({ id, blob, savedAt: Date.now() });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    }).finally(() => db.close());
  }

  async function clearRecordings() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(DB_STORE, "readwrite");
      transaction.objectStore(DB_STORE).clear();
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    }).finally(() => db.close());
  }

  function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function restoreState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STATE_KEY) || "{}");
      state.title = typeof saved.title === "string" ? saved.title : "";
      state.segments = Array.isArray(saved.segments) ? saved.segments.filter((item) => typeof item === "string" && item.trim()) : [];
    } catch {
      state.title = "";
      state.segments = [];
    }
    titleInput.value = state.title;
    textInput.value = state.segments.join("\n\n");
  }

  function splitParagraphs(text) {
    let paragraphs = text.trim().split(/\n\s*\n/).map((item) => item.replace(/\s+/g, " ").trim()).filter(Boolean);
    if (paragraphs.length <= 1 && text.trim().length > 320) {
      const sentences = text.trim().split(/(?<=[.!?])\s+/);
      paragraphs = [];
      let current = "";
      sentences.forEach((sentence) => {
        current = `${current} ${sentence}`.trim();
        if (current.length >= 220) {
          paragraphs.push(current);
          current = "";
        }
      });
      if (current) paragraphs.push(current);
    }
    return paragraphs;
  }

  function segmentId(index) {
    return `segment-${index + 1}`;
  }

  function setRecordingStatus(message) {
    recordingStatus.textContent = message;
  }

  function setProductionStatus(message) {
    productionStatus.textContent = message;
  }

  function revokePreviewUrls() {
    previewUrls.splice(0).forEach((url) => URL.revokeObjectURL(url));
  }

  function revokeDownloads() {
    downloads.splice(0).forEach((url) => URL.revokeObjectURL(url));
  }

  function makeButton(label, className, onClick, disabled) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.disabled = Boolean(disabled);
    button.addEventListener("click", onClick);
    return button;
  }

  function renderSegments() {
    revokePreviewUrls();
    segmentsElement.replaceChildren();
    const fragment = document.createDocumentFragment();
    if (!state.segments.length) {
      const empty = document.createElement("p");
      empty.className = "studio-empty";
      empty.textContent = "Noch keine Absätze vorbereitet.";
      fragment.append(empty);
    }
    state.segments.forEach((text, index) => {
      const id = segmentId(index);
      const blob = recordings.get(id);
      const card = document.createElement("article");
      card.className = `studio-segment${recording && recording.index === index ? " is-recording" : ""}`;

      const top = document.createElement("div");
      top.className = "studio-segment-top";
      const number = document.createElement("span");
      number.className = "studio-segment-number";
      number.textContent = `Absatz ${String(index + 1).padStart(2, "0")}`;
      const status = document.createElement("span");
      status.className = "studio-segment-state";
      status.textContent = recording && recording.index === index ? "Aufnahme läuft" : blob ? "Gespeichert" : "Noch offen";
      top.append(number, status);

      const paragraph = document.createElement("p");
      paragraph.className = "studio-segment-text";
      paragraph.textContent = text;

      const actions = document.createElement("div");
      actions.className = "studio-actions";
      const anotherRecordingIsActive = Boolean(recording && recording.index !== index);
      if (recording && recording.index === index) {
        actions.append(makeButton("Stopp & speichern", "studio-button", stopRecording));
      } else {
        actions.append(makeButton(blob ? "Neu aufnehmen" : "Sprechen", "studio-button", () => startRecording(index), anotherRecordingIsActive));
      }
      if (blob) {
        const audio = document.createElement("audio");
        const url = URL.createObjectURL(blob);
        previewUrls.push(url);
        audio.controls = true;
        audio.src = url;
        audio.preload = "metadata";
        card.append(top, paragraph, actions, audio);
      } else {
        card.append(top, paragraph, actions);
      }
      fragment.append(card);
    });
    segmentsElement.append(fragment);
    produceButton.disabled = productionRunning || Boolean(recording) || !state.segments.length;
  }

  function recorderMimeType() {
    const candidates = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
    return candidates.find((item) => window.MediaRecorder && MediaRecorder.isTypeSupported(item)) || "";
  }

  async function startRecording(index) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      setRecordingStatus("Dieser Browser kann keine Mikrofonaufnahme starten. Bitte Safari oder Chrome aktuell verwenden.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: TARGET_SAMPLE_RATE, echoCancellation: false, noiseSuppression: true, autoGainControl: false },
      });
      const mimeType = recorderMimeType();
      const options = { audioBitsPerSecond: 160000 };
      if (mimeType) options.mimeType = mimeType;
      const recorder = new MediaRecorder(stream, options);
      const chunks = [];
      recording = { index, recorder, stream, chunks };
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size) chunks.push(event.data);
      });
      recorder.addEventListener("stop", async () => {
        const stoppedRecording = recording;
        stream.getTracks().forEach((track) => track.stop());
        recording = null;
        try {
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          if (blob.size < 1000) throw new Error("Die Aufnahme war zu kurz. Bitte erneut sprechen.");
          recordings.set(segmentId(index), blob);
          await saveRecording(segmentId(index), blob);
          setRecordingStatus(`Absatz ${index + 1} gespeichert. Du kannst ihn anhören oder neu aufnehmen.`);
        } catch (error) {
          setRecordingStatus(error.message || "Die Aufnahme konnte nicht gespeichert werden.");
        }
        if (stoppedRecording) renderSegments();
      }, { once: true });
      recorder.start(1000);
      setRecordingStatus(`Absatz ${index + 1} läuft. Sprich den Text und tippe danach auf „Stopp & speichern“.`);
      renderSegments();
    } catch (error) {
      setRecordingStatus(error.name === "NotAllowedError" ? "Der Mikrofonzugriff wurde nicht erlaubt." : "Das Mikrofon konnte nicht gestartet werden.");
    }
  }

  function stopRecording() {
    if (recording && recording.recorder.state !== "inactive") recording.recorder.stop();
  }

  function buildProcessingChain(context) {
    const highPass = context.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.value = 75;
    highPass.Q.value = 0.7;
    const warmth = context.createBiquadFilter();
    warmth.type = "lowshelf";
    warmth.frequency.value = 160;
    warmth.gain.value = 1.5;
    const presence = context.createBiquadFilter();
    presence.type = "peaking";
    presence.frequency.value = 2800;
    presence.Q.value = 1.4;
    presence.gain.value = 2;
    const sibilance = context.createBiquadFilter();
    sibilance.type = "highshelf";
    sibilance.frequency.value = 6500;
    sibilance.gain.value = -1.5;
    const air = context.createBiquadFilter();
    air.type = "highshelf";
    air.frequency.value = 9000;
    air.gain.value = 2.5;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 12;
    compressor.ratio.value = 2.8;
    compressor.attack.value = 0.015;
    compressor.release.value = 0.25;
    const makeup = context.createGain();
    makeup.gain.value = 1.26;
    highPass.connect(warmth).connect(presence).connect(sibilance).connect(air).connect(compressor).connect(makeup).connect(context.destination);
    return highPass;
  }

  async function renderRawMix(decoded, totalFrames) {
    const context = new OfflineAudioContext(1, totalFrames, TARGET_SAMPLE_RATE);
    let startsAt = 0;
    decoded.forEach((buffer) => {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(startsAt);
      startsAt += buffer.duration + GAP_SECONDS;
    });
    return context.startRendering();
  }

  async function renderStudioMix(decoded, totalFrames) {
    const context = new OfflineAudioContext(1, totalFrames, TARGET_SAMPLE_RATE);
    const chainInput = buildProcessingChain(context);
    let startsAt = 0;
    decoded.forEach((buffer) => {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(chainInput);
      source.start(startsAt);
      startsAt += buffer.duration + GAP_SECONDS;
    });
    return context.startRendering();
  }

  function normalisedMono(buffer) {
    const source = buffer.getChannelData(0);
    let peak = 0;
    for (let index = 0; index < source.length; index += 1) peak = Math.max(peak, Math.abs(source[index]));
    const gain = peak > 0 ? Math.min(TARGET_PEAK / peak, 2.5) : 1;
    const data = new Float32Array(source.length);
    for (let index = 0; index < source.length; index += 1) data[index] = Math.max(-1, Math.min(1, source[index] * gain));
    return data;
  }

  function encodeWav(samples, sampleRate) {
    const dataLength = samples.length * 2;
    const view = new DataView(new ArrayBuffer(44 + dataLength));
    const write = (offset, value) => value.split("").forEach((letter, index) => view.setUint8(offset + index, letter.charCodeAt(0)));
    write(0, "RIFF");
    view.setUint32(4, 36 + dataLength, true);
    write(8, "WAVE");
    write(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    write(36, "data");
    view.setUint32(40, dataLength, true);
    let offset = 44;
    samples.forEach((sample) => {
      const value = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, value, true);
      offset += 2;
    });
    return new Blob([view], { type: "audio/wav" });
  }

  function encodeMp3(samples, sampleRate) {
    if (!window.lamejs || !window.lamejs.Mp3Encoder) throw new Error("MP3-Encoder konnte nicht geladen werden.");
    const encoder = new window.lamejs.Mp3Encoder(1, sampleRate, 192);
    const pcm = new Int16Array(samples.length);
    for (let index = 0; index < samples.length; index += 1) pcm[index] = samples[index] < 0 ? samples[index] * 0x8000 : samples[index] * 0x7fff;
    const chunks = [];
    for (let offset = 0; offset < pcm.length; offset += 1152) {
      const encoded = encoder.encodeBuffer(pcm.subarray(offset, offset + 1152));
      if (encoded.length) chunks.push(new Int8Array(encoded));
    }
    const finalChunk = encoder.flush();
    if (finalChunk.length) chunks.push(new Int8Array(finalChunk));
    return new Blob(chunks, { type: "audio/mpeg" });
  }

  function fileStem() {
    const input = titleInput.value.trim().toLowerCase().replace(/[^a-z0-9äöüß]+/gi, "-").replace(/^-|-$/g, "");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    return input || `aufnahme-${timestamp}`;
  }

  function setDownload(link, blob, fileName) {
    const url = URL.createObjectURL(blob);
    downloads.push(url);
    link.href = url;
    link.download = fileName;
  }

  async function produce() {
    if (productionRunning || recording) return;
    const missing = state.segments.map((_, index) => segmentId(index)).filter((id) => !recordings.has(id));
    if (missing.length) {
      setProductionStatus(`Es fehlen noch ${missing.length} Absatz${missing.length === 1 ? "" : "e"}.`);
      return;
    }
    productionRunning = true;
    produceButton.disabled = true;
    output.classList.remove("is-visible");
    productionProgress.style.width = "7%";
    setProductionStatus("Aufnahmen werden lokal zusammengesetzt …");
    try {
      const decoder = new (window.AudioContext || window.webkitAudioContext)();
      const decoded = [];
      for (let index = 0; index < state.segments.length; index += 1) {
        const arrayBuffer = await recordings.get(segmentId(index)).arrayBuffer();
        decoded.push(await decoder.decodeAudioData(arrayBuffer.slice(0)));
        productionProgress.style.width = `${10 + ((index + 1) / state.segments.length) * 30}%`;
      }
      await decoder.close();
      const duration = decoded.reduce((total, item) => total + item.duration, 0) + Math.max(0, decoded.length - 1) * GAP_SECONDS;
      const totalFrames = Math.ceil((duration + 0.1) * TARGET_SAMPLE_RATE);
      productionProgress.style.width = "44%";
      setProductionStatus("Rohfassung wird lokal zusammengesetzt …");
      const rawRendered = await renderRawMix(decoded, totalFrames);
      const rawSamples = new Float32Array(rawRendered.getChannelData(0));
      const rawWav = encodeWav(rawSamples, TARGET_SAMPLE_RATE);
      const rawMp3 = encodeMp3(rawSamples, TARGET_SAMPLE_RATE);
      productionProgress.style.width = "63%";
      setProductionStatus("Browser-Studio-Kette arbeitet …");
      const rendered = await renderStudioMix(decoded, totalFrames);
      productionProgress.style.width = "78%";
      const samples = normalisedMono(rendered);
      const wav = encodeWav(samples, TARGET_SAMPLE_RATE);
      setProductionStatus("Studio-MP3 wird erzeugt …");
      const mp3 = encodeMp3(samples, TARGET_SAMPLE_RATE);
      const stem = fileStem();
      revokeDownloads();
      setDownload(downloadRawWav, rawWav, `${stem}-roh.wav`);
      setDownload(downloadRawMp3, rawMp3, `${stem}-roh.mp3`);
      setDownload(downloadWav, wav, `${stem}-studio.wav`);
      setDownload(downloadMp3, mp3, `${stem}-studio.mp3`);
      outputStatus.textContent = `Fertig: Rohfassung und Studio-Fassung liegen jeweils als WAV und MP3 vor.`;
      output.classList.add("is-visible");
      productionProgress.style.width = "100%";
      setProductionStatus("Enddateien sind nur in diesem Browser bereit und können jetzt heruntergeladen werden.");
    } catch (error) {
      productionProgress.style.width = "0";
      setProductionStatus(error.message || "Die lokale Produktion konnte nicht abgeschlossen werden.");
    } finally {
      productionRunning = false;
      renderSegments();
    }
  }

  async function useText() {
    if (recording) return;
    const segments = splitParagraphs(textInput.value);
    if (!segments.length) {
      setRecordingStatus("Bitte zuerst einen Sprechertext einfügen.");
      return;
    }
    if (state.segments.length && !window.confirm("Der bisherige Text und alle lokalen Segmentaufnahmen werden gelöscht. Fortfahren?")) return;
    await clearRecordings();
    recordings.clear();
    revokePreviewUrls();
    state.title = titleInput.value.trim();
    state.segments = segments;
    textInput.value = segments.join("\n\n");
    saveState();
    output.classList.remove("is-visible");
    productionProgress.style.width = "0";
    setRecordingStatus(`${segments.length} Absätze bereit. Beginne mit Absatz 1.`);
    setProductionStatus("Noch keine Enddatei erzeugt.");
    renderSegments();
  }

  async function clearAll() {
    if (recording || !state.segments.length || !window.confirm("Text und alle lokal gespeicherten Segmentaufnahmen auf diesem Gerät löschen?")) return;
    await clearRecordings();
    recordings.clear();
    revokePreviewUrls();
    revokeDownloads();
    state.title = "";
    state.segments = [];
    localStorage.removeItem(STATE_KEY);
    titleInput.value = "";
    textInput.value = "";
    output.classList.remove("is-visible");
    productionProgress.style.width = "0";
    setRecordingStatus("Lokale Aufnahme gelöscht.");
    setProductionStatus("Noch keine Enddatei erzeugt.");
    renderSegments();
  }

  async function initialize() {
    restoreState();
    try {
      const stored = await readRecordings();
      stored.forEach((item) => recordings.set(item.id, item.blob));
      if (state.segments.length) setRecordingStatus(`${state.segments.length} lokale Absätze wiederhergestellt.`);
    } catch {
      setRecordingStatus("Lokaler Aufnahmespeicher ist in diesem Browser nicht verfügbar.");
    }
    renderSegments();
  }

  useTextButton.addEventListener("click", useText);
  clearAllButton.addEventListener("click", clearAll);
  produceButton.addEventListener("click", produce);
  window.addEventListener("beforeunload", () => {
    revokePreviewUrls();
    revokeDownloads();
  });
  initialize();
})();
