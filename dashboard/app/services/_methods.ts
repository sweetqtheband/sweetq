import { BaseListItem } from "@/types/list";
import { HTTP_STATUS_CODES } from "../constants";
import { getFormData } from "../utils";
import { DELETE, POST, PUT } from "./_api";
import { AxiosInstance } from "axios";
export const onSave = async (instance: AxiosInstance, router: any, data: any, files: any) => {
  const formData = getFormData(data, files);

  const response = await (data._id ? PUT(instance, data._id, formData) : POST(instance, formData));

  router.refresh();

  setTimeout(() => {
    router.refresh();
  }, 0);
  return response.status === HTTP_STATUS_CODES.OK ? response.data : false;
};

export const onCopy = async (instance: AxiosInstance, router: any, data: any) => {
  if (data.title) {
    data.title = `Copia de ${data.title}`;
  }
  if (data.name) {
    data.name = `Copia de ${data.name}`;
  }
  delete data._id;
  const formData = getFormData(data);

  const response = await POST(instance, formData);

  router.refresh();

  setTimeout(() => {
    router.refresh();
  }, 0);
  return response.status === HTTP_STATUS_CODES.OK ? response.data : false;
};

export const onDelete = async (instance: AxiosInstance, router: any, ids: string | string[]) => {
  const response = (await DELETE(instance, ids)) as any;
  router.refresh();
  return response.status === HTTP_STATUS_CODES.OK ? response.data : false;
};

export const getMethods = (instance?: any, router?: any): Record<string, any> => ({
  onSave: (data: any, files: any) => onSave(instance, router, data, files),
  onDelete: (ids: string[]) => onDelete(instance, router, ids),
  onCopy: (data: any) => onCopy(instance, router, data),
  onListSave: (value: string) => onSave(instance, router, { name: value }, {}),
});
