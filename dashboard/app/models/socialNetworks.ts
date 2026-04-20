type Model = {
  _id: string;
  name: string;
  logo: string;
  link: string;
  ordering: number;
  published: boolean;
};
export const Model = (data: any): Model => {
  const obj = {
    ordering: Number(data.ordering) || 0,
  } as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.name) {
    obj.name = String(data.name);
  }

  if (data.logo) {
    obj.logo = String(data.logo);
  }

  if (data.link) {
    obj.link = String(data.link);
  }

  if (data.published !== undefined) {
    obj.published = Boolean(data.published);
  }

  return obj;
};
