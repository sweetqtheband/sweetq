import { ObjectId } from 'mongodb';

export type New = {
  _id: ObjectId;
  title: string;
  subtitle?: string;
  type: string;
  text: string;
  image?: string;
  button?: boolean;
  buttonText?: string;
  href?: string;
  linkType?: string;
};
