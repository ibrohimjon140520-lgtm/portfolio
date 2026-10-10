"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer, Grid } from "@react-three/drei";
import * as THREE from "three";
import { clamp, smooth, sceneCount } from "../../lib/journey";
export type Motion = { progress: number; paused: boolean; reduced: boolean };
export type MaterialMode = "chrome" | "marble" | "holographic";
export function StudioLights({ preset = "blue" }: { preset?: string }) {
  const color =
    preset === "violet" ? "#a895ff" : preset === "warm" ? "#ffe1ac" : "#698cff";
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 6, 4]} intensity={3} color="#e4edff" />
      <pointLight
        position={[-4, -1, 3]}
        intensity={18}
        color={color}
        distance={22}
      />
      <Environment resolution={128} frames={1}>
        <Lightformer
          intensity={5}
          position={[0, 5, 3]}
          scale={[8, 3, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          intensity={4}
          position={[-5, 1, 2]}
          scale={[2, 8, 1]}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Lightformer
          intensity={6}
          color={color}
          position={[5, 0, -2]}
          scale={[3, 8, 1]}
          rotation={[0, -Math.PI / 2, 0]}
        />
        <Lightformer
          intensity={2}
          position={[0, -4, 3]}
          scale={[8, 1, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </Environment>
    </>
  );
}
export function Sculpture({
  motion,
  mode = "chrome",
  compact = false,
}: {
  motion: Motion;
  mode?: MaterialMode;
  compact?: boolean;
}) {
  const ring = useRef<THREE.InstancedMesh>(null),
    shards = useRef<THREE.InstancedMesh>(null),
    root = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const clock = useRef(0);
  const count = 24;
  useFrame((state, dt) => {
    if (!ring.current || !shards.current || !root.current) return;
    if (!motion.paused && !motion.reduced) clock.current += Math.min(dt, 0.05);
    const t = clock.current;
    const p = motion.progress * (sceneCount - 1);
    const fracture = compact
      ? 0
      : smooth((p - 0.45) * 1.6) * (1 - smooth((p - 2.2) * 2));
    const reform = compact ? 0 : smooth((p - 2.1) * 1.6);
    root.current.rotation.set(
      0.2 + Math.sin(t * 0.13) * 0.08,
      t * 0.06 - 0.6 + (compact ? 0 : p * 0.9),
      0.36 + (compact ? 0 : p * 0.18),
    );
    root.current.position.y =
      Math.sin(t * 0.4) * 0.08 - (compact ? 0 : smooth(p / 3) * 0.8);
    root.current.scale.setScalar(compact ? 1 : 1.35 + fracture * 0.3);
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      dummy.position.set(
        Math.cos(a) * fracture * (1.3 + (i % 3) * 0.23),
        Math.sin(a) * fracture * 1.5,
        Math.sin(a * 3) * fracture * 0.9,
      );
      dummy.rotation.set(
        fracture * Math.sin(a) * 0.6,
        reform * Math.sin(a) * 0.5,
        a + fracture * 0.25,
      );
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      ring.current.setMatrixAt(i, dummy.matrix);
    }
    ring.current.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < 18; i++) {
      const a = i * 2.39996 + t * (i % 2 ? -0.09 : 0.07),
        r = 2.6 + (i % 4) * 0.35;
      const pointer = motion.reduced ? 0 : state.pointer.x;
      dummy.position.set(
        Math.cos(a) * r + pointer * 0.12,
        Math.sin(a) * r * 0.65 + state.pointer.y * 0.06,
        Math.sin(i * 1.3 + t * 0.15) * 1.8,
      );
      dummy.rotation.set(a, i * 0.5 + t * 0.1, a * 0.7);
      dummy.scale.setScalar(0.035 + (i % 3) * 0.025);
      dummy.updateMatrix();
      shards.current.setMatrixAt(i, dummy.matrix);
    }
    shards.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group ref={root}>
      <group scale={[1, 1.22, 1]}>
        <instancedMesh
          frustumCulled={false}
          ref={ring}
          args={[undefined, undefined, count]}
        >
          <torusGeometry
            args={[1.5, 0.43, 12, 10, ((Math.PI * 2) / count) * 0.965]}
          />
          <meshPhysicalMaterial
            key={mode}
            customProgramCacheKey={() =>
              mode === "marble" ? "creator-marble-v1" : "creator-metal-v1"
            }
            onBeforeCompile={(shader) => {
              if (mode !== "marble") return;
              shader.vertexShader =
                "varying vec3 vMarble;\n" + shader.vertexShader;
              shader.vertexShader = shader.vertexShader.replace(
                "#include <begin_vertex>",
                "#include <begin_vertex>\nvMarble = position;\n#ifdef USE_INSTANCING\nvMarble = (instanceMatrix * vec4(position, 1.)).xyz;\n#endif",
              );
              shader.fragmentShader =
                "varying vec3 vMarble;\n" + shader.fragmentShader;
              shader.fragmentShader = shader.fragmentShader.replace(
                "#include <color_fragment>",
                "#include <color_fragment>\nfloat vein = sin(vMarble.y*17. + vMarble.x*6. + sin(vMarble.z*8. + vMarble.y*4.)*2.);\nfloat fineVein = pow(abs(vein), 16.);\ndiffuseColor.rgb *= mix(vec3(1.), vec3(.36,.39,.45), fineVein*.55);",
              );
            }}
            color={
              mode === "marble"
                ? "#e0ded8"
                : mode === "holographic"
                  ? "#92aaff"
                  : "#a6afc2"
            }
            metalness={mode === "marble" ? 0.25 : 1}
            roughness={mode === "marble" ? 0.38 : 0.18}
            clearcoat={1}
            iridescence={mode === "holographic" ? 1 : 0.22}
            iridescenceIOR={1.5}
          />
        </instancedMesh>
        <mesh rotation={[0.08, 0.1, 0]}>
          <torusGeometry args={[1.49, 0.013, 6, 100]} />
          <meshBasicMaterial color="#5184ff" toneMapped={false} />
        </mesh>
      </group>
      <instancedMesh
        frustumCulled={false}
        ref={shards}
        args={[undefined, undefined, 18]}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#b9c4dc" metalness={1} roughness={0.25} />
      </instancedMesh>
    </group>
  );
}
export function OrbitalRings({ motion }: { motion: Motion }) {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    if (!group.current) return;
    if (!motion.paused && !motion.reduced) t.current += Math.min(dt, 0.05);
    group.current.children.forEach((child, i) => {
      child.rotation.set(
        1.05 + i * 0.38,
        Math.sin(t.current * 0.06 + i) * 0.4,
        t.current * (i % 2 ? 0.055 : -0.045) +
          i +
          motion.progress * Math.PI * 3,
      );
    });
  });
  return (
    <group ref={group}>
      {[2.6, 3.1, 3.65].map((r, i) => (
        <group key={r}>
          <mesh>
            <torusGeometry args={[r, 0.007, 5, 100]} />
            <meshBasicMaterial
              color={i === 1 ? "#6089dc" : "#697181"}
              transparent
              opacity={0.55}
            />
          </mesh>
          <mesh position={[r, 0, 0]}>
            <sphereGeometry args={[i === 1 ? 0.1 : 0.06, 12, 12]} />
            <meshStandardMaterial
              color={i === 1 ? "#c1ed8a" : "#a2b6db"}
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
export function ParticleField({
  motion,
  count = 600,
  position = [0, 0, 0],
}: {
  motion: Motion;
  count?: number;
  position?: [number, number, number];
}) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const [cloud, sphere, portal] = useMemo(() => {
    const c = new Float32Array(count * 3),
      s = new Float32Array(count * 3),
      p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = i * 2.399963,
        y = 1 - (2 * (i + 0.5)) / count,
        r = Math.sqrt(1 - y * y),
        noise = ((i * 16807) % 2147) / 2147;
      c.set([Math.cos(a) * (3 + noise * 7), y * 6, Math.sin(a) * 7], i * 3);
      s.set([r * Math.cos(a) * 2.6, y * 2.6, r * Math.sin(a) * 2.6], i * 3);
      p.set(
        [
          Math.cos(a) * (2.8 + noise * 0.6),
          Math.sin(a) * (2.8 + noise * 0.6),
          (noise - 0.5) * 1.1,
        ],
        i * 3,
      );
    }
    return [c, s, p];
  }, [count]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uPortal: { value: 0 },
      uColor: { value: new THREE.Color("#91aaff") },
    }),
    [],
  );
  useFrame((_, dt) => {
    if (!material.current) return;
    const u = material.current.uniforms;
    if (!motion.paused && !motion.reduced) u.uTime.value += Math.min(dt, 0.05);
    u.uMorph.value = smooth(motion.progress * (sceneCount - 1) - 1.4);
    u.uPortal.value = smooth(motion.progress * (sceneCount - 1) - 4.2);
  });
  return (
    <points position={position} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[cloud, 3]} />
        <bufferAttribute attach="attributes-aSphere" args={[sphere, 3]} />
        <bufferAttribute attach="attributes-aPortal" args={[portal, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`attribute vec3 aSphere;attribute vec3 aPortal;uniform float uTime;uniform float uMorph;uniform float uPortal;varying float vAlpha;void main(){vec3 p=mix(position,aSphere,uMorph);p=mix(p,aPortal,uPortal);p.y+=sin(uTime*.3+p.x)*.08;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(22./max(1.,-mv.z),1.,3.);vAlpha=.3+.5*sin(position.x*4.)*sin(position.x*4.);}`}
        fragmentShader={`uniform vec3 uColor;varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(uColor,(1.-smoothstep(.1,.5,d))*vAlpha);}`}
      />
    </points>
  );
}
export function InfiniteGrid() {
  return (
    <Grid
      position={[0, -3.2, -25]}
      args={[160, 160]}
      cellSize={1.5}
      cellThickness={0.45}
      cellColor="#252a38"
      sectionSize={7.5}
      sectionThickness={0.6}
      sectionColor="#39465f"
      fadeDistance={38}
      fadeStrength={1.6}
      infiniteGrid
      side={THREE.DoubleSide}
    />
  );
}
export function LiquidMetal({
  motion,
  low = false,
}: {
  motion: Motion;
  low?: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const flow = useMemo(() => ({ value: 0 }), []);
  useFrame((_, dt) => {
    if (!motion.paused && !motion.reduced) {
      const delta = Math.min(dt, 0.05);
      flow.value += delta * 0.25;
    }
    if (root.current) {
      root.current.rotation.set(
        motion.progress * 1.4,
        motion.progress * 7,
        -0.3,
      );
      root.current.scale.setScalar(
        1.3 + Math.sin(motion.progress * Math.PI) * 0.3,
      );
    }
  });
  return (
    <group position={[2, -2, -32]} ref={root}>
      <mesh>
        <sphereGeometry args={[1.8, low ? 32 : 64, low ? 24 : 48]} />
        <meshPhysicalMaterial
          color="#b7b0cf"
          metalness={1}
          roughness={0.12}
          iridescence={0.8}
          onBeforeCompile={(shader) => {
            shader.uniforms.uFlowTime = flow;
            shader.vertexShader =
              "uniform float uFlowTime;\n" + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <beginnormal_vertex>",
              "#include <beginnormal_vertex>\nvec3 q = position * vec3(2.4,2.1,2.) + uFlowTime * vec3(.65,-.4,.5);\nvec3 gradient = vec3(2.4*cos(q.x)*sin(q.y)*sin(q.z),2.1*sin(q.x)*cos(q.y)*sin(q.z),2.*sin(q.x)*sin(q.y)*cos(q.z));\nobjectNormal = normalize(objectNormal - .26*(gradient-dot(gradient,objectNormal)*objectNormal));",
            );
            shader.vertexShader = shader.vertexShader.replace(
              "#include <begin_vertex>",
              "#include <begin_vertex>\nfloat wave = sin(position.x*2.4+uFlowTime*.65)*sin(position.y*2.1-uFlowTime*.4)*sin(position.z*2.+uFlowTime*.5);\ntransformed += normal * wave * .26;",
            );
          }}
        />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[i * 0.7 + 0.6, i * 0.5, 0.3]}>
          <torusKnotGeometry
            args={[2.1 + i * 0.19, 0.026, low ? 72 : 160, 6, 2, 3]}
          />
          <meshPhysicalMaterial
            color="#c1b0e6"
            metalness={1}
            roughness={0.15}
            iridescence={1}
          />
        </mesh>
      ))}
      <pointLight
        position={[2, 2, 2]}
        intensity={24}
        color="#a38aff"
        distance={14}
      />
    </group>
  );
}
export function Portal({
  motion,
  position = [0, 0, -48],
}: {
  motion: Motion;
  position?: [number, number, number];
}) {
  const root = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    if (!root.current) return;
    if (!motion.paused && !motion.reduced) t.current += Math.min(dt, 0.05);
    root.current.children.slice(0, 5).forEach((o, i) => {
      o.rotation.z =
        t.current * (i % 2 ? 0.08 : -0.12) +
        motion.progress * (i % 2 ? 2 : -2) +
        i * 0.13;
      o.rotation.y = Math.sin(motion.progress * 5 + i) * 0.22;
    });
  });
  return (
    <group position={position} ref={root}>
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} position={[0, 0, -i * 0.7]}>
          <mesh>
            <torusGeometry
              args={[3.1 - i * 0.15, i === 0 ? 0.12 : 0.035, 8, 96]}
            />
            <meshStandardMaterial
              color="#8198d1"
              emissive="#2f61ee"
              emissiveIntensity={i === 0 ? 0.2 : 1.7}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {i === 0 &&
            [0, 1, 2, 3].map((n) => (
              <mesh
                key={n}
                position={[
                  Math.cos((n * Math.PI) / 2) * 3.1,
                  Math.sin((n * Math.PI) / 2) * 3.1,
                  0,
                ]}
                rotation={[0, 0, (n * Math.PI) / 2]}
              >
                <boxGeometry args={[0.25, 0.55, 0.2]} />
                <meshStandardMaterial
                  color="#c2cde4"
                  metalness={1}
                  roughness={0.2}
                />
              </mesh>
            ))}
        </group>
      ))}
      <ParticleField motion={motion} count={300} />
    </group>
  );
}
const glyphs: Record<string, string[]> = {
  C: ["111", "100", "100", "100", "111"],
  R: ["110", "101", "110", "101", "101"],
  E: ["111", "100", "110", "100", "111"],
  A: ["010", "101", "111", "101", "101"],
  T: ["111", "010", "010", "010", "010"],
  O: ["111", "101", "101", "101", "111"],
};
export function SpatialType({ motion }: { motion: Motion }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pixels = useMemo(
    () =>
      Array.from("CREATOR").flatMap((letter, k) =>
        glyphs[letter].flatMap((row, y) =>
          Array.from(row).flatMap((v, x) =>
            v === "1"
              ? [{ x: (k * 4 + x - 13) * 0.22, y: (2 - y) * 0.22, k }]
              : [],
          ),
        ),
      ),
    [],
  );
  useFrame(() => {
    if (!mesh.current) return;
    const explode = Math.sin(
      clamp((motion.progress * (sceneCount - 1) - 1.65) / 1.2) * Math.PI,
    );
    pixels.forEach((p, i) => {
      dummy.position.set(
        p.x + (p.k - 3) * explode * 0.5,
        p.y + Math.sin(p.k) * explode * 0.7,
        -3 + Math.cos(p.k) * explode * 1.4,
      );
      dummy.rotation.set(
        explode * p.k * 0.12,
        explode * 0.8,
        explode * (p.k - 3) * 0.15,
      );
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh
      frustumCulled={false}
      ref={mesh}
      args={[undefined, undefined, pixels.length]}
    >
      <boxGeometry args={[0.19, 0.19, 0.13]} />
      <meshStandardMaterial color="#bbc7e9" metalness={0.85} roughness={0.25} />
    </instancedMesh>
  );
}

// Repeated metal ribs create real parallax, occlusion and depth as the camera
// descends through the architecture. One instanced draw call for the structure.
export function Architecture({
  motion,
  low,
}: {
  motion: Motion;
  low: boolean;
}) {
  const ribs = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = low ? 28 : 48;
  useFrame(() => {
    if (!ribs.current) return;
    const p = motion.reduced ? 0 : motion.progress;
    for (let i = 0; i < count; i++) {
      const phase = i / count;
      const angle = phase * Math.PI * 5 + p * 3;
      dummy.position.set(
        Math.cos(angle) * 2.8,
        -2 + Math.sin(angle) * 2.8,
        -14 - phase * 13,
      );
      dummy.rotation.set(0, 0, angle + p * 0.8);
      dummy.scale.set(1, 1 + Math.sin(phase * Math.PI) * 0.6, 1);
      dummy.updateMatrix();
      ribs.current.setMatrixAt(i, dummy.matrix);
    }
    ribs.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh
        ref={ribs}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <boxGeometry args={[0.12, 2.5, 0.22]} />
        <meshPhysicalMaterial
          color="#9fb5df"
          metalness={1}
          roughness={0.21}
          clearcoat={1}
        />
      </instancedMesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          position={[0, -2, -14 - i * 2.4]}
          rotation={[0, 0, i * 0.25]}
        >
          <torusGeometry args={[4.2, 0.018, 6, low ? 48 : 96]} />
          <meshBasicMaterial
            color={i % 2 ? "#a4beff" : "#6075c9"}
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}
      <pointLight
        position={[0, 0, -18]}
        color="#88b3ff"
        intensity={32}
        distance={20}
      />
    </group>
  );
}
