'use client';

import { ContentArea, Panel } from '@/app/components';
import {
  Button,
  ContentSwitcher,
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

export default function MessagePanel({
  ids = null,
  items = [],
  setIds = () => {},
  translations = {},
}: Readonly<{
  ids: string[] | null;
  items: any[];
  setIds?: Function;
  translations: Record<string, any>;
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
  const [formState, setFormState] = useState({
    layout: '',
    personalMessage: '',
    collectiveMessage: '',
  });
  const [forceClose, setForceClose] = useState(false);

  const onSaveHandler = async () => {
    setForceClose(true);
    setIds(null);
  };

  const onCloseHandler = async () => {
    setForceClose(false);
    setIds(null);
  };

  const onInputHandler = (key: string, value: any) => {
    setFormState((prevState: any) => {
      if (prevState[key] === value) return prevState;
      return { ...prevState, [key]: value };
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
    }
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
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onInputHandler('layout', e.target.value)
                  }
                />
              ) : (
                'HOLA'
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
