"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { Gigs } from "@/app/services/gigs";
import GooglePlacesLoader from "@/app/components/google/places";
import { useRouter } from "next/navigation";

export default function GigsView(params: Readonly<any>) {
  const router = useRouter();
  const methods = Gigs.getMethods(router);

  return (
    <>
      <GooglePlacesLoader apiKey={params.apiKey} />
      <ListLayout
        {...params}
        methods={methods}
        onSave={methods.onSave}
        onDelete={methods.onDelete}
        onCopy={methods.onCopy}
      />
    </>
  );
}
