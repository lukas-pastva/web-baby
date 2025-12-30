/* Centralised feed-type definitions
 * ───────────────────────────────── */

export const ORDER = [
  "FORMULA_BOTTLE",
  "FORMULA_PUMP",
  "BREAST_BOTTLE",
  "BREAST_DIRECT",
  "FRUIT",
  "PORRIDGE",
  "VEGETABLES_MEAT",
];

export const ICONS = {
  FORMULA_BOTTLE  : "🍼",
  FORMULA_PUMP    : "🍼⚙️",
  BREAST_BOTTLE   : "🤱🍼",
  BREAST_DIRECT   : "🤱",
  FRUIT           : "🍎",
  PORRIDGE        : "🥣",
  VEGETABLES_MEAT : "🥦🍖",
};

export const LABELS = {
  FORMULA_BOTTLE  : "Formula – bottle",
  FORMULA_PUMP    : "Formula – pump / tube",
  BREAST_BOTTLE   : "Breast – bottle",
  BREAST_DIRECT   : "Breast – direct",
  FRUIT           : "Ovocie",
  PORRIDGE        : "Kaša",
  VEGETABLES_MEAT : "Zelenina s mäsom",
};

/* Brand colours used by the charts */
export const COLOURS = {
  FORMULA_BOTTLE  : "#264653",
  FORMULA_PUMP    : "#e76f51",
  BREAST_BOTTLE   : "#2a9d8f",
  BREAST_DIRECT   : "#f4a261",
  FRUIT           : "#e63946",
  PORRIDGE        : "#a8dadc",
  VEGETABLES_MEAT : "#457b9d",
};

/* Handy utility for Chart-JS components */
export function buildTypeMeta() {
  return ORDER.reduce(
    (o, k) => ({ ...o, [k]: { c: COLOURS[k], lbl: LABELS[k] } }),
    {},
  );
}
export default { ORDER, ICONS, LABELS, COLOURS, buildTypeMeta };
