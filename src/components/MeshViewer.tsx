"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";

const FURNITURE_ITEMS = [
  { id: "mirror", label: "Mirror", url: "/reference/demo/3cb5b679bb8e21c509cbdd1de8e0b6ab.glb", thumb: "/reference/demo/mirror.webp" },
  { id: "lamp", label: "Lamp", url: "/reference/demo/7dc3f5ae8434c9bb772bc49ee85e8f1e.glb", thumb: "/reference/demo/lamp.jpg" },
  { id: "organizer", label: "Organizer", url: "/reference/demo/c52142f240988296e6994010bd010586.glb", thumb: "/reference/demo/organizer.jpg" },
];

const FURNITURE_LAYER = 0;
const COLLIDER_LAYER = 1;
const MOVE_STEP = 0.05;
const FLOOR_LIFT = 0.3; // compensates for collider-floor estimate sitting below the visible floor
const ROTATE_STEP = Math.PI / 12;

export default function MeshViewer({ spzUrl, meshUrl }: { spzUrl: string; meshUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [placedItems, setPlacedItems] = useState<string[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  // Mirrors React state into refs so the imperative pointer/keyboard handlers
  // (registered once, outside React's render cycle) always see the latest value.
  const selectedUrlRef = useRef<string | null>(null);
  useEffect(() => {
    selectedUrlRef.current = selectedUrl;
  }, [selectedUrl]);

  const placedItemsRef = useRef<string[]>([]);
  useEffect(() => {
    placedItemsRef.current = placedItems;
  }, [placedItems]);

  // Bridge between the `placedItems` React state and the imperative scene below.
  const sceneApiRef = useRef<{ syncFurniture: (urls: string[]) => void } | null>(null);

  function toggleItem(itemUrl: string) {
    setPlacedItems((prev) => {
      if (prev.includes(itemUrl)) {
        if (selectedUrlRef.current === itemUrl) setSelectedUrl(null);
        return prev.filter((u) => u !== itemUrl);
      }
      return [...prev, itemUrl];
    });
  }

  // ---- Scene setup: vanilla Three.js + SparkJS, run once on mount ----
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(62, container.clientWidth / container.clientHeight, 0.01, 1000);
    camera.position.set(0, -1.2, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const spark = new SparkRenderer({ renderer });
    scene.add(spark);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 0.5;
    controls.maxDistance = 20;
    controls.enablePan = false;

    // Photorealistic Gaussian-splat backdrop — purely visual, never raycast against.
    const splatMesh = new SplatMesh({ url: spzUrl });
    scene.add(splatMesh);

    // Invisible collider mesh — used only for raycasting so furniture can snap to the floor.
    let roomCollider: THREE.Group | null = null;
    let roomBox: THREE.Box3 | null = null;

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1);
    keyLight.position.set(5, 5, 5);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 3, -5);
    scene.add(ambient, keyLight, fillLight);

    const gltfLoader = new GLTFLoader();
    const furnitureObjects = new Map<string, THREE.Group>();

    function colliderFloorCenter(): THREE.Vector3 {
      if (!roomCollider) return new THREE.Vector3();
      const box = new THREE.Box3().setFromObject(roomCollider);
      const center = box.getCenter(new THREE.Vector3());

      // The reconstructed collider mesh often extends below the visible floor
      // (capture noise / surrounding structure), so box.min.y sits too low.
      // Cast upward from below the mesh through the room's center and use the
      // lowest surface actually hit — that's the real floor.
      const upRay = new THREE.Raycaster(
        new THREE.Vector3(center.x, box.min.y - 1, center.z),
        new THREE.Vector3(0, 1, 0)
      );
      upRay.layers.set(COLLIDER_LAYER);
      const hits = upRay.intersectObject(roomCollider, true);
      const floorY = hits.length > 0 ? Math.min(...hits.map((h) => h.point.y)) : box.min.y;

      return new THREE.Vector3(center.x, floorY, center.z);
    }

    function loadFurniture(url: string) {
      if (furnitureObjects.has(url)) return;
      gltfLoader.load(url, (gltf) => {
        const group = gltf.scene;
        group.userData.url = url;
        group.layers.set(FURNITURE_LAYER);
        group.traverse((child) => child.layers.set(FURNITURE_LAYER));

        // Offset by the model's own bounding box so its bottom — not its
        // pivot — rests on the floor.
        const box = new THREE.Box3().setFromObject(group);
        const bottomOffset = box.min.y;

        const floorCenter = colliderFloorCenter();
        group.position.copy(floorCenter);
        group.position.y = floorCenter.y - bottomOffset + FLOOR_LIFT;
        group.userData.floorY = group.position.y;
        scene.add(group);
        furnitureObjects.set(url, group);
      });
    }

    function unloadFurniture(url: string) {
      const group = furnitureObjects.get(url);
      if (!group) return;
      scene.remove(group);
      furnitureObjects.delete(url);
    }

    // Reconciles the live scene with whatever `placedItems` React state says should be present.
    function syncFurniture(urls: string[]) {
      for (const url of urls) loadFurniture(url);
      for (const url of furnitureObjects.keys()) {
        if (!urls.includes(url)) unloadFurniture(url);
      }
    }

    // Load the invisible collider mesh, then auto-frame the camera on it.
    gltfLoader.load(meshUrl, (gltf) => {
      const group = gltf.scene;
      // World Labs exports meshes Y-down; rotate 180° about X to make it Y-up.
      group.rotation.x = Math.PI;
      group.updateMatrixWorld(true);
      group.traverse((child) => {
        child.visible = false;
        child.layers.set(COLLIDER_LAYER);
      });
      scene.add(group);
      roomCollider = group;

      const box = new THREE.Box3().setFromObject(group);
      roomBox = box;
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
      camera.near = 0.01;
      camera.far = Math.max(100, depth * 8);
      camera.updateProjectionMatrix();
      camera.lookAt(target);

      controls.target.copy(target);
      controls.update();
      camera.position.y = Math.abs(camera.position.y);

      // Now that the floor exists, place any furniture queued before the collider loaded.
      syncFurniture(placedItemsRef.current);
    });

    // ---- Render loop ----
    let frameId = 0;
    function animate() {
      frameId = requestAnimationFrame(animate);
      controls.update();
      spark.render(scene, camera);
    }
    animate();

    // ---- Resize ----
    function handleResize() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", handleResize);

    // ---- Pointer interaction: click to select, hover cursor ----
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();

    function updatePointerNdc(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function furnitureGroups(): THREE.Object3D[] {
      return Array.from(furnitureObjects.values());
    }

    function handlePointerDown(event: PointerEvent) {
      updatePointerNdc(event);
      raycaster.setFromCamera(pointerNdc, camera);
      raycaster.layers.set(FURNITURE_LAYER);
      const hits = raycaster.intersectObjects(furnitureGroups(), true);
      if (hits.length > 0) {
        let hitGroup: THREE.Object3D | null = hits[0].object;
        while (hitGroup && !furnitureObjects.has(hitGroup.userData.url)) {
          hitGroup = hitGroup.parent;
        }
        setSelectedUrl(hitGroup?.userData.url ?? null);
      } else {
        setSelectedUrl(null);
      }
    }

    function handlePointerMove(event: PointerEvent) {
      updatePointerNdc(event);
      raycaster.setFromCamera(pointerNdc, camera);
      raycaster.layers.set(FURNITURE_LAYER);
      const hits = raycaster.intersectObjects(furnitureGroups(), true);
      renderer.domElement.style.cursor = hits.length > 0 ? "pointer" : "default";
    }

    const canvas = renderer.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);

    // ---- Keyboard: arrows move, Q/E rotate the selected piece ----
    function handleKeyDown(event: KeyboardEvent) {
      const url = selectedUrlRef.current;
      if (!url) return;
      const group = furnitureObjects.get(url);
      if (!group) return;

      switch (event.key) {
        case "q":
        case "Q":
          group.rotation.y -= ROTATE_STEP;
          return;
        case "e":
        case "E":
          group.rotation.y += ROTATE_STEP;
          return;
        case "w":
        case "W":
          group.position.y += MOVE_STEP;
          group.userData.floorY = group.position.y;
          return;
        case "s":
        case "S":
          group.position.y -= MOVE_STEP;
          group.userData.floorY = group.position.y;
          return;
        case "ArrowUp":
          group.position.z -= MOVE_STEP;
          break;
        case "ArrowDown":
          group.position.z += MOVE_STEP;
          break;
        case "ArrowLeft":
          group.position.x -= MOVE_STEP;
          break;
        case "ArrowRight":
          group.position.x += MOVE_STEP;
          break;
        default:
          return;
      }

      event.preventDefault();
      if (roomBox) {
        group.position.x = THREE.MathUtils.clamp(group.position.x, roomBox.min.x, roomBox.max.x);
        group.position.z = THREE.MathUtils.clamp(group.position.z, roomBox.min.z, roomBox.max.z);
      }
    }
    window.addEventListener("keydown", handleKeyDown);

    // Stash the syncer so the placedItems-effect (below) can reach into this scene.
    sceneApiRef.current = { syncFurniture };

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);

      sceneApiRef.current = null;
      controls.dispose();
      splatMesh.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spzUrl, meshUrl]);

  useEffect(() => {
    sceneApiRef.current?.syncFurniture(placedItems);
  }, [placedItems]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Furniture sidebar — right edge */}
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
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, textAlign: "center" }}>Furniture</span>
        {FURNITURE_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.url)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.08)",
              border: placedItems.includes(item.url) ? "1px solid #4A90E2" : "1px solid rgba(255,255,255,0.15)",
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
            <img src={item.thumb} alt={item.label} style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 6 }} />
            <span style={{ fontSize: 11 }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Rotation hint */}
      {selectedUrl && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.55)",
            color: "white",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          [↑↓←→] move &nbsp; [W/S] up/down &nbsp; [Q] ↺ &nbsp; [E] ↻ rotate
        </div>
      )}
    </div>
  );
}
