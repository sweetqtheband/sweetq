import { Model } from '@/app/models/tracks';
import { BaseSvc } from './_base';
import { Collection, Document } from 'mongodb';

/**
 * Tracks service
 */
export const tracksSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
