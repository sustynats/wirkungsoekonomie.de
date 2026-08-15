-- A Beschlussempfehlung is an official decision document attached to the
-- same DIP case.  It may be used as the final-decision document only where a
-- formal outcome exists and the document predates that outcome.  Routine
-- referrals remain deliberately unlinked: they are not final decisions.
with ranked_official_documents as (
  select
    decision_unit.id as decision_unit_id,
    source_document.id as source_document_id,
    document_version.id as document_version_id,
    row_number() over (
      partition by decision_unit.id
      order by source_document.document_date desc nulls last, document_version.retrieved_at desc
    ) as document_rank
  from parliament.decision_units as decision_unit
  join parliament.source_documents as source_document
    on source_document.case_id = decision_unit.case_id
  join parliament.document_versions as document_version
    on document_version.document_id = source_document.id
  where lower(coalesce(source_document.source_metadata ->> 'drucksachetyp', '')) like '%beschlussempfehlung%'
    and (decision_unit.decision_date is null or source_document.document_date is null or source_document.document_date <= decision_unit.decision_date)
    and coalesce(decision_unit.actual_outcome, '') ~* '(annahme|ablehnung|kenntnisnahme|feststellung)'
), selected_official_documents as (
  select decision_unit_id, source_document_id, document_version_id
  from ranked_official_documents
  where document_rank = 1
), linked_decisions as (
  update parliament.decision_units as decision_unit
  set final_document_version_id = selected.document_version_id,
      updated_at = now()
  from selected_official_documents as selected
  where decision_unit.id = selected.decision_unit_id
    and decision_unit.final_document_version_id is null
  returning selected.source_document_id
)
update parliament.source_documents as source_document
set document_type = 'FINAL_DECISION'
where source_document.id in (select source_document_id from linked_decisions);
