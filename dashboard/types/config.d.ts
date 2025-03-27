import { ObjectId } from 'mongodb';

export type ConfigType = {
  _id: ObjectId;
  name: string;
  description: object;
  keywords: object;
  robots: string;
  created: Date;
  from: Date;
  default?: boolean;
};
