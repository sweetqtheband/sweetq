import { ObjectId } from "mongodb";

export type SocialNetwork = {
  _id: ObjectId;
  name: string;
  logo: string;
  link: string;
  published: boolean;
  ordering: number;
};
