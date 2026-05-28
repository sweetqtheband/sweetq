import i18n from "@/app/services/translate";
import { getTranslations } from "@/app/services/_i18n";

export default async function FinancePage() {
  await i18n.init();

  const translations = getTranslations(i18n, {
    title: "finance.title",
    description: "finance.description",
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{translations.title}</h1>
      <p>{translations.description}</p>
    </div>
  );
}
