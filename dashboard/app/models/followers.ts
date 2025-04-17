type Model = {
  _id: string;
  id: string;
  username: string;
  short_name?: string;
  followed_by_viewer?: boolean;
  is_private?: boolean;
  is_verified?: boolean;
  profile_pic_url?: string;
  requested_by_viewer?: boolean;
  instagram_id?: number;
  instagram_conversation_id?: string;
  updated?: string;
  created?: string;
  country?: number;
  state?: number;
  city?: number;
  treatment?: number;
  tags?: Array<string>;
};
export const Model = (data: any): Model => {
  const obj = {} as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.id) {
    obj.id = String(data.id);
  }

  if (data.username) {
    obj.username = String(data.username);
  }

  if (data.short_name) {
    obj.short_name = String(data.short_name);
  }

  if (data.country) {
    obj.country = Number(data.country);
  }

  if (data.state) {
    obj.state = Number(data.state);
  }

  if (data.city) {
    obj.city = Number(data.city);
  }

  if (data.treatment) {
    obj.treatment = Number(data.treatment);
  }

  if (data.instagram_id) {
    obj.instagram_id = Number(data.instagram_id);
  }

  if (data.instagram_conversation_id) {
    obj.instagram_conversation_id = String(data.instagram_conversation_id);
  }

  obj.tags =
    data.tags instanceof Array
      ? data.tags
      : data.tags !== '' && data.tags
      ? [data.tags]
      : null;

  return obj;
};
