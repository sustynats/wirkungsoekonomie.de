alter table parliament.historical_backfill_checkpoints
  add column if not exists expected_source_records integer;

notify pgrst, 'reload schema';
