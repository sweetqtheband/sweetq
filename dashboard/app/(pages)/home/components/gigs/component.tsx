import { Gigs } from "@/app/services/gigs";
import "./gigs.scss";

import { HomeComponentProps } from "@/app/(pages)/home/interfaces";
export default async function GigsComponent(props: Readonly<HomeComponentProps>) {
  const { i18n } = props;
  const [futureGigs, pastGigs] = await Promise.all([Gigs.getFutureGigs(), Gigs.getPastGigs()]);

  console.log("Future Gigs:", futureGigs.length);
  console.log("Past Gigs:", pastGigs.length);

  return (
    <div className="sq-section sq-gigs">
      <div className="sq-wrapper">
        <div className="sq-title-wrapper">
          <div className="sq-subtitle">{i18n.t("home.gigs.title")}</div>
        </div>
      </div>
      <div className="sq-gigs-list-wrapper"></div>
    </div>
  );
}
