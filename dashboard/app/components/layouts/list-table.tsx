'use client';

import config from '@/app/config';
import { IMAGE_SIZES } from '@/app/constants';
import type { SizeType } from '@/types/size.d';
import {
  DataTable,
  PaginationNav,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import Image from 'next/image';

export default function ListTable({
  id = 'item.id',
  items = [],
  headers = [],
  imageSize = 'md',
  total = 0,
  pages = 0,
  onItemClick = () => {},
  translations = {},
  fields = {},
}: Readonly<{
  id?: string;
  items: any[];
  imageSize: SizeType;
  headers?: any[];
  total: number;
  pages: number;
  onItemClick?: (item: any) => void;
  translations?: Record<string, string>;
  fields?: Record<string, any>;
}>) {
  const renderCell = (
    item: Record<string, any>,
    field: Record<string, any>
  ) => {
    const fieldName = field.id.split(':')[1];
    const isImage = field.value.match(/\.[png|gif|jpg|jpeg|webp|svg]/);

    const value = translations.options?.[fieldName]
      ? translations.options?.[fieldName][field.value]
      : field.value;

    const image = (
      <Image
        src={value}
        alt={item.id}
        height={IMAGE_SIZES[imageSize]}
        width={IMAGE_SIZES[imageSize]}
      />
    );
    return isImage ? image : value;
  };

  const tableRowClickHandler = (id: string | number) => {
    const row = items.find((row) => row.id === id);
    onItemClick(row);
  };

  return (
    <>
      <DataTable headers={headers} rows={items}>
        {({ rows, headers }) => (
          <Table>
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableHeader key={`${id}-header-${index}`}>
                    {header.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow
                  key={`${id}-row-${rowIndex}`}
                  onClick={() => tableRowClickHandler(row.id)}
                >
                  {row.cells.map((cell, index) => (
                    <TableCell key={`${id}-row-${rowIndex}-cell-${index}`}>
                      {renderCell(row, cell)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DataTable>
      <PaginationNav itemsShown={config.table.limit} totalItems={pages} />
    </>
  );
}
