// app/api/events/route.ts
import { EA } from "@/app/services/api/_events";
import { NextRequest, NextResponse } from "next/server";
import { corsOptions } from "@/app/services/api/_db"; // Added corsOptions import
import { ERRORS } from "@/app/constants";

const channels = ["chat", "instagram"];
const POLL_INTERVAL_MS = 1000;
const KEEP_ALIVE_MS = 15000;

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  let keepAliveTimer: NodeJS.Timeout | undefined;
  let pollTimer: NodeJS.Timeout | undefined;
  let closed = false;

  const cleanup = () => {
    closed = true;
    clearInterval(keepAliveTimer);
    clearTimeout(pollTimer);
  };

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };

      req.signal.addEventListener("abort", () => {
        cleanup();
        try {
          controller.close();
        } catch {}
      });

      // Mantén viva la conexión con un ping cada 15s
      keepAliveTimer = setInterval(() => send(":\n\n"), KEEP_ALIVE_MS);

      // Cada consulta espera a que termine la anterior para no acumular peticiones
      const poll = async () => {
        if (closed) return;
        try {
          const events = (await EA.find({ eventType: { $in: channels } })) || [];
          for (const event of Array.isArray(events) ? events : [events]) {
            if (!event) continue;
            send(`data: ${JSON.stringify({ eventType: event.eventType, data: event.data })}\n\n`);
            await EA.remove(event._id);
          }
        } catch (err) {
          console.error("Error enviando SSE:", err);
        }
        if (!closed) pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
      };
      poll();
    },
    cancel() {
      cleanup();
    },
  });

  return new NextResponse(stream, {
    ...corsParams,
    headers: {
      ...corsParams.headers,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
