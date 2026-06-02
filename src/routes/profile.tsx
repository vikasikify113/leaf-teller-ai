import { AppShell } from "@/components/AppShell";
import { LANGUAGES, getLang, loadPlants, setLang } from "@/lib/plant-store";
import type { Plant } from "@/lib/plant-types";
import { createFileRoute } from "@tanstack/react-router";
import { Award, Leaf, User } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — PlantaSpeak AI" }] }),
  component: Profile,
});

function Profile() {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("English");
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    setName(localStorage.getItem("plantaspeak.name") || "Friend of plants");
    setLanguage(getLang());
    setPlants(loadPlants());
  }, []);

  function saveName(v: string) {
    setName(v);
    localStorage.setItem("plantaspeak.name", v);
  }

  const totalDiary = plants.reduce((a, p) => a + p.diary.length, 0);
  const achievements = [
    { id: "first", label: "First scan", unlocked: plants.length >= 1, icon: "🌱" },
    { id: "five", label: "Five plants", unlocked: plants.length >= 5, icon: "🌿" },
    { id: "diary10", label: "10 diary entries", unlocked: totalDiary >= 10, icon: "📖" },
    { id: "healer", label: "Healer", unlocked: plants.some((p) => p.diary.length >= 3 && p.mood === "happy"), icon: "💚" },
  ];

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-6 md:pt-10">
        <div className="glass-strong p-6 flex items-center gap-4">
          <div className="size-16 rounded-full bg-gradient-to-br from-leaf to-accent flex items-center justify-center glow-leaf">
            <User className="size-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <input
              value={name}
              onChange={(e) => saveName(e.target.value)}
              className="text-2xl font-semibold bg-transparent outline-none w-full"
            />
            <div className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
              <Leaf className="size-3" /> {plants.length} plants · {totalDiary} diary entries
            </div>
          </div>
        </div>

        <h2 className="mt-8 text-xl font-semibold flex items-center gap-2">
          <Award className="size-5 text-leaf" /> Achievements
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`glass p-4 text-center ${a.unlocked ? "" : "opacity-40"}`}
            >
              <div className="text-3xl">{a.icon}</div>
              <div className="text-xs mt-2">{a.label}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-xl font-semibold">Settings</h2>
        <div className="glass p-5 mt-4 space-y-4">
          <label className="block">
            <span className="text-xs text-muted-foreground">Plant language</span>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                setLang(e.target.value);
              }}
              className="mt-1 w-full bg-transparent outline-none border border-glass-border rounded-lg px-3 py-2"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l} className="bg-background">
                  {l}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-muted-foreground">
            All plant data lives in this browser only. Clear browser storage to reset.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
