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
const FRAME_MS = Math.round(1000 / FPS); // ~33ms

export default function VideoPage() {
  const { birthTs, childName = "", childSurname = "" } = loadConfig();
  const name = `${childName} ${childSurname}`.trim() || "Baby";

  const [status, setStatus]     = useState("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [errMsg, setErrMsg]     = useState("");
  const [speed, setSpeed]       = useState("normal");

  const canvasRef  = useRef(null);
  const dataRef    = useRef(null);
  const cancelRef  = useRef(false);

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

    cancelRef.current = false;
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

    /*
     * Frames-per-day controls how many hours we render per day.
     *   fast:     6 frames/day (every 4h) → ~20% of full render time
     *   normal:  12 frames/day (every 2h) → bottle fills smoothly
     *   detailed: 24 frames/day (every 1h) → full day/night cycle
     *
     * Each unique frame is held for exactly 1 video frame at 30 FPS.
     * With real ~33ms delays, MediaRecorder produces proper 30 FPS output.
     */
    const hoursPerFrame = speed === "fast" ? 4 : speed === "detailed" ? 1 : 2;
    const framesPerDay  = 24 / hoursPerFrame;
    const totalFrames   = data.totalDays * framesPerDay;

    const stream = canvas.captureStream(0);
    const chunks = [];

    const codecs = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];
    const mimeType = codecs.find(c => MediaRecorder.isTypeSupported(c)) || "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5_000_000 });

    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    const done = new Promise(resolve => { recorder.onstop = () => resolve(); });
    recorder.start();

    const track = stream.getVideoTracks()[0];

    for (let f = 0; f < totalFrames; f++) {
      if (cancelRef.current) break;

      const hourIndex = f * hoursPerFrame; // map frame → hour offset
      renderFrame(hourIndex);

      if (track.requestFrame) track.requestFrame();
      await new Promise(r => setTimeout(r, FRAME_MS));

      if (f % 10 === 0 || f === totalFrames - 1) {
        setProgress((f + 1) / totalFrames);
      }
    }

    recorder.stop();
    await done;

    if (!cancelRef.current) {
      const blob = new Blob(chunks, { type: mimeType });
      setVideoUrl(URL.createObjectURL(blob));
      setStatus("done");
    } else {
      setStatus("idle");
    }
  }, [name, speed]);

  const cancel = useCallback(() => {
    cancelRef.current = true;
  }, []);

  /* estimates */
  const totalDays = dataRef.current?.totalDays || 0;
  const hoursPerFrame = speed === "fast" ? 4 : speed === "detailed" ? 1 : 2;
  const framesPerDay  = 24 / hoursPerFrame;
  const totalFrames   = totalDays * framesPerDay;
  const estGenSec     = Math.round(totalFrames * FRAME_MS / 1000);
  const estVideoSec   = Math.round(totalFrames / FPS);

  return (
    <>
      <Header />
      <main className="video-wrap card" style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Video Timelapse</h2>
        <p style={{ color: "#6b7280" }}>
          Generate a cinematic video of your baby's complete growth journey —
          feeding, weight, height, sleep, teeth, and milestones.
        </p>

        {status === "error" && (
          <p style={{ color: "#c00" }}>{errMsg}</p>
        )}

        {status === "loading" && <p>Loading data...</p>}

        {(status === "idle" || status === "done") && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, marginRight: 12, fontSize: 14 }}>Speed:</label>
              {[
                { val: "fast",     label: "Fast (every 4h)" },
                { val: "normal",   label: "Normal (every 2h)" },
                { val: "detailed", label: "Detailed (every 1h)" },
              ].map(({ val, label }) => (
                <label key={val} style={{ marginRight: 16, cursor: "pointer", fontSize: 14 }}>
                  <input
                    type="radio" name="speed" value={val}
                    checked={speed === val}
                    onChange={() => setSpeed(val)}
                    style={{ marginRight: 4 }}
                  />
                  {label}
                </label>
              ))}
            </div>
            {totalDays > 0 && (
              <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 12 }}>
                {totalDays} days · {totalFrames} frames · ~{estGenSec}s to generate ·
                ~{estVideoSec}s ({Math.round(estVideoSec / 60)}min) video at 30 FPS
              </p>
            )}
            <button className="btn" onClick={generate}>
              {status === "done" ? "Regenerate Video" : "Generate Video"}
            </button>
          </>
        )}

        {status === "generating" && (
          <>
            <p>Generating at 30 FPS... {Math.round(progress * 100)}%</p>
            <div className="progress-bar">
              <div className="fill" style={{ width: `${progress * 100}%` }} />
            </div>
            <button
              className="btn"
              onClick={cancel}
              style={{ marginTop: 8, background: "#6b7280" }}
            >
              Cancel
            </button>
          </>
        )}

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
