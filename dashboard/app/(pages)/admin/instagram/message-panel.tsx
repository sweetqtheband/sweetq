'use client';

import { ContentArea, Panel } from '@/app/components';
import {
  Button,
  ContentSwitcher,
  Dropdown,
  Form,
  FormItem,
  Heading,
  Section,
  Stack,
  Switch,
  TextInput,
} from '@carbon/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { t } from '@/app/utils';
import { Layout } from '@/types/layout';

export default function MessagePanel({
  ids = null,
  items = [],
  setIds = () => true,
  onSave = () => true,
  setIsLoading = () => false,
  translations = {},
  layouts = [],
}: Readonly<{
  ids: string[] | null;
  items: any[];
  setIds?: Function;
  onSave?: Function;
  setIsLoading?: Function;
  translations: Record<string, any>;
  layouts: Layout[];
}>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams]
  );

  const modes = [
    { name: 'new', text: translations.messagePanel.modes.new },
    { name: 'layout', text: translations.messagePanel.modes.layout },
  ];
  const [mode, setMode] = useState(0);

  const validateFields: Record<string, any> = {
    layout: {
      required: !mode,
    },
    layoutId: {
      required: mode,
    },
    personalMessage: {
      required: true,
    },
    collectiveMessage: {
      required: true,
    },
  };

  const defaultState = {
    layoutId: null,
    layout: '',
    personalMessage: '',
    collectiveMessage: '',
  };

  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>(
    Object.keys(validateFields).reduce((acc: Record<string, boolean>, key) => {
      acc[key] = false;
      return acc;
    }, {})
  );
  const [formState, setFormState] = useState<Record<string, any>>(defaultState);
  const [forceClose, setForceClose] = useState<boolean>(false);

  const validate = () => {
    const invalidFields: Record<string, boolean> = {};
    for (const key in validateFields) {
      if (validateFields[key].required && !formState[key]) {
        invalidFields[key] = true;
      } else {
        invalidFields[key] = false;
      }
    }
    setInvalidFields(invalidFields);
    return !Object.values(invalidFields).some((value) => value);
  };

  const onSaveHandler = async () => {
    if (!validate()) return;
    setIsLoading(true);
    const valid = onSave({ ...formState, ids });

    if (valid) {
      setForceClose(true);
      setIds(null);
    } else {
      setIsLoading(false);
    }
  };

  const onCloseHandler = async () => {
    setForceClose(false);
    setIds(null);
    setFormState(defaultState);
  };

  const onInputHandler = (key: string, value: any) => {
    setFormState((prevState: any) => {
      if (prevState[key] === value) return prevState;
      return { ...prevState, [key]: value };
    });

    setInvalidFields((prevState: any) => {
      if (prevState[key] === false) return prevState;
      return { ...prevState, [key]: false };
    });
  };

  const handlePersonalMessageChange = (text: string) => {
    onInputHandler('personalMessage', text);
  };
  const handleCollectiveMessageChange = (text: string) => {
    onInputHandler('collectiveMessage', text);
  };

  const onMessageModeChange = (mode: Record<string, any>) => {
    setMode(mode.index);
    if (mode.index === 1) {
      params.set('panel.mode', mode.index);
      replace(`${pathname}?${params.toString()}`);
    } else {
      params.delete('panel.mode');
      replace(`${pathname}?${params.toString()}`);
      setFormState({
        ...formState,
        layoutId: null,
      });
    }
  };

  const handleLayoutChange = ({ selectedItem }: Record<string, any>) => {
    const layout = layouts.find(
      (item) => item._id.toString() === selectedItem.id
    );
    setFormState({
      ...formState,
      ...{
        ...layout?.tpl,
        layoutId: selectedItem.id,
      },
    });
  };

  const getContent = (data: any) => (
    <>
      <Section className="fields" level={4}>
        <Form>
          <Stack gap={4}>
            <Heading>{translations.messagePanel.title}</Heading>
            <p>
              {translations.messagePanel.subtitle}{' '}
              {ids && ids.length > 1
                ? t(translations.messagePanel.description, {
                    total: ids.length,
                  })
                : items.find((item) => item.id === ids?.at(0)).full_name}
            </p>
            <ContentSwitcher
              selectedIndex={mode}
              size="md"
              onChange={onMessageModeChange}
            >
              {modes.map((mode, index) => (
                <Switch key={index} name={mode.name} text={mode.text} />
              ))}
            </ContentSwitcher>
            <FormItem>
              {mode === 0 ? (
                <TextInput
                  id="layout"
                  labelText={translations.fields.layout}
                  placeholder={translations.fields.layout}
                  value={formState['layout']}
                  invalid={invalidFields.layout}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onInputHandler('layout', e.target.value)
                  }
                />
              ) : (
                <Dropdown
                  autoAlign={true}
                  id={'layout'}
                  label={translations.fields.layout}
                  titleText={translations.fields.layout}
                  invalid={invalidFields.layoutId}
                  items={layouts.map((item) => ({
                    id: item._id,
                    text: item.name,
                  }))}
                  selectedItem={layouts.find(
                    (item) => item._id.toString() === formState['layout']
                  )}
                  itemToString={(item: any) => item.text}
                  itemToElement={(item: any) => item.text}
                  onChange={handleLayoutChange}
                ></Dropdown>
              )}
            </FormItem>
            <FormItem>
              <p className="cds--label">
                {translations.fields.personalMessage}
              </p>
              <ContentArea
                id="personal-message"
                translations={translations}
                value={formState['personalMessage']}
                invalid={invalidFields.personalMessage}
                onChange={(text: string) => {
                  handlePersonalMessageChange(text);
                }}
              />
            </FormItem>
            <FormItem>
              <p className="cds--label">
                {translations.fields.collectiveMessage}
              </p>
              <ContentArea
                id="collective-message"
                translations={translations}
                invalid={invalidFields.collectiveMessage}
                value={formState['collectiveMessage']}
                onChange={(text: string) => handleCollectiveMessageChange(text)}
              />
            </FormItem>
          </Stack>
        </Form>
      </Section>
      <footer>
        <Button onClick={onSaveHandler}>{translations.save}</Button>
      </footer>
    </>
  );
  const content = ids ? getContent(ids) : null;
  return (
    <Panel onClose={onCloseHandler} forceClose={forceClose}>
      {content}
    </Panel>
  );
}
