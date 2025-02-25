'use client';

import { InstagramLogin } from '@/app/components';
import ListLayout from '@/app/components/layouts/list-layout';
import { Followers } from '@/app/services/followers';
import { useRouter } from 'next/navigation';

export default function InstagramView(params: Readonly<any>) {
  const router = useRouter();
  const methods = Followers.getMethods(router);
  const renders = Followers.getRenders();

  return (
    <>
      <ListLayout
        {...params}
        methods={methods}
        renders={renders}
        onSave={methods.onSave}
        onDelete={methods.onDelete}
        noAdd={true}
      />
    </>
  );
}
