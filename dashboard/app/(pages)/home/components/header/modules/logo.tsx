import { HeaderComponentProps } from "@/app/(pages)/home/interfaces";
import DynamicStyles from "@/app/components/css/dynamic-styles";

export default async function LogoModule(props: Readonly<HeaderComponentProps>) {
  const { i18n, config } = props;
  const variables: Record<string, string> = {
    "logo-image": `url(${config.logo})`,
  };
  return (
    <>
      <DynamicStyles variables={variables} />
      <h1 className="sq-logo">
        <div className="sq-logo-image">
          <span className="visually-hidden">{i18n.t("home.logo.title")}</span>
        </div>
      </h1>
    </>
  );
}
