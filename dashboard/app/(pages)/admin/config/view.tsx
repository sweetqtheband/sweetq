"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { Config } from "@/app/services/config";
import { useRouter } from "next/navigation";

export default function ConfigView(params: Readonly<any>) {
  const router = useRouter();
  const methods = Config.getMethods(router);
  const renders = Config.getRenders();

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
