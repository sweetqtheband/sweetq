
import { Metadata } from "next";
import Main from "./main";

import './layout.scss';

export const metadata: Metadata = {
  title: "Sweet Q Dashboard",
  description: "Sweet Q Dashboard",
};

export default async function ViewportLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (<Main>{children}</Main>);
}
