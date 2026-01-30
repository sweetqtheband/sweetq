import * as dataEn from "@emoji-mart/data";
import dataEs from "./data-es.json";
import Picker from "@emoji-mart/react";
import { ReactElement, RefObject, useCallback, useEffect, useRef, useState } from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import "./content-area.scss";
import { FaceAdd, Parameter, Send } from "@carbon/react/icons";
import { ICON_SIZES, VARIABLES } from "@/app/constants";
import { Dropdown } from "@carbon/react";
import { getClasses, isMobile, uuid } from "@/app/utils";

const pickerLocale: Record<string, any> = {
  en: dataEn,
  es: dataEs,
};

export default function ContentArea({
  id = uuid(),
  locale = "es",
  value = "",
  translations = {},
  invalid = false,
  onChange = () => {},
  onSend = null,
  variant = "default",
  hasParameter = false,
}: Readonly<{
  id?: string;
  locale?: string;
  value?: string;
  invalid?: boolean;
  translations?: Record<string, any>;
  onChange?: Function;
  onSend?: Function | null;
  variant?: string;
  hasParameter?: boolean;
}>) {
  const contentEditableRef = useRef(null) as RefObject<HTMLElement>;
  const emojiWrapperRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef(null) as RefObject<HTMLElement>;

  const [defaultVarValue, setDefaultVarValue] = useState<string>();
  const [defaultValue, setDefaultValue] = useState<string>(value);

  const onChangeHandler = useCallback(() => {
    const text = contentEditableRef.current?.innerText;
    if (text) {
      onChange(text);
    }
  }, [onChange]);

  useEffect(() => {
    if (value !== contentEditableRef.current?.innerText) {
      setDefaultValue(value.replace(/\n/g, "<br>"));
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
    if (emojiRef?.current && emojiLoaded) {
      let emojiHtml = emojiRef.current.innerHTML;
      setDefaultValue(defaultValue + emojiHtml);
      setEmojiLoaded(false);
      setShowPicker(false);
    }
  }, [emojiRef, emojiLoaded, defaultValue, onChangeHandler]);

  useEffect(() => {
    if (defaultVarValue) {
      setDefaultValue(defaultValue + defaultVarValue);
      setDefaultVarValue("");
      setShowParameter(false);
    }
  }, [defaultValue, defaultVarValue]);

  useEffect(() => {
    const pos = emojiWrapperRef.current?.getBoundingClientRect();
    if (pos?.bottom || 0 > window.innerHeight) {
      emojiWrapperRef.current?.style.setProperty("top", "auto");
      emojiWrapperRef.current?.style.setProperty("bottom", "0");
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

  const handleSend = () => {
    onChangeHandler();
    if (onSend) {
      onSend(contentEditableRef.current?.innerText);
      setDefaultValue("");
    }
  };

  const onKeyDownHandler = (e: any) => {
    if (onSend && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <>
      <div
        data-variant={variant}
        className={getClasses({
          "contenteditable--wrapper": true,
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
            onKeyDown={onKeyDownHandler}
            tagName="div"
            onBlur={onChangeHandler}
          />
        </div>
        <div className="contenteditable--actions">
          {hasParameter ? <Parameter size={ICON_SIZES.MD} onClick={handleShowVars} /> : null}
          {!isMobile() ? <FaceAdd size={ICON_SIZES.MD} onClick={handleShowEmoji} /> : null}
          {typeof onSend === "function" ? <Send size={ICON_SIZES.MD} onClick={handleSend} /> : null}
        </div>
      </div>
      {showParameter && (
        <Dropdown
          autoAlign={true}
          id={id}
          label={translations.fields.vars}
          titleText={""}
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
