type Model = {
  _id: string;
  title: string;
  subtitle?: string;
  type: string;
  text: string;
  image?: string;
  button?: boolean;
  buttonText?: string;
  link?: string;
  linkType?: string;
};
export const Model = (data: any): Model => {
  const obj = {
    title: String(data.title),
    type: String(data.type),
    text: String(data.text),
  } as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.subtitle) {
    obj.subtitle = String(data.subtitle);
  }

  if (data.image) {
    obj.image = String(data.image);
  }

  if (data.button) {
    obj.button = Boolean(data.button);
  }

  if (data.buttonText) {
    obj.buttonText = String(data.buttonText);
  }

  if (data.link) {
    obj.link = String(data.link);
  }

  if (data.linkType) {
    obj.linkType = String(data.linkType);
  }

  return obj;
};
