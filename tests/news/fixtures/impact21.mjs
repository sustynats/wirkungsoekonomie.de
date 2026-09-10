// Synthetic test fixtures only. Runtime never imports this conversion and it
// must never be used to manufacture missing editorial assessments.
import { FACTOR_KEYS, aggregateMainPaths } from '../../../scripts/news/impact-magnitude.mjs';
import { POTENTIAL_REVISION } from '../../../scripts/news/impact-potential.mjs';
export function syntheticFactors(value, sourceIds) {
  return Object.fromEntries(FACTOR_KEYS.map(key=>[key,{value,rationale:`Synthetische Testvorgabe für ${key}: Stufe ${value}.`,source_ids:sourceIds}]));
}
export function syntheticPotentialPath({direction='positive',magnitude=3,sourceIds=['official'],...overrides}={}) {
  return {direction,magnitude,label:'Synthetisch festgelegte mögliche Zustandsveränderung',mechanism:'Ein explizit angenommener Eingriff verändert den Zugang zu einer Funktion.',
    recipients:['Die in diesem Test festgelegten Wirkungsempfänger'],source_ids:sourceIds,same_target:true,same_baseline:true,type:'main_path',
    temporal_status:'ex_ante',likelihood:'medium',evidence:'medium',condition:'Nur wenn die im Test definierte Maßnahme umgesetzt wird.',
    reference_space:'Der ausdrücklich abgegrenzte Referenzraum dieses Domaintests.',time_horizon:'Ein bis fünf Jahre nach Umsetzung der Testmaßnahme.',
    path_quality:['indirect'],epistemic_basis:'supported_mechanism',assumptions:'Die im Test festgesetzten Randbedingungen bleiben gleich.',
    source_support:'Die synthetische Quelle belegt nur den im Test gesetzten Mechanismus.',limitations:'Außerhalb dieses synthetischen Tests ist keine Evidenz behauptet.',
    first_order:'Die vorgesehene Funktion wird unter den Testbedingungen verändert.',second_order:'Die Änderung kann nachgelagerte Zugänge unter den Testannahmen verändern.',
    third_order:'Die Systemfolgen sind durch den kleinen Testreferenzraum begrenzt.',research_pass:'second_pass',research_result:'Die zweite synthetische Recherche bestätigt die festgelegten Testannahmen.',
    magnitude_range:{lower:magnitude,upper:magnitude,rationale:'Diese Testvorgabe setzt einen eindeutigen Punktwert; kein empirisches Konfidenzintervall.'},
    negligibility_rationale:'Im engen Testzeitraum ist die Änderung nach den gesetzten Annahmen praktisch vernachlässigbar.',
    magnitude_factors:syntheticFactors(magnitude,sourceIds),protection_boundary:{decisive:false,rationale:'In dieser Testvorgabe besteht keine entscheidende Schutzgrenze.'},...overrides};
}
export function syntheticImpact21(original) {
  const a=structuredClone(original);a.version='2.1';a.semantics_revision=POTENTIAL_REVISION;a.observed_effects=[];
  if(a.system_check)a.system_check.cross_dimension_review=Object.fromEntries(['human','planet','democracy'].map(key=>[key,`Synthetische gekoppelte Prüfung des Wirkungsraums ${key}, einschließlich Neben- und Gegenpfaden.`]));
  const sourceIds=new Set(Object.values(a.dimensions).flatMap(d=>[...(d.primary_paths||[]),...(d.secondary_paths||[])].flatMap(p=>p.source_ids||[])));
  if(!sourceIds.size)sourceIds.add('official');
  for(const [key,d] of Object.entries(a.dimensions)) {
    if(d.observed_outcome?.change)a.observed_effects.push({...syntheticPotentialPath({direction:['positive','negative'].includes(d.direction)?d.direction:'open',magnitude:d.magnitude||1,sourceIds:d.observed_outcome.source_ids}),temporal_status:'ex_post',dimension:key,change:d.observed_outcome.change,source_ids:d.observed_outcome.source_ids,attribution:d.observed_outcome.attribution,
      direction:['positive','negative','mixed','neutral'].includes(d.direction)?d.direction:'open',data_status:'secondary_source',evidence:'medium',reference_space:'Synthetischer Testreferenzraum der beobachteten Änderung.',observed_at:'Der im Test festgelegte ursprüngliche Ereigniszeitpunkt.',reference_frame:'Synthetischer Schutzraum für diesen beobachteten Testbefund.'});
    const transform=p=>syntheticPotentialPath({...p,sourceIds:p.source_ids,temporal_status:'ex_ante',likelihood:p.likelihood==='already_occurring'?'medium':p.likelihood||'medium',magnitude:p.magnitude??1});
    d.primary_paths=(d.primary_paths||[]).map(transform);d.secondary_paths=(d.secondary_paths||[]).map(transform);
    if(!d.primary_paths.length)d.primary_paths=[syntheticPotentialPath({direction:'open',magnitude:0,sourceIds:[...sourceIds]})];
    d.path_status='modelled';d.temporal_status='ex_ante';d.data_status='modelled';d.likelihood=d.likelihood==='already_occurring'?'medium':d.likelihood||'unknown';delete d.observed_outcome;
    const result=aggregateMainPaths(d.primary_paths);Object.assign(d,{direction:result.direction,dominance:result.dominance,magnitude:result.magnitude});
    if(d.direction==='mixed')d.balance={comparable_material_paths:d.dominance==='balanced',protection_boundary_decisive:false,rationale:'Vergleich der beiden synthetisch festgelegten Hauptpfade.'};
  }
  a.research_check={status:'completed',gaps:[],source_functions:[...sourceIds].map(id=>({source_id:id,functions:['event','mechanism','reference'],supported_claim:'Synthetische Prüfgrundlage für diesen vorgegebenen Wirkpfad.'})),searches:[{question:'Welche Mechanismen und Wissensgrenzen trägt die Testgrundlage?',result:'Die in diesem Test gesetzten Annahmen sind vollständig dokumentiert.',source_ids:[...sourceIds]}]};
  return a;
}
export function syntheticPotentialAssessment() {
  const a={version:'2.1',news_event:'Eine politische Akteurin fordert ein neues Hilfsprogramm.',evaluation_target:{label:'Umsetzung des vorgeschlagenen Hilfsprogramms',type:'proposal'},
    baseline:'Fortführung des bestehenden Angebots ohne das Programm.',counterfactual:'Das bestehende Angebot wird unverändert fortgeführt.',reference_frame:['Zugang zu öffentlicher Hilfe und gleichberechtigte Teilhabe'],
    temporal_status:'ex_ante',systemic_relevance:'high',system_check:{central_dimensions:['human'],enablement:[],first_order:'Die Funktion der Testmaßnahme wird direkt verändert.',second_order:'Ein nachgelagerter Zugang wird unter den Testannahmen verbessert.',third_order:'Eine langfristige Strukturwirkung bleibt an die Testannahmen gebunden.',counter_evidence:['Die Testannahmen begrenzen die Gültigkeit des synthetischen Befunds.'],source_independence:'Die Testquelle ist eine festgesetzte synthetische Prüfgrundlage.',institutional_status:'Der Entwurf ist im Test noch nicht institutionell umgesetzt.'},
    dimensions:Object.fromEntries(['human','planet','democracy'].map(k=>[k,{direction:'positive',dominance:'dominant_positive',magnitude:3,evidence:'medium',likelihood:'medium',primary_paths:[syntheticPotentialPath()],secondary_paths:[],rationale:'Der mögliche Zugang wird unter den Testbedingungen verbessert.',balance:null}]))};
  return syntheticImpact21(a);
}
