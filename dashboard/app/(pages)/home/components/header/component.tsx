import HeaderView from "./view";
import "./header.scss";
import SocialNetworksModule from "./modules/social-networks";
import LogoModule from "./modules/logo";
import { HeaderComponentProps } from "@/app/(pages)/home/interfaces";
import SpotifyModule from "./modules/spotify";
export default async function HeaderComponent(props: Readonly<HeaderComponentProps>) {
  const { i18n, config } = props;
  const translations = {
    title: i18n.t("actions.action"),
  };

  return (
    <HeaderView
      translations={translations}
      headerImage={config?.headerImage}
      headerMobileImage={config?.headerImageMobile}
      headerVideo={config?.headerVideo}
      headerMobileVideo={config?.headerVideoMobile}
    >
      <SocialNetworksModule {...props} />
      <LogoModule {...props} />
      <SpotifyModule {...props} />
    </HeaderView>
  );
}
