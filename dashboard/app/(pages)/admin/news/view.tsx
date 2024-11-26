'use client';

import ListLayout from '@/app/components/layouts/list-layout';
import { News } from '@/app/services/news';
import { useRouter } from 'next/navigation';

export default function NewsView(params: Readonly<any>) {
  const router = useRouter();
  const methods = News.getMethods(router);

  return (
    <ListLayout
      {...params}
      methods={methods}
      onSave={methods.onSave}
      onDelete={methods.onDelete}
    />
  );
}
