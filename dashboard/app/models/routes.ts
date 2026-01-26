type Model = {
  _id: string;
  name: string;
  path: string;
};
export const Model = (data: any): Model => {
  const obj = {
    name: String(data.name),
    path: String(data.path),
  } as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  return obj;
};
