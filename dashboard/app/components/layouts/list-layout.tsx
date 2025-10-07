"use client";

import { useCallback, useEffect, useState } from "react";
import ListTable from "./list-table";
import ListPanel from "./list-panel";
import { SizeType } from "@/types/size";
import { SIZES } from "@/app/constants";
import "./list.scss";

export default function ListLayout({
  items = [],
  headers = [],
  imageSize = SIZES.MD,
  total = 0,
  limit = 0,
  pages = 0,
  id = "",
  loading = false,
  setExternalLoading = () => true,
  onSave = async () => true,
  onCopy = async () => true,
  onDelete = async () => true,
  actionIcon = null,
  actionLabel = "",
  onAction = async () => true,
  noAdd = false,
  noDelete = false,
  noBatchActions = false,
  translations = {},
  actions = {},
  batchActions = {},
  itemActions = {},
  fields = {},
  filters = {},
  methods = {},
  renders = {},
  onItemSelect = () => true,
}: Readonly<{
  items?: any[];
  headers?: any[];
  imageSize?: SizeType;
  total?: number;
  limit?: number;
  pages?: number;
  id?: string;
  loading?: boolean;
  setExternalLoading?: Function;
  onSave?: (data: any, files: any) => Promise<any>;
  onCopy?: (ids: string[]) => Promise<boolean>;
  onDelete?: (ids: string[]) => Promise<boolean>;
  actionIcon?: string | null;
  actionLabel?: string;
  onAction?: Function;
  noAdd?: boolean;
  noDelete?: boolean;
  noBatchActions?: boolean;
  translations?: Record<string, string>;
  actions?: Record<string, any>;
  batchActions?: Record<string, any>;
  itemActions?: Record<string, any>;
  fields?: Record<string, any>;
  filters?: Record<string, any>;
  methods?: Record<string, any>;
  renders?: Record<string, any>;
  onItemSelect?: Function;
}>) {
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const setIsLoadingHandler = useCallback(
    (newLoading: boolean) => {
      setIsLoading(newLoading);
      setExternalLoading(newLoading);
    },
    [setExternalLoading]
  );

  useEffect(() => {
    setIsLoadingHandler(loading);
  }, [setIsLoadingHandler, loading]);

  const [parsedItems, setParsedItems] = useState<any[]>([]);

  useEffect(() => {
    setParsedItems(items);
    setIsLoadingHandler(false);
    setIsWaiting(false);
  }, [setIsLoadingHandler, setParsedItems, setIsWaiting, items]);

  const onClose = async (item = null) => {
    setItem(null);
    onItemSelect(null);
  };

  const onSaveHandler = async (data: any, files: any) => {
    setIsLoadingHandler(true);
    const response = await onSave(data, files);

    if (response) {
      setParsedItems((prevItems) => {
        const newItems = [...prevItems];
        const index = prevItems.findIndex((item) => item.id === response?.data.id);
        if (index >= 0) {
          newItems[index] = {
            ...prevItems[index],
            ...Object.keys(response?.data).reduce((acc: Record<string, any>, key: string) => {
              if (filters?.[key]?.fields?.options?.[key].options) {
                const filterOptions = filters[key].fields.options[key].options;
                // If it's an array, traverse through the options and find the value

                if (Array.isArray(response?.data[key])) {
                  acc[key] = response?.data[key].map(
                    (value: any) =>
                      filterOptions.find((option: any) => String(option.id) === String(value))
                        ?.value || value
                  );
                } else {
                  acc[key] =
                    filterOptions.find(
                      (option: any) => String(option.id) === String(response?.data[key])
                    )?.value || response?.data[key];
                }

                return acc;
              }

              acc[key] = response?.data[key];
              return acc;
            }, {}),
          };
        } else {
          newItems.unshift(data);
        }

        return [...newItems];
      });
      onClose();
      setIsLoadingHandler(false);
    }
    return true;
  };

  const onItemClickHandler = (item: any) => {
    setItem(item);
    onItemSelect(item);
  };

  const onActionHandler = async (e: any) => {
    onAction(e);
  };

  return (
    <>
      <ListTable
        id={id}
        items={parsedItems}
        onItemClick={onItemClickHandler}
        onDelete={onDelete}
        onCopy={onCopy}
        imageSize={imageSize}
        headers={headers}
        total={total}
        limit={limit}
        pages={pages}
        filters={filters}
        translations={translations}
        noAdd={noAdd}
        noDelete={noDelete}
        noBatchActions={noBatchActions}
        fields={fields}
        isLoading={isLoading}
        isWaiting={isWaiting}
        setIsWaiting={setIsWaiting}
        setIsLoading={setIsLoadingHandler}
        renders={renders}
        actions={actions}
        batchActions={batchActions}
        itemActions={itemActions}
      />
      <ListPanel
        id={id}
        data={item}
        onClose={onClose}
        onSave={onSaveHandler}
        onAction={onActionHandler}
        actionIcon={actionIcon}
        actionLabel={actionLabel}
        translations={translations}
        checkAction={methods?.action?.check ?? null}
        fields={fields}
        methods={methods}
        renders={renders}
      />
    </>
  );
}
