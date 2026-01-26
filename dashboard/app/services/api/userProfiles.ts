import { Model } from "@/app/models/userProfile";
import { BaseSvc } from "./_base";
import { Collection, Document } from "mongodb";
/**
 * User profiles service
 */
export const userProfilesSvc = (collection: Collection<Document>) => {
  const baseSvc = BaseSvc(collection, Model);

  return {
    ...baseSvc,
    /**
     * Find one
     * @param {Object} query
     * @returns {User}
     */
    findOne: async (query: Record<string, any>) => (await baseSvc.model).findOne(query),

    /**
     * Get by id
     * @param {String|import("mongoose").ObjectId} value
     * @returns
     */
    getById: async (value: string) => baseSvc.findOne({ _id: value }),
    /**
     * Get by type
     * @param {String|import("mongoose").ObjectId} value
     * @returns
     */
    getByType: async (value: string) => baseSvc.findOne({ type: value }),
  };
};
