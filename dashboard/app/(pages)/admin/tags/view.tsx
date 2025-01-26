'use client';

import ListLayout from '@/app/components/layouts/list-layout';
import { Tags } from '@/app/services/tags';
import { useRouter } from 'next/navigation';

export default function TagsView(params: Readonly<any>) {
  const router = useRouter();
  const methods = Tags.getMethods(router);
  const renders = Tags.getRenders();

  return (
    <ListLayout
      {...params}
      methods={methods}
      renders={renders}
      onSave={methods.onSave}
      onDelete={methods.onDelete}
    />
  );
}
