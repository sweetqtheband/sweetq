"use client";

import Loader from "@/app/(pages)/admin/loading";
import config from "@/app/config";
import { ACTIONS, IMAGE_SIZES, SORT } from "@/app/constants";
import useTableRenderComplete from "@/app/hooks/table";
import { renderField } from "@/app/render";
import { renderItem } from "@/app/renderItem";
import { breakpoint, getClasses, s3File, uuid } from "@/app/utils";
import type { SizeType } from "@/types/size.d";
import {
  Button,
  DataTable,
  DataTableRow,
  Dropdown,
  Heading,
  IconButton,
  Modal,
  PaginationNav,
  Popover,
  PopoverContent,
  Section,
  Stack,
  Table,
  TableBatchAction,
  TableBatchActions,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableSelectAll,
  TableSelectRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from "@carbon/react";
import { Add, Close, Filter, TrashCan, Copy } from "@carbon/react/icons";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, {
  MouseEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

let timeout: NodeJS.Timeout;
let filterTimeout: NodeJS.Timeout;

// Stable default values to prevent re-renders
const EMPTY_ARRAY: any[] = [];
const EMPTY_OBJECT: Record<string, any> = {};
const NOOP = () => {};
const NOOP_ASYNC = async () => true;
const NOOP_ASYNC_STRING = async () => "";
const NOOP_LOADING = (value: boolean = false) => {};

function ListTable({
  id = "item.id",
  items = EMPTY_ARRAY,
  headers = EMPTY_ARRAY,
  imageSize = "md",
  limit = config.table.limit,
  total = 0,
  timestamp = 0,
  pages = 0,
  isLoading = false,
  isWaiting = false,
  setIsLoading = NOOP_LOADING,
  setIsWaiting = NOOP_LOADING,
  onItemClick = NOOP,
  onDelete = NOOP_ASYNC,
  onCopy = NOOP_ASYNC,
  onFiltering = NOOP_ASYNC_STRING,
  noAdd = false,
  noDelete = false,
  noCopy = false,
  noBatchActions = false,
  translations = EMPTY_OBJECT,
  actions = EMPTY_OBJECT,
  batchActions = EMPTY_OBJECT,
  itemActions = EMPTY_OBJECT,
  fields = EMPTY_OBJECT,
  filters = EMPTY_OBJECT,
  renders = EMPTY_OBJECT,
}: Readonly<{
  id?: string;
  items: any[];
  headers?: any[];
  imageSize: SizeType;
  limit: number;
  total?: number;
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
  noAdd?: boolean;
  noDelete?: boolean;
  noCopy?: boolean;
  noBatchActions?: boolean;
  translations?: Record<string, any>;
  fields?: Record<string, any>;
  actions?: Record<string, any>;
  batchActions: Record<string, any>;
  itemActions?: Record<string, any>;
  filters?: Record<string, any>;
  renders?: Record<string, any>;
}>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [clearField, setClearField] = useState<string | null>(null);

  // Memoize stable values
  const tableId = useMemo(() => uuid(), []);
  const tableRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize computed values
  const tableRows = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        id: !item.id ? item._id : item.id,
      })),
    [items]
  );

  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [deleteRows, setDeleteRows] = useState<any[]>([]);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [internalState, setInternalState] = useState<Record<string, any>>({});
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [filtering, setFiltering] = useState<boolean>(false);
  const [fromFilter, setFromFilter] = useState<boolean>(false);
  const [canDelete, setCanDelete] = useState<boolean>(!noDelete);
  const [canCopy, setCanCopy] = useState<boolean>(!noCopy);
  const [direction, setDirection] = useState(headers.map(() => "DESC"));
  const [sortable, setSortable] = useState(headers.map(() => false));
  const [allSelected, setAllSelected] = useState(false);
  const [fitTable, setFitTable] = useState(false);
  const [itemsShown, setItemsShown] = useState(config.table.shown);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);

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

  const tableSearchTranslate = useCallback(
    (id: string) => {
      if (id === "carbon.table.toolbar.search.placeholder") {
        return translations.filter;
      }
      if (id === "carbon.table.toolbar.search.label") {
        return translations.search;
      }

      return id;
    },
    [translations]
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
    [searchParams, pathname, replace, setIsLoading]
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
  }, [searchParams, pathname, replace, onFiltering, setIsLoading, setIsWaiting, getFilters]);

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

  useEffect(() => {
    if (!fromFilter && Object.keys(formState).length > 0) {
      setFromFilter(true);
    } else {
      if (fromFilter) {
        // We are gonna control idle state manually
        processFilters();
      }
    }
  }, [formState, fromFilter, setFiltering]);

  const classes = useMemo(
    () =>
      getClasses({
        "table-wrapper": true,
        "with-title": !!translations.title,
        "max-top": fitTable,
      }),
    [translations.title, fitTable]
  );

  const handleFilterRemove = useCallback((field: any, value: any) => {
    setClearField(field);
    return handleFilter(field, null);
  }, []);

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

  const handleFilterInternalState = useCallback(
    (field: string, value: any) => {
      onInternalStateHandler(field, value);
    },
    [onInternalStateHandler]
  );

  const handleFilterFormState = useCallback(
    (field: string, value: any) => {
      setFormState((prevState) => {
        const filterFormState = { ...prevState };
        delete filterFormState[field];

        if (value) {
          filterFormState[field] = value;
        } else {
          filterFormState[field] = null;

          if (fields?.search?.[field]?.deletes?.length > 0) {
            fields.search[field].deletes.forEach((deleteField: string) => {
              filterFormState[deleteField] = null;
            });
          }
        }
        return filterFormState;
      });
    },
    [fields]
  );

  const renderFilters = useCallback(() => {
    const filterFields = Object.keys(filters);

    const onCloseHandler = () => {
      setFiltersOpen(false);
    };

    if (filterFields.length > 0) {
      return (
        <Popover
          align={"bottom-right"}
          open={filtersOpen}
          isTabTip
          autoAlign
          onRequestClose={() => setFiltersOpen(false)}
        >
          <IconButton
            autoAlign
            label={translations.filter}
            kind={filtering ? "tertiary" : "ghost"}
            aria-expanded={filtersOpen}
            onClick={() => {
              setFiltersOpen(!filtersOpen);
            }}
          >
            <Filter />
          </IconButton>
          <PopoverContent className="cds--table-filters">
            {breakpoint("mobile") ? (
              <div className="cds--flex">
                <Section level={4}>
                  <Heading>{translations.filter}</Heading>
                </Section>
                <Close size={32} className="close" onClick={onCloseHandler} />
              </div>
            ) : null}
            <>
              {filterFields.map((filterField: string, index: number) => {
                return renderField({
                  ...filters[filterField],
                  key: "filter-" + index,
                  ready: !isLoading,
                  translations,
                  filters,
                  field: filterField,
                  formState,
                  internalState,
                  onFormStateHandler: handleFilterFormState,
                  onInternalStateHandler: handleFilterInternalState,
                  onInputHandler: handleFilter,
                  onRemoveHandler: handleFilterRemove,
                });
              })}
            </>
          </PopoverContent>
        </Popover>
      );
    }

    return null;
  }, [
    filters,
    filtersOpen,
    filtering,
    translations,
    fields,
    formState,
    internalState,
    isLoading,
    handleFilterFormState,
    handleFilterInternalState,
    handleFilter,
    handleFilterRemove,
  ]);

  const renderActions = useCallback(() => {
    return null;
  }, []);

  const renderBatchActions = useCallback(
    (batchActionProps: any, selectedRows: any) => {
      if (batchActions) {
        return Object.keys(batchActions).map((action, index) => (
          <Button
            key={`batch-action-${index}`}
            tabIndex={batchActionProps.shouldShowBatchActions ? -1 : 0}
            onClick={() => batchActions[action].onClick(selectedRows.map((row: any) => row.id))}
            renderIcon={batchActions[action].icon}
            kind={batchActions[action].kind || "primary"}
          >
            {batchActions[action].translations.title}
          </Button>
        ));
      }
      return null;
    },
    [batchActions]
  );

  const handleSearchChange = useCallback(
    (evt: any) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onTableSearch(evt.target.value);
      }, 300);
    },
    [onTableSearch]
  );

  const handleEscapeKey = useCallback((ev: React.KeyboardEvent) => {
    if (ev.key === "Escape") {
      setFiltersOpen(false);
    }
  }, []);

  return (
    <div className={classes} ref={tableRef} onKeyDown={handleEscapeKey}>
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
              <TableToolbar {...getToolbarProps()}>
                <TableToolbarContent>
                  <TableToolbarSearch
                    tabIndex={batchActionProps.shouldShowBatchActions ? -1 : 0}
                    translateWithId={tableSearchTranslate}
                    onChange={handleSearchChange}
                  />
                  {renderFilters()}
                  {renderActions()}
                  {!noAdd ? (
                    <Button
                      tabIndex={batchActionProps.shouldShowBatchActions ? -1 : 0}
                      onClick={tableAddNewHandler}
                      renderIcon={Add}
                      kind="primary"
                    >
                      {translations.add}
                    </Button>
                  ) : null}
                </TableToolbarContent>
                {!noBatchActions ? (
                  <TableBatchActions
                    {...batchActionProps}
                    translateWithId={tableBatchActionsTranslate}
                  >
                    {renderBatchActions(batchActionProps, selectedRows)}
                    {canDelete ? (
                      <TableBatchAction
                        tabIndex={batchActionProps.shouldShowBatchActions ? 0 : -1}
                        renderIcon={TrashCan}
                        onClick={() => tableDeleteHandler(selectedRows)}
                      >
                        {translations.delete}
                      </TableBatchAction>
                    ) : null}
                    {canCopy ? (
                      <TableBatchAction
                        tabIndex={batchActionProps.shouldShowBatchActions ? 0 : -1}
                        renderIcon={Copy}
                        onClick={() => tableCopyHandler(selectedRows)}
                      >
                        {translations.copy}
                      </TableBatchAction>
                    ) : null}
                  </TableBatchActions>
                ) : null}
              </TableToolbar>
              <Table data-id={tableId}>
                <TableHead>
                  <TableRow>
                    {!noBatchActions ? (
                      <TableSelectAll
                        {...getSelectionProps()}
                        id={`${id}-select-all`}
                        name={`${id}-select-all`}
                        onSelect={() => {
                          onSelectAllHandler(rows, selectRow);
                        }}
                      />
                    ) : null}
                    {headers.map((header, index) => {
                      return (
                        <TableHeader
                          className={`cell-${header.key}`}
                          key={`${id}-header-${index}`}
                          isSortHeader={sortable[index]}
                          isSortable={true}
                          sortDirection={direction[index]}
                          onFocus={() => tableRowSortableHandler(index)}
                          onBlur={() => tableRowSortableHandler(index)}
                          onClick={() => tableRowSortHandler(index)}
                        >
                          {header.header}
                        </TableHeader>
                      );
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, rowIndex) => (
                    <TableRow
                      key={`${id}-row-${rowIndex}`}
                      onClick={({ target }) => tableRowClickHandler(row.id, target as HTMLElement)}
                    >
                      {!noBatchActions ? (
                        <TableSelectRow
                          {...getSelectionProps({
                            row,
                            onChange: (evt: SyntheticEvent<HTMLInputElement>) => {
                              const currentSelectedRows = selectedRows.find(
                                (selectedRow) => selectedRow.id === row.id
                              )
                                ? selectedRows.filter((selectedRow) => selectedRow.id !== row.id)
                                : [...selectedRows, row];

                              if (
                                currentSelectedRows.length === 1 &&
                                tableRows.find((item) => item._id === currentSelectedRows[0].id)
                                  ?.default
                              ) {
                                setCanDelete(false);
                              } else {
                                setCanDelete(!noDelete);
                              }
                            },
                            checked: selectedRows.find((selectedRow) => selectedRow.id === row.id),
                            onClick: (event: MouseEvent) => {
                              const isSelected = !row.isSelected;

                              if (event.shiftKey && lastSelectedIndex !== null) {
                                const start = Math.min(lastSelectedIndex, rowIndex);
                                const end = Math.max(lastSelectedIndex, rowIndex);

                                for (let i = start; i <= end; i++) {
                                  if (rows[i].isSelected !== isSelected && rows[i].id !== row.id) {
                                    selectRow(rows[i].id);
                                  }
                                }
                              }
                              setLastSelectedIndex(rowIndex);
                            },
                          })}
                        />
                      ) : null}
                      {row.cells.map((cell, index) => (
                        <TableCell
                          className={`cell-${cell.id.split(":")[1]}`}
                          key={`${id}-row-${rowIndex}-cell-${index}`}
                        >
                          {renderCell(row, cell, tableRows[rowIndex])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {isLoading ? <Loader /> : null}
            </TableContainer>
          );
        }}
      </DataTable>

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
