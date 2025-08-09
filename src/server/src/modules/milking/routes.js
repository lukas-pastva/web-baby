import { Router } from "express";
import { Op }     from "sequelize";
import { Recommendation, Feed, FeedingType } from "./model.js";
import { AppConfig } from "../config/model.js";
import { Weight } from "../weight/model.js";
import { Height } from "../height/model.js";

const r = Router();

/* ------------------------------------------------------------------ */
/*  WHO medians (0–12 months)                                         */
/* ------------------------------------------------------------------ */
const WHO_W_KG = {
  girl: [3.2, 4.2, 5.1, 5.8, 6.4, 6.9, 7.3, 7.6, 7.9, 8.2, 8.5, 8.7, 8.9],
  boy : [3.3, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6],
};
const WHO_H_CM = {
  girl: [49.1, 53.7, 57.1, 59.8, 62.1, 64.0, 65.7, 67.3, 68.7, 70.1, 71.5, 72.8, 74.0],
  boy : [49.9, 54.7, 58.4, 61.4, 63.9, 65.9, 67.6, 69.2, 70.6, 72.0, 73.3, 74.5, 75.7],
};

function lerp(a,b,t){ return a + (b-a)*t; }
function clamp(x,lo,hi){ return Math.max(lo, Math.min(hi, x)); }
function months(ageDays){ return ageDays / 30.4375; }

function whoWeightKg(sex, ageDays){
  const arr = WHO_W_KG[sex] || WHO_W_KG.girl;
  const m   = months(ageDays);
  const i   = Math.floor(m);
  const j   = Math.min(i+1, 12);
  const t   = m - i;
  return lerp(arr[i], arr[j], t);
}
function whoHeightCm(sex, ageDays){
  const arr = WHO_H_CM[sex] || WHO_H_CM.girl;
  const m   = months(ageDays);
  const i   = Math.floor(m);
  const j   = Math.min(i+1, 12);
  const t   = m - i;
  return lerp(arr[i], arr[j], t);
}

/* Expected weight from birth-weight with newborn dip + rebound (client parity) */
function expectedWeightFromBirth(birthGrams, sex, ageDays){
  if (!birthGrams) birthGrams = 3500;
  if (ageDays <= 3){
    return Math.round(birthGrams * (1 - 0.07 * (ageDays / 3)));
  }
  const who = whoWeightKg(sex, ageDays) * 1000;
  if (ageDays <= 15){
    const t = (ageDays - 3) / 12;
    const blended = birthGrams * (0.93 * (1 - t) + (who / birthGrams) * t);
    return Math.round(blended);
  }
  return Math.round(who);
}

function daysBetween(a,b){
  const ms = new Date(a).setHours(0,0,0,0) - new Date(b).setHours(0,0,0,0);
  return Math.round(ms / 86400000);
}

/* ------------------------------------------------------------------ */
/*  Daily recommendations                                             */
/* ------------------------------------------------------------------ */
r.get("/api/milking/recommendations", async (_req, res) => {
  res.json(await Recommendation.findAll({ order: [["ageDays", "ASC"]] }));
});

/* ------------------------------------------------------------------ */
/*  Latest feed (any date)                                            */
/* ------------------------------------------------------------------ */
r.get("/api/milking/feeds/last", async (_req, res) => {
  const last = await Feed.findOne({ order: [["fedAt", "DESC"]] });
  if (!last) return res.status(204).end();
  res.json(last);
});

/* ------------------------------------------------------------------ */
/*  NEW – personalized recommendation for TODAY                       */
/* ------------------------------------------------------------------ */
r.get("/api/milking/recommendation/today", async (_req, res) => {
  const cfg = await AppConfig.findByPk(1);
  const birthTs = cfg?.birthTs;
  const sex     = cfg?.theme === "boy" ? "boy" : "girl";
  const birthWeightGrams = Number.isFinite(cfg?.birthWeightGrams) ? cfg.birthWeightGrams : 3500;

  const today = new Date();
  let ageDays = 60; // fallback
  if (birthTs) ageDays = daysBetween(today, birthTs);

  // latest weight & height rows (if any)
  const lastW = await Weight.findOne({ order:[["measuredAt","DESC"]] });
  const lastH = await Height.findOne({ order:[["measuredAt","DESC"]] });

  // estimated 'today' measurements
  const expWg = expectedWeightFromBirth(birthWeightGrams, sex, ageDays);
  const expHc = whoHeightCm(sex, ageDays);

  let estWg = expWg;
  let wDaysAgo = null;
  if (lastW) {
    const lastAge = birthTs ? daysBetween(lastW.measuredAt, birthTs) : ageDays;
    const ratio   = whoWeightKg(sex, ageDays) / whoWeightKg(sex, lastAge);
    estWg         = Math.round(lastW.weightGrams * ratio);
    wDaysAgo      = daysBetween(today, lastW.measuredAt);
  }

  let estHc = expHc;
  let hDaysAgo = null;
  if (lastH) {
    const lastAge = birthTs ? daysBetween(lastH.measuredAt, birthTs) : ageDays;
    const ratio   = whoHeightCm(sex, ageDays) / whoHeightCm(sex, lastAge);
    estHc         = +(lastH.heightCm * ratio).toFixed(1);
    hDaysAgo      = daysBetween(today, lastH.measuredAt);
  }

  // ml-per-kg factor by age (piecewise linear 0–12m)
  function mlPerKg(aDays){
    if (aDays <= 30) return 150;
    if (aDays <= 90) {
      const t = (aDays - 30) / 60;                // 0→1
      return Math.round(150 + t * (140 - 150));   // 150 → 140
    }
    if (aDays <= 180){
      const t = (aDays - 90) / 90;
      return Math.round(140 + t * (115 - 140));   // 140 → 115
    }
    const t = Math.min(1, (aDays - 180) / 185);
    return Math.round(115 + t * (95 - 115));      // 115 → 95
  }

  const wKg = estWg / 1000;
  const base = Math.round(wKg * mlPerKg(ageDays));

  const expectedWKg = expWg / 1000;
  const expectedHCm = expHc;

  const weightAdj = clamp(wKg / Math.max(0.001, expectedWKg), 0.85, 1.20);
  const heightAdj = expectedHCm > 0
    ? clamp(1 + 0.5 * (estHc / expectedHCm - 1), 0.90, 1.10)
    : 1.0;

  const totalMl = Math.round(base * weightAdj * heightAdj);

  // meals per day by age
  let mealsPerDay = 6;
  if (ageDays <= 30) mealsPerDay = 8;
  else if (ageDays <= 60) mealsPerDay = 7;
  else if (ageDays <= 120) mealsPerDay = 6;
  else if (ageDays <= 180) mealsPerDay = 5;
  else mealsPerDay = 4;

  const perMealMl = Math.round(totalMl / mealsPerDay);

  res.json({
    model: "personalized",
    ageDays,
    totalMl,
    mealsPerDay,
    perMealMl,
    inputs: {
      estWeightGrams: estWg, estWeightDaysAgo: wDaysAgo,
      estHeightCm: estHc,   estHeightDaysAgo: hDaysAgo,
      expectedWeightGrams: expWg,
      expectedHeightCm: expHc,
      mlPerKg: mlPerKg(ageDays),
    },
  });
});

/* ------------------------------------------------------------------ */
/*  NEW – compact per-day summary (for charts)                        */
/* ------------------------------------------------------------------ */
r.get("/api/milking/days/summary", async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from) where.fedAt = { ...where.fedAt, [Op.gte]: new Date(from) };
  if (to)   where.fedAt = { ...where.fedAt, [Op.lte]: new Date(to) };

  const rows = await Feed.findAll({ where, order:[["fedAt","ASC"]] });

  /* group feeds by YYYY-MM-DD */
  const byDay = new Map();
  for (const f of rows) {
    const day = f.fedAt.toISOString().slice(0, 10);
    if (!byDay.has(day)) {
      byDay.set(day, {
        day,
        totalsByType : Object.fromEntries(Object.values(FeedingType).map(t => [t, 0])),
        feedCount    : 0,
        feeds        : [],
      });
    }
    const d = byDay.get(day);
    d.totalsByType[f.feedingType] += f.amountMl;
    d.feedCount                   += 1;
    d.feeds.push(f);
  }

  /* compute longest 20:00-08:00 gap (sleep hours) */
  const orderedDays = Array.from(byDay.keys()).sort();   // oldest → newest
  for (let i = 0; i < orderedDays.length; i++) {
    const dayStr = orderedDays[i];
    const obj    = byDay.get(dayStr);

    const date        = new Date(dayStr);
    const nightStart  = new Date(date); nightStart.setHours(20,0,0,0);
    const nightEnd    = new Date(nightStart); nightEnd.setDate(nightEnd.getDate()+1);
    nightEnd.setHours(8,0,0,0);

    /* feeds inside the window – may span next day */
    const nextObj   = byDay.get(orderedDays[i+1]);
    const nightFeeds = [
      ...obj.feeds,
      ...(nextObj?.feeds ?? []),
    ].filter(f => {
      const t = new Date(f.fedAt);
      return t >= nightStart && t <= nightEnd;
    }).sort((a,b)=>new Date(a.fedAt)-new Date(b.fedAt));

    /* compute max gap */
    let maxGapMs = nightFeeds.length === 0
      ? nightEnd - nightStart
      : Math.max(
          nightFeeds[0].fedAt   - nightStart,
          nightEnd - nightFeeds[nightFeeds.length-1].fedAt,
          ...nightFeeds.slice(1).map((f,j)=>f.fedAt - nightFeeds[j].fedAt),
        );

    obj.sleepHours = +((maxGapMs / 3_600_000).toFixed(1));   // hours, 1-dp
    delete obj.feeds;
  }

  res.json(
    Array.from(byDay.values()).sort((a, b) => new Date(b.day) - new Date(a.day))
  );
});

/* ------------------------------------------------------------------ */
/*  Feeds – list (by date range)                                      */
/* ------------------------------------------------------------------ */
r.get("/api/milking/feeds", async (req, res) => {
  const { from, to } = req.query;
  const where = {};
  if (from) where.fedAt = { ...where.fedAt, [Op.gte]: new Date(from) };
  if (to)   where.fedAt = { ...where.fedAt, [Op.lte]: new Date(to) };
  res.json(await Feed.findAll({ where, order: [["fedAt", "ASC"]] }));
});

/* ------------------------------------------------------------------ */
/*  Feeds – create                                                    */
/* ------------------------------------------------------------------ */
r.post("/api/milking/feeds", async (req, res) => {
  const { fedAt, amountMl, feedingType } = req.body;

  if (!fedAt || !amountMl || !feedingType) {
    return res.status(400).json({ error: "fedAt, amountMl & feedingType required" });
  }
  if (!Object.values(FeedingType).includes(feedingType)) {
    return res.status(400).json({ error: "invalid feedingType" });
  }

  res.json(await Feed.create({ fedAt, amountMl, feedingType }));
});

/* ------------------------------------------------------------------ */
/*  Feeds – update                                                    */
/* ------------------------------------------------------------------ */
r.put("/api/milking/feeds/:id", async (req, res) => {
  const feed = await Feed.findByPk(req.params.id);
  if (!feed) return res.status(404).json({ error: "not found" });

  const { fedAt, amountMl, feedingType } = req.body;
  if (feedingType && !Object.values(FeedingType).includes(feedingType)) {
    return res.status(400).json({ error: "invalid feedingType" });
  }

  await feed.update({ fedAt, amountMl, feedingType });
  res.json(feed);
});

/* ------------------------------------------------------------------ */
/*  Feeds – delete                                                    */
/* ------------------------------------------------------------------ */
r.delete("/api/milking/feeds/:id", async (req, res) => {
  const feed = await Feed.findByPk(req.params.id);
  if (!feed) return res.status(404).json({ error: "not found" });

  await feed.destroy();
  res.status(204).end();
});

export default r;
