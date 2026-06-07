"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const HIGHLIGHT_COLOR = new THREE.Color("#4A90E2");

interface Props {
  url: string;
  roomScene: THREE.Group | null;
  isSelected: boolean;
  onSelect: () => void;
}

export default function FurniturePiece({ url, roomScene, isSelected, onSelect }: Props) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);
  const isDragging = useRef(false);
  const raycaster = useRef(new THREE.Raycaster());
  const placed = useRef(false);

  const controls = useThree((state) => state.controls as OrbitControlsImpl | null);
  const camera = useThree((state) => state.camera);
  const pointer = useThree((state) => state.pointer);

  // Place at the center of the room's floor on mount.
  useLayoutEffect(() => {
    const group = ref.current;
    if (!group || !roomScene || placed.current) return;

    const box = new THREE.Box3().setFromObject(roomScene);
    const center = box.getCenter(new THREE.Vector3());
    group.position.set(center.x, box.min.y, center.z);
    placed.current = true;
  }, [scene, roomScene]);

  // Pulsing emissive highlight when selected.
  useFrame(({ clock }) => {
    const group = ref.current;
    if (!group) return;

    const pulse = isSelected ? 0.15 + Math.sin(clock.elapsedTime * 4) * 0.05 : 0;
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
        const materials = Array.isArray(material) ? material : [material];
        for (const mat of materials) {
          if (mat && "emissive" in mat) {
            if (isSelected) mat.emissive.set(HIGHLIGHT_COLOR);
            mat.emissiveIntensity = pulse;
          }
        }
      }
    });

    if (isDragging.current && roomScene) {
      raycaster.current.setFromCamera(pointer, camera);
      raycaster.current.layers.set(0);
      const hits = raycaster.current.intersectObjects(roomScene.children, true);
      if (hits.length > 0) {
        const point = hits[0].point;
        group.position.x = THREE.MathUtils.lerp(group.position.x, point.x, 0.12);
        group.position.z = THREE.MathUtils.lerp(group.position.z, point.z, 0.12);
        group.position.y = point.y;
      }
    }
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isSelected || !ref.current) return;
      if (e.key === "q" || e.key === "Q") {
        ref.current.rotation.y -= Math.PI / 12;
      } else if (e.key === "e" || e.key === "E") {
        ref.current.rotation.y += Math.PI / 12;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelected]);

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    onSelect();
    isDragging.current = true;
    if (controls) controls.enabled = false;
    document.body.style.cursor = "grabbing";
  }

  function handlePointerUp() {
    isDragging.current = false;
    if (controls) controls.enabled = true;
    document.body.style.cursor = "default";
  }

  function handlePointerOver() {
    if (!isDragging.current) document.body.style.cursor = "grab";
  }

  function handlePointerOut() {
    if (!isDragging.current) document.body.style.cursor = "default";
  }

  return (
    <primitive
      ref={ref}
      object={scene}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
}
