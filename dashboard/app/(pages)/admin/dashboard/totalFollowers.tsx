import i18n from "@/app/services/translate";
import { Dashboard } from '@/app/services/dashboard';
import { CHART_TYPES } from "@/app/constants";
import { title } from "process";

const TAGS = {
  CONTACTED: '67a4942db925d9c803e9daef',
  ANSWERING: '67a49440b925d9c803e9daf0',
  SUPERFAN: '67a4947bb925d9c803e9daf1',
  FAN: '6800dda7a672d654a37d9929',  
}
  
const getTranslations = (translations: any[] = []) => {
   return {};
};

export default async function () {
  const response = await Dashboard.getTotalFollowers();

  const translations = getTranslations(response.translations);
  const charts:Record<string, any> = {
    totalFollowers: {
      type: CHART_TYPES.VALUES,
      options: {
        title: i18n.t('charts.followers'),
      },
      data: [
        { label: i18n.t('charts.totalFollowers'), value: response.total || 0 },
        { label: i18n.t('charts.contactedFollowers'), value: response.byTag.find((tag:Record<string, any>) => tag.id === TAGS.CONTACTED).count || 0 },
        { label: i18n.t('charts.answeringFollowers'), value: response.byTag.find((tag:Record<string, any>) => tag.id === TAGS.ANSWERING).count || 0 },
        { label: i18n.t('charts.superfanFollowers'), value: response.byTag.find((tag:Record<string, any>) => tag.id === TAGS.SUPERFAN).count || 0 },
        { label: i18n.t('charts.fanFollowers'), value: response.byTag.find((tag:Record<string, any>) => tag.id=== TAGS.FAN).count || 0 },
      ]
    },    
  }

  return [charts, translations];
}
