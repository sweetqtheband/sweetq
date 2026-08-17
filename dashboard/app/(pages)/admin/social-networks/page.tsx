import { SocialNetworks } from "@/app/services/socialNetworks";
import type { SocialNetwork } from "@/types/social-network";
import i18n from "@/app/services/translate";
import SocialNetworksView from "./view";
import { getTranslation } from "@/app/services/_list";

export default async function SocialNetworksPage({
  searchParams,
}: Readonly<{ searchParams: URLSearchParams }>) {
  await i18n.init();

  const data = await SocialNetworks.getAll(searchParams);
  const items: SocialNetwork[] = await SocialNetworks.parseAll(data.items);

  const headers = [{ key: "name", header: i18n.t("fields.name"), default: true }];

  const translations = {
    ...SocialNetworks.getTranslations(i18n, SocialNetworks),
    ...getTranslation(i18n, "actions"),
  };

  return (
    <SocialNetworksView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      fields={SocialNetworks.fields}
    />
  );
}
