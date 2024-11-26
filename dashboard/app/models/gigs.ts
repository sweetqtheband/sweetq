type Model = {
  _id: string;
  date: string;
  country: number;
  state: number;
  city: number;
  title: string;
  venue: string;
  bands: Array<number>;
  hour?: string;
  map?: string;
  event?: string;
  tickets?: string;
};
export const Model = (data: any): Model => {
  const obj = {
    date: String(data.date),
    country: Number(data.country),
    state: Number(data.state),
    city: Number(data.city),
    title: String(data.title),
    venue: data.venue,
    bands: data.bands instanceof Array ? data.bands : [],
  } as Model;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.hour) {
    obj.hour = String(data.hour);
  }
  if (data.map) {
    obj.map = String(data.map);
  }
  if (data.event) {
    obj.event = String(data.event);
  }
  if (data.tickets) {
    obj.tickets = String(data.tickets);
  }

  return obj;
};
