// World Labs Marble API client
// Docs: https://docs.worldlabs.ai/api
// Base: https://api.worldlabs.ai/marble/v1 · Auth header: WLT-Api-Key

const WORLDLABS_BASE = "https://api.worldlabs.ai/marble/v1";

function authHeaders(extra: Record<string, string> = {}) {
  return {
    "WLT-Api-Key": process.env.WORLDLABS_API_KEY ?? "",
    "Content-Type": "application/json",
    ...extra,
  };
}

export interface Operation {
  operation_id: string;
  done: boolean;
  error?: { message?: string } | null;
  response?: World | null;
}

export interface World {
  world_id: string;
  display_name?: string;
  world_marble_url?: string;
  assets?: {
    thumbnail_url?: string;
    caption?: string;
    imagery?: { pano_url?: string | null };
    mesh?: { collider_mesh_url?: string };
    splats?: { spz_urls?: Record<string, string> };
  };
}

export interface RemainingCredits {
  remaining_credits: number;
}

export async function getCredits(): Promise<RemainingCredits> {
  const res = await fetch(`${WORLDLABS_BASE}/credits`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`WorldLabs credits failed: ${res.status}`);
  return res.json();
}

// Generate a world directly from a public image URL.
export async function generateWorldFromUrl(imageUrl: string, displayName = "Dorm room"): Promise<Operation> {
  const res = await fetch(`${WORLDLABS_BASE}/worlds:generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      world_prompt: {
        type: "image",
        image_prompt: { source: "uri", uri: imageUrl },
        is_pano: false,
      },
      display_name: displayName,
      model: "marble-1.0-draft",
      permission: { public: false, allow_id_access: true },
    }),
  });
  if (!res.ok) throw new Error(`WorldLabs generate failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function getOperation(operationId: string): Promise<Operation> {
  const res = await fetch(`${WORLDLABS_BASE}/operations/${operationId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`WorldLabs getOperation failed: ${res.status}`);
  return res.json();
}

// Poll an operation until done (or timeout). World generation takes minutes,
// so callers should run this in a background context, not a single request.
export async function pollOperation(operationId: string, maxMs = 240_000, intervalMs = 5000): Promise<Operation> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    const op = await getOperation(operationId);
    if (op.done) return op;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("WorldLabs world generation timed out");
}

// ── Media asset upload (for user-uploaded photos) ──
export interface PreparedUpload {
  media_asset: { media_asset_id: string };
  upload_info: { upload_url: string; upload_method: string; required_headers?: Record<string, string> };
}

export async function prepareUpload(fileName: string, extension: string): Promise<PreparedUpload> {
  const res = await fetch(`${WORLDLABS_BASE}/media-assets:prepare_upload`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ file_name: fileName, extension, kind: "image" }),
  });
  if (!res.ok) throw new Error(`WorldLabs prepareUpload failed: ${res.status}`);
  return res.json();
}

export async function uploadAndGenerate(buffer: Buffer, fileName: string, extension: string, contentType: string): Promise<Operation> {
  const prepared = await prepareUpload(fileName, extension);
  await fetch(prepared.upload_info.upload_url, {
    method: (prepared.upload_info.upload_method || "PUT") as string,
    headers: { "Content-Type": contentType, ...(prepared.upload_info.required_headers ?? {}) },
    body: new Uint8Array(buffer),
  });

  const res = await fetch(`${WORLDLABS_BASE}/worlds:generate`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      world_prompt: {
        type: "image",
        image_prompt: { source: "media_asset", media_asset_id: prepared.media_asset.media_asset_id },
        is_pano: false,
      },
      display_name: fileName,
      model: "marble-1.0-draft",
      permission: { public: false, allow_id_access: true },
    }),
  });
  if (!res.ok) throw new Error(`WorldLabs generate failed: ${res.status} ${await res.text()}`);
  return res.json();
}
