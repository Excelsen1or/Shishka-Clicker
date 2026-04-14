begin;

create or replace function public.save_player_progress(
  p_player_id text,
  p_app_version text,
  p_save_data jsonb,
  p_expected_version bigint default null,
  p_force boolean default false
)
returns table (
  did_save boolean,
  updated_at timestamptz,
  save_version bigint,
  current_save_data jsonb,
  current_updated_at timestamptz,
  current_app_version text,
  current_save_version bigint
)
language plpgsql
as $$
declare
  v_row public.player_saves%rowtype;
begin
  if p_player_id is null or length(trim(p_player_id)) = 0 then
    raise exception 'player_id_required';
  end if;

  if p_save_data is null then
    raise exception 'save_data_required';
  end if;

  if p_force or p_expected_version is null then
    insert into public.player_saves as player_saves (
      player_id,
      app_version,
      save_version,
      save_data,
      updated_at
    )
    values (
      p_player_id,
      p_app_version,
      1,
      p_save_data,
      now()
    )
    on conflict (player_id) do update
      set app_version = excluded.app_version,
          save_data = excluded.save_data,
          save_version = coalesce(player_saves.save_version, 0) + 1,
          updated_at = now()
    returning * into v_row;

    return query
    select
      true,
      v_row.updated_at,
      v_row.save_version,
      null::jsonb,
      null::timestamptz,
      null::text,
      null::bigint;
    return;
  end if;

  update public.player_saves
  set app_version = p_app_version,
      save_data = p_save_data,
      save_version = p_expected_version + 1,
      updated_at = now()
  where player_id = p_player_id
    and coalesce(save_version, 0) = p_expected_version
  returning * into v_row;

  if found then
    return query
    select
      true,
      v_row.updated_at,
      v_row.save_version,
      null::jsonb,
      null::timestamptz,
      null::text,
      null::bigint;
    return;
  end if;

  insert into public.player_saves (
    player_id,
    app_version,
    save_version,
    save_data,
    updated_at
  )
  values (
    p_player_id,
    p_app_version,
    1,
    p_save_data,
    now()
  )
  on conflict (player_id) do nothing
  returning * into v_row;

  if found then
    return query
    select
      true,
      v_row.updated_at,
      v_row.save_version,
      null::jsonb,
      null::timestamptz,
      null::text,
      null::bigint;
    return;
  end if;

  select *
  into v_row
  from public.player_saves
  where player_id = p_player_id;

  return query
  select
    false,
    null::timestamptz,
    null::bigint,
    v_row.save_data,
    v_row.updated_at,
    v_row.app_version,
    v_row.save_version;
end;
$$;

commit;
