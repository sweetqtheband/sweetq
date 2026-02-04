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
  getAllById: async (queryObj: Record<string, any> = {}) =>
    collection
      .find({ ...queryObj, status: "scheduled" })
      .toArray()
      .then((items) => items.map((item) => Model(item))),
  getAllByFollowerId: async (followerId: string) =>
    messagesSvc(collection).getAllById({ _followerId: new ObjectId(followerId) }),
  getAllByFollowingId: async (followingId: string) =>
    messagesSvc(collection).getAllById({ _followingId: new ObjectId(followingId) }),
  parse: async (user: Record<string, any>, message: Record<string, any>) => {
    const layoutSvc = FactorySvc("layouts", await getCollection("layouts"));
    const layout = await layoutSvc.getById(message._layoutId);

    let tpl =
      (!user.treatment || user.treatment === 1
        ? layout.tpl.personalMessage
        : layout.tpl.collectiveMessage) || "";

    VARIABLES.forEach((variable) => {
      tpl = tpl.replace(variable.replacement, user[variable.id]);
    });

    return tpl;
  },
});
