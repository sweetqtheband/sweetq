import { Model } from "@/app/models/messages";
import { BaseSvc } from "./_base";
import { Collection, Document, ObjectId } from "mongodb";
import { FactorySvc } from "./factory";
import { getCollection } from "./_db";
import { VARIABLES } from "@/app/constants";

/**
 * Messages service
 */
export const messagesSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
  getAllByFollowerId: async (followerId: string) =>
    collection
      .find({ _followerId: new ObjectId(followerId), status: "scheduled" })
      .toArray()
      .then((items) => items.map((item) => Model(item))),
  parseForFollower: async (follower: Record<string, any>, message: Record<string, any>) => {
    const layoutSvc = FactorySvc("layouts", await getCollection("layouts"));
    const layout = await layoutSvc.getById(message._layoutId);

    let tpl =
      (!follower.treatment || follower.treatment === 1
        ? layout.tpl.personalMessage
        : layout.tpl.collectiveMessage) || "";

    VARIABLES.forEach((variable) => {
      tpl = tpl.replace(variable.replacement, follower[variable.id]);
    });

    return tpl;
  },
});
