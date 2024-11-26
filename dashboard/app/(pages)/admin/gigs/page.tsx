'use server';

import { Gigs } from '@/app/services/gigs';
import type { Gig } from '@/types/gig';
import i18n from '@/app/services/translate';
import GigsView from './view';
import { getActionsTranslations } from '@/app/services/_list';

export default async function GigsPage({
  searchParams,
}: Readonly<{ searchParams?: URLSearchParams }>) {
  await i18n.init();

  const data = await Gigs.getAll(searchParams);
  const items: Gig[] = await Gigs.parseAll(data.items, i18n);

  const headers = [
    { key: 'datehour', header: i18n.t('fields.date') },
    { key: 'title', header: i18n.t('fields.title') },
    { key: 'venue', header: i18n.t('fields.venue') },
    { key: 'event', header: i18n.t('fields.event') },
  ];

  const translations = {
    ...Gigs.getTranslations(i18n, Gigs),
    ...getActionsTranslations(i18n),
  };

  const fields = await Gigs.getFields({ searchParams, i18n });

  return (
    <GigsView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      fields={fields}
    />
  );
}
