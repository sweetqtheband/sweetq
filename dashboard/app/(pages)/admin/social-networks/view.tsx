"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { SocialNetworks } from "@/app/services/socialNetworks";
import { useRouter } from "next/navigation";

export default function SocialNetworksView(params: Readonly<any>) {
  const router = useRouter();
  const methods = SocialNetworks.getMethods(router);
  const renders = SocialNetworks.getRenders();

  return (
    <ListLayout
      {...params}
      methods={methods}
      renders={renders}
      sortable={true}
      onSave={methods.onSave}
      onDelete={methods.onDelete}
      onCopy={methods.onCopy}
      onSort={methods.onSort}
    />
  );
}
