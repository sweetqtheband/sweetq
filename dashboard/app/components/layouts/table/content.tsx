"use client";

import Loader from "@/app/(pages)/admin/loading";
import config from "@/app/config";
import { ACTIONS, IMAGE_SIZES, SORT } from "@/app/constants";
import useTableRenderComplete from "@/app/hooks/table";
import { renderField } from "@/app/render";
import { renderItem } from "@/app/renderItem";
import { breakpoint, s3File, uuid } from "@/app/utils";
import type { SizeType } from "@/types/size.d";
import { DataTable, DataTableRow, Table, TableContainer } from "@carbon/react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import ListTableToolbar from "@/app/components/layouts/table/toolbar";
import ListTableHead from "@/app/components/layouts/table/head";
import ListTableBody from "@/app/components/layouts/table/body";

let filterTimeout: NodeJS.Timeout;

// Stable default values to prevent re-renders
const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT: Record<string, any> = {};
const NOOP = () => {};
const NOOP_ASYNC = async () => true;
const NOOP_ASYNC_STRING = async () => "";
const NOOP_LOADING = (value: boolean = false) => {};

function ListTableContent({
  id = "item.id",
  items = EMPTY_ARRAY,
  headers = EMPTY_ARRAY,
  imageSize = "md",
  timestamp = 0,
  isLoading = false,
  isWaiting = false,
  setIsLoading = NOOP_LOADING,
  setIsWaiting = NOOP_LOADING,
  onItemClick = NOOP,
  onCopy = NOOP_ASYNC,
  onFiltering = NOOP_ASYNC_STRING,
  onSort = NOOP,
  noAdd = false,
  noDelete = false,
  noCopy = false,
  noBatchActions = false,
  translations = EMPTY_OBJECT,
  batchActions = EMPTY_OBJECT,
  itemActions = EMPTY_OBJECT,
  fields = EMPTY_OBJECT,
  filters = EMPTY_OBJECT,
  renders = EMPTY_OBJECT,
  filtersOpen = false,
  setFiltersOpen = NOOP,
  setCurrentPage = NOOP,
  tableDeleteHandler = NOOP,
  canSort = false,
}: Readonly<{
  id?: string;
  items: any[];
  headers?: any[];
  imageSize: SizeType;
  timestamp?: number;
  isLoading?: boolean;
  isWaiting?: boolean;
  setIsLoading?: (value: boolean) => void;
  setIsWaiting?: (value: boolean) => void;
  onItemClick?: (item: any) => void;
  onCopy?: (ids: string[]) => Promise<boolean>;
  onFiltering?: (filters: Record<string, any>) => Promise<string>;
  onSort?: (items: Record<string, any>[]) => void;
  noAdd?: boolean;
  noDelete?: boolean;
  noCopy?: boolean;
  noBatchActions?: boolean;
  translations?: Record<string, any>;
  fields?: Record<string, any>;
  batchActions: Record<string, any>;
  itemActions?: Record<string, any>;
  filters?: Record<string, any>;
  renders?: Record<string, any>;
  filtersOpen?: boolean;
  setFiltersOpen?: (value: boolean) => void;
  setCurrentPage?: (value: number) => void;
  tableDeleteHandler?: (ids: DataTableRow<any[]>[]) => void;
  canSort?: boolean;
}>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [clearField, setClearField] = useState<string | null>(null);

  // Memoize stable values
  const tableId = useMemo(() => uuid(), []);
  const tableRef = useRef<HTMLDivElement>(null);

  // Memoize computed values
  const tableRows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        id: !item.id ? item._id : item.id,
      })),
    [items]
  );

  const [internalState, setInternalState] = useState<Record<string, any>>({});
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [filtering, setFiltering] = useState<boolean>(false);
  const [fromFilter, setFromFilter] = useState<boolean>(false);
  const [canDelete, setCanDelete] = useState<boolean>(!noDelete);
  const [canCopy, _] = useState<boolean>(!noCopy);
  const [direction, setDirection] = useState(headers.map(() => "DESC"));
  const [sortable, setSortable] = useState(headers.map(() => false));
  const [allSelected, setAllSelected] = useState(false);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Memoized handlers
  const onInternalStateHandler = useCallback(
    (stateFields: string | string[], value: any) => {
      setInternalState((prevState) => {
        const filterInternalState = { ...prevState };
        if (stateFields instanceof Array) {
          stateFields.forEach((field, index) => {
            delete filterInternalState[field];

            if (fields?.search?.[field]?.deletes?.length > 0) {
              fields.search[field].deletes.forEach((deleteField: string) => {
                delete filterInternalState[deleteField];
              });
            }

            if (value) {
              filterInternalState[field] = value[index];
            }
          });
        } else {
          delete filterInternalState[stateFields];

          if (fields?.search?.[stateFields]?.deletes?.length > 0) {
            fields.search[stateFields].deletes.forEach((deleteField: string) => {
              delete filterInternalState[deleteField];
            });
          }

          if (value) {
            filterInternalState[stateFields] = value;
          }
        }

        return filterInternalState;
      });
    },
    [fields]
  );

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

  useEffect(() => {
    setFiltering(
      Object.keys(filters).reduce((isFiltering, filterName) => {
        if (internalState[filterName]) {
          if (Object.values(internalState[filterName]).filter((value) => value).length) {
            return true;
          }
        }
        return isFiltering;
      }, false)
    );
  }, [internalState, filters]);

  const renderCell = useCallback(
    (row: Record<string, any>, field: Record<string, any>, item: Record<string, any>) => {
      if (field.value) {
        const fieldName = field.id.split(":")[1];

        const fieldValue = fields?.options?.[fieldName]?.language
          ? field.value[translations.locale]
          : field.value;

        const isImage = String(field.value).match(/\.(png|gif|jpg|jpeg|webp|svg)/i);

        const defaultValue = item?.relations?.[fieldName]?.[translations.locale] || fieldValue;

        let value = translations.options?.[fieldName]
          ? translations.options?.[fieldName][fieldValue]
          : defaultValue;

        if (renders[fieldName]) {
          const func =
            typeof renders[fieldName] === "function"
              ? renders[fieldName]
              : renders[fieldName].render;

          if (typeof func === "function") {
            const render = func(fieldName, value, item);
            return render instanceof Array ? (
              <>
                {render.map((renderedItem, renderItemIndex) => (
                  <div key={`render-${renderItemIndex}`}>
                    {renderItem(renderedItem, itemActions)}
                  </div>
                ))}
              </>
            ) : (
              renderItem(render, itemActions)
            );
          }
        }

        if (isImage) {
          if (value?.startsWith("imgs")) {
            value = s3File("/" + value);
          }

          if (value?.startsWith("/imgs")) {
            value = s3File(value);
          }

          return (
            // eslint-disable-next-line @next/next/no-img-element
            <Image
              src={value}
              alt={row.id}
              height={IMAGE_SIZES[imageSize]}
              width={IMAGE_SIZES[imageSize]}
              crossOrigin="anonymous"
            />
          );
        }

        return value;
      } else {
        return null;
      }
    },
    [fields, translations, renders, itemActions, imageSize]
  );

  const tableRowClickHandler = useCallback(
    (id: string | number, target: HTMLElement) => {
      if (
        !target.classList.contains("cds--checkbox") &&
        !target.classList.contains("cds--table-column-checkbox")
      ) {
        const row = tableRows.find((row) => row.id === id);
        onItemClick(row);
      }
    },
    [tableRows, onItemClick]
  );

  const tableAddNewHandler = useCallback(() => {
    onItemClick(ACTIONS.ADD);
  }, [onItemClick]);

  const tableCopyHandler = useCallback(
    (selectedRows: any[]) => {
      selectedRows.forEach((row) => {
        onCopy(items.find((item) => item._id === row.id));
      });
    },
    [items, onCopy]
  );

  const tableRowSortHandler = useCallback(
    (index: number) => {
      const dir = [
        ...direction.map((d, i) => (i === index && direction[i] === "DESC" ? "ASC" : "DESC")),
      ];

      setDirection(dir);

      const params = new URLSearchParams(searchParams);

      params.set("sort", headers[index].key);
      params.set("sortDir", String(SORT[dir[index]]));
      replace(`${pathname}?${params.toString()}`);
    },
    [direction, headers, searchParams, pathname, replace]
  );

  const tableRowSortableHandler = useCallback(
    (index: number) => {
      setSortable(sortable.map((dir, i) => (i === index ? !dir : dir)));
    },
    [sortable]
  );

  const tableBatchActionsTranslate = useCallback(
    (
      id: string,
      { totalSelected, totalCount } = {
        totalSelected: 0,
        totalCount: 0,
      }
    ) => {
      if (id === "carbon.table.batch.cancel") {
        return translations.cancel;
      }
      if (id === "carbon.table.batch.selectAll") {
        if (breakpoint("mobile")) {
          return `${
            allSelected ? translations.unselectAllShort : translations.selectAllShort
          } (${totalCount})`;
        }
        return `${allSelected ? translations.unselectAll : translations.selectAll} (${totalCount})`;
      }
      if (id === "carbon.table.batch.selectNone") {
        return translations.selectNone;
      }
      if (id === "carbon.table.batch.item.selected") {
        if (breakpoint("mobile")) {
          return `${totalSelected} ${translations.selectedsShort.toLocaleLowerCase()}`;
        }
        return `${totalSelected} ${translations.selected.toLocaleLowerCase()}`;
      }
      if (id === "carbon.table.batch.items.selected") {
        if (breakpoint("mobile")) {
          return `${totalSelected} ${translations.selectedsShort.toLocaleLowerCase()}`;
        }
        return `${totalSelected} ${translations.selecteds.toLocaleLowerCase()}`;
      }
      if (id === "carbon.table.batch.actions") {
        return translations.actions;
      }
      if (id === "carbon.table.batch.action") {
        return translations.action;
      }
      if (id === "carbon.table.batch.clear") {
        return translations.clear;
      }
      if (id === "carbon.table.batch.save") {
        return translations.save;
      }
      return id;
    },
    [translations, allSelected]
  );

  const onTableSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);

      setIsLoading(true);

      if (value) {
        params.set("query", value);
        params.delete("page");
        setCurrentPage(0);
      } else {
        params.delete("query");
        params.delete("page");
        setCurrentPage(0);
      }

      replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, replace, setIsLoading, setCurrentPage]
  );

  const onSelectAllHandler = useCallback(
    (rows: DataTableRow<any[]>[], selectRow: Function) => {
      if (!allSelected) {
        rows.forEach((row) => {
          if (!row.isSelected) {
            selectRow(row.id);
          }
        });
        setLastSelectedIndex(rows.length - 1);
        setAllSelected(true);
      } else {
        rows.forEach((row) => {
          selectRow(row.id);
        });
        setLastSelectedIndex(null);
        setAllSelected(false);
      }
    },
    [allSelected]
  );

  const getFilters = useCallback(
    () =>
      Object.keys(formState).reduce(
        (acc: Record<string, any>, key: string) => {
          const filter = filters[key];
          const value = formState[key];
          acc.idle = filter?.idle || acc.idle;

          if (value !== null && value !== undefined && value !== "") {
            acc.useFilters[key] = value;
          }

          return acc;
        },
        { idle: 0, useFilters: {} }
      ),
    [formState, filters]
  );

  const processFilters = useCallback(() => {
    const { idle, useFilters } = getFilters();
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(async () => {
      const params = new URLSearchParams(searchParams);

      // Fetch only once
      if (Object.keys(useFilters).length > 0) {
        const data = await onFiltering(useFilters);
        params.set("filter", data);
      } else {
        params.delete("filter");
      }

      params.delete("page");
      setCurrentPage(0);

      let newPath = pathname;

      if (params.size > 0) {
        newPath += `?${params.toString()}`;
      }

      replace(newPath);
      setIsLoading(false);
      setIsWaiting(false);
    }, idle);
  }, [searchParams, pathname, replace, onFiltering, setIsLoading, setIsWaiting, getFilters, setCurrentPage]);

  useEffect(() => {
    if (!fromFilter && Object.keys(formState).length > 0) {
      setFromFilter(true);
    } else {
      if (fromFilter) {
        // We are gonna control idle state manually
        processFilters();
      }
    }
  }, [formState, fromFilter, processFilters]);

  useEffect(() => {
    if (tableRef?.current && !fromFilter) {
      const filterValues = Object.keys(filters).reduce((acc: Record<string, any>, filterName) => {
        if (!formState[filterName] && filters[filterName]?.value) {
          acc[filterName] = filters[filterName].value;
        }
        return acc;
      }, {});

      if (Object.keys(filterValues).length > 0) {
        setFormState((prevState) => ({
          ...prevState,
          ...filterValues,
        }));
      }
    }
  }, [tableRef, filters, formState, fromFilter]);

  const handleFilter = useCallback(
    (field: any, value: any) => {
      const useField = field instanceof Array ? field[0] : field;

      if (clearField && useField !== clearField) {
        return;
      }

      setIsLoading(true);
      setIsWaiting(true);

      const currentState = {
        ...formState,
      };

      delete currentState[useField];
      if (value) {
        setFormState((prevState) => {
          return {
            ...prevState,
            [useField]: value,
          };
        });
      } else {
        setFormState((prevState) => ({
          ...currentState,
        }));
      }
    },
    [clearField, formState, setIsLoading, setIsWaiting]
  );

  const handleFilterRemove = useCallback((field: any) => {
    setClearField(field);
    return handleFilter(field, null);
  }, [handleFilter, setClearField]);

  const handleFilterInternalState = useCallback(
    (field: string, value: any) => {
      onInternalStateHandler(field, value);
    },
    [onInternalStateHandler]
  );

  return (
    <DataTable headers={headers} rows={tableRows} stickyHeader={true}>
      {({
        rows,
        headers,
        getBatchActionProps,
        getTableContainerProps,
        getToolbarProps,
        getSelectionProps,
        selectRow,
        selectedRows,
      }) => {
        const batchActionProps = {
          ...getBatchActionProps({
            onSelectAll: () => {
              onSelectAllHandler(rows, selectRow);
            },
          }),
        };

        return (
          <TableContainer
            title={translations.title}
            description={translations.description}
            {...getTableContainerProps()}
          >
            <ListTableToolbar
              {...getToolbarProps()}
              translations={translations}
              filters={filters}
              fields={fields}
              filtersOpen={filtersOpen}
              formState={formState}
              internalState={internalState}
              filtering={filtering}
              isLoading={isLoading}
              onSearchChange={onTableSearch}
              onFilterChange={handleFilter}
              onFilterInternalStateChange={handleFilterInternalState}
              onFilterReset={handleFilterRemove}
              setFiltersOpen={setFiltersOpen}
              onAddClick={tableAddNewHandler}
              selectedRows={selectedRows}
              batchActionProps={getBatchActionProps({
                onSelectAll: () => onSelectAllHandler(rows, selectRow),
              })}
              batchActions={batchActions}
              canDelete={canDelete}
              canCopy={canCopy}
              onDelete={tableDeleteHandler}
              onCopy={tableCopyHandler}
              noBatchActions={noBatchActions}
              noDelete={noDelete}
              noCopy={noCopy}
              noAdd={noAdd}
              onBatchActionsTranslate={tableBatchActionsTranslate}
            />{" "}
            <Table data-id={tableId}>
              <ListTableHead
                id={id}
                headers={headers}
                noBatchActions={noBatchActions}
                sortable={sortable}
                direction={direction}
                getSelectionProps={getSelectionProps}
                tableRowSortableHandler={tableRowSortableHandler}
                tableRowSortHandler={tableRowSortHandler}
                onSelectAllHandler={onSelectAllHandler}
                rows={rows}
                selectRow={selectRow}
              />
              <ListTableBody
                id={id}
                rows={rows}
                noBatchActions={noBatchActions}
                noDelete={noDelete}
                getSelectionProps={getSelectionProps}
                selectRow={selectRow}
                selectedRows={selectedRows}
                tableRows={tableRows}
                lastSelectedIndex={lastSelectedIndex}
                setLastSelectedIndex={setLastSelectedIndex}
                setCanDelete={setCanDelete}
                tableRowClickHandler={tableRowClickHandler}
                canSort={canSort}
                renderCell={renderCell}
              />
            </Table>
            {isLoading ? <Loader /> : null}
          </TableContainer>
        );
      }}
    </DataTable>
  );
}

export default React.memo(ListTableContent);
