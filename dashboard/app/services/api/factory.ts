import { Collection, Document } from 'mongodb';
import { tracksSvc } from './tracks';
import { gigsSvc } from './gigs';
import { bandsSvc } from './bands';
import { newsSvc } from './news';
import { followersSvc } from './followers';
import { citiesSvc } from './cities';
import { statesSvc } from './states';
import { tagsSvc } from './tags';
import { instagramSvc } from './instagram';
import { usersSvc } from './users';
import { userProfilesSvc } from './userProfiles';
import { countriesSvc } from './countries';
import { camelCase } from '@/app/utils';

type FactoryType = {
  [key: string]: (collection: Collection<Document>) => any;
};

let factory: FactoryType = {
  tracks: tracksSvc,
  gigs: gigsSvc,
  bands: bandsSvc,
  news: newsSvc,
  followers: followersSvc,
  countries: countriesSvc,
  states: statesSvc,
  cities: citiesSvc,
  tags: tagsSvc,
  instagram: instagramSvc,
  users: usersSvc,
  userProfiles: userProfilesSvc,
};

export const FactorySvc = (
  collectionName: string,
  collection: Collection<Document>
) => factory[camelCase(collectionName)](collection);
