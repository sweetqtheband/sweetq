export enum FieldTypes {
  image = 'image',
  hidden = 'hidden',
  text = 'text',
  uploader = 'uploader',
  imageUploader = 'imageUploader',
  videoUploader = 'videoUploader',
  date = 'date',
  select = 'select',
  video = 'video',
}

export type FieldTypesType = keyof typeof FieldTypes;
