type Model = {
  _id: string;
  _followerId: string;
  _layoutId: string;
  type: "instagram";
  created: string;
  status?: "scheduled" | "sent" | "error";
  updated?: string;
  retry?: number;
};
export const Model = (data: any): Model => {
  const obj = {
    retry: 0,
  } as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.type) {
    obj.type = data.type;
  }

  if (data._followerId) {
    obj._followerId = String(data._followerId);
  }

  if (data._layoutId) {
    obj._layoutId = String(data._layoutId);
  }

  if (data.type) {
    obj.type = data.type;
  }

  obj.status = data.status ? data.status : "scheduled";
  if (data.created) {
    obj.created = data.created;
  }
  if (data.updated) {
    obj.updated = data.updated;
  }

  if (data.retry) {
    obj.retry = data.retry;
  }

  return obj;
};
