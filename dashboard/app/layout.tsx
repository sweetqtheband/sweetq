import RootView from './view';
import './reset.css';
import './globals.scss';
import { Config } from './services/config';
import i18n from '@/app/services/translate';

// app/layout.tsx (Servidor)
export async function generateMetadata() {
  await i18n.init();

  return process.env.NEXT_PHASE !== 'phase-production-build' && i18n
    ? await Config.getMetadata(i18n)
    : {};
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <RootView>{children}</RootView>
      </body>
    </html>
  );
}
