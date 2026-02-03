"use client";

import { Panel } from "@/app/components";
import React, { useEffect, useMemo, useRef, useState, useCallback, Fragment } from "react";
import { Accordion, AccordionItem, Button, Form, Heading, Section, Stack } from "@carbon/react";
import { renderField } from "@/app/render";
import { FIELD_TYPES } from "@/app/constants";
import { s3File, uuid } from "@/app/utils";
import { t } from "@/app/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Stable default values to prevent re-renders
const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT: Record<string, any> = {};
const NOOP_ASYNC = async () => true;
const NOOP_CLOSE = async (item: any) => {};
const NOOP_ACTION = async () => {};
const NOOP = () => true;

function ListPanel({
  id = "",
  ids = EMPTY_ARRAY,
  items = EMPTY_ARRAY,
  data = null,
  onSave = NOOP_ASYNC,
  onClose = NOOP_CLOSE,
  onAction = NOOP_ACTION,
  actionLabel = "",
  actionIcon = null,
  checkAction = null,
  translations = EMPTY_OBJECT,
  fields = EMPTY_OBJECT,
  multiFields = EMPTY_OBJECT,
  methods = EMPTY_OBJECT,
  renders = EMPTY_OBJECT,
  open = "",
  setOpen = NOOP,
  CONSTANTS = EMPTY_OBJECT,
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

  // Memoize computed default values
  const defaultIsInitialized = useMemo(
    () =>
      Object.keys(fields.types).reduce((acc: Record<string, boolean>, field: string) => {
        acc[field] = false;
        return acc;
      }, {}),
    [fields.types]
  );

  const [isInitialized, setIsInitialized] = useState<Record<string, boolean>>(defaultIsInitialized);

  const defaultSetFiles = useMemo(
    () =>
      Object.keys(fields.types).reduce((acc: Record<string, any[]>, field: string) => {
        if (
          [FIELD_TYPES.VIDEO_UPLOADER, FIELD_TYPES.IMAGE_UPLOADER].includes(fields.types[field])
        ) {
          acc[field] = [];
        }
        return acc;
      }, {}),
    [fields.types]
  );

  const [formState, setFormState] = useState(data !== ACTIONS?.ADD ? { ...data } : {});

  const [internalState, setInternalState] = useState({});

  // Memoize initial search state
  const initialSearchState = useMemo(
    () => ({
      ...(fields?.search
        ? Object.keys(fields?.search).reduce((acc: Record<string, any>, field: string) => {
            acc[field] = false;
            return acc;
          }, {})
        : {}),
    }),
    [fields?.search]
  );

  const [searchState, setSearchState] = useState(initialSearchState);

  const [files, setFiles] = useState<Record<string, any[]>>(defaultSetFiles);

  // Memoize refs object
  const fieldRefs = useRef<Record<string, React.RefObject<any>>>({});

  // Initialize refs for each field
  useMemo(() => {
    Object.keys(fields.types).forEach((field: string) => {
      if (!fieldRefs.current[field]) {
        fieldRefs.current[field] = { current: null };
      }
    });
  }, [fields.types]);

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

  const [forceClose, setForceClose] = useState(false);

  // Memoized handlers
  const resetPanel = useCallback(() => {
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
  }, [
    defaultSetFiles,
    defaultIsInitialized,
    searchState,
    params,
    pathname,
    replace,
    fields?.search,
    setOpen,
  ]);

  const onActionHandler = useCallback(async () => {
    onAction(data);
  }, [onAction, data]);

  const onCloseHandler = useCallback(() => {
    setForceClose(false);
    resetPanel();
    onClose(null);
  }, [resetPanel, onClose]);

  const onSaveHandler = useCallback(async () => {
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
  }, [onSave, formState, files, ids, resetPanel, onClose]);

  const onInputHandler = useCallback(
    (field: string, value: any) => {
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

      setFormState((prevState: Record<string, any>) => ({ ...prevState, ...newFormState }));
    },
    [formState, fields?.search, searchState]
  );

  const onAddFileHandler = useCallback((field: string, uploadedFiles: any) => {
    const processedFiles = uploadedFiles.map((file: any) => ({
      file: file,
      id: uuid(),
    }));

    setFiles((prevFiles) => ({
      ...prevFiles,
      [field]: processedFiles,
    }));
  }, []);

  const onRemoveFileHandler = useCallback((field: string, fileObj: Record<string, any>) => {
    setFiles((prevFiles) => {
      const updatedFiles = { ...prevFiles };
      const index = updatedFiles[field].findIndex(
        (file: Record<string, any>) => file.id === fileObj.id
      );
      if (index !== -1) {
        updatedFiles[field] = updatedFiles[field].filter((_, i) => i !== index);
      }
      return updatedFiles;
    });

    setFormState((prevFormState: any) => {
      const newFormState = { ...prevFormState };
      delete newFormState[field];
      return newFormState;
    });
  }, []);

  const onInternalStateHandler = useCallback((field: any, value: any) => {
    setInternalState((prevState) => {
      const newInternalState: Record<string, any> = {
        ...prevState,
      };

      if (field instanceof Array) {
        field.forEach((f: string) => {
          newInternalState[f] = value[f];
        });
      } else {
        newInternalState[field] = value;
      }
      return newInternalState;
    });
  }, []);

  const renderFields = useCallback(
    (useFields: Record<string, any>) => (
      <Section className="wrapper-fields" level={5}>
        {Object.keys(useFields.types).map((field: string, index: number) => {
          const fieldProps = {
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
            ref: fieldRefs.current[field],
            onAddFileHandler,
            onInputHandler,
            onRemoveFileHandler,
            onInternalStateHandler,
            onFormStateHandler: setFormState,
            onRemoveHandler: onRemoveFileHandler,
          };
          const renderedField = renderField(fieldProps);
          return (
            <Fragment key={"fragment-" + index}>
              {typeof renderedField === "function" ? renderedField(fieldProps) : renderedField}
            </Fragment>
          );
        })}
      </Section>
    ),
    [
      data,
      translations,
      files,
      formState,
      internalState,
      methods,
      params,
      pathname,
      renders,
      replace,
      onAddFileHandler,
      onInputHandler,
      onRemoveFileHandler,
      onInternalStateHandler,
    ]
  );

  const renderGroups = useCallback(
    (useFields: Record<string, any>) => (
      <Section level={5}>
        <Accordion>
          {Object.keys(useFields.groups).map((groupKey: string, groupIndex: number) => {
            const label = translations?.groups?.[groupKey] || `group.${groupKey}`;
            const groupFields = {
              ...useFields,
              types: useFields.groups[groupKey].reduce(
                (acc: Record<string, any>, field: string) => {
                  acc[field] = useFields.types[field];
                  return acc;
                },
                {}
              ),
            };
            return (
              <AccordionItem
                key={`group-${groupKey}`}
                title={<Heading>{label}</Heading>}
                open={groupIndex === 0}
              >
                {renderFields(groupFields)}
              </AccordionItem>
            );
          })}
        </Accordion>
      </Section>
    ),
    [translations?.groups, renderFields]
  );

  const getContent = useCallback(
    (contentData: any = null) => {
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
                        : items.find((item) => item.id === ids?.at(0))?.full_name}
                    </p>
                  </>
                ) : translations?.panels?.title ? (
                  <Heading>{translations?.panels?.title}</Heading>
                ) : null}
                {useFields?.groups ? renderGroups(useFields) : renderFields(useFields)}
              </Stack>
            </Form>
          </Section>
          <footer>
            <Button onClick={onSaveHandler}>{translations.save}</Button>
          </footer>
        </>
      );
    },
    [
      open,
      multiFields,
      fields,
      ACTIONS?.BATCH_EDIT,
      ids,
      translations,
      items,
      renderGroups,
      renderFields,
      onSaveHandler,
    ]
  );

  useEffect(() => {
    if (!action && actionIcon) {
      if (typeof checkAction === "function") {
        setAction(checkAction(data) ? actionIcon : null);
      }
    }
  }, [action, data, actionIcon, checkAction]);

  // Memoize content to avoid recalculation
  const content = useMemo(
    () => (data || (ids?.length && open === ACTIONS?.BATCH_EDIT) ? getContent(data) : null),
    [data, ids, open, ACTIONS?.BATCH_EDIT, getContent]
  );

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

export default React.memo(ListPanel);
