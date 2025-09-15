#!/usr/bin/env node

import "dotenv/config";
import { pipe } from "./shared/utils";

import { getCollection } from "@/app/services/api/_db";
import { createLogger } from "./shared/logger.js";
import { FactorySvc } from "@/app/services/api/factory.js";
import { geminiSvc } from "@/app/services/gemini";

const { logProcess } = createLogger("userCatalog.log");

const instagramSvc = FactorySvc("instagram", await getCollection("instagram"));
const followersSvc = FactorySvc("followers", await getCollection("followers"));
const countriesSvc = FactorySvc("countries", await getCollection("countries"));
const statesSvc = FactorySvc("states", await getCollection("states"));
const citiesSvc = FactorySvc("cities", await getCollection("cities"));

const tags: Record<string, any> = {
  superfan: "67a4947bb925d9c803e9daf1",
  fan: "6800dda7a672d654a37d9929",
};

const states: Record<string, any> = {
  Madrid: 3297,
};
const countries: Record<string, any> = {
  España: 205,
};
const cities: Record<string, any> = {
  Madrid: 38567,
};
const escapeRegex = (text: string) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escapa caracteres especiales
};

const fetchUsers = async (data: Record<string, any>) => {
  data.users = await followersSvc.model
    .find({
      $and: [
        {
          instagram_conversation_id: { $exists: true },
        },
        {
          catalogued: { $exists: false },
        },
        {
          // Responde tagId
          tags: "67a49440b925d9c803e9daf0",
        },
        {
          $or: [{ state: { $exists: false } }, { state: NaN }],
        },
      ],
    })
    .toArray();

  return data;
};

const updateUsers = async (data: Record<string, any>) => {
  try {
    const { users } = data;

    for (const user of users) {
      const messages = (
        await instagramSvc.getMessages(instagramSvc, user.instagram_conversation_id)
      )
        .filter(
          (msg: Record<string, any>) =>
            msg.from.username === user.username && msg.message.length > 0
        )
        .map((msg: Record<string, any>) => msg.message)
        .reverse();

      const updateObj: Record<string, any> = {
        catalogued: 1,
      };

      if (messages.length > 0) {
        const updatedData = await geminiSvc.getUserInfo(JSON.stringify(messages));

        if (updatedData.country) {
          if (!countries[updatedData.country]) {
            const country = await countriesSvc.findOne({
              "name.es": new RegExp(escapeRegex(updatedData.country), "i"),
            });

            if (country) {
              countries[updatedData.country] = +country.id;
            } else {
              countries[updatedData.country] = null;
              logProcess(
                `User ${user.username} must have country ${updatedData.country} and is not found in database`
              );
            }
          }

          updateObj.country = countries[updatedData.country];
        }

        if (updatedData.state) {
          if (!states[updatedData.state]) {
            const state = await statesSvc.findOne({
              "name.es": {
                $in: [
                  new RegExp(escapeRegex(updatedData.state), "i"),
                  ...updatedData.state
                    .split(" ")
                    .filter((splittedState: string) => splittedState.length > 2)
                    .map((splittedState: string) => new RegExp(escapeRegex(splittedState), "i")),
                ],
              },
            });

            if (state) {
              states[updatedData.state] = +state.id;
            } else {
              states[updatedData.state] = null;
              logProcess(
                `User ${user.username} must have state ${updatedData.state} and is not found in database`
              );
            }
          }
          updateObj.state = states[updatedData.state];
        }

        if (updatedData.city) {
          if (!cities[updatedData.city]) {
            const city = await citiesSvc.findOne({
              "name.es": {
                $in: [
                  new RegExp(escapeRegex(updatedData.city), "i"),
                  ...updatedData.city
                    .split(" ")
                    .filter((splittedCity: string) => splittedCity.length > 2)
                    .map((splittedCity: string) => new RegExp(escapeRegex(splittedCity), "i")),
                ],
              },
              state_id: String(states[updatedData.state]),
            });

            if (city) {
              updateObj.city = +city.id;
            } else {
              updateObj.city = null;
              logProcess(
                `User ${user.username} must have city ${updatedData.city} and is not found in database`
              );
            }
          }

          updateObj.city = cities[updatedData.city];
        }

        if (!user.tags || user.tags instanceof Array === false) {
          user.tags = [];
        }
        if (updatedData.typeUser) {
          if (!user.tags.includes(tags[updatedData.typeUser])) {
            user.tags.push(tags[updatedData.typeUser]);
            updateObj.tags = user.tags;
          }
        }

        logProcess(
          `User ${user.username}: IA return ${JSON.stringify(
            updatedData
          )} and we update ${JSON.stringify(updateObj)}`
        );
      }

      if (Object.keys(updateObj).length > 0) {
        await followersSvc.model.updateOne({ _id: user._id }, { $set: { ...updateObj } });
      }

      await new Promise((resolve) => setTimeout(resolve, 4000));
    }

    return data;
  } catch {
    return data;
  }
};

const end = async () => {
  process.exit(0);
};

(async () => {
  const data = {};
  await pipe(fetchUsers, updateUsers, end)(data);
})();
