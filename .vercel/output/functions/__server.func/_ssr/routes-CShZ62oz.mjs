import { r as formatWhen } from "./utils-pryIKIhC.mjs";
import { i as MODE_META } from "./cast-CAA-oOdj.mjs";
import { w as require_jsx_runtime, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as ArrowRight } from "../_libs/lucide-react.mjs";
import { l as Route$9 } from "./router-DUTqb6IF.mjs";
import { i as Pill, r as Panel } from "./ui-C1kFAxUP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CShZ62oz.js
var import_jsx_runtime = require_jsx_runtime();
function Floor() {
	const data = Route$9.useLoaderData();
	const stats = [
		{
			label: "Sessions",
			value: data.counts.sessions
		},
		{
			label: "Open floors",
			value: data.counts.open
		},
		{
			label: "Cast",
			value: data.counts.characters
		},
		{
			label: "Tokens",
			value: data.counts.tokens.toLocaleString()
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative overflow-hidden rounded-xl border border-line bg-panel px-6 py-8 lg:px-10 lg:py-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "floor-wash pointer-events-none absolute inset-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-widest text-lime",
							children: "AGENT ARENA"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-3 font-display text-4xl font-extrabold leading-none lg:text-6xl",
							children: "Two minds. One floor."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-xl text-base leading-relaxed text-muted",
							children: "Point each side at a different model, give them a spine, and let them debate, bargain, or build. You direct. They do not share a brain unless you tell them to."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/setup",
								className: "inline-flex min-h-11 items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-medium text-lime-ink transition-transform active:scale-[0.96]",
								children: ["Set the floor", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/characters",
								className: "inline-flex min-h-11 items-center rounded-lg border border-line bg-panel-2 px-4 py-2 text-sm text-fg",
								children: "Meet the cast"
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: stats.map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "px-4 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-widest text-muted uppercase",
						children: stat.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-3xl font-bold tabular-nums",
						children: stat.value
					})]
				}, stat.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-[1.4fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-end justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold",
						children: "Recent floors"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/library",
						className: "text-sm text-lime",
						children: "Library"
					})]
				}), data.sessions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "px-5 py-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xl",
						children: "The floor is quiet."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "No sessions yet. Stage a topic and the first exchange will land here."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: data.sessions.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/arena/$sessionId",
						params: { sessionId: session.id },
						search: {
							autostart: false,
							play: session.status === "completed"
						},
						className: "block rounded-xl border border-line bg-panel px-4 py-4 hover:border-fg/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
										tone: session.status === "live" || session.status === "thinking" ? "lime" : "muted",
										children: session.status
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: MODE_META[session.mode].label }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted",
										children: formatWhen(session.createdAt)
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-lg font-semibold",
								children: session.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [
									session.agentA.name,
									" · ",
									session.agentA.provider.model,
									" vs ",
									session.agentB.name,
									" ·",
									" ",
									session.agentB.provider.model
								]
							})
						]
					}) }, session.id))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-end justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold",
						children: "Ready cast"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/characters",
						className: "text-sm text-lime",
						children: "Studio"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: data.cast.map((character) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-line bg-panel px-4 py-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-lg font-semibold",
								children: character.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-tide",
								children: character.role
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: character.objective
							})
						]
					}, character.id))
				})] })]
			})
		]
	});
}
//#endregion
export { Floor as component };
