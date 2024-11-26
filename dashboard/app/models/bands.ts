type Model = {
  _id: string;
  name: string;
  facebook?: string;
  instagram?: string;
};
export const Model = (data: any): Model => {
  const obj = {
    name: String(data.name),
  } as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.facebook) {
    obj.facebook = String(data.facebook);
  }

  if (data.instagram) {
    obj.instagram = String(data.instagram);
  }

  return obj;
};
