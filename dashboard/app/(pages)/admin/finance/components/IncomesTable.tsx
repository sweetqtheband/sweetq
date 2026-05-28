import React, { useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Incomes } from "@/types/income";
import {
  DataTable,
  DataTableRow,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableBatchActions,
  TableBatchAction,
  TableSelectAll,
  TableSelectRow,
  Button,
  Modal,
  PaginationNav,
  Dropdown,
  Stack,
} from "@carbon/react";
import { Add, TrashCan } from "@carbon/react/icons";
import { useToast } from "@/app/context/ToastContext";

interface IncomesTableProps {
  incomes: Incomes[];
  onRowClick: (income: Incomes) => void;
  onAddClick?: () => void;
  onDelete?: (incomeIds: string[]) => Promise<void>;
  isLoading?: boolean;
  isWaiting?: boolean;
  setIsLoading?: (value: boolean) => void;
  setIsWaiting?: (value: boolean) => void;
  translations?: {
    name?: string;
    source?: string;
    amount?: string;
    date?: string;
    concept?: string;
    add?: string;
    detail?: string;
    delete?: string;
    deleteConfirm?: string;
    cancel?: string;
    success?: string;
    deleteSuccess?: string;
    error?: string;
    deleteError?: string;
    limit?: string;
  };
}

/**
 * Tabla de Ingresos con selección por checkbox y acciones por lotes
 */
export const IncomesTable: React.FC<IncomesTableProps> = ({
  incomes,
  onRowClick,
  onAddClick,
  onDelete,
  isLoading = false,
  isWaiting = false,
  setIsLoading = () => {},
  setIsWaiting = () => {},
  translations = {},
}) => {
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const {
    name = "Nombre",
    source = "Fuente",
    amount = "Monto",
    date = "Fecha",
    concept = "Concepto",
    add = "Añadir Ingreso",
    delete: deleteLabel = "Eliminar",
    deleteConfirm = "¿Estás seguro de que deseas eliminar los ingresos seleccionados?",
    cancel = "Cancelar",
    success = "Éxito",
    deleteSuccess = "Ingresos eliminados correctamente",
    error = "Error",
    deleteError = "Error al eliminar",
    limit: limitLabel = "Límite",
  } = translations;

  // Get page and limit from searchParams, with defaults
  const currentPageParam = useMemo(() => parseInt(searchParams.get("page") || "1"), [searchParams]);
  const limitParam = useMemo(() => parseInt(searchParams.get("limit") || "25"), [searchParams]);

  // Limit options: 10, 25, 50, 100
  const limitItems = useMemo(
    () =>
      [10, 25, 50, 100].map((item) => ({
        id: item,
        text: item,
      })),
    []
  );

  const [selectedRows, setSelectedRows] = useState<DataTableRow<any[]>[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState(
    limitItems.find((item) => item.id === limitParam)
  );

  const rows = useMemo(
    () =>
      incomes.map((income, index) => ({
        id: String(income._id || index),
        ...income,
      })),
    [incomes]
  );

  // Pagination calculation
  const paginatedRows = useMemo(() => {
    const start = (currentPageParam - 1) * limitParam;
    const end = start + limitParam;
    return rows.slice(start, end);
  }, [rows, currentPageParam, limitParam]);

  const totalItems = rows.length;

  const handleDeleteClick = useCallback(() => {
    setIsDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!onDelete || selectedRows.length === 0) return;

    setIsDeleting(true);
    try {
      const incomeIds = selectedRows.map((row) => row.id);
      await onDelete(incomeIds);
      setSelectedRows([]);
      addToast({
        title: success,
        subtitle: deleteSuccess,
        kind: "success",
      });
    } catch (err: any) {
      addToast({
        title: error,
        subtitle: `${deleteError}: ${err?.message}`,
        kind: "error",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setIsWaiting(false);
    }
  }, [selectedRows, onDelete, addToast, success, deleteSuccess, error, deleteError, setIsWaiting]);

  const handleRowClick = useCallback(
    (row: DataTableRow<any[]>) => {
      onRowClick(row as any);
    },
    [onRowClick]
  );

  const handleLimitChange = useCallback(
    ({ selectedItem }: any) => {
      const params = new URLSearchParams(searchParams);
      params.set("limit", String(selectedItem?.id));
      params.delete("page");
      setSelectedLimit(limitItems.find((item) => item.id === selectedItem?.id));
      setIsLoading(true);
      setIsWaiting(true);
      replace(`${pathname}?${params.toString()}`);
    },
    [limitItems, searchParams, pathname, replace, setIsLoading, setIsWaiting]
  );

  const handlePaginationChange = useCallback(
    (page: number) => {
      setIsLoading(true);
      setIsWaiting(true);
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      replace(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, replace, setIsLoading, setIsWaiting]
  );

  return (
    <>
      <DataTable rows={paginatedRows} headers={[{ key: name, header: name }]}>
        {({
          rows: dataTableRows,
          headers: dataTableHeaders,
          getHeaderProps,
          getRowProps,
          getSelectionProps,
          getBatchActionProps,
          selectedRows: selected,
        }) => (
          <TableContainer>
            <TableToolbar>
              <TableToolbarContent>
                {selected.length > 0 && (
                  <TableBatchActions {...getBatchActionProps()}>
                    {onDelete && (
                      <TableBatchAction renderIcon={TrashCan} onClick={handleDeleteClick}>
                        {deleteLabel}
                      </TableBatchAction>
                    )}
                  </TableBatchActions>
                )}
                {onAddClick && (
                  <Button kind="primary" renderIcon={Add} onClick={onAddClick}>
                    {add}
                  </Button>
                )}
              </TableToolbarContent>
            </TableToolbar>
            <Table>
              <TableHead>
                <TableRow>
                  <TableSelectAll {...getSelectionProps()} />
                  <TableHeader>{name}</TableHeader>
                  <TableHeader>{source}</TableHeader>
                  <TableHeader>{amount}</TableHeader>
                  <TableHeader>{date}</TableHeader>
                  <TableHeader>{concept}</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataTableRows.map((row, rowIndex) => {
                  const rowProps = getRowProps({ row });
                  const { key, ...restProps } = rowProps;
                  return (
                    <TableRow key={key} {...restProps} onClick={() => handleRowClick(row)}>
                      <TableSelectRow {...getSelectionProps({ row })} />
                      <TableCell>{(row as any).name}</TableCell>
                      <TableCell>{(row as any).source}</TableCell>
                      <TableCell>{(row as any).amount}€</TableCell>
                      <TableCell>
                        {new Date((row as any).receivedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{(row as any).concept}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>

      {totalItems > 0 && (
        <Stack gap={4} orientation="horizontal" className="cds-table--pagination">
          <PaginationNav
            totalItems={totalItems}
            page={currentPageParam}
            onChange={handlePaginationChange}
          />
          <Dropdown
            titleText={null}
            id="limit"
            label={limitLabel}
            items={limitItems}
            selectedItem={selectedLimit ?? undefined}
            itemToString={(item) => (item ? String(item?.text) : "")}
            size="sm"
            direction="top"
            onChange={handleLimitChange}
          />
        </Stack>
      )}

      <Modal
        open={isDeleteOpen}
        primaryButtonText={deleteLabel}
        primaryButtonDisabled={isDeleting}
        secondaryButtonText={cancel}
        onRequestClose={() => setIsDeleteOpen(false)}
        onRequestSubmit={handleDeleteConfirm}
        modalHeading="Eliminar Ingresos"
      >
        <p>{deleteConfirm}</p>
      </Modal>
    </>
  );
};
