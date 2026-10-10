"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  RotateCcw,
  RotateCw,
  MoveUpRight,
  Hand,
  SlidersHorizontal,
} from "lucide-react";
import type { MaterialMode } from "./scene/Objects";
const LabScene = dynamic(() => import("./scene/LabScene"), {
  ssr: false,
  loading: () => <div className="lab-loading">Preparing your playground…</div>,
});
export function useNearScreen() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "160px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}
export function AmbientObject({
  variant,
  reduced,
}: {
  variant: "about" | "contact";
  reduced: boolean;
}) {
  const { ref, visible } = useNearScreen();
  return (
    <div
      ref={ref}
      className={`ambient-object ambient-${variant}`}
      aria-hidden="true"
    >
      {visible && (
        <LabScene
          mode="chrome"
          preset="blue"
          reset={0}
          reduced={reduced}
          variant={variant}
        />
      )}
    </div>
  );
}
export default function CreatorLab({ reduced }: { reduced: boolean }) {
  const [mode, setMode] = useState<MaterialMode>("chrome"),
    [preset, setPreset] = useState("blue"),
    [reset, setReset] = useState(0),
    [turn, setTurn] = useState(0);
  const { ref, visible } = useNearScreen();
  return (
    <section
      id="lab"
      className="lab-section section-pad"
      aria-labelledby="lab-title"
    >
      <div className="section-kicker">
        <span>04 / CREATOR LAB</span>
        <span className="live-label">
          <i /> INTERACTIVE EXPERIMENT
        </span>
      </div>
      <div className="lab-heading">
        <h2 id="lab-title">
          A little less looking.
          <br />
          <span>A little more playing.</span>
        </h2>
        <p>
          Change the material. Shape the light.
          <br />
          Make this small universe your own.
        </p>
      </div>
      <div className="lab-stage" ref={ref}>
        <div
          className="lab-canvas"
          role="img"
          aria-label={`Interactive ${mode} sculpture in ${preset} lighting. Use the controls below to rotate and change its appearance.`}
        >
          {visible && (
            <LabScene
              mode={mode}
              preset={preset}
              reset={reset}
              turn={turn}
              reduced={reduced}
              variant="lab"
            />
          )}
        </div>
        <div className="lab-topline">
          <span>
            <SlidersHorizontal size={13} /> EXPERIMENT 001 — ORBITAL MATTER
          </span>
          <span>REAL-TIME / 3D</span>
        </div>
        <div className="drag-hint">
          <Hand size={15} /> Use the controls to explore
        </div>
        <div className="lab-controls">
          <fieldset>
            <legend>01 — MATERIAL</legend>
            <div className="segmented">
              {(["chrome", "marble", "holographic"] as const).map((value) => (
                <button
                  key={value}
                  aria-pressed={mode === value}
                  onClick={() => setMode(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>02 — LIGHTING</legend>
            <div className="light-presets">
              {[
                { value: "blue", name: "Arctic", color: "#6997ff" },
                { value: "violet", name: "Ultraviolet", color: "#af8cf1" },
                { value: "warm", name: "Studio", color: "#edca94" },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPreset(p.value)}
                  aria-pressed={preset === p.value}
                >
                  <i style={{ background: p.color }} />
                  {p.name}
                </button>
              ))}
            </div>
          </fieldset>
          <button
            className="rotate-button"
            onClick={() => setTurn((n) => n + 1)}
            aria-label="Rotate camera 45 degrees"
          >
            <RotateCw size={17} />
          </button>
          <button
            className="reset-button"
            onClick={() => {
              setMode("chrome");
              setPreset("blue");
              setTurn(0);
              setReset((n) => n + 1);
            }}
            aria-label="Reset sculpture, lighting and camera"
          >
            <RotateCcw size={17} />
            <span>Reset</span>
          </button>
        </div>
      </div>
      <p className="lab-footnote">
        An ongoing exploration of digital matter.
        <MoveUpRight size={14} />
      </p>
    </section>
  );
}
