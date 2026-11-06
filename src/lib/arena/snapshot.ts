import type { AgentSnapshot, Character, Provider } from "./types";

export function toSnapshot(character: Character, provider: Provider, extra = ""): AgentSnapshot {
  return {
    characterId: character.id,
    name: character.name,
    role: character.role,
    personality: character.personality,
    perspective: character.perspective,
    style: character.style,
    background: character.background,
    emotion: character.emotion,
    domains: character.domains,
    motivation: character.motivation,
    objective: character.objective,
    constraints: character.constraints,
    extra,
    voiceProvider: character.voiceProvider,
    voiceId: character.voiceId,
    portraitUrl: character.portraitUrl,
    provider: {
      id: provider.id,
      name: provider.name,
      kind: provider.kind,
      baseUrl: provider.baseUrl,
      model: provider.model,
      temperature: provider.temperature,
      maxTokens: provider.maxTokens,
      contextTurns: provider.contextTurns,
      extra: provider.extra,
    },
  };
}
