import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import JSZip from "jszip";
import {
  Code2,
  Download,
  Eraser,
  GripVertical,
  Trash2,
  Upload
} from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { toast } from "sonner";

interface FileInfo {
  id: string; file: File; originalName: string; size: number; lastModified: number;
}

const formatSize = (b: number) => {
  if (b === 0) return "0 B";
  const k = 1024; const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(2)) + " " + ["B", "KB", "MB", "GB"][i];
};

const getName = (f: string) => { const i = f.lastIndexOf("."); return i === -1 ? f : f.substring(0, i); };
const getExt = (f: string) => { const i = f.lastIndexOf("."); return i === -1 ? "" : f.substring(i); };

type ProcessedFile = FileInfo & { newName: string };

function SortableFileRow({ file, onRemove }: { file: ProcessedFile; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: file.id });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? { position: "relative", zIndex: 50, boxShadow: "0 4px 12px rgba(0,0,0,0.12)" } : {}),
  };
  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 px-5 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 ${isDragging ? "bg-white opacity-90" : ""}`}>
      <button type="button" className="cursor-grab active:cursor-grabbing touch-none shrink-0 text-gray-300 hover:text-gray-500" {...attributes} {...listeners}>
        <GripVertical className="size-4" />
      </button>
      <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
        <span className="text-xs text-gray-500 truncate font-mono">{file.originalName}</span>
        <span className={`text-xs truncate font-mono ${file.newName !== file.originalName ? "text-green-600 font-medium" : "text-gray-400"}`}>→ {file.newName}</span>
      </div>
      <span className="text-xs text-gray-400 shrink-0">{formatSize(file.size)}</span>
      <Button variant="ghost" size="icon-xs" onClick={onRemove}><Trash2 className="size-3 text-red-400" /></Button>
    </div>
  );
}

export default function FileRenamerPage() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [activeTab, setActiveTab] = useState("sequential");
  const [showScript, setShowScript] = useState(false);
  const [scriptType, setScriptType] = useState<"windows" | "linux">("windows");

  const [seqPrefix, setSeqPrefix] = useState("");
  const [seqStart, setSeqStart] = useState(1);
  const [seqPadding, setSeqPadding] = useState(3);

  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);

  const [caseType, setCaseType] = useState<"lowercase" | "uppercase" | "capitalize">("lowercase");

  const [insertText, setInsertText] = useState("");
  const [insertPos, setInsertPos] = useState<"prefix" | "suffix" | "index">("prefix");
  const [insertIndex, setInsertIndex] = useState(0);

  const [truncStart, setTruncStart] = useState(0);
  const [truncEnd, setTruncEnd] = useState(0);

  const [sortType, setSortType] = useState("none");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setSortType("none");
    }
  };

  const handleSort = (type: string) => {
    setSortType(type);
    if (type === "none") return;
    setFiles((prev) => {
      const sorted = [...prev];
      if (type === "natural") sorted.sort((a, b) => a.originalName.localeCompare(b.originalName, undefined, { numeric: true, sensitivity: "base" }));
      else if (type === "filename") sorted.sort((a, b) => a.originalName.localeCompare(b.originalName));
      else if (type === "modifiedTime") sorted.sort((a, b) => a.lastModified - b.lastModified);
      else if (type === "reverse") sorted.reverse();
      return sorted;
    });
  };

  const addFiles = (newFiles: File[]) => {
    const infos = newFiles.map((f) => ({ id: Math.random().toString(36).substr(2, 9), file: f, originalName: f.name, size: f.size, lastModified: f.lastModified }));
    setFiles((p) => [...p, ...infos]);
  };

  const generateName = (file: FileInfo, index: number): string => {
    const name = file.originalName;
    if (activeTab === "sequential") {
      return `${seqPrefix}${(seqStart + index).toString().padStart(seqPadding, "0")}${getExt(name)}`;
    } else if (activeTab === "replace" && findText) {
      const safe = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return name.replace(new RegExp(safe, caseSensitive ? "g" : "gi"), replaceText);
    } else if (activeTab === "case") {
      const n = getName(name);
      let t = n;
      if (caseType === "uppercase") t = n.toUpperCase();
      else if (caseType === "lowercase") t = n.toLowerCase();
      else t = n.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      return `${t}${getExt(name)}`;
    } else if (activeTab === "insert" && insertText) {
      const n = getName(name);
      if (insertPos === "prefix") return `${insertText}${n}${getExt(name)}`;
      if (insertPos === "suffix") return `${n}${insertText}${getExt(name)}`;
      const idx = Math.min(Math.max(0, insertIndex), n.length);
      return `${n.substring(0, idx)}${insertText}${n.substring(idx)}${getExt(name)}`;
    } else if (activeTab === "truncate") {
      const n = getName(name);
      return `${n.substring(Math.max(0, truncStart), truncEnd || n.length)}${getExt(name)}`;
    }
    return name;
  };

  const processedFiles = useMemo(() => files.map((f, i) => ({ ...f, newName: generateName(f, i) })), [files, activeTab, seqPrefix, seqStart, seqPadding, findText, replaceText, caseSensitive, caseType, insertText, insertPos, insertIndex, truncStart, truncEnd]);

  const handleDownload = async () => {
    if (!processedFiles.length) return;
    const zip = new JSZip();
    processedFiles.forEach((f) => zip.file(f.newName, f.file));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `renamed_${Date.now()}.zip`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`已打包下载 ${processedFiles.length} 个文件`);
  };

  const generateScript = () => {
    if (scriptType === "windows") {
      return "@echo off\r\n" + processedFiles.filter((f) => f.newName !== f.originalName).map((f) => `ren "${f.originalName}" "${f.newName}"`).join("\r\n");
    }
    return "#!/bin/bash\n" + processedFiles.filter((f) => f.newName !== f.originalName).map((f) => `mv "${f.originalName}" "${f.newName}"`).join("\n");
  };

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          {/* Upload */}
          <div
            className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-gray-50"
            onClick={() => document.getElementById("file-renamer-input")?.click()}
          >
            <Upload className="size-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-600">点击或拖拽文件到此处</p>
            <p className="text-xs text-gray-400 mt-1">支持多文件选择</p>
            <input id="file-renamer-input" type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) addFiles(Array.from(e.target.files)); e.target.value = ""; }} />
          </div>

          {files.length > 0 && (
            <>
              {/* Options */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="sequential">序号</TabsTrigger>
                    <TabsTrigger value="replace">替换</TabsTrigger>
                    <TabsTrigger value="case">大小写</TabsTrigger>
                    <TabsTrigger value="insert">插入</TabsTrigger>
                    <TabsTrigger value="truncate">截取</TabsTrigger>
                  </TabsList>

                  <TabsContent value="sequential" className="mt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div><Label className="text-xs text-gray-500 mb-1 block">前缀</Label><Input value={seqPrefix} onChange={(e) => setSeqPrefix(e.target.value)} placeholder="Img_" /></div>
                      <div><Label className="text-xs text-gray-500 mb-1 block">起始数字</Label><Input type="number" value={seqStart} onChange={(e) => setSeqStart(parseInt(e.target.value) || 1)} /></div>
                      <div><Label className="text-xs text-gray-500 mb-1 block">补零位数</Label><Input type="number" value={seqPadding} onChange={(e) => setSeqPadding(parseInt(e.target.value) || 1)} /></div>
                    </div>
                  </TabsContent>

                  <TabsContent value="replace" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label className="text-xs text-gray-500 mb-1 block">查找</Label><Input value={findText} onChange={(e) => setFindText(e.target.value)} /></div>
                      <div><Label className="text-xs text-gray-500 mb-1 block">替换为</Label><Input value={replaceText} onChange={(e) => setReplaceText(e.target.value)} /></div>
                    </div>
                    <label className="flex items-center gap-2 mt-3 cursor-pointer"><Checkbox checked={caseSensitive} onCheckedChange={(c) => setCaseSensitive(c === true)} /><span className="text-xs">区分大小写</span></label>
                  </TabsContent>

                  <TabsContent value="case" className="mt-4">
                    <div className="flex gap-2">
                      {(["lowercase", "uppercase", "capitalize"] as const).map((t) => (
                        <Button key={t} variant={caseType === t ? "default" : "outline"} size="sm" onClick={() => setCaseType(t)}>
                          {t === "lowercase" ? "lowercase" : t === "uppercase" ? "UPPERCASE" : "Capitalize"}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="insert" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label className="text-xs text-gray-500 mb-1 block">文本</Label><Input value={insertText} onChange={(e) => setInsertText(e.target.value)} /></div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">位置</Label>
                        <Select value={insertPos} onValueChange={(v) => setInsertPos(v as any)}>
                          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="prefix">前缀</SelectItem><SelectItem value="suffix">后缀</SelectItem><SelectItem value="index">指定位置</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                    {insertPos === "index" && <div className="mt-3"><Label className="text-xs text-gray-500 mb-1 block">位置索引</Label><Input type="number" value={insertIndex} onChange={(e) => setInsertIndex(parseInt(e.target.value) || 0)} /></div>}
                  </TabsContent>

                  <TabsContent value="truncate" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label className="text-xs text-gray-500 mb-1 block">起始位置</Label><Input type="number" value={truncStart} onChange={(e) => setTruncStart(parseInt(e.target.value) || 0)} /></div>
                      <div><Label className="text-xs text-gray-500 mb-1 block">结束位置 (0=末尾)</Label><Input type="number" value={truncEnd} onChange={(e) => setTruncEnd(parseInt(e.target.value) || 0)} /></div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* File List */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{files.length} 个文件 · {formatSize(files.reduce((a, b) => a + b.size, 0))}</span>
                    <Select value={sortType} onValueChange={handleSort}>
                      <SelectTrigger className="h-7 w-32 text-xs"><SelectValue placeholder="排序方式" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">手动排序</SelectItem>
                        <SelectItem value="natural">自然排序</SelectItem>
                        <SelectItem value="filename">文件名</SelectItem>
                        <SelectItem value="modifiedTime">修改时间</SelectItem>
                        <SelectItem value="reverse">倒序</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowScript(true)}><Code2 className="size-3.5" /> 脚本</Button>
                    <Button size="sm" onClick={handleDownload}><Download className="size-3.5" /> 下载 ZIP</Button>
                    <Button variant="outline" size="sm" onClick={() => setFiles([])}><Eraser className="size-3.5" /> 清空</Button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={processedFiles.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                      {processedFiles.map((f) => (
                        <SortableFileRow key={f.id} file={f} onRemove={() => setFiles((p) => p.filter((x) => x.id !== f.id))} />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            </>
          )}

          {/* Script Dialog */}
          <Dialog open={showScript} onOpenChange={setShowScript}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>重命名脚本</DialogTitle></DialogHeader>
              <div className="flex gap-2 mb-3">
                <Select value={scriptType} onValueChange={(v) => setScriptType(v as any)}>
                  <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="windows">Windows (.bat)</SelectItem><SelectItem value="linux">Linux/Mac (.sh)</SelectItem></SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generateScript())}><Code2 className="size-3.5" /> 复制</Button>
              </div>
              <pre className="max-h-60 overflow-auto rounded-lg bg-gray-900 p-3 text-xs text-green-400 font-mono">{generateScript()}</pre>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
