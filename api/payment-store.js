/**
 * Shared in-memory session store.
 *
 * Maps paymentIntentId → { fullName, email, createdAt }
 * so that confirm-payment can look up the customer after Ziina redirects them.
 *
 * Entries older than 2 hours are auto-pruned to avoid unbounded growth.
 */

const TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export const sessionStore = {
  _map: new Map(),

  set(id, data) {
    this._map.set(id, data);
    this._prune();
  },

  get(id) {
    return this._map.get(id) ?? null;
  },

  delete(id) {
    this._map.delete(id);
  },

  _prune() {
    const now = Date.now();
    for (const [key, val] of this._map) {
      if (now - (val.createdAt ?? 0) > TTL_MS) this._map.delete(key);
    }
  },
};
