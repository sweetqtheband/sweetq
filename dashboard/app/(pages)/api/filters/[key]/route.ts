import { NextRequest } from "next/server";
import { corsOptions, getCollection, getList, postItem } from "@/app/services/api/_db";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";
import { FactorySvc } from "@/app/services/api/factory";

const collection = "filters";

interface Params {
  params: {
    key: string;
  };
}

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const [message, corsParams] = corsOptions(req);

    if (message?.error === ERRORS.CORS) {
      return new Response(message, corsParams);
    }

    const svc = FactorySvc(collection, await getCollection(collection));

    const { key } = params;

    const response = await svc.findOne({ key });
    return Response.json({ data: response.filters }, { status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { status: HTTP_STATUS_CODES.ERROR });
  }
}
