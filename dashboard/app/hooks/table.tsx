import { useEffect, useRef } from "react";

const useTableRenderComplete = (tableId: string, onRenderComplete: Function) => {
  const observerRef = useRef<MutationObserver | null>(null);
  const timeoutRef = useRef<any>(null);
  useEffect(() => {
    const tableElement = document.querySelector(`[data-id="${tableId}"]`);
    if (!tableElement) return;

    const observer = new MutationObserver(() => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onRenderComplete();
        observer.disconnect();
      }, 500);
    });

    observer.observe(tableElement, { childList: true, subtree: true });
    observerRef.current = observer;

    timeoutRef.current = setTimeout(() => {
      onRenderComplete();
      observer.disconnect();
    }, 500);
  }, [tableId, onRenderComplete]);
};

export default useTableRenderComplete;
