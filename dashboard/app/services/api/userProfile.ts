import { getCollection } from "@/app/(pages)/api/db";

export const userProfileSvc = {
  model: getCollection("user_profiles"),
  /**
   * Find one
   * @param {Object} query
   * @returns {User}
   */
  findOne: async (query: Record<string, any>) => (await userProfileSvc.model).findOne(query),

  /**
   * Get by id
   * @param {String|import("mongoose").ObjectId} value
   * @returns
   */
  getById: async (value: string) => userProfileSvc.findOne({ _id: value }),
  /**
   * Get by type
   * @param {String|import("mongoose").ObjectId} value
   * @returns
   */
  getByType: async (value: string) => userProfileSvc.findOne({ type: value }),
};
