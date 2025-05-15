/* ────────────────────────────────────────────────────────────────────
 *  Central application configuration – persisted on the server
 * ──────────────────────────────────────────────────────────────────── */

export const ALL_TYPES = [
  "BREAST_DIRECT",
  "BREAST_BOTTLE",
  "FORMULA_PUMP",
  "FORMULA_BOTTLE",
];

const DEFAULT_CFG = {
  theme        : "boy",
  mode         : "light",
  disabledTypes: [],
  childName    : "",
  childSurname : "",
  /* NEW fields */
  birthTs      : "",
  appTitle     : "Web-Baby",
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

export function loadConfig() { return CACHE; }

/* helpers */
export function effectiveTheme(fallback = "boy") {
  return CACHE.theme ?? fallback;
}
export function effectiveMode(fallback = "light") {
  return CACHE.mode ?? fallback;
}
export function isTypeEnabled(t) {
  return !CACHE.disabledTypes.includes(t);
}
export function birthTimestamp() {
  return CACHE.birthTs || null;
}
export function appTitle() {
  return CACHE.appTitle || "Web-Baby";
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
