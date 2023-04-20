import {belongsTo, model,property} from '@loopback/repository';
import {BaseSQLModel, AccountAppFileMapping} from '..';
import {ServiceProviderAccount} from '../transaction/service-provider-account.model'


@model({
  settings: {
    strict: false,
    postgresql: {tableName: 'rta_audit_trail'},
    plural: 'RtaAuditTrails',
    foreignKeys: {
      fkidx_app_user_family_fk_id_family: {
        name: 'fkidx_audit_rail_service_provider_id',
        foreignKey: 'fk_id_serviceprovideraccountid',
        entityKey: 'id',
        entity: 'ServiceProviderAccount'
      },
      fkidx_user_file_fk_id_file_profile_picture: {
        name: 'fkidx_audit_rail_accountappfilemappingid',
        foreignKey: 'fk_id_accountappfilemappingid',
        entityKey: 'id',
        entity: 'AccountAppFileMapping'
      }
    },
    hiddenProperties: []
  }
})
export class AuditTrail extends BaseSQLModel {


  @property({
    type: 'string',
    postgresql: {columnName: 'old_registered_email', dataType: 'VARCHAR', dataLength: 255, nullable: 'Y'}
  })
  oldRegisteredEmail?: string;

  @property({
    type: 'string',
    postgresql: {columnName: 'new_registered_email',dataType: 'VARCHAR', dataLength: 255, nullable: 'Y'}
  })
  newRegisteredEmail?: string;

  @property({
    type: 'number',
    postgresql: {columnName: 'old_registered_mobile', dataType: 'NUMERIC', nullable: 'Y'}
  })
  oldRegisteredMobileNo?: number;

  @property({
    type: 'number',
    postgresql: {columnName: 'new_registered_mobile', dataType: 'NUMERIC', nullable: 'Y'}
  })
  newRegisteredMobileNo?: number;

  @property({
    type: 'string',
    postgresql: {columnName: 'remark', dataType: 'VARCHAR', dataLength: 255, nullable: 'Y'}
  })
  remark?: string;

  @belongsTo(
    () => ServiceProviderAccount,
    {
      name: 'serviceProviderAccount',
      keyFrom: 'serviceProviderAccountId',
      keyTo: 'id'
    },
    {
      postgresql: {columnName: 'fk_id_serviceprovideraccountid', dataType: 'INT', nullable: 'Y'}
    }
  )
  serviceProviderAccountId?: number;

  @belongsTo(
    () => AccountAppFileMapping,
    {
      name: 'accountAppFileMapping',
      keyFrom: 'accountAppFileMappingId',
      keyTo: 'id'
    },
    {
      postgresql: {columnName: 'fk_id_accountappfilemappingid', dataType: 'INT', nullable: 'Y'}
    }
  )
  accountAppFileMappingId?: number;


  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<AuditTrail>) {
    super(data);
  }
}

export interface AuditTrailRelations {
  // describe navigational properties here
}

export type AuditTrailWithRelations = AuditTrail & AuditTrailRelations;
