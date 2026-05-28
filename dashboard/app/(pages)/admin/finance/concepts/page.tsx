import { FinanceConcepts } from '@/app/services/financeConcepts';
import type { FinanceConcept } from '@/types/financeConcept';
import i18n from '@/app/services/translate';
import FinanceConceptsView from './view';
import { getTranslation } from '@/app/services/_list';

export default async function FinanceConceptsPage({
  searchParams,
}: Readonly<{ searchParams: URLSearchParams }>) {
  await i18n.init();

  const data = await FinanceConcepts.getAll(searchParams);
  const items: FinanceConcept[] = await FinanceConcepts.parseAll(data.items);

  // TODO: Personaliza los headers según los campos de tu entidad
  const headers = [
    { key: 'name', header: i18n.t('fields.name'), default: true },
    // { key: 'field2', header: i18n.t('fields.field2') },
  ];

  const translations = {
    ...FinanceConcepts.getTranslations(i18n, FinanceConcepts),
    ...getTranslation(i18n, 'actions'),
  };

  return (
    <FinanceConceptsView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      fields={FinanceConcepts.fields}
    />
  );
}
