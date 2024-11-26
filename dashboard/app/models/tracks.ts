type Model = {
  _id: string;
  id: string;
  title: string;
  date: string;
  cover: string;
  video: string;
  status: string;
};
export const Model = (data: any): Model => {
  const obj = {
    id: String(data.id),
    title: String(data.title),
    date: String(data.date),
    cover: String(data.cover),
    video: String(data.video),
    status: String(data.status),
  } as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  return obj;
};
