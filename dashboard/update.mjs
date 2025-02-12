#!/usr/bin/env node

import { configDotenv } from 'dotenv';
import { MongoClient } from 'mongodb';
import path from 'path';
import puppeteer from 'puppeteer';
import { scrap } from './scrap.mjs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

configDotenv({
  path: path.resolve(__dirname, '.env.local'),
});

let _db;

const getDb = async () => {
  if (!_db) {
    const client = new MongoClient(process.env.MONGODB_URI, {
      ...(process.env.NODE_ENV === 'production'
        ? {
            auth: {
              username: process.env.MONGODB_USER,
              password: process.env.MONGODB_PASSWORD,
            },
            authSource: process.env.MONGODB_AUTH_SOURCE,
          }
        : {}),
    });

    await client.connect();

    _db = client.db(process.env.MONGODB_DATABASE);
  }
  return _db;
};

const getCollection = async (collection) => {
  const db = await getDb();
  return db.collection(collection);
};

const browsers = {
  development: async (params) => {
    console.log('DEVELOPMENT BROWSE');
    const options = {
      headless: false,
      defaultViewport: { width: 1024, height: 1600 },
      browserURL: 'http://localhost:9222',
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      userDataDir:
        '/Users/jesus.garciag/Library/Application Support/Google/Chrome',
      args: ['--profile-directory=Profile 4'],
    };

    const browser = await puppeteer.connect(options);
    const page = await initialize(browser, options);

    await scrapPage(browser, page, params);
  },
  production: async (params) => {
    const options = {
      headless: false,
      defaultViewport: { width: 1024, height: 1600 },
    };

    const browser = await puppeteer.launch(options);
    const page = await initialize(browser, options);
    await acceptCookies(browser, page, params);

    await scrapPage(browser, page, params);
  },
};

const initialize = async (browser, options) => {
  console.log('LOGIN INTO INSTAGRAM');
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(90000);

  page.on('console', (msg) => {
    console.log(`CONSOLE: ${msg.text()}`);
  });

  await page.setViewport({
    width: options.defaultViewport.width,
    height: options.defaultViewport.height,
  });
  await page.goto('https://instagram.com', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1000));
  return page;
};

const acceptCookies = async (browser, page, params) => {
  const cookiesBtn = await page.waitForSelector('button._a9_0');
  await cookiesBtn.evaluate((b) => b.click());

  await new Promise((r) => setTimeout(r, 1000));

  await page.type('input[name="username"]', process.env.INSTAGRAM_USER);
  await page.type('input[name="password"]', process.env.INSTAGRAM_PASSWORD);
  await new Promise((r) => setTimeout(r, 1000));

  await page.click('button[type="submit"]');

  await new Promise((r) => setTimeout(r, 5000));

  const sessionBtn = await page.waitForSelector('.x1e56ztr > div');
  await sessionBtn.evaluate((b) => b.click());

  const notificationsBtn = await page.waitForSelector('button._a9_1');
  await notificationsBtn.evaluate((b) => b.click());
};

const browse = async (params) => {
  await browsers[process.env.NODE_ENV](params);
  return params;
};

const scrapPage = async (browser, page, params) => {
  console.log('SCRAPPING DATA...');
  const scrappedData = await page.evaluate(
    scrap,
    process.env.INSTAGRAM_USERNAME
  );
  params.followers = scrappedData.followers;
  params.followings = scrappedData.followings;
  console.log('DONE');

  browser.close();

  return params;
};

const update = async (params) => {
  console.log('UPDATING DB');
  const followersCol = await getCollection('followers');
  const followingsCol = await getCollection('followings');

  const { followers, followings } = params;

  const updateDate = new Date();

  // Update followers
  const updatedFollowers = await Promise.all(
    followers.map((follower) =>
      followersCol.updateOne(
        { id: follower.id },
        {
          $set: Object.keys(follower).reduce((acc, key) => {
            acc[key] = follower[key];
            acc.updated = updateDate;
            return acc;
          }, {}),
        },
        { upsert: true }
      )
    )
  );
  // Update followings
  const updatedFollowings = await Promise.all(
    followings.map((following) =>
      followingsCol.updateOne(
        { id: following.id },
        {
          $set: Object.keys(following).reduce((acc, key) => {
            acc[key] = following[key];
            acc.updated = updateDate;
            return acc;
          }, {}),
        },
        { upsert: true }
      )
    )
  );

  followersCol.updateMany(
    { created: { $exists: false } },
    { $set: { created: updateDate } }
  );
  followingsCol.updateMany(
    { created: { $exists: false } },
    { $set: { created: updateDate } }
  );

  params.updated = {
    followers: updatedFollowers.length,
    followings: updatedFollowings.length,
  };

  console.log('DONE');

  return params;
};

const end = async (params) => {
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

const pipe = (...args) => {
  const [fn, ...rest] = args;
  return async (params) =>
    rest.length ? pipe(...rest)(await fn(params)) : fn(params);
};

(async () => {
  // First of all, check if currently we have any update signal in db
  const updateCol = await getCollection('update');
  const followersCol = await getCollection('followers');
  const followingsCol = await getCollection('followings');

  const mustUpdate = await updateCol.findOne();
  if (mustUpdate) {
    mustUpdate.followers = await followersCol.find().toArray();
    mustUpdate.followings = await followingsCol.find().toArray();

    await pipe(browse, update, end)(mustUpdate);
  } else {
    await end();
  }
})();
