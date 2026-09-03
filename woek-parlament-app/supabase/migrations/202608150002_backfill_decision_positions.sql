-- A proceeding and its Drucksache text alone do not establish what was
-- actually decided. DIP's formal Vorgangsposition records provide the outcome,
-- vote method and link to the relevant official document/protocol.
alter table parliament.historical_backfill_checkpoints
  drop constraint if exists historical_backfill_checkpoints_stream_check;

alter table parliament.historical_backfill_checkpoints
  add constraint historical_backfill_checkpoints_stream_check
  check (stream in ('VORGANG', 'DRUCKSACHE', 'VORGANGSPOSITION'));

notify pgrst, 'reload schema';
