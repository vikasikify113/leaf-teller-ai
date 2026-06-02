import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine, Sparkles, MessageCircle, BookOpen, TrendingUp, Globe } from "lucide-react";
import heroLeaf from "@/assets/hero-leaf.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PlantaSpeak AI — Talk To Your Plants" },
      {
        name: "description",
        content:
          "Scan any plant and hear what it has to say. Real-time AI plant health insights, diary, and care advice — spoken in your plant's own voice.",
      },
      { property: "og:title", content: "PlantaSpeak AI — Live Plant Translator" },
      {
        property: "og:description",
        content: "Hear your plants speak. AI-powered plant translator for farmers, gardeners, and researchers.",
      },
      { property: "og:image", content: heroLeaf },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: MessageCircle, title: "Live Plant Translator", text: "Point your camera. Hear your plant speak — health, mood, needs, all in first person." },
  { icon: Sparkles, title: "Mood Dashboard", text: "Six live scores: happiness, health, hydration, nutrition, growth, disease risk." },
  { icon: BookOpen, title: "Plant Diary & Memory", text: "Every scan is remembered. Track recovery, growth and stress over time." },
  { icon: TrendingUp, title: "Predictive Care", text: "Forecasts the next 7 days so you can act before stress becomes damage." },
  { icon: Globe, title: "Community Network", text: "Anonymous regional plant trends, disease maps and shared stories." },
  { icon: ScanLine, title: "6 Languages", text: "English, Hindi, Kannada, Tamil, Telugu, Malayalam — plants speak your tongue." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-gradient-to-br from-leaf to-accent glow-leaf" />
          <span className="font-semibold tracking-tight">
            Planta<span className="text-gradient-leaf">Speak</span>
          </span>
        </div>
        <Link
          to="/dashboard"
          className="px-4 py-2 rounded-full glass text-sm hover:bg-white/10 transition"
        >
          Open app
        </Link>
      </header>

      {/* Hero */}
      <section className="relative px-6 md:px-10 pt-10 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60 pointer-events-none">
          <img
            src={heroLeaf}
            alt=""
            width={1920}
            height={1080}
            className="w-full h-full object-cover blur-2xl scale-110"
          />
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-6">
            <span className="size-1.5 rounded-full bg-leaf animate-pulse-glow" />
            AI-powered plant translation
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight">
            Talk to your plants
            <br />
            <span className="text-gradient-leaf">with AI</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Scan any plant and receive real-time health insights — spoken directly by the plant itself.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-leaf text-primary-foreground font-medium glow-leaf hover:scale-[1.02] transition"
            >
              <ScanLine className="size-4" /> Start scanning
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass hover:bg-white/10 transition"
            >
              Watch demo
            </Link>
          </div>
        </div>

        {/* Floating glass card preview */}
        <div className="mt-16 max-w-2xl mx-auto glass-strong p-6 md:p-8 animate-float">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🌱</div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Tomato plant · just now</div>
              <p className="mt-2 text-foreground leading-relaxed">
                "Good morning. I look healthy today — though my lower leaves are starting to yellow.
                I may need a little extra nitrogen within the next few days."
              </p>
              <div className="mt-3 flex gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-leaf/20 text-leaf">Health 84</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning">Nutrition 62</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-10 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-center">
            More than disease detection
          </h2>
          <p className="text-center text-muted-foreground mt-3 max-w-xl mx-auto">
            A conversation with the living world — for farmers, gardeners, students and researchers.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass p-6 hover:bg-white/5 transition group">
                <div className="size-10 rounded-xl bg-leaf/15 flex items-center justify-center mb-4 group-hover:bg-leaf/25 transition">
                  <f.icon className="size-5 text-leaf" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 md:px-10 py-10 text-center text-xs text-muted-foreground">
        PlantaSpeak AI · The world's first live plant translator
      </footer>
    </div>
  );
}
