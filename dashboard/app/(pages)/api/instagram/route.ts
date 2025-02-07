import { NextRequest } from 'next/server';
import { corsOptions, getItem } from '@/app/services/api/_db';
import { ERRORS, HTTP_STATUS_CODES } from '@/app/constants';

const collection = 'instagram';

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  const data = await getItem({ query: { type: 'auth_token' }, collection });
  return Response.json(
    { data },
    { ...corsParams, status: HTTP_STATUS_CODES.OK }
  );
}
