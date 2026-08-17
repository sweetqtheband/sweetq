import { Model } from "@/app/models/socialNetworks";
import { BaseSvc } from "./_base";
import { Collection, Document } from "mongodb";

/**
 * Social networks service
 */
export const socialNetworksSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
