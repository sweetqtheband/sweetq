import { Model } from "@/app/models/cities";
import { BaseSvc } from "./_base";
import { Collection, Document } from "mongodb";

/**
 * Cities service
 */
export const citiesSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
