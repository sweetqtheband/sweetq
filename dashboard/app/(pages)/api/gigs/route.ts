import { Options as options, Types as types } from '@/app/services/gigs';
import { NextRequest } from 'next/server';
import { getList, postItem, corsOptions } from '@/app/services/api/_db';
import { HTTP_STATUS_CODES, SORT } from '@/app/constants';
import { revalidatePath } from 'next/cache';

const collection = 'gigs';
const idx = 'date';

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  console.log('CORS', message, params);
  return new Response(message, params);
}

export async function GET(req: NextRequest) {
  const list = await getList({
    req,
    collection,
    idx,
    sort: SORT.DESC,
    sortReplace: { datehour: 'date' },
  });

  console.log('LIST', list);
  return Response.json(list);
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
