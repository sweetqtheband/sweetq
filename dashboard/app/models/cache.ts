type Model = {
  _id: string;
  type: string;
  conversationId?: string | null;
  data?: any;
  created?: Date | string;
};
export const Model = (data: any): Model => {
  const obj = {} as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.type) {
    obj.type = String(data.type);
  }
  if (data.conversationId) {
    obj.conversationId = String(data.conversationId);
  }

  if (data.data) {
    obj.data = data.data;
  }

  if (!data.created) {
    obj.created = new Date().toUTCString();
  } else {
    obj.created = new Date(data.created);
  }

  return obj;
};
