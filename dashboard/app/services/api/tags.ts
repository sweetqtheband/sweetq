import { Model } from "@/app/models/tags";
import { BaseSvc } from "./_base";
import { Collection, Document } from "mongodb";

/**
 * Tags service
 */
export const tagsSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
