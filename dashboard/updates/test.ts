#!/usr/bin/env node

import "dotenv/config";
import { pipe } from "./shared/utils";

import { getCollection } from "@/app/services/api/_db";
import { createLogger } from "./shared/logger.js";
import { FactorySvc } from "@/app/services/api/factory.js";

const { logProcess } = createLogger("test.log");

const instagramSvc = FactorySvc("instagram", await getCollection("instagram"));
const tagsSvc = FactorySvc("tags", await getCollection("tags"));
const followersSvc = FactorySvc("followers", await getCollection("followers"));

const useTags = await tagsSvc.model.find({ name: { $in: ["Contactado", "Responde"] } }).toArray();

const getConversationMessageParticipants = async (
  conversation: Record<string, any>,
  retrying: boolean = false
): Promise<Record<string, any>> => {
  try {
    const messages = await instagramSvc.getCachedMessages(instagramSvc, conversation.id);

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

        if (!acc.messages) {
          acc.messages = [];
        }

        if (message.from.username !== "sweetqtheband" && message.message.trim() !== "") {
          acc.messages.push(message.message);
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
  const conversations = await instagramSvc.getCachedConversations(instagramSvc);

  logProcess(`Fetched ${conversations.length} conversations`);
  for (const conversation of conversations) {
    try {
      const conversationMessage = await getConversationMessageParticipants(conversation);

      data.processed += 1;

      if (!conversationMessage?.cached) {
        if (conversationMessage.from.length === 0 && conversationMessage.to.length === 0) {
          data.failed += 1;
          if (data.failed === 2) {
            logProcess("Last 2 conversations failed, stopping the process");
            return data;
          }
        }
        await processMessage(conversationMessage);
      } else {
        data.skipped += 1;
        logProcess(`Conversation ${conversation.id} skipped, messages were cached`);
      }
    } catch (error) {
      data.failed += 1;
    }
  }

  return data;
};

const processMessage = async (message: Record<string, any>) => {
  if (message.messages && message.messages.length > 0) {
    const text = message.messages.join("\n").toLowerCase();

    let from = Object.keys(message.from)[0];
    if (from === "sweetqtheband") {
      from = Object.keys(message.to)[0];
    }

    logProcess(`[${from}]: \n${text}`);
  }
};

const end = async () => {
  process.exit(0);
};

(async () => {
  const data = { processed: 0, failed: 0, skipped: 0 };
  await pipe(fetchMessages, end)(data);
})();
