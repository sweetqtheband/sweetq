'use client';

import { useRouter } from 'next/router';
import ListLayout from '../components/layouts/list-layout';
import { BaseListItem } from '@/types/list';

export const ListView = (Service: BaseListItem) =>
  function View({
    items,
    headers,
    total,
    pages,
    translations = {},
    fields = {},
  }: Readonly<{
    items: any[];
    headers: any[];
    total: number;
    pages: number;
    translations?: Record<string, any>;
    fields?: Record<string, any>;
  }>) {
    const router = useRouter();
    const methods = Service.getMethods(router);

    return (
      <ListLayout
        items={items}
        headers={headers}
        total={total}
        pages={pages}
        translations={translations}
        fields={fields}
        methods={methods}
        onSave={methods.onSave}
        onDelete={methods.onDelete}
      />
    );
  };
