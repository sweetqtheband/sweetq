"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { Layouts } from "@/app/services/layouts";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function LayoutsView(params: Readonly<any>) {
  const router = useRouter();
  const methods = Layouts.getMethods(router);
  const renders = Layouts.getRenders();
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const setIsLoadingHandler = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);
  const setIsWaitingHandler = useCallback((waiting: boolean) => {
    setIsWaiting(waiting);
  }, []);

  return (
    <ListLayout
      {...params}
      methods={methods}
      renders={renders}
      onSave={methods.onSave}
      onDelete={methods.onDelete}
      onCopy={methods.onCopy}
      isLoading={isLoading}
      isWaiting={isWaiting}
      setIsLoading={setIsLoadingHandler}
      setIsWaiting={setIsWaitingHandler}
    />
  );
}
