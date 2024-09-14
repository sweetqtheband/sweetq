"use client";

import { getClasses } from "@/app/utils";
import './radio-group.scss';
import { Children, isValidElement } from "react";

type Type = 'radio-list'|'switch';
export default function RadioGroupComponent({
  children,
  label = '',
  type = 'radio-list',
  onChange
}: Readonly<{
  children: React.ReactNode | null,
  label?: string,
  type: Type,
  onChange: Function
}
>) {
  const classes = getClasses({
    [type]: true,      
  });

  const RenderChild = (children: React.ReactNode) => 
    Children.map(children, (child, index) => {
      if (isValidElement(child)) {
        return (
          <child.type
            {...child.props}
            className={`radio-${index}`}
            onChange={(e:any) => onChange(index + 1)}          
          />
        );      
      }
      return child;
    });

  return (
    <div className={classes}>
      { label ? (<label>{label}</label>) : null }
      <div className={`${type}-options`}>
        {RenderChild(children)}
      </div>
    </div>
  )  
}