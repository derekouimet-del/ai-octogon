import { createFileRoute } from "@tanstack/react-router";
import { houseStatusFn } from "@/lib/arena/functions";
import { useHydrated, useVault } from "@/lib/arena/vault";
import { Field, Panel, Pill, TextInput } from "@/components/ui";

export const Route = createFileRoute("/settings")({
  loader: () => houseStatusFn(),
  component: SettingsPage,
});

function SettingsPage() {
  const house = Route.useLoaderData();
  const hydrated = useHydrated();
  const vault = useVault();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs tracking-widest text-lime">PREFERENCES</p>
        <h1 className="font-display text-4xl font-extrabold">Settings</h1>
      </div>
      <Panel className="space-y-3 p-5">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-bold">House director</h2>
          <Pill tone={house.available ? "lime" : "ember"}>{house.available ? "Available" : "Offline"}</Pill>
        </div>
        <p className="text-sm text-muted">
          The director writes characters, paints portraits, stages a showdown, analyzes a transcript, and can also
          sit on either side of the floor as House Grok. Outside models never see this key. Your own keys stay in
          this browser.
        </p>
      </Panel>
      <Panel className="space-y-4 p-5">
        <h2 className="font-display text-2xl font-bold">Voice</h2>
        <p className="text-sm text-muted">
          If a character has no voice, the floor stays text. House voices speak through the director. ElevenLabs and
          OpenAI speech use the keys below, which are not saved on the server.
        </p>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hydrated ? vault.voiceOn : false}
            onChange={(e) => vault.setVoiceOn(e.target.checked)}
          />
          Speak each new turn automatically
        </label>
        <Field label="ElevenLabs key">
          <TextInput
            type="password"
            autoComplete="off"
            value={hydrated ? vault.elevenKey : ""}
            onChange={(e) => vault.setElevenKey(e.target.value)}
          />
        </Field>
        <Field label="OpenAI speech key">
          <TextInput
            type="password"
            autoComplete="off"
            value={hydrated ? vault.openaiTtsKey : ""}
            onChange={(e) => vault.setOpenaiTtsKey(e.target.value)}
          />
        </Field>
      </Panel>
      <Panel className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Default exchanges">
          <TextInput
            type="number"
            min={2}
            max={24}
            value={hydrated ? vault.defaultExchanges : 8}
            onChange={(e) => vault.setDefaults({ defaultExchanges: Number(e.target.value) })}
          />
        </Field>
        <Field label="Default token budget">
          <TextInput
            type="number"
            min={500}
            step={500}
            value={hydrated ? vault.defaultBudget : 12000}
            onChange={(e) => vault.setDefaults({ defaultBudget: Number(e.target.value) })}
          />
        </Field>
        <Field label="Default pause (ms)">
          <TextInput
            type="number"
            min={0}
            step={100}
            value={hydrated ? vault.defaultSpeed : 900}
            onChange={(e) => vault.setDefaults({ defaultSpeed: Number(e.target.value) })}
          />
        </Field>
        <Field label="Default clock (minutes)">
          <TextInput
            type="number"
            min={0}
            max={180}
            value={hydrated ? vault.defaultMinutes : 20}
            onChange={(e) => vault.setDefaults({ defaultMinutes: Number(e.target.value) })}
          />
        </Field>
      </Panel>
      <Panel className="space-y-2 p-5 text-sm text-muted">
        <h2 className="font-display text-2xl font-bold text-fg">How a floor runs</h2>
        <p>Turns alternate. Each call is one model, with its own endpoint, temperature, and instructions.</p>
        <p>Replies stream onto the floor as they are generated. Pause, end, or inject a director's note at any time.</p>
        <p>A local model has to be reachable at a public URL. The arena cannot see a server that only exists on your desk.</p>
        <p>A clock, if you set one, counts only while the floor is live. Pause freezes it. Zero minutes means no clock.</p>
      </Panel>
    </div>
  );
}
