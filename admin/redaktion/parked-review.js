// Warum eine Fassung geparkt ist, in einem Satz.
//
// Natalie am 17.09.2026: „Hier ist gar kein Freigeben-Button?" und „Aber bei
// Freigeben steht eine 1 oben. Ich muss also etwas tun." Genau so war es: der
// Reiter zählte die Fassung als offen, die App nahm den Freigeben-Knopf weg —
// richtig, denn eine Fassung, deren Veröffentlichung gescheitert ist, darf nicht
// einfach erneut freigegeben werden — und nannte den Grund nicht. Eine
// Sackgasse. Der Grund steht im Datensatz; hier wird er zu einem Satz mit einer
// Empfehlung, was zu tun ist.
const GRUENDE = {
  PERSONAL_EPISODE_ALREADY_PUBLISHED: {
    was: 'Zu dieser Folge ist schon eine Analyse veröffentlicht — diese hier ist eine zweite zur selben Sendung und Folge.',
    tun: 'Nicht veröffentlichen. Sonst stehen zwei Analysen zur gleichen Folge im Ticker.',
  },
  PERSONAL_SLUG_COLLISION: {
    was: 'Unter dieser Adresse steht schon ein Beitrag.',
    tun: 'Mit Kommentar zurückgeben — die Redaktion vergibt eine neue Adresse.',
  },
  PERSONAL_PUBLISHED_EDITION_CHANGED: {
    was: 'Die veröffentlichte Fassung hat sich seit Deiner Freigabe geändert.',
    tun: 'Mit Kommentar zurückgeben, damit die Fassung auf den aktuellen Stand gesetzt wird.',
  },
  EDITORIAL_REVISION_TARGET_MISSING: {
    was: 'Die Ausgabe, auf die sich diese Korrekturfassung bezieht, ist nicht mehr auffindbar.',
    tun: 'Mit Kommentar zurückgeben — die Korrektur braucht ein gültiges Ziel.',
  },
};

export function parkedReason(review) {
  if (review?.status !== 'NEEDS_REVIEW') return null;
  const code = String(review?.publication?.error || '').trim();
  const bekannt = GRUENDE[code];
  return {
    code: code || null,
    kopf: 'Diese Fassung ist geparkt',
    was: bekannt?.was
      || 'Du hast diese Fassung freigegeben, die Veröffentlichung ist danach fehlgeschlagen.',
    warum: 'Deshalb fehlt „Diese Fassung freigeben": eine Fassung, deren Veröffentlichung gescheitert ist, wird nicht ein zweites Mal durchgelassen, ohne dass der Grund behoben ist.',
    tun: bekannt?.tun
      || 'Mit Kommentar zurückgeben, damit die Redaktion den Grund behebt — oder nicht veröffentlichen.',
  };
}

export const PARKED_CODES = Object.keys(GRUENDE);
