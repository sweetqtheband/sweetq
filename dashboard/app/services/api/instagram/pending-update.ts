import { Collection, Document, ObjectId } from "mongodb";
import type { InstagramProfile } from "@/types/instagram-profile";

type PendingUser = { _id: string };
type PendingUsers = { followers: PendingUser[]; followings: PendingUser[] };
type Origin = keyof PendingUsers;
type UpdateProfile = Record<string, unknown> & { username: string; profile_pic_url: string };

type UpdateService = {
  getProfile: (username: string) => Promise<InstagramProfile | null>;
  updateUser: (
    profile: UpdateProfile,
    current: Document[],
    collection: Collection<Document>,
    matches: string[],
    filter: { _id: ObjectId; extracted: false },
  ) => Promise<unknown>;
};

export async function updatePendingUsers(
  input: PendingUsers,
  collections: Record<Origin, Collection<Document>>,
  service: UpdateService,
) {
  for (const origin of ["followers", "followings"] as const) {
    const ids = input[origin].map((user) => user._id.toLowerCase());
    if (new Set(ids).size !== ids.length) {
      throw new Error(`Duplicate user IDs in ${origin}`);
    }
  }

  const results: Record<Origin, Array<{ _id: string; status: "updated" | "skipped" | "error"; message?: string }>> = {
    followers: [],
    followings: [],
  };

  for (const origin of ["followers", "followings"] as const) {
    const collection = collections[origin];
    for (const entry of input[origin]) {
      const filter = { _id: new ObjectId(entry._id), extracted: false as const };
      try {
        const current = await collection.findOne(filter);
        if (!current) {
          results[origin].push({ _id: entry._id, status: "skipped", message: "User no longer pending or not found" });
          continue;
        }
        if (typeof current.username !== "string" || !/^[a-zA-Z0-9._]{1,30}$/.test(current.username)) {
          throw new Error("Invalid stored Instagram username");
        }

        const profile = await service.getProfile(current.username);
        if (!profile || !profile.username || profile.username.toLowerCase() !== current.username.toLowerCase()) {
          throw new Error("Instagram profile unavailable or username mismatch");
        }
        if (!profile.profile_pic_url) {
          throw new Error("Instagram profile image unavailable");
        }
        const updateProfile: UpdateProfile = {
          ...Object.fromEntries(Object.entries(profile).filter(([, value]) => value != null)),
          username: current.username,
          profile_pic_url: profile.profile_pic_url,
          extracted: true,
        };
        const matchedFollower = origin === "followings"
          ? await collections.followers.findOne({ username: current.username }, { projection: { _id: 1 } })
          : null;
        await service.updateUser(updateProfile, [current], collection, matchedFollower ? [current.username] : [], filter);
        results[origin].push({ _id: entry._id, status: "updated" });
      } catch (error) {
        console.error("[MCP] Pending user update failed", origin, entry._id, error instanceof Error ? error.name : "unknown error");
        results[origin].push({ _id: entry._id, status: "error", message: "Failed to fetch or update user" });
      }
    }
  }

  return results;
}
