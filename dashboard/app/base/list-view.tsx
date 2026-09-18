"use client";

import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import ListLayout from "../components/layouts/list-layout";
import { BaseListItem } from "@/types/list";

export const ListView = (Service: BaseListItem) =>
  function View({
    items,
    headers,
    total,
    pages,
    translations = {},
    fields = {},
  }: Readonly<{
    items: any[];
    headers: any[];
    total: number;
    pages: number;
    translations?: Record<string, any>;
    fields?: Record<string, any>;
  }>) {
    const router = useRouter();
    const methods = Service.getMethods(router);
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
        items={items}
        headers={headers}
        total={total}
        pages={pages}
        translations={translations}
        fields={fields}
        methods={methods}
        onSave={methods.onSave}
        onDelete={methods.onDelete}
        onCopy={methods.onCopy}
        isLoading={isLoading}
        isWaiting={isWaiting}
        setIsLoading={setIsLoadingHandler}
        setIsWaiting={setIsWaitingHandler}
      />
    );
  };
