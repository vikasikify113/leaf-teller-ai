import { AppShell } from "@/components/AppShell";
import { LANGUAGES, getLang, setLang, upsertPlant } from "@/lib/plant-store";
import { analyzePlantImage } from "@/lib/plant-ai.functions";
import type { Plant } from "@/lib/plant-types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Camera, ImagePlus, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "Scan a plant — PlantaSpeak AI" }] }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzePlantImage);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [nickname, setNickname] = useState("");
  const [language, setLanguage] = useState(getLang());
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreaming(true);
    } catch {
      toast.error("Camera unavailable — upload a photo instead.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreaming(false);
  }

  function capture() {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement("canvas");
    const w = Math.min(v.videoWidth, 1024);
    const ratio = v.videoHeight / v.videoWidth;
    canvas.width = w;
    canvas.height = Math.round(w * ratio);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    setImageDataUrl(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function runAnalysis() {
    if (!imageDataUrl) return;
    setLoading(true);
    setLang(language);
    try {
      const result = await analyze({ data: { imageDataUrl, nickname, language } });
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const plant: Plant = {
        id,
        name: nickname || result.species,
        species: result.species,
        emoji: result.emoji || "🌱",
        createdAt: now,
        imageDataUrl,
        scores: result.scores,
        mood: result.mood,
        introMessage: result.introMessage,
        recommendations: result.recommendations,
        predictions: result.predictions,
        diary: [
          {
            id: crypto.randomUUID(),
            date: now,
            text: result.diaryEntry,
            mood: result.mood,
            scores: result.scores,
            imageDataUrl,
          },
        ],
        chat: [],
      };
      upsertPlant(plant);
      toast.success(`${plant.name} introduced itself!`);
      navigate({ to: "/plants/$plantId", params: { plantId: id } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-6 md:pt-10">
        <h1 className="text-3xl md:text-4xl font-semibold">Scan a plant</h1>
        <p className="text-muted-foreground mt-2">
          Point your camera at any leaf, flower, fruit or whole plant.
        </p>

        <div className="glass-strong mt-6 p-4 md:p-6">
          {/* Capture surface */}
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 relative flex items-center justify-center">
            {imageDataUrl ? (
              <img src={imageDataUrl} alt="Plant" className="w-full h-full object-cover" />
            ) : streaming ? (
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            ) : (
              <div className="text-center text-muted-foreground p-6">
                <Camera className="size-10 mx-auto mb-3 opacity-60" />
                <div className="text-sm">Start the camera or upload a photo</div>
              </div>
            )}
            {streaming && !imageDataUrl && (
              <div className="absolute inset-0 pointer-events-none border-2 border-leaf/40 rounded-2xl animate-pulse-glow" />
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {imageDataUrl ? (
              <button
                onClick={() => setImageDataUrl(null)}
                className="px-4 py-2 rounded-full glass hover:bg-white/10 transition inline-flex items-center gap-2"
              >
                <RotateCcw className="size-4" /> Retake
              </button>
            ) : streaming ? (
              <button
                onClick={capture}
                className="px-6 py-2.5 rounded-full bg-leaf text-primary-foreground font-medium glow-leaf inline-flex items-center gap-2"
              >
                <Camera className="size-4" /> Capture
              </button>
            ) : (
              <>
                <button
                  onClick={startCamera}
                  className="px-5 py-2.5 rounded-full bg-leaf text-primary-foreground font-medium glow-leaf inline-flex items-center gap-2"
                >
                  <Camera className="size-4" /> Use camera
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-5 py-2.5 rounded-full glass inline-flex items-center gap-2 hover:bg-white/10 transition"
                >
                  <ImagePlus className="size-4" /> Upload
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={onUpload}
                />
              </>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          <label className="glass p-4 block">
            <span className="text-xs text-muted-foreground">Nickname (optional)</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Basil by the window"
              className="mt-1 w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground/60"
            />
          </label>
          <label className="glass p-4 block">
            <span className="text-xs text-muted-foreground">Plant speaks in</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 w-full bg-transparent outline-none text-foreground"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l} className="bg-background">
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          disabled={!imageDataUrl || loading}
          onClick={runAnalysis}
          className="mt-6 w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-leaf to-accent text-primary-foreground font-medium glow-leaf disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 hover:scale-[1.01] transition"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Listening to your plant…
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> Translate this plant
            </>
          )}
        </button>
      </div>
    </AppShell>
  );
}
