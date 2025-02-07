import { Options as options, Types as types } from '@/app/services/bands';
import { NextRequest } from 'next/server';
import { corsOptions, getList, postItem } from '@/app/services/api/_db';
import { revalidatePath } from 'next/cache';
import { ERRORS, HTTP_STATUS_CODES } from '@/app/constants';

const collection = 'bands';
const idx = 'name';

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

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
    })
  );
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
