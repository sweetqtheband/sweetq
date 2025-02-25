import { Model } from '@/app/models/users';
import { BaseSvc } from './_base';
import { Collection, Document } from 'mongodb';

/**
 * Users service
 */
export const usersSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
