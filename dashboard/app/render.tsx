import {
  DatePicker,
  DatePickerInput,
  FileUploaderDropContainer,
  FileUploaderItem,
  FormItem,
  Select,
  SelectItem,
  Stack,
  TextInput,
  Tile,
} from '@carbon/react';
import { FIELD_TYPES, IMAGE_SIZES } from './constants';
import Image from 'next/image';
import { ChangeEvent } from 'react';

interface Field {
  field: string;
  type: string;
  value: string;
  translations: Record<string, any>;
  fields: Record<string, any>;
  files: Record<string, any>;
  formState: Record<string, any>;
  onAddFileHandler: Function;
  onRemoveFileHandler: Function;
  onInputHandler: Function;
}

// Renderers

// Hidden field
const renderHidden = ({ field, value }: Field) => (
  <input type="hidden" key={field} value={value} />
);

// Image field
const renderImage = ({ field, value }: Field) => (
  <Image
    key={field}
    src={value}
    alt={field}
    width={IMAGE_SIZES.lg}
    height={IMAGE_SIZES.lg}
  />
);

// Text input field
const renderTextInput = ({
  field,
  value,
  translations,
  formState,
  onInputHandler,
}: Field) => (
  <TextInput
    key={field}
    id={field}
    labelText={translations.fields[field]}
    value={formState[field] || value}
    onChange={(e: ChangeEvent<HTMLInputElement>) =>
      onInputHandler(field, e.target.value)
    }
  />
);

// Select field
const renderSelect = ({
  field,
  value,
  translations,
  formState,
  fields,
  onInputHandler,
}: Field) => (
  <Select
    key={field}
    id={field}
    labelText={translations.fields[field]}
    value={formState[field] || value}
    onChange={(e: ChangeEvent<HTMLSelectElement>) =>
      onInputHandler(field, e.target.value)
    }
  >
    {fields.options[field].options.map((option: any) => (
      <SelectItem
        key={option.id}
        value={option.id}
        text={translations.options[field][option.id]}
      />
    ))}
  </Select>
);

const getFileAside = (type: string, file: File | Record<any, string>) => {
  const url = file instanceof File ? URL.createObjectURL(file) : file.src;

  const renderAside = {
    [FIELD_TYPES.IMAGE_UPLOADER]: (
      <Image
        src={url}
        alt={file.name}
        width={IMAGE_SIZES.lg}
        height={0}
        style={{ width: IMAGE_SIZES.lg + 'px', height: 'auto' }}
      />
    ),
    [FIELD_TYPES.VIDEO_UPLOADER]: (
      <video autoPlay loop className="video-reel">
        <source src={url} />
      </video>
    ),
  };

  return renderAside[type] || '';
};

// Uploader field
const renderUploader = ({
  type,
  field,
  translations,
  files,
  onAddFileHandler,
  onRemoveFileHandler,
}: Field) => {
  const accepted =
    type === FIELD_TYPES.IMAGE_UPLOADER
      ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      : ['video/mp4'];
  return (
    <FormItem key={field}>
      <p className="cds--file--label">{translations.fields[field]}</p>
      {!files[field].length ? (
        <>
          <FileUploaderDropContainer
            key={field}
            id={field}
            labelText={translations.uploader}
            name={field}
            disabled={false}
            onChange={(e) => console.log('onChange', e)}
            onAddFiles={(_, { addedFiles: files }) =>
              onAddFileHandler(field, files)
            }
            accept={accepted}
          />
          <div className="cds--file-container cds--file-container--drop" />
        </>
      ) : (
        <>
          {files[field].map((fileObj: Record<string, any>) => {
            return (
              <Tile key={fileObj.id}>
                <Stack
                  gap={4}
                  orientation="horizontal"
                  className="align-center"
                >
                  {getFileAside(type, fileObj.file)}
                  <FileUploaderItem
                    name={fileObj.file.name}
                    status="edit"
                    onDelete={() => onRemoveFileHandler(field, fileObj)}
                  ></FileUploaderItem>
                </Stack>
              </Tile>
            );
          })}
        </>
      )}
    </FormItem>
  );
};

const renderDatePicker = ({ field, value, translations, formState }: Field) => (
  <DatePicker
    key={field}
    datePickerType="single"
    dateFormat="d/m/Y"
    locale={translations.locale}
    value={new Date(formState[field] || value)}
  >
    <DatePickerInput
      placeholder="dd/mm/yyyy"
      labelText={translations.fields[field]}
      id="date-picker-single"
      size="md"
    />
  </DatePicker>
);

const renderers = {
  [FIELD_TYPES.HIDDEN]: renderHidden,
  [FIELD_TYPES.IMAGE]: renderImage,
  [FIELD_TYPES.TEXT]: renderTextInput,
  [FIELD_TYPES.SELECT]: renderSelect,
  [FIELD_TYPES.IMAGE_UPLOADER]: renderUploader,
  [FIELD_TYPES.VIDEO_UPLOADER]: renderUploader,
  [FIELD_TYPES.DATE]: renderDatePicker,
};

// Main renderer
export const renderField = (obj: any) => {
  const { type } = obj;
  return typeof renderers[type] === 'function' && renderers[type](obj);
};
