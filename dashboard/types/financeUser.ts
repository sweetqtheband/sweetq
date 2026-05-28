import { ObjectId } from "mongodb";

export type FinanceUser = {
  _id: ObjectId;
  name: string;
  percentage: number;
  ordering?: number;
};
