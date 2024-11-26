import { Model } from '@/app/models/news';
import { BaseSvc } from './_base';
import { Collection, Document } from 'mongodb';

/**
 * News service
 */
export const newsSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
