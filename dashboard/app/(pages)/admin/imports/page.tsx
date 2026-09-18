import i18n from "@/app/services/translate";
import { getTranslation } from "@/app/services/_list";
import ImportsView from "./view";
import { getCollection } from "@/app/services/api/_db";
import "./imports.scss";


export default async function ImportsPage({
    searchParams,
}: Readonly<{ searchParams?: URLSearchParams }>) {
    await i18n.init();

    const translations = {
        title: await getTranslation(i18n, "imports.title"),
        fields: { file: await getTranslation(i18n, "imports.files") },
        uploader: await getTranslation(i18n, "uploader"),
        chart: {
            import: await getTranslation(i18n, "imports.chart"),
            progress: await getTranslation(i18n, "imports.progress")
        },
        button: await getTranslation(i18n, "imports.button")
    };

    const followersCol = await getCollection("followers");
    const followingsCol = await getCollection("followings");


    const followers = (await followersCol.find().toArray()).map(follower => follower.username);
    const followings = (await followingsCol.find().toArray()).map(following => following.username);

    return (
        <ImportsView translations={translations} followers={followers} followings={followings}>
        </ImportsView>
    );
}
