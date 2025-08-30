import i18n from "@/app/services/translate";
import { Dashboard } from "@/app/services/dashboard";
import { CHART_TYPES } from "@/app/constants";

const TAGS = {
  CONTACTED: "67a4942db925d9c803e9daef",
  ANSWERING: "67a49440b925d9c803e9daf0",
  SUPERFAN: "67a4947bb925d9c803e9daf1",
  FAN: "6800dda7a672d654a37d9929",
};

const getTranslations = (translations: any[] = []) => {
  return {};
};

const getTotalFollowers = (response: Record<string, any>, lost = false) => {
  const total = response[lost ? "lost" : "total"];
  const censed = response[`censed${lost ? "Lost" : ""}`];
  const byTag = response[`byTag${lost ? "Lost" : ""}`];
  const suffix = lost ? "Lost" : "";

  return {
    type: CHART_TYPES.VALUES,
    options: {
      title: i18n.t(`charts.followers${suffix}`),
    },
    data: [
      { label: i18n.t(`charts.totalFollowers${suffix}`), value: total || 0 },
      {
        label: i18n.t(`charts.contactedFollowers${suffix}`),
        value: byTag.find((tag: Record<string, any>) => tag.id === TAGS.CONTACTED).count || 0,
      },
      {
        label: i18n.t(`charts.answeringFollowers${suffix}`),
        value: byTag.find((tag: Record<string, any>) => tag.id === TAGS.ANSWERING).count || 0,
      },
      {
        label: i18n.t(`charts.censed${suffix}`),
        value: censed || 0,
      },
      {
        label: i18n.t(`charts.superfanFollowers${suffix}`),
        value: byTag.find((tag: Record<string, any>) => tag.id === TAGS.SUPERFAN).count || 0,
      },
      {
        label: i18n.t(`charts.fanFollowers${suffix}`),
        value: byTag.find((tag: Record<string, any>) => tag.id === TAGS.FAN).count || 0,
      },
    ],
  };
};

const getResponseRate = (response: Record<string, any>) => {
  const total =
    response.byTag.find((tag: Record<string, any>) => tag.id === TAGS.CONTACTED).count || 0;
  const answered =
    response.byTag.find((tag: Record<string, any>) => tag.id === TAGS.ANSWERING).count || 0;

  return {
    type: CHART_TYPES.BAR,
    options: {
      title: i18n.t(`charts.responseRate`),
      resizable: true,
      toolbar: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      meter: {
        proportional: {
          total,
        },
      },
      height: "90px",
    },
    data: [{ group: i18n.t(`charts.answering`), value: answered }],
  };
};

const getTotalCensedRate = (response: Record<string, any>) => {
  const total =
    response.byTag.find((tag: Record<string, any>) => tag.id === TAGS.ANSWERING).count || 0;
  const censed = response.censed || 0;

  return {
    type: CHART_TYPES.BAR,
    options: {
      title: i18n.t(`charts.censedTotal`),
      resizable: true,
      toolbar: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      meter: {
        proportional: {
          total,
        },
      },
      color: {
        scale: {
          [i18n.t(`charts.censed`)]: "#00B2A9",
        },
      },
      height: "90px",
    },
    data: [{ group: i18n.t(`charts.censed`), value: censed }],
  };
};

export default async function () {
  const response = await Dashboard.getTotalFollowers();

  const translations = getTranslations(response.translations);
  const charts: Record<string, any> = {
    row: {
      type: CHART_TYPES.ROW,
      data: [
        {
          totalFollowers: getTotalFollowers(response),
          totalFollowersLost: getTotalFollowers(response, true),
        },
        {
          responseRate: getResponseRate(response),
          totalCensedRate: getTotalCensedRate(response),
        },
      ],
    },
  };

  return [charts, translations];
}
