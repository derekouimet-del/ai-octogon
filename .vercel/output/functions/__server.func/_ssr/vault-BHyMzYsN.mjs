import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/vault-BHyMzYsN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var useVault = create()(persist((set) => ({
	keys: {},
	elevenKey: "",
	openaiTtsKey: "",
	voiceOn: false,
	defaultExchanges: 8,
	defaultBudget: 12e3,
	defaultSpeed: 900,
	setKey: (id, key) => set((s) => ({ keys: {
		...s.keys,
		[id]: key
	} })),
	removeKey: (id) => set((s) => {
		const keys = { ...s.keys };
		delete keys[id];
		return { keys };
	}),
	setElevenKey: (elevenKey) => set({ elevenKey }),
	setOpenaiTtsKey: (openaiTtsKey) => set({ openaiTtsKey }),
	setVoiceOn: (voiceOn) => set({ voiceOn }),
	setDefaults: (patch) => set(patch)
}), { name: "dyad-vault" }));
function useHydrated() {
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (useVault.persist.hasHydrated()) setHydrated(true);
		return useVault.persist.onFinishHydration(() => setHydrated(true));
	}, []);
	return hydrated;
}
//#endregion
export { useVault as n, useHydrated as t };
