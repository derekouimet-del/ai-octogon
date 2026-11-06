import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { addMemoryFn, clearMemoriesFn, deleteMemoryFn, getCharacters, getMemories } from "@/lib/arena/functions";
import type { Memory, MemoryKind } from "@/lib/arena/types";
import { formatWhen } from "@/lib/utils";
import { Button, Field, Panel, Pill, SelectInput, TextArea } from "@/components/ui";

export const Route = createFileRoute("/memory")({
  loader: () => getCharacters(),
  component: MemoryDesk,
});

function MemoryDesk() {
  const characters = Route.useLoaderData();
  const [characterId, setCharacterId] = useState(characters[0]?.id ?? "");
  const [rows, setRows] = useState<Memory[]>([]);
  const [kind, setKind] = useState<MemoryKind>("long");
  const [content, setContent] = useState("");
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!characterId) return;
    let cancel = false;
    void getMemories({ data: { characterId } }).then((next) => {
      if (!cancel) setRows(next);
    });
    return () => {
      cancel = true;
    };
  }, [characterId]);

  const character = characters.find((c) => c.id === characterId);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-widest text-lime">PERSISTENT MEMORY</p>
        <h1 className="font-display text-4xl font-extrabold">Memory</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Each character keeps their own notes. The other side cannot read them unless you write the same fact twice.
          Short-term context is the live transcript. This desk is what survives the session.
        </p>
      </div>
      <Field label="Character">
        <SelectInput value={characterId} onChange={(e) => { setConfirm(false); setCharacterId(e.target.value); }}>
          {characters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectInput>
      </Field>
      <Panel className="space-y-3 p-5">
        <Field label="New memory">
          <TextArea value={content} onChange={(e) => setContent(e.target.value)} placeholder={`Something ${character?.name ?? "they"} should still know next time.`} />
        </Field>
        <div className="flex flex-wrap gap-2">
          <SelectInput value={kind} onChange={(e) => setKind(e.target.value as MemoryKind)} className="max-w-40">
            <option value="long">Long-term</option>
            <option value="short">Short-term</option>
            <option value="session">From a session</option>
          </SelectInput>
          <Button
            tone="lime"
            onClick={() => {
              void addMemoryFn({ data: { characterId, kind, content } })
                .then((row) => {
                  setRows((prev) => [row, ...prev]);
                  setContent("");
                })
                .catch((err) => toast.error(err instanceof Error ? err.message : "Could not save"));
            }}
          >
            Keep it
          </Button>
        </div>
      </Panel>
      <ul className="space-y-2">
        {rows.length === 0 ? (
          <li className="text-sm text-muted">Nothing retained yet.</li>
        ) : (
          rows.map((row) => (
            <li key={row.id} className="rounded-xl border border-line bg-panel px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <Pill tone={row.kind === "long" ? "lime" : "muted"}>{row.kind}</Pill>
                <span className="text-xs text-muted">{formatWhen(row.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm">{row.content}</p>
              <button
                type="button"
                className="mt-2 text-xs text-ember"
                onClick={() => {
                  void deleteMemoryFn({ data: { id: row.id } }).then(() => setRows((prev) => prev.filter((m) => m.id !== row.id)));
                }}
              >
                Forget
              </button>
            </li>
          ))
        )}
      </ul>
      <div>
        {confirm ? (
          <Button
            tone="danger"
            onClick={() => {
              void clearMemoriesFn({ data: { characterId } }).then(() => {
                setRows([]);
                setConfirm(false);
                toast.success("Memory cleared for this character");
              });
            }}
          >
            Confirm clear for {character?.name}
          </Button>
        ) : (
          <Button tone="danger" onClick={() => setConfirm(true)}>
            Clear this character
          </Button>
        )}
      </div>
    </div>
  );
}
