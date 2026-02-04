import { getCollection } from "@/app/services/api/_db";
import { pipe, ucFirst } from "./shared/utils";
import { Instagram } from "./shared/instagram";
import { Browser, Page } from "puppeteer";
import { FactorySvc } from "@/app/services/api/factory";
import { VARIABLES } from "@/app/constants";
import { createLogger } from "./shared/logger.js";

const { logProcess } = createLogger("messages.log");

const MESSAGE_LIMIT = 100;
let processedCount = 0;

const elements = {
  buttonMenuSendMessage: 'main section:nth-child(2) > div > div > div:nth-child(2) [role="button"]',
  buttonUserMenu: "main section:nth-child(2) > div > div > div:nth-child(3) > div",
  buttonDirectSendMessage: "main header > section:nth-of-type(2) [role=button]",
  buttonUserMenuSendMessage: "div button:nth-child(6)",
  inputMessage: 'div[aria-label="Mensaje"][contenteditable="true"]',
  buttonSendMessage: '[role="navigation"] + div [role="button"]',
  buttonSendMessageAlt: '[aria-label="Enviar"]',
};

const end = async () => {
  process.exit(0);
};

interface Message {
  obj: Record<string, any>;
}
interface InstagramMessage {
  obj: Record<string, any>;
  browser: Browser;
  page: Page;
}

const followersSvc = FactorySvc("followers", await getCollection("followers"));
const messagesSvc = FactorySvc("messages", await getCollection("messages"));
const layoutsSvc = FactorySvc("layouts", await getCollection("layouts"));
const tagsSvc = FactorySvc("tags", await getCollection("tags"));
const instagramSvc = FactorySvc("instagram", await getCollection("instagram"));
const citiesSvc = FactorySvc("cities", await getCollection("cities"));

const sendMessage = async ({ obj }: Message) => instagramSvc.sendMessage(instagramSvc, obj);

const sendMessageFromMenu = async (page: Page) => {
  try {
    const buttonMenuSendMessage = await page.waitForSelector(elements.buttonMenuSendMessage);
    await buttonMenuSendMessage?.click();

    const buttonSendMessage = await page.waitForSelector(elements.buttonUserMenuSendMessage);
    await buttonSendMessage?.click();
    return true;
  } catch {
    return false;
  }
};

const sendMessageFromMenuOld = async (page: Page) => {
  try {
    const buttonUserMenu = await page.waitForSelector(elements.buttonUserMenu);
    await buttonUserMenu?.click();

    const buttonSendMessage = await page.waitForSelector(elements.buttonUserMenuSendMessage);
    await buttonSendMessage?.click();
    return true;
  } catch {
    return false;
  }
};

const sendMessageDirectFromMenu = async (page: Page) => {
  try {
    const directFromMenu = await page.evaluate((handler: any) => {
      console.log((document.querySelector(handler) as HTMLElement)?.innerText);
      return (
        (document.querySelector(handler) as HTMLElement)?.innerText === "Send Message" ||
        (document.querySelector(handler) as HTMLElement)?.innerText === "Enviar mensaje"
      );
    }, elements.buttonDirectSendMessage);

    if (directFromMenu) {
      const buttonMenuSendMessage = await page.waitForSelector(elements.buttonDirectSendMessage);
      await buttonMenuSendMessage?.click();
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

const sendMessageFlow = async (page: Page) => {
  await wait(3);

  if (await sendMessageDirectFromMenu(page)) {
    return true;
  }

  if (await sendMessageFromMenu(page)) {
    return true;
  }

  if (await sendMessageFromMenuOld(page)) {
    return true;
  }
};

const sendInstagramMessage = async ({ obj, browser, page }: InstagramMessage) => {
  try {
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.goto(`https://instagram.com/${obj.user}`, {
      waitUntil: "networkidle2",
    });

    // Check if send message button exists in menu

    await sendMessageFlow(page);

    await page.waitForSelector(elements.inputMessage);

    await page.focus(elements.inputMessage); // Focaliza el campo de texto

    await randomWait(2);

    const text = obj.text
      .replace(/\r\n|\r|\n/g, "\n")
      .trim()
      .split("\n")
      .map((line: string) =>
        line.trim().startsWith("http://") || line.trim().startsWith("https://")
          ? line.trim()
          : ucFirst(line.trim())
      )
      .join("\n\n")
      .trim();

    for (let char of text) {
      if (char === "\n") {
        // Cuando encuentres un salto de línea, simula Shift + Enter
        await page.keyboard.down("Shift");
        await page.keyboard.press("Enter");
        await new Promise((r) => setTimeout(r, 50));
        await page.keyboard.up("Shift");
      } else {
        // Escribir los demás caracteres (incluidos los espacios)
        await page.type(elements.inputMessage, char, { delay: 10 });
      }
    }
    const buttonSendMessageAlt = await page.$(elements.buttonSendMessageAlt);

    if (buttonSendMessageAlt) {
      await buttonSendMessageAlt.click();
      return true;
    }

    const buttons = (await page.$$(elements.buttonSendMessage)) as any;
    const targetButton = await (async () => {
      for (const button of buttons) {
        const text = await button.evaluate((el: any) => el.innerText.trim());
        if (text === "Send" || text === "Enviar") {
          return button;
        }
      }
      return null;
    })();

    if (targetButton) {
      await targetButton.click();
    }

    return true;
  } catch (error) {
    console.log("Error sending Instagram message:", error);
    throw error;
  }
};

const wait = async (seconds: number, log: boolean = false) => {
  if (log) {
    logProcess(`Esperando ${seconds} segundos...`);
  }
  const randomTime = seconds * 1000;
  return new Promise((r) => setTimeout(r, randomTime));
};

const randomWait = async (seconds: number, log: boolean = false) => {
  if (log) {
    logProcess(`Esperando ${seconds} segundos...`);
  }
  const randomTime = Math.floor(Math.random() * (seconds * 1000 - 1000 + 1)) + 1000;
  return new Promise((r) => setTimeout(r, randomTime));
};

/**
 * Fetch messages
 * @param data
 * @returns
 */
const fetchMessages = async (data: any, noRetry: Boolean = false) => {
  const findOptions: Record<string, any> = {
    status: "scheduled",
  };

  const limit = MESSAGE_LIMIT - processedCount;

  if (processedCount >= MESSAGE_LIMIT) {
    processedCount = 0;
  }

  if (noRetry) {
    findOptions.retry = { $exists: false };
  }

  const messages = await messagesSvc.model
    .find(findOptions)
    .sort({ created: -1 })
    .limit(limit)
    .toArray();

  logProcess(`Recuperando ${messages.length} mensajes...`);

  if (messages.length === 0) {
    logProcess("No hay mensajes para procesar. Saliendo...");
    return end();
  }

  const layoutIds = messages.map((message: any) => message._layoutId);
  const layouts = await layoutsSvc.model.find({ _id: { $in: layoutIds } }).toArray();

  // Attach city names to followers

  const followerIds = messages.map((message: any) => message._followerId);
  const cities: Record<string, string>[] = [];
  const followers = (await followersSvc.model.find({ _id: { $in: followerIds } }).toArray()).reduce(
    (acc: Record<string, any>, follower: any) => {
      if (follower.city && cities.indexOf({ state: follower.state, city: follower.city }) === -1) {
        cities.push({ state_id: String(follower.state), id: String(follower.city) });
      }
      return {
        ...acc,
        [follower._id]: follower,
      };
    },
    {}
  );

  const cityNames = await citiesSvc.model
    .find({ $or: cities })
    .toArray()
    .then((items: any[]) =>
      items.reduce((acc: Record<string, string>, item: any) => {
        acc[item.id] = item.name.es;
        return acc;
      }, {})
    );

  data.tag = await tagsSvc.findOne({ name: "Contactado" });
  data.followers = followers;
  data.messages = messages;
  data.layouts = layouts.reduce(
    (acc: Record<string, any>, layout: any) => ({
      ...acc,
      [layout._id]: {
        ...layout.tpl,
      },
    }),
    {}
  );
  data.cities = cityNames;

  return data;
};

const useBrowser = {
  instance: {
    browser: null as Browser | null,
    page: null as Page | null,
  },
  async start(isHeadless: boolean) {
    if (!this.instance.browser) {
      const [browser, page] = await Instagram.start(isHeadless);
      this.instance.browser = browser;
      this.instance.page = page;
    }
    if (!this.instance.browser || !this.instance.page) {
      throw new Error("Browser or Page instance could not be initialized.");
    }
    return [this.instance.browser, this.instance.page];
  },
};

/**
 * Process messages
 * @param data
 * @returns
 */
const processMessages = async (data: any) => {
  const { messages, layouts, followers } = data;

  if (messages.length > 0) {
    for (const message of messages) {
      const follower = followers[message._followerId];

      let tpl =
        (!follower.treatment || follower.treatment === 1
          ? layouts[message._layoutId].personalMessage
          : layouts[message._layoutId].collectiveMessage) || "";

      VARIABLES.forEach((variable: Record<string, any>) => {
        const replacement =
          variable.id === "cityLabel" ? data.cities[follower.city] || "" : follower[variable.id];
        tpl = tpl.replace(variable.replacement, replacement || "");
      });

      let sent = false;

      if (follower?.instagram_conversation_id) {
        try {
          const textParts = tpl
            .replace(/\r\n|\r|\n/g, "\n")
            .trim()
            .split("\n");
          for (let i = 0; i < textParts.length; i++) {
            if (textParts[i].length) {
              await sendMessage({
                obj: {
                  conversation_id: follower.instagram_conversation_id,
                  recipient: follower.instagram_id,
                  text: textParts[i],
                },
              });

              await randomWait(3);
            }
          }
          sent = true;
        } catch (error) {
          logProcess(`Error al enviar mensaje a ${follower.username} via Instagram API: ${error}`);
        }
      } else {
        try {
          const [browserInstance, pageInstance] = await useBrowser.start(false);

          if (!browserInstance || !pageInstance) {
            throw new Error("Failed to initialize browser or page.");
          }

          sent = await sendInstagramMessage({
            obj: {
              user: follower.username,
              text: tpl,
            },
            browser: browserInstance as Browser,
            page: pageInstance as Page,
          });
        } catch (error) {
          logProcess(`Error al enviar mensaje a ${follower.username} via puppeteer: ${error}`);
        }
      }

      if (!sent) {
        if (message?.retry && message.retry >= 3) {
          logProcess(`Mensaje a ${follower.username} fallido después de 3 intentos. Se eliminará.`);
          await messagesSvc.delete({ _id: message._id }, true);
        } else {
          logProcess(
            `No se pudo enviar el mensaje a ${follower.username}. Se reprogramará para más tarde.`
          );
          await messagesSvc.update(
            { _id: message._id, retry: message?.retry ? message.retry + 1 : 1 },
            true
          );
        }
        continue;
      }
      await messagesSvc.update({ _id: message._id, status: "sent" }, true);

      await followersSvc.update({ _id: follower._id, tags: follower.tags }, true);

      logProcess(
        `Mensaje enviado via ${
          follower?.instagram_conversation_id ? "Instagram API" : "puppeteer"
        } a ${follower.username}: ${tpl.split("\n")[0]}...`
      );
      processedCount++;
      await randomWait(follower?.instagram_conversation_id ? 1 : 10, true);
    }
  }

  if (processedCount < MESSAGE_LIMIT) {
    logProcess(`Procesados ${processedCount} mensajes, esperando más...`);
    return await processMessages(await fetchMessages(data, true));
  }

  return data;
};

(async () => {
  const data = {};
  await pipe(fetchMessages, processMessages, end)(data);
})();
