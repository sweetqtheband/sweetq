'use client';

import ListLayout from '@/app/components/layouts/list-layout';
import { Layouts } from '@/app/services/layouts';
import { useRouter } from 'next/navigation';

export default function LayoutsView(params: Readonly<any>) {
  const router = useRouter();
  const methods = Layouts.getMethods(router);
  const renders = Layouts.getRenders();
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
