import { Options as options, Types as types } from "@/app/services/cache";
import { NextRequest } from "next/server";
import { deleteItem, corsOptions, getCollection } from "@/app/services/api/_db";
import { HTTP_STATUS_CODES } from "@/app/constants";
import { FactorySvc } from "@/app/services/api/factory";

const collection = "cache";
interface Params {
  params: {
    conversationId: string;
  };
}

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { conversationId } = params;

  try {
    const svc = FactorySvc(collection, await getCollection(collection));
    await svc.model.deleteOne({ conversationId });

    return Response.json({ data: true }, { status: HTTP_STATUS_CODES.OK });
  } catch (err: any) {
    return Response.json({ err: err?.message }, { status: HTTP_STATUS_CODES.ERROR });
  }
}
