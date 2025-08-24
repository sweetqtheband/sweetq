'use server';

import i18n from "@/app/services/translate";
import DashboardView from "./view";
import { FollowersByState } from "./charts.";
import { Dashboard } from "@/app/services/dashboard";
import './view.scss';


export default async function DashboardPage() {
  await i18n.init();

  const [followersByStateCharts, followersByStateTranslations] = await FollowersByState(); // precache data

  const translations = {
    ...Dashboard.getTranslations(i18n, Dashboard),
    ...followersByStateTranslations
  }
    
  const charts = {
    ...followersByStateCharts,
  }  

  return <DashboardView 
    charts={charts}
    translations={translations}
  />;
}
