// app/api/events/route.ts
import { EA } from '@/app/services/api/_events';
import { NextRequest, NextResponse } from 'next/server';

const checkInstagram = async (controller: any) => {
  const event = await EA.find({ eventType: 'instagram' });

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
  const stream = new ReadableStream({
    async start(controller) {
      const interval = setInterval(async () => {
        try {
          await checkInstagram(controller);
        } catch {
          // Noop
        }
      }, 1000);

      controller.close = () => clearInterval(interval);
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
