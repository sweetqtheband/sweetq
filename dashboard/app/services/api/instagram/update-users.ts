import { Collection, Document, ObjectId } from "mongodb";
import { z } from "zod";
import { UpdateUsersInput } from "./validators";

type Origin = "followers" | "followings";
type UpdateUsers = z.infer<typeof UpdateUsersInput>;
type Result = { _id: string; status: "updated" | "not_found" | "error"; message?: string };

export class UpdateUsersInputError extends Error {}

export async function updateUsers(
  input: UpdateUsers,
  collections: Record<Origin, Collection<Document>>,
) {
  if (!input.followers && !input.followings) {
    throw new UpdateUsersInputError("Provide followers, followings, or both");
  }

  for (const origin of ["followers", "followings"] as const) {
    const seen = new Set<string>();
    for (const user of input[origin] ?? []) {
      const id = user._id.toLowerCase();
      if (seen.has(id)) throw new UpdateUsersInputError(`Duplicate user IDs in ${origin}`);
      seen.add(id);
      const keys = Object.keys(user).filter((key) => key !== "_id");
      if (!keys.length) throw new UpdateUsersInputError(`User in ${origin} has no fields to update`);
      if (keys.some((key) => key.startsWith("$") || key.includes(".") || key.includes("\0"))) {
        throw new UpdateUsersInputError(`Invalid field name in ${origin}`);
      }
    }
  }

  const results: Record<Origin, Result[]> = { followers: [], followings: [] };
  for (const origin of ["followers", "followings"] as const) {
    for (const user of input[origin] ?? []) {
      const { _id, ...fields } = user;
      try {
        const result = await collections[origin].updateOne(
          { _id: new ObjectId(_id) },
          { $set: fields },
        );
        if (!result.acknowledged) {
          throw new Error("MongoDB did not acknowledge the update");
        }
        results[origin].push({
          _id,
          status: result.matchedCount ? "updated" : "not_found",
        });
      } catch (error) {
        console.error("[MCP] User update failed", origin, _id, error instanceof Error ? error.name : "unknown error");
        results[origin].push({ _id, status: "error", message: "Failed to update user" });
      }
    }
  }
  return results;
}
