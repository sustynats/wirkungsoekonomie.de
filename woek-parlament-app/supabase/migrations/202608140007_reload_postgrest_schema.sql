-- Existing parliament tables may have been extended before this app is
-- deployed. Force PostgREST to refresh its schema cache before the protected
-- import endpoints start writing to those extended columns.
notify pgrst, 'reload schema';
notify pgrst, 'reload config';
