/**
 * Canvas 2D frame renderer.
 *
 * Each frame represents 1 hour of the baby's life.
 * Canvas: 1280 x 720
 *
 * Layout:
 *   Header:       date, age, hour
 *   Left:         today's feeding stacked bar
 *   Top-right:    weight trend (last 60 days mini chart)
 *   Bottom-right: sleep trend (last 30 days mini chart)
 *   Bottom bar:   teeth count indicator
 */

import { format } from "date-fns";
import { ORDER as FEED_TYPES, COLOURS, LABELS } from "../../feedTypes.js";

const W = 1280;
const H = 720;

/* colour helpers */
function hexToRgba(hex, a) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function createRenderer(canvas, { accentColor, childName, byDay }) {
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  /** Render a single frame for the given hour offset since birth. */
  function renderFrame(hourIndex) {
    const dayIndex  = Math.floor(hourIndex / 24);
    const hourOfDay = hourIndex % 24;
    const day       = byDay[Math.min(dayIndex, byDay.length - 1)];
    if (!day) return;

    /* background */
    const isNight = hourOfDay < 7 || hourOfDay >= 20;
    ctx.fillStyle = isNight ? "#111827" : "#f9fafb";
    ctx.fillRect(0, 0, W, H);

    const fg = isNight ? "#e5e7eb" : "#0f172a";
    const fgDim = isNight ? "#9ca3af" : "#6b7280";
    const cardBg = isNight ? "#1f2937" : "#ffffff";

    /* ── header ─────────────────────────────────────────── */
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, W, 60);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px Inter, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(childName || "Baby", 20, 30);

    ctx.font = "18px Inter, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(format(day.date, "d MMM yyyy"), W - 20, 22);

    const months = Math.floor(dayIndex / 30);
    const days   = dayIndex % 30;
    const ageStr = months > 0 ? `${months}m ${days}d` : `${days}d`;
    ctx.fillText(`Age: ${ageStr}  |  ${String(hourOfDay).padStart(2,"0")}:00`, W - 20, 44);
    ctx.textAlign = "left";

    /* ── left: feeding stacked bar ──────────────────────── */
    const barX = 30;
    const barY = 80;
    const barW = 200;
    const barH = 500;

    /* card background */
    roundRect(ctx, barX - 10, barY - 10, barW + 20, barH + 50, 8, cardBg);

    ctx.fillStyle = fg;
    ctx.font = "bold 14px Inter, sans-serif";
    ctx.fillText("Feeding today", barX, barY + barH + 30);

    const summary = day.summary;
    if (summary && summary.totalsByType) {
      const total = Object.values(summary.totalsByType).reduce((a, b) => a + b, 0);
      const maxMl = Math.max(total, 800); // scale
      const fraction = hourOfDay / 24;    // how far through the day

      let yOff = barY + barH;
      for (const t of FEED_TYPES) {
        const ml = (summary.totalsByType[t] || 0) * fraction;
        const h  = (ml / maxMl) * barH;
        if (h < 1) continue;
        ctx.fillStyle = COLOURS[t];
        ctx.fillRect(barX, yOff - h, barW, h);
        yOff -= h;
      }

      /* total label */
      const shownMl = Math.round(total * fraction);
      ctx.fillStyle = fg;
      ctx.font = "16px Inter, sans-serif";
      ctx.fillText(`${shownMl} ml`, barX + barW + 15, barY + barH - 10);
    } else {
      ctx.fillStyle = fgDim;
      ctx.font = "14px Inter, sans-serif";
      ctx.fillText("No data", barX + 60, barY + barH / 2);
    }

    /* bar outline */
    ctx.strokeStyle = fgDim;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    /* ── top-right: weight trend (last 60 days) ─────────── */
    const trX = 320;
    const trY = 80;
    const trW = 920;
    const trH = 240;

    roundRect(ctx, trX, trY, trW, trH, 8, cardBg);

    ctx.fillStyle = fg;
    ctx.font = "bold 14px Inter, sans-serif";
    ctx.fillText("Weight trend (last 60 days)", trX + 15, trY + 22);

    const weightData = [];
    for (let d = Math.max(0, dayIndex - 59); d <= dayIndex; d++) {
      if (byDay[d] && byDay[d].weightG != null) {
        weightData.push(byDay[d].weightG);
      } else {
        weightData.push(null);
      }
    }
    drawMiniChart(ctx, trX + 15, trY + 40, trW - 30, trH - 60, weightData, accentColor, fg, fgDim, "g");

    /* current weight label */
    if (day.weightG != null) {
      ctx.fillStyle = accentColor;
      ctx.font = "bold 20px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${(day.weightG / 1000).toFixed(2)} kg`, trX + trW - 15, trY + 22);
      ctx.textAlign = "left";
    }

    /* ── bottom-right: sleep trend (last 30 days) ───────── */
    const brX = 320;
    const brY = 340;
    const brW = 920;
    const brH = 240;

    roundRect(ctx, brX, brY, brW, brH, 8, cardBg);

    ctx.fillStyle = fg;
    ctx.font = "bold 14px Inter, sans-serif";
    ctx.fillText("Sleep trend (last 30 days)", brX + 15, brY + 22);

    const sleepData = [];
    for (let d = Math.max(0, dayIndex - 29); d <= dayIndex; d++) {
      if (byDay[d] && byDay[d].summary && byDay[d].summary.sleepHours != null) {
        sleepData.push(byDay[d].summary.sleepHours);
      } else {
        sleepData.push(null);
      }
    }
    drawMiniChart(ctx, brX + 15, brY + 40, brW - 30, brH - 60, sleepData, "#6366f1", fg, fgDim, "h");

    /* current height label */
    if (day.heightCm != null) {
      ctx.fillStyle = "#6366f1";
      ctx.font = "bold 20px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${day.heightCm} cm`, brX + brW - 15, brY + 22);
      ctx.textAlign = "left";
    }

    /* ── bottom bar: teeth ──────────────────────────────── */
    const tbY = 600;
    roundRect(ctx, 30, tbY, W - 60, 100, 8, cardBg);

    ctx.fillStyle = fg;
    ctx.font = "bold 14px Inter, sans-serif";
    ctx.fillText("Teeth", 50, tbY + 22);

    const tc = day.teethCount || 0;
    ctx.fillStyle = accentColor;
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.fillText(String(tc), 110, tbY + 22);

    /* draw little tooth squares */
    const toothSize = 18;
    const toothGap  = 4;
    const toothY    = tbY + 45;
    for (let i = 0; i < 20; i++) {
      const tx = 50 + i * (toothSize + toothGap);
      ctx.fillStyle = i < tc ? accentColor : (isNight ? "#374151" : "#e5e7eb");
      roundRect(ctx, tx, toothY, toothSize, toothSize + 6, 3, ctx.fillStyle);
    }
  }

  return { renderFrame };
}

/* ── helpers ──────────────────────────────────────────────────── */
function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
}

function drawMiniChart(ctx, x, y, w, h, data, color, fg, fgDim, unit) {
  const vals = data.filter(v => v != null);
  if (vals.length < 2) {
    ctx.fillStyle = fgDim;
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText("Not enough data", x + w / 2 - 50, y + h / 2);
    return;
  }

  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  /* axis labels */
  ctx.fillStyle = fgDim;
  ctx.font = "11px Inter, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(formatVal(max, unit), x - 4, y + 10);
  ctx.fillText(formatVal(min, unit), x - 4, y + h);
  ctx.textAlign = "left";

  /* grid lines */
  ctx.strokeStyle = hexToRgba(fgDim, 0.2);
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const gy = y + (h * i) / 4;
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }

  /* line */
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  let started = false;
  for (let i = 0; i < data.length; i++) {
    if (data[i] == null) continue;
    const px = x + (i / (data.length - 1)) * w;
    const py = y + h - ((data[i] - min) / range) * h;
    if (!started) { ctx.moveTo(px, py); started = true; }
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  /* fill area under line */
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, 0.1);
  ctx.fill();
}

function formatVal(v, unit) {
  if (unit === "g") return (v / 1000).toFixed(1) + "kg";
  return v.toFixed(1) + unit;
}
