import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { cameraStops, sceneCount } from "../lib/journey.ts";
import { create } from "@react-three/test-renderer";
import {
  Sculpture,
  ParticleField,
  OrbitalRings,
  Portal,
  SpatialType,
} from "../components/scene/Objects.tsx";
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.self = {
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
};
const frame = 1 / 60;
test("sculpture uses instanced geometry, fractures on scroll, and freezes when paused", async () => {
  const motion = { progress: 0, paused: false, reduced: false };
  const renderer = await create(React.createElement(Sculpture, { motion }));
  await renderer.advanceFrames(1, frame);
  const meshes = renderer.scene.findAll((n) => n.instance.isInstancedMesh);
  assert.equal(meshes.length, 2);
  const ring = meshes.find((m) => m.instance.count === 24).instance;
  const initial = Float32Array.from(ring.instanceMatrix.array);
  motion.progress = 1 / (sceneCount - 1);
  await renderer.advanceFrames(1, frame);
  assert.notDeepEqual(
    Array.from(ring.instanceMatrix.array),
    Array.from(initial),
  );
  assert.ok(Array.from(ring.instanceMatrix.array).every(Number.isFinite));
  motion.paused = true;
  await renderer.advanceFrames(1, frame);
  const root = renderer.scene.children[0].instance;
  const rotation = root.rotation.toArray();
  await renderer.advanceFrames(20, frame);
  assert.deepEqual(root.rotation.toArray(), rotation);
  await renderer.unmount();
  assert.equal(renderer.scene.children.length, 0);
});
test("particle morph has cloud, sphere and portal buffers; uniforms follow scroll", async () => {
  const motion = { progress: 0, paused: false, reduced: false };
  const renderer = await create(
    React.createElement(ParticleField, { motion, count: 100 }),
  );
  const points = renderer.scene.findByType("Points").instance;
  assert.equal(points.geometry.getAttribute("position").count, 100);
  assert.equal(points.geometry.getAttribute("aSphere").count, 100);
  assert.equal(points.geometry.getAttribute("aPortal").count, 100);
  await renderer.advanceFrames(1, frame);
  assert.equal(points.material.uniforms.uMorph.value, 0);
  motion.progress = 1;
  await renderer.advanceFrames(1, frame);
  assert.equal(points.material.uniforms.uMorph.value, 1);
  assert.equal(points.material.uniforms.uPortal.value, 1);
  motion.reduced = true;
  const time = points.material.uniforms.uTime.value;
  await renderer.advanceFrames(20, frame);
  assert.equal(points.material.uniforms.uTime.value, time);
  await renderer.unmount();
});
test("orbital animation respects reduced motion, with geometry retained", async () => {
  const motion = { progress: 0, paused: false, reduced: true };
  const renderer = await create(React.createElement(OrbitalRings, { motion }));
  await renderer.advanceFrames(1, frame);
  const root = renderer.scene.children[0].instance;
  const before = root.children.map((o) => o.rotation.toArray());
  await renderer.advanceFrames(100, frame);
  assert.deepEqual(
    root.children.map((o) => o.rotation.toArray()),
    before,
  );
  assert.equal(root.children.length, 3);
  await renderer.unmount();
});
test("portal has five genuine depth layers; typography is instanced 3D geometry", async () => {
  const motion = { progress: 1, paused: true, reduced: false };
  const renderer = await create(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(Portal, { motion }),
      React.createElement(SpatialType, { motion }),
    ),
  );
  const root = renderer.scene.children[0].instance;
  assert.equal(
    new Set(root.children.slice(0, 5).map((o) => o.position.z)).size,
    5,
  );
  const letters = renderer.scene.find(
    (n) => n.instance.isInstancedMesh,
  ).instance;
  assert.ok(letters.count > 50);
  await renderer.advanceFrames(1, frame);
  assert.ok(Array.from(letters.instanceMatrix.array).every(Number.isFinite));
  await renderer.unmount();
});
test("actual CameraRig responds to scroll inside the R3F render loop", async () => {
  const { CameraRig } = await import("../components/scene/SceneCanvas.tsx");
  const { PerspectiveCamera, Vector3 } = await import("three");
  const camera = new PerspectiveCamera(44, 16 / 9, 0.1, 110);
  camera.position.set(0, 1, 11);
  const motion = { progress: 0, paused: false, reduced: false };
  const renderer = await create(
    React.createElement(CameraRig, { motion, low: false }),
    { camera },
  );
  motion.progress = 4 / (sceneCount - 1);
  await renderer.advanceFrames(160, frame);
  assert.ok(
    camera.position.distanceTo(new Vector3(...cameraStops[4].position)) < 0.001,
  );
  const direction = new Vector3();
  camera.getWorldDirection(direction);
  assert.ok(direction.z < -0.99);
  motion.reduced = true;
  await renderer.advanceFrames(1, frame);
  assert.ok(
    camera.position.distanceTo(new Vector3(...cameraStops[0].position)) < 0.001,
  );
  await renderer.unmount();
});

test("spiral architecture transforms in depth and reverses exactly with scroll", async () => {
  const { Architecture } = await import("../components/scene/Objects.tsx");
  const motion = { progress: 0.4, paused: true, reduced: false };
  const renderer = await create(
    React.createElement(Architecture, { motion, low: false }),
  );
  await renderer.advanceFrames(1, frame);
  const mesh = renderer.scene.find((n) => n.instance.isInstancedMesh).instance;
  const initial = Array.from(mesh.instanceMatrix.array);
  motion.progress = 0.7;
  await renderer.advanceFrames(1, frame);
  assert.notDeepEqual(Array.from(mesh.instanceMatrix.array), initial);
  motion.progress = 0.4;
  await renderer.advanceFrames(1, frame);
  assert.deepEqual(Array.from(mesh.instanceMatrix.array), initial);
  const depths = Array.from(
    { length: mesh.count },
    (_, i) => mesh.instanceMatrix.array[i * 16 + 14],
  );
  assert.ok(Math.max(...depths) - Math.min(...depths) > 12);
  await renderer.unmount();
});

test("camera retraces all authored stops when scrolling back up", async () => {
  const { CameraRig } = await import("../components/scene/SceneCanvas.tsx");
  const { PerspectiveCamera, Vector3 } = await import("three");
  const camera = new PerspectiveCamera(44, 16 / 9, 0.1, 110);
  const motion = { progress: 0, paused: true, reduced: false };
  const renderer = await create(
    React.createElement(CameraRig, { motion, low: false }),
    { camera },
  );
  for (const index of [
    ...cameraStops.keys(),
    ...Array.from(cameraStops.keys()).reverse(),
  ]) {
    motion.progress = index / (sceneCount - 1);
    await renderer.advanceFrames(160, frame);
    assert.ok(
      camera.position.distanceTo(new Vector3(...cameraStops[index].position)) <
        0.001,
    );
  }
  await renderer.unmount();
});

for (const [name, stop] of [
  ["CrystalBloom", 5],
  ["RibbonCurrent", 6],
  ["Monolith", 8],
]) {
  test(`${name} animates with scroll, reverses exactly, and reduces geometry on mobile`, async () => {
    const dimensions = await import("../components/scene/Dimensions.tsx");
    const motion = {
      progress: (stop - 0.2) / (sceneCount - 1),
      paused: true,
      reduced: false,
    };
    const renderer = await create(
      React.createElement(dimensions[name], { motion, low: false }),
    );
    await renderer.advanceFrames(1, frame);
    const root = renderer.scene.children[0].instance;
    const mesh = renderer.scene.find(
      (n) => n.instance.isInstancedMesh,
    ).instance;
    assert.equal(root.visible, true);
    const initial = Array.from(mesh.instanceMatrix.array);
    motion.progress = (stop + 0.3) / (sceneCount - 1);
    await renderer.advanceFrames(1, frame);
    assert.notDeepEqual(Array.from(mesh.instanceMatrix.array), initial);
    assert.ok(Array.from(mesh.instanceMatrix.array).every(Number.isFinite));
    motion.progress = (stop - 0.2) / (sceneCount - 1);
    await renderer.advanceFrames(1, frame);
    assert.deepEqual(Array.from(mesh.instanceMatrix.array), initial);
    motion.progress = 0;
    await renderer.advanceFrames(1, frame);
    assert.equal(root.visible, false, "Distant scene is not rendered");
    const fullCount = mesh.count;
    await renderer.unmount();
    const mobile = await create(
      React.createElement(dimensions[name], { motion, low: true }),
    );
    assert.ok(
      mobile.scene.find((n) => n.instance.isInstancedMesh).instance.count <
        fullCount,
    );
    await mobile.unmount();
  });
}

test("singularity shader and gyroscope are driven by reversible scroll", async () => {
  const { Singularity, Gyroscope } =
    await import("../components/scene/Dimensions.tsx");
  const motion = {
    progress: 8.8 / (sceneCount - 1),
    paused: true,
    reduced: false,
  };
  const renderer = await create(
    React.createElement(Singularity, { motion, low: false }),
  );
  await renderer.advanceFrames(1, frame);
  const particles = renderer.scene.findByType("Points").instance;
  assert.equal(particles.geometry.getAttribute("position").count, 2400);
  const phase = particles.material.uniforms.uPhase.value;
  motion.progress = 9.4 / (sceneCount - 1);
  await renderer.advanceFrames(1, frame);
  assert.ok(particles.material.uniforms.uPhase.value > phase);
  motion.progress = 8.8 / (sceneCount - 1);
  await renderer.advanceFrames(1, frame);
  assert.equal(particles.material.uniforms.uPhase.value, phase);
  await renderer.unmount();
  const rings = await create(React.createElement(Gyroscope, { motion }));
  await rings.advanceFrames(1, frame);
  const ring = rings.scene.children[0].instance.children[0];
  const initial = ring.rotation.toArray();
  motion.progress -= 0.05;
  await rings.advanceFrames(1, frame);
  assert.notDeepEqual(ring.rotation.toArray(), initial);
  await rings.unmount();
});
