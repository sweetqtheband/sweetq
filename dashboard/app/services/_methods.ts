import { BaseListItem } from '@/types/list';
import { HTTP_STATUS_CODES } from '../constants';
import { getFormData } from '../utils';
export const onSave = async (
  instance: any,
  router: any,
  data: any,
  files: any
) => {
  const formData = getFormData(data, files);

  console.log(data, formData);

  const response = await (data._id
    ? instance.put(data._id, formData)
    : instance.post(formData));

  router.refresh();

  setTimeout(() => {
    router.refresh();
  }, 0);
  return response.status === HTTP_STATUS_CODES.OK ? response.data : false;
};

export const onDelete = async (
  instance: BaseListItem,
  router: any,
  ids: string | string[]
) => {
  const response = await instance.delete(ids);
  router.refresh();
  return response.status === HTTP_STATUS_CODES.OK ? response.data : false;
};

export const getMethods = (
  router?: any,
  instance?: any
): Record<string, any> => ({
  onSave: (data: any, files: any) => onSave(instance, router, data, files),
  onDelete: (ids: string[]) => onDelete(instance, router, ids),
});
