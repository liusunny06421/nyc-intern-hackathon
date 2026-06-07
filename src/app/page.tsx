"use client";

import { useState } from "react";
import { Box, Sparkles, ShoppingBag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FakeWorldGenerator from "@/components/FakeWorldGenerator";
import InspirationPanel from "@/components/InspirationPanel";
import ShoppingPanel from "@/components/ShoppingPanel";

const ROOM_NUMBER = "B1207";
const DIMENSIONS = { width: 12, length: 15, height: 9 };

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("3d");

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="3d" className="gap-1.5">
              <Box className="h-3.5 w-3.5" /> 3D View
            </TabsTrigger>
            <TabsTrigger value="style" className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Style It
            </TabsTrigger>
            <TabsTrigger value="shop" className="gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" /> Shop
            </TabsTrigger>
          </TabsList>

          <TabsContent value="3d">
            <FakeWorldGenerator
              roomNumber={ROOM_NUMBER}
              dimensions={DIMENSIONS}
              photos={[]}
            />
            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => setActiveTab("style")}
                variant="outline"
                className="gap-2"
              >
                Style this room with inspo <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="style">
            <InspirationPanel
              roomNumber={ROOM_NUMBER}
              dimensions={DIMENSIONS}
              onStylesDetected={() => setActiveTab("shop")}
            />
          </TabsContent>

          <TabsContent value="shop">
            <ShoppingPanel
              dimensions={DIMENSIONS}
              roomNumber={ROOM_NUMBER}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
