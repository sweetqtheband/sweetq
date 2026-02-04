import { Model } from "@/app/models/followers";
import { BaseSvc } from "./_base";
import { Collection, Document } from "mongodb";
import { getCollection } from "@/app/services/api/_db";
import { FactorySvc } from "./factory";

/**
 * Followers service
 */
export const followersSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
  parse: async (item: Record<string, any>) => {
    const countriesSvc = FactorySvc("countries", await getCollection("countries"));
    const statesSvc = FactorySvc("states", await getCollection("states"));
    const citiesSvc = FactorySvc("cities", await getCollection("cities"));
    const tagsSvc = FactorySvc("tags", await getCollection("tags"));
    const messagesSvc = FactorySvc("messages", await getCollection("messages"));
    const messages = await messagesSvc.getAllByFollowerId(item._id);

    const obj = {
      ...item,
    };

    obj.relations = {};

    if (obj.country) {
      obj.relations.country = (await countriesSvc.findOne({ id: String(obj.country) })).name;
    }

    if (obj.state) {
      obj.relations.state = (await statesSvc.findOne({ id: String(obj.state) })).name;
    }

    if (obj.city && !isNaN(obj.city)) {
      obj.relations.city = (await citiesSvc.findOne({ id: String(obj.city) })).name;
    }

    if (obj.tags) {
      obj.relations.tags = await tagsSvc.getAllById(obj.tags);
    }

    obj.messages = messages
      .filter((m: Record<string, any>) => m.status === "scheduled")
      .map((m: Record<string, any>) => m._id);

    obj.pending_messages =
      messages.length > 0 ? await messagesSvc.parse(obj, messages.at(0)) : null;
    return obj;
  },
});
