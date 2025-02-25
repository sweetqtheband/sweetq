import i18n from '@/app/services/translate';
import LoginView from './view';
import './page.scss';

export default async function InstagramPage({
  searchParams,
}: Readonly<{ searchParams?: URLSearchParams }>) {
  await i18n.init();

  const translations = {
    email: i18n.t('fields.email'),
    password: i18n.t('fields.password'),
    login: i18n.t('actions.login'),
    showPassword: i18n.t('actions.showPassword'),
    hidePassword: i18n.t('actions.hidePassword'),
  };

  return <LoginView translations={translations} />;
}
