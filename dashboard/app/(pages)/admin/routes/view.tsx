"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { Routes } from "@/app/services/routes";
import { useRouter } from "next/navigation";

export default function RoutesView(params: Readonly<any>) {
  const router = useRouter();
  const methods = Routes.getMethods(router);
  const renders = Routes.getRenders();

  return (
    <ListLayout
      {...params}
      methods={methods}
      renders={renders}
      onSave={methods.onSave}
      onDelete={methods.onDelete}
      onCopy={methods.onCopy}
    />
  );
}
