"use client";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  Component,
  ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, useProgress } from "@react-three/drei";
import * as THREE from "three";
import { cameraStops, chapterState } from "../../lib/journey";
import {
  Sculpture,
  OrbitalRings,
  ParticleField,
  StudioLights,
  InfiniteGrid,
  LiquidMetal,
  Portal,
  Motion,
  Architecture,
} from "./Objects";
import {
  CrystalBloom,
  RibbonCurrent,
  Gyroscope,
  Monolith,
  Singularity,
  PassageDust,
} from "./Dimensions";
export class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onError?: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("CREATOR scene fallback:", error.message);
    this.props.onError?.();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export function CameraRig({ motion, low }: { motion: Motion; low: boolean }) {
  const { camera } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ pointer }, dt) => {
    const { from, to, mix } = chapterState(
      motion.reduced ? 0 : motion.progress,
    );
    const a = cameraStops[from],
      b = cameraStops[to];
    position.set(
      THREE.MathUtils.lerp(a.position[0], b.position[0], mix),
      THREE.MathUtils.lerp(a.position[1], b.position[1], mix),
      THREE.MathUtils.lerp(a.position[2], b.position[2], mix) + (low ? 3 : 0),
    );
    const parallax = motion.reduced || low ? 0 : 0.18;
    position.x += pointer.x * parallax;
    position.y += pointer.y * parallax;
    if (motion.reduced) camera.position.copy(position);
    else camera.position.lerp(position, 1 - Math.exp(-Math.min(dt, 0.05) * 7));
    look.set(
      THREE.MathUtils.lerp(a.target[0], b.target[0], mix),
      THREE.MathUtils.lerp(a.target[1], b.target[1], mix),
      THREE.MathUtils.lerp(a.target[2], b.target[2], mix),
    );
    camera.lookAt(look);
  });
  return null;
}
function Ready({ onReady }: { onReady: (supported: boolean) => void }) {
  useEffect(() => onReady(true), [onReady]);
  return null;
}
function LoadingStatus() {
  const { progress, active } = useProgress();
  return (
    <div className="scene-loading" role="status">
      {active
        ? `Loading artwork · ${Math.round(progress)}%`
        : "Preparing the universe"}
      <span />
    </div>
  );
}
export function ContextWatch({ onError }: { onError: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      onError();
    };
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onError]);
  return null;
}
export default function SceneCanvas({
  motion,
  onReady,
  active,
}: {
  motion: Motion;
  onReady: (supported: boolean) => void;
  active: boolean;
}) {
  const [low, setLow] = useState(false),
    [failed, setFailed] = useState(false),
    [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    setLow(
      window.matchMedia("(max-width: 900px)").matches ||
        navigator.hardwareConcurrency <= 4,
    );
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    setAvailable(Boolean(gl));
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }, []);
  useEffect(() => {
    if (available === false || failed) onReady(false);
  }, [available, failed, onReady]);
  const fallback = (
    <div className="webgl-note">
      Simplified view · Continue scrolling to Contact.
    </div>
  );
  if (available === false || failed) return fallback;
  if (available === null) return null;
  return (
    <SceneBoundary fallback={fallback} onError={() => onReady(false)}>
      <Suspense fallback={<LoadingStatus />}>
        <Canvas
          dpr={low ? 1 : [1, 1.5]}
          camera={{
            position: [0, 0.6, low ? 13 : 10],
            fov: 44,
            near: 0.1,
            far: 110,
          }}
          gl={{
            alpha: true,
            antialias: !low,
            powerPreference: "high-performance",
          }}
          frameloop={!active ? "never" : motion.reduced ? "demand" : "always"}
          onCreated={({ gl }) => {
            gl.setClearColor("#08090b", 0);
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.1;
          }}
          fallback={fallback}
        >
          <ContextWatch onError={() => setFailed(true)} />
          <PerformanceMonitor
            onDecline={() => setLow(true)}
            flipflops={2}
            onFallback={() => setLow(true)}
          />
          <fog attach="fog" args={["#08090b", 16, 52]} />
          <StudioLights />
          <CameraRig motion={motion} low={low} />
          <Sculpture motion={motion} />
          <OrbitalRings motion={motion} />
          <ParticleField motion={motion} count={low ? 280 : 850} />
          <InfiniteGrid />
          <PassageDust low={low} />
          <Architecture motion={motion} low={low} />
          <LiquidMetal motion={motion} low={low} />
          <Portal motion={motion} />
          <CrystalBloom motion={motion} low={low} />
          <RibbonCurrent motion={motion} low={low} />
          <Gyroscope motion={motion} />
          <Monolith motion={motion} low={low} />
          <Singularity motion={motion} low={low} />
          <Portal motion={motion} position={[0, 0, -160]} />
          <Portal motion={motion} position={[0, 0, -172]} />
          <Ready onReady={onReady} />
        </Canvas>
      </Suspense>
    </SceneBoundary>
  );
}
