-- A source section heading is not an identifier: several distinct, source-
-- bound commitments can correctly occur under the same heading. The stable
-- commitment_key remains the only import identity.
alter table parliament.policy_commitments
  drop constraint if exists policy_commitments_source_document_id_title_source_hash_key;

notify pgrst, 'reload schema';
