'use client';

import { ReactNode, useState } from 'react';
import ListTable from './list-table';
import ListPanel from './list-panel';
import { SizeType } from '@/types/size';
import { SIZES } from '@/app/constants';

export default function ListLayout({
  items = [],
  headers = [],
  imageSize = SIZES.MD,
  total = 0,
  pages = 0,
  id = '',
  onSave = async () => true,
  translations = {},
  fields = {},
  children,
}: Readonly<{
  items?: any[];
  headers?: any[];
  imageSize?: SizeType;
  total?: number;
  pages?: number;
  id?: string;
  onSave?: (data: any, files: any) => Promise<boolean>;
  translations?: Record<string, string>;
  fields?: Record<string, any>;
  children?: ReactNode;
}>) {
  const [item, setItem] = useState(null);

  const onClose = async () => {
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
        imageSize={imageSize}
        headers={headers}
        total={total}
        pages={pages}
        translations={translations}
        fields={fields}
      />
      <ListPanel
        id={id}
        data={item}
        onClose={onClose}
        onSave={onSave}
        translations={translations}
        fields={fields}
      />
    </>
  );
}
