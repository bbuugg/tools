/**
 * 条码格式定义、输入校验与校验位计算（生成侧）。
 *
 * bcid 取自 bwip-js / BWIPP 的符号 ID，渲染时直接透传。
 */

/** 分组，用于下拉框分组展示 */
export type BarcodeGroup = "零售与商品" | "物流与工业" | "通用一维码" | "二维与堆叠码";

export interface BarcodeFormatDef {
  /** bwip-js 符号 ID */
  bcid: string;
  /** 展示名 */
  label: string;
  group: BarcodeGroup;
  /** 输入约束说明 */
  hint: string;
  /** 示例内容 */
  sample: string;
  /** 返回错误文案，null 表示通过 */
  validate?: (text: string) => string | null;
  /** 由主体（不含校验位）计算完整码，不支持返回 null */
  checkDigit?: (body: string) => string | null;
  /** 校验位说明 */
  checkLabel?: string;
  /**
   * 校验位长度规则。给定主体长度数组时，可精确区分「待补全」与「已含校验位」。
   * 不填表示变长（Code 11 / MSI），此时优先按已含校验位验证。
   */
  checkSizes?: { body: readonly number[]; len: readonly number[] };
}

// ─── 校验位算法 ──────────────────────────────────────────────

/** GTIN / EAN 系：从右往左交替权重，weights[0] 作用于最右一位 */
function gtinCheckDigit(body: string, weights: readonly number[]): string | null {
  if (!/^\d+$/.test(body)) return null;
  let sum = 0;
  const digits = body.split("").reverse();
  for (let i = 0; i < digits.length; i++) {
    sum += Number(digits[i]) * weights[i % weights.length];
  }
  return String((10 - (sum % 10)) % 10);
}

const W_13 = [3, 1] as const; // EAN-13 / ISBN-13 / UPC-A：从右往左 1,3 交替
const W_8 = [3, 1] as const;

/** EAN-13 / ISBN-13 校验位（12 位主体） */
const ean13Check = (body: string) => (body.length === 12 ? gtinCheckDigit(body, W_13) : null);

/** EAN-8 校验位（7 位主体） */
const ean8Check = (body: string) => (body.length === 7 ? gtinCheckDigit(body, W_8) : null);

/** UPC-A 校验位（11 位主体） */
const upcaCheck = (body: string) => (body.length === 11 ? gtinCheckDigit(body, W_8) : null);

/** ITF-14 校验位（13 位主体） */
const itf14Check = (body: string) => (body.length === 13 ? gtinCheckDigit(body, W_8) : null);

/** ISBN-10 校验位（9 位主体，结果可能为 X） */
function isbn10Check(body: string): string | null {
  if (!/^\d{9}$/.test(body)) return null;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(body[i]) * (10 - i);
  const rem = (11 - (sum % 11)) % 11;
  return rem === 10 ? "X" : String(rem);
}

/** ISBN 校验位：9 位走 ISBN-10，12 位走 ISBN-13 */
function isbnCheck(body: string): string | null {
  if (/^\d{9}$/.test(body)) {
    const c = isbn10Check(body);
    return c === null ? null : body + c;
  }
  return ean13Check(body);
}

/** Code 11：C + K 双校验位，C 权重 2..7、K 权重 3..8 循环；C 为 10 时规范写法是单个 "-" */
function code11Check(body: string): string | null {
  if (!/^[0-9-]+$/.test(body)) return null;
  const val = (c: string) => (c === "-" ? 10 : Number(c));
  /** 从最右字符开始按 startWeight..maxWeight 循环加权 */
  const weighted = (s: string, startWeight: number, maxWeight: number, initial: number) => {
    let sum = initial;
    let w = startWeight;
    for (let i = s.length - 1; i >= 0; i--) {
      sum += val(s[i]) * w;
      w = w === maxWeight ? 2 : w + 1;
    }
    return sum % 11;
  };
  const c = weighted(body, 2, 7, 0);
  if (c === 10) return body + "-";
  const k = weighted(body, 3, 8, c);
  return k === 10 ? null : body + String(c) + String(k);
}

/** MSI Plessey：Mod 10（Luhn） */
function msiCheck(body: string): string | null {
  if (!/^\d+$/.test(body)) return null;
  const digits = body.split("").reverse();
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[i]);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return String((10 - (sum % 10)) % 10);
}

// ─── 通用校验器 ──────────────────────────────────────────────

/** 纯数字，长度区间 [min, max] */
const digits =
  (min: number, max: number) =>
  (text: string): string | null =>
    new RegExp(`^\\d{${min},${max}}$`).test(text)
      ? null
      : `需要 ${min === max ? max : `${min}-${max}`} 位数字`;

/** 最大长度 */
const maxLen =
  (max: number) =>
  (text: string): string | null =>
    text.length > max ? `内容过长（上限 ${max} 字符）` : null;

/** 字符集 + 可选长度上限 */
const charset =
  (re: RegExp, tip: string, max?: number) =>
  (text: string): string | null => {
    if (!re.test(text)) return tip;
    if (max && text.length > max) return `内容过长（上限 ${max} 字符）`;
    return null;
  };

// ─── 格式表 ──────────────────────────────────────────────────

/** EAN/UPC 允许 2 位或 5 位附加码，以空格分隔 */
const ADDON = "(?:[ ]\\d{2}|[ ]\\d{5})?$";

export const BARCODE_FORMATS: readonly BarcodeFormatDef[] = [
  // 零售与商品
  {
    bcid: "ean13",
    label: "EAN-13",
    group: "零售与商品",
    hint: "12-13 位数字，12 位时自动补校验位；可加空格 + 2/5 位附加码",
    sample: "690123456789",
    validate: (t) => (new RegExp(`^\\d{12,13}${ADDON}`).test(t) ? null : "需要 12-13 位数字"),
    checkDigit: ean13Check,
    checkLabel: "第 13 位",
    checkSizes: { body: [12], len: [1] },
  },
  {
    bcid: "ean8",
    label: "EAN-8",
    group: "零售与商品",
    hint: "7-8 位数字，7 位时自动补校验位",
    sample: "1234567",
    validate: (t) => (new RegExp(`^\\d{7,8}${ADDON}`).test(t) ? null : "需要 7-8 位数字"),
    checkDigit: ean8Check,
    checkLabel: "第 8 位",
    checkSizes: { body: [7], len: [1] },
  },
  {
    bcid: "upca",
    label: "UPC-A",
    group: "零售与商品",
    hint: "11-12 位数字，11 位时自动补校验位",
    sample: "01234567890",
    validate: (t) => (new RegExp(`^\\d{11,12}${ADDON}`).test(t) ? null : "需要 11-12 位数字"),
    checkDigit: upcaCheck,
    checkLabel: "第 12 位",
    checkSizes: { body: [11], len: [1] },
  },
  {
    bcid: "upce",
    label: "UPC-E",
    group: "零售与商品",
    hint: "6-8 位数字（UPC-A 的压缩形式）",
    sample: "0123456",
    validate: digits(6, 8),
  },
  {
    bcid: "isbn",
    label: "ISBN",
    group: "零售与商品",
    hint: "9-10 位（ISBN-10）或 12-13 位（ISBN-13），连字符会被忽略",
    sample: "9780201379",
    validate: (t) => {
      const s = t.replace(/-/g, "");
      return /^\d{9}[\dX]$|^\d{12}[\dX]$|^\d{9}$|^\d{12}$/.test(s)
        ? null
        : "需要 9-10 位或 12-13 位数字";
    },
    checkDigit: isbnCheck,
    checkLabel: "末尾校验位",
    checkSizes: { body: [9, 12], len: [1, 1] },
  },
  {
    bcid: "databaromni",
    label: "GS1 DataBar",
    group: "零售与商品",
    hint: "13 位数字（GTIN-13），常用于生鲜散装商品",
    sample: "0101234567890",
    validate: digits(13, 13),
  },

  // 物流与工业
  {
    bcid: "itf14",
    label: "ITF-14",
    group: "物流与工业",
    hint: "13-14 位数字，13 位时自动补校验位；外箱码",
    sample: "1061414100041",
    validate: digits(13, 14),
    checkDigit: itf14Check,
    checkLabel: "第 14 位",
    checkSizes: { body: [13], len: [1] },
  },
  {
    bcid: "interleaved2of5",
    label: "ITF（交叉二五）",
    group: "物流与工业",
    hint: "仅数字，长度必须为偶数；位数不足请补前导 0",
    sample: "12345678",
    validate: (t) => {
      if (!/^\d+$/.test(t)) return "仅支持数字";
      if (t.length % 2 !== 0) return `需要偶数位，当前 ${t.length} 位`;
      return null;
    },
  },
  {
    bcid: "code2of5",
    label: "Industrial 2 of 5",
    group: "物流与工业",
    hint: "仅数字，非交叉二五码",
    sample: "1234567",
    validate: (t) => (/^\d+$/.test(t) ? null : "仅支持数字"),
  },
  {
    bcid: "pharmacode",
    label: "Pharmacode",
    group: "物流与工业",
    hint: "3 到 131070 之间的整数，药品包装用",
    sample: "12345",
    validate: (t) => {
      const n = Number(t);
      return Number.isInteger(n) && n >= 3 && n <= 131070 ? null : "需要 3-131070 的整数";
    },
  },
  {
    bcid: "code32",
    label: "Code 32",
    group: "物流与工业",
    hint: "8-9 位数字，意大利药品码（Code 39 派生）",
    sample: "12345678",
    validate: digits(8, 9),
  },

  // 通用一维码
  {
    bcid: "code128",
    label: "Code 128",
    group: "通用一维码",
    hint: "ASCII 32-126，自动切换 A/B/C 子集，最通用的一维码",
    sample: "CODE128-2026",
    validate: charset(/^[\x20-\x7E]+$/, "仅支持 ASCII 可打印字符", 80),
  },
  {
    bcid: "gs1_128",
    label: "GS1-128",
    group: "通用一维码",
    hint: "用 ^FNC1 表示 FNC1，例如应用标识符 (01) 写作 ^FNC101",
    sample: "^FNC10112345678901234",
    validate: charset(/^[\x20-\x7E]+$/, "仅支持 ASCII 可打印字符", 48),
  },
  {
    bcid: "code39",
    label: "Code 39",
    group: "通用一维码",
    hint: "数字、大写字母与 - . 空格 $ / + %",
    sample: "ABC-123",
    validate: charset(/^[0-9A-Z\-. $/+%]+$/, "仅支持数字、大写字母与 - . 空格 $ / + %", 40),
  },
  {
    bcid: "code93",
    label: "Code 93",
    group: "通用一维码",
    hint: "Code 39 的增强版，密度更高，支持完整 ASCII",
    sample: "CODE93-01",
    validate: charset(/^[\x20-\x7E]+$/, "仅支持 ASCII 可打印字符", 60),
  },
  {
    bcid: "code11",
    label: "Code 11",
    group: "通用一维码",
    hint: "数字与短横线，用于电信设备标签",
    sample: "123-45",
    validate: charset(/^[0-9-]+$/, "仅支持数字与短横线", 60),
    checkDigit: code11Check,
    checkLabel: "末尾 1-2 位",
  },
  {
    bcid: "rationalizedCodabar",
    label: "Codabar",
    group: "通用一维码",
    hint: "以 A/B/C/D 开头与结尾，中间为数字与 - $ : / . +",
    sample: "A1234567B",
    validate: charset(
      /^[A-Da-d][0-9\-:$/.+]*[A-Da-d]$/,
      "需以 A/B/C/D 开头与结尾，中间为数字与 - $ : / . +",
      60,
    ),
  },
  {
    bcid: "msi",
    label: "MSI Plessey",
    group: "通用一维码",
    hint: "仅数字，仓储货架标签常用",
    sample: "1234567",
    validate: charset(/^\d+$/, "仅支持数字", 30),
    checkDigit: msiCheck,
    checkLabel: "末尾校验位",
  },

  // 二维与堆叠码
  {
    bcid: "qrcode",
    label: "QR Code",
    group: "二维与堆叠码",
    hint: "任意文本，支持中文与 4 级纠错",
    sample: "https://tools.codeemo.cn",
    validate: maxLen(2000),
  },
  {
    bcid: "datamatrix",
    label: "Data Matrix",
    group: "二维与堆叠码",
    hint: "任意文本，密度高，适合小零件打标",
    sample: "DM-2026-001",
    validate: maxLen(1200),
  },
  {
    bcid: "pdf417",
    label: "PDF417",
    group: "二维与堆叠码",
    hint: "堆叠式条码，可存数百字节，用于证件与票据",
    sample: "PDF417 堆叠码示例",
    validate: maxLen(1000),
  },
  {
    bcid: "azteccode",
    label: "Aztec Code",
    group: "二维与堆叠码",
    hint: "任意文本，无需静区，常用于交通票券",
    sample: "AZTEC-2026",
    validate: maxLen(1200),
  },
];

/** 按 bcid 取格式定义 */
export function getFormat(bcid: string): BarcodeFormatDef {
  return BARCODE_FORMATS.find((f) => f.bcid === bcid) ?? BARCODE_FORMATS[0];
}

/** 分组顺序，用于下拉框 */
export const BARCODE_GROUPS: readonly BarcodeGroup[] = [
  "零售与商品",
  "物流与工业",
  "通用一维码",
  "二维与堆叠码",
];

// ─── 校验位展示信息 ──────────────────────────────────────────

export interface CheckDigitInfo {
  /** 含校验位的完整码 */
  full: string;
  /** 校验位本身 */
  digit: string;
  /** 输入是否已经是正确的完整码 */
  ok: boolean;
  /** 提示文案 */
  label: string;
}

/**
 * 计算校验位信息。
 * - 输入为「主体」时给出补全后的完整码（ok=false）
 * - 输入已含校验位时给出应有的完整码并标记是否正确
 * - 该格式不支持校验位时返回 null
 */
export function checkDigitInfo(def: BarcodeFormatDef, raw: string): CheckDigitInfo | null {
  if (!def.checkDigit) return null;
  const label = def.checkLabel ?? "校验位";
  const text = (def.bcid === "isbn" ? raw.replace(/-/g, "") : raw).trim();
  if (!text) return null;

  const sizes = def.checkSizes;
  if (sizes) {
    // 输入长度等于主体长度 → 待补全
    if (sizes.body.includes(text.length)) {
      const full = def.checkDigit(text);
      return full ? { full, digit: full.slice(text.length), ok: false, label } : null;
    }
    // 输入长度等于完整长度 → 校验
    for (let i = 0; i < sizes.body.length; i++) {
      if (text.length === sizes.body[i] + sizes.len[i]) {
        const full = def.checkDigit(text.slice(0, sizes.body[i]));
        return full ? { full, digit: full.slice(sizes.body[i]), ok: text === full, label } : null;
      }
    }
    return null;
  }

  // 变长格式（Code 11 / MSI）：先按已含校验位验证，再按补全处理
  for (const len of [1, 2]) {
    const body = text.slice(0, -len);
    if (!body) continue;
    const full = def.checkDigit(body);
    if (full === text) return { full, digit: text.slice(-len), ok: true, label };
  }
  const completed = def.checkDigit(text);
  if (completed) return { full: completed, digit: completed.slice(text.length), ok: false, label };
  return null;
}

/** 校验内容是否合法，返回错误文案 */
export function validateText(def: BarcodeFormatDef, text: string): string | null {
  if (!text.trim()) return "请输入内容";
  return def.validate?.(text.trim()) ?? null;
}
