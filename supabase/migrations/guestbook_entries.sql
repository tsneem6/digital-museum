-- guestbook_entries: the public visitor guestbook (src/components/Guestbook.jsx).
-- Run this in the Supabase SQL editor (same flow as the other migrations in
-- this folder — this repo doesn't use `supabase db push`).
--
-- The email below must match the Supabase Auth user used for the Editor
-- login (the same address as "Email" in the editor's About me page). If it
-- ever changes, update it here and run this file again.
--
-- Security model: anon may INSERT a pending entry (approved forced to false
-- by the CHECK constraint below — an insert attempting approved=true is
-- rejected outright, not silently overridden) and SELECT only approved rows.
-- A real Supabase Auth session (the site owner, whose email is checked below) can read/update/delete
-- all entries for moderation.

create table if not exists public.guestbook_entries (
  id           bigint generated always as identity primary key,
  display_name text not null,
  message      text not null check (char_length(message) >= 1 and char_length(message) <= 500),
  created_at   timestamptz not null default now(),
  approved     boolean not null default false
);

alter table public.guestbook_entries enable row level security;

drop policy if exists "anyone can submit pending" on public.guestbook_entries;
create policy "anyone can submit pending"
  on public.guestbook_entries for insert
  with check (approved = false);

drop policy if exists "public read approved" on public.guestbook_entries;
create policy "public read approved"
  on public.guestbook_entries for select
  using (approved = true);

drop policy if exists "owner reads all entries" on public.guestbook_entries;
create policy "owner reads all entries"
  on public.guestbook_entries for select
  using ((auth.jwt() ->> 'email') = 'tsniiim96@gmail.com');

drop policy if exists "owner moderates entries" on public.guestbook_entries;
create policy "owner moderates entries"
  on public.guestbook_entries for update
  using ((auth.jwt() ->> 'email') = 'tsniiim96@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'tsniiim96@gmail.com');

drop policy if exists "owner deletes entries" on public.guestbook_entries;
create policy "owner deletes entries"
  on public.guestbook_entries for delete
  using ((auth.jwt() ->> 'email') = 'tsniiim96@gmail.com');
