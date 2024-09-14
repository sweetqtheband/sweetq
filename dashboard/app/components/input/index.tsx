"use client"
import { setClasses } from "@/app/utils"
import { FormEventHandler, forwardRef, KeyboardEventHandler, useEffect, useImperativeHandle, useRef, useState } from "react";
import "./input.scss";

export default forwardRef(function InputComponent({
  type = "text",
  name = "",
  className = null,
  id,
  value = "",
  placeholder = "",
  error = false,
  readOnly = false,
  disabled = false,
  onKeyUp = () => true,
  onChange = () => true,
  onInput = () => true,
}: Readonly<{
  type: string,
  name?: string,
  className?: string | Record<string, boolean> | Array<string> | null,
  id?:string,
  value?: string,
  placeholder?: string,
  error?: boolean,
  readOnly?: boolean,
  disabled?: boolean,
  onKeyUp?: Function,
  onChange?: Function,
  onInput?: Function
}>, ref) {

  const inputRef = useRef<HTMLInputElement|null>(null);

  useImperativeHandle(ref, () => inputRef.current);

  const [inputValue] = useState(value); 

  const [elClasses, setElClasses] = useState({
    input: true,
    [`input-${type}`]: true,
    [`${setClasses(className)}`]: !!className,
    error,
  });

  useEffect(() => {
    if (inputRef.current !== null) {
      if (inputValue && !inputRef.current?.value) {
        inputRef.current.value = inputValue;
      }
    } 
  }, [inputValue]);

  useEffect(() => {
    const newClasses = {
      ...elClasses,
      error
    };
    if (setClasses(elClasses) !== setClasses(newClasses)) {
      setElClasses(newClasses);
    }
  }, [error, elClasses])

  const onInputHandler: FormEventHandler<HTMLInputElement> = (e) => {
    const target = e.target as HTMLInputElement;  
    onInput(target?.value);
  };

  const onChangeHandler: FormEventHandler<HTMLInputElement> = (e) => {
    const target = e.target as HTMLInputElement;
    onChange(target?.value);
  };

  const onKeyUpHandler: KeyboardEventHandler<HTMLInputElement> = (e) => {
    onKeyUp(e);
  };


  return (
    <input
      ref={inputRef}
      id={id}
      type={type}
      name={name}
      placeholder={placeholder}
      className={setClasses(elClasses)}
      readOnly={readOnly}
      disabled={disabled}
      onKeyUp={onKeyUpHandler}
      onInput={onInputHandler}
      onChange={onChangeHandler}
    />
  );
});
