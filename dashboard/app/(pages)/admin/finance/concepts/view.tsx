"use client";

import ListLayout from "@/app/components/layouts/list-layout";
import { FinanceConcepts } from "@/app/services/financeConcepts";
import { useRouter } from "next/navigation";

export default function FinanceConceptsView(params: Readonly<any>) {
  const router = useRouter();
  const methods = FinanceConcepts.getMethods(router);
  const renders = FinanceConcepts.getRenders();

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
