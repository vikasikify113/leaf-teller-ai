import type { Plant, DiaryEntry, ChatMsg } from "./plant-types";

const KEY = "plantaspeak.plants.v1";
const LANG_KEY = "plantaspeak.lang";

export function loadPlants(): Plant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Plant[];
  } catch {
    return [];
  }
}

export function savePlants(plants: Plant[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(plants));
  window.dispatchEvent(new Event("plantaspeak:updated"));
}

export function upsertPlant(plant: Plant) {
  const all = loadPlants();
  const idx = all.findIndex((p) => p.id === plant.id);
  if (idx >= 0) all[idx] = plant;
  else all.unshift(plant);
  savePlants(all);
}

export function getPlant(id: string): Plant | undefined {
  return loadPlants().find((p) => p.id === id);
}

export function deletePlant(id: string) {
  savePlants(loadPlants().filter((p) => p.id !== id));
}

export function appendDiary(plantId: string, entry: DiaryEntry) {
  const all = loadPlants();
  const p = all.find((x) => x.id === plantId);
  if (!p) return;
  p.diary.unshift(entry);
  savePlants(all);
}

export function appendChat(plantId: string, msg: ChatMsg) {
  const all = loadPlants();
  const p = all.find((x) => x.id === plantId);
  if (!p) return;
  p.chat.push(msg);
  if (p.chat.length > 200) p.chat = p.chat.slice(-200);
  savePlants(all);
}

export function getLang(): string {
  if (typeof window === "undefined") return "English";
  return localStorage.getItem(LANG_KEY) || "English";
}

export function setLang(lang: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANG_KEY, lang);
  window.dispatchEvent(new Event("plantaspeak:lang"));
}

export const LANGUAGES = [
  "English",
  "Hindi",
  "Kannada",
  "Tamil",
  "Telugu",
  "Malayalam",
];
