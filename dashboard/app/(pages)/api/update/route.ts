import { ERRORS, TOKENS } from '@/app/constants';
import { authSvc } from '@/app/services/api/auth';
import { NextRequest, NextResponse } from 'next/server';
import { corsOptions, getCollection } from '@/app/services/api/_db';

const collection = 'update';

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  const isAuth = await authSvc.isAuth(req, TOKENS.ACCESS);
  if (isAuth) {
    const col = await getCollection(collection);
    const update = await col.findOne();
    if (!update) {
      col.insertOne({});
    }
  }

  return NextResponse.json(null, corsParams);
}
