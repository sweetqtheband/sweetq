#!/usr/bin/env node

import "dotenv/config";
import { pipe } from "./shared/utils";

import { getCollection } from "@/app/services/api/_db";
import { createLogger } from "./shared/logger.js";
import { FactorySvc } from "@/app/services/api/factory.js";
import { geminiSvc } from "@/app/services/gemini";

const { logProcess } = createLogger("gemini.log");

const followersSvc = FactorySvc("followers", await getCollection("followers"));
const followingsSvc = FactorySvc("followings", await getCollection("followings"));

const fetchUsers = async (svc: any) => {
  return svc.model
    .find({
      $or: [{ short_name: { $exists: false } }, { short_name: null }, { short_name: "" }],
    })
    .toArray();
};

const fetchFollowers = async (data: Record<string, any>) => {
  data.followers = await fetchUsers(followersSvc);
  return data;
};

const fetchFollowings = async (data: Record<string, any>) => {
  data.followings = await fetchUsers(followingsSvc);
  return data;
};

const updateUser = async (user: Record<string, any>, svc: any) => {
  try {
    const { short_name } = user;
    if (!short_name) {
      const updatedData = await geminiSvc.getUserData(
        JSON.stringify({ full_name: user.full_name, username: user.username })
      );

      await svc.model.updateOne({ _id: user._id }, { $set: { ...updatedData } });
      logProcess(`Updated ${user.username} with short name ${updatedData.short_name}`);

      return await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage.includes("503 Service Unavailable")) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return await updateUser(user, svc);
    }

    if (errorMessage.includes("429 Too Many Requests")) {
      logProcess("Rate limit reached. Changing current model and retrying");
      geminiSvc.setCurrentModel();
      return await updateUser(user, svc);
    }
  }
};

const updateFollowers = async (data: Record<string, any>) => {
  const { followers } = data;
  for (const follower of followers) {
    await updateUser(follower, followersSvc);
  }

  return data;
};

const matchFollowingsWithFollowers = async (data: Record<string, any>) => {
  const { followings } = data;

  await Promise.all(
    followings.map(async (following: Record<string, any>, index: number) => {
      const follower = await followersSvc.findOne({ username: following.username });
      delete follower?._id;

      if (follower) {
        await followingsSvc.model.updateOne({ _id: following._id }, { $set: { ...follower } });
        logProcess(
          `Updated following ${following.username} with follower short name ${follower.short_name}`
        );

        delete data.followings[index];
      }
    })
  );

  return data;
};

const updateFollowings = async (data: Record<string, any>) => {
  const { followings } = data;
  for (const following of followings) {
    await updateUser(following, followingsSvc);
  }
};

const end = async () => {
  process.exit(0);
};

(async () => {
  const data = {};
  await pipe(
    fetchFollowers,
    updateFollowers,
    fetchFollowings,
    matchFollowingsWithFollowers,
    updateFollowings,
    end
  )(data);
})();
