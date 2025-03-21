import { Options as options, Types as types } from '@/app/services/followers';
import { NextRequest } from 'next/server';
import { putItem, corsOptions } from '@/app/services/api/_db';
import { ERRORS, HTTP_STATUS_CODES } from '@/app/constants';

const collection = 'followers';

interface Params {
  params: {
    id: string;
  };
}

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  const { id } = params;

  try {
    const item = await putItem({
      id,
      req,
      collection,
      types,
      options,
      avoidUnset: true,
    });

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
