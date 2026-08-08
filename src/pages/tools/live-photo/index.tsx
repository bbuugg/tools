import { useState } from "react";
import { Images, Scissors, Package } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type SiteDefination } from "@/lib/site";
import LivePhotoUnpacker from "./LivePhotoUnpacker";
import LivePhotoMaker from "./LivePhotoMaker";

/* ─── Page ─── */

export default function LivePhotoPage({ title, description }: SiteDefination) {
  const [mode, setMode] = useState("unpack");

  return (
    <>
      <div>
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
              <Images className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>

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
