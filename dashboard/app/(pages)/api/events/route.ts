// app/api/events/route.ts
import { EA } from '@/app/services/api/_events';
import { NextRequest, NextResponse } from 'next/server';
import { corsOptions } from '@/app/services/api/_db'; // Added corsOptions import
import { ERRORS } from '@/app/constants';

const channels = ['chat', 'instagram'];

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

const check = async (controller: any) => {
  const event = await EA.find({ eventType: { $in: channels } });
  if (event) {
    controller.enqueue(
      'data: ' +
        JSON.stringify({ eventType: event.eventType, data: event.data }) +
        '\n\n'
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
  const stream = new ReadableStream({
    async start(controller) {
      const interval = setInterval(async () => {
        try {
          await check(controller);
        } catch {
          // Noop
        }
      }, 1000);

      controller.close = () => clearInterval(interval);
    },
  });

  return new NextResponse(stream, {
    ...corsParams,
    headers: {
      ...corsParams.headers,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
