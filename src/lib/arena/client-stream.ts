import { previewPathPrefix } from "@/lib/preview-path-prefix";
import type { TurnMessage, TurnResult } from "./types";
import { advanceTurnFn } from "./functions";

export function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
  return prefix ? `${prefix}${path}` : path;
}

export type StreamHandlers = {
  onMeta?: (speaker: "a" | "b") => void;
  onDelta?: (chunk: string) => void;
};

export async function streamTurn(
  sessionId: string,
  keys: Record<string, string>,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<TurnResult> {
  try {
    const res = await fetch(apiUrl("/api/arena/stream"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, keys }),
      signal,
    });
    if (!res.ok || !res.body) {
      return advanceTurnFn({ data: { sessionId, keys } });
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let result: TurnResult | null = null;
    let error: string | null = null;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const chunks = buf.split("\n\n");
      buf = chunks.pop() ?? "";
      for (const block of chunks) {
        let event = "message";
        let data = "";
        for (const line of block.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) data += line.slice(5).trim();
        }
        if (!data) continue;
        const json = JSON.parse(data) as {
          speaker?: "a" | "b";
          text?: string;
          error?: string;
          stop?: boolean;
          reason?: string | null;
          message?: TurnMessage | null;
          session?: TurnResult["session"];
        };
        if (event === "meta" && json.speaker) handlers.onMeta?.(json.speaker);
        if (event === "delta" && json.text) handlers.onDelta?.(json.text);
        if (event === "done") {
          result = {
            stop: Boolean(json.stop),
            reason: json.reason ?? null,
            message: json.message ?? null,
            session: json.session ?? null,
          };
        }
        if (event === "error") error = json.error ?? "The turn failed.";
      }
    }
    if (error && !result?.message) {
      return { stop: true, reason: "error", message: null, session: null, error };
    }
    return (
      result ?? { stop: true, reason: "empty", message: null, session: null, error: "The stream ended early." }
    );
  } catch (err) {
    if (signal?.aborted) {
      return { stop: true, reason: "aborted", message: null, session: null };
    }
    return advanceTurnFn({ data: { sessionId, keys } });
  }
}

export async function playSpeech(input: {
  text: string;
  voiceProvider: "house" | "elevenlabs" | "openai";
  voiceId: string;
  elevenKey?: string;
  openaiKey?: string;
}): Promise<void> {
  const res = await fetch(apiUrl("/api/arena/speak"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  await audio.play();
}
