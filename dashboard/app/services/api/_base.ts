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
    findAll: async (query: Record<string, any> = {}) => model.find(query).toArray(),
    getById: async (value: string) =>
      model.findOne({ _id: new ObjectId(value) }),
    getAllById: async (values: string[]) =>
      model
        .find({ _id: { $in: values.map((value) => new ObjectId(value)) } })
        .toArray(),
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
    modelize: (value: any) => Model(value),
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
    update: async (item: Record<string, any>, avoidUnset: Boolean = false) => {
      const dbObj = await instance.getById(item._id);
      const obj = await instance.parse({ value: { ...item } });

      delete obj._id;

      const modifiers: Record<string, any> = {
        $set: obj,
      };

      if (!avoidUnset) {
        modifiers['$unset'] = dbObj
          ? Object.keys(dbObj)
              .filter((key) => !(key in obj) && key !== '_id')
              .reduce(
                (acc: Record<string, string>, key: string) => (
                  (acc[key] = ''), acc
                ),
                {}
              )
          : [];
      } else {
        modifiers['$unset'] = Object.keys(obj).reduce(
          (acc: Record<string, any>, key: string) => {
            if (obj[key] === undefined || obj[key] === null) {
              acc[key] = '';
              delete modifiers.$set[key];
            }
            return acc;
          },
          {}
        );
      }

      await instance.model.findOneAndUpdate(
        { _id: new ObjectId(item._id) },
        modifiers,
        {
          includeResultMetadata: true,
        }
      );

      return instance.parse({ value: obj });
    },
    remove: async (id: string) => {
      const dbObj = await instance.getById(id);

      if (dbObj) {
        await instance.model.deleteOne({ _id: new ObjectId(id) });
      }

      return instance.parse({ value: dbObj });
    },
  };
};
