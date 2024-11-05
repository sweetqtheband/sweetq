import { v4 as uuidv4 } from 'uuid';

export const getClasses = (obj: Record<string, any>) =>
  Object.keys(obj)
    .filter((name) => obj[name])
    .join(' ');

export const setClasses = (obj: any) => {
  let returning = obj;

  if (obj && typeof obj === 'object') {
    if (obj instanceof Array) {
      returning = obj
        .filter((part) => {
          if (typeof part === 'object') {
            return getClasses(part);
          } else {
            return part;
          }
        })
        .join(' ');
    } else {
      return getClasses(obj);
    }
  }

  return returning;
};

export const unquote = (str: string) => str.replace(/['"]+/g, '');

export const uuid = () => uuidv4();

export const getFormData = (data: any, files: any) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (files[key]?.length && files[key][0].file instanceof File) {
      formData.append(key, files[key][0].file);
    } else {
      formData.append(key, data[key]);
    }
    formData.append(key, data[key]);
  });
  return formData;
};
