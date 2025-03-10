'use client';

import { useEffect, useState } from 'react';
import ListTable from './list-table';
import ListPanel from './list-panel';
import { SizeType } from '@/types/size';
import { SIZES } from '@/app/constants';
import './list.scss';

export default function ListLayout({
  items = [],
  headers = [],
  imageSize = SIZES.MD,
  total = 0,
  limit = 0,
  pages = 0,
  timestamp = 0,
  id = '',
  loading = false,
  onSave = async () => true,
  onDelete = async () => true,
  actionIcon = null,
  actionLabel = '',
  onAction = async () => true,
  noAdd = false,
  translations = {},
  actions = {},
  batchActions = {},
  fields = {},
  filters = {},
  methods = {},
  renders = {},
  onItemSelect = () => true,
}: Readonly<{
  items?: any[];
  headers?: any[];
  imageSize?: SizeType;
  total?: number;
  limit?: number;
  pages?: number;
  timestamp?: number;
  id?: string;
  loading?: boolean;
  onSave?: (data: any, files: any) => Promise<boolean>;
  onDelete?: (ids: string[]) => Promise<boolean>;
  actionIcon?: string | null;
  actionLabel?: string;
  onAction?: Function;
  noAdd?: boolean;
  translations?: Record<string, string>;
  actions?: Record<string, any>;
  batchActions?: Record<string, any>;
  fields?: Record<string, any>;
  filters?: Record<string, any>;
  methods?: Record<string, any>;
  renders?: Record<string, any>;
  onItemSelect?: Function;
}>) {
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    if (loading !== isLoading) {
      setIsLoading(loading);
    }
  }, [loading, isLoading]);

  const onClose = async (item = null) => {
    setItem(null);
    onItemSelect(null);
  };

  const onSaveHandler = async (data: any, files: any) => {
    setIsLoading(true);
    const response = await onSave(data, files);
    if (response) {
      onClose();
    }
    return true;
  };

  const onItemClickHandler = (item: any) => {
    setItem(item);
    onItemSelect(item);
  };

  const onActionHandler = async (e: any) => {
    onAction(e);
  };

  return (
    <>
      <ListTable
        id={id}
        items={items}
        onItemClick={onItemClickHandler}
        onDelete={onDelete}
        imageSize={imageSize}
        headers={headers}
        total={total}
        limit={limit}
        timestamp={timestamp}
        pages={pages}
        filters={filters}
        translations={translations}
        noAdd={noAdd}
        fields={fields}
        loading={isLoading}
        renders={renders}
        actions={actions}
        batchActions={batchActions}
      />
      <ListPanel
        id={id}
        data={item}
        onClose={onClose}
        onSave={onSaveHandler}
        onAction={onActionHandler}
        actionIcon={actionIcon}
        actionLabel={actionLabel}
        translations={translations}
        checkAction={methods?.action?.check ?? null}
        fields={fields}
        methods={methods}
        renders={renders}
      />
    </>
  );
}
