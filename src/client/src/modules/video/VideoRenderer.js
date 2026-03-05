/**
 * Canvas 2D frame renderer – one frame per day.
 *
 * Canvas: 1280 x 720
 *
 * Layout:
 *   Header:        baby illustration, name, date, age
 *   Left:          today's feeding stacked bar + total ml + feed count + legend
 *   Top-right:     weight trend (last 60 days)
 *   Mid-right:     height trend (last 60 days)
 *   Bottom-right:  night sleep trend (last 30 days) + max night sleep
 *   Bottom bar:    teeth count indicator
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

/* ── baby stage illustrations (canvas-drawn) ──────────────────────── */
function getBabyStage(dayIndex) {
  const months = dayIndex / 30.44;
  if (months < 1)  return 0;  // newborn
  if (months < 3)  return 1;  // tiny baby
  if (months < 6)  return 2;  // infant
  if (months < 9)  return 3;  // sitting baby
  if (months < 12) return 4;  // crawling baby
  return 5;                   // toddler
}

function drawBabyIllustration(ctx, cx, cy, stage, accent) {
  const skinColor = "#fdd8b5";
  const cheekColor = "#f8b4b4";
  const eyeColor = "#374151";
  const mouthColor = "#e05566";

  ctx.save();
  ctx.translate(cx, cy);

  // scale grows with stage
  const scale = 0.7 + stage * 0.06;
  ctx.scale(scale, scale);

  // head
  const headR = 20;
  ctx.beginPath();
  ctx.arc(0, -8, headR, 0, Math.PI * 2);
  ctx.fillStyle = skinColor;
  ctx.fill();
  ctx.strokeStyle = "#e8c9a0";
  ctx.lineWidth = 1;
  ctx.stroke();

  // hair (more with age)
  if (stage >= 1) {
    ctx.fillStyle = "#8B6914";
    const hairCount = Math.min(stage + 2, 7);
    for (let i = 0; i < hairCount; i++) {
      const angle = -Math.PI * 0.8 + (i / (hairCount - 1)) * Math.PI * 0.6;
      const hx = Math.cos(angle) * (headR - 2);
      const hy = Math.sin(angle) * (headR - 2) - 8;
      ctx.beginPath();
      ctx.ellipse(hx, hy, 4, 6 + stage, angle + Math.PI / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // eyes
  if (stage === 0) {
    // closed eyes (sleeping newborn)
    ctx.strokeStyle = eyeColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-7, -10, 3, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(7, -10, 3, 0, Math.PI);
    ctx.stroke();
  } else {
    // open eyes
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(-7, -10, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -10, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = eyeColor;
    ctx.beginPath(); ctx.arc(-6, -10, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(8, -10, 2, 0, Math.PI * 2); ctx.fill();
    // highlight
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(-5, -11, 1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(9, -11, 1, 0, Math.PI * 2); ctx.fill();
  }

  // cheeks
  ctx.fillStyle = cheekColor;
  ctx.globalAlpha = 0.3;
  ctx.beginPath(); ctx.arc(-13, -4, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(13, -4, 4, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // mouth
  ctx.strokeStyle = mouthColor;
  ctx.lineWidth = 1.5;
  if (stage <= 1) {
    // small mouth
    ctx.beginPath();
    ctx.arc(0, -2, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();
  } else {
    // bigger smile
    ctx.beginPath();
    ctx.arc(0, -3, 5, 0.15, Math.PI - 0.15);
    ctx.stroke();
    // teeth showing for older babies
    if (stage >= 4) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(-3, -2, 6, 3);
    }
  }

  // body
  const bodyY = headR - 8 + 2;
  if (stage === 0) {
    // swaddle
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.ellipse(0, bodyY + 14, 16, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    // wrap line
    ctx.strokeStyle = hexToRgba(accent, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, bodyY + 8);
    ctx.quadraticCurveTo(0, bodyY + 20, 12, bodyY + 8);
    ctx.stroke();
  } else if (stage <= 2) {
    // onesie
    ctx.fillStyle = accent;
    roundRectPath(ctx, -14, bodyY, 28, 28, 6);
    ctx.fill();
    // arms
    ctx.fillStyle = skinColor;
    ctx.beginPath(); ctx.ellipse(-18, bodyY + 10, 5, 4, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(18, bodyY + 10, 5, 4, 0.3, 0, Math.PI * 2); ctx.fill();
  } else if (stage <= 3) {
    // sitting body
    ctx.fillStyle = accent;
    roundRectPath(ctx, -16, bodyY, 32, 24, 6);
    ctx.fill();
    // legs (sitting)
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.ellipse(-10, bodyY + 28, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, bodyY + 28, 8, 5, 0, 0, Math.PI * 2); ctx.fill();
    // arms reaching
    ctx.fillStyle = skinColor;
    ctx.beginPath(); ctx.ellipse(-22, bodyY + 4, 5, 4, -0.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(22, bodyY + 4, 5, 4, 0.5, 0, Math.PI * 2); ctx.fill();
  } else {
    // standing body
    ctx.fillStyle = accent;
    roundRectPath(ctx, -14, bodyY, 28, 22, 6);
    ctx.fill();
    // legs (standing)
    ctx.fillStyle = accent;
    ctx.fillRect(-12, bodyY + 20, 8, 14);
    ctx.fillRect(4, bodyY + 20, 8, 14);
    // feet
    ctx.fillStyle = skinColor;
    ctx.beginPath(); ctx.ellipse(-8, bodyY + 35, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(8, bodyY + 35, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
    // arms
    ctx.fillStyle = skinColor;
    ctx.beginPath(); ctx.ellipse(-20, bodyY + 6, 5, 4, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(20, bodyY + 6, 5, 4, 0.4, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

function roundRectPath(ctx, x, y, w, h, r) {
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
}

/* ── main renderer ────────────────────────────────────────────────── */
export function createRenderer(canvas, { accentColor, childName, byDay }) {
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  /** Render a single frame for the given dayIndex. */
  function renderFrame(dayIndex) {
    const day = byDay[Math.min(dayIndex, byDay.length - 1)];
    if (!day) return;

    const bg = "#f9fafb";
    const fg = "#0f172a";
    const fgDim = "#6b7280";
    const cardBg = "#ffffff";
    const cardBorder = "#e5e7eb";

    /* background */
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    /* ── header ─────────────────────────────────────────── */
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, W, 65);

    // baby illustration
    const stage = getBabyStage(dayIndex);
    drawBabyIllustration(ctx, 50, 35, stage, accentColor);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(childName || "Baby", 90, 24);

    // stage label
    const stageLabels = ["Newborn", "Tiny baby", "Infant", "Sitting up", "Crawling", "Standing"];
    ctx.font = "13px Inter, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText(stageLabels[stage] || "", 90, 48);

    ctx.font = "18px Inter, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "right";
    ctx.fillText(format(day.date, "d MMM yyyy"), W - 20, 22);

    const months = Math.floor(dayIndex / 30);
    const days   = dayIndex % 30;
    const ageStr = months > 0 ? `${months}m ${days}d` : `${days}d`;
    ctx.fillText(`Age: ${ageStr}  ·  Day ${dayIndex + 1}`, W - 20, 48);
    ctx.textAlign = "left";

    /* ── left: feeding stacked bar ──────────────────────── */
    const barX = 30;
    const barY = 85;
    const barW = 180;
    const barH = 360;

    roundRect(ctx, barX - 10, barY - 10, barW + 45, barH + 145, 10, cardBg, cardBorder);

    ctx.fillStyle = fg;
    ctx.font = "bold 13px Inter, sans-serif";
    ctx.fillText("Feeding today", barX, barY - 0);

    const summary = day.summary;
    const total = summary?.totalsByType
      ? Object.values(summary.totalsByType).reduce((a, b) => a + b, 0)
      : 0;

    if (summary && summary.totalsByType && total > 0) {
      const maxMl = Math.max(total, 600);

      let yOff = barY + barH;
      for (const t of FEED_TYPES) {
        const ml = summary.totalsByType[t] || 0;
        const h  = (ml / maxMl) * barH;
        if (h < 1) continue;
        ctx.fillStyle = COLOURS[t];
        ctx.fillRect(barX, yOff - h, barW, h);
        yOff -= h;
      }

      /* total label */
      ctx.fillStyle = fg;
      ctx.font = "bold 18px Inter, sans-serif";
      ctx.fillText(`${total} ml`, barX, barY + barH + 22);

      ctx.font = "13px Inter, sans-serif";
      ctx.fillStyle = fgDim;
      ctx.fillText(`${day.feedCount} feeds`, barX, barY + barH + 42);
    } else {
      ctx.fillStyle = fgDim;
      ctx.font = "13px Inter, sans-serif";
      ctx.fillText("No data", barX + 50, barY + barH / 2);
    }

    /* bar outline */
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY + 10, barW, barH);

    /* mini legend */
    let legendY = barY + barH + 58;
    ctx.font = "10px Inter, sans-serif";
    for (const t of FEED_TYPES) {
      if (summary?.totalsByType?.[t]) {
        ctx.fillStyle = COLOURS[t];
        ctx.fillRect(barX, legendY, 8, 8);
        ctx.fillStyle = fgDim;
        const lbl = LABELS[t].length > 16 ? LABELS[t].slice(0, 15) + "…" : LABELS[t];
        ctx.fillText(lbl, barX + 12, legendY + 8);
        legendY += 13;
      }
    }

    /* ── top-right: weight trend (last 60 days) ─────────── */
    const rX = 270;
    const chartW = W - rX - 20;

    const wY = 85;
    const wH = 175;
    roundRect(ctx, rX, wY - 10, chartW, wH + 15, 10, cardBg, cardBorder);

    ctx.fillStyle = fg;
    ctx.font = "bold 13px Inter, sans-serif";
    ctx.fillText("Weight (last 60 days)", rX + 15, wY + 4);

    const weightData = collectData(byDay, dayIndex, 60, d => d.weightG);
    drawMiniChart(ctx, rX + 50, wY + 20, chartW - 70, wH - 35, weightData, accentColor, fg, fgDim, "g");

    if (day.weightG != null) {
      ctx.fillStyle = accentColor;
      ctx.font = "bold 20px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${(day.weightG / 1000).toFixed(2)} kg`, rX + chartW - 15, wY + 6);
      ctx.textAlign = "left";
    }

    /* ── mid-right: height trend (last 60 days) ────────── */
    const hY = wY + wH + 15;
    const hH = 155;
    roundRect(ctx, rX, hY - 10, chartW, hH + 15, 10, cardBg, cardBorder);

    ctx.fillStyle = fg;
    ctx.font = "bold 13px Inter, sans-serif";
    ctx.fillText("Height (last 60 days)", rX + 15, hY + 4);

    const heightData = collectData(byDay, dayIndex, 60, d => d.heightCm);
    drawMiniChart(ctx, rX + 50, hY + 20, chartW - 70, hH - 35, heightData, "#8b5cf6", fg, fgDim, "cm");

    if (day.heightCm != null) {
      ctx.fillStyle = "#8b5cf6";
      ctx.font = "bold 20px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${day.heightCm} cm`, rX + chartW - 15, hY + 6);
      ctx.textAlign = "left";
    }

    /* ── bottom-right: sleep trend (last 30 days) ───────── */
    const sY = hY + hH + 15;
    const sH = 155;
    roundRect(ctx, rX, sY - 10, chartW, sH + 15, 10, cardBg, cardBorder);

    ctx.fillStyle = fg;
    ctx.font = "bold 13px Inter, sans-serif";
    ctx.fillText("Night sleep (last 30 days)", rX + 15, sY + 4);

    const sleepData = collectData(byDay, dayIndex, 30, d => d.sleepHours);
    drawMiniChart(ctx, rX + 50, sY + 20, chartW - 70, sH - 35, sleepData, "#6366f1", fg, fgDim, "h");

    // current night sleep
    if (day.sleepHours != null) {
      ctx.fillStyle = "#6366f1";
      ctx.font = "bold 16px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${day.sleepHours}h`, rX + chartW - 15, sY + 6);
      ctx.textAlign = "left";
    }

    // max night sleep ever
    if (day.maxSleepSoFar > 0) {
      ctx.fillStyle = "#6366f1";
      ctx.font = "13px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`max: ${day.maxSleepSoFar}h`, rX + chartW - 15, sY + sH - 2);
      ctx.textAlign = "left";
    }

    /* ── bottom bar: teeth ──────────────────────────────── */
    const tbY = sY + sH + 15;
    const tbH = H - tbY - 10;
    roundRect(ctx, 20, tbY, W - 40, tbH, 10, cardBg, cardBorder);

    ctx.fillStyle = fg;
    ctx.font = "bold 14px Inter, sans-serif";
    ctx.fillText("Teeth", 40, tbY + 20);

    const tc = day.teethCount || 0;
    ctx.fillStyle = accentColor;
    ctx.font = "bold 26px Inter, sans-serif";
    ctx.fillText(`${tc}/20`, 95, tbY + 22);

    /* draw tooth squares */
    const toothSize = 16;
    const toothGap  = 5;
    const toothStartX = 170;
    const toothY = tbY + 8;
    for (let i = 0; i < 20; i++) {
      const tx = toothStartX + i * (toothSize + toothGap);
      ctx.fillStyle = i < tc ? accentColor : "#e5e7eb";
      roundRect(ctx, tx, toothY, toothSize, toothSize + 4, 3, ctx.fillStyle);
    }

    /* summary stats on right side of bottom bar */
    const statsX = W - 320;
    ctx.font = "12px Inter, sans-serif";
    ctx.fillStyle = fgDim;
    const stats = [];
    if (day.weightG != null) stats.push(`Weight: ${(day.weightG / 1000).toFixed(2)} kg`);
    if (day.heightCm != null) stats.push(`Height: ${day.heightCm} cm`);
    if (total > 0) stats.push(`Milk: ${total} ml (${day.feedCount} feeds)`);
    if (day.sleepHours != null) stats.push(`Sleep: ${day.sleepHours}h`);
    ctx.fillText(stats.join("  ·  "), statsX, tbY + 20);
  }

  return { renderFrame };
}

/* ── helpers ──────────────────────────────────────────────────── */
function collectData(byDay, dayIndex, lookback, getter) {
  const data = [];
  for (let d = Math.max(0, dayIndex - lookback + 1); d <= dayIndex; d++) {
    const val = byDay[d] ? getter(byDay[d]) : null;
    data.push(val != null ? val : null);
  }
  return data;
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
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
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawMiniChart(ctx, x, y, w, h, data, color, fg, fgDim, unit) {
  const vals = data.filter(v => v != null);
  if (vals.length < 2) {
    ctx.fillStyle = fgDim;
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText("Not enough data", x + w / 2 - 45, y + h / 2);
    return;
  }

  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;

  /* axis labels */
  ctx.fillStyle = fgDim;
  ctx.font = "10px Inter, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(formatVal(max, unit), x - 4, y + 8);
  ctx.fillText(formatVal(min, unit), x - 4, y + h);
  ctx.textAlign = "left";

  /* grid lines */
  ctx.strokeStyle = hexToRgba(fgDim, 0.15);
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
  let lastPx, lastPy;
  for (let i = 0; i < data.length; i++) {
    if (data[i] == null) continue;
    const px = x + (i / (data.length - 1)) * w;
    const py = y + h - ((data[i] - min) / range) * h;
    if (!started) { ctx.moveTo(px, py); started = true; }
    else ctx.lineTo(px, py);
    lastPx = px;
    lastPy = py;
  }
  ctx.stroke();

  /* dot at current value */
  if (lastPx != null) {
    ctx.beginPath();
    ctx.arc(lastPx, lastPy, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  /* fill area under line */
  ctx.beginPath();
  started = false;
  for (let i = 0; i < data.length; i++) {
    if (data[i] == null) continue;
    const px = x + (i / (data.length - 1)) * w;
    const py = y + h - ((data[i] - min) / range) * h;
    if (!started) { ctx.moveTo(px, py); started = true; }
    else ctx.lineTo(px, py);
  }
  ctx.lineTo(lastPx, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fillStyle = hexToRgba(color, 0.08);
  ctx.fill();
}

function formatVal(v, unit) {
  if (unit === "g")  return (v / 1000).toFixed(1) + "kg";
  if (unit === "cm") return v.toFixed(1) + "cm";
  return v.toFixed(1) + unit;
}
