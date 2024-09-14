import jwt from "jsonwebtoken";
import { getCollection, toTimestamp } from "@/app/(pages)/api/db";
import config from "@/app/config";


/**
 * Token service
 */
const tokenSvc = {
  tokenModel: {} as any,  
  /**
   * Find one
   * @param {Object} query
   * @returns {AccessToken}
   */
  async findOne(query: Record<string, any>) {    
    return await(await this.tokenModel)
      .find(query)
      .limit(1)
      .sort({ $natural: -1 })[0];
  },
  /**
   * Get by user id
   * @param {Object} value
   * @returns {AccessToken}
   */
  async getByUserId(value:string) {
    return (await this.tokenModel).findOne({ _uid: value });
  },
  /**
   * Get by token
   * @param {Object} value
   * @returns {AccessToken}
   */
  async getByToken(value:string) {
    return (await this.tokenModel).findOne({ token: value });
  },
  /**
   * Remove token
   * @param {String} value Token Id
   * @returns
   */
  async remove(value:string) {
    return (await this.tokenModel).deleteOne({ _id: value });
  },
  /**
   * Create token
   * @param {Object} user DB User
   * @param {String|Boolean} mustExpire. Tells if token must expire or not
   */
  async create(user:Record<string, any>, mustExpire:string|boolean = true) {
    const token = jwt.sign(
      {
        name: user.username,
        id: user._uuid,
      },
      process.env.TOKEN_SECRET as string
    );

    const expires =
      !mustExpire || mustExpire === "false"
        ? 0
        : toTimestamp(new Date()) + config.tokens.expireDays * 86400;

    await (await accessTokenSvc.tokenModel).insertOne({ _uid: user._id, token, expires });
    return token;
  },
};

export const accessTokenSvc = {
	...tokenSvc,
	tokenModel: getCollection("access_tokens")
};

export const adminTokenSvc = {
  ...tokenSvc,
  tokenModel: getCollection("admin_tokens"),
};
