import { NextRequest, NextResponse } from "next/server";
import { getOperation } from "@/lib/worldlabs";
import { getCachedRoom, setCachedRoom } from "@/lib/rooms-cache";

// Polled by the client while a world is generating.
export async function GET(req: NextRequest) {
  const operationId = req.nextUrl.searchParams.get("operationId");
  const roomNumber = req.nextUrl.searchParams.get("roomNumber");
  if (!operationId) {
    return NextResponse.json({ error: "operationId is required" }, { status: 400 });
  }

  try {
    const op = await getOperation(operationId);

    if (!op.done) {
      return NextResponse.json({ status: "pending" });
    }

    if (op.error) {
      if (roomNumber) {
        const cached = await getCachedRoom(roomNumber);
        if (cached) await setCachedRoom({ ...cached, status: "failed" });
      }
      return NextResponse.json({ status: "failed", error: op.error.message ?? "Generation failed" });
    }

    const world = op.response;
    const sceneUrl = world?.world_marble_url;
    const meshUrl = world?.assets?.mesh?.collider_mesh_url;
    const thumbnailUrl = world?.assets?.thumbnail_url;
    const caption = world?.assets?.caption;

    // Cache the finished world so we never regenerate (conserve credits)
    if (roomNumber) {
      const cached = await getCachedRoom(roomNumber);
      if (cached) {
        await setCachedRoom({
          ...cached,
          worldId: world?.world_id,
          sceneUrl,
          meshUrl,
          thumbnailUrl,
          caption,
          status: "done",
          generatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ status: "done", sceneUrl, meshUrl, thumbnailUrl, caption, worldId: world?.world_id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
