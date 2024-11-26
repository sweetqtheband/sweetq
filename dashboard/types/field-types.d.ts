export enum FieldTypes {
  image = 'image',
  city = 'city',
  hidden = 'hidden',
  text = 'text',
  uploader = 'uploader',
  imageUploader = 'imageUploader',
  videoUploader = 'videoUploader',
  date = 'date',
  select = 'select',
  multiSelect = 'mutiSelect',
  video = 'video',
  hour = 'hour',
  none = 'none',
}

export type FieldTypesType = keyof typeof FieldTypes;
