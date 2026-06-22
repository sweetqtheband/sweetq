import { routes } from "./routes";
import { DashboardLayout } from "@/app/components/layouts/dashboard/page";
import { useTranslation } from "@/app/providers/translation";
import i18n from "@/app/services/translate";
import { getTranslation } from "@/app/services/_list";
import { FinanceUsersComponent } from "@/app/components/finance/users";
import { createAside } from "@/app/helpers/dashboard";
import { Menu } from "@/app/components/custom";
import FinanceHeaderComponent from "@/app/components/finance/header";

interface FinanceLayoutProps {
  children: React.ReactNode;
}
export default async function FinanceLayout({ children }: FinanceLayoutProps) {
  await i18n.init();

  const translations = {
    ...getTranslation(i18n, "finance.routes", true),
    title: getTranslation(i18n, "finance.layout.title"),
    subtitle: getTranslation(i18n, "finance.layout.subtitle"),
    icon: getTranslation(i18n, "finance.layout.icon"),
  };

  const dashboardLayoutRoutes = routes.map((route) => route.path) as string[];
  dashboardLayoutRoutes.push("/admin/finance");

  const { getAside, addBefore, addAfter, addMain } = createAside();
  addBefore(<FinanceHeaderComponent key="financeHeader" translations={translations} />, "header");
  addAfter(<FinanceUsersComponent key="financeUsers" />, "users");
  addMain(<Menu routes={routes} translations={translations} key="financeMenu" />, "menu");
  const aside = getAside();

  return (
    <DashboardLayout layoutRoutes={dashboardLayoutRoutes} aside={aside}>
      {children}
    </DashboardLayout>
  );
}
