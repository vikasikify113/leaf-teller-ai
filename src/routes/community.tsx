import { AppShell } from "@/components/AppShell";
import { loadPlants } from "@/lib/plant-store";
import type { Plant } from "@/lib/plant-types";
import { createFileRoute } from "@tanstack/react-router";
import { Globe, Heart, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "Community — PlantaSpeak AI" }] }),
  component: Community,
});

interface CommunityScan {
  id: string;
  region: string;
  species: string;
  emoji: string;
  mood: Plant["mood"];
  message: string;
  ago: string;
}

const SEED: CommunityScan[] = [
  { id: "c1", region: "Bengaluru", species: "Tomato", emoji: "🍅", mood: "warning", message: "Yellowing lower leaves reported across 12 nearby gardens this week.", ago: "2h ago" },
  { id: "c2", region: "Chennai", species: "Chili", emoji: "🌶️", mood: "critical", message: "Fungal spots rising sharply with the humidity.", ago: "5h ago" },
  { id: "c3", region: "Hyderabad", species: "Curry leaf", emoji: "🌿", mood: "happy", message: "Strong new growth after the recent rain.", ago: "1d ago" },
  { id: "c4", region: "Mumbai", species: "Basil", emoji: "🌱", mood: "ok", message: "Stable. Watering once every 2 days seems ideal here.", ago: "1d ago" },
  { id: "c5", region: "Kochi", species: "Banana", emoji: "🍌", mood: "happy", message: "Flowering early this season. Looking strong.", ago: "2d ago" },
  { id: "c6", region: "Pune", species: "Rose", emoji: "🌹", mood: "warning", message: "Aphid activity climbing — neighbours, check your buds.", ago: "3d ago" },
];

const REGIONS = ["Bengaluru", "Chennai", "Hyderabad", "Mumbai", "Kochi", "Pune"];

function Community() {
  const [myPlants, setMyPlants] = useState<Plant[]>([]);
  useEffect(() => setMyPlants(loadPlants()), []);

  const feed = useMemo<CommunityScan[]>(() => {
    const mine: CommunityScan[] = myPlants.slice(0, 2).map((p) => ({
      id: p.id,
      region: "You",
      species: p.species,
      emoji: p.emoji,
      mood: p.mood,
      message: p.diary[0]?.text || p.introMessage,
      ago: "just now",
    }));
    return [...mine, ...SEED];
  }, [myPlants]);

  const trending = useMemo(() => {
    const counts = SEED.reduce(
      (acc, s) => ({ ...acc, [s.species]: (acc[s.species] || 0) + 1 }),
      {} as Record<string, number>,
    );
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, []);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-6 md:pt-10">
        <h1 className="text-3xl md:text-4xl font-semibold">Community</h1>
        <p className="text-muted-foreground mt-2">
          Anonymous plant signals from gardens around you.
        </p>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6 mt-8">
          {/* Feed */}
          <div className="space-y-3">
            {feed.map((s) => (
              <div key={s.id} className="glass p-4 flex items-start gap-3">
                <div className="text-3xl">{s.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Globe className="size-3" />
                    <span>{s.region}</span>
                    <span>·</span>
                    <span>{s.species}</span>
                    <span>·</span>
                    <span>{s.ago}</span>
                  </div>
                  <p className="text-sm mt-1 leading-relaxed">{s.message}</p>
                </div>
                <button className="size-8 rounded-full hover:bg-white/5 transition flex items-center justify-center text-muted-foreground">
                  <Heart className="size-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="glass p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="size-4" /> Trending species
              </div>
              <div className="mt-3 space-y-2">
                {trending.map(([sp, n]) => (
                  <div key={sp} className="flex items-center justify-between text-sm">
                    <span>{sp}</span>
                    <span className="text-muted-foreground">{n} reports</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-5">
              <div className="text-sm text-muted-foreground">Active regions</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {REGIONS.map((r) => (
                  <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-white/5">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
