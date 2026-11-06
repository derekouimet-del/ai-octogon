import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/arena/speak")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          text?: string;
          voiceProvider?: "house" | "elevenlabs" | "openai";
          voiceId?: string;
          elevenKey?: string;
          openaiKey?: string;
        };
        if (!body.voiceProvider || body.voiceProvider === ("none" as string)) {
          return new Response("No voice configured.", { status: 400 });
        }
        const { speakText } = await import("@/lib/arena/speak.server");
        return speakText({
          text: body.text ?? "",
          voiceProvider: body.voiceProvider,
          voiceId: body.voiceId ?? "",
          elevenKey: body.elevenKey,
          openaiKey: body.openaiKey,
        });
      },
    },
  },
});
