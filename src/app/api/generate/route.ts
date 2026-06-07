import { NextRequest, NextResponse } from "next/server";
import { generateWorldFromUrl } from "@/lib/worldlabs";
import { getCachedRoom, setCachedRoom } from "@/lib/rooms-cache";

// Starts World Labs world generation and returns immediately with an operationId.
// World generation takes minutes, so the client polls /api/generate/status.
export async function POST(req: NextRequest) {
  const { roomNumber, photoUrl } = await req.json();
  if (!roomNumber || !photoUrl) {
    return NextResponse.json({ error: "roomNumber and photoUrl are required" }, { status: 400 });
  }

  const cached = await getCachedRoom(roomNumber);

  // Already generated → return the finished scene
  if (cached?.sceneUrl && cached.status === "done") {
    return NextResponse.json({ status: "done", sceneUrl: cached.sceneUrl, meshUrl: cached.meshUrl, thumbnailUrl: cached.thumbnailUrl, caption: cached.caption, fromCache: true });
  }
  // Generation already in flight → return the existing operation to poll
  if (cached?.operationId && cached.status === "pending") {
    return NextResponse.json({ status: "pending", operationId: cached.operationId, worldId: cached.worldId });
  }

  if (!process.env.WORLDLABS_API_KEY) {
    return NextResponse.json({ status: "done", sceneUrl: "https://marble.worldlabs.ai/world/demo", demo: true });
  }

  try {
    const op = await generateWorldFromUrl(photoUrl, `${roomNumber} dorm room`);
    if (cached) {
      await setCachedRoom({
        ...cached,
        operationId: op.operation_id,
        status: "pending",
      });
    }
    return NextResponse.json({ status: "pending", operationId: op.operation_id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
