"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { Tracks } from "@/app/services/tracks";
import { useRouter } from "next/navigation";

export default function TracksView(params: Readonly<any>) {
  const router = useRouter();
  const methods = Tracks.getMethods(router);

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
