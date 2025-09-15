#!/usr/bin/env node

import 'dotenv/config';
import pLimit from 'p-limit';
import { getCollection } from '@/app/services/api/_db';
import { uploadSvc } from '../app/services/api/upload.js';
import { createLogger } from './shared/logger.js';
import { getUserImage, pipe } from './shared/utils.js';

const limit = pLimit(10); // Máximo 10 fetch simultáneos

const { logProcess } = createLogger('images.log');

const updateUser = async (users: any[], col: any) => {
  return Promise.allSettled(
    users.map((user) =>
      limit(async () => {
        // Limita la concurrencia
        logProcess(`UPDATING USER: ${user.username}`);

        if (user.instagram_profile_pic_url && !user.hasS3Image) {
          logProcess(`USER: ${user.username} DOESN'T HAVE S3 IMAGE`);
          user.instagram_profile_pic_url = user.profile_pic_url;
          const file = await getUserImage(user);
          if (file) {
            await uploadSvc.uploadS3(file, '/imgs/users');
            logProcess(`USER: ${user.username} IMAGE UPLOADED TO S3`);

            user.profile_pic_url = `/imgs/users/${file.name}`;
            user.hasS3Image = true;
          } else {
            logProcess(`USER: ${user.username} IMAGE NOT UPLOADED TO S3`);
            user.hasS3Image = false;
          }
        }

        return col.updateOne(
          { id: user.id },
          {
            $set: Object.keys(user).reduce((acc: Record<string, any>, key) => {
              acc[key] = user[key];
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
  console.log('UPDATING DB');
  const followersCol = await getCollection('followers');
  const followingsCol = await getCollection('followings');

  const { followers, followings } = params;

  // Update followers
  const updatedFollowers = await Promise.all(
    await updateUser(followers, followersCol)
  );

  logProcess('FOLLOWERS UPDATED');

  // Update followings
  const updatedFollowings = await Promise.all(
    await updateUser(followings, followingsCol)
  );

  logProcess('FOLLOWINGS UPDATED');

  params.updated = {
    followers: updatedFollowers.length,
    followings: updatedFollowings.length,
  };

  console.log('DONE');

  return params;
};

const fix = async (params: any) => {
  console.log('FIXING DB');
  const followersCol = await getCollection('followers');
  const followingsCol = await getCollection('followings');
  const condition = {
    hasS3Image: true,
  };
  const followers = await followersCol.find(condition).toArray();
  followers.forEach((user) => {
    if (!user.profile_pic_url.includes('imgs/users')) {
      return followersCol.updateOne(
        { id: user.id },
        {
          $set: {
            profile_pic_url: user.instagram_profile_pic_url,
          },
        },
        { upsert: true }
      );
    }
  });
};

const end = async (params: any = null) => {
  if (params) {
    const updateCol = await getCollection('update');

    console.log(
      `UPDATED FOLLOWERS: ${params.updated.followers} UPDATED FOLLOWINGS: ${params.updated.followings}`
    );
    await updateCol.deleteOne({ _id: params._id });
    console.log('END');
  } else {
    console.log('NO UPDATE SCHEDULED');
  }
  process.exit(0);
};

(async () => {
  const followersCol = await getCollection('followers');
  const followingsCol = await getCollection('followings');
  const mustUpdate: Record<string, any> = { followers: [], followings: [] };
  const condition = {
    hasS3Image: false,
    $and: [
      { instagram_profile_pic_url: { $ne: null } },
      { instagram_profile_pic_url: { $ne: '' } },
    ],
  };
  mustUpdate.followers = await followersCol.find(condition).toArray();
  mustUpdate.followings = await followingsCol.find(condition).toArray();

  logProcess('Followers: ' + mustUpdate.followers.length);
  logProcess('Followings: ' + mustUpdate.followings.length);
  await pipe(update, fix, end)(mustUpdate);
})();
