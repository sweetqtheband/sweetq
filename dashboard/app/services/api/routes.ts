import { Model } from "@/app/models/routes";
import { BaseSvc } from "./_base";
import { Collection, Document } from "mongodb";

/**
 * Routes service
 */
export const routesSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
