import { ObjectId } from "mongodb";

export type Track = {
  _id: ObjectId;
  slug: string;
  title: string;
  date?: string;
  cover?: string;
  video?: string;
  status?: string;
  description?: string;
  lyrics?: string;
  download?: boolean;
};
