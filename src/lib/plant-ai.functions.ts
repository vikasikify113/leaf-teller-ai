import { createServerFn } from "@tanstack/react-start";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const gw = createLovableAiGatewayProvider(key);
  return gw("google/gemini-2.5-flash");
}

const AnalysisSchema = z.object({
  species: z.string().describe("Best guess plant species or common name"),
  emoji: z.string().describe("A single fitting plant emoji"),
  scores: z.object({
    happiness: z.number().min(0).max(100),
    health: z.number().min(0).max(100),
    hydration: z.number().min(0).max(100),
    nutrition: z.number().min(0).max(100),
    growth: z.number().min(0).max(100),
    diseaseRisk: z.number().min(0).max(100),
  }),
  mood: z.enum(["happy", "ok", "warning", "critical"]),
  introMessage: z.string().describe("A warm, first-person greeting from the plant (2-3 sentences)"),
  diaryEntry: z.string().describe("A short first-person diary note about today's condition"),
  recommendations: z.array(z.string()).min(2).max(5),
  predictions: z
    .array(
      z.object({
        label: z.string(),
        probability: z.number().min(0).max(100),
        timeframe: z.string(),
      }),
    )
    .min(1)
    .max(4),
});

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

    const { object } = await generateObject({
      model,
      schema: AnalysisSchema,
      mode: "json",
      messages: [
        {
          role: "system",
          content: `You are PlantaSpeak AI. You analyze plant photos and let the plant speak in the first person.
Respond ONLY in ${data.language}. Be warm, conversational, and educational — never robotic.
The plant talks like a friendly intelligent being. Be honest about visible issues but encouraging.
You MUST return a valid JSON object matching the provided schema. All numeric scores are 0-100 integers. Mood must be one of: happy, ok, warning, critical.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this plant${data.nickname ? ` (the owner calls it "${data.nickname}")` : ""}. Identify species, assess visual health, and let the plant speak.`,
            },
            { type: "image", image: data.imageDataUrl },
          ],
        },
      ],
    });

    return object;
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
