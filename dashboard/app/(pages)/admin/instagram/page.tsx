import { Followers } from '@/app/services/followers';
import type { Follower } from '@/types/follower';
import i18n from '@/app/services/translate';
import InstagramView from './view';
import { getTranslation } from '@/app/services/_list';
import './page.scss';
import { Layouts } from '@/app/services/layouts';

export default async function InstagramPage({
  searchParams,
}: Readonly<{ searchParams?: any }>) {
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
    { key: 'pending_messages', header: i18n.t('fields.pendingMessages') },
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

  const getPanelTranslations = (i18n: any, translations: any) => {
    translations.fields.layout = i18n.t('fields.layout');
    translations.fields.vars = i18n.t('pages.instagram.panel.vars');
    translations.fields.personalMessage = i18n.t(
      'pages.instagram.panel.personalMessage'
    );
    translations.fields.collectiveMessage = i18n.t(
      'pages.instagram.panel.collectiveMessage'
    );
    translations.vars = i18n.t('pages.instagram.panel.variables', {
      returnObjects: true,
    });
    translations.messagePanel = {
      title: i18n.t('pages.instagram.panel.title'),
      subtitle: i18n.t('pages.instagram.panel.subtitle'),
      description: i18n.t('pages.instagram.description'),
      modes: {
        new: i18n.t('pages.instagram.panel.modes.createNew'),
        layout: i18n.t('pages.instagram.panel.modes.loadLayout'),
      },
    };
  };

  const getChatTranslations = (i18n: any, translations: any) => {
    translations.openChat = i18n.t('pages.instagram.panel.openChat');
  };

  const translations = {
    ...Followers.getTranslations(i18n, Followers),
    ...getTranslation(i18n, 'actions'),
    title: i18n.t('pages.instagram.title'),
    description: i18n.t('pages.instagram.description', { total: data.total }),
  };

  getFiltersTranslations(i18n, translations);
  getPanelTranslations(i18n, translations);
  getChatTranslations(i18n, translations);

  const fields = await Followers.getFields({ searchParams, i18n });
  const filters = await Followers.getFilters({ searchParams, i18n });

  const layouts = (
    await Layouts.getAll(
      {
        filters: { type: 'instagram' },
        limit: 10000,
      },
      false
    )
  ).items;

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
      layouts={layouts}
    />
  );
}
