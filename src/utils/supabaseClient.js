import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Built once from build-time env vars (see .env.example) — never from committed
// data or admin-editable settings, since the anon key/URL pair should not live
// in tracked source. Returns null (clean "not configured yet" state) until both
// env vars are actually set.
const client = url && anonKey ? createClient(url, anonKey) : null;

export function getSupabaseClient() {
  return client;
}
