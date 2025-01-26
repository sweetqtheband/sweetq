import { Model } from '@/app/models/countries';
import { BaseSvc } from './_base';
import { Collection, Document } from 'mongodb';

/**
 * Countries service
 */
export const countriesSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
