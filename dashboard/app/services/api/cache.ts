import { Model } from "@/app/models/cache";
import { BaseSvc } from "./_base";
import { Collection, Document } from "mongodb";

/**
 * Cache service
 */
export const cacheSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
