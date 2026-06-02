import { AppShell } from "@/components/AppShell";
import { MoodBadge } from "@/components/PlantMood";
import { loadPlants } from "@/lib/plant-store";
import type { Plant } from "@/lib/plant-types";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, AlertTriangle, Activity, ScanLine, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — PlantaSpeak AI" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [plants, setPlants] = useState<Plant[]>([]);
  useEffect(() => {
    const sync = () => setPlants(loadPlants());
    sync();
    window.addEventListener("plantaspeak:updated", sync);
    return () => window.removeEventListener("plantaspeak:updated", sync);
  }, []);

  const healthy = plants.filter((p) => p.mood === "happy" || p.mood === "ok").length;
  const attention = plants.filter((p) => p.mood === "warning" || p.mood === "critical").length;
  const alerts = plants
    .filter((p) => p.mood === "warning" || p.mood === "critical")
    .slice(0, 4);

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-5 md:px-8 pt-6 md:pt-10">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Welcome back</div>
            <h1 className="text-3xl md:text-4xl font-semibold mt-1">Your garden today</h1>
          </div>
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-leaf text-primary-foreground font-medium glow-leaf"
          >
            <ScanLine className="size-4" /> New scan
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          <Stat icon={Leaf} label="Total plants" value={plants.length} accent="leaf" />
          <Stat icon={Activity} label="Healthy" value={healthy} accent="accent" />
          <Stat icon={AlertTriangle} label="Need attention" value={attention} accent="warning" />
          <Stat icon={Activity} label="Diary entries" value={plants.reduce((a, p) => a + p.diary.length, 0)} accent="leaf" />
        </div>

        {/* Plant grid */}
        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-xl font-semibold">My plants</h2>
          <Link to="/plants" className="text-sm text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        </div>

        {plants.length === 0 ? (
          <Link
            to="/scan"
            className="mt-4 block glass p-10 text-center hover:bg-white/5 transition"
          >
            <div className="size-14 mx-auto rounded-2xl bg-leaf/15 flex items-center justify-center mb-3">
              <Plus className="size-6 text-leaf" />
            </div>
            <div className="font-medium">Scan your first plant</div>
            <p className="text-sm text-muted-foreground mt-1">
              Point your camera. The plant will introduce itself.
            </p>
          </Link>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {plants.slice(0, 6).map((p) => (
              <PlantCard key={p.id} plant={p} />
            ))}
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-10">Recent alerts</h2>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              {alerts.map((p) => (
                <Link
                  key={p.id}
                  to="/plants/$plantId"
                  params={{ plantId: p.id }}
                  className="glass p-4 flex items-start gap-3 hover:bg-white/5 transition"
                >
                  <div className="text-3xl">{p.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{p.name}</span>
                      <MoodBadge mood={p.mood} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {p.diary[0]?.text || p.introMessage}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  accent: "leaf" | "accent" | "warning";
}) {
  const tone =
    accent === "warning"
      ? "text-warning bg-warning/15"
      : accent === "accent"
      ? "text-accent bg-accent/15"
      : "text-leaf bg-leaf/15";
  return (
    <div className="glass p-4">
      <div className={`size-9 rounded-xl flex items-center justify-center ${tone}`}>
        <Icon className="size-4" />
      </div>
      <div className="text-2xl font-semibold mt-3">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function PlantCard({ plant }: { plant: Plant }) {
  return (
    <Link
      to="/plants/$plantId"
      params={{ plantId: plant.id }}
      className="glass overflow-hidden hover:bg-white/5 transition group"
    >
      <div className="aspect-[5/3] bg-black/30 relative">
        {plant.imageDataUrl ? (
          <img src={plant.imageDataUrl} alt={plant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {plant.emoji}
          </div>
        )}
        <div className="absolute top-3 left-3">
          <MoodBadge mood={plant.mood} />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{plant.emoji}</span>
          <div className="font-medium">{plant.name}</div>
        </div>
        <div className="text-xs text-muted-foreground">{plant.species}</div>
        <p className="text-sm mt-2 line-clamp-2 text-muted-foreground">
          {plant.diary[0]?.text || plant.introMessage}
        </p>
      </div>
    </Link>
  );
}
