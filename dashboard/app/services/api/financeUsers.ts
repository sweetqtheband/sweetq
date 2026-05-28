import { FinanceUsers } from '@/app/models/financeUsers';
import { BaseSvc } from './_base';
import { Collection, Document } from 'mongodb';

/**
 * FinanceUsers service
 */
export const FinanceUsersSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, FinanceUsers),
});
