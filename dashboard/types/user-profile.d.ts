import { ObjectId } from 'mongodb';

export type UserProfile = {
  _id: ObjectId;
  name: string;
};
