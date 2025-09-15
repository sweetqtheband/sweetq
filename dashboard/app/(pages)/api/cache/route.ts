import { Options as options, Types as types } from "@/app/services/gigs";
import { NextRequest } from "next/server";
import { getList, postItem, corsOptions, getItem } from "@/app/services/api/_db";
import { ERRORS, HTTP_STATUS_CODES, SORT } from "@/app/constants";

const collection = "cache";
const idx = "type";

interface Params {
  params: {
    id: string;
  };
}

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  const qp = req.nextUrl.searchParams;

  const type = await qp.get("type");
  const conversationId = await qp.get("conversationId");

  const query: Record<string, any> = {
    type,
    conversationId,
  };

  const item = (await getItem({
    query,
    collection,
  })) as any[];

  return Response.json(item, corsParams);
}

export async function POST(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  try {
    const item = await postItem({ req, collection, types, options });

    return Response.json({ data: item }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}
