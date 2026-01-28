"use client";

import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import ListTable from "./list-table";
import ListPanel from "./list-panel";

// Custom hook for deep comparison memoization - only stringify when comparing
function useDeepMemo<T>(value: T): T {
  const ref = useRef<T>(value);
  const prevStringified = useRef<string | null>(null);

  // Only compute stringified on first render or when we need to compare
  const currentStringified = useMemo(() => JSON.stringify(value), [value]);

  if (prevStringified.current === null) {
    // First render
    prevStringified.current = currentStringified;
    ref.current = value;
  } else if (prevStringified.current !== currentStringified) {
    // Value changed
    ref.current = value;
    prevStringified.current = currentStringified;
  }

  return ref.current;
}
import { SizeType } from "@/types/size";
import { SIZES } from "@/app/constants";
import "./list.scss";

interface ListLayoutProps {
  items?: any[];
  headers?: any[];
  imageSize?: SizeType;
  total?: number;
  limit?: number;
  pages?: number;
  id?: string;
  ids?: string[] | null;
  loading?: boolean;
  setExternalLoading?: (loading: boolean) => void;
  onSave?: (data: any, files: any, ids: string[] | null) => Promise<any>;
  onCopy?: (ids: string[]) => Promise<boolean>;
  onDelete?: (ids: string[]) => Promise<boolean>;
  open?: string | null;
  setOpen?: (open: string | null) => void;
  actionIcon?: string | null;
  actionLabel?: string;
  onAction?: (e: any) => void;
  noAdd?: boolean;
  noDelete?: boolean;
  noBatchActions?: boolean;
  translations?: Record<string, string>;
  actions?: Record<string, any>;
  batchActions?: Record<string, any>;
  itemActions?: Record<string, any>;
  fields?: Record<string, any>;
  multiFields?: Record<string, any>;
  filters?: Record<string, any>;
  methods?: Record<string, any>;
  renders?: Record<string, any>;
  onItemSelect?: (item: any) => void;
  CONSTANTS?: any;
}

// Stable default values to prevent re-renders
const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT: Record<string, any> = {};
const NOOP = () => {};
const NOOP_ASYNC = async () => true;

function ListLayoutComponent({
  items = EMPTY_ARRAY,
  headers = EMPTY_ARRAY,
  imageSize = SIZES.MD,
  total = 0,
  limit = 0,
  pages = 0,
  id = "",
  ids = EMPTY_ARRAY,
  loading = false,
  setExternalLoading = NOOP,
  onSave = NOOP_ASYNC,
  onCopy = NOOP_ASYNC,
  onDelete = NOOP_ASYNC,
  open = "",
  setOpen = NOOP,
  actionIcon = null,
  actionLabel = "",
  onAction = NOOP,
  noAdd = false,
  noDelete = false,
  noBatchActions = false,
  translations = EMPTY_OBJECT,
  actions = EMPTY_OBJECT,
  batchActions = EMPTY_OBJECT,
  itemActions = EMPTY_OBJECT,
  fields = EMPTY_OBJECT,
  multiFields = EMPTY_OBJECT,
  filters = EMPTY_OBJECT,
  methods = EMPTY_OBJECT,
  renders = EMPTY_OBJECT,
  onItemSelect = NOOP,
  CONSTANTS = EMPTY_OBJECT,
}: Readonly<ListLayoutProps>) {
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(loading);
  const [isWaiting, setIsWaiting] = useState(false);
  // Initialize with items directly - useEffect will sync with memoItems
  const [parsedItems, setParsedItems] = useState<any[]>(() => items);

  const setIsLoadingHandler = useCallback(
    (newLoading: boolean) => {
      setIsLoading(newLoading);
      setExternalLoading(newLoading);
    },
    [setExternalLoading]
  );

  const onClose = useCallback(async () => {
    setItem(null);
    onItemSelect(null);
  }, [onItemSelect]);

  const onFiltering = (data: Record<string, any>) => methods.onFilterSave(data);

  const onItemClickHandler = useCallback(
    (clickedItem: any) => {
      setItem(clickedItem);
      onItemSelect(clickedItem);
    },
    [onItemSelect]
  );

  const onSaveHandler = useCallback(
    async (data: any, files: any, idsList: string[] | null) => {
      setIsLoadingHandler(true);
      const response = await onSave(data, files, idsList);

      if (response) {
        setParsedItems((prevItems) => {
          const newItems = [...prevItems];
          const index = prevItems.findIndex((i) => i.id === response?.data.id);

          if (index >= 0) {
            newItems[index] = {
              ...prevItems[index],
              ...Object.keys(response.data).reduce((acc: Record<string, any>, key) => {
                if (filters?.[key]?.fields?.options?.[key]?.options) {
                  const opts = filters[key].fields.options[key].options;
                  if (Array.isArray(response.data[key])) {
                    acc[key] = response.data[key].map(
                      (val) => opts.find((o: any) => String(o.id) === String(val))?.value || val
                    );
                  } else {
                    acc[key] =
                      opts.find((o: any) => String(o.id) === String(response.data[key]))?.value ||
                      response.data[key];
                  }
                } else {
                  acc[key] = response.data[key];
                }
                return acc;
              }, {}),
            };
          } else {
            newItems.unshift(data);
          }

          return newItems;
        });

        onClose();
        setIsLoadingHandler(false);
      }

      return true;
    },
    [onSave, filters, onClose, setIsLoadingHandler]
  );

  const onActionHandler = useCallback(
    (e: any) => {
      onAction(e);
    },
    [onAction]
  );

  // Use deep memoization for object props to prevent unnecessary re-renders
  const memoItems = useDeepMemo(items);
  const memoFilters = useDeepMemo(filters);
  const memoRenders = useDeepMemo(renders);
  const memoActions = useDeepMemo(actions);
  const memoBatchActions = useDeepMemo(batchActions);
  const memoItemActions = useDeepMemo(itemActions);
  const memoHeaders = useDeepMemo(headers);
  const memoFields = useDeepMemo(fields);
  const memoMultiFields = useDeepMemo(multiFields);
  const memoTranslations = useDeepMemo(translations);
  const memoMethods = useDeepMemo(methods);
  const memoCONSTANTS = useDeepMemo(CONSTANTS);

  // Memoize checkAction to prevent unnecessary re-renders
  const checkAction = useMemo(() => memoMethods?.action?.check ?? null, [memoMethods]);

  // Use a ref to track if this is the initial mount
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Only update parsed items if memoized items actually changed (deep comparison)
    setParsedItems(memoItems);

    // Only reset loading states after initial mount or when items actually change
    if (!isInitialMount.current) {
      setIsLoadingHandler(false);
      setIsWaiting(false);
    } else {
      isInitialMount.current = false;
      // On initial mount, just set loading to false if we already have items
      if (memoItems.length > 0) {
        setIsLoadingHandler(false);
        setIsWaiting(false);
      }
    }
  }, [memoItems, setIsLoadingHandler]);

  return (
    <>
      <ListTable
        id={id}
        items={parsedItems}
        onItemClick={onItemClickHandler}
        onDelete={onDelete}
        onCopy={onCopy}
        onFiltering={onFiltering}
        imageSize={imageSize}
        headers={memoHeaders}
        total={total}
        limit={limit}
        pages={pages}
        filters={memoFilters}
        translations={memoTranslations}
        noAdd={noAdd}
        noDelete={noDelete}
        noBatchActions={noBatchActions}
        fields={memoFields}
        isLoading={isLoading}
        isWaiting={isWaiting}
        setIsWaiting={setIsWaiting}
        setIsLoading={setIsLoadingHandler}
        renders={memoRenders}
        actions={memoActions}
        batchActions={memoBatchActions}
        itemActions={memoItemActions}
      />
      <ListPanel
        id={id}
        ids={ids}
        items={parsedItems}
        data={item}
        onClose={onClose}
        onSave={onSaveHandler}
        onAction={onActionHandler}
        actionIcon={actionIcon}
        actionLabel={actionLabel}
        translations={memoTranslations}
        checkAction={checkAction}
        fields={memoFields}
        multiFields={memoMultiFields}
        methods={memoMethods}
        renders={memoRenders}
        open={open}
        setOpen={setOpen}
        CONSTANTS={memoCONSTANTS}
      />
    </>
  );
}

// --- Export con memoización de props externas ---
export default React.memo(ListLayoutComponent);
