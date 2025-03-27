import { Tags } from '@/app/services/tags';
import type { Tag } from '@/types/tag';
import i18n from '@/app/services/translate';
import TagsView from './view';
import { getTranslation } from '@/app/services/_list';

export default async function TagsPage({
  searchParams,
}: Readonly<{ searchParams: URLSearchParams }>) {
  await i18n.init();

  const data = await Tags.getAll(searchParams);
  const items: Tag[] = await Tags.parseAll(data.items);

  const headers = [
    { key: 'color', header: i18n.t('fields.color') },
    { key: 'name', header: i18n.t('fields.name'), default: true },
  ];

  const translations = {
    ...Tags.getTranslations(i18n, Tags),
    ...getTranslation(i18n, 'actions'),
  };

  return (
    <TagsView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      fields={Tags.fields}
    />
  );
}
