import { I18n } from 'next-i18next';
import { v4 as uuidv4 } from 'uuid';
import { BREAKPOINTS, FIELD_TYPES } from './constants';

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
    } else if (typeof data[key] === 'object') {
      formData.append(key, JSON.stringify(data[key]));
    } else {
      formData.append(key, data[key]);
    }
  });

  return formData;
};

export const s3File = (fileName: string) =>
  `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileName}`;

export const formDataToObject = (
  formData: FormData,
  types: Record<string, any>,
  options?: Record<string, any>
): Record<string, any> => {
  const obj: Record<string, any> = {};

  formData.forEach((value, key) => {
    if (key in obj) {
      obj[key] =
        Array.isArray(obj[key]) && obj[key] instanceof File
          ? [...obj[key], value]
          : value;
    } else if (types[key] === FIELD_TYPES.MULTISELECT) {
      obj[key] =
        value !== 'undefined'
          ? String(value)
              .replace('[', '')
              .replace(']', '')
              .replaceAll('"', '')
              .split(',')
          : [];
    } else if (options?.[key]?.language) {
      obj[key] = JSON.parse(value as string);
      return;
    } else {
      obj[key] = value !== 'undefined' ? value : null;
    }
  });

  return obj;
};

export const dateFormat = (
  date: Date = new Date(),
  format: string = 'short.date',
  i18n?: I18n | null,
  translations?: Record<string, any>
) => {
  let dateFormat = format;

  if (!dateFormat.includes('%')) {
    dateFormat = i18n
      ? String(i18n?.t(`date.formats.${format}`))
      : String(getValue(translations?.date.formats, format));
  }

  const replaces: Record<string, string> = {
    '%d': String(date.getDate()),
    '%D': String(date.getDate()).padStart(2, '0'),
    '%m': String(date.getMonth() + 1).padStart(2, '0'),
    '%M': String(
      i18n
        ? i18n?.t(`date.months.${date.getMonth()}`)
        : getValue(translations?.date, `months.${String(date.getMonth())}`)
    ),
    '%MM': String(
      i18n
        ? i18n?.t(`date.months.${date.getMonth()}`)
        : getValue(translations?.date, `months.${String(date.getMonth())}`)
            .substring(0, 3)
            .toLocaleLowerCase()
    ),
    '%y': String(date.getFullYear()).substring(2, 4),
    '%Y': String(date.getFullYear()),
    '%H': String(date.getHours()).padStart(2, '0'),
    '%i': String(date.getMinutes()).padStart(2, '0'),
    '%s': String(date.getSeconds()).padStart(2, '0'),
  };

  const str =
    dateFormat
      ?.match(/%[dmyisDMYH]{1,2}/g)
      ?.reduce(
        (acc: string, datePart: any) =>
          acc.replace(datePart, replaces[datePart]),
        dateFormat
      ) ?? '';

  return str !== '' ? str[0].toUpperCase() + str.slice(1) : str;
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

export const from = (size: Breakpoint): boolean => {
  const width = document.body.clientWidth;
  const sizes = {
    mobile: width < BREAKPOINTS.MOBILE,
    tablet:
      width < BREAKPOINTS.TABLET,
    laptop:
      width < BREAKPOINTS.LAPTOP,
    desktop:
      width < BREAKPOINTS.DESKTOP,
    large: width >= BREAKPOINTS.DESKTOP,
  };  

  return sizes[size];
};

export const camelCase = (str: string) =>
  str
    .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, (char) => char.toLowerCase());

export const t = (template: string, params: Record<string, any>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] || `{{${key}}}`);

export const getValue = (obj: Record<string, any>, path: string) =>
  path
    .split('.')
    .reduce((acc: Record<string, any>, key: string) => acc?.[key], obj);

export const deepEqual: any = (obj1: any, obj2: any) => {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => deepEqual(obj1[key], obj2[key]));
};

export const isMobile = () => {
  return typeof navigator !== 'undefined'
    ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    : false;
};
