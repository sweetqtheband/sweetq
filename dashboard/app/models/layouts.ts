type Model = {
  _id: string;
  name: string;
  type: string;
  tpl: Record<string, any>;
  personalMessage?: string;
  collectiveMessage?: string;
};
export const Model = (data: any): Model => {
  const obj = {} as Model;

  if (data.name) {
    obj.name = String(data.name);
  }

  if (data.type) {
    obj.type = String(data.type);
  }

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.tpl) {
    obj.tpl = typeof data.tpl === "string" ? JSON.parse(data.tpl) : data.tpl;
  }

  if (data.personalMessage || data.collectiveMesage) {
    obj.tpl = {
      personalMessage: data.personalMessage ? String(data.personalMessage) : "",
      collectiveMessage: data.collectiveMessage ? String(data.collectiveMessage) : "",
    };
  }

  return obj;
};
