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
  translations = {},
  fields = {},
  methods = {},
}: Readonly<{
  id: string;
  data: any;
  onSave?: (data: any, files: any) => Promise<boolean>;
  onClose?: (item: any) => Promise<void>;
  translations?: Record<string, any>;
  fields?: Record<string, any>;
  methods?: Record<string, any>;
}>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams]
  );

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
    setFormState({ ...data });
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
  const onCloseHandler = () => {
    setForceClose(false);
    resetPanel();
    onClose(null);
  };

  const onSaveHandler = async () => {
    const saved = await onSave(formState, files);
    if (saved) {
      setForceClose(true);
      resetPanel();
      onClose(saved);
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
    (acc: Record<string, any>, field: string) => ({
      ...acc,
      [field]: useRef(null),
    }),
    {}
  );

  const getContent = (data: any) => (
    <>
      <section className="fields">
        <Form>
          <Stack gap={4}>
            {Object.keys(fields.types).map((field: string) =>
              renderField({
                field,
                type: fields.types[field],
                value: data[field],
                translations,
                files,
                fields,
                formState,
                internalState,
                methods,
                params,
                pathname,
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
  const content = data ? getContent(data) : null;
  return (
    <Panel onClose={onCloseHandler} forceClose={forceClose}>
      {content}
    </Panel>
  );
}
