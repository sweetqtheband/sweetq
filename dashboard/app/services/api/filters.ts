import { Model } from "@/app/models/filters";
import { BaseSvc } from "./_base";
import { Collection, Document } from "mongodb";

/**
 * Filters service
 */
export const filtersSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
