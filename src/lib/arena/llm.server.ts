import { clamp, safeError } from "@/lib/utils";
import type { ProviderKind } from "./types";

export type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

export type LlmCall = {
  kind: ProviderKind;
  baseUrl: string;
  model: string;
  apiKey?: string;
  temperature: number;
  maxTokens: number;
  extra?: string;
  messages: ChatTurn[];
};

const HOUSE_URL = "https://api.x.ai/v1/chat/completions";
const HOUSE_MODEL = "grok-4.5";

function houseKey(): string {
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error("The house director is unavailable in this environment.");
  return key;
}

export function assertEndpoint(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Endpoint must be a full http(s) URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Endpoint must use http or https.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  const blocked =
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host === "metadata.google.internal" ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host) ||
    host.startsWith("fc") ||
    host.startsWith("fd") ||
    host.startsWith("fe80");
  if (blocked) {
    throw new Error(
      "That address is private. The arena calls models from its own server, so a local model needs a public HTTPS URL or a tunnel.",
    );
  }
  return url.toString().replace(/\/$/, "");
}

function extraBody(extra: string | undefined): Record<string, unknown> {
  if (!extra?.trim()) return {};
  try {
    const value = JSON.parse(extra) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const copy = { ...(value as Record<string, unknown>) };
    for (const key of ["model", "messages", "stream", "system", "max_tokens", "temperature"]) {
      delete copy[key];
    }
    return copy;
  } catch {
    return {};
  }
}

function textFromContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          const record = part as { text?: unknown; content?: unknown };
          if (typeof record.text === "string") return record.text;
          if (typeof record.content === "string") return record.content;
        }
        return "";
      })
      .join("");
  }
  return "";
}

function chatUrl(base: string): string {
  const b = base.replace(/\/$/, "");
  if (b.endsWith("/chat/completions")) return b;
  if (b.endsWith("/v1")) return `${b}/chat/completions`;
  return `${b}/v1/chat/completions`;
}

function anthropicUrl(base: string): string {
  const b = (base || "https://api.anthropic.com").replace(/\/$/, "");
  if (b.endsWith("/messages")) return b;
  if (b.endsWith("/v1")) return `${b}/messages`;
  return `${b}/v1/messages`;
}

type Prepared = {
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  secret: string;
  anthropic: boolean;
};

function prepare(call: LlmCall, stream: boolean): Prepared {
  const kind = call.kind;
  const secret = kind === "house" ? houseKey() : (call.apiKey ?? "").trim();
  if (!secret) throw new Error("This model needs an API key. Add it under Models — it stays in this browser.");

  const temperature = clamp(call.temperature, 0, 2);
  const maxTokens = clamp(
    call.maxTokens,
    32,
    kind === "house" ? 800 : 4000,
  );
  const model = (kind === "house" ? call.model || HOUSE_MODEL : call.model).trim();
  if (!model) throw new Error("Choose a model name.");

  const extra = extraBody(call.extra);
  const system = call.messages.find((m) => m.role === "system")?.content ?? "";
  const dialog = call.messages.filter((m) => m.role !== "system");

  if (kind === "anthropic") {
    const base = assertEndpoint(call.baseUrl || "https://api.anthropic.com");
    return {
      url: anthropicUrl(base),
      secret,
      anthropic: true,
      headers: {
        "content-type": "application/json",
        "x-api-key": secret,
        "anthropic-version": "2023-06-01",
      },
      body: {
        ...extra,
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        stream,
        messages: dialog.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      },
    };
  }

  const url = kind === "house" ? HOUSE_URL : chatUrl(assertEndpoint(call.baseUrl));
  const headers: Record<string, string> = {
    "content-type": "application/json",
    authorization: `Bearer ${secret}`,
  };
  if (kind === "openrouter") {
    headers["http-referer"] = "https://dyad.arena";
    headers["x-title"] = "DYAD";
  }
  return {
    url,
    headers,
    secret,
    anthropic: false,
    body: {
      ...extra,
      model,
      temperature,
      max_tokens: maxTokens,
      stream,
      messages: call.messages.map((m) => ({ role: m.role, content: m.content })),
    },
  };
}

async function readError(res: Response, secret: string): Promise<string> {
  const text = await res.text().catch(() => "");
  return safeError(new Error(`Provider ${res.status}: ${text.slice(0, 280) || res.statusText}`), secret);
}

async function fetchOnce(prep: Prepared, signal?: AbortSignal): Promise<Response> {
  const init: RequestInit = {
    method: "POST",
    headers: prep.headers,
    body: JSON.stringify(prep.body),
    signal,
  };
  let res = await fetch(prep.url, init);
  if ((res.status === 429 || res.status === 503) && !signal?.aborted) {
    await new Promise((r) => setTimeout(r, 900));
    res = await fetch(prep.url, init);
  }
  return res;
}

function tokensFrom(usage: unknown, text: string): number {
  if (usage && typeof usage === "object") {
    const u = usage as {
      total_tokens?: number;
      input_tokens?: number;
      output_tokens?: number;
      prompt_tokens?: number;
      completion_tokens?: number;
    };
    if (typeof u.total_tokens === "number") return u.total_tokens;
    const a = u.input_tokens ?? u.prompt_tokens ?? 0;
    const b = u.output_tokens ?? u.completion_tokens ?? 0;
    if (a || b) return a + b;
  }
  return Math.max(1, Math.ceil(text.length / 4));
}

export async function completeChat(call: LlmCall, signal?: AbortSignal): Promise<{ text: string; tokens: number }> {
  const prep = prepare(call, false);
  const res = await fetchOnce(prep, signal);
  if (!res.ok) throw new Error(await readError(res, prep.secret));
  const json = (await res.json()) as {
    choices?: { message?: { content?: unknown } }[];
    content?: { text?: string }[];
    usage?: unknown;
  };
  const text = prep.anthropic
    ? (json.content ?? []).map((c) => c.text ?? "").join("")
    : textFromContent(json.choices?.[0]?.message?.content);
  if (!text.trim()) throw new Error("The model returned an empty reply.");
  return { text: text.trim(), tokens: tokensFrom(json.usage, text) };
}

export async function streamChat(
  call: LlmCall,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<{ text: string; tokens: number }> {
  const prep = prepare({ ...call }, true);
  const res = await fetchOnce(prep, signal);
  if (!res.ok) throw new Error(await readError(res, prep.secret));
  const ctype = res.headers.get("content-type") ?? "";
  if (ctype.includes("application/json") || !res.body) {
    const json = (await res.json()) as {
      choices?: { message?: { content?: unknown } }[];
      content?: { text?: string }[];
      usage?: unknown;
    };
    const text = prep.anthropic
      ? (json.content ?? []).map((c) => c.text ?? "").join("")
      : textFromContent(json.choices?.[0]?.message?.content);
    if (!text.trim()) throw new Error("The model returned an empty reply.");
    onDelta(text);
    return { text: text.trim(), tokens: tokensFrom(json.usage, text) };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let text = "";
  let usage: unknown;
  const consume = (payload: string) => {
    if (!payload || payload === "[DONE]") return;
    let json: unknown;
    try {
      json = JSON.parse(payload);
    } catch {
      return;
    }
    const record = json as {
      choices?: { delta?: { content?: unknown }; message?: { content?: unknown } }[];
      delta?: { text?: string; type?: string };
      type?: string;
      usage?: unknown;
      message?: { usage?: unknown };
    };
    if (record.usage) usage = record.usage;
    if (record.message?.usage) usage = record.message.usage;
    let chunk = "";
    if (typeof record.delta?.text === "string") chunk = record.delta.text;
    else if (record.choices?.[0]?.delta?.content != null) {
      chunk = textFromContent(record.choices[0].delta.content);
    } else if (record.choices?.[0]?.message?.content != null && !text) {
      chunk = textFromContent(record.choices[0].message.content);
    }
    if (chunk) {
      text += chunk;
      onDelta(chunk);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      consume(trimmed.slice(5).trim());
    }
  }
  if (buf.trim().startsWith("data:")) consume(buf.trim().slice(5).trim());
  if (!text.trim()) throw new Error("The model streamed an empty reply.");
  return { text: text.trim(), tokens: tokensFrom(usage, text) };
}

export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The director did not return usable JSON.");
  return JSON.parse(text.slice(start, end + 1));
}

export async function houseJson(system: string, user: string, maxTokens = 500): Promise<unknown> {
  const { text } = await completeChat({
    kind: "house",
    baseUrl: "",
    model: HOUSE_MODEL,
    temperature: 0.7,
    maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return extractJson(text);
}

export async function houseImage(prompt: string): Promise<string> {
  const key = houseKey();
  const res = await fetch("https://api.x.ai/v1/images/generations", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "grok-imagine-image",
      prompt: prompt.slice(0, 2000),
      n: 1,
      response_format: "url",
    }),
  });
  if (!res.ok) throw new Error(await readError(res, key));
  const json = (await res.json()) as { data?: { url?: string; b64_json?: string }[] };
  const first = json.data?.[0];
  if (first?.url) return first.url;
  if (first?.b64_json) return `data:image/png;base64,${first.b64_json}`;
  throw new Error("The director did not return an image.");
}
