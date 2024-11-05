'use server';

import { Tracks } from '@/app/services/tracks';
import type { Track } from '@/types/track';
import i18n from '@/app/services/translate';
import TracksView from './view';

export default async function TracksPage() {
  await i18n.init();

  const data = await Tracks.getAll();
  const items: Track[] = Tracks.parseAll(data.items);

  const headers = [
    { key: 'image', header: i18n.t('fields.cover') },
    { key: 'title', header: i18n.t('fields.title') },
    { key: 'date', header: i18n.t('fields.date') },
    { key: 'status', header: i18n.t('fields.status') },
  ];

  const translations = {
    ...Tracks.getTranslations(i18n, Tracks),
    save: i18n.t('save'),
  };

  return (
    <TracksView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      pages={data.pages}
      fields={Tracks.fields}
    />
  );
}
