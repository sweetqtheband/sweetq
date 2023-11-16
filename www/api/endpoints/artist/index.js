import { app } from "../../services/app";
import { authSvc } from "../../services/auth";
import puppeteer from "puppeteer";
import fs from "fs";

const file = "db.json";
const today = new Date().toISOString().split("T")[0];

const getDb = async (artistId, trackId) => {
  try {
    const data = JSON.parse(
      fs.readFileSync(file, { encoding: "utf8", flag: "r" })
    );

    if (new Date(data.updated) < new Date(today)) {
      return await updateDb(artistId, trackId);
    } else {
      return data;
    }
  } catch (e) {
    return await updateDb(artistId, trackId);
  }
};

const updateDb = async (artistId, trackId) => {
  const obj = await updateDataFromSpotify(artistId, trackId);
  obj.updated = today;
  fs.writeFileSync(file, JSON.stringify(obj));
  return obj;
};

const updateDataFromSpotify = async (artistId, trackId) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    headless: "new",
  });
  const page = await browser.newPage();
  await page.goto(`https://open.spotify.com/intl-es/artist/${artistId}`);
  const title = await page.waitForSelector('[data-testid="entityTitle"]');
  const text = await page.evaluateHandle((el) => el.nextElementSibling, title);
  const totalListeners = /(\d+)/g.exec(
    await page.evaluate((el) => el.textContent, text)
  )[0];

  const href = await page.waitForSelector(`[href$="/${trackId}"]`);
  const plays = await page.evaluateHandle(
    (el) => el.parentElement.parentElement.nextElementSibling,
    href
  );
  const totalPlays = await page.evaluate((el) => el.textContent, plays);
  await browser.close();
  return { listeners: totalListeners, plays: totalPlays };
};

app.get("/artist/:artistId/track/:trackId", async (req, res) => {
  if (authSvc.auth(req, res)) {
    const data = await getDb(req.params.artistId, req.params.trackId);
    res.json({ data });
  }
});
