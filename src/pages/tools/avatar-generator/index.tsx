import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Copy,
  Download,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type AvatarConfig,
  createSvgBlob,
  generateConfig,
  getTraits,
  randomSeed,
  renderAvatar,
} from "./avatarEngine";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AvatarGeneratorPage() {
  const [seed, setSeed] = useState("");
  const [inputSeed, setInputSeed] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  const [pngSize, setPngSize] = useState(512);
  const [toast, setToast] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const config: AvatarConfig = useMemo(
    () => generateConfig(seed || randomSeed()),
    [seed],
  );
  const svg = useMemo(() => renderAvatar(config), [config]);
  const traits = useMemo(() => getTraits(config), [config]);

  // 初始化随机 seed
  useEffect(() => {
    const initial = randomSeed();
    setSeed(initial);
    setInputSeed(initial);
  }, []);

  // 加载历史记录
  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("avatarGeneratorHistory") || "[]",
      );
      if (Array.isArray(stored)) setHistory(stored);
    } catch {
      // ignore
    }
  }, []);

  // 保存历史记录
  useEffect(() => {
    if (!seed) return;
    try {
      const stored = JSON.parse(
        localStorage.getItem("avatarGeneratorHistory") || "[]",
      ) as string[];
      const updated = [seed, ...stored.filter((s) => s !== seed)].slice(0, 12);
      localStorage.setItem(
        "avatarGeneratorHistory",
        JSON.stringify(updated),
      );
      setHistory(updated);
    } catch {
      // ignore
    }
  }, [seed]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  }, []);

  const handleGenerate = useCallback(
    (newSeed: string) => {
      const s = String(newSeed || "").trim().slice(0, 80);
      if (!s) {
        showToast("请输入一个 Seed");
        return;
      }
      setIsChanging(true);
      setTimeout(() => {
        setSeed(s);
        setInputSeed(s);
        setIsChanging(false);
      }, 160);
    },
    [showToast],
  );

  const handleRandom = useCallback(() => {
    handleGenerate(randomSeed());
  }, [handleGenerate]);

  const handleCopySeed = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(seed);
      showToast("Seed 已复制");
    } catch {
      showToast("复制失败");
    }
  }, [seed, showToast]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      showToast("分享链接已复制");
    } catch {
      showToast("复制失败");
    }
  }, [showToast]);

  const handleDownloadSvg = useCallback(() => {
    downloadBlob(createSvgBlob(svg), `avatar-${seed}.svg`);
    showToast("SVG 已下载");
  }, [svg, seed, showToast]);

  const handleDownloadPng = useCallback(() => {
    const blob = createSvgBlob(svg);
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pngSize;
      canvas.height = pngSize;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, pngSize, pngSize);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) {
          downloadBlob(pngBlob, `avatar-${seed}.png`);
          showToast(`${pngSize} × ${pngSize} PNG 已下载`);
        }
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.onerror = () => {
      showToast("PNG 生成失败");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [svg, seed, pngSize, showToast]);

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 标题区 */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground tracking-widest uppercase">
            <span className="h-px w-5 bg-current" />
            Random Portrait Generator
            <span className="h-px w-5 bg-current" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            随机头像生成器
          </h1>
          <p className="text-sm text-muted-foreground">
            输入任意 Seed，生成独一无二的手绘风格 SVG 肖像。同一个 Seed
            永远生成同一张脸。
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* 左侧：头像展示 */}
          <div className="space-y-4">
            {/* 头像画框 */}
            <div className="relative bg-muted/50 border border-border rounded-xl p-4 shadow-lg">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <div
                  className={`w-full h-full transition-all duration-200 ${
                    isChanging
                      ? "opacity-15 scale-95"
                      : "opacity-100 scale-100"
                  }`}
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              </div>
              {/* 编号 */}
              <div className="absolute bottom-5 right-6 text-[10px] tracking-wider bg-background/80 px-2 py-0.5 rounded">
                NO. {config.portraitNo}
              </div>
              {/* 角标 */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-red-600 rounded-tl-sm" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-red-600 rounded-tr-sm" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-red-600 rounded-bl-sm" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-red-600 rounded-br-sm" />
            </div>

            {/* 身份信息 */}
            <div className="text-center space-y-1">
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase">
                SEED · V{config.version}
              </div>
              <div className="text-xl font-bold break-all">#{seed}</div>
              <div className="text-xs text-red-600 font-bold tracking-wide">
                {config.archetype[1].toUpperCase()} · {config.archetype[0]}
              </div>
            </div>

            {/* 随机按钮 */}
            <Button
              className="w-full h-12 text-base relative"
              onClick={handleRandom}
            >
              <Sparkles className="size-4 mr-2" />
              随机一个人
            </Button>

            {/* 人物档案 */}
            <div className="border-t border-b border-border py-4 space-y-2">
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase">
                人物档案 / PROFILE
              </div>
              <div className="text-base font-bold">
                {config.archetype[0]}
              </div>
              <p className="text-sm text-muted-foreground">
                {traits.length > 0
                  ? traits.join(" · ")
                  : "朴素 · 未加修饰"}
              </p>
            </div>
          </div>

          {/* 右侧：控制面板 */}
          <div className="space-y-4">
            {/* Seed 输入 */}
            <div className="space-y-2">
              <Label className="text-xs tracking-wider text-muted-foreground">
                输入你的 Seed
              </Label>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerate(inputSeed);
                }}
                className="flex border border-border rounded-lg overflow-hidden bg-card"
              >
                <span className="flex items-center px-3 text-red-600 font-bold">
                  #
                </span>
                <Input
                  value={inputSeed}
                  onChange={(e) => setInputSeed(e.target.value)}
                  placeholder="数字、英文或任意文字"
                  autoComplete="off"
                  className="border-0 shadow-none focus-visible:ring-0"
                />
                <button
                  type="submit"
                  className="px-4 text-xs font-medium border-l border-border hover:bg-accent transition-colors whitespace-nowrap"
                >
                  生成 →
                </button>
              </form>
            </div>

            {/* 操作按钮 */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySeed}
                className="h-10"
              >
                <Copy className="size-3.5 mr-1" /> 复制 Seed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="h-10"
              >
                <Copy className="size-3.5 mr-1" /> 复制链接
              </Button>
            </div>

            {/* 下载区域 */}
            <div className="space-y-2">
              <Label className="text-xs tracking-wider text-muted-foreground">
                下载头像
              </Label>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadPng}
                  className="flex-1 h-10 rounded-none"
                >
                  <Download className="size-3.5 mr-1" /> PNG
                </Button>
                <Select
                  value={String(pngSize)}
                  onValueChange={(v) => setPngSize(Number(v))}
                >
                  <SelectTrigger className="w-[70px] h-10 border-0 shadow-none rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512</SelectItem>
                    <SelectItem value="1024">1024</SelectItem>
                    <SelectItem value="2048">2048</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSvg}
                className="w-full h-10"
              >
                <Download className="size-3.5 mr-1" /> 下载 SVG
              </Button>
            </div>

            {/* 历史记录 */}
            {history.length > 1 && (
              <div className="space-y-2">
                <Label className="text-xs tracking-wider text-muted-foreground">
                  最近生成
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {history.slice(1, 8).map((h) => (
                    <button
                      key={h}
                      onClick={() => handleGenerate(h)}
                      title={`生成 ${h}`}
                      className="w-8 h-8 rounded-full border border-border text-[9px] flex items-center justify-center hover:bg-accent transition-colors"
                    >
                      {h.slice(0, 2)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 特征详情 */}
            <div className="space-y-2">
              <Label className="text-xs tracking-wider text-muted-foreground">
                特征详情
              </Label>
              <div className="border border-border rounded-lg p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">原型</span>
                  <span className="font-medium">{config.archetype[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">脸型</span>
                  <span className="font-medium">
                    {["椭圆脸", "长脸", "方脸", "瓜子脸"][config.faceStyle % 4]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">眼睛</span>
                  <span className="font-medium">
                    {["圆眼", "竖椭圆眼", "豆豆眼", "细长眼", "笑眼", "疲惫眼", "上挑眼", "下垂眼", "惊讶大眼", "左眨眼", "右眨眼", "灵动眼"][config.eyes % 12]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">发型</span>
                  <span className="font-medium">
                    {config.hair === 0 ? "光头" : ["短碎发", "中分", "侧分", "锅盖头", "卷发", "背头", "莫西干", "凌乱短发", "齐肩波波头", "高马尾", "双马尾", "丸子头", "双辫子", "双丸子头"][config.hair % 14]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">帽子</span>
                  <span className="font-medium">
                    {["无帽", "礼帽", "圆顶礼帽", "高礼帽", "牛仔帽", "贝雷帽", "报童帽", "鸭舌帽", "渔夫帽", "草帽", "毛线帽", "水手帽", "海盗帽", "厨师帽", "侦探帽", "宽檐帽", "头巾", "皇冠", "巫师帽", "睡帽", "探险帽", "护目帽", "飞行帽", "软呢帽", "钟形帽", "军帽", "船帽", "礼帽·窄檐", "画家帽", "旧毡帽", "无帽"][config.hat % 31]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">眼镜</span>
                  <span className="font-medium">
                    {["无眼镜", "圆框眼镜", "方框眼镜", "半框眼镜", "金丝眼镜", "老花镜", "墨镜", "猫眼眼镜", "护目镜", "单片眼镜", "复古太阳镜", "大框眼镜", "椭圆眼镜", "细框眼镜", "茶色眼镜", "夹鼻眼镜", "飞行员镜", "六角眼镜", "读书镜", "彩色镜", "无眼镜"][config.glasses % 21]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">胡子</span>
                  <span className="font-medium">
                    {["无胡子", "胡茬", "八字胡", "铅笔胡", "卷翘胡", "山羊胡", "络腮胡", "大胡子", "长胡子", "船锚胡", "法式胡", "侧鬓胡", "尖胡子", "老爷爷胡", "短全胡", "马蹄胡", "海象胡", "灵魂补丁", "帝王胡", "稀疏胡", "无胡子"][config.beard % 21]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">服装</span>
                  <span className="font-medium">
                    {["T 恤", "衬衫", "西装", "大衣", "风衣", "毛衣", "高领毛衣", "水手服", "牛仔夹克", "工作服", "探险服", "复古礼服", "厨师服", "艺术家围裙", "皮夹克", "背带裤", "马甲", "军装", "斗篷", "针织衫", "实验服", "飞行夹克"][config.clothes % 22]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 说明 */}
        <div className="text-center text-xs text-muted-foreground space-y-1 pt-2">
          <p>
            <RefreshCw className="inline size-3 mr-1" />
            纯前端生成 · 数据不会离开你的浏览器 · 同一 Seed 永远生成同一头像
          </p>
        </div>
      </div>

      {/* Toast 提示 */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-5 py-3 text-sm rounded shadow-lg">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
