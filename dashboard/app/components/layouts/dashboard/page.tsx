import { Route } from "@/types/route";
import { ThemeProvider } from "@/app/providers/theme";
import DashboardView from "./view";
import "./dashboard.scss";
import { Aside } from "@/types/aside";

type DashboardLayoutPageProps = {
  children: React.ReactNode;
  aside?: Aside;
  layoutRoutes?: string[];
};
export async function DashboardLayout({
  children,
  aside,
  layoutRoutes = [],
}: DashboardLayoutPageProps) {
  return (
    <ThemeProvider>
      <DashboardView aside={aside} layoutRoutes={layoutRoutes}>
        {children}
      </DashboardView>
    </ThemeProvider>
  );
}
