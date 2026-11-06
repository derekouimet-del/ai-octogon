import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Shuffle, Sparkles, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { HOUSE_VOICES, OPENAI_VOICES, blankCharacter, complementCharacter, opposeCharacter, randomCharacter, shuffleField } from "@/lib/arena/cast";
import {
  authorCharacterFn,
  deleteCharacterFn,
  getCharacters,
  paintPortraitFn,
  restoreTemplatesFn,
  saveCharacterFn,
} from "@/lib/arena/functions";
import type { Character, CharacterDraft, VoiceProvider } from "@/lib/arena/types";
import { Button, Field, Panel, Pill, TextArea, TextInput, SelectInput } from "@/components/ui";

export const Route = createFileRoute("/characters")({
  loader: () => getCharacters(),
  component: Studio,
});

const FIELDS: { key: keyof CharacterDraft; label: string; long?: boolean }[] = [
  { key: "role", label: "Role" },
  { key: "personality", label: "Personality", long: true },
  { key: "perspective", label: "Perspective" },
  { key: "style", label: "Communication style" },
  { key: "background", label: "Background", long: true },
  { key: "emotion", label: "Emotional tendency" },
  { key: "domains", label: "Knowledge domains" },
  { key: "motivation", label: "Motivation", long: true },
  { key: "objective", label: "Objective", long: true },
  { key: "constraints", label: "Constraints", long: true },
];

function Studio() {
  const initial = Route.useLoaderData();
  const router = useRouter();
  const [cast, setCast] = useState<Character[]>(initial);
  const [draft, setDraft] = useState<CharacterDraft>(initial[0] ?? blankCharacter());
  const [favorite, setFavorite] = useState(Boolean(initial[0]?.favorite));
  const [busy, setBusy] = useState<string | null>(null);
  const portrait = useMemo(
    () => cast.find((c) => c.id === draft.id)?.portraitUrl ?? null,
    [cast, draft.id],
  );

  function load(character: Character) {
    setDraft(character);
    setFavorite(character.favorite);
  }

  function patch(partial: Partial<CharacterDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  async function save() {
    setBusy("save");
    try {
      const saved = await saveCharacterFn({ data: { ...draft, favorite } });
      setCast((prev) => (prev.some((c) => c.id === saved.id) ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved]));
      setDraft(saved);
      toast.success("Character saved");
      await router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(null);
    }
  }

  async function author(mode: "fresh" | "oppose" | "complement") {
    setBusy(mode);
    try {
      const persona = await authorCharacterFn({
        data: { mode, seed: mode === "fresh" ? undefined : draft },
      });
      setDraft((d) => ({
        ...d,
        id: mode === "fresh" ? crypto.randomUUID() : d.id,
        ...persona,
        voiceProvider: d.voiceProvider === "none" ? "house" : d.voiceProvider,
        voiceId: d.voiceId || "ara",
      }));
      if (mode !== "fresh") {
        const next = { ...blankCharacter(), ...persona, voiceProvider: "house" as const, voiceId: "leo" };
        setDraft(next);
      }
      toast.success("Director wrote a character. Save it to keep them.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "The director is unavailable");
    } finally {
      setBusy(null);
    }
  }

  async function paint() {
    if (!cast.some((c) => c.id === draft.id)) {
      toast.error("Save the character before painting a portrait.");
      return;
    }
    setBusy("paint");
    try {
      const saved = await paintPortraitFn({ data: { characterId: draft.id } });
      setCast((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      toast.success("Portrait ready");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Portrait failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-lime">CHARACTER STUDIO</p>
          <h1 className="font-display text-4xl font-extrabold">Cast</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Personalities are not the model. The same endpoint can play both sides if the characters disagree.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              setDraft(randomCharacter());
              setFavorite(false);
            }}
          >
            <Shuffle className="size-4" /> Random
          </Button>
          <Button disabled={busy !== null} onClick={() => void author("fresh")}>
            <Sparkles className="size-4" /> Director
          </Button>
          <Button
            tone="lime"
            onClick={() => {
              const next = blankCharacter();
              setDraft(next);
              setFavorite(false);
            }}
          >
            New
          </Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {cast.map((character) => (
            <button
              key={character.id}
              type="button"
              onClick={() => load(character)}
              className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left ${
                character.id === draft.id ? "border-lime bg-panel" : "border-line bg-panel"
              }`}
            >
              <Portrait name={character.name} url={character.portraitUrl} />
              <span className="min-w-0">
                <span className="block truncate font-medium">{character.name}</span>
                <span className="block truncate text-xs text-muted">{character.perspective}</span>
              </span>
            </button>
          ))}
          <Button
            className="w-full"
            onClick={() => {
              void restoreTemplatesFn().then(async (rows) => {
                setCast(rows);
                await router.invalidate();
                toast.success("Templates restored");
              });
            }}
          >
            Restore templates
          </Button>
        </div>
        <Panel className="p-5">
          <div className="grid gap-5 lg:grid-cols-[180px_1fr]">
            <div>
              <div className="overflow-hidden rounded-lg border border-line">
                {portrait ? (
                  <img src={portrait} alt="" className="aspect-[4/5] w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10" />
                ) : (
                  <div className="flex aspect-[4/5] items-center justify-center bg-panel-2 font-display text-4xl font-extrabold text-tide">
                    {monogram(draft.name)}
                  </div>
                )}
              </div>
              <Button className="mt-3 w-full" disabled={busy !== null} onClick={() => void paint()}>
                {busy === "paint" ? "Painting…" : "Paint portrait"}
              </Button>
            </div>
            <div className="space-y-4">
              <Field label="Name" action={<ShuffleButton onClick={() => patch({ name: shuffleField("name", draft.name) })} />}>
                <TextInput value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
              </Field>
              {FIELDS.map((field) => (
                <Field
                  key={field.key}
                  label={field.label}
                  action={<ShuffleButton onClick={() => patch({ [field.key]: shuffleField(field.key, String(draft[field.key] ?? "")) })} />}
                >
                  {field.long ? (
                    <TextArea
                      value={String(draft[field.key] ?? "")}
                      onChange={(e) => patch({ [field.key]: e.target.value })}
                    />
                  ) : (
                    <TextInput
                      value={String(draft[field.key] ?? "")}
                      onChange={(e) => patch({ [field.key]: e.target.value })}
                    />
                  )}
                </Field>
              ))}
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Voice">
                  <SelectInput
                    value={draft.voiceProvider}
                    onChange={(e) => patch({ voiceProvider: e.target.value as VoiceProvider })}
                  >
                    <option value="none">Text only</option>
                    <option value="house">House voice</option>
                    <option value="elevenlabs">ElevenLabs</option>
                    <option value="openai">OpenAI speech</option>
                  </SelectInput>
                </Field>
                <Field label="Voice id" hint={voiceHint(draft.voiceProvider)}>
                  {draft.voiceProvider === "house" ? (
                    <SelectInput value={draft.voiceId} onChange={(e) => patch({ voiceId: e.target.value })}>
                      {HOUSE_VOICES.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {voice.label}
                        </option>
                      ))}
                    </SelectInput>
                  ) : draft.voiceProvider === "openai" ? (
                    <SelectInput value={draft.voiceId || "alloy"} onChange={(e) => patch({ voiceId: e.target.value })}>
                      {OPENAI_VOICES.map((voice) => (
                        <option key={voice} value={voice}>
                          {voice}
                        </option>
                      ))}
                    </SelectInput>
                  ) : (
                    <TextInput
                      value={draft.voiceId}
                      placeholder="ElevenLabs voice id"
                      onChange={(e) => patch({ voiceId: e.target.value })}
                    />
                  )}
                </Field>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button tone="lime" disabled={busy !== null} onClick={() => void save()}>
                  Save character
                </Button>
                <Button
                  disabled={busy !== null}
                  onClick={() => {
                    setFavorite((v) => !v);
                  }}
                >
                  <Star className={`size-4 ${favorite ? "fill-lime text-lime" : ""}`} />
                  {favorite ? "Favorite" : "Mark favorite"}
                </Button>
                <Button disabled={busy !== null} onClick={() => setDraft(opposeCharacter(draft))}>
                  Oppose
                </Button>
                <Button disabled={busy !== null} onClick={() => setDraft(complementCharacter(draft))}>
                  Complement
                </Button>
                <Button disabled={busy !== null} onClick={() => void author("oppose")}>
                  Director oppose
                </Button>
                <Button
                  tone="danger"
                  disabled={busy !== null || !cast.some((c) => c.id === draft.id)}
                  onClick={() => {
                    void deleteCharacterFn({ data: { id: draft.id } }).then(async () => {
                      const next = cast.filter((c) => c.id !== draft.id);
                      setCast(next);
                      setDraft(next[0] ?? blankCharacter());
                      await router.invalidate();
                      toast.success("Removed from the cast");
                    });
                  }}
                >
                  Delete
                </Button>
              </div>
              {draft.template ? <Pill>Template</Pill> : null}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ShuffleButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-muted hover:text-lime" aria-label="Shuffle this field">
      <Shuffle className="size-3.5" />
    </button>
  );
}

function Portrait({ name, url }: { name: string; url: string | null }) {
  if (url) return <img src={url} alt="" className="size-12 rounded-lg object-cover outline outline-1 -outline-offset-1 outline-fg/10" />;
  return (
    <span className="flex size-12 items-center justify-center rounded-lg bg-panel-2 font-display text-sm font-bold text-tide">
      {monogram(name)}
    </span>
  );
}

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "—";
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function voiceHint(provider: VoiceProvider): string {
  if (provider === "none") return "This character stays on the page. Speech is skipped.";
  if (provider === "house") return "Spoken by the arena director when you press play.";
  if (provider === "elevenlabs") return "Uses the ElevenLabs key in Settings.";
  return "Uses the OpenAI speech key in Settings.";
}
