"use client";

import { getClasses } from "@/app/utils";
import './panel.scss';
import { useContext, useEffect, useState } from "react";
import { WindowContext } from "@/app/context";

export default function PanelComponent({
  children,
  forceClose = false,
  onClose = () => true
}: Readonly<{
  children: React.ReactNode | null,
  forceClose: boolean,
  onClose: Function
}>
) {
  const windowState = useContext(WindowContext);
  const [isOpen, setIsOpen] = useState(false)
  const [isResizing, setIsResizing] = useState(windowState.resizing)

  useEffect(() => {
    setIsOpen(!!children)
  }, [children]); 

  useEffect(() => {
    if (forceClose) {
      setIsOpen(false);
      onClose();
    }
  }, [forceClose, onClose])


  useEffect(() => {
    setIsResizing(windowState.resizing);
  }, [windowState]);  


  const classes = getClasses({
    "panel": true,
    "open": isOpen,
    "resizing": isResizing
  })

  const onCloseHandler  = (e: any) => {
    setIsOpen(false);
    onClose();  
  }

  return (
    <div className={classes}>
      <div className="panel-overlay"></div>
      <div className="panel-wrapper">
        <div className="close" onClick={onCloseHandler}></div>
        <div className="panel-content">
          {children}
        </div>
      </div>
    </div>
  )
};