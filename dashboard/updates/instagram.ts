#!/usr/bin/env node

import "dotenv/config";
import { pipe } from "./shared/utils";

import { getCollection } from "@/app/services/api/_db";
import { createLogger } from "./shared/logger.js";
import { FactorySvc } from "@/app/services/api/factory.js";

const { logProcess } = createLogger("instagram.log");

const skipLimit = 100;

const instagramSvc = FactorySvc("instagram", await getCollection("instagram"));
const tagsSvc = FactorySvc("tags", await getCollection("tags"));
const followersSvc = FactorySvc("followers", await getCollection("followers"));
const followingsSvc = FactorySvc("followings", await getCollection("followings"));

const useTags = await tagsSvc.model.find({ name: { $in: ["Contactado", "Responde"] } }).toArray();

const getConversationMessageParticipants = async (
  conversation: Record<string, any>,
  retrying: boolean = false
): Promise<Record<string, any>> => {
  try {
    logProcess(
      `${retrying ? "Retrying fetching" : "Fetching"} messages from conversation ${conversation.id}`
    );
    const messages = await instagramSvc.getMessages(instagramSvc, conversation.id);

    await instagramSvc.cacheConversation(conversation.id, JSON.stringify(messages));

    return messages.reduce(
      (acc: Record<string, any>, message: Record<string, any>) => {
        if (!acc.from) acc.from = {};
        if (!acc.to) acc.to = {};
        if (message.from.username) {
          acc.from[message.from.username] = message.from.id;
        }
        if (message.to.data.length > 0) {
          message.to.data.forEach((to: Record<string, any>) => {
            acc.to[to.username] = to.id;
          });
        }
        return acc;
      },
      { conversationId: conversation.id }
    );
  } catch (error) {
    logProcess(`Error fetching messages from conversation ${conversation.id}, retrying`);
    if (!retrying) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return getConversationMessageParticipants(conversation, true);
    } else {
      // If it fails again, skip this conversation
      logProcess(`Failed fetching messages from conversation ${conversation.id}, skipping`);
      return { from: [], to: [], conversationId: conversation.id };
    }
  }
};

const fetchMessages = async (data: Record<string, any>) => {
  logProcess("Fetching conversations");
  const conversations = await instagramSvc.getConversations(instagramSvc);
  await instagramSvc.cacheConversations(conversations);
  logProcess(`Fetched ${conversations.length} conversations`);
  for (const conversation of conversations) {
    if (data.consecutiveSkipped >= skipLimit) {
      logProcess("Consecutive skipped limit reached, exiting");
      return data;
    }

    const follower = await followersSvc.findOne({
      instagram_conversation_id: conversation.id,
    });
    const following = await followingsSvc.findOne({
      instagram_conversation_id: conversation.id,
    });

    if (
      (!follower ||
        (follower && (!follower.instagram_id || !follower.instagram_conversation_id))) &&
      (!following ||
        (following && (!following.instagram_id || !following.instagram_conversation_id)))
    ) {
      try {
        const conversationMessage = await getConversationMessageParticipants(conversation);
        data.processed += 1;
        if (conversationMessage.from.length === 0 && conversationMessage.to.length === 0) {
          data.failed += 1;
          if (data.failed >= 2) {
            logProcess("Last 2 conversations failed, exiting");
            return data;
          }
        }
        await processMessage(conversationMessage);
        data.consecutiveSkipped = 0;
      } catch (error) {
        data.failed += 1;
      }
    } else {
      data.consecutiveSkipped += 1;
      data.skipped += 1;
      logProcess(`Follower ${follower.username} already setted. Skipping.`);
    }
  }

  return data;
};

const updateInstagramUser = async (
  user: Record<string, any>,
  message: Record<string, any>,
  tags: string[],
  type: "follower" | "following"
) => {
  logProcess(`Updating ${type} ${user.username}`);

  if (!user?.tags) {
    user.tags = [];
  }
  tags.map((tag: string) => {
    if (!user.tags.includes(tag)) {
      user.tags.push(tag);
    }
  });

  const obj = {
    _id: user._id,
    tags: user.tags,
    instagram_conversation_id: message.conversationId,
    instagram_id: message.from[user.username] || message.to[user.username],
  };
  const svc = type === "follower" ? followersSvc : followingsSvc;

  await svc.update(obj, true);
  logProcess(
    `Updated ${type} ${user.username} with tags ${user.tags}, conversationId: ${message.conversationId} and instagramId ${obj.instagram_id}`
  );
};

const processMessage = async (message: Record<string, any>) => {
  const tags: string[] = [];
  if (Object.keys(message.from).length > 1) {
    useTags.map((tag: Record<string, any>) => {
      tags.push(tag._id.toString());
    });
  } else if (Object.keys(message.from).length === 1) {
    useTags.find((tag: Record<string, any>) => {
      if (tag.name === "Contactado") {
        tags.push(tag._id.toString());
      }
    });
  }
  await Promise.all(
    [...new Set([...Object.keys(message.from), ...Object.keys(message.to)])].map(
      async (username: string) => {
        if (username === "sweetqtheband") return;
        const follower = await followersSvc.findOne({ username });
        if (follower) {
          updateInstagramUser(follower, message, tags, "follower");
          // Maybe we should check if the user is also a following and update it as well?
          const following = await followingsSvc.findOne({ username });
          if (following) {
            updateInstagramUser(following, message, tags, "following");
          }
        } else {
          const following = await followingsSvc.findOne({ username });
          if (following) {
            updateInstagramUser(following, message, tags, "following");
          }
          logProcess(`Follower ${username} not found`);
        }
      }
    )
  );
};

const end = async () => {
  process.exit(0);
};

(async () => {
  const data = { processed: 0, failed: 0, skipped: 0, consecutiveSkipped: 0 };
  await pipe(fetchMessages, end)(data);
})();
