type Model = {
  _id: string;
  name: string;
  description: object;
  keywords: object;
  robots: string;
  created: Date;
  from?: Date;
  default?: boolean;
};
export const Model = (data: any): Model => {
  const obj = {} as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.name) {
    obj.name = String(data.name);
  }

  if (data.description) {
    obj.description = data.description;
  }

  if (data.keywords) {
    obj.keywords = data.keywords;
  }

  if (data.robots) {
    obj.robots = data.robots;
  }

  if (data.from) {
    obj.from = new Date(data.from);
  }

  if (!data.created) {
    obj.created = new Date();
  } else {
    obj.created = new Date(data.created);
  }

  if (data.default) {
    obj.default = true;
  }

  return obj;
};
