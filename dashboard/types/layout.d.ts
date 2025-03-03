import { ObjectId } from 'mongodb';

export type Layout = {
  _id: ObjectId;
  name: string;
  type: string;
  tpl: Record<string, any>;
};
