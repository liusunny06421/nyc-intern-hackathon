"use client";

import { Suspense, useLayoutEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Html } from "@react-three/drei";
import { Loader2 } from "lucide-react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

// World Labs exports meshes Y-down; rotate 180° about X to make it Y-up.
const MESH_ROTATION: [number, number, number] = [Math.PI, 0, 0];

function Model({ url, controls }: { url: string; controls: React.RefObject<OrbitControlsImpl | null> }) {
  const { scene } = useGLTF(url);
  const { camera } = useThree();
  const ref = useRef<THREE.Group>(null);

  // Auto-frame: stand at the back of the room at eye level, look toward the
  // far (window) wall — mirrors the Marble default view.
  useLayoutEffect(() => {
    const group = ref.current;
    if (!group) return;

    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Horizontal extent: the longer of X/Z is the room's depth (entrance↔window).
    const depthAxis: "x" | "z" = size.x >= size.z ? "x" : "z";
    const depth = size[depthAxis];
    const eye = center.y + size.y * 0.05; // a touch above center → eye level

    // Camera sits at the near end of the depth axis, target at the far end.
    const camPos = center.clone();
    const target = center.clone();
    camPos[depthAxis] = center[depthAxis] - depth * 0.55;
    camPos.y = eye;
    target[depthAxis] = center[depthAxis] + depth * 0.5;
    target.y = eye;

    camera.position.copy(camPos);
    (camera as THREE.PerspectiveCamera).near = 0.01;
    (camera as THREE.PerspectiveCamera).far = Math.max(100, depth * 8);
    camera.updateProjectionMatrix();
    camera.lookAt(target);

    if (controls.current) {
      controls.current.target.copy(target);
      controls.current.update();
    }
  }, [scene, camera, controls]);

  return <primitive ref={ref} object={scene} rotation={MESH_ROTATION} />;
}

function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--color-rose)" }} />
        <span className="text-xs whitespace-nowrap">Loading 3D mesh…</span>
      </div>
    </Html>
  );
}

export default function MeshViewer({ url }: { url: string }) {
  const controls = useRef<OrbitControlsImpl | null>(null);
  return (
    <Canvas
      camera={{ position: [0, 1.2, 4], fov: 62 }}
      dpr={[1, 2]}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} />
      <Suspense fallback={<CanvasLoader />}>
        <Model url={url} controls={controls} />
        <Environment preset="apartment" />
      </Suspense>
      <OrbitControls
        ref={controls}
        enableDamping
        dampingFactor={0.1}
        minDistance={0.3}
        maxDistance={20}
        makeDefault
      />
    </Canvas>
  );
}
