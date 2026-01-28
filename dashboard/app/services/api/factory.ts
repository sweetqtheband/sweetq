import { Collection, Document } from "mongodb";
import { tracksSvc } from "./tracks";
import { gigsSvc } from "./gigs";
import { bandsSvc } from "./bands";
import { cacheSvc } from "./cache";
import { newsSvc } from "./news";
import { followersSvc } from "./followers";
import { followingsSvc } from "./followings";
import { citiesSvc } from "./cities";
import { statesSvc } from "./states";
import { tagsSvc } from "./tags";
import { instagramSvc } from "./instagram";
import { usersSvc } from "./users";
import { userProfilesSvc } from "./userProfiles";
import { countriesSvc } from "./countries";
import { layoutsSvc } from "./layouts";
import { messagesSvc } from "./messages";
import { configSvc } from "./config";
import { routesSvc } from "./routes";
import { camelCase } from "@/app/utils";
import { filtersSvc } from "./filters";
type FactoryType = {
  [key: string]: (collection: Collection<Document>) => any;
};

let factory: FactoryType = {
  bands: bandsSvc,
  cache: cacheSvc,
  cities: citiesSvc,
  config: configSvc,
  countries: countriesSvc,
  filters: filtersSvc,
  followers: followersSvc,
  followings: followingsSvc,
  gigs: gigsSvc,
  instagram: instagramSvc,
  layouts: layoutsSvc,
  messages: messagesSvc,
  news: newsSvc,
  routes: routesSvc,
  states: statesSvc,
  tags: tagsSvc,
  tracks: tracksSvc,
  userProfiles: userProfilesSvc,
  users: usersSvc,
};

export const FactorySvc = (collectionName: string, collection: Collection<Document>) =>
  factory[camelCase(collectionName)](collection);
