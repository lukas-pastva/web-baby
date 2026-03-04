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

export default function VideoPage() {
  const { birthTs, childName = "", childSurname = "" } = loadConfig();
  const name = `${childName} ${childSurname}`.trim() || "Baby";

  const [status, setStatus]     = useState("idle");      // idle | loading | generating | done | error
  const [progress, setProgress] = useState(0);            // 0-1
  const [videoUrl, setVideoUrl] = useState(null);
  const [errMsg, setErrMsg]     = useState("");

  const canvasRef = useRef(null);
  const dataRef   = useRef(null);    // prepared data cache

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

    const totalFrames = data.totalDays * 24;          // 1 frame per hour
    const stream  = canvas.captureStream(0);           // manual frame push
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

    /* render frames in batches to keep UI responsive */
    const BATCH = 120;
    for (let f = 0; f < totalFrames; f += BATCH) {
      const end = Math.min(f + BATCH, totalFrames);
      for (let i = f; i < end; i++) {
        renderFrame(i);
        // request a frame from the capture stream
        if (stream.getVideoTracks()[0].requestFrame) {
          stream.getVideoTracks()[0].requestFrame();
        }
      }
      setProgress(end / totalFrames);
      await new Promise(r => setTimeout(r, 0));        // yield to browser
    }

    recorder.stop();
    await done;

    const blob = new Blob(chunks, { type: mimeType });
    setVideoUrl(URL.createObjectURL(blob));
    setStatus("done");
  }, [name]);

  /* ── render ───────────────────────────────────────────── */
  return (
    <>
      <Header />
      <main className="video-wrap card" style={{ padding: 20 }}>
        <h2 style={{ marginTop: 0 }}>Video Timelapse</h2>
        <p style={{ color: "#6b7280" }}>
          Generate a video that shows your baby's growth — one frame per hour of life.
        </p>

        {status === "error" && (
          <p style={{ color: "#c00" }}>{errMsg}</p>
        )}

        {status === "loading" && <p>Loading data...</p>}

        {(status === "idle" || status === "done") && (
          <button className="btn" onClick={generate}>
            {status === "done" ? "Regenerate Video" : "Generate Video"}
          </button>
        )}

        {status === "generating" && (
          <>
            <p>Generating... {Math.round(progress * 100)}%</p>
            <div className="progress-bar">
              <div className="fill" style={{ width: `${progress * 100}%` }} />
            </div>
          </>
        )}

        {/* hidden canvas used for rendering */}
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
