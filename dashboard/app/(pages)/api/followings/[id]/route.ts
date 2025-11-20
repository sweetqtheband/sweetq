import { Options as options, Types as types } from "@/app/services/followings";
import { NextRequest } from "next/server";
import { putItem, corsOptions, getCollection } from "@/app/services/api/_db";
import { ERRORS, HTTP_STATUS_CODES } from "@/app/constants";
import { FactorySvc } from "@/app/services/api/factory";

const collection = "followings";

interface Params {
  params: {
    id: string;
  };
}

export async function OPTIONS(req: NextRequest) {
  const [message, params] = corsOptions(req);
  return new Response(message, params);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const [message, corsParams] = corsOptions(req);

  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }
  const { id } = params;

  try {
    const item = await putItem({
      id,
      req,
      collection,
      types,
      options,
      avoidUnset: true,
    });

    // Check if following exists in followers and update there too
    const followersSvc = FactorySvc("followers", await getCollection("followers"));
    const follower = await followersSvc.findOne({ username: item.username });
    if (follower) {
      const updateFollower = { ...item };
      delete updateFollower._id;
      delete updateFollower.followed_back;

      await followersSvc.model.updateOne({ _id: follower._id }, { $set: { ...updateFollower } });
    }
    return Response.json({ data: item }, { ...corsParams, status: HTTP_STATUS_CODES.OK });
  } catch (err: any) {
    return Response.json({ err: err?.message }, { ...corsParams, status: HTTP_STATUS_CODES.ERROR });
  }
}
