import { createFileRoute } from "@tanstack/react-router";

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export const Route = createFileRoute("/api/arena/stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const encoder = new TextEncoder();
        let body: { sessionId?: string; keys?: Record<string, string> } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }
        const stream = new ReadableStream({
          async start(controller) {
            const send = (event: string, data: unknown) => {
              controller.enqueue(encoder.encode(sse(event, data)));
            };
            try {
              const { executeTurn } = await import("@/lib/arena/turn.server");
              const result = await executeTurn(
                { sessionId: body.sessionId ?? "", keys: body.keys },
                (chunk) => send("delta", { text: chunk }),
                request.signal,
                (speaker) => send("meta", { speaker }),
              );
              if (result.error) send("error", { error: result.error });
              send("done", result);
            } catch (err) {
              const message = err instanceof Error ? err.message : "Turn failed";
              send("error", { error: message.slice(0, 300) });
            } finally {
              controller.close();
            }
          },
        });
        return new Response(stream, {
          headers: {
            "content-type": "text/event-stream; charset=utf-8",
            "cache-control": "no-cache, no-transform",
            connection: "keep-alive",
          },
        });
      },
    },
  },
});
