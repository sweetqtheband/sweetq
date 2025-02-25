'use client';

import { useState } from 'react';
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
  onSave = async () => true,
  onDelete = async () => true,
  noAdd = false,
  translations = {},
  fields = {},
  filters = {},
  methods = {},
  renders = {},
}: Readonly<{
  items?: any[];
  headers?: any[];
  imageSize?: SizeType;
  total?: number;
  limit?: number;
  pages?: number;
  timestamp?: number;
  id?: string;
  onSave?: (data: any, files: any) => Promise<boolean>;
  onDelete?: (ids: string[]) => Promise<boolean>;
  noAdd?: boolean;
  translations?: Record<string, string>;
  fields?: Record<string, any>;
  filters?: Record<string, any>;
  methods?: Record<string, any>;
  renders?: Record<string, any>;
}>) {
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onClose = async (item = null) => {
    setItem(null);
  };

  const onSaveHandler = async (data: any, files: any) => {
    setIsLoading(true);
    const response = await onSave(data, files);
    setIsLoading(false);
    if (response) {
      onClose();
    }
    return true;
  };

  const onItemClickHandler = (item: any) => {
    setItem(item);
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
      />
      <ListPanel
        id={id}
        data={item}
        onClose={onClose}
        onSave={onSaveHandler}
        translations={translations}
        fields={fields}
        methods={methods}
        renders={renders}
      />
    </>
  );
}
