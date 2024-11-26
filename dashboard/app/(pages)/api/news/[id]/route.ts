import { Options as options, Types as types } from '@/app/services/news';
import { NextRequest } from 'next/server';
import { putItem } from '../../db';
import { HTTP_STATUS_CODES } from '@/app/constants';
import { revalidatePath } from 'next/cache';

export const config = {
  api: {
    bodyParser: false,
  },
};

const collection = 'news';

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = params;

  try {
    const item = await putItem({ id, req, collection, types, options });
    revalidatePath(`/admin/${collection}`);

    return Response.json({ data: item }, { status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json(
      { err: err?.message },
      { status: HTTP_STATUS_CODES.ERROR }
    );
  }
}
