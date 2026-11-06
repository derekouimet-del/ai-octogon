import { safeError } from "@/lib/utils";

export async function speakText(input: {
  text: string;
  voiceProvider: "house" | "elevenlabs" | "openai";
  voiceId: string;
  elevenKey?: string;
  openaiKey?: string;
}): Promise<Response> {
  const text = input.text.replace(/\s+/g, " ").trim().slice(0, 500);
  if (!text) return new Response("Nothing to speak.", { status: 400 });
  try {
    if (input.voiceProvider === "house") {
      const key = process.env.XAI_API_KEY;
      if (!key) return new Response("House voice is unavailable.", { status: 503 });
      const res = await fetch("https://api.x.ai/v1/tts", {
        method: "POST",
        headers: {
          authorization: `Bearer ${key}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice_id: input.voiceId || "eve",
          language: "en",
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        return new Response(safeError(new Error(err), key), { status: 502 });
      }
      const bytes = await res.arrayBuffer();
      return new Response(bytes, { headers: { "content-type": "audio/mpeg" } });
    }
    if (input.voiceProvider === "elevenlabs") {
      const key = input.elevenKey?.trim();
      if (!key) return new Response("Add an ElevenLabs key in Settings.", { status: 400 });
      const voice = input.voiceId || "21m00Tcm4TlvDq8ikWAM";
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`, {
        method: "POST",
        headers: {
          "xi-api-key": key,
          "content-type": "application/json",
          accept: "audio/mpeg",
        },
        body: JSON.stringify({ text, model_id: "eleven_turbo_v2_5" }),
      });
      if (!res.ok) return new Response(safeError(new Error(await res.text()), key), { status: 502 });
      return new Response(await res.arrayBuffer(), { headers: { "content-type": "audio/mpeg" } });
    }
    const key = input.openaiKey?.trim();
    if (!key) return new Response("Add an OpenAI speech key in Settings.", { status: 400 });
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: input.voiceId || "alloy",
        input: text,
      }),
    });
    if (!res.ok) return new Response(safeError(new Error(await res.text()), key), { status: 502 });
    return new Response(await res.arrayBuffer(), { headers: { "content-type": "audio/mpeg" } });
  } catch (err) {
    return new Response(safeError(err), { status: 502 });
  }
}
