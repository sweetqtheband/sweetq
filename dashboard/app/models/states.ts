type Model = {
  _id: string;
  _countryId: string;
  name: string;
  country_id: string;
};
export const Model = (data: any): Model => {
  const obj = {
    _countryId: String(data._countryId),
    name: String(data.name),
    country_id: String(data.country_id),
  } as Model;

  return obj;
};
