"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { Gigs } from "@/app/services/gigs";
import GooglePlacesLoader from "@/app/components/google/places";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function GigsView(params: Readonly<any>) {
  const router = useRouter();
  const methods = Gigs.getMethods(router);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const setIsLoadingHandler = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);
  const setIsWaitingHandler = useCallback((waiting: boolean) => {
    setIsWaiting(waiting);
  }, []);


  return (
    <>
      <GooglePlacesLoader apiKey={params.apiKey} />
      <ListLayout
        {...params}
        methods={methods}
        onSave={methods.onSave}
        onDelete={methods.onDelete}
        onCopy={methods.onCopy}
        isLoading={isLoading}
        isWaiting={isWaiting}
        setIsLoading={setIsLoadingHandler}
        setIsWaiting={setIsWaitingHandler}
      />
    </>
  );
}
