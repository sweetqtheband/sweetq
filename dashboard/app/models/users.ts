type Model = {
  _id: string;
  _profileId: string;
  name: string;
  username: string;
  password: string;
  profile: string;
};
export const Model = (data: any): Model => {
  const obj = {
    name: String(data.name),
    username: String(data.username),
    profile: String(data.profile),
  } as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  return obj;
};
