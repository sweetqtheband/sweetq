import { Users } from "@/app/services/users";
import type { User } from "@/types/user";
import i18n from "@/app/services/translate";
import UsersView from "./view";
import { getTranslation } from "@/app/services/_list";
import { UserProfiles } from "@/app/services/userProfiles";

export default async function UsersPage({
  searchParams,
}: Readonly<{ searchParams: URLSearchParams }>) {
  await i18n.init();

  const data = await Users.getAll(searchParams);
  const items: User[] = await Users.parseAll(data.items);

  const headers = [
    { key: "name", header: i18n.t("fields.name"), default: true },
    { key: "username", header: i18n.t("fields.username") },
  ];

  const translations = {
    ...Users.getTranslations(i18n, Users),
    ...getTranslation(i18n, "actions"),
  } as Record<string, any>;
  translations.options.profile = UserProfiles.getTranslations(i18n);

  const fields = await Users.getFields({ searchParams, i18n });

  return (
    <UsersView
      items={items}
      translations={translations}
      headers={headers}
      total={data.total}
      limit={data?.next?.limit}
      pages={data.pages}
      fields={fields}
    />
  );
}
