import { AppShell } from "@/components/AppShell";
import { MoodBadge, ScoreGrid } from "@/components/PlantMood";
import { deletePlant, getLang, getPlant, loadPlants } from "@/lib/plant-store";
import type { Plant } from "@/lib/plant-types";
import { useChat } from "@ai-sdk/react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowLeft, BookOpen, MessageCircle, Mic, MicOff, Send, Sparkles, TrendingUp, Trash2, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/plants/$plantId")({
  head: () => ({ meta: [{ title: "Plant — PlantaSpeak AI" }] }),
  component: PlantDetail,
});

type Tab = "chat" | "diary" | "predict";

function SpeakButton({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  const toggle = () => {
    const synth = window.speechSynthesis;
    if (!synth) {
      toast.error("Voice not supported in this browser.");
      return;
    }
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.05;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  };
  return (
    <button
      onClick={toggle}
      aria-label={speaking ? "Stop voice" : "Read aloud"}
      className="size-9 shrink-0 rounded-full glass hover:bg-leaf/20 transition flex items-center justify-center text-leaf"
    >
      {speaking ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
    </button>
  );
}

function PlantDetail() {
  const { plantId } = useParams({ from: "/plants/$plantId" });
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | undefined>();
  const [tab, setTab] = useState<Tab>("chat");

  useEffect(() => {
    const sync = () => setPlant(getPlant(plantId));
    sync();
    window.addEventListener("plantaspeak:updated", sync);
    return () => window.removeEventListener("plantaspeak:updated", sync);
  }, [plantId]);

  if (!plant) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-5 pt-10 text-center">
          <p className="text-muted-foreground">Plant not found.</p>
          <button onClick={() => navigate({ to: "/plants" })} className="mt-4 text-leaf">
            Back to plants
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-5 md:px-8 pt-4 md:pt-8">
        <button
          onClick={() => navigate({ to: "/plants" })}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="size-4" /> All plants
        </button>

        {/* Header card */}
        <div className="glass-strong overflow-hidden">
          <div className="aspect-[16/7] bg-black/40 relative">
            {plant.imageDataUrl ? (
              <img src={plant.imageDataUrl} alt={plant.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {plant.emoji}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
              <div>
                <MoodBadge mood={plant.mood} />
                <h1 className="text-2xl md:text-4xl font-semibold mt-2 flex items-center gap-2">
                  <span>{plant.emoji}</span> {plant.name}
                </h1>
                <div className="text-sm text-muted-foreground">{plant.species}</div>
              </div>
              <button
                onClick={() => {
                  if (confirm("Delete this plant?")) {
                    deletePlant(plant.id);
                    navigate({ to: "/plants" });
                  }
                }}
                className="size-9 rounded-full glass hover:bg-critical/20 transition flex items-center justify-center text-muted-foreground hover:text-critical"
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="glass mt-4 p-5 flex gap-3 items-start">
          <Sparkles className="size-4 text-leaf mt-1 shrink-0" />
          <p className="text-foreground leading-relaxed italic flex-1">"{plant.introMessage}"</p>
          <SpeakButton text={plant.introMessage} />
        </div>

        {/* Scores */}
        <div className="mt-6">
          <ScoreGrid scores={plant.scores} />
        </div>

        {/* Tabs */}
        <div className="mt-8 glass p-1 flex gap-1 w-fit mx-auto">
          {(
            [
              { id: "chat", label: "Chat", icon: MessageCircle },
              { id: "diary", label: "Diary", icon: BookOpen },
              { id: "predict", label: "Predict", icon: TrendingUp },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm inline-flex items-center gap-2 transition ${
                tab === t.id
                  ? "bg-leaf text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="size-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "chat" && <PlantChat plant={plant} />}
          {tab === "diary" && <DiaryView plant={plant} />}
          {tab === "predict" && <PredictView plant={plant} />}
        </div>
      </div>
    </AppShell>
  );
}

function PlantChat({ plant }: { plant: Plant }) {
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const initialMessages = useMemo<UIMessage[]>(
    () =>
      plant.chat.length
        ? plant.chat.map((m) => ({
            id: m.id,
            role: m.role,
            parts: [{ type: "text", text: m.text }],
          }))
        : [
            {
              id: "intro",
              role: "assistant",
              parts: [{ type: "text", text: plant.introMessage }],
            },
          ],
    [plant.id],
  );

  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    id: plant.id,
    messages: initialMessages,
    transport,
    onFinish: ({ message }) => {
      const text = message.parts
        .map((p) => (p.type === "text" ? p.text : ""))
        .join("")
        .trim();
      if (text) {
        // persist last user + assistant
        import("@/lib/plant-store").then(({ appendChat, getPlant: gp, upsertPlant }) => {
          const fresh = gp(plant.id);
          if (!fresh) return;
          // append assistant
          appendChat(plant.id, {
            id: message.id,
            role: "assistant",
            text,
            ts: Date.now(),
          });
          // and ensure the latest user message is persisted
          let lastUser: UIMessage | undefined;
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === "user") {
              lastUser = messages[i];
              break;
            }
          }
          if (lastUser) {
            const utext = lastUser.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            if (utext && !fresh.chat.some((c) => c.id === lastUser!.id)) {
              appendChat(plant.id, {
                id: lastUser.id,
                role: "user",
                text: utext,
                ts: Date.now() - 1,
              });
            }
          }
          void upsertPlant;
        });
      }
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, status]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  function onSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || status === "submitted" || status === "streaming") return;
    const ctx = {
      name: plant.name,
      species: plant.species,
      mood: plant.mood,
      scores: plant.scores as unknown as Record<string, number>,
      introMessage: plant.introMessage,
      recentDiary: plant.diary.slice(0, 5).map((d) => d.text),
    };
    sendMessage(
      { text: input.trim() },
      { body: { plantContext: ctx, language: getLang() } },
    );
    setInput("");
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  const loading = status === "submitted" || status === "streaming";

  return (
    <div className="glass-strong p-4 md:p-6 flex flex-col h-[60vh] min-h-[420px]">
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m) => {
          const text = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          if (!text) return null;
          if (m.role === "assistant") {
            return (
              <div key={m.id} className="flex gap-3">
                <div className="size-8 shrink-0 rounded-full bg-leaf/20 flex items-center justify-center text-lg">
                  {plant.emoji}
                </div>
                <div className="flex-1 pt-1 leading-relaxed whitespace-pre-wrap">{text}</div>
              </div>
            );
          }
          return (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-2.5 bg-primary text-primary-foreground whitespace-pre-wrap">
                {text}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex gap-3 items-center text-muted-foreground">
            <div className="size-8 shrink-0 rounded-full bg-leaf/20 flex items-center justify-center text-lg">
              {plant.emoji}
            </div>
            <span className="text-sm animate-pulse">Thinking…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSend} className="mt-4 glass rounded-2xl p-2 flex gap-2 items-end">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={1}
          placeholder={`Ask ${plant.name} anything…`}
          className="flex-1 bg-transparent outline-none resize-none px-3 py-2 max-h-32"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="size-10 rounded-xl bg-leaf text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}

function DiaryView({ plant }: { plant: Plant }) {
  if (plant.diary.length === 0) {
    return <div className="text-center text-muted-foreground py-10">No diary entries yet.</div>;
  }
  return (
    <div className="space-y-3">
      {plant.diary.map((d) => (
        <div key={d.id} className="glass p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{new Date(d.date).toLocaleString()}</span>
            <MoodBadge mood={d.mood} />
          </div>
          <p className="mt-2 leading-relaxed">{d.text}</p>
        </div>
      ))}
    </div>
  );
}

function PredictView({ plant }: { plant: Plant }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Future health forecast</h3>
        <div className="space-y-2">
          {plant.predictions.map((p, i) => (
            <div key={i} className="glass p-4 flex items-center gap-4">
              <div className="text-2xl font-semibold text-leaf min-w-[60px]">
                {Math.round(p.probability)}%
              </div>
              <div className="flex-1">
                <div className="font-medium">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.timeframe}</div>
                <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-leaf to-accent rounded-full"
                    style={{ width: `${p.probability}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Care recommendations</h3>
        <ul className="space-y-2">
          {plant.recommendations.map((r, i) => (
            <li key={i} className="glass p-4 flex gap-3">
              <Sparkles className="size-4 text-leaf shrink-0 mt-0.5" />
              <span className="text-sm leading-relaxed">{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Suppress unused warning
void loadPlants;
