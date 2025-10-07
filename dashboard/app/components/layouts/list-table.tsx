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
import { use, useEffect, useRef, useState } from "react";

let timeout: NodeJS.Timeout;
let imageTimeout: NodeJS.Timeout;

export default function ListTable({
  id = "item.id",
  items = [],
  headers = [],
  imageSize = "md",
  limit = config.table.limit,
  total = 0,
  timestamp = 0,
  pages = 0,
  isLoading = false,
  isWaiting = false,
  setIsLoading = (value = false) => {},
  setIsWaiting = (value = false) => {},
  onItemClick = () => {},
  onDelete = async () => true,
  onCopy = async () => true,
  noAdd = false,
  noDelete = false,
  noCopy = false,
  noBatchActions = false,
  translations = {},
  actions = {},
  batchActions = {},
  itemActions = {},
  fields = {},
  filters = {},
  renders = {},
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

  const tableId = uuid();
  const tableRef = useRef<HTMLDivElement>(null);

  const tableRows = items.map((item) => ({
    ...item,
    id: !item.id ? item._id : item.id,
  }));

  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [deleteRows, setDeleteRows] = useState<any[]>([]);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [internalState, setInternalState] = useState<Record<string, any>>({});
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [filtering, setFiltering] = useState<boolean>(false);

  const params = new URLSearchParams(searchParams);

  const paramFiltersObj = Object.fromEntries(
    params.entries().filter(([key]) => key.includes("filters"))
  );

  if (Object.keys(paramFiltersObj).length > 0) {
    Object.keys(paramFiltersObj).forEach((key: string) => {
      const filterName = key.match(/filters\[(.*)\]/)?.[1];
      if (filterName && !formState[filterName]) {
        setFormState({
          ...formState,
          [filterName]: paramFiltersObj[key].split(","),
        });
      }
    });
  } else {
    const currentFormState = { ...formState };
    let setForm = false;
    Object.keys(filters).forEach((filterName) => {
      if (currentFormState[filterName]) {
        delete currentFormState[filterName];
        setForm = true;
      }
    });

    if (setForm) {
      setFormState(currentFormState);
    }
  }

  const onInternalStateHandler = (stateFields: string | string[], value: any) => {
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
  };
  useEffect(() => {
    if (timestamp) {
      setIsWaiting(false);
    }
  }, [timestamp]);

  useTableRenderComplete(tableId, () => {
    setTimeout(() => {
      if (!isWaiting) {
        setIsLoading(false);
      }
    }, 300);
  });

  useEffect(() => {
    setFiltering(
      Object.keys(filters).reduce((isFiltering, filterName) => {
        if (internalState[filterName]) {
          if (Object.values(internalState[filterName]).filter((value) => value).length) {
            return true;
          }
        }
        return isFiltering;
      }, false) || Object.keys(paramFiltersObj).length > 0
    );
  }, [internalState, filters, paramFiltersObj]);

  const renderCell = (
    row: Record<string, any>,
    field: Record<string, any>,
    item: Record<string, any>
  ) => {
    if (field.value) {
      const fieldName = field.id.split(":")[1];

      const isImage = String(field.value).match(/\.(png|gif|jpg|jpeg|webp|svg)/i);

      const defaultValue = item?.relations?.[fieldName]?.[translations.locale] || field.value;

      let value = translations.options?.[fieldName]
        ? translations.options?.[fieldName][field.value]
        : defaultValue;

      if (renders[fieldName]) {
        const func =
          typeof renders[fieldName] === "function" ? renders[fieldName] : renders[fieldName].render;

        if (typeof func === "function") {
          const render = func(fieldName, value, item);
          return render instanceof Array ? (
            <>
              {render.map((renderedItem, renderItemIndex) => (
                <div key={`render-${renderItemIndex}`}>{renderItem(renderedItem, itemActions)}</div>
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
  };

  const checkRowsForWindowSize = (rows: any[]) => {
    let rowsHeight = rows.length * 48;
    const maxHeight = window.innerHeight - 48 * 4;

    if (tableRef) {
      const tbody = tableRef.current?.querySelector("tbody");
      if (tbody) {
        rowsHeight = tbody.clientHeight;
      }
    }
    return rowsHeight > maxHeight;
  };

  const [direction, setDirection] = useState(headers.map(() => "DESC"));
  const [sortable, setSortable] = useState(headers.map(() => false));
  const [allSelected, setAllSelected] = useState(false);
  const [fitTable, setFitTable] = useState(false);
  const [itemsShown, setItemsShown] = useState(config.table.shown);

  const tableRowClickHandler = (id: string | number, target: HTMLElement) => {
    if (
      !target.classList.contains("cds--checkbox") &&
      !target.classList.contains("cds--table-column-checkbox")
    ) {
      const row = tableRows.find((row) => row.id === id);
      onItemClick(row);
    }
  };

  const tableAddNewHandler = () => {
    onItemClick(ACTIONS.ADD);
  };

  const tableCopyHandler = (selectedRows: any[]) => {
    selectedRows.forEach((row) => {
      onCopy(items.find((item) => item._id === row.id));
    });
  };

  const tableDeleteHandler = (selectedRows: any[]) => {
    if (!deleteOpen) {
      setDeleteOpen(true);
      setDeleteRows(selectedRows);
    } else {
      onDelete(selectedRows.map((row) => row.id));
      setDeleteOpen(false);
    }
  };

  const tableDeleteClear = () => {
    setDeleteOpen(false);
    setDeleteRows([]);
  };

  const tableRowSortHandler = (index: number) => {
    const dir = [
      ...direction.map((d, i) => (i === index && direction[i] === "DESC" ? "ASC" : "DESC")),
    ];

    setDirection(dir);

    const params = new URLSearchParams(searchParams);

    params.set("sort", headers[index].key);
    params.set("sortDir", String(SORT[dir[index]]));

    replace(`${pathname}?${params.toString()}`);
  };

  const tableRowSortableHandler = (index: number) => {
    setSortable(sortable.map((dir, i) => (i === index ? !dir : dir)));
  };

  const tableBatchActionsTranslate = (
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
  };

  const tableSearchTranslate = (id: string) => {
    if (id === "carbon.table.toolbar.search.placeholder") {
      return translations.filter;
    }
    if (id === "carbon.table.toolbar.search.label") {
      return translations.search;
    }

    return id;
  };

  const onTableSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);

    setIsLoading(true);

    if (value) {
      params.set("query", value);
      params.set("page", "0");
    } else {
      params.delete("query");
      params.delete("page");
    }

    replace(`${pathname}?${params.toString()}`);
  };

  const onSelectAllHandler = (rows: DataTableRow<any[]>[], selectRow: Function) => {
    if (!allSelected) {
      rows.forEach((row) => {
        if (!row.isSelected) {
          selectRow(row.id);
        }
      });
      setAllSelected(true);
    } else {
      rows.forEach((row) => {
        selectRow(row.id);
      });
      setAllSelected(false);
    }
  };

  const onLimitChangeHandler = ({ selectedItem }: any) => {
    const params = new URLSearchParams(searchParams);

    params.delete("page");
    params.set("limit", String(selectedItem?.id));

    setSelectedLimit(limitItems.find((item) => item.id === selectedItem?.id));
    setIsLoading(true);
    setIsWaiting(true);

    replace(`${pathname}?${params.toString()}`);
  };

  const onPaginationChangeHandler = (page: number) => {
    setIsLoading(true);
    setIsWaiting(true);
    const params = new URLSearchParams(searchParams);

    params.set("page", String(page));

    replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const resizeHandler = () => {
      setFitTable(checkRowsForWindowSize(tableRows));
      const max = Math.floor(window.innerWidth / 48 - 5);
      setItemsShown(max);
    };

    window.addEventListener("resize", resizeHandler);

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 10);

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [tableRef, tableRows]);
  const classes = getClasses({
    "table-wrapper": true,
    "with-title": !!translations.title,
    "max-top": fitTable,
  });

  const limitItems = [10, 25, 50, 100, 200, 500].map((item) => ({
    id: item,
    text: item,
  }));

  const [selectedLimit, setSelectedLimit] = useState(limitItems.find((item) => item.id === limit));

  const defaultCell = headers.find((header) => header.default);

  const renderFilters = () => {
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
            {filterFields.map((filterField: string, index: number) => {
              const handleFilterRemove = (field: any, value: any) => {
                setClearField(field);
                return handleFilter(field, null);
              };
              const handleFilter = (field: any, value: any) => {
                const useField = field instanceof Array ? field[0] : field;

                if (clearField && useField !== clearField) {
                  return;
                }

                setIsLoading(true);
                setIsWaiting(true);
                const params = new URLSearchParams(searchParams);

                params.delete("page");

                let isClear = false;

                if (value instanceof Array) {
                  if (value.length > 0) {
                    params.set(`filters[${useField}]`, value.join(","));
                  } else {
                    params.delete(`filters[${useField}]`);
                    if (fields?.search?.[useField]?.deletes?.length > 0) {
                      fields.search[useField].deletes.forEach((deleteField: string) => {
                        params.delete(`filters[${deleteField}]`);
                      });
                    }
                  }
                  isClear = true;
                } else if (value) {
                  params.set(`filters[${useField}]`, value);
                } else {
                  params.delete(`filters[${useField}]`);

                  if (fields?.search?.[useField]?.deletes?.length > 0) {
                    fields.search[useField].deletes.forEach((deleteField: string) => {
                      params.delete(`filters[${deleteField}]`);
                    });
                  }
                  isClear = true;
                }

                let newPath = pathname;

                if (params.size > 0) {
                  newPath += `?${params.toString()}`;
                }

                replace(newPath);
              };

              const handleFilterInternalState = (field: string, value: any) => {
                onInternalStateHandler(field, value);
                handleFilter(field, null);
              };

              const handleFilterFormState = (field: string, value: any) => {
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
              };

              return renderField({
                ...filters[filterField],
                key: "filter-" + index,
                ready: !isLoading,
                translations,
                field: filterField,
                formState,
                internalState,
                onFormStateHandler: handleFilterFormState,
                onInternalStateHandler: handleFilterInternalState,
                onInputHandler: handleFilter,
                onRemoveHandler: handleFilterRemove,
              });
            })}
          </PopoverContent>
        </Popover>
      );
    }

    return null;
  };

  const renderActions = () => {
    return null;
  };

  const renderBatchActions = (batchActionProps: any, selectedRows: any) => {
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
  };

  let debounce: any = null;

  return (
    <div
      className={classes}
      ref={tableRef}
      onKeyDown={(ev) => ev.key === "Escape" && setFiltersOpen(false)}
    >
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
                    onChange={(evt: any) => {
                      clearTimeout(debounce);
                      debounce = setTimeout(() => {
                        onTableSearch(evt.target.value);
                      }, 300);
                    }}
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
                    {!noDelete ? (
                      <TableBatchAction
                        tabIndex={batchActionProps.shouldShowBatchActions ? 0 : -1}
                        renderIcon={TrashCan}
                        onClick={() => tableDeleteHandler(selectedRows)}
                      >
                        {translations.delete}
                      </TableBatchAction>
                    ) : null}
                    {!noDelete ? (
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
