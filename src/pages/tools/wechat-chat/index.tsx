import phoneFrameImg from "@/assets/images/wechat-box.png";
import footerImg from "@/assets/images/wechat-footer.jpg";
import luckyMeImg from "@/assets/images/wechat-lucky.png";
import luckyThemImg from "@/assets/images/wechat-lucky2.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toPng } from "html-to-image";
import {
  ArrowUp,
  Check,
  Download,
  Pencil,
  Plus,
  Smartphone,
  Trash2
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  /** Who sent this message: "them" (left) or "me" (right) */
  sender: "them" | "me";
  type: "text" | "redpacket";
  text: string;
  /** For redpacket: the greeting text */
  greeting?: string;
}

interface ChatTimeSeparator {
  id: string;
  type: "time";
  time: string;
}

type ChatItem = ChatMessage | ChatTimeSeparator;

// ── Default data ─────────────────────────────────────────────────

const DEFAULT_MESSAGES: ChatItem[] = [
  { id: "t1", type: "time", time: "9月3日 19:27" },
  { id: "m1", sender: "them", type: "text", text: "宝宝你下班了吗" },
  { id: "m2", sender: "me", type: "text", text: "早下班了" },
  { id: "m3", sender: "them", type: "text", text: "那你在干什么" },
  { id: "m4", sender: "me", type: "text", text: "家里沙发趴着玩手机" },
  { id: "m5", sender: "them", type: "text", text: "我就在家 我回哪去了???" },
  { id: "m6", sender: "me", type: "text", text: "哈哈哈哈，忘了我们结婚了" },
  { id: "m7", sender: "me", type: "text", text: "下班直接回我爸妈这里了" },
  { id: "m8", sender: "me", type: "text", text: "尴尬" },
  { id: "m9", sender: "them", type: "text", text: "你个老六 我真是服了" },
  { id: "m10", sender: "them", type: "text", text: "回来时候 记着买一瓶酱油" },
  { id: "m11", sender: "me", type: "text", text: "嗯嗯，我再买只烤鸭，有点馋了" },
  { id: "m12", sender: "them", type: "text", text: "好的" },
  { id: "m13", sender: "them", type: "redpacket", text: "", greeting: "恭喜发财，大吉大利" },
  { id: "m14", sender: "me", type: "text", text: "谢谢老公" },
];

const DEFAULT_AVATAR_ME = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='8' fill='%2376c5f5'/%3E%3Ctext x='40' y='48' font-size='32' text-anchor='middle' fill='white' font-family='sans-serif'%3EA%3C/text%3E%3C/svg%3E";
const DEFAULT_AVATAR_THEM = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' rx='8' fill='%23f5a76c'/%3E%3Ctext x='40' y='48' font-size='32' text-anchor='middle' fill='white' font-family='sans-serif'%3EB%3C/text%3E%3C/svg%3E";

let idCounter = 100;
const nextId = () => `item-${++idCounter}`;

// ── iOS-style status bar icons ─────────────────────────────────

function SignalBars({ strength }: { strength: number }) {
  const bars = [0, 1, 2, 3];
  const heights = [4, 6.5, 9, 11.5];
  const ys = [8, 5.5, 3, 0.5];
  return (
    <svg viewBox="0 0 18 12" className="w-[18px] h-[12px]" aria-hidden>
      {bars.map((i) => (
        <rect
          key={i}
          x={i * 5}
          y={ys[i]}
          width={3}
          height={heights[i]}
          rx={1.5}
          className={i < strength ? "fill-black" : "fill-neutral-300"}
        />
      ))}
    </svg>
  );
}

function BatteryIcon({ level }: { level: number }) {
  const inner = Math.max(2, Math.round((Math.min(100, Math.max(0, level)) / 100) * 19));
  return (
    <svg viewBox="0 0 27 13" className="w-[27px] h-[13px]" aria-hidden>
      <rect
        x="0.5"
        y="0.5"
        width="22"
        height="12"
        rx="3.5"
        fill="none"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="1"
      />
      <rect
        x="2"
        y="2"
        width={inner}
        height="9"
        rx="2"
        fill={level <= 20 ? "#ff3b30" : "black"}
      />
      <rect x="24.5" y="4" width="2" height="5" rx="1" fill="rgba(0,0,0,0.35)" />
    </svg>
  );
}

// ── Main component ──────────────────────────────────────────────

export default function WechatChatPage() {
  const [messages, setMessages] = useState<ChatItem[]>(DEFAULT_MESSAGES);
  const [phoneTime, setPhoneTime] = useState("13:17");
  const [signalStrength, setSignalStrength] = useState(4);
  const [network, setNetwork] = useState("5G");
  const [battery, setBattery] = useState(88);
  const [theirName, setTheirName] = useState("王小懒");
  const [theirAvatar, setTheirAvatar] = useState(DEFAULT_AVATAR_THEM);
  const [myAvatar, setMyAvatar] = useState(DEFAULT_AVATAR_ME);

  // New message input
  const [newMsgSender, setNewMsgSender] = useState<"them" | "me">("them");
  const [newMsgType, setNewMsgType] = useState<"text" | "redpacket" | "time">("text");
  const [newMsgText, setNewMsgText] = useState("");
  const [newMsgGreeting, setNewMsgGreeting] = useState("恭喜发财，大吉大利");
  const [newTimeText, setNewTimeText] = useState("");

  const previewRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  // Whether the exported screenshot includes the phone shell (wechat-box.png) background
  const [includeFrame, setIncludeFrame] = useState(true);

  // Which message is being edited in the management list
  const [editingId, setEditingId] = useState<string | null>(null);
  // Add-message dialog open state
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // ── Message operations ────────────────────────────────────────

  const addMessage = () => {
    if (newMsgType === "redpacket") {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          sender: newMsgSender,
          type: "redpacket",
          text: "",
          greeting: newMsgGreeting || "恭喜发财，大吉大利",
        },
      ]);
    } else {
      if (!newMsgText.trim()) return;
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          sender: newMsgSender,
          type: "text",
          text: newMsgText.trim(),
        },
      ]);
      setNewMsgText("");
    }
  };

  const addTime = () => {
    if (!newTimeText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: nextId(), type: "time", time: newTimeText.trim() },
    ]);
    setNewTimeText("");
  };

  // Confirm from the add-message dialog: route by type, then reset + close.
  const handleAddConfirm = () => {
    if (newMsgType === "time") {
      if (!newTimeText.trim()) return;
      addTime();
    } else {
      if (newMsgType === "text" && !newMsgText.trim()) return;
      addMessage();
    }
    setAddDialogOpen(false);
    setNewMsgSender("them");
    setNewMsgType("text");
    setNewMsgText("");
    setNewMsgGreeting("恭喜发财，大吉大利");
    setNewTimeText("");
  };

  const deleteItem = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const updateItem = (
    id: string,
    patch: Partial<ChatMessage> | Partial<ChatTimeSeparator>,
  ) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? ({ ...m, ...patch } as ChatItem) : m)),
    );
  };

  const moveItemUp = (id: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  // ── Avatar upload ─────────────────────────────────────────────

  const handleAvatarUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Export screenshot ─────────────────────────────────────────

  const handleExport = useCallback(async () => {
    const target = includeFrame ? previewRef.current : contentRef.current;
    if (!target) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(target, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `wechat-chat-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [includeFrame]);

  return (
    <>
      <div className="overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4 overflow-x-hidden">

          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* ── Left: Preview ── */}
            <div className="flex justify-center lg:sticky lg:top-20 self-start w-full">
              <div className="w-full" style={{ maxWidth: 380 }}>
                {/* Phone frame container */}
                <div ref={previewRef} className="relative w-full" style={{ maxWidth: 380 }}>
                  {/* Phone frame image as background */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={phoneFrameImg}
                    alt="phone frame"
                    className="block w-full h-auto select-none pointer-events-none"
                    draggable={false}
                  />
                  {/* Chat content overlay - positioned inside the screen area */}
                  <div
                    ref={contentRef}
                    className="absolute bg-[#ededed] flex flex-col overflow-hidden"
                    style={{
                      top: "1.2%",
                      bottom: "1.2%",
                      left: "3%",
                      right: "3%",
                      borderRadius: '50px',
                    }}
                  >
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-6 py-2 bg-[#ededed] text-black text-sm flex-shrink-0">
                      <span className="font-semibold text-[15px] tabular-nums">{phoneTime}</span>
                      <div className="flex items-center gap-1.5">
                        <SignalBars strength={signalStrength} />
                        <span className="text-[11px] font-semibold text-black">{network}</span>
                        <BatteryIcon level={battery} />
                      </div>
                    </div>

                    {/* Header bar */}
                    <div className="flex items-center justify-between px-3 py-2.5 bg-[#ededed] border-b border-[#efefef] flex-shrink-0">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#191919]" fill="currentColor">
                          <path d="M15.5 4l-8 8 8 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(-1 0)" />
                        </svg>
                      </div>
                      <span className="text-[17px] font-medium text-black truncate max-w-[200px]">{theirName}</span>
                      <div className="w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#191919]" fill="currentColor">
                          <circle cx="5" cy="12" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="19" cy="12" r="2" />
                        </svg>
                      </div>
                    </div>

                    {/* Chat messages */}
                    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 bg-[#f5f5f5] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {messages.map((item) => {
                        if (item.type === "time") {
                          return (
                            <div key={item.id} className="flex justify-center py-2">
                              <span className="text-[11px] text-white bg-black/15 rounded px-2 py-0.5">
                                {item.time}
                              </span>
                            </div>
                          );
                        }

                        const msg = item as ChatMessage;
                        const isMe = msg.sender === "me";
                        const avatar = isMe ? myAvatar : theirAvatar;

                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} items-start`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={avatar}
                              alt=""
                              className="w-10 h-10 rounded-[4px] flex-shrink-0 object-cover"
                            />
                            <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[230px]`}>
                              {msg.type === "redpacket" ? (
                                /* Red packet bubble */
                                <div className="relative w-[210px] rounded-[6px] overflow-hidden">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={(isMe ? luckyMeImg : luckyThemImg)}
                                    alt="微信红包"
                                    className="w-full h-auto block"
                                  />
                                  <div className="absolute inset-0 flex items-start p-3 pl-14">
                                    <span className="text-white text-[14px] font-medium leading-tight drop-shadow-sm">
                                      {msg.greeting || "恭喜发财，大吉大利"}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                /* Text bubble */
                                <div
                                  className={`relative px-3 py-2 text-[15px] leading-[1.4] break-words ${isMe
                                    ? "bg-[#95ec69] text-black rounded-[6px]"
                                    : "bg-white text-black rounded-[6px]"
                                    }`}
                                >
                                  {/* Bubble tail */}
                                  <div
                                    className={`absolute top-3 w-0 h-0 border-[6px] border-transparent ${isMe
                                      ? "right-[-10px] border-l-[#95ec69]"
                                      : "left-[-10px] border-r-white"
                                      }`}
                                  />
                                  <span className="whitespace-pre-wrap">{msg.text}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom input bar */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={footerImg}
                      alt=""
                      className="w-full h-auto block flex-shrink-0"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Controls ── */}
            <div className="space-y-4">
              {/* Basic settings */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Smartphone className="size-4" /> 基本信息
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">手机时间</Label>
                    <Input value={phoneTime} onChange={(e) => setPhoneTime(e.target.value)} placeholder="13:17" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">剩余电量</Label>
                    <Input type="number" min={0} max={100} value={battery} onChange={(e) => setBattery(Number(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">信号强度</Label>
                    <Select value={String(signalStrength)} onValueChange={(v) => setSignalStrength(Number(v))}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">4 格</SelectItem>
                        <SelectItem value="3">3 格</SelectItem>
                        <SelectItem value="2">2 格</SelectItem>
                        <SelectItem value="1">1 格</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">手机网络</Label>
                    <Select value={network} onValueChange={setNetwork}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5G">5G</SelectItem>
                        <SelectItem value="4G">4G</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-gray-500 mb-1 block">对方昵称</Label>
                    <Input value={theirName} onChange={(e) => setTheirName(e.target.value)} />
                  </div>
                </div>

                {/* Avatars */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">对方头像</Label>
                    <div className="flex items-center gap-2">
                      <Avatar size="lg">
                        <AvatarImage src={theirAvatar} alt="" />
                        <AvatarFallback>对</AvatarFallback>
                      </Avatar>
                      <label className="cursor-pointer">
                        <span className="text-xs text-primary hover:underline">上传</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e, setTheirAvatar)} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">我的头像</Label>
                    <div className="flex items-center gap-2">
                      <Avatar size="lg">
                        <AvatarImage src={myAvatar} alt="" />
                        <AvatarFallback>我</AvatarFallback>
                      </Avatar>
                      <label className="cursor-pointer">
                        <span className="text-xs text-primary hover:underline">上传</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e, setMyAvatar)} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add-message dialog */}
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>添加消息</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Select
                        value={newMsgType}
                        onValueChange={(v) => setNewMsgType(v as "text" | "redpacket" | "time")}
                      >
                        <SelectTrigger className="w-24 h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">文本</SelectItem>
                          <SelectItem value="redpacket">红包</SelectItem>
                          <SelectItem value="time">时间</SelectItem>
                        </SelectContent>
                      </Select>
                      {newMsgType !== "time" && (
                        <Select
                          value={newMsgSender}
                          onValueChange={(v) => setNewMsgSender(v as "them" | "me")}
                        >
                          <SelectTrigger className="w-24 h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="them">对方</SelectItem>
                            <SelectItem value="me">我</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {newMsgType === "time" ? (
                      <Input
                        placeholder="时间显示，如 9月3日 19:27"
                        value={newTimeText}
                        onChange={(e) => setNewTimeText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddConfirm()}
                        autoFocus
                      />
                    ) : newMsgType === "redpacket" ? (
                      <Input
                        placeholder="红包祝福语"
                        value={newMsgGreeting}
                        onChange={(e) => setNewMsgGreeting(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddConfirm()}
                        autoFocus
                      />
                    ) : (
                      <Textarea
                        placeholder="输入消息内容…"
                        value={newMsgText}
                        onChange={(e) => setNewMsgText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddConfirm();
                          }
                        }}
                        rows={3}
                        className="text-sm"
                        autoFocus
                      />
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">取消</Button>
                    </DialogClose>
                    <Button onClick={handleAddConfirm}>添加</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Message list management */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">对话内容管理</h3>
                  <button
                    type="button"
                    onClick={() => setAddDialogOpen(true)}
                    className="p-1 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                    title="添加消息"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-1">
                  {messages.map((item, idx) => {
                    const isEditing = editingId === item.id;
                    const isTime = item.type === "time";
                    const msg = item as ChatMessage;
                    const isMe = msg.sender === "me";

                    /* ── Edit mode ── */
                    if (isEditing) {
                      if (isTime) {
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1.5"
                          >
                            <Input
                              value={item.time}
                              onChange={(e) => updateItem(item.id, { time: e.target.value })}
                              className="flex-1 h-7 text-xs"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="p-1 text-primary hover:text-primary/80"
                              title="完成"
                            >
                              <Check className="size-4" />
                            </button>
                          </div>
                        );
                      }
                      return (
                        <div
                          key={item.id}
                          className="space-y-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <Select
                              value={msg.sender}
                              onValueChange={(v) =>
                                updateItem(item.id, { sender: v as "them" | "me" })
                              }
                            >
                              <SelectTrigger className="h-7 w-20 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="them">对方</SelectItem>
                                <SelectItem value="me">我</SelectItem>
                              </SelectContent>
                            </Select>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="ml-auto p-1 text-primary hover:text-primary/80"
                              title="完成"
                            >
                              <Check className="size-4" />
                            </button>
                          </div>
                          {msg.type === "redpacket" ? (
                            <Input
                              value={msg.greeting || ""}
                              onChange={(e) => updateItem(item.id, { greeting: e.target.value })}
                              placeholder="红包祝福语"
                              className="h-7 text-xs"
                            />
                          ) : (
                            <Textarea
                              value={msg.text}
                              onChange={(e) => updateItem(item.id, { text: e.target.value })}
                              rows={2}
                              className="text-xs"
                            />
                          )}
                        </div>
                      );
                    }

                    /* ── View mode ── */
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-lg border border-gray-100 px-2 py-1.5 hover:bg-gray-50"
                      >
                        <div className="flex-1 min-w-0 text-xs">
                          {isTime ? (
                            <span className="text-gray-500">⏰ {item.time}</span>
                          ) : (
                            <span className={isMe ? "text-green-600" : "text-blue-600"}>
                              {isMe ? "我" : "对方"}
                              {msg.type === "redpacket" ? " 🧧" : ""}：
                              <span className="text-gray-700 ml-1">
                                {msg.type === "redpacket"
                                  ? msg.greeting
                                  : msg.text?.slice(0, 30)}
                              </span>
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingId(item.id)}
                          className="p-1 text-gray-400 hover:text-gray-700"
                          title="编辑"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItemUp(item.id)}
                          disabled={idx === 0}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          title="上移"
                        >
                          <ArrowUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="删除"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Export options */}
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
                <Label className="text-sm text-gray-700 cursor-pointer" htmlFor="include-frame">
                  包含手机壳
                </Label>
                <Switch
                  id="include-frame"
                  checked={includeFrame}
                  onCheckedChange={setIncludeFrame}
                />
              </div>

              {/* Export */}
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="w-full"
                size="lg"
              >
                <Download className="size-4" />
                {exporting ? "生成中…" : "生成截图下载"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
