import { FinanceUsers } from "@/app/services/financeUsers";
import type { FinanceUser } from "@/types/financeUser";
import i18n from "@/app/services/translate";
import FinanceUsersView from "./view";
import { getTranslation } from "@/app/services/_list";

export default async function FinanceUsersPage({
  searchParams,
}: Readonly<{ searchParams: URLSearchParams }>) {
  await i18n.init();

  const data = await FinanceUsers.getAll(searchParams);
  const items: FinanceUser[] = await FinanceUsers.parseAll(data.items);

  // TODO: Personaliza los headers según los campos de tu entidad
  const headers = [
    { key: "name", header: i18n.t("fields.name"), default: true },
    { key: "percentage", header: i18n.t("fields.percentage") },
  ];

  const translations = {
    ...FinanceUsers.getTranslations(i18n, FinanceUsers),
    ...getTranslation(i18n, "actions"),
  };

  return (
    <FinanceUsersView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      fields={FinanceUsers.fields}
    />
  );
}
