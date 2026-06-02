import { AppShell } from "@/components/AppShell";
import { MoodBadge } from "@/components/PlantMood";
import { loadPlants } from "@/lib/plant-store";
import type { Plant } from "@/lib/plant-types";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/plants/")({
  head: () => ({ meta: [{ title: "My Plants — PlantaSpeak AI" }] }),
  component: PlantsList,
});

function PlantsList() {
  const [plants, setPlants] = useState<Plant[]>([]);
  useEffect(() => {
    const sync = () => setPlants(loadPlants());
    sync();
    window.addEventListener("plantaspeak:updated", sync);
    return () => window.removeEventListener("plantaspeak:updated", sync);
  }, []);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-6 md:pt-10">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">My plants</h1>
            <p className="text-muted-foreground mt-2">
              {plants.length} {plants.length === 1 ? "plant" : "plants"} in your garden
            </p>
          </div>
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-leaf text-primary-foreground font-medium glow-leaf"
          >
            <ScanLine className="size-4" /> Scan plant
          </Link>
        </div>

        {plants.length === 0 ? (
          <Link
            to="/scan"
            className="mt-8 block glass p-12 text-center hover:bg-white/5 transition"
          >
            <div className="size-14 mx-auto rounded-2xl bg-leaf/15 flex items-center justify-center mb-3">
              <Plus className="size-6 text-leaf" />
            </div>
            <div className="font-medium">No plants yet</div>
            <p className="text-sm text-muted-foreground mt-1">Scan one to get started.</p>
          </Link>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {plants.map((p) => (
              <Link
                key={p.id}
                to="/plants/$plantId"
                params={{ plantId: p.id }}
                className="glass overflow-hidden hover:bg-white/5 transition"
              >
                <div className="aspect-[5/3] bg-black/30 relative">
                  {p.imageDataUrl ? (
                    <img src={p.imageDataUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {p.emoji}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <MoodBadge mood={p.mood} />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.emoji}</span>
                    <div className="font-medium">{p.name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{p.species}</div>
                  <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
                    {p.diary[0]?.text || p.introMessage}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
