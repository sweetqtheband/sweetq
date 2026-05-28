import { FinanceOperations } from "@/app/models/financeOperations";
import { BaseSvc } from "./_base";
import { Collection, Document } from "mongodb";

/**
 * FinanceOperations service
 */
export const FinanceOperationsSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, FinanceOperations),
});
