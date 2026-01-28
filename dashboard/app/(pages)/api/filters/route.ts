import { NextRequest } from "next/server";
import { corsOptions, getCollection } from "@/app/services/api/_db";
import { ERRORS, HTTP_STATUS_CODES, SORT } from "@/app/constants";
import { formDataToObject } from "@/app/utils";
import { FactorySvc } from "@/app/services/api/factory";
import { Model } from "@/app/models/filters";

const collection = "filters";

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function POST(req: NextRequest) {
  try {
    const [message, corsParams] = corsOptions(req);
    if (message?.error === ERRORS.CORS) {
      return new Response(message, corsParams);
    }

    const svc = FactorySvc(collection, await getCollection(collection));
    const formData = await req.formData();

    const obj: Record<string, any> = {};
    obj.filters = formDataToObject(formData, {});
    const insertObject = Model(obj);

    const exists = await svc.findOne({ key: insertObject.key });

    const response = exists ? exists : await svc.create(insertObject);

    return Response.json(response.key, { status: HTTP_STATUS_CODES.OK });
  } catch (err: Error | any) {
    return Response.json({ err: err?.message }, { status: HTTP_STATUS_CODES.ERROR });
  }
}
