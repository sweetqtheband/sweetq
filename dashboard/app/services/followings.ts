import axios from "./_db";
import { BaseList } from "./_list";
import { FIELD_DEFAULTS, FIELD_TYPES, FILTER_IDLE, RENDER_TYPES, TREATMENTS } from "../constants";
import { Countries } from "./countries";
import { States } from "./states";
import { Cities } from "./cities";
import { onSave, onDelete } from "./_methods";
import { Tags } from "./tags";
import { Edit, SendAlt, SyncSettings } from "@carbon/react/icons";
import { client as InstagramMessagesClient } from "./instagramMessages";
import { instagram } from "./instagram";
import { Filters } from "./filters";
import { Imports } from "./imports";
import { batchActionProps } from "@/types/batchActionProps";
import { t } from "../utils";

export const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/followings`,
});

export const Types = {
  id: FIELD_TYPES.HIDDEN,
  updated: FIELD_TYPES.HIDDEN,
  created: FIELD_TYPES.HIDDEN,
  is_private: FIELD_TYPES.HIDDEN,
  is_verified: FIELD_TYPES.HIDDEN,
  profile_pic_url: FIELD_TYPES.IMAGE,
  requested_by_viewer: FIELD_TYPES.HIDDEN,
  username: FIELD_TYPES.LINK,
  full_name: FIELD_TYPES.LABEL,
  short_name: FIELD_TYPES.TEXT,
  country: FIELD_TYPES.NONE,
  state: FIELD_TYPES.NONE,
  city: FIELD_TYPES.CITY,
  treatment: FIELD_TYPES.SELECT,
  tags: FIELD_TYPES.MULTISELECT,
  followed_back: FIELD_TYPES.BOOLEAN,
};

export const Options = {
  treatment: {
    options: TREATMENTS.map((treatment: string, index: number) => ({
      id: index + 1,
      value: treatment,
    })),
  },
};

// Fields
const fields = {
  titles: {
    id: "fields.id",
    username: "fields.username",
    short_name: "fields.shortName",
    full_name: "fields.fullName",
    profile_pic_url: "fields.profileImage",
    country: "fields.country",
    state: "fields.state",
    city: "fields.city",
    treatment: "fields.treatment",
    tags: "fields.tags",
  },
  types: Types,
  options: Options,
};

const multiFields = {
  titles: {
    country: "fields.country",
    state: "fields.state",
    city: "fields.city",
    treatment: "fields.treatment",
    tags: "fields.tags",
  },
  types: {
    country: FIELD_TYPES.NONE,
    state: FIELD_TYPES.NONE,
    city: FIELD_TYPES.CITY,
    treatment: FIELD_TYPES.SELECT,
    tags: FIELD_TYPES.MULTISELECT,
  },
  options: Options,
};

export const ACTIONS = {
  BATCH_EDIT: "batchEdit",
  CANCEL_MESSAGE: "cancelMessage",
  MESSAGE: "message",
  SYNC: "sync",
};

// Get shared fields function
const getSharedOptionsFields = async ({
  searchParams,
  i18n,
}: Readonly<{ searchParams: any; i18n: any }>) => {
  return {
    country: {
      ...(await Countries.getOptions({ locale: i18n.locale })),
    },
    state: await States.getOptions({
      locale: i18n.locale,
      query: searchParams?.["panel.country"] ? { country_id: searchParams["panel.country"] } : null,
    }),
    city: await Cities.getOptions({
      locale: i18n.locale,
      query: searchParams?.["panel.state"] ? { state_id: searchParams["panel.state"] } : null,
    }),
    treatment: {
      options: Followings.fields.options.treatment.options.map((option) => ({
        ...option,
        value: i18n.t(option.value),
      })),
    },
    tags: {
      ...(await Tags.getOptions()),
    },
  };
};

const getSharedSearchFields = ({
  searchParams,
  i18n,
}: Readonly<{ searchParams: any; i18n: any }>) => {
  return {
    search: {
      country: {
        deletes: ["state", "city"],
      },
      state: {
        deletes: ["city"],
      },
      city: {}, // No deletes
      params: searchParams,
    },
  };
};

const getMultiFields = async ({
  searchParams,
  i18n,
}: Readonly<{ searchParams: any; i18n: any }>) => {
  if (!searchParams?.["panel.country"]) {
    searchParams["panel.country"] = FIELD_DEFAULTS.COUNTRY;
  }

  return {
    ...Followings.multiFields,
    options: {
      ...(await getSharedOptionsFields({ searchParams, i18n })),
    },
    ...getSharedSearchFields({ searchParams, i18n }),
  };
};

// Get fields function
const getFields = async ({ searchParams, i18n }: Readonly<{ searchParams: any; i18n: any }>) => {
  if (!searchParams?.["panel.country"]) {
    searchParams["panel.country"] = FIELD_DEFAULTS.COUNTRY;
  }

  return {
    ...Followings.fields,
    options: {
      ...Followings.fields.options,
      ...(await getSharedOptionsFields({ searchParams, i18n })),
      username: {
        link: {
          pattern: "https://instagram.com/#value#",
        },
      },
    },
    ...getSharedSearchFields({ searchParams, i18n }),
  };
};

// Get filters function
const getFilters = async ({ searchParams, i18n }: Readonly<{ searchParams: any; i18n: any }>) => {
  const values = searchParams?.filter
    ? ((await Filters.getAll(searchParams)) as Record<string, any>)?.data
    : {};
  return {
    treatment: {
      translations: {
        fields: {
          treatment: i18n.t("fields.treatment"),
        },
        options: {
          treatment: Followings.fields.options.treatment.options.reduce(
            (acc, option) => ({
              ...acc,
              [option.id]: i18n.t(option.value),
            }),
            {}
          ),
        },
      },
      fields: {
        options: {
          treatment: {
            options: Followings.fields.options.treatment.options,
          },
        },
      },
      type: FIELD_TYPES.CHECKBOX,
      value: values?.treatment || null,
    },
    country: {
      translations: {
        fields: {
          country: i18n.t("fields.country"),
        },
      },
      fields: {
        options: {
          country: await Countries.getOptions({ locale: i18n.locale }),
        },
        search: {
          params: searchParams,
        },
      },
      type: FIELD_TYPES.FILTER_COUNTRY,
      value: values?.country || null,
    },
    state: {
      translations: {
        fields: {
          state: i18n.t("fields.state"),
        },
      },
      fields: {
        options: {
          state: await States.getOptions({
            locale: i18n.locale,
            query: { country_id: values?.country ? values.country : FIELD_DEFAULTS.COUNTRY },
          }),
        },
        search: {
          params: searchParams,
        },
      },
      type: FIELD_TYPES.FILTER_STATE,
      value: values?.state || null,
    },
    city: {
      translations: {
        fields: {
          city: i18n.t("fields.city"),
        },
      },
      fields: {
        options: {
          city: await Cities.getOptions({
            locale: i18n.locale,
            query: values?.state ? { state_id: values.state } : null,
          }),
        },
        search: {
          params: searchParams,
        },
      },
      type: FIELD_TYPES.FILTER_CITY,
      value: values?.city || null,
    },
    show: {
      translations: {
        fields: {
          show: i18n.t("filters.show.label"),
        },
      },
      fields: {
        options: {
          show: {
            options: [
              { id: "0", value: i18n.t("filters.show.following") },
              { id: "1", value: i18n.t("filters.show.notFollowing") },
              { id: "2", value: i18n.t("filters.show.all") },
            ],
          },
        },
      },
      value: values?.show || "0",
      type: FIELD_TYPES.SELECT,
    },
    tags: {
      translations: {
        fields: {
          tags: i18n.t("fields.tags"),
        },
      },
      fields: {
        options: {
          tags: await Tags.getOptions({
            locale: i18n.locale,
            filters: values?.tags ? { tags: values.tags } : null,
          }),
        },
      },
      type: FIELD_TYPES.MULTISELECT,
      idle: FILTER_IDLE,
      value: values?.tags || null,
    },
    withoutTags: {
      translations: {
        fields: {
          withoutTags: i18n.t("filters.withoutTags"),
        },
      },
      fields: {
        options: {
          withoutTags: await Tags.getOptions({
            locale: i18n.locale,
            filters: values ? { tags: values.withoutTags } : null,
          }),
        },
      },
      type: FIELD_TYPES.MULTISELECT,
      idle: FILTER_IDLE,
      value: values?.withoutTags || null,
    },
  };
};

// Get methods function
const getMethods = (
  router?: any,
  translations?: any,
  batchEdit: boolean = false
): Record<string, any> => ({
  onFilterSave: Filters.getMethods(router).onSave,
  onSave: async (data: any, files: any, ids: string[]) => {
    if (!data.country) {
      data.country = FIELD_DEFAULTS.COUNTRY;
    }

    if (data.tags && data.tags instanceof Array && data.tags.length === 0) {
      data.tags = [];
    }
    if (ids?.length && batchEdit) {
      data.ids = ids;
    }

    return onSave(client, router, data, files, batchEdit);
  },
  tags: {
    onSave: Tags.getMethods(router).onListSave,
  },
  onMessageSave: async (data: any) => {
    if (!data.layoutId) {
      delete data.layoutId;
    }
    return onSave(InstagramMessagesClient, router, data, []);
  },

  onUserCancelSendMessage: async (data: any) => {
    return Promise.all(
      data.messages.map((messageId: any) => {
        onDelete(InstagramMessagesClient, router, messageId);
      })
    );
  },

  onSendInstagramMessage: async (data: any) => {
    return instagram.sendMessage(data);
  },
  action: {
    onClick: async (data: any, setItem: Function) => {
      setItem(data);
    },
    check: (data: any) => data?.instagram_id,
    icon: RENDER_TYPES.INSTAGRAM_MESSAGE,
    label: translations?.openChat,
  },
});
const getRenders = (): Record<string, Function> => ({
  username: (field: any, item: any, base: any) => {
    return {
      type: RENDER_TYPES.LINK,
      value: item,
      href: `https://instagram.com/${item}`,
    };
  },
  tags: Tags.getRenders().items,
  pending_messages: (field: any, item: any, base: any) => {
    return {
      type: RENDER_TYPES.STATUS_MESSAGE,
      value: item,
      item: base,
      action: ACTIONS.CANCEL_MESSAGE,
    };
  },
  followed_back: (field: any, item: any, base: any) => {
    return {
      type: RENDER_TYPES.BOOLEAN,
      value: item,
    };
  },
});

const getBatchActions = (batchActionProps: batchActionProps) => {
  const { translations } = batchActionProps;
  if (!translations) return;

  return {
    edit: {
      translations: {
        title: translations[ACTIONS.BATCH_EDIT],
      },
      icon: Edit,
      onClick: (selectedRows: string[]) => openBatchEditPanel({ ...batchActionProps, selectedRows }),
    },
    message: {
      translations: {
        title: translations.sendMessage,
      },
      icon: SendAlt,
      onClick: (selectedRows: string[]) => openMessagePanel({ ...batchActionProps, selectedRows }),
    },
    sync: {
      translations: {
        title: translations[ACTIONS.SYNC],
      },
      icon: SyncSettings,
      onClick: (selectedRows: string[]) => syncUsers({ ...batchActionProps, selectedRows }),
    }
  };
};

const getItemActions = (setAction: Function, translations: any) => {
  return {
    [ACTIONS.CANCEL_MESSAGE]: (obj: Record<string, any>) => {
      setAction({
        type: ACTIONS.CANCEL_MESSAGE,
        item: obj?.item,
        open: true,
        method: "onUserCancelSendMessage",
      });
    },
  };
};

// Followings service
export const Followings = {
  ...BaseList(client),
  fields,
  multiFields,
  getBatchActions,
  getItemActions,
  getRenders,
  getFilters,
  getFields,
  getMultiFields,
  getMethods,
};

// WATCHERS

const watchSyncProgress = (importId: string, onProgress: any = () => { }): Promise<Record<string, any>> => {
  return new Promise<Record<string, any>>((resolve, reject) => {

    const eventSource = new EventSource(
      `/api/imports/progress?id=${importId}`
    );

    eventSource.onmessage = (event) => {
      const progress = JSON.parse(event.data);

      onProgress(progress);
      if (progress.status === "completed") {
        eventSource.close();
        resolve(progress);
      }
      if (progress.status === "error") {
        eventSource.close();
        reject("Sync process encountered an error");
      }

    };
    eventSource.onerror = (error) => {
      eventSource.close();
      reject(error);
    };
  });
};

// ACTIONS

const openMessagePanel = async ({ selectedRows, setIds, setOpen }: batchActionProps) => {
  if (!setIds || !setOpen) return;
  setIds(selectedRows);
  setOpen(ACTIONS.MESSAGE);
};

const openBatchEditPanel = async ({ selectedRows, setIds, setOpen }: batchActionProps) => {
  if (!setIds || !setOpen) return;
  setIds(selectedRows);
  setOpen(ACTIONS.BATCH_EDIT);
};

const syncUsers = async ({ selectedRows, translations, setIsLoading, setIsWaiting, setItems, Toast, router }: batchActionProps) => {
  if (!setIsLoading || !setIsWaiting || !setItems || !Toast || !router) return;

  const toastId = await Toast.addToast({ title: translations?.imports.toast.title, subtitle: t(translations?.imports.toast.syncing, { percentage: '0%' }) });

  setIsWaiting(true);
  setIsLoading(true);

  const syncId = await Imports.onSync({ userIds: selectedRows, origin: "followings" });
  try {
    const response = await watchSyncProgress(syncId, (progress: any) => {
      Toast.updateToast(toastId, { subtitle: t(translations?.imports.toast.syncing, { percentage: `${Math.round(progress.processed * 100 / progress.total)}%` }) });
    });

    if (response.status === 'completed' && Object.keys(response.results).length) {

      const updatedResults = Object.keys(response.results).filter((userId: any) => response.results[userId] !== null && response.results[userId] !== undefined).reduce((acc: Record<string, any>, key: string) => {
        acc[key] = response.results[key];
        return acc;
      }, {});
      const deleteResults = Object.keys(response.results).filter((userId: any) => response.results[userId] === null || response.results[userId] === undefined).reduce((acc: Record<string, any>, key: string) => {
        acc[key] = response.results[key];
        return acc;
      }, {});

      await onDelete(client, router, Object.keys(deleteResults), true);

      setItems((prevItems: any[]) => {
        const updatedItems = [...prevItems];
        Object.keys(updatedResults).forEach((userId) => {
          const updatedUser = updatedResults[userId];
          const index = updatedItems.findIndex(item => item.username === updatedUser.username);
          if (index !== -1) {
            updatedItems[index] = { ...updatedItems[index], ...updatedUser };
          }
        });
        Object.keys(deleteResults).forEach((userId) => {
          const index = updatedItems.findIndex(item => item._id === userId);
          if (index !== -1) {
            updatedItems.splice(index, 1);
          }
        });
        return updatedItems;
      });
      Toast.updateToast(toastId, { subtitle: translations?.imports.toast.synced, kind: "success" });

    } else {
      Toast.updateToast(toastId, { subtitle: translations?.imports.toast.failedSync, kind: "error" });
    }
  } catch (error: any) {
    console.error(`Error syncing users:`, error);
    Toast.updateToast(toastId, { subtitle: translations?.imports.toast.failedSync, kind: "error" });
  } finally {
    setIsLoading(false);
    setIsWaiting(false);
  }
};
