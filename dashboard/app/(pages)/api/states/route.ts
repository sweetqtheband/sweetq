import { type NextRequest } from "next/server";
import { corsOptions, getCollection } from "@/app/services/api/_db";
import config from "@/app/config";
import { ERRORS } from "@/app/constants";

const collection = "states";

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  const col = await getCollection(collection);
  const qp = req.nextUrl.searchParams;
  const queryObj: any = {};

  const query = qp.get("query");

  if (query) {
    queryObj.$or = [
      {
        name: { $regex: query, $options: "i" },
      },
    ];
  }

  const country_id = qp.get("country_id");

  if (country_id) {
    queryObj.$and = [{ country_id }];
  }

  const total = await col.countDocuments(queryObj);

  const items = await col
    .find(queryObj)
    .sort({ name: 1 })
    .collation({ locale: "es", caseLevel: true })
    .toArray();

  const data = {
    total,
    items,
  };

  return Response.json(data, corsParams);
}
