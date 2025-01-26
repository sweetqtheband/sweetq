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
import { countriesSvc } from './countries';

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
};

export const FactorySvc = (
  collectionName: string,
  collection: Collection<Document>
) => factory[collectionName](collection);
