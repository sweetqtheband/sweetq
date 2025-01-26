type Model = {
  _id: string;
  id: string;
  sortname: string;
  name: string;
};
export const Model = (data: any): Model => {
  const obj = {
    id: String(data.id),
    sortname: String(data.sortname),
    name: String(data.name),
  } as Model;

  return obj;
};
