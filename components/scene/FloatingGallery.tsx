"use client";
import { useMemo, useRef, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { projects, Project } from "../../lib/data";
import { smooth } from "../../lib/journey";
import type { Motion } from "./Objects";
type Position = [number, number, number];
function Panel({
  project,
  position,
  rotation = [0, 0, 0],
  motion,
  onSelect,
  index,
}: {
  project: Project;
  position: Position;
  rotation?: Position;
  motion: Motion;
  onSelect: (p: Project) => void;
  index: number;
}) {
  const texture = useTexture(project.cover, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
  });
  const root = useRef<THREE.Group>(null);
  const shader = useRef<THREE.ShaderMaterial>(null);
  const [hover, setHover] = useState(false);
  const selected = useRef(false),
    timer = useRef(0),
    time = useRef(0);
  const uniforms = useMemo(
    () => ({ uMap: { value: texture }, uBend: { value: 0 } }),
    [texture],
  );
  useFrame((_, dt) => {
    if (!root.current) return;
    const delta = Math.min(dt, 0.05);
    if (!motion.paused && !motion.reduced) time.current += delta;
    const focus = selected.current ? 1 : hover ? 0.18 : 0;
    root.current.position.z = THREE.MathUtils.damp(
      root.current.position.z,
      position[2] + focus * 1.4,
      7,
      delta,
    );
    root.current.position.y =
      position[1] +
      (motion.reduced ? 0 : Math.sin(time.current * 0.38 + index) * 0.085);
    root.current.rotation.y = THREE.MathUtils.damp(
      root.current.rotation.y,
      rotation[1] + (hover ? 0.06 : 0),
      6,
      delta,
    );
    root.current.scale.setScalar(
      THREE.MathUtils.damp(root.current.scale.x, 1 + focus * 0.06, 8, delta),
    );
    if (shader.current)
      shader.current.uniforms.uBend.value = THREE.MathUtils.damp(
        shader.current.uniforms.uBend.value,
        hover && !motion.reduced ? 0.11 : 0,
        8,
        delta,
      );
    if (selected.current) {
      timer.current += delta;
      if (timer.current > 0.24) {
        selected.current = false;
        timer.current = 0;
        onSelect(project);
      }
    }
  });
  const select = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (motion.reduced) onSelect(project);
    else selected.current = true;
  };
  return (
    <group
      ref={root}
      position={position}
      rotation={rotation}
      onClick={select}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
    >
      <mesh position={[0, 0, -0.045]}>
        <boxGeometry args={[2.48, 1.81, 0.075]} />
        <meshStandardMaterial
          color={hover ? "#526fab" : "#222833"}
          metalness={0.8}
          roughness={0.35}
        />
      </mesh>
      <mesh>
        <planeGeometry args={[2.4, 1.714, 16, 12]} />
        <shaderMaterial
          ref={shader}
          uniforms={uniforms}
          side={THREE.DoubleSide}
          vertexShader={`varying vec2 vUv;uniform float uBend;void main(){vUv=uv;vec3 p=position;p.z+=sin(uv.x*3.14159)*sin(uv.y*3.14159)*uBend;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`}
          fragmentShader={`uniform sampler2D uMap;varying vec2 vUv;void main(){gl_FragColor=texture2D(uMap,vUv);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`}
        />
      </mesh>
    </group>
  );
}
export function FloatingGallery({
  motion,
  onSelect,
  low,
}: {
  motion: Motion;
  onSelect: (p: Project) => void;
  low: boolean;
}) {
  const final = useRef<THREE.Group>(null);
  useFrame(() => {
    if (final.current) {
      const p = smooth((motion.progress * 6 - 5.3) / 0.7);
      final.current.rotation.z = (1 - p) * 0.25;
      final.current.scale.setScalar((0.6 + p * 0.4) * (low ? 0.65 : 1));
    }
  });
  return (
    <>
      <group>
        {projects.slice(0, low ? 2 : 4).map((p, i) => (
          <Panel
            key={p.id}
            project={p}
            position={
              [
                [3.5, 1.5, -1],
                [-3.3, 0.8, -2],
                [3.5, -1.5, -3],
                [-3, -1.4, -4],
              ][i] as Position
            }
            rotation={[0, i % 2 ? 0.25 : -0.25, i % 2 ? -0.06 : 0.07]}
            motion={motion}
            onSelect={onSelect}
            index={i}
          />
        ))}
      </group>
      <group>
        {Array.from({ length: low ? 6 : 12 }, (_, i) => (
          <Panel
            key={i}
            project={projects[i % 6]}
            position={[
              (i % 2 ? 1 : -1) * (2.4 + (i % 3) * 0.25),
              Math.sin(i * 1.7) * 1.5,
              -8 - Math.floor(i / 2) * 3.5,
            ]}
            rotation={[0, i % 2 ? -0.32 : 0.32, ((i % 3) - 1) * 0.1]}
            motion={motion}
            onSelect={onSelect}
            index={i + 5}
          />
        ))}
      </group>
      <group ref={final} position={[0, 0, -82]}>
        {projects.map((p, i) => (
          <Panel
            key={p.id}
            project={p}
            position={[
              ((i % 3) - 1) * 2.95,
              i < 3 ? 1.15 : -1.15,
              Math.abs((i % 3) - 1) * -0.7,
            ]}
            rotation={[0, ((i % 3) - 1) * -0.12, 0]}
            motion={motion}
            onSelect={onSelect}
            index={i + 18}
          />
        ))}
      </group>
    </>
  );
}
