import { Tracks } from '@/app/services/tracks';
import type { Track } from '@/types/track';
import i18n from '@/app/services/translate';
import TracksView from './view';
import { getTranslation } from '@/app/services/_list';

export default async function TracksPage({
  searchParams,
}: Readonly<{ searchParams?: URLSearchParams }>) {
  await i18n.init();

  const data = await Tracks.getAll(searchParams);
  const items: Track[] = await Tracks.parseAll(data.items);

  const headers = [
    { key: 'image', header: i18n.t('fields.cover') },
    { key: 'title', header: i18n.t('fields.title') },
    { key: 'date', header: i18n.t('fields.date') },
    { key: 'status', header: i18n.t('fields.status') },
  ];

  const translations = {
    ...Tracks.getTranslations(i18n, Tracks),
    ...getTranslation(i18n, 'actions'),
  };

  return (
    <TracksView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      fields={Tracks.fields}
    />
  );
}
