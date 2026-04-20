"use client";

import type { DataTableRow } from "@carbon/react";
import { TableBody } from "@carbon/react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import React, { MouseEvent, SyntheticEvent, useCallback } from "react";
import ListTableRow from "./row";
import { DraggableRow } from "./draggable-row";

const EMPTY_ARRAY: any[] = [];
const NOOP = () => {};

interface ListTableBodyProps {
  id?: string;
  rows?: DataTableRow<any[]>[];
  noBatchActions?: boolean;
  noDelete?: boolean;
  getSelectionProps?: (props?: any) => any;
  selectRow?: (rowId: string) => void;
  selectedRows?: DataTableRow<any[]>[];
  tableRows?: any[];
  lastSelectedIndex?: number | null;
  setLastSelectedIndex?: (index: number | null) => void;
  setCanDelete?: (value: boolean) => void;
  tableRowClickHandler?: (id: string | number, target: HTMLElement) => void;
  renderCell?: (row: any, cell: any, item: any) => any;
  canSort?: boolean;
}

function ListTableBody({
  id = "item.id",
  rows = EMPTY_ARRAY,
  noBatchActions = false,
  noDelete = false,
  getSelectionProps = NOOP,
  selectRow = NOOP,
  selectedRows = EMPTY_ARRAY,
  tableRows = EMPTY_ARRAY,
  lastSelectedIndex = null,
  setLastSelectedIndex = NOOP,
  setCanDelete = NOOP,
  tableRowClickHandler = NOOP,
  renderCell = NOOP,
  canSort = false,
}: Readonly<ListTableBodyProps>) {
  const handleRowSelection = useCallback(
    (row: DataTableRow<any[]>, rowIndex: number) => {
      return (evt: SyntheticEvent<HTMLInputElement>) => {
        const currentSelectedRows = selectedRows.find((selectedRow) => selectedRow.id === row.id)
          ? selectedRows.filter((selectedRow) => selectedRow.id !== row.id)
          : [...selectedRows, row];

        if (
          currentSelectedRows.length === 1 &&
          tableRows.find((item) => item._id === currentSelectedRows[0].id)?.default
        ) {
          setCanDelete(false);
        } else {
          setCanDelete(!noDelete);
        }
      };
    },
    [selectedRows, tableRows, noDelete, setCanDelete]
  );

  const handleRowCheckboxClick = useCallback(
    (event: MouseEvent, rowIndex: number, row: DataTableRow<any[]>) => {
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
    [lastSelectedIndex, rows, selectRow, setLastSelectedIndex]
  );

  return (
    <TableBody>
      {canSort ? (
        <SortableContext items={rows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
          {rows.map((row, rowIndex) => (
            <DraggableRow
              key={`${id}-row-${rowIndex}`}
              id={row.id}
              onClick={(event: any) => tableRowClickHandler(row.id, event.target as HTMLElement)}
              data-testid={`table-row-${rowIndex}`}
            >
              <ListTableRow
                row={row}
                rowIndex={rowIndex}
                id={id}
                noBatchActions={noBatchActions}
                selectedRows={selectedRows}
                tableRows={tableRows}
                getSelectionProps={getSelectionProps}
                handleRowSelection={handleRowSelection}
                handleRowCheckboxClick={handleRowCheckboxClick}
                tableRowClickHandler={tableRowClickHandler}
                renderCell={renderCell}
                canSort={canSort}
                isDraggable={true}
              />
            </DraggableRow>
          ))}
        </SortableContext>
      ) : (
        rows.map((row, rowIndex) => (
          <ListTableRow
            key={`${id}-row-${rowIndex}`}
            row={row}
            rowIndex={rowIndex}
            id={id}
            noBatchActions={noBatchActions}
            selectedRows={selectedRows}
            tableRows={tableRows}
            getSelectionProps={getSelectionProps}
            handleRowSelection={handleRowSelection}
            handleRowCheckboxClick={handleRowCheckboxClick}
            tableRowClickHandler={tableRowClickHandler}
            renderCell={renderCell}
            canSort={canSort}
            isDraggable={false}
          />
        ))
      )}
    </TableBody>
  );
}

export default React.memo(ListTableBody);
