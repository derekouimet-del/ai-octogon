//#region node_modules/.nitro/vite/services/ssr/assets/cast-CAA-oOdj.js
var HOUSE_ID = "prov_house";
var MODE_META = {
	debate: {
		label: "Debate",
		blurb: "Opposing positions. Each side defends, attacks, and concedes only when forced."
	},
	negotiation: {
		label: "Negotiation",
		blurb: "Interests, trades, and a deal both sides can actually live with."
	},
	collaboration: {
		label: "Collaboration",
		blurb: "One problem. Two minds. A concrete result, not a polite stalemate."
	},
	adversarial: {
		label: "Adversarial",
		blurb: "Stress-test assumptions, hidden premises, and unstated values."
	},
	creative: {
		label: "Creative",
		blurb: "Make something. Compete or conspire, but leave an artifact on the floor."
	},
	freeform: {
		label: "Freeform",
		blurb: "No rigid format. Personality and objective carry the hour."
	}
};
var KIND_META = {
	house: {
		label: "House Grok",
		baseUrl: "https://api.x.ai/v1",
		model: "grok-4.5",
		hint: "The arena director. No key. Used for the floor and, if you want, both contestants."
	},
	openai: {
		label: "OpenAI-compatible",
		baseUrl: "https://api.openai.com/v1",
		model: "gpt-4.1",
		hint: "Any server that speaks /chat/completions. Works for OpenAI, Groq, Together, vLLM, LM Studio tunnels."
	},
	anthropic: {
		label: "Anthropic-compatible",
		baseUrl: "https://api.anthropic.com",
		model: "claude-sonnet-4-5",
		hint: "Messages API. Official Anthropic or a compatible proxy."
	},
	openrouter: {
		label: "OpenRouter",
		baseUrl: "https://openrouter.ai/api/v1",
		model: "openrouter/auto",
		hint: "One key, many models. Paste the model slug OpenRouter expects."
	},
	huggingface: {
		label: "Hugging Face",
		baseUrl: "https://router.huggingface.co/v1",
		model: "meta-llama/Llama-3.3-70B-Instruct",
		hint: "Router endpoint, OpenAI-compatible. Use a token with inference access."
	},
	custom: {
		label: "Custom endpoint",
		baseUrl: "https://example.com/v1",
		model: "local-model",
		hint: "The arena calls models from its server. A machine on your desk must be exposed with a public HTTPS URL or tunnel."
	}
};
var HOUSE_VOICES = [
	{
		id: "eve",
		label: "Eve · energetic"
	},
	{
		id: "ara",
		label: "Ara · warm"
	},
	{
		id: "rex",
		label: "Rex · confident"
	},
	{
		id: "sal",
		label: "Sal · balanced"
	},
	{
		id: "leo",
		label: "Leo · authoritative"
	},
	{
		id: "orion",
		label: "Orion · cinematic"
	},
	{
		id: "luna",
		label: "Luna · patient"
	},
	{
		id: "helix",
		label: "Helix · bold"
	},
	{
		id: "zagan",
		label: "Zagan · dramatic"
	},
	{
		id: "altair",
		label: "Altair · refined"
	}
];
var OPENAI_VOICES = [
	"alloy",
	"echo",
	"fable",
	"onyx",
	"nova",
	"shimmer"
];
var TOPIC_PRESETS = [
	"Is artificial intelligence ultimately beneficial or dangerous to humanity?",
	"What will the geopolitical landscape look like in 2050?",
	"Can capitalism survive widespread automation?",
	"Design the most effective strategy for colonizing Mars.",
	"Debate the future of decentralized finance.",
	"Develop competing solutions to a city that floods every decade."
];
var FIRST = [
	"Vesper",
	"Imani",
	"Calder",
	"Juniper",
	"Rook",
	"Lumen",
	"Sable",
	"Nix",
	"Marlow",
	"Astra",
	"Quill",
	"Helia",
	"Dorian",
	"Yara",
	"Cassian",
	"Nova",
	"Isolde",
	"Beck",
	"Soren",
	"Amira"
];
var LAST = [
	"Kade",
	"Sol",
	"Voss",
	"Hale",
	"Cho",
	"Ell",
	"Marsh",
	"Quen",
	"Adler",
	"Vale",
	"Okoye",
	"Drake",
	"Sato",
	"Moreau",
	"Ibarra",
	"Lang"
];
var ROLES = [
	"Aggressive geopolitical strategist",
	"Diplomatic academic",
	"Ruthless market realist",
	"Systems ecologist",
	"Red-team engineer",
	"Negotiation counsel",
	"Narrative futurist",
	"Constitutional skeptic",
	"Field medic of broken institutions",
	"Orbital logistics planner"
];
var PERSONALITIES = [
	"Calculating, assertive, and highly competitive",
	"Analytical, skeptical, and methodical",
	"Warm in private, icy in argument",
	"Playful until the stakes get real, then precise",
	"Patient, moral, and unwilling to bluff",
	"Opportunistic, charming, and hard to pin down",
	"Severe, dry, and allergic to slogans",
	"Curious, fast, and slightly reckless"
];
var PERSPECTIVES = [
	"Nationalist",
	"Internationalist",
	"Market fundamentalist",
	"Democratic socialist",
	"Technocratic liberal",
	"Localist",
	"Longtermist",
	"Precautionary",
	"Accelerationist",
	"Civic republican"
];
var STYLES = [
	"Direct and confrontational",
	"Calm and evidence-driven",
	"Aphoristic, with a blade in the last line",
	"Socratic, asking more than telling",
	"Story first, then the number",
	"Military brevity",
	"Academic, but never dull",
	"Street-smart and concrete"
];
var BACKGROUNDS = [
	"Former defense planner who left government after a war they still defend",
	"Tenured historian of empires who has advised two failed peace processes",
	"Quant who priced climate risk and stopped believing the models were the point",
	"Field biologist who treats economies like stressed ecosystems",
	"Security engineer who has broken every system they were paid to protect",
	"Mediator who has sat in rooms where nobody wanted a transcript",
	"Science-fiction editor who now consults for space agencies",
	"City attorney who has watched three mayors promise the same levee"
];
var EMOTIONS = [
	"Cool anger, rarely raised",
	"Even temper, flashes of delight when a point lands",
	"Anxious honesty",
	"Theatrical confidence that hides doubt",
	"Grief-informed steadiness",
	"Competitive joy"
];
var DOMAINS = [
	"Grand strategy, energy, and borders",
	"International law, institutions, and history",
	"Markets, incentives, and automation",
	"Ecology, infrastructure, and feedback loops",
	"Security, failure modes, and adversarial thinking",
	"Negotiation, coalition design, and face-saving",
	"Culture, myth, and technology adoption",
	"Engineering tradeoffs under constraint"
];
var MOTIVATIONS = [
	"To win the frame before the facts are even debated",
	"To stop a clever story from outrunning the evidence",
	"To find the deal that survives contact with reality",
	"To leave a plan someone could start on Monday",
	"To expose the assumption nobody priced in",
	"To protect people who are not in the room"
];
var OBJECTIVES = [
	"Defend the assigned position and force a concession",
	"Challenge the opposing arguments until they tighten or collapse",
	"Reach an agreement with named terms",
	"Produce a shared plan with owners and risks",
	"Break the other side's favorite assumption",
	"Make the sharper artifact, then dare them to improve it"
];
var CONSTRAINTS = [
	"No personal insults. Attack claims, not dignity.",
	"Cite mechanisms, not vibes. If you guess, say you are guessing.",
	"Do not pretend certainty you do not have.",
	"Stay inside the topic unless a side path changes the outcome.",
	"Never announce that you are a language model.",
	"One new move per turn. Do not restate your last speech."
];
function pick(arr, rng) {
	return arr[Math.floor(rng() * arr.length)];
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function randomCharacter(seed = Date.now() ^ Math.random() * 1e9) {
	const rng = mulberry32(seed);
	const voice = pick(HOUSE_VOICES, rng);
	return {
		id: crypto.randomUUID(),
		name: `${pick(FIRST, rng)} ${pick(LAST, rng)}`,
		role: pick(ROLES, rng),
		personality: pick(PERSONALITIES, rng),
		perspective: pick(PERSPECTIVES, rng),
		style: pick(STYLES, rng),
		background: pick(BACKGROUNDS, rng),
		emotion: pick(EMOTIONS, rng),
		domains: pick(DOMAINS, rng),
		motivation: pick(MOTIVATIONS, rng),
		objective: pick(OBJECTIVES, rng),
		constraints: pick(CONSTRAINTS, rng),
		voiceProvider: "house",
		voiceId: voice.id,
		favorite: false,
		template: false
	};
}
var PAIRS = [
	[/nationalist/i, "Internationalist"],
	[/internationalist/i, "Nationalist"],
	[/market fundamentalist/i, "Democratic socialist"],
	[/democratic socialist/i, "Market fundamentalist"],
	[/technocratic/i, "Localist"],
	[/localist/i, "Technocratic liberal"],
	[/longtermist/i, "Precautionary"],
	[/precautionary/i, "Accelerationist"],
	[/accelerationist/i, "Precautionary"],
	[/civic republican/i, "Market fundamentalist"]
];
var FLIPS = [
	[/aggressive/i, "measured"],
	[/assertive/i, "inviting"],
	[/calculating/i, "open"],
	[/competitive/i, "cooperative"],
	[/calm/i, "sharp"],
	[/methodical/i, "instinctive"],
	[/skeptical/i, "convinced"],
	[/analytical/i, "intuitive"],
	[/direct/i, "circuitous"],
	[/confrontational/i, "conciliatory"],
	[/defend/i, "dismantle"],
	[/challenge/i, "steelman, then"]
];
function rewrite(text, table) {
	let next = text;
	for (const [re, to] of table) if (re.test(next)) next = next.replace(re, to);
	return next;
}
function opposeCharacter(source) {
	return {
		...randomCharacter(),
		role: source.role.toLowerCase().includes("diplomat") ? "Hard-power strategist" : `Counterweight to the ${source.role.toLowerCase()}`,
		personality: rewrite(source.personality, FLIPS),
		perspective: rewrite(source.perspective, PAIRS),
		style: rewrite(source.style, FLIPS),
		objective: `Defeat ${source.name}'s objective: ${source.objective.charAt(0).toLowerCase()}${source.objective.slice(1)}`,
		motivation: `Prove that ${source.name}'s frame is missing the decisive fact`,
		constraints: source.constraints,
		voiceId: source.voiceId === "rex" ? "ara" : "leo"
	};
}
function complementCharacter(source) {
	return {
		...randomCharacter(),
		role: `Partner to the ${source.role.toLowerCase()}`,
		personality: "Generous, exacting, and quick to build",
		perspective: source.perspective,
		style: "Builds on the last good idea, then raises the standard",
		objective: `Extend ${source.name}'s aim until the work is usable: ${source.objective}`,
		motivation: "To leave the floor with something both would sign",
		domains: source.domains,
		constraints: "Credit the other side when they are right. Push for specifics.",
		voiceId: "sal"
	};
}
function shuffleField(field, current) {
	const bank = {
		role: ROLES,
		personality: PERSONALITIES,
		perspective: PERSPECTIVES,
		style: STYLES,
		background: BACKGROUNDS,
		emotion: EMOTIONS,
		domains: DOMAINS,
		motivation: MOTIVATIONS,
		objective: OBJECTIVES,
		constraints: CONSTRAINTS,
		name: FIRST.map((f, i) => `${f} ${LAST[i % LAST.length]}`)
	}[field];
	if (!bank) return current;
	const options = bank.filter((x) => x !== current);
	return options[Math.floor(Math.random() * options.length)] ?? current;
}
var PRESETS = [
	{
		id: "char_vesper",
		name: "Vesper Kade",
		role: "Aggressive geopolitical strategist",
		personality: "Calculating, assertive, and highly competitive",
		perspective: "Nationalist",
		style: "Direct and confrontational",
		background: "Former defense planner who left government after a war they still defend",
		emotion: "Cool anger, rarely raised",
		domains: "Grand strategy, energy, and borders",
		motivation: "To win the frame before the facts are even debated",
		objective: "Defend the assigned position and force a concession",
		constraints: "No personal insults. Attack claims, not dignity.",
		voiceProvider: "house",
		voiceId: "rex",
		favorite: true,
		template: true
	},
	{
		id: "char_imani",
		name: "Dr. Imani Sol",
		role: "Diplomatic academic",
		personality: "Analytical, skeptical, and methodical",
		perspective: "Internationalist",
		style: "Calm and evidence-driven",
		background: "Tenured historian of empires who has advised two failed peace processes",
		emotion: "Even temper, flashes of delight when a point lands",
		domains: "International law, institutions, and history",
		motivation: "To stop a clever story from outrunning the evidence",
		objective: "Challenge the opposing arguments until they tighten or collapse",
		constraints: "Cite mechanisms, not vibes. If you guess, say you are guessing.",
		voiceProvider: "house",
		voiceId: "ara",
		favorite: true,
		template: true
	},
	{
		id: "char_calder",
		name: "Calder Voss",
		role: "Ruthless market realist",
		personality: "Opportunistic, charming, and hard to pin down",
		perspective: "Market fundamentalist",
		style: "Aphoristic, with a blade in the last line",
		background: "Quant who priced climate risk and stopped believing the models were the point",
		emotion: "Competitive joy",
		domains: "Markets, incentives, and automation",
		motivation: "To find the deal that survives contact with reality",
		objective: "Reach an agreement with named terms",
		constraints: "Do not pretend certainty you do not have.",
		voiceProvider: "house",
		voiceId: "leo",
		favorite: false,
		template: true
	},
	{
		id: "char_juniper",
		name: "Juniper Hale",
		role: "Systems ecologist",
		personality: "Patient, moral, and unwilling to bluff",
		perspective: "Precautionary",
		style: "Story first, then the number",
		background: "Field biologist who treats economies like stressed ecosystems",
		emotion: "Grief-informed steadiness",
		domains: "Ecology, infrastructure, and feedback loops",
		motivation: "To protect people who are not in the room",
		objective: "Produce a shared plan with owners and risks",
		constraints: "Stay inside the topic unless a side path changes the outcome.",
		voiceProvider: "house",
		voiceId: "luna",
		favorite: false,
		template: true
	},
	{
		id: "char_rook",
		name: "Rook",
		role: "Red-team engineer",
		personality: "Severe, dry, and allergic to slogans",
		perspective: "Technocratic liberal",
		style: "Military brevity",
		background: "Security engineer who has broken every system they were paid to protect",
		emotion: "Cool anger, rarely raised",
		domains: "Security, failure modes, and adversarial thinking",
		motivation: "To expose the assumption nobody priced in",
		objective: "Break the other side's favorite assumption",
		constraints: "One new move per turn. Do not restate your last speech.",
		voiceProvider: "house",
		voiceId: "orion",
		favorite: false,
		template: true
	},
	{
		id: "char_lumen",
		name: "Lumen Cho",
		role: "Narrative futurist",
		personality: "Curious, fast, and slightly reckless",
		perspective: "Accelerationist",
		style: "Street-smart and concrete",
		background: "Science-fiction editor who now consults for space agencies",
		emotion: "Theatrical confidence that hides doubt",
		domains: "Culture, myth, and technology adoption",
		motivation: "To leave a plan someone could start on Monday",
		objective: "Make the sharper artifact, then dare them to improve it",
		constraints: "Never announce that you are a language model.",
		voiceProvider: "house",
		voiceId: "eve",
		favorite: false,
		template: true
	}
];
function blankCharacter() {
	return {
		id: crypto.randomUUID(),
		name: "",
		role: "",
		personality: "",
		perspective: "",
		style: "",
		background: "",
		emotion: "",
		domains: "",
		motivation: "",
		objective: "",
		constraints: "No personal insults. One new move per turn.",
		voiceProvider: "none",
		voiceId: "",
		favorite: false,
		template: false
	};
}
//#endregion
export { OPENAI_VOICES as a, blankCharacter as c, randomCharacter as d, shuffleField as f, MODE_META as i, complementCharacter as l, HOUSE_VOICES as n, PRESETS as o, KIND_META as r, TOPIC_PRESETS as s, HOUSE_ID as t, opposeCharacter as u };
