import { NextRequest, NextResponse } from "next/server";
import { scrapeRoomData } from "@/lib/scraper";
import { getCachedRoom, setCachedRoom } from "@/lib/rooms-cache";

export async function GET(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;

  // Check cache first
  const cached = await getCachedRoom(roomId);
  if (cached) return NextResponse.json(cached);

  // Scrape fresh data
  const data = await scrapeRoomData(roomId);
  if (!data) {
    return NextResponse.json({ error: "Room not found. Try a Broadway Hall room (e.g. B305, B333, B707, B1119)." }, { status: 404 });
  }

  const room = { ...data, generatedAt: undefined };
  await setCachedRoom(room);
  return NextResponse.json(room);
}
