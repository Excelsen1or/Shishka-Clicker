begin;

drop function if exists public.get_player_leaderboard(integer);

create or replace function public.get_player_leaderboard(p_limit integer default 5)
returns table (
  player_id text,
  player_username text,
  shishki bigint,
  shards bigint,
  clicks bigint,
  updated_at timestamptz
)
language sql
stable
as $$
  with normalized_saves as (
    select
      ps.player_id,
      ps.player_username,
      ps.updated_at,
      coalesce(
        nullif(ps.save_data -> 'payload' -> 'game' ->> 'lifetimeShishkiEarned', '')::numeric,
        nullif(ps.save_data -> 'payload' -> 'game' ->> 'totalShishkiEarned', '')::numeric,
        nullif(ps.save_data ->> 'lifetimeShishkiEarned', '')::numeric,
        nullif(ps.save_data ->> 'totalShishkiEarned', '')::numeric,
        0
      ) as shishki_total,
      coalesce(
        nullif(ps.save_data -> 'payload' -> 'game' ->> 'totalPrestigeShardsEarned', '')::numeric,
        nullif(ps.save_data -> 'payload' -> 'game' ->> 'prestigeShards', '')::numeric,
        nullif(ps.save_data ->> 'totalPrestigeShardsEarned', '')::numeric,
        nullif(ps.save_data ->> 'prestigeShards', '')::numeric,
        0
      ) as shards_total,
      coalesce(
        nullif(ps.save_data -> 'payload' -> 'game' ->> 'manualClicks', '')::numeric,
        nullif(ps.save_data ->> 'manualClicks', '')::numeric,
        0
      ) as clicks_total
    from public.player_saves as ps
  )
  select
    normalized_saves.player_id,
    normalized_saves.player_username,
    greatest(0, round(normalized_saves.shishki_total))::bigint as shishki,
    greatest(0, round(normalized_saves.shards_total))::bigint as shards,
    greatest(0, round(normalized_saves.clicks_total))::bigint as clicks,
    normalized_saves.updated_at
  from normalized_saves
  where normalized_saves.shishki_total > 0
     or normalized_saves.shards_total > 0
     or normalized_saves.clicks_total > 0
  order by normalized_saves.shishki_total desc, normalized_saves.updated_at desc nulls last
  limit greatest(coalesce(p_limit, 5), 1);
$$;

commit;
