/* ────────────────────────────────────────────────────────────────────
 *  Central application configuration – persisted on the server
 * ──────────────────────────────────────────────────────────────────── */

export const ALL_TYPES = [
  "BREAST_DIRECT",
  "BREAST_BOTTLE",
  "FORMULA_PUMP",
  "FORMULA_BOTTLE",
];

/* defaults used when DB row doesn’t exist or request fails */
const DEFAULT_CFG = {
  theme            : "boy",       // teal vs pink accent
  mode             : "auto",      // light | dark | auto (day-light)
  disabledTypes    : [],
  childName        : "",
  childSurname     : "",
  birthTs          : "",          // ISO timestamp or ""
  appTitle         : "Web-Baby",
  birthWeightGrams : null,        // integer or null
};

let CACHE = { ...DEFAULT_CFG };

/* first thing called from index.jsx */
export async function initConfig() {
  try {
    const r = await fetch("/api/config");
    CACHE = r.ok
      ? { ...DEFAULT_CFG, ...(await r.json()) }
      : { ...DEFAULT_CFG };
  } catch {
    CACHE = { ...DEFAULT_CFG };
  }
}

/* local getter */
export function loadConfig() { return CACHE; }

/* simple helpers */
export function effectiveTheme(fallback = "boy")   { return CACHE.theme ?? fallback; }
export function storedMode()                       { return CACHE.mode  ?? "auto"; }
export function isTypeEnabled(t)                   { return !CACHE.disabledTypes.includes(t); }
export function birthTimestamp()                   { return CACHE.birthTs || null; }
export function birthWeight() {
  return Number.isFinite(CACHE.birthWeightGrams) ? CACHE.birthWeightGrams : null;
}
export function appTitle()                         { return CACHE.appTitle || "Web-Baby"; }

/* save to DB + update local cache */
export async function saveConfig(partial) {
  CACHE = { ...CACHE, ...partial };
  await fetch("/api/config", {
    method :"PUT",
    headers: { "Content-Type":"application/json" },
    body   : JSON.stringify(CACHE),
  });
}
