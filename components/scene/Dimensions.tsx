"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { smooth, sceneCount } from "../../lib/journey";
import type { Motion } from "./Objects";

// Each chamber occupies a real location along the same camera path.
// All transformations use scroll progress, so travelling backwards unwinds them.
export function CrystalBloom({
  motion,
  low,
}: {
  motion: Motion;
  low: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const root = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const count = low ? 42 : 84;
  useFrame(() => {
    if (!mesh.current || !root.current) return;
    const p = motion.progress * (sceneCount - 1);
    root.current.visible = p > 3.2 && p < 6.7;
    const open = smooth((p - 4.3) / 1.4);
    root.current.rotation.set(0.2 + open * 0.6, open * 1.8, -0.2);
    for (let i = 0; i < count; i++) {
      const y = 1 - ((i + 0.5) / count) * 2;
      const a = i * 2.399963;
      const radius = Math.sqrt(1 - y * y);
      direction.set(Math.cos(a) * radius, y, Math.sin(a) * radius);
      dummy.position.copy(direction).multiplyScalar(1.1 + open * 1.7);
      dummy.quaternion.setFromUnitVectors(up, direction);
      dummy.scale.set(
        0.16 + (i % 3) * 0.04,
        0.7 + open * 0.7 + (i % 4) * 0.13,
        0.22,
      );
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group ref={root} position={[0, -2, -64]}>
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#bca9f4"
          metalness={0.85}
          roughness={0.13}
          iridescence={1}
          clearcoat={1}
        />
      </instancedMesh>
      <mesh>
        <icosahedronGeometry args={[0.85, 2]} />
        <meshStandardMaterial
          color="#bea8ff"
          emissive="#8563dd"
          emissiveIntensity={0.7}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <pointLight
        position={[2, 3, 3]}
        color="#c5a0ff"
        intensity={32}
        distance={15}
      />
    </group>
  );
}

export function RibbonCurrent({
  motion,
  low,
}: {
  motion: Motion;
  low: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const root = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = low ? 80 : 140;
  useFrame(() => {
    if (!mesh.current || !root.current) return;
    const p = motion.progress * (sceneCount - 1);
    root.current.visible = p > 4.5 && p < 7.7;
    const phase = p * 1.9;
    root.current.rotation.z = Math.sin(p) * 0.22;
    for (let i = 0; i < count; i++) {
      const t = Math.floor(i / 2) / (count / 2);
      const a = t * Math.PI * 5 + phase + (i % 2) * Math.PI;
      const r = 1.8 + Math.sin(t * Math.PI) * 1.2;
      dummy.position.set(Math.cos(a) * r, Math.sin(a) * r, 5 - t * 13);
      dummy.rotation.set(0, Math.PI / 2, a);
      dummy.scale.set(0.12, 0.7 + Math.sin(t * Math.PI) * 0.5, 0.35);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group ref={root} position={[0, -3, -84]}>
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color="#e4b7a4"
          metalness={0.95}
          roughness={0.2}
          clearcoat={1}
          emissive="#773d33"
          emissiveIntensity={0.16}
        />
      </instancedMesh>
      <pointLight
        position={[0, 2, 3]}
        color="#ffbba0"
        intensity={38}
        distance={18}
      />
    </group>
  );
}

export function Gyroscope({ motion }: { motion: Motion }) {
  const root = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!root.current) return;
    const p = motion.progress * (sceneCount - 1);
    root.current.visible = p > 5.5 && p < 8.8;
    root.current.children.slice(0, 4).forEach((ring, i) => {
      ring.rotation.set(
        p * (0.4 + i * 0.12) + i,
        p * 0.6 + i * 0.8,
        p * -0.3 + i,
      );
    });
  });
  return (
    <group ref={root} position={[0, -1, -101]}>
      {[0, 1, 2, 3].map((i) => (
        <group key={i}>
          <mesh>
            <torusGeometry
              args={[2.1 + i * 0.4, i % 2 ? 0.055 : 0.14, 10, 96]}
            />
            <meshPhysicalMaterial
              color={i % 2 ? "#99ffdb" : "#b6c9d3"}
              metalness={1}
              roughness={0.16}
              emissive={i % 2 ? "#398d76" : "#000000"}
              emissiveIntensity={0.7}
            />
          </mesh>
          <mesh position={[2.1 + i * 0.4, 0, 0]}>
            <sphereGeometry args={[0.14, 16, 12]} />
            <meshBasicMaterial color="#a8ffe3" />
          </mesh>
        </group>
      ))}
      <mesh>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshPhysicalMaterial color="#c4ffee" metalness={1} roughness={0.14} />
      </mesh>
      <pointLight
        color="#8affcf"
        position={[2, 2, 3]}
        intensity={25}
        distance={15}
      />
    </group>
  );
}

export function Monolith({ motion, low }: { motion: Motion; low: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const root = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const side = low ? 4 : 6;
  const count = side * side * side;
  useFrame(() => {
    if (!mesh.current || !root.current) return;
    const p = motion.progress * (sceneCount - 1);
    root.current.visible = p > 6.6 && p < 9.7;
    const burst = smooth((p - 7.5) / 1.1);
    root.current.rotation.set(0.2 + burst * 0.5, p * 0.4, 0.2);
    for (let i = 0; i < count; i++) {
      const x = (i % side) - (side - 1) / 2;
      const y = (Math.floor(i / side) % side) - (side - 1) / 2;
      const z = Math.floor(i / (side * side)) - (side - 1) / 2;
      const gap = 3.2 / side + burst * 0.85;
      dummy.position.set(x * gap, y * gap, z * gap);
      dummy.rotation.set(burst * y * 0.4, burst * x * 0.35, burst * z * 0.3);
      dummy.scale.setScalar((3.05 / side) * (1 - burst * 0.35));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group ref={root} position={[0, -3, -121]}>
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, count]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color="#adb6d2"
          metalness={1}
          roughness={0.19}
          iridescence={0.6}
        />
      </instancedMesh>
      <pointLight
        position={[0, 0, 1]}
        color="#ae9aff"
        intensity={22}
        distance={14}
      />
    </group>
  );
}

export function Singularity({ motion, low }: { motion: Motion; low: boolean }) {
  const root = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const count = low ? 900 : 2400;
  const positions = useMemo(() => {
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const phase = i / count;
      const angle = i * 2.399963;
      const radius = 0.7 + Math.sqrt(phase) * 4.5;
      points.set(
        [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          Math.sin(i * 1.7) * 0.2,
        ],
        i * 3,
      );
    }
    return points;
  }, [count]);
  const uniforms = useMemo(() => ({ uPhase: { value: 0 } }), []);
  useFrame(() => {
    if (!root.current || !material.current) return;
    const p = motion.progress * (sceneCount - 1);
    root.current.visible = p > 7.7 && p < 10.8;
    root.current.rotation.set(0.5 - smooth(p - 8.5) * 0.4, 0.15, p * 0.45);
    material.current.uniforms.uPhase.value = (p - 8) * 2.8;
  });
  return (
    <group ref={root} position={[0, -1, -141]}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={`uniform float uPhase; varying float vRadius; void main(){vec3 p=position;float r=length(p.xy);float a=atan(p.y,p.x)+uPhase/(r*.5+.5);p.xy=vec2(cos(a),sin(a))*r;p.z+=sin(r*2.-uPhase)*.35;vRadius=r;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(32./max(1.,-mv.z),1.,5.);}`}
          fragmentShader={`varying float vRadius;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;vec3 color=mix(vec3(.95,.76,1.),vec3(.3,.55,1.),smoothstep(1.,5.,vRadius));gl_FragColor=vec4(color,(1.-smoothstep(.05,.5,d))*.85);}`}
        />
      </points>
      <mesh>
        <sphereGeometry args={[0.67, 32, 24]} />
        <meshBasicMaterial color="#020309" />
      </mesh>
      <mesh>
        <torusGeometry args={[0.75, 0.022, 8, 96]} />
        <meshBasicMaterial color="#dcc0ff" />
      </mesh>
    </group>
  );
}

export function PassageDust({ low }: { low: boolean }) {
  const positions = useMemo(() => {
    const count = low ? 600 : 1600;
    const points = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = i * 2.399963;
      const radius = 3.5 + (((i * 73) % 101) / 101) * 7;
      points.set(
        [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius - 1.5,
          8 - (i / count) * 185,
        ],
        i * 3,
      );
    }
    return points;
  }, [low]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#91a9d6"
        size={0.022}
        sizeAttenuation
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  );
}
