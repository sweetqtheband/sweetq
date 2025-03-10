'use client';

import { Panel } from '@/app/components';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Form, Stack } from '@carbon/react';
import { renderField } from '@/app/render';
import { ACTIONS, FIELD_TYPES } from '@/app/constants';
import { s3File, uuid } from '@/app/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function ListPanel({
  id = '',
  data = null,
  onSave = async () => true,
  onClose = async (item: any) => {},
  onAction = async () => {},
  actionLabel = '',
  actionIcon = null,
  checkAction = null,
  translations = {},
  fields = {},
  methods = {},
  renders = {},
}: Readonly<{
  id: string;
  data: any;
  onSave?: (data: any, files: any) => Promise<boolean>;
  onClose?: (item: any) => Promise<void>;
  onAction?: Function;
  actionLabel?: string;
  actionIcon?: string | null;
  checkAction?: Function | null;
  translations?: Record<string, any>;
  fields?: Record<string, any>;
  methods?: Record<string, any>;
  renders?: Record<string, any>;
}>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams]
  );

  const [action, setAction] = useState<string | null>(null);

  const defaultIsInitialized = Object.keys(fields.types).reduce(
    (acc: Record<string, boolean>, field: string) => {
      acc[field] = false;
      return acc;
    },
    {}
  );

  const [isInitialized, setIsInitialized] =
    useState<Record<string, boolean>>(defaultIsInitialized);

  const defaultSetFiles = Object.keys(fields.types).reduce(
    (acc: Record<string, any[]>, field: string) => {
      if (
        [FIELD_TYPES.VIDEO_UPLOADER, FIELD_TYPES.IMAGE_UPLOADER].includes(
          fields.types[field]
        )
      ) {
        acc[field] = [];
      }
      return acc;
    },
    {}
  );

  const [formState, setFormState] = useState(
    data !== ACTIONS.ADD ? { ...data } : {}
  );

  const [internalState, setInternalState] = useState({});

  const [searchState, setSearchState] = useState({
    ...(fields?.search
      ? Object.keys(fields?.search).reduce(
          (acc: Record<string, any>, field: string) => {
            acc[field] = false;
            return acc;
          },
          {}
        )
      : {}),
  });

  const [files, setFiles] = useState<Record<string, any[]>>(defaultSetFiles);

  useEffect(() => {
    const formData: Record<string, any> | null = null;
    if (data) {
      const formData = Object.keys(fields.types).reduce(
        (acc: Record<string, any>, field: string) => {
          if (!isInitialized[field]) {
            setIsInitialized({
              ...isInitialized,
              [field]: true,
            });

            acc[field] = data[field];

            if (
              [FIELD_TYPES.VIDEO_UPLOADER, FIELD_TYPES.IMAGE_UPLOADER].includes(
                fields.types[field]
              )
            ) {
              if (!files[field].length && data[field]) {
                setFiles({
                  ...files,
                  [field]: [
                    {
                      id: data.id,
                      file: {
                        id: data.id,
                        name: data[field],
                        src: s3File(
                          `${fields.options[field].path}/${data[field]}`
                        ),
                      },
                    },
                  ],
                });
              }
            }
          }

          return acc;
        },
        {}
      );

      if (Object.keys(formData).length)
        setFormState({ ...formState, ...formData, _id: data._id });
    }
  }, [data, fields.types, fields.options, files, isInitialized, formState]);

  // Search params effect
  useEffect(() => {
    const searchFields = Object.keys(searchState).filter(
      (field) => searchState[field]
    );

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
    setFiles({ ...defaultSetFiles });
    setIsInitialized({ ...defaultIsInitialized });
    const searchFields = Object.keys(searchState).filter(
      (field) => searchState[field]
    );
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
      const saved = await onSave(formState, files);
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
    const index = files[field].findIndex(
      (file: Record<string, any>) => file.id === fileObj.id
    );
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

  const onInternalStateHandler = (field: string, value: any) => {
    setInternalState({
      ...internalState,
      [field]: value,
    });
  };

  const ref = Object.keys(fields.types).reduce(
    (acc: Record<string, any>, field: string) => {
      acc[field] = null;
      return acc;
    },
    {}
  );

  Object.keys(fields.types).forEach((field: string) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ref[field] = useRef(null);
  });

  const getContent = (data: any) => (
    <>
      <section className="fields">
        <Form>
          <Stack gap={4}>
            {Object.keys(fields.types).map((field: string, index: number) =>
              renderField({
                field,
                key: 'field-' + index,
                type: fields.types[field],
                value: data[field] || fields.options[field]?.value,
                translations,
                files,
                fields,
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
              })
            )}
          </Stack>
        </Form>
      </section>
      <footer>
        <Button onClick={onSaveHandler}>{translations.save}</Button>
      </footer>
    </>
  );

  useEffect(() => {
    if (!action && actionIcon) {
      if (typeof checkAction === 'function') {
        setAction(checkAction(data) ? actionIcon : null);
      }
    }
  }, [action, data, actionIcon, checkAction]);

  const content = data ? getContent(data) : null;
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
