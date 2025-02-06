import { Model } from '@/app/models/followers';
import { BaseSvc } from './_base';
import { Collection, Document } from 'mongodb';
import { getCollection } from '@/app/services/api/_db';
import { FactorySvc } from './factory';

/**
 * Followers service
 */
export const followersSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, Model),
  parse: async (item: Record<string, any>) => {
    const countries = FactorySvc('countries', await getCollection('countries'));
    const states = FactorySvc('states', await getCollection('states'));
    const cities = FactorySvc('cities', await getCollection('cities'));
    const tags = FactorySvc('tags', await getCollection('tags'));

    const obj = {
      ...item,
    };

    obj.relations = {};

    if (obj.country) {
      obj.relations.country = (
        await countries.findOne({ id: String(obj.country) })
      ).name;
    }

    if (obj.state) {
      obj.relations.state = (
        await states.findOne({ id: String(obj.state) })
      ).name;
    }

    if (obj.city) {
      obj.relations.city = (
        await cities.findOne({ id: String(obj.city) })
      ).name;
    }

    if (obj.tags) {
      obj.relations.tags = await tags.getAllById(obj.tags);
    }

    return obj;
  },
});
