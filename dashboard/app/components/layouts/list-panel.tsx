'use client';

import { Panel } from '@/app/components';
import { useEffect, useState } from 'react';
import { Button, Form, Stack } from '@carbon/react';
import { renderField } from '@/app/render';
import { FIELD_TYPES } from '@/app/constants';
import { uuid } from '@/app/utils';

export default function ListPanel({
  id = '',
  data = null,
  onSave = async () => true,
  onClose = async () => {},
  translations = {},
  fields = {},
}: Readonly<{
  id: string;
  data: any;
  onSave?: (data: any, files: any) => Promise<boolean>;
  onClose?: () => Promise<void>;
  translations?: Record<string, any>;
  fields?: Record<string, any>;
}>) {
  const defaultIsInitialized = Object.keys(fields.types).reduce(
    (acc: Record<string, boolean>, field: string) => {
      if (
        [FIELD_TYPES.VIDEO_UPLOADER, FIELD_TYPES.IMAGE_UPLOADER].includes(
          fields.types[field]
        )
      ) {
        acc[field] = false;
      }
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

  const [formState, setFormState] = useState({ ...data });
  const [files, setFiles] = useState<Record<string, any[]>>(defaultSetFiles);

  useEffect(() => {
    setFormState({
      ...data,
    });

    if (data) {
      Object.keys(fields.types).forEach((field: string) => {
        if (
          [FIELD_TYPES.VIDEO_UPLOADER, FIELD_TYPES.IMAGE_UPLOADER].includes(
            fields.types[field]
          )
        ) {
          if (!files[field].length && data[field] && !isInitialized[field]) {
            setIsInitialized({
              ...isInitialized,
              [field]: true,
            });

            setFiles({
              ...files,
              [field]: [
                {
                  id: data.id,
                  file: {
                    id: data.id,
                    name: data[field],
                    src: `${fields.options[field].path}/${data[field]}`,
                  },
                },
              ],
            });
          }
        }
      });
    }
  }, [data, fields.types, fields.options, files, isInitialized]);

  const resetPanel = () => {
    setFormState({ ...data });
    setFiles({ ...defaultSetFiles });
    setIsInitialized({ ...defaultIsInitialized });
  };

  const [forceClose, setForceClose] = useState(false);
  const onCloseHandler = () => {
    setForceClose(false);
    resetPanel();
    onClose();
  };

  const onSaveHandler = async () => {
    const saved = await onSave(formState, files);
    if (saved) {
      setForceClose(true);
      resetPanel();
      onClose();
    }
  };

  const onInputHandler = (field: string, value: any) => {
    setFormState({
      ...formState,
      [field]: value,
    });
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
  };

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
                onAddFileHandler,
                onInputHandler,
                onRemoveFileHandler,
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
