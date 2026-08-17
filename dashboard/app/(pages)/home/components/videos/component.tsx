import "./videos.scss";

import { HomeComponentProps } from "@/app/(pages)/home/interfaces";
export default async function VideosComponent(props: Readonly<HomeComponentProps>) {
  const { i18n } = props;
  const translations = {
    title: i18n.t("actions.action"),
  };

  return <div className="sq-section sq-videos"></div>;
}
