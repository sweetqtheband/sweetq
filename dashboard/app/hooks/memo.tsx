// Custom hook for deep comparison memoization - prevents re-renders from server component props
import { useMemo, useRef } from "react";

export function useDeepMemo<T>(value: T): T {
  const ref = useRef<T>(value);
  const prevStringified = useRef<string | null>(null);

  const currentStringified = useMemo(() => JSON.stringify(value), [value]);

  if (prevStringified.current === null) {
    prevStringified.current = currentStringified;
    ref.current = value;
  } else if (prevStringified.current !== currentStringified) {
    ref.current = value;
    prevStringified.current = currentStringified;
  }

  return ref.current;
}
