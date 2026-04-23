begin;

alter table public.player_saves
  add column if not exists session_seconds_total bigint not null default 0;

create index if not exists player_saves_session_seconds_total_idx
  on public.player_saves (session_seconds_total desc, updated_at desc);

commit;
