"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Box, Sparkles, ShoppingBag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import FakeWorldGenerator from "@/components/FakeWorldGenerator";
import RoomViewer from "@/components/RoomViewer";
import InspirationPanel from "@/components/InspirationPanel";
import ShoppingPanel from "@/components/ShoppingPanel";
import { DEMO_WORLD } from "@/lib/demo-world";

interface RoomData {
  roomNumber: string;
  building: string;
  floor: number;
  photos: string[];
  dimensions?: { width: number; length: number; height: number };
  sqft?: number;
  type: string;
  floorPlanUrl?: string;
}

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const router = useRouter();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [roomError, setRoomError] = useState("");
  const [activeTab, setActiveTab] = useState("3d");

  // Hackathon demo: live World Labs generation is disabled. The 3D experience is
  // a pre-baked world revealed behind a fake upload (see FakeWorldGenerator).
  useEffect(() => {
    fetch(`/api/room/${roomId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setRoomError(data.error); return; }
        setRoom(data);
      })
      .catch(() => setRoomError("Failed to load room data."));
  }, [roomId]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-screen flex-col gap-0">
      {/* Header with compact view toggles */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="h-4 w-px bg-border" />
          <span className="font-mono font-bold text-primary">{roomId}</span>
          {room && (
            <>
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">{room.building}</Badge>
              <Badge variant="outline" className="text-xs capitalize hidden md:inline-flex">{room.type}</Badge>
              {room.sqft && <span className="text-xs text-muted-foreground hidden lg:inline">{room.sqft} sq ft</span>}
            </>
          )}

          {!roomError && (
            <TabsList className="ml-auto">
              <TabsTrigger value="3d" className="gap-1.5 px-2.5">
                <Box className="h-3.5 w-3.5" /> <span className="hidden sm:inline">3D View</span>
              </TabsTrigger>
              <TabsTrigger value="style" className="gap-1.5 px-2.5">
                <Sparkles className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Style It</span>
              </TabsTrigger>
              <TabsTrigger value="shop" className="gap-1.5 px-2.5">
                <ShoppingBag className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Shop</span>
              </TabsTrigger>
            </TabsList>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {roomError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-destructive">{roomError}</p>
            <Button variant="outline" onClick={() => router.push("/")}>Try another room</Button>
          </div>
        ) : (
          <>
            <TabsContent value="3d">
              {roomId.toUpperCase() === DEMO_WORLD.roomNumber.toUpperCase() ? (
                <FakeWorldGenerator
                  roomNumber={roomId}
                  dimensions={room?.dimensions}
                  floorPlanUrl={room?.floorPlanUrl}
                  photos={room?.photos ?? []}
                />
              ) : (
                <RoomViewer
                  photos={room?.photos ?? []}
                  generating={false}
                  dimensions={room?.dimensions}
                  floorPlanUrl={room?.floorPlanUrl}
                  roomNumber={room?.roomNumber}
                />
              )}
              {room && (
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={() => setActiveTab("style")}
                    variant="outline"
                    className="gap-2"
                  >
                    Style this room with inspo <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="style">
              <InspirationPanel
                roomNumber={roomId}
                dimensions={room?.dimensions}
                onStylesDetected={(styles) => {
                  setActiveTab("shop");
                }}
              />
            </TabsContent>

            <TabsContent value="shop">
              <ShoppingPanel
                dimensions={room?.dimensions}
                roomNumber={roomId}
              />
            </TabsContent>
          </>
        )}
      </main>
    </Tabs>
  );
}
