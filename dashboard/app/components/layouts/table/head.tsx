"use client";

import type { DataTableRow } from "@carbon/react";
import { TableHead, TableHeader, TableRow, TableSelectAll } from "@carbon/react";
import React, { useCallback } from "react";

const EMPTY_ARRAY: any[] = [];
const NOOP = () => {};

interface ListTableHeadProps {
  id?: string;
  headers?: any[];
  noBatchActions?: boolean;
  sortable?: boolean[];
  direction?: string[];
  getSelectionProps?: (props?: any) => any;
  tableRowSortableHandler?: (index: number) => void;
  tableRowSortHandler?: (index: number) => void;
  onSelectAllHandler?: (rows: DataTableRow<any[]>[], selectRow: Function) => void;
  rows?: DataTableRow<any[]>[];
  selectRow?: Function;
}

function ListTableHead({
  id = "item.id",
  headers = EMPTY_ARRAY,
  noBatchActions = false,
  sortable = [],
  direction = [],
  getSelectionProps = NOOP,
  tableRowSortableHandler = NOOP,
  tableRowSortHandler = NOOP,
  onSelectAllHandler = NOOP,
  rows = EMPTY_ARRAY,
  selectRow = NOOP,
}: ListTableHeadProps) {
  const handleSelectAll = useCallback(() => {
    onSelectAllHandler(rows, selectRow);
  }, [rows, selectRow, onSelectAllHandler]);

  return (
    <TableHead>
      <TableRow>
        {!noBatchActions ? (
          <TableSelectAll
            {...getSelectionProps()}
            id={`${id}-select-all`}
            name={`${id}-select-all`}
            onSelect={handleSelectAll}
          />
        ) : null}
        {headers.map((header, index) => (
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
        ))}
      </TableRow>
    </TableHead>
  );
}

export default React.memo(ListTableHead);
