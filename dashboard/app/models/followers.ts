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
  updated?: string;
  created?: string;
  country?: number;
  state?: number;
  city?: number;
  treatment?: number;
};
export const Model = (data: any): Model => {
  const obj = {
    id: String(data.id),
    username: String(data.username),
  } as Model;

  if (data._id) {
    obj._id = String(data._id);
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

  return obj;
};
