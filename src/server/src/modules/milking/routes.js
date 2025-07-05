import { Router } from "express";
import { Op }     from "sequelize";
import { Recommendation, Feed, FeedingType } from "./model.js";

const r = Router();

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
        feeds        : [],          // keep raw list for sleep gap calc
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
    delete obj.feeds;       // strip heavy field
  }

  /* newest first for the UI */
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
