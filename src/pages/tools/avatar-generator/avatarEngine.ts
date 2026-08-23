/**
 * 随机头像生成器 — 核心逻辑
 * 基于原版 seed-avatar 项目源码 (github.com/ns2250225/seed-avatar)
 * 确定性 seed 驱动的程序化 SVG 肖像生成
 */

export const VERSION = 1;

// ─── 数据 ───

const palettes: string[][] = [
  ['#eadfc6', '#2f2923', '#bf7658', '#65705c'], ['#e5d9c5', '#26384b', '#bd8d62', '#6c7c86'],
  ['#ede2ca', '#3f493b', '#b1785d', '#777a5d'], ['#e8d7cb', '#45313a', '#b36d70', '#6d718c'],
  ['#ded8c7', '#283a3b', '#b68161', '#8a775a'], ['#e7d9ba', '#3e3428', '#ad624c', '#67756b'],
  ['#dfd5c4', '#293642', '#a8755d', '#737d83'], ['#f0dfca', '#453b34', '#c2765c', '#7c6d55'],
  ['#e1d7bd', '#333126', '#9f704d', '#697350'], ['#e8d9d1', '#432e31', '#b65e59', '#70788b'],
  ['#ddd8ce', '#30333a', '#aa755b', '#69717a'], ['#e9dfcf', '#3e302c', '#b97f64', '#6f6756'],
  ['#dcd2b9', '#253932', '#aa6c50', '#6f785d'], ['#e5d6bd', '#3c2f37', '#a66e64', '#626a7b'],
  ['#eee1cf', '#322e2d', '#bb8061', '#75806c'], ['#e0d4c0', '#354047', '#ad755c', '#7d725e'],
];

const skinTones = ['#f5d6b8', '#efc9a5', '#e5b991', '#dca77b', '#cf9368', '#bd7e55', '#a96848', '#92543b', '#7b4533', '#66382c', '#f0c9b1', '#d6a17c', '#b9795a', '#8d5945'];
const hairColors = ['#292725', '#3d3029', '#593c2c', '#805538', '#b87b46', '#d2a961', '#8d4b37', '#66615d', '#bdb7aa', '#ded9cb', '#3d4c57', '#574357', '#96696d'];

const archetypes: [string, string][] = [
  ['侦探', 'Detective'], ['牛仔', 'Cowboy'], ['绅士', 'Gentleman'], ['艺术家', 'Artist'], ['教授', 'Professor'],
  ['老船长', 'Captain'], ['水手', 'Sailor'], ['探险家', 'Explorer'], ['嬉皮士', 'Free spirit'], ['摇滚青年', 'Rocker'],
  ['音乐家', 'Musician'], ['科学家', 'Scientist'], ['魔术师', 'Magician'], ['记者', 'Reporter'], ['园丁', 'Gardener'],
  ['厨师', 'Chef'], ['诗人', 'Poet'], ['旅行家', 'Traveller'], ['复古名伶', 'Vintage star'], ['神秘人', 'Mystery'],
  ['钟表匠', 'Watchmaker'], ['小说家', 'Novelist'], ['飞行员', 'Aviator'], ['制图师', 'Cartographer'],
];

const traitNames = {
  hats: ['无帽', '礼帽', '圆顶礼帽', '高礼帽', '牛仔帽', '贝雷帽', '报童帽', '鸭舌帽', '渔夫帽', '草帽', '毛线帽', '水手帽', '海盗帽', '厨师帽', '侦探帽', '宽檐帽', '头巾', '皇冠', '巫师帽', '睡帽', '探险帽', '护目帽', '飞行帽', '软呢帽', '钟形帽', '军帽', '船帽', '礼帽·窄檐', '画家帽', '旧毡帽', '无帽'],
  glasses: ['无眼镜', '圆框眼镜', '方框眼镜', '半框眼镜', '金丝眼镜', '老花镜', '墨镜', '猫眼眼镜', '护目镜', '单片眼镜', '复古太阳镜', '大框眼镜', '椭圆眼镜', '细框眼镜', '茶色眼镜', '夹鼻眼镜', '飞行员镜', '六角眼镜', '读书镜', '彩色镜', '无眼镜'],
  beards: ['无胡子', '胡茬', '八字胡', '铅笔胡', '卷翘胡', '山羊胡', '络腮胡', '大胡子', '长胡子', '船锚胡', '法式胡', '侧鬓胡', '尖胡子', '老爷爷胡', '短全胡', '马蹄胡', '海象胡', '灵魂补丁', '帝王胡', '稀疏胡', '无胡子'],
  mouths: ['无', '烟斗', '长烟斗', '弯烟斗', '侦探烟斗', '玉米烟斗', '雪茄', '牙签', '麦秆', '玫瑰花', '雏菊', '棒棒糖', '口哨', '泡泡糖', '树叶', '羽毛笔'],
  ears: ['无', '耳钉', '圆环耳环', '多个耳钉', '羽毛耳环', '珍珠耳环', '耳机', '单边耳机', '耳罩', '坠饰', '木质耳环', '星星耳环', '链条耳环'],
  necks: ['无', '围巾', '丝巾', '领带', '领结', '项链', '珍珠项链', '狗牌', '高领', '花边领', '衬衫领', '领巾', '围脖'],
  clothes: ['T 恤', '衬衫', '西装', '大衣', '风衣', '毛衣', '高领毛衣', '水手服', '牛仔夹克', '工作服', '探险服', '复古礼服', '厨师服', '艺术家围裙', '皮夹克', '背带裤', '马甲', '军装', '斗篷', '针织衫', '实验服', '飞行夹克'],
};

// ─── PRNG ───

export function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  };
}

export function mulberry32(a: number): () => number {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = (seed: string, part: string) => mulberry32(xmur3(`${VERSION}:${seed}:${part}`)());
const int = (r: () => number, n: number) => Math.floor(r() * n);
const pick = <T>(r: () => number, a: T[]): T => a[int(r, a.length)];
const chance = (r: () => number, p: number) => r() < p;
const path = (d: string, fill = 'none', extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const ellipse = (cx: number, cy: number, rx: number, ry: number, fill: string, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const circle = (cx: number, cy: number, r: number, fill: string, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const esc = (s: string) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

// ─── AvatarConfig ───

export interface AvatarConfig {
  version: number;
  seed: string;
  archetype: [string, string];
  portraitNo: string;
  palette: number;
  skin: number;
  hairColor: number;
  faceStyle: number;
  faceWidth: number;
  faceHeight: number;
  eyes: number;
  eyebrows: number;
  nose: number;
  mouth: number;
  hair: number;
  clothes: number;
  background: number;
  hat: number;
  glasses: number;
  beard: number;
  mouthAccessory: number;
  earAccessory: number;
  neckAccessory: number;
  freckles: boolean;
  scar: boolean;
  blush: boolean;
  mole: boolean;
  asym: [number, number];
}

/** 根据 seed 生成头像配置 */
export function generateConfig(rawSeed: string): AvatarConfig {
  const seed = String(rawSeed || 'seed').trim().slice(0, 80);
  const g = (p: string) => rng(seed, p);
  const ar = pick(g('archetype'), archetypes);
  const faceR = g('face');
  const accessoryR = g('accessory-count');

  const profileMap: Record<string, number> = { detective: 0, cowboy: 1, artist: 3, captain: 5, sailor: 6, chef: 15, aviator: 22 };
  const profileIdx = profileMap[ar[1].toLowerCase()] ?? -1;

  let hat = int(g('hat'), 31);
  let mouthAccessory = int(g('mouth-accessory'), 16);
  let clothes = int(g('clothes'), 22);
  let glasses = int(g('glasses'), 21);
  let beard = int(g('beard'), 21);

  if (profileIdx === 0) { hat = 14; if (chance(g('arch-mouth'), 0.65)) mouthAccessory = 1; clothes = 4; }
  if (profileIdx === 1) { hat = 4; if (chance(g('arch-mouth'), 0.45)) mouthAccessory = 7; clothes = 8; }
  if (profileIdx === 3) { hat = 5; glasses = 1; clothes = 13; }
  if (profileIdx === 5) { hat = 11; mouthAccessory = chance(g('arch-mouth'), 0.65) ? 2 : mouthAccessory; beard = 7; }
  if (profileIdx === 6) hat = 11;
  if (profileIdx === 15) { hat = 13; clothes = 12; }
  if (profileIdx === 22) { hat = 22; glasses = 16; clothes = 21; }

  const budget = accessoryR() < 0.1 ? 0 : accessoryR() < 0.35 ? 1 : accessoryR() < 0.7 ? 2 : accessoryR() < 0.9 ? 3 : 4;
  const order = ['hat', 'glasses', 'beard', 'mouthAccessory', 'earAccessory', 'neckAccessory'] as const;
  const vals: Record<string, number> = {
    hat, glasses, beard, mouthAccessory,
    earAccessory: int(g('ear-accessory'), 13),
    neckAccessory: int(g('neck-accessory'), 13),
  };

  const forcedHat = [0, 1, 3, 5, 6, 15, 22].includes(profileIdx);
  const ranked = order.map(k => ({ k, score: g(`slot-priority:${k}`)() })).sort((a, b) => a.score - b.score);
  const kept = new Set(ranked.slice(0, budget).map(x => x.k));
  if (forcedHat && !kept.has('hat')) {
    if (budget > 0 && kept.size >= budget) kept.delete([...kept].at(-1)!);
    kept.add('hat');
  }
  order.forEach(k => { if (!kept.has(k)) (vals as Record<string, number>)[k] = 0; });

  // 配饰冲突规则
  if (vals.glasses === 8) vals.hat = 0;
  if ([6, 7, 8].includes(vals.earAccessory) && vals.hat) vals.earAccessory = vals.earAccessory % 2 ? 1 : 2;
  if (vals.beard && vals.beard % 5 === 4 && vals.neckAccessory % 4 === 0) vals.neckAccessory = 0;

  const hair = int(g('hair'), 40);
  if (hair % 14 >= 8) vals.beard = 0;
  if ([11, 13].includes(hair % 14)) vals.hat = 0;

  return {
    version: VERSION,
    seed,
    archetype: ar,
    portraitNo: String(xmur3(seed)() % 1000000).padStart(6, '0'),
    palette: int(g('palette'), palettes.length),
    skin: int(g('skin'), skinTones.length),
    hairColor: int(g('hair-color'), hairColors.length),
    faceStyle: int(faceR, 12),
    faceWidth: 0.9 + faceR() * 0.2,
    faceHeight: 0.92 + faceR() * 0.16,
    eyes: int(g('eyes'), 22),
    eyebrows: int(g('eyebrows'), 18),
    nose: int(g('nose'), 20),
    mouth: int(g('mouth'), 22),
    hair,
    clothes,
    background: int(g('background'), 16),
    hat: vals.hat,
    glasses: vals.glasses,
    beard: vals.beard,
    mouthAccessory: vals.mouthAccessory,
    earAccessory: vals.earAccessory,
    neckAccessory: vals.neckAccessory,
    freckles: chance(g('freckles'), 0.22),
    scar: chance(g('scar'), 0.08),
    blush: chance(g('blush'), 0.18),
    mole: chance(g('mole'), 0.16),
    asym: [g('asym')() * 5 - 2.5, g('asym')() * 5 - 2.5],
  };
}

// ─── 共享锚点系统 ───

interface Anchors {
  leftEye: [number, number];
  rightEye: [number, number];
  leftEar: [number, number];
  rightEar: [number, number];
  mouth: [number, number];
  headScale: number;
}

function anchors(c: AvatarConfig): Anchors {
  const eyeSpace = 54 + (c.eyes % 4) * 4;
  const eyeY: [number, number] = [230 + c.asym[0] * 0.3, 230 + c.asym[1] * 0.3];
  const earOffset = 106 * c.faceWidth;
  return {
    leftEye: [256 - eyeSpace, eyeY[0]],
    rightEye: [256 + eyeSpace, eyeY[1]],
    leftEar: [256 - earOffset + c.asym[0], 258],
    rightEar: [256 + earOffset + c.asym[1], 258],
    mouth: [256 + c.asym[0], 333],
    headScale: 0.94 + (c.faceWidth - 0.9) * 0.6,
  };
}

// ─── SVG 渲染函数 ───

function renderBackground(c: AvatarConfig, p: string[]): string {
  const styles = [
    '',
    `<circle cx="256" cy="250" r="205" fill="${p[3]}" opacity=".46"/>`,
    `<path d="M-30 455L410 0M60 520L500 30M250 540L540 240" stroke="${p[3]}" opacity=".18" stroke-width="28"/>`,
    `<pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="3" fill="${p[3]}" opacity=".25"/></pattern><rect width="512" height="512" fill="url(#dots)"/>`,
    `<path d="M256 256L256 -80M256 256L540 30M256 256L590 256M256 256L520 530M256 256L256 600M256 256L-20 530M256 256L-80 256M256 256L-10 0" stroke="${p[3]}" stroke-width="22" opacity=".12"/>`,
    `<rect x="25" y="25" width="462" height="462" rx="5" fill="none" stroke="${p[1]}" stroke-width="4" stroke-dasharray="4 10" opacity=".4"/>`,
  ];
  return styles[c.background % styles.length];
}

function renderClothes(c: AvatarConfig, p: string[]): string {
  const col = c.clothes % 4 === 0 ? p[2] : c.clothes % 4 === 1 ? p[3] : p[1];
  let s = path('M70 512 Q83 409 181 387 L256 426 331 387 Q429 409 442 512Z', col);
  if (c.clothes % 5 === 1) s += path('M181 389L232 458 207 512M331 389L280 458 305 512', '#f3e8d0');
  if (c.clothes % 5 === 2) s += path('M225 423L256 456 287 423 275 512H237Z', p[2]);
  if (c.clothes % 5 === 3) s += `<path d="M105 472Q256 430 407 472" stroke="${p[0]}" stroke-width="12" opacity=".55"/>`;
  return s;
}

function renderFace(c: AvatarConfig): string {
  const skin = skinTones[c.skin];
  const w = 142 * c.faceWidth;
  const h = 164 * c.faceHeight;
  const shapes = [
    `M256 103C${256 - w} 103 ${256 - w - 12} 310 256 ${359 + h * 0.2}C${256 + w + 12} 310 ${256 + w} 103 256 103Z`,
    `M256 91C${256 - w * 0.82} 91 ${256 - w} 272 256 384C${256 + w} 272 ${256 + w * 0.82} 91 256 91Z`,
    `M256 95L${256 + w * 0.8} 120 ${256 + w} 282 310 375 256 400 202 375 ${256 - w} 282 ${256 - w * 0.8} 120Z`,
    `M256 93C${256 - w} 93 ${256 - w} 255 178 330Q256 417 334 330C${256 + w} 255 ${256 + w} 93 256 93Z`,
  ];
  return path(shapes[c.faceStyle % 4], skin);
}

function renderEars(c: AvatarConfig): string {
  const skin = skinTones[c.skin];
  const a = anchors(c);
  const left = a.leftEar[0];
  const right = a.rightEar[0];
  return `<path d="M${left} 228C${left + 35} 228 190 239 204 252L204 274C188 285 ${left + 34} 289 ${left} 289ZM${right} 228C${right - 35} 228 322 239 308 252L308 274C324 285 ${right - 34} 289 ${right} 289Z" fill="${skin}" stroke="none"/><ellipse cx="${left}" cy="258" rx="33" ry="41" fill="${skin}"/><ellipse cx="${right}" cy="258" rx="33" ry="41" fill="${skin}"/><path d="M${left} 243q-16 14 2 33M${right} 243q16 14-2 33" fill="none" opacity=".5"/>`;
}

function renderHair(c: AvatarConfig): string {
  if (c.hair === 0) return '';
  const col = hairColors[c.hairColor];
  const v = c.hair % 14;
  const a = anchors(c);
  const base = [
    'M126 205Q117 75 256 74T386 205Q340 139 303 151Q226 111 126 205Z',
    'M126 202Q128 78 250 76Q365 68 386 192Q315 163 285 107Q230 173 126 202Z',
    'M120 219Q104 75 256 70Q413 72 391 228Q358 155 326 158Q282 81 235 154Q171 131 120 219Z',
    'M132 196Q145 70 262 77Q376 86 382 188L342 160Q282 139 219 160Z',
    'M126 221Q103 126 163 91Q238 35 327 88Q410 128 388 224Q359 129 307 137Q256 69 205 140Q145 135 126 221Z',
    'M137 182Q179 55 300 82Q371 98 378 184Q330 130 288 129Q217 128 137 182Z',
    'M132 202Q151 111 210 84L237 125 270 73 289 124 341 92 379 204Q307 148 256 151Q203 147 132 202Z',
    'M128 207Q138 84 256 81T384 207Q320 165 256 145Q191 166 128 207Z',
  ];
  let out = '';
  if (v < 8) {
    out = path(base[v], col) + (c.hair % 5 === 3 ? `<path d="M150 168q-42 152 16 221M362 166q43 151-16 222" stroke="${col}" stroke-width="34" fill="none"/>` : '');
  }
  if (v === 8) out = path('M119 220Q105 72 256 68T393 220L382 374Q354 407 323 379L328 183Q256 130 184 183L189 379Q158 407 130 374Z', col);
  if (v === 9) out = path('M128 207Q132 76 256 74T384 202Q324 164 274 112Q220 173 128 207Z', col) + ellipse(382, 238, 58, 108, col, 'transform="rotate(-15 382 238)"');
  if (v === 10) out = path('M130 205Q138 77 256 76T382 205Q320 156 256 143Q190 159 130 205Z', col) + ellipse(111, 247, 47, 98, col, 'transform="rotate(18 111 247)"') + ellipse(401, 247, 47, 98, col, 'transform="rotate(-18 401 247)"');
  if (v === 11) out = circle(256, 58, 72, col) + path('M128 204Q135 83 256 80T384 204Q323 156 256 145Q187 158 128 204Z', col);
  if (v === 12) out = path('M124 210Q121 70 256 70T388 210Q326 154 256 143Q186 154 124 210Z', col) + `<path d="M151 176Q105 265 153 395M361 176Q407 265 359 395" stroke="${col}" stroke-width="40" fill="none" stroke-dasharray="34 9"/>`;
  if (v === 13) out = circle(170, 94, 58, col) + circle(342, 94, 58, col) + path('M128 207Q137 79 256 78T384 207Q324 158 256 144Q188 158 128 207Z', col);
  return `<g transform="translate(256 0) scale(${a.headScale} 1) translate(-256 0)">${out}</g>`;
}

function renderEyes(c: AvatarConfig, p: string[]): string {
  const a = anchors(c);
  const v = c.eyes % 12;
  const ink = p[1];
  const paper = '#f7f0df';
  const open = (x: number, y: number, rx: number, ry: number, pupil = 7, shift = 0) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${paper}"/><circle cx="${x + shift}" cy="${y}" r="${pupil}" fill="${ink}" stroke="none"/>`;
  const curved = (x: number, y: number, curve: number) =>
    `<path d="M${x - 22} ${y}Q${x} ${y + curve} ${x + 22} ${y}" fill="none"/>`;
  const one = (x: number, y: number, side: number) => {
    if (v === 0) return open(x, y, 21, 16, 7, side ? 2 : -2);
    if (v === 1) return open(x, y, 14, 22, 6, 0);
    if (v === 2) return circle(x, y, 7, ink, 'stroke="none"');
    if (v === 3) return open(x, y, 27, 11, 6, side ? 4 : -4);
    if (v === 4) return curved(x, y, -13);
    if (v === 5) return curved(x, y, 7);
    if (v === 6) {
      const leftY = y + (side ? 3 : -6);
      const rightY = y + (side ? -6 : 3);
      return `<path d="M${x - 24} ${leftY}Q${x} ${y - 17} ${x + 24} ${rightY}Q${x} ${y + 13} ${x - 24} ${leftY}Z" fill="${paper}"/><circle cx="${x + (side ? 4 : -4)}" cy="${y}" r="6" fill="${ink}" stroke="none"/>`;
    }
    if (v === 7) {
      const leftY = y + (side ? -2 : 7);
      const rightY = y + (side ? 7 : -2);
      return `<path d="M${x - 24} ${leftY}Q${x} ${y - 11} ${x + 24} ${rightY}Q${x} ${y + 18} ${x - 24} ${leftY}Z" fill="${paper}"/><circle cx="${x}" cy="${y + 3}" r="6" fill="${ink}" stroke="none"/>`;
    }
    if (v === 8) return open(x, y, 22, 25, 9, 0);
    if (v === 9) return side ? open(x, y, 20, 15, 7, 2) : curved(x, y, -10);
    if (v === 10) return side ? curved(x, y, -10) : open(x, y, 20, 15, 7, -2);
    return `<path d="M${x - 23} ${y}Q${x} ${y - 17} ${x + 23} ${y}Q${x} ${y + 14} ${x - 23} ${y}Z" fill="${paper}"/><circle cx="${x}" cy="${y}" r="9" fill="${ink}" stroke="none"/><circle cx="${x - 3}" cy="${y - 4}" r="2.5" fill="${paper}" stroke="none"/>`;
  };
  return one(a.leftEye[0], a.leftEye[1], 0) + one(a.rightEye[0], a.rightEye[1], 1);
}

function renderBrows(c: AvatarConfig): string {
  const a = anchors(c);
  const t = 3 + (c.eyebrows % 4) * 1.5;
  const w = 25 + (c.eyebrows % 3) * 3;
  const curve = -10 + (c.eyebrows % 5) * 4;
  const one = ([x, y]: [number, number], flip: number) =>
    `<path d="M${x - w} ${y - 34 + (flip ? 1 : -1)}Q${x} ${y - 34 + curve} ${x + w} ${y - 36 + (flip ? -1 : 1)}" stroke-width="${t}" fill="none"/>`;
  return one(a.leftEye, 0) + one(a.rightEye, 1);
}

function renderNose(c: AvatarConfig): string {
  const n = c.nose % 6;
  return [
    `<path d="M255 238q-13 53-5 66q12 9 25-1" fill="none"/>`,
    `<path d="M260 239l-15 64 29 5" fill="none"/>`,
    `<path d="M256 241q23 47 0 67q-21 3-21-10" fill="none"/>`,
    `<path d="M249 246q-5 33-19 57q26 16 54 0" fill="none"/>`,
    `<path d="M260 247q-8 47 8 59q-14 8-31-1" fill="none"/>`,
    `<path d="M251 260q-18 31 5 45q25-12 2-45" fill="none"/>`,
  ][n];
}

function renderMouth(c: AvatarConfig, p: string[]): string {
  const y = 333;
  const x = 256 + c.asym[0];
  const w = 27 + (c.mouth % 5) * 5;
  return [
    `<path d="M${x - w} ${y}Q${x} ${y + 24} ${x + w} ${y}" fill="none"/>`,
    `<path d="M${x - w} ${y + 8}Q${x} ${y - 4} ${x + w} ${y + 8}" fill="none"/>`,
    `<path d="M${x - w} ${y}Q${x} ${y + 10} ${x + w} ${y}" fill="none"/>`,
    `<ellipse cx="${x}" cy="${y + 4}" rx="${w * 0.55}" ry="16" fill="${p[2]}"/>`,
    `<path d="M${x - w} ${y}Q${x} ${y + 30} ${x + w} ${y}Q${x} ${y + 13} ${x - w} ${y}Z" fill="#f4e6d2"/>`,
  ][c.mouth % 5];
}

function renderBeard(c: AvatarConfig): string {
  if (!c.beard) return '';
  const col = hairColors[c.hairColor];
  const v = c.beard % 5;
  if (v === 1) return `<path d="M209 321q47 20 94 0M220 343q36 13 72 0" stroke="${col}" stroke-width="3" stroke-dasharray="2 8" fill="none"/>`;
  if (v === 2) return `<path d="M212 329q24-23 44 2q20-25 44-2q-18 31-44 5q-27 26-44-5Z" fill="${col}"/>`;
  if (v === 3) return `<path d="M238 333q18-18 36 0M246 347q10 58 27 0" fill="${col}"/>`;
  if (v === 4) return `<path d="M173 306q13 104 83 119q74-16 83-119q-25 49-83 52q-58-4-83-52Z" fill="${col}" opacity=".94"/>`;
  return `<path d="M195 331q61 25 122 0q-7 77-61 85q-53-8-61-85Z" fill="${col}"/>`;
}

function renderGlasses(c: AvatarConfig, p: string[]): string {
  if (!c.glasses) return '';
  const a = anchors(c);
  const [lx, ly] = a.leftEye;
  const [rx, ry] = a.rightEye;
  const col = c.glasses % 4 === 0 ? '#ad8747' : p[1];
  const round = c.glasses % 3 !== 1;
  const size = 27 + (c.glasses % 4);
  if (c.glasses === 9) {
    return `<circle cx="${rx}" cy="${ry}" r="${size}" fill="none" stroke="${col}" stroke-width="5"/><path d="M${rx + size} ${ry + 10}q17 45 4 80" fill="none" stroke="${col}" stroke-width="3"/>`;
  }
  const lens = c.glasses % 6 === 0 ? '#39434a99' : '#fff2';
  const bridgeL = lx + size;
  const bridgeR = rx - size;
  return round
    ? `<ellipse cx="${lx}" cy="${ly}" rx="${size}" ry="${size - 1}" fill="${lens}" stroke="${col}" stroke-width="5"/><ellipse cx="${rx}" cy="${ry}" rx="${size}" ry="${size - 1}" fill="${lens}" stroke="${col}" stroke-width="5"/><path d="M${bridgeL} ${ly}Q256 ${Math.min(ly, ry) - 10} ${bridgeR} ${ry}M${lx - size} ${ly - 5}L${a.leftEar[0]} 220M${rx + size} ${ry - 5}L${a.rightEar[0]} 220" fill="none" stroke="${col}" stroke-width="5"/>`
    : `<path d="M${lx - size} ${ly - size + 3}h${size * 2}v${size * 2 - 6}h-${size * 2}zM${rx - size} ${ry - size + 3}h${size * 2}v${size * 2 - 6}h-${size * 2}zM${bridgeL} ${ly}Q256 ${Math.min(ly, ry) - 8} ${bridgeR} ${ry}M${lx - size} ${ly - 5}L${a.leftEar[0]} 220M${rx + size} ${ry - 5}L${a.rightEar[0]} 220" fill="${lens}" stroke="${col}" stroke-width="5"/>`;
}

function renderHat(c: AvatarConfig, p: string[]): string {
  if (!c.hat) return '';
  const col = c.hat % 3 === 0 ? p[2] : c.hat % 3 === 1 ? p[1] : p[3];
  const v = c.hat % 8;
  if (v === 0) return `<path d="M112 164q144-55 288 0q-10 27-144 13q-134 14-144-13Z" fill="${col}"/><path d="M170 151Q170 37 256 36t86 115" fill="${col}"/>`;
  if (v === 1) return `<path d="M109 164q147-39 294 0q-23 24-147 18q-124 6-147-18Z" fill="${col}"/><path d="M164 154Q168 76 256 75t92 79" fill="${col}"/>`;
  if (v === 2) return `<path d="M121 162q135-52 270 0q-48 27-270 0Z" fill="${col}"/><path d="M186 151l15-119h110l15 119" fill="${col}"/>`;
  if (v === 3) return `<path d="M144 155Q147 82 256 85q109-3 112 70q-103 29-224 0Z" fill="${col}"/><path d="M144 155q115-5 198 24q-116 19-198-24Z" fill="${p[0]}"/>`;
  if (v === 4) return `<path d="M104 166Q159 93 256 117q99-24 152 49q-93-16-152 0q-63-16-152 0Z" fill="${col}"/><path d="M167 132q10-76 89-73q79-2 91 73" fill="${col}"/>`;
  if (v === 5) return `<path d="M157 158Q163 61 256 63t99 95q-99 21-198 0Z" fill="${col}"/><circle cx="256" cy="60" r="13" fill="${p[2]}"/>`;
  if (v === 6) return `<path d="M132 157Q170 78 256 66q86 12 124 91q-122 26-248 0Z" fill="${col}"/><path d="M256 66V23"/><circle cx="256" cy="19" r="9" fill="${p[2]}"/>`;
  return `<path d="M105 167q151-40 302 0q-68 23-302 0Z" fill="${col}"/><path d="M166 152L244 22l20 83 50 47Z" fill="${col}"/>`;
}

function renderAccessories(c: AvatarConfig, p: string[]): string {
  let out = '';
  const a = anchors(c);
  if (c.mouthAccessory) {
    const side = c.mouthAccessory % 2 ? -1 : 1;
    const mouthWidth = 27 + (c.mouth % 5) * 5;
    const x = a.mouth[0] + side * (mouthWidth - 4);
    const y = a.mouth[1] + 6;
    if (c.mouthAccessory % 5 < 3) {
      out += `<path d="M${x} ${y}q${side * 44} 11 ${side * 62} 49"/><path d="M${x + side * 62} ${y + 49}q${side * 20} 20 ${side * 40} 0q-4-22 ${side * -12}-28q${side * -8} 17 ${side * -28} 28Z" fill="${p[1]}"/>`;
    } else if (c.mouthAccessory % 5 === 3) {
      out += `<path d="M${x} ${y}l${side * 79} 27"/><circle cx="${x + side * 86}" cy="${y + 29}" r="12" fill="${p[2]}"/>`;
    } else {
      out += `<path d="M${x} ${y}q${side * 39} 9 ${side * 66} 45" stroke="${p[3]}" stroke-width="5"/><circle cx="${x + side * 68}" cy="${y + 47}" r="10" fill="${p[2]}"/>`;
    }
  }
  if (c.earAccessory) {
    const ear = c.earAccessory % 2 ? a.leftEar : a.rightEar;
    const x = ear[0];
    const y = ear[1] + 31;
    out += c.earAccessory % 4 === 0
      ? `<circle cx="${x}" cy="${y}" r="17" fill="none" stroke="${p[2]}" stroke-width="5"/>`
      : `<path d="M${x} ${y - 7}q-9 26 0 45q10-18 0-45Z" fill="${p[2]}"/>`;
  }
  if (c.neckAccessory) {
    if (c.neckAccessory % 4 === 1) out += `<path d="M169 389q87 57 174 0l-14 58q-73 36-146 0Z" fill="${p[2]}"/>`;
    else if (c.neckAccessory % 4 === 2) out += `<path d="M239 409l17 22 17-22 18 38-35 42-35-42Z" fill="${p[2]}"/>`;
    else if (c.neckAccessory % 4 === 3) out += `<path d="M204 410l52 27 52-27-19 45-33-18-33 18Z" fill="${p[0]}"/>`;
    else out += `<path d="M200 415q56 49 112 0" fill="none" stroke="${p[2]}" stroke-width="7"/>`;
  }
  return out;
}

function renderDetails(c: AvatarConfig, p: string[]): string {
  let o = '';
  if (c.freckles) for (let i = 0; i < 12; i++) o += `<circle cx="${188 + (i % 6) * 27}" cy="${278 + Math.floor(i / 6) * 10}" r="2" fill="${p[1]}" opacity=".45" stroke="none"/>`;
  if (c.scar) o += `<path d="M318 265l24 37m-19-27l13-4m-8 14l14-4"/>`;
  if (c.blush) o += `<ellipse cx="182" cy="290" rx="28" ry="13" fill="${p[2]}" opacity=".14" stroke="none"/><ellipse cx="330" cy="290" rx="28" ry="13" fill="${p[2]}" opacity=".14" stroke="none"/>`;
  if (c.mole) o += `<circle cx="${c.nose % 2 ? 214 : 303}" cy="307" r="3" fill="${p[1]}" stroke="none"/>`;
  return o;
}

/** 生成完整 SVG 字符串 */
export function renderAvatar(c: AvatarConfig): string {
  const p = palettes[c.palette];
  const rough = xmur3(c.seed + ':rough')() % 99;
  const a = anchors(c);
  const headwear = renderHat(c, p);
  return `<svg id="portraitSvg" class="avatar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="avatarTitle avatarDesc"><title id="avatarTitle">Seed ${esc(c.seed)} 的手绘肖像</title><desc id="avatarDesc">${c.archetype[0]}风格的程序化人物头像</desc><defs><filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="3" seed="${rough}" result="n"/><feBlend in="SourceGraphic" in2="n" mode="multiply"/></filter><filter id="ink"><feTurbulence baseFrequency=".013" numOctaves="2" seed="${rough + 9}" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="1.7"/></filter></defs><rect width="512" height="512" fill="${p[0]}" stroke="none"/>${renderBackground(c, p)}<g stroke="${p[1]}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#ink)">${renderHair(c)}${renderClothes(c, p)}<path d="M213 347v67q43 28 86 0v-67" fill="${skinTones[c.skin]}"/>${renderEars(c)}${renderFace(c)}${renderDetails(c, p)}${renderEyes(c, p)}${renderBrows(c)}${renderNose(c)}${renderMouth(c, p)}${renderBeard(c)}${renderGlasses(c, p)}${headwear ? `<g transform="translate(256 0) scale(${a.headScale} 1) translate(-256 0)">${headwear}</g>` : ''}${renderAccessories(c, p)}</g><rect width="512" height="512" fill="#8b7653" opacity=".055" filter="url(#paper)" pointer-events="none" stroke="none"/></svg>`;
}

/** 获取人物档案描述 */
export function getTraits(c: AvatarConfig): string[] {
  return [
    traitNames.hats[c.hat],
    traitNames.glasses[c.glasses],
    traitNames.beards[c.beard],
    traitNames.mouths[c.mouthAccessory],
    traitNames.necks[c.neckAccessory],
    traitNames.clothes[c.clothes],
  ].filter(x => x && x !== '无' && x !== '无帽' && x !== '无眼镜' && x !== '无胡子').slice(0, 5);
}

/** 生成随机 seed */
export function randomSeed(): string {
  const arr = new Uint32Array(2);
  crypto.getRandomValues(arr);
  return `${arr[0].toString(36)}${arr[1].toString(36)}`.toUpperCase();
}

/** 生成可下载的 SVG Blob */
export function createSvgBlob(svg: string): Blob {
  return new Blob([`<?xml version="1.0" encoding="UTF-8"?>${svg}`], { type: 'image/svg+xml;charset=utf-8' });
}
