import { Options as options, Types as types } from '@/app/services/tracks';
import { NextRequest } from 'next/server';
import { getList, postItem } from '@/app/services/api/_db';
import { revalidatePath } from 'next/cache';
import { HTTP_STATUS_CODES } from '@/app/constants';

const collection = 'tracks';
const idx = 'title';

export async function GET(req: NextRequest) {
  return Response.json(await getList({ req, collection, idx }));
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
