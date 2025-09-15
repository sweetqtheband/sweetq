#!/usr/bin/env node

import 'dotenv/config';
import { pipe } from './shared/utils';

import { getCollection } from '@/app/services/api/_db';
import { createLogger } from './shared/logger.js';
import { FactorySvc } from '@/app/services/api/factory.js';
import { geminiSvc } from '@/app/services/gemini';

const { logProcess } = createLogger('gemini.log');

const followersSvc = FactorySvc('followers', await getCollection('followers'));

const fetchUsers = async (data: Record<string, any>) => {
  data.users = await followersSvc.model
    .find({
      $or: [
        { short_name: { $exists: false } },
        { short_name: null },
        { short_name: '' },
      ],
    })
    .toArray();
  return data;
};

const updateUsers = async (data: Record<string, any>) => {
  const { users } = data;
  for (const user of users) {
    const { short_name } = user;
    if (!short_name) {
      const updatedData = await geminiSvc.getUserData(
        JSON.stringify({ full_name: user.full_name, username: user.username })
      );

      await followersSvc.model.updateOne(
        { _id: user._id },
        { $set: { ...updatedData } }
      );
      logProcess(
        `Updated ${user.username} with short name ${updatedData.short_name}`
      );

      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
  }

  return data;
};

const end = async () => {
  process.exit(0);
};

(async () => {
  const data = {};
  await pipe(fetchUsers, updateUsers, end)(data);
})();
