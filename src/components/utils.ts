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

const MAX_WORDS = 30;

export const splitMessageIntoBubbles = (message: string) => {
  const sentences = message.split(/(?<=\.)\s+/); // Split at period+space
  const bubbles: string[] = [];
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
  return bubbles;
};
