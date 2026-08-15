type TemplateLinks = {
  portalUrl: string;
  privacyUrl: string;
  imprintUrl: string;
  unsubscribeUrl: string;
  confirmationUrl?: string;
};

type EmailTemplate = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function withoutTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

function htmlDocument(title: string, preheader: string, body: string) {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin:0 !important; padding:0 !important; width:100% !important; }
    table { border-collapse:collapse !important; }
    a { color:#167568; }
    @media only screen and (max-width:620px) {
      .wrap { width:100% !important; }
      .pad { padding-left:22px !important; padding-right:22px !important; }
      .title { font-size:26px !important; line-height:34px !important; }
      .button a { display:block !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f5f1e9;">
  <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    ${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f1e9;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" class="wrap" border="0" cellpadding="0" cellspacing="0" width="600" style="width:600px; max-width:600px; background-color:#fffdf8;">
        ${body}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function header() {
  return `<tr><td class="pad" style="background-color:#0a1730; padding:26px 32px;">
    <div style="font-family:Georgia,'Times New Roman',serif; font-size:21px; line-height:28px; color:#fffdf8;">Wirkungsportal Parlament</div>
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:14px; line-height:20px; color:#c8d2e0; padding-top:5px;">Herausgegeben vom Institut f&uuml;r Wirkungs&ouml;konomie</div>
  </td></tr><tr><td style="height:4px; background-color:#a57a2e; font-size:0; line-height:0;">&nbsp;</td></tr>`;
}

function footer(links: TemplateLinks) {
  const portalUrl = escapeHtml(links.portalUrl);
  const privacyUrl = escapeHtml(links.privacyUrl);
  const imprintUrl = escapeHtml(links.imprintUrl);
  const unsubscribeUrl = escapeHtml(links.unsubscribeUrl);
  return `<tr><td class="pad" style="background-color:#0a1730; padding:24px 32px;">
    <p style="margin:0 0 10px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:15px; line-height:23px; color:#e8e2d5;"><strong style="color:#fffdf8;">Wirkungsportal Parlament</strong><br>Herausgegeben vom Institut f&uuml;r Wirkungs&ouml;konomie</p>
    <p style="margin:0 0 10px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:15px; line-height:23px; color:#e8e2d5;">Fragen? Antworten Sie einfach auf diese E-Mail:<br><a href="mailto:wirkungscheck@wirkungsoekonomie.de" style="color:#e9c883; text-decoration:underline;">wirkungscheck@wirkungsoekonomie.de</a></p>
    <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:15px; line-height:23px; color:#e8e2d5;"><a href="${portalUrl}" style="color:#e9c883; text-decoration:underline;">Portal</a>&nbsp;&middot;&nbsp;<a href="${privacyUrl}" style="color:#e9c883; text-decoration:underline;">Datenschutz</a>&nbsp;&middot;&nbsp;<a href="${imprintUrl}" style="color:#e9c883; text-decoration:underline;">Impressum</a>&nbsp;&middot;&nbsp;<a href="${unsubscribeUrl}" style="color:#e9c883; text-decoration:underline;">Hinweise abbestellen</a></p>
  </td></tr>`;
}

function textFooter(links: TemplateLinks) {
  return [
    "--",
    "Wirkungsportal Parlament",
    "Herausgegeben vom Institut f\u00fcr Wirkungs\u00f6konomie",
    "",
    "Fragen? Antworten Sie einfach auf diese E-Mail:",
    "wirkungscheck@wirkungsoekonomie.de",
    "",
    `Portal:      ${links.portalUrl}`,
    `Datenschutz: ${links.privacyUrl}`,
    `Impressum:   ${links.imprintUrl}`
  ].join("\n");
}

export function doubleOptInEmail(links: TemplateLinks & { confirmationUrl: string }): EmailTemplate {
  const confirmationUrl = escapeHtml(links.confirmationUrl);
  const unsubscribeUrl = escapeHtml(links.unsubscribeUrl);
  const text = [
    "WIRKUNGSPORTAL PARLAMENT",
    "Herausgegeben vom Institut f\u00fcr Wirkungs\u00f6konomie",
    "",
    "BITTE BEST\u00c4TIGEN SIE IHRE ANMELDUNG",
    "",
    "Sie haben Hinweise zu Wirkungschecks angefordert. Damit wir Ihnen diese Hinweise senden d\u00fcrfen, best\u00e4tigen Sie bitte einmalig Ihre Anmeldung.",
    "",
    "STATUS: NOCH NICHT AKTIV.",
    "Ohne Ihre Best\u00e4tigung senden wir Ihnen nichts zu.",
    "",
    "Nach der Best\u00e4tigung erhalten Sie Hinweise zu bevorstehenden Entscheidungen im Bundestag, ver\u00f6ffentlichte Wirkungschecks zu einzelnen Vorhaben und Korrekturen.",
    "",
    "ANMELDUNG BEST\u00c4TIGEN:",
    links.confirmationUrl,
    "",
    "Der Best\u00e4tigungslink ist 72 Stunden g\u00fcltig. Danach k\u00f6nnen Sie die Anmeldung jederzeit erneut anfordern.",
    "",
    "SIE HABEN DAS NICHT ANGEFORDERT?",
    "Dann ignorieren Sie diese Nachricht bitte. Ohne Best\u00e4tigung wird keine Anmeldung aktiv. Sie k\u00f6nnen die Adresse auch dauerhaft sperren:",
    links.unsubscribeUrl,
    "",
    "Wir messen weder, ob Sie diese Nachricht \u00f6ffnen, noch, ob Sie einen Link darin anklicken.",
    "",
    textFooter(links)
  ].join("\n");
  const body = `${header()}
    <tr><td class="pad" style="padding:34px 32px 8px 32px;"><h1 class="title" style="margin:0 0 18px 0; font-family:Georgia,'Times New Roman',serif; font-size:29px; line-height:38px; color:#0a1730; font-weight:normal;">Bitte best&auml;tigen Sie Ihre Anmeldung</h1><p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:17px; line-height:27px; color:#20201c;">Sie haben Hinweise zu Wirkungschecks angefordert. Damit wir Ihnen diese Hinweise senden d&uuml;rfen, best&auml;tigen Sie bitte einmalig Ihre Anmeldung.</p></td></tr>
    <tr><td class="pad" style="padding:14px 32px 22px 32px;"><table role="presentation" width="100%" style="background-color:#f5f1e9; border-left:4px solid #a57a2e;"><tr><td style="padding:14px 18px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:16px; line-height:25px; color:#3d3d38;"><strong style="color:#0a1730;">Status: noch nicht aktiv.</strong> Ohne Ihre Best&auml;tigung senden wir Ihnen nichts zu.</td></tr></table></td></tr>
    <tr><td class="pad" style="padding:0 32px 6px 32px;"><p style="margin:0 0 12px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:17px; line-height:27px; color:#20201c;">Nach der Best&auml;tigung erhalten Sie:</p><ul style="margin:0; padding-left:22px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:17px; line-height:27px; color:#20201c;"><li>Hinweise zu bevorstehenden Entscheidungen im Bundestag</li><li>ver&ouml;ffentlichte Wirkungschecks zu einzelnen Vorhaben</li><li>Korrekturen, wenn sich eine ver&ouml;ffentlichte Einordnung &auml;ndert</li></ul></td></tr>
    <tr><td class="pad" style="padding:26px 32px 10px 32px;"><table role="presentation" class="button" border="0" cellpadding="0" cellspacing="0"><tr><td style="background-color:#167568;"><a href="${confirmationUrl}" style="display:inline-block; padding:16px 30px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:17px; line-height:22px; font-weight:bold; color:#ffffff; text-decoration:none;">Anmeldung best&auml;tigen</a></td></tr></table></td></tr>
    <tr><td class="pad" style="padding:6px 32px 4px 32px;"><p style="margin:0 0 6px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:16px; line-height:25px; color:#3d3d38;">Der Best&auml;tigungslink ist <strong>72 Stunden</strong> g&uuml;ltig. Danach k&ouml;nnen Sie die Anmeldung jederzeit erneut anfordern.</p><p style="margin:0 0 18px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:15px; line-height:24px; color:#4a4a44;">Falls sich die Schaltfl&auml;che nicht &ouml;ffnen l&auml;sst, verwenden Sie bitte diese Adresse:<br><a href="${confirmationUrl}" style="color:#167568; text-decoration:underline; word-break:break-all;">${confirmationUrl}</a></p></td></tr>
    <tr><td class="pad" style="padding:0 32px 26px 32px;"><table role="presentation" width="100%" style="border-top:1px solid #e3ddd0;"><tr><td style="padding:18px 0 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:16px; line-height:25px; color:#3d3d38;"><strong style="color:#0a1730;">Sie haben das nicht angefordert?</strong><br>Dann ignorieren Sie diese Nachricht bitte &ndash; ohne Best&auml;tigung wird keine Anmeldung aktiv. Sie k&ouml;nnen die Adresse auch dauerhaft <a href="${unsubscribeUrl}" style="color:#167568; text-decoration:underline;">f&uuml;r Hinweise sperren</a>.<br><br><span style="font-size:15px; line-height:24px; color:#4a4a44;">Wir messen weder, ob Sie diese Nachricht &ouml;ffnen, noch, ob Sie einen Link darin anklicken.</span></td></tr></table></td></tr>
    ${footer(links)}`;
  return {
    subject: "Bitte best\u00e4tigen Sie Ihre Anmeldung",
    text,
    html: htmlDocument("Bitte best\u00e4tigen Sie Ihre Anmeldung", "Ihre Anmeldung ist noch nicht aktiv. Bitte best\u00e4tigen Sie sie innerhalb von 72 Stunden.", body)
  };
}

export function welcomeEmail(links: TemplateLinks): EmailTemplate {
  const upcomingUrl = `${withoutTrailingSlash(links.portalUrl)}/bevorstehend`;
  const methodologyUrl = `${withoutTrailingSlash(links.portalUrl)}/methodik`;
  const safeUpcomingUrl = escapeHtml(upcomingUrl);
  const safeMethodologyUrl = escapeHtml(methodologyUrl);
  const text = [
    "WIRKUNGSPORTAL PARLAMENT",
    "Herausgegeben vom Institut f\u00fcr Wirkungs\u00f6konomie",
    "",
    "IHRE ANMELDUNG IST AKTIV",
    "",
    "Vielen Dank f\u00fcr Ihre Best\u00e4tigung. Sie erhalten ab sofort Hinweise zu Wirkungschecks - zu bevorstehenden Entscheidungen, ver\u00f6ffentlichten Einordnungen und Korrekturen.",
    "",
    "WAS IST EIN WIRKUNGSCHECK?",
    "Politische Vorhaben werden meist danach beschrieben, was sie erreichen sollen. Ein Wirkungscheck fragt zus\u00e4tzlich: Was k\u00f6nnte sich dadurch tats\u00e4chlich ver\u00e4ndern - f\u00fcr Menschen, f\u00fcr die Umwelt und f\u00fcr das demokratische Zusammenleben?",
    "",
    "Dazu geh\u00f6rt immer beides: worauf sich eine Einordnung st\u00fctzt - und was offen bleibt.",
    "",
    "Was nicht in die fachliche Einordnung eingeht: Partei, Fraktion und die erwartete Mehrheit. Dieselbe Sachlage f\u00fchrt zur selben Einordnung - unabh\u00e4ngig davon, wer ein Vorhaben eingebracht hat.",
    "",
    "Was sichtbar gemacht wird: Quellen, Annahmen, Rechenweg und die verbleibenden Unsicherheiten. So k\u00f6nnen Sie jede Aussage selbst nachvollziehen - und uns widersprechen.",
    "",
    `BEVORSTEHENDE ENTSCHEIDUNGEN ANSEHEN: ${upcomingUrl}`,
    `SO FUNKTIONIERT EIN WIRKUNGSCHECK: ${methodologyUrl}`,
    "",
    "Der Empfang ist freiwillig. Sie k\u00f6nnen ihn jederzeit mit einem Klick beenden - ohne Angabe von Gr\u00fcnden und ohne R\u00fcckfrage. Wir messen weder \u00d6ffnungen noch Klicks.",
    "",
    `Hinweise abbestellen: ${links.unsubscribeUrl}`,
    "",
    textFooter(links)
  ].join("\n");
  const body = `${header()}
    <tr><td class="pad" style="padding:34px 32px 6px 32px;"><h1 class="title" style="margin:0 0 16px 0; font-family:Georgia,'Times New Roman',serif; font-size:29px; line-height:38px; color:#0a1730; font-weight:normal;">Ihre Anmeldung ist aktiv</h1><p style="margin:0 0 20px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:17px; line-height:27px; color:#20201c;">Vielen Dank f&uuml;r Ihre Best&auml;tigung. Sie erhalten ab sofort Hinweise zu Wirkungschecks &ndash; zu bevorstehenden Entscheidungen, ver&ouml;ffentlichten Einordnungen und Korrekturen.</p></td></tr>
    <tr><td class="pad" style="padding:8px 32px 0 32px;"><table role="presentation" width="100%" style="border-top:1px solid #e3ddd0;"><tr><td style="padding:22px 0 0;"><h2 style="margin:0 0 12px 0; font-family:Georgia,'Times New Roman',serif; font-size:22px; line-height:30px; color:#0a1730; font-weight:normal;">Was ist ein Wirkungscheck?</h2><p style="margin:0 0 14px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:17px; line-height:27px; color:#20201c;">Politische Vorhaben werden meist danach beschrieben, was sie erreichen sollen. Ein Wirkungscheck fragt zus&auml;tzlich: Was k&ouml;nnte sich dadurch tats&auml;chlich ver&auml;ndern &ndash; f&uuml;r Menschen, f&uuml;r die Umwelt und f&uuml;r das demokratische Zusammenleben?</p><p style="margin:0 0 22px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:17px; line-height:27px; color:#20201c;">Dazu geh&ouml;rt immer beides: worauf sich eine Einordnung st&uuml;tzt &ndash; und was offen bleibt.</p></td></tr></table></td></tr>
    <tr><td class="pad" style="padding:0 32px 20px 32px;"><table role="presentation" width="100%" style="background-color:#f5f1e9; border-left:4px solid #167568;"><tr><td style="padding:18px 20px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:16px; line-height:25px; color:#3d3d38;"><p style="margin:0 0 10px 0;"><strong style="color:#0a1730;">Was nicht in die fachliche Einordnung eingeht:</strong> Partei, Fraktion und die erwartete Mehrheit. Dieselbe Sachlage f&uuml;hrt zur selben Einordnung &ndash; unabh&auml;ngig davon, wer ein Vorhaben eingebracht hat.</p><p style="margin:0;"><strong style="color:#0a1730;">Was sichtbar gemacht wird:</strong> Quellen, Annahmen, Rechenweg und die verbleibenden Unsicherheiten. So k&ouml;nnen Sie jede Aussage selbst nachvollziehen &ndash; und uns widersprechen.</p></td></tr></table></td></tr>
    <tr><td class="pad" style="padding:6px 32px 8px 32px;"><table role="presentation" class="button" border="0" cellpadding="0" cellspacing="0"><tr><td style="background-color:#167568;"><a href="${safeUpcomingUrl}" style="display:inline-block; padding:16px 30px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:17px; line-height:22px; font-weight:bold; color:#ffffff; text-decoration:none;">Bevorstehende Entscheidungen ansehen</a></td></tr></table></td></tr>
    <tr><td class="pad" style="padding:14px 32px 24px 32px;"><p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:17px; line-height:27px; color:#20201c;"><a href="${safeMethodologyUrl}" style="color:#167568; text-decoration:underline;">So funktioniert ein Wirkungscheck</a> &ndash; Aufbau, Ma&szlig;st&auml;be und Grenzen der Methode.</p></td></tr>
    <tr><td class="pad" style="padding:0 32px 26px 32px;"><table role="presentation" width="100%" style="border-top:1px solid #e3ddd0;"><tr><td style="padding:18px 0 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,Helvetica,sans-serif; font-size:15px; line-height:24px; color:#4a4a44;">Der Empfang ist freiwillig. Sie k&ouml;nnen ihn jederzeit mit einem Klick beenden &ndash; ohne Angabe von Gr&uuml;nden und ohne R&uuml;ckfrage. Wir messen weder &Ouml;ffnungen noch Klicks.</td></tr></table></td></tr>
    ${footer(links)}`;
  return {
    subject: "Ihre Anmeldung ist aktiv",
    text,
    html: htmlDocument("Ihre Anmeldung ist aktiv", "Was ein Wirkungscheck pr\u00fcft, worauf er sich st\u00fctzt und was offen bleibt.", body)
  };
}
