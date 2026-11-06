import { n as cn } from "./utils-pryIKIhC.mjs";
import { w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-C1kFAxUP.js
var import_jsx_runtime = require_jsx_runtime();
function Button({ className, tone = "ghost", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40", tone === "lime" && "bg-lime text-lime-ink hover:bg-lime/90", tone === "ghost" && "border border-line bg-panel-2 text-fg hover:border-fg/30", tone === "tide" && "bg-tide text-tide-ink hover:bg-tide/90", tone === "ember" && "bg-ember text-ember-ink hover:bg-ember/90", tone === "danger" && "border border-ember/50 text-ember hover:bg-ember/10", className),
		...props
	});
}
function Field({ label, hint, children, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-center justify-between gap-3 text-xs font-medium tracking-wide text-muted uppercase",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), action]
			}),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-xs text-muted",
				children: hint
			}) : null
		]
	});
}
var control = "w-full rounded-lg border border-line bg-ink px-3 py-2.5 text-sm text-fg outline-none placeholder:text-muted/70 focus:border-lime";
function TextInput({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn(control, className),
		...props
	});
}
function TextArea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn(control, "min-h-24 resize-y", className),
		...props
	});
}
function SelectInput({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: cn(control, className),
		...props
	});
}
function Panel({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-xl border border-line bg-panel", className),
		children
	});
}
function Pill({ children, tone = "muted" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tone === "muted" && "bg-panel-2 text-muted", tone === "lime" && "bg-lime text-lime-ink", tone === "tide" && "bg-tide/15 text-tide", tone === "ember" && "bg-ember/15 text-ember"),
		children
	});
}
//#endregion
export { SelectInput as a, Pill as i, Field as n, TextArea as o, Panel as r, TextInput as s, Button as t };
