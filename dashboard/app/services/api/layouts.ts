import { Model } from '@/app/models/layouts';
import { BaseSvc } from './_base';
import { Collection, Document } from 'mongodb';

/**
 * Layouts service
 */
export const layoutsSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
});
