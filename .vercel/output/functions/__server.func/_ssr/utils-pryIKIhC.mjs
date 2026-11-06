import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-pryIKIhC.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function nid() {
	return crypto.randomUUID();
}
function safeError(err, secret) {
	const raw = err instanceof Error ? err.message : "Something failed";
	return (secret && secret.length > 6 ? raw.split(secret).join("•••") : raw).replace(/\s+/g, " ").trim().slice(0, 420);
}
function formatWhen(iso) {
	if (!iso) return "—";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit"
	}).format(d);
}
function clamp(n, min, max) {
	if (Number.isNaN(n)) return min;
	return Math.min(max, Math.max(min, n));
}
//#endregion
export { safeError as a, nid as i, cn as n, formatWhen as r, clamp as t };
