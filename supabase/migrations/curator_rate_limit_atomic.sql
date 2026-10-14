-- Atomic check-and-reserve for the curator rate limiter. Run in the
-- Supabase SQL editor after curator_rate_limit.sql (same flow as the other
-- migrations in this folder — this repo doesn't use `supabase db push`).
--
-- Why this exists: the Edge Function used to read the daily/session counts
-- via two plain SELECTs, then insert a row only after a successful Gemini
-- call. Two concurrent requests from the same session (or during a traffic
-- spike) could both read the same pre-request count and both pass the
-- check, overshooting the 8/10-min and 500/day limits by however many
-- requests raced each other. This function folds the check and the
-- reservation into one transaction guarded by an advisory lock, so only one
-- caller at a time can evaluate-and-reserve against this table.
--
-- The Edge Function calls this BEFORE the Gemini call (reserving capacity
-- up front) and deletes the row if the Gemini call subsequently fails, so
-- the ledger still reflects real usage, not just attempts.
--
-- Returns: the new row's id on success, -1 if the daily ceiling was hit,
-- -2 if the per-session limit was hit. (IDs are always positive, so these
-- sentinels can't collide with a real reservation id.)

create or replace function public.reserve_curator_request(
  p_session_key text,
  p_daily_ceiling integer,
  p_session_limit integer,
  p_window_minutes integer
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz := now() - (p_window_minutes || ' minutes')::interval;
  v_today_start  timestamptz := date_trunc('day', now() at time zone 'utc') at time zone 'utc';
  v_daily_count  integer;
  v_session_count integer;
  v_id           bigint;
begin
  -- Scopes the lock to this function/table so it doesn't contend with
  -- unrelated advisory locks elsewhere in the database.
  perform pg_advisory_xact_lock(hashtext('curator_requests'));

  select count(*) into v_daily_count
    from public.curator_requests
    where created_at >= v_today_start;

  if v_daily_count >= p_daily_ceiling then
    return -1;
  end if;

  select count(*) into v_session_count
    from public.curator_requests
    where session_key = p_session_key
      and created_at >= v_window_start;

  if v_session_count >= p_session_limit then
    return -2;
  end if;

  insert into public.curator_requests (session_key)
    values (p_session_key)
    returning id into v_id;

  return v_id;
end;
$$;

-- Only the service-role key (used server-side in the Edge Function) may
-- call this — same trust model as the table itself.
revoke all on function public.reserve_curator_request(text, integer, integer, integer) from public;
grant execute on function public.reserve_curator_request(text, integer, integer, integer) to service_role;
