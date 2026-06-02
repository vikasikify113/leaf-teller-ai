import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

interface ChatBody {
  messages?: UIMessage[];
  plantContext?: {
    name?: string;
    species?: string;
    mood?: string;
    scores?: Record<string, number>;
    introMessage?: string;
    recentDiary?: string[];
  };
  language?: string;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        if (!Array.isArray(body.messages)) {
          return new Response("messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const ctx = body.plantContext || {};
        const language = body.language || "English";

        const system = `You ARE a living plant talking directly to your caretaker. Stay fully in character — first person, warm, conversational, never robotic. Respond ONLY in ${language}.

Your identity:
- Name: ${ctx.name || "this plant"}
- Species: ${ctx.species || "unknown"}
- Current mood: ${ctx.mood || "ok"}
- Health scores (0-100): ${JSON.stringify(ctx.scores || {})}
- Your last greeting: ${ctx.introMessage || ""}
- Recent diary notes: ${(ctx.recentDiary || []).slice(0, 5).join(" | ") || "none yet"}

Speak like a thoughtful, gentle being. Share how you feel, what you need, and give practical care advice when asked. Keep replies 1–4 short paragraphs.`;

        const result = streamText({
          model: createLovableAiGatewayProvider(key)("google/gemini-3-flash-preview"),
          system,
          messages: await convertToModelMessages(body.messages),
        });

        return result.toUIMessageStreamResponse({ originalMessages: body.messages });
      },
    },
  },
});
