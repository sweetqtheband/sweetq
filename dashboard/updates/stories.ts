import { randomUUID } from "node:crypto";
import { MongoServerError } from "mongodb";
import { getCollection } from "@/app/services/api/_db";
import { ensureStoryIndexes, getStoryInsights, listStories, saveStory, saveStoryInsights } from "@/app/services/api/instagram/stories";

const owner = randomUUID();
const lockId = "instagram_stories_sync";
const leaseMs = 180000;
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const [locks, stories, instagram] = await Promise.all([
    getCollection("scheduled_tasks"), getCollection("instagram_stories"), getCollection("instagram"),
  ]);
  await locks.createIndex({ key: 1 }, { unique: true });
  await ensureStoryIndexes(stories);
  while (true) {
    try {
      const now = new Date();
      let lock;
      try {
        lock = await locks.findOneAndUpdate(
          { key: lockId, $or: [{ lease_until: { $lte: now } }, { owner }] },
          { $set: { owner, lease_until: new Date(Date.now() + leaseMs) }, $setOnInsert: { key: lockId } },
          { upsert: true, returnDocument: "after" }
        );
      } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
          await pause(60000);
          continue;
        }
        throw error;
      }
      if (!lock) throw new Error("Unable to acquire stories sync lock");
      if (lock.backoff_until && new Date(lock.backoff_until) > now) {
        await locks.updateOne({ key: lockId, owner }, { $set: { lease_until: new Date(0) } });
        await pause(60000);
        continue;
      }
      const renew = async () => {
        const result = await locks.updateOne(
          { key: lockId, owner, lease_until: { $gt: new Date() } },
          { $set: { lease_until: new Date(Date.now() + leaseMs) } }
        );
        if (result.matchedCount !== 1) throw new Error("Stories sync lease lost");
      };
      const tokenData = await instagram.findOne({ id: "instagram" });
      if (!tokenData?.long_live_access_token || !tokenData.user_id) throw new Error("Instagram credentials unavailable");
      const token: string = tokenData.long_live_access_token;
      await stories.updateMany({ status: "active", expires_at: { $lte: now } }, { $set: { status: "expired" } });
      const hourly = !lock.last_poll || now.getTime() - new Date(lock.last_poll).getTime() >= 3600000;
      if (hourly) {
        let cursor: string | undefined;
        const seen = new Set<string>();
        do {
          await renew();
          const page = await listStories(token, tokenData.user_id, 50, cursor);
          for (const story of page.stories) await saveStory(stories, story);
          if (page.paging.has_more && (!page.paging.next_cursor || seen.has(page.paging.next_cursor))) throw new Error("Invalid stories pagination");
          cursor = page.paging.has_more ? page.paging.next_cursor ?? undefined : undefined;
          if (cursor) seen.add(cursor);
          if (cursor) await pause(500);
        } while (cursor);
        await locks.updateOne({ key: lockId, owner }, { $set: { last_poll: now } });
      }
      const due = await stories.find({
        status: "active", expires_at: { $gt: new Date() },
        $or: [
          { last_metrics_at: { $exists: false } },
          { last_metrics_at: { $lte: new Date(Date.now() - 3600000) } },
          { expires_at: { $lte: new Date(Date.now() + 10 * 60000) }, final_attempt_at: { $exists: false } },
        ],
      }).sort({ expires_at: 1 }).toArray();
      for (const story of due) {
        await renew();
        const captured = new Date();
        if (story.expires_at <= captured) continue;
        const insights = await getStoryInsights(token, story.id);
        await renew();
        await saveStoryInsights(stories, story.id, insights, captured);
        const finalAttempt = story.expires_at.getTime() - captured.getTime() <= 10 * 60000;
        await stories.updateOne({ _id: story._id }, { $set: { last_metrics_at: captured, ...(finalAttempt ? { final_attempt_at: captured } : {}) } });
        if (insights.unavailable.some((item) => item.reason === "rate_limited" || item.reason === "permission")) {
          throw new Error("Stories insights stopped due to rate limit or permission error");
        }
        await pause(500);
      }
      await locks.updateOne({ key: lockId, owner }, { $set: { lease_until: new Date(0) } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      const safeMessage = /^(Instagram credentials unavailable|Instagram stories request failed: [a-z_]+|Stories insights stopped due to rate limit or permission error|Stories sync lease lost|Invalid stories pagination)$/.test(message)
        ? message : error instanceof Error ? error.name : "unknown error";
      console.error("[stories sync] Failed", safeMessage);
      const backoff = /rate.limit|permission/i.test(message);
      await locks.updateOne({ key: lockId, owner }, { $set: { lease_until: new Date(0), ...(backoff ? { backoff_until: new Date(Date.now() + 3600000) } : {}) } });
    }
    await pause(60000);
  }
}

run().catch((error) => {
  console.error("[stories sync] Fatal error", error instanceof Error ? error.message : "unknown error");
  process.exitCode = 1;
});
