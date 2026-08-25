import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Copy, Download, RefreshCw, TriangleAlert } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tab = "generate" | "validate";

// ─── 随机工具 ────────────────────────────────────────────────

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** 常见姓氏 */
const SURNAMES = "李王张刘陈杨黄赵吴周徐孙马朱胡郭何林罗高郑梁谢宋唐许韩冯邓曹彭曾肖田董潘袁蔡蒋余杜叶程苏魏吕丁任沈姚卢姜崔钟谭陆汪范金石廖贾夏韦付方白邹孟熊秦邱江尹薛闫段雷侯龙史陶黎贺顾毛郝".split("");
/** 名字常用字 */
const GIVEN_CHARS = "伟芳娜敏静丽强磊军洋勇艳杰娟涛明超霞平刚华建文宇欣怡佳琪晨浩子涵雨萱思远志国春生晓东桂凤英梅鑫磊博文昊天佑安然若曦嘉懿煜城沛玲蔓芬卓雅铭轩瑞霖梓涵俊驰雨泽烨磊晟睿文昊修杰黎昕远航旭尧鸿涛伟祺荣轩越泽浩宇瑾瑜皓轩擎苍志泽睿渊楷瑞".split("");

function genName(): string {
  const len = Math.random() < 0.2 ? 1 : 2;
  return pick(SURNAMES) + Array.from({ length: len }, () => pick(GIVEN_CHARS)).join("");
}

/** 现行手机号段（节选常见段位） */
const PHONE_PREFIXES = [
  "130", "131", "132", "133", "135", "136", "137", "138", "139",
  "147", "150", "151", "152", "155", "156", "157", "158", "159",
  "162", "165", "166", "167", "170", "171", "172", "173", "175",
  "176", "177", "178", "180", "181", "182", "183", "184", "185",
  "186", "187", "188", "189", "191", "193", "195", "196", "197", "198", "199",
];

function genPhone(): string {
  return pick(PHONE_PREFIXES) + String(randInt(0, 99999999)).padStart(8, "0");
}

/** 地区码表：[6 位行政区划码, 完整地区名, 城市短名]（覆盖各省的真实区码） */
const AREAS: [string, string, string][] = [
  ["110101", "北京市东城区", "北京"], ["110105", "北京市朝阳区", "北京"],
  ["120101", "天津市和平区", "天津"], ["130102", "河北省石家庄市长安区", "石家庄"],
  ["140105", "山西省太原市小店区", "太原"], ["150102", "内蒙古自治区呼和浩特市新城区", "呼和浩特"],
  ["210102", "辽宁省沈阳市和平区", "沈阳"], ["220104", "吉林省长春市朝阳区", "长春"],
  ["230102", "黑龙江省哈尔滨市道里区", "哈尔滨"], ["310104", "上海市徐汇区", "上海"],
  ["310115", "上海市浦东新区", "上海"], ["320102", "江苏省南京市玄武区", "南京"],
  ["320505", "江苏省苏州市虎丘区", "苏州"], ["330106", "浙江省杭州市西湖区", "杭州"],
  ["330206", "浙江省宁波市江北区", "宁波"], ["340104", "安徽省合肥市包河区", "合肥"],
  ["350102", "福建省福州市鼓楼区", "福州"], ["350203", "福建省厦门市思明区", "厦门"],
  ["360102", "江西省南昌市东湖区", "南昌"], ["370102", "山东省济南市历下区", "济南"],
  ["370202", "山东省青岛市市南区", "青岛"], ["410102", "河南省郑州市中原区", "郑州"],
  ["420102", "湖北省武汉市江岸区", "武汉"], ["430102", "湖南省长沙市芙蓉区", "长沙"],
  ["440103", "广东省广州市荔湾区", "广州"], ["440304", "广东省深圳市福田区", "深圳"],
  ["450102", "广西壮族自治区南宁市兴宁区", "南宁"], ["460105", "海南省海口市龙华区", "海口"],
  ["500103", "重庆市渝中区", "重庆"], ["510104", "四川省成都市锦江区", "成都"],
  ["520102", "贵州省贵阳市南明区", "贵阳"], ["530102", "云南省昆明市五华区", "昆明"],
  ["540102", "西藏自治区拉萨市城关区", "拉萨"], ["610102", "陕西省西安市新城区", "西安"],
  ["620102", "甘肃省兰州市城关区", "兰州"], ["630102", "青海省西宁市城东区", "西宁"],
  ["640103", "宁夏回族自治区银川市兴庆区", "银川"], ["650102", "新疆维吾尔自治区乌鲁木齐市天山区", "乌鲁木齐"],
];

const ROADS = ["人民路", "中山路", "建设路", "解放大道", "和平街", "文化路", "朝阳街", "幸福大道"];
const ESTATES = ["阳光花园", "翡翠湾", "锦绣家园", "幸福里", "万科城", "保利心语", "绿地世纪城", "龙湖原著", "翠竹苑", "中和府"];

function genAddress(): string {
  const [, area] = pick(AREAS);
  return `${area}${pick(ROADS)}${randInt(1, 999)}号${pick(ESTATES)}${randInt(1, 25)}栋${randInt(101, 2404)}室`;
}

const BIZ_WORDS = ["华宇", "恒信", "中科", "瑞丰", "蓝天", "盛世", "博远", "天成", "宏图", "锐意", "云启", "星河", "致远", "嘉禾", "联创", "安捷", "卓尔", "泰和"];
const BIZ_INDUSTRIES = ["科技", "网络", "信息技术", "电子商务", "贸易", "文化传媒", "建筑工程", "实业", "咨询服务", "智能装备"];

function genCompany(): string {
  return `${pick(AREAS)[2]}${pick(BIZ_WORDS)}${pick(BIZ_INDUSTRIES)}有限公司`;
}

const EMAIL_DOMAINS = ["qq.com", "163.com", "126.com", "gmail.com", "outlook.com", "hotmail.com", "foxmail.com", "sina.com"];
const EMAIL_LETTERS = "abcdefghijklmnopqrstuvwxyz";

function genEmail(): string {
  let s = Array.from({ length: randInt(5, 9) }, () => pick(EMAIL_LETTERS.split(""))).join("");
  if (Math.random() < 0.4) s += randInt(1, 999);
  return `${s}@${pick(EMAIL_DOMAINS)}`;
}

// ─── 身份证生成与校验 ────────────────────────────────────────

/** ISO 7064 MOD 11-2 校验码 */
const ID_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const ID_CHECK_MAP = "10X98765432";

function idChecksum(body17: string): string {
  let sum = 0;
  for (let i = 0; i < 17; i++) sum += parseInt(body17[i], 10) * ID_WEIGHTS[i];
  return ID_CHECK_MAP[sum % 11];
}

const PROVINCE_MAP: Record<string, string> = {
  "11": "北京市", "12": "天津市", "13": "河北省", "14": "山西省", "15": "内蒙古自治区",
  "21": "辽宁省", "22": "吉林省", "23": "黑龙江省", "31": "上海市", "32": "江苏省",
  "33": "浙江省", "34": "安徽省", "35": "福建省", "36": "江西省", "37": "山东省",
  "41": "河南省", "42": "湖北省", "43": "湖南省", "44": "广东省", "45": "广西壮族自治区",
  "46": "海南省", "50": "重庆市", "51": "四川省", "52": "贵州省", "53": "云南省",
  "54": "西藏自治区", "61": "陕西省", "62": "甘肃省", "63": "青海省", "64": "宁夏回族自治区",
  "65": "新疆维吾尔自治区", "71": "台湾省", "81": "香港特别行政区", "82": "澳门特别行政区",
};

interface IdInfo {
  ok: boolean;
  msg: string;
  province?: string;
  birth?: string;
  gender?: string;
}

function validateId(raw: string): IdInfo | null {
  const s = raw.trim();
  if (!s) return null;
  if (!/^\d{17}[\dXx]$/.test(s)) {
    return { ok: false, msg: "格式不正确：应为 18 位，末位可为 X" };
  }
  if (idChecksum(s.slice(0, 17)) !== s[17].toUpperCase()) {
    return { ok: false, msg: "校验码不匹配，不是合法的身份证号" };
  }
  const y = parseInt(s.slice(6, 10), 10);
  const m = parseInt(s.slice(10, 12), 10);
  const d = parseInt(s.slice(12, 14), 10);
  const date = new Date(y, m - 1, d);
  if (
    !(y >= 1900 && y <= new Date().getFullYear()) ||
    date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d
  ) {
    return { ok: false, msg: "出生日期无效" };
  }
  return {
    ok: true,
    msg: "校验通过，为合法格式的身份证号",
    province: PROVINCE_MAP[s.slice(0, 2)] ?? "未知地区",
    birth: `${s.slice(6, 10)}-${s.slice(10, 12)}-${s.slice(12, 14)}`,
    gender: parseInt(s[16], 10) % 2 === 1 ? "男" : "女",
  };
}

function genIdcard(gender: "random" | "male" | "female"): string {
  const [code] = pick(AREAS);
  const year = randInt(1965, 2007);
  const month = randInt(1, 12);
  const day = randInt(1, new Date(year, month, 0).getDate());
  // 顺序码第 17 位奇偶决定性别
  let seq = randInt(1, 998);
  if (gender === "male" && seq % 2 === 0) seq += 1;
  if (gender === "female" && seq % 2 === 1) seq += 1;
  const body =
    `${year}` +
    `${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}` +
    String(seq).padStart(3, "0");
  return code + body + idChecksum(code + body);
}

// ─── 字段定义 ────────────────────────────────────────────────

type FieldKey = "name" | "phone" | "idcard" | "email" | "address" | "company";

interface FieldDef {
  key: FieldKey;
  label: string;
  gen: () => string;
}

const FIELD_DEFS: FieldDef[] = [
  { key: "name", label: "姓名", gen: genName },
  { key: "phone", label: "手机号", gen: genPhone },
  { key: "idcard", label: "身份证号", gen: () => genIdcard("random") },
  { key: "email", label: "邮箱", gen: genEmail },
  { key: "address", label: "地址", gen: genAddress },
  { key: "company", label: "公司名", gen: genCompany },
];

const DEFAULT_SELECTED: FieldKey[] = ["name", "phone", "idcard", "email"];

type Records = Record<string, string>[];

function generateRecords(keys: FieldKey[], count: number): Records {
  const defs = FIELD_DEFS.filter((f) => keys.includes(f.key));
  return Array.from({ length: count }, () =>
    Object.fromEntries(defs.map((f) => [f.key, f.gen()])),
  );
}

type OutFormat = "json" | "csv" | "tsv";

const FORMAT_OPTIONS: { value: OutFormat; label: string; ext: string; mime: string }[] = [
  { value: "json", label: "JSON", ext: "json", mime: "application/json;charset=utf-8" },
  { value: "csv", label: "CSV", ext: "csv", mime: "text/csv;charset=utf-8" },
  { value: "tsv", label: "文本 (TSV)", ext: "txt", mime: "text/plain;charset=utf-8" },
];

function buildOutput(format: OutFormat, records: Records, keys: FieldKey[]): string {
  const labels = FIELD_DEFS.filter((f) => keys.includes(f.key)).map((f) => f.label);
  const cell = (v: string) => (/["\n,]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  if (format === "json") return JSON.stringify(records, null, 2);
  const sep = format === "csv" ? "," : "\t";
  const wrap = format === "csv" ? cell : (v: string) => v.replace(/\t/g, " ");
  return [labels.join(sep), ...records.map((r) => keys.map((k) => wrap(r[k])).join(sep))].join("\n");
}

// ─── 页面 ────────────────────────────────────────────────────

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-1 gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            o.value === value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

export default function MockDataGeneratorPage() {
  const [tab, setTab] = useState<Tab>("generate");

  // 生成器
  const [selected, setSelected] = useState<FieldKey[]>(DEFAULT_SELECTED);
  const [count, setCount] = useState("10");
  const [format, setFormat] = useState<OutFormat>("json");
  const [records, setRecords] = useState<Records>(() => generateRecords(DEFAULT_SELECTED, 10));
  const [copied, setCopied] = useState(false);

  const countN = Math.min(Math.max(parseInt(count, 10) || 0, 1), 500);

  const toggleField = (key: FieldKey) => {
    setSelected((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      // 至少保留一个字段；清空后重选时恢复默认
      return next.length > 0 ? next : prev;
    });
  };

  const regenerate = () => setRecords(generateRecords(selected, countN));

  const activeKeys = FIELD_DEFS.filter((f) => selected.includes(f.key)).map((f) => f.key);
  // 行数有限，直接每次渲染时构建即可
  const output = buildOutput(format, records, activeKeys);

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const opt = FORMAT_OPTIONS.find((f) => f.value === format)!;
    const content = format === "csv" ? "\uFEFF" + output : output;
    const blob = new Blob([content], { type: opt.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock-data.${opt.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 身份证校验
  const [idInput, setIdInput] = useState("");
  const verdict = useMemo(() => validateId(idInput), [idInput]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 页签 */}
      <Segmented
        options={[
          { value: "generate", label: "数据生成" },
          { value: "validate", label: "身份证校验" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "generate" && (
        <>
          {/* 参数 */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <Field label="数据字段（点击切换）">
              <div className="flex flex-wrap gap-2">
                {FIELD_DEFS.map((f) => {
                  const on = selected.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      onClick={() => toggleField(f.key)}
                      className={cn(
                        "rounded-md border px-3 py-1.5 text-sm transition-colors",
                        on
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent",
                      )}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="flex flex-wrap items-end gap-4">
              <Field label="数量（1–500）">
                <Input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="h-10 w-28 font-mono"
                  step="1"
                  min="1"
                  max="500"
                />
              </Field>
              <Button onClick={regenerate} disabled={!selected.length}>
                <RefreshCw className="size-4 mr-1.5" />
                重新生成
              </Button>
              <p className="text-xs text-muted-foreground pb-2.5">
                身份证号为随机生成的合法格式（含正确校验码），仅供开发测试使用
              </p>
            </div>
          </div>

          {/* 结果预览 */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-medium">预览 · 共 {records.length} 条</span>
              <div className="flex items-center gap-2">
                <Select value={format} onValueChange={(v) => setFormat(v as OutFormat)}>
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={copyOutput}>
                  {copied ? (
                    <Check className="size-3.5 mr-1.5 text-green-500" />
                  ) : (
                    <Copy className="size-3.5 mr-1.5" />
                  )}
                  复制
                </Button>
                <Button variant="outline" size="sm" onClick={download}>
                  <Download className="size-3.5 mr-1.5" />
                  下载
                </Button>
              </div>
            </div>
            <div className="max-h-[480px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-[0_1px_0_0_hsl(var(--border))]">
                  <TableRow>
                    {activeKeys.map((k) => (
                      <TableHead key={k} className="whitespace-nowrap">
                        {FIELD_DEFS.find((f) => f.key === k)!.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r, i) => (
                    <TableRow key={i}>
                      {activeKeys.map((k) => (
                        <TableCell
                          key={k}
                          className={cn(
                            "whitespace-nowrap tabular-nums",
                            k !== "name" && "font-mono text-xs",
                          )}
                        >
                          {r[k]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      {tab === "validate" && (
        <>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <Field label="身份证号码">
              <Input
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                placeholder="输入 18 位身份证号，实时校验"
                className="h-10 text-lg font-mono"
                maxLength={18}
              />
            </Field>
            <p className="text-xs text-muted-foreground">
              按 GB 11643-1999 校验码规则（ISO 7064 MOD 11-2）验证，并解析签发地区、出生日期与性别。仅作格式校验，不联网、不涉及实名信息。
            </p>
          </div>

          {verdict &&
            (verdict.ok ? (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
                  {[
                    {
                      label: "校验结果",
                      value: "合法",
                      hint: verdict.msg,
                    },
                    { label: "签发地区", value: verdict.province!, hint: `省级代码 ${idInput.trim().slice(0, 2)}` },
                    { label: "出生日期", value: verdict.birth!, hint: undefined },
                    { label: "性别", value: verdict.gender!, hint: `顺序码 ${idInput.trim().slice(14, 17)}` },
                  ].map((t) => (
                    <div key={t.label} className="bg-card px-4 py-3.5">
                      <div className="text-xs text-muted-foreground">{t.label}</div>
                      <div className="mt-1 text-lg font-semibold truncate">{t.value}</div>
                      {t.hint && <div className="mt-0.5 text-xs text-muted-foreground">{t.hint}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-red-500/50 bg-red-500/10 px-5 py-4 flex gap-3 items-start">
                <TriangleAlert className="size-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-600 dark:text-red-400">校验不通过</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{verdict.msg}</p>
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
