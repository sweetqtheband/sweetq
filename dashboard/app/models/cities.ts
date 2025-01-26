type Model = {
  _id: string;
  _stateId: string;
  name: string;
  state_id: string;
};
export const Model = (data: any): Model => {
  const obj = {
    _stateId: String(data._stateId),
    name: String(data.name),
    state_id: String(data.state_id),
  } as Model;

  return obj;
};
