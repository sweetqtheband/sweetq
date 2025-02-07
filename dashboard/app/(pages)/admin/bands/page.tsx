import { Bands } from '@/app/services/bands';
import type { Band } from '@/types/band';
import i18n from '@/app/services/translate';
import BandsView from './view';
import { getActionsTranslations } from '@/app/services/_list';

export default async function BandsPage({
  searchParams,
}: Readonly<{ searchParams: URLSearchParams }>) {
  await i18n.init();

  const data = await Bands.getAll(searchParams);
  console.log('BANDS DATA', data);
  const items: Band[] = await Bands.parseAll(data.items);

  const headers = [
    { key: 'name', header: i18n.t('fields.name'), default: true },
    { key: 'facebook', header: i18n.t('fields.social.facebook') },
    { key: 'instagram', header: i18n.t('fields.social.instagram') },
  ];

  const translations = {
    ...Bands.getTranslations(i18n, Bands),
    ...getActionsTranslations(i18n),
  };

  return (
    <BandsView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      fields={Bands.fields}
    />
  );
}
