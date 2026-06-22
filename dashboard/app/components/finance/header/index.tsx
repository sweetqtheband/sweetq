import "./header.scss";

interface FinanceHeaderComponentProps {
  translations: Record<string, string>;
}
export default function FinanceHeaderComponent({ translations }: FinanceHeaderComponentProps) {
  return (
    <header>
      <div className="icon">{translations.icon}</div>
      <div className="title">{translations.title}</div>
      <div className="subtitle">{translations.subtitle}</div>
    </header>
  );
}
