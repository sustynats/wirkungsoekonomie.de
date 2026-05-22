(function () {
  const root = document.querySelector("[data-kompass-root]");
  if (!root) return;

  const state = {
    mode: "Verstehen",
    topic: "",
    questionId: "",
    depth: "einfach",
    topics: [],
    questions: [],
    answers: [],
    paths: [],
  };

  const publishedOnly = (item) => item.status === "published" || item.status === "explicitly_approved_for_compass";

  const els = {
    topicGrid: root.querySelector("[data-compass-topic-grid]"),
    questionList: root.querySelector("[data-compass-question-list]"),
    suggestionCount: root.querySelector("[data-compass-suggestion-count]"),
    answerPanel: root.querySelector("[data-compass-answer-panel]"),
    modeButtons: Array.from(root.querySelectorAll("[data-mode]")),
    query: root.querySelector("#compass-query"),
    submit: root.querySelector("[data-compass-submit]"),
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadJson(path) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`Kompass-Daten nicht verfügbar: ${path}`);
    return response.json();
  }

  async function init() {
    try {
      const [topics, questions, answers, paths] = await Promise.all([
        loadJson("content/kompass/compass-topics.json"),
        loadJson("content/kompass/compass-questions.json"),
        loadJson("content/kompass/compass-answer-templates.json"),
        loadJson("content/kompass/impact-paths.json"),
      ]);
      state.topics = (topics.topics || []).filter(publishedOnly);
      state.questions = (questions.questions || []).filter(publishedOnly);
      state.answers = (answers.answers || []).filter(publishedOnly);
      state.paths = (paths.paths || []).filter(publishedOnly);
      renderTopics();
      renderQuestions();
      bindEvents();
      selectQuestion("bio-apfel-guenstiger");
    } catch (error) {
      els.answerPanel.innerHTML = `<article class="confidence-notice"><strong>Kompass-Daten konnten nicht geladen werden.</strong><p>${escapeHtml(error.message)}</p></article>`;
    }
  }

  function bindEvents() {
    els.modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.mode = button.dataset.mode || "Verstehen";
        state.topic = "";
        els.query.value = "";
        els.modeButtons.forEach((item) => {
          const active = item === button;
          item.classList.toggle("active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        renderTopics();
        renderQuestions();
      });
    });

    els.submit.addEventListener("click", selectFromInput);
    els.query.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        selectFromInput();
      }
    });
    els.query.addEventListener("input", renderQuestions);
  }

  function questionMatches(question, query) {
    if (!query) return true;
    const haystack = [question.question, ...(question.aliases || []), question.topic, question.mode].join(" ").toLowerCase();
    return haystack.includes(query);
  }

  function currentQuestions() {
    const query = (els.query.value || "").trim().toLowerCase();
    return state.questions
      .filter((question) => question.mode === state.mode || query.length >= 2)
      .filter((question) => !state.topic || question.topic === state.topic)
      .filter((question) => questionMatches(question, query))
      .slice(0, 12);
  }

  function renderTopics() {
    els.topicGrid.innerHTML = state.topics
      .map((topic) => {
        const active = state.topic === topic.title;
        return `<button class="compass-topic-card${active ? " active" : ""}" type="button" data-topic="${escapeHtml(topic.title)}" aria-pressed="${active}">
          <span>${escapeHtml(topic.title)}</span>
          <small>${escapeHtml(topic.description)}</small>
        </button>`;
      })
      .join("");
    els.topicGrid.querySelectorAll("[data-topic]").forEach((button) => {
      button.addEventListener("click", () => {
        state.topic = state.topic === button.dataset.topic ? "" : button.dataset.topic;
        renderTopics();
        renderQuestions();
      });
    });
  }

  function renderQuestions() {
    const questions = currentQuestions();
    els.suggestionCount.textContent = `${questions.length} passende Einstiege`;
    els.questionList.innerHTML = questions
      .map((question) => `<button type="button" class="compass-question-card" data-question-id="${escapeHtml(question.id)}">
        <span>${escapeHtml(question.question)}</span>
        <small>${escapeHtml(question.mode)} · ${escapeHtml(question.topic)}</small>
      </button>`)
      .join("");
    els.questionList.querySelectorAll("[data-question-id]").forEach((button) => {
      button.addEventListener("click", () => selectQuestion(button.dataset.questionId));
    });
  }

  function selectFromInput() {
    const query = (els.query.value || "").trim().toLowerCase();
    const match = state.questions.find((question) => questionMatches(question, query));
    if (match) {
      selectQuestion(match.id);
    } else {
      renderNoAnswer(query);
    }
  }

  function selectQuestion(id) {
    const question = state.questions.find((item) => item.id === id);
    if (!question) return;
    const answer = state.answers.find((item) => item.id === question.answer_template_id);
    if (!answer || !publishedOnly(answer)) {
      renderNoAnswer(question.question);
      return;
    }
    state.questionId = id;
    state.depth = "einfach";
    els.query.value = question.question;
    renderAnswer(question, answer);
  }

  function renderNoAnswer(query) {
    els.answerPanel.innerHTML = `<article class="confidence-notice">
      <p class="hero-kicker">Noch keine freigegebene Kompass-Antwort</p>
      <h3>Dazu existiert in der aktuellen WÖk-Systematik noch keine belastbare Bewertungslogik.</h3>
      <p>Gesucht: ${escapeHtml(query)}. Der Kompass nutzt im MVP nur veröffentlichte oder ausdrücklich freigegebene Wissensbausteine.</p>
    </article>`;
  }

  function renderAnswer(question, answer) {
    const level = answer.levels[state.depth] || answer.levels.einfach;
    const path = state.paths.find((item) => item.id === answer.impact_path_id);
    els.answerPanel.innerHTML = `
      <article class="compass-answer-card">
        <div class="compass-answer-head">
          <div>
            <p class="hero-kicker">${escapeHtml(question.mode)} · ${escapeHtml(question.topic)}</p>
            <h2>${escapeHtml(question.question)}</h2>
          </div>
          <div class="deep-dive-toggle" aria-label="Antworttiefe wählen">
            ${["einfach", "fachlich", "systemisch"].map((depth) => `<button type="button" class="${state.depth === depth ? "active" : ""}" data-depth="${depth}" aria-pressed="${state.depth === depth}">${escapeHtml(answer.levels[depth].label)}</button>`).join("")}
          </div>
        </div>
        <section class="short-answer-box"><p class="hero-kicker">Kurzantwort</p><p>${escapeHtml(level.short_answer)}</p></section>
        <section class="one-sentence-box"><p class="hero-kicker">In einem Satz</p><p>${escapeHtml(level.one_sentence)}</p></section>
        ${ImpactPathVisualizer(path)}
        ${MPDPanel(answer.mpd)}
        ${SDGRelationPanel(answer.sdg_relations)}
        ${GlossaryTrail(answer.glossary_terms)}
        ${RelatedKnowledgeCards(answer.related_cards)}
        ${answer.misunderstanding ? `<section class="confidence-notice"><p class="hero-kicker">Missverständnis vermeiden</p><p>${escapeHtml(answer.misunderstanding)}</p></section>` : ""}
        ${SourcePanel(answer.sources)}
        <section class="confidence-notice"><p class="hero-kicker">Transparenz</p><p>${escapeHtml(answer.confidence_notice || "wirkungsanalytische Einordnung, keine amtliche Bewertung")}</p></section>
      </article>`;
    els.answerPanel.querySelectorAll("[data-depth]").forEach((button) => {
      button.addEventListener("click", () => {
        state.depth = button.dataset.depth || "einfach";
        renderAnswer(question, answer);
      });
    });
  }

  function ImpactPathVisualizer(path) {
    if (!path) return "";
    if (path.lanes) {
      return `<section class="impact-path-visualizer"><p class="hero-kicker">Wirkungspfad</p><div class="impact-path-lanes">${path.lanes
        .map((lane) => `<div class="impact-path-lane"><strong>${escapeHtml(lane.title)}</strong><ol>${lane.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></div>`)
        .join("")}</div></section>`;
    }
    return `<section class="impact-path-visualizer"><p class="hero-kicker">Wirkungspfad</p><ol>${(path.steps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol></section>`;
  }

  function MPDPanel(mpd) {
    return `<section class="mpd-panel"><p class="hero-kicker">Mensch · Planet · Demokratie</p><div>${["Mensch", "Planet", "Demokratie"]
      .map((key) => `<article><strong>${key}</strong><p>${escapeHtml(mpd?.[key] || "Kein spezifischer Bezug hinterlegt.")}</p></article>`)
      .join("")}</div></section>`;
  }

  function SDGRelationPanel(items) {
    return `<section class="sdg-relation-panel"><p class="hero-kicker">SDG-/SDG+-Bezug</p><div>${(items || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>`;
  }

  function GlossaryTrail(items) {
    return `<section class="glossary-trail"><p class="hero-kicker">Zentrale Begriffe</p><div>${(items || [])
      .map((term) => `<a href="glossar.html">${escapeHtml(term)}</a>`)
      .join("")}</div></section>`;
  }

  function RelatedKnowledgeCards(items) {
    return `<section class="related-knowledge-cards"><p class="hero-kicker">Mehr dazu</p><div>${(items || [])
      .map((item) => `<article>${escapeHtml(item)}</article>`)
      .join("")}</div></section>`;
  }

  function SourcePanel(sources) {
    return `<details class="source-panel" open><summary>Grundlage dieser Antwort</summary><div>${(sources || [])
      .map((source) => `<article><strong>${escapeHtml(source.type)}: ${escapeHtml(source.title)}</strong><p>${escapeHtml(source.note)}</p>${source.url ? `<a class="text-link" href="${escapeHtml(source.url)}">Quelle öffnen</a>` : ""}</article>`)
      .join("")}</div></details>`;
  }

  init();
})();
