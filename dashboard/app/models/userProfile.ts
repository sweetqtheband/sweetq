type Model = {
  _id: string;
  type: string;
};
export const Model = (data: any): Model => {
  const obj = {
    type: String(data.type),
  } as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  return obj;
};
