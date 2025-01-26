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
  id = '',
  onSave = async () => true,
  onDelete = async () => true,
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
  id?: string;
  onSave?: (data: any, files: any) => Promise<boolean>;
  onDelete?: (ids: string[]) => Promise<boolean>;
  translations?: Record<string, string>;
  fields?: Record<string, any>;
  filters?: Record<string, any>;
  methods?: Record<string, any>;
  renders?: Record<string, any>;
}>) {
  const [item, setItem] = useState(null);

  const onClose = async (item = null) => {
    setItem(null);
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
        pages={pages}
        filters={filters}
        translations={translations}
        fields={fields}
        renders={renders}
      />
      <ListPanel
        id={id}
        data={item}
        onClose={onClose}
        onSave={onSave}
        translations={translations}
        fields={fields}
        methods={methods}
        renders={renders}
      />
    </>
  );
}
