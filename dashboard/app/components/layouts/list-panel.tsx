"use client";

import { Panel } from "@/app/components";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Form, Heading, Section, Stack } from "@carbon/react";
import { renderField } from "@/app/render";
import { FIELD_TYPES } from "@/app/constants";
import { s3File, uuid } from "@/app/utils";
import { t } from "@/app/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ListPanel({
  id = "",
  ids = [],
  items = [],
  data = null,
  onSave = async () => true,
  onClose = async (item: any) => {},
  onAction = async () => {},
  actionLabel = "",
  actionIcon = null,
  checkAction = null,
  translations = {},
  fields = {},
  multiFields = {},
  methods = {},
  renders = {},
  open = "",
  setOpen = () => true,
  CONSTANTS = {},
}: Readonly<{
  id: string;
  ids?: string[] | null;
  items?: any[];
  data: any;
  onSave?: (data: any, files: any, ids: string[] | null) => Promise<boolean>;
  onClose?: (item: any) => Promise<void>;
  onAction?: Function;
  actionLabel?: string;
  actionIcon?: string | null;
  checkAction?: Function | null;
  translations?: Record<string, any>;
  fields?: Record<string, any>;
  multiFields?: Record<string, any>;
  methods?: Record<string, any>;
  renders?: Record<string, any>;
  open?: string | null;
  setOpen?: Function;
  CONSTANTS?: any;
}>) {
  const { ACTIONS } = CONSTANTS;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const params = useMemo(() => new URLSearchParams(searchParams), [searchParams]);

  const [action, setAction] = useState<string | null>(null);

  const defaultIsInitialized = Object.keys(fields.types).reduce(
    (acc: Record<string, boolean>, field: string) => {
      acc[field] = false;
      return acc;
    },
    {}
  );

  const [isInitialized, setIsInitialized] = useState<Record<string, boolean>>(defaultIsInitialized);

  const defaultSetFiles = Object.keys(fields.types).reduce(
    (acc: Record<string, any[]>, field: string) => {
      if ([FIELD_TYPES.VIDEO_UPLOADER, FIELD_TYPES.IMAGE_UPLOADER].includes(fields.types[field])) {
        acc[field] = [];
      }
      return acc;
    },
    {}
  );

  const [formState, setFormState] = useState(data !== ACTIONS?.ADD ? { ...data } : {});

  const [internalState, setInternalState] = useState({});

  const [searchState, setSearchState] = useState({
    ...(fields?.search
      ? Object.keys(fields?.search).reduce((acc: Record<string, any>, field: string) => {
          acc[field] = false;
          return acc;
        }, {})
      : {}),
  });

  const [files, setFiles] = useState<Record<string, any[]>>(defaultSetFiles);

  useEffect(() => {
    if (data) {
      const formData = Object.keys(fields.types).reduce(
        (acc: Record<string, any>, field: string) => {
          if (!isInitialized[field]) {
            setIsInitialized((prev) => ({
              ...prev,
              [field]: true,
            }));

            acc[field] = data[field];

            if (
              [FIELD_TYPES.VIDEO_UPLOADER, FIELD_TYPES.IMAGE_UPLOADER].includes(fields.types[field])
            ) {
              if (!files[field]?.length && data[field]) {
                setFiles((prev) => ({
                  ...prev,
                  [field]: [
                    {
                      id: data.id,
                      file: {
                        id: data.id,
                        name: data[field],
                        src: s3File(`${fields.options[field].path}/${data[field]}`),
                      },
                    },
                  ],
                }));
              }
            }
          }
          return acc;
        },
        {}
      );

      if (Object.keys(formData).length) {
        setSearchState((prev) => ({
          ...prev,
          ...Object.keys(searchState).reduce((acc: Record<string, any>, field: string) => {
            acc[field] = formData[field] !== undefined ? true : prev[field];
            return acc;
          }, {}),
        }));
        setFormState((prev: any) => ({ ...prev, ...formData, _id: data._id }));
      }
    }
  }, [data, fields.types, fields.options]);
  // Search params effect
  useEffect(() => {
    const searchFields = Object.keys(searchState).filter((field) => searchState[field]);
    params.forEach((_, key) => {
      if (key.startsWith("panel.") && !searchFields.includes(key.replace("panel.", ""))) {
        params.delete(key);
      }
    });
    if (searchFields.length) {
      searchFields.forEach((field) => {
        params.set(`panel.${field}`, formState[field]);
      });
      replace(`${pathname}?${params.toString()}`);
    }
  }, [searchState, formState, fields.search, pathname, replace, params]);

  const resetPanel = () => {
    setFormState({});
    setInternalState({});
    setAction(null);
    setOpen("");
    setFiles({ ...defaultSetFiles });
    setIsInitialized({ ...defaultIsInitialized });
    const searchFields = Object.keys(searchState).filter((field) => searchState[field]);
    if (searchFields.length) {
      searchFields.forEach((field) => {
        params.delete(`panel.${field}`);
      });
      replace(`${pathname}?${params.toString()}`);
    }
    setSearchState({
      ...(fields?.search
        ? Object.keys(fields.search).reduce(
            (acc: Record<string, any>, field: string) => ({
              ...acc,
              [field]: false,
            }),
            {}
          )
        : {}),
    });
  };

  const [forceClose, setForceClose] = useState(false);

  const onActionHandler = async () => {
    onAction(data);
  };

  const onCloseHandler = () => {
    setForceClose(false);
    resetPanel();
    onClose(null);
  };

  const onSaveHandler = async () => {
    try {
      const saved = await onSave(formState, files, ids);
      if (saved) {
        setForceClose(true);
        resetPanel();
        onClose(saved);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onInputHandler = (field: string, value: any) => {
    let newFormState = { ...formState };

    if (fields?.search && Object.keys(fields.search).includes(field)) {
      let newSearchState = { ...searchState };

      if (fields?.search[field]?.deletes) {
        fields.search[field].deletes.forEach((deleteField: string) => {
          newFormState[deleteField] = null;
          newSearchState[deleteField] = false;
        });
      }

      newSearchState[field] = true;
      setSearchState(newSearchState);
    }

    newFormState[field] = value;

    setFormState(newFormState);
  };

  const onAddFileHandler = (field: string, uploadedFiles: any) => {
    uploadedFiles = uploadedFiles.map((file: any) => ({
      file: file,
      id: uuid(),
    }));

    setFiles({
      ...files,
      [field]: uploadedFiles,
    });
  };

  const onRemoveFileHandler = (field: string, fileObj: Record<string, any>) => {
    const index = files[field].findIndex((file: Record<string, any>) => file.id === fileObj.id);
    delete files[field][index];

    setFiles({
      ...Object.keys(files).reduce(
        (acc: Record<string, any[]>, field: string) => {
          acc[field] = files[field].filter((obj) => obj !== null);
          return acc;
        },
        {} as Record<string, any[]>
      ),
    });

    delete formState[field];
    setFormState({
      ...formState,
    });
  };

  const onInternalStateHandler = (field: any, value: any) => {
    const newInternalState: Record<string, any> = {
      ...internalState,
    };

    if (field instanceof Array) {
      field.forEach((f: string) => {
        newInternalState[f] = value[f];
      });
    } else {
      newInternalState[field] = value;
    }
    setInternalState(newInternalState);
  };

  const ref = Object.keys(fields.types).reduce((acc: Record<string, any>, field: string) => {
    acc[field] = null;
    return acc;
  }, {});

  Object.keys(fields.types).forEach((field: string) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ref[field] = useRef(null);
  });

  const getContent = (data: any = null) => {
    const useFields = open === "batchEdit" ? multiFields : fields;

    return (
      <>
        <Section className="fields" level={4}>
          <Form>
            <Stack gap={4}>
              {open === ACTIONS?.BATCH_EDIT && ids?.length ? (
                <>
                  <Heading>{translations.listPanel.batchEdit.title}</Heading>
                  <p>
                    {translations.listPanel.batchEdit.subtitle}{" "}
                    {ids && ids.length > 1
                      ? t(translations.listPanel.batchEdit.description, {
                          total: ids.length,
                        })
                      : items.find((item) => item.id === ids?.at(0)).full_name}
                  </p>
                </>
              ) : null}
              {Object.keys(useFields.types).map((field: string, index: number) => (
                <>
                  {renderField({
                    field,
                    key: "field-" + index,
                    type: useFields.types[field],
                    value: data?.[field] || useFields.options[field]?.value,
                    translations,
                    files,
                    fields: useFields,
                    formState,
                    internalState,
                    methods,
                    params,
                    pathname,
                    renders,
                    replace,
                    ref: ref[field],
                    onAddFileHandler,
                    onInputHandler,
                    onRemoveFileHandler,
                    onInternalStateHandler,
                  })}
                </>
              ))}
            </Stack>
          </Form>
        </Section>
        <footer>
          <Button onClick={onSaveHandler}>{translations.save}</Button>
        </footer>
      </>
    );
  };

  useEffect(() => {
    if (!action && actionIcon) {
      if (typeof checkAction === "function") {
        setAction(checkAction(data) ? actionIcon : null);
      }
    }
  }, [action, data, actionIcon, checkAction]);

  const content = data || (ids?.length && open === ACTIONS?.BATCH_EDIT) ? getContent(data) : null;
  return (
    <>
      <Panel
        onAction={onActionHandler}
        actionIcon={action}
        actionLabel={actionLabel}
        onClose={onCloseHandler}
        translations={translations}
        forceClose={forceClose}
      >
        {content}
      </Panel>
    </>
  );
}
