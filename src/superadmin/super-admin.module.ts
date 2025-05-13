import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantsModule } from 'src/tenants/tenants.module';
import { UsersModule } from 'src/users/users.module';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminService } from './super-admin.service';
import { Tenant, TenantSchema } from 'src/tenants/tenant.schema';
import { User, UserSchema } from 'src/users/user.schema';

@Module({
  imports: [
    TenantsModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SuperAdminController],
  providers: [SuperAdminService],
})
export class SuperAdminModule {}
