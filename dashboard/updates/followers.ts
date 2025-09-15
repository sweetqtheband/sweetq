#!/usr/bin/env node

import "dotenv/config";
import pLimit from "p-limit";
import { scrap } from "./shared/scrap.js";
import { getCollection } from "@/app/services/api/_db";
import { uploadSvc } from "../app/services/api/upload.js";
import { createLogger } from "./shared/logger.js";
import { getUserImage, pipe } from "./shared/utils.js";
import { Instagram } from "./shared/instagram.js";

const limit = pLimit(10); // Máximo 10 fetch simultáneos

const { logProcess } = createLogger("followers.log");

const browse = async (params: any) => {
  const [browser, page] = await Instagram.start();
  await scrapPage(browser, page, params);
  return params;
};

const scrapPage = async (browser: any, page: any, params: any) => {
  console.log("SCRAPPING DATA...");
  const scrappedData = await page.evaluate(scrap, process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME);
  params.scrapped = {
    followers: scrappedData.followers,
    followings: scrappedData.followings,
  };
  console.log("DONE");

  browser.close();

  return params;
};

const updateUser = async (scrappedUsers: any[], users: any[], col: any) => {
  return Promise.allSettled(
    scrappedUsers.map(async (user: any) =>
      limit(async () => {
        const fol = users.find((item: any) => item.id === user.id);

        logProcess(`UPDATING USER: ${user.username}`);

        // Follower doesn't have S3 image stored, proceed
        if ((fol && !fol.hasS3Image) || !fol) {
          logProcess(`USER: ${user.username} DOESN'T HAVE S3 IMAGE`);
          user.instagram_profile_pic_url = user.profile_pic_url;
          const file = await getUserImage(user);
          if (file) {
            await uploadSvc.uploadS3(file, "/imgs/users");
            logProcess(`USER: ${user.username} IMAGE UPLOADED TO S3`);

            user.profile_pic_url = `/imgs/users/${file.name}`;
            user.hasS3Image = true;
          } else {
            logProcess(`USER: ${user.username} IMAGE NOT UPLOADED TO S3`);
            user.hasS3Image = false;
          }
        } else if (fol.hasS3Image && fol.instagram_profile_pic_url !== user.profile_pic_url) {
          const file = await getUserImage(user);
          if (file) {
            await uploadSvc.deleteS3(fol.profile_pic_url);
            await uploadSvc.uploadS3(file, "/imgs/users");
            user.profile_pic_url = `/imgs/users/${file.name}`;
            logProcess(`USER: ${user.username} IMAGE UPDATED TO S3`);
          } else {
            fol.hasS3Image = false;
            logProcess(`USER: ${user.username} IMAGE NOT UPDATED TO S3`);
          }
        }

        return col.updateOne(
          { id: user.id },
          {
            $set: Object.keys(user).reduce((acc: Record<string, any>, key) => {
              acc[key] = user[key];
              acc.unfollow = false;
              return acc;
            }, {}),
          },
          { upsert: true }
        );
      })
    )
  );
};
const update = async (params: any) => {
  console.log("UPDATING DB");
  const followersCol = await getCollection("followers");
  const followingsCol = await getCollection("followings");

  const { followers, followings, scrapped } = params;
  const { followers: scrappedFollowers, followings: scrappedFollowings } = scrapped;

  const updateDate = new Date();

  // First of all, update all followers and followings with an unollow status
  await followersCol.updateMany({}, { $set: { unfollow: true, updateDate } });
  logProcess("FOLLOWERS UNFOLLOWED");
  await followingsCol.updateMany({}, { $set: { unfollow: true, updateDate } });
  logProcess("FOLLOWINGS UNFOLLOWED");

  console.log(scrappedFollowers, scrappedFollowings);

  // Update followers
  const updatedFollowers = await Promise.all(
    await updateUser(scrappedFollowers, followers, followersCol)
  );

  logProcess("FOLLOWERS UPDATED");

  // Update followings
  const updatedFollowings = await Promise.all(
    await updateUser(scrappedFollowings, followings, followingsCol)
  );

  logProcess("FOLLOWINGS UPDATED");

  // Finally, add created date if not exist
  await followersCol.updateMany({ created: { $exists: false } }, { $set: { created: updateDate } });

  logProcess("FOLLOWERS CREATED DATE UPDATED");
  await followingsCol.updateMany(
    { created: { $exists: false } },
    { $set: { created: updateDate } }
  );

  logProcess("FOLLOWINGS CREATED DATE UPDATED");

  params.updated = {
    followers: updatedFollowers.length,
    followings: updatedFollowings.length,
  };

  console.log("DONE");

  return params;
};

const end = async (params: any = null) => {
  if (params) {
    const updateCol = await getCollection("update");

    console.log(
      `UPDATED FOLLOWERS: ${params.updated.followers} UPDATED FOLLOWINGS: ${params.updated.followings}`
    );
    await updateCol.deleteOne({ _id: params._id });
    console.log("END");
  } else {
    console.log("NO UPDATE SCHEDULED");
  }
  process.exit(0);
};

(async () => {
  // First of all, check if currently we have any update signal in db
  const followersCol = await getCollection("followers");
  const followingsCol = await getCollection("followings");
  const data: Record<string, any> = {};
  data.scrapped = { followers: [], followings: [] };
  data.followers = await followersCol.find().toArray();
  data.followings = await followingsCol.find().toArray();

  logProcess("Followers: " + data.followers.length);
  logProcess("Followings: " + data.followings.length);
  await pipe(browse, update, end)(data);
})();
