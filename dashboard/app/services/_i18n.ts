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
  action: i18n.t('actions.action'),
  actions: i18n.t('actions.actions'),
  add: i18n.t('actions.add'),
  back: i18n.t('actions.back'),
  cancel: i18n.t('actions.cancel'),
  clear: i18n.t('actions.clear'),
  close: i18n.t('actions.close'),
  confirm: i18n.t('actions.confirm'),
  confirmDelete: i18n.t('actions.confirmDelete'),
  confirmDeleteSelected: i18n.t('actions.confirmDeleteSelected'),
  delete: i18n.t('actions.delete'),
  edit: i18n.t('actions.edit'),
  filter: i18n.t('actions.filter'),
  preview: i18n.t('actions.preview'),
  save: i18n.t('actions.save'),
  search: i18n.t('actions.search'),
  selectAll: i18n.t('actions.selectAll'),
  selectAllShort: i18n.t('actions.selectAllShort'),
  selected: i18n.t('actions.selected'),
  selectedShort: i18n.t('actions.selectedShort'),
  selecteds: i18n.t('actions.selecteds'),
  selectedsShort: i18n.t('actions.selectedsShort'),
  unselectAll: i18n.t('actions.unselectAll'),
  unselectAllShort: i18n.t('actions.unselectAllShort'),
  upload: i18n.t('actions.upload'),
  showPassword: i18n.t('actions.showPassword'),
  hidePassword: i18n.t('actions.hidePassword'),
  sendMessage: i18n.t('actions.sendMessage'),
});
