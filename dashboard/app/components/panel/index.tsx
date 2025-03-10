'use client';

import { getClasses } from '@/app/utils';
import './panel.scss';
import { useContext, useEffect, useRef, useState } from 'react';
import { WindowContext } from '@/app/context';
import { Close } from '@carbon/react/icons';
import { renderItem } from '@/app/renderItem';
import { Tooltip } from '@carbon/react';

export default function PanelComponent({
  children,
  forceClose = false,
  onClose = () => true,
  overlay = true,
  actionLabel = '',
  actionIcon = null,
  translations = {},
  onAction = () => true,
}: Readonly<{
  children: React.ReactNode | null;
  forceClose: boolean;
  onClose: Function;
  overlay?: boolean;
  actionLabel?: string;
  actionIcon?: string | null;
  translations?: Record<string, any>;
  onAction?: Function;
}>) {
  const windowState = useContext(WindowContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(windowState?.resizing);
  const animatedRef = useRef<HTMLDivElement>(null);
  const [icon, setIcon] = useState<any>(null);

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
    setIsResizing(windowState?.resizing ?? false);
  }, [windowState]);

  const classes = getClasses({
    panel: true,
    open: isOpen,
    resizing: isResizing,
  });

  const onActionHandler = (e: any) => {
    onAction();
  };

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

  useEffect(() => {
    const i =
      typeof actionIcon === 'string' ? renderItem({ type: actionIcon }) : null;
    setIcon(i);
  }, [actionIcon]);

  return (
    <div className={classes} ref={animatedRef}>
      {overlay && actionLabel ? <div className="panel-overlay"></div> : null}
      <div className="panel-wrapper">
        {icon && (
          <div className="action" onClick={onActionHandler}>
            <Tooltip label={actionLabel} align="bottom" autoAlign>
              {icon}
            </Tooltip>
          </div>
        )}
        <div className="close" onClick={onCloseHandler}>
          <Tooltip label={translations.close} align="bottom" autoAlign>
            <Close size={32}></Close>
          </Tooltip>
        </div>
        <div className="panel-content">{children}</div>
      </div>
    </div>
  );
}
