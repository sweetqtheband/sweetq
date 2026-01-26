import { Options as options, Types as types } from "@/app/services/config";
import { NextRequest } from "next/server";
import { corsOptions, getList, postItem } from "@/app/services/api/_db";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";
import { revalidatePath } from "next/cache";

const collection = "config";
const idx = "name";

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
  try {
    const item = await postItem({ req, collection, types, options });
    revalidatePath(`/admin/${collection}`);

    return Response.json({ data: item }, { status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { status: HTTP_STATUS_CODES.ERROR });
  }
}
