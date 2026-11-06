import { o as __toESM } from "../_runtime.mjs";
import { i as MODE_META, s as TOPIC_PRESETS } from "./cast-CAA-oOdj.mjs";
import { S as useNavigate, Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { T as paintBackdropFn, g as createSessionFn, j as stageShowdownFn, r as Route$3 } from "./router-DUTqb6IF.mjs";
import { n as useVault, t as useHydrated } from "./vault-BHyMzYsN.mjs";
import { a as SelectInput, i as Pill, n as Field, o as TextArea, r as Panel, s as TextInput, t as Button } from "./ui-C1kFAxUP.mjs";
import { t as MODES } from "./types-BEgKCHv-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/setup-BgbZJaEE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function toSnapshot(character, provider, extra = "") {
	return {
		characterId: character.id,
		name: character.name,
		role: character.role,
		personality: character.personality,
		perspective: character.perspective,
		style: character.style,
		background: character.background,
		emotion: character.emotion,
		domains: character.domains,
		motivation: character.motivation,
		objective: character.objective,
		constraints: character.constraints,
		extra,
		voiceProvider: character.voiceProvider,
		voiceId: character.voiceId,
		portraitUrl: character.portraitUrl,
		provider: {
			id: provider.id,
			name: provider.name,
			kind: provider.kind,
			baseUrl: provider.baseUrl,
			model: provider.model,
			temperature: provider.temperature,
			maxTokens: provider.maxTokens,
			contextTurns: provider.contextTurns,
			extra: provider.extra
		}
	};
}
function Stage() {
	const { characters, providers } = Route$3.useLoaderData();
	const navigate = useNavigate();
	const hydrated = useHydrated();
	const defaults = useVault((s) => ({
		exchanges: s.defaultExchanges,
		budget: s.defaultBudget,
		speed: s.defaultSpeed
	}));
	const keys = useVault((s) => s.keys);
	const house = providers.find((p) => p.id === "prov_house") ?? providers[0];
	const a0 = characters.find((c) => c.id === "char_vesper") ?? characters[0];
	const b0 = characters.find((c) => c.id === "char_imani") ?? characters[1] ?? characters[0];
	const [mode, setMode] = (0, import_react.useState)("debate");
	const [topic, setTopic] = (0, import_react.useState)(TOPIC_PRESETS[0] ?? "");
	const [charA, setCharA] = (0, import_react.useState)(a0?.id ?? "");
	const [charB, setCharB] = (0, import_react.useState)(b0?.id ?? "");
	const [provA, setProvA] = (0, import_react.useState)(house?.id ?? "");
	const [provB, setProvB] = (0, import_react.useState)(house?.id ?? "");
	const [extraA, setExtraA] = (0, import_react.useState)("");
	const [extraB, setExtraB] = (0, import_react.useState)("");
	const [maxExchanges, setMaxExchanges] = (0, import_react.useState)(defaults.exchanges);
	const [tokenBudget, setTokenBudget] = (0, import_react.useState)(defaults.budget);
	const [speedMs, setSpeedMs] = (0, import_react.useState)(defaults.speed);
	const [allowConclusion, setAllowConclusion] = (0, import_react.useState)(true);
	const [isPublic, setIsPublic] = (0, import_react.useState)(true);
	const [design, setDesign] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const characterA = characters.find((c) => c.id === charA);
	const characterB = characters.find((c) => c.id === charB);
	const providerA = providers.find((p) => p.id === provA);
	const providerB = providers.find((p) => p.id === provB);
	const keyNote = (0, import_react.useMemo)(() => {
		if (!hydrated) return null;
		const missing = [providerA, providerB].filter((p) => p && p.kind !== "house" && !keys[p.id]);
		if (!missing.length) return null;
		return `Missing a browser key for ${missing.map((p) => p.name).join(" and ")}.`;
	}, [
		hydrated,
		keys,
		providerA,
		providerB
	]);
	async function stageIt() {
		if (!characterA || !characterB) return;
		setBusy("stage");
		try {
			const next = await stageShowdownFn({ data: {
				topic,
				mode,
				a: {
					name: characterA.name,
					role: characterA.role,
					perspective: characterA.perspective,
					objective: characterA.objective
				},
				b: {
					name: characterB.name,
					role: characterB.role,
					perspective: characterB.perspective,
					objective: characterB.objective
				}
			} });
			setDesign(next);
			toast.success("The director staged the floor");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Staging failed");
		} finally {
			setBusy(null);
		}
	}
	async function backdrop() {
		if (!design) {
			toast.error("Stage the floor before rendering it.");
			return;
		}
		setBusy("backdrop");
		try {
			const { url } = await paintBackdropFn({ data: {
				design,
				topic
			} });
			setDesign({
				...design,
				backdropUrl: url
			});
			toast.success("Floor rendered");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Render failed");
		} finally {
			setBusy(null);
		}
	}
	async function launch() {
		if (!characterA || !characterB || !providerA || !providerB) {
			toast.error("Pick both characters and both models.");
			return;
		}
		if (characterA.id === characterB.id) {
			toast.error("Give each side a different character, or duplicate one in the studio first.");
			return;
		}
		setBusy("launch");
		try {
			const session = await createSessionFn({ data: {
				topic,
				mode,
				title: design?.title,
				agentA: toSnapshot(characterA, providerA, extraA),
				agentB: toSnapshot(characterB, providerB, extraB),
				maxExchanges,
				tokenBudget,
				speedMs,
				allowConclusion,
				isPublic,
				design
			} });
			await navigate({
				to: "/arena/$sessionId",
				params: { sessionId: session.id },
				search: {
					autostart: true,
					play: false
				}
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not open the floor");
			setBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-lime",
					children: "ARENA SETUP"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl font-extrabold",
					children: "Stage"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-xl text-sm text-muted",
					children: "Choose the mode, the question, and who walks out. House Grok can play either side with no key."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: MODES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setMode(item),
					className: `rounded-xl border p-4 text-left ${mode === item ? "border-lime bg-panel" : "border-line bg-panel"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-lg font-bold",
						children: MODE_META[item].label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-muted",
						children: MODE_META[item].blurb
					})]
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-4 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Topic",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
						value: topic,
						onChange: (e) => setTopic(e.target.value)
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: TOPIC_PRESETS.map((preset) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTopic(preset),
						className: "rounded-full border border-line px-3 py-1.5 text-left text-xs text-muted hover:text-fg",
						children: preset
					}, preset))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentCard, {
					title: "Side A",
					tone: "tide",
					characters,
					providers,
					characterId: charA,
					providerId: provA,
					extra: extraA,
					onCharacter: setCharA,
					onProvider: setProvA,
					onExtra: setExtraA
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentCard, {
					title: "Side B",
					tone: "ember",
					characters,
					providers,
					characterId: charB,
					providerId: provB,
					extra: extraB,
					onCharacter: setCharB,
					onProvider: setProvB,
					onExtra: setExtraB
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Exchanges",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 2,
							max: 24,
							value: maxExchanges,
							onChange: (e) => setMaxExchanges(Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Token budget",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 500,
							step: 500,
							value: tokenBudget,
							onChange: (e) => setTokenBudget(Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Pause between turns (ms)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 0,
							step: 100,
							value: speedMs,
							onChange: (e) => setSpeedMs(Number(e.target.value))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col justify-end gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: allowConclusion,
								onChange: (e) => setAllowConclusion(e.target.checked)
							}), "They may conclude"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: isPublic,
								onChange: (e) => setIsPublic(e.target.checked)
							}), "Keep on the public board"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "space-y-4 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold",
						children: "Director"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Optional. The house model writes the title, stakes, and opening. Rendering the room is a separate image."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy !== null,
							onClick: () => void stageIt(),
							children: busy === "stage" ? "Staging…" : "Stage this"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: busy !== null || !design,
							onClick: () => void backdrop(),
							children: busy === "backdrop" ? "Rendering…" : "Render the room"
						})]
					})]
				}), design ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 lg:grid-cols-[1fr_220px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-2xl font-bold",
								children: design.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-lime",
								children: design.stakes
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: design.coldOpen
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-tide",
								children: [characterA?.name, ": "]
							}), design.aEntrance] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-ember",
								children: [characterB?.name, ": "]
							}), design.bEntrance] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: design.visualMotif
							})
						]
					}), design.backdropUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: design.backdropUrl,
						alt: "",
						className: "h-40 w-full rounded-lg object-cover outline outline-1 -outline-offset-1 outline-fg/10 lg:h-full"
					}) : null]
				}) : null]
			}),
			keyNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-ember",
				children: keyNote
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				tone: "lime",
				disabled: busy !== null,
				onClick: () => void launch(),
				className: "px-6",
				children: busy === "launch" ? "Opening…" : "Open the floor"
			})
		]
	});
}
function AgentCard({ title, tone, characters, providers, characterId, providerId, extra, onCharacter, onProvider, onExtra }) {
	const character = characters.find((c) => c.id === characterId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "space-y-3 p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-bold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					tone,
					children: character?.role || "Uncast"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Character",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
					value: characterId,
					onChange: (e) => onCharacter(e.target.value),
					children: characters.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: c.id,
						children: c.name
					}, c.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Model",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectInput, {
					value: providerId,
					onChange: (e) => onProvider(e.target.value),
					children: providers.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
						value: p.id,
						children: [
							p.name,
							" · ",
							p.model
						]
					}, p.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Private note",
				hint: "Added only to this side's instructions.",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
					value: extra,
					onChange: (e) => onExtra(e.target.value),
					className: "min-h-20"
				})
			})
		]
	});
}
//#endregion
export { Stage as component };
