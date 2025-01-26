import { HTTP_STATUS_CODES } from '@/app/constants';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const qp = req.nextUrl.searchParams;

  const mode = qp.get('hub.mode');
  const token = qp.get('hub.verify_token');
  const challenge = qp.get('hub.challenge');

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === 'subscribe' && token === process.env.META_WEBHOOK_TOKEN) {
      // Respond with the challenge token from the request
      return Response.json(Number(challenge));
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      return Response.json(
        { error: 'Forbidden' },
        { status: HTTP_STATUS_CODES.ERROR }
      );
    }
  }
}
