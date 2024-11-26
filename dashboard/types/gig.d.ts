import { ObjectId } from 'mongodb';

export type Gig = {
  _id: ObjectId;
  id: string;
  date?: string;
  city?: string;
  hour?: string;
  venue?: string;
  address?: string;
  map?: string;
  bands?: Number[];
  event?: string;
  tickets?: string;
};
