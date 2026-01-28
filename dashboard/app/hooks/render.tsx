import { useEffect, useRef } from "react";

export function useWhyDidYouRender(name: string, props: any) {
  const previousProps = useRef<any>({});

  useEffect(() => {
    const allKeys = new Set([...Object.keys(previousProps.current), ...Object.keys(props)]);
    const changes: Record<string, { before: any; after: any }> = {};

    allKeys.forEach((key) => {
      if (previousProps.current[key] !== props[key]) {
        changes[key] = { before: previousProps.current[key], after: props[key] };
      }
    });

    if (Object.keys(changes).length) {
      console.log("[why-did-you-render]", name, JSON.stringify(changes));
    }

    previousProps.current = props;
  });
}
