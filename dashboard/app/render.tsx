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
  Loading,
  PasswordInput,
  SelectItem,
  Stack,
  TextArea,
  TextInput,
  Tile,
  TimePicker,
  TimePickerSelect,
} from "@carbon/react";
import { FIELD_DEFAULTS, FIELD_TYPES, IMAGE_SIZES, SIZES, TAG_TYPES } from "./constants";
import Image from "next/image";
import { ChangeEvent } from "react";
import { Add, Close } from "@carbon/react/icons";
import { Size } from "@/types/size";
import { renderItem } from "./renderItem";
import { getClasses, s3File } from "./utils";
import { ContentArea } from "./components";
import Link from "next/link";
import { Field } from "@/types/field";

// Renderers

// Hidden field
const renderHidden = ({ field, value }: Field) => <input type="hidden" key={field} value={value} />;

const renderBoolean = ({ field, value, translations }: Field) => {
  return (
    <FormItem key={field}>
      <Checkbox
        labelText={translations.fields[field]}
        id={field}
        checked={value === true || value === "true"}
      />
    </FormItem>
  );
};

// Image field
const renderImage = ({ field, value }: Field) => {
  let defaultValue = value;
  if (value?.startsWith("imgs")) {
    defaultValue = s3File("/" + value);
  }

  if (value?.startsWith("/imgs")) {
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
    <div key={field}>
      <p className="cds--label">{translations?.[field]}</p>
      {value}
    </div>
  );
};

// Link field
const renderLink = ({ field, fields, value }: Field) => {
  const linkValue = fields?.options?.[field].link?.pattern?.replace("#value#", value) || value;

  return (
    <Link href={linkValue} target="_blank" onClick={(e) => e.stopPropagation()}>
      {value}
    </Link>
  );
};

// Text input field
const renderTextInput = ({
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
          [locale]: inputValue?.[locale] || "",
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
    <div className="cds--text-input__field-outer-wrapper">
      <TextInput
        key={field}
        id={field}
        labelText={translations.fields[field]}
        value={(language ? inputValue?.[internalState?.[field]?.locale] : inputValue) || ""}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChangeHandler(field, e.target.value)}
      ></TextInput>
      {language
        ? renderLanguageSelector({
            field,
            translations,
            value: internalState?.[field]?.locale,
            onInputHandler: onLanguageChangeHandler,
          } as Field)
        : null}
    </div>
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
          [locale]: inputValue?.[locale] || "",
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
        value={(language ? inputValue?.[internalState?.[field]?.locale] : inputValue) || ""}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChangeHandler(field, e.target.value)}
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

const renderLanguageSelector = ({ field, translations, value, onInputHandler }: Field) => (
  <div className="cds--language-selector ">
    {translations?.availableLanguages.map((locale: string) => {
      const img = "/imgs/flags/" + locale + ".svg";
      return (
        <Image
          key={`${field}-${locale}`}
          src={img}
          className={value === locale ? "selected" : ""}
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

const renderTextMap = ({ field, value, translations, formState, onInputHandler }: Field) => (
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
  loading = false,
  fields,
  formState,
  internalState = {},
  onFormStateHandler = () => {},
  onInputHandler = () => {},
  onInternalStateHandler = () => {},
  onRemoveHandler = () => {},
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
    ? items.find((item: Record<string, any>) => item.id === value || item.id === String(value))
    : undefined;

  if (ready && selectedItem && !internalState?.[field] && !internalState?.[`removed[${field}]`]) {
    setTimeout(() => {
      onInternalStateHandler(field, selectedItem, formState);
      //onInputHandler(field, selectedItem?.id);
    }, 0);
  }

  const handleRemoveClick = () => {
    onInternalStateHandler([field, `removed[${field}]`], [null, true]);
    onInputHandler(field, undefined);
    onFormStateHandler(field, null);
    onRemoveHandler(field, null);
  };

  const itemToString = renders?.[field]?.itemToString
    ? (item: any) => renderItem(renders?.[field]?.itemToString(field, item))
    : (item: any) => item.text;

  const itemToElement = renders?.[field]?.itemToElement || itemToString;

  const currentValue = internalState?.[field] || null;

  const onChangeHandler = ({ selectedItem }: { selectedItem: any }) => {
    if (fields?.search?.[field]?.deletes?.length > 0) {
      const deleteFields = [field];
      const deleteValues = [selectedItem];

      fields.search[field].deletes.forEach((deleteField: string) => {
        deleteFields.push(deleteField);
        deleteValues.push(null);
      });

      onInternalStateHandler(deleteFields, deleteValues);
    } else {
      onInternalStateHandler(field, selectedItem);
    }
    onInputHandler(field, selectedItem?.id);
  };

  return (
    <FormItem key={field}>
      <div className="cds--flex">
        <Dropdown
          decorator={
            loading ? (
              <div className="cds--flex flex-end">
                <Loading small={true} withOverlay={false}></Loading>
              </div>
            ) : null
          }
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
          onChange={onChangeHandler}
        />
        {removable && currentValue ? (
          <IconButton
            className="cds--button--remove"
            size={"sm"}
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

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>, id: string) => {
    const newValue = e.target.checked ? id : null;

    const newState = {
      ...internalState[field],
      [id]: newValue,
    };

    onInternalStateHandler(field, newState);
    onInputHandler(
      field,
      Object.keys(newState).filter((key: string | number) => newState[key] !== null)
    );
  };

  return (
    <CheckboxGroup legendText={translations.fields[field]} key={field} className={className}>
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
  if (ref?.current && !internalState?.[field]?.onBlur) {
    onInternalStateHandler(field, {
      ...internalState[field],
      onBlur: true,
    });

    document.addEventListener("mousedown", (event) => {
      setTimeout(() => {
        const target = event?.target as HTMLElement;
        target.focus();
      }, 400);
    });

    ref.current.querySelector("input")?.addEventListener("blur", () => {
      if (ref.current?.dataset?.blurred) {
        ref.current.dataset.blurred = false;
      } else {
        setTimeout(() => {
          if (ref.current?.dataset?.blurred) {
            ref.current.dataset.blurred = true;
            ref.current.querySelector("input")?.blur();
          }
        }, 300);
      }
    });
  }

  const items = fields.options[field].options.map((option: any) => ({
    id: option.id,
    text: translations.options[field]?.[option.id] || option.value,
  }));
  const value = formState?.[field] || [];

  const selectedItems = value
    ? (items.filter((item: Record<string, any>) => value.includes(item.id)) ?? [])
    : [];

  const onInputValueChangeHandler = (changes: any) => {
    const itemExists = items.filter(
      (item: Record<string, string>) =>
        item.text.toLocaleLowerCase().indexOf(changes.toLocaleLowerCase()) !== -1
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
        value: "",
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

  const onChangeHandler = ({ selectedItems }: Readonly<{ selectedItems: Record<string, any> }>) => {
    onInputHandler(field, selectedItems?.map((item: Record<string, any>) => item.id) ?? []);

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
    if (e.key === "Enter" && internalState[field]?.canAdd) {
      onAddHandler();
    }
  };

  if (!internalState[field]?.scrollListener && ref?.current) {
    onInternalStateHandler(field, {
      ...internalState[field],
      scrollListener: false,
      page: internalState[field]?.page ?? 0,
    });

    const ul = ref.current.querySelector("ul");
    ul?.addEventListener("scroll", () => {
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
      <div className="cds--multiselect" role="listbox" tabIndex={0} onKeyDown={onKeyDownHandler}>
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
          itemToString={(item: Record<string, any>) => (item ? item?.text : "")}
          onChange={onChangeHandler}
          onMenuChange={onMenuChangeHandler}
          filterItems={(items, { inputValue }) =>
            items.filter((item) =>
              item.text.toLowerCase().includes(inputValue?.toLowerCase() ?? "")
            )
          }
        />
        {internalState?.[field]?.canAdd ? (
          <Button
            className="cds--button--add"
            hasIconOnly
            renderIcon={Add}
            iconDescription={translations.add}
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
      <div className="cds--selected-tags cds--flex">
        {value.map((id: Record<string, any>, index: number) => {
          const item = items.find((item: Record<string, any>) => item.id === id);
          let type = TAG_TYPES[index];

          if (fields?.options?.[field]?.options) {
            type = fields.options[field].options.find((option: any) => option.id === id)?.color;
          }
          return item?.text ? (
            <DismissibleTag
              size={SIZES.SM as Size.sm}
              key={item?.id}
              text={item?.text}
              type={type}
              title={translations.delete}
              onClose={() => onDismissHandler(item?.id)}
            />
          ) : null;
        })}
      </div>
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

        const hour = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
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
        style={{ width: IMAGE_SIZES.lg + "px", height: "auto" }}
      />
    ),
    [FIELD_TYPES.VIDEO_UPLOADER]: (
      <video autoPlay loop className="video-reel">
        <source src={url} />
      </video>
    ),
  };

  return renderAside[type] || "";
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
      ? ["image/jpeg", "image/png", "image/gif", "image/webp"]
      : ["video/mp4"];
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
            onAddFiles={(_, { addedFiles: files }) => onAddFileHandler(field, files)}
            accept={accepted}
          />
          <div className="cds--file-container cds--file-container--drop" />
        </>
      ) : (
        <>
          {files[field].map((fileObj: Record<string, any>) => {
            return (
              <Tile key={fileObj.id}>
                <Stack gap={4} orientation="horizontal" className="align-center">
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
  field = "country",
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
  field = "state",
  value,
  fields,
  disabled,
  loading,
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
    loading,
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
  field = "city",
  value,
  fields,
  disabled,
  loading,
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
    loading,
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
    className: "cds--text-input__field-outer-wrapper",
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
  const isLoading =
    (!fields.search.params["filters[country]"] && Boolean(internalState?.country?.id)) ||
    fields.search.params["filters[country]"] !== internalState?.country?.id;

  return stateDropdown({
    className: "cds--text-input__field-outer-wrapper",
    value: String(formState?.state) || null,
    fields,
    translations,
    formState,
    internalState,
    disabled: internalState?.country ? isLoading : true,
    loading: isLoading,
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
  const isLoading =
    (!fields.search.params["filters[state]"] && Boolean(internalState?.state?.id)) ||
    fields.search.params["filters[state]"] !== internalState?.state?.id;
  return cityDropdown({
    className: "cds--text-input__field-outer-wrapper",
    value: String(formState?.city) || null,
    fields,
    translations,
    formState,
    internalState,
    disabled: internalState?.state ? isLoading : true,
    loading: isLoading,
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
  const isStateLoading =
    (!fields.search.params["panel.country"] && Boolean(internalState?.country?.id)) ||
    (Boolean(internalState?.country?.id) &&
      fields.search.params["panel.country"] &&
      fields.search.params["panel.country"] !== internalState?.country?.id);

  const isCityLoading =
    isStateLoading ||
    (!isStateLoading &&
      Boolean(internalState?.state?.id) &&
      !Boolean(internalState?.city?.id) &&
      fields.search.params["panel.state"] !== internalState?.state?.id);
  return (
    <div className="cds--flex">
      {countryDropdown({
        className: "cds--text-input__field-outer-wrapper",
        value: formState.country ? String(formState.country) : FIELD_DEFAULTS.country,
        fields,
        translations,
        internalState,
        formState,
        onInternalStateHandler,
        onInputHandler,
      } as Field)}
      {stateDropdown({
        className: "cds--text-input__field-outer-wrapper",
        value: formState.state ? String(formState.state) : undefined,
        fields,
        translations,
        internalState,
        formState,
        loading: isStateLoading,
        disabled: internalState?.country
          ? isStateLoading || (!isStateLoading && fields?.options?.state?.options.length === 0)
          : true,
        onInternalStateHandler,
        onInputHandler,
      } as Field)}
      {cityDropdown({
        className: "cds--text-input__field-outer-wrapper",
        value: formState.city ? String(formState.city) : undefined,
        fields,
        translations,
        internalState,
        formState,
        loading: isCityLoading,
        disabled: internalState?.state
          ? isCityLoading || (!isCityLoading && fields?.options?.city?.options.length === 0)
          : true,
        onInternalStateHandler,
        onInputHandler,
      } as Field)}
    </div>
  );
};

const renderDatePickerLabel = (params: Field) => {
  return renderDatePicker(params);
};
const renderDateHourPickerLabel = (params: Field) => {
  return renderDatePicker(params, true);
};

const renderDatePicker = (params: Field, withHour: Boolean = false) => {
  const { field, value, translations, formState, onInputHandler } = params;

  const defaultValue = formState[field] || value;
  const onChangeHandler = (dateArray: Date[]) => {
    if (dateArray.length > 0) {
      const date = dateArray[0].toISOString();
      onInputHandler(field, date);
    }
  };

  const onDateHourInputHandler = (field: string, dateHourValue: string) => {
    const date = new Date(formState[field]);
    const dateHour = new Date(dateHourValue);
    date.setHours(dateHour.getHours(), dateHour.getMinutes(), 0, 0);
    onInputHandler(field, date.toISOString());
  };
  return (
    <DatePicker
      key={field}
      datePickerType="single"
      dateFormat="d/m/Y"
      locale={translations.locale}
      value={defaultValue ? new Date(defaultValue) : undefined}
      onChange={onChangeHandler}
    >
      <DatePickerInput
        placeholder="dd/mm/yyyy"
        labelText={translations.fields[field]}
        id="date-picker-single"
        size="md"
      />
      {withHour
        ? renderDateHourPicker({ ...params, onInputHandler: onDateHourInputHandler })
        : null}
    </DatePicker>
  );
};

const renderDateHourPicker = ({
  field,
  value,
  translations,
  formState,
  internalState,
  onInternalStateHandler = () => {},
  onInputHandler = () => {},
}: Field) => {
  const defaultDate = formState[field] || value;
  const initialDate = defaultDate ? new Date(defaultDate) : null;

  if (!internalState?.[field] || !internalState?.[field]?.hour || !internalState?.[field]?.minute) {
    onInternalStateHandler(field, {
      ...internalState[field],
      hour: initialDate ? String(initialDate.getHours()).padStart(2, "0") : "00",
      minute: initialDate ? String(initialDate.getMinutes()).padStart(2, "0") : "00",
    });
  }

  const setHour = (hour: string) => {
    onInternalStateHandler(field, {
      ...internalState[field],
      hour,
    });
  };
  const setMinute = (minute: string) => {
    onInternalStateHandler(field, {
      ...internalState[field],
      minute,
    });
  };
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

  const updateDate = (h: string, m: string) => {
    const date = new Date();

    date.setHours(Number(h), Number(m), 0, 0);
    onInputHandler(field, date.toISOString());
  };

  return (
    <TimePicker id={`${field}-time-picker`} labelText={translations.time} type="hidden">
      <TimePickerSelect
        id={`${field}-hours`}
        value={internalState?.[field]?.hour || "00"}
        onChange={(e) => {
          setHour(e.target.value);
          updateDate(e.target.value, internalState?.[field]?.minute || 0);
        }}
      >
        {hours.map((h) => (
          <SelectItem key={h} value={h} text={h} />
        ))}
      </TimePickerSelect>

      <TimePickerSelect
        id={`${field}-minutes`}
        value={internalState?.[field]?.minute || "00"}
        onChange={(e) => {
          setMinute(e.target.value);
          updateDate(internalState?.[field]?.hour || 0, e.target.value);
        }}
      >
        {minutes.map((m) => (
          <SelectItem key={m} value={m} text={m} />
        ))}
      </TimePickerSelect>
    </TimePicker>
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
      onChange={(e: ChangeEvent<HTMLInputElement>) => onInputHandler(field, e.target.value)}
    />
  );
};

const renderContentArea = ({ field, value, translations, formState, onInputHandler }: Field) => {
  const defaultValue = (formState[field] || value).replace(/\n/g, "<br>");

  const onContentAreaChangeHandler = (text: string) => {
    if (text.replace(/\n/g, "<br>") !== defaultValue) {
      onInputHandler(field, text);
    }
  };

  return (
    <FormItem key={field}>
      <p className="cds--label">{translations.fields[field]}</p>
      <ContentArea
        key={field}
        id={field}
        translations={translations}
        value={defaultValue}
        hasParameter={true}
        onChange={(text: string) => onContentAreaChangeHandler(text)}
      />
    </FormItem>
  );
};

const renderers = {
  [FIELD_TYPES.BOOLEAN]: () => renderBoolean,
  [FIELD_TYPES.CHECKBOX]: renderCheckbox,
  [FIELD_TYPES.CONTENTAREA]: renderContentArea,
  [FIELD_TYPES.CITY]: renderCity,
  [FIELD_TYPES.DATE_LABEL]: renderDatePickerLabel,
  [FIELD_TYPES.DATE]: renderDatePicker,
  [FIELD_TYPES.DATE_HOUR_LABEL]: renderDateHourPickerLabel,
  [FIELD_TYPES.DATE_HOUR]: renderDateHourPicker,
  [FIELD_TYPES.FILTER_CITY]: renderCityFilter,
  [FIELD_TYPES.FILTER_COUNTRY]: renderCountryFilter,
  [FIELD_TYPES.FILTER_STATE]: renderStateFilter,
  [FIELD_TYPES.HIDDEN]: renderHidden,
  [FIELD_TYPES.HIDDEN_BOOLEAN]: renderHidden,
  [FIELD_TYPES.HIDDEN_DATE]: renderHidden,
  [FIELD_TYPES.HOUR]: renderHour,
  [FIELD_TYPES.IMAGE_UPLOADER]: renderUploader,
  [FIELD_TYPES.IMAGE]: renderImage,
  [FIELD_TYPES.LABEL]: renderLabel,
  [FIELD_TYPES.LINK]: renderLink,
  [FIELD_TYPES.MULTISELECT]: renderMultiSelect,
  [FIELD_TYPES.PASSWORD]: renderPassword,
  [FIELD_TYPES.SELECT]: renderSelect,
  [FIELD_TYPES.TEXT]: renderTextInput,
  [FIELD_TYPES.TEXTAREA]: renderTextArea,
  [FIELD_TYPES.TEXTMAP]: renderTextMap,
  [FIELD_TYPES.VIDEO_UPLOADER]: renderUploader,
};

// Main renderer
export const renderField = (obj: any) => {
  const { type, field } = obj;
  if (typeof renderers[type] === "function") {
    const className = getClasses({
      field: true,
      [`field-${field}`]: true,
    });

    const renderObj = renderers[type](obj);
    return type === FIELD_TYPES.HIDDEN ? (
      renderObj
    ) : (
      <div className={className} key={obj.key}>
        <>{renderObj}</>
      </div>
    );
  }

  return null;
};
