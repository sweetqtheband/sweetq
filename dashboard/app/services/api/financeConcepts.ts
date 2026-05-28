import { FinanceConcepts } from '@/app/models/financeConcepts';
import { BaseSvc } from './_base';
import { Collection, Document } from 'mongodb';

/**
 * FinanceConcepts service
 */
export const FinanceConceptsSvc = (collection: Collection<Document>) => ({
  ...BaseSvc(collection, FinanceConcepts),
});
