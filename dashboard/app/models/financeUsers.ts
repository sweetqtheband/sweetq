import { FinanceUsers as FinanceUsersType } from "@/types/finances";
import { UserFinanceType } from "@/types/finances";

type FinanceUsers = FinanceUsersType;

export const FinanceUsers = (data: any): FinanceUsers => {
  const obj = {
    ordering: Number(data.ordering) || 0,
    memberType: String(data.memberType) || UserFinanceType.OPERATIVE,
  } as FinanceUsers;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.name) {
    obj.name = String(data.name);
  }

  if (data.userId) {
    obj.userId = String(data.userId);
  } else {
    obj.userId = null;
  }

  if (data.percentage) {
    obj.percentage = Number(data.percentage);
  }

  return obj;
};
