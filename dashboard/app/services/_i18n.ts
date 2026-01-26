export const getTranslations = (i18n: any, instance: Record<string, any>) => ({
  availableLanguages: i18n.i18n.languages,
  locale: i18n.i18n.language,
  uploader: i18n.t("uploader"),
  date: i18n.t("date", { returnObjects: true }),
  languages: i18n.t("languages", { returnObjects: true }),
  fields: {
    ...Object.keys(instance?.fields?.titles || {}).reduce(
      (acc, key) => ({
        ...acc,
        [key]: i18n.t(instance.fields.titles[key]),
      }),
      {}
    ),
    limit: i18n.t("fields.limit"),
  } as Record<string, string>,
  groups: {
    ...Object.keys(instance?.fields?.titles?.groups || {}).reduce(
      (acc, key) => ({
        ...acc,
        [key]: i18n.t(instance.fields.titles.groups?.[key]),
      }),
      {}
    ),
  } as Record<string, string>,
  panels: {
    ...Object.keys(instance?.fields?.titles?.panel || {}).reduce(
      (acc, key) => ({
        ...acc,
        [key]: i18n.t(instance.fields.titles.panel?.[key]),
      }),
      {}
    ),
  } as Record<string, string>,
  options: Object.keys(instance?.fields.options || {})
    .filter((field) => instance.fields.options[field]?.options)
    .reduce(
      (options, field) => ({
        ...options,
        [field]: Object.keys(instance?.fields.options[field].options || {}).reduce((acc, key) => {
          return {
            ...acc,
            [instance.fields.options[field].options[key].id]: i18n.t(
              instance.fields.options[field].options[key].value
            ),
          };
        }, {}),
      }),
      {}
    ),
});

export const getTranslation = (i18n: any, key: string) => i18n.t(key, { returnObjects: true });
