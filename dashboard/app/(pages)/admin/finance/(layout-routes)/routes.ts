import { Route } from "@/types/route";

export const routes: Route[] = [
  {
    icon: "dashboard",
    text: "finance.routes.dashboard",
    path: "/admin/finance/dashboard",
  },
  {
    icon: "wallet",
    text: "finance.routes.fund",
    path: "/admin/finance/fund",
  },
  {
    icon: "calendar",
    text: "finance.routes.events",
    path: "/admin/finance/events",
  },
];
