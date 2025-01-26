import { Model } from '@/app/models/states';
import { BaseSvc } from './_base';
import { Collection, Document } from 'mongodb';

/**
 * States service
 */
export const statesSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
