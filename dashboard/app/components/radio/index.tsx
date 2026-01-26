"use client";

import { getClasses, setClasses } from "@/app/utils";
import "./radio.scss";
import { useEffect, useState } from "react";

export default function RadioComponent({
  group,
  name,
  value,
  checked,
  className = null,
  onChange = () => "default",
}: Readonly<{
  group?: string;
  name?: string;
  checked?: boolean;
  value: string;
  className?: string | Record<string, boolean> | Array<string> | null;
  onChange?: Function;
}>) {
  const [isChecked, setIsChecked] = useState(!!checked);
  const classes = getClasses({
    checked: checked,
    [`${setClasses(className)}`]: true,
  });

  useEffect(() => {
    setIsChecked(!!checked);
  }, [checked]);

  const [radioName] = useState(name ?? group);

  const id = `${radioName}-${value.toLowerCase()}`;

  const onChangeHandler = (e: any) => {
    const changeResult = onChange(e);
    if (changeResult === "default") {
      setIsChecked(true);
    }
  };

  const onLabelClickHandler = (e: any) => {
    const changeResult = onChange(e);
    if (changeResult === "default") {
      setIsChecked(true);
    }
  };

  return (
    <label className={classes} onClick={onLabelClickHandler}>
      <input
        type="radio"
        className="radio"
        name={radioName}
        id={id}
        value={value}
        checked={isChecked}
        onChange={onChangeHandler}
      />
      {value}
    </label>
  );
}
