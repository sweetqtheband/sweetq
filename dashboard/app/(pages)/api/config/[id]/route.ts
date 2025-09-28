import { Options as options, Types as types } from "@/app/services/config";
import { NextRequest } from "next/server";
import { corsOptions, deleteItem, putItem } from "@/app/services/api/_db";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";
import { revalidatePath } from "next/cache";

const collection = "config";

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
    const item = await putItem({ id, req, collection, types, options });

    return Response.json({ data: item }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
  } catch (err: any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = params;

  try {
    const item = await deleteItem({ id, req, collection, types, options });
    revalidatePath(`/admin/${collection}`);

    return Response.json({ data: item }, { status: HTTP_STATUS_CODES.OK });
  } catch (err: any) {
    return Response.json({ err: err?.message }, { status: HTTP_STATUS_CODES.ERROR });
  }
}
