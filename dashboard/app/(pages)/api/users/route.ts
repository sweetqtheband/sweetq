import { Options as options, Types as types } from '@/app/services/users';
import { NextRequest } from 'next/server';
import {
  corsOptions,
  getList,
  postItem,
  signData,
} from '@/app/services/api/_db';
import { revalidatePath } from 'next/cache';
import { ERRORS, HTTP_STATUS_CODES } from '@/app/constants';
import { userSvc } from '@/app/services/api/user';
import { formDataToObject } from '@/app/utils';

const collection = 'users';
const idx = 'username';

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

export async function POST(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  try {
    const formData = await req.formData();
    const obj = formDataToObject(formData, types);

    const user = await userSvc.getByUsername(obj.username);

    let statusCode = HTTP_STATUS_CODES.CONFLICT;
    let data: any = 'User cannot be created';

    if (!user) {
      statusCode = HTTP_STATUS_CODES.CREATED;
      data = await userSvc.create(signData(obj));
    }

    revalidatePath(`/admin/${collection}`);
    return Response.json({ data }, { ...corsParams, status: statusCode });
  } catch (err: Error | any) {
    return Response.json(
      { err: err?.message },
      { ...corsParams, status: HTTP_STATUS_CODES.ERROR }
    );
  }
}
