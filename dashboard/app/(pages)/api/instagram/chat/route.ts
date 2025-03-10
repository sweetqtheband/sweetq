import { Options as options, Types as types } from '@/app/services/bands';
import { NextRequest } from 'next/server';
import {
  corsOptions,
  getCollection,
  getList,
  postItem,
} from '@/app/services/api/_db';
import { revalidatePath } from 'next/cache';
import { ERRORS, HTTP_STATUS_CODES } from '@/app/constants';
import { FactorySvc } from '@/app/services/api/factory';

const collection = 'instagram';

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  const svc = FactorySvc(collection, await getCollection(collection));

  const qp = req.nextUrl.searchParams;
  const conversationId = qp.get('cid');

  const messages = await svc.getMessages(svc, conversationId);

  return Response.json(messages);
}

export async function POST(req: NextRequest) {
  try {
    const item = await postItem({ req, collection, types, options });
    revalidatePath(`/admin/${collection}`);

    return Response.json({ data: item }, { status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json(
      { err: err?.message },
      { status: HTTP_STATUS_CODES.ERROR }
    );
  }
}
