"use client";

import { getClasses } from "@/app/utils";
import "./modal.scss";
import { useContext, useEffect, useRef, useState } from "react";
import { WindowContext } from "@/app/context";
import { Close } from "@carbon/react/icons";

export default function ModalComponent({
  children,
  forceClose = false,
  onClose = () => true,
}: Readonly<{
  children: React.ReactNode | null;
  forceClose?: boolean;
  onClose?: Function;
}>) {
  const windowState = useContext(WindowContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(windowState?.resizing);
  const animatedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(!!children);
  }, [children]);

  useEffect(() => {
    if (forceClose) {
      const element = animatedRef.current;

      const handleAnimationEnd = () => {
        onClose();
        if (element) {
          element.removeEventListener("transitionend", handleAnimationEnd);
        }
      };

      if (element) {
        element.addEventListener("transitionend", handleAnimationEnd);
      }
      setIsOpen(false);
    }
  }, [forceClose, onClose]);

  useEffect(() => {
    setIsResizing(windowState?.resizing ?? false);
  }, [windowState]);

  const classes = getClasses({
    panel: true,
    open: isOpen,
    resizing: isResizing,
  });

  const onCloseHandler = (e: any) => {
    const element = animatedRef.current;

    const handleAnimationEnd = () => {
      onClose();
      if (element) {
        element.removeEventListener("transitionend", handleAnimationEnd);
      }
    };

    if (element) {
      element.addEventListener("transitionend", handleAnimationEnd);
    }
    setIsOpen(false);
  };

  return (
    <div className={classes} ref={animatedRef}>
      <div className="modal-overlay"></div>
      <div className="modal-wrapper">
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
