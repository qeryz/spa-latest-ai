export const ALIEN_ANIMATION_MAP: Record<string, string> = {
  dance_hype: "/Animation_All_Night_Dance_withSkin.glb",
  dance_calm: "/Animation_jazz_danc_withSkin.glb",
  dance_funny: "/Animation_FunnyDancing_02_withSkin.glb",
  dance_hiphop: "/Animation_Hip_Hop_Dance_3_withSkin.glb",
  idle: "/Animation_Idle_9_withSkin.glb",
  talk: "/Animation_Talk_with_Right_Hand_Open_withSkin.glb",
  walk: "/Animation_Walking_withSkin.glb",
  think: "/Animation_Alert_withSkin.glb",
};

const MAX_WORDS = 50;

export const splitMessageIntoBubbles = (message: string) => {
  // First, split by newlines to preserve logical blocks (paragraphs, list items)
  const lines = message.split(/\n/);
  const bubbles: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // If the line is short enough, keep it as one bubble
    if (trimmedLine.split(/\s+/).length <= MAX_WORDS) {
      bubbles.push(trimmedLine);
    } else {
      // If line is too long, split by sentences
      const sentences = trimmedLine.split(/(?<=\.)\s+/);
      let current = "";
      for (const sentence of sentences) {
        const currentWords = current.split(/\s+/).filter(Boolean).length;
        const sentenceWords = sentence.split(/\s+/).filter(Boolean).length;

        if (currentWords + sentenceWords <= MAX_WORDS) {
          current += (current ? " " : "") + sentence;
        } else {
          if (current) bubbles.push(current.trim());
          current = sentence;
        }
      }
      if (current) bubbles.push(current.trim());
    }
  }
  return bubbles;
};
