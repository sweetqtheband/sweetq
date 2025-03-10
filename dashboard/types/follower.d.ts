import { ObjectId } from 'mongodb';

export type Follower = {
  _id: ObjectId;
  id: string;
  username: string;
  short_name?: string;
  followed_by_viewer?: boolean;
  is_private?: boolean;
  is_verified?: boolean;
  profile_pic_url?: string;
  requested_by_viewer?: boolean;
  instagram_id?: number;
  instagram_conversation_id?: string;
  updated?: string;
  created?: string;
  country?: string;
  state?: string;
  city?: string;
  treatment?: number;
  tags?: Array<number>;
};
