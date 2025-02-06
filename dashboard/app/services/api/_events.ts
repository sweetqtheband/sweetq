import { getCollection } from '@/app/services/api/_db';
import { ObjectId } from 'mongodb';

const col = getCollection('app_events');

const find = async (query: any) => (await col).findOne(query);

const parse = (obj: any, add: boolean = false) => {
  const item = {
    ...obj,
  };

  if (add) {
    item.created = new Date();
    item.updated = new Date();
  } else {
    item.updated = new Date();
  }

  return item;
};
const add = async (type: string, data: any) =>
  (await col).insertOne(parse({ ...data, eventType: type }, true));
const update = async (data: any) => {
  const model = await col;

  return model.findOneAndUpdate(
    { _id: new ObjectId(data._id) },
    { $set: parse({ ...data }) },
    {
      includeResultMetadata: true,
    }
  );
};
const remove = async (_id: ObjectId) => (await col).deleteOne({ _id });

export const EA = {
  find,
  add,
  update,
  remove,
};
