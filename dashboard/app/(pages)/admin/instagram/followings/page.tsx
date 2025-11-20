import { ACTIONS, Followings } from "@/app/services/followings";
import type { Following } from "@/types/following";
import i18n from "@/app/services/translate";
import InstagramView from "./view";
import { getTranslation } from "@/app/services/_list";
import "./page.scss";
import { Layouts } from "@/app/services/layouts";

export default async function InstagramPage({ searchParams }: Readonly<{ searchParams?: any }>) {
  await i18n.init();

  const data = await Followings.getAll(searchParams);
  const items: Following[] = await Followings.parseAll(data.items, i18n);

  const headers = [
    { key: "profile_pic_url", header: i18n.t("fields.image") },
    { key: "full_name", header: i18n.t("fields.name") },
    { key: "username", header: i18n.t("fields.username") },
    { key: "short_name", header: i18n.t("fields.alias") },
    { key: "country", header: i18n.t("fields.country") },
    { key: "state", header: i18n.t("fields.state") },
    { key: "tags", header: i18n.t("fields.tags") },
    { key: "followed_back", header: i18n.t("fields.followedBack") },
    { key: "pending_messages", header: i18n.t("fields.pendingMessages") },
  ];

  const getFiltersTranslations = (i18n: any, translations: any) => {
    translations.fields.show = i18n.t("filters.show.label");
    translations.options.show = {
      options: {
        following: i18n.t("filters.show.following"),
        notFollowing: i18n.t("filters.show.notFollowing"),
        all: i18n.t("filters.show.all"),
      },
    };
    translations.fields.withoutTags = i18n.t("filters.withoutTags");
  };

  const getMessagePanelTranslations = (i18n: any, translations: any) => {
    translations.fields.layout = i18n.t("fields.layout");
    translations.fields.vars = i18n.t("pages.instagram.panel.vars");
    translations.fields.personalMessage = i18n.t("pages.instagram.panel.personalMessage");
    translations.fields.collectiveMessage = i18n.t("pages.instagram.panel.collectiveMessage");
    translations.vars = i18n.t("pages.instagram.panel.variables", {
      returnObjects: true,
    });
    translations.messagePanel = {
      title: i18n.t("pages.instagram.panel.title"),
      subtitle: i18n.t("pages.instagram.panel.subtitle"),
      description: i18n.t("pages.instagram.description"),
      modes: {
        new: i18n.t("pages.instagram.panel.modes.createNew"),
        layout: i18n.t("pages.instagram.panel.modes.loadLayout"),
      },
    };
  };

  const getListPanelTranslations = (i18n: any, translations: any) => {
    translations.listPanel = {
      batchEdit: {
        title: i18n.t("pages.instagram.listPanel.batchEdit.title"),
        subtitle: i18n.t("pages.instagram.listPanel.batchEdit.subtitle"),
        description: i18n.t("pages.instagram.followers.description"),
      },
    };
  };

  const getChatTranslations = (i18n: any, translations: any) => {
    translations.openChat = i18n.t("pages.instagram.panel.openChat");
  };

  const getActionTranslations = (i18n: any, translations: any) => {
    translations[ACTIONS.CANCEL_MESSAGE] = {
      header: i18n.t("pages.instagram.actions.cancelMessage.header"),
      label: i18n.t("pages.instagram.actions.cancelMessage.label"),
    };
  };

  const translations = {
    ...Followings.getTranslations(i18n, Followings),
    ...getTranslation(i18n, "actions"),
    title: i18n.t("pages.instagram.following.title"),
    description: i18n.t("pages.instagram.following.description", { total: data.total }),
  };

  getFiltersTranslations(i18n, translations);
  getMessagePanelTranslations(i18n, translations);
  getListPanelTranslations(i18n, translations);
  getChatTranslations(i18n, translations);
  getActionTranslations(i18n, translations);

  const fields = await Followings.getFields({ searchParams, i18n });
  const multiFields = await Followings.getMultiFields({ searchParams, i18n });
  const filters = await Followings.getFilters({ searchParams, i18n });

  const layouts = (
    await Layouts.getAll(
      {
        filters: { type: "instagram" },
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
      multiFields={multiFields}
      layouts={layouts}
    />
  );
}
