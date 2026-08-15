-- Supabase stores structured operational data, hashes and bounded text only.
-- Original parliamentary documents stay at their official source URLs.
alter table parliament.source_documents
  add column if not exists raw_payload_truncated boolean not null default false;

alter table parliament.document_versions
  add column if not exists normalized_text_truncated boolean not null default false;

create or replace function parliament.storage_snapshot()
returns table (
  relation_name text,
  total_bytes bigint
)
language sql
security definer
set search_path = parliament, pg_catalog
as $$
  select
    c.relname::text as relation_name,
    pg_total_relation_size(c.oid)::bigint as total_bytes
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'parliament'
    and c.relkind = 'r'
  order by pg_total_relation_size(c.oid) desc;
$$;

revoke all on function parliament.storage_snapshot() from public;
grant execute on function parliament.storage_snapshot() to service_role;
notify pgrst, 'reload schema';
