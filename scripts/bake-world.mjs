// Pre-bakes a World Labs "world" from a local photo so the hackathon demo can
// show an instant result behind a fake upload UI.
//
//   node scripts/bake-world.mjs <path-to-image> [roomNumber] ["Display Name"]
//   e.g. node scripts/bake-world.mjs public/reference/demo/river-room.jpg B1207 "Broadway River-View"
//
// It uploads the image, polls until the world is ready, downloads the thumbnail
// + collider mesh locally, and writes src/data/demo-world.json which the app
// loads as the "pre-generated" world.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_JSON = path.join(ROOT, "src/data/demo-world.json");
const ASSET_DIR = path.join(ROOT, "public/reference/demo");

const BASE = "https://api.worldlabs.ai/marble/v1";

// Load WORLDLABS_API_KEY from .env.local (scripts don't get Next's env injection).
async function loadKey() {
  if (process.env.WORLDLABS_API_KEY) return process.env.WORLDLABS_API_KEY;
  try {
    const env = await fs.readFile(path.join(ROOT, ".env.local"), "utf-8");
    const m = env.match(/^WORLDLABS_API_KEY=(.+)$/m);
    if (m) return m[1].trim();
  } catch {}
  throw new Error("WORLDLABS_API_KEY not set (env or .env.local)");
}

let KEY;
const headers = (extra = {}) => ({ "WLT-Api-Key": KEY, "Content-Type": "application/json", ...extra });

async function prepareUpload(fileName, extension) {
  const res = await fetch(`${BASE}/media-assets:prepare_upload`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ file_name: fileName, extension, kind: "image" }),
  });
  if (!res.ok) throw new Error(`prepare_upload ${res.status}: ${await res.text()}`);
  return res.json();
}

async function generate(mediaAssetId, displayName) {
  const res = await fetch(`${BASE}/worlds:generate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      world_prompt: { type: "image", image_prompt: { source: "media_asset", media_asset_id: mediaAssetId }, is_pano: false },
      display_name: displayName,
      model: "marble-1.0-draft",
      permission: { public: false, allow_id_access: true },
    }),
  });
  if (!res.ok) throw new Error(`generate ${res.status}: ${await res.text()}`);
  return res.json();
}

async function getOperation(id) {
  const res = await fetch(`${BASE}/operations/${id}`, { headers: headers() });
  if (!res.ok) throw new Error(`operation ${res.status}`);
  return res.json();
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) return null;
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
}

async function main() {
  const [imgPath, roomNumber = "B1207", displayName = "Broadway River-View Demo"] = process.argv.slice(2);
  if (!imgPath) { console.error("Usage: node scripts/bake-world.mjs <image> [room] [name]"); process.exit(1); }

  KEY = await loadKey();
  await fs.mkdir(ASSET_DIR, { recursive: true });
  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });

  const buf = await fs.readFile(path.resolve(ROOT, imgPath));
  const ext = path.extname(imgPath).slice(1).toLowerCase() || "jpg";
  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  console.log(`→ Uploading ${imgPath} (${(buf.length / 1024).toFixed(0)} KB)…`);

  const prepared = await prepareUpload(path.basename(imgPath), ext);
  const up = prepared.upload_info;
  const putRes = await fetch(up.upload_url, {
    method: up.upload_method || "PUT",
    headers: { "Content-Type": contentType, ...(up.required_headers ?? {}) },
    body: new Uint8Array(buf),
  });
  if (!putRes.ok) throw new Error(`upload PUT ${putRes.status}: ${await putRes.text()}`);
  console.log("  ✓ uploaded");

  console.log("→ Starting world generation…");
  const op = await generate(prepared.media_asset.media_asset_id, displayName);
  console.log("  operation:", op.operation_id);

  // Poll
  let world = null;
  const start = Date.now();
  while (Date.now() - start < 600_000) {
    await new Promise((r) => setTimeout(r, 6000));
    const cur = await getOperation(op.operation_id);
    process.stdout.write(`  …${Math.round((Date.now() - start) / 1000)}s done=${cur.done}\r`);
    if (cur.done) {
      if (cur.error) throw new Error(`generation failed: ${JSON.stringify(cur.error)}`);
      world = cur.response;
      break;
    }
  }
  if (!world) throw new Error("timed out waiting for world");
  console.log("\n  ✓ world ready:", world.world_id);

  // Download assets locally so the demo never depends on a live fetch
  const thumb = world.assets?.thumbnail_url;
  const mesh = world.assets?.mesh?.collider_mesh_url;
  let localThumb, localMesh;
  if (thumb) { localThumb = await download(thumb, path.join(ASSET_DIR, "demo-thumb.jpg")); console.log("  ✓ thumbnail saved"); }
  if (mesh)  { localMesh  = await download(mesh,  path.join(ASSET_DIR, "demo-mesh.glb")); console.log("  ✓ mesh saved"); }

  const record = {
    roomNumber,
    worldId: world.world_id,
    displayName: world.display_name || displayName,
    sceneUrl: world.world_marble_url,
    meshUrl: localMesh ? "/reference/demo/demo-mesh.glb" : mesh,
    meshUrlRemote: mesh,
    thumbnailUrl: localThumb ? "/reference/demo/demo-thumb.jpg" : thumb,
    caption: world.assets?.caption,
    panoUrl: world.assets?.imagery?.pano_url ?? null,
    sourcePhoto: `/reference/demo/${path.basename(imgPath)}`,
    bakedAt: new Date().toISOString(),
  };
  await fs.writeFile(OUT_JSON, JSON.stringify(record, null, 2));
  console.log(`\n✓ Baked demo world → ${OUT_JSON}`);
  console.log(`  Marble URL: ${record.sceneUrl}`);
}

main().catch((e) => { console.error("\n✗", e.message); process.exit(1); });
