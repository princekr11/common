import {BaseLocalRepository} from '../../repositories';
import {juggler} from '@loopback/repository';
import {TransactionsReporting, TransactionsReportingRelations} from '../../models';

export class TransactionsReportingRepository extends BaseLocalRepository<
  TransactionsReporting,
  typeof TransactionsReporting.prototype.id,
  TransactionsReportingRelations
> {
  constructor(dataSource: juggler.DataSource) {
    super(TransactionsReporting, dataSource);
  }
}
