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
};

let CACHE = { ...DEFAULT_CFG };

/* first thing called from index.jsx */
export async function initConfig(env = {}) {
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

export function effectiveTheme(envTheme = "boy") {
  return CACHE.theme ?? envTheme;
}
export function effectiveMode(envMode = "light") {
  return CACHE.mode ?? envMode;
}
export function isTypeEnabled(t) {
  return !CACHE.disabledTypes.includes(t);
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
