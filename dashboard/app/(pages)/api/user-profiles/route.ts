import { NextRequest } from 'next/server';
import { corsOptions, getList } from '@/app/services/api/_db';
import { ERRORS } from '@/app/constants';

const collection = 'user_profiles';
const idx = 'type';

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  return Response.json(
    await getList({
      req,
      collection,
      idx,
    }),
    corsParams
  );
}
