import { Options as options, Types as types } from '@/app/services/gigs';
import { NextRequest } from 'next/server';
import { deleteItem, putItem } from '@/app/services/api/_db';
import { HTTP_STATUS_CODES } from '@/app/constants';
import { revalidatePath } from 'next/cache';

const collection = 'gigs';

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
  } catch (err: any) {
    return Response.json(
      { err: err?.message },
      { status: HTTP_STATUS_CODES.ERROR }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = params;

  try {
    const item = await deleteItem({ id, req, collection, types, options });
    revalidatePath(`/admin/${collection}`);

    return Response.json({ data: item }, { status: HTTP_STATUS_CODES.OK });
  } catch (err: any) {
    return Response.json(
      { err: err?.message },
      { status: HTTP_STATUS_CODES.ERROR }
    );
  }
}
