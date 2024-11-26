'use server';

import { News } from '@/app/services/news';
import type { New } from '@/types/new';
import i18n from '@/app/services/translate';
import NewsView from './view';
import { getActionsTranslations } from '@/app/services/_list';

export default async function NewsPage({
  searchParams,
}: Readonly<{ searchParams?: URLSearchParams }>) {
  await i18n.init();

  const data = await News.getAll(searchParams);
  const items: New[] = await News.parseAll(data.items);

  const headers = [
    { key: 'image', header: i18n.t('fields.cover') },
    { key: 'title', header: i18n.t('fields.title') },
  ];

  const translations = {
    ...News.getTranslations(i18n, News),
    ...getActionsTranslations(i18n),
  };

  return (
    <NewsView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      fields={News.fields}
    />
  );
}
