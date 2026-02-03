import { NextRequest } from "next/server";
import { getList, corsOptions, getCollection } from "@/app/services/api/_db";
import { ERRORS, SORT } from "@/app/constants";
import { FactorySvc } from "@/app/services/api/factory";

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

  const filters: {
    tags?: { $in: any } | { $nin: any };
    unfollow?: boolean;
    treatment?: { $in: any };
    country?: string;
    state?: string;
    city?: string;
  }[] = [];

  const filtersSvc = FactorySvc("filters", await getCollection("filters"));

  const filterKey = qp.get("filter");

  if (filterKey) {
    const filterItem = await filtersSvc.findOne({ key: filterKey });

    Object.keys(filterItem.filters).forEach((key) => {
      switch (key) {
        case "tags":
          filters.push({ tags: { $in: filterItem.filters[key] } });
          break;
        case "withoutTags":
          filters.push({ tags: { $nin: filterItem.filters[key] } });
          break;
        case "show":
          if (filterItem.filters[key] !== "2") {
            filters.push({ unfollow: filterItem.filters[key] === "1" });
          }
          break;
        case "treatment":
          if (filterItem.filters[key] instanceof Array && filterItem.filters[key].length > 0) {
            filters.push({ treatment: { $in: filterItem.filters[key].map((item) => +item) } });
          }
          break;
        case "country":
        case "state":
        case "city":
          if (filterItem.filters[key]) {
            filters.push({ [key]: +filterItem.filters[key] });
          }
          break;
      }
    });
  }

  if (!filterKey) {
    // Default filter to exclude unfollowed users
    filters.push({ unfollow: false });
  }

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
