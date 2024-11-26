import { Collection, Document } from 'mongodb';
import { tracksSvc } from './tracks';
import { gigsSvc } from './gigs';
import { bandsSvc } from './bands';
import { newsSvc } from './news';

type FactoryType = {
  [key: string]: (collection: Collection<Document>) => any;
};

let factory: FactoryType = {
  tracks: tracksSvc,
  gigs: gigsSvc,
  bands: bandsSvc,
  news: newsSvc,
};

export const FactorySvc = (
  collectionName: string,
  collection: Collection<Document>
) => factory[collectionName](collection);
