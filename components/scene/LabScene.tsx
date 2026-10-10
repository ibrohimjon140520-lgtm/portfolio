"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SceneBoundary, ContextWatch } from "./SceneCanvas";
import {
  Sculpture,
  StudioLights,
  ParticleField,
  Portal,
  MaterialMode,
  Motion,
} from "./Objects";
function Controls({ reset, turn }: { reset: number; turn: number }) {
  const { camera, invalidate } = useThree();
  useEffect(() => {
    const angle = (turn * Math.PI) / 4;
    camera.position.set(Math.sin(angle) * 8.5, 0.3, Math.cos(angle) * 8.5);
    camera.lookAt(0, 0, 0);
    invalidate();
  }, [camera, invalidate, reset, turn]);
  return null;
}

function FinaleRig({ reduced }: { reduced: boolean }) {
  const { camera, gl } = useThree();
  const target = useRef(8.5);
  useEffect(() => {
    const update = () => {
      const rect = gl.domElement.getBoundingClientRect();
      target.current =
        8.5 +
        Math.max(
          0,
          Math.min(
            1,
            (window.innerHeight - rect.top) /
              (window.innerHeight + rect.height),
          ),
        ) *
          2.2;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [gl]);
  useFrame((_, dt) => {
    if (!reduced)
      camera.position.z +=
        (target.current - camera.position.z) *
        (1 - Math.exp(-Math.min(dt, 0.05) * 2));
  });
  return null;
}
export default function LabScene({
  mode,
  preset,
  reset,
  reduced,
  variant,
  turn = 0,
}: {
  mode: MaterialMode;
  preset: string;
  reset: number;
  reduced: boolean;
  variant: "lab" | "about" | "contact";
  turn?: number;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const motion = useMemo<Motion>(
    () => ({ progress: 0, paused: false, reduced }),
    [reduced],
  );
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    setSupported(Boolean(gl));
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }, []);
  const fallback = (
    <div className="lab-fallback">
      <img src="/artifact.svg" alt="Chrome orbital sculpture" />
      <p>Interactive 3D requires WebGL 2. Explore the project artwork below.</p>
    </div>
  );
  if (supported === false) return fallback;
  if (supported === null) return null;
  return (
    <SceneBoundary fallback={fallback}>
      <Suspense
        fallback={<div className="lab-loading">Preparing sculpture…</div>}
      >
        <Canvas
          frameloop={reduced ? "demand" : "always"}
          camera={{ position: [0, 0.3, 8.5], fov: 40 }}
          dpr={[1, 1.4]}
          gl={{ alpha: true, antialias: true }}
          fallback={fallback}
        >
          <ContextWatch onError={() => setSupported(false)} />
          <StudioLights preset={preset} />
          {variant === "contact" && <FinaleRig reduced={reduced} />}
          {variant === "contact" ? (
            <Portal motion={motion} position={[0, 0, 0]} />
          ) : (
            <>
              <Sculpture motion={motion} mode={mode} compact />
              <ParticleField motion={motion} count={180} />
            </>
          )}
          {variant === "lab" && <Controls reset={reset} turn={turn} />}
        </Canvas>
      </Suspense>
    </SceneBoundary>
  );
}
