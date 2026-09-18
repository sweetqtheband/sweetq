"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { Config } from "@/app/services/config";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function ConfigView(params: Readonly<any>) {
  const router = useRouter();
  const methods = Config.getMethods(router);
  const renders = Config.getRenders();
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
