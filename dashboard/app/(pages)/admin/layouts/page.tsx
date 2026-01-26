import { Layouts } from "@/app/services/layouts";
import type { Layout } from "@/types/layout";
import i18n from "@/app/services/translate";
import LayoutsView from "./view";
import { getTranslation } from "@/app/services/_list";

export default async function LayoutsPage({
  searchParams,
}: Readonly<{ searchParams: URLSearchParams }>) {
  await i18n.init();

  const data = await Layouts.getAll(searchParams);
  const items: Layout[] = await Layouts.parseAll(data.items);

  const headers = [{ key: "name", header: i18n.t("fields.name"), default: true }];

  const translations = {
    ...Layouts.getTranslations(i18n, Layouts),
    ...getTranslation(i18n, "actions"),
  };

  translations.vars = i18n.t("pages.instagram.panel.variables", {
    returnObjects: true,
  });

  return (
    <LayoutsView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      fields={Layouts.fields}
    />
  );
}
