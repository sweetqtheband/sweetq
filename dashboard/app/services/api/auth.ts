import { ERRORS, TOKENS, USER_PROFILES } from "@/app/constants";
import { accessTokenSvc, adminTokenSvc } from "./token";
import { userSvc } from "./user";
import { toTimestamp } from "@/app/(pages)/api/db";
import { NextRequest } from "next/server";


export const authSvc = {
  /**
   * Parse token
   */
  parseToken(token:Record<string, any>, user: Record<string, any>) {
    const obj:Record<string, any> = {
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    };

    delete obj._id;
    delete obj.__v;
    delete obj._uid;
    return obj;
  },

  /**
   * Get token by auth
   * @param {Object} req Request
   * @param {String} tokenType Token type
   * @returns {Object}
   */
  async getTokenByAuth(req:NextRequest, tokenType = TOKENS.ACCESS) {
    const tokenSvc =
      tokenType === TOKENS.ACCESS ? accessTokenSvc : adminTokenSvc;

    if (req.headers?.has("authorization")) {
      const authToken = req.headers.get("authorization")?.replace("Bearer ", "").trim() as string;
      return tokenSvc.getByToken(authToken);
    }
  },
  /**
   * Tell us if someone is auth with a valid token
   * @param {Object} req Request
   * @param {String} tokenType Token type
   * @returns {Boolean}
   */
  async isAuth(req: NextRequest, tokenType:string) {
    const token = await this.getTokenByAuth(req, tokenType);

    const validToken =
      token && (!token.expires || token.expires >= toTimestamp(new Date()));

    // Remove token
    if (token && !validToken) {
      await this.removeToken(token._id, tokenType);
    }
    return validToken || false;
  },

  /**
   * Remove token
   * @param {String} tokenId Token id
   * @param {String} tokenType Token type
   */
  async removeToken(tokenId:string, tokenType:string) {
    const tokenSvc =
      tokenType === TOKENS.ADMIN ? adminTokenSvc : accessTokenSvc;

    await tokenSvc.remove(tokenId);
  },

  /**
   * Create user token
   * @param {Object} user
   */
  async createUserToken(user:Record<string, any>, expire:string|boolean = false, tokenType = TOKENS.ADMIN) {
    let token = null;
    const tokenSvc =
      tokenType === TOKENS.ADMIN ? adminTokenSvc : accessTokenSvc;

    // Retrieve token or create if granted
    const userToken = await tokenSvc.getByUserId(user._id);

    if (userToken) {
      if (!userToken.expires || userToken.expires >= toTimestamp(new Date())) {
        token = userToken;
      } else {
        token = await tokenSvc.create(user, expire);
      }
    } else {
      token = await tokenSvc.create(user, expire);
    }

    return token;
  },

  /**
   * Get token
   * @param {Object} fields Request fields
   * @returns
   */
  async getToken(fields: Record<string, any>, tokenType = TOKENS.ACCESS) {
    let token = null;

    const user = await userSvc.validatePassword(fields, fields.password);

    if (user) {
      const parsedUser = await userSvc.parseUser(user);

      let canCreateToken = true;

      if (
        tokenType === TOKENS.ADMIN &&
        parsedUser.profile !== USER_PROFILES.ADMIN
      ) {
        canCreateToken = false;
      }

      if (canCreateToken) {
        token = await authSvc.createUserToken(user, fields.expires);
      }

      return this.parseToken(token, parsedUser);
    } else {
      throw new Error(ERRORS.INVALID_CREDENTIALS);
    }
  },
};
