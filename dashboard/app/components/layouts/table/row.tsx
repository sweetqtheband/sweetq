"use client";

import type { DataTableRow } from "@carbon/react";
import { TableCell, TableRow, TableSelectRow } from "@carbon/react";
import React, { MouseEvent, SyntheticEvent } from "react";

interface ListTableRowProps {
  readonly row: DataTableRow<any[]>;
  readonly rowIndex: number;
  readonly id: string;
  readonly noBatchActions?: boolean;
  readonly selectedRows: DataTableRow<any[]>[];
  readonly tableRows: any[];
  readonly getSelectionProps: (props?: any) => any;
  readonly handleRowSelection: (
    row: DataTableRow<any[]>,
    rowIndex: number
  ) => (evt: SyntheticEvent<HTMLInputElement>) => void;
  readonly handleRowCheckboxClick: (
    event: MouseEvent,
    rowIndex: number,
    row: DataTableRow<any[]>
  ) => void;
  readonly tableRowClickHandler: (id: string | number, target: HTMLElement) => void;
  readonly renderCell: (row: any, cell: any, item: any) => any;
  readonly canSort?: boolean;
  readonly isDraggable?: boolean;
}

function ListTableRow({
  row,
  rowIndex,
  id,
  noBatchActions = false,
  selectedRows,
  tableRows,
  getSelectionProps,
  handleRowSelection,
  handleRowCheckboxClick,
  tableRowClickHandler,
  renderCell,
  canSort = false,
  isDraggable = false,
}: ListTableRowProps) {
  const rowContent = (
    <>
      {!noBatchActions ? (
        <TableSelectRow
          {...getSelectionProps({
            row,
            onChange: handleRowSelection(row, rowIndex),
            checked: selectedRows.find((selectedRow) => selectedRow.id === row.id),
            onClick: (event: MouseEvent) => handleRowCheckboxClick(event, rowIndex, row),
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
    </>
  );

  if (isDraggable) {
    return rowContent;
  }

  return (
    <TableRow
      key={`${id}-row-${rowIndex}`}
      onClick={({ target }) => tableRowClickHandler(row.id, target as HTMLElement)}
      data-testid={`table-row-${rowIndex}`}
    >
      {rowContent}
    </TableRow>
  );
}

export default React.memo(ListTableRow);
