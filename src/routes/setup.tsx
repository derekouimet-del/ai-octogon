import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { HOUSE_ID, MODE_META, TOPIC_PRESETS } from "@/lib/arena/cast";
import { createSessionFn, getSetupData, paintBackdropFn, stageShowdownFn } from "@/lib/arena/functions";
import { toSnapshot } from "@/lib/arena/snapshot";
import type { Mode, StageDesign } from "@/lib/arena/types";
import { MODES } from "@/lib/arena/types";
import { useHydrated, useVault } from "@/lib/arena/vault";
import { Button, Field, Panel, Pill, SelectInput, TextArea, TextInput } from "@/components/ui";

export const Route = createFileRoute("/setup")({
  loader: () => getSetupData(),
  component: Stage,
});

function Stage() {
  const { characters, providers } = Route.useLoaderData();
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const defaults = useVault((s) => ({
    exchanges: s.defaultExchanges,
    budget: s.defaultBudget,
    speed: s.defaultSpeed,
  }));
  const keys = useVault((s) => s.keys);
  const house = providers.find((p) => p.id === HOUSE_ID) ?? providers[0];
  const a0 = characters.find((c) => c.id === "char_vesper") ?? characters[0];
  const b0 = characters.find((c) => c.id === "char_imani") ?? characters[1] ?? characters[0];

  const [mode, setMode] = useState<Mode>("debate");
  const [topic, setTopic] = useState(TOPIC_PRESETS[0] ?? "");
  const [charA, setCharA] = useState(a0?.id ?? "");
  const [charB, setCharB] = useState(b0?.id ?? "");
  const [provA, setProvA] = useState(house?.id ?? "");
  const [provB, setProvB] = useState(house?.id ?? "");
  const [extraA, setExtraA] = useState("");
  const [extraB, setExtraB] = useState("");
  const [maxExchanges, setMaxExchanges] = useState(defaults.exchanges);
  const [tokenBudget, setTokenBudget] = useState(defaults.budget);
  const [speedMs, setSpeedMs] = useState(defaults.speed);
  const [allowConclusion, setAllowConclusion] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [design, setDesign] = useState<StageDesign | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const characterA = characters.find((c) => c.id === charA);
  const characterB = characters.find((c) => c.id === charB);
  const providerA = providers.find((p) => p.id === provA);
  const providerB = providers.find((p) => p.id === provB);

  const keyNote = useMemo(() => {
    if (!hydrated) return null;
    const missing = [providerA, providerB].filter((p) => p && p.kind !== "house" && !keys[p.id]);
    if (!missing.length) return null;
    return `Missing a browser key for ${missing.map((p) => p!.name).join(" and ")}.`;
  }, [hydrated, keys, providerA, providerB]);

  async function stageIt() {
    if (!characterA || !characterB) return;
    setBusy("stage");
    try {
      const next = await stageShowdownFn({
        data: {
          topic,
          mode,
          a: { name: characterA.name, role: characterA.role, perspective: characterA.perspective, objective: characterA.objective },
          b: { name: characterB.name, role: characterB.role, perspective: characterB.perspective, objective: characterB.objective },
        },
      });
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
      const { url } = await paintBackdropFn({ data: { design, topic } });
      setDesign({ ...design, backdropUrl: url });
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
      const session = await createSessionFn({
        data: {
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
          design,
        },
      });
      await navigate({
        to: "/arena/$sessionId",
        params: { sessionId: session.id },
        search: { autostart: true, play: false },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open the floor");
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-widest text-lime">ARENA SETUP</p>
        <h1 className="font-display text-4xl font-extrabold">Stage</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Choose the mode, the question, and who walks out. House Grok can play either side with no key.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-xl border p-4 text-left ${mode === item ? "border-lime bg-panel" : "border-line bg-panel"}`}
          >
            <span className="font-display text-lg font-bold">{MODE_META[item].label}</span>
            <span className="mt-1 block text-sm text-muted">{MODE_META[item].blurb}</span>
          </button>
        ))}
      </div>

      <Panel className="space-y-4 p-5">
        <Field label="Topic">
          <TextArea value={topic} onChange={(e) => setTopic(e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-2">
          {TOPIC_PRESETS.map((preset) => (
            <button key={preset} type="button" onClick={() => setTopic(preset)} className="rounded-full border border-line px-3 py-1.5 text-left text-xs text-muted hover:text-fg">
              {preset}
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <AgentCard
          title="Side A"
          tone="tide"
          characters={characters}
          providers={providers}
          characterId={charA}
          providerId={provA}
          extra={extraA}
          onCharacter={setCharA}
          onProvider={setProvA}
          onExtra={setExtraA}
        />
        <AgentCard
          title="Side B"
          tone="ember"
          characters={characters}
          providers={providers}
          characterId={charB}
          providerId={provB}
          extra={extraB}
          onCharacter={setCharB}
          onProvider={setProvB}
          onExtra={setExtraB}
        />
      </div>

      <Panel className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Exchanges">
          <TextInput type="number" min={2} max={24} value={maxExchanges} onChange={(e) => setMaxExchanges(Number(e.target.value))} />
        </Field>
        <Field label="Token budget">
          <TextInput type="number" min={500} step={500} value={tokenBudget} onChange={(e) => setTokenBudget(Number(e.target.value))} />
        </Field>
        <Field label="Pause between turns (ms)">
          <TextInput type="number" min={0} step={100} value={speedMs} onChange={(e) => setSpeedMs(Number(e.target.value))} />
        </Field>
        <div className="flex flex-col justify-end gap-3 text-sm">
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={allowConclusion} onChange={(e) => setAllowConclusion(e.target.checked)} />
            They may conclude
          </label>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Keep on the public board
          </label>
        </div>
      </Panel>

      <Panel className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">Director</h2>
            <p className="text-sm text-muted">Optional. The house model writes the title, stakes, and opening. Rendering the room is a separate image.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy !== null} onClick={() => void stageIt()}>
              {busy === "stage" ? "Staging…" : "Stage this"}
            </Button>
            <Button disabled={busy !== null || !design} onClick={() => void backdrop()}>
              {busy === "backdrop" ? "Rendering…" : "Render the room"}
            </Button>
          </div>
        </div>
        {design ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="space-y-2 text-sm">
              <p className="font-display text-2xl font-bold">{design.title}</p>
              <p className="text-lime">{design.stakes}</p>
              <p className="text-muted">{design.coldOpen}</p>
              <p>
                <span className="text-tide">{characterA?.name}: </span>
                {design.aEntrance}
              </p>
              <p>
                <span className="text-ember">{characterB?.name}: </span>
                {design.bEntrance}
              </p>
              <p className="text-xs text-muted">{design.visualMotif}</p>
            </div>
            {design.backdropUrl ? (
              <img src={design.backdropUrl} alt="" className="h-40 w-full rounded-lg object-cover outline outline-1 -outline-offset-1 outline-fg/10 lg:h-full" />
            ) : null}
          </div>
        ) : null}
      </Panel>

      {keyNote ? <p className="text-sm text-ember">{keyNote}</p> : null}

      <Button tone="lime" disabled={busy !== null} onClick={() => void launch()} className="px-6">
        {busy === "launch" ? "Opening…" : "Open the floor"}
      </Button>
    </div>
  );
}

function AgentCard({
  title,
  tone,
  characters,
  providers,
  characterId,
  providerId,
  extra,
  onCharacter,
  onProvider,
  onExtra,
}: {
  title: string;
  tone: "tide" | "ember";
  characters: { id: string; name: string; role: string }[];
  providers: { id: string; name: string; model: string }[];
  characterId: string;
  providerId: string;
  extra: string;
  onCharacter: (id: string) => void;
  onProvider: (id: string) => void;
  onExtra: (value: string) => void;
}) {
  const character = characters.find((c) => c.id === characterId);
  return (
    <Panel className="space-y-3 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">{title}</h2>
        <Pill tone={tone}>{character?.role || "Uncast"}</Pill>
      </div>
      <Field label="Character">
        <SelectInput value={characterId} onChange={(e) => onCharacter(e.target.value)}>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Model">
        <SelectInput value={providerId} onChange={(e) => onProvider(e.target.value)}>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.model}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Field label="Private note" hint="Added only to this side's instructions.">
        <TextArea value={extra} onChange={(e) => onExtra(e.target.value)} className="min-h-20" />
      </Field>
    </Panel>
  );
}
