"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { Users } from "@/app/services/users";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function UsersView(params: Readonly<any>) {
  const router = useRouter();
  const methods = Users.getMethods(router);
  const renders = Users.getRenders();
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
