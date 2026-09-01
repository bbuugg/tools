/** 文本统计结果 */
export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  chineseCharacters: number;
  englishWords: number;
  chineseWords: number;
  totalWords: number;
  sentences: number;
  paragraphs: number;
  lines: number;
}

const EMPTY_STATS: TextStats = {
  characters: 0,
  charactersNoSpaces: 0,
  chineseCharacters: 0,
  englishWords: 0,
  chineseWords: 0,
  totalWords: 0,
  sentences: 0,
  paragraphs: 0,
  lines: 0,
};

/** 统计字符 / 词数 / 句子 / 段落 / 行数 */
export function computeTextStats(text: string): TextStats {
  if (!text) return { ...EMPTY_STATS };

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const chineseCharacters = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = text.match(/[a-zA-Z]+/g)?.length || 0;
  const chineseText = text.match(/[\u4e00-\u9fa5]+/g)?.join("") || "";
  const chineseWords = Math.ceil(chineseText.length / 2);
  const totalWords = englishWords + chineseWords;
  const sentences =
    (text.match(/[.!?。！？]+/g) || []).length || (text.length > 0 ? 1 : 0);
  const paragraphs =
    text.split(/\n\s*\n/).filter(Boolean).length || (text.length > 0 ? 1 : 0);
  const lines = text.split("\n").length;

  return {
    characters,
    charactersNoSpaces,
    chineseCharacters,
    englishWords,
    chineseWords,
    totalWords,
    sentences,
    paragraphs,
    lines,
  };
}
