"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { Bands } from "@/app/services/bands";
import { useRouter } from "next/navigation";

export default function BandsView(params: Readonly<any>) {
  const router = useRouter();
  const methods = Bands.getMethods(router);

  return (
    <ListLayout
      {...params}
      methods={methods}
      onSave={methods.onSave}
      onDelete={methods.onDelete}
      onCopy={methods.onCopy}
    />
  );
}
