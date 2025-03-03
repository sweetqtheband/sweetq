'use server';

import { Layouts } from '@/app/services/layouts';
import type { Layout } from '@/types/layout';
import i18n from '@/app/services/translate';
import LayoutsView from './view';
import { getActionsTranslations } from '@/app/services/_list';

export default async function LayoutsPage({
  searchParams,
}: Readonly<{ searchParams: URLSearchParams }>) {
  await i18n.init();

  const data = await Layouts.getAll(searchParams);
  const items: Layout[] = await Layouts.parseAll(data.items);

  const headers = [
    { key: 'name', header: i18n.t('fields.name'), default: true },
  ];

  const translations = {
    ...Layouts.getTranslations(i18n, Layouts),
    ...getActionsTranslations(i18n),
  };

  return (
    <LayoutsView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      fields={Layouts.fields}
    />
  );
}
