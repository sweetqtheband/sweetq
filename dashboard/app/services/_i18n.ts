export const getTranslations = (i18n: any, instance: Record<string, any>) => ({
  locale: i18n.i18n.language,
  uploader: i18n.t('uploader'),
  fields: {
    ...Object.keys(instance.fields.titles).reduce(
      (acc, key) => ({
        ...acc,
        [key]: i18n.t(instance.fields.titles[key]),
      }),
      {}
    ),
    limit: i18n.t('fields.limit'),
  } as Record<string, string>,
  options: Object.keys(instance.fields.options)
    .filter((field) => instance.fields.options[field]?.options)
    .reduce(
      (options, field) => ({
        ...options,
        [field]: Object.keys(instance.fields.options[field].options).reduce(
          (acc, key) => {
            return {
              ...acc,
              [instance.fields.options[field].options[key].id]: i18n.t(
                instance.fields.options[field].options[key].value
              ),
            };
          },
          {}
        ),
      }),
      {}
    ),
});

export const getActionsTranslations = (i18n: any) => ({
  add: i18n.t('actions.add'),
  save: i18n.t('actions.save'),
  selected: i18n.t('actions.selected'),
  selecteds: i18n.t('actions.selecteds'),
  selectAll: i18n.t('actions.selectAll'),
  unselectAll: i18n.t('actions.unselectAll'),
  delete: i18n.t('actions.delete'),
  cancel: i18n.t('actions.cancel'),
  selectNone: i18n.t('actions.selectNone'),
  actions: i18n.t('actions.actions'),
  action: i18n.t('actions.action'),
  clear: i18n.t('actions.clear'),
});
