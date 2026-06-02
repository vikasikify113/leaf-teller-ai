import type { Mood, PlantScores } from "@/lib/plant-types";
import { cn } from "@/lib/utils";

const MOOD_LABEL: Record<Mood, string> = {
  happy: "Thriving",
  ok: "Healthy",
  warning: "Needs attention",
  critical: "Critical",
};

const MOOD_STYLE: Record<Mood, string> = {
  happy: "bg-leaf/20 text-leaf border-leaf/30",
  ok: "bg-accent/20 text-accent border-accent/30",
  warning: "bg-warning/20 text-warning border-warning/30",
  critical: "bg-critical/20 text-critical border-critical/30",
};

export function MoodBadge({ mood }: { mood: Mood }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border",
        MOOD_STYLE[mood],
      )}
    >
      <span className="size-1.5 rounded-full bg-current animate-pulse-glow" />
      {MOOD_LABEL[mood]}
    </span>
  );
}

const SCORE_LABELS: Record<keyof PlantScores, string> = {
  happiness: "Happiness",
  health: "Health",
  hydration: "Hydration",
  nutrition: "Nutrition",
  growth: "Growth",
  diseaseRisk: "Disease risk",
};

function scoreColor(key: keyof PlantScores, value: number) {
  const inverted = key === "diseaseRisk";
  const good = inverted ? value < 30 : value >= 70;
  const bad = inverted ? value > 60 : value < 40;
  if (good) return "text-leaf";
  if (bad) return "text-critical";
  return "text-warning";
}

export function ScoreGrid({ scores }: { scores: PlantScores }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {(Object.keys(SCORE_LABELS) as (keyof PlantScores)[]).map((k) => {
        const v = scores[k];
        return (
          <div key={k} className="glass p-4">
            <div className="text-xs text-muted-foreground">{SCORE_LABELS[k]}</div>
            <div className={cn("text-2xl font-semibold mt-1", scoreColor(k, v))}>
              {Math.round(v)}
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  k === "diseaseRisk"
                    ? "bg-gradient-to-r from-leaf via-warning to-critical"
                    : "bg-gradient-to-r from-critical via-warning to-leaf",
                )}
                style={{ width: `${v}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
