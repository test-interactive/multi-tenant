import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Tenant, TenantSchema } from '../tenants/tenant.schema';

@Injectable()
export class TenantConnectionService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  //Return the corresponding tenant database connection
  private getTenantConnection(tenantId: string): Connection {
    const tenantDbName = `tenant_${tenantId}`;
    return this.connection.useDb(tenantDbName);
  }

  async getTenantModel({ name, schema }, tenantId: string) {
    const tenantConnection = this.getTenantConnection(tenantId);
    return tenantConnection.model(name, schema);
  }

  async getTenantByUserEmail(email: string) {
    const TenantModel = await this.getTenantModel(
      { name: Tenant.name, schema: TenantSchema },
      'default', // Assuming default connection for tenant lookup
    );
    console.log(email, TenantModel);
    return TenantModel.findOne({ email });
  }
}
