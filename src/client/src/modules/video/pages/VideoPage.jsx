import React, { useEffect, useState, useRef, useCallback } from "react";

import Header          from "../../../components/Header.jsx";
import { loadConfig }  from "../../../config.js";
import { accentColor } from "../../../theme.js";
import milkingApi      from "../../milking/api.js";
import weightApi       from "../../weight/api.js";
import heightApi       from "../../height/api.js";
import teethApi        from "../../teething/api.js";

import { prepareData } from "../dataPrep.js";
import { createRenderer } from "../VideoRenderer.js";

const FPS = 30;
const FRAME_MS = Math.round(1000 / FPS);   // ~33ms per frame

export default function VideoPage() {
  const { birthTs, childName = "", childSurname = "" } = loadConfig();
  const name = `${childName} ${childSurname}`.trim() || "Baby";

  const [status, setStatus]     = useState("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [errMsg, setErrMsg]     = useState("");
  const [speed, setSpeed]       = useState("normal"); // fast | normal | detailed

  const canvasRef = useRef(null);
  const dataRef   = useRef(null);

  /* ── fetch all data on mount ──────────────────────────── */
  useEffect(() => {
    if (!birthTs) {
      setErrMsg("Birth date not configured. Go to Config first.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    Promise.all([
      milkingApi.listDaySummaries(),
      weightApi.listWeights(),
      heightApi.listHeights(),
      teethApi.listTeeth(),
    ])
      .then(([summaries, weights, heights, teeth]) => {
        dataRef.current = prepareData({ birthTs, summaries, weights, heights, teeth });
        setStatus("idle");
      })
      .catch(e => {
        setErrMsg(e.message);
        setStatus("error");
      });
  }, [birthTs]);

  /* ── generate video ───────────────────────────────────── */
  const generate = useCallback(async () => {
    const data = dataRef.current;
    if (!data) return;

    setStatus("generating");
    setProgress(0);
    setVideoUrl(null);

    const canvas = canvasRef.current;
    const accent = accentColor();
    const { renderFrame } = createRenderer(canvas, {
      accentColor: accent,
      childName  : name,
      byDay      : data.byDay,
    });

    // hold frames per day: determines video speed
    const holdMap = { fast: 4, normal: 10, detailed: 18 };
    const holdFrames = holdMap[speed] || 10;
    const totalDays = data.totalDays;

    const stream  = canvas.captureStream(0);
    const chunks  = [];

    /* pick supported codec */
    const codecs = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];
    const mimeType = codecs.find(c => MediaRecorder.isTypeSupported(c)) || "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });

    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };

    const done = new Promise(resolve => {
      recorder.onstop = () => resolve();
    });

    recorder.start();

    const track = stream.getVideoTracks()[0];

    /* render one frame per day, hold for multiple frames with real delays */
    for (let d = 0; d < totalDays; d++) {
      renderFrame(d);

      for (let h = 0; h < holdFrames; h++) {
        if (track.requestFrame) track.requestFrame();
        // real delay so MediaRecorder assigns proper timestamps
        await new Promise(r => setTimeout(r, FRAME_MS));
      }

      // update progress every 5 days to avoid excessive re-renders
      if (d % 5 === 0 || d === totalDays - 1) {
        setProgress((d + 1) / totalDays);
      }
    }

    recorder.stop();
    await done;

    const blob = new Blob(chunks, { type: mimeType });
    setVideoUrl(URL.createObjectURL(blob));
    setStatus("done");
  }, [name, speed]);

  /* estimated generation time */
  const estTime = dataRef.current
    ? Math.round(dataRef.current.totalDays * (speed === "fast" ? 4 : speed === "detailed" ? 18 : 10) * FRAME_MS / 1000)
    : null;

  /* estimated video duration */
  const estVideo = dataRef.current
    ? Math.round(dataRef.current.totalDays * (speed === "fast" ? 4 : speed === "detailed" ? 18 : 10) / FPS)
    : null;

  /* ── render ───────────────────────────────────────────── */
  return (
    <>
      <Header />
      <main className="video-wrap card" style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Video Timelapse</h2>
        <p style={{ color: "#6b7280" }}>
          Generate a video showing your baby's complete growth journey — feeding, weight, height,
          sleep patterns, and milestones.
        </p>

        {status === "error" && (
          <p style={{ color: "#c00" }}>{errMsg}</p>
        )}

        {status === "loading" && <p>Loading data...</p>}

        {(status === "idle" || status === "done") && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, marginRight: 12, fontSize: 14 }}>Speed:</label>
              {["fast", "normal", "detailed"].map(s => (
                <label key={s} style={{ marginRight: 16, cursor: "pointer", fontSize: 14 }}>
                  <input
                    type="radio"
                    name="speed"
                    value={s}
                    checked={speed === s}
                    onChange={() => setSpeed(s)}
                    style={{ marginRight: 4 }}
                  />
                  {s === "fast" ? "Fast (~0.13s/day)" : s === "normal" ? "Normal (~0.33s/day)" : "Detailed (~0.6s/day)"}
                </label>
              ))}
              {estTime != null && (
                <span style={{ color: "#6b7280", fontSize: 13 }}>
                  {" "}— est. ~{estTime}s to generate, ~{estVideo}s video
                  ({dataRef.current?.totalDays} days)
                </span>
              )}
            </div>
            <button className="btn" onClick={generate}>
              {status === "done" ? "Regenerate Video" : "Generate Video"}
            </button>
          </>
        )}

        {status === "generating" && (
          <>
            <p>Generating... {Math.round(progress * 100)}%</p>
            <div className="progress-bar">
              <div className="fill" style={{ width: `${progress * 100}%` }} />
            </div>
          </>
        )}

        {/* canvas used for rendering (shown during generation) */}
        <canvas
          ref={canvasRef}
          style={{
            display: status === "generating" ? "block" : "none",
            width: "100%",
            maxWidth: 640,
            marginTop: 16,
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
        />

        {status === "done" && videoUrl && (
          <div style={{ marginTop: 20 }}>
            <h3>Preview</h3>
            <video
              src={videoUrl}
              controls
              style={{ width: "100%", maxWidth: 640, borderRadius: 8 }}
            />
            <br />
            <a
              href={videoUrl}
              download={`${name.replace(/\s+/g, "_")}_timelapse.webm`}
              className="btn"
              style={{ display: "inline-block", marginTop: 12, textDecoration: "none" }}
            >
              Download .webm
            </a>
          </div>
        )}
      </main>
    </>
  );
}
