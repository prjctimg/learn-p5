import AsyncStorage from "@react-native-async-storage/async-storage";

const HIGH_SCORES_KEY = "minigame_high_scores";

export interface HighScores {
  [minigameId: string]: number;
}

export async function getHighScores(): Promise<HighScores> {
  const raw = await AsyncStorage.getItem(HIGH_SCORES_KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function getHighScore(minigameId: string): Promise<number> {
  const scores = await getHighScores();
  return scores[minigameId] || 0;
}

export async function setHighScore(minigameId: string, score: number): Promise<void> {
  const scores = await getHighScores();
  const currentHigh = scores[minigameId] || 0;
  
  if (score > currentHigh) {
    scores[minigameId] = score;
    await AsyncStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
  }
}

export async function isNewHighScore(minigameId: string, score: number): Promise<boolean> {
  const currentHigh = await getHighScore(minigameId);
  return score > currentHigh;
}
