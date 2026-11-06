import { a as safeError, t as clamp } from "./utils-pryIKIhC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/llm.server-Bsi4ynMn.js
var HOUSE_URL = "https://api.x.ai/v1/chat/completions";
var HOUSE_MODEL = "grok-4.5";
function houseKey() {
	const key = process.env.XAI_API_KEY;
	if (!key) throw new Error("The house director is unavailable in this environment.");
	return key;
}
function assertEndpoint(raw) {
	let url;
	try {
		url = new URL(raw);
	} catch {
		throw new Error("Endpoint must be a full http(s) URL.");
	}
	if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Endpoint must use http or https.");
	const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
	if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host === "0.0.0.0" || host === "::1" || host === "metadata.google.internal" || /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host) || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) throw new Error("That address is private. The arena calls models from its own server, so a local model needs a public HTTPS URL or a tunnel.");
	return url.toString().replace(/\/$/, "");
}
function extraBody(extra) {
	if (!extra?.trim()) return {};
	try {
		const value = JSON.parse(extra);
		if (!value || typeof value !== "object" || Array.isArray(value)) return {};
		const copy = { ...value };
		for (const key of [
			"model",
			"messages",
			"stream",
			"system",
			"max_tokens",
			"temperature"
		]) delete copy[key];
		return copy;
	} catch {
		return {};
	}
}
function textFromContent(content) {
	if (typeof content === "string") return content;
	if (Array.isArray(content)) return content.map((part) => {
		if (typeof part === "string") return part;
		if (part && typeof part === "object") {
			const record = part;
			if (typeof record.text === "string") return record.text;
			if (typeof record.content === "string") return record.content;
		}
		return "";
	}).join("");
	return "";
}
function chatUrl(base) {
	const b = base.replace(/\/$/, "");
	if (b.endsWith("/chat/completions")) return b;
	if (b.endsWith("/v1")) return `${b}/chat/completions`;
	return `${b}/v1/chat/completions`;
}
function anthropicUrl(base) {
	const b = (base || "https://api.anthropic.com").replace(/\/$/, "");
	if (b.endsWith("/messages")) return b;
	if (b.endsWith("/v1")) return `${b}/messages`;
	return `${b}/v1/messages`;
}
function prepare(call, stream) {
	const kind = call.kind;
	const secret = kind === "house" ? houseKey() : (call.apiKey ?? "").trim();
	if (!secret) throw new Error("This model needs an API key. Add it under Models — it stays in this browser.");
	const temperature = clamp(call.temperature, 0, 2);
	const maxTokens = clamp(call.maxTokens, 32, kind === "house" ? 800 : 4e3);
	const model = (kind === "house" ? call.model || HOUSE_MODEL : call.model).trim();
	if (!model) throw new Error("Choose a model name.");
	const extra = extraBody(call.extra);
	const system = call.messages.find((m) => m.role === "system")?.content ?? "";
	const dialog = call.messages.filter((m) => m.role !== "system");
	if (kind === "anthropic") return {
		url: anthropicUrl(assertEndpoint(call.baseUrl || "https://api.anthropic.com")),
		secret,
		anthropic: true,
		headers: {
			"content-type": "application/json",
			"x-api-key": secret,
			"anthropic-version": "2023-06-01"
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
				content: m.content
			}))
		}
	};
	const url = kind === "house" ? HOUSE_URL : chatUrl(assertEndpoint(call.baseUrl));
	const headers = {
		"content-type": "application/json",
		authorization: `Bearer ${secret}`
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
			messages: call.messages.map((m) => ({
				role: m.role,
				content: m.content
			}))
		}
	};
}
async function readError(res, secret) {
	const text = await res.text().catch(() => "");
	return safeError(/* @__PURE__ */ new Error(`Provider ${res.status}: ${text.slice(0, 280) || res.statusText}`), secret);
}
async function fetchOnce(prep, signal) {
	const init = {
		method: "POST",
		headers: prep.headers,
		body: JSON.stringify(prep.body),
		signal
	};
	let res = await fetch(prep.url, init);
	if ((res.status === 429 || res.status === 503) && !signal?.aborted) {
		await new Promise((r) => setTimeout(r, 900));
		res = await fetch(prep.url, init);
	}
	return res;
}
function tokensFrom(usage, text) {
	if (usage && typeof usage === "object") {
		const u = usage;
		if (typeof u.total_tokens === "number") return u.total_tokens;
		const a = u.input_tokens ?? u.prompt_tokens ?? 0;
		const b = u.output_tokens ?? u.completion_tokens ?? 0;
		if (a || b) return a + b;
	}
	return Math.max(1, Math.ceil(text.length / 4));
}
async function completeChat(call, signal) {
	const prep = prepare(call, false);
	const res = await fetchOnce(prep, signal);
	if (!res.ok) throw new Error(await readError(res, prep.secret));
	const json = await res.json();
	const text = prep.anthropic ? (json.content ?? []).map((c) => c.text ?? "").join("") : textFromContent(json.choices?.[0]?.message?.content);
	if (!text.trim()) throw new Error("The model returned an empty reply.");
	return {
		text: text.trim(),
		tokens: tokensFrom(json.usage, text)
	};
}
async function streamChat(call, onDelta, signal) {
	const prep = prepare({ ...call }, true);
	const res = await fetchOnce(prep, signal);
	if (!res.ok) throw new Error(await readError(res, prep.secret));
	if ((res.headers.get("content-type") ?? "").includes("application/json") || !res.body) {
		const json = await res.json();
		const text = prep.anthropic ? (json.content ?? []).map((c) => c.text ?? "").join("") : textFromContent(json.choices?.[0]?.message?.content);
		if (!text.trim()) throw new Error("The model returned an empty reply.");
		onDelta(text);
		return {
			text: text.trim(),
			tokens: tokensFrom(json.usage, text)
		};
	}
	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buf = "";
	let text = "";
	let usage;
	const consume = (payload) => {
		if (!payload || payload === "[DONE]") return;
		let json;
		try {
			json = JSON.parse(payload);
		} catch {
			return;
		}
		const record = json;
		if (record.usage) usage = record.usage;
		if (record.message?.usage) usage = record.message.usage;
		let chunk = "";
		if (typeof record.delta?.text === "string") chunk = record.delta.text;
		else if (record.choices?.[0]?.delta?.content != null) chunk = textFromContent(record.choices[0].delta.content);
		else if (record.choices?.[0]?.message?.content != null && !text) chunk = textFromContent(record.choices[0].message.content);
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
	return {
		text: text.trim(),
		tokens: tokensFrom(usage, text)
	};
}
function extractJson(text) {
	const start = text.indexOf("{");
	const end = text.lastIndexOf("}");
	if (start < 0 || end <= start) throw new Error("The director did not return usable JSON.");
	return JSON.parse(text.slice(start, end + 1));
}
async function houseJson(system, user, maxTokens = 500) {
	const { text } = await completeChat({
		kind: "house",
		baseUrl: "",
		model: HOUSE_MODEL,
		temperature: .7,
		maxTokens,
		messages: [{
			role: "system",
			content: system
		}, {
			role: "user",
			content: user
		}]
	});
	return extractJson(text);
}
async function houseImage(prompt) {
	const key = houseKey();
	const res = await fetch("https://api.x.ai/v1/images/generations", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			authorization: `Bearer ${key}`
		},
		body: JSON.stringify({
			model: "grok-imagine-image",
			prompt: prompt.slice(0, 2e3),
			n: 1,
			response_format: "url"
		})
	});
	if (!res.ok) throw new Error(await readError(res, key));
	const first = (await res.json()).data?.[0];
	if (first?.url) return first.url;
	if (first?.b64_json) return `data:image/png;base64,${first.b64_json}`;
	throw new Error("The director did not return an image.");
}
//#endregion
export { completeChat, houseImage, houseJson, streamChat };
