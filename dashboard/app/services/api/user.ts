import { v4 as uuid } from 'uuid';

import { getCollection } from '@/app/services/api/_db';
import { encSvc } from './encryption';
import { FactorySvc } from './factory';
import { ObjectId } from 'mongodb';

/**
 * User service
 */
export const userSvc = {
  model: getCollection('users'),
  userProfileSvc: async () =>
    FactorySvc('userProfiles', await getCollection('user_profiles')),
  /**
   * Parse user before returning
   * @param {Object} user
   * @returns {Object}
   */
  async parseUser(user: Record<string, any>) {
    const obj = {
      ...user,
    };

    const profile = await (
      await userSvc.userProfileSvc()
    ).getById(user._profileId);
    obj.id = user._id.toHexString();
    obj.profile = profile?.type;

    delete obj.__v;
    delete obj._id;
    delete obj._profileId;
    delete obj._uuid;
    delete obj.password;

    return obj;
  },
  /**
   * Find one
   * @param {Object} query
   * @returns {User}
   */
  findOne: async (query: Record<string, any>) =>
    (await userSvc.model).findOne(query),

  /**
   * Get by id
   * @param {*} value
   * @returns
   */
  getById: async (value: string) =>
    userSvc.findOne({ _id: new ObjectId(value) }),
  /**
   * Get by username
   * @param {string} value Retrieve user by username
   * @returns {User}
   */
  getByUsername: async (value: string) => userSvc.findOne({ username: value }),
  /**
   * Get by email
   * @param {string} value Retrieve user by email
   * @returns {User}
   */
  getByEmail: async (value: string) => userSvc.findOne({ email: value }),

  /**
   * Get by user
   * @param {string} value
   * @returns
   */
  getByUser: async (value: string) =>
    userSvc.findOne({ $or: [{ username: value }, { email: value }] }),

  /**
   * Gets encrypted password
   * @param {string} password User password
   * @param {string} uuid User UUID
   * @returns {string}
   */
  _getPassword(password: string, uuid: string) {
    const salt = uuid.split('-').at(-1);

    return encSvc.encrypt(`${password}:${salt}`);
  },
  /**
   * Validate password
   * @param {Object} fields User fields
   * @param {string} password User password
   * @returns
   */
  async validatePassword(fields: Record<string, string>, password: string) {
    const user = fields.username
      ? await userSvc.getByUser(fields.username)
      : await userSvc.getByEmail(fields.email);

    return user && userSvc._getPassword(password, user._uuid) === user.password
      ? user
      : false;
  },
  /**
   * Create method
   * @param {Object} item
   * @returns
   */
  async create(item: Record<string, any>) {
    const obj = { ...item };

    obj._uuid = uuid();
    obj.password = userSvc._getPassword(item.password, obj._uuid);

    const userProfileSvc = await userSvc.userProfileSvc();
    const profile = await userProfileSvc.getByType(item.profile);

    obj._profileId = profile?._id;

    const dbResult = await (await userSvc.model).insertOne(obj);
    obj._id = dbResult.insertedId;
    return this.parseUser(obj);
  },
  /**
   * Update method
   * @param {Object} item
   * @returns
   */
  async update(item: Record<string, any>) {
    try {
      const user = (await userSvc.getById(item._id)) as Record<string, any>;

      const obj = {
        ...item,
      };
      delete obj._id;
      delete obj.profile;
      if (item.password) {
        obj.password = userSvc._getPassword(item.password, user._uuid);
      }

      const userProfileSvc = await userSvc.userProfileSvc();
      const profile = await userProfileSvc.getByType(item.profile);

      obj._profileId = profile?._id;

      await (
        await userSvc.model
      ).findOneAndUpdate(
        { _id: new ObjectId(user._id) },
        { $set: obj },
        {
          includeResultMetadata: true,
        }
      );

      return this.parseUser({ ...user, ...obj });
    } catch (err) {
      console.log(err);
    }
  },
};
