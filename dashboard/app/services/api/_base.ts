import { Collection, Document, ObjectId } from 'mongodb';

/**
 * Base service
 */
export const BaseSvc = (model: Collection<Document>, Model: Function) => {
  const instance = {
    model,
    /**
     * Find one
     * @param {Object} query
     * @returns {User}
     */
    findOne: async (query: Record<string, any>) => model.findOne(query),
    getById: async (value: string) =>
      model.findOne({ _id: new ObjectId(value) }),
    /**
     * Parse user before returning
     * @param {Object} user
     * @returns {Object}
     */
    async parse(item: Record<string, any>) {
      const obj = Model({
        ...item.value,
      });
      return obj;
    },
  };

  return {
    ...instance,
    parse: async (item: Record<string, any>) => {
      const obj = {
        ...item,
      };
      return obj;
    },
    create: async (item: Record<string, any>) => {
      const obj = { ...item };
      const dbResult = await instance.model.insertOne(obj);

      const created = await instance.model.findOne({
        _id: new ObjectId(dbResult.insertedId),
      });

      return instance.parse({ value: { ...created } });
    },
    update: async (item: Record<string, any>) => {
      const dbObj = await instance.getById(item._id);
      const obj = await instance.parse({ value: { ...item } });

      delete obj._id;

      const unsetObj = dbObj
        ? Object.keys(dbObj)
            .filter((key) => !(key in obj) && key !== '_id')
            .reduce(
              (acc: Record<string, string>, key: string) => (
                (acc[key] = ''), acc
              ),
              {}
            )
        : [];

      await instance.model.findOneAndUpdate(
        { _id: new ObjectId(item._id) },
        { $set: obj, $unset: unsetObj },
        {
          includeResultMetadata: true,
        }
      );

      return instance.parse({ value: obj });
    },
  };
};
