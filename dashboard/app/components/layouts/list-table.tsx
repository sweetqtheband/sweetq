'use client';

import Loader from '@/app/(pages)/admin/loading';
import config from '@/app/config';
import { ACTIONS, IMAGE_SIZES, SORT } from '@/app/constants';
import useTableRenderComplete from '@/app/hooks/table';
import { renderField } from '@/app/render';
import { renderItem } from '@/app/renderItem';
import { getClasses, s3File, uuid } from '@/app/utils';
import type { SizeType } from '@/types/size.d';
import {
  Button,
  DataTable,
  DataTableRow,
  Dropdown,
  IconButton,
  Modal,
  PaginationNav,
  Popover,
  PopoverContent,
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
} from '@carbon/react';
import { Add, Filter, TrashCan } from '@carbon/react/icons';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

let timeout: NodeJS.Timeout;
let imageTimeout: NodeJS.Timeout;

export default function ListTable({
  id = 'item.id',
  items = [],
  headers = [],
  imageSize = 'md',
  limit = config.table.limit,
  total = 0,
  pages = 0,
  loading = false,
  onItemClick = () => {},
  onDelete = async () => true,
  translations = {},
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
  pages: number;
  loading: boolean;
  onItemClick?: (item: any) => void;
  onDelete?: (ids: string[]) => Promise<boolean>;
  translations?: Record<string, any>;
  fields?: Record<string, any>;
  filters?: Record<string, any>;
  renders?: Record<string, any>;
}>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const tableId = uuid();
  const tableRef = useRef<HTMLDivElement>(null);

  const tableRows = items.map((item) => ({
    ...item,
    id: !item.id ? item._id : item.id,
  }));

  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(loading);
  const [deleteRows, setDeleteRows] = useState<any[]>([]);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [internalState, setInternalState] = useState<Record<string, any>>({});
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [filtering, setFiltering] = useState<boolean>(false);

  const params = new URLSearchParams(searchParams);

  const paramFiltersObj = Object.fromEntries(
    params.entries().filter(([key]) => key.includes('filters'))
  );

  if (Object.keys(paramFiltersObj).length > 0) {
    Object.keys(paramFiltersObj).forEach((key: string) => {
      const filterName = key.match(/filters\[(.*)\]/)?.[1];
      if (filterName && !formState[filterName]) {
        setFormState({
          ...formState,
          [filterName]: paramFiltersObj[key].split(','),
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

  const onInternalStateHandler = (field: string, value: any) => {
    setInternalState({
      ...internalState,
      [field]: value,
    });
  };

  useTableRenderComplete(tableId, () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  });

  useEffect(() => {
    setFiltering(
      Object.keys(filters).reduce((isFiltering, filterName) => {
        if (internalState[filterName]) {
          if (
            Object.values(internalState[filterName]).filter((value) => value)
              .length
          ) {
            return true;
          }
        }
        return isFiltering;
      }, false) || Object.keys(paramFiltersObj).length > 0
    );
  }, [internalState, filters, paramFiltersObj]);

  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  const renderCell = (
    row: Record<string, any>,
    field: Record<string, any>,
    item: Record<string, any>
  ) => {
    if (field.value) {
      const fieldName = field.id.split(':')[1];

      const isImage = String(field.value).match(
        /\.(png|gif|jpg|jpeg|webp|svg)/i
      );

      const defaultValue =
        item.relations?.[fieldName]?.[translations.locale] || field.value;

      let value = translations.options?.[fieldName]
        ? translations.options?.[fieldName][field.value]
        : defaultValue;

      if (value?.startsWith('imgs')) {
        value = s3File('/' + value);
      }
      const image = () =>
        value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <Image
            src={value}
            alt={row.id}
            height={IMAGE_SIZES[imageSize]}
            width={IMAGE_SIZES[imageSize]}
            crossOrigin="anonymous"
          />
        ) : null;

      if (renders[fieldName]) {
        const func =
          typeof renders[fieldName] === 'function'
            ? renders[fieldName]
            : renders[fieldName].render;

        if (typeof func === 'function') {
          const render = func(fieldName, value, item);
          return render instanceof Array ? (
            <>
              {render.map((renderedItem, renderItemIndex) => (
                <div key={`render-${renderItemIndex}`}>
                  {renderItem(renderedItem)}
                </div>
              ))}
            </>
          ) : (
            renderItem(render)
          );
        }
      }

      return isImage ? image() : value;
    } else {
      return '-';
    }
  };

  const checkRowsForWindowSize = (rows: any[]) => {
    let rowsHeight = rows.length * 48;
    const maxHeight = window.innerHeight - 48 * 4;

    if (tableRef) {
      const tbody = tableRef.current?.querySelector('tbody');
      if (tbody) {
        rowsHeight = tbody.clientHeight;
      }
    }
    return rowsHeight > maxHeight;
  };

  const [direction, setDirection] = useState(headers.map(() => 'DESC'));
  const [sortable, setSortable] = useState(headers.map(() => false));
  const [allSelected, setAllSelected] = useState(false);
  const [fitTable, setFitTable] = useState(false);
  const [itemsShown, setItemsShown] = useState(config.table.shown);

  const tableRowClickHandler = (id: string | number, target: HTMLElement) => {
    if (
      !target.classList.contains('cds--checkbox') &&
      !target.classList.contains('cds--table-column-checkbox')
    ) {
      const row = tableRows.find((row) => row.id === id);
      onItemClick(row);
    }
  };

  const tableAddNewHandler = () => {
    onItemClick(ACTIONS.ADD);
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
      ...direction.map((d, i) =>
        i === index && direction[i] === 'DESC' ? 'ASC' : 'DESC'
      ),
    ];

    setDirection(dir);

    const params = new URLSearchParams(searchParams);

    params.set('sort', headers[index].key);
    params.set('sortDir', String(SORT[dir[index]]));

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
    if (id === 'carbon.table.batch.cancel') {
      return translations.cancel;
    }
    if (id === 'carbon.table.batch.selectAll') {
      return `${
        allSelected ? translations.unselectAll : translations.selectAll
      } (${totalCount})`;
    }
    if (id === 'carbon.table.batch.selectNone') {
      return translations.selectNone;
    }
    if (id === 'carbon.table.batch.item.selected') {
      return `${totalSelected} ${translations.selected.toLocaleLowerCase()}`;
    }
    if (id === 'carbon.table.batch.items.selected') {
      return `${totalSelected} ${translations.selecteds.toLocaleLowerCase()}`;
    }
    if (id === 'carbon.table.batch.actions') {
      return translations.actions;
    }
    if (id === 'carbon.table.batch.action') {
      return translations.action;
    }
    if (id === 'carbon.table.batch.clear') {
      return translations.clear;
    }
    if (id === 'carbon.table.batch.save') {
      return translations.save;
    }
    return id;
  };

  const tableSearchTranslate = (id: string) => {
    if (id === 'carbon.table.toolbar.search.placeholder') {
      return translations.filter;
    }
    if (id === 'carbon.table.toolbar.search.label') {
      return translations.search;
    }

    return id;
  };

  const onTableSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);

    setIsLoading(true);

    if (value) {
      params.set('query', value);
      params.set('page', '0');
    } else {
      params.delete('query');
      params.delete('page');
    }

    replace(`${pathname}?${params.toString()}`);
  };

  const onSelectAllHandler = (
    rows: DataTableRow<any[]>[],
    selectRow: Function
  ) => {
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

    params.delete('page');
    params.set('limit', String(selectedItem?.id));

    setSelectedLimit(limitItems.find((item) => item.id === selectedItem?.id));
    replace(`${pathname}?${params.toString()}`);
  };

  const onPaginationChangeHandler = (page: number) => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams);

    params.set('page', String(page));

    replace(`${pathname}?${params.toString()}`);
  };
  useEffect(() => {
    if (isLoading) {
      clearTimeout(imageTimeout);
      imageTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [isLoading]);

  useEffect(() => {
    const resizeHandler = () => {
      setFitTable(checkRowsForWindowSize(tableRows));
      const max = Math.floor(window.innerWidth / 48 - 5);
      setItemsShown(max);
    };

    window.addEventListener('resize', resizeHandler);

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 10);

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [tableRef, tableRows]);
  const classes = getClasses({
    'table-wrapper': true,
    'with-title': !!translations.title,
    'max-top': fitTable,
  });

  const limitItems = [10, 25, 50, 100].map((item) => ({
    id: item,
    text: item,
  }));

  const [selectedLimit, setSelectedLimit] = useState(
    limitItems.find((item) => item.id === limit)
  );

  const defaultCell = headers.find((header) => header.default);

  const renderFilters = () => {
    const filterFields = Object.keys(filters);

    if (filterFields.length > 0) {
      return (
        <Popover
          align={'bottom-right'}
          open={filtersOpen}
          isTabTip
          autoAlign
          onRequestClose={() => setFiltersOpen(false)}
        >
          <IconButton
            label={translations.filter}
            kind={filtering ? 'tertiary' : 'ghost'}
            aria-expanded={filtersOpen}
            onClick={() => {
              setFiltersOpen(!filtersOpen);
            }}
          >
            <Filter />
          </IconButton>
          <PopoverContent>
            {filterFields.map((field: string) => {
              const handleFilter = (field: string, value: any) => {
                setIsLoading(true);
                const params = new URLSearchParams(searchParams);
                if (value instanceof Array) {
                  if (value.length > 0) {
                    params.set(`filters[${field}]`, value.join(','));
                  } else {
                    params.delete(`filters[${field}]`);
                  }
                } else if (value) {
                  params.set(`filters[${field}]`, value);
                } else {
                  params.delete(`filters[${field}]`);
                }

                replace(`${pathname}?${params.toString()}`);

                const currentState = {
                  ...formState,
                };

                delete currentState[field];

                if (value) {
                  setFormState({
                    ...currentState,
                    [field]: value,
                  });
                } else {
                  setFormState({
                    ...currentState,
                  });
                }
              };

              const handleFilterInternalState = (field: string, value: any) => {
                onInternalStateHandler(field, value);
                handleFilter(field, null);
              };

              return (
                <div key={`filter-${field}`}>
                  {renderField({
                    ...filters[field],
                    translations,
                    field,
                    formState,
                    internalState,
                    onInternalStateHandler: handleFilterInternalState,
                    onInputHandler: handleFilter,
                  })}
                </div>
              );
            })}
          </PopoverContent>
        </Popover>
      );
    }

    return null;
  };

  let debounce: any = null;

  return (
    <div
      className={classes}
      ref={tableRef}
      onKeyDown={(ev) => ev.key === 'Escape' && setFiltersOpen(false)}
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
                  <Button
                    tabIndex={batchActionProps.shouldShowBatchActions ? -1 : 0}
                    onClick={tableAddNewHandler}
                    renderIcon={Add}
                    kind="primary"
                  >
                    {translations.add}
                  </Button>
                </TableToolbarContent>
                <TableBatchActions
                  {...batchActionProps}
                  translateWithId={tableBatchActionsTranslate}
                >
                  <TableBatchAction
                    tabIndex={batchActionProps.shouldShowBatchActions ? 0 : -1}
                    renderIcon={TrashCan}
                    onClick={() => tableDeleteHandler(selectedRows)}
                  >
                    {translations.delete}
                  </TableBatchAction>
                </TableBatchActions>
              </TableToolbar>
              <Table data-id={tableId}>
                <TableHead>
                  <TableRow>
                    <TableSelectAll
                      {...getSelectionProps()}
                      id={`${id}-select-all`}
                      name={`${id}-select-all`}
                      onSelect={() => {
                        onSelectAllHandler(rows, selectRow);
                      }}
                    />
                    {headers.map((header, index) => (
                      <TableHeader
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
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, rowIndex) => (
                    <TableRow
                      key={`${id}-row-${rowIndex}`}
                      onClick={({ target }) =>
                        tableRowClickHandler(row.id, target as HTMLElement)
                      }
                    >
                      <TableSelectRow
                        {...getSelectionProps({
                          row,
                        })}
                      />
                      {row.cells.map((cell, index) => (
                        <TableCell key={`${id}-row-${rowIndex}-cell-${index}`}>
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
          onChange={onPaginationChangeHandler}
        />

        <Dropdown
          titleText={null}
          id="limit"
          label={translations.fields.limit}
          items={limitItems}
          selectedItem={selectedLimit ?? undefined}
          itemToString={(selectedLimit) =>
            selectedLimit ? String(selectedLimit?.text) : ''
          }
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
          deleteRows.length === 1
            ? translations.confirmDelete
            : translations.confirmDeleteSelected
        }
        closeButtonLabel={translations.close}
        primaryButtonText={translations.delete}
        secondaryButtonText={translations.cancel}
        modalLabel={deleteRows
          .map(
            (row) =>
              row.cells.find(
                (cell: Record<string, any>) =>
                  cell.info.header === defaultCell.key
              ).value
          )
          .join(', ')}
      />
    </div>
  );
}
