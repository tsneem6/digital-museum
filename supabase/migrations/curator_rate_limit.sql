-- curator_requests: rate-limit ledger for the "Ask the Curator" AI chat
-- (supabase/functions/ask-curator). Run in the Supabase SQL editor (same
-- flow as the guestbook/site_errors migrations).
--
-- Security model: the anon key ships in the public bundle, so it must never
-- read this table (it would leak session_key values used for rate limiting).
-- Only the service-role key (used server-side inside the Edge Function)
-- reads counts. No client ever inserts directly either — the Edge Function
-- inserts a row itself, only after a successful Gemini call, so the count
-- reflects real usage rather than attempted/rejected requests.

create table if not exists public.curator_requests (
  id         bigint generated always as identity primary key,
  session_key text not null check (char_length(session_key) <= 100),
  created_at timestamptz not null default now()
);

create index if not exists curator_requests_session_created_idx
  on public.curator_requests (session_key, created_at);
create index if not exists curator_requests_created_idx
  on public.curator_requests (created_at);

alter table public.curator_requests enable row level security;

-- No policies granted to anon/authenticated at all — this table is only
-- ever touched by the Edge Function via the service-role key, which
-- bypasses RLS entirely. RLS is enabled anyway as defense-in-depth in case
-- a future policy is added carelessly.

-- Keep this table from growing unbounded on the free tier:
--   delete from public.curator_requests where created_at < now() - interval '7 days';
