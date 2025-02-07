import { Options as options, Types as types } from '@/app/services/gigs';
import { NextRequest } from 'next/server';
import { getList, postItem, corsOptions } from '@/app/services/api/_db';
import { ERRORS, HTTP_STATUS_CODES, SORT } from '@/app/constants';
import { revalidatePath } from 'next/cache';

const collection = 'gigs';
const idx = 'date';

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  const list = await getList({
    req,
    collection,
    idx,
    sort: SORT.DESC,
    sortReplace: { datehour: 'date' },
  });

  return Response.json(list, corsParams);
}

export async function POST(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  try {
    const item = await postItem({ req, collection, types, options });
    revalidatePath(`/admin/${collection}`);

    return Response.json(
      { data: item },
      { ...corsParams, status: HTTP_STATUS_CODES.OK }
    );
  } catch (err: Error | any) {
    return Response.json(
      { err: err?.message },
      { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
    );
  }
}
