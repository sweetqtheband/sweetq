import { Config } from "@/app/services/config";
import type { ConfigType } from "@/types/config";
import i18n from "@/app/services/translate";
import ConfigView from "./view";
import { getTranslation } from "@/app/services/_list";

export default async function ConfigPage({
  searchParams,
}: Readonly<{ searchParams: URLSearchParams }>) {
  await i18n.init();

  const data = await Config.getAll(searchParams);
  const items: ConfigType[] = await Config.parseAll(data.items);

  const headers = [
    { key: "name", header: i18n.t("fields.name"), default: true },
    { key: "default", header: i18n.t("fields.default"), default: false },
  ];

  const translations = {
    ...Config.getTranslations(i18n, Config),
    ...getTranslation(i18n, "actions"),
  };
  return (
    <ConfigView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      fields={Config.fields}
    />
  );
}
