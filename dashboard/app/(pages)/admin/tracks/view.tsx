'use client';

import ListLayout from '@/app/components/layouts/list-layout';
import { Tracks } from '@/app/services/tracks';
import { getFormData } from '@/app/utils';

export default function TracksView({
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
  const onSave = async (data: any, files: any) => {
    const formData = getFormData(data, files);
    await Tracks.put(data._id, formData);
    return false;
  };

  return (
    <ListLayout
      items={items}
      headers={headers}
      total={total}
      pages={pages}
      translations={translations}
      fields={fields}
      onSave={onSave}
    />
  );
}
