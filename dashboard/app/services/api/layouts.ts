import { Model } from '@/app/models/layouts';
import { BaseSvc } from './_base';
import { Collection, Document } from 'mongodb';

/**
 * Layouts service
 */
export const layoutsSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
  parse: async (item: Record<string, any>) => {
    const obj = {
      ...item,
    };
    return obj;
  },
});
