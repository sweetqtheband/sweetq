"use client";

import { Route } from "@/types/route";
import { Link, Icon } from "@/app/components/custom";
import "./menu.scss";
interface MenuProps {
  routes: Route[];
  translations: Record<string, string>;
}
export default function CustomMenu({ routes, translations }: MenuProps) {
  return (
    <nav className="menu">
      <ul>
        {routes.map((route: Route) => (
          <li key={route.path}>
            <Link href={route.path || "#"} className="sq-button">
              {route.icon && <Icon name={route.icon} />}
              {translations[route.text] || route.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
