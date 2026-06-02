export type Mood = "happy" | "ok" | "warning" | "critical";

export interface PlantScores {
  happiness: number;
  health: number;
  hydration: number;
  nutrition: number;
  growth: number;
  diseaseRisk: number;
}

export interface DiaryEntry {
  id: string;
  date: string; // ISO
  text: string;
  mood: Mood;
  scores?: PlantScores;
  imageDataUrl?: string;
}

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: number;
}

export interface Prediction {
  label: string;
  probability: number;
  timeframe: string;
}

export interface Plant {
  id: string;
  name: string;
  species: string;
  emoji: string;
  createdAt: string;
  imageDataUrl?: string;
  scores: PlantScores;
  mood: Mood;
  introMessage: string;
  diary: DiaryEntry[];
  chat: ChatMsg[];
  predictions: Prediction[];
  recommendations: string[];
}

export const DEFAULT_SCORES: PlantScores = {
  happiness: 75,
  health: 80,
  hydration: 70,
  nutrition: 75,
  growth: 70,
  diseaseRisk: 20,
};
