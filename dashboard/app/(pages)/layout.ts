

import { Metadata } from "next";

import './layout.scss';

export const metadata: Metadata = {
  title: "Sweet Q",
  description: "Sweet Q",
};

export default async function ViewportLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return children;
}
