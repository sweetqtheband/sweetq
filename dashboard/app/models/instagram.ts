type Model = {
  _id: string;
  id: string;
  short_live_access_token?: string;
  long_live_access_token?: string;
  user_id?: number;
  expires?: Date;
};
export const Model = (data: any): Model => {
  const obj = {
    id: String(data.id),
  } as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.id) {
    obj.id = String(data.id);
  }

  if (data.user_id) {
    obj.user_id = Number(data.user_id);
  }

  if (data.short_live_access_token) {
    obj.short_live_access_token = String(data.short_live_access_token);
  }

  if (data.long_live_access_token) {
    obj.long_live_access_token = String(data.long_live_access_token);
  }

  if (data.expires_in) {
    const date = new Date();
    date.setSeconds(date.getSeconds() + Number(data.expires_in));
    obj.expires = date;
  }

  return obj;
};
