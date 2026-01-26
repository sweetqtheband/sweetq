import { NextRequest } from "next/server";
import { getList, corsOptions, getQueryFilter, removeQueryFilter } from "@/app/services/api/_db";
import { ERRORS, SORT } from "@/app/constants";

const collection = "followers";
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

  const filters = [];

  const query = qp.get("query");
  const filterShow = getQueryFilter(req, "show");
  if (filterShow !== "2") {
    filters.push({
      unfollow: filterShow === "1",
    });
  }
  removeQueryFilter(req, "show");

  const filterWithoutTags = getQueryFilter(req, "withoutTags", true);
  if (filterWithoutTags) {
    filters.push({
      tags: { $nin: filterWithoutTags },
    });
  }
  removeQueryFilter(req, "withoutTags");

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
