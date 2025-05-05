import {
  Button,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  DatePickerInput,
  DismissibleTag,
  Dropdown,
  FileUploaderDropContainer,
  FileUploaderItem,
  FilterableMultiSelect,
  FormItem,
  IconButton,
  PasswordInput,
  Stack,
  TextArea,
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
import { Add, Close } from '@carbon/react/icons';
import { Size } from '@/types/size';
import { renderItem } from './renderItem';
import { getClasses, s3File } from './utils';

interface Field {
  field: string;
  type: string;
  value: any;
  disabled: boolean;
  removable: boolean;
  translations: Record<string, any>;
  fields: Record<string, any>;
  files: Record<string, any>;
  methods: Record<string, any>;
  formState: Record<string, any>;
  internalState: Record<string, any>;
  renders: Record<string, any>;
  ref: any;
  params: any;
  pathname: string;
  replace: Function;
  onAddFileHandler: Function;
  onRemoveFileHandler: Function;
  onInputHandler: Function;
  onFormStateHandler: Function;
  onInternalStateHandler: Function;
  className: string | undefined;
  ready?: boolean;
}

// Renderers

// Hidden field
const renderHidden = ({ field, value }: Field) => (
  <input type="hidden" key={field} value={value} />
);

// Image field
const renderImage = ({ field, value }: Field) => {
  let defaultValue = value;
  if (value?.startsWith('imgs')) {
    defaultValue = s3File('/' + value);
  }

  if (value?.startsWith('/imgs')) {
    defaultValue = s3File(value);
  }
  return (
    <Image
      key={field}
      src={defaultValue}
      alt={field}
      width={IMAGE_SIZES.lg}
      height={IMAGE_SIZES.lg}
      crossOrigin="anonymous"
    />
  );
};

// Hidden field
const renderLabel = ({ field, value, translations }: Field) => {
  return (
    <FormItem key={field}>
      <p className="cds--label">{translations?.[field]}</p>
      <div>{value}</div>
    </FormItem>
  );
};

// Text input field
const renderTextInput = ({
  field,
  value,
  translations,
  formState,
  onInputHandler,
}: Field) => {
  const inputValue = formState?.[field] || value;

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

// Text area field
const renderTextArea = ({
  field,
  value,
  fields,
  translations,
  formState,
  internalState,
  onInputHandler,
  onInternalStateHandler,
}: Field) => {
  const inputValue = formState?.[field] || value;

  const maxCount = fields?.options[field]?.maxLength;
  const language = fields?.options[field]?.language;
  const onChangeHandler = (field: string, value: string) => {
    if (language) {
      const newInternalState = {
        ...internalState[field],
        [internalState[field]?.locale]: value,
      };

      onInternalStateHandler(field, newInternalState);

      const newFormState = JSON.parse(JSON.stringify(newInternalState));
      delete newFormState.locale;

      onInputHandler(field, newFormState);
    } else {
      onInternalStateHandler(field, value);
      onInputHandler(field, value);
    }
  };

  if (!internalState[field]) {
    const newInternalState = {
      ...translations.availableLanguages.reduce(
        (acc: Record<string, string>, locale: string) => ({
          ...acc,
          [locale]: inputValue?.[locale] || '',
        }),
        {}
      ),
      locale: translations.locale,
    };
    onInternalStateHandler(field, newInternalState);
  }

  const onLanguageChangeHandler: Function = (field: string, locale: string) => {
    onInternalStateHandler(field, {
      ...internalState[field],
      locale,
    });
  };

  return (
    <>
      <TextArea
        enableCounter={maxCount > 0}
        key={field}
        id={field}
        maxCount={maxCount}
        labelText={translations.fields[field]}
        value={
          (language
            ? inputValue?.[internalState?.[field]?.locale]
            : inputValue) || ''
        }
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          onChangeHandler(field, e.target.value)
        }
      />
      {language
        ? renderLanguageSelector({
            field,
            translations,
            value: internalState?.[field]?.locale,
            onInputHandler: onLanguageChangeHandler,
          } as Field)
        : null}
    </>
  );
};

const renderLanguageSelector = ({
  field,
  translations,
  value,
  onInputHandler,
}: Field) => (
  <div className="cds--language-selector ">
    {translations?.availableLanguages.map((locale: string) => {
      const img = '/imgs/flags/' + locale + '.svg';
      return (
        <Image
          key={`${field}-${locale}`}
          src={img}
          className={value === locale ? 'selected' : ''}
          alt={translations.languages[locale]}
          width={IMAGE_SIZES.sm}
          height={IMAGE_SIZES.sm}
          crossOrigin="anonymous"
          onClick={() => onInputHandler(field, locale)}
        />
      );
    })}
  </div>
);

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
  value,
  translations,
  removable = false,
  disabled = false,
  fields,
  formState,
  internalState = {},
  onFormStateHandler = () => {},
  onInputHandler = () => {},
  onInternalStateHandler = () => {},
  className,
  renders,
  ready = true,
}: Field) => {
  const items = fields?.options[field]?.options.map((option: any) => ({
    id: option.id,
    text: translations?.options[field]?.[option.id] || option.value,
  }));
  const defaultValue =
    formState?.[field] instanceof Array
      ? formState?.[field][0]
      : formState?.[field]
      ? formState?.[field]
      : value;

  const selectedItem = defaultValue
    ? items.find(
        (item: Record<string, any>) =>
          item.id === value || item.id === String(value)
      )
    : undefined;

  if (
    ready &&
    selectedItem &&
    !internalState?.[field] &&
    !internalState?.[`removed[${field}]`]
  ) {
    setTimeout(() => {
      onInternalStateHandler(field, selectedItem, formState);
      onInputHandler(field, selectedItem?.id);
    }, 0);
  }

  const handleRemoveClick = () => {
    onInternalStateHandler([field, `removed[${field}]`], [null, true]);
    onInputHandler(field, undefined);
    onFormStateHandler(field, null);
  };

  const itemToString = renders?.[field]?.itemToString
    ? (item: any) => renderItem(renders?.[field]?.itemToString(field, item))
    : (item: any) => item.text;

  const itemToElement = renders?.[field]?.itemToElement || itemToString;

  const currentValue = internalState?.[field] || null;

  return (
    <FormItem key={field}>
      <div className="cds--flex">
        <Dropdown
          autoAlign={true}
          className={className}
          disabled={disabled}
          key={field}
          id={field}
          label={translations.fields[field]}
          titleText={translations.fields[field]}
          items={items}
          selectedItem={currentValue}
          itemToString={itemToString}
          itemToElement={itemToElement}
          onChange={({ selectedItem }) => {
            onInternalStateHandler(field, selectedItem);
            onInputHandler(field, selectedItem?.id);
          }}
        />
        {removable && currentValue ? (
          <IconButton
            className="cds--button--remove"
            size={'sm'}
            kind="secondary"
            label={translations.delete}
            onClick={handleRemoveClick}
          >
            <Close />
          </IconButton>
        ) : null}
      </div>
    </FormItem>
  );
};

// Checkbox field
const renderCheckbox = ({
  field,
  translations,
  disabled = false,
  fields,
  formState,
  internalState,
  onInputHandler,
  onInternalStateHandler,
  className,
}: Field) => {
  const items = fields.options[field].options.map((option: any) => ({
    id: option.id,
    text: translations?.options[field]?.[option.id] || option.value,
  }));
  const value = formState?.[field];

  const selectedItem = value
    ? items.find((item: Record<string, any>) => item.id === value)
    : undefined;

  const handleCheckboxChange = (
    e: ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const newValue = e.target.checked ? id : null;

    const newState = {
      ...internalState[field],
      [id]: newValue,
    };

    onInternalStateHandler(field, newState);
    onInputHandler(
      field,
      Object.keys(newState).filter(
        (key: string | number) => newState[key] !== null
      )
    );
  };

  return (
    <CheckboxGroup
      legendText={translations.fields[field]}
      key={field}
      className={className}
    >
      {items.map((item: Record<string, any>) => (
        <Checkbox
          key={item.id}
          labelText={item.text}
          id={item.id}
          checked={formState[field]?.includes(String(item.id))}
          disabled={disabled}
          onChange={(e) => handleCheckboxChange(e, item.id)}
        />
      ))}
    </CheckboxGroup>
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
  const value = formState?.[field] || [];

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

      const frmSt = formState[field] || [];
      onInputHandler(field, [...frmSt, response.data._id]);
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
    if (e.key === 'Enter' && internalState[field]?.canAdd) {
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

  const selected = selectedItems ?? [];

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
          autoAlign={true}
          onInputValueChange={onInputValueChangeHandler}
          placeholder={translations.fields[field]}
          items={items}
          selectedItems={selected}
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
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              onAddHandler();
            }}
            onFocus={(e: any) => {
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
  internalState,
  fields,
  onInputHandler,
  onInternalStateHandler,
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
    internalState,
    onInputHandler,
    onInternalStateHandler,
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
            onChange={(e) => true}
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
  internalState,
  removable,
  onFormStateHandler,
  onInternalStateHandler,
  onInputHandler,
  className,
}: Field) =>
  renderSelect({
    field,
    value,
    fields,
    translations,
    formState,
    internalState,
    removable,
    onFormStateHandler,
    onInputHandler,
    onInternalStateHandler,
    className,
  } as Field);

const stateDropdown = ({
  field = 'state',
  value,
  fields,
  disabled,
  translations,
  formState,
  internalState,
  removable,
  onFormStateHandler,
  onInternalStateHandler,
  onInputHandler,
  className,
}: Field) =>
  renderSelect({
    field,
    value,
    fields,
    disabled,
    translations,
    formState,
    internalState,
    removable,
    onFormStateHandler,
    onInputHandler,
    onInternalStateHandler,
    className,
  } as Field);
const cityDropdown = ({
  field = 'city',
  value,
  fields,
  disabled,
  translations,
  formState,
  internalState,
  removable,
  onFormStateHandler,
  onInternalStateHandler,
  onInputHandler,
  className,
}: Field) =>
  renderSelect({
    field,
    value,
    fields,
    disabled,
    translations,
    formState,
    internalState,
    removable,
    onFormStateHandler,
    onInputHandler,
    onInternalStateHandler,
    className,
  } as Field);

const renderCountryFilter = ({
  fields,
  translations,
  formState,
  internalState,
  onFormStateHandler,
  onInternalStateHandler,
  onInputHandler,
}: Field) => {
  return countryDropdown({
    className: 'cds--text-input__field-outer-wrapper',
    value: String(formState?.country) || FIELD_DEFAULTS.country,
    fields,
    translations,
    formState,
    internalState,
    onInternalStateHandler,
    onFormStateHandler,
    onInputHandler,
    removable: true,
  } as Field);
};

const renderStateFilter = ({
  fields,
  translations,
  formState,
  internalState,
  onFormStateHandler,
  onInternalStateHandler,
  onInputHandler,
}: Field) => {
  return stateDropdown({
    className: 'cds--text-input__field-outer-wrapper',
    value: String(formState?.state) || null,
    fields,
    translations,
    formState,
    internalState,
    disabled: internalState?.country ? false : true,
    onFormStateHandler,
    onInternalStateHandler,
    onInputHandler,
    removable: true,
  } as Field);
};

const renderCityFilter = ({
  fields,
  translations,
  formState,
  internalState,
  onFormStateHandler,
  onInternalStateHandler,
  onInputHandler,
}: Field) => {
  return cityDropdown({
    className: 'cds--text-input__field-outer-wrapper',
    value: String(formState?.city) || null,
    fields,
    translations,
    formState,
    internalState,
    disabled: internalState?.state ? false : true,
    onFormStateHandler,
    onInternalStateHandler,
    onInputHandler,
    removable: true,
  } as Field);
};

const renderCity = ({
  field,
  value,
  fields,
  translations,
  formState,
  internalState,
  onInternalStateHandler,
  onInputHandler,
}: Field) => {
  return (
    <div className="cds--flex">
      {countryDropdown({
        className: 'cds--text-input__field-outer-wrapper',
        value: formState.country
          ? String(formState.country)
          : FIELD_DEFAULTS.country,
        fields,
        translations,
        internalState,
        formState,
        onInternalStateHandler,
        onInputHandler,
      } as Field)}
      {stateDropdown({
        className: 'cds--text-input__field-outer-wrapper',
        value: formState.state ? String(formState.state) : undefined,
        fields,
        translations,
        internalState,
        formState,
        onInternalStateHandler,
        onInputHandler,
      } as Field)}
      {cityDropdown({
        className: 'cds--text-input__field-outer-wrapper',
        value: formState.city ? String(formState.city) : undefined,
        fields,
        translations,
        internalState,
        formState,
        disabled: !formState.state,
        onInternalStateHandler,
        onInputHandler,
      } as Field)}
    </div>
  );
};

const renderDatePickerLabel = ({
  field,
  value,
  translations,
  formState,
}: Field) =>
  renderLabel({
    field,
    translations,
    value: renderDatePicker({ field, value, translations, formState } as Field),
  } as Field);

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
const renderPassword = ({ field, translations, onInputHandler }: Field) => {
  return (
    <PasswordInput
      key={field}
      id={field}
      showPasswordLabel={translations.showPassword}
      hidePasswordLabel={translations.hidePassword}
      labelText={translations.fields[field]}
      onChange={(e: ChangeEvent<HTMLInputElement>) =>
        onInputHandler(field, e.target.value)
      }
    />
  );
};

const renderers = {
  [FIELD_TYPES.HIDDEN]: renderHidden,
  [FIELD_TYPES.FILTER_COUNTRY]: renderCountryFilter,
  [FIELD_TYPES.FILTER_STATE]: renderStateFilter,
  [FIELD_TYPES.FILTER_CITY]: renderCityFilter,
  [FIELD_TYPES.CHECKBOX]: renderCheckbox,
  [FIELD_TYPES.CITY]: renderCity,
  [FIELD_TYPES.IMAGE]: renderImage,
  [FIELD_TYPES.TEXT]: renderTextInput,
  [FIELD_TYPES.TEXTAREA]: renderTextArea,
  [FIELD_TYPES.TEXTMAP]: renderTextMap,
  [FIELD_TYPES.HOUR]: renderHour,
  [FIELD_TYPES.SELECT]: renderSelect,
  [FIELD_TYPES.MULTISELECT]: renderMultiSelect,
  [FIELD_TYPES.IMAGE_UPLOADER]: renderUploader,
  [FIELD_TYPES.VIDEO_UPLOADER]: renderUploader,
  [FIELD_TYPES.DATE]: renderDatePicker,
  [FIELD_TYPES.DATE_LABEL]: renderDatePickerLabel,
  [FIELD_TYPES.LABEL]: renderLabel,
  [FIELD_TYPES.PASSWORD]: renderPassword,
};

// Main renderer
export const renderField = (obj: any) => {
  const { type, field } = obj;
  if (typeof renderers[type] === 'function') {
    const className = getClasses({
      field: true,
      [`field-${field}`]: true,
    });

    const renderObj = renderers[type](obj);
    return type === FIELD_TYPES.HIDDEN ? (
      renderObj
    ) : (
      <div className={className} key={obj.key}>
        {renderObj}
      </div>
    );
  }

  return null;
};
