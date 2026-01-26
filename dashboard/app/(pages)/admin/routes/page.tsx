import { Routes } from "@/app/services/routes";
import type { Route } from "@/types/route";
import i18n from "@/app/services/translate";
import RouteView from "./view";
import { getTranslation } from "@/app/services/_list";

export default async function RoutesPage({
  searchParams,
}: Readonly<{ searchParams: URLSearchParams }>) {
  await i18n.init();

  const data = await Routes.getAll(searchParams);
  const items: Route[] = await Routes.parseAll(data.items);

  const headers = [{ key: "name", header: i18n.t("fields.name"), default: true }];

  const translations = {
    ...Routes.getTranslations(i18n, Routes),
    ...getTranslation(i18n, "actions"),
  };

  return (
    <RouteView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      fields={Routes.fields}
    />
  );
}
