import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const gw = createLovableAiGatewayProvider(key);
  return gw("google/gemini-2.5-flash");
}

const score = z.coerce.number().min(0).max(100).catch(50);

const AnalysisSchema = z.object({
  species: z.string().catch("Unknown plant"),
  emoji: z.string().catch("🌱"),
  scores: z
    .object({
      happiness: score,
      health: score,
      hydration: score,
      nutrition: score,
      growth: score,
      diseaseRisk: score,
    })
    .catch({
      happiness: 50,
      health: 50,
      hydration: 50,
      nutrition: 50,
      growth: 50,
      diseaseRisk: 50,
    }),
  mood: z
    .string()
    .transform((v) => {
      const m = v.toLowerCase();
      if (["happy", "ok", "warning", "critical"].includes(m)) return m;
      return "ok";
    })
    .pipe(z.enum(["happy", "ok", "warning", "critical"]))
    .catch("ok"),
  introMessage: z.string().catch("Hello! I'm glad you're here."),
  diaryEntry: z.string().catch("Today felt like a normal day."),
  recommendations: z.array(z.string()).catch([]),
  predictions: z
    .array(
      z.object({
        label: z.string(),
        probability: score,
        timeframe: z.string().catch("soon"),
      }),
    )
    .catch([]),
});

function extractJSON(raw: string): unknown {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  if (!s.startsWith("{") && !s.startsWith("[")) {
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end > start) s = s.slice(start, end + 1);
  }
  return JSON.parse(s);
}

export const analyzePlantImage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        imageDataUrl: z.string().min(20),
        nickname: z.string().optional(),
        language: z.string().default("English"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const model = getModel();

    const { text } = await generateText({
      model,
      messages: [
        {
          role: "system",
          content: `You are PlantaSpeak AI. You analyze plant photos and let the plant speak in the first person.
Respond ONLY in ${data.language}. Be warm, conversational, and educational.

Return ONLY a raw JSON object (no markdown, no commentary) with EXACTLY this shape:
{
  "species": string,
  "emoji": string (single emoji),
  "scores": { "happiness": number 0-100, "health": number 0-100, "hydration": number 0-100, "nutrition": number 0-100, "growth": number 0-100, "diseaseRisk": number 0-100 },
  "mood": "happy" | "ok" | "warning" | "critical",
  "introMessage": string (2-3 sentences, first-person from the plant),
  "diaryEntry": string (short first-person diary note),
  "recommendations": string[] (2-5 items),
  "predictions": [{ "label": string, "probability": number 0-100, "timeframe": string }] (1-4 items)
}
Use raw numbers (no commas, no % signs).`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this plant${data.nickname ? ` (the owner calls it "${data.nickname}")` : ""}. Identify species, assess visual health, and let the plant speak. Return JSON only.`,
            },
            { type: "image", image: data.imageDataUrl },
          ],
        },
      ],
    });

    let parsed: unknown;
    try {
      parsed = extractJSON(text);
    } catch {
      throw new Error("The plant whispered something unreadable. Please try again.");
    }
    return AnalysisSchema.parse(parsed);
  });

export const generatePlantToPlantConversation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        plants: z
          .array(
            z.object({
              name: z.string(),
              species: z.string(),
              mood: z.string(),
              notes: z.string().optional(),
            }),
          )
          .min(2)
          .max(4),
        language: z.string().default("English"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const model = getModel();
    const { text } = await generateText({
      model,
      messages: [
        {
          role: "system",
          content: `Write a short, charming dialogue (6-10 turns) between these plants. Each line starts with the plant name then a colon. Respond ONLY in ${data.language}. Be warm and a little witty.`,
        },
        {
          role: "user",
          content: `Plants:\n${data.plants
            .map(
              (p) =>
                `- ${p.name} (${p.species}), mood: ${p.mood}${p.notes ? `, notes: ${p.notes}` : ""}`,
            )
            .join("\n")}`,
        },
      ],
    });
    return { dialogue: text };
  });
