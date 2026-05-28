type FinanceOperations = {
  _id: string;
};

export const FinanceOperations = (data: any): FinanceOperations => {
  const obj = {} as FinanceOperations;

  if (data._id) {
    obj._id = String(data._id);
  }

  return obj;
};
