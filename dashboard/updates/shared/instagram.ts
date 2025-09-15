import puppeteer from 'puppeteer';
import { getLocalHostIp } from './utils';

export const Instagram = {
  start: async (debugConsole = true) => {
    const options = {
      headless: false,
      defaultViewport: { width: 1024, height: 768 },
      browserURL: `http://${getLocalHostIp()}:9222`,
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      userDataDir:
        '/Users/jesus.garciag/Library/Application Support/Google/Chrome',
      args: ['--profile-directory=Profile 4'],
    };

    const browser = await puppeteer.connect(options);
    const page = await Instagram.initialize(browser, options, debugConsole);

    return [browser, page];
  },

  initialize: async (browser: any, options: any, debugConsole = true) => {
    console.log('LOGIN INTO INSTAGRAM');
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(90000);

    if (debugConsole) {
      page.on('console', (msg: any) => {
        console.log(`CONSOLE: ${msg.text()}`);
      });
    }

    await page.setViewport({
      width: options.defaultViewport.width,
      height: options.defaultViewport.height,
    });
    await page.goto('https://instagram.com', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 1000));
    return page;
  },

  acceptCookies: async (browser: any, page: any, params: any) => {
    const cookiesBtn = await page.waitForSelector('button._a9_0');
    await cookiesBtn.evaluate((b: any) => b.click());

    await new Promise((r) => setTimeout(r, 1000));

    await page.type('input[name="username"]', process.env.INSTAGRAM_USER);
    await page.type('input[name="password"]', process.env.INSTAGRAM_PASSWORD);
    await new Promise((r) => setTimeout(r, 1000));

    await page.click('button[type="submit"]');

    await new Promise((r) => setTimeout(r, 5000));

    const sessionBtn = await page.waitForSelector('.x1e56ztr > div');
    await sessionBtn.evaluate((b: any) => b.click());

    const notificationsBtn = await page.waitForSelector('button._a9_1');
    await notificationsBtn.evaluate((b: any) => b.click());
  },
};
