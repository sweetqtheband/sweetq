import { I18n } from 'next-i18next';
import { v4 as uuidv4 } from 'uuid';
import { BREAKPOINTS, FIELD_TYPES } from './constants';
import { table } from 'console';

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
    } else if (data[key]) {
      formData.append(key, data[key]);
    }
  });

  return formData;
};

export const s3File = (fileName: string) =>
  `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileName}`;

export const formDataToObject = (
  formData: FormData,
  types: Record<string, any>
): Record<string, any> => {
  const obj: Record<string, any> = {};

  formData.forEach((value, key) => {
    if (key in obj) {
      obj[key] =
        Array.isArray(obj[key]) && obj[key] instanceof File
          ? [...obj[key], value]
          : value;
    } else if (types[key] === FIELD_TYPES.MULTISELECT) {
      obj[key] = value !== 'undefined' ? String(value).split(',') : [];
    } else {
      obj[key] = value !== 'undefined' ? value : null;
    }
  });

  return obj;
};

export const dateFormat = (
  date: Date = new Date(),
  format: string = 'short.date',
  i18n?: I18n
) => {
  let dateFormat = i18n?.t(`date.formats.${format}`);

  const replaces: Record<string, string> = {
    '%d': String(date.getDate()),
    '%D': String(date.getDate()).padStart(2, '0'),
    '%m': String(date.getMonth() + 1).padStart(2, '0'),
    '%M': String(i18n?.t(`date.formats.months.${date.getMonth()}`)),
    '%y': String(date.getFullYear()).substring(2, 4),
    '%Y': String(date.getFullYear()),
  };

  const str =
    dateFormat
      ?.match(/%[dmyDMY]{1,2}/g)
      ?.reduce(
        (acc, datePart) => acc.replace(datePart, replaces[datePart]),
        dateFormat
      ) ?? '';

  return str[0].toUpperCase() + str.slice(1);
};

type Breakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'large';
export const breakpoint = (size: Breakpoint): boolean => {
  const sizes = {
    mobile: screen.width < BREAKPOINTS.MOBILE,
    tablet:
      screen.width >= BREAKPOINTS.MOBILE && screen.width < BREAKPOINTS.TABLET,
    laptop:
      screen.width >= BREAKPOINTS.TABLET && screen.width < BREAKPOINTS.LAPTOP,
    desktop:
      screen.width >= BREAKPOINTS.LAPTOP && screen.width < BREAKPOINTS.DESKTOP,
    large: screen.width >= BREAKPOINTS.DESKTOP,
  };

  return sizes[size];
};

export const camelCase = (str: string) =>
  str
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase());

export const t = (template: string, params: Record<string, any>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] || `{{${key}}}`);
