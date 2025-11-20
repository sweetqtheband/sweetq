import { Options as options, Types as types } from "@/app/services/followers";
import { NextRequest } from "next/server";
import { batchPutItems, corsOptions, getCollection } from "@/app/services/api/_db";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";
import { revalidatePath } from "next/cache";

const collection = "followings";

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function POST(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  try {
    const items = await batchPutItems({
      req,
      collection,
      types,
      options,
      avoidUnset: true,
    });

    revalidatePath(`/admin/instagram/followings`);

    return Response.json({ data: [items] }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
  } catch (err: any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}
