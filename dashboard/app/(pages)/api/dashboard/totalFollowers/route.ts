import { NextRequest } from "next/server";
import { corsOptions, getCollection } from "@/app/services/api/_db";
import { ERRORS } from "@/app/constants";
import { FactorySvc } from "@/app/services/api/factory";
import { Follower } from "@/types/follower";
import { Tag } from "@/types/tag";

export async function GET(req: NextRequest) {
  const [message, corsParams] = corsOptions(req);
  if (message?.error === ERRORS.CORS) {
    return new Response(message, corsParams);
  }

  const followersSvc = FactorySvc("followers", await getCollection("followers"));
  const tagsSvc = FactorySvc("tags", await getCollection("tags"));

  const tags = await tagsSvc.findAll();

  const followers = await followersSvc.findAll();

  const data = {
    total: followers.filter((follower: Follower) => !follower?.unfollow).length,
    lost: followers.filter((follower: Follower) => follower.unfollow).length,
    byTag: tags.map((tag: Tag) => {
      return {
        id: tag._id.toString(),
        name: tag.name,
        count: followers.filter(
          (follower: Follower) => !follower?.unfollow && follower.tags?.includes(tag._id.toString())
        ).length,
      };
    }),
    byTagLost: tags.map((tag: Tag) => {
      return {
        id: tag._id.toString(),
        name: tag.name,
        count: followers.filter(
          (follower: Follower) => follower.unfollow && follower.tags?.includes(tag._id.toString())
        ).length,
      };
    }),
    censed: followers.filter((follower: Follower) => !follower?.unfollow && follower.state).length,
    censedLost: followers.filter((follower: Follower) => follower.unfollow && follower.state)
      .length,
  };

  return Response.json(data);
}
