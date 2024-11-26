import { Model } from '@/app/models/gigs';
import { BaseSvc } from './_base';
import { Collection, Document } from 'mongodb';

/**
 * Gigs service
 */
export const gigsSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
