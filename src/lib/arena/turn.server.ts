import { safeError } from "@/lib/utils";
import { streamChat, type LlmCall } from "./llm.server";
import { personaPrompt, turnUserPrompt } from "./prompts";
import { addMessage, claimTurn, clockMs, closeForClock, commitTurn, getMessages, memoriesFor, releaseTurn } from "./store.server";
import type { TurnResult } from "./types";

export type TurnRequest = {
  sessionId: string;
  keys?: Record<string, string>;
};

export async function executeTurn(
  input: TurnRequest,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
  onSpeaker?: (side: "a" | "b") => void,
): Promise<TurnResult> {
  if (!input.sessionId) {
    return { stop: true, reason: "bad-request", message: null, session: null, error: "Missing session." };
  }
  const session = await claimTurn(input.sessionId);
  if (!session) {
    return { stop: true, reason: "not-live", message: null, session: null };
  }
  const side: "a" | "b" = session.exchangeCount % 2 === 0 ? "a" : "b";
  if (session.maxMinutes > 0 && clockMs(session) >= session.maxMinutes * 60_000) {
    const closed = await closeForClock(session.id);
    return { stop: true, reason: "clock", message: closed.message, session: closed.session };
  }
  onSpeaker?.(side);
  const agent = side === "a" ? session.agentA : session.agentB;
  const other = side === "a" ? session.agentB : session.agentA;
  const secret = agent.provider.kind === "house" ? undefined : input.keys?.[agent.provider.id];
  const timeout = AbortSignal.timeout(70_000);
  try {
    if (agent.provider.kind !== "house" && !secret?.trim()) {
      throw new Error(
        `Add an API key for ${agent.provider.name} under Models. Keys stay in this browser and are never written to the floor.`,
      );
    }
    const [messages, memories] = await Promise.all([
      getMessages(session.id),
      agent.characterId ? memoriesFor(agent.characterId) : Promise.resolve([]),
    ]);
    const llm: LlmCall = {
      kind: agent.provider.kind,
      baseUrl: agent.provider.baseUrl,
      model: agent.provider.model,
      apiKey: secret,
      temperature: agent.provider.temperature,
      maxTokens: agent.provider.maxTokens,
      extra: agent.provider.extra,
      messages: [
        { role: "system", content: personaPrompt(agent, other, session, memories) },
        { role: "user", content: turnUserPrompt(messages, session, side, agent.provider.contextTurns) },
      ],
    };
    const linked = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const result = await streamChat(llm, onDelta, linked);
    const committed = await commitTurn({
      sessionId: session.id,
      speaker: side,
      content: result.text,
      tokens: result.tokens,
    });
    return {
      stop: committed.stop,
      reason: committed.reason,
      message: committed.message,
      session: committed.session,
    };
  } catch (err) {
    if (signal?.aborted) {
      try {
        await releaseTurn(session.id, "paused");
      } catch {
        /* already moved */
      }
      return { stop: true, reason: "aborted", message: null, session: null };
    }
    const timedOut = timeout.aborted;
    const error = timedOut
      ? "The model took too long. The floor is paused."
      : safeError(err, secret);
    try {
      await addMessage(session.id, "system", error, 0);
      await releaseTurn(session.id, "paused");
    } catch {
      /* best-effort floor note */
    }
    return { stop: true, reason: "error", message: null, session: null, error };
  }
}
