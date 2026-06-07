import { NextRequest, NextResponse } from "next/server";
import { uploadMediaAsset, generateFromMediaAssets } from "@/lib/worldlabs";

export const runtime = "nodejs";
export const maxDuration = 60;

// Accepts one or more room photos (multipart form field "photos"), uploads them
// to World Labs, kicks off world generation, and returns an operationId the
// client polls via /api/generate/status.
export async function POST(req: NextRequest) {
  if (!process.env.WORLDLABS_API_KEY) {
    return NextResponse.json({ error: "WORLDLABS_API_KEY is not configured on the server." }, { status: 500 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data with a 'photos' field." }, { status: 400 });
  }

  const files = form.getAll("photos").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Upload at least one photo." }, { status: 400 });
  }
  if (files.length > 6) {
    return NextResponse.json({ error: "Please upload at most 6 photos." }, { status: 400 });
  }

  try {
    const assetIds: string[] = [];
    for (const file of files) {
      const buf = Buffer.from(await file.arrayBuffer());
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const contentType = file.type || "image/jpeg";
      assetIds.push(await uploadMediaAsset(buf, file.name || "room-photo", ext, contentType));
    }

    const op = await generateFromMediaAssets(assetIds, "My dorm room");
    return NextResponse.json({ status: "pending", operationId: op.operation_id, photoCount: files.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
