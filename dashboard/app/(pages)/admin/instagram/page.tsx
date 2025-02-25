import { Followers } from '@/app/services/followers';
import type { Follower } from '@/types/follower';
import i18n from '@/app/services/translate';
import InstagramView from './view';
import { getActionsTranslations } from '@/app/services/_list';
import './page.scss';

export default async function InstagramPage({
  searchParams,
}: Readonly<{ searchParams?: URLSearchParams }>) {
  await i18n.init();

  const data = await Followers.getAll(searchParams);
  const items: Follower[] = await Followers.parseAll(data.items, i18n);

  const headers = [
    { key: 'profile_pic_url', header: i18n.t('fields.image') },
    { key: 'full_name', header: i18n.t('fields.name') },
    { key: 'username', header: i18n.t('fields.username') },
    { key: 'short_name', header: i18n.t('fields.alias') },
    { key: 'country', header: i18n.t('fields.country') },
    { key: 'state', header: i18n.t('fields.state') },
    { key: 'tags', header: i18n.t('fields.tags') },
  ];

  const getFiltersTranslations = (i18n: any, translations: any) => {
    translations.fields.show = i18n.t('filters.show.label');
    translations.options.show = {
      options: {
        following: i18n.t('filters.show.following'),
        notFollowing: i18n.t('filters.show.notFollowing'),
        all: i18n.t('filters.show.all'),
      },
    };
    translations.fields.withoutTags = i18n.t('filters.withoutTags');
  };

  const translations = {
    ...Followers.getTranslations(i18n, Followers),
    ...getActionsTranslations(i18n),
    title: i18n.t('pages.instagram.title'),
    description: i18n.t('pages.instagram.description', { total: data.total }),
  };

  getFiltersTranslations(i18n, translations);

  const fields = await Followers.getFields({ searchParams, i18n });
  const filters = await Followers.getFilters({ searchParams, i18n });

  return (
    <InstagramView
      items={items}
      translations={translations}
      headers={headers}
      timestamp={data.timestamp}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      filters={filters}
      fields={fields}
    />
  );
}
