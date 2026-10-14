// Thin wrapper around the CounterAPI service (https://counterapi.dev),
// shared by any component that needs a simple global counter with no backend.
// All counters live under the site's own namespace (SITE.likesNamespace in
// site.config.js), keyed by an arbitrary string (e.g. a project id).

import { SITE } from '../../site.config.js';

const NAMESPACE = SITE.likesNamespace;

// CounterAPI 301-redirects between the trailing-slash and no-trailing-slash
// form of each endpoint -- inconsistently per endpoint -- and those redirect
// responses carry no CORS headers at all (only the final response does).
// Browsers reject the whole request over that intermediate hop, so every
// call here uses whichever exact form that specific endpoint answers
// directly on, with no redirect: the base read endpoint wants a trailing
// slash, the /up and /down action endpoints want none. Verified directly
// against the live API, not assumed.

/**
 * Read the current value of a counter without changing it.
 * A counter that has never been incremented doesn't exist yet on
 * CounterAPI's side -- it answers with HTTP 400 "record not found"
 * rather than a real count -- so that case reads as 0, not a failure.
 * Resolves to `null` only on a genuine network/parsing failure, so
 * callers can tell "definitely zero" apart from "couldn't check."
 */
export function getCount(key) {
  return fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/${key}/`)
    .then(res => res.json().then(data => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok && data && typeof data.count === 'number') return Math.max(0, data.count);
      if (!ok && data && data.message === 'record not found') return 0;
      return null;
    })
    .catch(() => null);
}

/**
 * Increment (or decrement) a counter.
 * @param {string} key - counter key under the shared namespace
 * @param {'up'|'down'} [direction='up']
 * @returns {Promise<number|null>} the new count, or null on failure
 */
export function incrementCount(key, direction = 'up') {
  return fetch(`https://api.counterapi.dev/v1/${NAMESPACE}/${key}/${direction}`)
    .then(res => res.json())
    .then(data => (data && typeof data.count === 'number' ? Math.max(0, data.count) : null))
    .catch(() => null);
}
