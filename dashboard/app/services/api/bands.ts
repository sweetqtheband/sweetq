import { Model } from "@/app/models/bands";
import { BaseSvc } from "./_base";
import { Collection, Document } from "mongodb";

/**
 * Bands service
 */
export const bandsSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
