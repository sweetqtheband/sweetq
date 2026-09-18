"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { SocialNetworks } from "@/app/services/socialNetworks";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function SocialNetworksView(params: Readonly<any>) {
  const router = useRouter();
  const methods = SocialNetworks.getMethods(router);
  const renders = SocialNetworks.getRenders();
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
      sortable={true}
      onSave={methods.onSave}
      onDelete={methods.onDelete}
      onCopy={methods.onCopy}
      onSort={methods.onSort}
      isLoading={isLoading}
      isWaiting={isWaiting}
      setIsLoading={setIsLoadingHandler}
      setIsWaiting={setIsWaitingHandler}
    />
  );
}
