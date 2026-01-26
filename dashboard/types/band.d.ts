import { ObjectId } from "mongodb";

export type Band = {
  _id: ObjectId;
  name: string;
  facebook?: string;
  instagram?: string;
};
