// One source contract for job prompts, exchange validation and research verification.
export const RESEARCH_FUNCTIONS = ['event','mechanism','reference','counter_evidence'];
export const researchSourceSchema = {
  type: 'array', maxItems: 12, items: { type: 'object', additionalProperties: false,
    required: ['source_id','url','title','publisher','source_function','quote','supports'], properties: {
      source_id: { type:'string', pattern:'^research-[a-z0-9-]{3,100}$' }, url: { type:'string', format:'https-url', maxLength:4000 },
      title:{type:'string',minLength:8,maxLength:1000},publisher:{type:'string',minLength:2,maxLength:500},
      source_function:{enum:RESEARCH_FUNCTIONS},quote:{type:'string',minLength:40,maxLength:1200},
      supports:{type:'string',minLength:12,maxLength:2000}, published_at:{type:['string','null'],maxLength:80},
    },
  },
};
export const RESEARCH_SOURCE_RULE = 'research_sources: höchstens 12 ergänzende Quellen. Jedes Objekt: source_id (research-[a-z0-9-]{3,100}), url (öffentliche HTTPS-Originalquelle), title, publisher, source_function (event|mechanism|reference|counter_evidence), quote (wörtlicher im Original überprüfbarer Belegauszug, 40–1200 Zeichen), supports (konkret gestützte Aussage, 12–2000 Zeichen); optional published_at. Keine Felder function oder excerpt, keine Paraphrase als quote. Originalquellen und Belegfunktion prüfen; keine Belege erfinden. sources enthält ausschließlich unveränderte IDs/URLs aus dem Originalinput; neue Kontextquellen gehören in research_sources.';
