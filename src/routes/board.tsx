import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getBoardFn } from "@/lib/arena/functions";
import { MODE_META } from "@/lib/arena/cast";
import { formatWhen } from "@/lib/utils";
import { Panel, Pill } from "@/components/ui";

export const Route = createFileRoute("/board")({
  loader: () => getBoardFn(),
  component: Board,
});

function Board() {
  const initial = Route.useLoaderData();
  const [sessions, setSessions] = useState(initial);
  useEffect(() => {
    const timer = window.setInterval(() => {
      void getBoardFn()
        .then(setSessions)
        .catch(() => {});
    }, 8000);
    return () => window.clearInterval(timer);
  }, []);
  const live = sessions.filter((session) => session.status === "live" || session.status === "thinking");
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-widest text-lime">PUBLIC BOARD</p>
        <h1 className="font-display text-4xl font-extrabold">Watch the floor</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Sessions marked for the board. Live floors are at the top. Private sessions stay in the library.
        </p>
      </div>
      {sessions.length === 0 ? (
        <Panel className="px-5 py-10">
          <p className="font-display text-2xl">The board is dark.</p>
          <p className="mt-2 text-sm text-muted">Open a floor and leave “Keep on the public board” on.</p>
          <Link to="/setup" className="mt-4 inline-flex min-h-11 items-center text-sm text-lime">
            Stage one
          </Link>
        </Panel>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {sessions.map((session) => {
            const hot = session.status === "live" || session.status === "thinking";
            return (
              <li key={session.id}>
                <Link
                  to="/arena/$sessionId"
                  params={{ sessionId: session.id }}
                  search={{ autostart: false, play: session.status === "completed" }}
                  className="flex h-full flex-col overflow-hidden rounded-xl border border-line bg-panel hover:border-fg/30"
                >
                  {session.design?.backdropUrl ? (
                    <img src={session.design.backdropUrl} alt="" className="h-28 w-full object-cover" />
                  ) : (
                    <div className="grid h-28 grid-cols-2">
                      <Face agent={session.agentA} tone="tide" />
                      <Face agent={session.agentB} tone="ember" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone={hot ? "lime" : "muted"}>
                        <span className="inline-flex items-center gap-2">
                          {hot ? <span className="live-dot size-1.5 rounded-full bg-lime-ink" /> : null}
                          {hot ? "live" : session.status}
                        </span>
                      </Pill>
                      <Pill>{MODE_META[session.mode].label}</Pill>
                      <span className="text-xs text-muted">{formatWhen(session.createdAt)}</span>
                    </div>
                    <h2 className="font-display text-xl font-bold">{session.title}</h2>
                    <p className="line-clamp-2 text-sm text-muted">{session.topic}</p>
                    <p className="mt-auto text-sm">
                      <span className="text-tide">{session.agentA.name}</span>
                      <span className="text-muted"> · {session.agentA.provider.model}</span>
                      <span className="text-muted"> vs </span>
                      <span className="text-ember">{session.agentB.name}</span>
                      <span className="text-muted"> · {session.agentB.provider.model}</span>
                    </p>
                    {session.conclusion ? <p className="text-sm text-muted">{session.conclusion}</p> : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {live.length > 1 ? (
        <p className="text-sm text-muted">{live.length} floors are live. Open one to watch it stream.</p>
      ) : null}
    </div>
  );
}

function Face({
  agent,
  tone,
}: {
  agent: { name: string; portraitUrl: string | null };
  tone: "tide" | "ember";
}) {
  if (agent.portraitUrl) {
    return <img src={agent.portraitUrl} alt="" className="h-full w-full object-cover" />;
  }
  return (
    <div className={`flex h-full items-center justify-center bg-panel-2 font-display text-4xl font-extrabold ${tone === "tide" ? "text-tide" : "text-ember"}`}>
      {agent.name.slice(0, 1)}
    </div>
  );
}
