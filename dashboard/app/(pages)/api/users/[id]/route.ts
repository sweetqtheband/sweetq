import { Options as options, Types as types } from '@/app/services/users';
import { NextRequest } from 'next/server';
import { corsOptions, deleteItem, putItem } from '@/app/services/api/_db';
import { ERRORS, HTTP_STATUS_CODES } from '@/app/constants';
import { revalidatePath } from 'next/cache';
import { formDataToObject } from '@/app/utils';
import { userSvc } from '@/app/services/api/user';

const collection = 'users';

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(req: NextRequest, { params }: Params) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  const { id } = params;

  try {
    const formData = await req.formData();
    const obj = formDataToObject(formData, types);

    const user = await userSvc.getById(obj._id);

    let statusCode = HTTP_STATUS_CODES.NOT_ALLOWED;

    if (user) {
      statusCode = HTTP_STATUS_CODES.NO_CONTENT;
      const data = await userSvc.update(obj);

      return Response.json(
        { data },
        { ...corsParams, status: HTTP_STATUS_CODES.OK }
      );
    } else {
      return Response.json(
        {},
        {
          ...corsParams,
          status: HTTP_STATUS_CODES.NOT_FOUND,
        }
      );
    }
  } catch (err: any) {
    return Response.json(
      { err: err?.message },
      { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  const { id } = params;

  try {
    const item = await deleteItem({ id, req, collection, types, options });
    revalidatePath(`/admin/${collection}`);

    return Response.json(
      { data: item },
      { ...corsParams, status: HTTP_STATUS_CODES.OK }
    );
  } catch (err: any) {
    return Response.json(
      { err: err?.message },
      { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
    );
  }
}
