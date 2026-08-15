-- The parliamentary schema is available to the server-side PostgREST client only.
-- It remains protected by RLS and has no public table policies.
grant usage on schema parliament to service_role;
grant all privileges on all tables in schema parliament to service_role;
grant all privileges on all sequences in schema parliament to service_role;
alter default privileges in schema parliament grant all privileges on tables to service_role;
alter default privileges in schema parliament grant all privileges on sequences to service_role;

alter role authenticator set pgrst.db_schemas = 'public, graphql_public, parliament';
notify pgrst, 'reload config';
