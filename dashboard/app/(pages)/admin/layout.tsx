import { Metadata } from "next";
import Main from "./main";
import "@carbon/styles/css/styles.css";
import "./layout.scss";
import i18n from "@/app/services/translate";
import { routes } from "./routes";
import { Route } from "@/types/route";
import { Config } from "@/app/services/config";

export const metadata: Metadata = Object.assign(Config.faviconMetadata, {
  title: "Sweet Q Dashboard",
  description: "Sweet Q Dashboard",
});

export default async function ViewportLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await i18n.init();

  const getTranslations = (routes: Route[]): Record<string, string> => {
    const translations: Record<string, string> = {};

    const traverse = (routes: Route[]) => {
      routes.forEach((route) => {
        translations[route.text] = i18n.t(`routes.${route.text}`);

        if (route.children?.length) {
          traverse(route.children);
        }
      });
    };

    traverse(routes);
    return translations;
  };

  const translations = getTranslations(routes);

  return <Main translations={translations}>{children}</Main>;
}
