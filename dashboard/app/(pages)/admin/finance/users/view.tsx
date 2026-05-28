"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { FinanceUsers } from "@/app/services/financeUsers";
import { useRouter } from "next/navigation";

export default function FinanceUsersView(params: Readonly<any>) {
  const router = useRouter();
  const methods = FinanceUsers.getMethods(router);
  const renders = FinanceUsers.getRenders();

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
