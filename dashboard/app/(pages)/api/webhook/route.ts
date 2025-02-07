import { ERRORS, HTTP_STATUS_CODES } from '@/app/constants';
import { corsOptions } from '@/app/services/api/_db';
import { NextRequest } from 'next/server';

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  const qp = req.nextUrl.searchParams;

  const mode = qp.get('hub.mode');
  const token = qp.get('hub.verify_token');
  const challenge = qp.get('hub.challenge');

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === 'subscribe' && token === process.env.META_WEBHOOK_TOKEN) {
      // Respond with the challenge token from the request
      return Response.json(Number(challenge), corsParams);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      return Response.json(
        { error: 'Forbidden' },
        { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
      );
    }
  }
}
