import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { KIND_META } from "@/lib/arena/cast";
import { deleteProviderFn, getProviders, saveProviderFn, testProviderFn } from "@/lib/arena/functions";
import type { Provider, ProviderKind } from "@/lib/arena/types";
import { PROVIDER_KINDS } from "@/lib/arena/types";
import { useHydrated, useVault } from "@/lib/arena/vault";
import { nid } from "@/lib/utils";
import { Button, Field, Panel, Pill, TextArea, TextInput, SelectInput } from "@/components/ui";

export const Route = createFileRoute("/providers")({
  loader: () => getProviders(),
  component: Models,
});

function fresh(kind: ProviderKind = "openai"): Provider {
  const meta = KIND_META[kind];
  return {
    id: nid(),
    name: "",
    kind,
    baseUrl: meta.baseUrl,
    model: meta.model,
    temperature: 0.8,
    maxTokens: 600,
    contextTurns: 14,
    extra: "{}",
    locked: false,
    createdAt: "",
  };
}

function Models() {
  const initial = Route.useLoaderData();
  const router = useRouter();
  const hydrated = useHydrated();
  const setKey = useVault((s) => s.setKey);
  const stored = useVault((s) => s.keys);
  const [list, setList] = useState(initial);
  const [draft, setDraft] = useState<Provider>(initial[0] ?? fresh("house"));
  const [keyDraft, setKeyDraft] = useState("");
  const [busy, setBusy] = useState(false);

  function select(provider: Provider) {
    setDraft(provider);
    setKeyDraft("");
  }

  function patch(partial: Partial<Provider>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  async function save() {
    setBusy(true);
    try {
      const saved = await saveProviderFn({ data: draft });
      if (keyDraft.trim()) setKey(saved.id, keyDraft.trim());
      setKeyDraft("");
      toast.success("Model saved");
      await router.invalidate();
      setList((prev) => {
        const next = prev.some((p) => p.id === saved.id)
          ? prev.map((p) => (p.id === saved.id ? saved : p))
          : [...prev, saved];
        return next;
      });
      setDraft(saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    try {
      const apiKey = keyDraft.trim() || stored[draft.id] || "";
      const result = await testProviderFn({
        data: {
          kind: draft.kind,
          baseUrl: draft.baseUrl,
          model: draft.model,
          apiKey,
          temperature: 0,
          maxTokens: 32,
        },
      });
      toast.success(`Connected · ${result.text}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Test failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (draft.locked) return;
    setBusy(true);
    try {
      await deleteProviderFn({ data: { id: draft.id } });
      const next = list.filter((p) => p.id !== draft.id);
      setList(next);
      setDraft(next[0] ?? fresh());
      toast.success("Removed");
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove");
    } finally {
      setBusy(false);
    }
  }

  const hasKey = hydrated && Boolean(stored[draft.id]);
  const meta = KIND_META[draft.kind];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-lime">CONNECTIONS</p>
          <h1 className="font-display text-4xl font-extrabold">Models</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Each side of the floor can use a different provider. API keys stay in this browser and are sent only
            for the live call. They are not stored with the session.
          </p>
        </div>
        <Button
          tone="lime"
          onClick={() => {
            const next = fresh("openai");
            setList((prev) => [...prev, next]);
            select(next);
          }}
        >
          Add connection
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <ul className="space-y-2">
          {list.map((provider) => (
            <li key={provider.id}>
              <button
                type="button"
                onClick={() => select(provider)}
                className={`w-full rounded-xl border px-3 py-3 text-left ${
                  provider.id === draft.id ? "border-lime bg-panel" : "border-line bg-panel hover:border-fg/30"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium">{provider.name || "Untitled"}</span>
                  {provider.locked ? <Pill tone="lime">House</Pill> : null}
                </span>
                <span className="mt-1 block text-xs text-muted">{provider.model}</span>
              </button>
            </li>
          ))}
        </ul>
        <Panel className="space-y-4 p-5">
          <Field label="Name">
            <TextInput
              value={draft.name}
              disabled={draft.locked}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="DeepSeek via OpenRouter"
            />
          </Field>
          <Field label="Integration" hint={meta.hint}>
            <SelectInput
              value={draft.kind}
              disabled={draft.locked}
              onChange={(e) => {
                const kind = e.target.value as ProviderKind;
                const next = KIND_META[kind];
                patch({ kind, baseUrl: next.baseUrl, model: draft.model || next.model });
              }}
            >
              {PROVIDER_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {KIND_META[kind].label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Endpoint">
            <TextInput
              value={draft.baseUrl}
              disabled={draft.locked}
              onChange={(e) => patch({ baseUrl: e.target.value })}
            />
          </Field>
          <Field label="Model">
            <TextInput value={draft.model} onChange={(e) => patch({ model: e.target.value })} />
          </Field>
          {draft.kind !== "house" ? (
            <Field
              label="API key"
              hint={hasKey ? "A key is already stored in this browser. Leave blank to keep it." : "Stored only in this browser."}
            >
              <TextInput
                type="password"
                autoComplete="off"
                value={keyDraft}
                placeholder={hasKey ? "••••••••" : "sk-…"}
                onChange={(e) => setKeyDraft(e.target.value)}
              />
            </Field>
          ) : (
            <p className="text-sm text-muted">House Grok uses the arena director. No key to paste.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={`Temperature ${draft.temperature.toFixed(2)}`}>
              <input
                type="range"
                min={0}
                max={2}
                step={0.05}
                value={draft.temperature}
                onChange={(e) => patch({ temperature: Number(e.target.value) })}
                className="w-full"
              />
            </Field>
            <Field label="Max tokens">
              <TextInput
                type="number"
                min={32}
                max={draft.locked ? 800 : 4000}
                value={draft.maxTokens}
                onChange={(e) => patch({ maxTokens: Number(e.target.value) })}
              />
            </Field>
            <Field label="Context turns">
              <TextInput
                type="number"
                min={4}
                max={40}
                value={draft.contextTurns}
                onChange={(e) => patch({ contextTurns: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="Extra parameters" hint="Optional JSON merged into the request. Model and messages stay protected.">
            <TextArea value={draft.extra} onChange={(e) => patch({ extra: e.target.value })} className="min-h-20 font-mono text-xs" />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button tone="lime" disabled={busy} onClick={() => void save()}>
              Save
            </Button>
            <Button disabled={busy} onClick={() => void test()}>
              Test connection
            </Button>
            {!draft.locked ? (
              <Button tone="danger" disabled={busy} onClick={() => void remove()}>
                Remove
              </Button>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}
