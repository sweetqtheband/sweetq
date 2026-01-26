import { NextRequest } from "next/server";
import { corsOptions, getCollection } from "@/app/services/api/_db";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";
import { FactorySvc } from "@/app/services/api/factory";
import { formDataToObject } from "@/app/utils";

const collection = "instagram";

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);
  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  const svc = FactorySvc(collection, await getCollection(collection));

  const qp = req.nextUrl.searchParams;
  const conversationId = qp.get("cid");

  const messages = await svc.getMessages(svc, conversationId);

  return Response.json(messages);
}

export async function POST(req: NextRequest) {
  try {
    const [message, corsParams] = corsOptions(req);
    if (message?.error === ERRORS.CORS) {
      return new Response(message, corsParams);
    }

    const svc = FactorySvc(collection, await getCollection(collection));
    const formData = await req.formData();

    const obj = formDataToObject(formData, {});
    const response = await svc.sendMessage(svc, obj);

    return Response.json({ data: response }, { status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { status: HTTP_STATUS_CODES.ERROR });
  }
}
