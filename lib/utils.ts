// 이모지 추출 (ZWJ 시퀀스, 변형 선택자 포함 — Intl.Segmenter 미지원 환경 폴백 포함)
export const extractEmojis = (str: string): string[] => {
  if (!str) return [];
  try {
    const segments = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(str)];
    return segments
      .map(s => s.segment)
      .filter(s => /\p{Emoji}/u.test(s) && s.trim() !== '');
  } catch {
    const variationSelector = String.fromCharCode(0xfe0f);
    const regex = new RegExp(`\\p{Emoji_Presentation}|\\p{Emoji}${variationSelector}`, 'gu');
    return [...(str.match(regex) ?? [])];
  }
};

export const countEmojis = (str: string): number => extractEmojis(str).length;
