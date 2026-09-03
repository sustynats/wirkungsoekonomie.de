(function () {
  "use strict";

  const DB_NAME = "woek-studio-aufnahme";
  const DB_STORE = "segments";
  const STATE_KEY = "woek-studio-aufnahme-state-v1";
  const GAP_SECONDS = 0.32;
  const TARGET_SAMPLE_RATE = 48000;
  const TARGET_PEAK = Math.pow(10, -1.5 / 20);
  const SEGMENT_START_GUARD_SECONDS = 0.24;
  const SEGMENT_FADE_SECONDS = 0.018;
  const MICROPHONE_SETTLE_MS = 180;

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
  const prepareSegmentArchiveButton = document.getElementById("prepare-segment-archive");
  const downloadSegmentArchive = document.getElementById("download-segment-archive");

  const state = { title: "", segments: [] };
  const recordings = new Map();
  const downloads = [];
  let recording = null;
  let recordingStarting = false;
  let recordingStartingIndex = null;
  let recordingSaving = false;
  let recordingSavingIndex = null;
  let nextMicrophoneStartAt = 0;
  let segmentArchiveUrl = null;
  let activePreview = null;
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
    if (!activePreview) return;
    activePreview.host.replaceChildren();
    URL.revokeObjectURL(activePreview.url);
    activePreview = null;
  }

  function revokeDownloads() {
    downloads.splice(0).forEach((url) => URL.revokeObjectURL(url));
  }

  function clearSegmentArchive() {
    if (segmentArchiveUrl) URL.revokeObjectURL(segmentArchiveUrl);
    segmentArchiveUrl = null;
    downloadSegmentArchive.hidden = true;
    downloadSegmentArchive.removeAttribute("href");
    downloadSegmentArchive.removeAttribute("download");
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

  function recordingIsBusy() {
    return Boolean(recording || recordingStarting || recordingSaving);
  }

  function updateProduceButton() {
    produceButton.disabled = productionRunning || recordingIsBusy() || !state.segments.length;
  }

  function rawSegmentExtension(blob) {
    if (blob.type.includes("mp4")) return "m4a";
    if (blob.type.includes("ogg")) return "ogg";
    if (blob.type.includes("webm")) return "webm";
    return "audio";
  }

  function rawSegmentFileName(index, blob, stem = fileStem()) {
    return `${stem}-absatz-${String(index + 1).padStart(2, "0")}.${rawSegmentExtension(blob)}`;
  }

  function downloadRawSegment(index) {
    const blob = recordings.get(segmentId(index));
    if (!blob) return;
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = rawSegmentFileName(index, blob);
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function playRawSegment(index) {
    const id = segmentId(index);
    const blob = recordings.get(id);
    if (!blob) return;
    if (activePreview && activePreview.id === id) {
      activePreview.audio.play().catch(() => setRecordingStatus("Die Vorschau konnte nicht gestartet werden. Du kannst den Rohschnipsel dennoch herunterladen."));
      return;
    }
    revokePreviewUrls();
    const card = segmentsElement.querySelector(`[data-segment-index="${index}"]`);
    if (!card) return;
    const host = card.querySelector("[data-segment-audio]");
    const audio = document.createElement("audio");
    const url = URL.createObjectURL(blob);
    audio.controls = true;
    audio.src = url;
    audio.preload = "auto";
    activePreview = { id, url, audio, host };
    host.replaceChildren(audio);
    audio.play().catch(() => setRecordingStatus("Die Vorschau konnte nicht gestartet werden. Du kannst den Rohschnipsel dennoch herunterladen."));
  }

  function updateSegmentCard(index) {
    const card = segmentsElement.querySelector(`[data-segment-index="${index}"]`);
    if (!card) return;
    const id = segmentId(index);
    const blob = recordings.get(id);
    const isActive = Boolean(recording && recording.index === index);
    const isStarting = recordingStarting && recordingStartingIndex === index;
    const isSaving = recordingSaving && recordingSavingIndex === index;
    const busyElsewhere = recordingIsBusy() && !isActive && !isStarting && !isSaving;
    card.classList.toggle("is-recording", isActive || isStarting);

    const status = card.querySelector("[data-segment-status]");
    status.textContent = isActive ? "Aufnahme läuft" : isStarting ? "Mikrofon wird gestartet" : isSaving ? "Wird gespeichert" : blob ? "Gespeichert" : "Noch offen";

    const actions = card.querySelector("[data-segment-actions]");
    actions.replaceChildren();
    if (isActive) {
      actions.append(makeButton("Stopp & speichern", "studio-button", stopRecording));
    } else {
      actions.append(makeButton(blob ? "Neu aufnehmen" : "Sprechen", "studio-button", () => startRecording(index), busyElsewhere || isStarting || isSaving));
    }
    if (blob) {
      actions.append(makeButton("Anhören", "studio-button studio-button--quiet", () => playRawSegment(index), recordingIsBusy()));
      actions.append(makeButton("Rohschnipsel laden", "studio-button studio-button--quiet", () => downloadRawSegment(index), recordingIsBusy()));
    }
  }

  function updateSegmentCards() {
    state.segments.forEach((_, index) => updateSegmentCard(index));
    updateProduceButton();
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
      const card = document.createElement("article");
      card.className = "studio-segment";
      card.dataset.segmentIndex = index;

      const top = document.createElement("div");
      top.className = "studio-segment-top";
      const number = document.createElement("span");
      number.className = "studio-segment-number";
      number.textContent = `Absatz ${String(index + 1).padStart(2, "0")}`;
      const status = document.createElement("span");
      status.className = "studio-segment-state";
      status.dataset.segmentStatus = "";
      top.append(number, status);

      const paragraph = document.createElement("p");
      paragraph.className = "studio-segment-text";
      paragraph.textContent = text;

      const actions = document.createElement("div");
      actions.className = "studio-actions";
      actions.dataset.segmentActions = "";
      const audio = document.createElement("div");
      audio.dataset.segmentAudio = "";
      card.append(top, paragraph, actions, audio);
      fragment.append(card);
    });
    segmentsElement.append(fragment);
    updateSegmentCards();
  }

  function recorderMimeType() {
    const candidates = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
    return candidates.find((item) => window.MediaRecorder && MediaRecorder.isTypeSupported(item)) || "";
  }

  function captureViewport() {
    return { left: window.scrollX, top: window.scrollY };
  }

  function restoreViewport(viewport) {
    if (!viewport) return;
    requestAnimationFrame(() => {
      window.scrollTo(viewport.left, viewport.top);
      requestAnimationFrame(() => window.scrollTo(viewport.left, viewport.top));
    });
  }

  async function acquireMicrophoneStream() {
    const waitMs = Math.max(0, nextMicrophoneStartAt - Date.now());
    if (waitMs) await new Promise((resolve) => window.setTimeout(resolve, waitMs));
    return navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, sampleRate: TARGET_SAMPLE_RATE, echoCancellation: false, noiseSuppression: true, autoGainControl: false },
    });
  }

  function stopMicrophoneStream(stream) {
    if (stream) stream.getTracks().forEach((track) => track.stop());
    nextMicrophoneStartAt = Date.now() + MICROPHONE_SETTLE_MS;
  }

  function microphoneErrorMessage(error) {
    if (error && error.name === "NotAllowedError") return "Der Mikrofonzugriff wurde nicht erlaubt.";
    if (error && error.name === "NotReadableError") return "Das Mikrofon ist gerade belegt. Bitte schließe Anruf- oder Audio-Apps und versuche es erneut.";
    if (error && error.name === "AbortError") return "Die Mikrofonverbindung wurde vom Browser beendet. Bitte erneut auf „Sprechen“ tippen.";
    if (error && error.name === "InvalidStateError") return "Die Seite ist gerade nicht aktiv. Bitte zur Studio-Aufnahme zurückkehren und erneut starten.";
    return "Das Mikrofon konnte nicht gestartet werden. Bitte die Seite geöffnet lassen und erneut auf „Sprechen“ tippen.";
  }

  async function startRecording(index) {
    if (recordingIsBusy()) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      setRecordingStatus("Dieser Browser kann keine Mikrofonaufnahme starten. Bitte Safari oder Chrome aktuell verwenden.");
      return;
    }
    const viewport = captureViewport();
    recordingStarting = true;
    recordingStartingIndex = index;
    setRecordingStatus(`Mikrofon für Absatz ${index + 1} wird gestartet …`);
    updateSegmentCards();
    let stream = null;
    try {
      stream = await acquireMicrophoneStream();
      if (document.hidden) {
        stopMicrophoneStream(stream);
        throw new DOMException("Die Seite ist nicht aktiv.", "InvalidStateError");
      }
      const mimeType = recorderMimeType();
      const options = { audioBitsPerSecond: 160000 };
      if (mimeType) options.mimeType = mimeType;
      const recorder = new MediaRecorder(stream, options);
      const chunks = [];
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data && event.data.size) chunks.push(event.data);
      });
      recorder.addEventListener("stop", async () => {
        if (!recording || recording.recorder !== recorder) return;
        recording = null;
        stopMicrophoneStream(stream);
        recordingSaving = true;
        recordingSavingIndex = index;
        updateSegmentCards();
        try {
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          if (blob.size < 1000) throw new Error("Die Aufnahme war zu kurz. Bitte erneut sprechen.");
          await saveRecording(segmentId(index), blob);
          recordings.set(segmentId(index), blob);
          clearSegmentArchive();
          setRecordingStatus(`Absatz ${index + 1} gespeichert. Du kannst ihn anhören oder neu aufnehmen.`);
        } catch (error) {
          setRecordingStatus(error.message || "Die Aufnahme konnte nicht gespeichert werden.");
        } finally {
          recordingSaving = false;
          recordingSavingIndex = null;
          updateSegmentCards();
        }
      }, { once: true });
      recorder.addEventListener("error", () => {
        setRecordingStatus("Der Browser hat die Aufnahme beendet. Bitte den Absatz erneut starten.");
        if (recorder.state !== "inactive") recorder.stop();
      }, { once: true });
      recording = { index, recorder, stream, chunks };
      recordingStarting = false;
      recordingStartingIndex = null;
      recorder.start(1000);
      setRecordingStatus(`Absatz ${index + 1} läuft. Sprich den Text und tippe danach auf „Stopp & speichern“.`);
      updateSegmentCards();
      restoreViewport(viewport);
    } catch (error) {
      recording = null;
      recordingStarting = false;
      recordingStartingIndex = null;
      stopMicrophoneStream(stream);
      updateSegmentCards();
      setRecordingStatus(microphoneErrorMessage(error));
      restoreViewport(viewport);
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

  function preparedSegments(decoded) {
    return decoded.map((buffer) => {
      const trim = Math.min(SEGMENT_START_GUARD_SECONDS, Math.max(0, buffer.duration - 0.08));
      return { buffer, trim, duration: buffer.duration - trim };
    });
  }

  function addSegmentSource(context, segment, destination, startsAt) {
    const source = context.createBufferSource();
    const fade = context.createGain();
    source.buffer = segment.buffer;
    fade.gain.setValueAtTime(0, startsAt);
    fade.gain.linearRampToValueAtTime(1, startsAt + Math.min(SEGMENT_FADE_SECONDS, segment.duration / 2));
    source.connect(fade).connect(destination);
    source.start(startsAt, segment.trim);
  }

  async function renderRawMix(segments, totalFrames) {
    const context = new OfflineAudioContext(1, totalFrames, TARGET_SAMPLE_RATE);
    let startsAt = 0;
    segments.forEach((segment) => {
      addSegmentSource(context, segment, context.destination, startsAt);
      startsAt += segment.duration + GAP_SECONDS;
    });
    return context.startRendering();
  }

  async function renderStudioMix(segments, totalFrames) {
    const context = new OfflineAudioContext(1, totalFrames, TARGET_SAMPLE_RATE);
    const chainInput = buildProcessingChain(context);
    let startsAt = 0;
    segments.forEach((segment) => {
      addSegmentSource(context, segment, chainInput, startsAt);
      startsAt += segment.duration + GAP_SECONDS;
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

  async function prepareSegmentArchive() {
    if (recordingIsBusy() || productionRunning) return;
    const missing = state.segments.map((_, index) => segmentId(index)).filter((id) => !recordings.has(id));
    if (missing.length) {
      setProductionStatus(`Für das Archiv fehlen noch ${missing.length} Absatz${missing.length === 1 ? "" : "e"}.`);
      return;
    }
    if (!window.fflate || !window.fflate.zip) {
      setProductionStatus("Das ZIP-Modul konnte nicht geladen werden. Bitte die Seite neu öffnen und erneut versuchen.");
      return;
    }
    prepareSegmentArchiveButton.disabled = true;
    clearSegmentArchive();
    setProductionStatus("Rohschnipsel werden lokal als ZIP vorbereitet …");
    try {
      const stem = fileStem();
      const files = {};
      for (let index = 0; index < state.segments.length; index += 1) {
        const blob = recordings.get(segmentId(index));
        files[rawSegmentFileName(index, blob, stem)] = new Uint8Array(await blob.arrayBuffer());
      }
      const archive = await new Promise((resolve, reject) => {
        window.fflate.zip(files, { level: 0 }, (error, data) => error ? reject(error) : resolve(data));
      });
      segmentArchiveUrl = URL.createObjectURL(new Blob([archive], { type: "application/zip" }));
      downloadSegmentArchive.href = segmentArchiveUrl;
      downloadSegmentArchive.download = `${stem}-rohschnipsel.zip`;
      downloadSegmentArchive.hidden = false;
      setProductionStatus("Rohschnipsel-ZIP ist lokal bereit. Tippe jetzt auf „Rohschnipsel-ZIP laden“.");
    } catch (error) {
      setProductionStatus(error.message || "Das Rohschnipsel-ZIP konnte nicht erzeugt werden.");
    } finally {
      prepareSegmentArchiveButton.disabled = false;
    }
  }

  async function produce() {
    if (productionRunning || recordingIsBusy()) return;
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
      const segments = preparedSegments(decoded);
      const duration = segments.reduce((total, item) => total + item.duration, 0) + Math.max(0, segments.length - 1) * GAP_SECONDS;
      const totalFrames = Math.ceil((duration + 0.1) * TARGET_SAMPLE_RATE);
      productionProgress.style.width = "44%";
      setProductionStatus("Rohfassung wird lokal zusammengesetzt …");
      const rawRendered = await renderRawMix(segments, totalFrames);
      const rawSamples = new Float32Array(rawRendered.getChannelData(0));
      const rawWav = encodeWav(rawSamples, TARGET_SAMPLE_RATE);
      const rawMp3 = encodeMp3(rawSamples, TARGET_SAMPLE_RATE);
      productionProgress.style.width = "63%";
      setProductionStatus("Browser-Studio-Kette arbeitet …");
      const rendered = await renderStudioMix(segments, totalFrames);
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
    if (recordingIsBusy()) return;
    const segments = splitParagraphs(textInput.value);
    if (!segments.length) {
      setRecordingStatus("Bitte zuerst einen Sprechertext einfügen.");
      return;
    }
    if (state.segments.length && !window.confirm("Der bisherige Text und alle lokalen Segmentaufnahmen werden gelöscht. Fortfahren?")) return;
    await clearRecordings();
    recordings.clear();
    revokePreviewUrls();
    clearSegmentArchive();
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
    if (recordingIsBusy() || !state.segments.length || !window.confirm("Text und alle lokal gespeicherten Segmentaufnahmen auf diesem Gerät löschen?")) return;
    await clearRecordings();
    recordings.clear();
    revokePreviewUrls();
    revokeDownloads();
    clearSegmentArchive();
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
  prepareSegmentArchiveButton.addEventListener("click", prepareSegmentArchive);
  window.addEventListener("beforeunload", () => {
    revokePreviewUrls();
    revokeDownloads();
    clearSegmentArchive();
    if (recording) stopMicrophoneStream(recording.stream);
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return;
    if (recording) stopRecording();
  });
  initialize();
})();
