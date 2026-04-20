import i18n from "@/app/services/translate";
import { HeaderComponent, GigsComponent, VideosComponent } from "./components";
import { Config } from "@/app/services/config";
import StyleToHead from "@/app/components/style-to-head";
import "./main.scss";

export default async function HomePage() {
  await i18n.init();

  const config = await Config.getActive();

  return (
    <>
      <HeaderComponent i18n={i18n} config={config} />
      <GigsComponent i18n={i18n} />
      <VideosComponent i18n={i18n} />
      <StyleToHead />
    </>
  );
}
