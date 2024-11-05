'use client';

import { getClasses } from '@/app/utils';
import './panel.scss';
import { useContext, useEffect, useRef, useState } from 'react';
import { WindowContext } from '@/app/context';
import { Close } from '@carbon/react/icons';

export default function PanelComponent({
  children,
  forceClose = false,
  onClose = () => true,
}: Readonly<{
  children: React.ReactNode | null;
  forceClose: boolean;
  onClose: Function;
}>) {
  const windowState = useContext(WindowContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(windowState.resizing);
  const animatedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = animatedRef.current;

    if (element) {
      // Escuchar el evento 'animationend'
      const handleAnimationEnd = () => {
        // Coloca aquí la acción que deseas realizar al terminar la animación
      };

      element.addEventListener('animationend', handleAnimationEnd);

      // Limpieza del evento cuando el componente se desmonte
      return () => {
        element.removeEventListener('animationend', handleAnimationEnd);
      };
    }
  }, []);

  useEffect(() => {
    setIsOpen(!!children);
  }, [children]);

  useEffect(() => {
    if (forceClose) {
      const element = animatedRef.current;

      const handleAnimationEnd = () => {
        onClose();
        if (element) {
          element.removeEventListener('transitionend', handleAnimationEnd);
        }
      };

      if (element) {
        element.addEventListener('transitionend', handleAnimationEnd);
      }
      setIsOpen(false);
    }
  }, [forceClose, onClose]);

  useEffect(() => {
    setIsResizing(windowState.resizing);
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
        element.removeEventListener('transitionend', handleAnimationEnd);
      }
    };

    if (element) {
      element.addEventListener('transitionend', handleAnimationEnd);
    }
    setIsOpen(false);
  };

  return (
    <div className={classes} ref={animatedRef}>
      <div className="panel-overlay"></div>
      <div className="panel-wrapper">
        <Close size={32} className="close" onClick={onCloseHandler}></Close>
        <div className="panel-content">{children}</div>
      </div>
    </div>
  );
}
