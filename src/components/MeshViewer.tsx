"use client";

import { Suspense, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Html } from "@react-three/drei";
import { Box, Check, Loader2 } from "lucide-react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import FurniturePiece from "./FurniturePiece";

// World Labs exports meshes Y-down; rotate 180° about X to make it Y-up.
const MESH_ROTATION: [number, number, number] = [Math.PI, 0, 0];

const FURNITURE_ITEMS = [
  { id: "piece-1", label: "Piece 1", url: "/reference/demo/3cb5b679bb8e21c509cbdd1de8e0b6ab.glb" },
  { id: "piece-2", label: "Piece 2", url: "/reference/demo/7dc3f5ae8434c9bb772bc49ee85e8f1e.glb" },
  { id: "piece-3", label: "Piece 3", url: "/reference/demo/c52142f240988296e6994010bd010586.glb" },
];

function Model({
  url,
  controls,
  roomSceneRef,
}: {
  url: string;
  controls: React.RefObject<OrbitControlsImpl | null>;
  roomSceneRef: React.RefObject<THREE.Group | null>;
}) {
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

  return (
    <primitive
      ref={(group: THREE.Group | null) => {
        ref.current = group;
        roomSceneRef.current = group;
      }}
      object={scene}
      rotation={MESH_ROTATION}
    />
  );
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

function SceneContent({
  url,
  controls,
  roomSceneRef,
  placedItems,
  selectedId,
  onSelect,
}: {
  url: string;
  controls: React.RefObject<OrbitControlsImpl | null>;
  roomSceneRef: React.RefObject<THREE.Group | null>;
  placedItems: string[];
  selectedId: string | null;
  onSelect: (url: string) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} />
      <Suspense fallback={<CanvasLoader />}>
        <Model url={url} controls={controls} roomSceneRef={roomSceneRef} />
        {placedItems.map((itemUrl) => (
          <FurniturePiece
            key={itemUrl}
            url={itemUrl}
            roomScene={roomSceneRef.current}
            isSelected={selectedId === itemUrl}
            onSelect={() => onSelect(itemUrl)}
          />
        ))}
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
    </>
  );
}

export default function MeshViewer({ url }: { url: string }) {
  const controls = useRef<OrbitControlsImpl | null>(null);
  const roomSceneRef = useRef<THREE.Group | null>(null);
  const [placedItems, setPlacedItems] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function toggleItem(itemUrl: string) {
    setPlacedItems((prev) => {
      if (prev.includes(itemUrl)) {
        return prev.filter((u) => u !== itemUrl);
      }
      return [...prev, itemUrl];
    });
    setSelectedId((prev) => {
      if (placedItems.includes(itemUrl) && prev === itemUrl) return null;
      return prev;
    });
  }

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 1.2, 4], fov: 62 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onPointerMissed={() => setSelectedId(null)}
      >
        <SceneContent
          url={url}
          controls={controls}
          roomSceneRef={roomSceneRef}
          placedItems={placedItems}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </Canvas>

      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 140,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: 10,
          borderRadius: "0 12px 12px 0",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, textAlign: "center" }}>Furniture</span>
        {FURNITURE_ITEMS.map((item) => {
          const isPlaced = placedItems.includes(item.url);
          return (
            <button
              key={item.id}
              onClick={() => toggleItem(item.url)}
              style={{
                position: "relative",
                width: "100%",
                background: "rgba(255,255,255,0.08)",
                border: isPlaced ? "1px solid #4A90E2" : "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8,
                padding: 8,
                cursor: "pointer",
                color: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              {isPlaced && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#4A90E2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={9} color="white" />
                </span>
              )}
              <Box size={20} />
              <span style={{ fontSize: 11, textAlign: "center" }}>{item.label}</span>
            </button>
          );
        })}
      </div>

      {selectedId !== null && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.55)",
            color: "white",
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          [Q] ↺ &nbsp; [E] ↻
        </div>
      )}
    </div>
  );
}
