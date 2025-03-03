'use client';

import { InstagramLogin } from '@/app/components';
import ListLayout from '@/app/components/layouts/list-layout';
import { Followers } from '@/app/services/followers';
import { useRouter } from 'next/navigation';
import MessagePanel from './message-panel';
import { useEffect, useState } from 'react';

export default function InstagramView(params: Readonly<any>) {
  const [ids, setIds] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const methods = Followers.getMethods(router);
  const renders = Followers.getRenders();
  const batchActions = Followers.getBatchActions(setIds, params.translations);

  return (
    <>
      <ListLayout
        {...params}
        methods={methods}
        renders={renders}
        batchActions={batchActions}
        onSave={methods.onSave}
        onDelete={methods.onDelete}
        loading={isLoading}
        noAdd={true}
      />
      <MessagePanel
        ids={ids}
        items={params.items}
        translations={params.translations}
        setIds={setIds}
        layouts={params.layouts}
        onSave={methods.onMessageSave}
        setIsLoading={setIsLoading}
      />
    </>
  );
}
