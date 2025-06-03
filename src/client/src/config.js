/* ────────────────────────────────────────────────────────────────
 * Central application configuration – persisted on the server
 * ──────────────────────────────────────────────────────────────── */

import { ORDER as ALL_TYPES } from "./feedTypes.js";

/* appTitle removed → constant in Header.jsx */
const DEFAULT_CFG = {
  theme        : "boy",
  mode         : "light",
  disabledTypes: [],
  childName    : "",
  childSurname : "",
  birthTs      : "",
  birthWeightGrams: null,
};

let CACHE = { ...DEFAULT_CFG };

/* pull (or create) the single row */
export async function initConfig() {
  try {
    const r = await fetch("/api/config");
    CACHE = r.ok ? { ...DEFAULT_CFG, ...(await r.json()) }
                 : { ...DEFAULT_CFG };
  } catch {
    CACHE = { ...DEFAULT_CFG };
  }
}

export function loadConfig()      { return CACHE; }
export function effectiveTheme(fallback="boy")  { return CACHE.theme ?? fallback; }
export function effectiveMode (fallback="light"){ return CACHE.mode  ?? fallback; }
export function isTypeEnabled(t)  { return !CACHE.disabledTypes.includes(t); }
export function birthTimestamp()  { return CACHE.birthTs || null; }
export function birthWeight() {
  return Number.isFinite(CACHE.birthWeightGrams) ? CACHE.birthWeightGrams : null;
}

/* save to DB and cache locally */
export async function saveConfig(partial) {
  CACHE = { ...CACHE, ...partial };
  await fetch("/api/config", {
    method :"PUT",
    headers: { "Content-Type":"application/json" },
    body   : JSON.stringify(CACHE),
  });
}
