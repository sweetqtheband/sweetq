import {
  Button,
  DatePicker,
  DatePickerInput,
  DismissibleTag,
  Dropdown,
  FileUploaderDropContainer,
  FileUploaderItem,
  FilterableMultiSelect,
  FormItem,
  Stack,
  TextInput,
  Tile,
} from '@carbon/react';
import {
  FIELD_DEFAULTS,
  FIELD_TYPES,
  IMAGE_SIZES,
  SIZES,
  TAG_TYPES,
} from './constants';
import Image from 'next/image';
import { ChangeEvent } from 'react';
import { Add } from '@carbon/react/icons';
import { Size } from '@/types/size';
import config from './config';

interface Field {
  field: string;
  type: string;
  value: string;
  disabled: boolean;
  translations: Record<string, any>;
  fields: Record<string, any>;
  files: Record<string, any>;
  methods: Record<string, any>;
  formState: Record<string, any>;
  internalState: Record<string, any>;
  ref: any;
  params: any;
  pathname: string;
  replace: Function;
  onAddFileHandler: Function;
  onRemoveFileHandler: Function;
  onInputHandler: Function;
  onInternalStateHandler: Function;
  className: string | undefined;
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
}: Field) => {
  const inputValue = formState[field] || value;

  return (
    <TextInput
      key={field}
      id={field}
      labelText={translations.fields[field]}
      value={inputValue || ''}
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        onInputHandler(field, e.target.value)
      }
    />
  );
};

const renderTextMap = ({
  field,
  value,
  translations,
  formState,
  onInputHandler,
}: Field) => (
  <>
    {renderTextInput({
      field,
      value,
      translations,
      formState,
      onInputHandler,
    } as Field)}
  </>
);

// Select field
const renderSelect = ({
  field,
  translations,
  disabled = false,
  fields,
  formState,
  onInputHandler,
  className,
}: Field) => {
  const items = fields.options[field].options.map((option: any) => ({
    id: option.id,
    text: translations.options[field]?.[option.id] || option.value,
  }));
  const value = formState[field];

  const selectedItem = value
    ? items.find((item: Record<string, any>) => item.id === value)
    : undefined;

  return (
    <FormItem key={field}>
      <p className="cds--label">{translations.fields[field]}</p>
      <Dropdown
        className={className}
        disabled={disabled}
        key={field}
        id={field}
        label={translations.fields[field]}
        items={items}
        selectedItem={selectedItem ?? undefined}
        itemToString={(item) => (item ? item?.text : '')}
        onChange={({ selectedItem }) => {
          onInputHandler(field, selectedItem?.id);
        }}
      />
    </FormItem>
  );
};

// Multiselect field
const renderMultiSelect = ({
  field,
  translations,
  formState,
  internalState,
  disabled = false,
  fields,
  ref,
  params,
  pathname,
  replace,
  onInputHandler,
  onInternalStateHandler,
  methods,
  className,
}: Field) => {
  const items = fields.options[field].options.map((option: any) => ({
    id: option.id,
    text: translations.options[field]?.[option.id] || option.value,
  }));
  const value = formState[field] || [];
  const selectedItems = value
    ? items.filter((item: Record<string, any>) => value.includes(item.id)) ?? []
    : [];

  const onInputValueChangeHandler = (changes: any) => {
    const itemExists = items.filter(
      (item: Record<string, string>) =>
        item.text.toLocaleLowerCase().indexOf(changes.toLocaleLowerCase()) !==
        -1
    ).length;

    onInternalStateHandler(field, {
      ...internalState[field],
      value: changes,
      canAdd: !itemExists && changes.length > 0,
    });
  };

  const onMenuChangeHandler = (isOpen: boolean) => {
    if (isOpen === false && internalState?.[field]?.canAdd) {
      onInternalStateHandler(field, {
        ...internalState[field],
        canAdd: false,
      });
    }
  };

  const onDismissHandler = (id: string) => {
    const newState = formState[field].filter((item: string) => item !== id);
    onInputHandler(field, newState);

    if (!newState.length) {
      onInternalStateHandler(field, {
        ...internalState[field],
        value: '',
        canAdd: false,
      });
    }
  };

  const onAddHandler = async () => {
    if (methods[field]?.onSave) {
      onInternalStateHandler(field, {
        ...internalState[field],
        disabled: true,
      });
      const response = await methods[field].onSave(internalState[field]?.value);
      onInputHandler(field, [...formState[field], response.data._id]);
      onInternalStateHandler(field, {
        ...internalState[field],
        disabled: false,
      });
    }
  };

  const onChangeHandler = ({
    selectedItems,
  }: Readonly<{ selectedItems: Record<string, any> }>) => {
    onInputHandler(
      field,
      selectedItems?.map((item: Record<string, any>) => item.id) ?? []
    );

    if (!selectedItems.length) {
      onInternalStateHandler(field, {
        ...internalState[field],
        canAdd: false,
      });
    }
  };

  const onButtonFocusHandler = () => {
    onAddHandler();
  };

  const onKeyDownHandler = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddHandler();
    }
  };

  if (!internalState[field]?.scrollListener && ref?.current) {
    onInternalStateHandler(field, {
      ...internalState[field],
      scrollListener: false,
      page: internalState[field]?.page ?? 0,
    });

    const ul = ref.current.querySelector('ul');
    ul?.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = ul;
      if (scrollTop + clientHeight >= scrollHeight) {
        const page = (internalState[field]?.page ?? 0) + 1;
        console.log(page);
        onInternalStateHandler(field, {
          ...internalState[field],
          page,
        });

        params.set(`options.${field}`, page);
        replace(`${pathname}?${params.toString()}`);
      }
    });

    onInternalStateHandler(field, {
      ...internalState[field],
      scrollListener: true,
    });
  }

  return (
    <FormItem key={field} className="multiselect">
      <p className="cds--label">{translations.fields[field]}</p>
      <div
        className="cds--multiselect"
        role="listbox"
        tabIndex={0}
        onKeyDown={onKeyDownHandler}
      >
        <FilterableMultiSelect
          className={className}
          disabled={internalState[field]?.disabled ?? disabled}
          key={field}
          id={field}
          ref={ref}
          onInputValueChange={onInputValueChangeHandler}
          placeholder={translations.fields[field]}
          items={items}
          selectedItems={selectedItems ?? []}
          itemToString={(item: Record<string, any>) => (item ? item?.text : '')}
          onChange={onChangeHandler}
          onMenuChange={onMenuChangeHandler}
          filterItems={(items, { inputValue }) =>
            items.filter((item) =>
              item.text.toLowerCase().includes(inputValue?.toLowerCase() ?? '')
            )
          }
        />
        {internalState?.[field]?.canAdd ? (
          <Button
            className="cds--button--add"
            hasIconOnly
            renderIcon={Add}
            size={SIZES.SM as Size.sm}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddHandler();
            }}
            onFocus={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onButtonFocusHandler();
            }}
          />
        ) : null}
      </div>
      <Stack gap={4} orientation="horizontal">
        {value.map((id: Record<string, any>, index: number) => {
          const item = items.find(
            (item: Record<string, any>) => item.id === id
          );
          return item?.text ? (
            <DismissibleTag
              size={SIZES.SM as Size.sm}
              key={item?.id}
              text={item?.text}
              type={TAG_TYPES[index]}
              title={translations.delete}
              onClose={() => onDismissHandler(item?.id)}
            />
          ) : null;
        })}
      </Stack>
    </FormItem>
  );
};

const renderHour = ({
  field,
  value,
  translations,
  formState,
  fields,
  onInputHandler,
}: Field) => {
  const extendedFields = { ...fields };
  fields.options[field] = {
    options: Array.from({ length: 24 }, (_, h) => {
      return Array.from({ length: 60 }, (_, m) => {
        if (m % 15 !== 0) return null; // Filtrar los minutos que no son múltiplos de 15

        const hour = `${h.toString().padStart(2, '0')}:${m
          .toString()
          .padStart(2, '0')}`;
        return {
          id: hour,
          value: hour,
        };
      }).filter(Boolean); // Filtrar valores nulos de los minutos que no cumplen el % 15
    }).flat(),
  };

  return renderSelect({
    field,
    value,
    translations,
    formState,
    onInputHandler,
    fields: extendedFields,
  } as Field);
};

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

const countryDropdown = ({
  field = 'country',
  value = FIELD_DEFAULTS.COUNTRY,
  fields,
  translations,
  formState,
  onInputHandler,
  className,
}: Field) =>
  renderSelect({
    field,
    value,
    fields,
    translations,
    formState,
    onInputHandler,
    className,
  } as Field);

const stateDropdown = ({
  field = 'state',
  value,
  fields,
  translations,
  formState,
  onInputHandler,
  className,
}: Field) =>
  renderSelect({
    field,
    value,
    fields,
    translations,
    formState,
    onInputHandler,
    className,
  } as Field);
const cityDropdown = ({
  field = 'city',
  value,
  fields,
  translations,
  formState,
  onInputHandler,
  className,
}: Field) =>
  renderSelect({
    field,
    value,
    fields,
    translations,
    formState,
    disabled: !formState?.state,
    onInputHandler,
    className,
  } as Field);

const renderCity = ({
  field,
  value,
  fields,
  translations,
  formState,
  onInputHandler,
}: Field) => {
  return (
    <Stack gap={4} orientation="horizontal" key={field}>
      {countryDropdown({
        className: 'cds--text-input__field-outer-wrapper',
        value: String(formState.country) || FIELD_DEFAULTS.country,
        fields,
        translations,
        formState,
        onInputHandler,
      } as Field)}
      {stateDropdown({
        className: 'cds--text-input__field-outer-wrapper',
        value: String(formState.state) || null,
        fields,
        translations,
        formState,
        onInputHandler,
      } as Field)}
      {cityDropdown({
        className: 'cds--text-input__field-outer-wrapper',
        value: String(formState.city) || null,
        fields,
        translations,
        formState,
        onInputHandler,
      } as Field)}
    </Stack>
  );
};

const renderDatePicker = ({ field, value, translations, formState }: Field) => {
  const defaultValue = formState[field] || value;
  return (
    <DatePicker
      key={field}
      datePickerType="single"
      dateFormat="d/m/Y"
      locale={translations.locale}
      value={defaultValue ? new Date(defaultValue) : undefined}
    >
      <DatePickerInput
        placeholder="dd/mm/yyyy"
        labelText={translations.fields[field]}
        id="date-picker-single"
        size="md"
      />
    </DatePicker>
  );
};

const renderers = {
  [FIELD_TYPES.HIDDEN]: renderHidden,
  [FIELD_TYPES.CITY]: renderCity,
  [FIELD_TYPES.IMAGE]: renderImage,
  [FIELD_TYPES.TEXT]: renderTextInput,
  [FIELD_TYPES.TEXTMAP]: renderTextMap,
  [FIELD_TYPES.HOUR]: renderHour,
  [FIELD_TYPES.SELECT]: renderSelect,
  [FIELD_TYPES.MULTISELECT]: renderMultiSelect,
  [FIELD_TYPES.IMAGE_UPLOADER]: renderUploader,
  [FIELD_TYPES.VIDEO_UPLOADER]: renderUploader,
  [FIELD_TYPES.DATE]: renderDatePicker,
  [FIELD_TYPES.NONE]: () => null,
};

// Main renderer
export const renderField = (obj: any) => {
  const { type } = obj;
  return typeof renderers[type] === 'function' && renderers[type](obj);
};
