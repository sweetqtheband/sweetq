type Model = {
  _id: string;
  name: string;
  color?: string;
};
export const Model = (data: any): Model => {
  const obj = {
    name: String(data.name),
  } as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.color) {
    obj.color = String(data.color);
  }

  return obj;
};
