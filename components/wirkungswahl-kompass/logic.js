"use strict";

/*
 * Pure calculations shared by the browser app and the automated checks.
 * There deliberately is no function that aggregates parties or fields into
 * a winner, total score, ranking, or recommendation.
 */
const WWKLogic = (() => {
  const isAnswered = (answer) =>
    Boolean(answer) && typeof answer.value === "number";

  function proximity(userValue, partyStance) {
    if (partyStance == null) return { key: "keine", label: "keine Position" };

    const value = 1 - Math.abs(userValue - partyStance) / 4;
    if (value >= 0.85) return { key: "hoch", label: "hoch" };
    if (value >= 0.6) return { key: "mittel", label: "mittel" };
    if (value >= 0.375) return { key: "gering", label: "gering" };
    return { key: "gegen", label: "gegensätzlich" };
  }

  function priorityProfile(dimensions, questions, answers) {
    const totals = Object.fromEntries(
      dimensions.map((dimension) => [dimension.id, { sum: 0, count: 0 }]),
    );

    for (const question of questions) {
      const answer = answers[question.id] || {};
      if (!isAnswered(answer) || typeof answer.importance !== "number") continue;

      for (const dimensionId of question.dimensions || []) {
        const total = totals[dimensionId];
        if (!total) continue;
        total.sum += answer.importance;
        total.count += 1;
      }
    }

    return dimensions.map((dimension) => {
      const total = totals[dimension.id];
      return {
        id: dimension.id,
        value: total.count ? total.sum / total.count : 0,
        includedQuestions: total.count,
      };
    });
  }

  return Object.freeze({ isAnswered, proximity, priorityProfile });
})();
