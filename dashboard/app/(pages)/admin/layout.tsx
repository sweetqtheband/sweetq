import { Metadata } from 'next';
import Main from './main';
import '@carbon/styles/css/styles.css';
import './layout.scss';
import i18n from '@/app/services/translate';
import { routes } from './routes';

export const metadata: Metadata = {
  title: 'Sweet Q Dashboard',
  description: 'Sweet Q Dashboard',
};

export default async function ViewportLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await i18n.init();

  const translations = routes.reduce((acc, route) => {
    acc[route.text] = i18n.t(`routes.${route.text}`);
    return acc;
  }, {} as Record<string, string>);

  return <Main translations={translations}>{children}</Main>;
}
