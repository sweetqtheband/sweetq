"use client";

import { renderField } from "@/app/render";
import { breakpoint } from "@/app/utils";
import { ACTIONS } from "@/app/constants";
import type { DataTableRow } from "@carbon/react";
import {
  Button,
  Heading,
  IconButton,
  Popover,
  PopoverContent,
  Section,
  TableBatchAction,
  TableBatchActions,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
} from "@carbon/react";
import { Add, Close, Filter, TrashCan, Copy } from "@carbon/react/icons";
import React, { useCallback } from "react";

const EMPTY_OBJECT: Record<string, any> = {};
const NOOP = () => {};

interface ListTableToolbarProps {
  translations?: Record<string, any>;
  filters?: Record<string, any>;
  fields?: Record<string, any>;
  filtersOpen?: boolean;
  formState?: Record<string, any>;
  internalState?: Record<string, any>;
  filtering?: boolean;
  isLoading?: boolean;
  onSearchChange?: (value: string) => void;
  onFilterChange?: (field: string, value: any) => void;
  onFilterInternalStateChange?: (field: string, value: any) => void;
  onFilterReset?: (field: string) => void;
  setFiltersOpen?: (open: boolean) => void;
  onAddClick?: () => void;
  noAdd?: boolean;
  selectedRows?: DataTableRow<any[]>[];
  batchActionProps?: any;
  batchActions?: Record<string, any>;
  canDelete?: boolean;
  canCopy?: boolean;
  onDelete?: (rows: DataTableRow<any[]>[]) => void;
  onCopy?: (rows: DataTableRow<any[]>[]) => void;
  noBatchActions?: boolean;
  noDelete?: boolean;
  noCopy?: boolean;
  onBatchActionsTranslate?: (id: string, props?: any) => string;
  [key: string]: any;
}

function ListTableToolbar({
  translations = EMPTY_OBJECT,
  filters = EMPTY_OBJECT,
  fields = EMPTY_OBJECT,
  filtersOpen = false,
  formState = EMPTY_OBJECT,
  internalState = EMPTY_OBJECT,
  filtering = false,
  isLoading = false,
  onSearchChange = NOOP,
  onFilterChange = NOOP,
  onFilterInternalStateChange = NOOP,
  onFilterReset = NOOP,
  setFiltersOpen = NOOP,
  onAddClick = NOOP,
  noAdd = false,
  selectedRows = [],
  batchActionProps = {},
  batchActions = EMPTY_OBJECT,
  canDelete = false,
  canCopy = false,
  onDelete = NOOP,
  onCopy = NOOP,
  noBatchActions = false,
  noDelete = false,
  noCopy = false,
  onBatchActionsTranslate,
  ...restProps
}: ListTableToolbarProps) {
  const searchTranslate = useCallback(
    (id: string) => {
      if (id === "carbon.table.toolbar.search.placeholder") {
        return translations.filter || "Filter";
      }
      if (id === "carbon.table.toolbar.search.label") {
        return translations.search || "Search";
      }
      return id;
    },
    [translations]
  );

  const batchActionsTranslate = useCallback(
    (id: string, props?: any) => {
      if (onBatchActionsTranslate) {
        return onBatchActionsTranslate(id, props);
      }
      const batchTranslations: Record<string, string> = {
        "carbon.table.batch.cancel": translations.cancel || "Cancel",
        "carbon.table.batch.selectNone": translations.selectNone || "Deselect",
        "carbon.table.batch.actions": translations.actions || "Actions",
        "carbon.table.batch.action": translations.action || "Action",
        "carbon.table.batch.clear": translations.clear || "Clear",
        "carbon.table.batch.save": translations.save || "Save",
      };
      return batchTranslations[id] || id;
    },
    [translations, onBatchActionsTranslate]
  );

  const renderFilters = useCallback(() => {
    const filterFields = Object.keys(filters);
    if (filterFields.length === 0) return null;

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
          label={translations.filter || "Filter"}
          kind={filtering ? "tertiary" : "ghost"}
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <Filter />
        </IconButton>
        <PopoverContent className="cds--table-filters">
          {breakpoint("mobile") && (
            <div className="cds--flex">
              <Section level={4}>
                <Heading>{translations.filter || "Filter"}</Heading>
              </Section>
              <Close
                size={32}
                className="close"
                onClick={() => setFiltersOpen(false)}
                style={{ cursor: "pointer" }}
              />
            </div>
          )}
          <div>
            {filterFields.map((field: string, index: number) => (
              <div key={`filter-${index}`}>
                {renderField({
                  ...filters[field],
                  key: `filter-${index}`,
                  ready: !isLoading,
                  translations,
                  filters,
                  field,
                  formState,
                  internalState,
                  onFormStateHandler: (f: string, v: any) => onFilterChange(f, v),
                  onInternalStateHandler: (f: string, v: any) => onFilterInternalStateChange(f, v),
                  onInputHandler: (f: string, v: any) => onFilterChange(f, v),
                  onRemoveHandler: (f: string) => onFilterReset(f),
                })}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }, [
    filters,
    filtersOpen,
    filtering,
    isLoading,
    translations,
    setFiltersOpen,
    formState,
    internalState,
    onFilterChange,
    onFilterInternalStateChange,
    onFilterReset,
  ]);

  const renderBatchActions = useCallback(() => {
    if (noBatchActions) return null;

    return (
      <TableBatchActions {...(batchActionProps as any)} translateWithId={batchActionsTranslate}>
        {Object.keys(batchActions).map((action, index) => (
          <Button
            key={`batch-action-${index}`}
            tabIndex={(batchActionProps as any)?.shouldShowBatchActions ? -1 : 0}
            onClick={() => batchActions[action].onClick(selectedRows.map((row: any) => row.id))}
            renderIcon={batchActions[action].icon}
            kind={batchActions[action].kind || "primary"}
            size="sm"
          >
            {batchActions[action].translations?.title || action}
          </Button>
        ))}

        {canDelete && !noDelete && (
          <TableBatchAction
            tabIndex={(batchActionProps as any)?.shouldShowBatchActions ? 0 : -1}
            renderIcon={TrashCan}
            onClick={() => onDelete(selectedRows)}
          >
            {translations.delete || "Delete"}
          </TableBatchAction>
        )}

        {canCopy && !noCopy && (
          <TableBatchAction
            tabIndex={(batchActionProps as any)?.shouldShowBatchActions ? 0 : -1}
            renderIcon={Copy}
            onClick={() => onCopy(selectedRows)}
          >
            {translations.copy || "Copy"}
          </TableBatchAction>
        )}
      </TableBatchActions>
    );
  }, [
    noBatchActions,
    batchActionProps,
    batchActions,
    canDelete,
    canCopy,
    noDelete,
    noCopy,
    selectedRows,
    translations,
    onDelete,
    onCopy,
    batchActionsTranslate,
  ]);

  return (
    <TableToolbar {...restProps}>
      <TableToolbarContent>
        <TableToolbarSearch
          tabIndex={(batchActionProps as any)?.shouldShowBatchActions ? -1 : 0}
          translateWithId={searchTranslate}
          onChange={(evt: any) => onSearchChange(evt.target.value)}
        />
        {renderFilters()}
        {!noAdd && (
          <Button
            tabIndex={(batchActionProps as any)?.shouldShowBatchActions ? -1 : 0}
            onClick={onAddClick}
            renderIcon={Add}
            kind="primary"
          >
            {translations.add || "Add"}
          </Button>
        )}
      </TableToolbarContent>
      {renderBatchActions()}
    </TableToolbar>
  );
}

export default React.memo(ListTableToolbar);
