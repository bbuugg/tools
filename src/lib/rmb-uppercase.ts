// 人民币小写金额 → 中文大写
// 规则依据《正确填写票据和结算凭证的基本规定》（银发〔1997〕393 号附件）：
// 到元为止写「整」；到角为止可不写；连续多个 0 只写一个「零」；
// 元位为 0 而角位非 0 时，元后写一个「零」。

const DIGITS = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
const IN_GROUP = ["", "拾", "佰", "仟"];
const GROUPS = ["", "万", "亿", "兆"];

/** 四位一组内的转换，自动吞并组内多余的零 */
function sectionToChinese(section: string): string {
  let s = "";
  let pendingZero = false;
  for (let i = 0; i < section.length; i++) {
    const d = +section[i];
    if (d === 0) {
      pendingZero = s !== "";
    } else {
      if (pendingZero) {
        s += "零";
        pendingZero = false;
      }
      s += DIGITS[d] + IN_GROUP[section.length - 1 - i];
    }
  }
  return s;
}

/** 整数部分转大写（入参为纯数字字符串，无前导零） */
function integerToChinese(intStr: string): string {
  if (/^0+$/.test(intStr)) return "";
  const groups: string[] = [];
  for (let end = intStr.length; end > 0; end -= 4) {
    groups.unshift(intStr.slice(Math.max(0, end - 4), end));
  }
  let out = "";
  let pendingZero = false;
  groups.forEach((g, gi) => {
    const sec = sectionToChinese(g);
    if (!sec) {
      pendingZero = out !== "";
      return;
    }
    if (out && (pendingZero || Number(g) < 1000)) out += "零";
    pendingZero = false;
    out += sec + GROUPS[groups.length - 1 - gi];
  });
  return out;
}

export interface AmountResult {
  /** 完整大写结果，如 壹仟贰佰叁拾肆元伍角陆分 */
  text: string;
  /** 千分位格式化的小写金额，如 1,234.56 */
  formatted: string;
  /** 是否发生了四舍五入（输入超过两位小数） */
  rounded: boolean;
  negative: boolean;
}

/** 将任意金额字符串转为大写；无法解析或超出范围返回 null */
export function convertAmount(raw: string): AmountResult | null {
  const cleaned = raw.replace(/[,\s￥¥]/g, "").replace(/^\+/, "");
  const m = /^(-)?(\d+(?:\.\d+)?|\.\d+)$/.exec(cleaned);
  if (!m) return null;

  const negative = !!m[1];
  const [intRaw, fracRaw = ""] = cleaned.replace(/^-/, "").split(".");
  const intStr = intRaw === "" ? "0" : intRaw.replace(/^0+(?=\d)/, "");
  if (intStr.length > 16) return null; // 超出兆级

  const [rInt, rFrac, rounded] = roundToIntParts(intStr, fracRaw);
  if (rInt.length > 16) return null; // 进位后超出范围
  return finish(negative, rInt, rFrac, rounded);

  function roundToIntParts(intStr: string, fracRaw: string): [string, string, boolean] {
    // 小数四舍五入保留两位
    const fracPadded = (fracRaw + "00").slice(0, 2);
    const rest = fracRaw.slice(2);
    if (rest.length === 0) return [intStr, fracPadded, false];

    const carry = Number(`0.${rest}`) >= 0.5 ? 1 : 0;
    const cents = parseInt(fracPadded, 10) + carry;
    if (cents < 100) return [intStr, cents.toString().padStart(2, "0"), true];
    // 进位到整数部分（用 BigInt 避免精度问题）
    return [(BigInt(intStr) + 1n).toString(), "00", true];
  }

  function finish(neg: boolean, intStr: string, frac: string, rounded: boolean): AmountResult | null {
    const jiao = +frac[0];
    const fen = +frac[1];
    const intText = integerToChinese(intStr);
    let fracText = "";
    if (jiao > 0) {
      fracText = DIGITS[jiao] + "角";
      if (fen > 0) fracText += DIGITS[fen] + "分";
    } else if (fen > 0) {
      fracText = "零" + DIGITS[fen] + "分";
    }

    let text: string;
    if (!intText && !fracText) {
      text = "零元整";
    } else if (!intText) {
      text = fracText; // 不足一元，从角开始
    } else {
      text = intText + "元";
      // 元位为 0 且角位非 0 时补一个「零」（央行示例：1680.32 → …捌拾元零叁角贰分）
      if (jiao > 0 && /[0]$/.test(intStr)) text += "零";
      text += fracText || "整";
    }
    if (neg) text = "负" + text;

    return {
      text,
      rounded,
      negative: neg,
      formatted:
        (neg ? "-" : "") +
        intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        "." +
        frac,
    };
  }
}
