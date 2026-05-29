type Model = {
  _id: string;
  _followerId: string;
  _followingId: string;
  _layoutId: string;
  type: "instagram";
  created: string;
  status?: "scheduled" | "sent" | "error";
  updated?: string;
};
export const Model = (data: any, fromPrepare: boolean = false): Model => {
  const obj = {} as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.type) {
    obj.type = data.type;
  }

  if (data._followerId) {
    obj._followerId = fromPrepare ? data._followerId : String(data._followerId);
  }

  if (data._followingId) {
    obj._followingId = fromPrepare ? data._followingId : String(data._followingId);
  }

  if (data._layoutId) {
    obj._layoutId = fromPrepare ? data._layoutId : String(data._layoutId);
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

  return obj;
};
