(function () {
  const form = document.getElementById("private-video-form");
  const canvas = document.getElementById("video-canvas");
  const context = canvas.getContext("2d");
  const imageInput = document.getElementById("image-file");
  const audioUrlInput = document.getElementById("audio-url");
  const audioFileInput = document.getElementById("audio-file");
  const ratioSelect = document.getElementById("video-ratio");
  const fitSelect = document.getElementById("image-fit");
  const motionInput = document.getElementById("motion-enabled");
  const renderButton = document.getElementById("render-button");
  const resetButton = document.getElementById("reset-button");
  const progressBar = document.getElementById("progress-bar");
  const statusText = document.getElementById("video-status");
  const downloadLink = document.getElementById("download-link");

  let previewImage = null;
  let currentDownloadUrl = null;
  let recordingAbort = false;

  const sizes = {
    square: { width: 1080, height: 1080 },
    wide: { width: 1920, height: 1080 },
    vertical: { width: 1080, height: 1920 },
  };

  function setStatus(message, tone) {
    statusText.textContent = message;
    if (tone) statusText.dataset.tone = tone;
    else delete statusText.dataset.tone;
  }

  function setProgress(value) {
    progressBar.style.width = `${Math.max(0, Math.min(100, value))}%`;
  }

  function revokeDownload() {
    if (currentDownloadUrl) URL.revokeObjectURL(currentDownloadUrl);
    currentDownloadUrl = null;
    downloadLink.classList.remove("is-visible");
    downloadLink.removeAttribute("href");
  }

  function resizeCanvas() {
    const size = sizes[ratioSelect.value] || sizes.square;
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.style.aspectRatio = `${size.width} / ${size.height}`;
    drawFrame(0);
  }

  function getSupportedMimeType() {
    const candidates = [
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];

    return candidates.find((candidate) => {
      return window.MediaRecorder && MediaRecorder.isTypeSupported(candidate);
    }) || "";
  }

  function fileExtensionFor(mimeType) {
    return mimeType.includes("mp4") ? "mp4" : "webm";
  }

  function drawBackground() {
    context.fillStyle = "#f6f1e8";
    context.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = context.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.42,
      0,
      canvas.width * 0.5,
      canvas.height * 0.42,
      Math.max(canvas.width, canvas.height) * 0.82,
    );
    gradient.addColorStop(0, "rgba(255,255,255,0.88)");
    gradient.addColorStop(1, "rgba(239,248,243,0.72)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawFrame(timeSeconds) {
    drawBackground();

    if (!previewImage) {
      context.fillStyle = "#0b1020";
      context.font = `700 ${Math.round(canvas.width / 28)}px Inter, sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("Bild auswählen", canvas.width / 2, canvas.height / 2);
      return;
    }

    const fit = fitSelect.value;
    const imageRatio = previewImage.naturalWidth / previewImage.naturalHeight;
    const canvasRatio = canvas.width / canvas.height;
    const useCover = fit === "cover";
    let drawWidth;
    let drawHeight;

    if ((useCover && imageRatio > canvasRatio) || (!useCover && imageRatio < canvasRatio)) {
      drawHeight = canvas.height;
      drawWidth = drawHeight * imageRatio;
    } else {
      drawWidth = canvas.width;
      drawHeight = drawWidth / imageRatio;
    }

    const motionScale = motionInput.checked ? 1 + 0.018 * Math.sin(timeSeconds * 0.35) : 1;
    drawWidth *= motionScale;
    drawHeight *= motionScale;

    const offsetX = motionInput.checked ? Math.sin(timeSeconds * 0.22) * canvas.width * 0.012 : 0;
    const offsetY = motionInput.checked ? Math.cos(timeSeconds * 0.18) * canvas.height * 0.012 : 0;
    const x = (canvas.width - drawWidth) / 2 + offsetX;
    const y = (canvas.height - drawHeight) / 2 + offsetY;

    context.save();
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(previewImage, x, y, drawWidth, drawHeight);
    context.restore();
  }

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("Bitte zuerst ein Bild auswählen."));
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Das Bild konnte nicht geladen werden."));
      };
      image.src = objectUrl;
    });
  }

  function normalizeAudioUrl(value) {
    const trimmed = value.trim();
    if (!trimmed) return "";

    try {
      const url = new URL(trimmed);
      if (window.location.protocol === "https:" && url.protocol === "http:") {
        url.protocol = "https:";
      }
      return url.toString();
    } catch {
      return trimmed;
    }
  }

  function deriveKnownAudioUrl(value) {
    const trimmed = value.trim();
    if (!trimmed) return "";

    try {
      const url = new URL(trimmed);
      const songMatch = url.pathname.match(/\/song\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (songMatch && /(^|\.)3bfin\.com$/i.test(url.hostname)) {
        return `https://cdn1.suno.ai/${songMatch[1]}.mp3`;
      }
    } catch {
      const idMatch = trimmed.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (idMatch && trimmed.includes("3bfin.com")) {
        return `https://cdn1.suno.ai/${idMatch[1]}.mp3`;
      }
    }

    return normalizeAudioUrl(trimmed);
  }

  async function objectUrlFromAudioUrl(url) {
    const normalizedUrl = deriveKnownAudioUrl(url);
    const response = await fetch(normalizedUrl, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`Die Audio-URL konnte nicht geladen werden (${response.status}).`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("audio") && !contentType.includes("octet-stream")) {
      throw new Error("Die URL liefert keine direkt nutzbare Audiodatei. Bitte die Audiodatei herunterladen und als Datei hochladen.");
    }

    const blob = await response.blob();
    return { objectUrl: URL.createObjectURL(blob), resolvedUrl: normalizedUrl };
  }

  async function getAudioObjectUrl() {
    const file = audioFileInput.files[0];
    if (file) return { url: URL.createObjectURL(file), revoke: true };

    const url = audioUrlInput.value.trim();
    if (!url) {
      throw new Error("Bitte eine Audio-URL eintragen oder eine Audiodatei hochladen.");
    }

    try {
      const audio = await objectUrlFromAudioUrl(url);
      return { url: audio.objectUrl, revoke: true, resolvedUrl: audio.resolvedUrl };
    } catch (error) {
      throw new Error(`${error.message} Fremde Player-Seiten blockieren das oft. Nutze in diesem Fall den Audiodatei-Upload.`);
    }
  }

  function waitForAudioMetadata(audio) {
    return new Promise((resolve, reject) => {
      if (audio.readyState >= 1 && Number.isFinite(audio.duration) && audio.duration > 0) {
        resolve();
        return;
      }

      const timeout = window.setTimeout(() => {
        reject(new Error("Die Audiodatei liefert keine lesbare Dauer."));
      }, 12000);

      audio.addEventListener("loadedmetadata", () => {
        window.clearTimeout(timeout);
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
          reject(new Error("Die Audiodauer konnte nicht gelesen werden."));
          return;
        }
        resolve();
      }, { once: true });

      audio.addEventListener("error", () => {
        window.clearTimeout(timeout);
        reject(new Error("Die Audiodatei konnte nicht abgespielt werden."));
      }, { once: true });
    });
  }

  function stopRecorderWhenAudioEnds(audio, recorder) {
    return new Promise((resolve) => {
      audio.addEventListener("ended", () => {
        if (recorder.state !== "inactive") recorder.stop();
      }, { once: true });
      recorder.addEventListener("stop", resolve, { once: true });
    });
  }

  async function renderVideo(event) {
    event.preventDefault();
    if (!window.MediaRecorder) {
      setStatus("Dieser Browser kann im Moment keine Videos im Browser erzeugen. Bitte Chrome, Edge oder Safari aktuell verwenden.", "error");
      return;
    }

    recordingAbort = false;
    revokeDownload();
    setProgress(0);
    setStatus("Vorbereitung läuft ...");
    renderButton.disabled = true;

    let audioUrlRecord = null;
    let animationFrame = 0;
    let audioContext = null;

    try {
      previewImage = await loadImageFromFile(imageInput.files[0]);
      resizeCanvas();
      audioUrlRecord = await getAudioObjectUrl();
      if (audioUrlRecord.resolvedUrl && audioUrlRecord.resolvedUrl !== normalizeAudioUrl(audioUrlInput.value)) {
        setStatus("3bfin-Link erkannt. Die direkte MP3-Datei wurde automatisch gefunden ...");
      }

      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.src = audioUrlRecord.url;
      audio.preload = "auto";
      await waitForAudioMetadata(audio);

      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        throw new Error("Dieser Browser meldet kein unterstütztes Videoformat für MediaRecorder.");
      }

      audioContext = new AudioContext();
      const sourceNode = audioContext.createMediaElementSource(audio);
      const destinationNode = audioContext.createMediaStreamDestination();
      sourceNode.connect(destinationNode);

      const canvasStream = canvas.captureStream(30);
      const mixedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destinationNode.stream.getAudioTracks(),
      ]);
      const recorder = new MediaRecorder(mixedStream, {
        mimeType,
        videoBitsPerSecond: 4500000,
        audioBitsPerSecond: 160000,
      });
      const chunks = [];

      recorder.addEventListener("dataavailable", (chunkEvent) => {
        if (chunkEvent.data && chunkEvent.data.size > 0) chunks.push(chunkEvent.data);
      });

      const startedAt = performance.now();
      const animate = () => {
        const elapsedSeconds = (performance.now() - startedAt) / 1000;
        drawFrame(elapsedSeconds);
        if (Number.isFinite(audio.duration)) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
        if (!recordingAbort && recorder.state !== "inactive") {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      setStatus(`Aufnahme läuft (${fileExtensionFor(mimeType).toUpperCase()}) ...`);
      recorder.start(1000);
      await audioContext.resume();
      await audio.play();
      animate();
      await stopRecorderWhenAudioEnds(audio, recorder);

      cancelAnimationFrame(animationFrame);
      mixedStream.getTracks().forEach((track) => track.stop());
      await audioContext.close();
      audioContext = null;

      const extension = fileExtensionFor(mimeType);
      const blob = new Blob(chunks, { type: mimeType });
      currentDownloadUrl = URL.createObjectURL(blob);
      downloadLink.href = currentDownloadUrl;
      downloadLink.download = `bild-audio-video.${extension}`;
      downloadLink.classList.add("is-visible");
      setProgress(100);
      setStatus(`Fertig. Das Video kann jetzt heruntergeladen werden (${extension.toUpperCase()}, ${Math.round(blob.size / 1024 / 1024 * 10) / 10} MB).`, "success");
    } catch (error) {
      setStatus(error.message || "Das Video konnte nicht erstellt werden.", "error");
      setProgress(0);
    } finally {
      if (audioContext) await audioContext.close().catch(() => {});
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (audioUrlRecord && audioUrlRecord.revoke) URL.revokeObjectURL(audioUrlRecord.url);
      renderButton.disabled = false;
    }
  }

  function resetTool() {
    recordingAbort = true;
    form.reset();
    previewImage = null;
    revokeDownload();
    setProgress(0);
    resizeCanvas();
    setStatus("Bild und Audio auswählen, dann Video erstellen.");
  }

  imageInput.addEventListener("change", async () => {
    try {
      previewImage = await loadImageFromFile(imageInput.files[0]);
      drawFrame(0);
      setStatus("Bild geladen. Jetzt Audio auswählen oder URL eintragen.");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  ratioSelect.addEventListener("change", resizeCanvas);
  fitSelect.addEventListener("change", () => drawFrame(0));
  motionInput.addEventListener("change", () => drawFrame(0));
  resetButton.addEventListener("click", resetTool);
  form.addEventListener("submit", renderVideo);

  resizeCanvas();
})();
