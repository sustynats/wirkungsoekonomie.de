export type NewsletterTemplateLinks = {
  websiteUrl: string;
  confirmationUrl: string;
  unsubscribeUrl: string;
  privacyUrl: string;
  imprintUrl: string;
  replyTo: string;
  startUrl: string;
  glossaryUrl: string;
  toolsUrl: string;
};

export type NewsletterEmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}

function document(title: string, preheader: string, body: string) {
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f5f1e9;color:#20201c;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;">${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1e9;border-collapse:collapse;"><tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#fffdf8;border-collapse:collapse;">
      <tr><td style="padding:24px 32px;background:#0b1020;color:#fffdf8;font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:27px;">Der Wirkungsbrief<br><span style="font-family:Arial,sans-serif;font-size:13px;line-height:20px;color:#9fb0c4;">Wirkung auf Mensch, Planet und Demokratie – verständlich eingeordnet</span></td></tr>
      <tr><td style="height:3px;background:#c6a15b;font-size:0;line-height:0;">&nbsp;</td></tr>
      ${body}
    </table>
  </td></tr></table>
</body></html>`;
}

function footer(links: NewsletterTemplateLinks, includeUnsubscribe = true) {
  const websiteUrl = escapeHtml(links.websiteUrl);
  const privacyUrl = escapeHtml(links.privacyUrl);
  const imprintUrl = escapeHtml(links.imprintUrl);
  const unsubscribeUrl = escapeHtml(links.unsubscribeUrl);
  const replyTo = escapeHtml(links.replyTo);
  const unsubscribeLink = includeUnsubscribe && unsubscribeUrl ? `&nbsp;&middot;&nbsp;<a href="${unsubscribeUrl}" style="color:#e7c98a;text-decoration:underline;">Abbestellen</a>` : "";
  return `<tr><td style="padding:24px 32px;background:#0b1020;color:#dde3ea;font-family:Arial,sans-serif;font-size:15px;line-height:23px;">
    <strong style="color:#fffdf8;">Der Wirkungsbrief</strong><br>Herausgegeben von der Wirkungsökonomie<br>Fragen? Antworten Sie einfach auf diese E-Mail: <a href="mailto:${replyTo}" style="color:#e7c98a;text-decoration:underline;">${replyTo}</a><br><br>
    <a href="${websiteUrl}" style="color:#e7c98a;text-decoration:underline;">Website</a>&nbsp;&middot;&nbsp;<a href="${privacyUrl}" style="color:#e7c98a;text-decoration:underline;">Datenschutz</a>&nbsp;&middot;&nbsp;<a href="${imprintUrl}" style="color:#e7c98a;text-decoration:underline;">Impressum</a>${unsubscribeLink}
  </td></tr>`;
}

function textFooter(links: NewsletterTemplateLinks, includeUnsubscribe = true) {
  return [
    "--",
    "Der Wirkungsbrief",
    "Herausgegeben von der Wirkungsökonomie",
    `Fragen: ${links.replyTo}`,
    `Website: ${links.websiteUrl}`,
    `Datenschutz: ${links.privacyUrl}`,
    `Impressum: ${links.imprintUrl}`,
    ...(includeUnsubscribe && links.unsubscribeUrl ? [`Abbestellen: ${links.unsubscribeUrl}`] : [])
  ].join("\n");
}

export function newsletterDoubleOptInEmail(links: NewsletterTemplateLinks): NewsletterEmailTemplate {
  const confirmationUrl = escapeHtml(links.confirmationUrl);
  const unsubscribeUrl = escapeHtml(links.unsubscribeUrl);
  const text = [
    "DER WIRKUNGSBRIEF",
    "Wirkung auf Mensch, Planet und Demokratie - verständlich eingeordnet",
    "",
    "BITTE BESTÄTIGEN SIE IHRE ANMELDUNG",
    "",
    "Sie haben den Wirkungsbrief angefordert. Damit wir ihn Ihnen senden dürfen, bestätigen Sie bitte einmalig Ihre Anmeldung.",
    "",
    "STATUS: NOCH NICHT AKTIV.",
    "Ohne Ihre Bestätigung senden wir Ihnen nichts zu.",
    "",
    "Der Wirkungsbrief erscheint in unregelmäßigen Abständen und enthält:",
    "",
    "- neue Analysen und Beiträge aus dem Journal",
    "- einen erklärten Fachbegriff je Ausgabe",
    "- Hinweise zu Werkzeugen, Veröffentlichungen und Kursen",
    "",
    "ANMELDUNG BESTÄTIGEN:",
    links.confirmationUrl,
    "",
    "Der Bestätigungslink ist 72 Stunden gültig. Danach können Sie die Anmeldung jederzeit erneut anfordern.",
    "",
    "SIE HABEN DAS NICHT ANGEFORDERT?",
    "Dann ignorieren Sie diese Nachricht bitte - ohne Bestätigung wird keine Anmeldung aktiv. Sie können die Adresse auch dauerhaft sperren lassen:",
    links.unsubscribeUrl,
    "",
    "Wir messen weder E-Mail-Öffnungen noch Klicks.",
    "",
    textFooter(links)
  ].join("\n");
  const body = `<tr><td style="padding:32px 32px 8px;"><h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:36px;color:#0b1020;font-weight:normal;">Bitte bestätigen Sie Ihre Anmeldung</h1><p style="margin:0;font-family:Arial,sans-serif;font-size:17px;line-height:27px;color:#20201c;">Sie haben den Wirkungsbrief angefordert. Damit wir ihn Ihnen senden dürfen, bestätigen Sie bitte einmalig Ihre Anmeldung.</p></td></tr>
    <tr><td style="padding:6px 32px 22px;"><div style="padding:14px 18px;border-left:3px solid #c6a15b;background:#f6f1e8;font-family:Arial,sans-serif;font-size:16px;line-height:25px;color:#3d3d38;"><strong style="color:#0b1020;">Status: noch nicht aktiv.</strong> Ohne Ihre Bestätigung senden wir Ihnen nichts zu.</div></td></tr>
    <tr><td style="padding:0 32px 6px;font-family:Arial,sans-serif;font-size:17px;line-height:27px;color:#20201c;">Der Wirkungsbrief erscheint in unregelmäßigen Abständen und enthält:<ul style="margin:10px 0;padding-left:20px;"><li>neue Analysen und Beiträge aus dem Journal</li><li>einen erklärten Fachbegriff je Ausgabe</li><li>Hinweise zu Werkzeugen, Veröffentlichungen und Kursen</li></ul></td></tr>
    <tr><td style="padding:24px 32px 10px;"><a href="${confirmationUrl}" style="display:inline-block;padding:16px 30px;background:#175646;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-size:17px;font-weight:bold;">Anmeldung bestätigen</a></td></tr>
    <tr><td style="padding:6px 32px 26px;font-family:Arial,sans-serif;font-size:15px;line-height:24px;color:#4a4a44;">Der Bestätigungslink ist <strong>72 Stunden</strong> gültig. Falls die Schaltfläche nicht funktioniert, verwenden Sie bitte diese Adresse:<br><a href="${confirmationUrl}" style="color:#175646;word-break:break-all;">${confirmationUrl}</a><br><br><strong style="color:#0b1020;">Sie haben das nicht angefordert?</strong><br>Dann ignorieren Sie diese Nachricht bitte. Ohne Bestätigung wird keine Anmeldung aktiv. Sie können die Adresse auch <a href="${unsubscribeUrl}" style="color:#175646;">sperren lassen</a>.<br><br>Wir messen weder, ob Sie diese Nachricht öffnen, noch, ob Sie einen Link darin anklicken.</td></tr>
    ${footer(links, false)}`;
  return {
    subject: "Bitte bestätigen Sie Ihre Anmeldung",
    text,
    html: document("Bitte bestätigen Sie Ihre Anmeldung", "Ihre Anmeldung ist noch nicht aktiv. Bitte bestätigen Sie sie innerhalb von 72 Stunden.", body)
  };
}

export function newsletterWelcomeEmail(links: NewsletterTemplateLinks): NewsletterEmailTemplate {
  const websiteUrl = escapeHtml(links.websiteUrl);
  const text = [
    "DER WIRKUNGSBRIEF",
    "Wirkung auf Mensch, Planet und Demokratie - verständlich eingeordnet",
    "",
    "IHRE ANMELDUNG IST AKTIV",
    "",
    "Vielen Dank für Ihre Bestätigung. Sie erhalten den Wirkungsbrief ab der nächsten Ausgabe.",
    "",
    "WORUM ES GEHT",
    "",
    "Wirtschaftliches Handeln wird üblicherweise daran gemessen, was es kostet und was es einbringt. Die Wirkungsökonomie fragt zusätzlich: Was verändert es tatsächlich - für Menschen, für die natürlichen Grundlagen und für das demokratische Zusammenleben?",
    "",
    "Der Wirkungsbrief übersetzt diese Perspektive in konkrete Beispiele: neue Analysen, erklärte Begriffe und Werkzeuge, die Sie selbst ausprobieren können.",
    "",
    "Nachvollziehbar statt behauptet: Zahlen, Quellen und Annahmen werden offengelegt. Wo Wissen fehlt, steht das ausdrücklich dabei.",
    "Ohne Personenbewertung: Bewertet werden Entscheidungen, Produkte und Strukturen - niemals Menschen.",
    "",
    `IN FÜNF MINUTEN VERSTEHEN: ${links.startUrl}`,
    `Begriffe nachschlagen: ${links.glossaryUrl}`,
    `Werkzeuge ausprobieren: ${links.toolsUrl}`,
    "",
    textFooter(links)
  ].join("\n");
  const startUrl = escapeHtml(links.startUrl);
  const glossaryUrl = escapeHtml(links.glossaryUrl);
  const toolsUrl = escapeHtml(links.toolsUrl);
  const body = `<tr><td style="padding:32px 32px 6px;"><h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:36px;color:#0b1020;font-weight:normal;">Ihre Anmeldung ist aktiv</h1><p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:17px;line-height:27px;color:#20201c;">Vielen Dank für Ihre Bestätigung. Sie erhalten den Wirkungsbrief ab der nächsten Ausgabe.</p></td></tr>
    <tr><td style="padding:8px 32px 0;"><div style="padding-top:22px;border-top:1px solid #e4ddd1;"><h2 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:30px;color:#0b1020;font-weight:normal;">Worum es geht</h2><p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:17px;line-height:27px;color:#20201c;">Wirtschaftliches Handeln wird üblicherweise daran gemessen, was es kostet und was es einbringt. Die Wirkungsökonomie fragt zusätzlich: Was verändert es tatsächlich – für Menschen, für die natürlichen Grundlagen und für das demokratische Zusammenleben?</p><p style="margin:0 0 22px;font-family:Arial,sans-serif;font-size:17px;line-height:27px;color:#20201c;">Der Wirkungsbrief übersetzt diese Perspektive in konkrete Beispiele: neue Analysen, erklärte Begriffe und Werkzeuge, die Sie selbst ausprobieren können.</p></div></td></tr>
    <tr><td style="padding:0 32px 22px;"><div style="padding:18px 20px;border-left:3px solid #175646;background:#f6f1e8;font-family:Arial,sans-serif;font-size:16px;line-height:25px;color:#3d3d38;"><p style="margin:0 0 10px;"><strong style="color:#0b1020;">Nachvollziehbar statt behauptet:</strong> Zahlen, Quellen und Annahmen werden offengelegt. Wo Wissen fehlt, steht das ausdrücklich dabei.</p><p style="margin:0;"><strong style="color:#0b1020;">Ohne Personenbewertung:</strong> Bewertet werden Entscheidungen, Produkte und Strukturen – niemals Menschen.</p></div></td></tr>
    <tr><td style="padding:0 32px 8px;"><a href="${startUrl}" style="display:inline-block;padding:16px 30px;background:#175646;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-size:17px;font-weight:bold;">In fünf Minuten verstehen</a></td></tr>
    <tr><td style="padding:14px 32px 24px;font-family:Arial,sans-serif;font-size:17px;line-height:27px;color:#20201c;"><a href="${glossaryUrl}" style="color:#175646;">Begriffe nachschlagen</a> – das Glossar erklärt jeden Fachbegriff in Alltagssprache.<br><a href="${toolsUrl}" style="color:#175646;">Werkzeuge ausprobieren</a> – Rechner und Checks, die die Methode anwendbar machen.</td></tr>
    <tr><td style="padding:0 32px 26px;font-family:Arial,sans-serif;font-size:15px;line-height:24px;color:#4a4a44;"><div style="padding-top:18px;border-top:1px solid #e4ddd1;">Der Empfang ist freiwillig und jederzeit mit einem Klick beendbar – ohne Angabe von Gründen. Wir messen weder Öffnungen noch Klicks. Antworten Sie gern direkt auf diese E-Mail, wenn Sie eine Frage oder einen Einwand haben.</div></td></tr>
    ${footer(links)}`;
  return {
    subject: "Ihre Anmeldung ist aktiv",
    text,
    html: document("Ihre Anmeldung ist aktiv", "Was Sie künftig erhalten – und was die Wirkungsökonomie im Kern unterscheidet.", body)
  };
}

export function newsletterUnsubscribeConfirmedEmail(links: NewsletterTemplateLinks): NewsletterEmailTemplate {
  const text = [
    "DER WIRKUNGSBRIEF",
    "",
    "ABMELDUNG BESTÄTIGT",
    "",
    "Sie erhalten keine weiteren Ausgaben des Wirkungsbriefs. Ihre Adresse wird aus dem Verteiler gelöscht.",
    "",
    "Vielen Dank für Ihr Interesse. Alle Inhalte bleiben frei zugänglich - Sie können sie jederzeit ohne Anmeldung auf der Website lesen.",
    "",
    "Falls Sie sich versehentlich abgemeldet haben oder uns Rückmeldung geben möchten, antworten Sie einfach auf diese E-Mail. Über Kritik an unserer Arbeit freuen wir uns ausdrücklich.",
    "",
    textFooter(links, false)
  ].join("\n");
  const body = `<tr><td style="padding:32px 32px 10px;"><h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:34px;color:#0b1020;font-weight:normal;">Abmeldung bestätigt</h1><p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:17px;line-height:27px;color:#20201c;">Sie erhalten keine weiteren Ausgaben des Wirkungsbriefs. Ihre Adresse wird aus dem Verteiler gelöscht.</p><p style="margin:0 0 22px;font-family:Arial,sans-serif;font-size:17px;line-height:27px;color:#20201c;">Vielen Dank für Ihr Interesse. Alle Inhalte bleiben frei zugänglich – Sie können sie jederzeit ohne Anmeldung auf der Website lesen.</p></td></tr>
    <tr><td style="padding:0 32px 26px;font-family:Arial,sans-serif;font-size:16px;line-height:25px;color:#3d3d38;"><div style="padding-top:18px;border-top:1px solid #e4ddd1;">Falls Sie sich versehentlich abgemeldet haben oder uns Rückmeldung geben möchten, antworten Sie einfach auf diese E-Mail. Über Kritik an unserer Arbeit freuen wir uns ausdrücklich.</div></td></tr>
    ${footer(links, false)}`;
  return {
    subject: "Abmeldung bestätigt",
    text,
    html: document("Abmeldung bestätigt", "Wir senden Ihnen keine weiteren Ausgaben. Ihre Adresse wird aus dem Verteiler gelöscht.", body)
  };
}
