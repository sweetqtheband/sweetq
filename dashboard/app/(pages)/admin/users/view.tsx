"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { Users } from "@/app/services/users";
import { useRouter } from "next/navigation";

export default function UsersView(params: Readonly<any>) {
  const router = useRouter();
  const methods = Users.getMethods(router);
  const renders = Users.getRenders();

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
