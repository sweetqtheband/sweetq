// app/api/events/route.ts
import { EA } from "@/app/services/api/_events";
import { NextRequest, NextResponse } from "next/server";
import { corsOptions } from "@/app/services/api/_db"; // Added corsOptions import
import { ERRORS } from "@/app/constants";

const channels = ["chat", "instagram"];

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

const check = async (controller: any) => {
  const event = await EA.find({ eventType: { $in: channels } });
  if (event) {
    controller.enqueue(
      "data: " + JSON.stringify({ eventType: event.eventType, data: event.data }) + "\n\n"
    );

    await EA.remove(event._id);

    controller._readableState.buffer.clear();
    controller._readableState.length = 0;
  }
};

export function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  let keepAliveTimer: NodeJS.Timeout;
  let eventTimer: NodeJS.Timeout;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Mantén viva la conexión con un ping cada 15s
      keepAliveTimer = setInterval(() => {
        controller.enqueue(encoder.encode(":\n\n")); // Comentario SSE para mantener conexión
      }, 15000);

      // Emitir eventos reales
      eventTimer = setInterval(async () => {
        try {
          const events = (await EA.find({ eventType: { $in: channels } })) || [];
          if (events?.length) {
            for (const event of Array.isArray(events) ? events : [events]) {
              const payload = JSON.stringify({
                eventType: event.eventType,
                data: event.data,
              });
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
              await EA.remove(event._id);
            }
          }
        } catch (err) {
          console.error("Error enviando SSE:", err);
        }
      }, 1000);
    },
    cancel() {
      clearInterval(keepAliveTimer);
      clearInterval(eventTimer);
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
