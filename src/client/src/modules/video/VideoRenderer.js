/**
 * Canvas 2D frame renderer – dark theme, 30 FPS.
 *
 * Each frame = one time-step (hour slot) of the baby's life.
 * Canvas: 1280 x 720
 */

import { format } from "date-fns";
import { ORDER as FEED_TYPES, COLOURS, LABELS } from "../../feedTypes.js";

const W = 1280;
const H = 720;

/* ── colour helpers ──────────────────────────────────────────────── */
function hexToRgba(hex, a) {
  const c = hex.replace("#", "");
  return `rgba(${parseInt(c.substring(0,2),16)},${parseInt(c.substring(2,4),16)},${parseInt(c.substring(4,6),16)},${a})`;
}
function lerpColor(a, b, t) {
  const pa = [parseInt(a.slice(1,3),16), parseInt(a.slice(3,5),16), parseInt(a.slice(5,7),16)];
  const pb = [parseInt(b.slice(1,3),16), parseInt(b.slice(3,5),16), parseInt(b.slice(5,7),16)];
  const r = Math.round(pa[0] + (pb[0]-pa[0]) * t);
  const g = Math.round(pa[1] + (pb[1]-pa[1]) * t);
  const bl = Math.round(pa[2] + (pb[2]-pa[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

/* ── sky colours by hour ─────────────────────────────────────────── */
function skyGradient(ctx, hourOfDay) {
  // night: deep navy, dawn/dusk: warm, day: dark blue-gray
  const stops = [
    { h:  0, top: "#070b15", bot: "#0d1020" },  // midnight
    { h:  5, top: "#0a0f1e", bot: "#121830" },  // pre-dawn
    { h:  7, top: "#1a1535", bot: "#2d1f4e" },  // dawn
    { h:  9, top: "#1c2333", bot: "#232d42" },  // morning
    { h: 12, top: "#1e2738", bot: "#263245" },  // noon (still dark theme)
    { h: 17, top: "#1e2738", bot: "#263245" },  // afternoon
    { h: 19, top: "#1a1535", bot: "#2d1f4e" },  // dusk
    { h: 21, top: "#0d1025", bot: "#111530" },  // evening
    { h: 24, top: "#070b15", bot: "#0d1020" },  // midnight
  ];
  let s0 = stops[0], s1 = stops[1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (hourOfDay >= stops[i].h && hourOfDay <= stops[i+1].h) {
      s0 = stops[i]; s1 = stops[i+1]; break;
    }
  }
  const t = (hourOfDay - s0.h) / (s1.h - s0.h || 1);
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, lerpColor(s0.top, s1.top, t));
  g.addColorStop(1, lerpColor(s0.bot, s1.bot, t));
  return g;
}

/* ── stars (drawn at night) ──────────────────────────────────────── */
const STARS = Array.from({length: 60}, () => ({
  x: Math.random() * W,
  y: Math.random() * H * 0.4,
  r: Math.random() * 1.5 + 0.5,
  b: Math.random() * 0.5 + 0.5,
}));

function drawStars(ctx, hourOfDay) {
  const nightness = hourOfDay < 6 ? 1 : hourOfDay < 8 ? (8-hourOfDay)/2
    : hourOfDay > 20 ? (hourOfDay-20)/4 : hourOfDay > 18 ? (hourOfDay-18)/2 * 0.5 : 0;
  if (nightness < 0.05) return;
  for (const s of STARS) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${nightness * s.b * 0.6})`;
    ctx.fill();
  }
}

/* ── sun / moon icon ─────────────────────────────────────────────── */
function drawCelestial(ctx, x, y, hourOfDay, accent) {
  const isDay = hourOfDay >= 7 && hourOfDay < 19;
  if (isDay) {
    // sun
    const sunColor = "#fbbf24";
    ctx.fillStyle = sunColor;
    ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();
    // glow
    ctx.fillStyle = hexToRgba(sunColor, 0.15);
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
    // rays
    ctx.strokeStyle = hexToRgba(sunColor, 0.4);
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * 17, y + Math.sin(a) * 17);
      ctx.lineTo(x + Math.cos(a) * 24, y + Math.sin(a) * 24);
      ctx.stroke();
    }
  } else {
    // moon
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill();
    // crescent shadow
    ctx.fillStyle = hexToRgba("#070b15", 0.7);
    ctx.beginPath(); ctx.arc(x + 5, y - 3, 11, 0, Math.PI * 2); ctx.fill();
    // glow
    ctx.fillStyle = "rgba(226,232,240,0.08)";
    ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
  }
}

/* ── baby illustration ───────────────────────────────────────────── */
function getBabyStage(dayIndex) {
  const m = dayIndex / 30.44;
  if (m < 1)  return 0;
  if (m < 3)  return 1;
  if (m < 6)  return 2;
  if (m < 9)  return 3;
  if (m < 12) return 4;
  return 5;
}

function drawBaby(ctx, cx, cy, stage, accent) {
  const skin = "#fdd8b5";
  const cheek = "#f8b4b4";
  ctx.save();
  ctx.translate(cx, cy);
  const sc = 0.75 + stage * 0.05;
  ctx.scale(sc, sc);

  const headR = 18;
  // head
  ctx.beginPath(); ctx.arc(0, 0, headR, 0, Math.PI*2);
  ctx.fillStyle = skin; ctx.fill();
  ctx.strokeStyle = "#e8c9a0"; ctx.lineWidth = 1; ctx.stroke();

  // hair
  if (stage >= 1) {
    ctx.fillStyle = "#8B6914";
    const n = Math.min(stage + 2, 7);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI*0.8 + (i/(n-1)) * Math.PI*0.6;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a)*(headR-2), Math.sin(a)*(headR-2), 3, 5+stage, a+Math.PI/2, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // eyes
  if (stage === 0) {
    ctx.strokeStyle = "#374151"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(-6, -2, 3, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(6, -2, 3, 0, Math.PI); ctx.stroke();
  } else {
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(-6, -2, 3.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -2, 3.5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#374151";
    ctx.beginPath(); ctx.arc(-5.5, -2, 1.8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(6.5, -2, 1.8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(-5, -3, 0.8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -3, 0.8, 0, Math.PI*2); ctx.fill();
  }

  // cheeks
  ctx.fillStyle = cheek; ctx.globalAlpha = 0.25;
  ctx.beginPath(); ctx.arc(-12, 5, 4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(12, 5, 4, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;

  // mouth
  ctx.strokeStyle = "#e05566"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 6, stage < 2 ? 3 : 5, 0.15, Math.PI-0.15); ctx.stroke();
  if (stage >= 4) { ctx.fillStyle = "#fff"; ctx.fillRect(-3, 7, 6, 2); }

  // body
  const by = headR + 4;
  if (stage === 0) {
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.ellipse(0, by+12, 14, 16, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = hexToRgba(accent, 0.4); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-10, by+6); ctx.quadraticCurveTo(0, by+18, 10, by+6); ctx.stroke();
  } else if (stage <= 2) {
    ctx.fillStyle = accent;
    rr(ctx, -12, by, 24, 24, 5); ctx.fill();
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.ellipse(-16, by+8, 4, 3, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(16, by+8, 4, 3, 0.3, 0, Math.PI*2); ctx.fill();
  } else {
    ctx.fillStyle = accent;
    rr(ctx, -13, by, 26, 20, 5); ctx.fill();
    ctx.fillStyle = accent;
    ctx.fillRect(-10, by+18, 7, 12); ctx.fillRect(3, by+18, 7, 12);
    ctx.fillStyle = skin;
    ctx.beginPath(); ctx.ellipse(-7, by+31, 5, 3, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7, by+31, 5, 3, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-18, by+5, 4, 3, -0.4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(18, by+5, 4, 3, 0.4, 0, Math.PI*2); ctx.fill();
  }

  ctx.restore();
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

/* ── baby bottle ─────────────────────────────────────────────────── */
function drawBottle(ctx, x, y, w, h, fillFraction, summary, accent, fg, fgDim) {
  const neckW = w * 0.35;
  const neckH = h * 0.12;
  const capH  = h * 0.06;
  const bodyY = y + capH + neckH;
  const bodyH = h - capH - neckH;
  const neckX = x + (w - neckW) / 2;

  // cap
  ctx.fillStyle = "#4b5563";
  rr(ctx, neckX - 4, y, neckW + 8, capH, 4); ctx.fill();

  // neck
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  rr(ctx, neckX, y + capH, neckW, neckH, 2); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1;
  rr(ctx, neckX, y + capH, neckW, neckH, 2); ctx.stroke();

  // body outline
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  rr(ctx, x, bodyY, w, bodyH, 10); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1.5;
  rr(ctx, x, bodyY, w, bodyH, 10); ctx.stroke();

  // measurement lines
  ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 0.5;
  for (let i = 1; i <= 4; i++) {
    const ly = bodyY + bodyH - (i / 5) * bodyH;
    ctx.beginPath(); ctx.moveTo(x + 3, ly); ctx.lineTo(x + w * 0.3, ly); ctx.stroke();
  }

  // fill with feed-type colours
  if (summary?.totalsByType && fillFraction > 0) {
    const total = Object.values(summary.totalsByType).reduce((a, b) => a + b, 0);
    if (total > 0) {
      const maxMl = Math.max(total, 500);
      const fillH = (total / maxMl) * bodyH * 0.9 * fillFraction;

      ctx.save();
      // clip to bottle body shape
      rr(ctx, x + 1, bodyY + 1, w - 2, bodyH - 2, 9);
      ctx.clip();

      let yOff = bodyY + bodyH;
      for (const t of FEED_TYPES) {
        const ml = (summary.totalsByType[t] || 0) * fillFraction;
        const sh = (ml / maxMl) * bodyH * 0.9;
        if (sh < 0.5) continue;
        ctx.fillStyle = COLOURS[t];
        ctx.fillRect(x, yOff - sh, w, sh);
        yOff -= sh;
      }

      // liquid surface shine
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(x + w * 0.15, yOff, w * 0.15, Math.min(fillH, 3));

      ctx.restore();
    }
  }

  // bottle highlight (glass effect)
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(x + w * 0.7, bodyY + 8, w * 0.08, bodyH - 16);
}

/* ── progress gauge (horizontal bar) ─────────────────────────────── */
function drawGauge(ctx, x, y, w, h, value, maxVal, color, label, unit, fg, fgDim) {
  const pct = Math.min(value / maxVal, 1);

  // track
  rr(ctx, x, y, w, h, h/2); ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fill();

  // fill
  if (pct > 0.01) {
    rr(ctx, x, y, w * pct, h, h/2); ctx.fillStyle = color; ctx.fill();
    // glow
    rr(ctx, x, y, w * pct, h, h/2);
    ctx.fillStyle = hexToRgba(color, 0.15); ctx.fill();
  }

  // value text
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px Inter, sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(`${label}: ${formatValShort(value, unit)}`, x, y - 10);

  // endpoint
  ctx.fillStyle = fgDim;
  ctx.font = "11px Inter, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(formatValShort(maxVal, unit), x + w, y - 10);
  ctx.textAlign = "left";
}

function formatValShort(v, unit) {
  if (unit === "g") return (v / 1000).toFixed(2) + " kg";
  if (unit === "cm") return v.toFixed(1) + " cm";
  if (unit === "h") return v.toFixed(1) + "h";
  return String(v);
}

/* ── all-time growth chart (zero baseline) ───────────────────────── */
function drawGrowthChart(ctx, x, y, w, h, byDay, currentDay, accent, fg, fgDim) {
  const cardPad = 12;

  // card
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; rr(ctx, x, y, w, h, 10); ctx.stroke();

  ctx.fillStyle = "#fff"; ctx.font = "bold 12px Inter, sans-serif";
  ctx.fillText("Growth journey", x + cardPad, y + 18);

  const chartX = x + cardPad + 35;
  const chartY = y + 30;
  const chartW = w - cardPad * 2 - 40;
  const chartH = h - 50;

  if (currentDay < 2) {
    ctx.fillStyle = fgDim; ctx.font = "12px Inter, sans-serif";
    ctx.fillText("Collecting data...", chartX + chartW/2 - 40, chartY + chartH/2);
    return;
  }

  // collect weight data up to current day
  const wData = [];
  let maxW = 0;
  for (let d = 0; d <= currentDay && d < byDay.length; d++) {
    const v = byDay[d]?.weightG;
    wData.push(v);
    if (v != null && v > maxW) maxW = v;
  }
  const yMax = Math.ceil(maxW / 1000) * 1000 || 5000;

  // y-axis labels (from 0)
  ctx.fillStyle = fgDim; ctx.font = "9px Inter, sans-serif"; ctx.textAlign = "right";
  const ySteps = 4;
  for (let i = 0; i <= ySteps; i++) {
    const val = (yMax / ySteps) * (ySteps - i);
    const py = chartY + (i / ySteps) * chartH;
    ctx.fillText((val/1000).toFixed(1)+"kg", chartX - 4, py + 3);
    // grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(chartX, py); ctx.lineTo(chartX + chartW, py); ctx.stroke();
  }
  ctx.textAlign = "left";

  // x-axis month markers
  const totalDaysShown = currentDay + 1;
  ctx.fillStyle = fgDim; ctx.font = "9px Inter, sans-serif";
  for (let m = 0; m <= Math.ceil(totalDaysShown / 30); m++) {
    const dx = (m * 30 / totalDaysShown) * chartW;
    if (dx > chartW) break;
    ctx.fillText(`${m}m`, chartX + dx, chartY + chartH + 12);
    ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(chartX + dx, chartY); ctx.lineTo(chartX + dx, chartY + chartH); ctx.stroke();
  }

  // weight line
  ctx.beginPath(); ctx.strokeStyle = accent; ctx.lineWidth = 2;
  let started = false; let lastPx, lastPy;
  for (let d = 0; d < wData.length; d++) {
    if (wData[d] == null) continue;
    const px = chartX + (d / totalDaysShown) * chartW;
    const py = chartY + chartH - (wData[d] / yMax) * chartH;
    if (!started) { ctx.moveTo(px, py); started = true; }
    else ctx.lineTo(px, py);
    lastPx = px; lastPy = py;
  }
  ctx.stroke();

  // area fill
  if (started) {
    ctx.lineTo(lastPx, chartY + chartH);
    ctx.lineTo(chartX, chartY + chartH);
    ctx.closePath();
    ctx.fillStyle = hexToRgba(accent, 0.08); ctx.fill();
  }

  // current dot with glow
  if (lastPx != null) {
    ctx.fillStyle = hexToRgba(accent, 0.2);
    ctx.beginPath(); ctx.arc(lastPx, lastPy, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(lastPx, lastPy, 4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(lastPx, lastPy, 1.5, 0, Math.PI*2); ctx.fill();
  }

  // height line (secondary - purple)
  const hData = [];
  let maxH = 0;
  for (let d = 0; d <= currentDay && d < byDay.length; d++) {
    const v = byDay[d]?.heightCm;
    hData.push(v);
    if (v != null && v > maxH) maxH = v;
  }
  if (maxH > 0) {
    const hMax = Math.ceil(maxH / 10) * 10 || 80;
    ctx.beginPath(); ctx.strokeStyle = "#8b5cf6"; ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    started = false;
    let lx2, ly2;
    for (let d = 0; d < hData.length; d++) {
      if (hData[d] == null) continue;
      const px = chartX + (d / totalDaysShown) * chartW;
      const py = chartY + chartH - (hData[d] / hMax) * chartH;
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
      lx2 = px; ly2 = py;
    }
    ctx.stroke();
    ctx.setLineDash([]);

    if (lx2 != null) {
      ctx.fillStyle = "#8b5cf6";
      ctx.beginPath(); ctx.arc(lx2, ly2, 3, 0, Math.PI*2); ctx.fill();
    }

    // legend
    ctx.fillStyle = "#8b5cf6"; ctx.font = "10px Inter, sans-serif";
    ctx.fillText("— height", x + w - cardPad - 55, y + 18);
  }
}

/* ── parent mood helper ──────────────────────────────────────────── */
function moodFor(hours) {
  if (hours == null || hours === 0) return { label: "no data", color: "#9ca3af", face: "none" };
  if (hours < 3)  return { label: "exhausted", color: "#ef4444", face: "exhausted" };
  if (hours < 5)  return { label: "tired",     color: "#f59e0b", face: "tired" };
  if (hours < 7)  return { label: "okay",      color: "#3b82f6", face: "okay" };
  return                  { label: "well-rested", color: "#22c55e", face: "happy" };
}

function drawMoodFace(ctx, cx, cy, r, face, color) {
  // face circle
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = hexToRgba(color, 0.2); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();

  const eyeY = cy - r * 0.2;
  const eyeSpacing = r * 0.3;
  const mouthY = cy + r * 0.35;

  // eyes
  if (face === "exhausted") {
    // X eyes
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    for (const sx of [-1, 1]) {
      const ex = cx + sx * eyeSpacing;
      ctx.beginPath(); ctx.moveTo(ex - 3, eyeY - 3); ctx.lineTo(ex + 3, eyeY + 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ex + 3, eyeY - 3); ctx.lineTo(ex - 3, eyeY + 3); ctx.stroke();
    }
  } else if (face === "tired") {
    // half-closed eyes
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    for (const sx of [-1, 1]) {
      const ex = cx + sx * eyeSpacing;
      ctx.beginPath(); ctx.arc(ex, eyeY, 3, 0, Math.PI); ctx.stroke();
    }
  } else {
    // open eyes
    ctx.fillStyle = color;
    for (const sx of [-1, 1]) {
      ctx.beginPath(); ctx.arc(cx + sx * eyeSpacing, eyeY, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  // mouth
  ctx.strokeStyle = color; ctx.lineWidth = 2;
  if (face === "exhausted") {
    // frown
    ctx.beginPath(); ctx.arc(cx, mouthY + 5, r * 0.25, Math.PI + 0.3, -0.3); ctx.stroke();
  } else if (face === "tired") {
    // flat line
    ctx.beginPath(); ctx.moveTo(cx - r * 0.25, mouthY); ctx.lineTo(cx + r * 0.25, mouthY); ctx.stroke();
  } else if (face === "okay") {
    // slight smile
    ctx.beginPath(); ctx.arc(cx, mouthY - 2, r * 0.2, 0.2, Math.PI - 0.2); ctx.stroke();
  } else {
    // big smile
    ctx.beginPath(); ctx.arc(cx, mouthY - 3, r * 0.3, 0.15, Math.PI - 0.15); ctx.stroke();
  }
}

/* ── sleep visualization ─────────────────────────────────────────── */
function drawSleepSection(ctx, x, y, w, h, day, byDay, dayIndex, fg, fgDim) {
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; rr(ctx, x, y, w, h, 10); ctx.stroke();

  const sleepColor = "#6366f1";
  const maxPossible = 12;

  const sleepH = day.sleepHours ?? 0;
  const maxEver = day.maxSleepSoFar ?? 0;
  const mood = moodFor(sleepH > 0 ? sleepH : null);

  // parent mood face (replaces moon icon)
  if (mood.face !== "none") {
    drawMoodFace(ctx, x + 22, y + h/2, 14, mood.face, mood.color);
  } else {
    // moon icon fallback
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath(); ctx.arc(x + 22, y + h/2, 10, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "rgba(15,17,23,0.7)";
    ctx.beginPath(); ctx.arc(x + 26, y + h/2 - 3, 8, 0, Math.PI*2); ctx.fill();
  }

  // title with mood label
  ctx.fillStyle = "#fff"; ctx.font = "bold 12px Inter, sans-serif";
  ctx.fillText("Night sleep", x + 40, y + 16);
  if (mood.face !== "none") {
    ctx.fillStyle = mood.color; ctx.font = "10px Inter, sans-serif";
    ctx.fillText(mood.label, x + 115, y + 16);
  }

  // sleep bar
  const barX = x + 40;
  const barY = y + 24;
  const barW = w - 55;
  const barH = 14;

  rr(ctx, barX, barY, barW, barH, barH/2);
  ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fill();

  if (sleepH > 0) {
    const pct = sleepH / maxPossible;
    rr(ctx, barX, barY, barW * pct, barH, barH/2);
    ctx.fillStyle = mood.color; ctx.fill();
    // glow
    rr(ctx, barX, barY, barW * pct, barH, barH/2);
    ctx.fillStyle = hexToRgba(mood.color, 0.15); ctx.fill();
  }

  // max marker
  if (maxEver > 0) {
    const maxPct = maxEver / maxPossible;
    const mx = barX + barW * maxPct;
    ctx.strokeStyle = hexToRgba(sleepColor, 0.5); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(mx, barY - 2); ctx.lineTo(mx, barY + barH + 2); ctx.stroke();
  }

  // labels
  ctx.fillStyle = mood.color; ctx.font = "bold 14px Inter, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(sleepH > 0 ? `${sleepH}h` : "—", x + w - 14, y + 16);
  ctx.font = "10px Inter, sans-serif";
  ctx.fillStyle = fgDim;
  ctx.fillText(`best: ${maxEver}h`, x + w - 14, y + h - 8);
  ctx.textAlign = "left";

  // mini sparkline (last 30 days)
  const sparkY = barY + barH + 6;
  const sparkH = h - (sparkY - y) - 10;
  if (sparkH > 8 && dayIndex > 1) {
    ctx.strokeStyle = hexToRgba(sleepColor, 0.4); ctx.lineWidth = 1;
    ctx.beginPath();
    let s = false;
    const lookback = Math.min(dayIndex + 1, 30);
    for (let i = 0; i < lookback; i++) {
      const d = dayIndex - lookback + 1 + i;
      const sv = byDay[d]?.sleepHours;
      if (sv == null) continue;
      const px = barX + (i / (lookback - 1)) * barW;
      const py = sparkY + sparkH - (sv / maxPossible) * sparkH;
      if (!s) { ctx.moveTo(px, py); s = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }
}

/* ── teeth visualization ─────────────────────────────────────────── */
function drawTeeth(ctx, x, y, w, h, teethCount, accent, fgDim) {
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; rr(ctx, x, y, w, h, 10); ctx.stroke();

  ctx.fillStyle = "#fff"; ctx.font = "bold 12px Inter, sans-serif";
  ctx.fillText("Teeth", x + 14, y + h/2 + 4);

  ctx.fillStyle = accent; ctx.font = "bold 20px Inter, sans-serif";
  ctx.fillText(`${teethCount}`, x + 65, y + h/2 + 5);
  ctx.fillStyle = fgDim; ctx.font = "11px Inter, sans-serif";
  ctx.fillText("/20", x + 65 + ctx.measureText(`${teethCount}`).width + 2, y + h/2 + 4);

  // tooth shapes
  const startX = x + 110;
  const toothW = 14;
  const toothH = 18;
  const gap = 3;
  const toothY = y + (h - toothH) / 2;

  for (let i = 0; i < 20; i++) {
    const tx = startX + i * (toothW + gap);
    if (tx + toothW > x + w - 10) break;
    const active = i < teethCount;

    // tooth shape (rounded top, flat bottom)
    ctx.beginPath();
    ctx.moveTo(tx + 2, toothY + toothH);
    ctx.lineTo(tx + 2, toothY + 4);
    ctx.quadraticCurveTo(tx + 2, toothY, tx + toothW/2, toothY);
    ctx.quadraticCurveTo(tx + toothW - 2, toothY, tx + toothW - 2, toothY + 4);
    ctx.lineTo(tx + toothW - 2, toothY + toothH);
    ctx.closePath();

    if (active) {
      ctx.fillStyle = "#fff";
      ctx.fill();
      // subtle glow
      ctx.strokeStyle = hexToRgba(accent, 0.4);
      ctx.lineWidth = 1;
      ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // separator between upper/lower (every 10)
    if (i === 9) {
      const sepX = tx + toothW + gap / 2;
      ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(sepX, toothY - 2); ctx.lineTo(sepX, toothY + toothH + 2); ctx.stroke();
    }
  }
}

/* ── feed legend ─────────────────────────────────────────────────── */
function drawFeedLegend(ctx, x, y, summary, fgDim) {
  if (!summary?.totalsByType) return;
  ctx.font = "9px Inter, sans-serif";
  let ly = y;
  for (const t of FEED_TYPES) {
    const ml = summary.totalsByType[t] || 0;
    if (ml === 0) continue;
    ctx.fillStyle = COLOURS[t];
    rr(ctx, x, ly, 8, 8, 2); ctx.fill();
    ctx.fillStyle = fgDim;
    const lbl = LABELS[t].length > 14 ? LABELS[t].slice(0, 13) + "…" : LABELS[t];
    ctx.fillText(`${lbl} ${ml}ml`, x + 12, ly + 8);
    ly += 13;
  }
}

/* ══════════════════════════════════════════════════════════════════ */
/*  Main renderer                                                    */
/* ══════════════════════════════════════════════════════════════════ */
export function createRenderer(canvas, { accentColor, childName, byDay }) {
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const fg    = "#f4f4f5";
  const fgDim = "#a1a1aa";

  /** Render a single frame for the given dayIndex. */
  function renderFrame(dayIndex) {
    const day = byDay[Math.min(dayIndex, byDay.length - 1)];
    if (!day) return;

    /* ── background (static dark) ─────────────────────── */
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, W, H);

    /* ── header bar ────────────────────────────────────── */
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(0, 0, W, 60);
    // accent line at bottom of header
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 58, W, 2);

    // baby illustration
    const stage = getBabyStage(dayIndex);
    drawBaby(ctx, 40, 30, stage, accentColor);

    // name
    ctx.fillStyle = "#fff"; ctx.font = "bold 22px Inter, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(childName || "Baby", 80, 22);

    // stage label
    const stageLabels = ["Newborn", "Tiny baby", "Infant", "Sitting up", "Crawler", "Standing"];
    ctx.font = "12px Inter, sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(stageLabels[stage] || "", 80, 44);

    // right side: date, age
    ctx.fillStyle = "#fff"; ctx.font = "16px Inter, sans-serif"; ctx.textAlign = "right";
    ctx.fillText(format(day.date, "d MMM yyyy"), W - 20, 18);

    const months = Math.floor(dayIndex / 30);
    const days   = dayIndex % 30;
    const ageStr = months > 0 ? `${months}m ${days}d` : `${days}d`;
    ctx.fillText(`Age ${ageStr}`, W - 20, 44);
    ctx.textAlign = "left";

    /* ── layout regions ────────────────────────────────── */

    // scale bottle size with total ml eaten (0→smallest, 800ml→full)
    const totalMlRaw = day.summary?.totalsByType
      ? Object.values(day.summary.totalsByType).reduce((a, b) => a + b, 0)
      : 0;
    const bottleRatio = Math.max(0.4, Math.min(1, totalMlRaw / 800));
    const bottleH = Math.round(320 * bottleRatio);
    const bottleW = Math.round(110 * bottleRatio);
    const bottleX = 30 + Math.round((110 - bottleW) / 2);
    const bottleY = 75 + Math.round((320 - bottleH) / 2);

    // bottle card background (fixed size)
    rr(ctx, 15, 65, 140, 540, 12);
    ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
    rr(ctx, 15, 65, 140, 540, 12); ctx.stroke();

    drawBottle(ctx, bottleX, bottleY, bottleW, bottleH, 1, day.summary, accentColor, fg, fgDim);

    // totals below bottle
    const summary = day.summary;

    ctx.font = "bold 22px Inter, sans-serif"; ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(totalMlRaw > 0 ? `${Math.round(totalMlRaw)} ml` : "—", bottleX + bottleW/2, bottleY + bottleH + 25);

    ctx.font = "12px Inter, sans-serif"; ctx.fillStyle = fgDim;
    ctx.fillText(day.feedCount > 0 ? `${day.feedCount} feeds` : "", bottleX + bottleW/2, bottleY + bottleH + 45);
    ctx.textAlign = "left";

    // feed legend
    drawFeedLegend(ctx, bottleX - 10, bottleY + bottleH + 60, day.summary, fgDim);

    /* ── right column ──────────────────────────────────── */
    const rX = 175;
    const rW = W - rX - 20;

    // weight gauge
    const wgY = 72;
    const expectedWeight = 9500; // ~9.5kg at 12 months (approx)
    if (day.weightG != null) {
      drawGauge(ctx, rX, wgY, rW, 16, day.weightG, expectedWeight, accentColor, "Weight", "g", fg, fgDim);
    }

    // height gauge
    const hgY = 110;
    const expectedHeight = 76; // ~76cm at 12 months
    if (day.heightCm != null) {
      drawGauge(ctx, rX, hgY, rW, 16, day.heightCm, expectedHeight, "#8b5cf6", "Height", "cm", fg, fgDim);
    }

    // growth chart (all-time, from zero)
    const gcY = 145;
    const gcH = 260;
    drawGrowthChart(ctx, rX, gcY, rW, gcH, byDay, dayIndex, accentColor, fg, fgDim);

    // sleep section
    const slY = gcY + gcH + 12;
    const slH = 85;
    drawSleepSection(ctx, rX, slY, rW, slH, day, byDay, dayIndex, fg, fgDim);

    // teeth
    const teethY = slY + slH + 12;
    const teethH = H - teethY - 10;
    drawTeeth(ctx, rX, teethY, rW, Math.max(teethH, 40), day.teethCount || 0, accentColor, fgDim);
  }

  return { renderFrame };
}
