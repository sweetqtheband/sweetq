import * as dataEn from '@emoji-mart/data';
import dataEs from './data-es.json';
import Picker from '@emoji-mart/react';
import {
  ReactElement,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import './content-area.scss';
import { FaceAdd, Parameter } from '@carbon/react/icons';
import { ICON_SIZES, VARIABLES } from '@/app/constants';
import { Dropdown } from '@carbon/react';
import { getClasses, uuid } from '@/app/utils';

const pickerLocale: Record<string, any> = {
  en: dataEn,
  es: dataEs,
};

export default function ContentArea({
  id = uuid(),
  locale = 'es',
  value = '',
  translations = {},
  invalid = false,
  onChange = () => {},
}: Readonly<{
  id?: string;
  locale?: string;
  value?: string;
  invalid?: boolean;
  translations?: Record<string, any>;
  onChange?: Function;
}>) {
  const contentEditableRef = useRef(null) as RefObject<HTMLElement>;
  const emojiWrapperRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef(null) as RefObject<HTMLElement>;

  const [defaultVarValue, setDefaultVarValue] = useState<string>(value);
  const [defaultValue, setDefaultValue] = useState<string>(value);

  const onChangeHandler = useCallback(() => {
    const text = contentEditableRef.current?.innerText;
    if (text) {
      onChange(text);
    }
  }, [onChange]);

  useEffect(() => {
    if (value !== contentEditableRef.current?.innerText) {
      setDefaultValue(value.replace(/\n/g, '<br>'));
    }
  }, [value]);

  const handleChange = (e: ContentEditableEvent) => {
    setDefaultValue(e.target.value);
  };
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [showParameter, setShowParameter] = useState<boolean>(false);
  const [emojiElement, setEmojiElement] = useState<ReactElement | null>(null);
  const [emojiLoaded, setEmojiLoaded] = useState<boolean>(false);

  useEffect(() => {
    onChangeHandler();
  }, [defaultValue, onChangeHandler]);

  useEffect(() => {
    if (emojiRef?.current && emojiLoaded) {
      let emojiHtml = emojiRef.current.innerHTML;
      setDefaultValue(defaultValue + emojiHtml);
      setEmojiLoaded(false);
      setShowPicker(false);
    }
  }, [emojiRef, emojiLoaded, defaultValue, onChangeHandler]);

  useEffect(() => {
    setDefaultValue(defaultValue + defaultVarValue);
    setDefaultVarValue('');
    setShowParameter(false);
  }, [defaultValue, defaultVarValue]);

  useEffect(() => {
    const pos = emojiWrapperRef.current?.getBoundingClientRect();
    if (pos?.bottom || 0 > window.innerHeight) {
      emojiWrapperRef.current?.style.setProperty('top', 'auto');
      emojiWrapperRef.current?.style.setProperty('bottom', '0');
    }
  }, [showPicker, emojiWrapperRef]);

  const handleAddEmoji = (emoji: any) => {
    setEmojiElement(
      <span
        ref={emojiRef}
        className="invisible"
        contentEditable={false}
        dangerouslySetInnerHTML={{
          __html: emoji.native,
        }}
      />
    );
    setEmojiLoaded(true);
  };

  const handleAddVar = ({ selectedItem: item }: any) => {
    setDefaultVarValue(item.replacement);
  };

  const handleShowEmoji = () => {
    setShowPicker(!showPicker);
  };

  const handleShowVars = () => {
    setShowParameter(!showParameter);
  };
  return (
    <>
      <div
        className={getClasses({
          'contenteditable--wrapper': true,
          error: invalid,
        })}
      >
        <div className="contenteditable--scroll">
          <ContentEditable
            innerRef={contentEditableRef}
            className="contenteditable"
            html={defaultValue}
            disabled={false}
            onChange={handleChange}
            tagName="div"
          />
        </div>
        <div className="contenteditable--actions">
          <Parameter size={ICON_SIZES.MD} onClick={handleShowVars} />
          <FaceAdd size={ICON_SIZES.MD} onClick={handleShowEmoji} />
        </div>
      </div>
      {showParameter && (
        <Dropdown
          autoAlign={true}
          id={id}
          label={translations.fields.vars}
          titleText={''}
          items={VARIABLES.map((item) => ({
            ...item,
            text: translations.vars[item.id] || item.text,
          }))}
          selectedItem={VARIABLES.find((item) => item.id === defaultVarValue)}
          itemToString={(item: any) => item.text}
          itemToElement={(item: any) => item.text}
          onChange={handleAddVar}
        />
      )}
      {showPicker && (
        <div className="emoji-picker" ref={emojiWrapperRef}>
          <Picker
            data={pickerLocale[locale]}
            locale={locale}
            onEmojiSelect={handleAddEmoji}
            onClickOutside={() => setShowPicker(false)}
          />
          {emojiElement}
        </div>
      )}
    </>
  );
}
