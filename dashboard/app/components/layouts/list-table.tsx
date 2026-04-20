"use client";

import config from "@/app/config";
import useTableRenderComplete from "@/app/hooks/table";
import { breakpoint, getClasses, s3File, uuid } from "@/app/utils";
import type { SizeType } from "@/types/size.d";
import { Dropdown, Modal, PaginationNav, Stack } from "@carbon/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { EMPTY_ARRAY, EMPTY_OBJECT, NOOP, NOOP_ASYNC, NOOP_LOADING } from "@/app/constants";
import ListTableContent from "./table/content";

let timeout: NodeJS.Timeout;

interface ListTableProps {
  id?: string;
  items: any[];
  headers?: any[];
  imageSize: SizeType;
  limit: number;
  timestamp?: number;
  pages: number;
  isLoading?: boolean;
  isWaiting?: boolean;
  setIsLoading?: (value: boolean) => void;
  setIsWaiting?: (value: boolean) => void;
  onItemClick?: (item: any) => void;
  onDelete?: (ids: string[]) => Promise<boolean>;
  onCopy?: (ids: string[]) => Promise<boolean>;
  onFiltering?: (filters: Record<string, any>) => Promise<string>;
  onSort?: (items: Record<string, any>[]) => void;
  noAdd?: boolean;
  noDelete?: boolean;
  noCopy?: boolean;
  noBatchActions?: boolean;
  translations?: Record<string, any>;
  batchActions: Record<string, any>;
  itemActions?: Record<string, any>;
  fields?: Record<string, any>;
  filters?: Record<string, any>;
  renders?: Record<string, any>;
  canSort?: boolean;
}

function ListTable(props: Readonly<ListTableProps>) {
  const {
    items = EMPTY_ARRAY,
    headers = EMPTY_ARRAY,
    limit = config.table.limit,
    timestamp = 0,
    pages = 0,
    isWaiting = false,
    setIsLoading = NOOP_LOADING,
    setIsWaiting = NOOP_LOADING,
    onDelete = NOOP_ASYNC,
    onSort = NOOP,
    translations = EMPTY_OBJECT,
    canSort = false,
  } = props;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Memoize stable values
  const tableId = useMemo(() => uuid(), []);
  const tableRef = useRef<HTMLDivElement>(null);

  // State for drag and drop
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [deleteRows, setDeleteRows] = useState<any[]>([]);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [fitTable, setFitTable] = useState(false);
  const [itemsShown, setItemsShown] = useState(config.table.shown);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [sortedItems, setSortedItems] = useState<any[]>(items);

  // Memoize computed values
  const tableRows = useMemo(
    () =>
      (canSort ? sortedItems : items).map((item) => ({
        ...item,
        id: !item.id ? item._id : item.id,
      })),
    [items, sortedItems, canSort]
  );

  const limitItems = useMemo(
    () =>
      [10, 25, 50, 100, 200, 500].map((item) => ({
        id: item,
        text: item,
      })),
    []
  );

  const [selectedLimit, setSelectedLimit] = useState(limitItems.find((item) => item.id === limit));

  const defaultCell = useMemo(() => headers.find((header) => header.default), [headers]);

  useEffect(() => {
    if (timestamp) {
      setIsWaiting(false);
    }
  }, [timestamp, setIsWaiting]);

  const handleTableRenderComplete = useCallback(() => {
    setTimeout(() => {
      if (!isWaiting) {
        setIsLoading(false);
      }
    }, 300);
  }, [isWaiting, setIsLoading]);

  useTableRenderComplete(tableId, handleTableRenderComplete);

  const checkRowsForWindowSize = useCallback(
    (rows: any[]) => {
      let rowsHeight = rows.length * 48;
      const maxHeight = window.innerHeight - 48 * 4;

      if (tableRef) {
        const tbody = tableRef.current?.querySelector("tbody");
        if (tbody) {
          rowsHeight = tbody.clientHeight;
        }
      }
      return rowsHeight > maxHeight;
    },
    [tableRef]
  );

  const tableDeleteHandler = useCallback(
    (selectedRows: any[]) => {
      const deleteRows = selectedRows.filter(
        (row) => tableRows.find((item) => item._id === row.id)?.default !== true
      );
      if (!deleteOpen) {
        setDeleteOpen(true);
        setDeleteRows(deleteRows);
      } else {
        onDelete(deleteRows.map((row) => row.id));
        setDeleteOpen(false);
      }
    },
    [deleteOpen, tableRows, onDelete]
  );

  const tableDeleteClear = useCallback(() => {
    setDeleteOpen(false);
    setDeleteRows([]);
  }, []);

  const onLimitChangeHandler = useCallback(
    ({ selectedItem }: any) => {
      const params = new URLSearchParams(searchParams);

      params.set("limit", String(selectedItem?.id));
      params.delete("page");
      setCurrentPage(0);

      setSelectedLimit(limitItems.find((item) => item.id === selectedItem?.id));
      setIsLoading(true);
      setIsWaiting(true);

      replace(`${pathname}?${params.toString()}`);
    },
    [limitItems, searchParams, pathname, replace, setIsLoading, setIsWaiting]
  );

  const onPaginationChangeHandler = useCallback(
    (page: number) => {
      setIsLoading(true);
      setIsWaiting(true);
      const params = new URLSearchParams(searchParams);

      params.set("page", String(page));
      setCurrentPage(page);

      replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, replace, setIsLoading, setIsWaiting]
  );

  const resizeHandler = useCallback(() => {
    setFitTable(checkRowsForWindowSize(tableRows));
    const max = Math.floor(window.innerWidth / 48 - 5);
    setItemsShown(max);
  }, [checkRowsForWindowSize, tableRows]);

  // Track if resize effect has run to avoid duplicate resize dispatches
  const hasInitialResizeRun = useRef(false);

  useEffect(() => {
    window.addEventListener("resize", resizeHandler);

    // Only trigger initial resize once
    if (!hasInitialResizeRun.current) {
      hasInitialResizeRun.current = true;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 10);
    }

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [resizeHandler]);

  const classes = useMemo(
    () =>
      getClasses({
        "table-wrapper": true,
        "with-title": !!translations.title,
        "max-top": fitTable,
      }),
    [translations.title, fitTable]
  );

  const handleEscapeKey = useCallback((ev: React.KeyboardEvent) => {
    if (ev.key === "Escape") {
      setFiltersOpen(false);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      setSortedItems((prevItems) => {
        const oldIndex = prevItems.findIndex(
          (item) => item.id === active.id || item._id === active.id
        );
        const newIndex = prevItems.findIndex((item) => item.id === over.id || item._id === over.id);

        if (oldIndex === -1 || newIndex === -1) return prevItems;

        const newItems = arrayMove(prevItems, oldIndex, newIndex);
        onSort(newItems);
        return newItems;
      });
    },
    [onSort]
  );

  const renderListTableContent = useCallback(() => {
    return (
      <ListTableContent
        id={props.id}
        items={canSort ? sortedItems : props.items}
        headers={props.headers}
        imageSize={props.imageSize}
        timestamp={props.timestamp}
        isLoading={props.isLoading}
        isWaiting={props.isWaiting}
        setIsLoading={props.setIsLoading}
        setIsWaiting={props.setIsWaiting}
        onItemClick={props.onItemClick}
        onCopy={props.onCopy}
        onFiltering={props.onFiltering}
        onSort={props.onSort}
        noAdd={props.noAdd}
        noDelete={props.noDelete}
        noCopy={props.noCopy}
        noBatchActions={props.noBatchActions}
        translations={props.translations}
        batchActions={props.batchActions}
        itemActions={props.itemActions}
        fields={props.fields}
        filters={props.filters}
        renders={props.renders}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        setCurrentPage={setCurrentPage}
        tableDeleteHandler={tableDeleteHandler}
        canSort={props.canSort}
      />
    );
  }, [
    props,
    sortedItems,
    canSort,
    filtersOpen,
    setFiltersOpen,
    setCurrentPage,
    tableDeleteHandler,
  ]);

  useEffect(() => {
    setSortedItems(items);
  }, [items]);

  return (
    <div className={classes} ref={tableRef} onKeyDown={handleEscapeKey}>
      {canSort ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={sortedItems.map((item) => item.id || item._id)}
            strategy={verticalListSortingStrategy}
          >
            {renderListTableContent()}
          </SortableContext>
        </DndContext>
      ) : (
        renderListTableContent()
      )}
      <Stack gap={4} orientation="horizontal" className="cds-table--pagination">
        <PaginationNav
          itemsShown={itemsShown}
          totalItems={pages}
          page={currentPage}
          size={breakpoint("mobile") ? "sm" : "md"}
          onChange={onPaginationChangeHandler}
        />

        <Dropdown
          titleText={null}
          id="limit"
          label={translations.fields.limit}
          items={limitItems}
          selectedItem={selectedLimit ?? undefined}
          itemToString={(selectedLimit) => (selectedLimit ? String(selectedLimit?.text) : "")}
          size="sm"
          direction="top"
          onChange={onLimitChangeHandler}
        />
      </Stack>
      <Modal
        open={deleteOpen}
        onRequestClose={() => tableDeleteClear()}
        onRequestSubmit={() => tableDeleteHandler(deleteRows)}
        danger
        modalHeading={
          deleteRows.length === 1 ? translations.confirmDelete : translations.confirmDeleteSelected
        }
        closeButtonLabel={translations.close}
        primaryButtonText={translations.delete}
        secondaryButtonText={translations.cancel}
        modalLabel={deleteRows
          .map(
            (row) =>
              row.cells.find((cell: Record<string, any>) => cell.info.header === defaultCell.key)
                .value
          )
          .join(", ")}
      />
    </div>
  );
}

export default React.memo(ListTable);
