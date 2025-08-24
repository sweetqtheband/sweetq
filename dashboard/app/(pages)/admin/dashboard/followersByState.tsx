'use server';

import i18n from "@/app/services/translate";
import { Dashboard } from '@/app/services/dashboard';
import { CHART_TYPES } from "@/app/constants";
import { logger } from "@/app/logger";

const getTranslations = (translations: any[] = []) => {
   return {

    ...translations.reduce((acc: Record<string, any>, item: any) => {
      if (!acc.countries) {
        acc.countries = {};
      }

      if (!acc.states) {
        acc.states = {};
      }

      acc.countries[item.id] = item.name[i18n.locale];

      if (item.states && item.states.length) {
        item.states.forEach((state: any) => {
          acc.states[state.id] = state.name[i18n.locale];
        });
      }

      return acc;
    }, {} as Record<string, any>)
  };
};

export default async function getChart() {
  await i18n.init();

  const response = await Dashboard.getFollowersByState();
  logger('Followers by state', response);

  const translations = getTranslations(response.translations);

  const charts:Record<string, any> = Object.keys(response).filter(key => !['total','translations','unknown'].includes(key)).reduce((acc, key) => { 
    const countryId = `country${key}`;

    if (!acc[countryId]) {
      acc[countryId] = {};
    }    

     if (!acc.data) {
      acc[countryId].data = [];
    }

    Object.keys(response[key]).forEach(stateKey => {
      acc[countryId].data.push({
        group: `${translations.states[stateKey]} ${response[key][stateKey]}`,
        value: response[key][stateKey],
      });
    });

    acc[countryId].type = CHART_TYPES.DONUT;
    acc[countryId].options = {
      title: translations?.countries?.[key],
      resizable: true,
      toolbar: {
        enabled: false
      },
      donut: {
        alignment: 'center',
        center: {
          label: i18n.t('charts.censedFollowers')
        }
      },
      legend: {
        position: 'right',
        truncation: {
          type: 'none'
        },
      },
      pie: {
        labels: {
          enabled: false
        }
      }
    }

    return acc;

  }, {} as Record<string, any>);

  return [charts, translations];
}
