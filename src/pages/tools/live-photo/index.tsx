import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Scissors } from "lucide-react";
import { useState } from "react";
import LivePhotoMaker from "./LivePhotoMaker";
import LivePhotoUnpacker from "./LivePhotoUnpacker";

/* ─── Page ─── */

export default function LivePhotoPage() {
  const [mode, setMode] = useState("unpack");

  return (
    <>
      <div>
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="w-full max-w-xs">
              <TabsTrigger value="unpack" className="flex-1"><Scissors className="size-4" /> 拆解</TabsTrigger>
              <TabsTrigger value="make" className="flex-1"><Package className="size-4" /> 制作</TabsTrigger>
            </TabsList>

            <TabsContent value="unpack" className="mt-4">
              <LivePhotoUnpacker />
            </TabsContent>

            <TabsContent value="make" className="mt-4">
              <LivePhotoMaker />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
