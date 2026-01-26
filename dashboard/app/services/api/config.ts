import { Model } from "@/app/models/config";
import { BaseSvc } from "./_base";
import { Collection, Document } from "mongodb";

/**
 * Config service
 */
export const configSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
