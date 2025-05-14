/**
 * Very small “session config” helper.
 *
 * • Data live only in sessionStorage – clearing the tab/browser resets it.
 * • Structure:
 *     {
 *       theme        : "boy" | "girl" | null,   // null ⇒ fallback to ENV
 *       mode         : "light" | "dark" | null, // null ⇒ fallback to ENV
 *       disabledTypes: [ "BREAST_DIRECT", … ]
 *     }
 */
const STORAGE_KEY = "web_baby_cfg";

export const ALL_TYPES = [
  "BREAST_DIRECT",
  "BREAST_BOTTLE",
  "FORMULA_PUMP",
  "FORMULA_BOTTLE",
];

const DEFAULT_CFG = {
  theme        : null,
  mode         : null,
  disabledTypes: [],
};

/* ─── storage helpers ─────────────────────────────────────────────── */
export function loadConfig() {
  try {
    return { ...DEFAULT_CFG, ...(JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}) };
  } catch {
    return { ...DEFAULT_CFG };
  }
}

export function saveConfig(cfg) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
}

/* ─── derived helpers ─────────────────────────────────────────────── */
export function effectiveTheme(envTheme = "boy") {
  const { theme } = loadConfig();
  return theme ?? envTheme;
}

export function effectiveMode(envMode = "light") {
  const { mode } = loadConfig();
  return mode ?? envMode;
}

export function isTypeEnabled(type) {
  return !loadConfig().disabledTypes.includes(type);
}
