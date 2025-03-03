import { ObjectId } from 'mongodb';

export type Message = {
  _id: ObjectId;
  _followerId: ObjectId;
  _layoutId: ObjectId;
  type: 'instagram';
  status?: 'scheduled' | 'sent' | 'error';
  created: Date;
};
