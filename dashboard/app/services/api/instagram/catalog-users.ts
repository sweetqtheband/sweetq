import { ObjectId, type Collection, type Document } from "mongodb";
import type { z } from "zod";
import type { CatalogUsersInput } from "./validators";
import { visibleInstagramUserFilter } from "./user-visibility";

type CatalogInput = z.infer<typeof CatalogUsersInput>;

export async function getCatalogUsers(
  input: CatalogInput,
  users: Collection<Document>,
  tags: Collection<Document>,
  getMessages: (conversationId: string) => Promise<unknown[]>,
) {
  const responseTags = await tags.find({ name: "Responde" }).toArray();
  if (responseTags.length !== 1) {
    throw new Error("Expected exactly one Responde tag");
  }
  const filter: Document = {
    ...visibleInstagramUserFilter,
    instagram_conversation_id: { $type: "string", $ne: "" },
    catalogued: { $exists: false },
    tags: String(responseTags[0]._id),
    $or: [{ state: { $exists: false } }, { state: NaN }],
  };
  if (input.action === "list") {
    if (input.cursor) filter._id = { $gt: new ObjectId(input.cursor) };
    const records = await users.find(filter, {
      projection: { username: 1, full_name: 1, country: 1, state: 1, city: 1, tags: 1, instagram_conversation_id: 1 },
    }).sort({ _id: 1 }).limit(input.limit + 1).toArray();
    const has_more = records.length > input.limit;
    const items = records.slice(0, input.limit);
    return { origin: input.origin, items, has_more, next_cursor: has_more ? String(items[items.length - 1]._id) : null };
  }

  if (!input.user_id) throw new Error("user_id is required");
  const user = await users.findOne({ ...filter, _id: new ObjectId(input.user_id) }, {
    projection: { username: 1, instagram_conversation_id: 1 },
  });
  if (!user || typeof user.username !== "string" || !user.username || typeof user.instagram_conversation_id !== "string") {
    throw new Error("Candidate not found or no longer eligible");
  }
  const messages = await getMessages(user.instagram_conversation_id);
  if (!Array.isArray(messages)) throw new Error("Invalid Instagram messages");
  const incoming = messages.flatMap((message: unknown) => {
    if (!message || typeof message !== "object" || !("from" in message)) {
      throw new Error("Invalid Instagram message");
    }
    const sender = message.from;
    if (!sender || typeof sender !== "object" || !("username" in sender) || typeof sender.username !== "string") {
      throw new Error("Invalid Instagram message");
    }
    if (!("message" in message) || message.message === null) return [];
    if (typeof message.message !== "string") throw new Error("Invalid Instagram message");
    return sender.username === user.username && message.message.length > 0 ? [message.message] : [];
  });
  return { origin: input.origin, user_id: String(user._id), username: user.username, messages: incoming.reverse() };
}
