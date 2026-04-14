begin;

with ranked_saves as (
  select
    id,
    row_number() over (
      partition by player_id
      order by updated_at desc nulls last, id desc
    ) as row_rank
  from player_saves
)
delete from player_saves
where id in (
  select id
  from ranked_saves
  where row_rank > 1
);

alter table player_saves
  add column if not exists player_id text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'player_saves'::regclass
      and conname = 'player_saves_player_id_key'
  ) and not exists (
    select 1
    from pg_class
    where relname = 'player_saves_player_id_key'
  ) then
    alter table player_saves
      add constraint player_saves_player_id_key unique (player_id);
  end if;
end
$$;

create index if not exists player_saves_updated_at_idx
  on player_saves (updated_at desc);

commit;
