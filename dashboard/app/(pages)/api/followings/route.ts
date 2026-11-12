import { NextRequest } from "next/server";
import { getList, corsOptions, getCollection } from "@/app/services/api/_db";
import { ERRORS, SORT } from "@/app/constants";
import { FactorySvc } from "@/app/services/api/factory";
import { buildUserFilters } from "@/app/services/api/instagram/user-filters";
import { visibleInstagramUserFilter } from "@/app/services/api/instagram/user-visibility";

const collection = "followings";
const idx = "created";

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

  const queryObj: any = {};

  const filtersSvc = FactorySvc("filters", await getCollection("filters"));

  const filterKey = qp.get("filter");

  const filterItem = filterKey ? await filtersSvc.findOne({ key: filterKey }) : undefined;
  const filters = buildUserFilters(filterKey ? filterItem.filters : undefined);
  filters.push(visibleInstagramUserFilter);

  const query = qp.get("query");

  if (filters.length > 0) {
    queryObj.$and = filters;
  }

  if (query) {
    queryObj.$or = [
      {
        full_name: { $regex: query, $options: "i" },
      },
      {
        username: { $regex: query, $options: "i" },
      },
    ];
  }

  return Response.json(
    await getList({
      req,
      collection,
      idx,
      sort: SORT.DESC,
      queryObj,
    }),
    corsParams
  );
}
