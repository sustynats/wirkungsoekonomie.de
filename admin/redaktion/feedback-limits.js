export const EDITORIAL_COMMENT_LIMIT = 50000;
// JSON can escape one UTF-16 code unit as six ASCII bytes.
export const EDITORIAL_DECISION_BODY_LIMIT = EDITORIAL_COMMENT_LIMIT * 6 + 4096;
export const COMMENT_TOO_LONG_MESSAGE = "Dein Kommentar ist zu lang. Bis zu 50.000 Zeichen sind möglich. Der Text bleibt im Eingabefeld erhalten.";
