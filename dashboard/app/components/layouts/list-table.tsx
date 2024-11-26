'use client';

import config from '@/app/config';
import { ACTIONS, IMAGE_SIZES, SIZES, SORT } from '@/app/constants';
import { getClasses } from '@/app/utils';
import type { SizeType } from '@/types/size.d';
import {
  Button,
  DataTable,
  DataTableRow,
  Dropdown,
  PaginationNav,
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
} from '@carbon/react';
import { Add, TrashCan } from '@carbon/react/icons';
import { clear } from 'console';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

let timeout: NodeJS.Timeout;

export default function ListTable({
  id = 'item.id',
  items = [],
  headers = [],
  imageSize = 'md',
  total = 0,
  limit = config.table.limit,
  pages = 0,
  onItemClick = () => {},
  onDelete = async () => true,
  translations = {},
  fields = {},
}: Readonly<{
  id?: string;
  items: any[];
  imageSize: SizeType;
  headers?: any[];
  total: number;
  limit: number;
  pages: number;
  onItemClick?: (item: any) => void;
  onDelete?: (ids: string[]) => Promise<boolean>;
  translations?: Record<string, any>;
  fields?: Record<string, any>;
}>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const tableRef = useRef<HTMLDivElement>(null);

  const rows = items.map((item) => ({
    ...item,
    id: !item.id ? item._id : item.id,
  }));

  const renderCell = (
    item: Record<string, any>,
    field: Record<string, any>
  ) => {
    if (field.value) {
      const fieldName = field.id.split(':')[1];
      const isImage = field.value.match(/\.(png|gif|jpg|jpeg|webp|svg)$/i);

      const value = translations.options?.[fieldName]
        ? translations.options?.[fieldName][field.value]
        : field.value;

      const image = () => (
        <Image
          src={value}
          alt={item.id}
          height={IMAGE_SIZES[imageSize]}
          width={IMAGE_SIZES[imageSize]}
        />
      );

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

  const tableRowClickHandler = (id: string | number, target: HTMLElement) => {
    if (
      !target.classList.contains('cds--checkbox') &&
      !target.classList.contains('cds--table-column-checkbox')
    ) {
      const row = rows.find((row) => row.id === id);
      onItemClick(row);
    }
  };

  const tableAddNewHandler = () => {
    onItemClick(ACTIONS.ADD);
  };

  const tableDeleteHandler = (selectedRows: any[]) => () => {
    onDelete(selectedRows.map((row) => row.id));
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

  const onLimitChangeHandler = ({ selectedItem }) => {
    const params = new URLSearchParams(searchParams);

    params.delete('page');
    params.set('limit', String(selectedItem?.id));

    setSelectedLimit(limitItems.find((item) => item.id === selectedItem?.id));
    replace(`${pathname}?${params.toString()}`);
  };

  const onPaginationChangeHandler = (page: number) => {
    const params = new URLSearchParams(searchParams);

    params.set('page', String(page));

    replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const resizeHandler = () => {
      setFitTable(checkRowsForWindowSize(rows));
    };

    window.addEventListener('resize', resizeHandler);

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 10);

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [tableRef, rows]);
  const classes = getClasses({
    'table-wrapper': true,
    'max-top': fitTable,
  });

  const limitItems = [10, 25, 50, 100].map((item) => ({
    id: item,
    text: item,
  }));

  const [selectedLimit, setSelectedLimit] = useState(
    limitItems.find((item) => item.id === limit)
  );

  return (
    <div className={classes} ref={tableRef}>
      <DataTable headers={headers} rows={rows} stickyHeader={true}>
        {({
          rows,
          headers,
          getBatchActionProps,
          getTableContainerProps,
          getToolbarProps,
          getSelectionProps,
          selectRow,
          selectAll,
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
            <TableContainer {...getTableContainerProps()}>
              <TableToolbar {...getToolbarProps()}>
                <TableBatchActions
                  {...batchActionProps}
                  translateWithId={tableBatchActionsTranslate}
                >
                  <TableBatchAction
                    tabIndex={batchActionProps.shouldShowBatchActions ? 0 : -1}
                    renderIcon={TrashCan}
                    onClick={tableDeleteHandler(selectedRows)}
                  >
                    {translations.delete}
                  </TableBatchAction>
                </TableBatchActions>
                <TableToolbarContent>
                  <Button
                    tabIndex={batchActionProps.shouldShowBatchActions ? -1 : 0}
                    onClick={tableAddNewHandler}
                    renderIcon={Add}
                    kind="primary"
                  >
                    {translations.add}
                  </Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table>
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
                          {renderCell(row, cell)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          );
        }}
      </DataTable>

      <Stack gap={4} orientation="horizontal" className="cds-table--pagination">
        <PaginationNav
          itemsShown={config.table.limit}
          totalItems={pages}
          onChange={onPaginationChangeHandler}
        />

        <Dropdown
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
    </div>
  );
}
