import { AppShell } from "@/components/AppShell";
import { loadPlants } from "@/lib/plant-store";
import { generatePlantToPlantConversation } from "@/lib/plant-ai.functions";
import type { Plant } from "@/lib/plant-types";
import { useServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, MessageSquareMore, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [{ title: "Insights — PlantaSpeak AI" }] }),
  component: Insights,
});

function Insights() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialogue, setDialogue] = useState("");
  const [loading, setLoading] = useState(false);
  const chat = useServerFn(generatePlantToPlantConversation);

  useEffect(() => {
    const sync = () => setPlants(loadPlants());
    sync();
    window.addEventListener("plantaspeak:updated", sync);
    return () => window.removeEventListener("plantaspeak:updated", sync);
  }, []);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else if (next.size < 4) next.add(id);
    setSelected(next);
  }

  async function run() {
    if (selected.size < 2) {
      toast.error("Select at least 2 plants");
      return;
    }
    setLoading(true);
    setDialogue("");
    try {
      const picked = plants.filter((p) => selected.has(p.id));
      const res = await chat({
        data: {
          plants: picked.map((p) => ({
            name: p.name,
            species: p.species,
            mood: p.mood,
            notes: p.diary[0]?.text,
          })),
          language: "English",
        },
      });
      setDialogue(res.dialogue);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  // Aggregate insights
  const moods = plants.reduce(
    (acc, p) => ({ ...acc, [p.mood]: (acc[p.mood] || 0) + 1 }),
    {} as Record<string, number>,
  );
  const avgScores = plants.length
    ? (Object.keys(plants[0].scores) as (keyof Plant["scores"])[]).reduce(
        (acc, k) => ({ ...acc, [k]: plants.reduce((s, p) => s + p.scores[k], 0) / plants.length }),
        {} as Record<string, number>,
      )
    : null;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-6 md:pt-10">
        <h1 className="text-3xl md:text-4xl font-semibold">Insights</h1>
        <p className="text-muted-foreground mt-2">Patterns across your garden — and plant-to-plant conversations.</p>

        {/* Trends */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <div className="glass-strong p-5">
            <div className="text-sm text-muted-foreground mb-3">Garden mood</div>
            {plants.length === 0 ? (
              <div className="text-muted-foreground text-sm">Scan plants to see trends.</div>
            ) : (
              <div className="space-y-2">
                {Object.entries(moods).map(([m, n]) => (
                  <div key={m} className="flex items-center gap-3">
                    <div className="capitalize w-24 text-sm">{m}</div>
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-leaf to-accent"
                        style={{ width: `${(n / plants.length) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground w-8 text-right">{n}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-strong p-5">
            <div className="text-sm text-muted-foreground mb-3">Average scores</div>
            {!avgScores ? (
              <div className="text-muted-foreground text-sm">No data yet.</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(avgScores).map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs text-muted-foreground capitalize">{k}</div>
                    <div className="text-xl font-semibold text-leaf">{Math.round(v)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Plant-to-plant */}
        <div className="mt-10 glass-strong p-5 md:p-6">
          <div className="flex items-center gap-2">
            <MessageSquareMore className="size-5 text-leaf" />
            <h2 className="text-xl font-semibold">Plant-to-Plant Conversation</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Pick 2–4 plants and let them talk to each other.
          </p>

          {plants.length < 2 ? (
            <div className="mt-4 text-sm text-muted-foreground">
              Need at least 2 plants. Scan more from the Scan tab.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mt-4">
                {plants.map((p) => {
                  const on = selected.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggle(p.id)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        on
                          ? "bg-leaf text-primary-foreground border-leaf"
                          : "border-glass-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {p.emoji} {p.name}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={run}
                disabled={loading || selected.size < 2}
                className="mt-5 px-5 py-2.5 rounded-full bg-leaf text-primary-foreground font-medium glow-leaf disabled:opacity-50 inline-flex items-center gap-2"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Generate dialogue
              </button>
            </>
          )}

          {dialogue && (
            <div className="mt-5 glass p-4 whitespace-pre-wrap leading-relaxed text-sm">
              {dialogue}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
